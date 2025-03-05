import { WalletClient } from 'viem';
import { Post } from './post';

export interface PostMetadata {
  type: string;
  content: string;
  title?: string;
  description?: string;
  tags?: string[];
  images?: string[];
  videos?: string[];
  timestamp?: number;
}

export interface PostInteractions {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
}

export interface PostWithMetadata {
  id: number;
  creator: string;
  tribeId: string;
  metadata: PostMetadata;
  interactions?: PostInteractions;
}

export interface TribeMetadata {
  description: string;
  coverImage?: string;
  createdAt: string;
  [key: string]: any;
}

export interface TribeData {
  id: number;
  name: string;
  metadata: TribeMetadata;
  admins: string[];
  joinType: number;
  entryFee: bigint;
  nftRequirements: any[];
  memberCount: number;
  createdAt: string;
  isPrivate: boolean;
  userMembershipStatus?: {
    isMember: boolean;
    isAdmin: boolean;
    isPending: boolean;
    status: number;
  };
}

export interface ProfileData {
  tokenId: string;
  username: string;
  metadata: string;
  nftUri: string;
  owner: string;
}

export interface TribesHelper {
  connect(walletClient: WalletClient, address: string): Promise<void>;
  createTribe(
    name: string,
    metadata: string,
    admins?: string[],
    joinType?: number,
    entryFee?: bigint,
    nftRequirements?: any[]
  ): Promise<number>;
  joinTribe(tribeId: number): Promise<void>;
  requestToJoinTribe(tribeId: number, entryFee: bigint): Promise<void>;
  getMemberStatus(tribeId: number, memberAddress: string): Promise<number>;
  getTribeData(tribeId: number): Promise<TribeData>;
  getUserTribes(userAddress: string): Promise<number[]>;
  getTribesCount(): Promise<number>;
  getPost(id: number): Promise<PostWithMetadata>;
  getPostsByTribe(tribeId: string): Promise<PostWithMetadata[]>;
  getUserPosts(userId: string): Promise<PostWithMetadata[]>;
  createPost(post: PostWithMetadata): Promise<PostWithMetadata>;
  updatePost(id: number, post: Partial<PostWithMetadata>): Promise<PostWithMetadata>;
  deletePost(id: number): Promise<boolean>;
  likePost(id: number): Promise<boolean>;
  commentPost(id: number, content: string): Promise<boolean>;
  sharePost(id: number): Promise<boolean>;
  getPostWithMetadata(postId: number): Promise<PostWithMetadata>;
  getPostReplies(postId: number): Promise<number[]>;
  getPostDecryptionKey(postId: number, viewer: string): Promise<string>;
  mapPostDataToUIFormat(postData: PostWithMetadata, user?: string): Post;
  
  // Profile methods
  getProfile(profileId: number): Promise<ProfileData>;
  updateProfileMetadata(profileId: number, metadata: string): Promise<void>;
  isUsernameAvailable(username: string): Promise<boolean>;
  getProfileIdByUsername(username: string): Promise<number>;
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  memberCount: number;
  members: number;
  isPrivate: boolean;
  entryFee: string;
  admins: `0x${string}`[];
  isMember: boolean;
  isAdmin: boolean;
  isPending: boolean;
  isVerified: boolean;
  topics: string[];
  createdAt: number | string;
  joinType?: number;
} 