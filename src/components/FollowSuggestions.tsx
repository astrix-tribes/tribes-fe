import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../hooks/useOnboarding'

// Mock data for suggested users
const SUGGESTED_USERS = [
  {
    id: '1',
    username: 'alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    bio: 'Web3 Developer & DeFi enthusiast'
  },
  {
    id: '2',
    username: 'bob',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    bio: 'NFT Artist & Collector'
  },
  {
    id: '3',
    username: 'charlie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    bio: 'Blockchain Researcher'
  }
]

export const FollowSuggestions: React.FC = () => {
  const navigate = useNavigate()
  const { completeOnboarding } = useOnboarding()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleComplete = () => {
    // Here you would typically make API calls to follow the selected users
    // For now, we'll just complete the onboarding
    completeOnboarding()
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Follow some interesting people
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Follow at least 3 people to get started
        </p>
      </div>

      <div className="space-y-4">
        {SUGGESTED_USERS.map(user => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              selectedUsers.has(user.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-medium text-gray-900">@{user.username}</h3>
                <p className="text-sm text-gray-500">{user.bio}</p>
              </div>
            </div>
            <button
              onClick={() => toggleUser(user.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedUsers.has(user.id)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {selectedUsers.has(user.id) ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-900"
        >
          Skip for now
        </button>
        <button
          onClick={handleComplete}
          disabled={selectedUsers.size < 3}
          className={`px-6 py-2 rounded-full font-medium ${
            selectedUsers.size >= 3
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
} 