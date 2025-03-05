import React from 'react';
import { Calendar, Users, Video } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { LivestreamFeedItem as LivestreamFeedItemType } from '../../types/feed';

interface LivestreamFeedItemProps {
  item: LivestreamFeedItemType;
  onClick?: () => void;
}

const formatStreamDate = (startTime: number): string => {
  const start = new Date(startTime);
  const dateFormat = { month: 'short', day: 'numeric' } as const;
  const timeFormat = { hour: 'numeric', minute: '2-digit' } as const;
  
  return `${start.toLocaleDateString(undefined, dateFormat)} · ${start.toLocaleTimeString(undefined, timeFormat)}`;
};

export function LivestreamFeedItem({ item, onClick }: LivestreamFeedItemProps) {
  const chainColor = getChainColor(item.chainId);
  const now = Date.now();
  const isLive = now >= item.startTime && item.endTime ? now <= item.endTime : false;
  const isUpcoming = now < item.startTime;

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {isLive ? (
              <Badge className="bg-success-main/20 text-success-main">Live Now</Badge>
            ) : (
              <Badge 
                className="text-xs"
                style={{ 
                  backgroundColor: `${chainColor}20`,
                  color: chainColor,
                }}
              >
                Upcoming
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Thumbnail */}
        {item.thumbnail && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {isLive && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
              </div>
            )}
          </div>
        )}

        {/* Stream Details */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm space-x-2">
            <Calendar className="w-4 h-4" style={{ color: chainColor }} />
            <span>{formatStreamDate(item.startTime)}</span>
          </div>

          <div className="flex items-center text-sm space-x-2">
            <Users className="w-4 h-4" style={{ color: chainColor }} />
            <span>
              {item.viewers?.toLocaleString() ?? '0'} {isLive ? 'watching' : 'interested'}
            </span>
          </div>
        </div>

        {/* Action */}
        {isUpcoming && (
          <div 
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
            style={{ 
              backgroundColor: `${chainColor}20`,
              color: chainColor,
            }}
          >
            Set Reminder
          </div>
        )}
      </div>
    </FeedCard>
  );
} 