import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Feed } from '../components/feed/Feed';
import { FeedLayout } from '../components/layout/FeedLayout';
import { TribeSidebar } from '../components/sidebars/TribeSidebar';
import { CreatePost } from '../components/CreatePost';
import { useTribesData } from '../hooks/useTribesData';
import { usePostsData } from '../hooks/usePostsData';
import { Tribe } from '../types/tribe';
import { 
  getTribeAvatar, 
  getTribeDescription, 
  getTribeCoverImage,
  getTribeTopics
} from '../utils/tribeHelpers';

// Define Topic type directly since it might be missing from tribe.ts
interface Topic {
  id: string;
  name: string;
}

import type { FeedItem } from '../types/feed';
import clsx from 'clsx';

export function TribeView() {
  const { tribeId } = useParams();
  const { tribes, isLoading: isLoadingTribes } = useTribesData();
  const { postsByTribe, isLoading: isLoadingPosts } = usePostsData();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'events'>('all');
  
  // Find tribe by ID with proper type checking
  const tribe = useMemo(() => {
    return tribes?.find(t => t.id.toString() === tribeId?.toString());
  }, [tribes, tribeId]);

  // Extract tribe display properties using helper functions to avoid linter errors
  const tribeDisplay = useMemo(() => {
    if (!tribe) return null;
    
    return {
      id: tribe.id,
      name: tribe.name,
      description: getTribeDescription(tribe),
      avatar: getTribeAvatar(tribe),
      coverImage: getTribeCoverImage(tribe),
      memberCount: tribe.memberCount,
      // We can safely cast the tribe to any inside this helper fn
      isVerified: (tribe as any).isVerified || false,
      members: (tribe as any).members || [],
      topics: getTribeTopics(tribe)
    };
  }, [tribe]);

  // Debug logging to help troubleshoot tribe data issues - with proper dependencies
  useEffect(() => {
    if (tribe) {
      console.log('Found tribe:', tribe);
      console.log('Formatted tribe display:', tribeDisplay);
    } else if (tribes?.length > 0) {
      console.log('Tribes available but none match ID:', tribeId);
      console.log('Available tribe IDs:', tribes.map(t => t.id));
    }
  }, [tribe, tribes, tribeId]); // Removed tribeDisplay to prevent infinite loop

  // Replace tribe posts loading logic with this:
  const tribePosts = useMemo(() => {
    if (!tribe || !tribe.id) return [];
    return postsByTribe[tribe.id] || [];
  }, [tribe, postsByTribe]);

  if (isLoadingTribes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse bg-accent/10 rounded-xl h-48 w-96" />
      </div>
    );
  }

  if (!tribe || !tribeDisplay) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tribe not found
      </div>
    );
  }

  const handleItemClick = (item: any) => {
    // Handle item clicks here
    console.log('Clicked item:', item);
  };

  const rightSidebar = (
    <div className="space-y-4">
      {/* Tribe Info Card */}
      <div className="bg-card rounded-xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-24 relative">
          {tribeDisplay.coverImage && (
            <img
              src={tribeDisplay.coverImage}
              alt={tribeDisplay.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-cover.png';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        {/* Tribe Info */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mt-2">
            <img
              src={tribeDisplay.avatar}
              alt={tribeDisplay.name}
              className="w-16 h-16 rounded-xl border-4 border-background"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold flex items-center gap-1">
                {tribeDisplay.name}
                {tribeDisplay.isVerified && (
                  <span className="text-theme-primary text-sm">✓</span>
                )}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span>{tribeDisplay.memberCount.toLocaleString()} members</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{tribeDisplay.description}</p>
          <button
            onClick={() => setIsJoined(!isJoined)}
            className={clsx(
              'w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isJoined
                ? 'bg-gray-700/10 hover:bg-gray-700/20 text-white'
                : 'bg-theme-primary hover:bg-theme-primary/90 text-white'
            )}
          >
            {isJoined ? 'Joined' : 'Join Tribe'}
          </button>
        </div>
      </div>

      {/* Topics */}
      <TribeSidebar
        members={tribeDisplay.members}
        topics={tribeDisplay.topics}
        onTopicSelect={setSelectedTopic}
        selectedTopicId={selectedTopic?.id}
      />
    </div>
  );

  return (
    <FeedLayout rightSidebar={rightSidebar}>
      <div className="min-w-[320px] overflow-x-hidden">
        {/* Feed Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={clsx(
                'px-4 py-2 rounded-full whitespace-nowrap',
                activeTab === 'all'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Posts
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={clsx(
                'px-4 py-2 rounded-full whitespace-nowrap',
                activeTab === 'media'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={clsx(
                'px-4 py-2 rounded-full whitespace-nowrap',
                activeTab === 'events'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Events
            </button>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-theme-primary text-white rounded-full font-medium hover:bg-theme-primary/90 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {tribePosts.length > 0 ? (
            <Feed 
              items={tribePosts}
              onItemClick={handleItemClick}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No posts available in this tribe
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-[600px] rounded-t-xl sm:rounded-xl">
            <CreatePost 
              onClose={() => setShowCreatePost(false)} 
              isOpen={showCreatePost}
              tribeId={tribe.id}
            />
          </div>
        </div>
      )}
    </FeedLayout>
  );
} 