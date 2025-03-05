import React from 'react';
import { Post, PostType } from '../../types/post';
import { 
  TextPost, 
  ImagePost, 
  VideoPost, 
  LinkPost, 
  EventPost, 
  PollPost, 
  BountyPost,
  ProjectPost
} from './types';

// Define a mapping from PostType enum to component type string
const POST_TYPE_MAPPING: Record<number, string> = {
  [PostType.TEXT]: 'text',
  [PostType.IMAGE]: 'image',
  [PostType.VIDEO]: 'video',
  [PostType.LINK]: 'link',
  [PostType.EVENT]: 'event',
  [PostType.POLL]: 'poll',
  [6]: 'bounty', // BOUNTY type
  [7]: 'project' // PROJECT type
};

interface PostTypeMapperProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

/**
 * PostTypeMapper - Maps a post to the appropriate component based on its type
 * This follows the strategy pattern, allowing us to easily add new post types
 */
const PostTypeMapper: React.FC<PostTypeMapperProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onReport,
  onClick,
  showActions = true
}) => {
  // Enhanced debug logging for post type detection
  const renderPostByType = () => {
    const postTypeString = post.type !== undefined && post.type !== null 
      ? String(post.type) 
      : '';
      
    // Debug logging to help diagnose post type issues
    console.log('PostTypeMapper rendering post:', {
      id: post.id,
      rawType: post.type,
      numericType: typeof post.type === 'number' ? post.type : parseInt(postTypeString, 10),
      author: post.author,
      content: post.content?.substring(0, 30) + (post.content && post.content.length > 30 ? '...' : ''),
      hasMetadata: !!post.metadata,
      metadataKeys: post.metadata ? Object.keys(post.metadata) : [],
      hasMedia: post.metadata?.media && post.metadata.media.length > 0,
      mediaTypes: post.metadata?.media?.map((m: any) => m.type),
      componentType: typeof post.type === 'number' 
        ? POST_TYPE_MAPPING[post.type] 
        : postTypeString.toLowerCase(),
    });

    // Special handling for event posts
    const isEventType = post.type === PostType.EVENT || post.type === 3;
    const isEventString = postTypeString.toLowerCase() === 'event';
    const hasEventMetadata = post.metadata?.event !== undefined;
    
    console.log('Event detection:', {
      eventDetails: post.metadata?.event,
      isEventType,
      isEventString,
      hasEventMetadata
    });

    // Determine the numeric type for consistent comparison
    const numericType = typeof post.type === 'number' 
      ? post.type 
      : parseInt(postTypeString, 10);

    // Use the numeric type to get the component type string
    const componentType = isNaN(numericType) 
      ? postTypeString.toLowerCase() 
      : POST_TYPE_MAPPING[numericType];

    // Render the appropriate component based on the post type
    switch (componentType) {
      case 'text':
        return (
          <TextPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'image':
        return (
          <ImagePost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'video':
        return (
          <VideoPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'link':
        return (
          <LinkPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'event':
        return (
          <EventPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'poll':
        return (
          <PollPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'bounty':
        return (
          <BountyPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      case 'project':
        return (
          <ProjectPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
      default:
        console.warn(`Unknown post type: ${post.type}, falling back to TextPost`);
        return (
          <TextPost
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onReport={onReport}
            onClick={onClick}
            showActions={showActions}
          />
        );
    }
  };

  return renderPostByType();
};

export default PostTypeMapper; 