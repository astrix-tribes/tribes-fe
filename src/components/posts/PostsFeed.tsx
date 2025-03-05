import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCreatingPost } from '../../store/slices/postsSlice';
import { PostType, Post } from '../../types/post';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { Plus, Filter, Loader2, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { usePostsData } from '../../hooks/usePostsData';
import PostsSyncStatus from './PostsSyncStatus';
import PostsRefreshButton from './PostsRefreshButton';

interface PostsFeedProps {
  tribeId: string;
  posts?: Post[];
  loading?: boolean;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ tribeId, posts: initialPosts = [], loading: initialLoading = false }) => {
  const dispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MEDIA' | 'EVENTS'>('ALL');
  
  // Use our enhanced posts data hook
  const { 
    postsByTribe, 
    isLoading, 
    getPostsByTribe 
  } = usePostsData();
  
  // Local posts state that combines initial posts and fetched posts
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  
  // Fetch posts when tribeId changes
  useEffect(() => {
    if (!tribeId) return;
    
    // If we already have posts for this tribe in our cache, use them
    if (postsByTribe[tribeId]) {
      setPosts(postsByTribe[tribeId]);
      return;
    }
    
    // Otherwise fetch them
    const fetchPosts = async () => {
      const tribePosts = await getPostsByTribe(tribeId);
      setPosts(tribePosts);
    };
    
    fetchPosts();
  }, [tribeId, postsByTribe, getPostsByTribe]);
  
  // Apply filters to the posts
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'MEDIA') return post.type === PostType.IMAGE || post.type === PostType.VIDEO;
    if (activeFilter === 'EVENTS') return post.type === PostType.EVENT;
    return true;
  });

  const handleLike = (postId: string) => {
    // Handle like
  };

  const handleComment = (postId: string) => {
    // Handle comment
  };

  const handleShare = (postId: string) => {
    // Handle share
  };

  const handleReport = (postId: string) => {
    // Handle report
  };

  const openCreatePostModal = () => {
    dispatch(setCreatingPost(true));
  };

  // Loading state combines initial loading and our hook's loading state
  const loading = initialLoading || isLoading;

  return (
    <div className="space-y-4">
      {/* Feed Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-4">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={clsx(
              'px-4 py-2 rounded-full whitespace-nowrap',
              activeFilter === 'ALL'
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveFilter('MEDIA')}
            className={clsx(
              'px-4 py-2 rounded-full whitespace-nowrap',
              activeFilter === 'MEDIA'
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Media
          </button>
          <button
            onClick={() => setActiveFilter('EVENTS')}
            className={clsx(
              'px-4 py-2 rounded-full whitespace-nowrap',
              activeFilter === 'EVENTS'
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Events
          </button>
        </div>
        <div className="flex items-center gap-2">
          <PostsSyncStatus />
          <PostsRefreshButton tribeId={tribeId} />
          <button
            onClick={openCreatePostModal}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-theme-primary text-white rounded-full font-medium hover:bg-theme-primary/90 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={() => handleComment(post.id)}
                onShare={() => handleShare(post.id)}
                onReport={() => handleReport(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-800/50 border border-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No posts found</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {activeFilter === 'ALL' 
                ? 'Be the first to create a post in this tribe!' 
                : `No ${activeFilter.toLowerCase()} posts found. Try a different filter or create one.`}
            </p>
            <button
              onClick={openCreatePostModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostsFeed; 