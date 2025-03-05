# Post Caching Architecture

This document outlines the post caching architecture implemented in the Tribes application to optimize performance and reduce blockchain calls.

## Overview

The post caching system consists of several components working together:

1. **PostsService** - Core service that handles post data fetching and caching
2. **usePostsData Hook** - React hook that provides a clean interface to the PostsService
3. **UI Components** - Components that use the hook to display and manage posts

## Caching Mechanisms

The system implements multiple layers of caching:

### 1. In-Memory LRU Cache

- Uses a Least Recently Used (LRU) caching strategy
- Limits the number of cached items to prevent memory leaks
- Provides fast access to recently accessed posts

```typescript
class LRUCache<K, V> {
  private readonly max: number;
  private readonly cache: Map<K, V>;

  constructor(max: number = 100) {
    this.max = max;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item) {
      // Refresh the item's position in the cache
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: K, val: V): void {
    // If the key exists, refresh it
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict the oldest item if we're at capacity
    else if (this.cache.size >= this.max) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, val);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### 2. LocalStorage Persistence

- Stores posts and tribe posts in the browser's localStorage
- Persists data between page refreshes
- Uses JSON serialization with expiration timestamps

### 3. Background Synchronization

- Synchronizes posts in the background
- Updates the UI when new data is available
- Manages loading and error states

## Key Components

### PostsService

The PostsService is a singleton class that handles:

- Fetching posts from the blockchain
- Caching posts in memory and localStorage
- Providing methods to access and manage posts
- Handling cache invalidation and refreshing

Methods include:
- `getTribesPosts(tribeId: string): Promise<Post[]>`
- `getPostById(postId: string): Promise<Post | null>`
- `refreshTribePosts(tribeId: string): Promise<Post[]>`
- `clearPostFromCache(postId: string): void`
- `clearTribeCache(tribeId: string): void`

### usePostsData Hook

This React hook provides a clean interface to the PostsService:

```typescript
function usePostsData(): PostsDataHookResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [postsByTribe, setPostsByTribe] = useState<Record<string, Post[]>>({});
  const [postsById, setPostsById] = useState<Record<string, Post>>({});

  // Hook methods for accessing and managing posts
  const getPostById = useCallback(...);
  const getPostsByTribe = useCallback(...);
  const refreshPost = useCallback(...);
  const refreshTribePosts = useCallback(...);

  // Initialize PostsService and set up sync listener
  useEffect(...);

  return {
    isLoading,
    error,
    isSyncing,
    postsByTribe,
    postsById,
    getPostById,
    getPostsByTribe,
    refreshPost,
    refreshTribePosts
  };
}
```

### UI Components

The UI components provide visual feedback to the user:

- **PostsFeed** - Displays posts for a tribe with filtering
- **PostsRefreshButton** - Allows manual refreshing of tribe posts
- **PostsSyncStatus** - Shows synchronization status

## Usage Example

```tsx
function MyTribeComponent({ tribeId }) {
  const { 
    postsByTribe, 
    isLoading, 
    error, 
    isSyncing, 
    refreshTribePosts 
  } = usePostsData();

  const tribePosts = postsByTribe[tribeId] || [];

  return (
    <div>
      <h1>Tribe Posts</h1>
      {isLoading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : tribePosts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        <div>
          {tribePosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <button onClick={() => refreshTribePosts(tribeId)}>
        Refresh Posts {isSyncing && "(Syncing...)"}
      </button>
    </div>
  );
}
```

## Performance Benefits

- Reduced blockchain calls by caching frequently accessed data
- Faster UI rendering with local data
- Better user experience with visual loading states
- Background synchronization for fresh data without blocking the UI

## Future Improvements

- Implement WebSocket integration for real-time updates
- Add offline support using IndexedDB
- Improve cache invalidation strategies 