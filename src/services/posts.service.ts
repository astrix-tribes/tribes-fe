import { getPublicClient, blockchain } from '../utils/blockchainUtils';
import { getContracts } from '../config/contracts';
import { QueueService as ExternalQueueService } from '../services/queue.service';
import { Post, PostMetadata, PostType } from '../types/post';
import { Post as DBPost, Prisma } from '@prisma/client';
import { DBService } from './db.service';
import { TribesHelper } from '../types/tribes';
import { IndexerService } from './indexer/IndexerService';
import { JsonValue } from '@prisma/client/runtime/library';
import { getIndexerService } from './index';

// Import the CreatePostInput type
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

declare global {
  interface Window {
    ethereum?: any;
    tribesHelper?: TribesHelper;
  }
}

// Add at the top with other imports and types
enum TaskType {
  CACHE_POST = 'CACHE_POST',
  REFRESH_POST = 'REFRESH_POST',
  UPDATE_CACHE = 'UPDATE_CACHE',
  SYNC_TRIBE = 'SYNC_TRIBE'
}

// Add at the top with other interfaces
interface QueueService {
  addToQueue(type: TaskType, data: any, options?: { priority?: number }): Promise<void>;
  processQueue(): Promise<void>;
}

/**
 * Simple LRU Cache implementation that automatically removes least recently used items
 * when the cache reaches maximum size
 */
class LRUCache<T> {
  private cache: Map<string, T>;
  private maxSize: number;
  private keyTimestamps: Map<string, number>;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.keyTimestamps = new Map();
  }

  get(key: string): T | undefined {
    // Record this access
    if (this.cache.has(key)) {
      this.keyTimestamps.set(key, Date.now());
      return this.cache.get(key);
    }
    return undefined;
  }

  set(key: string, value: T): void {
    // Remove least recently used item if we're at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.keyTimestamps.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
    this.keyTimestamps.set(key, Date.now());
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    this.keyTimestamps.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.keyTimestamps.clear();
  }

  getOldestKey(): string | undefined {
    if (this.keyTimestamps.size === 0) return undefined;
    
    // Find the key with the oldest timestamp
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    this.keyTimestamps.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  get size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  values(): IterableIterator<T> {
    return this.cache.values();
  }

  entries(): IterableIterator<[string, T]> {
    return this.cache.entries();
  }
}

// In-memory cache for development, replace with Redis in production
const postsCache = new Map<string, Post>();
const postsByTribeCache = new Map<string, Post[]>();
const postsByUserCache = new Map<string, Post[]>();

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// For browser environment where Prisma isn't available
type MockDBPost = any;

// Interface for blockchain post data
interface BlockchainPost {
  id: bigint;
  creator: string;
  content: string;
  type: string;
  timestamp: number;
  likes: number;
  comments: number;
  shares: number;
  tribeId: bigint;
  title: string;
  description: string;
  tags: string[];
  mediaContent: { type: 'image' | 'video'; url: string }[];
  views: number;
  engagement: number;
}

// Define our extended Post interface to match what is used in the application
interface UIPost extends Post {
  // Additional fields used in UI
  authorName?: string;
  tribeName?: string;
  likes?: number;
  comments?: number;
}

// Cache entry with timestamp for expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface DBPostInput {
  id: number;
  metadata: JsonValue;
  tribeId: string;
  type: string;
  content: string;
  authorId: string;
  blockNumber?: bigint;
  transactionHash?: string;
}

// Add these new interfaces near the top after the imports
interface CacheMetrics {
  hits: number;
  misses: number;
  source: {
    memory: number;
    localStorage: number;
    indexedDB: number;
    database: number;
    blockchain: number;
  };
}

interface CacheStats {
  lastAccess: number;
  accessCount: number;
  dataSource: 'memory' | 'localStorage' | 'indexedDB' | 'database' | 'blockchain';
}

interface QueueTask {
  type: TaskType;
  data: any;
  priority?: number;
}

export class PostsService {
  private static instance: PostsService;
  private postsCache: LRUCache<CacheEntry<Post>>;
  private tribePostsCache: Map<string, CacheEntry<string[]>>;
  private userPostsCache: Map<string, CacheEntry<string[]>>;
  private dbService: DBService | null = null;
  private indexerService: IndexerService | null = null;
  private queueService: QueueService | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly LOCAL_STORAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHED_POSTS = 250;
  private readonly MAX_POSTS_PER_TRIBE = 100;
  private isServer: boolean;
  private contract: any;
  private isSyncing: boolean = false;
  private syncProgress: number = 0;
  private syncTotal: number = 0;
  private syncCallbacks: Set<() => void> = new Set();
  private lastSyncTime: number = 0;
  private syncErrorCount: number = 0;
  private lastError: Error | null = null;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    source: {
      memory: 0,
      localStorage: 0,
      indexedDB: 0,
      database: 0,
      blockchain: 0
    }
  };
  private cacheStats: Map<string, CacheStats> = new Map();

  // Add static getInstance method
  public static getInstance(): PostsService {
    if (!PostsService.instance) {
      PostsService.instance = new PostsService();
    }
    return PostsService.instance;
  }

  private constructor() {
    this.postsCache = new LRUCache<CacheEntry<Post>>(this.MAX_CACHED_POSTS);
    this.tribePostsCache = new Map();
    this.userPostsCache = new Map();
    this.isServer = typeof window === 'undefined';
    
    if (this.isServer) {
      this.dbService = DBService.getInstance();
      this.indexerService = getIndexerService();
      this.setupEventListeners();
    } else {
      // Initialize client-side cache
      this.initializeCache();
    }
  }

  private setupEventListeners() {
    // Use the new onCacheUpdate method instead of onEvent
    this.indexerService?.onCacheUpdate((type, data) => {
      if (type === 'posts') {
        // Handle post updates
        const { postId, post } = data;
        this.invalidateCache(postId);
      }
    });
  }

  // New method to initialize cache
  private async initializeCache(): Promise<void> {
    console.info('[Cache] Initializing frontend cache...');
    
    try {
      // First try to load from IndexedDB
      await this.loadFromIndexedDB();
      
      // Then try localStorage as fallback
      await this.loadFromLocalStorage();
      
      // Finally, fetch initial data from API
      await this.fetchInitialData();
      
      console.info('[Cache] Cache initialization complete');
      } catch (error) {
      console.error('[Cache] Error initializing cache:', error);
    }
  }

  private async loadFromIndexedDB(): Promise<void> {
    if (!window.indexedDB) return;

    try {
      const request = indexedDB.open('tribes_posts_cache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['posts', 'tribes'], 'readonly');
        const postsStore = transaction.objectStore('posts');
        const tribesStore = transaction.objectStore('tribes');

        // Load posts
        postsStore.getAll().onsuccess = (event: any) => {
          const posts = event.target.result;
          posts.forEach((post: Post & { _timestamp: number }) => {
            if (Date.now() - post._timestamp < this.LOCAL_STORAGE_TTL) {
              const { _timestamp, ...cleanPost } = post;
              this.setCache(post.id, cleanPost);
            }
          });
        };

        // Load tribes data
        tribesStore.getAll().onsuccess = (event: any) => {
          const tribes = event.target.result;
          tribes.forEach((tribe: { id: string; postIds: string[]; timestamp: number }) => {
            if (Date.now() - tribe.timestamp < this.LOCAL_STORAGE_TTL) {
              this.tribePostsCache.set(`tribe:${tribe.id}`, {
                data: tribe.postIds,
                timestamp: tribe.timestamp
              });
            }
          });
        };
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tribes')) {
          db.createObjectStore('tribes', { keyPath: 'id' });
        }
      };
    } catch (error) {
      console.warn('[Cache] IndexedDB load failed:', error);
    }
  }

  private async fetchInitialData(): Promise<void> {
    try {
      // Since API endpoint doesn't exist yet, fetch directly from blockchain
      const contract = await this.getContract();
      if (!contract) {
        console.warn('[Cache] No contract available for initial data fetch');
        return;
      }

      // Get latest posts from blockchain
      const [postIds, total] = await contract.getPostsByTribe('0', BigInt(0), BigInt(20));
      if (!Array.isArray(postIds)) {
        console.warn('[Cache] Invalid post IDs from blockchain');
        return;
      }

      // Fetch each post
      const posts = await Promise.all(
        postIds.map(async (postId) => {
          const post = await contract.getPost(Number(postId));
          return post ? this.mapBlockchainPostToUIPost(post) : null;
        })
      );

      // Filter out nulls and cache valid posts
      const validPosts = posts.filter((post): post is Post => post !== null);
      
      validPosts.forEach(post => {
        this.setCache(post.id, post);
      });

      console.info('[Cache] Initial data loaded from blockchain:', validPosts.length, 'posts');
    } catch (error) {
      console.error('[Cache] Error fetching initial data:', error);
    }
  }

  // Modified getFromCacheOrDB to prioritize cached data
  private async getFromCacheOrDB(id: string): Promise<Post | null> {
    const cacheKey = `posts:${id}`;
    
    // Check memory cache first
    const cachedEntry = this.postsCache.get(cacheKey);
    if (cachedEntry && !this.isCacheExpired(cachedEntry)) {
      this.logCacheAccess(cacheKey, true, 'memory');
      return cachedEntry.data;
    }

    if (!this.isServer) {
      // Try IndexedDB
      try {
        const idbPost = await this.getFromIndexedDB(id);
        if (idbPost) {
          this.logCacheAccess(cacheKey, true, 'indexedDB');
          return idbPost;
        }
      } catch (error) {
        console.warn('[Cache] IndexedDB access failed:', error);
      }

      // Try localStorage
      const localPost = this.getFromLocalStorage(id);
      if (localPost) {
        this.logCacheAccess(cacheKey, true, 'localStorage');
        return localPost;
      }

      // If on frontend and not in cache, fetch from API
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (response.ok) {
          const post = await response.json();
          this.setCache(id, post);
          return post;
        }
      } catch (error) {
        console.error('[API] Error fetching post:', error);
      }
      
      return null;
    }

    // Server-side: try database
    const dbPost = await this.dbService?.getPost(id);
    if (dbPost) {
      this.logCacheAccess(cacheKey, true, 'database');
      const mappedPost = await this.mapBlockchainPostToUIPost(dbPost);
      if (mappedPost) {
        this.setCache(id, mappedPost);
        return mappedPost;
      }
    }

    // Only verify with blockchain on server-side
      if (this.isServer) {
      this.logCacheAccess(cacheKey, false, 'blockchain');
      return this.fetchFromBlockchain(id);
    }

        return null;
      }

  // Modified getUserFeed to prioritize cached data
  public async getUserFeed(userAddress: string, limit = 50, offset = 0): Promise<Post[]> {
    if (!userAddress) return [];

    const cacheKey = `user_${userAddress}`;
    
    // Check cache first
    const cachedEntry = this.userPostsCache.get(cacheKey);
    if (cachedEntry && !this.isCacheExpired(cachedEntry)) {
      const postsPromises = cachedEntry.data
        .slice(offset, offset + limit)
        .map(id => this.getFromCacheOrDB(id));
      
      const resolvedPosts = await Promise.all(postsPromises);
      const validPosts = resolvedPosts.filter((post): post is Post => post !== null);
      if (validPosts.length > 0) {
        return validPosts;
      }
    }

    // Try blockchain if not in cache
    try {
      const contract = await this.getContract();
      if (!contract) {
        console.warn('[Blockchain] No contract available for user feed');
        return [];
      }

      // Get posts from blockchain
      const [postIds, total] = await contract.getPostsByUser(userAddress, BigInt(offset), BigInt(limit));
      if (!Array.isArray(postIds)) {
        console.warn('[Blockchain] Invalid post IDs from blockchain');
        return [];
      }

      // Fetch each post
      const posts = await Promise.all(
        postIds.map(async (postId) => {
          const post = await contract.getPost(Number(postId));
          return post ? this.mapBlockchainPostToUIPost(post) : null;
        })
      );

      // Filter out nulls and cache valid posts
      const validPosts = posts.filter((post): post is Post => post !== null);
      
      if (validPosts.length > 0) {
        // Cache the results
        this.cacheUserPosts(userAddress, validPosts);
        console.info('[Blockchain] Retrieved', validPosts.length, 'posts for user', userAddress);
        return validPosts;
      }
    } catch (error) {
      console.error('[Blockchain] Error fetching user feed:', error);
    }

    return [];
  }

  // Helper method to cache user posts
  private cacheUserPosts(userAddress: string, posts: Post[]): void {
    this.userPostsCache.set(`user_${userAddress}`, {
      data: posts.map(post => post.id),
      timestamp: Date.now()
    });
    
    // Cache individual posts
    posts.forEach(post => {
      this.setCache(post.id, post);
    });
  }

  // Modified getPostsByTribe to prioritize cached data
  public async getPostsByTribe(tribeId: string, limit = 20, offset = 0): Promise<Post[]> {
    const cacheKey = `tribe:${tribeId}`;
    
    // Check memory cache first
    const cachedEntry = this.tribePostsCache.get(cacheKey);
    if (cachedEntry && !this.isCacheExpired(cachedEntry)) {
      const postsPromises = cachedEntry.data
        .slice(offset, offset + limit)
        .map(id => this.getFromCacheOrDB(id));
      
      const resolvedPosts = await Promise.all(postsPromises);
      const validPosts = resolvedPosts.filter((post): post is Post => post !== null);
      if (validPosts.length > 0) {
        return validPosts;
      }
    }

    // Try blockchain if not in cache
    try {
      const contract = await this.getContract();
      if (!contract) {
        console.warn('[Blockchain] No contract available for tribe posts');
        return [];
      }

      // Get posts from blockchain
      const [postIds, total] = await contract.getTribePosts(tribeId, BigInt(offset), BigInt(limit));
      if (!Array.isArray(postIds)) {
        console.warn('[Blockchain] Invalid post IDs from blockchain');
        return [];
      }

      // Fetch each post
      const posts = await Promise.all(
        postIds.map(async (postId) => {
          const post = await contract.getPost(Number(postId));
          return post ? this.mapBlockchainPostToUIPost(post) : null;
        })
      );

      // Filter out nulls and cache valid posts
      const validPosts = posts.filter((post): post is Post => post !== null);
      
      if (validPosts.length > 0) {
        // Cache the results
        this.cacheTribePosts(tribeId, validPosts);
        console.info('[Blockchain] Retrieved', validPosts.length, 'posts for tribe', tribeId);
        return validPosts;
      }
                } catch (error) {
      console.error('[Blockchain] Error fetching tribe posts:', error);
    }

    return [];
  }

  // Add helper method for tribe posts caching
  private cacheTribePosts(tribeId: string, posts: Post[]): void {
    this.tribePostsCache.set(`tribe:${tribeId}`, {
      data: posts.map(post => post.id),
      timestamp: Date.now()
    });
    
    // Cache individual posts
    posts.forEach(post => {
      this.setCache(post.id, post);
    });
  }

  private async getFromIndexedDB(id: string): Promise<Post | null> {
    if (!window.indexedDB) return null;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('tribes_posts_cache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['posts'], 'readonly');
        const store = transaction.objectStore('posts');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const post = getRequest.result;
          if (post && Date.now() - post._timestamp < this.LOCAL_STORAGE_TTL) {
            delete post._timestamp;
            resolve(post);
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
      };
    });
  }

  private async saveToIndexedDB(id: string, post: Post): Promise<void> {
    if (!window.indexedDB) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('tribes_posts_cache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        const storagePost = { ...post, _timestamp: Date.now() };
        
        store.put(storagePost).onsuccess = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  public getCacheMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  public async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    
    // Clear memory cache
    for (const [key, entry] of this.postsCache.entries()) {
      if (this.isCacheExpired(entry)) {
        this.postsCache.delete(key);
      }
    }

    // Clear IndexedDB
    if (!this.isServer) {
      try {
        const request = indexedDB.open('tribes_posts_cache', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['posts'], 'readwrite');
          const store = transaction.objectStore('posts');
          const range = IDBKeyRange.upperBound(now - this.LOCAL_STORAGE_TTL);
          
          store.index('timestamp').openCursor(range).onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              store.delete(cursor.primaryKey);
              cursor.continue();
            }
          };
        };
    } catch (error) {
        console.warn('[Cache] Error clearing IndexedDB:', error);
      }
    }

    console.info('[Cache] Cleared expired entries');
  }

  // Update the setCache method
  private async setCache(key: string, post: Post): Promise<void> {
    const cacheKey = `posts:${key}`;
    
    this.postsCache.set(cacheKey, {
      data: post,
      timestamp: Date.now()
    });

    if (!this.isServer) {
      // Save to IndexedDB
      try {
        await this.saveToIndexedDB(post.id, post);
      } catch (error) {
        console.warn('[Cache] Failed to save to IndexedDB, falling back to localStorage:', error);
        this.saveToLocalStorage(post.id, post);
      }

      // Queue for background processing
      if (this.queueService) {
        await this.queueService.addToQueue(TaskType.CACHE_POST, { postId: post.id, post }, { priority: 3 });
      }
    }
  }

  private async fetchFromBlockchain(id: string): Promise<Post | null> {
    try {
      const contract = await this.getContract();
      if (!contract) {
        console.warn('No blockchain contract available');
        return null;
      }
      
      const blockchainPost = await contract.getPost(parseInt(id));
      if (blockchainPost) {
        const mappedPost = await this.mapBlockchainPostToUIPost(blockchainPost);
        if (mappedPost) {
          // Save to DB through indexer
          const dbPost: CreatePostInput = {
            id: mappedPost.id,
            authorId: mappedPost.author,
            content: mappedPost.content,
            type: mappedPost.type.toString(),
            tribeId: mappedPost.tribeId.toString(),
            metadata: mappedPost.metadata ? JSON.stringify(mappedPost.metadata) : {},
            blockchainId: parseInt(mappedPost.id),
            isConfirmed: true
          };
          
          await this.dbService?.createOrUpdatePost(dbPost);
          
          this.setCache(id, mappedPost);
          
          if (!this.isServer) {
            this.saveToLocalStorage(id, mappedPost);
          }
          
          return mappedPost;
        }
      }
    } catch (error) {
      console.error('Error fetching post from blockchain:', error);
    }
    return null;
  }

  private getFromLocalStorage(id: string): Post | null {
    try {
      const localStorageKey = `post_${id}`;
      const localPost = localStorage.getItem(localStorageKey);
      
      if (localPost) {
        const parsedPost = JSON.parse(localPost);
        const timestamp = parsedPost._timestamp || 0;
        
        if (Date.now() - timestamp < this.LOCAL_STORAGE_TTL) {
          delete parsedPost._timestamp;
          const post = parsedPost as Post;
          this.setCache(id, post);
          
          if (Date.now() - timestamp > this.CACHE_TTL / 2) {
            this.queuePostRefresh(id);
          }
          
          return post;
        }
      }
    } catch (error) {
      console.warn('Error reading post from localStorage:', error);
    }
    return null;
  }

  private saveToLocalStorage(id: string, post: Post): void {
    try {
      const storagePost = { ...post, _timestamp: Date.now() };
      localStorage.setItem(`post_${id}`, JSON.stringify(storagePost));
    } catch (error) {
      console.warn('Error saving post to localStorage:', error);
    }
  }

  // Update queuePostRefresh method
  private queuePostRefresh(postId: string): void {
    if (this.isServer) return;
    
    // Add to queue with low priority (3) so it doesn't block other operations
    if (this.queueService) {
      this.queueService.addToQueue(TaskType.REFRESH_POST, { postId }, { priority: 3 });
    }
  }

  async getPost(id: string): Promise<Post | null> {
    return this.getFromCacheOrDB(id);
  }

  // Sync status management
  public getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      progress: this.syncProgress,
      total: this.syncTotal,
      lastSyncTime: this.lastSyncTime,
      errorCount: this.syncErrorCount,
      lastError: this.lastError
    };
  }

  // Add sync status listeners
  public addSyncListener(callback: () => void) {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  public isSyncingPosts() {
    return this.isSyncing;
  }

  private notifySyncListeners() {
    this.syncCallbacks.forEach(callback => callback());
  }

  // Improved background sync mechanism 
  private async startBackgroundSync() {
    if (this.isServer) return;

    const syncPosts = async () => {
      if (this.isSyncing) return;
      
      try {
        this.isSyncing = true;
        this.syncProgress = 0;
        this.syncTotal = 0;
        this.lastError = null;
        this.notifySyncListeners();

        // Get tribe IDs to sync from cache
        const tribeIds = Array.from(this.tribePostsCache.keys());
        this.syncTotal = tribeIds.length;
        
        // If no tribes in cache, try to get them from localStorage
        if (tribeIds.length === 0) {
          try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
              if (key.startsWith('tribe_posts_')) {
                const tribeId = key.replace('tribe_posts_', '');
                if (!tribeIds.includes(`tribe:${tribeId}`)) {
                  tribeIds.push(`tribe:${tribeId}`);
                }
              }
            }
            this.syncTotal = tribeIds.length;
    } catch (error) {
            console.warn('Error reading localStorage for tribe IDs:', error);
          }
        }
        
        // Sync each tribe's posts
        for (let i = 0; i < tribeIds.length; i++) {
          const tribeKey = tribeIds[i];
          const tribeId = tribeKey.replace('tribe:', '');
          
          try {
            await this.syncTribePosts(tribeId);
            this.syncProgress = i + 1;
            this.notifySyncListeners();
          } catch (error) {
            console.error(`Error syncing posts for tribe ${tribeId}:`, error);
            this.syncErrorCount++;
            this.lastError = error instanceof Error ? error : new Error('Unknown sync error');
          }
        }
        
        this.lastSyncTime = Date.now();
        
        // Reset error count after successful sync
        if (this.syncErrorCount > 0 && this.syncProgress === this.syncTotal) {
          this.syncErrorCount = 0;
        }
      } catch (error) {
        console.error('Error in sync process:', error);
        this.syncErrorCount++;
        this.lastError = error instanceof Error ? error : new Error('Unknown sync error');
      } finally {
        this.isSyncing = false;
        this.notifySyncListeners();
      }
    };

    // Initial sync with delay to allow app to load
    setTimeout(async () => {
      await syncPosts();
    }, 5000);

    // Set up periodic sync every 30 seconds
    setInterval(syncPosts, 30000);
  }

  // Enhanced tribe posts sync
  private async syncTribePosts(tribeId: string) {
    try {
          const contract = await this.getContract();
          if (!contract) {
        console.warn('[Blockchain] No contract available for syncing tribe posts');
        return;
      }

      // Get posts from blockchain
      const [postIds, total] = await contract.getPostsByTribe(tribeId, BigInt(0), BigInt(this.MAX_POSTS_PER_TRIBE));
      
      if (Array.isArray(postIds)) {
        // Fetch all posts
        const rawPosts = await Promise.all(
          postIds.map(async postId => {
            const post = await contract.getPost(Number(postId));
            return post ? this.mapBlockchainPostToUIPost(post) : null;
          })
        );
        
        // Filter out null posts
        const validPosts = rawPosts.filter((post): post is Post => post !== null);
        
        if (validPosts.length > 0) {
          // Save posts individually (now type-safe since we filtered nulls)
          await Promise.all(
            validPosts.map(async (post) => {
              this.setCache(post.id, post);
              await this.dbService?.createPost({
                id: post.id,
                authorId: post.author,
                content: post.content,
                type: post.type.toString(),
                tribeId: post.tribeId.toString(),
                metadata: post.metadata ? JSON.stringify(post.metadata) : {},
                blockchainId: parseInt(post.id),
                isConfirmed: true
              });
            })
          );
          
          // Save the list of post IDs (now type-safe since we're using validPosts)
          const validPostIds = validPosts.map((post) => post.id);
          const cacheKey = `tribe_${tribeId}`;
          this.tribePostsCache.set(cacheKey, {
            data: validPostIds,
            timestamp: Date.now()
          });
          
          // Save to localStorage if client-side
          if (!this.isServer) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                data: validPostIds,
                timestamp: Date.now()
              }));
            } catch (error) {
              console.warn('[Cache] Error saving tribe posts to localStorage:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Blockchain] Error syncing tribe posts:', error);
    }
  }

  /**
   * Clear a specific post from cache to force a fresh fetch
   * @param postId Post ID to clear from cache
   */
  public clearPostFromCache(postId: string): void {
    const cacheKey = `posts:${postId}`;
    this.postsCache.delete(cacheKey);
    
    // Also clear from localStorage if client-side
    if (!this.isServer) {
      try {
        localStorage.removeItem(`post_${postId}`);
      } catch (error) {
        console.warn('Error removing post from localStorage:', error);
      }
    }
  }
  
  /**
   * Clear a tribe's posts from cache to force a fresh fetch
   * @param tribeId Tribe ID to clear from cache
   */
  public clearTribeCache(tribeId: string): void {
    const cacheKey = `tribe:${tribeId}`;
    this.tribePostsCache.delete(cacheKey);
    
    // Also clear from localStorage if client-side
    if (!this.isServer) {
      try {
        localStorage.removeItem(`tribe_posts_${tribeId}`);
          } catch (error) {
        console.warn('Error removing tribe posts from localStorage:', error);
      }
    }
  }

  private invalidateCache(postId: string): void {
    // Clear specific post from cache
    this.clearPostFromCache(postId);
    
    // Clear related tribe cache
    const post = this.postsCache.get(`posts:${postId}`)?.data;
    if (post?.tribeId) {
      this.clearTribeCache(post.tribeId.toString());
    }
    
    // Clear user cache
    if (post?.author) {
      this.clearUserCache(post.author);
    }
  }

  private clearUserCache(userAddress: string): void {
    this.userPostsCache.delete(userAddress);
    if (!this.isServer) {
      try {
        localStorage.removeItem(`user_posts_${userAddress}`);
          } catch (error) {
        console.warn('[Cache] Error removing user posts from localStorage:', error);
      }
    }
  }

  // Get contract with proper provider
  private async getContract(): Promise<any> {
    if (this.contract) {
      return this.contract;
    }

    try {
      // Connect to blockchain if not already connected
      await blockchain.connect();
      
      const chainId = await blockchain.getChainId();
      console.info('[Blockchain] Using chain ID:', chainId);
      
      const { postMinter } = getContracts(chainId);
      
      // Use viem's public client instead of ethers.js Contract
      const publicClient = getPublicClient(chainId);
      
      // Create a wrapper for the contract that uses viem's publicClient
      const contract = {
        address: postMinter.address,
        abi: postMinter.abi,
        
        // Generic method for calling read functions
        callReadFunction: async (functionName: string, args: any[] = []) => {
          try {
            const result = await publicClient.readContract({
              address: postMinter.address as `0x${string}`,
              abi: postMinter.abi,
              functionName,
              args
            });
            return result;
          } catch (error) {
            console.error(`[Blockchain] Error calling ${functionName}:`, error);
            throw error;
          }
        },
        
        // Define specific contract methods
        getPostsByUser: async (userId: string, offset: bigint, limit: bigint) => {
          return contract.callReadFunction('getPostsByUser', [userId, offset, limit]);
        },
        
        getPost: async (postId: number) => {
          return contract.callReadFunction('getPost', [postId]);
        },
        
        getTribePosts: async (tribeId: number, offset: bigint, limit: bigint) => {
          return contract.callReadFunction('getTribePosts', [tribeId, offset, limit]);
        },
        
        getUserPosts: async (userId: string) => {
          console.info('[Blockchain] getUserPosts not implemented, using fallback');
      return [];
    }
      };
      
      // Cache the contract
      this.contract = contract;
      return contract;
    } catch (error) {
      console.error('[Blockchain] Error creating contract:', error);
      
      // Return a mock contract for fallback
      return this.createMockContract();
    }
  }
  
  // Create a mock contract for fallback
  private createMockContract(): any {
    return {
      getPostsByUser: async () => {
        console.info('[Mock] Using mock contract getPostsByUser');
        return [[], 0];
      },
      getUserPosts: async () => {
        console.info('[Mock] Using mock contract getUserPosts');
      return [];
      },
      getPost: async () => null,
      getTribePosts: async () => {
        console.info('[Mock] Using mock contract getTribePosts');
        return [[], 0]; 
      }
    };
  }

  // Add these methods back
  private loadFromLocalStorage(): void {
    try {
      // Load posts cache
      const postsCache = localStorage.getItem('posts_cache');
      if (postsCache) {
        const parsedCache = JSON.parse(postsCache);
        const now = Date.now();
        
        // Only load non-expired items
        Object.entries(parsedCache).forEach(([key, entry]: [string, any]) => {
          if (entry.timestamp && (now - entry.timestamp) < this.LOCAL_STORAGE_TTL) {
            this.postsCache.set(key, entry);
          }
        });
      }
      
      // Load tribe posts cache
      const tribeCache = localStorage.getItem('tribe_posts_cache');
      if (tribeCache) {
        const parsedCache = JSON.parse(tribeCache);
        const now = Date.now();
        
        Object.entries(parsedCache).forEach(([key, entry]: [string, any]) => {
          if (entry.timestamp && (now - entry.timestamp) < this.LOCAL_STORAGE_TTL) {
            this.tribePostsCache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.error('[Cache] Error loading from localStorage:', error);
    }
  }

  private isCacheExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.CACHE_TTL;
  }

  private logCacheAccess(key: string, hit: boolean, source: keyof CacheMetrics['source']): void {
    this.metrics[hit ? 'hits' : 'misses']++;
    if (hit) {
      this.metrics.source[source]++;
    }

    const stats = this.cacheStats.get(key) || {
      lastAccess: 0,
      accessCount: 0,
      dataSource: source
    };

    stats.lastAccess = Date.now();
    stats.accessCount++;
    this.cacheStats.set(key, stats);

    // Log only important cache events
    if (!hit || stats.accessCount % 10 === 0) {
      console.info(`[Cache ${hit ? 'HIT' : 'MISS'}] ${key} from ${source} (Access #${stats.accessCount})`);
    }
  }

  public async mapBlockchainPostToUIPost(blockchainPost: any): Promise<Post | null> {
    if (!blockchainPost || (!Array.isArray(blockchainPost) && typeof blockchainPost !== 'object')) {
      console.info('[Blockchain] Invalid post data received');
          return null;
        }

    try {
      let metadata;
      try {
        metadata = typeof blockchainPost[3] === 'string' ? JSON.parse(blockchainPost[3]) : blockchainPost[3];
        
        // If metadata is a string (which can happen with blockchain data), parse it again
        if (typeof metadata === 'string') {
          metadata = JSON.parse(metadata);
        }
      } catch (error) {
        console.warn('[Blockchain] Using default metadata due to parsing error:', error);
        metadata = {
          title: '',
          content: '',
          type: 'TEXT',
          tags: [],
          createdAt: new Date().toISOString()
        };
      }

      const postType = this.getPostType(metadata.type || PostType.TEXT);
      const author = blockchainPost[1] || '0x0000000000000000000000000000000000000000';
      const tribeId = Number(blockchainPost[2]);

      // Only return null if essential data is missing
      if (!author || tribeId === undefined) {
        console.warn('[Blockchain] Missing essential post data');
        return null;
      }

      const post: Post = {
        id: blockchainPost[0]?.toString() || '0',
        author: author as `0x${string}`,
        content: metadata.content || '',
        type: postType,
        createdAt: metadata.createdAt ? new Date(metadata.createdAt).getTime() : Date.now(),
        tribeId,
        stats: {
          likeCount: Number(blockchainPost[6]) || 0,
          commentCount: 0,
          shareCount: 0,
          viewCount: 0,
          saveCount: 0
        },
        metadata: {
          type: postType,
          content: metadata.content || '',
          title: metadata.title || '',
          description: metadata.description || '',
          tags: metadata.tags || [],
          media: metadata.mediaContent?.map((m: any) => ({
            url: m.url,
            type: m.type,
            width: m.width,
            height: m.height
          })) || [],
          createdAt: metadata.createdAt || new Date().toISOString()
        }
      };

      return post;
    } catch (error) {
      console.error('[Blockchain] Error mapping post:', error);
      return null;
    }
  }

  // Update the getPostType method with proper type handling
  private getPostType(type: string): PostType {
    const upperType = type.toUpperCase();
    const validTypes = Object.values(PostType) as string[];
    if (validTypes.includes(upperType)) {
      return upperType as unknown as PostType;
    }
    return PostType.TEXT;
  }

  // Update queue service methods
  private async processQueue(): Promise<void> {
    if (!this.queueService) return;
    await this.queueService.processQueue();
  }

  private async enqueueTask(task: QueueTask): Promise<void> {
    if (!this.queueService) return;
    await this.queueService.addToQueue(task.type, task.data, { priority: task.priority });
  }
}