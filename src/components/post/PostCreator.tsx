import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlignLeft, ImageIcon, CalendarDays, BarChartHorizontal, Briefcase, BookOpen } from 'lucide-react';
import { PostType } from '../../types/post';
import { 
  createPost, 
  setCreatingPost, 
  setPostType, 
  updateDraft,
  resetDraft,
  selectPostDraft,
  selectCreatingPost,
  selectPostsError
} from '../../store/slices/postsSlice';
import { AppDispatch } from '../../store/store';
import clsx from 'clsx';
import PostTypeFields from '../posts/PostTypeFields';
import { prepareEventData, createEvent } from '../../utils/eventHelpers';

// Define post type mappings that match the expected strings in PostTypeFields
const POST_TYPE_MAPPING = {
  [PostType.TEXT]: 'text',
  [PostType.IMAGE]: 'image',
  [PostType.VIDEO]: 'video',
  [PostType.LINK]: 'link',
  [PostType.EVENT]: 'event',
  [PostType.POLL]: 'poll',
} as const;

// Type for the string values used by PostTypeFields
type PostTypeString = typeof POST_TYPE_MAPPING[keyof typeof POST_TYPE_MAPPING];

// Type definitions for the component props
export interface PostCreatorProps {
  // Display mode
  mode?: 'modal' | 'inline' | 'dialog';
  
  // Modal/Dialog specific props
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  
  // Common props
  tribeId: string | number;
  onSuccess?: (postId: string) => void;
  onError?: (error: Error) => void;
  
  // Optional customization
  className?: string;
  availableTypes?: PostType[];
  defaultType?: PostType;
}

// Define the location type structure
interface EventLocation {
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  physical?: string;
  virtual?: string;
}

// Post type options for the UI
const postTypeOptions = [
  { type: PostType.TEXT, label: 'Text', icon: AlignLeft, color: '#4B5563' },
  { type: PostType.IMAGE, label: 'Image', icon: ImageIcon, color: '#10B981' },
  { type: PostType.EVENT, label: 'Event', icon: CalendarDays, color: '#F59E0B' },
  { type: PostType.POLL, label: 'Poll', icon: BarChartHorizontal, color: '#3B82F6' },
  { type: PostType.LINK, label: 'Resource', icon: Briefcase, color: '#EC4899' },
  { type: PostType.VIDEO, label: 'Media', icon: BookOpen, color: '#8B5CF6' },
];

/**
 * A unified post creation component that can render in different modes:
 * - modal: a modal dialog
 * - inline: directly in the page flow
 * - dialog: a custom dialog UI
 */
export const PostCreator: React.FC<PostCreatorProps> = ({
  mode = 'modal',
  isOpen = false,
  onClose,
  onCancel,
  tribeId,
  onSuccess,
  onError,
  className = 'border border-gray-800',
  availableTypes = Object.values(PostType).filter(t => typeof t === 'number'),
  defaultType = PostType.TEXT
}) => {
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const postDraft = useSelector(selectPostDraft);
  const isReduxOpen = useSelector(selectCreatingPost);
  const error = useSelector(selectPostsError);
  
  // Local state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create refs for focus management
  const titleInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Determine effective open state
  const effectiveIsOpen = mode === 'modal' ? (isOpen || isReduxOpen) : isOpen;

  // Set the default post type to EVENT when the modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(setPostType(PostType.EVENT));
    }
  }, [isOpen, dispatch]);

  // Handle closing the creator
  const handleClose = () => {
    if (mode === 'modal') {
      dispatch(setCreatingPost(false));
    } else {
      onClose?.();
      onCancel?.();
    }
    dispatch(resetDraft());
    setValidationError(null);
    setIsSubmitting(false);
  };

  // Handle selecting a post type
  const handleSelectType = (type: PostType, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // Update the post type in Redux
    dispatch(setPostType(type));
    
    // Reset any validation errors
    setValidationError(null);
    
    // Focus the title input after type selection
    if (type === PostType.EVENT) {
      // Optionally, you can focus the title input immediately if the type is EVENT
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!postDraft.content?.trim()) {
      setValidationError('Please enter content for your post');
      return;
    }
    console.log(`[PostCreator]: Post draft: ${postDraft?.type} : ${PostType?.EVENT}`);

    // Additional validation for event fields
    if (postDraft.type === "EVENT") {
      console.log(`[PostCreator]: Post draft into condition: ${postDraft?.eventDetails?.title} : ${postDraft?.eventDetails?.startDate} : ${postDraft?.eventDetails?.location}`);
      if (!postDraft.eventDetails?.title) {
        setValidationError('Please enter a title for your event');
        return;
      }
      if (!postDraft.eventDetails?.startDate) {
        setValidationError('Please set a date for your event');
        return;
      }
      if (!postDraft.eventDetails?.location) {
        setValidationError('Please enter a location for your event');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the post data
      const postData: any = {
        content: postDraft.content,
        title: postDraft.title,
        type: postDraft.type,
        tribeId: tribeId,
      };
      
      
      // For event posts, ensure we have the right metadata structure
      if ((postData.type) == "EVENT") {
        try {
          // Prepare event data for blockchain
          const eventData = prepareEventData(postDraft.eventDetails);
          console.log(`[PostCreator]: Event data: ${JSON.stringify(eventData)}`);
          
          // Create the event on the blockchain
          const eventId = await createEvent(eventData);
          
          // Add the event ID to the post data
          postData.eventDetails = {
            ...postDraft.eventDetails,
            eventId
          };
          console.log(`[PostCreator]: Post data: ${postData}`);
          console.log(`Event created with ID: ${eventId}`);
        } catch (error) {
          console.error('Error creating event:', error);
          setValidationError('Failed to create event. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create the post
      const postId = await dispatch(createPost(postData)).unwrap();
      
      // Reset the form
      dispatch(resetDraft());
      setValidationError(null);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(postId);
      }
      
      // Close the modal if in modal mode
      if (mode === 'modal') {
        dispatch(setCreatingPost(false));
      }
    } catch (error: any) {
      setValidationError(error.message || 'Failed to create post');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get the type string for PostTypeFields
  const postTypeString = useMemo(() => {
    // If it's a number type from the enum
    if (typeof postDraft.type === 'number') {
      return POST_TYPE_MAPPING[postDraft.type as keyof typeof POST_TYPE_MAPPING] || 'text';
    }
    
    // If it's already a string
    if (typeof postDraft.type === 'string') {
      const normalizedType = postDraft.type.toLowerCase();
      if (Object.values(POST_TYPE_MAPPING).some(val => val === normalizedType)) {
        return normalizedType as PostTypeString;
      }
    }
    
    // Default fallback
    return 'text' as PostTypeString;
  }, [postDraft.type]);

  // Content to render inside any container
  const renderContent = () => (
    <div className="space-y-4">
      {/* Post Type Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {postTypeOptions.map(option => (
          <button
            key={option.type}
            type="button"
            onClick={(e) => handleSelectType(option.type, e)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              Number(postDraft.type) === option.type
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <option.icon className="w-4 h-4" style={{ color: option.color }} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Errors */}
      {(validationError || error) && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200" role="alert">
          {validationError || error}
        </div>
      )}

      {/* Title Field */}
      {postTypeString !== 'event' && <div>
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Post title"
          value={postDraft.title || ''}
          onChange={(e) => dispatch(updateDraft({ title: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-black/20 text-white border border-white/10 focus:ring-2 focus:ring-accent focus:border-transparent"
          disabled={isSubmitting}
          tabIndex={0}
        />
      </div>}

      {/* Content Field */}
      {<div>
        <textarea
          placeholder="What's on your mind?"
          value={postDraft.content || ''}
          onChange={(e) => dispatch(updateDraft({ content: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-black/20 text-white border border-white/10 focus:ring-2 focus:ring-accent focus:border-transparent min-h-[120px] resize-none"
          disabled={isSubmitting}
          tabIndex={0}
        />
      </div>}

      {/* Dynamic Type-specific Fields */}
      <div className="pt-2 border-t border-gray-700/30 max-h-[30vh] overflow-y-auto">
        <PostTypeFields type={postTypeString} />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2 border-t border-gray-700/30">
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "px-4 py-2 rounded-lg font-medium",
            isSubmitting
              ? "bg-accent/50 cursor-not-allowed"
              : "bg-accent hover:bg-accent/90 text-white"
          )}
          tabIndex={0}
        >
          {isSubmitting ? "Creating..." : "Create Post"}
        </button>
      </div>
    </div>
  );

  // Render based on the selected mode
  if (mode === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={className}>
        {renderContent()}
      </form>
    );
  } else if (mode === 'dialog') {
    return (
      <div className={`bg-card rounded-xl shadow-xl p-6 ${className}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-white font-semibold">Create Post</h2>
            {onClose && (
              <button 
                type="button" 
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
                tabIndex={0}
              >
                <X size={20} />
              </button>
            )}
          </div>
          {renderContent()}
        </form>
      </div>
    );
  } else {
    return (
      <Transition appear show={effectiveIsOpen} as={React.Fragment}>
        <Dialog 
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleClose}
          initialFocus={titleInputRef}
        >
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="min-h-screen px-4 flex items-center justify-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 shadow-xl transition-all">
                <div className="max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-white"
                    >
                      Create Post
                    </Dialog.Title>
                    <button
                      type="button"
                      ref={closeButtonRef}
                      className="p-2 rounded-full focus:outline-none hover:bg-gray-800"
                      onClick={handleClose}
                      tabIndex={0}
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    {renderContent()}
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    );
  }
};

export default PostCreator; 