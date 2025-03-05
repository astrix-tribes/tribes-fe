import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { Post, PostType } from '../../types/post';
import UserAvatar from '../user/UserAvatar';
import clsx from 'clsx';
import { CalendarIcon, MapPinIcon, PlayIcon } from '@heroicons/react/24/solid';

// Base64 placeholder images
const IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyQTI5MkEiLz48cGF0aCBkPSJNNzQuNSAxMDVMNTkgMTI3LjVIOTBMNzQuNSAxMDVaIiBmaWxsPSIjNTU1NTU1Ii8+PHBhdGggZD0iTTExMC41IDg1TDg2IDEyNy41SDEzNUwxMTAuNSA4NVoiIGZpbGw9IiM1NTU1NTUiLz48Y2lyY2xlIGN4PSIxNDIuNSIgY3k9Ijc3LjUiIHI9IjcuNSIgZmlsbD0iIzU1NTU1NSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNBQUFBQUEiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
const VIDEO_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyQTI5MkEiLz48cGF0aCBkPSJNODUgNzBWMTMwTDEzMCAxMDBMODUgNzBaIiBmaWxsPSIjNTU1NTU1Ii8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0FBQUFBQSJI1mlkZW8gbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';

// Types for post stats to ensure they exist even if undefined in post
interface SafePostStats {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
}

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onReport,
  onClick,
  showActions = true
}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Ensure post stats exist
  const safeStats: SafePostStats = {
    likeCount: post.stats?.likeCount || 0,
    commentCount: post.stats?.commentCount || 0,
    shareCount: post.stats?.shareCount || 0,
    saveCount: post.stats?.saveCount || 0
  };
  
  // Format the timestamp
  const formattedTime = (() => {
    try {
      // Check if createdAt is a valid date
      const timestamp = post.createdAt;
      if (!timestamp) return 'Unknown time';
      
      // Handle both number and string formats
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error, post);
      return 'Unknown time';
    }
  })();
  
  // Handle like action
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    if (onLike) onLike();
  };
  
  // Handle comment action
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) onComment();
  };
  
  // Handle share action
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare();
  };
  
  // Handle save action
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };
  
  // Handle card click
  const handleCardClick = () => {
    if (onClick) onClick(post.id);
  };

  // Get author address as string
  const authorAddress = typeof post.author === 'string' 
    ? post.author 
    : (post.author as any)?.toString() || '';

  // Format author name for display
  const authorName = authorAddress
    ? `${authorAddress.slice(0, 6)}...${authorAddress.slice(-4)}`
    : 'Unknown';

  return (
    <div 
      className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-3">
        <UserAvatar 
          address={authorAddress}
          className="w-10 h-10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white truncate">
              {authorName}
            </span>
            <span className="text-gray-400 text-sm">
              {formattedTime}
            </span>
          </div>
          <p className="text-gray-200 mt-2 whitespace-pre-line">
            {post.content}
          </p>
          {showActions && (
            <div className="flex items-center space-x-6 mt-4">
              <button 
                className={clsx(
                  "flex items-center space-x-2 text-gray-400 hover:text-pink-500 transition-colors",
                  { "text-pink-500": liked }
                )}
                onClick={handleLike}
              >
                <Heart size={20} className={liked ? "fill-current" : ""} />
                <span>{safeStats.likeCount}</span>
              </button>
              <button 
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                onClick={handleComment}
              >
                <MessageCircle size={20} />
                <span>{safeStats.commentCount}</span>
              </button>
              <button 
                className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
                onClick={handleShare}
              >
                <Share2 size={20} />
                <span>{safeStats.shareCount}</span>
              </button>
              <button 
                className={clsx(
                  "flex items-center space-x-2 text-gray-400 hover:text-yellow-500 transition-colors",
                  { "text-yellow-500": saved }
                )}
                onClick={handleSave}
              >
                <Bookmark size={20} className={saved ? "fill-current" : ""} />
                <span>{safeStats.saveCount}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;