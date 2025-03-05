import React, { useState } from 'react';
import { Post } from '../../../types/post';
import { Bug, ArrowUpRight, Github, Clock } from 'lucide-react';
import { 
  tagStyles, 
  buttonStyles,
  postTypeIconStyles
} from '../styles/post.styles';
import BasePost from '../BasePost';

interface BountyPostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const BountyPost: React.FC<BountyPostProps> = (props) => {
  const { post } = props;
  
  // Extract bounty data from metadata
  const bountyData = React.useMemo(() => {
    return post.metadata?.bounty || {
      reward: '0',
      currency: 'ETH',
      difficulty: 'medium',
      deadline: undefined,
      tags: [],
      requirements: [],
      repository: undefined
    };
  }, [post.metadata?.bounty]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'hard':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  // Map tag colors consistently based on tag content
  const getTagVariant = (tag: string): "default" | "blue" | "purple" | "green" | "yellow" | "orange" | "red" | "indigo" | "emerald" => {
    const variants = ["blue", "purple", "green", "yellow", "orange", "red", "indigo", "emerald"] as const;
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return variants[hash % variants.length];
  };

  return (
    <BasePost 
      {...props} 
      postType="bounty"
      typeIcon={<Bug className="mr-1 h-3 w-3" />}
      typeName="Bounty"
    >
      {/* Bounty Content */}
      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={postTypeIconStyles({ type: 'bounty' })}>
              <Bug className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {bountyData.reward} {bountyData.currency}
              </div>
              <div className="text-sm text-neutral-400">Reward</div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(bountyData.difficulty)}`}
          >
            {bountyData.difficulty.charAt(0).toUpperCase() + bountyData.difficulty.slice(1)}
          </span>
        </div>

        {bountyData.deadline && (
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>Deadline: {new Date(bountyData.deadline).toLocaleDateString()}</span>
          </div>
        )}

        {/* Requirements */}
        {bountyData.requirements && bountyData.requirements.length > 0 && (
          <div className="space-y-2 mt-3">
            <h4 className="text-sm font-medium text-white">Requirements</h4>
            <ul className="space-y-2">
              {bountyData.requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Repository Link */}
        {bountyData.repository && (
          <a
            href={bountyData.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700 w-fit transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Github className="w-4 h-4" />
            <span>View Repository</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}

        {/* Tags */}
        {bountyData.tags && bountyData.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {bountyData.tags.map((tag: string, index: number) => (
              <span 
                key={index} 
                className={tagStyles({ variant: getTagVariant(tag) })}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Apply Button */}
        <button 
          className={buttonStyles({ variant: 'primary', fullWidth: true })}
          onClick={(e) => {
            e.stopPropagation();
            // Apply for bounty logic here
          }}
        >
          Apply for Bounty
        </button>
      </div>
    </BasePost>
  );
};

export default BountyPost; 