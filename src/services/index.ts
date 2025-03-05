import { DBService } from './db.service';
import { QueueService } from './queue.service';
import { IndexerService } from './indexer/IndexerService';
import { PostsService } from './posts.service';

// Export service classes first
export { PostsService, DBService, QueueService, IndexerService };

// Initialize indexer service with default chain ID (will be updated on init)
let indexerInstance: IndexerService | null = null;

export const getIndexerService = (chainId?: number) => {
  if (!indexerInstance) {
    indexerInstance = new IndexerService(chainId || 0);
  } else if (chainId) {
    // Update chain ID if provided
    indexerInstance = new IndexerService(chainId);
  }
  return indexerInstance;
};

// Export convenience method for posts service
export const getPostsService = () => {
  return PostsService.getInstance();
};

// Export service getters instead of direct instances
export const services = {
  getDB: () => DBService.getInstance(),
  getQueue: () => QueueService.getInstance(),
  getPosts: () => PostsService.getInstance(),
  getIndexer: getIndexerService
}; 