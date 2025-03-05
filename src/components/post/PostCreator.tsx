import React, { useState, useRef, useMemo } from 'react';
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

// Post type options with their UI representation
export const postTypeOptions = [
  { type: PostType.TEXT, icon: AlignLeft, label: 'Text', color: '#3b82f6', description: 'Share your thoughts with the community' },
  { type: PostType.IMAGE, icon: ImageIcon, label: 'Media', color: '#ec4899', description: 'Share images, videos, or audio' },
  { type: PostType.EVENT, icon: CalendarDays, label: 'Event', color: '#f59e0b', description: 'Organize meetups or virtual events' },
  { type: PostType.POLL, icon: BarChartHorizontal, label: 'Poll', color: '#8b5cf6', description: 'Get community feedback through voting' },
  { type: PostType.LINK, icon: Briefcase, label: 'Link', color: '#6366f1', description: 'Share links or resources' },
  { type: PostType.VIDEO, icon: BookOpen, label: 'Video', color: '#ef4444', description: 'Share videos with the community' }
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
  className = '',
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
  const handleSelectType = (type: PostType) => {
    dispatch(setPostType(type));
    
    // Initialize specific fields based on type
    switch (type) {
      case PostType.TEXT:
        // Initialize text post with basic metadata
        dispatch(updateDraft({
          type: String(PostType.TEXT) as any,
          content: postDraft.content || '',
          title: postDraft.title || ''
        }));
        break;
      case PostType.EVENT:
        if (!postDraft.eventDetails) {
          // Create event fields with appropriate types
          dispatch(updateDraft({
            eventDetails: {
              title: postDraft.title || '', // Use the current title or empty string
              organizer: '', // Required field for EventDetails
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 3600000).toISOString(),
              location: {
                type: 'PHYSICAL',
                physical: ''
              } as any, // Type assertion to avoid complex type issues
              maxTickets: 0 as any, // Use type assertion to avoid type errors
              price: 0 as any  // Use type assertion to avoid type errors
            }
          }));
        }
        break;
      case PostType.POLL:
        if (!postDraft.pollDetails) {
          dispatch(updateDraft({
            pollDetails: {
              options: [
                { id: Date.now().toString(), text: '', votes: 0 },
                { id: (Date.now() + 1).toString(), text: '', votes: 0 }
              ],
              endDate: new Date(Date.now() + 86400000).toISOString(),
              allowMultipleChoices: false,
              requireVerification: false
            }
          }));
        }
        break;
      case PostType.LINK:
        if (!postDraft.resourceDetails) {
          dispatch(updateDraft({
            resourceDetails: {
              type: 'LINK',
              attachments: []
            }
          }));
        }
        break;
      case PostType.IMAGE:
      case PostType.VIDEO:
        if (!postDraft.mediaContent || postDraft.mediaContent.length === 0) {
          dispatch(updateDraft({
            mediaContent: []
          }));
        }
        break;
    }
    
    // Focus the title input after selecting a post type
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!postDraft.content?.trim()) {
      setValidationError('Please enter content for your post');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare post data
      const postData: any = {
        ...postDraft,
        // Ensure type is properly set for TEXT posts
        type: postDraft.type === undefined ? PostType.TEXT : postDraft.type,
        tribeId: String(tribeId),
      };
      
      // For text posts, ensure we have the right metadata structure
      if (Number(postData.type) === PostType.TEXT) {
        postData.content = postDraft.content || '';
        postData.createdAt = new Date().toISOString();
      }
      
      console.log('Submitting post:', postData);
      
      // Submit post
      const result = await dispatch(createPost(postData)).unwrap();
      
      if (result) {
        // Reset form
        console.log('Post created:', result);
        dispatch(resetDraft());
        
        // Close modal if in modal mode
        if (mode === 'modal') {
          dispatch(setCreatingPost(false));
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result.id);
        }
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
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Post type">
        {postTypeOptions
          .filter(option => typeof option.type === 'number' && availableTypes.includes(option.type))
          .map(({ type, icon: Icon, label, color }) => {
            // Check if this type is currently selected
            const isSelected = Number(postDraft.type) === type;
            
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectType(type)}
                className={clsx(
                  "px-3 py-2 rounded-lg flex items-center gap-2 transition-colors",
                  isSelected
                    ? "bg-opacity-20 ring-2 text-white" 
                    : "bg-black/10 text-gray-300 hover:bg-black/20"
                )}
                style={{ 
                  backgroundColor: isSelected ? `${color}20` : undefined,
                  borderColor: isSelected ? color : undefined,
                  boxShadow: isSelected ? `0 0 0 1px ${color}` : undefined
                }}
                tabIndex={0}
              >
                <Icon size={16} style={{ color: isSelected ? color : undefined }} />
                <span>{label}</span>
              </button>
            );
          })}
      </div>

      {/* Errors */}
      {(validationError || error) && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200" role="alert">
          {validationError || error}
        </div>
      )}

      {/* Title Field */}
      <div>
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
      </div>

      {/* Content Field */}
      <div>
        <textarea
          placeholder="What's on your mind?"
          value={postDraft.content || ''}
          onChange={(e) => dispatch(updateDraft({ content: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-black/20 text-white border border-white/10 focus:ring-2 focus:ring-accent focus:border-transparent min-h-[120px] resize-none"
          disabled={isSubmitting}
          tabIndex={0}
        />
      </div>

      {/* Dynamic Type-specific Fields */}
      <div className="pt-2 border-t border-gray-700/30">
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
              : "bg-accent hover:bg-accent/90 text-black"
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
            <h2 className="text-xl font-semibold">Create Post</h2>
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
    // Modal mode (default)
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
          
          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-medium leading-6 text-white"
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