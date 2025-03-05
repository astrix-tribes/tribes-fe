import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, Badge } from '../common/ui';
import type { Proposal } from '../../types/governance';

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: () => void;
}

const statusColors = {
  active: 'bg-blue-500/20 text-blue-500',
  passed: 'bg-success-main/20 text-success-main',
  failed: 'bg-destructive/20 text-destructive',
};

const formatTimeLeft = (endTime: number): string => {
  const now = Date.now();
  const diff = endTime - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

export function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const quorumPercentage = totalVotes > 0 ? (totalVotes / proposal.quorum) * 100 : 0;

  return (
    <Card 
      variant="enhanced" 
      className="cursor-pointer hover:translate-y-[-2px] transition-transform"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{proposal.title}</h3>
              <Badge className={statusColors[proposal.status]}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {proposal.description}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {/* Progress bars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>For</span>
              <span>{proposal.votesFor.toLocaleString()} votes</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-success-main/80 rounded-full"
                style={{ width: `${forPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Against</span>
              <span>{proposal.votesAgainst.toLocaleString()} votes</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-destructive/80 rounded-full"
                style={{ width: `${againstPercentage}%` }}
              />
            </div>
          </div>

          {/* Quorum indicator */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Quorum</span>
              <span>{Math.round(quorumPercentage)}% of {proposal.quorum.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent/80 rounded-full"
                style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTimeLeft(proposal.endTime)}</span>
            </div>
            <div className="flex space-x-2">
              {proposal.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 