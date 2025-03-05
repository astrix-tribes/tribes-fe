import { EventDetails, BlockchainEvent } from '../types/event';

/**
 * Service for interacting with events on the blockchain
 * This is currently a mock implementation for UI testing
 */
export class EventsService {
  /**
   * Gets the number of tickets a user owns for an event
   * @param eventId The blockchain event ID
   * @param userAddress The user's wallet address
   * @returns Number of tickets owned
   */
  static async getUserTickets(eventId: number, userAddress: string): Promise<number> {
    console.log(`Getting tickets for event ${eventId} and user ${userAddress}`);
    
    // For demonstration, we'll return a mock value
    // In a real implementation, this would call the blockchain
    return localStorage.getItem(`event-${eventId}-user-${userAddress}-tickets`) 
      ? parseInt(localStorage.getItem(`event-${eventId}-user-${userAddress}-tickets`) || '0') 
      : 0;
  }
  
  /**
   * Purchases tickets for an event
   * @param eventId The blockchain event ID
   * @param amount Number of tickets to purchase
   * @returns A transaction hash (mock)
   */
  static async purchaseTickets(eventId: number, amount: number): Promise<string> {
    console.log(`Purchasing ${amount} tickets for event ${eventId}`);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would call the blockchain
    // For now, let's just store in localStorage to simulate persistence
    
    // Get connected wallet (mock)
    const userAddress = localStorage.getItem('connectedWallet');
    if (!userAddress) {
      throw new Error('No wallet connected');
    }
    
    // Update ticket count
    const currentTickets = localStorage.getItem(`event-${eventId}-user-${userAddress}-tickets`)
      ? parseInt(localStorage.getItem(`event-${eventId}-user-${userAddress}-tickets`) || '0')
      : 0;
      
    localStorage.setItem(
      `event-${eventId}-user-${userAddress}-tickets`, 
      (currentTickets + amount).toString()
    );
    
    // Return mock tx hash
    return `0x${Math.random().toString(16).substring(2)}`;
  }
  
  /**
   * Create a new event on the blockchain
   * @param eventDetails Event details to store
   * @returns Transaction hash and event ID (mock)
   */
  static async createEvent(eventDetails: EventDetails): Promise<{ hash: string; eventId: number }> {
    console.log('Creating event:', eventDetails);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate random event ID
    const eventId = Math.floor(Math.random() * 1000) + 1;
    
    // Return mock values
    return {
      hash: `0x${Math.random().toString(16).substring(2)}`,
      eventId
    };
  }
  
  /**
   * Get an event by ID
   * @param eventId Event ID
   * @returns Event details or null
   */
  static async getEvent(eventId: number): Promise<EventDetails | null> {
    console.log(`Getting event ${eventId}`);
    
    // In a real implementation, this would fetch from the blockchain
    // For demo purposes, return mock data
    return {
      title: `Event #${eventId}`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      location: 'Mock Location',
      eventId,
      isOnChain: true,
      organizer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      maxTickets: 100,
      ticketsSold: 45,
      price: '0.05',
      active: true,
      priceInWei: '50000000000000000'
    };
  }
  
  /**
   * Cancel an event on the blockchain
   * @param eventId Event ID to cancel
   * @returns Transaction hash (mock)
   */
  static async cancelEvent(eventId: number): Promise<string> {
    console.log(`Cancelling event ${eventId}`);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock tx hash
    return `0x${Math.random().toString(16).substring(2)}`;
  }
} 