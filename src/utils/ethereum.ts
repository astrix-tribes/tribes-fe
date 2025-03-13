import { 
  type WalletClient, 
  createWalletClient, 
  createPublicClient,
  custom, 
  http 
} from 'viem';
import { MONAD_TESTNET } from '../constants/networks';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'tribes_auth',
  PROFILE: 'tribes_profile',
  FOLLOWERS: 'tribes_followers'
} as const;

export interface FollowedProfile {
  address: string;
  username: string;
  avatar: string;
}

// Save auth data to local storage
export const saveAuthData = (data: { address: string | null; isConnected: boolean }) => {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data));
};

// Get auth data from local storage
export const getAuthData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH);
  return data ? JSON.parse(data) : { address: null, isConnected: false };
};

// Save profile data to local storage
export const saveProfileData = (data: any) => {
  // Handle BigInt serialization
  const profileDataString = JSON.stringify(data, (key, value) => {
    // Convert BigInt to string with a special marker
    if (typeof value === 'bigint') {
      return { __bigint: value.toString() };
    }
    return value;
  });
  
  localStorage.setItem(STORAGE_KEYS.PROFILE, profileDataString);
};

// Get profile data from local storage
export const getProfileData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!data) return null;
  
  // Handle BigInt deserialization
  return JSON.parse(data, (key, value) => {
    // Check if the value is our special BigInt marker object
    if (value && typeof value === 'object' && value.__bigint) {
      return BigInt(value.__bigint);
    }
    return value;
  });
};

// Save followed profiles to local storage
export const saveFollowedProfiles = (profiles: FollowedProfile[]) => {
  localStorage.setItem(STORAGE_KEYS.FOLLOWERS, JSON.stringify(profiles));
};

// Get followed profiles from local storage
export const getFollowedProfiles = (): FollowedProfile[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FOLLOWERS);
  return data ? JSON.parse(data) : [];
};

// Check if user has followed minimum required profiles
export const hasMinimumFollows = () => {
  const profiles = getFollowedProfiles();
  return profiles.length >= 3;
};

export const getEthereumProvider = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.warn('No ethereum provider found');
    return null;
  }
  
  try {
    // Ensure the provider is initialized
    await window.ethereum.request({ method: 'eth_chainId' });
    return window.ethereum;
  } catch (error) {
    console.error('Error initializing ethereum provider:', error);
    return null;
  }
};

export const getPublicClient = () => {
  return createPublicClient({
    chain: MONAD_TESTNET,
    transport: http()
  });
};

export const getWalletClient = () => {
  if (!window.ethereum) throw new Error('No ethereum provider found');
  return createWalletClient({
    chain: MONAD_TESTNET,
    transport: custom(window.ethereum)
  });
};

export function createWalletClientFromProvider(provider: any): WalletClient {
  return createWalletClient({
    chain: MONAD_TESTNET,
    transport: custom(provider)
  });
} 