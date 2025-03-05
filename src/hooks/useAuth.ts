import { useState, useEffect, useRef } from 'react';
import { getEthereumProvider } from '../utils/ethereum';
import { blockchain } from '../utils/blockchainUtils';
import { initializeProvider, getProvider } from '../utils/provider';
import { ProfileData, ProfileMetadata } from '../types/user';
const STORAGE_KEY = 'tribes_auth_state';
const AUTH_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

// Extend ProfileData with tokenId as bigint
export interface Profile extends Omit<ProfileData, 'tokenId'> {
  tokenId: bigint;
}

interface AuthState {
  address: string;
  chainId: number;
  profile?: {
    tokenId: string;
    username: string;
    metadata: {
      uri: string;
    };
  };
  timestamp: number;
}

// Validate stored auth state
const isValidAuthState = (state: AuthState): boolean => {
  return (
    !!state &&
    typeof state.address === 'string' &&
    state.address.startsWith('0x') &&
    typeof state.chainId === 'number' &&
    state.chainId > 0 &&
    typeof state.timestamp === 'number' &&
    Date.now() - state.timestamp <= AUTH_EXPIRATION
  );
};

export function useAuth() {
  const [address, setAddress] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as AuthState;
        if (isValidAuthState(state)) {
          return state.address;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  });

  const [chainId, setChainId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as AuthState;
        if (isValidAuthState(state)) {
          return state.chainId;
        }
      }
    } catch (error) {
      console.error('Error loading chain ID:', error);
    }
    return null;
  });
  
  const [isConnected, setIsConnected] = useState<boolean>(() => !!address && !!chainId);
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as AuthState;
        if (isValidAuthState(state) && state.profile) {
          const metadata: ProfileMetadata = {
            avatar: state.profile.metadata?.uri || '',
            bio: '',
            createdAt: Date.now()
          };
          
          return {
            tokenId: BigInt(state.profile.tokenId || '0'),
            username: state.profile.username,
            metadata,
            nftUri: state.profile.metadata?.uri || '',
            owner: state.address as `0x${string}`
          };
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    return null;
  });

  const [isInitializing, setIsInitializing] = useState(false);
  const initializationRef = useRef(false);
  const providerInitializedRef = useRef(false);

  // Handle chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (newChainId: string) => {
        setChainId(parseInt(newChainId, 16));
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Handle account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          fetchProfile(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address]);

  // Consolidated initialization effect
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (initializationRef.current || isInitializing) return;
      
      try {
        setIsInitializing(true);
        initializationRef.current = true;
        
        const provider = await getEthereumProvider();
        if (!provider || !mounted) return;

        try {
          const chainIdHex = await provider.request({ method: 'eth_chainId' });
          const chainIdNum = parseInt(chainIdHex as string, 16);
          setChainId(chainIdNum);
        } catch (error) {
          console.error('Error getting chain ID:', error);
          return;
        }

        if (provider.selectedAddress) {
          if (typeof window !== 'undefined' && window.ethereum && !providerInitializedRef.current) {
            await initializeProvider();
            providerInitializedRef.current = true;
          }

          setAddress(provider.selectedAddress);
          setIsConnected(true);

          if (!profile && mounted) {
            await fetchProfile(provider.selectedAddress);
          }
        }
      } catch (error) {
        console.error('Error in initialization:', error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      initializationRef.current = false;
    };
  }, []);

  // Single effect for auth state persistence
  useEffect(() => {
    if (!isInitializing && address && chainId) {
      const state: Partial<AuthState> = {
        address,
        chainId,
        timestamp: Date.now()
      };

      if (profile) {
        state.profile = {
          tokenId: profile.tokenId.toString(),
          username: profile.username,
          metadata: {
            uri: profile.nftUri || ''
          }
        };
      }

      saveAuthState(state);
    }
  }, [address, chainId, profile, isInitializing]);

  // Save auth state
  const saveAuthState = (state: Partial<AuthState>) => {
    try {
      const currentState = localStorage.getItem(STORAGE_KEY);
      const parsedState = currentState ? JSON.parse(currentState) as AuthState : null;
      
      const newState: AuthState = {
        address: state.address || parsedState?.address || '',
        chainId: state.chainId || parsedState?.chainId || 0,
        profile: state.profile || parsedState?.profile,
        timestamp: Date.now()
      };
      
      if (newState.address) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        localStorage.setItem('tribes_auth', JSON.stringify({
          isConnected: true,
          address: newState.address,
          chainId: newState.chainId
        }));
        
        if (newState.profile) {
          localStorage.setItem('tribes_profile', JSON.stringify(newState.profile));
        }
      }
    } catch (err) {
      console.error('Failed to save auth state:', err);
    }
  };

  const connect = async () => {
    try {
      if (isInitializing) return;
      setIsInitializing(true);
      
      if (typeof window !== 'undefined' && window.ethereum) {
        await initializeProvider();
      }
      
      const provider = await getEthereumProvider();
      if (!provider) {
        throw new Error('No provider found');
      }

      await provider.request({ method: 'eth_requestAccounts' });
      const address = provider.selectedAddress;
      if (!address) {
        throw new Error('No address found');
      }

      setAddress(address);
      setIsConnected(true);
      await fetchProfile(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setProfile(null);
    
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('tribes_auth');
    localStorage.removeItem('tribes_profile');
    localStorage.removeItem('redirect_attempts');
  };

  const fetchProfile = async (userAddress: string) => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await initializeProvider();
      }
      
      const result = await blockchain.getProfileByAddress(userAddress);
      
      if (!result) {
        return null;
      }
      
      if (result.profile) {
        const [username, metadataStr] = result.profile;
        
        let metadata: ProfileMetadata;
        try {
          metadata = JSON.parse(metadataStr);
        } catch (e) {
          metadata = { avatar: '', bio: '', createdAt: Date.now() };
        }
        
        const profile: Profile = {
          tokenId: BigInt(0),
          username,
          metadata,
          nftUri: metadata.avatar || '',
          owner: userAddress as `0x${string}`
        };
        
        setProfile(profile);
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  return {
    address,
    isConnected,
    profile,
    connect,
    disconnect,
    fetchProfile,
    chainId
  };
}