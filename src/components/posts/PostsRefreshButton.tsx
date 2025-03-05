import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePostsData } from '../../hooks/usePostsData';

interface PostsRefreshButtonProps {
  tribeId: string;
  className?: string;
}

/**
 * Button component that allows manually refreshing posts for a tribe
 */
const PostsRefreshButton: React.FC<PostsRefreshButtonProps> = ({ tribeId, className = '' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshTribePosts } = usePostsData();
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshTribePosts(tribeId);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-sm 
      ${isRefreshing 
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      } transition-colors ${className}`}
      title="Refresh posts"
    >
      <RefreshCw 
        className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
    </button>
  );
};

export default PostsRefreshButton; 