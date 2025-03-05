export type FeedItemType = 
  | 'proposal'
  | 'bounty'
  | 'event'
  | 'nft'
  | 'project'
  | 'livestream'
  | 'poll';

export interface BaseFeedItem {
  id: string;
  type: FeedItemType;
  chainId: number; // Monad or Flash chain ID
  createdAt: number;
  creator: {
    address: string;
    username?: string;
    avatar?: string;
  };
}

export interface ProposalFeedItem extends BaseFeedItem {
  type: 'proposal';
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  endTime: number;
  status: 'active' | 'passed' | 'failed';
  minVotes?: number;
}

export interface BountyFeedItem extends BaseFeedItem {
  type: 'bounty';
  title: string;
  description: string;
  reward: {
    amount: number;
    token: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  deadline?: number;
  status: 'open' | 'in-progress' | 'completed';
}

export interface EventFeedItem extends BaseFeedItem {
  type: 'event';
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  location?: string;
  virtual: boolean;
  attendees: number;
  maxAttendees?: number;
}

export interface NFTFeedItem extends BaseFeedItem {
  type: 'nft';
  title: string;
  description: string;
  image: string;
  price?: {
    amount: number;
    token: string;
  };
  collection?: string;
}

export interface ProjectFeedItem extends BaseFeedItem {
  type: 'project';
  title: string;
  description: string;
  tags: string[];
  repository?: string;
  website?: string;
  stage: 'idea' | 'development' | 'live';
}

export interface LivestreamFeedItem extends BaseFeedItem {
  type: 'livestream';
  title: string;
  description: string;
  startTime: number;
  endTime?: number;
  status: 'scheduled' | 'live' | 'ended';
  thumbnail?: string;
  viewers?: number;
}

export interface PollFeedItem extends BaseFeedItem {
  type: 'poll';
  question: string;
  options: {
    text: string;
    votes: number;
  }[];
  endTime: number;
  totalVotes: number;
}

export type FeedItem =
  | ProposalFeedItem
  | BountyFeedItem
  | EventFeedItem
  | NFTFeedItem
  | ProjectFeedItem
  | LivestreamFeedItem
  | PollFeedItem; 