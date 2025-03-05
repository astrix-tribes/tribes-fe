import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../../../types/post';
import UserAvatar from '../../user/UserAvatar';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowPathRoundedSquareIcon, 
  BookmarkIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid, 
  BookmarkIcon as BookmarkIconSolid 
} from '@heroicons/react/24/solid';
import { ExternalLink, GitBranch, Globe } from 'lucide-react';

interface ProjectPostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const ProjectPost: React.FC<ProjectPostProps> = ({
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
  
  // Extract project data from metadata
  const projectData = post.metadata?.project || {
    github: undefined,
    website: undefined
  };
  
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

  // Get author name and profile picture
  const authorName = typeof post.author === 'string' ? 
    `${post.author.slice(0, 6)}...${post.author.slice(-4)}` : 
    post.author;

  const authorAddress = typeof post.author === 'string' ? 
    post.author : 
    post.author;
    
  // Safely get stats values
  const likeCount = post.stats?.likeCount || 0;
  const commentCount = post.stats?.commentCount || 0;

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Post Header */}
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
          <UserAvatar 
            address={authorAddress}
            size="md"
            showUsername={false}
          />
        </div>
        <div className="ml-2">
          <div className="font-medium">{authorName}</div>
          <div className="text-xs text-gray-500 flex">
            {formattedTime}
            {post.tribeId && (
              <>
                <span className="mx-1">•</span>
                <span>Tribe #{post.tribeId}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      {post.content && (
        <div className="text-gray-800 whitespace-pre-line mb-4">
          {post.content}
        </div>
      )}
      
      {/* Project Repository Widget */}
      <div className="mt-4 rounded-xl border border-purple-500/20">
        <div className="flex items-center justify-between p-4 border-b border-purple-500/10">
          <div className="text-gray-800 font-medium flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span>Project Repository</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 text-gray-600">
            {projectData.github && (
              <a 
                href={projectData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <GitBranch className="w-4 h-4" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {projectData.website && (
              <a
                href={projectData.website}
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-4 h-4" />
                <span>Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Post Stats */}
      {showActions && (
        <>
          <div className="flex items-center mt-4 text-gray-500 text-sm">
            <div className="flex items-center">
              <span>{likeCount}</span>
              <span className="mx-1">likes</span>
            </div>
            <span className="mx-1.5">•</span>
            <div className="flex items-center">
              <span>{commentCount}</span>
              <span className="mx-1">comments</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button 
              onClick={handleLike}
              className="flex items-center text-gray-500 hover:text-red-600"
            >
              {liked ? (
                <HeartIconSolid className="h-5 w-5 text-red-600" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span className="ml-1.5 text-sm">{likeCount > 0 ? likeCount : ''}</span>
            </button>
            
            <button 
              onClick={handleComment}
              className="flex items-center text-gray-500 hover:text-blue-600"
            >
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span className="ml-1.5 text-sm">{commentCount > 0 ? commentCount : ''}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center text-gray-500 hover:text-green-600"
            >
              <ArrowPathRoundedSquareIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={handleSave}
              className="flex items-center text-gray-500 hover:text-yellow-600"
            >
              {saved ? (
                <BookmarkIconSolid className="h-5 w-5 text-yellow-600" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectPost; 