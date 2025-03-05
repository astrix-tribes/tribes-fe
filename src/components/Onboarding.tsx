import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Users } from 'lucide-react';
import { saveFollowedProfiles, getFollowedProfiles, type FollowedProfile } from '../utils/ethereum';
import { COLORS } from '../constants/theme';
import { getProfileByAddress, createProfile, type ProfileMetadata, type ProfileData } from '../utils/profile';
import { useAuth } from '../hooks/useAuth';
import { Address } from 'viem';

interface OnboardingFormData {
  username: string;
  avatar: string;
  bio: string;
}

// Suggested profiles to follow
const suggestedProfiles: FollowedProfile[] = [
  {
    address: '0x12343...', // Replace with actual addresses
    username: 'alice.eth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
  },
  {
    address: '0x5678...',
    username: 'bob.eth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
  },
  {
    address: '0x9abc...',
    username: 'charlie.eth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
  },
  {
    address: '0xdef0...',
    username: 'david.eth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
  },
  {
    address: '0x1234...',
    username: 'emma.eth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'
  }
];

export function Onboarding() {
  const navigate = useNavigate();
  const { address,chainId } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [formData, setFormData] = React.useState<OnboardingFormData>({
    username: '',
    avatar: '',
    bio: ''
  });
  const [existingProfile, setExistingProfile] = React.useState<ProfileData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Load existing profile if any
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!address) {
        navigate('/connect');
        return;
      }

      try {
        const profile = await getProfileByAddress(address as Address, chainId as number);
        if (profile) {
          setExistingProfile(profile);
          setFormData({
            username: profile.username,
            avatar: profile.metadata?.avatar || '',
            bio: profile.metadata?.bio || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [address, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!existingProfile) {
        // Create new profile
        const result = await createProfile(formData.username, {
          avatar: formData.avatar,
          bio: formData.bio,
          createdAt: Date.now()
        }, chainId as number);

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      // Navigate to dashboard after profile creation/update
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[${COLORS.monad.purple}]`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center mb-8">
        <button className="p-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center space-x-2">
          <div className={`w-12 h-2 bg-[${COLORS.monad?.purple}] rounded-full`} />
          <div className="w-2 h-2 bg-white/20 rounded-full" />
          <div className="w-2 h-2 bg-white/20 rounded-full" />
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-4">
        {existingProfile ? 'Welcome Back!' : 'Create Your Profile'}
      </h1>
      <p className="text-gray-400 mb-8">
        {existingProfile 
          ? 'Your username is already set. You can update other details or continue to dashboard.'
          : 'Choose a username and set up your profile.'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            disabled={!!existingProfile}
            className={`w-full px-4 py-2 bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[${COLORS.monad.purple}] ${
              existingProfile ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="Enter username"
            required={!existingProfile}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Avatar URL (optional)</label>
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
            className={`w-full px-4 py-2 bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[${COLORS.monad.purple}]`}
            placeholder="Enter avatar URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio (optional)</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className={`w-full px-4 py-2 bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[${COLORS.monad.purple}] min-h-[100px]`}
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={isLoading || (!existingProfile && !formData.username)}
            className={`px-8 py-2 bg-[${COLORS.monad.purple}] text-[${COLORS.text.primary}] rounded-full hover:bg-[${COLORS.monad.purple}]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : existingProfile ? 'Continue' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}