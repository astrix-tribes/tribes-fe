export type ProposalStatus = 'active' | 'passed' | 'failed';

export enum VoteType {
  For = 'for',
  Against = 'against',
  Abstain = 'abstain'
}

export interface Vote {
  voter: string;
  support: boolean;
  power: number;
  timestamp: number;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  startTime: number;
  endTime: number;
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  votes: Vote[];
  tags: string[];
  myVote?: VoteType | null;
} 

