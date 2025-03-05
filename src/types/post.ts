/**
 * Types for post-related data structures
 */

import { PostInteractions } from './interaction';

export enum PostType {
  TEXT = 0,
  IMAGE = 1,
  VIDEO = 2,
  LINK = 3,
  EVENT = 4,
  POLL = 5
}

export interface PostStats {
  viewCount?: number;
  shareCount?: number;
  saveCount?: number;
  commentCount?: number;
  likeCount?: number;
  views?: number;
  engagement?: number;
}

export interface PostMetadata {
  type: PostType;
  content: string;
  title?: string;
  description?: string;
  media?: {
    url: string;
    type: string;
    width?: number;
    height?: number;
  }[];
  poll?: {
    question: string;
    options: string[];
    endDate?: string;
  };
  event?: {
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
  };
  link?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  tags?: string[];
  mentions?: string[];
  createdAt: string;
  [key: string]: any;
}

export interface Post {
  id: string;
  content: string;
  author: `0x${string}`;
  tribeId: number;
  createdAt: number;
  type: PostType;
  likes?: number;
  comments?: number;
  shares?: number;
  stats?: PostStats;
  metadata?: PostMetadata;
}

export interface PostWithMetadata extends Post {
  metadata: PostMetadata;
}

export interface BatchPostData {
  posts: Post[];
  total: number;
}

export interface CreatePostInput {
  content: string;
  tribeId: number;
  type: PostType;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    link?: string;
    eventDate?: string;
    eventLocation?: string;
    pollOptions?: string[];
  };
}

export interface CreateReplyInput {
  parentPostId: number;
  content: string;
  type?: PostType;
  isGated?: boolean;
}

export interface CreateEncryptedPostInput {
  tribeId: number;
  content: string;
  encryptionKeyHash: string;
  accessSigner: string;
}

export interface UpdatePostInput {
  postId: number;
  content: string;
  title?: string;
  type?: PostType;
}