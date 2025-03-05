import { useState, useCallback, useEffect } from 'react'
import { Address } from 'viem'
import { useNotification } from '../contexts/NotificationContext'
import { ProfileData, ProfileMetadata, ProfileError } from '../types/user'
import { useWallet } from './useWallet'
import { useTribesSDK } from '../contexts/TribesContext'
import { SUPPORTED_CHAINS } from '../constants/networks'
import { useAccount } from 'wagmi'
import { useNetwork } from './useNetwork'

export interface ProfileHookResult {
  // Profile data
  profile: ProfileData | null
  isLoading: boolean
  error: string | null
  
  // Network info
  currentChainId: number | undefined
  isTargetNetwork: boolean
  
  // SDK state
  isSdkInitialized: boolean
  
  // Actions
  getProfileById: (profileId: number) => Promise<void>
  getProfileByUsername: (username: string) => Promise<void>
  createProfile: (username: string, metadata: string) => Promise<number>
  updateProfileMetadata: (profileId: number, metadata: string) => Promise<void>
  checkUsernameAvailability: (username: string) => Promise<boolean>
  validateUsername: (username: string) => boolean
  getProfileByAddress: (address: Address) => Promise<{ profile: ProfileData | null; error?: { code: string } }>
  checkProfileOwnership: (address: Address) => Promise<ProfileData | null>
  skipProfileCreation: () => Promise<boolean>
  hasSkippedProfileCreation: (address: Address) => Promise<boolean>
  findUsernameByAddress: (address: Address) => Promise<string | null>
  updateProfileCache: (profile: ProfileData, chainId: number) => void
  updateProfile: (tokenId: string, metadata: string) => Promise<void>
  checkUsername: (username: string) => Promise<boolean>
}

// Helper function to check if a chain ID is supported
const isChainSupported = (chainId: number | undefined): boolean => {
  if (!chainId) return false;
  return SUPPORTED_CHAINS.some((chain) => chain.id === chainId);
};

// Add this after the existing imports
const DEBUG = true; // Toggle debugging

// Debug function to track profile flow
const logDebug = (message: string, data?: any) => {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (data) {
    console.log(`[useProfile:${timestamp}] ${message}`, data);
  } else {
    console.log(`[useProfile:${timestamp}] ${message}`);
  }
};

/**
 * Hook for interacting with user profiles
 */
export function useProfile(): ProfileHookResult {
  const { sdk, isInitialized } = useTribesSDK();
  const [isLoading, setIsLoading] = useState(false); // Changed to false by default
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { address, chainId, isConnected, walletClient } = useWallet();
  const { showNotification } = useNotification();
  const { chainId: networkChainId } = useNetwork();

  // Connect to wallet when available
  useEffect(() => {
    const connectSdk = async () => {
      if (sdk && isConnected && walletClient && address) {
        try {
          logDebug('Connecting SDK to wallet', { address });
          await sdk.connect(walletClient, address);
        } catch (err) {
          setError((err as Error).message);
          logDebug('SDK wallet connection error', { error: (err as Error).message });
        }
      }
    };

    connectSdk();
  }, [sdk, isConnected, walletClient, address]);

  const getProfileById = useCallback(async (profileId: number) => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const profileData = await sdk.getProfileById(profileId);
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get profile';
      setError(errorMessage);
      console.error('Error getting profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const getProfileByUsername = useCallback(async (username: string) => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const profileData = await sdk.getProfileByUsername(username);
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get profile';
      setError(errorMessage);
      console.error('Error getting profile by username:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const createProfile = useCallback(async (username: string, metadata: string): Promise<number> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    // Check if wallet is connected and reconnect if necessary
    if (!isConnected || !walletClient || !address) {
      throw new Error('Wallet not connected. Please connect your wallet and try again.');
    }

    // Ensure SDK is connected to wallet - multiple attempts with delay
    let connectionAttempts = 0;
    const maxAttempts = 3;
    
    while (connectionAttempts < maxAttempts) {
      try {
        console.log(`[useProfile] Connecting SDK to wallet, attempt ${connectionAttempts + 1}/${maxAttempts}`);
        await sdk.connect(walletClient, address);
        
        // Verify connection
        if (sdk.isWalletConnected()) {
          console.log('[useProfile] SDK successfully connected to wallet');
          break;
        } else {
          console.warn('[useProfile] SDK connection verification failed, retrying...');
        }
      } catch (error) {
        console.error(`[useProfile] SDK connection attempt ${connectionAttempts + 1} failed:`, error);
        if (connectionAttempts === maxAttempts - 1) {
          throw new Error('Failed to connect to wallet after multiple attempts. Please try again.');
        }
      }
      
      connectionAttempts++;
      // Add increasing delay between attempts
      await new Promise(resolve => setTimeout(resolve, 500 * connectionAttempts));
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const parsedMetadata = JSON.parse(metadata) as ProfileMetadata;
      const profileId = await sdk.createProfile(username, parsedMetadata);
      const profileData = await sdk.getProfileById(profileId);
      setProfile(profileData);
      return profileId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      console.error('Error creating profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isConnected, walletClient, address]);

  const updateProfileMetadata = useCallback(async (profileId: number, metadata: string): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const parsedMetadata = JSON.parse(metadata) as ProfileMetadata;
      await sdk.updateProfileMetadata(profileId, parsedMetadata);
      const profileData = await sdk.getProfileById(profileId);
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      return await sdk.checkUsernameAvailability(username);
    } catch (err) {
      console.error('Error checking username availability:', err);
      return false;
    }
  }, [sdk]);

  const validateUsername = useCallback((username: string): boolean => {
    // Usernames must be 3-20 characters and only contain letters, numbers, and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }, []);

  const getProfileByAddress = useCallback(async (address: Address): Promise<{ profile: ProfileData | null; error?: { code: string } }> => {
    if (!sdk || !isInitialized) {
      logDebug('SDK not initialized');
      return { profile: null, error: { code: 'SDK_NOT_INITIALIZED' } };
    }

    setIsLoading(true);
    try {
      logDebug('Getting profile for address', { address });
      const profile = await sdk.getProfileByAddress(address);
      if (!profile) {
        logDebug('No profile found');
        return { profile: null, error: { code: 'NO_PROFILE' } };
      }
      logDebug('Profile found', { profile });
      setProfile(profile);
      return { profile };
    } catch (error) {
      logDebug('Error getting profile', error);
      return { profile: null, error: { code: 'UNKNOWN_ERROR' } };
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isInitialized]);

  const checkProfileOwnership = useCallback(async (address: Address): Promise<ProfileData | null> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      return await sdk.checkProfileOwnership(address);
    } catch (err) {
      console.error('Error checking profile ownership:', err);
      return null;
    }
  }, [sdk]);

  const skipProfileCreation = useCallback(async (): Promise<boolean> => {
    if (!sdk || !address) {
      return false;
    }

    try {
      return await sdk.skipProfileCreation(address);
    } catch (err) {
      console.error('Error skipping profile creation:', err);
      return false;
    }
  }, [sdk, address]);

  const hasSkippedProfileCreation = useCallback(async (address: Address): Promise<boolean> => {
    if (!sdk) {
      return false;
    }

    try {
      return await sdk.hasSkippedProfileCreation(address);
    } catch (err) {
      console.error('Error checking skipped profile creation:', err);
      return false;
    }
  }, [sdk]);

  const findUsernameByAddress = useCallback(async (address: Address): Promise<string | null> => {
    if (!sdk) {
      return null;
    }

    try {
      return await sdk.findUsernameByAddress(address);
    } catch (err) {
      console.error('Error finding username by address:', err);
      return null;
    }
  }, [sdk]);

  const updateProfileCache = useCallback((profile: ProfileData, chainId: number) => {
    try {
      localStorage.setItem('tribes_auth_state', JSON.stringify({
        address: profile.owner,
        chainId,
        profile,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Failed to update profile cache:', err);
    }
  }, []);

  const updateProfile = useCallback(async (tokenId: string, metadata: string): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const parsedMetadata = JSON.parse(metadata) as ProfileMetadata;
      await sdk.updateProfileMetadata(parseInt(tokenId), parsedMetadata);
      const profileData = await sdk.getProfileById(parseInt(tokenId));
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const checkUsername = useCallback(async (username: string): Promise<boolean> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      return await sdk.checkUsernameAvailability(username);
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  }, [sdk]);

  return {
    profile,
    isLoading: isLoading || !isInitialized, // Include initialization state in loading
    error,
    currentChainId: networkChainId,
    isTargetNetwork: isChainSupported(networkChainId),
    isSdkInitialized: !!sdk && isInitialized,
    getProfileById,
    getProfileByUsername,
    createProfile,
    updateProfileMetadata,
    checkUsernameAvailability,
    validateUsername,
    getProfileByAddress,
    checkProfileOwnership,
    skipProfileCreation,
    hasSkippedProfileCreation,
    findUsernameByAddress,
    updateProfileCache,
    updateProfile,
    checkUsername
  };
} 