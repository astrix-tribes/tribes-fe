import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FeedLayout } from '../components/layout/FeedLayout';
import { UnifiedFeed } from '../components/feed/UnifiedFeed';
import { usePostsManagement } from '../hooks/usePostsManagement';
import { useNetwork } from '../hooks/useNetwork';
import { setCreatingPost, resetDraft } from '../store/slices/postsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Post, PostType } from '../types/post';
import CreatePostModal from '../components/posts/CreatePostModal';
import type { FeedItem } from '../types/feed';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Address } from 'viem';
import { useTribesData } from '../hooks/useTribesData';
import { selectCreatingPost } from '../store/slices/postsSlice';

export function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chainId } = useNetwork();
  const { posts, loading, error, fetchFeed } = usePostsManagement();
  const { profile } = useProfile();
  const { address } = useAuth();
  const { tribes, isLoading: tribesLoading } = useTribesData();
  const [selectedTribeId, setSelectedTribeId] = useState<string | null>(null);
  const isCreatingPost = useSelector(selectCreatingPost);

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

  // Filter posts by selected tribe
  const filteredFeedItems = useMemo(() => {
    if (!posts) return [];
    
    // Debug: Log posts to see what we're working with
    console.log("Dashboard posts:", Object.values(posts));
    
    // Convert posts object to array and ensure all posts have a type
    let items = Object.values(posts).map(post => {
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
    
    // Filter by selected tribe if one is selected
    if (selectedTribeId) {
      items = items.filter(post => post.tribeId?.toString() === selectedTribeId);
    }
    
    return items;
  }, [posts, selectedTribeId]);

  // Handler for opening the create post modal
  const handleCreatePost = useCallback(() => {
    console.log('[Dashboard]: Opening create post modal');
    dispatch(setCreatingPost(true));
  }, [dispatch]);

  // Handler for post click
  const handlePostClick = useCallback((post: any) => {
    // Navigate to post detail page or handle post interaction
    console.log('Post clicked:', post);
  }, []);

  // Handle tribe selection for filtering
  const handleTribeSelect = useCallback((tribeId: string | null) => {
    setSelectedTribeId(tribeId);
  }, []);

  // Handle post creation success
  const handlePostCreationSuccess = useCallback((postId: string) => {
    console.log('Post created successfully:', postId);
    // Close the modal
    dispatch(setCreatingPost(false));
    // Reset the draft
    dispatch(resetDraft());
    // Refresh the feed to show the new post
    fetchFeed();
  }, [dispatch, fetchFeed]);

  // Auto-close modal when post creation is complete
  useEffect(() => {
    if (!isCreatingPost) {
      // If the modal is closed, refresh the feed to show new posts
      fetchFeed();
    }
  }, [isCreatingPost, fetchFeed]);

  // Add this effect to log state changes
  useEffect(() => {
    console.log('[Dashboard]: isCreatingPost state changed:', isCreatingPost);
  }, [isCreatingPost]);

  // Add this at the top of your Dashboard component
  useEffect(() => {
    // Clear the prefetch flag
    localStorage.removeItem('dashboard_prefetch');
    
    // Measure and log performance
    if (window.performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Dashboard load time:', navTiming.domContentLoadedEventEnd - navTiming.startTime, 'ms');
    }
  }, []);

  // Render tribe filter options
  const renderTribeFilters = () => {
    if (tribesLoading) {
      return <div className="text-sm text-gray-400">Loading tribes...</div>;
    }

    if (!tribes || tribes.length === 0) {
      return <div className="text-sm text-gray-400">No tribes available</div>;
    }

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleTribeSelect(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedTribeId === null 
              ? 'bg-[#4ADE80] text-black' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Tribes
        </button>
        {tribes.map(tribe => (
          <button
            key={tribe.id}
            onClick={() => handleTribeSelect(tribe.id.toString())}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTribeId === tribe.id.toString() 
                ? 'bg-[#4ADE80] text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tribe.name}
          </button>
        ))}
      </div>
    );
  };

  const renderFeed = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.toString()}</div>;
    }

    if (filteredFeedItems.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-6">
            {selectedTribeId 
              ? 'No posts in this tribe yet. Be the first to post!' 
              : 'Your feed is empty. Start by creating a post or joining tribes.'}
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
        items={filteredFeedItems}
        loading={loading}
        showCreateButton={true}
        onItemClick={handlePostClick}
      />
    );
  };

  // Add this log to the render function
  console.log('[Dashboard]: Rendering with isCreatingPost =', isCreatingPost);

  return (
    <FeedLayout>
      {/* Tribe filters */}
      {renderTribeFilters()}
      
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
      
      <CreatePostModal 
        tribeId={selectedTribeId || (profile?.tokenId?.toString() || "1")} 
        onSuccess={handlePostCreationSuccess}
        isOpen={isCreatingPost}
      />
    </FeedLayout>
  );
}

export default Dashboard; 