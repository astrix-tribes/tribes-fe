import React, { useEffect, useState } from 'react';
import { useTribesPost } from '../../hooks/useTribesPost';
import { PostInteractionType } from '../../hooks/useTribesPost';
import { useWalletClient } from 'wagmi';

interface PostListProps {
  tribeId?: number;
  userAddress?: string;
  limit?: number;
}

export const PostList: React.FC<PostListProps> = ({
  tribeId,
  userAddress,
  limit = 10
}) => {
  const { data: walletClient } = useWalletClient();
  const [offset, setOffset] = useState(0);
  
  // Post management hook
  const {
    postsPage,
    isLoading,
    error,
    getPostsByTribe,
    getPostsByUser,
    interactWithPost,
    getInteractionCount
  } = useTribesPost();
  
  // State for interaction counts
  const [likesCounts, setLikesCounts] = useState<Record<number, number>>({});
  const [isLikingPost, setIsLikingPost] = useState<Record<number, boolean>>({});
  
  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (tribeId) {
          await getPostsByTribe(tribeId, offset, limit);
        } else if (userAddress) {
          await getPostsByUser(userAddress, offset, limit);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    
    fetchPosts();
  }, [tribeId, userAddress, offset, limit, getPostsByTribe, getPostsByUser]);
  
  // Fetch like counts for posts
  useEffect(() => {
    const fetchLikeCounts = async () => {
      if (!postsPage || !postsPage.posts.length) return;
      
      const counts: Record<number, number> = {};
      
      for (const post of postsPage.posts) {
        try {
          const count = await getInteractionCount(post.id, PostInteractionType.LIKE);
          counts[post.id] = count;
        } catch (err) {
          console.error(`Error fetching like count for post ${post.id}:`, err);
          counts[post.id] = 0;
        }
      }
      
      setLikesCounts(counts);
    };
    
    fetchLikeCounts();
  }, [postsPage, getInteractionCount]);
  
  // Handle like button click
  const handleLike = async (postId: number) => {
    if (!walletClient) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsLikingPost(prev => ({ ...prev, [postId]: true }));
    
    try {
      await interactWithPost(postId, PostInteractionType.LIKE);
      
      // Update like count optimistically
      setLikesCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLikingPost(prev => ({ ...prev, [postId]: false }));
    }
  };
  
  // Handle pagination
  const loadMorePosts = () => {
    setOffset(prev => prev + limit);
  };
  
  // Parse post metadata
  const parsePostMetadata = (metadataStr: string) => {
    try {
      return JSON.parse(metadataStr);
    } catch (err) {
      console.error('Error parsing post metadata:', err);
      return { content: 'Error loading post content', media: [] };
    }
  };
  
  if (isLoading && !postsPage) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }
  
  if (!postsPage || postsPage.posts.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No posts found
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {postsPage.posts.map(post => {
        const metadata = parsePostMetadata(post.metadata);
        return (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start mb-3">
              <div className="flex-grow">
                <p className="text-gray-500 text-sm">
                  Post #{post.id} • By: {post.creator.substring(0, 6)}...{post.creator.substring(38)} • 
                  {new Date(metadata.createdAt).toLocaleString()}
                </p>
              </div>
              {post.isGated && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Gated Content
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <p className="text-gray-800 whitespace-pre-line">
                {metadata.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => handleLike(post.id)}
                disabled={isLikingPost[post.id]}
                className="flex items-center text-gray-500 hover:text-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span>{likesCounts[post.id] || 0} Likes</span>
              </button>
            </div>
          </div>
        );
      })}
      
      {postsPage.total > offset + postsPage.posts.length && (
        <div className="text-center py-4">
          <button
            onClick={loadMorePosts}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}; 