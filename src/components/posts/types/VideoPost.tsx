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
import { Heart, MessageCircle, Share2, Flag, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onClick?: (postId: string) => void;
  showActions?: boolean;
}

const VideoPost: React.FC<VideoPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onReport,
  onClick,
  showActions = true
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);

  const handleClick = () => {
    if (onClick) {
      onClick(post.id);
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
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

  // Get the first video from media array
  const mainVideo = post.metadata?.media?.find(m => m.type === 'video');

  // Map tag colors consistently based on tag content
  const getTagVariant = (tag: string): "default" | "blue" | "purple" | "green" | "yellow" | "orange" => {
    const variants = ["blue", "purple", "green", "yellow", "orange"] as const;
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return variants[hash % variants.length];
  };

  return (
    <article 
      className={postContainerStyles({ type: 'video' })}
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

      {/* Video */}
      {mainVideo && (
        <div className={`${mediaContainerStyles} relative group`}>
          <video
            ref={videoRef}
            src={mainVideo.url}
            className="w-full aspect-video object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              <button
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                onClick={handleMuteToggle}
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
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

export default VideoPost; 