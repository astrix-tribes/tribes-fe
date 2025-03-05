/**
 * Interface for Post-related services
 */
import { 
  PostWithMetadata, 
  Post, 
  BatchPostData,
  CreatePostInput,
  CreateReplyInput,
  CreateEncryptedPostInput,
  UpdatePostInput,
  PostMetadata
} from '../../types/post';
import { InteractionType } from '../../types/interaction';

export interface IPostService {
  /**
   * Create a new post
   * @param post Post data with metadata
   * @returns Created post with metadata
   */
  createPost(post: CreatePostInput): Promise<PostWithMetadata>;

  /**
   * Get post by ID
   * @param postId Post ID
   * @returns Post with metadata
   */
  getPost(postId: number): Promise<PostWithMetadata>;

  /**
   * Get posts by tribe ID
   * @param tribeId Tribe ID
   * @param offset Pagination offset
   * @param limit Pagination limit
   * @returns Array of posts with metadata
   */
  getPostsByTribe(tribeId: string, offset?: number, limit?: number): Promise<PostWithMetadata[]>;

  /**
   * Get posts by user address
   * @param userAddress User address
   * @param offset Pagination offset
   * @param limit Pagination limit
   * @returns Array of posts with metadata
   */
  getPostsByUser(userAddress: string, offset?: number, limit?: number): Promise<PostWithMetadata[]>;

  /**
   * Check if a user can view a post
   * @param postId Post ID
   * @param viewer Viewer address
   * @returns Whether the user can view the post
   */
  canViewPost(postId: number, viewer: string): Promise<boolean>;

  /**
   * Interact with a post
   * @param postId Post ID
   * @param interactionType Interaction type
   * @returns Promise resolving when the interaction is complete
   */
  interactWithPost(postId: number, interactionType: InteractionType): Promise<void>;

  /**
   * Get interaction count for a post
   * @param postId Post ID
   * @param interactionType Interaction type
   * @returns Interaction count
   */
  getInteractionCount(postId: number, interactionType: number): Promise<number>;

  /**
   * Create multiple posts in a batch
   * @param tribeId Tribe ID
   * @param posts Array of post data
   * @returns Array of created post IDs
   */
  createBatchPosts(tribeId: number, posts: BatchPostData[]): Promise<number[]>;

  /**
   * Create a reply to a post
   * @param parentPostId Parent post ID
   * @param metadata Reply metadata
   * @param isGated Whether the reply is gated
   * @param collectibleContract Collectible contract address for gating
   * @param collectibleId Collectible ID for gating
   * @returns Created reply post ID
   */
  createReply(
    parentPostId: number,
    metadata: string,
    isGated?: boolean,
    collectibleContract?: string,
    collectibleId?: number
  ): Promise<number>;

  /**
   * Create an encrypted post
   * @param tribeId Tribe ID
   * @param metadata Post metadata
   * @param encryptionKeyHash Hash of the encryption key
   * @param accessSigner Signer address for access control
   * @returns Created post ID
   */
  createEncryptedPost(
    tribeId: number,
    metadata: string,
    encryptionKeyHash: string,
    accessSigner: string
  ): Promise<number>;

  /**
   * Delete a post
   * @param id Post ID
   * @returns Whether the deletion was successful
   */
  deletePost(id: number): Promise<boolean>;

  /**
   * Report a post
   * @param postId Post ID
   * @param reason Reason for reporting
   */
  reportPost(postId: number, reason: string): Promise<void>;

  /**
   * Get post with metadata
   * @param postId Post ID
   * @returns Post with metadata
   */
  getPostWithMetadata(postId: number): Promise<PostWithMetadata>;

  /**
   * Get replies to a post
   * @param postId Post ID
   * @returns Array of reply post IDs
   */
  getPostReplies(postId: number): Promise<number[]>;

  /**
   * Get decryption key for an encrypted post
   * @param postId Post ID
   * @param viewer Viewer address
   * @returns Decryption key
   */
  getPostDecryptionKey(postId: number, viewer: string): Promise<string>;

  /**
   * Map post data to UI format
   * @param postData Post data from blockchain
   * @returns Formatted post data
   */
  mapPostDataToUIFormat(postData: PostWithMetadata): Promise<Post>;

  /**
   * Update a post
   * @param postId Post ID
   * @param metadata New post metadata
   * @returns Updated post
   */
  updatePost(postId: number, metadata: PostMetadata): Promise<PostWithMetadata>;

  /**
   * Like a post
   * @param id Post ID
   * @returns Whether the like was successful
   */
  likePost(id: number): Promise<boolean>;

  /**
   * Comment on a post
   * @param id Post ID
   * @param comment Comment content
   * @returns Whether the comment was successful
   */
  commentPost(id: number, comment: string): Promise<boolean>;

  /**
   * Share a post
   * @param id Post ID
   * @returns Whether the share was successful
   */
  sharePost(id: number): Promise<boolean>;
} 