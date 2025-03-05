import React from 'react';
import { Card, CardContent, Badge } from '../common/ui';
import { getChainColor, getChainName } from '../../utils/chain';
import type { BaseFeedItem } from '../../types/feed';

interface FeedCardProps {
  item: BaseFeedItem;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FeedCard({ item, children, className = '', onClick }: FeedCardProps) {
  const chainColor = getChainColor(item.chainId);
  const chainName = getChainName(item.chainId);

  return (
    <Card
      variant="enhanced"
      className={`cursor-pointer hover:translate-y-[-2px] transition-transform ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {item.creator.avatar && (
              <img
                src={item.creator.avatar}
                alt={item.creator.username || item.creator.address}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {item.creator.username || item.creator.address}
                </span>
                <Badge
                  style={{ backgroundColor: `${chainColor}20`, color: chainColor }}
                  className="text-xs"
                >
                  {chainName}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {children}
      </CardContent>
    </Card>
  );
} 