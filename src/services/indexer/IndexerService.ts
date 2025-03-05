import { IIndexerService } from './IIndexerService';
import { Post, PostType } from '../../types/post';
import { Tribe } from '../../types/tribe';
import { ProfileData } from '../../types/user';
import { getPublicClient, getContracts } from '../../config/contracts';
import { Address, getAddress } from 'viem';

type CacheUpdateCallback = (type: 'profile' | 'posts' | 'tribes', data: any) => void;

interface CacheData {
  posts: {
    byId: Record<string, Post>;
    byUser: Record<Address, string[]>;
    byTribe: Record<number, string[]>;
    lastUpdate: number;
  };
  tribes: {
    byId: Record<string, Tribe>;
    byUser: Record<Address, string[]>;
    lastUpdate: number;
  };
  profiles: {
    byAddress: Record<Address, ProfileData>;
    lastUpdate: number;
  };
}

export class IndexerService implements IIndexerService {
  private chainId: number;
  private cache: CacheData;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private lastConnectedAddress: Address | null = null;
  private cacheUpdateCallbacks: CacheUpdateCallback[] = [];

  constructor(chainId: number) {
    console.log(`[IndexerService] Initializing with chainId: ${chainId}`);
    this.chainId = chainId;
    this.cache = {
      posts: {
        byId: {},
        byUser: {},
        byTribe: {},
        lastUpdate: 0
      },
      tribes: {
        byId: {},
        byUser: {},
        lastUpdate: 0
      },
      profiles: {
        byAddress: {},
        lastUpdate: 0
      }
    };
  }

  // Helper to safely check if the error has a specific message
  private hasErrorMessage(error: unknown, partialMessage: string): boolean {
    return error instanceof Error && 
           typeof error.message === 'string' && 
           error.message.includes(partialMessage);
  }

  // Simplified method to log errors consistently
  private logError(context: string, error: unknown): void {
    if (error instanceof Error) {
      console.error(`[IndexerService] ${context}:`, error.message);
    } else {
      console.error(`[IndexerService] ${context}:`, error);
    }
  }

  // Add callback registration for cache updates
  public onCacheUpdate(callback: CacheUpdateCallback): () => void {
    this.cacheUpdateCallbacks.push(callback);
    return () => {
      this.cacheUpdateCallbacks = this.cacheUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyCacheUpdate(type: 'profile' | 'posts' | 'tribes', data: any): void {
    this.cacheUpdateCallbacks.forEach(callback => callback(type, data));
  }

  // Helper to normalize addresses
  private normalizeAddress(address: string): Address {
    try {
      return getAddress(address.toLowerCase());
    } catch (e) {
      throw new Error(`Invalid address format: ${address}`);
    }
  }

  // Posts
  async getPostsSince(timestamp: number): Promise<Post[]> {
    await this.ensureCacheValid('posts');
    return Object.values(this.cache.posts.byId).filter(post => 
      Number(post.createdAt) >= timestamp
    );
  }

  async getPostsByUser(address: string): Promise<Post[]> {
    await this.ensureCacheValid('posts');
    const postIds = this.cache.posts.byUser[this.normalizeAddress(address)] || [];
    return postIds.map(id => this.cache.posts.byId[id]).filter(Boolean);
  }

  async getPostsByTribe(tribeId: number): Promise<Post[]> {
    await this.ensureCacheValid('posts');
    const postIds = this.cache.posts.byTribe[tribeId] || [];
    return postIds.map(id => this.cache.posts.byId[id]).filter(Boolean);
  }

  // Tribes
  async getTribesSince(timestamp: number): Promise<Tribe[]> {
    await this.ensureCacheValid('tribes');
    return Object.values(this.cache.tribes.byId).filter(tribe => 
      Number(tribe.createdAt) >= timestamp
    );
  }

  async getTribesByUser(address: string): Promise<Tribe[]> {
    await this.ensureCacheValid('tribes');
    const tribeIds = this.cache.tribes.byUser[this.normalizeAddress(address)] || [];
    return tribeIds.map(id => this.cache.tribes.byId[id]).filter(Boolean);
  }

  // Profiles
  async getProfilesByAddresses(addresses: string[]): Promise<ProfileData[]> {
    await this.ensureCacheValid('profiles');
    return addresses
      .map(addr => this.cache.profiles.byAddress[this.normalizeAddress(addr)])
      .filter(Boolean);
  }

  async updateUserMetadata(address: string, metadata: string): Promise<void> {
    const publicClient = getPublicClient(this.chainId);
    const { profileNFTMinter } = getContracts(this.chainId);

    // Get the token ID for the address
    const balance = await publicClient.readContract({
      address: profileNFTMinter.address,
      abi: profileNFTMinter.abi,
      functionName: 'balanceOf',
      args: [this.normalizeAddress(address)]
    }) as bigint;

    if (!balance || balance === 0n) {
      throw new Error('No profile found for address');
    }

    // Find the token ID owned by this address
    for (let tokenId = 0n; tokenId < 100n; tokenId++) {
      try {
        const owner = await publicClient.readContract({
          address: profileNFTMinter.address,
          abi: profileNFTMinter.abi,
          functionName: 'ownerOf',
          args: [tokenId]
        }) as Address;

        if (owner.toLowerCase() === this.normalizeAddress(address).toLowerCase()) {
          const result = await publicClient.readContract({
            address: profileNFTMinter.address,
            abi: profileNFTMinter.abi,
            functionName: 'getProfileByTokenId',
            args: [tokenId]
          }) as [string, string, Address];

          const [username, , profileOwner] = result;
          const parsedMetadata = JSON.parse(metadata);

          // Update cache
          this.cache.profiles.byAddress[this.normalizeAddress(address)] = {
            tokenId: tokenId.toString(),
            username,
            metadata: {
              avatar: parsedMetadata.avatar || '',
              bio: parsedMetadata.bio || '',
              createdAt: parsedMetadata.createdAt || Date.now()
            },
            nftUri: parsedMetadata.avatar || '',
            owner: profileOwner
          };
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // Cache management
  clearCache(): void {
    this.cache = {
      posts: {
        byId: {},
        byUser: {},
        byTribe: {},
        lastUpdate: 0
      },
      tribes: {
        byId: {},
        byUser: {},
        lastUpdate: 0
      },
      profiles: {
        byAddress: {},
        lastUpdate: 0
      }
    };
  }

  async refreshCache(): Promise<void> {
    await Promise.all([
      this.updatePostsCache(),
      this.updateTribesCache(),
      this.updateProfilesCache()
    ]);
  }

  private async ensureCacheValid(type: keyof CacheData): Promise<void> {
    const now = Date.now();
    if (now - this.cache[type].lastUpdate > this.CACHE_TTL) {
      switch (type) {
        case 'posts':
          await this.updatePostsCache();
          break;
        case 'tribes':
          await this.updateTribesCache();
          break;
        case 'profiles':
          await this.updateProfilesCache();
          break;
      }
    }
  }

  private async updatePostsCache(): Promise<void> {
    const publicClient = getPublicClient(this.chainId);
    const { postMinter } = getContracts(this.chainId);

    try {
      // Get total posts count
      const nextPostId = await publicClient.readContract({
        address: postMinter.address,
        abi: postMinter.abi,
        functionName: 'nextPostId',
        args: []
      }) as bigint;

      if (nextPostId === undefined) {
        throw new Error('Failed to get post count from contract');
      }

      // Fetch posts in batches
      const batchSize = 50n;
      const totalPosts = nextPostId;
      const batches = Math.ceil(Number(totalPosts) / Number(batchSize));

      for (let i = 0; i < batches; i++) {
        const start = BigInt(i) * batchSize;
        const end = (start + batchSize) > totalPosts ? totalPosts : (start + batchSize);

        for (let postId = start; postId < end; postId++) {
          try {
            const postData = await publicClient.readContract({
              address: postMinter.address,
              abi: postMinter.abi,
              functionName: 'getPost',
              args: [postId]
            }) as [bigint, Address, bigint, string, boolean, Address, bigint, boolean, Address];

            const [id, creator, tribeId, metadata, isGated, collectibleContract, collectibleId, isEncrypted, accessSigner] = postData;

            // Parse metadata
            let parsedMetadata;
            try {
              parsedMetadata = JSON.parse(metadata);
            } catch (err) {
              console.error(`Error parsing metadata for post ${postId}:`, err);
              continue;
            }

            const post: Post = {
              id: postId.toString(),
              content: parsedMetadata.content || '',
              author: creator,
              tribeId: Number(tribeId),
              createdAt: parsedMetadata.createdAt || Date.now(),
              type: parsedMetadata.type || 'text'
            };

            // Update cache
            this.cache.posts.byId[post.id] = post;

            // Update user index
            const userPosts = this.cache.posts.byUser[creator] || [];
            if (!userPosts.includes(post.id)) {
              userPosts.push(post.id);
              this.cache.posts.byUser[creator] = userPosts;
            }

            // Update tribe index
            const tribePosts = this.cache.posts.byTribe[post.tribeId] || [];
            if (!tribePosts.includes(post.id)) {
              tribePosts.push(post.id);
              this.cache.posts.byTribe[post.tribeId] = tribePosts;
            }
          } catch (err) {
            console.error(`Error fetching post ${postId}:`, err);
          }
        }
      }

      this.cache.posts.lastUpdate = Date.now();
    } catch (err) {
      console.error('Error updating posts cache:', err);
    }
  }

  private async updateTribesCache(): Promise<void> {
    const publicClient = getPublicClient(this.chainId);
    const { tribeController } = getContracts(this.chainId);

    try {
      // Get total tribes count
      const nextTribeId = await publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'nextTribeId',
        args: []
      }) as bigint;

      if (nextTribeId === undefined) {
        throw new Error('Failed to get tribe count from contract');
      }

      // Fetch tribes
      for (let tribeId = 1n; tribeId < nextTribeId; tribeId++) {
        try {
          // Get tribe config view for basic info
          const configView = await publicClient.readContract({
            address: tribeController.address,
            abi: tribeController.abi,
            functionName: 'getTribeConfigView',
            args: [tribeId]
          }) as { joinType: number; entryFee: bigint; nftRequirements: any[]; canMerge: boolean };

          // Get tribe admin
          const admin = await publicClient.readContract({
            address: tribeController.address,
            abi: tribeController.abi,
            functionName: 'getTribeAdmin',
            args: [tribeId]
          }) as Address;

          // Get member count
          const memberCount = await publicClient.readContract({
            address: tribeController.address,
            abi: tribeController.abi,
            functionName: 'getMemberCount',
            args: [tribeId]
          }) as bigint;
          
          // Try to get tribe name and metadata
          let tribeName = `Tribe ${tribeId}`;
          let tribeMetadata = '';
          
          try {
            // Get full tribe config which includes name and metadata
            const rawConfig = await publicClient.readContract({
              address: tribeController.address,
              abi: tribeController.abi,
              functionName: 'getTribeConfigView',
              args: [BigInt(tribeId)]
            });
            
            // Handle different response formats
            if (Array.isArray(rawConfig)) {
              tribeName = rawConfig[0] || `Tribe ${tribeId}`;
              tribeMetadata = rawConfig[1] || '{}';
            } else if (typeof rawConfig === 'object' && rawConfig !== null) {
              const rc = rawConfig as any;
              tribeName = rc.name || `Tribe ${tribeId}`;
              tribeMetadata = rc.metadata || '{}';
            }
          } catch (error) {
            console.warn(`Failed to get name for tribe ${tribeId}, using default name:`, error);
          }

          const tribe: Tribe = {
            id: tribeId.toString(),
            name: tribeName,
            metadata: tribeMetadata,
            owner: admin,
            admins: [admin],
            memberCount: Number(memberCount),
            createdAt: Date.now(),
            joinType: configView.joinType,
            entryFee: configView.entryFee,
            nftRequirements: configView.nftRequirements || []
          };

          // Update cache
          this.cache.tribes.byId[tribe.id] = tribe;

          // Update user index
          const userTribes = this.cache.tribes.byUser[admin] || [];
          if (!userTribes.includes(tribe.id)) {
            userTribes.push(tribe.id);
            this.cache.tribes.byUser[admin] = userTribes;
          }
        } catch (err) {
          console.error(`Error fetching tribe ${tribeId}:`, err);
        }
      }

      this.cache.tribes.lastUpdate = Date.now();
    } catch (err) {
      console.error('Error updating tribes cache:', err);
    }
  }

  private async updateProfilesCache(): Promise<void> {
    console.log(`[IndexerService] Starting profile cache update`);
    const publicClient = getPublicClient(this.chainId);
    const { profileNFTMinter } = getContracts(this.chainId);

    // Validate contract address
    if (!profileNFTMinter?.address) {
      console.error('[IndexerService] Profile NFT contract address not found');
      return;
    }

    try {
      // First verify the contract exists and is accessible
      try {
        const code = await publicClient.getBytecode({ address: profileNFTMinter.address });
        if (!code || code === '0x') {
          console.error('[IndexerService] Profile NFT contract not found at address:', profileNFTMinter.address);
          return;
        }
      } catch (error) {
        console.error('[IndexerService] Error verifying Profile NFT contract:', error);
        return;
      }

      // Process profiles in small batches with delays
      let consecutiveErrors = 0;
      const MAX_CONSECUTIVE_ERRORS = 5;
      const BATCH_SIZE = 5n;
      let tokenId = 0n;
      let profilesFound = 0;

      while (consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
        try {
          // Try to get the owner of the token
          const owner = await publicClient.readContract({
            address: profileNFTMinter.address,
            abi: profileNFTMinter.abi,
            functionName: 'ownerOf',
            args: [tokenId]
          }) as Address;

          // If we got here, the token exists. Get its profile data
          const result = await publicClient.readContract({
            address: profileNFTMinter.address,
            abi: profileNFTMinter.abi,
            functionName: 'getProfileByTokenId',
            args: [tokenId]
          }) as [string, string, Address];

          const [username, metadataStr] = result;
          const normalizedOwner = this.normalizeAddress(owner);
          console.log(`[IndexerService] Found profile for tokenId ${tokenId}: ${username} (${normalizedOwner})`);

          let metadata;
          try {
            metadata = JSON.parse(metadataStr);
          } catch (e: any) {
            console.log(`[IndexerService] Failed to parse metadata for ${username}: ${e.message}`);
            metadata = {
              avatar: '',
              bio: '',
              createdAt: Date.now()
            };
          }

          // Update cache with normalized address
          const profile: ProfileData = {
            tokenId: tokenId.toString(),
            username,
            metadata: {
              avatar: metadata.avatar || '',
              bio: metadata.bio || '',
              createdAt: metadata.createdAt || Date.now()
            },
            nftUri: metadata.avatar || '',
            owner: normalizedOwner
          };

          this.cache.profiles.byAddress[normalizedOwner] = profile;
          // Notify with hasProfile true since we found an actual profile
          this.notifyCacheUpdate('profile', { 
            address: normalizedOwner, 
            profile,
            hasProfile: true
          });

          profilesFound++;
          consecutiveErrors = 0; // Reset error counter on success
        } catch (error: unknown) {
          // Check if this is a nonexistent token error
          if (error instanceof Error && 
              error.message.includes('ERC721NonexistentToken')) {
            // This is expected for non-minted tokens
            console.log(`[IndexerService] Token ${tokenId} not minted yet, trying next token...`);
            
            // If we've found some profiles and hit a gap, we might be at the end
            if (profilesFound > 0 && consecutiveErrors > 2) {
              console.log(`[IndexerService] Found ${profilesFound} profiles and hit several gaps, assuming end of minted tokens`);
              break;
            }
            
            consecutiveErrors++;
          } else {
            console.error(`[IndexerService] Error fetching profile for tokenId ${tokenId}:`, error);
            consecutiveErrors++;
          }
        }

        tokenId += 1n;

        // Add a delay between batches to avoid rate limiting
        if (tokenId % BATCH_SIZE === 0n) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay
        }
      }

      console.log(`[IndexerService] Profile cache update complete. Found ${profilesFound} profiles.`);
      this.cache.profiles.lastUpdate = Date.now();
    } catch (err) {
      console.error('[IndexerService] Error updating profiles cache:', err);
    }
  }

  // User lookup methods
  public getUsernameByAddress(address: string): string | null {
    const userPosts = this.cache.posts.byUser[this.normalizeAddress(address)] || [];
    if (userPosts.length > 0) {
      const post = this.cache.posts.byId[userPosts[0]];
      return post?.author || null;
    }
    return null;
  }

  public getAddressByUsername(username: string): string | null {
    // Search through posts to find matching author
    for (const post of Object.values(this.cache.posts.byId)) {
      if (post.author.toLowerCase() === username.toLowerCase()) {
        return post.author;
      }
    }
    return null;
  }

  // Profile methods
  public getUserMetadata(address: string): ProfileData | null {
    return this.cache.profiles.byAddress[this.normalizeAddress(address)] || null;
  }

  // Force refresh methods
  public async forceRefreshContent(contentType: 'post' | 'tribe' | 'profile', id: string): Promise<void> {
    switch (contentType) {
      case 'post':
        await this.refreshPost(id);
        break;
      case 'tribe':
        await this.refreshTribe(id);
        break;
      case 'profile':
        await this.refreshProfile(id);
        break;
    }
  }

  private async refreshPost(postId: string): Promise<void> {
    try {
      const publicClient = getPublicClient(this.chainId);
      const { contentManager } = getContracts(this.chainId);

      const postData = await publicClient.readContract({
        address: contentManager.address,
        abi: contentManager.abi,
        functionName: 'getPost',
        args: [BigInt(postId)]
      }) as [string, Address, bigint, bigint, number];

      const [content, author, tribeId, timestamp, postType] = postData;

      const post: Post = {
        id: postId,
        content,
        author,
        tribeId: Number(tribeId),
        createdAt: Number(timestamp) * 1000,
        type: postType as PostType
      };

      // Update cache
      this.cache.posts.byId[post.id] = post;
      
      // Update user index
      const userPosts = this.cache.posts.byUser[this.normalizeAddress(author)] || [];
      if (!userPosts.includes(post.id)) {
        userPosts.push(post.id);
        this.cache.posts.byUser[this.normalizeAddress(author)] = userPosts;
      }

      // Update tribe index
      const tribePosts = this.cache.posts.byTribe[post.tribeId] || [];
      if (!tribePosts.includes(post.id)) {
        tribePosts.push(post.id);
        this.cache.posts.byTribe[post.tribeId] = tribePosts;
      }
    } catch (error) {
      console.error(`Error refreshing post ${postId}:`, error);
    }
  }

  private async refreshTribe(tribeId: string): Promise<void> {
    try {
      const publicClient = getPublicClient(this.chainId);
      const { tribeController } = getContracts(this.chainId);

      const tribeData = await publicClient.readContract({
        address: tribeController.address,
        abi: tribeController.abi,
        functionName: 'getTribe',
        args: [BigInt(tribeId)]
      }) as [string, string, Address, Address[], bigint, bigint, number, bigint, any[]];

      const [name, metadata, owner, admins, memberCount, timestamp, joinType, entryFee, nftRequirements] = tribeData;

      const tribe: Tribe = {
        id: tribeId,
        name,
        metadata,
        owner,
        admins,
        memberCount: Number(memberCount),
        createdAt: Number(timestamp) * 1000,
        joinType,
        entryFee,
        nftRequirements
      };

      // Update cache
      this.cache.tribes.byId[tribe.id] = tribe;
      
      // Update user index
      const userTribes = this.cache.tribes.byUser[this.normalizeAddress(owner)] || [];
      if (!userTribes.includes(tribe.id)) {
        userTribes.push(tribe.id);
        this.cache.tribes.byUser[this.normalizeAddress(owner)] = userTribes;
      }
    } catch (error) {
      console.error(`Error refreshing tribe ${tribeId}:`, error);
    }
  }

  public async refreshProfile(address: string): Promise<void> {
    const normalizedAddress = this.normalizeAddress(address);
    
    try {
      const publicClient = getPublicClient(this.chainId);
      const { profileNFTMinter } = getContracts(this.chainId);

      if (!profileNFTMinter?.address) {
        throw new Error('Profile NFT contract address not found');
      }

      // Check for profile NFT
      const hasProfile = await publicClient.readContract({
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'balanceOf',
        args: [normalizedAddress]
      }) as bigint;

      if (!hasProfile || hasProfile === 0n) {
        const emptyProfile: ProfileData = {
          tokenId: '0',
          username: `User-${normalizedAddress.substring(2, 6)}`,
          metadata: {
            avatar: '',
            bio: '',
            createdAt: Date.now()
          },
          nftUri: '',
          owner: normalizedAddress
        };
        
        this.cache.profiles.byAddress[normalizedAddress] = emptyProfile;
        this.notifyCacheUpdate('profile', { address: normalizedAddress, profile: emptyProfile, hasProfile: false });
        return;
      }

      // Find the profile token
      let found = false;
      for (let id = 0n; id < 100n && !found; id++) {
        try {
          const owner = await publicClient.readContract({
            address: profileNFTMinter.address,
            abi: profileNFTMinter.abi,
            functionName: 'ownerOf',
            args: [id]
          }) as Address;

          const ownerNormalized = this.normalizeAddress(owner);
          if (ownerNormalized === normalizedAddress) {
            const [username, metadataStr] = await publicClient.readContract({
              address: profileNFTMinter.address,
              abi: profileNFTMinter.abi,
              functionName: 'getProfileByTokenId',
              args: [id]
            }) as [string, string, Address];

            const metadata = this.parseMetadata(metadataStr);
            const profile: ProfileData = {
              tokenId: id.toString(),
              username,
              metadata: {
                avatar: metadata.avatar || '',
                bio: metadata.bio || '',
                createdAt: metadata.createdAt || Date.now()
              },
              nftUri: metadata.avatar || '',
              owner: normalizedAddress
            };

            this.cache.profiles.byAddress[normalizedAddress] = profile;
            this.notifyCacheUpdate('profile', { address: normalizedAddress, profile, hasProfile: true });
            found = true;
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('ERC721NonexistentToken')) {
            continue;
          }
          throw error;
        }
      }

      // If we didn't find a profile but the user has a balance, something went wrong
      if (!found && hasProfile > 0n) {
        throw new Error(`Profile NFT found for ${normalizedAddress} but unable to locate token ID`);
      }

    } catch (error) {
      this.logError(`Error refreshing profile for ${normalizedAddress}`, error);
      throw error;
    }
  }
  
  // Helper to safely parse JSON metadata
  private parseMetadata(metadataStr: string): any {
    try {
      return JSON.parse(metadataStr);
    } catch (e: any) {
      console.error(`[IndexerService] Failed to parse metadata: ${metadataStr.substring(0, 50)}...`, e);
      return {
        avatar: '',
        bio: '',
        createdAt: Date.now()
      };
    }
  }

  // Add a method to explicitly set connected user address
  public setConnectedUser(address: string): void {
    try {
      const normalizedAddress = this.normalizeAddress(address);
      
      if (this.lastConnectedAddress !== normalizedAddress) {
        this.lastConnectedAddress = normalizedAddress;
        
        // Initialize user data structures if needed
        if (!this.cache.posts.byUser[normalizedAddress]) {
          this.cache.posts.byUser[normalizedAddress] = [];
        }
        
        // Check for existing profile and verify NFT ownership immediately
        const profile = this.cache.profiles.byAddress[normalizedAddress];
        const publicClient = getPublicClient(this.chainId);
        const { profileNFTMinter } = getContracts(this.chainId);

        // Always verify NFT ownership, even if we have a cached profile
        publicClient.readContract({
          address: profileNFTMinter.address,
          abi: profileNFTMinter.abi,
          functionName: 'balanceOf',
          args: [normalizedAddress]
        }).then((value: unknown) => {
          const balance = value as bigint;
          const hasProfile = balance > 0n;
          
          if (hasProfile) {
            if (profile) {
              // We have a cached profile and confirmed NFT ownership
              this.notifyCacheUpdate('profile', { 
                address: normalizedAddress, 
                profile,
                hasProfile: true
              });
            } else {
              // We need to fetch the profile
              this.refreshProfile(normalizedAddress);
            }
          } else {
            // No NFT found, use empty profile
            const emptyProfile: ProfileData = {
              tokenId: '0',
              username: `User-${normalizedAddress.substring(2, 6)}`,
              metadata: {
                avatar: '',
                bio: '',
                createdAt: Date.now()
              },
              nftUri: '',
              owner: normalizedAddress
            };
            this.cache.profiles.byAddress[normalizedAddress] = emptyProfile;
            this.notifyCacheUpdate('profile', { 
              address: normalizedAddress, 
              profile: emptyProfile,
              hasProfile: false
            });
          }
        }).catch((error) => {
          this.logError(`Error checking profile balance in setConnectedUser`, error);
          if (profile) {
            // Use cached profile but mark as unverified
            this.notifyCacheUpdate('profile', { 
              address: normalizedAddress, 
              profile,
              hasProfile: false
            });
          }
        });
      }
    } catch (error) {
      this.logError(`Error in setConnectedUser`, error);
      throw error;
    }
  }

  // Add method to update chain ID
  public updateChainId(chainId: number): void {
    if (this.chainId !== chainId) {
      console.log(`[IndexerService] Updating chain ID from ${this.chainId} to ${chainId}`);
      this.chainId = chainId;
      // Clear cache when chain ID changes
      this.cache = {
        posts: {
          byId: {},
          byUser: {},
          byTribe: {},
          lastUpdate: 0
        },
        tribes: {
          byId: {},
          byUser: {},
          lastUpdate: 0
        },
        profiles: {
          byAddress: {},
          lastUpdate: 0
        }
      };
    }
  }
} 