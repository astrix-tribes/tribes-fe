import React from 'react';
import { Calendar, Users, Video, MapPin } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { EventFeedItem as EventFeedItemType } from '../../types/feed';

interface EventFeedItemProps {
  item: EventFeedItemType;
  onClick?: () => void;
}

const formatEventDate = (startTime: number, endTime: number): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const isSameDay = start.toDateString() === end.toDateString();
  const startFormat = { month: 'short', day: 'numeric' } as const;
  const timeFormat = { hour: 'numeric', minute: '2-digit' } as const;
  
  if (isSameDay) {
    return `${start.toLocaleDateString(undefined, startFormat)} · ${start.toLocaleTimeString(undefined, timeFormat)} - ${end.toLocaleTimeString(undefined, timeFormat)}`;
  }
  
  return `${start.toLocaleDateString(undefined, startFormat)} - ${end.toLocaleDateString(undefined, startFormat)}`;
};

export function EventFeedItem({ item, onClick }: EventFeedItemProps) {
  const chainColor = getChainColor(item.chainId);
  const now = Date.now();
  const isUpcoming = now < item.startTime;
  const isLive = now >= item.startTime && now <= item.endTime;
  const hasEnded = now > item.endTime;

  const getStatusBadge = () => {
    if (isLive) {
      return <Badge className="bg-success-main/20 text-success-main">Live Now</Badge>;
    }
    if (hasEnded) {
      return <Badge className="bg-muted text-muted-foreground">Ended</Badge>;
    }
    if (item.maxAttendees && item.attendees >= item.maxAttendees) {
      return <Badge className="bg-destructive/20 text-destructive">Sold Out</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-500">Upcoming</Badge>;
  };

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Event Details */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm space-x-2">
            <Calendar className="w-4 h-4" style={{ color: chainColor }} />
            <span>{formatEventDate(item.startTime, item.endTime)}</span>
          </div>

          <div className="flex items-center text-sm space-x-2">
            {item.virtual ? (
              <Video className="w-4 h-4" style={{ color: chainColor }} />
            ) : (
              <MapPin className="w-4 h-4" style={{ color: chainColor }} />
            )}
            <span>{item.virtual ? 'Virtual Event' : item.location || 'Location TBA'}</span>
          </div>

          <div className="flex items-center text-sm space-x-2">
            <Users className="w-4 h-4" style={{ color: chainColor }} />
            <span>
              {item.attendees.toLocaleString()} attending
              {item.maxAttendees && ` · ${item.maxAttendees - item.attendees} spots left`}
            </span>
          </div>
        </div>

        {/* Action */}
        {isUpcoming && (!item.maxAttendees || item.attendees < item.maxAttendees) && (
          <div 
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full mt-2"
            style={{ 
              backgroundColor: `${chainColor}20`,
              color: chainColor,
            }}
          >
            Register Now
          </div>
        )}
      </div>
    </FeedCard>
  );
} 