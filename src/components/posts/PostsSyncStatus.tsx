import React, { useEffect, useState } from 'react';
import { PostsService } from '../../services/posts.service';
import { RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface SyncStatus {
  isSyncing: boolean;
  progress: number;
  total: number;
  lastSyncTime: number;
  errorCount: number;
  lastError: Error | null;
}

const PostsSyncStatus: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    progress: 0,
    total: 0,
    lastSyncTime: 0,
    errorCount: 0,
    lastError: null
  });

  useEffect(() => {
    const postsService = PostsService.getInstance();
    
    // Update status initially
    setStatus(postsService.getSyncStatus());
    
    // Set up listener for changes
    const cleanupFunction = postsService.addSyncListener(() => {
      setStatus(postsService.getSyncStatus());
    });
    
    // Return the cleanup function directly
    return () => {
      cleanupFunction();
    };
  }, []);

  // Format the last sync time
  const getLastSyncText = () => {
    if (status.lastSyncTime === 0) return 'Never';
    
    const minutesAgo = Math.floor((Date.now() - status.lastSyncTime) / 60000);
    
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo === 1) return '1 minute ago';
    if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo === 1) return '1 hour ago';
    return `${hoursAgo} hours ago`;
  };

  // Show nothing if we've never synced and aren't currently syncing
  if (status.lastSyncTime === 0 && !status.isSyncing) {
    return null;
  }

  return (
    <div className="text-xs flex items-center gap-1 text-muted-foreground">
      {status.isSyncing ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>
            {status.total > 0 
              ? `Syncing posts (${status.progress}/${status.total})`
              : 'Syncing posts...'}
          </span>
        </>
      ) : status.errorCount > 0 ? (
        <>
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>Sync error ({status.errorCount})</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Posts synced</span>
        </>
      )}
      <Clock className="w-3 h-3 ml-2" />
      <span>{getLastSyncText()}</span>
    </div>
  );
};

export default PostsSyncStatus; 