import React from 'react';
import type { Post } from '../../types/post';
import { Play, Calendar } from 'lucide-react';

// Define missing interfaces
interface StreamData {
  startTime: string;
  status: 'live' | 'upcoming' | 'ended';
}

// Extended Post with livestream-specific properties
interface PostWithStream extends Post {
  streamData: StreamData;
  image?: string;
  title?: string;
}

interface PostLivestreamProps {
  post: Post;
}

export function PostLivestream({ post }: PostLivestreamProps) {
  // Cast to the extended type
  const streamPost = post as PostWithStream;

  if (!streamPost.streamData) return null;

  const startTime = new Date(streamPost.streamData.startTime);
  const formattedDate = startTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get the image from metadata or from the direct property
  const imageUrl = streamPost.image || 
    (streamPost.metadata?.media && streamPost.metadata.media.length > 0 ? 
      streamPost.metadata.media[0].url : undefined);
      
  // Get the title from metadata or from the direct property
  const title = streamPost.title || streamPost.metadata?.title || 'Livestream';

  return (
    <div className="space-y-4">
      <div className="relative">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full rounded-xl aspect-video object-cover"
          />
        )}
        <div className="absolute top-2 right-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-sm flex items-center space-x-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>{streamPost.streamData.status === 'live' ? 'LIVE' : 'UPCOMING'}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-[#4ADE80] text-black rounded-full font-medium">
          <Play className="w-4 h-4 fill-current" />
          <span>{streamPost.streamData.status === 'live' ? 'Watch Now' : 'Set Reminder'}</span>
        </button>
      </div>
    </div>
  );
}