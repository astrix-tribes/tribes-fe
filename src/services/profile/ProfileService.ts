import { WalletClient, Address } from 'viem';
import { IProfileService } from './IProfileService';
import { ProfileData, ProfileMetadata } from '../../types/user';
import { getPublicClient, getContracts } from '../../config/contracts';
import { getCurrentChain } from '../../constants/contracts';

export class ProfileService implements IProfileService {
  private chainId: number;
  private walletClient: WalletClient | null = null;
  private userAddress: string | null = null;

  constructor(chainId: number) {
    this.chainId = chainId;
  }

  async connect(walletClient: WalletClient, address: string): Promise<void> {
    this.walletClient = walletClient;
    this.userAddress = address;
  }

  /**
   * Check if the wallet is connected
   * @returns Whether the wallet is connected
   */
  isWalletConnected(): boolean {
    return !!this.walletClient && !!this.userAddress;
  }

  async getProfileById(profileId: number): Promise<ProfileData> {
    const publicClient = getPublicClient(this.chainId);
    const { profileNFTMinter } = getContracts(this.chainId);

    const result = await publicClient.readContract({
      address: profileNFTMinter.address,
      abi: profileNFTMinter.abi,
      functionName: 'getProfileByTokenId',
      args: [BigInt(profileId)]
    }) as [string, string, Address];

    const [username, metadataStr] = result;
    const metadata = this.parseMetadata(metadataStr);

    return {
      tokenId: profileId.toString(),
      username,
      metadata,
      nftUri: metadata.avatar,
      owner: this.userAddress || ''
    };
  }

  async getProfileByUsername(username: string): Promise<ProfileData> {
    const publicClient = getPublicClient(this.chainId);
    const { profileNFTMinter } = getContracts(this.chainId);

    const profileId = await publicClient.readContract({
      address: profileNFTMinter.address,
      abi: profileNFTMinter.abi,
      functionName: 'getProfileIdByUsername',
      args: [username]
    }) as bigint;

    return this.getProfileById(Number(profileId));
  }

  async getProfileByAddress(address: string): Promise<ProfileData | null> {
    console.log(`[ProfileService] Getting profile for address: ${address}`);
    try {
      const publicClient = getPublicClient(this.chainId);
      const { profileNFTMinter } = getContracts(this.chainId);

      // First check if the address has a profile NFT
      const balance = await publicClient.readContract({
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'balanceOf',
        args: [address as Address]
      }) as bigint;

      console.log(`[ProfileService] Profile NFT balance for ${address}: ${balance}`);

      if (!balance || balance === 0n) {
        console.log(`[ProfileService] No profile found for address ${address}`);
        return null;
      }

      // Find the token ID by checking ownership
      let userTokenId: bigint | null = null;
      for (let i = 0; i < 10; i++) {
        try {
          const owner = await publicClient.readContract({
            address: profileNFTMinter.address,
            abi: profileNFTMinter.abi,
            functionName: 'ownerOf',
            args: [BigInt(i)]
          }) as Address;

          if (owner.toLowerCase() === address.toLowerCase()) {
            userTokenId = BigInt(i);
            break;
          }
        } catch {
          continue;
        }
      }

      if (userTokenId === null) {
        console.log(`[ProfileService] Could not find token ID for address ${address}`);
        return null;
      }

      // Get profile data using token ID
      const result = await publicClient.readContract({
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'getProfileByTokenId',
        args: [userTokenId]
      }) as [string, string, Address];

      const [username, metadataStr] = result;
      const metadata = this.parseMetadata(metadataStr);

      console.log(`[ProfileService] Found profile for ${address}: ${username}`);

      return {
        tokenId: userTokenId.toString(),
        username,
        metadata,
        nftUri: metadata.avatar,
        owner: address
      };
    } catch (error) {
      console.error(`[ProfileService] Error getting profile for ${address}:`, error);
      return null;
    }
  }

  async createProfile(username: string, metadata: ProfileMetadata): Promise<number> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected: walletClient is missing');
    }
    
    if (!this.userAddress) {
      throw new Error('Wallet not connected: userAddress is missing');
    }

    const { profileNFTMinter } = getContracts(this.chainId);
    const metadataStr = JSON.stringify(metadata);
    const chain = getCurrentChain(this.chainId);

    try {
      const hash = await this.walletClient.writeContract({
        chain,
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'createProfile',
        args: [username, metadataStr],
        account: this.userAddress as `0x${string}`
      });

      console.log(`Profile creation transaction submitted: ${hash}`);

      // Wait for transaction receipt
      const publicClient = getPublicClient(this.chainId);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Find ProfileCreated event
      const event = receipt.logs.find(log => 
        log.address.toLowerCase() === profileNFTMinter.address.toLowerCase()
      );

      if (!event || !event.topics || event.topics.length < 4) {
        throw new Error('Failed to find profile creation event');
      }

      // Extract token ID from event
      const tokenId = parseInt(event.topics[3] || '0', 16);
      return tokenId;
    } catch (error) {
      console.error(`[ProfileService] Error creating profile:`, error);
      throw error;
    }
  }

  async updateProfileMetadata(profileId: number, metadata: ProfileMetadata): Promise<void> {
    if (!this.walletClient || !this.userAddress) {
      throw new Error('Wallet not connected');
    }

    const { profileNFTMinter } = getContracts(this.chainId);
    const metadataStr = JSON.stringify(metadata);
    const chain = getCurrentChain(this.chainId);

    const hash = await this.walletClient.writeContract({
      chain,
      address: profileNFTMinter.address,
      abi: profileNFTMinter.abi,
      functionName: 'updateProfileMetadata',
      args: [BigInt(profileId), metadataStr],
      account: this.userAddress as Address
    });

    const publicClient = getPublicClient(this.chainId);
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const publicClient = getPublicClient(this.chainId);
    const { profileNFTMinter } = getContracts(this.chainId);

    return !(await publicClient.readContract({
      address: profileNFTMinter.address,
      abi: profileNFTMinter.abi,
      functionName: 'usernameExists',
      args: [username]
    }));
  }

  async findUsernameByAddress(address: string): Promise<string | null> {
    const profile = await this.checkProfileOwnership(address);
    return profile ? profile.username : null;
  }

  async skipProfileCreation(address: string): Promise<boolean> {
    try {
      localStorage.setItem('profile_creation_skipped', JSON.stringify({
        address,
        timestamp: Date.now()
      }));
      return true;
    } catch {
      return false;
    }
  }

  async hasSkippedProfileCreation(address: string): Promise<boolean> {
    try {
      const skipped = localStorage.getItem('profile_creation_skipped');
      if (!skipped) return false;

      const { address: skippedAddress } = JSON.parse(skipped);
      return skippedAddress.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }

  async checkProfileOwnership(address: string): Promise<ProfileData | null> {
    return this.getProfileByAddress(address);
  }

  private parseMetadata(metadataStr: string): ProfileMetadata {
    try {
      const parsed = JSON.parse(metadataStr);
      return {
        avatar: parsed.avatar || '',
        bio: parsed.bio || '',
        createdAt: parsed.createdAt || Date.now()
      };
    } catch {
      return {
        avatar: '',
        bio: '',
        createdAt: Date.now()
      };
    }
  }
} 