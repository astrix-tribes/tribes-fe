import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check } from 'lucide-react';
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

interface PollPostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
  question?: string;
  options?: PollOption[];
  endDate?: string;
}

const PollPost: React.FC<PollPostProps> = ({
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
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
  
  // Extract poll data from metadata with proper typing
  const pollData: PollData | any = post.metadata?.poll || {};
  const pollQuestion = pollData.question || post.content || 'Poll';
  const pollOptions: PollOption[] = pollData.options || [];
  const pollEndDate = pollData.endDate ? new Date(pollData.endDate) : null;
  
  // Calculate if poll has ended
  const isPollEnded = pollEndDate ? new Date() > pollEndDate : false;
  
  // Calculate total votes
  const totalVotes = pollOptions.reduce((sum, option) => sum + (option.votes || 0), 0);
  
  // Format remaining time
  const remainingTime = (() => {
    if (!pollEndDate || isPollEnded) return null;
    
    const now = new Date();
    const diffMs = pollEndDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
    } else {
      return 'Ending soon';
    }
  })();
  
  // Handle vote action
  const handleVote = (optionId: string) => {
    if (!hasVoted) {
      setSelectedOption(optionId);
      setHasVoted(true);
    }
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
      
      {/* Poll Question */}
      <h3 className="text-lg font-medium mb-3">{pollQuestion}</h3>
      
      {/* Poll Options */}
      <div className="space-y-2">
        {pollOptions.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted && !isSelected}
              className="w-full"
            >
              <div className="relative">
                <div
                  className={`w-full p-3 rounded-xl border ${
                    isSelected
                      ? 'border-[#4ADE80] bg-[#4ADE80]/10'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.text}</span>
                    {hasVoted && (
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    )}
                  </div>
                </div>
                {hasVoted && (
                  <div
                    className="absolute top-0 left-0 h-full bg-[#4ADE80]/10 rounded-xl transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Poll Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
        <span>{totalVotes.toLocaleString()} votes</span>
        {remainingTime && <span>{remainingTime}</span>}
        {isPollEnded && <span>Poll ended</span>}
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

export default PollPost; 