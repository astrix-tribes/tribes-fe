import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../../types/post';
import UserAvatar from '../user/UserAvatar';
import { Heart, MessageCircle, Share2, Flag } from 'lucide-react';
import { 
  postContainerStyles, 
  authorStyles, 
  authorNameStyles, 
  timestampStyles, 
  contentStyles,
  actionButtonStyles,
  dividerStyles,
  postTypeBadgeStyles
} from './styles/post.styles';

export interface BasePostProps {
  post: Post;
  postType: string; // 'text', 'image', 'video', etc.
  typeIcon?: React.ReactNode;
  typeName?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const BasePost: React.FC<BasePostProps> = ({
  post,
  postType,
  typeIcon,
  typeName,
  onLike,
  onComment,
  onShare,
  onReport,
  onClick,
  showActions = true,
  className = '',
  children
}) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.();
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick(post.id);
    }
  };

  const formattedDate = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'some time ago';
    }
  }, [post.createdAt]);

  return (
    <article 
      className={`${postContainerStyles({ type: postType as any })} ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Post Type Badge - if provided */}
      {typeIcon && typeName && (
        <div className={postTypeBadgeStyles({ type: postType as any })}>
          {typeIcon}
          <span>{typeName}</span>
        </div>
      )}
      
      {/* Author section */}
      <div className={authorStyles}>
        <UserAvatar 
          address={post.author} 
          className="h-10 w-10"
        />
        <div className="flex flex-col">
          <a 
            href={`/profile/${post.author}`} 
            className={authorNameStyles}
            onClick={(e) => e.stopPropagation()}
          >
            {post.author}
          </a>
          <time className={timestampStyles}>
            {formattedDate}
          </time>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className={contentStyles}>
          {post.content}
        </div>
      )}

      {/* Custom content for different post types */}
      {children}

      {/* Actions */}
      {showActions && (
        <>
          <div className={dividerStyles} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                className={actionButtonStyles({ variant: 'default', active: isLiked })}
                onClick={handleLike}
              >
                <Heart className="mr-1 h-4 w-4" />
                <span>{post.stats?.likeCount || 0}</span>
              </button>
              <button 
                className={actionButtonStyles({ variant: 'default' })}
                onClick={(e) => {
                  e.stopPropagation();
                  onComment?.();
                }}
              >
                <MessageCircle className="mr-1 h-4 w-4" />
                <span>{post.stats?.commentCount || 0}</span>
              </button>
              <button 
                className={actionButtonStyles({ variant: 'default' })}
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.();
                }}
              >
                <Share2 className="mr-1 h-4 w-4" />
                <span>{post.stats?.shareCount || 0}</span>
              </button>
            </div>
            <button 
              className={actionButtonStyles({ variant: 'destructive' })}
              onClick={(e) => {
                e.stopPropagation();
                onReport?.();
              }}
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </article>
  );
};

export default BasePost; 