export interface Topic {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'info';
}

export interface Category {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  memberCount: number;
  categories: Category[];
}

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  tribeId: string;
  topicId: string;
}

export * from './error';
export type { 
  MemberStatus as TribeMemberStatus,
  TribeConfig as TribeConfiguration,
} from './tribe';
export * from './feed';
export * from './governance';
export * from './contracts';