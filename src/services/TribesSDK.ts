/**
 * Tribes SDK - Main entry point for the application
 * 
 * This class serves as a facade for all tribe-related services and provides
 * a unified interface for the application to interact with the backend.
 */
import { TribeService } from './tribe/TribeService';
import { IPostService } from './post/IPostService';
import { IProfileService } from './profile/IProfileService';
import { ProfileService } from './profile/ProfileService';
import { IndexerService } from './indexer/IndexerService';
import { getCurrentChainId } from '../utils/blockchainUtils';
import { Tribe, TribeData, NFTRequirement } from '../types/tribe';
import { Post } from '../types/post';
import { ProfileData, ProfileMetadata } from '../types/user';
import { InteractionType } from '../types/interaction';
import { WalletClient } from 'viem';

/**
 * Main SDK class that provides access to all services
 */
export class TribesSDK {
  private tribeService: TribeService;
  private postService: IPostService | null = null;
  private profileService: IProfileService | null = null;
  private indexerService: IndexerService;
  private chainId: number;
  private isInitialized = false;

  /**
   * Create a new TribesSDK instance
   * @param chainId Optional chain ID, will be detected from wallet if not provided
   */
  constructor(chainId?: number) {
    this.chainId = chainId || 0;
    this.tribeService = new TribeService(this.chainId);
    this.indexerService = new IndexerService(this.chainId);
  }

  /**
   * Initialize the SDK
   * @param chainId Optional chain ID override
   */
  async initialize(chainId?: number): Promise<void> {
    try {
      // If chain ID is provided, use it, otherwise detect from wallet
      if (chainId) {
        console.log(`[TribesSDK] Initializing with provided chainId: ${chainId}`);
        this.chainId = chainId;
      } else if (!this.chainId) {
        try {
          this.chainId = await getCurrentChainId();
          console.log(`[TribesSDK] Auto-detected chainId: ${this.chainId}`);
        } catch (error) {
          console.warn(`[TribesSDK] Failed to auto-detect chainId, using default: ${this.chainId || 20143}`);
          this.chainId = this.chainId || 20143; // Use Monad Devnet as fallback
        }
      }

      // Initialize services
      console.log(`[TribesSDK] Initializing services with chainId: ${this.chainId}`);
      this.tribeService = new TribeService(this.chainId);
      this.profileService = new ProfileService(this.chainId);
      this.indexerService = new IndexerService(this.chainId);

      // Initialize cache in a fire-and-forget manner to avoid blocking initialization
      console.log(`[TribesSDK] Starting cache initialization (non-blocking)`);
      this.initializeCache().catch(err => {
        console.warn('[TribesSDK] Background cache initialization failed:', err);
      });

      // Mark as initialized immediately so the app can continue
      this.isInitialized = true;
      console.log(`[TribesSDK] Core initialization complete`);
    } catch (error) {
      console.error(`[TribesSDK] Initialization failed:`, error);
      // Still mark as initialized to prevent repeated failures
      this.isInitialized = true;
      throw error;
    }
  }

  /**
   * Initialize cache in the background
   * @private
   */
  private async initializeCache(): Promise<void> {
    try {
      await this.indexerService.refreshCache();
      console.log(`[TribesSDK] Cache successfully initialized`);
    } catch (error) {
      console.warn(`[TribesSDK] Cache initialization failed, will retry later:`, error);
      // Schedule a retry after a few seconds
      setTimeout(() => {
        console.log(`[TribesSDK] Retrying cache initialization`);
        this.indexerService.refreshCache().catch(e => 
          console.error(`[TribesSDK] Cache retry failed:`, e)
        );
      }, 5000);
    }
  }

  /**
   * Connect to a wallet
   * @param walletClient Wallet client from wagmi or viem
   * @param address Connected wallet address
   */
  public async connect(walletClient: any, address: string): Promise<void> {
    console.log('[TribesSDK] Connecting to wallet', { 
      walletClientType: typeof walletClient, 
      hasWalletClient: !!walletClient,
      address 
    });
    
    try {
      // Connect all services to the wallet
      if (this.tribeService) {
        await this.tribeService.connect(walletClient, address);
      }
      
      if (this.profileService) {
        await this.profileService.connect(walletClient, address);
      }
      
      // Register this user with the indexer service
      this.indexerService.setConnectedUser(address);
      
      console.log('[TribesSDK] Successfully connected to wallet');
    } catch (error) {
      console.error('[TribesSDK] Failed to connect to wallet:', error);
      throw error;
    }
  }

  // Profile-related methods
  public async getProfileById(profileId: number): Promise<ProfileData> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.getProfileById(profileId);
  }

  public async getProfileByUsername(username: string): Promise<ProfileData> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.getProfileByUsername(username);
  }

  public async getProfileByAddress(address: string): Promise<ProfileData | null> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.getProfileByAddress(address);
  }

  public async createProfile(username: string, metadata: ProfileMetadata): Promise<number> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    
    // Pre-check wallet connection
    if (!this.isWalletConnected()) {
      throw new Error('Wallet connection check failed. Please reconnect your wallet and try again.');
    }
    
    return this.profileService.createProfile(username, metadata);
  }

  public async updateProfileMetadata(profileId: number, metadata: ProfileMetadata): Promise<void> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.updateProfileMetadata(profileId, metadata);
  }

  public async checkUsernameAvailability(username: string): Promise<boolean> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.checkUsernameAvailability(username);
  }

  public async checkProfileOwnership(address: string): Promise<ProfileData | null> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.checkProfileOwnership(address);
  }

  public async findUsernameByAddress(address: string): Promise<string | null> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.findUsernameByAddress(address);
  }

  public async skipProfileCreation(address: string): Promise<boolean> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.skipProfileCreation(address);
  }

  public async hasSkippedProfileCreation(address: string): Promise<boolean> {
    if (!this.profileService) {
      throw new Error('Profile service not initialized');
    }
    return this.profileService.hasSkippedProfileCreation(address);
  }

  // Tribe-related methods
  /**
   * Create a new tribe
   * @param name Tribe name
   * @param metadata Tribe metadata
   * @param admins Admin addresses
   * @param joinType Join type
   * @param entryFee Entry fee
   * @param nftRequirements NFT requirements
   * @returns Created tribe ID
   */
  public async createTribe(
    name: string,
    metadata: string,
    admins?: string[],
    joinType?: number,
    entryFee?: bigint,
    nftRequirements?: NFTRequirement[]
  ): Promise<number> {
    const tribeId = await this.tribeService.createTribe(
      name,
      metadata,
      admins,
      joinType,
      entryFee,
      nftRequirements
    );

    // Refresh cache after creating a new tribe
    await this.indexerService.refreshCache();

    return tribeId;
  }

  /**
   * Get tribe data
   * @param tribeId Tribe ID
   * @returns Tribe data
   */
  public async getTribeData(tribeId: number): Promise<TribeData> {
    return this.tribeService.getTribeData(tribeId);
  }

  /**
   * Get tribe in UI format
   * @param tribeId Tribe ID
   * @returns Tribe in UI format
   */
  public async getTribe(tribeId: number): Promise<Tribe> {
    try {
      console.log(`[TribesSDK] Getting tribe data for ID: ${tribeId}`);
      const tribeData = await this.tribeService.getTribeData(tribeId);
      console.log(`[TribesSDK] Successfully fetched tribe data for ID: ${tribeId}`, tribeData);
      
      // Map the data to UI format
      const uiTribe = this.tribeService.mapTribeDataToUIFormat(tribeData, this.chainId);
      console.log(`[TribesSDK] Mapped tribe data to UI format:`, uiTribe);
      
      return uiTribe;
    } catch (error) {
      console.error(`[TribesSDK] Error getting tribe ${tribeId}:`, error);
      throw error;
    }
  }

  /**
   * Join a tribe
   * @param tribeId Tribe ID
   */
  public async joinTribe(tribeId: number): Promise<void> {
    await this.tribeService.joinTribe(tribeId);
    // Refresh cache after joining a tribe
    await this.indexerService.refreshCache();
  }

  /**
   * Request to join a tribe
   * @param tribeId Tribe ID
   * @param entryFee Entry fee
   */
  public async requestToJoinTribe(tribeId: number, entryFee: bigint): Promise<void> {
    await this.tribeService.requestToJoinTribe(tribeId, entryFee);
    // Refresh cache after requesting to join a tribe
    await this.indexerService.refreshCache();
  }

  /**
   * Get member status in tribe
   * @param tribeId Tribe ID
   * @param memberAddress Member address
   * @returns Member status
   */
  public async getMemberStatus(tribeId: number, memberAddress: string): Promise<number> {
    return this.tribeService.getMemberStatus(tribeId, memberAddress);
  }

  /**
   * Get tribes count
   * @returns Tribes count
   */
  public async getTribesCount(): Promise<number> {
    return this.tribeService.getTribesCount();
  }

  /**
   * Get user tribes
   * @param userAddress User address
   * @returns Array of tribe IDs
   */
  public async getUserTribes(userAddress: string): Promise<number[]> {
    const tribes = await this.indexerService.getTribesByUser(userAddress);
    return tribes.map(tribe => Number(tribe.id));
  }

  /**
   * Get all tribes with better error handling and fallbacks
   */
  public async getAllTribes(): Promise<Tribe[]> {
    try {
      console.log(`[TribesSDK] Getting all tribes from indexer`);
      const tribes = await this.indexerService.getTribesSince(0);
      console.log(`[TribesSDK] Found ${tribes.length} tribes from indexer`);
      
      // Ensure all tribe objects have the required properties
      return tribes.map(tribe => {
        // Make sure ID is a string
        const id = tribe.id.toString();
        
        // Create a complete Tribe object with all required properties
        const completeTribe: Tribe = {
          ...tribe,
          id,
          // Ensure these required properties exist
          metadata: tribe.metadata || '{}',
          owner: tribe.owner || '0x0000000000000000000000000000000000000000',
          nftRequirements: tribe.nftRequirements || []
        };
        
        console.log(`[TribesSDK] Processed tribe ${id} from indexer:`, completeTribe);
        return completeTribe;
      });
    } catch (error) {
      console.error(`[TribesSDK] Error getting all tribes from indexer:`, error);
      
      // Fallback: Try using tribe service directly if indexer fails
      try {
        console.log(`[TribesSDK] Falling back to tribeService for getting tribes`);
        const count = await this.tribeService.getTribesCount();
        console.log(`[TribesSDK] Found ${count} tribes via fallback`);
        
        // Get first 20 tribes as a reasonable limit for fallback
        const limit = Math.min(count, 20);
        const tribes = [];
        
        for (let i = 1; i <= limit; i++) {
          try {
            const tribeData = await this.tribeService.getTribeData(i);
            const tribe = this.tribeService.mapTribeDataToUIFormat(tribeData, this.chainId);
            console.log(`[TribesSDK] Successfully mapped tribe ${i} via fallback:`, tribe);
            tribes.push(tribe);
          } catch (tribeError) {
            console.warn(`[TribesSDK] Failed to get tribe ${i}:`, tribeError);
          }
        }
        
        console.log(`[TribesSDK] Fallback returned ${tribes.length} tribes`);
        return tribes;
      } catch (fallbackError) {
        console.error(`[TribesSDK] Fallback also failed:`, fallbackError);
        return []; // Return empty array as last resort
      }
    }
  }

  // Post-related methods
  public async getPostsSince(timestamp: number): Promise<Post[]> {
    return this.indexerService.getPostsSince(timestamp);
  }

  public async getPostsByUser(address: string): Promise<Post[]> {
    return this.indexerService.getPostsByUser(address);
  }

  public async getPostsByTribe(tribeId: number): Promise<Post[]> {
    return this.indexerService.getPostsByTribe(tribeId);
  }

  /**
   * Check if the wallet is connected to the SDK
   * @returns Whether the wallet is connected
   */
  public isWalletConnected(): boolean {
    const profileServiceExists = !!this.profileService;
    
    // Check only the profile service since TribeService might not have isWalletConnected
    let profileServiceConnected = false;
    
    if (profileServiceExists && this.profileService) {
      try {
        profileServiceConnected = this.profileService.isWalletConnected();
      } catch (error) {
        console.error('[TribesSDK] Error checking profile service wallet connection:', error);
      }
    }
    
    const isConnected = profileServiceExists && profileServiceConnected;
    
    console.log('[TribesSDK] Wallet connection status:', {
      profileServiceExists,
      profileServiceConnected,
      overallStatus: isConnected
    });
    
    return isConnected;
  }

  // Factory method to create SDK instance
  public static async create(chainId?: number): Promise<TribesSDK> {
    const sdk = new TribesSDK(chainId);
    await sdk.initialize();
    return sdk;
  }
} 