/**
 * Implementation of the Tribe Service
 */
import { ITribeService } from './ITribeService';
import { getPublicClient, getContracts } from '../../config/contracts';
import { 
  Tribe, 
  TribeConfig, 
  TribeConfigResponse, 
  TribeData, 
  NFTRequirement,
  TribeMetadata
} from '../../types/tribe';
import { parseMetadata, getMetadataFromCache, storeMetadataInCache } from '../../utils/metadataUtils';
import { 
  getCurrentChainId, 
  extractMetadataFromTransaction, 
  getChainConfig,
  waitForTransaction
} from '../../utils/blockchainUtils';
import { ErrorType } from '../../types/error';
import { createWalletClient, custom, WalletClient } from 'viem';
import { getEthereumProvider } from '../../utils/ethereum';
import { mapTribeDataToUI } from '../../utils/typeMappers';

/**
 * Service for interacting with tribes on the blockchain
 */
export class TribeService implements ITribeService {
  private chainId: number;
  private walletClient: WalletClient | undefined;
  private publicClient: any;
  private userAddress: `0x${string}` | undefined;

  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration
  private static INVALID_TRIBE_IDS = new Set<number>(); // Track invalid tribe IDs

  /**
   * Create a new TribeService
   * @param chainId Chain ID to use
   */
  constructor(chainId: number) {
    this.chainId = chainId;
    this.initializeClients();
  }

  /**
   * Initialize blockchain clients
   */
  private async initializeClients(): Promise<void> {
    try {
      this.publicClient = getPublicClient(this.chainId);
      
      // Only initialize wallet client if we have a provider
      const provider = await getEthereumProvider();
      if (provider) {
        const [account] = await provider.request({ method: 'eth_requestAccounts' });
        if (account) {
          this.userAddress = account as `0x${string}`;
          this.walletClient = createWalletClient({
            account,
            chain: getChainConfig(this.chainId),
            transport: custom(provider)
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize clients:', error);
    }
  }

  /**
   * Handle errors consistently
   * @param type Error type
   * @param message Error message
   * @param originalError Original error
   * @returns Error object
   */
  private handleError(type: ErrorType, message: string, originalError?: any): Error {
    console.error(`${type}: ${message}`, originalError);
    const error = new Error(message);
    (error as any).type = type;
    (error as any).originalError = originalError;
    return error;
  }

  /**
   * Connect wallet to the service
   * @param walletClient Wallet client
   * @param address User address
   */
  public async connect(walletClient: WalletClient, address: string): Promise<void> {
    this.walletClient = walletClient;
    this.userAddress = address as `0x${string}`;
  }

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
    admins: string[] = [],
    joinType: number = 0,
    entryFee: bigint = 0n,
    nftRequirements: NFTRequirement[] = []
  ): Promise<number> {
    if (!this.walletClient || !this.userAddress) {
      throw this.handleError(ErrorType.CONNECTION_ERROR, 'Wallet not connected');
    }

    try {
      const { tribeController } = getContracts(this.chainId);
      const chain = getChainConfig(this.chainId);
      
      // Ensure creator is in admins list
      if (!admins.includes(this.userAddress as string)) {
        admins = [...admins, this.userAddress as string];
      }
      
      // Validate and clean inputs
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw this.handleError(ErrorType.VALIDATION_ERROR, 'Tribe name cannot be empty');
      }
      
      // Parse metadata to ensure name is included
      let metadataObj;
      try {
        metadataObj = JSON.parse(metadata);
        // Ensure name is in metadata
        if (!metadataObj.name || metadataObj.name.trim() === '') {
          metadataObj.name = trimmedName;
          metadata = JSON.stringify(metadataObj);
        }
      } catch (error) {
        console.error("Couldn't parse metadata JSON:", error);
        // If metadata parsing fails, ensure we continue with valid empty metadata
        metadata = JSON.stringify({ name: trimmedName });
      }
      
      // Log the final data being sent to the contract
      console.log('Creating tribe with:', {
        name: trimmedName,
        metadataPreview: typeof metadataObj === 'object' ? 
          { ...metadataObj, fullString: metadata.length > 100 ? `${metadata.substring(0, 100)}...` : metadata } : 
          { error: 'Invalid metadata', metadata },
        admins,
        joinType,
        entryFee: entryFee.toString()
      });

      // Create tribe transaction
      const hash = await this.walletClient.writeContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'createTribe',
        args: [trimmedName, metadata, admins, BigInt(joinType), entryFee, nftRequirements],
        account: this.userAddress,
        chain
      });

      // Wait for transaction confirmation
      const receipt = await waitForTransaction(hash, this.chainId);
      
      // Extract tribe ID from event
      const tribeCreatedEvent = receipt.logs.find(
        (log: any) => log.address.toLowerCase() === tribeController.address.toLowerCase()
      );

      if (!tribeCreatedEvent || !tribeCreatedEvent.topics[1]) {
        throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to get tribe ID from transaction');
      }

      const tribeId = parseInt(tribeCreatedEvent.topics[1], 16);
      return tribeId;
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to create tribe', error);
    }
  }

  /**
   * Get tribe configuration
   * @param tribeId Tribe ID
   * @returns Tribe configuration
   */
  public async getTribeConfig(tribeId: number): Promise<TribeConfig> {
    try {
      const { tribeController } = getContracts(this.chainId);
      const publicClient = getPublicClient(this.chainId);
      
      let rawConfig: unknown;
      let config: TribeConfigResponse = { success: true };
      
      try {
        rawConfig = await publicClient.readContract({
          address: tribeController.address,
          abi: tribeController.abi,
          functionName: 'getTribeConfigView',
          args: [BigInt(tribeId)]
        });
        
        // Handle different response formats
        if (Array.isArray(rawConfig)) {
          console.log(`Tribe ${tribeId} raw config (array):`, rawConfig);
          config = {
            success: true,
            name: rawConfig[0] || `Tribe ${tribeId}`,
            metadata: rawConfig[1] || '{}',
            admins: rawConfig[2] || [],
            joinType: Number(rawConfig[3] || 0),
            entryFee: (rawConfig[4] || 0).toString(),
            nftRequirements: rawConfig[5] || []
          };
        } else if (typeof rawConfig === 'object' && rawConfig !== null) {
          // Ensure all required fields exist with fallbacks
          const rc = rawConfig as any;
          console.log(`Tribe ${tribeId} raw config (object):`, rc);
          config = {
            success: true,
            name: rc.name || `Tribe ${tribeId}`,
            metadata: rc.metadata || '{}',
            admins: Array.isArray(rc.admins) ? rc.admins : [],
            joinType: typeof rc.joinType === 'number' ? rc.joinType : 0,
            entryFee: rc.entryFee?.toString() || '0',
            nftRequirements: Array.isArray(rc.nftRequirements) ? rc.nftRequirements : []
          };
        } else {
          throw new Error('Invalid config format');
        }
      } catch (error) {
        console.error('Error getting tribe config from contract:', error);
        config = {
          success: false,
          error: 'Failed to get tribe config'
        };
      }

      // If config was successfully fetched from contract
      if (config.success && config.metadata) {
        // Parse metadata
        let parsedMetadata;
        try {
          // Log the raw metadata string for debugging
          console.log(`Tribe ${tribeId} raw metadata string:`, config.metadata);
          
          parsedMetadata = parseMetadata<TribeMetadata>(config.metadata, {
            description: '',
            createdAt: new Date().toISOString()
          });
          console.log(`Tribe ${tribeId} parsed metadata:`, parsedMetadata);
        } catch (error) {
          console.error(`Error parsing metadata for tribe ${tribeId}:`, error);
          parsedMetadata = {
            description: '',
            createdAt: new Date().toISOString()
          };
        }

        // Determine the best name to use
        let name = config.name || `Tribe ${tribeId}`;
        
        // If we have a name in metadata and it's not empty, consider using it
        if (parsedMetadata.name && parsedMetadata.name.trim() !== '') {
          // If the contract name is generic (like "Tribe 1"), use the metadata name
          if (!name || name === `Tribe ${tribeId}` || name.trim() === '') {
            name = parsedMetadata.name.trim();
            console.log(`Using metadata name for tribe ${tribeId}: "${name}"`);
          } else {
            console.log(`Keeping contract name for tribe ${tribeId}: "${name}" (metadata name was: "${parsedMetadata.name}")`);
          }
        }

        return {
          name,
          description: parsedMetadata.description || '',
          coverImage: parsedMetadata.coverImage,
          avatar: parsedMetadata.avatar,
          isPrivate: parsedMetadata.isPrivate || false,
          entryFee: config.entryFee || '0',
          nftRequirements: config.nftRequirements || [],
          metadata: parsedMetadata,
          admins: config.admins || [],
          joinType: config.joinType || 0
        };
      }

      // Fallback to extracting metadata from transaction
      try {
        const metadataStr = await extractMetadataFromTransaction(
          this.chainId,
          tribeId,
          publicClient
        );
        
        const parsedMetadata = parseMetadata<TribeMetadata>(metadataStr, {
          description: '',
          createdAt: new Date().toISOString()
        });

        return {
          name: config.name || `Tribe ${tribeId}`,
          description: parsedMetadata.description || '',
          coverImage: parsedMetadata.coverImage,
          avatar: parsedMetadata.avatar,
          isPrivate: parsedMetadata.isPrivate || false,
          entryFee: config.entryFee || '0',
          nftRequirements: config.nftRequirements || [],
          metadata: parsedMetadata,
          admins: config.admins || [],
          joinType: config.joinType || 0
        };
      } catch (error) {
        console.error('Error extracting metadata from transaction:', error);
      }

      // Final fallback
      return {
        name: config.name || `Tribe ${tribeId}`,
        description: '',
        isPrivate: false,
        entryFee: '0',
        nftRequirements: [],
        metadata: {
          description: '',
          createdAt: new Date().toISOString()
        },
        admins: config.admins || [],
        joinType: config.joinType || 0
      };
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to get tribe config', error);
    }
  }

  /**
   * Get tribe data
   * @param tribeId Tribe ID
   * @returns Tribe data
   */
  public async getTribeData(tribeId: number): Promise<TribeData> {
    try {
      // Check if tribe ID is known to be invalid
      if (TribeService.INVALID_TRIBE_IDS.has(tribeId)) {
        throw new Error('Invalid tribe ID');
      }

      // Check cache first
      const cacheKey = `tribe_${this.chainId}_${tribeId}`;
      const cachedData = getMetadataFromCache(cacheKey);
      
      if (cachedData) {
        const age = Date.now() - cachedData.timestamp;
        if (age < TribeService.CACHE_DURATION) {
          return cachedData.data as TribeData;
        }
      }
      
      const { tribeController } = getContracts(this.chainId);
      
      // First try getTribeDetails as it provides the most complete information
      try {
        const details = await this.publicClient.readContract({
          address: tribeController.address,
          abi: tribeController.abi,
          functionName: 'getTribeDetails',
          args: [BigInt(tribeId)]
        });

        // Parse metadata
        let metadataObj: TribeMetadata = {
          description: '',
          createdAt: new Date().toISOString(),
          isPrivate: false,
          avatar: '',
          coverImage: '',
          topics: []
        };
        
        try {
          const parsed = JSON.parse(details.metadata || '{}');
          metadataObj = {
            ...metadataObj,
            ...parsed
          };
        } catch (error) {
          console.error(`Error parsing metadata for tribe ${tribeId}:`, error);
        }

        const tribeData: TribeData = {
          id: tribeId.toString(),
          name: details.name || `Tribe #${tribeId}`,
          metadata: details.metadata || '{}',
          owner: details.admin,
          admins: [],
          memberCount: Number(details.memberCount),
          createdAt: Math.floor(Date.now() / 1000),
          joinType: Number(details.joinType),
          entryFee: details.entryFee,
          nftRequirements: [],
          isPrivate: Boolean(metadataObj.isPrivate),
          isActive: details.isActive,
          canMerge: details.canMerge,
          members: []
        };

        // Get NFT requirements and other data in parallel
        const [configView, admins, userStatus] = await Promise.all([
          this.getNFTRequirements(tribeId),
          this.getTribeAdmins(tribeId),
          this.userAddress ? this.getMemberStatus(tribeId, this.userAddress) : Promise.resolve(null)
        ]);

        // Update tribe data with fetched information
        tribeData.nftRequirements = configView?.nftRequirements || [];
        tribeData.admins = admins;
        tribeData.members = admins.map(address => ({
          id: address,
          username: address,
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${address}`,
          role: 'admin'
        }));

        if (userStatus !== null) {
          tribeData.userMembershipStatus = {
            isMember: userStatus === 1,
            isAdmin: userStatus === 2,
            isPending: userStatus === 3,
            status: userStatus
          };
        }

        // Cache the result
        storeMetadataInCache(cacheKey, {
          data: tribeData,
          timestamp: Date.now()
        });
        
        return tribeData;
      } catch (error: any) {
        // If the error is due to invalid tribe ID, cache this information
        if (error?.message?.includes('Invalid tribe ID')) {
          TribeService.INVALID_TRIBE_IDS.add(tribeId);
        }
        throw error;
      }
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to get tribe data', error);
    }
  }

  /**
   * Get NFT requirements for a tribe
   */
  private async getNFTRequirements(tribeId: number): Promise<{ nftRequirements: NFTRequirement[] } | null> {
    try {
      const { tribeController } = getContracts(this.chainId);
      const configView = await this.publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'getTribeConfigView',
        args: [BigInt(tribeId)]
      });
      return configView as { nftRequirements: NFTRequirement[] };
    } catch (error) {
      console.error(`Error fetching NFT requirements for tribe ${tribeId}:`, error);
      return null;
    }
  }

  /**
   * Get admins for a tribe
   */
  private async getTribeAdmins(tribeId: number): Promise<`0x${string}`[]> {
    try {
      const { tribeController } = getContracts(this.chainId);
      const admins = await this.publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'getTribeWhitelist',
        args: [BigInt(tribeId)]
      }) as `0x${string}`[];
      return admins;
    } catch (error) {
      console.error(`Error fetching admins for tribe ${tribeId}:`, error);
      return [];
    }
  }

  /**
   * Join a tribe
   * @param tribeId Tribe ID
   */
  public async joinTribe(tribeId: number): Promise<void> {
    if (!this.walletClient || !this.userAddress) {
      throw this.handleError(ErrorType.CONNECTION_ERROR, 'Wallet not connected');
    }

    try {
      const { tribeController } = getContracts(this.chainId);
      const chain = getChainConfig(this.chainId);
      
      const hash = await this.walletClient.writeContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'joinTribe',
        args: [BigInt(tribeId)],
        account: this.userAddress,
        chain
      });

      await waitForTransaction(hash, this.chainId);
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to join tribe', error);
    }
  }

  /**
   * Request to join a tribe
   * @param tribeId Tribe ID
   * @param entryFee Entry fee
   */
  public async requestToJoinTribe(tribeId: number, entryFee: bigint): Promise<void> {
    if (!this.walletClient || !this.userAddress) {
      throw this.handleError(ErrorType.CONNECTION_ERROR, 'Wallet not connected');
    }

    try {
      const { tribeController } = getContracts(this.chainId);
      const chain = getChainConfig(this.chainId);
      
      const hash = await this.walletClient.writeContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'requestToJoinTribe',
        args: [BigInt(tribeId)],
        value: entryFee,
        account: this.userAddress,
        chain
      });

      await waitForTransaction(hash, this.chainId);
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to request to join tribe', error);
    }
  }

  /**
   * Get member status in tribe
   * @param tribeId Tribe ID
   * @param memberAddress Member address
   * @returns Member status
   */
  public async getMemberStatus(tribeId: number, memberAddress: string): Promise<number> {
    try {
      const { tribeController } = getContracts(this.chainId);
      
      const status = await this.publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'getMemberStatus',
        args: [BigInt(tribeId), memberAddress as `0x${string}`]
      });

      return Number(status);
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to get member status', error);
    }
  }

  /**
   * Get the total number of tribes
   * @returns Tribes count
   */
  public async getTribesCount(): Promise<number> {
    try {
      const { tribeController } = getContracts(this.chainId);
      
      const nextId = await this.publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'nextTribeId',
        args: []
      }) as bigint;
      
      console.log(`Got tribes count from nextTribeId: ${nextId}`);
      return Number(nextId);
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to get tribes count', error);
    }
  }

  /**
   * Get user tribes
   * @param userAddress User address
   * @returns Array of tribe IDs
   */
  public async getUserTribes(userAddress: string): Promise<number[]> {
    try {
      const { tribeController } = getContracts(this.chainId);
      
      const tribes = await this.publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'getUserTribes',
        args: [userAddress as `0x${string}`]
      }) as bigint[];

      return tribes.map(Number);
    } catch (error) {
      throw this.handleError(ErrorType.BLOCKCHAIN_ERROR, 'Failed to get user tribes', error);
    }
  }

  /**
   * Map tribe data to UI format
   * @param tribeData Tribe data
   * @param chainId Chain ID
   * @returns UI-formatted tribe
   */
  public mapTribeDataToUIFormat(tribeData: TribeData, chainId: number): Tribe {
    // Use the shared utility function from typeMappers
    return mapTribeDataToUI(tribeData, chainId);
  }
} 