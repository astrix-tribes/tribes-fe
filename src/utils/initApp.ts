import { getIndexerService } from '../services';
import { PostsService } from '../services/posts.service';
// import { DBService } from '../services/db.service';
// import { QueueService } from '../services/queue.service';
import { blockchain } from '../utils/blockchainUtils';
import { TribesSDK } from '../services/TribesSDK';
import { MONAD_TESTNET } from '../constants/networks';

const INIT_TIMEOUT = 30000; // 30 seconds timeout (increased from 10 seconds)

/**
 * Initialize the application services
 * This should be called once when the app starts
 */
export async function initializeApp(): Promise<void> {
  // Check if running on server
  const isServer = typeof window === 'undefined';
  if (isServer) {
    console.log('Initializing server-side services');
    return;
  }

  // Create a promise that rejects after timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Initialization timed out')), INIT_TIMEOUT);
  });

  try {
    // Race between initialization and timeout
    await Promise.race([
      initializeServices(),
      timeoutPromise
    ]);
  } catch (error) {
    console.error('App initialization failed:', error);
    // Initialize with fallback mode instead of throwing error
    await initializeFallbackMode();
  }
}

/**
 * Initialize in fallback mode when main initialization fails
 */
async function initializeFallbackMode(): Promise<void> {
  console.log('Initializing in fallback mode...');
  
  // Initialize with default chain ID
  const chainId = MONAD_TESTNET.id;
  console.log('Using default chain ID:', chainId);
  
  // Initialize minimum required services 
  const indexerService = getIndexerService(chainId);
  
  // Initialize TribesSDK in fallback mode
  try {
    const tribesSDK = new TribesSDK(chainId);
    await tribesSDK.initialize().catch(err => {
      console.warn('Failed to initialize TribesSDK in fallback mode', err);
    });
  } catch (err) {
    console.warn('Error creating TribesSDK in fallback mode', err);
  }
  
  // Initialize PostsService
  PostsService.getInstance();
  
  console.log('Fallback initialization complete');
}

async function initializeServices(): Promise<void> {
  try {
    console.log('Initializing client-side services');
    
    // Initialize with default chain ID first in case blockchain connection fails
    let chainId: number = MONAD_TESTNET.id;
    let indexerService = getIndexerService(chainId);
    console.log('[IndexerService] Pre-initializing with default chainId:', chainId);
    
    // First, try to connect to blockchain
    try {
      console.log('Connecting to blockchain...');
      await blockchain.connect();
      const newChainId = await blockchain.getChainId();
      console.log('Successfully connected to blockchain with chainId:', newChainId);
      
      // Update indexer with actual chain ID
      chainId = newChainId;
      indexerService = getIndexerService(chainId);
      console.log('[IndexerService] Initializing with chainId:', chainId);
      
      // Initialize TribesSDK
      const tribesSDK = new TribesSDK(chainId);
      // Don't await the initialization to prevent timeouts
      tribesSDK.initialize().catch(err => {
        console.warn('TribesSDK initialization had an error, but app will continue:', err);
      });
      console.log('[TribesSDK] Initialization started with chainId:', chainId);
      
      // Initialize PostsService
      const postsService = PostsService.getInstance();
      // No need to initialize PostsService as it doesn't have an initialize method
      console.log('[PostsService] Initialized with chainId:', chainId);
      
      // Start indexing in the background
      setTimeout(async () => {
        try {
          const address = await blockchain.getAddress();
          if (address) {
            indexerService.setConnectedUser(address);
          }
        } catch (err) {
          console.warn('Failed to set connected user in indexer:', err);
        }
      }, 2000); // Delay start to ensure app is fully loaded
    } catch (error) {
      console.warn('Failed to connect to blockchain. Some features may not work:', error);
      // Continue with initialization even if blockchain connection fails
      // We already initialized with default chain ID above
    }
    
    console.log('App services initialized successfully');
  } catch (error) {
    console.error('Error initializing app services:', error);
    throw error;
  }
}

/**
 * Call this function to manually refresh data
 */
export async function refreshData(): Promise<void> {
  const isServer = typeof window === 'undefined';
  if (isServer) return;
  
  try {
    const indexerService = getIndexerService();
    const postsService = PostsService.getInstance();
    
    // Refresh connected user data
    const address = await blockchain.getAddress();
    if (address) {
      indexerService.setConnectedUser(address);
    }
    
    console.log('Data refresh initiated');
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
} 