import { ReactNode, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { getWalletClient } from '../config/contracts';
import { useNetwork } from '../hooks/useNetwork';
import { FUSE_EMBER } from '../constants/networks';
import { useTribesSDK } from '../contexts/TribesContext';

interface AuthGuardProps {
  children: ReactNode;
}

const STORAGE_KEY = 'tribes_auth_state';
const DEBUG = true; // Toggle debugging

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

// Debug function to track auth flow
const logDebug = (message: string, data?: any) => {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (data) {
    console.log(`[AuthGuard:${timestamp}] ${message}`, data);
  } else {
    console.log(`[AuthGuard:${timestamp}] ${message}`);
  }
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfileByAddress, isLoading: isSdkLoading } = useProfile();
  const { chainId, switchNetwork } = useNetwork();
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckedChainId, setLastCheckedChainId] = useState<number>();
  const [retryCount, setRetryCount] = useState(0);
  const profileCheckInProgress = useRef(false);
  const MAX_RETRIES = 3;
  const SDK_INIT_TIMEOUT = 5000; // 5 seconds timeout for SDK initialization
  const { sdk, isInitialized } = useTribesSDK();
  
  // Track navigation attempts to prevent loops
  const navigationAttempts = useRef(new Map<string, number>());
  const MAX_NAVIGATION_ATTEMPTS = 3;
  const sdkInitTimer = useRef<NodeJS.Timeout>();

  // Load stored auth state
  const loadStoredAuthState = (): AuthState | null => {
    try {
      // First check tribes_auth_state
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as AuthState;
        // Check if stored state is less than 1 hour old
        if (Date.now() - state.timestamp <= 3600000) {
          logDebug('Found valid tribes_auth_state', { address: state.address, chainId: state.chainId });
          return state;
        }
        localStorage.removeItem(STORAGE_KEY);
        logDebug('Removed expired tribes_auth_state');
      }

      // If no valid tribes_auth_state, check tribes_auth and tribes_profile
      const authData = localStorage.getItem('tribes_auth');
      const profileData = localStorage.getItem('tribes_profile');
      
      if (authData) {
        const auth = JSON.parse(authData);
        const profile = profileData ? JSON.parse(profileData) : null;
        
        if (auth.isConnected && auth.address) {
          const state = {
            address: auth.address,
            chainId: chainId || 0,
            profile: profile ? {
              tokenId: profile.tokenId?.toString() || '0',
              username: profile.username || '',
              metadata: {
                uri: profile.avatarNFT || ''
              }
            } : undefined,
            timestamp: Date.now()
          };
          logDebug('Created auth state from tribes_auth/profile', { address: state.address });
          return state;
        }
      }
      
      logDebug('No valid auth state found');
      return null;
    } catch (err) {
      console.error('Failed to load stored auth state:', err);
      return null;
    }
  };

  // Save auth state
  const saveAuthState = (state: AuthState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
      logDebug('Saved auth state', { address: state.address, chainId: state.chainId });
    } catch (err) {
      console.error('Failed to save auth state:', err);
    }
  };
  
  // Safe navigation that prevents loops
  const safeNavigate = (path: string) => {
    if (location.pathname === path) {
      logDebug(`Already at ${path}, not navigating`);
      return;
    }
    
    const currentCount = navigationAttempts.current.get(path) || 0;
    if (currentCount >= MAX_NAVIGATION_ATTEMPTS) {
      logDebug(`Too many navigation attempts to ${path}, stopping`);
      setIsLoading(false);
      return;
    }
    
    navigationAttempts.current.set(path, currentCount + 1);
    logDebug(`Navigating to ${path} (attempt ${currentCount + 1})`);
    navigate(path);
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Reset navigation attempts when pathname changes
      if (location.pathname !== '/connect') {
        navigationAttempts.current.delete('/connect');
      }
      
      // Skip check if SDK is still loading or not initialized
      if (isSdkLoading || !sdk || !isInitialized) {
        logDebug('SDK not ready, waiting...', { isSdkLoading, hasSdk: !!sdk, isInitialized });
        return;
      }

      // Clear any existing SDK init timer
      if (sdkInitTimer.current) {
        clearTimeout(sdkInitTimer.current);
      }

      // Prevent multiple simultaneous profile checks
      if (profileCheckInProgress.current) {
        logDebug('Profile check already in progress, skipping');
        return;
      }

      try {
        profileCheckInProgress.current = true;
        logDebug(`Starting auth check on path: ${location.pathname}, chainId: ${chainId}`);

        // Skip check if we're already on connect, create-profile, or username-setup routes
        if (['/connect', '/create-profile', '/username-setup'].includes(location.pathname)) {
          logDebug('On auth/profile page, skipping check');
          setIsLoading(false);
          return;
        }

        // If chain hasn't changed and we're not retrying, don't recheck
        if (chainId === lastCheckedChainId && retryCount === 0) {
          logDebug('Chain ID unchanged and not retrying, skipping check');
          return;
        }

        setIsLoading(true);

        // Try to get wallet client first
        let walletClient;
        try {
          logDebug('Getting wallet client');
          walletClient = await getWalletClient(chainId);
        } catch (error) {
          logDebug('No wallet connected, redirecting to connect');
          safeNavigate('/connect');
          return;
        }

        const [address] = await walletClient.getAddresses();
        if (!address) {
          logDebug('No address in wallet client, redirecting to connect');
          safeNavigate('/connect');
          return;
        }
        logDebug('Found wallet address', { address });

        // Load stored auth state first
        const storedState = loadStoredAuthState();
        if (storedState?.profile && storedState.address === address && storedState.chainId === chainId) {
          logDebug('Valid stored auth state found, proceeding');
          // If we have a valid stored state and we're not on profile creation pages, proceed
          if (location.pathname === '/create-profile' || location.pathname === '/username-setup') {
            logDebug('On profile creation page with valid profile, redirecting to dashboard');
            safeNavigate('/dashboard');
          }
          setIsLoading(false);
          return;
        }

        // Ensure we're on a supported chain
        if (!chainId) {
          if (retryCount < MAX_RETRIES) {
            logDebug('No chainId, retrying', { retryCount });
            setRetryCount(prev => prev + 1);
            return;
          }
          logDebug('No chainId after max retries, switching network');
          await switchNetwork(FUSE_EMBER.id);
          setRetryCount(0);
          return;
        }

        setLastCheckedChainId(chainId);
        logDebug('Checking profile on chain', { chainId, address });

        // Check for profile on current chain
        const { profile, error } = await getProfileByAddress(address);
        
        if (error) {
          logDebug('Profile check returned error', { code: error.code });
          
          // If SDK is not initialized, wait and retry
          if (error.code === 'SDK_NOT_INITIALIZED' && retryCount < MAX_RETRIES) {
            logDebug('SDK not initialized, retrying', { retryCount });
            setRetryCount(prev => prev + 1);
            // Set a timeout to retry
            sdkInitTimer.current = setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
            return;
          }
        }

        if (error?.code === 'WRONG_CHAIN') {
          if (retryCount < MAX_RETRIES) {
            logDebug('Wrong chain, retrying', { retryCount });
            setRetryCount(prev => prev + 1);
            return;
          }
          logDebug('Wrong chain after max retries, redirecting to connect');
          safeNavigate('/connect');
          setRetryCount(0);
          return;
        }

        // Reset retry count on successful chain connection
        setRetryCount(0);

        if (error?.code === 'NO_PROFILE') {
          logDebug('No profile found, redirecting to create-profile');
          // Only redirect to create-profile if we're not already there
          if (location.pathname !== '/create-profile') {
            safeNavigate('/create-profile');
          }
          setIsLoading(false);
          return;
        }

        if (!profile) {
          logDebug('No profile and no specific error, redirecting to connect');
          safeNavigate('/connect');
          return;
        }

        logDebug('Profile found, saving auth state', { username: profile.username });
        // Save successful auth state
        saveAuthState({
          address,
          chainId,
          profile: {
            tokenId: profile.tokenId,
            username: profile.username,
            metadata: {
              uri: profile.metadata?.avatar || ''
            }
          },
          timestamp: Date.now()
        });

        // If we have a profile and we're on create-profile, redirect to dashboard
        if (location.pathname === '/create-profile') {
          logDebug('On profile creation page with valid profile, redirecting to dashboard');
          safeNavigate('/dashboard');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (retryCount < MAX_RETRIES) {
          logDebug('Auth check error, retrying', { retryCount });
          setRetryCount(prev => prev + 1);
          return;
        }
        logDebug('Auth check failed after max retries, redirecting to connect');
        safeNavigate('/connect');
        setRetryCount(0);
      } finally {
        profileCheckInProgress.current = false;
        if (retryCount >= MAX_RETRIES) {
          logDebug('Max retries reached, stopping loading');
          setIsLoading(false);
          setRetryCount(0);
        }
      }
    };

    checkAuth();

    // Cleanup timer on unmount
    return () => {
      if (sdkInitTimer.current) {
        clearTimeout(sdkInitTimer.current);
      }
    };
  }, [chainId, location.pathname, isSdkLoading, sdk, isInitialized]);

  if (isLoading || isSdkLoading || !sdk || !isInitialized) {
    logDebug('Rendering loading state', { isLoading, isSdkLoading, hasSdk: !!sdk, isInitialized });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  logDebug('Rendering children');
  return <>{children}</>;
}; 