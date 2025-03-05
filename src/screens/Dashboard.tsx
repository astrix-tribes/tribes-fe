import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FeedLayout } from '../components/layout/FeedLayout';
import { UnifiedFeed } from '../components/feed/UnifiedFeed';
import { usePostsManagement } from '../hooks/usePostsManagement';
import { useNetwork } from '../hooks/useNetwork';
import { setCreatingPost } from '../store/slices/postsSlice';
import { useDispatch } from 'react-redux';
import { Post, PostType } from '../types/post';
import CreatePostModal from '../components/posts/CreatePostModal';
import type { FeedItem } from '../types/feed';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Address } from 'viem';
import { useTribesData } from '../hooks/useTribesData';

export function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chainId } = useNetwork();
  const { posts, loading, error, fetchFeed } = usePostsManagement();
  const { profile } = useProfile();
  const { address } = useAuth();
  const { tribes, isLoading: tribesLoading } = useTribesData();

  // Debug tribes data to check for loading issues
  useEffect(() => {
    if (tribes?.length > 0) {
      console.log('Dashboard - Loaded Tribes:', tribes);
    } else if (tribesLoading) {
      console.log('Dashboard - Tribes still loading...');
      } else {
      console.log('Dashboard - No tribes available or loading error');
    }
  }, [tribes, tribesLoading]);

  // Fetch posts on component mount
  useEffect(() => {
    if (address) {
      console.log('Fetching feed for address:', address);
      fetchFeed().catch(error => {
        console.error('Error fetching feed:', error);
      });
    }
  }, [fetchFeed, address]);

  const feedItems = useMemo(() => {
    if (!posts) return [];
    
    // Debug: Log posts to see what we're working with
    console.log("Dashboard posts:", Object.values(posts));
    
    // Convert posts object to array and ensure all posts have a type
    return Object.values(posts).map(post => {
      // Ensure post has a type, defaulting to TEXT (0) if not present
      if (post.type === undefined) {
        console.warn(`Post ${post.id} has no type, defaulting to TEXT`);
        return {
          ...post,
          type: PostType.TEXT
        };
      }
      return post;
    });
  }, [posts]);

  const handlePostClick = useCallback((item: Post | FeedItem) => {
    if ('type' in item) {
      navigate(`/post/${item.id}`);
    }
  }, [navigate]);

  // Handler for opening the create post modal
  const handleCreatePost = useCallback(() => {
    dispatch(setCreatingPost(true));
  }, [dispatch]);

  const renderFeed = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.toString()}</div>;
    }

    if (feedItems.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-6">
            Your feed is empty. Start by creating a post or joining tribes.
          </p>
          <button
            onClick={handleCreatePost}
            className="inline-flex items-center px-4 py-2 bg-[#4ADE80] text-black rounded-lg hover:bg-[#4ADE80]/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </button>
        </div>
      );
    }

    return (
      <UnifiedFeed 
        items={feedItems}
        loading={loading}
        showCreateButton={true}
        onItemClick={handlePostClick}
      />
    );
  };

  return (
    <FeedLayout>
      {renderFeed()}
      
      {/* Floating Action Button for creating posts */}
      <div className="fixed bottom-20 right-6 z-10">
        <button
          onClick={handleCreatePost}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#4ADE80] text-black shadow-lg hover:bg-[#4ADE80]/90 transition-colors"
          aria-label="Create post"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      
      <CreatePostModal tribeId={profile?.tokenId || "1"} />
    </FeedLayout>
  );
} 