import { Post } from './post';

/**
 * Blockchain Event data matching the EventController contract structure
 */
export interface BlockchainEvent {
  metadataURI: string;  // IPFS URI containing event details
  organizer: string;    // Address of event organizer
  maxTickets: number;   // Maximum number of tickets available
  ticketsSold: number;  // Number of tickets already sold
  price: bigint;        // Price in wei
  active: boolean;      // Whether the event is active or cancelled
}

/**
 * Represents an event ticket purchase on the blockchain
 */
export interface EventTicket {
  eventId: number;      // Blockchain event ID
  tokenId: number;      // NFT token ID
  owner: string;        // Ticket owner address
  purchasedAt: number;  // Timestamp when ticket was purchased
  used: boolean;        // Whether the ticket has been used
}

/**
 * Represents a speaker at an event
 */
export interface EventSpeaker {
  name: string;
  role?: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

/**
 * Represents an agenda item for an event
 */
export interface EventAgendaItem {
  title: string;
  time?: string;
  description?: string;
  speaker?: string; // Reference to a speaker name
  duration?: string;
}

/**
 * Enum for event accessibility types
 */
export enum EventAccessibilityType {
  FULLY_ACCESSIBLE = 'fully_accessible',
  LIMITED_ACCESSIBILITY = 'limited_accessibility',
  NOT_ACCESSIBLE = 'not_accessible',
}

/**
 * Enum for event cost types
 */
export enum EventCostType {
  FREE = 'free',
  PAID = 'paid',
  DONATION = 'donation',
}

/**
 * Represents complete event details - this is what would be stored
 * in the metadataURI field on the blockchain
 */
export interface EventDetails {
  // Basic event information
  title: string;        // Event title
  startDate: string;    // ISO string
  endDate?: string;     // ISO string
  location?: any;
  virtualLink?: string;
  description?: string; // Detailed event description
  
  // Blockchain-specific fields
  eventId?: number;     // Blockchain event ID (if already created)
  contractAddress?: string; // Address of the EventController contract
  organizer: string;    // Address of event organizer
  price?: string;       // Human-readable price (e.g., "0.1 ETH")
  priceInWei?: string;  // Price in wei as string (for big numbers)
  maxTickets: number;   // Maximum number of tickets
  ticketsSold?: number; // Number of tickets sold
  active?: boolean;     // Whether the event is active
  isOnChain?: boolean;  // Whether this event exists on the blockchain
  ipfsHash?: string;    // IPFS hash for the metadata if stored on IPFS
  
  // Capacity information (UI-specific)
  maxAttendees?: number;
  currentAttendees?: number;
  perWalletLimit?: number;
  
  // Additional details
  cost?: string;
  costType?: EventCostType;
  category?: string;
  accessibility?: EventAccessibilityType | string;
  
  // Rich content
  speakers?: EventSpeaker[];
  agenda?: EventAgendaItem[];
  capacity?: number;
  
  // Additional fields
  rsvpLink?: string;
  ticketUrl?: string;
  isCancelled?: boolean;
  cancelReason?: string;
  coverImage?: string;  // URL to event cover image
  
  // Social features
  attendees?: string[]; // List of attendee addresses
  interestedCount?: number; // Number of users interested but not attending
}

/**
 * Helper function to extract event details from post metadata
 * Handles different metadata structures and provides fallbacks
 */
export const extractEventDetails = (post: Post): EventDetails => {
  // Try to get event details from the standard location first
  const eventFromDetails = post.metadata?.eventDetails;
  // Try legacy format
  const eventFromLegacy = post.metadata?.event;
  
  // Create default structure with the post author as fallback organizer
  const defaultDetails: EventDetails = {
    title: post.metadata?.title || '',
    startDate: new Date().toISOString(), // Default to now if no date provided
    organizer: post.author,
    maxTickets: 0,
    currentAttendees: 0,
    speakers: [],
    agenda: []
  };
  
  // Merge details in priority order: default < legacy < current
  return {
    ...defaultDetails,
    ...(eventFromLegacy || {}),
    ...(eventFromDetails || {})
  };
};

/**
 * Helper function to check if a Post is an event type
 */
export const isEventPost = (post: Post): boolean => {
  // Check through multiple ways to identify an event post
  return (
    // Check by type enum
    post.type === 4 ||
    // Check by string type
    post.type?.toString().toLowerCase() === 'event' ||
    // Check by metadata
    !!post.metadata?.eventDetails ||
    !!post.metadata?.event
  );
};

/**
 * Convert frontend EventDetails to blockchain format
 * This prepares event data for storage on-chain
 */
export const eventDetailsToBlockchain = (details: EventDetails): {
  metadataJson: string;
  maxTickets: number;
  price: bigint;
} => {
  // Create a copy of the details suitable for IPFS storage
  const metadataForIpfs = {
    title: details.title,
    description: details.description || '',
    startDate: details.startDate,
    endDate: details.endDate,
    location: details.location,
    virtualLink: details.virtualLink,
    organizer: details.organizer,
    category: details.category,
    speakers: details.speakers,
    agenda: details.agenda,
    coverImage: details.coverImage,
    accessibility: details.accessibility
  };

  // Convert price from ETH string to wei if provided
  const priceInWei = details.priceInWei 
    ? BigInt(details.priceInWei) 
    : details.price 
      ? BigInt(parseFloat(details.price) * 1e18) // Simple ETH to wei conversion
      : BigInt(0);
      
  return {
    metadataJson: JSON.stringify(metadataForIpfs),
    maxTickets: details.maxTickets || 0,
    price: priceInWei
  };
};

/**
 * Convert blockchain event to frontend format
 */
export const blockchainToEventDetails = (
  blockchainEvent: BlockchainEvent, 
  eventId: number,
  metadata?: any // Parsed metadata JSON from IPFS
): EventDetails => {
  // Provide defaults if metadata is missing
  const parsedMetadata = metadata || {};
  
  return {
    title: parsedMetadata.title || `Event #${eventId}`,
    description: parsedMetadata.description || '',
    startDate: parsedMetadata.startDate || new Date().toISOString(),
    endDate: parsedMetadata.endDate,
    location: parsedMetadata.location,
    virtualLink: parsedMetadata.virtualLink,
    
    // Blockchain-specific fields
    eventId,
    organizer: blockchainEvent.organizer,
    maxTickets: blockchainEvent.maxTickets,
    ticketsSold: blockchainEvent.ticketsSold,
    priceInWei: blockchainEvent.price.toString(),
    price: (Number(blockchainEvent.price) / 1e18).toString(), // Convert wei to ETH
    active: blockchainEvent.active,
    isOnChain: true,
    ipfsHash: blockchainEvent.metadataURI.replace('ipfs://', ''),
    
    // Additional details from metadata
    category: parsedMetadata.category,
    accessibility: parsedMetadata.accessibility,
    speakers: parsedMetadata.speakers || [],
    agenda: parsedMetadata.agenda || [],
    coverImage: parsedMetadata.coverImage,
    
    // UI-specific derived fields
    isCancelled: !blockchainEvent.active,
    maxAttendees: blockchainEvent.maxTickets,
    currentAttendees: blockchainEvent.ticketsSold
  };
}; 