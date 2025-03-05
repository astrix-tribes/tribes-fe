import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format, isBefore, isAfter, isToday } from 'date-fns';
import { Post } from '../../../types/post';
import { EventDetails, extractEventDetails, EventSpeaker, EventAgendaItem } from '../../../types/event';
import { EventsService } from '../../../services/events.service';
import UserAvatar from '../../user/UserAvatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Link as LinkIcon, 
  ExternalLink,
  Heart, 
  MessageCircle, 
  Share2, 
  Flag, 
  Info,
  DollarSign,
  Accessibility,
  User,
  Tag,
  Plus,
  CalendarCheck,
  Share,
  Ticket,
  AlertCircle
} from 'lucide-react';

import BasePost from '../BasePost';
import { 
  tagStyles, 
  buttonStyles,
  postTypeIconStyles,
  dividerStyles
} from '../styles/post.styles';

interface EventPostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const EventPost: React.FC<EventPostProps> = (props) => {
  const { post } = props;
  const [isAttending, setIsAttending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Extract event details from metadata using our helper function
  const eventDetails: EventDetails = React.useMemo(() => {
    return extractEventDetails(post);
  }, [post]);

  // Format event dates
  const eventDates = React.useMemo(() => {
    try {
      if (!eventDetails.startDate) return { 
        display: "Date not specified",
        status: "unknown" 
      };

      const startDate = new Date(eventDetails.startDate);
      const endDate = eventDetails.endDate ? new Date(eventDetails.endDate) : null;
      
      const formattedStartDate = format(startDate, 'PPP');
      const formattedEndDate = endDate ? format(endDate, 'PPP') : null;
      
      const formattedStartTime = format(startDate, 'p');
      const formattedEndTime = endDate ? format(endDate, 'p') : null;
      
      const isSameDay = formattedStartDate === formattedEndDate;
      
      let status = "upcoming";
      if (isBefore(new Date(), startDate)) {
        status = "upcoming";
      } else if (endDate && isAfter(new Date(), endDate)) {
        status = "past";
      } else {
        status = "ongoing";
      }
      
      // Calculate days remaining
      const now = new Date();
      const diffTime = startDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let daysRemainingText = "";
      if (diffDays > 0) {
        daysRemainingText = `${diffDays} day${diffDays !== 1 ? 's' : ''} away`;
      } else if (diffDays === 0) {
        daysRemainingText = "Today!";
      }
      
      return {
        startDate: formattedStartDate,
        startTime: formattedStartTime,
        endDate: formattedEndDate,
        endTime: formattedEndTime,
        isSameDay,
        status,
        daysRemaining: diffDays,
        daysRemainingText,
        fullStartDate: startDate,
        fullEndDate: endDate
      };
    } catch (error) {
      console.error('Error formatting event dates:', error);
      return {
        display: "Invalid date format",
        status: "unknown"
      };
    }
  }, [eventDetails.startDate, eventDetails.endDate]);

  // Get event status color and text
  const getEventStatusInfo = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { 
          color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
          text: 'Upcoming' 
        };
      case 'ongoing':
        return { 
          color: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
          text: 'Happening now' 
        };
      case 'past':
        return { 
          color: 'bg-neutral-800/50 text-neutral-400 border-neutral-700/50',
          text: 'Past event' 
        };
      default:
        return { 
          color: 'bg-neutral-800 text-neutral-400 border-neutral-700',
          text: 'Date unknown' 
        };
    }
  };

  // Map tag colors consistently based on tag content
  const getTagVariant = (tag: string): "default" | "blue" | "purple" | "green" | "yellow" | "orange" | "red" | "indigo" | "emerald" => {
    const variants = ["blue", "purple", "green", "yellow", "orange", "red", "indigo", "emerald"] as const;
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return variants[hash % variants.length];
  };

  // Generate add to calendar link
  const generateCalendarLink = () => {
    if (!eventDates.fullStartDate) return '#';
    
    const title = encodeURIComponent(post.metadata?.title || 'Event');
    const start = encodeURIComponent(eventDates.fullStartDate.toISOString());
    const end = eventDates.fullEndDate ? encodeURIComponent(eventDates.fullEndDate.toISOString()) : start;
    const location = encodeURIComponent(eventDetails.location || '');
    const details = encodeURIComponent(post.content || '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  // Check if user has tickets for this event
  useEffect(() => {
    const checkUserTickets = async () => {
      try {
        // Mock checking connected wallet address - replace with your wallet connection logic
        const address = localStorage.getItem('connectedWallet') || '0xMockAddress';
        setUserAddress(address);
        
        // Store mock address for testing purposes
        if (!localStorage.getItem('connectedWallet')) {
          localStorage.setItem('connectedWallet', address);
        }
        
        // If this is a blockchain event and we have an eventId
        if (eventDetails.isOnChain && eventDetails.eventId) {
          try {
            const tickets = await EventsService.getUserTickets(eventDetails.eventId, address);
            setTicketCount(tickets);
            setIsAttending(tickets > 0);
          } catch (error) {
            console.error('Error checking tickets, using mock data:', error);
            // Use mock data for testing
            setTicketCount(Math.random() > 0.7 ? 2 : 0);
            setIsAttending(Math.random() > 0.7);
          }
        }
      } catch (error) {
        console.error('Error checking user tickets:', error);
      }
    };
    
    checkUserTickets();
  }, [eventDetails.isOnChain, eventDetails.eventId]);

  // Handle attend/RSVP button click
  const handleAttend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (eventDetails.isOnChain && eventDetails.eventId) {
      // For blockchain events, open ticket purchasing modal
      setShowTicketModal(true);
    } else {
      // For regular events, toggle attendance state
      setIsAttending(!isAttending);
      // Here you would update your backend
    }
  };

  // Handle ticket purchase
  const handlePurchaseTickets = async () => {
    if (!eventDetails.eventId) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Call blockchain service to purchase tickets
      try {
        await EventsService.purchaseTickets(eventDetails.eventId, ticketQuantity);
      } catch (error) {
        console.error('Service error, using mock fallback:', error);
        // Simulate successful purchase for testing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in localStorage for persistence
        const userAddr = localStorage.getItem('connectedWallet') || '0xMockAddress';
        const currentTickets = parseInt(localStorage.getItem(`event-${eventDetails.eventId}-user-${userAddr}-tickets`) || '0');
        localStorage.setItem(`event-${eventDetails.eventId}-user-${userAddr}-tickets`, (currentTickets + ticketQuantity).toString());
      }
      
      // Update state
      setTicketCount(ticketCount + ticketQuantity);
      setIsAttending(true);
      setShowTicketModal(false);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setErrorMessage('Failed to purchase tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug info for better troubleshooting
  console.log('EventPost rendering with:', {
    postType: post.type,
    metadataKeys: post.metadata ? Object.keys(post.metadata) : [],
    hasEventDetails: !!post.metadata?.eventDetails,
    hasEventLegacy: !!post.metadata?.event,
    extractedDetails: eventDetails,
    isOnChain: eventDetails.isOnChain,
    eventId: eventDetails.eventId
  });

  return (
    <BasePost
      {...props}
      postType="event"
      typeIcon={<Calendar className="mr-1 h-3 w-3" />}
      typeName="Event"
    >
      {/* Event Status Banner */}
      {eventDates.status && (
        <div className={`mt-4 flex items-center justify-between rounded-md px-3 py-2 border ${getEventStatusInfo(eventDates.status).color}`}>
          <div className="flex items-center">
            <span className="font-medium">{getEventStatusInfo(eventDates.status).text}</span>
          </div>
          {eventDates.daysRemainingText && eventDates.status === 'upcoming' && (
            <span className="text-sm">{eventDates.daysRemainingText}</span>
          )}
        </div>
      )}

      {/* Event Title */}
      {post.metadata?.title && (
        <h3 className="text-xl font-bold mt-4 text-white">
          {post.metadata.title}
        </h3>
      )}

      {/* Blockchain Event Badge */}
      {eventDetails.isOnChain && (
        <div className="mt-2 inline-flex items-center rounded-full bg-indigo-900/30 text-indigo-300 px-2.5 py-0.5 text-xs font-medium">
          <Ticket className="mr-1 h-3 w-3" />
          <span>Blockchain Event</span>
        </div>
      )}

      {/* Event Summary Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Date & Time */}
        <div className="rounded-lg border border-yellow-900/40 bg-yellow-900/10 p-4">
          <div className="flex items-start gap-3">
            <div className={postTypeIconStyles({ type: 'event' })}>
              <Calendar className="h-5 w-5 text-yellow-300" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-white">Date & Time</h4>
              
              {eventDates.status !== 'unknown' ? (
                <>
                  {/* Calendar-style date display for start date */}
                  <div className="flex items-center mt-2">
                    <div className="flex flex-col items-center justify-center bg-neutral-800 border border-neutral-700 rounded-md min-w-[60px] h-[60px] mr-3">
                      <span className="text-xs text-neutral-400">{eventDates.fullStartDate ? format(eventDates.fullStartDate, 'MMM') : 'N/A'}</span>
                      <span className="text-xl font-bold">{eventDates.fullStartDate ? format(eventDates.fullStartDate, 'd') : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-300">{eventDates.startDate || 'N/A'}</span>
                      <span className="text-xs text-neutral-400">From {eventDates.startTime || 'N/A'}</span>
                      
                      {eventDates.endDate && !eventDates.isSameDay && (
                        <div className="mt-1 text-xs text-neutral-400">
                          To {eventDates.endDate} at {eventDates.endTime}
                        </div>
                      )}
                      
                      {eventDates.isSameDay && eventDates.endTime && (
                        <div className="text-xs text-neutral-400">
                          Until {eventDates.endTime}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-sm text-neutral-400">Date and time not specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Location */}
        <div className="rounded-lg border border-yellow-900/40 bg-yellow-900/10 p-4">
          <div className="flex items-start gap-3">
            <div className={postTypeIconStyles({ type: 'event' })}>
              <MapPin className="h-5 w-5 text-yellow-300" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-white">Location</h4>
              
              {eventDetails.location ? (
                <div className="mt-2">
                  <p className="text-sm text-neutral-300">{eventDetails.location}</p>
                  
                  {/* Map placeholder - in a real app, this could be a real map component */}
                  <div className="mt-2 h-[60px] w-full rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                    <span className="text-xs text-neutral-400">Map view</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-neutral-400">
                  {eventDetails.virtualLink ? 'Online event' : 'Location not specified'}
                </div>
              )}
              
              {eventDetails.virtualLink && (
                <a 
                  href={eventDetails.virtualLink}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Join virtually</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="mt-4 space-y-4">
        {/* Organizer & Categories */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Organizer */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-yellow-400" />
            <span className="text-neutral-400">Organizer:</span>
            <span className="text-white">{eventDetails.organizer || post.author || 'N/A'}</span>
          </div>
          
          {/* Categories */}
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-yellow-400" />
            <span className="text-neutral-400">Category:</span>
            {eventDetails.category ? (
              <span className={tagStyles({ variant: getTagVariant(eventDetails.category) })}>
                {eventDetails.category}
              </span>
            ) : post.metadata?.tags && post.metadata.tags.length > 0 ? (
              <span className={tagStyles({ variant: getTagVariant(post.metadata.tags[0]) })}>
                {post.metadata.tags[0]}
              </span>
            ) : (
              <span className="text-neutral-400">N/A</span>
            )}
          </div>
        </div>

        {/* Cost & Accessibility */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Cost */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-yellow-400" />
            <span className="text-neutral-400">Cost:</span>
            {eventDetails.isOnChain ? (
              <span className="text-white">{eventDetails.price || '0'} ETH per ticket</span>
            ) : (
              <span className="text-white">{eventDetails.cost || 'Free / Not specified'}</span>
            )}
          </div>
          
          {/* Accessibility */}
          <div className="flex items-center gap-2 text-sm">
            <Accessibility className="h-4 w-4 text-yellow-400" />
            <span className="text-neutral-400">Accessibility:</span>
            <span className="text-white">{eventDetails.accessibility || 'Not specified'}</span>
          </div>
        </div>

        {/* Attendees */}
        <div className="bg-neutral-800/60 rounded-lg p-4 border border-neutral-700/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-white">
                  {eventDetails.isOnChain ? 'Tickets' : 'Attendees'}
                </div>
                <div className="text-xs text-neutral-400">
                  {eventDetails.isOnChain ? (
                    <>
                      <span className="text-white text-sm">{eventDetails.ticketsSold || 0}</span> of <span className="text-white text-sm">{eventDetails.maxTickets}</span> tickets sold
                      {ticketCount > 0 && (
                        <div className="mt-1 text-emerald-400">You own {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}</div>
                      )}
                    </>
                  ) : (
                    eventDetails.currentAttendees !== undefined ? (
                      <>
                        <span className="text-white text-sm">{eventDetails.currentAttendees}</span>
                        {eventDetails.maxAttendees ? (
                          <> of <span className="text-white text-sm">{eventDetails.maxAttendees}</span> spots filled</>
                        ) : (
                          <> attending</>
                        )}
                      </>
                    ) : (
                      'Attendance not tracked'
                    )
                  )}
                </div>
              </div>
            </div>
            
            {/* Attendance bar */}
            {eventDetails.isOnChain ? (
              <div className="w-full md:w-1/2 h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ 
                    width: `${Math.min(100, ((eventDetails.ticketsSold || 0) / eventDetails.maxTickets) * 100)}%` 
                  }}
                />
              </div>
            ) : (
              eventDetails.maxAttendees && eventDetails.currentAttendees !== undefined && (
                <div className="w-full md:w-1/2 h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{ 
                      width: `${Math.min(100, (eventDetails.currentAttendees / eventDetails.maxAttendees) * 100)}%` 
                    }}
                  />
                </div>
              )
            )}
          </div>
          
          {/* Ticket Purchase / Attendee actions */}
          {eventDates.status !== 'past' && (
            <div className="mt-3 flex justify-end">
              {eventDetails.isOnChain ? (
                <button
                  className={buttonStyles({ 
                    variant: ticketCount > 0 ? 'outline' : 'primary',
                    size: 'sm'
                  })}
                  onClick={handleAttend}
                  disabled={eventDetails.isOnChain && !eventDetails.active}
                >
                  {ticketCount > 0 ? (
                    <>View My Ticket{ticketCount !== 1 ? 's' : ''}</>
                  ) : (
                    <>
                      <Ticket className="mr-1 h-3.5 w-3.5" />
                      Purchase Tickets
                    </>
                  )}
                </button>
              ) : (
                <button
                  className={buttonStyles({ 
                    variant: isAttending ? 'outline' : 'primary',
                    size: 'sm'
                  })}
                  onClick={handleAttend}
                >
                  {isAttending ? (
                    <>I'm attending</>
                  ) : (
                    <>
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Attend
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
          {/* Cancelled warning */}
          {eventDetails.isOnChain && !eventDetails.active && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>This event has been cancelled by the organizer</span>
            </div>
          )}
        </div>
      </div>

      {/* Event Description */}
      {post.content && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-white mb-2">Description</h4>
          <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      )}

      {/* Speakers Section */}
      {eventDetails.speakers && eventDetails.speakers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-white mb-2">Featured Speakers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {eventDetails.speakers.map((speaker: EventSpeaker, index: number) => (
              <div key={index} className="flex items-center gap-2 bg-neutral-800/50 rounded-md p-2">
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                  {speaker.avatar ? (
                    <img src={speaker.avatar} alt={speaker.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{speaker.name}</div>
                  {speaker.role && <div className="text-xs text-neutral-400">{speaker.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda Section */}
      {eventDetails.agenda && eventDetails.agenda.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-white mb-2">Event Agenda</h4>
          <div className="space-y-2">
            {eventDetails.agenda.map((item: EventAgendaItem, index: number) => (
              <div key={index} className="bg-neutral-800/50 rounded-md p-3 border-l-2 border-yellow-500">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-white">{item.title}</span>
                  {item.time && <span className="text-xs text-neutral-400">{item.time}</span>}
                </div>
                {item.description && (
                  <p className="text-xs text-neutral-300 mt-1">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {post.metadata?.tags && post.metadata.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.metadata.tags.map((tag: string, index: number) => (
            <span 
              key={index} 
              className={tagStyles({ variant: getTagVariant(tag) })}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className={dividerStyles} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a
            href={generateCalendarLink()}
            className={buttonStyles({ variant: 'outline', size: 'sm' })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
            Add to Calendar
          </a>
          
          <button
            className={buttonStyles({ variant: 'outline', size: 'sm' })}
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({
                  title: post.metadata?.title || 'Event',
                  text: post.content || 'Check out this event',
                  url: window.location.href
                }).catch(console.error);
              } else {
                // Fallback
                props.onShare?.();
              }
            }}
          >
            <Share className="mr-1.5 h-3.5 w-3.5" />
            Share Event
          </button>
        </div>
      </div>
      
      {/* Ticket Purchase Modal */}
      {showTicketModal && eventDetails.isOnChain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTicketModal(false)}>
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Purchase Tickets</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Event</label>
                <div className="text-white">{post.metadata?.title}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Price per Ticket</label>
                <div className="text-white">{eventDetails.price || '0'} ETH</div>
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-neutral-300 mb-1">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={eventDetails.maxTickets - (eventDetails.ticketsSold || 0)}
                  value={ticketQuantity}
                  onChange={e => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 p-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Total Price</label>
                <div className="text-white font-bold">
                  {eventDetails.price ? (parseFloat(eventDetails.price) * ticketQuantity).toFixed(4) : '0'} ETH
                </div>
              </div>
              
              {errorMessage && (
                <div className="bg-red-900/20 border border-red-900 text-red-300 p-3 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className={buttonStyles({ variant: 'outline' })}
                  onClick={() => setShowTicketModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                
                <button
                  className={buttonStyles({ variant: 'primary' })}
                  onClick={handlePurchaseTickets}
                  disabled={isLoading || !eventDetails.active}
                >
                  {isLoading ? 'Processing...' : 'Purchase Tickets'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BasePost>
  );
};

export default EventPost; 