import { Post, PostType, PostMetadata } from '../types/post';
import { EventDetails, EventSpeaker, EventAgendaItem } from '../types/event';

/**
 * Validates event details and fills in missing fields with defaults
 * @param eventDetails Partial event details to validate
 * @returns Complete EventDetails object with defaults for missing values
 */
export const validateEventDetails = (
  eventDetails: Partial<EventDetails>
): EventDetails => {
  // Ensure we have valid dates
  if (!eventDetails.startDate) {
    console.warn('Event is missing a start date, using current date');
    eventDetails.startDate = new Date().toISOString();
  }

  // Ensure we have valid speakers array
  if (!eventDetails.speakers) {
    eventDetails.speakers = [];
  } else {
    // Validate each speaker
    eventDetails.speakers = eventDetails.speakers.map((speaker) => {
      return {
        name: speaker.name || 'Anonymous Speaker',
        role: speaker.role,
        avatar: speaker.avatar,
        bio: speaker.bio,
        social: speaker.social
      };
    });
  }

  // Ensure we have valid agenda array
  if (!eventDetails.agenda) {
    eventDetails.agenda = [];
  } else {
    // Validate each agenda item
    eventDetails.agenda = eventDetails.agenda.map((item) => {
      return {
        title: item.title || 'Untitled Session',
        time: item.time,
        description: item.description,
        speaker: item.speaker,
        duration: item.duration
      };
    });
  }

  // Return the complete event details
  return {
    startDate: eventDetails.startDate,
    endDate: eventDetails.endDate,
    location: eventDetails.location,
    virtualLink: eventDetails.virtualLink,
    maxAttendees: eventDetails.maxAttendees,
    currentAttendees: eventDetails.currentAttendees || 0,
    organizer: eventDetails.organizer || '',
    cost: eventDetails.cost,
    costType: eventDetails.costType,
    category: eventDetails.category,
    accessibility: eventDetails.accessibility,
    speakers: eventDetails.speakers,
    agenda: eventDetails.agenda,
    rsvpLink: eventDetails.rsvpLink,
    ticketUrl: eventDetails.ticketUrl,
    isCancelled: eventDetails.isCancelled || false,
    cancelReason: eventDetails.cancelReason,
    title: eventDetails.title || '',
    maxTickets: eventDetails.maxTickets || eventDetails.maxAttendees || 0
  };
};

/**
 * Creates event metadata for a post
 * @param title Event title
 * @param description Event description (will be used as post content)
 * @param eventDetails Event details
 * @param tags Optional tags for the event
 * @returns Metadata object ready to be used in post creation
 */
export const createEventMetadata = (
  title: string,
  description: string,
  eventDetails: Partial<EventDetails>,
  tags: string[] = []
): Record<string, any> => {
  // Validate and complete event details
  const validatedDetails = validateEventDetails(eventDetails);
  
  // Create the complete metadata
  return {
    title,
    content: description,
    type: PostType.EVENT,
    tags,
    createdAt: new Date().toISOString(),
    eventDetails: validatedDetails,
    // For backward compatibility with older code
    event: {
      title: title,
      startDate: validatedDetails.startDate,
      endDate: validatedDetails.endDate,
      location: validatedDetails.location
    }
  };
};

/**
 * Creates a sample event post for testing purposes
 * @returns A sample event post object
 */
export const createSampleEventPost = (): Post => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  
  const eventDetails: Partial<EventDetails> = {
    startDate: tomorrow.toISOString(),
    endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
    location: "123 Main Street, Anytown, CA",
    virtualLink: "https://zoom.us/j/123456789",
    maxAttendees: 100,
    currentAttendees: 45,
    organizer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    cost: "Free",
    category: "Technology",
    accessibility: "Fully accessible",
    speakers: [
      {
        name: "Jane Doe",
        role: "CTO, AcmeCorp",
        bio: "Jane is an expert in blockchain technology"
      },
      {
        name: "John Smith",
        role: "Blockchain Developer",
        bio: "John has 5 years of experience in smart contract development"
      }
    ],
    agenda: [
      {
        title: "Welcome and Introduction",
        time: "10:00 AM",
        description: "Opening remarks and agenda overview"
      },
      {
        title: "Blockchain Technology Overview",
        time: "10:30 AM",
        description: "An overview of blockchain technology and its applications",
        speaker: "Jane Doe",
        duration: "45 minutes"
      },
      {
        title: "Networking Break",
        time: "11:15 AM",
        duration: "15 minutes"
      },
      {
        title: "Smart Contract Development Workshop",
        time: "11:30 AM",
        description: "Hands-on workshop on developing smart contracts",
        speaker: "John Smith",
        duration: "1 hour"
      }
    ]
  };
  
  const eventMetadata = createEventMetadata(
    "Blockchain Technology Conference",
    "Join us for a day of learning and networking with blockchain experts...",
    eventDetails,
    ["blockchain", "technology", "web3", "cryptocurrency"]
  );
  
  // Ensure metadata has all required properties for PostMetadata
  const metadata: PostMetadata = {
    type: PostType.EVENT,
    content: eventMetadata.content,
    createdAt: eventMetadata.createdAt,
    ...eventMetadata
  };
  
  return {
    id: "sample-event-1",
    content: metadata.content,
    author: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    tribeId: 1,
    createdAt: Date.now(),
    type: PostType.EVENT,
    stats: {
      viewCount: 120,
      shareCount: 15,
      saveCount: 30,
      commentCount: 25,
      likeCount: 75
    },
    metadata,
  };
}; 