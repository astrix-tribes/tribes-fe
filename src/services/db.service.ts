import { PrismaClient, Post as DBPost, PostInteraction, IndexerState, BlockEvent, Prisma } from '@prisma/client';
import { Post, PostType } from '../types/post';
import { User } from '../types/user';
import { Tribe } from '../types/tribe';
import { JsonValue } from '@prisma/client/runtime/library';

// Check if running in browser or server
const isBrowser = typeof window !== 'undefined';

// Helper types for mocking in browser
type MockDBPost = any;
type MockPostInteraction = any;

interface CreatePostInput {
  id: string;
  authorId: string;
  content: string;
  type: string;
  tribeId: string;
  metadata?: Prisma.InputJsonValue;
  blockchainId?: number;
  blockchainTxHash?: string;
  isConfirmed?: boolean;
}

export class DBService {
  private prisma: PrismaClient | null = null;
  private static instance: DBService;
  private isServer: boolean;

  private constructor() {
    this.isServer = !isBrowser;
    if (!this.isServer) {
      // In browser, don't initialize Prisma
      console.log('Running in browser environment - database operations will be mocked');
    } else {
      // Only initialize Prisma on the server
      try {
        this.prisma = new PrismaClient();
      } catch (err) {
        console.error('Failed to initialize PrismaClient:', err);
      }
    }
  }

  public static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  // Make sure we're not using Prisma in the browser
  private ensurePrisma(): PrismaClient {
    if (!this.prisma) {
      if (this.isServer) {
        throw new Error('PrismaClient not initialized');
      } else {
        throw new Error('Database operations not available in browser');
      }
    }
    return this.prisma;
  }

  async createPost(post: CreatePostInput): Promise<DBPost | MockDBPost> {
    if (!this.isServer) {
      return { ...post };
    }
    
    return this.ensurePrisma().post.create({
      data: {
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        type: post.type,
        tribeId: post.tribeId,
        metadata: post.metadata || {},
        blockchainId: post.blockchainId,
        blockchainTxHash: post.blockchainTxHash,
        isConfirmed: post.isConfirmed || false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
  }

  async getPost(id: string): Promise<DBPost | MockDBPost | null> {
    if (!this.isServer) {
      return null;
    }
    
    return this.ensurePrisma().post.findUnique({
      where: { id }
    });
  }

  async getPostByBlockchainId(blockchainId: number): Promise<DBPost | MockDBPost | null> {
    if (!this.isServer) {
      // In browser, return null to fall back to blockchain
      return null;
    }
    
    return this.ensurePrisma().post.findUnique({
      where: { blockchainId },
    });
  }

  async getPostsByTribe(tribeId: string, limit = 20, offset = 0): Promise<DBPost[] | MockDBPost[]> {
    if (!this.isServer) {
      return [];
    }
    
    return this.ensurePrisma().post.findMany({
      where: { 
        tribeId,
        updatedAt: { not: undefined }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUserFeed(userId: string, limit = 20, offset = 0): Promise<DBPost[] | MockDBPost[]> {
    if (!this.isServer) {
      return [];
    }
    
    return this.ensurePrisma().post.findMany({
      where: {
        authorId: userId,
        updatedAt: { not: undefined }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async confirmPost(blockchainId: number, txHash: string): Promise<DBPost | MockDBPost> {
    if (!this.isServer) {
      // Mock response in browser
      return { blockchainId, blockchainTxHash: txHash, isConfirmed: true };
    }
    
    return this.ensurePrisma().post.update({
      where: { blockchainId },
      data: {
        blockchainTxHash: txHash,
        isConfirmed: true,
        confirmedAt: new Date(),
      },
    });
  }

  async deletePost(id: string): Promise<DBPost | MockDBPost> {
    if (!this.isServer) {
      return { id };
    }
    
    return this.ensurePrisma().post.update({
      where: { id },
      data: { updatedAt: null },
    });
  }

  async createInteraction(postId: string, userId: string, type: string): Promise<PostInteraction | MockPostInteraction> {
    if (!this.isServer) {
      // Mock response in browser
      return { id: Date.now().toString(), postId, userId, type };
    }
    
    return this.ensurePrisma().postInteraction.create({
      data: {
        postId,
        userId,
        type,
      },
    });
  }

  async getInteractions(postId: string): Promise<PostInteraction[] | MockPostInteraction[]> {
    if (!this.isServer) {
      // In browser, return empty array
      return [];
    }
    
    return this.ensurePrisma().postInteraction.findMany({
      where: { postId },
    });
  }

  async disconnect(): Promise<void> {
    if (this.isServer && this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  // Tribe-related methods
  async getTribe(id: string): Promise<Tribe | null> {
    try {
      if (this.isServer) {
        return null;
      }
      
      const tribeData = localStorage.getItem(`tribe:${id}`);
      return tribeData ? JSON.parse(tribeData) : null;
    } catch (error) {
      console.error('Error getting tribe:', error);
      return null;
    }
  }

  async getAllTribes(limit: number = 100, offset: number = 0): Promise<Tribe[]> {
    try {
      if (this.isServer) {
        return [];
      }
      
      // In a real app, this would query all tribes from a database
      // For now, we'll scan localStorage for tribe keys
      const tribes: Tribe[] = [];
      const tribeIdsKey = 'tribe_ids';
      const tribeIds = localStorage.getItem(tribeIdsKey);
      
      if (tribeIds) {
        const parsedIds = JSON.parse(tribeIds) as string[];
        const slicedIds = parsedIds.slice(offset, offset + limit);
        
        for (const id of slicedIds) {
          const tribe = await this.getTribe(id);
          if (tribe) {
            tribes.push(tribe);
          }
        }
      }
      
      return tribes;
    } catch (error) {
      console.error('Error getting all tribes:', error);
      return [];
    }
  }

  async createOrUpdateTribe(tribe: Tribe): Promise<boolean> {
    try {
      if (this.isServer) {
        return false;
      }
      
      // Store the tribe
      localStorage.setItem(`tribe:${tribe.id}`, JSON.stringify(tribe));
      
      // Update tribe IDs list
      const tribeIdsKey = 'tribe_ids';
      const tribeIds = localStorage.getItem(tribeIdsKey);
      let parsedIds: string[] = tribeIds ? JSON.parse(tribeIds) : [];
      
      if (!parsedIds.includes(tribe.id)) {
        parsedIds.push(tribe.id);
        localStorage.setItem(tribeIdsKey, JSON.stringify(parsedIds));
      }
      
      return true;
    } catch (error) {
      console.error('Error creating/updating tribe:', error);
      return false;
    }
  }

  // User-related methods
  async getUserByAddress(address: string): Promise<User | null> {
    try {
      if (this.isServer) {
        return null;
      }
      
      const userData = localStorage.getItem(`user:${address}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user by address:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      if (this.isServer) {
        return null;
      }
      
      // In a real app, this would query by username from a database
      // For now, we'll scan the username mapping
      const usernameMapKey = 'username_map';
      const usernameMap = localStorage.getItem(usernameMapKey);
      
      if (usernameMap) {
        const parsedMap = JSON.parse(usernameMap) as Record<string, string>;
        const address = Object.entries(parsedMap).find(([_, u]) => u === username)?.[0];
        
        if (address) {
          return this.getUserByAddress(address);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async createOrUpdateUser(user: User): Promise<boolean> {
    try {
      if (this.isServer) {
        return false;
      }
      
      // Store the user
      localStorage.setItem(`user:${user.address}`, JSON.stringify(user));
      
      // Update username mapping if username exists
      if (user.username) {
        const usernameMapKey = 'username_map';
        const usernameMap = localStorage.getItem(usernameMapKey);
        const parsedMap = usernameMap ? JSON.parse(usernameMap) as Record<string, string> : {};
        
        parsedMap[user.address] = user.username;
        localStorage.setItem(usernameMapKey, JSON.stringify(parsedMap));
      }
      
      return true;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (this.isServer) {
        return [];
      }
      
      // In a real app, this would query all users from a database
      // For now, we'll scan localStorage for user keys
      const users: User[] = [];
      const userAddresses: string[] = [];
      
      // This is inefficient but works for demo purposes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('user:')) {
          const address = key.substring(5);
          userAddresses.push(address);
        }
      }
      
      for (const address of userAddresses) {
        const user = await this.getUserByAddress(address);
        if (user) {
          users.push(user);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    return this.getMockData('user_posts', userId) || [];
  }

  private getMockData(type: string, id: string): any {
    if (this.isServer) return null;
    try {
      const key = `${type}:${id}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      if (parsed.expires && parsed.expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.error('Error reading mock data:', error);
      return null;
    }
  }

  private setMockData(type: string, id: string, data: any): void {
    if (this.isServer) return;
    try {
      const key = `${type}:${id}`;
      const value = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing mock data:', error);
    }
  }

  // Indexer-related methods
  public async getLastIndexedBlock(chainId: number): Promise<number> {
    if (!this.isServer) {
      return 0;
    }
    
    const key = `lastIndexedBlock:${chainId}`;
    const stored = localStorage.getItem(key);
    return stored ? Number(stored) : 0;
  }

  public async updateLastIndexedBlock(blockNumber: number, chainId: number): Promise<void> {
    if (!this.isServer) {
      const key = `lastIndexedBlock:${chainId}`;
      localStorage.setItem(key, blockNumber.toString());
      return;
    }
  }

  public async createBlockEvent(event: {
    blockNumber: number;
    transactionHash: string;
    eventName: string;
    eventData: Prisma.InputJsonValue;
  }): Promise<BlockEvent> {
    return this.ensurePrisma().blockEvent.create({
      data: {
        blockNumber: BigInt(event.blockNumber),
        transactionHash: event.transactionHash,
        eventName: event.eventName,
        eventData: event.eventData,
        processed: false,
        error: null
      }
    });
  }

  public async markEventProcessed(eventId: number, error?: string): Promise<void> {
    await this.ensurePrisma().blockEvent.update({
      where: { id: eventId },
      data: {
        processed: true,
        error,
        updatedAt: new Date()
      }
    });
  }

  public async getUnprocessedEvents(limit: number = 100): Promise<BlockEvent[]> {
    return this.ensurePrisma().blockEvent.findMany({
      where: { processed: false },
      orderBy: { blockNumber: 'asc' },
      take: limit
    });
  }

  public async createOrUpdatePost(post: CreatePostInput): Promise<DBPost> {
    if (!this.isServer) {
      throw new Error('Cannot create/update post in browser environment');
    }

    return this.ensurePrisma().post.upsert({
      where: { id: post.id },
      create: {
        ...post,
        metadata: post.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        ...post,
        metadata: post.metadata || {},
        updatedAt: new Date()
      }
    });
  }

  public async getUnindexedPosts(limit: number = 100): Promise<DBPost[]> {
    if (!this.isServer) {
      return [];
    }
    
    return this.ensurePrisma().post.findMany({
      where: {
        updatedAt: { equals: undefined }
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    });
  }

  public async getPostsByBlockRange(startBlock: number, endBlock: number): Promise<DBPost[]> {
    if (!this.isServer) {
      return [];
    }
    
    return this.ensurePrisma().post.findMany({
      where: {
        createdAt: {
          gte: new Date(startBlock * 1000),
          lte: new Date(endBlock * 1000)
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  public async updateIndexerState(chainId: number, data: Partial<{
    lastIndexedBlock: bigint;
    lastSyncTime: Date;
  }>): Promise<void> {
    await this.ensurePrisma().indexerState.upsert({
      where: { chainId },
      create: {
        chainId,
        lastIndexedBlock: data.lastIndexedBlock || BigInt(0),
        lastSyncTime: data.lastSyncTime || new Date()
      },
      update: {
        ...data
      }
    });
  }

  public async getIndexerState(chainId: number): Promise<IndexerState | null> {
    return this.ensurePrisma().indexerState.findFirst({
      where: { chainId }
    });
  }
} 