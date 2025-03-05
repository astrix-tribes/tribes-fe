import { Address } from 'viem';
import { Post as PostModel, PostType as PostTypeEnum } from './post';

export enum JoinType {
  PUBLIC,
  PRIVATE,
  INVITE_ONLY
}

export enum MemberStatusType {
  NONE,
  PENDING,
  ACTIVE,
  BANNED
}

export enum PostType {
  TEXT,
  IMAGE,
  VIDEO,
  LINK
}

export interface TribeConfig {
  joinType: JoinType;
  entryFee: bigint;
  collectibleRequirement: Address;
}

export interface MemberStatus {
  status: MemberStatusType;
  timestamp: bigint;
}

export interface Tribe {
  id: bigint;
  name: string;
  metadata: string;
  admin: Address;
  config: TribeConfig;
}

export interface Profile {
  tokenId: bigint;
  username: string;
  metadata: string;
  nftUri: string;
  owner: Address;
}

export interface Event {
  id: bigint;
  tribeId: bigint;
  name: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  maxTickets: bigint;
  ticketPrice: bigint;
  organizer: Address;
  cancelled: boolean;
}

export interface Collectible {
  id: bigint;
  tribeId: bigint;
  name: string;
  symbol: string;
  metadataUri: string;
  maxSupply: bigint;
  currentSupply: bigint;
  price: bigint;
  pointsRequired: bigint;
  isActive: boolean;
}

export interface Post {
  id: bigint;
  tribeId: bigint;
  creator: Address;
  contentUri: string;
  postType: PostType;
  timestamp: bigint;
}

export interface Poll extends Post {
  options: string[];
  duration: bigint;
  votes: bigint[];
}

export interface PostMinterContract {
  // Post Management
  getPost(postId: number): Promise<any>;
  getPostsByUser(userAddress: string, offset: bigint, limit: bigint): Promise<[any[], bigint]>;
  getPostsByTribe(tribeId: string, offset: bigint, limit: bigint): Promise<[any[], bigint]>;
  createPost(tribeId: number, metadata: string, postType: PostType, content: string): Promise<any>;
  
  // Post Interactions
  likePost(postId: number): Promise<void>;
  unlikePost(postId: number): Promise<void>;
  commentOnPost(postId: number, content: string): Promise<void>;
  sharePost(postId: number): Promise<void>;
  
  // Post Metadata
  getPostMetadata(postId: number): Promise<any>;
  updatePostMetadata(postId: number, metadata: string): Promise<void>;
  
  // Events
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
} 