/**
 * Type mapping utilities
 * 
 * These utilities help convert between different versions of the same types 
 * to maintain compatibility during the transition to the new architecture.
 */

import { 
  Post, 
  PostType, 
  PostStats, 
  PostWithMetadata,
  PostMetadata 
} from '../types/post';
import { Tribe, TribeData, NFTRequirement } from '../types/tribe';
import { User, ProfileData } from '../types/user';
import { PostInteractions } from '../types/interaction';

/**
 * Convert blockchain post data to UI-ready post
 * @param postData Raw post data from blockchain
 * @returns Formatted post for UI display
 */
export function mapPostDataToUI(postData: any): Post {
  // Format the post metadata into content
  const content = postData.metadata?.content || '';
  
  // Calculate or provide default stats
  const interactions = postData.interactions || {
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    engagement: 0
  };
  
  // Map stats from interactions
  const stats: PostStats = {
    likeCount: interactions.likes,
    commentCount: interactions.comments,
    shareCount: interactions.shares,
    viewCount: interactions.views,
    saveCount: 0
  };
  
  // Create the metadata object if needed
  const metadata: PostMetadata | undefined = postData.metadata ? {
    type: postData.metadata.type || PostType.TEXT,
    content: content,
    title: postData.metadata.title,
    createdAt: typeof postData.createdAt === 'string' ? 
      postData.createdAt : 
      new Date(postData.createdAt || Date.now()).toISOString()
  } : undefined;
  
  // Ensure author has 0x prefix
  const authorAddress = postData.creator || postData.author || '0x0000000000000000000000000000000000000000';
  const formattedAuthor = authorAddress.startsWith('0x') ? 
    authorAddress as `0x${string}` : 
    `0x${authorAddress}` as `0x${string}`;
  
  // Return the formatted post that matches the Post interface
  const mappedPost: Post = {
    id: postData.id.toString(),
    content,
    author: formattedAuthor,
    tribeId: Number(postData.tribeId),
    createdAt: typeof postData.createdAt === 'string' 
      ? Math.floor(new Date(postData.createdAt).getTime() / 1000) 
      : (postData.createdAt || Math.floor(Date.now() / 1000)),
    type: postData.metadata?.type || PostType.TEXT,
    stats,
    metadata
  };
  
  return mappedPost;
}

// /**
//  * Convert UI post to blockchain format
//  * @param post UI post
//  * @returns Post in blockchain format
//  */
// export function mapUIPostToBlockchain(post: Post): PostWithMetadata {
//   // Create post metadata
//   const metadata: PostMetadata = {
//     type: post.type,
//     content: post.content,
//     title: post.title,
//     createdAt: post.createdAt,
//     media: post.mediaUrls?.map(url => ({
//       url,
//       type: url.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
//     }))
//   };
  
//   // Create interactions
//   const interactions: PostInteractions = {
//     likes: post.stats?.likeCount || 0,
//     comments: post.stats?.commentCount || 0,
//     shares: post.stats?.shareCount || 0,
//     views: post.stats?.viewCount || 0,
//     engagement: 0
//   };
  
//   // Return the blockchain format
//   return {
//     id: parseInt(post.id),
//     creator: typeof post.author === 'string' ? post.author : post.author.id,
//     tribeId: parseInt(post.tribeId),
//     parentId: post.parentId ? parseInt(post.parentId) : null,
//     metadata,
//     isGated: post.isGated || false,
//     collectibleContract: '0x0000000000000000000000000000000000000000',
//     collectibleId: 0,
//     createdAt: post.createdAt,
//     interactions
//   };
// }

/**
 * Convert blockchain tribe data to UI format
 * @param tribeData Tribe data from blockchain
 * @param chainId Chain ID
 * @returns UI-formatted tribe
 */
export function mapTribeDataToUI(tribeData: TribeData, chainId: number): Tribe {
  console.log('Original tribeData before mapping:', JSON.stringify({
    ...tribeData,
    entryFee: tribeData.entryFee?.toString() || '0'
  }));
  
  // Parse metadata if it's a string
  let metadataObj: any = {};
  if (typeof tribeData.metadata === 'string' && tribeData.metadata) {
    try {
      metadataObj = JSON.parse(tribeData.metadata);
      console.log('Successfully parsed metadata string for tribe', tribeData.id, ':', metadataObj);
    } catch (error) {
      console.error(`Failed to parse tribe ${tribeData.id} metadata:`, error);
    }
  } else if (typeof tribeData.metadata === 'object' && tribeData.metadata !== null) {
    metadataObj = tribeData.metadata;
    console.log('Using metadata object directly for tribe', tribeData.id, ':', metadataObj);
  }
  
  // Get basic properties with improved name handling
  const contractName = tribeData.name || '';
  const metadataName = metadataObj?.name || metadataObj?.displayName || '';
  const tribeId = tribeData.id.toString();
  
  // Log all possible name sources for debugging
  console.log(`Tribe ${tribeId} name sources:`, {
    contractName,
    metadataName,
    rawMetadataString: typeof tribeData.metadata === 'string' ? 
      (tribeData.metadata.length > 100 ? `${tribeData.metadata.substring(0, 100)}...` : tribeData.metadata) : 
      'Not a string'
  });
  
  // Determine the best name to use with detailed logging
  let name: string;
  
  // Check if contract name is meaningful (not empty and not a generic "Tribe X" format)
  const isGenericContractName = !contractName || 
    contractName === `Tribe ${tribeId}` || 
    contractName.trim() === '';
  
  // Check if metadata name is meaningful
  const hasMetadataName = metadataName && metadataName.trim() !== '';
  
  if (!isGenericContractName) {
    // Use contract name if it's meaningful
    name = contractName.trim();
    console.log(`Using contract name for tribe ${tribeId}: "${name}"`);
  } else if (hasMetadataName) {
    // Use metadata name if contract name is generic but metadata name exists
    name = metadataName.trim();
    console.log(`Using metadata name for tribe ${tribeId}: "${name}"`);
  } else {
    // Use a better default format if neither is available
    name = `Tribe #${tribeId}`;
    console.log(`Using default name for tribe ${tribeId}: "${name}"`);
  }
  
  // Determine creation time - try to use value from metadata if available
  let createdAt: number;
  if (metadataObj?.createdAt) {
    try {
      // Try to parse the createdAt from metadata (could be string date or timestamp)
      if (typeof metadataObj.createdAt === 'string') {
        createdAt = Math.floor(new Date(metadataObj.createdAt).getTime() / 1000);
      } else {
        createdAt = Number(metadataObj.createdAt);
      }
    } catch (e) {
      createdAt = tribeData.createdAt || Math.floor(Date.now() / 1000);
    }
  } else {
    createdAt = tribeData.createdAt || Math.floor(Date.now() / 1000);
  }
  
  // Get membership status
  const isMember = tribeData.userMembershipStatus?.isMember || false;
  const isAdmin = tribeData.userMembershipStatus?.isAdmin || false;
  
  // Process NFT requirements
  const nftRequirements: NFTRequirement[] = tribeData.nftRequirements || [];
  
  // Convert entry fee to bigint
  let entryFee: bigint;
  try {
    if (typeof tribeData.entryFee === 'bigint') {
      entryFee = tribeData.entryFee;
    } else if (typeof tribeData.entryFee === 'string') {
      entryFee = BigInt(tribeData.entryFee);
    } else if (typeof tribeData.entryFee === 'number') {
      entryFee = BigInt(tribeData.entryFee);
    } else {
      entryFee = BigInt(0);
    }
  } catch (e) {
    console.error('Error converting entryFee to bigint:', e);
    entryFee = BigInt(0);
  }

  // Create the UI tribe object
  return {
    id: tribeId,
    name,
    metadata: typeof tribeData.metadata === 'string' ? tribeData.metadata : JSON.stringify(metadataObj),
    owner: tribeData.owner,
    admins: tribeData.admins || [],
    memberCount: tribeData.memberCount,
    createdAt,
    joinType: tribeData.joinType,
    entryFee,
    nftRequirements
  };
}

// /**
//  * Convert profile data to user format
//  * @param profile Profile data
//  * @returns User data
//  */
// export function mapProfileToUser(profile: ProfileData): User {
//   return {
//     id: profile.id.toString(),
//     username: profile.username,
//     address: profile.walletAddress,
//     avatar: profile.avatar || '',
//     bio: profile.metadata?.bio || '',
//     website: profile.metadata?.website,
//     twitter: profile.metadata?.twitter,
//     createdAt: profile.createdAt,
//     isVerified: false,
//     postCount: 0,
//     followerCount: 0,
//     followingCount: 0
//   };
// } 