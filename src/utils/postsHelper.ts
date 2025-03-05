import { Address, WalletClient, formatEther } from 'viem';
import { ZeroAddress } from 'ethers';
import { ErrorType } from '../types/error';
import { getContractAddresses, getContracts, getChainConfig, getPublicClient, getCurrentChainId } from './blockchainUtils';
import ABIS from '../abi';

/**
 * Post metadata interface
 */
export interface PostMetadata {
  title: string;
  content: string;
  createdAt: string;
  media?: string[];
  tags?: string[];
  type?: 'text' | 'image' | 'video' | 'link' | 'poll';
  pollOptions?: string[];
  pollResults?: number[];
  pollEndTime?: number;
  attachments?: {
    type: string;
    url: string;
  }[];
}

/**
 * Post data interface
 */
export interface PostData {
  id: number;
  creator: string;
  tribeId: number;
  rawMetadata: string;
  metadata: PostMetadata;
  isGated: boolean;
  collectibleContract: string;
  collectibleId: number;
  isEncrypted: boolean;
  accessSigner: string;
  createdAt: string;
  interactions?: {
    likes: number;
    saves: number;
    shares: number;
    reports: number;
    userHasLiked?: boolean;
    userHasSaved?: boolean;
    userHasShared?: boolean;
    userHasReported?: boolean;
  };
}

/**
 * Helper class for post operations
 */
export class PostsHelper {
  private chainId: number;
  private publicClient: any;
  private walletClient: WalletClient | null = null;
  private userAddress: string | null = null;

  constructor(chainId: number) {
    this.chainId = chainId;
    this.publicClient = getPublicClient(chainId);
  }

  /**
   * Handle errors
   * @param type - Error type
   * @param message - Error message
   * @param originalError - Original error
   */
  private handleError(type: ErrorType, message: string, originalError?: any): Error {
    console.error('PostsHelper Error:', message, originalError);
    return new Error(message);
  }
  
  /**
   * Get chain configuration
   * @param chainId - Chain ID
   */
  private getChainConfig(chainId: number) {
    return getChainConfig(chainId);
  }

  /**
   * Create a new post
   * @param tribeId - The tribe ID to post in
   * @param metadata - Post metadata
   * @param isGated - Whether the post is gated
   * @param collectibleContract - Collectible contract address for gated posts
   * @param collectibleId - Collectible ID for gated posts
   * @returns The post ID
   */
  public async createPost(
    tribeId: number,
    metadata: PostMetadata,
    isGated: boolean = false,
    collectibleContract: string = ZeroAddress,
    collectibleId: number = 0
  ): Promise<number> {
    try {
      if (!this.walletClient || !this.userAddress) {
        throw this.handleError(ErrorType.CONNECTION_ERROR, 'Wallet not connected');
      }
      
      // Validate metadata
      if (!metadata.title) {
        throw this.handleError(ErrorType.VALIDATION_ERROR, 'Post title is required');
      }

      if (!metadata.content) {
        throw this.handleError(ErrorType.VALIDATION_ERROR, 'Post content is required');
      }

      // Ensure createdAt is set
      metadata.createdAt = metadata.createdAt || new Date().toISOString();
      
      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);
      
      const addresses = getContractAddresses(this.chainId);
      
      const hash = await this.walletClient.writeContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'createPost',
        args: [BigInt(tribeId), metadataString, isGated, collectibleContract, BigInt(collectibleId)],
        account: this.userAddress as Address,
        chain: this.getChainConfig(this.chainId)
      });
      
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      // Extract post ID from event logs
      if (receipt.logs && receipt.logs.length > 0) {
        // Find the PostCreated event and extract the ID
        const postIdHex = receipt.logs[0].topics ? receipt.logs[0].topics[1] : '';
        if (postIdHex) {
          const postId = parseInt(postIdHex, 16);
          return postId;
        }
      }
      
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to retrieve post ID from transaction'
      );
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to create post',
        error
      );
    }
  }
  
  /**
   * Parse post metadata
   * @param metadataString - Raw metadata string
   * @returns Parsed metadata
   */
  private parseMetadata(metadataString: string): PostMetadata {
    try {
      // Default metadata
      const defaultMetadata: PostMetadata = {
        title: 'Untitled Post',
        content: 'No content',
        createdAt: new Date().toISOString()
      };
      
      // Parse the metadata
      if (!metadataString) {
        return defaultMetadata;
      }
      
      let parsedMetadata: PostMetadata;
      try {
        parsedMetadata = JSON.parse(metadataString);
      } catch (e) {
        console.warn('Failed to parse post metadata:', e);
        return defaultMetadata;
      }
      
      // Ensure required fields
      return {
        title: parsedMetadata.title || defaultMetadata.title,
        content: parsedMetadata.content || defaultMetadata.content,
        createdAt: parsedMetadata.createdAt || defaultMetadata.createdAt,
        media: parsedMetadata.media || [],
        tags: parsedMetadata.tags || [],
        type: parsedMetadata.type || 'text',
        pollOptions: parsedMetadata.pollOptions,
        pollResults: parsedMetadata.pollResults,
        pollEndTime: parsedMetadata.pollEndTime,
        attachments: parsedMetadata.attachments
      };
    } catch (error) {
      console.warn('Error parsing post metadata:', error);
      return {
        title: 'Error parsing metadata',
        content: 'There was an error parsing the post content',
        createdAt: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get a post by ID
   * @param postId - The post ID to retrieve
   * @returns The post data
   */
  public async getPost(postId: number): Promise<PostData> {
    try {
      const addresses = getContractAddresses(this.chainId);
      
      // Fetch post data
      const postData = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'getPost',
        args: [BigInt(postId)]
      });
      
      const post = postData as any[];
      const rawMetadata = post[3] as string;
      
      // Parse metadata
      const metadata = this.parseMetadata(rawMetadata);
      
      // Get interaction counts if user is connected
      let interactions;
      if (this.userAddress) {
        const [likes, saves, shares, reports, 
               userHasLiked, userHasSaved, userHasShared, userHasReported] = 
          await Promise.all([
            this.getInteractionCount(postId, 0),
            this.getInteractionCount(postId, 1),
            this.getInteractionCount(postId, 2),
            this.getInteractionCount(postId, 3),
            this.hasUserInteracted(postId, 0),
            this.hasUserInteracted(postId, 1),
            this.hasUserInteracted(postId, 2),
            this.hasUserInteracted(postId, 3)
          ]);
          
        interactions = {
          likes,
          saves,
          shares,
          reports,
          userHasLiked,
          userHasSaved,
          userHasShared,
          userHasReported
        };
      } else {
        const [likes, saves, shares, reports] = 
          await Promise.all([
            this.getInteractionCount(postId, 0),
            this.getInteractionCount(postId, 1),
            this.getInteractionCount(postId, 2),
            this.getInteractionCount(postId, 3)
          ]);
          
        interactions = {
          likes,
          saves,
          shares,
          reports
        };
      }
      
      return {
        id: Number(post[0]),
        creator: post[1],
        tribeId: Number(post[2]),
        rawMetadata,
        metadata,
        isGated: post[4],
        collectibleContract: post[5],
        collectibleId: Number(post[6]),
        isEncrypted: post[7],
        accessSigner: post[8],
        createdAt: metadata.createdAt,
        interactions
      };
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to get post',
        error
      );
    }
  }
  
  /**
   * Get posts by tribe
   * @param tribeId - The tribe ID
   * @param offset - Pagination offset
   * @param limit - Pagination limit
   * @returns Array of posts and total count
   */
  public async getPostsByTribe(
    tribeId: number,
    offset: number = 0,
    limit: number = 10
  ): Promise<{ posts: PostData[], total: number }> {
    try {
      const addresses = getContractAddresses(this.chainId);
      
      // Get post IDs
      const result = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'getPostsByTribe',
        args: [BigInt(tribeId), BigInt(offset), BigInt(limit)]
      });
      
      const [postIdsRaw, totalRaw] = result as [bigint[], bigint];
      const postIds = postIdsRaw.map(id => Number(id));
      
      // Fetch each post
      const posts = await Promise.all(
        postIds.map(id => this.getPost(id))
      );
      
      return {
        posts,
        total: Number(totalRaw)
      };
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to get posts by tribe',
        error
      );
    }
  }
  
  /**
   * Get posts by user
   * @param userAddress - The user's address
   * @param offset - Pagination offset
   * @param limit - Pagination limit
   * @returns Array of posts and total count
   */
  public async getPostsByUser(
    userAddress: string,
    offset: number = 0,
    limit: number = 10
  ): Promise<{ posts: PostData[], total: number }> {
    try {
      const addresses = getContractAddresses(this.chainId);
      
      // Get post IDs
      const result = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'getPostsByUser',
        args: [userAddress, BigInt(offset), BigInt(limit)]
      });
      
      const [postIdsRaw, totalRaw] = result as [bigint[], bigint];
      const postIds = postIdsRaw.map(id => Number(id));
      
      // Fetch each post
      const posts = await Promise.all(
        postIds.map(id => this.getPost(id))
      );
      
      return {
        posts,
        total: Number(totalRaw)
      };
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to get posts by user',
        error
      );
    }
  }
  
  /**
   * Check if a user can view a post
   * @param postId - The post ID to check
   * @param viewer - The viewer's address
   * @returns Whether the user can view the post
   */
  public async canViewPost(postId: number, viewer: string): Promise<boolean> {
    try {
      const addresses = getContractAddresses(this.chainId);
      
      const canView = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'canViewPost',
        args: [BigInt(postId), viewer]
      });
      
      return Boolean(canView);
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to check post access',
        error
      );
    }
  }
  
  /**
   * Check if user has interacted with a post in a specific way
   * @param postId - The post ID
   * @param interactionType - The interaction type
   * @returns Whether the user has interacted
   */
  public async hasUserInteracted(postId: number, interactionType: number): Promise<boolean> {
    try {
      if (!this.userAddress) {
        return false;
      }
      
      const addresses = getContractAddresses(this.chainId);
      
      const hasInteracted = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'hasUserInteracted',
        args: [BigInt(postId), this.userAddress, BigInt(interactionType)]
      });
      
      return Boolean(hasInteracted);
    } catch (error) {
      console.warn('Failed to check user interaction:', error);
      return false;
    }
  }
  
  /**
   * Interact with a post
   * @param postId - The post ID to interact with
   * @param interactionType - The interaction type (0=like, 1=save, 2=share, 3=report)
   */
  public async interactWithPost(postId: number, interactionType: number): Promise<void> {
    try {
      if (!this.walletClient || !this.userAddress) {
        throw this.handleError(ErrorType.CONNECTION_ERROR, 'Wallet not connected');
      }
      
      const addresses = getContractAddresses(this.chainId);
      
      const hash = await this.walletClient.writeContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'interactWithPost',
        args: [BigInt(postId), BigInt(interactionType)],
        account: this.userAddress as Address,
        chain: this.getChainConfig(this.chainId)
      });
      
      await this.publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to interact with post',
        error
      );
    }
  }
  
  /**
   * Get interaction count for a post
   * @param postId - The post ID
   * @param interactionType - The interaction type (0=like, 1=save, 2=share, 3=report)
   * @returns The interaction count
   */
  public async getInteractionCount(postId: number, interactionType: number): Promise<number> {
    try {
      const addresses = getContractAddresses(this.chainId);
      
      const count = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'getInteractionCount',
        args: [BigInt(postId), BigInt(interactionType)]
      });
      
      return Number(count);
    } catch (error) {
      console.warn('Failed to get interaction count:', error);
      return 0;
    }
  }
  
  /**
   * Connect to wallet
   * @param walletClient - The wallet client
   * @param address - The user's address
   */
  public async connect(walletClient: WalletClient, address: string): Promise<void> {
    try {
      this.walletClient = walletClient;
      this.userAddress = address;
      
      // Double-check that we're on the expected chain
      if (walletClient.chain?.id !== this.chainId) {
        console.warn('Chain ID mismatch in connect:');
        console.warn(`  - WalletClient chain: ${walletClient.chain?.id}`);
        console.warn(`  - PostsHelper chain: ${this.chainId}`);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw this.handleError(ErrorType.CONNECTION_ERROR, 'Failed to connect wallet');
    }
  }

  /**
   * Get the total number of posts
   * @returns Total post count
   */
  public async getPostCount(): Promise<number> {
    try {
      const addresses = getContractAddresses(this.chainId);
      
      const count = await this.publicClient.readContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'nextPostId',
        args: []
      }) as bigint;
      
      return Number(count) - 1; // nextPostId is 1-based
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to get post count',
        error
      );
    }
  }
  
  /**
   * Report a post
   * @param postId - The post ID to report
   * @param reason - Reason for reporting
   */
  public async reportPost(postId: number, reason: string): Promise<void> {
    try {
      if (!this.walletClient || !this.userAddress) {
        throw this.handleError(ErrorType.CONNECTION_ERROR, 'Wallet not connected');
      }
      
      const addresses = getContractAddresses(this.chainId);
      
      const hash = await this.walletClient.writeContract({
        address: addresses.POST_MINTER,
        abi: ABIS.PostMinter,
        functionName: 'reportPost',
        args: [BigInt(postId), reason],
        account: this.userAddress as Address,
        chain: this.getChainConfig(this.chainId)
      });
      
      await this.publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      throw this.handleError(
        ErrorType.CONTRACT_ERROR,
        'Failed to report post',
        error
      );
    }
  }

  /**
   * Create instance of PostsHelper for the current chain
   */
  public static async create(): Promise<PostsHelper> {
    const chainId = await getCurrentChainId();
    return new PostsHelper(chainId);
  }
}

export default PostsHelper; 