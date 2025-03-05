import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTribesManagement } from '../hooks/useTribesManagement';
import { Image, X, Plus, Upload, Lock, Globe } from 'lucide-react';

export function CreateTribe() {
  const navigate = useNavigate();
  const { createTribe } = useTribesManagement();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle avatar selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!name.trim()) {
      setError('Tribe name is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the createTribe function from the hook with correct parameters
      const metadataObj = {
        name: name.trim(),
        description,
        privacy: isPrivate ? 'private' : 'public',
        tags,
        avatar: avatarPreview,
        coverImage: coverPreview,
        createdAt: new Date().toISOString()
      };
      console.log('Creating tribe with metadata:', metadataObj);
      const metadataStr = JSON.stringify(metadataObj);
      const joinType = isPrivate ? 1 : 0; // 0 = public, 1 = private
      await createTribe(name, metadataStr);
      
      setSuccess(true);

      // Redirect after successful creation (with a short delay to show success)
      setTimeout(() => {
        navigate('/tribes');
      }, 2000);
    } catch (err) {
      console.error('Error creating tribe:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tribe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create a New Tribe</h1>
        <p className="text-gray-400 mt-2">Create a community around your interests, project, or organization.</p>
      </div>

      {success ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Tribe Created Successfully!</h3>
          <p className="text-gray-300">Redirecting you to the tribes page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image Upload */}
          <div className="relative">
            <div className={`h-48 w-full rounded-xl overflow-hidden bg-gray-800/50 border-2 border-dashed ${coverPreview ? 'border-transparent' : 'border-gray-700'}`}>
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black/90"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Image className="w-10 h-10 mb-2" />
                  <p className="text-sm">Upload cover image (optional)</p>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              id="cover-image" 
              accept="image/*" 
              onChange={handleCoverChange} 
              className="hidden" 
            />
            
            {!coverPreview && (
              <label 
                htmlFor="cover-image" 
                className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center cursor-pointer hover:bg-gray-700"
              >
                <Upload size={16} className="mr-2" />
                <span>Upload Cover</span>
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Avatar Upload */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
              <div className="relative">
                <div className={`w-24 h-24 rounded-xl overflow-hidden bg-gray-800/50 border-2 border-dashed ${avatarPreview ? 'border-transparent' : 'border-gray-700'}`}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Plus size={24} />
                    </div>
                  )}
                </div>
                
                <input 
                  type="file" 
                  id="avatar" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
                
                <label 
                  htmlFor="avatar" 
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  <Plus size={14} />
                </label>
              </div>
            </div>

            {/* Name and Description */}
            <div className="col-span-3 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Tribe Name*</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a name for your tribe"
                  maxLength={50}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description*</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What is your tribe about?"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-gray-400 text-xs mt-1">{description.length}/300 characters</p>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Privacy</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  !isPrivate 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <Globe className={`w-5 h-5 ${!isPrivate ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-medium ${!isPrivate ? 'text-blue-500' : 'text-white'}`}>Public</div>
                  <div className="text-xs text-gray-400">Anyone can join and view content</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  isPrivate 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <Lock className={`w-5 h-5 ${isPrivate ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-medium ${isPrivate ? 'text-blue-500' : 'text-white'}`}>Private</div>
                  <div className="text-xs text-gray-400">Members must be approved to join</div>
                </div>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full">
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-r-0 border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
                disabled={tags.length >= 5}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tags.length >= 5 || !tagInput.trim()}
                className="px-3 py-2 bg-gray-700 text-white rounded-r-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1">Tags help people discover your tribe</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/tribes')}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Tribe'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 