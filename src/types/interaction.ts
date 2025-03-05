/**
 * Types for interactions with posts and tribes
 */

export enum InteractionType {
  Like = 0,
  Comment = 1,
  Share = 2,
  Save = 3,
  Report = 4
}

export interface InteractionCount {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reports: number;
}

export interface PostInteractions {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
}

export interface UserInteraction {
  type: InteractionType;
  timestamp: number;
  metadata?: string;
} 