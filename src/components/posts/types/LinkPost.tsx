import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../../../types/post';
import UserAvatar from '../../user/UserAvatar';
import { 
  postContainerStyles, 
  tagStyles, 
  actionButtonStyles,
  metadataStyles,
  contentStyles,
  authorStyles,
  authorNameStyles,
  timestampStyles,
  mediaContainerStyles
} from '../styles/post.styles';
import { Heart, MessageCircle, Share2, Flag, ExternalLink } from 'lucide-react';

interface LinkPostProps {
  post: Post | any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const LinkPost: React.FC<LinkPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onReport,
  onClick,
  showActions = true
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(post.id);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.metadata?.link) {
      window.open(post.metadata.link, '_blank', 'noopener,noreferrer');
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

  // Map tag colors consistently based on tag content
  const getTagVariant = (tag: string): "default" | "blue" | "purple" | "green" | "yellow" | "orange" => {
    const variants = ["blue", "purple", "green", "yellow", "orange"] as const;
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return variants[hash % variants.length];
  };

  return (
    <article 
      className={postContainerStyles({ type: 'link' })}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
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

      {/* Link Preview */}
      {post.metadata?.link && (
        <div 
          className={`${mediaContainerStyles} group cursor-pointer hover:border-neutral-300 transition-colors`}
          onClick={handleLinkClick}
        >
          <div className="p-4">
            {post.metadata.title && (
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {post.metadata.title}
              </h3>
            )}
            {post.metadata.description && (
              <p className="text-neutral-600 line-clamp-2">
                {post.metadata.description}
              </p>
            )}
            <div className="mt-2 flex items-center text-neutral-500 text-sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="truncate">
                {post.metadata.link}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {post.metadata?.tags && post.metadata.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.metadata.tags.map((tag: string, index: number) => (
            <span 
              key={index} 
              className={tagStyles({ variant: getTagVariant(tag) })}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
          <div className="flex items-center gap-2">
            <button 
              className={actionButtonStyles({ variant: 'default' })}
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
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
      )}
    </article>
  );
};

export default LinkPost; 