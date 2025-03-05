import { Tribe } from '../types/tribe';
import { type WalletClient } from 'viem';

/**
 * Extract avatar URL from tribe metadata or return a default
 * @param tribe The tribe object
 * @param defaultAvatar Optional default avatar URL
 * @returns The avatar URL
 */
export function getTribeAvatar(tribe: Tribe, defaultAvatar: string = '/images/default-avatar.png'): string {
  if (!tribe) return defaultAvatar;
  
  try {
    // Try to access avatar directly if it exists in the tribe object
    const tribeAny = tribe as any;
    if (tribeAny.avatar && typeof tribeAny.avatar === 'string' && tribeAny.avatar.trim() !== '') {
      console.log(`Using direct avatar for tribe ${tribe.id}:`, tribeAny.avatar);
      return tribeAny.avatar;
    }
    
    // Try to parse metadata if it's a string
    let metadata: any = null;
    if (typeof tribe.metadata === 'string' && tribe.metadata.trim() !== '') {
      try {
        metadata = JSON.parse(tribe.metadata);
        console.log(`Successfully parsed metadata for tribe ${tribe.id}`);
      } catch (parseError) {
        console.error(`Error parsing metadata JSON for tribe ${tribe.id}:`, parseError);
      }
    } else if (typeof tribe.metadata === 'object' && tribe.metadata !== null) {
      metadata = tribe.metadata;
      console.log(`Using metadata object directly for tribe ${tribe.id}`);
    }
    
    // Check if avatar exists in metadata and is not empty
    if (metadata?.avatar && typeof metadata.avatar === 'string' && metadata.avatar.trim() !== '') {
      console.log(`Found avatar in metadata for tribe ${tribe.id}:`, metadata.avatar);
      return metadata.avatar;
    }
    
    // Try fallback to a generated avatar using DiceBear API
    if (tribe.id && tribe.name) {
      const generatedAvatar = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(tribe.id)}-${encodeURIComponent(tribe.name)}`;
      console.log(`Generated avatar for tribe ${tribe.id}:`, generatedAvatar);
      return generatedAvatar;
    }
    
    console.log(`Using default avatar for tribe ${tribe.id}`);
    return defaultAvatar;
  } catch (error) {
    console.error(`Error processing avatar for tribe ${tribe.id}:`, error);
    return defaultAvatar;
  }
}

/**
 * Extract privacy setting from tribe metadata
 * @param tribe The tribe object
 * @returns 'public' or 'private'
 */
export function getTribePrivacy(tribe: Tribe): 'public' | 'private' {
  if (!tribe) return 'public';
  
  try {
    // Check for direct privacy property
    const tribeAny = tribe as any;
    if (tribeAny.privacy === 'private') {
      return 'private';
    }
    
    // Try to parse metadata if it's a string
    let metadata: any = null;
    if (typeof tribe.metadata === 'string' && tribe.metadata.trim() !== '') {
      try {
        metadata = JSON.parse(tribe.metadata);
      } catch (parseError) {
        console.error(`Error parsing metadata JSON for tribe ${tribe.id}:`, parseError);
      }
    } else if (typeof tribe.metadata === 'object' && tribe.metadata !== null) {
      metadata = tribe.metadata;
    }
    
    // Check if isPrivate flag exists in metadata
    if (metadata?.isPrivate === true) {
      return 'private';
    }
    
    // Check if privacy field exists
    if (metadata?.privacy === 'private') {
      return 'private';
    }
    
    // Return public by default
    return 'public';
  } catch (error) {
    console.error(`Error parsing metadata for tribe ${tribe.id}:`, error);
    return 'public';
  }
}

/**
 * Extract topics from tribe metadata
 * @param tribe The tribe object
 * @returns Array of topics
 */
export function getTribeTopics(tribe: Tribe): Array<{id: string, name: string, postCount?: number}> {
  if (!tribe) return [];
  
  try {
    // Check for direct topics property
    const tribeAny = tribe as any;
    if (Array.isArray(tribeAny.topics)) {
      return tribeAny.topics.map((topic: any, index: number) => ({
        id: topic.id || `topic-${index}`,
        name: topic.name || `Topic ${index + 1}`,
        postCount: topic.postCount || 0
      }));
    }
    
    // Try to parse metadata if it's a string
    let metadata: any = null;
    if (typeof tribe.metadata === 'string' && tribe.metadata.trim() !== '') {
      try {
        metadata = JSON.parse(tribe.metadata);
      } catch (parseError) {
        console.error(`Error parsing metadata JSON for tribe ${tribe.id}:`, parseError);
      }
    } else if (typeof tribe.metadata === 'object' && tribe.metadata !== null) {
      metadata = tribe.metadata;
    }
    
    // Check if topics array exists in metadata
    if (Array.isArray(metadata?.topics)) {
      return metadata.topics.map((topic: any, index: number) => ({
        id: topic.id || `topic-${index}`,
        name: topic.name || `Topic ${index + 1}`,
        postCount: topic.postCount || 0
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error parsing metadata for tribe ${tribe.id}:`, error);
    return [];
  }
}

/**
 * Extract description from tribe metadata
 * @param tribe The tribe object
 * @returns The description
 */
export function getTribeDescription(tribe: Tribe): string {
  if (!tribe) return '';
  
  try {
    // Check for direct description property
    const tribeAny = tribe as any;
    if (tribeAny.description && typeof tribeAny.description === 'string') {
      return tribeAny.description;
    }
    
    // Try to parse metadata if it's a string
    let metadata: any = null;
    if (typeof tribe.metadata === 'string' && tribe.metadata.trim() !== '') {
      try {
        metadata = JSON.parse(tribe.metadata);
      } catch (parseError) {
        console.error(`Error parsing metadata JSON for tribe ${tribe.id}:`, parseError);
      }
    } else if (typeof tribe.metadata === 'object' && tribe.metadata !== null) {
      metadata = tribe.metadata;
    }
    
    // Check if description exists in metadata
    if (metadata?.description && typeof metadata.description === 'string') {
      return metadata.description;
    }
    
    return '';
  } catch (error) {
    console.error(`Error parsing metadata for tribe ${tribe.id}:`, error);
    return '';
  }
}

/**
 * Extract cover image URL from tribe metadata
 * @param tribe The tribe object
 * @param defaultCover Optional default cover image URL
 * @returns The cover image URL
 */
export function getTribeCoverImage(tribe: Tribe, defaultCover: string = '/images/default-cover.png'): string {
  if (!tribe) return defaultCover;
  
  try {
    // Check for direct coverImage property
    const tribeAny = tribe as any;
    if (tribeAny.coverImage && typeof tribeAny.coverImage === 'string' && tribeAny.coverImage.trim() !== '') {
      return tribeAny.coverImage;
    }
    
    // Try to parse metadata if it's a string
    let metadata: any = null;
    if (typeof tribe.metadata === 'string' && tribe.metadata.trim() !== '') {
      try {
        metadata = JSON.parse(tribe.metadata);
      } catch (parseError) {
        console.error(`Error parsing metadata JSON for tribe ${tribe.id}:`, parseError);
      }
    } else if (typeof tribe.metadata === 'object' && tribe.metadata !== null) {
      metadata = tribe.metadata;
    }
    
    // Check if coverImage exists in metadata and is not empty
    if (metadata?.coverImage && typeof metadata.coverImage === 'string' && metadata.coverImage.trim() !== '') {
      return metadata.coverImage;
    }
    
    return defaultCover;
  } catch (error) {
    console.error(`Error parsing metadata for tribe ${tribe.id}:`, error);
    return defaultCover;
  }
}

/**
 * Get user membership status for the tribe
 * @param tribe The tribe object
 * @returns Object with membership status flags
 */
export function getTribeMembershipStatus(tribe: Tribe): { isMember: boolean, isPending: boolean, isAdmin: boolean } {
  if (!tribe) return { isMember: false, isPending: false, isAdmin: false };
  
  try {
    // Check if tribe has direct membership status properties
    const tribeAny = tribe as any;
    
    if (tribeAny.userMembershipStatus) {
      return {
        isMember: Boolean(tribeAny.userMembershipStatus.isMember),
        isPending: Boolean(tribeAny.userMembershipStatus.isPending),
        isAdmin: Boolean(tribeAny.userMembershipStatus.isAdmin)
      };
    }
    
    // Try to parse metadata for membership status
    let metadata: any = null;
    if (typeof tribe.metadata === 'string' && tribe.metadata.trim() !== '') {
      try {
        metadata = JSON.parse(tribe.metadata);
      } catch (parseError) {
        console.error(`Error parsing metadata JSON for tribe ${tribe.id}:`, parseError);
      }
    } else if (typeof tribe.metadata === 'object' && tribe.metadata !== null) {
      metadata = tribe.metadata;
    }
    
    if (metadata?.userMembershipStatus) {
      return {
        isMember: Boolean(metadata.userMembershipStatus.isMember),
        isPending: Boolean(metadata.userMembershipStatus.isPending),
        isAdmin: Boolean(metadata.userMembershipStatus.isAdmin)
      };
    }
    
    // Check for individual properties in the tribe object
    return {
      isMember: Boolean(tribeAny.isMember),
      isPending: Boolean(tribeAny.isPending),
      isAdmin: Boolean(tribeAny.isAdmin || tribe.admins?.includes(tribeAny.currentUser))
    };
  } catch (error) {
    console.error(`Error getting membership status for tribe ${tribe.id}:`, error);
    return { isMember: false, isPending: false, isAdmin: false };
  }
}

// Error types for tribe operations
export enum ErrorType {
  UNAUTHORIZED = 'unauthorized',
  COOLDOWN_ACTIVE = 'cooldown_active',
  NOT_FOUND = 'not_found',
  CONTRACT_ERROR = 'contract_error',
  UNKNOWN = 'unknown'
}

// Add the TribesHelper class
export class TribesHelper {
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

  // Implement required methods with mock functionality
  async createPost(tribeId: number, metadata: string, isGated: boolean = false, 
                  collectibleContract: string = '0x0000000000000000000000000000000000000000', 
                  collectibleId: number = 0): Promise<number> {
    return 1; // Mock post ID
  }

  async getPost(postId: number): Promise<any> {
    return {
      id: postId,
      creator: this.userAddress || '0x0',
      tribeId: 1,
      metadata: '{}',
      isGated: false,
      collectibleContract: '0x0000000000000000000000000000000000000000',
      collectibleId: 0,
      isEncrypted: false,
      accessSigner: '0x0000000000000000000000000000000000000000'
    };
  }

  async getPostsByTribe(tribeId: number, offset: number = 0, limit: number = 10): Promise<any> {
    return { postIds: [1, 2, 3], total: 3 };
  }

  async getPostsByUser(userAddress: string, offset: number = 0, limit: number = 10): Promise<any> {
    return { postIds: [1, 2], total: 2 };
  }

  async canViewPost(postId: number, viewer: string): Promise<boolean> {
    return true;
  }

  async interactWithPost(postId: number, interactionType: number): Promise<void> {}

  async getInteractionCount(postId: number, interactionType: number): Promise<number> {
    return 0;
  }
} 