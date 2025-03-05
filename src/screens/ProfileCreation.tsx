import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useOnboarding } from '../hooks/useOnboarding'
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme'

interface ProfileFormData {
  username: string
  avatar: string
  bio: string
}

const inputStyles = {
  base: `block w-full rounded-lg border-2 shadow-sm 
    focus:ring-2 focus:ring-opacity-50 focus:outline-none
    transition-colors duration-200`,
  default: `border-gray-700 bg-gray-900 text-white placeholder-gray-500
    focus:border-green-500 focus:ring-green-500/20`,
  error: `border-red-500 bg-gray-900 text-white placeholder-gray-500
    focus:border-red-500 focus:ring-red-500/20`,
  disabled: `border-gray-600 bg-gray-800 text-gray-400 cursor-not-allowed`
}

const buttonStyles = {
  base: `w-full flex justify-center items-center py-3 px-6 rounded-lg font-medium
    transition-all duration-200 ease-in-out transform`,
  primary: `bg-green-500 hover:bg-green-600 active:bg-green-700 
    text-white shadow-lg shadow-green-500/20 
    hover:shadow-green-500/30 hover:-translate-y-0.5`,
  secondary: `bg-gray-800 hover:bg-gray-700 active:bg-gray-600
    text-gray-300 hover:text-white border border-gray-700
    hover:border-gray-600`,
  disabled: `bg-gray-600 text-gray-300 cursor-not-allowed opacity-50`
}

export const ProfileCreation: React.FC = () => {
  const navigate = useNavigate()
  const { createProfile, skipProfileCreation, hasSkippedProfileCreation, checkProfileOwnership } = useProfile()
  const { updateProfileId, completeOnboarding } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [existingProfile, setExistingProfile] = useState<{ tokenId: string; username: string } | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    avatar: '',
    bio: ''
  })

  useEffect(() => {
    // Check if user has already skipped or has a profile
    const checkStatus = async () => {
      const walletClient = await window.ethereum?.request({ method: 'eth_requestAccounts' })
      if (walletClient?.[0]) {
        const hasSkipped = await hasSkippedProfileCreation(walletClient[0])
        if (hasSkipped) {
          completeOnboarding()
          navigate('/dashboard')
          return
        }

        // Check for existing profile
        const profile = await checkProfileOwnership(walletClient[0])
        if (profile) {
          setExistingProfile({ tokenId: profile.tokenId, username: profile.username })
          setFormData(prev => ({
            ...prev,
            username: profile.username,
            avatar: profile.metadata?.avatar || '',
            bio: profile.metadata?.bio || ''
          }))
          // If username exists, mark onboarding as complete
          updateProfileId(profile.tokenId)
          completeOnboarding()
          navigate('/dashboard')
        }
      }
    }
    checkStatus()
  }, [hasSkippedProfileCreation, checkProfileOwnership, completeOnboarding, navigate, updateProfileId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const metadata = JSON.stringify({
        avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
        bio: formData.bio,
        createdAt: Date.now()
      });

      const hash = await createProfile(formData.username, metadata);
      if (hash) {
        updateProfileId(hash.toString());
        navigate('/onboarding/follow');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      const skipped = await skipProfileCreation()
      if (skipped) {
        completeOnboarding()
        navigate('/dashboard')
      }
    } finally {
      setIsSkipping(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (existingProfile) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">
            Profile Already Exists
          </h2>
          <p className="text-gray-300 text-center mb-6">
            You already have a profile with username: <span className="text-green-500 font-semibold">{existingProfile.username}</span>
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className={buttonStyles.primary}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">
          Create Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-200"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={!!existingProfile}
              className={`${inputStyles.base} ${existingProfile ? inputStyles.disabled : inputStyles.default}`}
              placeholder="Enter your username"
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <label 
              className="block text-sm font-medium text-gray-200"
            >
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username || 'default'}`}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full bg-gray-700 ring-2 ring-green-500/20"
                />
                <div className="absolute inset-0 rounded-full shadow-inner"></div>
              </div>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className={`${inputStyles.base} ${inputStyles.default}`}
                placeholder="Avatar URL (optional)"
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <label 
              htmlFor="bio" 
              className="block text-sm font-medium text-gray-200"
            >
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className={`${inputStyles.base} ${inputStyles.default} resize-none`}
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || !!existingProfile}
              className={`${buttonStyles.base} ${
                isLoading || existingProfile ? buttonStyles.disabled : buttonStyles.primary
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </button>

            {!existingProfile && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSkipping}
                className={`${buttonStyles.base} ${
                  isSkipping ? buttonStyles.disabled : buttonStyles.secondary
                }`}
              >
                {isSkipping ? 'Skipping...' : 'Skip for now'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 
