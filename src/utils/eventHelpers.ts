import { Post, PostType, PostMetadata } from '../types/post';
import { EventDetails, EventSpeaker, EventAgendaItem } from '../types/event';
import { ethers } from 'ethers';
import { getEthereumProvider } from './ethereum';
import EventControllerABI from '../abi/EventController.json';
import { getContractAddresses } from '../constants/contracts';
import { blockchain, getCurrentChainId } from './blockchainUtils';

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

// Define event types
export interface EventLocation {
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  physical?: string;
  virtual?: string;
  address?: string;
  coordinates?: {
    latitude: string;
    longitude: string;
  };
}

export interface TicketType {
  name: string;
  price: string; // in wei
  supply: number;
  perWalletLimit: number;
}

export interface EventData {
  title: string;
  description: string;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  location: EventLocation;
  capacity: number;
  ticketTypes: TicketType[];
  organizer?: string;
}

/**
 * Create a new event on the blockchain
 * @param eventData The event data
 * @returns The event ID
 */
export const createEvent = async (eventData: EventData): Promise<number> => {
  try {
    await blockchain.connect();
      
    // Get the current chain ID
    const chainId = await getCurrentChainId();
    console.log('Using chain ID for post creation:', chainId);
    
    // Get contract addresses for the current chain
    const addresses = getContractAddresses(chainId);
   
    
    // Get provider and signer
    const provider = await blockchain.getProvider();
    const signer = await blockchain.getSigner();
    
    if (!addresses.EVENT_CONTROLLER) {
      throw new Error('Event controller address not configured');
    }

    const eventController = new ethers.Contract(
      addresses.EVENT_CONTROLLER,
      EventControllerABI,
      signer
    );

    // Prepare metadata
    const metadata = JSON.stringify({
      title: eventData.title,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      location: eventData.location,
      createdAt: Math.floor(Date.now() / 1000)
    });

    // Get the first ticket type for simplicity
    // In a more complex implementation, you might want to handle multiple ticket types
    const ticketType = eventData.ticketTypes[0] || { price: '0', supply: eventData.capacity };
    
    // Convert price to wei if it's not already
    const price = typeof ticketType.price === 'string' && ticketType.price.startsWith('0x') 
      ? ticketType.price 
      : ethers.parseEther(String(ticketType.price || 0));

    console.log(`Creating event with metadata: ${metadata}`);
    console.log(`Max tickets: ${eventData.capacity}, Price: ${price}`);

    // Call the contract
    const tx = await eventController.createEvent(
      metadata,
      eventData.capacity,
      price
    );

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.transactionHash}`);

    // Extract event ID from logs
    const eventCreatedLog = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id('EventCreated(uint256,address)')
    );

    if (!eventCreatedLog) {
      throw new Error('Event creation transaction did not emit EventCreated log');
    }

    const eventId = parseInt(eventCreatedLog.topics[1], 16);
    console.log(`Event created with ID: ${eventId}`);
    
    return eventId;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Get event details from the blockchain
 * @param eventId The event ID
 * @returns The event details
 */
export const getEvent = async (eventId: number): Promise<any> => {
  try {
    const provider = await getEthereumProvider();
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }
    const chainId = await getCurrentChainId();
    const addresses = getContractAddresses(chainId);
    
    if (!addresses.EVENT_CONTROLLER) {
      throw new Error('Event controller address not configured');
    }

    const eventController = new ethers.Contract(
      addresses.EVENT_CONTROLLER,
      EventControllerABI,
      provider
    );

    const eventData = await eventController.events(eventId);
    
    // Parse metadata
    let metadata = {};
    try {
      metadata = JSON.parse(eventData.metadataURI);
    } catch (e) {
      console.warn(`Failed to parse event metadata: ${e}`);
    }

    return {
      id: eventId,
      ...metadata,
      organizer: eventData.organizer,
      maxTickets: eventData.maxTickets.toString(),
      ticketsSold: eventData.ticketsSold.toString(),
      price: eventData.price.toString(),
      active: eventData.active
    };
  } catch (error) {
    console.error(`Error getting event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Purchase tickets for an event
 * @param eventId The event ID
 * @param amount The number of tickets to purchase
 * @returns The transaction hash
 */
export const purchaseTickets = async (eventId: number, amount: number): Promise<string> => {
  try {
    const provider = await getEthereumProvider();
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }

    const signer = provider.getSigner();
    const chainId = await getCurrentChainId();
    const addresses = getContractAddresses(chainId);
    
    if (!addresses.EVENT_CONTROLLER) {
      throw new Error('Event controller address not configured');
    }

    const eventController = new ethers.Contract(
      addresses.EVENT_CONTROLLER,
      EventControllerABI,
      signer
    );

    // Get event details to determine price
    const eventData = await eventController.events(eventId);
    const totalPrice = eventData.price.mul(amount);

    const tx = await eventController.purchaseTickets(eventId, amount, {
      value: totalPrice
    });

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.transactionHash}`);

    return receipt.transactionHash;
  } catch (error) {
    console.error(`Error purchasing tickets for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Cancel an event
 * @param eventId The event ID
 * @returns The transaction hash
 */
export const cancelEvent = async (eventId: number): Promise<string> => {
  try {
    const provider = await getEthereumProvider();
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }

    const signer = provider.getSigner();
    const chainId = await getCurrentChainId();
    const addresses = getContractAddresses(chainId);
    
    if (!addresses.EVENT_CONTROLLER) {
      throw new Error('Event controller address not configured');
    }

    const eventController = new ethers.Contract(
      addresses.EVENT_CONTROLLER,
      EventControllerABI,
      signer
    );

    const tx = await eventController.cancelEvent(eventId);

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.transactionHash}`);

    return receipt.transactionHash;
  } catch (error) {
    console.error(`Error canceling event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Check if a user has tickets for an event
 * @param eventId The event ID
 * @param userAddress The user's address
 * @returns The number of tickets the user has
 */
export const getTicketBalance = async (eventId: number, userAddress?: string): Promise<number> => {
  try {
    const provider = await getEthereumProvider();
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }

    const chainId = await getCurrentChainId();  
    const addresses = getContractAddresses(chainId);
    
    if (!addresses.EVENT_CONTROLLER) {
      throw new Error('Event controller address not configured');
    }

    const eventController = new ethers.Contract(
      addresses.EVENT_CONTROLLER,
      EventControllerABI,
      provider
    );

    // If no user address provided, get the connected wallet address
    if (!userAddress) {
      const signer = provider.getSigner();
      userAddress = await signer.getAddress();
    }

    const balance = await eventController.balanceOf(userAddress, eventId);
    return balance.toNumber();
  } catch (error) {
    console.error(`Error getting ticket balance for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Convert event data from form to blockchain format
 * @param formData The form data
 * @returns The event data in blockchain format
 */
export const prepareEventData = (formData: any): EventData => {
  // Convert dates to Unix timestamps
  const startDate = new Date(formData.startDate).getTime() / 1000;
  const endDate = new Date(formData.endDate).getTime() / 1000;

  // Prepare ticket types
  const ticketTypes: TicketType[] = [{
    name: 'Standard',
    price: ethers.parseEther(String(formData.price || 0)).toString(),
    supply: formData.capacity || 0,
    perWalletLimit: formData.perWalletLimit || 1
  }];

  return {
    title: formData.title || '',
    description: formData.description || '',
    startDate,
    endDate,
    location: formData.location || {
      type: 'PHYSICAL',
      physical: '',
      address: ''
    },
    capacity: formData.capacity || 0,
    ticketTypes
  };
}; 