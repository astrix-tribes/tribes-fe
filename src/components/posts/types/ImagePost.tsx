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
import { Heart, MessageCircle, Share2, Flag, Maximize2 } from 'lucide-react';

interface ImagePostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const ImagePost: React.FC<ImagePostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onReport,
  onClick,
  showActions = true
}) => {
  const [isImageExpanded, setIsImageExpanded] = React.useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(post.id);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageExpanded(!isImageExpanded);
  };

  const formattedDate = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'some time ago';
    }
  }, [post.createdAt]);

  // Get the first image from media array
  const mainImage = post.metadata?.media?.[0];

  // Map tag colors consistently based on tag content
  const getTagVariant = (tag: string): "default" | "blue" | "purple" | "green" | "yellow" | "orange" => {
    const variants = ["blue", "purple", "green", "yellow", "orange"] as const;
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return variants[hash % variants.length];
  };

  return (
    <article 
      className={postContainerStyles({ type: 'image' })}
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

      {/* Title */}
      {post.metadata?.title && (
        <h3 className="text-lg font-semibold mt-3 text-white">
          {post.metadata.title}
        </h3>
      )}

      {/* Content */}
      {post.content && (
        <div className={contentStyles}>
          {post.content}
        </div>
      )}

      {/* Image */}
      {mainImage && (
        <div 
          className={`${mediaContainerStyles} relative group cursor-pointer`}
          onClick={handleImageClick}
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={mainImage.url}
              alt={post.metadata?.title || 'Post image'}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <button 
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageExpanded(true);
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tags */}
      {post.metadata?.tags && post.metadata.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.metadata.tags.map((tag, index) => (
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
        <div className="mt-4 flex items-center justify-between border-t border-neutral-700 pt-3">
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

      {/* Image Modal */}
      {isImageExpanded && mainImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={mainImage.url}
              alt={post.metadata?.title || 'Post image'}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              loading="lazy"
            />
            <button 
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white"
              onClick={() => setIsImageExpanded(false)}
            >
              <Maximize2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default ImagePost; 