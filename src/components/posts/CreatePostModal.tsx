import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCreatingPost, setCreatingPost } from '../../store/slices/postsSlice';
import { PostCreator } from '../post/PostCreator';

interface CreatePostModalProps {
  tribeId: string;
  onSuccess?: (postId: string) => void;
  isOpen?: boolean;
}

/**
 * Backward-compatible CreatePostModal that uses the new PostCreator component
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  tribeId, 
  onSuccess,
  isOpen: propIsOpen
}) => {
  const reduxIsOpen = useSelector(selectCreatingPost);
  const dispatch = useDispatch();
  
  const isOpen = propIsOpen !== undefined ? propIsOpen : reduxIsOpen;
  
  const handleClose = () => {
    console.log('[CreatePostModal]: Closing modal');
    dispatch(setCreatingPost(false));
  };
  
  const handleSuccess = (postId: string) => {
    console.log('[CreatePostModal]: Post created successfully:', postId);
    // Call the parent success handler if provided
    if (onSuccess) {
      onSuccess(postId);
    }
    // Close the modal
    handleClose();
  };
  
  console.log('[CreatePostModal]: Rendering with isOpen =', isOpen);
  
  return (
    <PostCreator
      mode="modal"
      isOpen={isOpen}
      onClose={handleClose}
      tribeId={tribeId}
      onSuccess={handleSuccess}
      onError={(error) => console.error('[CreatePostModal]: Error creating post:', error)}
    />
  );
};

export default CreatePostModal; 