import React from 'react';
import { Clock, TrendingUp, Star, Filter } from 'lucide-react';
import type { Post } from '../../types/post';
import PostCard from '../posts/PostCard';
import clsx from 'clsx';

interface FeedSectionProps {
  posts: Post[];
  showProfile?: boolean;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';
type SortFilter = 'trending' | 'latest' | 'top';

export function FeedSection({ posts, showProfile = true }: FeedSectionProps) {
  const [timeFilter, setTimeFilter] = React.useState<TimeFilter>('today');
  const [sortFilter, setSortFilter] = React.useState<SortFilter>('trending');
  const [showFilters, setShowFilters] = React.useState(false);

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

  // Filter and sort posts based on selected filters
  const filteredPosts = React.useMemo(() => {
    let filtered = [...posts];
    
    // Apply time filter
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        filtered = filtered.filter(post => {
          // Use createdAt if it exists, fallback to timestamp or current time
          const postDate = new Date(post.createdAt || (post as any).timestamp || now);
          return postDate.getDate() === now.getDate();
        });
        break;
      case 'week':
        filtered = filtered.filter(post => {
          const postDate = new Date(post.createdAt || (post as any).timestamp || now);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return postDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(post => {
          const postDate = new Date(post.createdAt || (post as any).timestamp || now);
          return postDate.getMonth() === now.getMonth();
        });
        break;
    }

    // Apply sort filter
    switch (sortFilter) {
      case 'trending':
        filtered.sort((a, b) => {
          // Safely access stats properties with fallbacks
          const aLikes = a.stats?.likeCount || (a as any).likes || 0;
          const aComments = a.stats?.commentCount || (a as any).comments || 0;
          const bLikes = b.stats?.likeCount || (b as any).likes || 0;
          const bComments = b.stats?.commentCount || (b as any).comments || 0;
          
          return (bLikes + bComments * 2) - (aLikes + aComments * 2);
        });
        break;
      case 'latest':
        filtered.sort((a, b) => {
          const aTime = new Date(a.createdAt || (a as any).timestamp || 0).getTime();
          const bTime = new Date(b.createdAt || (b as any).timestamp || 0).getTime();
          return bTime - aTime;
        });
        break;
      case 'top':
        filtered.sort((a, b) => {
          const aLikes = a.stats?.likeCount || (a as any).likes || 0;
          const bLikes = b.stats?.likeCount || (b as any).likes || 0;
          return bLikes - aLikes;
        });
        break;
    }

    return filtered;
  }, [posts, timeFilter, sortFilter]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Filters */}
      <div className="sticky top-[64px] z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {sortFilters.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSortFilter(value)}
                className={clsx(
                  'px-3 py-1.5 rounded-full flex items-center space-x-2 text-sm transition-colors',
                  sortFilter === value
                    ? 'bg-[#4ADE80] text-black'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-white/5 rounded-full relative"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Time filters dropdown */}
        {showFilters && (
          <div className="px-4 py-2 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {timeFilters.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeFilter(value)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    timeFilter === value
                      ? 'bg-[#4ADE80] text-black'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="px-4 py-4 space-y-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No posts found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
}