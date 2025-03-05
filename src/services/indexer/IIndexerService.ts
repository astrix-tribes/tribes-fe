import { Post } from '../../types/post';
import { Tribe } from '../../types/tribe';
import { ProfileData } from '../../types/user';

export interface IIndexerService {
  // Posts
  getPostsSince(timestamp: number): Promise<Post[]>;
  getPostsByUser(address: string): Promise<Post[]>;
  getPostsByTribe(tribeId: number): Promise<Post[]>;
  
  // Tribes
  getTribesSince(timestamp: number): Promise<Tribe[]>;
  getTribesByUser(address: string): Promise<Tribe[]>;
  
  // Profiles
  getProfilesByAddresses(addresses: string[]): Promise<ProfileData[]>;
  updateUserMetadata(address: string, metadata: string): Promise<void>;
  
  // Cache management
  clearCache(): void;
  refreshCache(): Promise<void>;
} 