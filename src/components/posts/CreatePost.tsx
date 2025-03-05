import React, { useState } from 'react';
import { PostType } from '../../types/post';
import { zeroAddress } from 'viem';
import { useDispatch } from 'react-redux';
import { createPost } from '../../store/slices/postsSlice';
import PostTypeFields from './PostTypeFields';
import POST_TYPE_MAPPING from './PostTypeMapper';

// Define the MediaContent type
interface MediaContent {
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
}

interface CreatePostProps {
  tribeId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ tribeId, onSuccess, onError }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [postType, setPostType] = useState<PostType>(PostType.TEXT);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isGated, setIsGated] = useState(false);
  const [collectibleId, setCollectibleId] = useState<number>(0);
  const [mediaContent, setMediaContent] = useState<{
    images: string[];
    videos: string[];
  }>({
    images: [],
    videos: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare media content
      const preparedMediaContent: MediaContent[] = [
        ...mediaContent.images.map((url): MediaContent => ({
          type: 'image',
          url,
          name: url.split('/').pop() || 'image',
          size: 0
        })),
        ...mediaContent.videos.map((url): MediaContent => ({
          type: 'video',
          url,
          name: url.split('/').pop() || 'video',
          size: 0
        }))
      ];

      // Prepare post data
      const postData = {
        tribeId: tribeId.toString(),
        type: postType.toString(), // Convert enum to string
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
        mediaContent: preparedMediaContent.length > 0 ? preparedMediaContent : undefined,
        isGated,
        collectibleContract: isGated ? undefined : zeroAddress,
        collectibleId: isGated ? collectibleId : 0
      };

      // Dispatch the createPost action
      await dispatch(createPost(postData) as any); // Type assertion to avoid dispatch issues

      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setIsGated(false);
      setCollectibleId(0);
      setMediaContent({ images: [], videos: [] });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMediaUpload = (files: FileList | null, type: 'images' | 'videos') => {
    if (!files) return;

    // In a real app, you would upload these files to IPFS or your storage solution
    // For now, we'll just create object URLs
    const urls = Array.from(files).map(file => URL.createObjectURL(file));
    
    setMediaContent(prev => ({
      ...prev,
      [type]: [...prev[type], ...urls]
    }));
  };

  // Get the string representation of the post type for PostTypeFields
  const getPostTypeString = (): string => {
    // Create a mapping from PostType enum to string
    const typeMap: Record<number, string> = {
      [PostType.TEXT]: 'text',
      [PostType.IMAGE]: 'image',
      [PostType.VIDEO]: 'video',
      [PostType.LINK]: 'link',
      [PostType.EVENT]: 'event',
      [PostType.POLL]: 'poll'
    };
    return typeMap[postType] || 'text';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 rounded-lg shadow-md p-6">
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setPostType(PostType.TEXT)}
          className={`px-4 py-2 rounded ${
            postType === PostType.TEXT ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => setPostType(PostType.IMAGE)}
          className={`px-4 py-2 rounded ${
            postType === PostType.IMAGE ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          }`}
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => setPostType(PostType.VIDEO)}
          className={`px-4 py-2 rounded ${
            postType === PostType.VIDEO ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          }`}
        >
          Video
        </button>
        <button
          type="button"
          onClick={() => setPostType(PostType.EVENT)}
          className={`px-4 py-2 rounded ${
            postType === PostType.EVENT ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          }`}
        >
          Event
        </button>
        <button
          type="button"
          onClick={() => setPostType(PostType.POLL)}
          className={`px-4 py-2 rounded ${
            postType === PostType.POLL ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          }`}
        >
          Poll
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post content..."
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        required
      />

      {/* Type-specific fields using PostTypeFields */}
      <div className="border-t border-gray-700 pt-4">
        <PostTypeFields type={getPostTypeString() as any} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-700 px-2 py-1 rounded text-sm flex items-center text-gray-200"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagAdd}
          placeholder="Add tags (press Enter)"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 rounded-lg font-medium ${
          isLoading
            ? 'bg-blue-500/50 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isLoading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};

export default CreatePost;