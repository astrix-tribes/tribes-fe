import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface PostProps {
  post: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
  };
}

export function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {post.author[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{post.author}</div>
            <div className="text-sm text-gray-400">
              {new Date(post.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-full">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-200">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-4 text-gray-400">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center space-x-1.5 hover:text-[#4ADE80] ${
            isLiked ? 'text-[#4ADE80]' : ''
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center space-x-1.5 hover:text-[#4ADE80]">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center space-x-1.5 hover:text-[#4ADE80]">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 