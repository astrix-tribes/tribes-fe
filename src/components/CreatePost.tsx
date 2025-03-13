import React from 'react';
import PostCreator from './post/PostCreator';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  tribeId?: string; // Make tribeId optional for backward compatibility
  onSuccess?: (postId: string) => void;
}

/**
 * Backward-compatible CreatePost that uses the new PostCreator component
 */
export function CreatePost({ isOpen, onClose, tribeId }: CreatePostProps) {
  return (
    <PostCreator 
      mode="dialog"
      isOpen={isOpen}
      onClose={onClose}
      tribeId={tribeId || ''}
    />
  );
}