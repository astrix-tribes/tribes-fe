/**
 * Types for user-related data structures
 */

export interface UserMetadata {
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  email?: string;
  interests?: string[];
  skills?: string[];
  location?: string;
  [key: string]: any;
}

export interface ProfileMetadata {
  avatar: string;
  bio: string;
  createdAt: number;
}

export interface ProfileData {
  tokenId: string;
  username: string;
  metadata: ProfileMetadata;
  nftUri: string;
  owner: string;
}

export type ProfileErrorCode = 
  | 'NO_PROFILE' 
  | 'INVALID_ADDRESS' 
  | 'CONTRACT_ERROR' 
  | 'WRONG_CHAIN'
  | 'SDK_NOT_INITIALIZED'
  | 'FETCH_ERROR';

export interface ProfileError {
  code: ProfileErrorCode;
  message: string;
}

export interface User {
  id: string;
  username: string;
  address: string;
  avatar: string;
  bio: string;
  website?: string;
  twitter?: string;
  createdAt: string;
  isVerified: boolean;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface UserProfileCache {
  [address: string]: {
    profileId?: number;
    username?: string;
    metadata?: string;
    parsedMetadata?: UserMetadata;
    timestamp: number;
  };
} 