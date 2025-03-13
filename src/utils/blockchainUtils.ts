/**
 * Utilities for blockchain operations
 */
import { type Log, type PublicClient, type Abi, type TransactionReceipt } from 'viem';
import { getPublicClient as viemGetPublicClient, getContracts as configGetContracts } from '../config/contracts';
import { SUPPORTED_CHAINS, MONAD_TESTNET } from '../constants/networks';
import { getEthereumProvider } from './ethereum';
import { type Chain } from 'viem';
import { ZeroAddress } from 'ethers';
import { getContractAddresses as contractsGetContractAddresses } from '../constants/contracts';

// Define a more specific type for contract function parameters
type ContractReadFunction = (...args: unknown[]) => Promise<unknown>;
type ContractWriteFunction = (...args: unknown[]) => Promise<`0x${string}`>;

// Define WalletClient interface
interface WalletClient {
  address?: string;
  signMessage?: (message: string) => Promise<string>;
}

// Re-export functions from other modules for consistency
export const getPublicClient = viemGetPublicClient;
export const getContracts = configGetContracts;
export const getContractAddresses = contractsGetContractAddresses;

/**
 * Get the current chain ID from connected wallet
 * @returns Current chain ID
 */
export const getCurrentChainId = async (): Promise<number> => {
  try {
    const provider = await getEthereumProvider();
    if (!provider) {
      console.warn('No provider available, using Monad Devnet');
      return MONAD_TESTNET.id;
    }
    
    // Different providers have different methods to get chain ID
    // Try multiple approaches
    try {
      // Try using eth_chainId RPC method directly
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      if (chainIdHex) {
        const chainId = parseInt(chainIdHex, 16);
        
        // Check if the chain is supported
        const isSupported = SUPPORTED_CHAINS.some(chain => chain.id === chainId);
        if (!isSupported) {
          console.warn(`Chain ID ${chainId} not supported, using Monad Devnet`);
          return MONAD_TESTNET.id;
        }
        
        return chainId;
      }
    } catch (requestError) {
      console.warn('Failed to get chainId via request method:', requestError);
    }
    
    // Fallback to using chainId property if it exists
    if (provider.chainId) {
      const chainId = typeof provider.chainId === 'string' 
        ? parseInt(provider.chainId, 16) 
        : Number(provider.chainId);
      
      return chainId;
    }
    
    // Don't try to use provider.getNetwork() as it may not exist on all providers
    // This was causing the TypeError: provider.getNetwork is not a function error
    
    console.warn('Could not determine chain ID, using Monad Devnet');
    return MONAD_TESTNET.id;
  } catch (error) {
    console.error('Error getting current chain ID:', error);
    // Return Monad Devnet as default
    return MONAD_TESTNET.id;
  }
};

/**
 * Get chain configuration by ID
 * @param chainId Chain ID
 * @returns Chain configuration
 */
export const getChainConfig = (chainId: number): Chain => {
  const chain = SUPPORTED_CHAINS.find((c: Chain) => c.id === chainId);
  if (!chain) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  return chain;
};

/**
 * Extract metadata from transaction
 * @param chainId Chain ID
 * @param tribeId Tribe ID
 * @param publicClient Public client for blockchain interaction
 * @returns Metadata string
 */
export const extractMetadataFromTransaction = async (
  chainId: number,
  tribeId: number,
  publicClient: PublicClient
): Promise<string> => {
  try {
    const { tribeController } = getContracts(chainId);
    
    // Get tribe creation transaction
    const events = await publicClient.getLogs({
      address: tribeController.address,
      event: {
        type: 'event',
        name: 'TribeCreated',
        inputs: [
          { type: 'uint256', name: 'tribeId', indexed: true },
          { type: 'address', name: 'creator', indexed: true },
          { type: 'string', name: 'name' },
          { type: 'string', name: 'metadata' }
        ]
      },
      args: {
        tribeId: BigInt(tribeId)
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    });

    if (events && events.length > 0) {
      const event = events[0];
      return event.args.metadata || '{}';
    }

    return '{}';
  } catch (error) {
    console.error('Error extracting metadata from transaction:', error);
    return '{}';
  }
};

/**
 * Wait for transaction confirmation
 * @param txHash Transaction hash
 * @param chainId Chain ID
 * @returns Transaction receipt
 */
export const waitForTransaction = async (
  txHash: `0x${string}`,
  chainId: number
): Promise<TransactionReceipt> => {
  const publicClient = getPublicClient(chainId);
  return await publicClient.waitForTransactionReceipt({ hash: txHash });
};

/**
 * Extract event logs from transaction receipt
 * @param receipt Transaction receipt
 * @param eventSignature Event signature to filter by
 * @returns Found log or undefined
 */
export const extractEventFromLogs = (
  receipt: TransactionReceipt,
  eventSignature: string
): Log | undefined => {
  return receipt.logs.find(
    (log: Log) => log.topics[0] === eventSignature
  );
};

/**
 * Check if address is zero address
 * @param address Address to check
 * @returns Whether address is zero address
 */
export const isZeroAddress = (address: string): boolean => {
  return address === ZeroAddress || address === '0x0000000000000000000000000000000000000000';
};

/**
 * Get contract instance
 * @param params Contract parameters
 * @returns Contract instance
 */
export async function getContract(params: { address: string; abi: Abi }): Promise<{
  address: string;
  abi: Abi;
  read: Record<string, ContractReadFunction>;
  write: Record<string, ContractWriteFunction>;
}> {
  try {
    const publicClient = getPublicClient();
    
    // Get the current chain ID and verify
    const chainId = await getCurrentChainId();
    console.log('Current chain ID:', chainId);
    console.log('Expected chain ID for this contract:', 1264453517); // Replace with your expected chain ID

    // Check if we're on the correct network
    if (chainId !== 1264453517) { // Replace with your expected chain ID
      console.error('Wrong network. Please switch to the correct network.');
      throw new Error('Wrong network');
    }
    
    // Create a contract instance with read capabilities
    return {
      address: params.address,
      abi: params.abi,
      // Set up read functions based on the ABI
      read: buildContractReadFunctions(params.abi, params.address, publicClient),
      // Set up write functions if needed
      write: {}
    };
  } catch (error) {
    console.error('Error creating contract instance:', error);
    // Return a minimal contract instance as fallback
    return {
      address: params.address,
      abi: params.abi,
      read: {
        balanceOf: async () => BigInt(0)
      },
      write: {}
    };
  }
}

/**
 * Build contract read functions based on ABI
 * @param abi Contract ABI
 * @param address Contract address
 * @param publicClient Public client
 * @returns Object with read functions
 */
function buildContractReadFunctions(abi: Abi, address: string, publicClient: PublicClient): Record<string, ContractReadFunction> {
  const readFunctions: Record<string, ContractReadFunction> = {};
  
  // Find all read functions in the ABI
  abi.forEach(item => {
    if (item.type === 'function' && 
        (item.stateMutability === 'view' || item.stateMutability === 'pure')) {
      readFunctions[item.name] = async (...args: unknown[]) => {
        try {
          // Call the contract function
          return await publicClient.readContract({
            address: address as `0x${string}`,
            abi: [item],
            functionName: item.name,
            args
          });
        } catch (error) {
          console.error(`Error calling ${item.name}:`, error);
          throw error;
        }
      };
    }
  });
  
  return readFunctions;
}

/**
 * Get wallet client
 */
export async function getWalletClient(): Promise<WalletClient> {
  try {
    const provider = await getEthereumProvider();
    if (!provider) {
      throw new Error('No wallet provider available');
    }
    
    // Real implementation should use the provider to get a wallet client
    return {
      address: provider.selectedAddress
    };
  } catch (error) {
    console.error('Error getting wallet client:', error);
    return {};
  }
}

/**
 * Blockchain object for compatibility with existing code
 * This should use the ORIGINAL implementation that was working before
 */
export const blockchain = {
  // Connect to the blockchain
  connect: async () => {
    try {
      const provider = await getEthereumProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Request accounts to ensure connection
      await provider.request({ method: 'eth_requestAccounts' });
      return true;
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      throw error;
    }
  },
  
  // Get the connected wallet address
  getAddress: async () => {
    try {
      const provider = await getEthereumProvider();
      if (!provider || !provider.selectedAddress) {
        throw new Error('No wallet connected');
      }
      return provider.selectedAddress;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw error;
    }
  },
  
  // Get the current chain ID
  getCurrentChainId,
  getChainId: getCurrentChainId, // Alias
  
  // Get the Ethereum provider
  getProvider: async () => {
    return getEthereumProvider();
  },
  
  // Get a signer for transactions
  getSigner: async () => {
    try {
      const provider = await getEthereumProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Import ethers
      const { ethers } = await import('ethers');
      
      // Create a Web3Provider wrapped around our provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      
      // Get the signer from the ethers provider
      const signer = await ethersProvider.getSigner();
      
      return signer;
    } catch (error) {
      console.error('Error getting signer:', error);
      throw error;
    }
  },
  
  // Create a post in a tribe
  createTribePost: async (params: Record<string, unknown>) => {
    try {
      console.log('Creating tribe post with params:', params);
      
      // Connect to blockchain
      await blockchain.connect();
      
      // Get the current chain ID
      const chainId = await getCurrentChainId();
      console.log('Using chain ID for post creation:', chainId);
      
      // Get contract addresses for the current chain
      const addresses = getContractAddresses(chainId);
      if (!addresses.POST_MINTER) {
        throw new Error(`No tribes contract address for chain ID ${chainId}`);
      }
      
      // Get provider and signer
      const provider = await blockchain.getProvider();
      const signer = await blockchain.getSigner();
      if (!signer) {
        throw new Error('No signer available for transaction');
      }
      
      console.log('Provider:', provider);
      console.log('Signer:', signer);
      
      // Get the contract instance
      const { ethers } = await import('ethers');
      const { ABIS } = await import('../config/abis');
      
      // Log the contract address and ABI to verify
      console.log('Contract address:', addresses.POST_MINTER);
      console.log('Contract ABI first few methods:', ABIS.PostMinter.slice(0, 3));

      // Create contract with signer only
      const contractWithSigner = new ethers.Contract(addresses.POST_MINTER, ABIS.PostMinter, signer);
      console.log('Contract with signer:', contractWithSigner);

      // Get user address
      const userAddress = await signer.getAddress();
      console.log('User address:', userAddress);
      
      // Define the tribe ID to use
      const tribeId = params.tribeId ? Number(params.tribeId) : 1;
      console.log(`Using tribe ID: ${tribeId}`);
      
      // Check if tribe exists and join if needed
      // await ensureTribeMembership(contractWithSigner, tribeId, userAddress);
      console.log('Ensuring tribe parmas...', params);
      // Prepare metadata with required fields
      const metadata = JSON.stringify({
        content: params.content || 'Sample content',
        title: params.title || 'Untitled Post',
        type: params.postType,
        createdAt: new Date().toISOString(),
        ...(params.postType === 'event' && { ...params })
      });
      
      console.log('Post metadata:', metadata);
      
      // Send the transaction
      console.log('Sending createPost transaction...');
      const tx = await contractWithSigner.createPost(
        tribeId,
        metadata,
        false, // isGated
        '0x0000000000000000000000000000000000000000', // collectibleContract
        0, // collectibleId
        {
          gas: 1000000
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      return tx.hash as `0x${string}`;
    } catch (error) {
      console.error('Error creating tribe post:', error);
      throw error;
    }
  },
  
  // Get a post from a tribe
  getTribePost: async (tribeId: number, postId: string) => {
    try {
      console.log(`Getting post ${postId} from tribe ${tribeId}`);
      
      const chainId = await getCurrentChainId();
      const contracts = getContracts(chainId);
      const client = getPublicClient(chainId);
      
      // Make the actual contract call to get a post
      // This should integrate with the actual blockchain implementation
      // Temporary placeholder response
      return {
        id: postId,
        content: 'Sample post content',
        title: 'Sample Post',
        author: '0x0000000000000000000000000000000000000000',
        timestamp: Math.floor(Date.now() / 1000),
        likes: 0,
        comments: [],
        metadata: '{}'
      };
    } catch (error) {
      console.error('Error getting tribe post:', error);
      return null;
    }
  },
  
  // Vote on a poll
  voteOnPoll: async (tribeId: number, postId: string, optionIndex: number) => {
    try {
      console.log(`Voting on poll ${postId} in tribe ${tribeId}, option ${optionIndex}`);
      
      // Get the necessary contracts and client
      const chainId = await getCurrentChainId();
      const contracts = getContracts(chainId);
      const client = getPublicClient(chainId);
      
      // This should make the actual contract call to vote on a poll
      // For now, let's return a hash that matches the expected type
      return `0x${Math.random().toString(16).substring(2).padStart(64, '0')}` as `0x${string}`;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  },
  
  // RSVP to an event
  rsvpToEvent: async (tribeId: number, postId: string, attending: boolean) => {
    try {
      console.log(`RSVP to event ${postId} in tribe ${tribeId}, attending: ${attending}`);
      
      // Get the necessary contracts and client
      const chainId = await getCurrentChainId();
      const contracts = getContracts(chainId);
      const client = getPublicClient(chainId);
      
      // This should make the actual contract call to RSVP to an event
      // For now, let's return a hash that matches the expected type
      return `0x${Math.random().toString(16).substring(2).padStart(64, '0')}` as `0x${string}`;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  },
  
  // Like a post
  likePost: async (tribeId: number, postId: string) => {
    try {
      console.log(`Liking post ${postId} in tribe ${tribeId}`);
      
      // Get the necessary contracts and client
      const chainId = await getCurrentChainId();
      const contracts = getContracts(chainId);
      const client = getPublicClient(chainId);
      
      // This should make the actual contract call to like a post
      // For now, let's return a hash that matches the expected type
      return `0x${Math.random().toString(16).substring(2).padStart(64, '0')}` as `0x${string}`;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },
  
  // Comment on a post
  commentOnPost: async (tribeId: number, postId: string, comment: string) => {
    try {
      console.log(`Commenting on post ${postId} in tribe ${tribeId}`);
      
      // Get the necessary contracts and client
      const chainId = await getCurrentChainId();
      const contracts = getContracts(chainId);
      const client = getPublicClient(chainId);
      
      // This should make the actual contract call to comment on a post
      // For now, let's return a hash that matches the expected type
      return `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`
    } catch (error) {
      console.error('Error commenting on post:', error);
      throw error;
    }
  },
};

/**
 * Ensure the user is a member of the specified tribe
 * @param contract The contract instance
 * @param tribeId The tribe ID
 * @param userAddress The user's address
 */
// async function ensureTribeMembership(contract, tribeId, userAddress) {
//   // try {
//   //   console.log(`Checking membership for tribe ${tribeId}...`);
    
//   //   // Check if tribe exists
//   //   // const tribeExists = await contract.tribeExists(tribeId);
//   //   // console.log(`Tribe ${tribeId} exists:`, tribeExists);
    
//   //   if (!tribeExists) {
//   //     console.log(`Tribe ${tribeId} does not exist, creating it...`);
      
//   //     // Create the tribe if it doesn't exist
//   //     if (typeof contract.createTribe === 'function') {
//   //       const createTribeTx = await contract.createTribe(
//   //         `Tribe ${tribeId}`,
//   //         `A tribe with ID ${tribeId}`,
//   //         false, // isPrivate
//   //         '0x0000000000000000000000000000000000000000', // collectibleContract
//   //         0, // collectibleId
//   //         {
//   //           gasLimit: 500000
//   //         }
//   //       );
        
//   //       console.log('Create tribe transaction sent:', createTribeTx.hash);
//   //       const createReceipt = await createTribeTx.wait();
//   //       console.log('Create tribe transaction receipt:', createReceipt);
//   //     } else {
//   //       throw new Error(`Cannot create tribe ${tribeId} - function not available`);
//   //     }
//   //   }
    
//   //   // Check if user is a member
//   //   const isMember = await contract.isTribeMember(tribeId, userAddress);
//   //   console.log(`Is member of tribe ${tribeId}:`, isMember);
    
//   //   if (!isMember) {
//   //     console.log(`Not a member of tribe ${tribeId}, joining...`);
      
//   //     // Join the tribe
//   //     if (typeof contract.joinTribe === 'function') {
//   //       const joinTx = await contract.joinTribe(tribeId, {
//   //         gasLimit: 300000
//   //       });
        
//   //       console.log('Join tribe transaction sent:', joinTx.hash);
//   //       const joinReceipt = await joinTx.wait();
//   //       console.log('Join tribe transaction receipt:', joinReceipt);
        
//   //       // Verify membership after joining
//   //       const isMemberNow = await contract.isTribeMember(tribeId, userAddress);
//   //       console.log(`Is member of tribe ${tribeId} now:`, isMemberNow);
        
//   //       if (!isMemberNow) {
//   //         throw new Error(`Failed to join tribe ${tribeId}`);
//   //       }
//   //     } else {
//   //       throw new Error(`Cannot join tribe ${tribeId} - function not available`);
//   //     }
//   //   }
    
//   //   console.log(`Successfully confirmed membership in tribe ${tribeId}`);
//   //   return true;
//   // } catch (error) {
//   //   console.error(`Error ensuring tribe membership for tribe ${tribeId}:`, error);
//   //   throw error;
//   // }
// }