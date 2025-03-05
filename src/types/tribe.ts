/**
 * Types for tribe-related data structures
 */

import { PostInteractions } from './interaction';

export enum TribeJoinType {
  Open = 0,
  Approval = 1,
  Closed = 2
}

export enum MemberStatus {
  NotMember = 0,
  Member = 1,
  Admin = 2,
  Pending = 3,
  Rejected = 4
}

export interface TribeMetadata {
  description: string;
  coverImage?: string;
  avatar?: string;
  createdAt: string;
  topics?: string[];
  website?: string;
  social?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

export interface TribeConfig {
  name: string;
  description: string;
  coverImage?: string;
  avatar?: string;
  isPrivate: boolean;
  entryFee: string;
  nftRequirements: NFTRequirement[];
  metadata: TribeMetadata;
  admins: string[];
  joinType: number;
}

export interface NFTRequirement {
  contractAddress: `0x${string}`;
  tokenId: bigint;
  minBalance: bigint;
}

export interface TribeConfigResponse {
  success: boolean;
  name?: string;
  metadata?: any;
  admins?: string[];
  joinType?: number;
  entryFee?: string;
  nftRequirements?: NFTRequirement[];
  data?: TribeConfig;
  error?: string;
}

export interface TribeMember {
  id: string;
  username: string;
  avatar: string;
  role?: 'admin' | 'member';
}

export interface Topic {
  id: string;
  name: string;
  postCount?: number;
}

export interface TribeData {
  id: string;
  name: string;
  metadata: string;
  owner: `0x${string}`;
  admins: `0x${string}`[];
  memberCount: number;
  createdAt: number;
  joinType: number;
  entryFee: bigint;
  nftRequirements: NFTRequirement[];
  isPrivate?: boolean;
  isActive?: boolean;
  canMerge?: boolean;
  userMembershipStatus?: MembershipData;
  members?: TribeMember[];
}

export interface Tribe {
  id: string;
  name: string;
  metadata: string;
  owner: `0x${string}`;
  admins: `0x${string}`[];
  memberCount: number;
  createdAt: number;
  joinType: number;
  entryFee: bigint;
  nftRequirements: NFTRequirement[];
}

export interface MembershipData {
  isMember: boolean;
  isAdmin: boolean;
  isPending: boolean;
  status: MemberStatus;
}

export interface DefaultImageConfig {
  avatar: string;
  cover: string;
}

export interface DefaultImages {
  [chainId: string]: DefaultImageConfig;
}

export interface MetadataCacheEntry {
  data: any;
  metadata?: string;
  timestamp: number;
}

export interface MetadataCache {
  [key: string]: MetadataCacheEntry;
}