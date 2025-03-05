import { FeedItem } from '../types/feed';
import { MONAD_CHAIN_ID, FUSE_CHAIN_ID } from '../utils/chain';

// Helper to generate random dates within the last week
const getRandomDate = (daysAgo = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate mock feed items
export const mockFeedItems: any = [
  // Proposals
  {
    id: 'prop-1',
    type: 'proposal',
    title: 'Implement Cross-Chain Messaging Protocol',
    description: 'This proposal aims to implement a secure cross-chain messaging protocol.',
    createdAt: getRandomDate(2),
    chainId: MONAD_CHAIN_ID,
    author: {
      id: 'user-1',
      name: 'MonadLabs',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadLabs'
    },
    status: 'active',
    votesFor: 1250000,
    votesAgainst: 450000,
    endTime: getRandomDate(-5) // Future date
  },
  
  // Bounties
  {
    id: 'bounty-1',
    type: 'bounty',
    title: 'Develop a Cross-Chain Bridge UI',
    description: 'Create a user-friendly interface for the new cross-chain bridge.',
    createdAt: getRandomDate(1),
    chainId: MONAD_CHAIN_ID,
    author: {
      id: 'user-2',
      name: 'BridgeDAO',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BridgeDAO'
    },
    reward: '5000 MONAD',
    deadline: getRandomDate(-10), // Future date
    difficulty: 'Intermediate',
    status: 'open'
  },
  
  // Events
  {
    id: 'event-1',
    type: 'event',
    title: 'Monad Developer Conference',
    description: 'Join us for a day of learning and networking with Monad developers.',
    createdAt: getRandomDate(5),
    chainId: MONAD_CHAIN_ID,
    author: {
      id: 'user-3',
      name: 'MonadEvents',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadEvents'
    },
    startDate: getRandomDate(-15), // Future date
    endDate: getRandomDate(-16), // Future date
    location: 'Virtual',
    attendees: 230
  },
  
  // NFTs
  {
    id: 'nft-1',
    type: 'nft',
    title: 'Genesis Monad Builders',
    description: 'Limited edition NFTs for early Monad ecosystem builders.',
    createdAt: getRandomDate(3),
    chainId: FUSE_CHAIN_ID,
    author: {
      id: 'user-4',
      name: 'MonadArtists',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadArtists'
    },
    imageUrl: 'https://placehold.co/600x400/2a2a2a/FFFFFF/png?text=Monad+Builders+NFT',
    price: '0.5 ETH',
    collection: 'Monad Builders'
  },
  
  // Projects
  {
    id: 'project-1',
    type: 'project',
    title: 'MonadSwap - Efficient DEX',
    description: 'A high-performance decentralized exchange built specifically for Monad.',
    createdAt: getRandomDate(6),
    chainId: MONAD_CHAIN_ID,
    author: {
      id: 'user-5',
      name: 'SwapTeam',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SwapTeam'
    },
    status: 'In Development',
    github: 'https://github.com/monad/monadswap',
    tags: ['DeFi', 'DEX', 'Trading']
  },
  
  // Livestreams
  {
    id: 'stream-1',
    type: 'livestream',
    title: 'Building on Monad: Best Practices',
    description: 'Learn how to optimize your dApps for the Monad ecosystem.',
    createdAt: getRandomDate(0.5),
    chainId: MONAD_CHAIN_ID,
    author: {
      id: 'user-6',
      name: 'MonadEdu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadEdu'
    },
    streamUrl: 'https://youtube.com/live/monad-best-practices',
    scheduledFor: getRandomDate(-2), // Future date
    duration: 90 // minutes
  },
  
  // Polls
  {
    id: 'poll-1',
    type: 'poll',
    question: 'Which feature should we prioritize next?',
    createdAt: getRandomDate(1),
    chainId: FUSE_CHAIN_ID,
    author: {
      id: 'user-7',
      name: 'MonadCore',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadCore'
    },
    options: [
      { id: '1', text: 'Cross-chain messaging', votes: 342 },
      { id: '2', text: 'Improved developer tools', votes: 518 },
      { id: '3', text: 'Mobile wallet integration', votes: 276 },
      { id: '4', text: 'Layer 2 scaling solution', votes: 403 }
    ],
    endTime: getRandomDate(-3), // Future date
    totalVotes: 1539
  }
]; 