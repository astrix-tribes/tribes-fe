import { PostType } from './post';
import { EventDetails } from './event';

// Base interface for all post types
export interface BasePostDraft {
  title?: string;
  content: string;
  type: PostType | string;
  tribeId?: string;
  tags?: string[];
}

// Poll-specific interfaces
export interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

export interface PollDetails {
  options: PollOption[];
  endDate: string;
  allowMultipleChoices: boolean;
  requireVerification: boolean;
}

// Event-specific interfaces
export interface EventLocation {
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  physical?: string;
  virtual?: string;
}

export interface EventPostDetails {
  title?: string;
  organizer?: string;
  startDate: string;
  endDate: string;
  location: EventLocation | string;
  maxTickets: number;
  price: number;
}

// Media-specific interfaces
export interface MediaContent {
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

// Project-specific interfaces
export interface Milestone {
  title: string;
  dueDate: string;
  completed?: boolean;
}

export interface ProjectDetails {
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  budget?: string;
  team?: string[];
  milestones?: Milestone[];
}

// Resource/Link-specific interfaces
export interface Attachment {
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ResourceDetails {
  type: 'DOCUMENT' | 'LINK' | 'CODE' | 'OTHER';
  category?: string;
  version?: string;
  attachments?: Attachment[];
}

// Complete post draft interface with all possible fields
export interface PostDraft extends BasePostDraft {
  eventDetails?: EventPostDetails;
  pollDetails?: PollDetails;
  projectDetails?: ProjectDetails;
  resourceDetails?: ResourceDetails;
  mediaContent?: MediaContent[];
  description?: string;
}

// Type for the string values used by PostTypeFields
export type PostTypeString = 'text' | 'image' | 'video' | 'link' | 'event' | 'poll' | 'project' | 'resource' | 'rich_media';

// Mapping from PostType enum to string values
export const POST_TYPE_MAPPING: Record<number | string, PostTypeString> = {
  [PostType.TEXT]: 'text',
  [PostType.IMAGE]: 'image',
  [PostType.VIDEO]: 'video',
  [PostType.LINK]: 'link',
  [PostType.EVENT]: 'event',
  [PostType.POLL]: 'poll',
  PROJECT: 'project',
  RESOURCE: 'resource',
  RICH_MEDIA: 'rich_media'
};

// Component props interfaces
export interface PostTypeFieldsProps {
  type: PostTypeString;
}

export interface TypeSpecificFieldsProps {
  postDraft: PostDraft;
  updateDraft: (data: Partial<PostDraft>) => void;
}

export interface MediaPostFieldsProps extends TypeSpecificFieldsProps {
  mediaType: 'image' | 'video';
} 