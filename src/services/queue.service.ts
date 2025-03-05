import { DBService } from './db.service';
import { IndexerService } from './indexer/IndexerService';

// Define the task types
export type TaskType = 
  | 'FETCH_POST' 
  | 'FETCH_TRIBE_POSTS' 
  | 'FETCH_USER_POSTS' 
  | 'INDEX_POST_CONTENT' 
  | 'INDEX_TRIBE_POSTS' 
  | 'UPDATE_USER_DATA'
  | 'CACHE_POST'           // Add new task type for caching posts
  | 'REFRESH_POST'         // Add new task type for refreshing individual posts
  | 'REFRESH_TRIBE_POSTS'   // Add new task type for refreshing tribe posts
  | 'REFRESH_USER_FEED';   // Add new task type for refreshing user feed

interface Task {
  id: string;
  type: TaskType;
  data: Record<string, any>;
  priority: number;
  createdAt: number;
  attempts: number;
  maxAttempts: number;
}

export class QueueService {
  private static instance: QueueService;
  private queue: Task[] = [];
  private isProcessing: boolean = false;
  private maxRetries = 3;
  private dbService: DBService;
  private isServer: boolean;

  private constructor() {
    this.isServer = typeof window === 'undefined';
    this.dbService = DBService.getInstance();
    this.startProcessing();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  // Start processing the queue in the background
  private startProcessing() {
    if (this.isServer) return;
    
    // Process queue every 5 seconds
    setInterval(() => {
      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue();
      }
    }, 5000);
  }

  // Process all tasks in the queue
  private async processQueue(): Promise<void> {
    if (this.isServer || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    if (!task) {
      this.isProcessing = false;
      return;
    }

    try {
      task.attempts++;
      await this.executeTask(task);
    } catch (error) {
      console.error(`Error executing task ${task.type}:`, error);
      
      if (task.attempts < task.maxAttempts) {
        // Requeue the task with reduced priority
        task.priority = Math.max(task.priority - 1, 0);
        this.queue.push(task);
        this.queue.sort((a, b) => b.priority - a.priority);
      }
    }

    // Continue processing the queue with a small delay
    setTimeout(() => {
      this.isProcessing = false;
      this.processQueue();
    }, 100);
  }

  private async executeTask(task: Task): Promise<void> {
    switch (task.type) {
      case 'FETCH_POST':
        await this.handleFetchPost(task.data.postId);
        break;
      case 'FETCH_TRIBE_POSTS':
        await this.handleFetchTribePosts(task.data.tribeId);
        break;
      case 'FETCH_USER_POSTS':
        await this.handleFetchUserPosts(task.data.userId);
        break;
      case 'INDEX_POST_CONTENT':
        await this.handleIndexPostContent(task.data.postId);
        break;
      case 'INDEX_TRIBE_POSTS':
        await this.handleIndexTribePosts(task.data.tribeId);
        break;
      case 'UPDATE_USER_DATA':
        await this.handleUpdateUserData(task.data.userId);
        break;
      case 'CACHE_POST':
        await this.handleCachePost(task.data.postId, task.data.post);
        break;
      case 'REFRESH_POST':
        await this.handleRefreshPost(task.data.postId);
        break;
      case 'REFRESH_TRIBE_POSTS':
        await this.handleRefreshTribePosts(task.data.tribeId);
        break;
      case 'REFRESH_USER_FEED':
        await this.handleRefreshUserFeed(task.data.userId);
        break;
      default:
        console.warn(`Unknown task type: ${(task as any).type}`);
    }
  }

  private async handleFetchPost(postId: string): Promise<void> {
    const post = await this.dbService.getPost(postId);
    if (post) {
      this.saveToLocalStorage('post', postId, post);
    }
  }

  private async handleFetchTribePosts(tribeId: string): Promise<void> {
    const posts = await this.dbService.getPostsByTribe(tribeId);
    this.saveToLocalStorage('tribe_posts', tribeId, posts);
  }

  private async handleFetchUserPosts(userId: string): Promise<void> {
    const posts = await this.dbService.getUserPosts(userId);
    this.saveToLocalStorage('user_posts', userId, posts);
  }

  private async handleIndexPostContent(postId: string): Promise<void> {
    try {
      // Store the content hash in local storage for now
      this.saveToLocalStorage('post_content', postId, { indexed: true });
    } catch (error) {
      console.error(`Error indexing post content for ${postId}:`, error);
    }
  }

  private async handleIndexTribePosts(tribeId: string): Promise<void> {
    try {
      // Store the tribe posts index in local storage for now
      this.saveToLocalStorage('tribe_index', tribeId, { indexed: true });
    } catch (error) {
      console.error(`Error indexing tribe posts for ${tribeId}:`, error);
    }
  }

  private async handleUpdateUserData(userId: string): Promise<void> {
    try {
      const userData = await this.dbService.getUserByAddress(userId);
      if (userData) {
        this.saveToLocalStorage('user_data', userId, userData);
      }
    } catch (error) {
      console.error(`Error updating user data for ${userId}:`, error);
    }
  }

  private async handleCachePost(postId: string, post: any): Promise<void> {
    try {
      // Save the post directly to localStorage with timestamp
      const storagePost = {...post, _timestamp: Date.now()};
      localStorage.setItem(`post_${postId}`, JSON.stringify(storagePost));
    } catch (error) {
      console.error(`Error caching post ${postId}:`, error);
    }
  }

  private async handleRefreshPost(postId: string): Promise<void> {
    try {
      // This would normally fetch from blockchain, but we'll trigger a DB fetch for now
      const post = await this.dbService.getPost(postId);
      if (post) {
        this.saveToLocalStorage('post', postId, post);
      }
    } catch (error) {
      console.error(`Error refreshing post ${postId}:`, error);
    }
  }

  private async handleRefreshTribePosts(tribeId: string): Promise<void> {
    try {
      // Fetch fresh tribe posts from DB
      const posts = await this.dbService.getPostsByTribe(tribeId);
      
      // Store the postIds and individual posts
      const postIds = posts.map(post => post.id.toString());
      
      // Save each post individually
      for (const post of posts) {
        const storagePost = {...post, _timestamp: Date.now()};
        localStorage.setItem(`post_${post.id}`, JSON.stringify(storagePost));
      }
      
      // Save the list of postIds
      localStorage.setItem(`tribe_posts_${tribeId}`, JSON.stringify({
        postIds,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error refreshing tribe posts for ${tribeId}:`, error);
    }
  }

  /**
   * Handle refreshing a user's feed in the background
   * @param userId The user ID to refresh feed for
   */
  private async handleRefreshUserFeed(userId: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would have more optimized code here
    
    try {
      const PostsService = (await import('./posts.service')).PostsService;
      const postsService = PostsService.getInstance();
      
      // Just call getUserFeed which will update the cache
      await postsService.getUserFeed(userId);
      
      // Save to localStorage if needed
      this.saveToLocalStorage('user_feed', userId, {
        refreshed: true,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Error refreshing user feed for ${userId}:`, error);
    }
  }

  private async saveToLocalStorage(type: string, id: string, data: any) {
    if (this.isServer) return;

    try {
      const key = `${type}:${id}`;
      const value = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  public static getFromLocalStorage(type: string, id: string): any | null {
    if (typeof window === 'undefined') return null;

    try {
      const key = `${type}:${id}`;
      const value = localStorage.getItem(key);
      if (!value) return null;

      const parsed = JSON.parse(value);
      if (parsed.expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  public addTask(type: TaskType, data: Record<string, any>, priority: number = 1, maxAttempts: number = 3): void {
    if (this.isServer) {
      return;
    }

    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      data,
      priority,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts
    };

    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }
} 