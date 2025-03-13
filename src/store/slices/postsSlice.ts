import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, PostType, PostMetadata, PostStats } from '../../types/post';
import { RootState } from '../store';
import { 
  createBlockchainPost, 
  getBlockchainPost, 
  PostCreateParams 
} from '../../utils/postHelpers';

// Define the BlockchainData interface
interface BlockchainData {
  txHash: `0x${string}`;
  confirmed: boolean;
  blockNumber?: number;
  timestamp?: number;
}

// Extend the PostCreateParams to include tribeId which is needed for our app
interface ExtendedPostCreateParams extends PostCreateParams {
  tribeId: string;
  description?: string;
}

export interface PostsState {
  loading: boolean;
  creatingPost: boolean;
  error: string | null;
  posts: Post[];
  draft: ExtendedPostCreateParams;
  pendingPosts: string[]; // List of pending transaction hashes
}

const initialState: PostsState = {
  loading: false,
  creatingPost: false,
  error: null,
  posts: [],
  draft: {
    type: 'TEXT', // Use string instead of enum
    content: '',
    tribeId: '',
    title: '',
    description: '',
    tags: [],
    mediaContent: [],
  },
  pendingPosts: [],
};

// Validate post data before submission
const validatePostData = (draft: ExtendedPostCreateParams): { valid: boolean; error?: string } => {
  // Common validation for all post types
  if (!draft.content?.trim()) {
    return { valid: false, error: 'Content is required' };
  }

  // Type-specific validation
  switch (draft.type) {
    case 'EVENT':
      if (draft.eventDetails && !draft.eventDetails.startDate) {
        return { valid: false, error: 'Event start date is required' };
      }
      break;
    case 'POLL':
      if (!draft.pollDetails?.options?.length) {
        return { valid: false, error: 'Poll options are required' };
      }
      break;
  }

  return { valid: true };
};

// Helper to create a post metadata object that satisfies PostMetadata requirements
const createMetadata = (postData: ExtendedPostCreateParams): PostMetadata => {
  // Convert string type to enum
  const postType = 
    typeof postData.type === 'string' 
      ? postData.type === 'TEXT' ? PostType.TEXT
      : postData.type === 'IMAGE' ? PostType.IMAGE
      : postData.type === 'VIDEO' ? PostType.VIDEO
      : postData.type === 'LINK' ? PostType.LINK
      : postData.type === 'EVENT' ? PostType.EVENT
      : postData.type === 'POLL' ? PostType.POLL
      : PostType.TEXT
      : PostType.TEXT;

  return {
    type: postType,
    content: postData.content,
    title: postData.title || '',
    description: postData.description || '',
    tags: postData.tags || [],
    media: postData.mediaContent?.map((m: any) => ({
      url: m.url,
      type: m.type,
      width: m.width,
      height: m.height,
    })) || [],
    // Handle event data
    event: postData.type === 'EVENT' && postData.eventDetails ? {
      title: postData.eventDetails.title || postData.title || '',
      startDate: postData.eventDetails.startDate,
      endDate: postData.eventDetails.endDate,
      location: postData.eventDetails.location,
    } : undefined,
    // Handle poll data
    poll: postData.type === 'POLL' && postData.pollDetails ? {
      question: postData.title || 'Poll',
      options: Array.isArray(postData.pollDetails.options) 
        ? typeof postData.pollDetails.options[0] === 'string'
          ? postData.pollDetails.options 
          : postData.pollDetails.options.map((o: any) => o.text || o.toString())
        : [],
      endDate: postData.pollDetails.endDate,
    } : undefined,
    // Add required createdAt field
    createdAt: new Date().toISOString(),
  };
};

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: any, { rejectWithValue }) => {
    try {
      // Call the blockchain utility
      const postId = await createBlockchainPost(postData);
      console.log(`[createPost]: Post created with hash in PostSlice: ${postData}`);
      // Return the created post with ID
      return {
        id: postId,
        ...postData,
        createdAt: Date.now()
      };
    } catch (error: any) {
      console.error('Error in createPost thunk:', error);
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

export const fetchPostsByTribe = createAsyncThunk(
  'posts/fetchByTribe',
  async (tribeId: string, { rejectWithValue }) => {
    try {
      // Mock API call to fetch posts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would call an API to fetch posts
      // For now, we'll generate some dummy data
      const dummyPosts: Post[] = [];
      for (let i = 0; i < 5; i++) {
        const postTypeString = ['TEXT', 'EVENT', 'POLL', 'IMAGE', 'VIDEO'][i % 5];
        const postType = 
          postTypeString === 'TEXT' ? PostType.TEXT
          : postTypeString === 'IMAGE' ? PostType.IMAGE
          : postTypeString === 'VIDEO' ? PostType.VIDEO
          : postTypeString === 'LINK' ? PostType.LINK
          : postTypeString === 'EVENT' ? PostType.EVENT
          : postTypeString === 'POLL' ? PostType.POLL
          : PostType.TEXT;
        
        const post: Post = {
          id: `post-${i}-${Date.now()}`,
          content: `This is post #${i} content with some text content.`,
          author: '0x0000000000000000000000000000000000000000',
          createdAt: Date.now() - (i * 86400000), // days ago
          type: postType,
          tribeId: parseInt(tribeId),
          metadata: {
            type: postType,
            content: `This is post #${i} content with some text content.`,
            title: `Post #${i}`,
            description: `This is a ${postTypeString} post #${i}`,
            tags: [],
            createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
            event: postTypeString === 'EVENT' ? {
              title: `Event #${i}`,
              startDate: new Date(Date.now() + 86400000).toISOString(),
              endDate: new Date(Date.now() + 90000000).toISOString(),
              location: 'Virtual',
            } : undefined,
            poll: postTypeString === 'POLL' ? {
              question: `Poll Question #${i}`,
              options: ['Option 1', 'Option 2'],
              endDate: new Date(Date.now() + 86400000).toISOString(),
            } : undefined,
          },
          stats: {
            viewCount: Math.floor(Math.random() * 500),
            shareCount: Math.floor(Math.random() * 10),
            saveCount: Math.floor(Math.random() * 5),
            commentCount: Math.floor(Math.random() * 20),
            likeCount: Math.floor(Math.random() * 50),
          }
        };
        
        dummyPosts.push(post);
      }
      
      return dummyPosts;
    } catch (error) {
      return rejectWithValue('Failed to fetch posts');
    }
  }
);

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setCreatingPost: (state, action: PayloadAction<boolean>) => {
      state.creatingPost = action.payload;
    },
    // Re-add the setPostType action for backward compatibility
    setPostType: (state, action: PayloadAction<PostType | string>) => {
      state.draft.type = typeof action.payload === 'string' ? action.payload : PostType[action.payload];
    },
    updateDraft: (state, action: PayloadAction<Partial<ExtendedPostCreateParams>>) => {
      state.draft = {
        ...state.draft,
        ...action.payload
      };
    },
    resetDraft: (state) => {
      state.draft = initialState.draft;
    },
    updatePostStatus: (state, action: PayloadAction<{ txHash: string; confirmed: boolean; postId?: string }>) => {
      const { txHash, confirmed, postId } = action.payload;
      // Find post by blockchain transaction hash
      const post = state.posts.find(p => {
        if (p.metadata) {
          const blockchainData = p.metadata.blockchainData as BlockchainData | undefined;
          return blockchainData?.txHash === txHash;
        }
        return false;
      });
      
      if (post && post.metadata) {
        // Update blockchain data if it exists
        const blockchainData = post.metadata.blockchainData as BlockchainData | undefined;
        if (blockchainData) {
          blockchainData.confirmed = confirmed;
        } else {
          // Create blockchain data if it doesn't exist
          post.metadata.blockchainData = {
            txHash: txHash as `0x${string}`,
            confirmed
          };
        }
        
        // Update post ID if provided
        if (postId) {
          post.id = postId;
        }
      }
      
      // Remove from pending posts if confirmed
      if (confirmed) {
        state.pendingPosts = state.pendingPosts.filter(hash => hash !== txHash);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.creatingPost = false;
        state.draft = initialState.draft;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostsByTribe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsByTribe.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPostsByTribe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCreatingPost, setPostType, updateDraft, resetDraft, updatePostStatus } = postsSlice.actions;

export const selectPostsState = (state: RootState) => state.posts;
export const selectPostDraft = (state: RootState) => state.posts.draft;
export const selectCreatingPost = (state: RootState) => state.posts.creatingPost;
export const selectPostsError = (state: RootState) => state.posts.error;
export const selectPendingPosts = (state: RootState) => state.posts.pendingPosts;

export default postsSlice.reducer; 