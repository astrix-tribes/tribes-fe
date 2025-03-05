import React from 'react';
import PostCreator from './PostCreator';
import { ZeroAddress } from '../../constants/common';

interface PostCreationFormProps {
  tribeId: number;
  onSuccess?: (postId: number) => void;
  onCancel?: () => void;
}

/**
 * Backward-compatible PostCreationForm that uses the new PostCreator component
 */
export const PostCreationForm: React.FC<PostCreationFormProps> = ({
  tribeId,
  onSuccess,
  onCancel
}) => {
  return (
    <PostCreator 
      mode="inline"
      tribeId={tribeId.toString()}
      onSuccess={(postId) => onSuccess?.(Number(postId))}
      onCancel={onCancel}
      className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
    />
  );
}; 