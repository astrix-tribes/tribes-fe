import { useState, useCallback, useEffect } from 'react';
import { blockchain } from '../utils/blockchainUtils';
import { useChainId } from 'wagmi';
import { ErrorType } from '../types';
import { getPublicClient, getContracts } from '../config/contracts';

interface ProfileData {
  tokenId: string;
  username: string;
  metadata: string;
  nftUri: string;
  owner: string;
}

interface TribesProfileHookResult {
  // Profile data
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getProfileById: (profileId: number) => Promise<void>;
  getProfileByUsername: (username: string) => Promise<void>;
  createProfile: (username: string, metadata: string) => Promise<number>;
  updateProfileMetadata: (profileId: number, metadata: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  
  // Validation
  validateUsername: (username: string) => boolean;
}

/**
 * Hook for managing profiles in the Tribes ecosystem
 */
export function useTribesProfile(): TribesProfileHookResult {
  const chainId = useChainId();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Get profile by ID
   */
  const getProfileById = useCallback(async (profileId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await blockchain.getProfileByTokenId(profileId);
      if (!result) {
        throw new Error('Profile not found');
      }
      
      // Destructure the result object properly
      const { username, metadata, owner } = result;
      
      // Parse metadata to get nftUri
      let parsedMetadata;
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        parsedMetadata = { avatar: '' };
      }
      
      setProfile({
        tokenId: profileId.toString(),
        username,
        metadata,
        nftUri: parsedMetadata.avatar || '',
        owner
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get profile';
      setError(errorMessage);
      console.error('Error getting profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get profile by username
   */
  const getProfileByUsername = useCallback(async (username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This should make an API call to get profile by username
      // For now, we'll simulate it with a mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProfile = {
        tokenId: Math.floor(Math.random() * 1000).toString(),
        username,
        metadata: JSON.stringify({ avatar: '' }),
        nftUri: '',
        owner: '0x0000000000000000000000000000000000000000'
      };
      
      setProfile(mockProfile);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get profile by username';
      setError(errorMessage);
      console.error('Error getting profile by username:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new profile
   */
  const createProfile = useCallback(async (username: string, metadata: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the blockchain to create a profile
      // For now, just simulate a delay and return a mock profile ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfileId = Math.floor(Math.random() * 1000);
      
      return mockProfileId;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create profile';
      setError(errorMessage);
      console.error('Error creating profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update profile metadata
   */
  const updateProfileMetadata = useCallback(async (profileId: number, metadata: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the correct type for tokenId (number, not string)
      await blockchain.updateProfile({
        tokenId: profileId, // Pass as number
        metadata
      });
      
      // Update local state if this is the current profile
      if (profile && profile.tokenId === profileId.toString()) {
        setProfile({
          ...profile,
          metadata
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  /**
   * Check if username is available
   */
  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      // In a real implementation, this would check if the username is already taken
      // For now, just simulate a delay and return true most of the time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock: usernames that start with "user_" are considered taken
      return !username.startsWith('user_');
    } catch (err: any) {
      console.error('Error checking username availability:', err);
      return false; // Safer to return false (username taken) on error
    }
  }, []);

  /**
   * Validate username format
   */
  const validateUsername = useCallback((username: string): boolean => {
    // Simple validation: 3-20 chars, alphanumeric or underscore
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }, []);

  return {
    profile,
    isLoading,
    error,
    getProfileById,
    getProfileByUsername,
    createProfile,
    updateProfileMetadata,
    checkUsernameAvailability,
    validateUsername
  };
} 