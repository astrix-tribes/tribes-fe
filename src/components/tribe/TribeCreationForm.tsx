import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useTribesManagement } from '../../hooks/useTribesManagement';
import { useTribesProfile } from '../../hooks/useTribesProfile';
import { useChainId } from 'wagmi';
import { SUPPORTED_CHAINS } from '../../constants/networks';
import { useTribesData } from '../../hooks/useTribesData';
import { AlignLeft, ImageIcon, Users, Lock, Globe } from 'lucide-react';
import { Card, CardContent } from '../common/ui';
import { TribeMetadata, TribeJoinType } from '../../types/tribe';

// Mock addTribe method - in a real app, this would come from useTribesData hook
const addTribe = (tribeId: number, data: any) => {
  console.log(`Adding tribe ${tribeId} to local cache`, data);
};

// Extend the Window interface to include our tribes global
declare global {
  interface Window {
    tribes?: {
      users?: Record<string, {
        username?: string;
        address?: string;
        metadata?: string;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
  }
}

interface TribeCreationFormProps {
  onSuccess?: (tribeId: number) => void;
  onCancel?: () => void;
}

interface AdminUser {
  username: string;
  address: string;
  isResolved: boolean;
  isValid: boolean;
  isLoading: boolean;
  statusMessage?: string;
}

// Interface for profile lookup result
interface ProfileLookupResult {
  isValid: boolean;
  address?: string;
  statusMessage?: string;
}

export const TribeCreationForm: React.FC<TribeCreationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [adminInput, setAdminInput] = useState(''); // For username input
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]); // For tracking usernames with addresses
  const [joinType, setJoinType] = useState<TribeJoinType>(TribeJoinType.Open); // Default join type
  const [entryFee, setEntryFee] = useState('0');
  const [chainError, setChainError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const adminInputRef = useRef<HTMLInputElement>(null);
  
  // Get current chain ID from wallet
  const chainId = useChainId();
  
  // Tribe management hook
  const {
    isLoading,
    error,
    createTribe
  } = useTribesManagement();

  // Profile management hook for username lookup
  const {
    profile,
    checkUsernameAvailability,
    validateUsername
  } = useTribesProfile();
  
  // Add tribes data hook
  // const { addTribe } = useTribesData();
  
  // Check if on a supported chain
  useEffect(() => {
    // Also check the chainId from window.ethereum as a backup
    if (window.ethereum && window.ethereum.chainId) {
      const detectedChainId = parseInt(window.ethereum.chainId as string, 16);
    }
    
    if (chainId) {
      // We have a chainId, check if it's supported
      const isSupported = SUPPORTED_CHAINS.some(chain => chain.id === chainId);
      if (!isSupported) {
        const supportedChainIds = SUPPORTED_CHAINS.map(chain => chain.id).join(', ');
        setChainError(`Network not supported. Please switch to one of the supported networks (Chain IDs: ${supportedChainIds})`);
      } else {
        setChainError(null);
      }
    } else {
      // No chainId from wagmi, check if we can get it from window.ethereum
      if (window.ethereum && window.ethereum.chainId) {
        const detectedChainId = parseInt(window.ethereum.chainId as string, 16);
        const isSupported = SUPPORTED_CHAINS.some(chain => chain.id === detectedChainId);
        if (!isSupported) {
          const supportedChainIds = SUPPORTED_CHAINS.map(chain => chain.id).join(', ');
          setChainError(`Network not supported. Please switch to one of the supported networks (Chain IDs: ${supportedChainIds})`);
        } else {
          setChainError(null);
        }
      } else {
        // Cannot determine chain, show generic error
        const supportedChainIds = SUPPORTED_CHAINS.map(chain => chain.id).join(', ');
        setChainError(`Cannot detect network. Please connect to one of the supported networks (Chain IDs: ${supportedChainIds})`);
      }
    }
  }, [chainId]);
  
  // Create metadata object
  const getTribeMetadata = (): string => {
    // Build a complete metadata object for consistent display
    const metadata: TribeMetadata = {
      description: description,
      avatar: avatar || '/monad-white.svg', // Default avatar if not provided
      coverImage: coverImage || '/monad-banner.png', // Default cover if not provided
      createdAt: new Date().toISOString(),
      topics: [],
      social: {
        twitter: '',
        discord: '',
        telegram: ''
      }
    };
    
    // Convert to string for contract storage
    return JSON.stringify(metadata);
  };
  
  // Get admin addresses from resolved usernames
  const getAdminAddresses = (): string[] => {
    return adminUsers
      .filter(admin => admin.isResolved && admin.isValid)
      .map(admin => admin.address);
  };

  // Fetch profile by username
  const fetchProfileByUsername = async (username: string): Promise<ProfileLookupResult> => {
    try {
      // First validate username format
      if (!validateUsername(username)) {
        return {
          isValid: false,
          statusMessage: 'Invalid format (3-20 chars, a-z, 0-9, _)'
        };
      }
      
      // Check if username exists (if available = false, then it exists)
      const isAvailable = await checkUsernameAvailability(username);
      
      if (isAvailable) {
        return {
          isValid: false,
          statusMessage: 'Username not found'
        };
      }
      
      // TODO: Implement full profile lookup from the chain or an API
      // Mock implementation for now
      return {
        isValid: true,
        address: `0x${username.padEnd(40, '0').substring(0, 40)}`
      };
    } catch (err) {
      console.error('Error in fetchProfileByUsername:', err);
      return {
        isValid: false,
        statusMessage: 'Error looking up profile'
      };
    }
  };

  // Add admin username
  const addAdminUsername = async (username: string) => {
    // Don't add empty usernames
    if (!username.trim()) return;
    
    // Validate username format (3-20 chars, only letters, numbers, underscores)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setAdminUsers(prev => [...prev, {
        username,
        address: '',
        isResolved: true,
        isValid: false,
        isLoading: false,
        statusMessage: 'Invalid format (3-20 chars, a-z, 0-9, _)'
      }]);
      setAdminInput('');
      return;
    }
    
    // Don't add duplicate usernames
    if (adminUsers.some(admin => admin.username.toLowerCase() === username.toLowerCase())) {
      setAdminInput('');
      return;
    }
    
    // Add the username with pending status
    setAdminUsers(prev => [...prev, {
      username,
      address: '',
      isResolved: false,
      isValid: false,
      isLoading: true,
      statusMessage: 'Resolving...'
    }]);
    
    // Clear input
    setAdminInput('');
    
    try {
      // Try to fetch the profile
      const profileResult = await fetchProfileByUsername(username);
      
      if (profileResult.isValid) {
        // Update admin with valid address (ensure address is a string)
        setAdminUsers(prev => 
          prev.map(admin => 
            admin.username === username 
              ? { 
                  ...admin, 
                  address: profileResult.address || '', 
                  isResolved: true, 
                  isValid: true, 
                  isLoading: false,
                  statusMessage: undefined
                }
              : admin
          )
        );
      } else {
        // Update admin with invalid status
        setAdminUsers(prev => 
          prev.map(admin => 
            admin.username === username 
              ? { 
                  ...admin, 
                  isResolved: true, 
                  isValid: false, 
                  isLoading: false,
                  statusMessage: profileResult.statusMessage
                }
              : admin
          )
        );
      }
    } catch (err) {
      console.error('Error resolving username:', err);
      
      // Update admin with error status
      setAdminUsers(prev => 
        prev.map(admin => 
          admin.username === username 
            ? { 
                ...admin, 
                isResolved: true, 
                isValid: false, 
                isLoading: false,
                statusMessage: 'Failed to resolve'
              }
            : admin
        )
      );
    }
  };
  
  // Handle form submission to create the tribe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert('Please enter a tribe name');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the createTribe function from the hook
      const tribeId = await createTribe(
        name.trim(),
        getTribeMetadata(),
        getAdminAddresses(),
        joinType,
        BigInt(entryFee),
        []
      );
      
      // Add to local cache
      addTribe(tribeId, {
        id: tribeId.toString(),
        name: name.trim(),
        description,
        joinType,
        entryFee,
        avatar,
        coverImage
      });
      
      if (onSuccess) {
        onSuccess(tribeId);
      }
    } catch (err: any) {
      console.error('Error creating tribe:', err);
      alert(err.message || 'Failed to create tribe');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdminInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (adminInput.trim()) {
        addAdminUsername(adminInput.trim());
      }
    }
  };
  
  const removeAdminUsername = (username: string) => {
    setAdminUsers(prev => prev.filter(admin => admin.username !== username));
  };
  
  const focusAdminInput = () => {
    adminInputRef.current?.focus();
  };
  
  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Tribe</h2>
        
        {chainError && (
          <div className="bg-red-50 p-4 rounded-md mb-6 text-red-600">
            {chainError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tribe Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tribe Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter tribe name"
              required
            />
          </div>
          
          {/* Tribe Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <div className="flex items-center gap-1">
                <AlignLeft className="w-4 h-4" />
                <span>Description</span>
              </div>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-black"
              placeholder="What is this tribe about?"
            />
          </div>
          
          {/* Tribe Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>Avatar Image URL</span>
                </div>
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="https://example.com/avatar.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>Cover Image URL</span>
                </div>
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="https://example.com/cover.png"
              />
            </div>
          </div>
          
          {/* Tribe Join Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Join Type</span>
              </div>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setJoinType(TribeJoinType.Open)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  joinType === TribeJoinType.Open 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Open (Anyone can join)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setJoinType(TribeJoinType.Approval)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  joinType === TribeJoinType.Approval 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Approval Required</span>
              </button>
              
              <button
                type="button"
                onClick={() => setJoinType(TribeJoinType.Closed)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  joinType === TribeJoinType.Closed 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Invite Only</span>
              </button>
            </div>
            
            {joinType === TribeJoinType.Approval && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Entry Fee (optional)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <span className="ml-2">wei</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Members will need to pay this fee to join your tribe
                </p>
              </div>
            )}
          </div>
          
          {/* Admins */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Admins</span>
              </div>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {adminUsers.map((admin, index) => (
                <div 
                  key={index}
                  className={`px-3 py-1 rounded-full flex items-center text-sm ${
                    admin.isLoading
                      ? 'bg-gray-200 text-gray-700'
                      : admin.isValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span>{admin.username}</span>
                  {admin.isLoading ? (
                    <div className="ml-2 w-3 h-3 rounded-full border-2 border-gray-500 border-t-transparent animate-spin"></div>
                  ) : admin.statusMessage ? (
                    <span className="ml-2 text-xs">{admin.statusMessage}</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeAdminUsername(admin.username)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                ref={adminInputRef}
                type="text"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                onKeyDown={handleAdminInputKeyDown}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter username to add admin"
              />
              <button
                type="button"
                onClick={() => {
                  if (adminInput.trim()) {
                    addAdminUsername(adminInput.trim());
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter usernames to add admins. Your account will automatically be an admin.
            </p>
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading || loading}
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                (isLoading || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading || loading || !!chainError}
            >
              {(isLoading || loading) ? 'Creating...' : 'Create Tribe'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 