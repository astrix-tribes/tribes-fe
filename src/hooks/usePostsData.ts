import { useState, useEffect, useCallback, useRef } from 'react';
import { Post } from '../types/post';
import { PostsService } from '../services/posts.service';
import { getPostsService as getPostsServiceFromIndex } from '../services/index';

// Define the sync status type
interface SyncStatus {
  isSyncing: boolean;
  progress: number;
  total: number;
  lastSyncTime: number;
  errorCount: number;
}

export interface PostsDataHookResult {
  posts: Post[];
  postsByTribe: Record<string, Post[]>;
  postsById: Record<string, Post>;
  isLoading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  getPostById: (postId: string) => Promise<Post | null>;
  getPostsByTribe: (tribeId: string, limit?: number, offset?: number) => Promise<Post[]>;
  refreshPost: (postId: string) => Promise<Post | null>;
  refreshTribePosts: (tribeId: string) => Promise<void>;
}

export function usePostsData(): PostsDataHookResult {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsById, setPostsById] = useState<Record<string, Post>>({});
  const [postsByTribe, setPostsByTribe] = useState<Record<string, Post[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    progress: 0,
    total: 0,
    lastSyncTime: 0,
    errorCount: 0
  });
  
  const postsServiceRef = useRef<PostsService | null>(null);
  
  // Initialize the posts service
  useEffect(() => {
    console.log("Initializing posts service");
    if (!postsServiceRef.current) {
      postsServiceRef.current = getPostsServiceFromIndex();
    }
    
    // Set up sync listener - match the expected signature from the service
    const service = postsServiceRef.current;
    if (!service) {
      console.error("Failed to initialize posts service");
      return () => {};
    }
    
    const cleanupFunction = service.addSyncListener(function syncListener() {
      // Get the current status from the service
      const currentStatus = service.getSyncStatus() || {
        isSyncing: false,
        progress: 0,
        total: 0,
        lastSyncTime: 0,
        errorCount: 0
      };
      
      setSyncStatus(currentStatus);
    });
    
    // Initial status update
    setSyncStatus(service.getSyncStatus());
    
    return () => {
      cleanupFunction();
    };
  }, []); // Empty dependency array to prevent infinite loop
  
  // Get the posts service instance, initializing if needed
  const getLocalPostsService = useCallback((): PostsService | null => {
    if (!postsServiceRef.current) {
      postsServiceRef.current = getPostsServiceFromIndex();
    }
    return postsServiceRef.current;
  }, []);

  // Get a post by ID
  const getPostById = useCallback(async (postId: string): Promise<Post | null> => {
    try {
      if (!postId) {
        console.warn("getPostById called with invalid postId");
        return null;
      }
      
      const service = getLocalPostsService();
      if (!service) {
        throw new Error("Posts service not initialized");
      }
      
      const post = await service.getPost(postId);
      
      if (post) {
        // Update state
        setPostsById(prev => ({
          ...prev,
          [postId]: post
        }));
        
        return post;
      }
      
      return null;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Error fetching post:", errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [getLocalPostsService]);

  // Get posts by tribe ID
  const getPostsByTribe = useCallback(async (tribeId: string, limit?: number, offset?: number): Promise<Post[]> => {
    try {
      if (!tribeId) {
        console.warn("getPostsByTribe called with invalid tribeId");
        return [];
      }
      
      setIsLoading(true);
      
      const service = getLocalPostsService();
      if (!service) {
        throw new Error("Posts service not initialized");
      }
      
      const tribePosts = await service.getPostsByTribe(tribeId, limit, offset);
      
      // Update state
      setPostsByTribe(prev => ({
        ...prev,
        [tribeId]: tribePosts
      }));
      
      // Update postsById for quick lookup
      const newPostsById = { ...postsById };
      tribePosts.forEach((post: Post) => {
        newPostsById[post.id] = post;
      });
      
      setPostsById(newPostsById);
      
      return tribePosts;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Error fetching tribe posts:", errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [postsById, getLocalPostsService]);

  // Refresh a post by ID
  const refreshPost = useCallback(async (postId: string): Promise<Post | null> => {
    try {
      if (!postId) {
        console.warn("refreshPost called with invalid postId");
        return null;
      }
      
      const service = getLocalPostsService();
      if (!service) {
        throw new Error("Posts service not initialized");
      }
      
      // Force a refresh by temporarily removing from cache
      service.clearPostFromCache(postId);
      
      // Fetch again
      const post = await service.getPost(postId);
      
      if (post) {
        // Update state
        setPostsById(prev => ({
          ...prev,
          [postId]: post
        }));
        
        // Update post in any tribe collections it belongs to
        if (post.tribeId) {
          setPostsByTribe(prev => {
            const tribePosts = prev[post.tribeId] || [];
            
            // Replace the post in the tribe's posts if it exists
            const updatedTribePosts = tribePosts.map(p => 
              p.id === post.id ? post : p
            );
            
            return {
              ...prev,
              [post.tribeId]: updatedTribePosts
            };
          });
        }
        
        return post;
      }
      
      return null;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Error refreshing post:", errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [getLocalPostsService]);

  // Refresh posts for a specific tribe
  const refreshTribePosts = useCallback(async (tribeId: string): Promise<void> => {
    try {
      if (!tribeId) {
        console.warn("refreshTribePosts called with invalid tribeId");
        return;
      }
      
      const service = getLocalPostsService();
      if (!service) {
        throw new Error("Posts service not initialized");
      }
      
      // Force a refresh by temporarily clearing the tribe's cache
      service.clearTribeCache(tribeId);
      
      // Fetch again
      const tribePosts = await service.getPostsByTribe(tribeId);
      
      // Update state
      setPostsByTribe(prev => ({
        ...prev,
        [tribeId]: tribePosts
      }));
      
      // Update postsById for quick lookup
      const newPostsById = { ...postsById };
      tribePosts.forEach((post: Post) => {
        newPostsById[post.id] = post;
      });
      
      setPostsById(newPostsById);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Error refreshing tribe posts:", errorMessage);
      setError(errorMessage);
    }
  }, [postsById, getLocalPostsService]);

  return {
    posts,
    postsByTribe,
    postsById,
    isLoading,
    error,
    syncStatus,
    getPostById,
    getPostsByTribe,
    refreshPost,
    refreshTribePosts
  };
} 