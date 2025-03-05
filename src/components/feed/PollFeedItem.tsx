import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { PollFeedItem as PollFeedItemType } from '../../types/feed';

interface PollFeedItemProps {
  item: PollFeedItemType;
  onClick?: () => void;
}

const formatTimeLeft = (endTime: number): string => {
  const now = Date.now();
  const timeLeft = endTime - now;
  
  if (timeLeft <= 0) return 'Ended';
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  
  return `${minutes}m left`;
};

export function PollFeedItem({ item, onClick }: PollFeedItemProps) {
  const chainColor = getChainColor(item.chainId);
  const now = Date.now();
  const isActive = now < item.endTime;
  const totalVotes = item.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.question}</h3>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: `${chainColor}20`,
                color: chainColor,
              }}
            >
              Poll
            </Badge>
          </div>
        </div>

        {/* Poll Options */}
        <div className="space-y-2">
          {item.options.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{option.text}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: chainColor,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {option.votes.toLocaleString()} votes
                </p>
              </div>
            );
          })}
        </div>

        {/* Poll Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTimeLeft(item.endTime)}</span>
          </div>
          <span>{totalVotes.toLocaleString()} total votes</span>
        </div>

        {/* Action */}
        {isActive && (
          <div 
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
            style={{ 
              backgroundColor: `${chainColor}20`,
              color: chainColor,
            }}
          >
            Vote Now
          </div>
        )}
      </div>
    </FeedCard>
  );
} 