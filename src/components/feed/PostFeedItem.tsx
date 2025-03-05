import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Post } from '../../types/post';
import { formatDistanceToNow } from 'date-fns';

interface PostFeedItemProps {
  post: Post;
  onClick?: () => void;
}

export function PostFeedItem({ post, onClick }: PostFeedItemProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement like functionality
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement comment functionality
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement save functionality
  };

  return (
    <div 
      onClick={onClick}
      className="bg-card hover:bg-card/90 transition-colors p-4 rounded-xl cursor-pointer"
    >
      {/* Author Info */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent/10" />
        <div>
          <div className="font-medium">
            {typeof post.author === 'object' 
              ? ((post.author as any).username || (post.author as any).id || 'Unknown')
              : post.author || (post as any).creator || 'Unknown'}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt || (post as any).timestamp || Date.now()), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {post.metadata?.title && (
          <h3 className="text-lg font-medium">{post.metadata.title}</h3>
        )}
        <p className="text-muted-foreground">{post.content}</p>

        {/* Media Content */}
        {post.metadata?.mediaContent && post.metadata.mediaContent.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {post.metadata.mediaContent.map((media: { type: string; url: string; name?: string }, index: number) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt={media.name || 'Media content'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10">
                    Unsupported Media
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 mt-4">
        <button 
          onClick={handleLike}
          className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Heart className="w-5 h-5" />
          <span>{post.stats?.likeCount || (post as any).likes || 0}</span>
        </button>

        <button 
          onClick={handleComment}
          className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.stats?.commentCount || (post as any).comments || 0}</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>{post.stats?.shareCount || (post as any).shares || 0}</span>
        </button>

        <button 
          onClick={handleSave}
          className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Bookmark className="w-5 h-5" />
          <span>{post.stats?.saveCount || (post as any).stats?.engagement || 0}</span>
        </button>
      </div>
    </div>
  );
} 