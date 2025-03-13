import { Post, PostType, PostMetadata } from '../types/post';
import { blockchain } from './blockchainUtils';
import { keccak256, encodeAbiParameters } from 'viem';
import { EventDetails } from '../types/event';

// Interface for post creation parameters
export interface PostCreateParams {
  title?: string;
  content: string;
  type: string;
  tags?: string[];
  eventDetails?: EventDetails;
  pollDetails?: any;
  projectDetails?: any;
  resourceDetails?: any;
  mediaContent?: any;
  isPremium?: boolean;
}

// This function creates a post on the blockchain
export const createBlockchainPost = async (
  params: PostCreateParams & { tribeId: string }
): Promise<{ hash: `0x${string}`; postId: string }> => {
  try {
    // First, prepare the post metadata for blockchain storage
    const metadata = JSON.stringify(preparePostMetadata(params));
    console.log(`[createBlockchainPost]: metadata: ${metadata}`);
    
    // Use blockchain utility to send the transaction
    const tribeId = parseInt(params.tribeId);
    console.log(`[createBlockchainPost]: tribeId: ${tribeId}`);
    
    // Call the postMinter contract's createPost function
    const hash = await blockchain.createTribePost({
      tribeId,
      metadata, // Now we pass metadata as a JSON string
      postType: params.type, 
      content: params.content,
      // No longer need options since we're using the postMinter contract
    });

    console.log(`[createBlockchainPost]: Post created with hash: ${hash}`);
    // Generate a temporary post ID until we get the real one from event
    const tempPostId = `post-${Date.now()}`;
    
    return { hash, postId: tempPostId };
  } catch (error) {
    console.error('Error creating blockchain post:', error);
    throw error;
  }
};

// Prepare metadata based on post type
const preparePostMetadata = (params: PostCreateParams): Record<string, any> => {
  const baseMetadata = {
    title: params.title || '',
    content: params.content,
    type: params.type,
    tags: params.tags || [],
    createdAt: new Date().toISOString(),
  };
  
  switch (params.type) {
    case 'EVENT':
      return {
        ...baseMetadata,
        eventDetails: params.eventDetails,
        // For backward compatibility
        event: {
          title: params.title || '',
          startDate: params.eventDetails?.startDate,
          endDate: params.eventDetails?.endDate,
          location: params.eventDetails?.location
        }
      };
      
    case 'POLL':
      return {
        ...baseMetadata,
        pollDetails: params.pollDetails
      };
      
    case 'PROJECT':
      return {
        ...baseMetadata,
        projectDetails: params.projectDetails
      };
      
    case 'RESOURCE':
      return {
        ...baseMetadata,
        resourceDetails: params.resourceDetails
      };
      
    case 'RICH_MEDIA':
      return {
        ...baseMetadata,
        mediaContent: params.mediaContent
      };
      
    case 'COMMUNITY_UPDATE':
      return {
        ...baseMetadata,
        isPremium: params.isPremium || false
      };
      
    default:
      return baseMetadata;
  }
};

// Get specific options needed based on post type
const getPostTypeSpecificOptions = (params: PostCreateParams): Record<string, any> => {
  switch (params.type) {
    case 'POLL':
      return {
        options: params.pollDetails?.options?.map((opt: { text: string }) => opt.text) || [],
        endDate: params.pollDetails?.endDate ? new Date(params.pollDetails.endDate).getTime() / 1000 : 0,
        allowMultiple: params.pollDetails?.allowMultipleChoices || false
      };
      
    case 'EVENT':
      return {
        startTime: params.eventDetails?.startDate ? new Date(params.eventDetails.startDate).getTime() / 1000 : 0,
        endTime: params.eventDetails?.endDate ? new Date(params.eventDetails.endDate).getTime() / 1000 : 0,
        maxAttendees: params.eventDetails?.maxAttendees || 0,
        location: encodeEventLocation(params.eventDetails?.location)
      };
      
    case 'PROJECT':
      return {
        status: encodeProjectStatus(params.projectDetails?.status),
        budget: params.projectDetails?.budget || '0'
      };
      
    default:
      return {};
  }
};

// Helper function to encode event location for blockchain
const encodeEventLocation = (location: any): string => {
  if (!location) return '';
  
  const locationData = {
    type: location.type || 'PHYSICAL',
    physical: location.physical || '',
    virtual: location.virtual || ''
  };
  
  return JSON.stringify(locationData);
};

// Helper function to encode project status for blockchain
const encodeProjectStatus = (status?: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED'): number => {
  switch (status) {
    case 'PLANNING': return 0;
    case 'IN_PROGRESS': return 1;
    case 'COMPLETED': return 2;
    default: return 0;
  }
};

// Function to decode post data from blockchain
export const decodeBlockchainPost = (
  blockchainData: any,
  tribeId: string
): Post => {
  try {
    // Parse metadata from blockchain
    const parsedMetadata = typeof blockchainData.metadata === 'string' 
      ? JSON.parse(blockchainData.metadata) 
      : blockchainData.metadata;
    
    // Ensure metadata has all required properties
    const metadata: PostMetadata = {
      type: blockchainData.postType,
      content: blockchainData.content,
      createdAt: new Date(blockchainData.timestamp * 1000).toISOString(),
      ...parsedMetadata
    };
    
    return {
      id: blockchainData.id || `post-${Date.now()}`,
      author: blockchainData.author,
      content: blockchainData.content,
      type: blockchainData.postType,
      createdAt: blockchainData.timestamp * 1000,
      likes: blockchainData.likes || 0,
      comments: blockchainData.comments || 0,
      shares: blockchainData.shares || 0,
      tribeId: parseInt(tribeId),
      metadata: metadata,
      stats: {
        views: blockchainData.views || 0,
        engagement: blockchainData.engagement || 0
      }
    };
  } catch (error) {
    console.error('Error decoding blockchain post:', error);
    throw error;
  }
};

// Get post by ID from blockchain
export const getBlockchainPost = async (
  tribeId: number,
  postId: string
): Promise<Post | null> => {
  try {
    const blockchainData = await blockchain.getTribePost(tribeId, postId);
    if (!blockchainData) return null;
    
    return decodeBlockchainPost(blockchainData, tribeId.toString());
  } catch (error) {
    console.error('Error getting blockchain post:', error);
    return null;
  }
};

// Vote on a poll post
export const voteOnPoll = async (
  tribeId: number,
  postId: string,
  optionIndex: number
): Promise<`0x${string}`> => {
  try {
    return await blockchain.voteOnPoll(tribeId, postId, optionIndex);
  } catch (error) {
    console.error('Error voting on poll:', error);
    throw error;
  }
};

// RSVP to an event
export const rsvpToEvent = async (
  tribeId: number,
  postId: string,
  attending: boolean
): Promise<`0x${string}`> => {
  try {
    return await blockchain.rsvpToEvent(tribeId, postId, attending);
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (
  tribeId: number,
  postId: string
): Promise<`0x${string}`> => {
  try {
    return await blockchain.likePost(tribeId, postId);
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Add comment to a post
// export const commentOnPost = async (
//   tribeId: number,
//   postId: string,
//   comment: string
// ): Promise<`0x${string}`> => {
//   try {
//     return await blockchain.commentOnPost(tribeId, postId, comment);
//   } catch (error) {
//     console.error('Error commenting on post:', error);
//     throw error;
//   }
// };

// Update post metadata (for editing posts)
// export const updatePostMetadata = async (
//   tribeId: number,
//   postId: string,
//   metadata: Record<string, any>
// ): Promise<`0x${string}`> => {
//   try {
//     return await blockchain.updatePostMetadata(tribeId, postId, JSON.stringify(metadata));
//   } catch (error) {
//     console.error('Error updating post metadata:', error);
//     throw error;
//   }
// }; 