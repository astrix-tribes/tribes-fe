import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { BountyFeedItem as BountyFeedItemType } from '../../types/feed';

interface BountyFeedItemProps {
  item: BountyFeedItemType;
  onClick?: () => void;
}

const formatTimeLeft = (deadline: number): string => {
  const now = Date.now();
  const timeLeft = deadline - now;
  
  if (timeLeft <= 0) return 'Ended';
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  
  return `${minutes}m left`;
};

const difficultyColors: Record<string, { bg: string; text: string }> = {
  easy: {
    bg: 'bg-green-500/20',
    text: 'text-green-500'
  },
  medium: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-500'
  },
  hard: {
    bg: 'bg-red-500/20',
    text: 'text-red-500'
  }
};

const statusColors: Record<string, { bg: string; text: string }> = {
  open: {
    bg: 'bg-success-main/20',
    text: 'text-success-main'
  },
  'in-progress': {
    bg: 'bg-blue-500/20',
    text: 'text-blue-500'
  },
  completed: {
    bg: 'bg-muted',
    text: 'text-muted-foreground'
  }
};

export function BountyFeedItem({ item, onClick }: BountyFeedItemProps) {
  const chainColor = getChainColor(item.chainId);
  const now = Date.now();
  const isActive = item.deadline ? now < item.deadline : false;

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: `${chainColor}20`,
                color: chainColor,
              }}
            >
              Bounty
            </Badge>
          </div>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Bounty Details */}
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Reward</p>
            <p className="font-medium">
              {item.reward.amount} {item.reward.token}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <Badge 
              className={`${difficultyColors[item.difficulty].bg} ${difficultyColors[item.difficulty].text}`}
            >
              {item.difficulty}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge 
              className={`${statusColors[item.status].bg} ${statusColors[item.status].text}`}
            >
              {item.status === 'in-progress' ? 'In Progress' : item.status}
            </Badge>
          </div>
        </div>

        {/* Bounty Info */}
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{item.deadline ? formatTimeLeft(item.deadline) : 'No deadline'}</span>
          </div>
        </div>

        {/* Action */}
        {isActive && item.status === 'open' && (
          <div 
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
            style={{ 
              backgroundColor: `${chainColor}20`,
              color: chainColor,
            }}
          >
            Submit Solution
          </div>
        )}
      </div>
    </FeedCard>
  );
} 