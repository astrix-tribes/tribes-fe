import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Video, MapPin } from 'lucide-react';
import { Card, CardContent, Badge } from '../common/ui';
import { getChainColor } from '../../utils/chain';
import type { EventFeedItem } from '../../types/feed';

const formatEventDate = (startTime: number): string => {
  const date = new Date(startTime);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

interface UpcomingEventsProps {
  events?: EventFeedItem[];
}

export function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Upcoming Events</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="block group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm group-hover:text-accent line-clamp-1">
                    {event.title}
                  </h4>
                  <Badge
                    className="ml-2 flex-shrink-0"
                    style={{
                      backgroundColor: `${getChainColor(event.chainId)}20`,
                      color: getChainColor(event.chainId),
                    }}
                  >
                    {event.virtual ? 'Virtual' : 'In Person'}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <span>{formatEventDate(event.startTime)}</span>
                  </div>

                  {event.virtual ? (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Video className="w-3.5 h-3.5 mr-1.5" />
                      <span>Online Event</span>
                    </div>
                  ) : event.location ? (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      <span>{event.location}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {event.attendees.toLocaleString()} attending
                      {event.maxAttendees && ` · ${event.maxAttendees - event.attendees} spots left`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No upcoming events
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 