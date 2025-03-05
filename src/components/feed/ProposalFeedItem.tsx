import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { ProposalFeedItem as ProposalFeedItemType } from '../../types/feed';

interface ProposalFeedItemProps {
  item: ProposalFeedItemType;
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

const statusColors: Record<string, { bg: string; text: string }> = {
  active: {
    bg: 'bg-success-main/20',
    text: 'text-success-main'
  },
  passed: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-500'
  },
  failed: {
    bg: 'bg-destructive/20',
    text: 'text-destructive'
  }
};

export function ProposalFeedItem({ item, onClick }: ProposalFeedItemProps) {
  const chainColor = getChainColor(item.chainId);
  const now = Date.now();
  const isActive = now < item.endTime;
  const totalVotes = item.votesFor + item.votesAgainst;
  const forPercentage = totalVotes > 0 ? (item.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (item.votesAgainst / totalVotes) * 100 : 0;
  const quorumPercentage = item.minVotes ? (totalVotes / item.minVotes) * 100 : 0;

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <Badge 
              className={`${statusColors[item.status].bg} ${statusColors[item.status].text}`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Voting Progress */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>For</span>
              <span>{forPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-success-main transition-all duration-500"
                style={{ width: `${forPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.votesFor.toLocaleString()} votes
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Against</span>
              <span>{againstPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-destructive transition-all duration-500"
                style={{ width: `${againstPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.votesAgainst.toLocaleString()} votes
            </p>
          </div>
        </div>

        {/* Quorum Progress */}
        {item.minVotes && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Quorum</span>
              <span>{quorumPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(quorumPercentage, 100)}%`,
                  backgroundColor: chainColor,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalVotes.toLocaleString()} of {item.minVotes.toLocaleString()} votes needed
            </p>
          </div>
        )}

        {/* Proposal Info */}
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTimeLeft(item.endTime)}</span>
          </div>
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