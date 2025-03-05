import { Proposal, ProposalStatus, VoteType } from '../types/governance';

// Generate random dates within the last month
const getRandomDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate mock proposals
export const mockProposals: Array<any> = [
  {
    id: '1',
    title: 'Implement Cross-Chain Messaging Protocol',
    description: 'This proposal aims to implement a secure cross-chain messaging protocol that will allow seamless communication between Monad and other EVM-compatible chains.',
    status: 'active',
    proposer: '0x1234567890abcdef1234567890abcdef12345678',
    proposerName: 'MonadLabs',
    createdAt: getRandomDate(15),
    endTime: getRandomDate(-15), // Future date
    votesFor: 1250000,
    votesAgainst: 450000,
    votesAbstain: 75000,
    quorum: 2000000,
    tags: ['protocol', 'infrastructure', 'cross-chain'],
    chainId: 1,
    discussion: 'https://forum.monad.xyz/t/cross-chain-messaging-protocol/123',
    myVote: null
  },
  {
    id: '2',
    title: 'Treasury Allocation for Developer Grants',
    description: 'Allocate 500,000 MONAD tokens from the treasury to fund developer grants over the next 6 months, focusing on DeFi and infrastructure projects.',
    status: 'passed',
    proposer: '0x2345678901abcdef2345678901abcdef23456789',
    proposerName: 'MonadDAO',
    createdAt: getRandomDate(45),
    endTime: getRandomDate(15),
    votesFor: 3200000,
    votesAgainst: 250000,
    votesAbstain: 50000,
    quorum: 2000000,
    tags: ['treasury', 'grants', 'development'],
    chainId: 1,
    discussion: 'https://forum.monad.xyz/t/treasury-allocation-for-developer-grants/456',
    myVote: VoteType.For
  },
  {
    id: '3',
    title: 'Reduce Transaction Fees for NFT Minting',
    description: 'Implement a fee reduction mechanism for NFT minting transactions to encourage more creative projects to build on Monad.',
    status: 'failed',
    proposer: '0x3456789012abcdef3456789012abcdef34567890',
    proposerName: 'NFTCreators',
    createdAt: getRandomDate(60),
    endTime: getRandomDate(30),
    votesFor: 950000,
    votesAgainst: 1100000,
    votesAbstain: 150000,
    quorum: 2000000,
    tags: ['fees', 'NFT', 'incentives'],
    chainId: 1,
    discussion: 'https://forum.monad.xyz/t/reduce-transaction-fees-for-nft-minting/789',
    myVote: VoteType.Against
  },
  {
    id: '4',
    title: 'Upgrade Governance Voting Mechanism',
    description: 'Implement quadratic voting to reduce plutocracy and give more voice to smaller token holders in the governance process.',
    status: 'active',
    proposer: '0x4567890123abcdef4567890123abcdef45678901',
    proposerName: 'GovernanceWG',
    createdAt: getRandomDate(10),
    endTime: getRandomDate(-20), // Future date
    votesFor: 1800000,
    votesAgainst: 900000,
    votesAbstain: 100000,
    quorum: 2000000,
    tags: ['governance', 'voting', 'quadratic'],
    chainId: 1,
    discussion: 'https://forum.monad.xyz/t/upgrade-governance-voting-mechanism/101',
    myVote: VoteType.For
  },
  {
    id: '5',
    title: 'Launch Monad Developer Academy',
    description: 'Establish a comprehensive educational program to train developers in Monad-specific development practices and tools.',
    status: 'passed',
    proposer: '0x5678901234abcdef5678901234abcdef56789012',
    proposerName: 'EduDAO',
    createdAt: getRandomDate(90),
    endTime: getRandomDate(60),
    votesFor: 2700000,
    votesAgainst: 300000,
    votesAbstain: 200000,
    quorum: 2000000,
    tags: ['education', 'development', 'community'],
    chainId: 1,
    discussion: 'https://forum.monad.xyz/t/launch-monad-developer-academy/202',
    myVote: null
  }
]; 