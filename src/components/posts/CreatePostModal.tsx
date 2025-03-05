import React from 'react';
import PostCreator from '../post/PostCreator';
import { useSelector } from 'react-redux';
import { selectCreatingPost } from '../../store/slices/postsSlice';

interface CreatePostModalProps {
  tribeId: string;
}

/**
 * Backward-compatible CreatePostModal that uses the new PostCreator component
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({ tribeId }) => {
  const isOpen = useSelector(selectCreatingPost);
  
  return (
    <PostCreator 
      mode="modal"
      isOpen={isOpen}
      tribeId={tribeId}
    />
  );
};

export default CreatePostModal; 