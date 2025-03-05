import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Clock, TrendingUp, Star, Filter, SlidersHorizontal, Plus, Loader2 } from 'lucide-react';
import { Post, PostType } from '../../types/post';
import type { FeedItem, BaseFeedItem } from '../../types/feed';
import PostTypeMapper from '../posts/PostTypeMapper';
import { useDispatch } from 'react-redux';
import { setCreatingPost } from '../../store/slices/postsSlice';
import clsx from 'clsx';
import { isEventPost } from '../../types/event';

interface UnifiedFeedProps {
  items: (Post | FeedItem)[];
  loading?: boolean;
  showCreateButton?: boolean;
  tribeId?: string;
  showFilters?: boolean;
  onItemClick?: (item: Post | FeedItem) => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';
type SortFilter = 'trending' | 'latest' | 'top';

const filterOptions: { value: PostType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: PostType.TEXT, label: 'Text' },
  { value: PostType.IMAGE, label: 'Image' },
  { value: PostType.VIDEO, label: 'Video' },
  { value: PostType.POLL, label: 'Polls' },
  { value: PostType.EVENT, label: 'Events' },
  { value: PostType.LINK, label: 'Links' },
];

export function UnifiedFeed({ 
  items, 
  loading = false, 
  showCreateButton = true,
  showFilters = true,
  onItemClick
}: UnifiedFeedProps) {
  const dispatch = useDispatch();
  const [contentFilter, setContentFilter] = useState<PostType | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortFilter, setSortFilter] = useState<SortFilter>('latest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debug effect to track item changes
  useEffect(() => {
  }, [items]);

  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const sortFilters: { value: SortFilter; label: string; icon: typeof Clock }[] = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'latest', label: 'Latest', icon: Clock },
    { value: 'top', label: 'Top', icon: Star }
  ];

  const handleLike = (_id: string) => {
    // Implementation removed
  };

  const handleComment = (_id: string) => {
    // Implementation removed
  };

  const handleShare = (_id: string) => {
    // Implementation removed
  };

  const handleReport = (_id: string) => {
    // Implementation removed
  };

  const openCreatePostModal = () => {
    dispatch(setCreatingPost(true));
  };

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }
    
    let filtered = [...items];
    
    // Filter by content type with improved matching
    if (contentFilter !== 'ALL') {
      filtered = filtered.filter(item => {
        if ('content' in item && 'type' in item) {
          const post = item as Post;

          // Special handling for event posts
          if (contentFilter === PostType.EVENT) {
            return isEventPost(post);
          }
          
          // Convert both to strings for comparison
          const typeStr = String(post.type).toLowerCase();
          const filterStr = String(contentFilter).toLowerCase();
          
          // Check for exact match
          if (typeStr === filterStr) {
            return true;
          }
          
          // Check for TEXT (0)
          if (contentFilter === PostType.TEXT && 
              (post.type === 0 || typeStr === 'text' || typeStr === '0')) {
            return true;
          }
          
          // Check for numeric types
          if (typeof contentFilter === 'number') {
            const postTypeNum = parseInt(typeStr, 10);
            if (!isNaN(postTypeNum) && postTypeNum === contentFilter) {
              return true;
            }
            
            // Try enum name match
            const enumName = PostType[contentFilter];
            if (enumName && typeStr === enumName.toLowerCase()) {
              return true;
            }
          }
          
          return false;
        }
        return false;
      });
    }
    
    // Apply time filter 
    const now = new Date();
    if (timeFilter !== 'all') {
      filtered = filtered.filter(item => {
        const timestamp = 'createdAt' in item ? item.createdAt : (item as BaseFeedItem).createdAt;
        const itemDate = new Date(timestamp);
        
        switch (timeFilter) {
          case 'today': {
            return itemDate.getDate() === now.getDate() && 
                   itemDate.getMonth() === now.getMonth() &&
                   itemDate.getFullYear() === now.getFullYear();
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= weekAgo;
          }
          case 'month': {
            return itemDate.getMonth() === now.getMonth() &&
                   itemDate.getFullYear() === now.getFullYear();
          }
          default: {
            return true;
          }
        }
      });
    }

    // Apply sort filter with updated stats properties
    switch (sortFilter) {
      case 'trending':
        filtered.sort((a, b) => {
          const aStats = 'stats' in a ? a.stats : { likeCount: 0, commentCount: 0 };
          const bStats = 'stats' in b ? b.stats : { likeCount: 0, commentCount: 0 };
          const aEngagement = (aStats?.likeCount || 0) + ((aStats?.commentCount || 0) * 2);
          const bEngagement = (bStats?.likeCount || 0) + ((bStats?.commentCount || 0) * 2);
          return bEngagement - aEngagement;
        });
        break;
      case 'latest':
        filtered.sort((a, b) => {
          const aTimestamp = 'createdAt' in a ? 
            new Date(a.createdAt).getTime() : 
            new Date((a as BaseFeedItem).createdAt).getTime();
          const bTimestamp = 'createdAt' in b ? 
            new Date(b.createdAt).getTime() : 
            new Date((b as BaseFeedItem).createdAt).getTime();
          return bTimestamp - aTimestamp;
        });
        break;
      case 'top':
        filtered.sort((a, b) => {
          const aStats = 'stats' in a ? a.stats : { likeCount: 0 };
          const bStats = 'stats' in b ? b.stats : { likeCount: 0 };
          return ((bStats?.likeCount || 0) - (aStats?.likeCount || 0));
        });
        break;
    }

    return filtered;
  }, [items, contentFilter, timeFilter, sortFilter]);

  const renderItem = (item: Post | FeedItem) => {
    // Check if item is a Post
    if ('content' in item && 'type' in item) {
      return (
        <div key={item.id} className="mb-4">
          <PostTypeMapper
            post={item as Post}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item.id)}
            onShare={() => handleShare(item.id)}
            onReport={() => handleReport(item.id)}
            onClick={() => onItemClick?.(item)}
          />
        </div>
      );
    }
    
    // Handle other item types if needed
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2">
      {showFilters && (
        <>
          {/* Content type filters */}
          <div className="flex items-center justify-between p-4 bg-transparent">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              <div className="flex rounded-lg bg-gray-800/30 p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContentFilter(option.value)}
                    className={clsx(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                      contentFilter === option.value 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="p-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="px-4 py-3 bg-gray-800/20 border-t border-b border-gray-700/30">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {sortFilters.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setSortFilter(value)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full flex items-center space-x-2 text-sm transition-colors',
                        sortFilter === value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-700/50'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Time Range</h3>
                <div className="flex flex-wrap gap-2">
                  {timeFilters.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTimeFilter(value)}
                      className={clsx(
                        'px-3 py-1 rounded-full text-sm transition-colors',
                        timeFilter === value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-700/50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Items feed */}
      <div className="px-4 pb-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading content...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map(renderItem)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-800/50 border border-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No content found</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {contentFilter === 'ALL' 
                ? 'No posts or content available.' 
                : `No ${contentFilter === PostType.EVENT ? 'event' : 
                    contentFilter === PostType.POLL ? 'poll' :
                    contentFilter === PostType.TEXT ? 'text' :
                    contentFilter === PostType.IMAGE ? 'image' :
                    contentFilter === PostType.VIDEO ? 'video' :
                    contentFilter === PostType.LINK ? 'link' :
                    ''} content found. Try a different filter or create a new post.`}
            </p>
            {showCreateButton && (
              <button
                onClick={openCreatePostModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </button>
            )}
          </div>
        )}
        
        {/* Create post floating button (for mobile) */}
        {showCreateButton && (
          <div className="fixed bottom-6 right-6 md:hidden">
            <button
              onClick={openCreatePostModal}
              className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 