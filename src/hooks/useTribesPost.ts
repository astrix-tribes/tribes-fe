import { useState, useCallback } from 'react';
import { useChainId, useWalletClient } from 'wagmi';
import { ZeroAddress } from '../constants/common';
import { ErrorType, TribesHelper } from '../utils/tribeHelpers';

interface PostData {
  id: number;
  creator: string;
  tribeId: number;
  metadata: string;
  isGated: boolean;
  collectibleContract: string;
  collectibleId: number;
  isEncrypted: boolean;
  accessSigner: string;
}

interface PostsPage {
  postIds: number[];
  total: number;
  posts: PostData[];
}

interface TribesPostHookResult {
  // Post data
  currentPost: PostData | null;
  postsPage: PostsPage | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createPost: (
    tribeId: number,
    metadata: string,
    isGated?: boolean,
    collectibleContract?: string,
    collectibleId?: number
  ) => Promise<number>;
  
  getPost: (postId: number) => Promise<PostData>;
  getPostsByTribe: (tribeId: number, offset?: number, limit?: number) => Promise<PostsPage>;
  getPostsByUser: (userAddress: string, offset?: number, limit?: number) => Promise<PostsPage>;
  canViewPost: (postId: number, viewer: string) => Promise<boolean>;
  interactWithPost: (postId: number, interactionType: number) => Promise<void>;
  getInteractionCount: (postId: number, interactionType: number) => Promise<number>;
}

/**
 * Interaction types for posts
 */
export enum PostInteractionType {
  LIKE = 0,
  SAVE = 1,
  SHARE = 2,
  REPORT = 3
}

/**
 * Hook for managing posts via TribesHelper
 */
export function useTribesPost(): TribesPostHookResult {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  
  const [currentPost, setCurrentPost] = useState<PostData | null>(null);
  const [postsPage, setPostsPage] = useState<PostsPage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize TribesHelper instance
  const tribesHelper = new TribesHelper(chainId || 1); // fallback to mainnet
  
  // Connect wallet to helper when wallet client is available
  const connectWallet = useCallback(async () => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    
    const [address] = await walletClient.getAddresses();
    await tribesHelper.connect(walletClient, address);
  }, [walletClient, tribesHelper]);
  
  /**
   * Create a new post
   */
  const createPost = useCallback(async (
    tribeId: number,
    metadata: string,
    isGated: boolean = false,
    collectibleContract: string = ZeroAddress,
    collectibleId: number = 0
  ): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await connectWallet();
      
      // Create post
      const postId = await tribesHelper.createPost(
        tribeId,
        metadata,
        isGated,
        collectibleContract,
        collectibleId
      );
      
      // Get the created post
      const postData = await tribesHelper.getPost(postId);
      setCurrentPost({
        id: postData.id,
        creator: postData.creator,
        tribeId: postData.tribeId,
        metadata: postData.metadata,
        isGated: postData.isGated,
        collectibleContract: postData.collectibleContract,
        collectibleId: postData.collectibleId,
        isEncrypted: postData.isEncrypted,
        accessSigner: postData.accessSigner
      });
      
      return postId;
    } catch (err: any) {
      const errorMessage = 
        err.type === ErrorType.UNAUTHORIZED ? 'You must be a tribe member to create a post' :
        err.type === ErrorType.COOLDOWN_ACTIVE ? 'Please wait before creating another post' :
        'Failed to create post';
      
      setError(errorMessage);
      console.error('Error creating post:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tribesHelper, connectWallet]);
  
  /**
   * Get a post by ID
   */
  const getPost = useCallback(async (postId: number): Promise<PostData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get post
      const postData = await tribesHelper.getPost(postId);
      
      const post = {
        id: postData.id,
        creator: postData.creator,
        tribeId: postData.tribeId,
        metadata: postData.metadata,
        isGated: postData.isGated,
        collectibleContract: postData.collectibleContract,
        collectibleId: postData.collectibleId,
        isEncrypted: postData.isEncrypted,
        accessSigner: postData.accessSigner
      };
      
      setCurrentPost(post);
      return post;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get post';
      setError(errorMessage);
      console.error('Error getting post:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tribesHelper]);
  
  /**
   * Get posts by tribe
   */
  const getPostsByTribe = useCallback(async (
    tribeId: number,
    offset: number = 0,
    limit: number = 10
  ): Promise<PostsPage> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get posts by tribe
      const result = await tribesHelper.getPostsByTribe(tribeId, offset, limit);
      
      // For each post ID, get the full post data
      const posts: PostData[] = [];
      for (const postId of result.postIds) {
        try {
          const postData = await tribesHelper.getPost(postId);
          posts.push({
            id: postData.id,
            creator: postData.creator,
            tribeId: postData.tribeId,
            metadata: postData.metadata,
            isGated: postData.isGated,
            collectibleContract: postData.collectibleContract,
            collectibleId: postData.collectibleId,
            isEncrypted: postData.isEncrypted,
            accessSigner: postData.accessSigner
          });
        } catch (error) {
          console.error(`Error fetching post ${postId}:`, error);
        }
      }
      
      const page = {
        postIds: result.postIds,
        total: result.total,
        posts
      };
      
      setPostsPage(page);
      return page;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get posts by tribe';
      setError(errorMessage);
      console.error('Error getting posts by tribe:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tribesHelper]);
  
  /**
   * Get posts by user
   */
  const getPostsByUser = useCallback(async (
    userAddress: string,
    offset: number = 0,
    limit: number = 10
  ): Promise<PostsPage> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get posts by user
      const result = await tribesHelper.getPostsByUser(userAddress, offset, limit);
      
      // For each post ID, get the full post data
      const posts: PostData[] = [];
      for (const postId of result.postIds) {
        try {
          const postData = await tribesHelper.getPost(postId);
          posts.push({
            id: postData.id,
            creator: postData.creator,
            tribeId: postData.tribeId,
            metadata: postData.metadata,
            isGated: postData.isGated,
            collectibleContract: postData.collectibleContract,
            collectibleId: postData.collectibleId,
            isEncrypted: postData.isEncrypted,
            accessSigner: postData.accessSigner
          });
        } catch (error) {
          console.error(`Error fetching post ${postId}:`, error);
        }
      }
      
      const page = {
        postIds: result.postIds,
        total: result.total,
        posts
      };
      
      setPostsPage(page);
      return page;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get posts by user';
      setError(errorMessage);
      console.error('Error getting posts by user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tribesHelper]);
  
  /**
   * Check if a user can view a post
   */
  const canViewPost = useCallback(async (
    postId: number,
    viewer: string
  ): Promise<boolean> => {
    try {
      return await tribesHelper.canViewPost(postId, viewer);
    } catch (err: any) {
      console.error('Error checking post access:', err);
      return false;
    }
  }, [tribesHelper]);
  
  /**
   * Interact with a post (like, save, etc.)
   */
  const interactWithPost = useCallback(async (
    postId: number,
    interactionType: number
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await connectWallet();
      
      // Interact with post
      await tribesHelper.interactWithPost(postId, interactionType);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to interact with post';
      setError(errorMessage);
      console.error('Error interacting with post:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tribesHelper, connectWallet]);
  
  /**
   * Get interaction count for a post
   */
  const getInteractionCount = useCallback(async (
    postId: number,
    interactionType: number
  ): Promise<number> => {
    try {
      return await tribesHelper.getInteractionCount(postId, interactionType);
    } catch (err: any) {
      console.error('Error getting interaction count:', err);
      return 0;
    }
  }, [tribesHelper]);
  
  return {
    currentPost,
    postsPage,
    isLoading,
    error,
    createPost,
    getPost,
    getPostsByTribe,
    getPostsByUser,
    canViewPost,
    interactWithPost,
    getInteractionCount
  };
} 