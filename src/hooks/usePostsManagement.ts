import { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Post } from '../types/post';
import { PostsService } from '../services/posts.service';
import { useNetwork } from './useNetwork';

export interface UsePostsManagementReturnType {
  posts: Record<string, Post>;
  loading: boolean;
  error: Error | null;
  fetchPost: (postId: string) => Promise<Post | null>;
  fetchPostsByTribe: (tribeId: string) => Promise<Post[]>;
  fetchFeed: () => Promise<Post[]>;
}

export function usePostsManagement(): UsePostsManagementReturnType {
  const { address } = useAccount();
  const { chainId } = useNetwork();
  const [posts, setPosts] = useState<Record<string, Post>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const postsServiceRef = useRef<PostsService | null>(null);

  // Initialize PostsService
  useEffect(() => {
    postsServiceRef.current = PostsService.getInstance();
    console.log('PostsService initialized:', postsServiceRef.current);
  }, []);

  // Ensure we have the PostsService instance
  const getPostsService = () => {
    if (!postsServiceRef.current) {
      postsServiceRef.current = PostsService.getInstance();
    }
    return postsServiceRef.current;
  };

  const fetchPost = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      const postsService = getPostsService();
      console.log(`Fetching post with ID: ${postId}`);
      const post = await postsService.getPost(postId);
      if (post) {
        console.log('Post retrieved:', post);
        setPosts(prev => ({ ...prev, [post.id]: post }));
      } else {
        console.log('No post found with ID:', postId);
      }
      return post;
    } catch (err) {
      console.error('Error fetching post:', err);
      const error = err instanceof Error ? err : new Error('Failed to fetch post');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostsByTribe = useCallback(async (tribeId: string) => {
    try {
      setLoading(true);
      const postsService = getPostsService();
      console.log(`Fetching posts for tribe: ${tribeId}`);
      const tribePosts = await postsService.getPostsByTribe(tribeId);
      console.log(`Retrieved ${tribePosts.length} posts for tribe ${tribeId}:`, tribePosts);
      const postsMap = tribePosts.reduce((acc, post) => {
        acc[post.id] = post;
        return acc;
      }, {} as Record<string, Post>);
      setPosts(prev => ({ ...prev, ...postsMap }));
      return tribePosts;
    } catch (err) {
      console.error('Error fetching tribe posts:', err);
      const error = err instanceof Error ? err : new Error('Failed to fetch tribe posts');
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeed = useCallback(async () => {
    if (!address) {
      console.error('Cannot fetch feed: Wallet not connected');
      setError(new Error('Wallet not connected'));
      return [];
    }

    try {
      setLoading(true);
      const postsService = getPostsService();
      console.log(`Fetching feed for address: ${address}`);
      const feedPosts = await postsService.getUserFeed(address);
      console.log(`Retrieved ${feedPosts.length} posts for feed:`, feedPosts);
      const postsMap = feedPosts.reduce((acc, post) => {
        acc[post.id] = post;
        return acc;
      }, {} as Record<string, Post>);
      setPosts(prev => ({ ...prev, ...postsMap }));
      return feedPosts;
    } catch (err) {
      console.error('Error fetching feed:', err);
      const error = err instanceof Error ? err : new Error('Failed to fetch feed');
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [address]);

  return {
    posts,
    loading,
    error,
    fetchPost,
    fetchPostsByTribe,
    fetchFeed
  };
} 