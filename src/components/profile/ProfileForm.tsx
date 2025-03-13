import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { useNotification } from '../../contexts/NotificationContext';
import { getWalletClient, getContracts } from '../../config/contracts';
import { Profile } from '../../types/contracts';
import { useWalletClient } from 'wagmi';
import { useNetwork } from '../../hooks/useNetwork';
import { MONAD_TESTNET, FUSE_EMBER, SUPPORTED_CHAINS } from '../../constants/networks';
import { useWallet } from '../../hooks/useWallet';
import { useTribesSDK } from '../../contexts/TribesContext';

// Username validation constants
const USERNAME_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 32,
  ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/
};

interface ProfileFormProps {
  mode: 'create' | 'edit';
  existingProfile?: Profile | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ProfileForm({ mode, existingProfile, onSuccess, onCancel, className = '' }: ProfileFormProps) {
  const navigate = useNavigate();
  const { 
    createProfile, 
    updateProfileMetadata, 
    checkUsernameAvailability,
    validateUsername,
    currentChainId,
    isTargetNetwork
  } = useProfile();
  const { showNotification } = useNotification();
  const { data: wagmiWalletClient, isLoading: isWalletLoading } = useWalletClient();
  const { chainId, switchNetwork } = useNetwork();
  const { isConnected, address, walletClient } = useWallet();
  const { sdk } = useTribesSDK();
  
  const [username, setUsername] = useState(existingProfile?.username || '');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [discord, setDiscord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  
  // Move useRef to top level of component
  const checkedUsernamesRef = useRef<Map<string, boolean>>(new Map());

  // Debounced username check with caching
  useEffect(() => {
    // Skip check if in edit mode or username is too short
    if (mode === 'edit' || username.length < USERNAME_CONSTRAINTS.MIN_LENGTH) {
      return;
    }

    // Store the current username to compare in the cleanup function
    const currentUsername = username;
    const currentChainId = chainId;
    const cacheKey = `${username}-${currentChainId}`;
    
    // Create a flag to handle component unmount
    let isMounted = true;
    
    // Check if we already have a cached result for this username
    if (checkedUsernamesRef.current.has(cacheKey)) {
      const cachedResult = checkedUsernamesRef.current.get(cacheKey);
      console.log(`[ProfileForm] Using cached result for ${username} on chain ${currentChainId}: ${cachedResult}`);
      setIsUsernameAvailable(cachedResult || false);
      return;
    }
    
    console.log(`[ProfileForm] Setting up debounce check for ${username} on chain ${currentChainId}`);
    const timer = setTimeout(async () => {
      if (!isMounted) {
        console.log(`[ProfileForm] Component unmounted, skipping check for ${currentUsername}`);
        return;
      }
      
      setIsCheckingUsername(true);
      try {
        console.log(`[ProfileForm] Checking availability for ${currentUsername} on chain ${currentChainId}`);
        const available = await checkUsernameAvailability(username);
        
        // Cache this result with chain-aware key
        checkedUsernamesRef.current.set(cacheKey, available);
        
        // Only update state if component is still mounted AND we're still checking the same username
        if (isMounted && currentUsername === username) {
          console.log(`[ProfileForm] Username ${currentUsername} availability on chain ${currentChainId}: ${available}`);
          setIsUsernameAvailable(available);
        }
      } catch (err) {
        console.error('Error checking username:', err);
        if (isMounted && currentUsername === username) {
          setIsUsernameAvailable(false);
        }
      } finally {
        if (isMounted && currentUsername === username) {
          setIsCheckingUsername(false);
        }
      }
    }, 1000); // Increase to 1000ms to further reduce API calls

    return () => {
      console.log(`[ProfileForm] Cleanup for username check: ${currentUsername} on chain ${currentChainId}`);
      isMounted = false;
      clearTimeout(timer);
    };
  }, [username, mode, checkUsernameAvailability, chainId]);

  // Load existing profile data
  useEffect(() => {
    if (existingProfile) {
      setUsername(existingProfile.username);
      try {
        const metadata = JSON.parse(existingProfile.metadata);
        setBio(metadata.bio || '');
        setAvatar(metadata.avatar || '');
      } catch (err) {
        console.error('Failed to parse profile metadata:', err);
      }
    }
  }, [existingProfile]);

  // Basic check for existing profile using local storage
  useEffect(() => {
    const checkExistingProfile = async () => {
      console.log('[ProfileForm] Starting checkExistingProfile, mode:', mode, 'hasCheckedProfile:', hasCheckedProfile);
      
      // Skip if not on create mode or already checked
      if (mode !== 'create' || hasCheckedProfile) {
        console.log('[ProfileForm] Skipping profile check - not in create mode or already checked');
        return;
      }
      
      // Check if we have the on_profile_setup_page flag set
      const onSetupPage = localStorage.getItem('on_profile_setup_page') === 'true';
      
      // Prevent checking profile while on any profile creation page
      if (onSetupPage || 
          window.location.pathname.includes('username-setup') || 
          window.location.pathname.includes('create-profile')) {
        console.log('[ProfileForm] On profile creation page, marking as checked without navigation');
        setHasCheckedProfile(true);
        return;
      }
      
      try {
        console.log('[ProfileForm] Beginning wallet check');
        setIsCheckingUsername(true);
        
        let address;
        if (wagmiWalletClient) {
          const addresses = await wagmiWalletClient.getAddresses();
          address = addresses[0];
          console.log('[ProfileForm] Got address from wagmiWalletClient:', address);
        } else {
          try {
            const walletClient = await getWalletClient();
            const addresses = await walletClient.getAddresses();
            address = addresses[0];
            console.log('[ProfileForm] Got address from getWalletClient:', address);
          } catch (err) {
            console.error('[ProfileForm] Unable to get wallet client:', err);
          }
        }
        
        // Check if there's profile data in local storage
        if (address) {
          console.log('[ProfileForm] Checking stored profile data for address:', address);
          const storedData = localStorage.getItem('tribes_auth_state');
          if (storedData) {
            console.log('[ProfileForm] Found tribes_auth_state in localStorage');
            const data = JSON.parse(storedData);
            // NEVER navigate when on the profile creation pages
            const onProfileCreationPage = 
              window.location.pathname.includes('username-setup') || 
              window.location.pathname.includes('create-profile');
            
            console.log('[ProfileForm] Profile check data:', {
              hasProfile: !!data.profile,
              addressMatch: data.address === address,
              onProfileCreationPage,
              currentPath: window.location.pathname
            });
            
            if (data.profile && data.address === address && !onProfileCreationPage) {
              console.log('[ProfileForm] Found existing profile, navigating to dashboard');
              navigate('/dashboard');
              return;
            } else {
              console.log('[ProfileForm] Not navigating - either no profile, address mismatch, or on profile creation page');
            }
          } else {
            console.log('[ProfileForm] No tribes_auth_state found in localStorage');
          }
        }
      } catch (err) {
        console.error('[ProfileForm] Error checking existing profile:', err);
      } finally {
        setIsCheckingUsername(false);
        setHasCheckedProfile(true);
        console.log('[ProfileForm] Profile check completed');
      }
    };

    // Only check once on initial render, not on every render
    if (!hasCheckedProfile) {
      console.log('[ProfileForm] Triggering profile check');
      checkExistingProfile();
    }
  }, [mode, navigate, hasCheckedProfile, wagmiWalletClient]);

  // Add a direct profile creation function at the top of the component
  const createProfileDirectly = async (username: string, metadataStr: string) => {
    
    // Find the proper chain object from SUPPORTED_CHAINS
    const currentChain = chainId 
      ? SUPPORTED_CHAINS.find(chain => chain.id === chainId) || MONAD_TESTNET
      : MONAD_TESTNET;
      
    console.log('[ProfileForm] Using chain:', { chainId: currentChain.id, chainName: currentChain.name });
    
    if (!walletClient || !address) {
      // Try fallback to wagmi wallet client if available
      if (wagmiWalletClient && address) {
        console.log('[ProfileForm] Using fallback wagmiWalletClient since direct walletClient is unavailable');
        
        try {
          // Continue with wagmiWalletClient
          const { profileNFTMinter } = getContracts(currentChain.id);
          
          console.log('[ProfileForm] Using contracts with wagmiWalletClient:', { 
            profileNFTMinter: profileNFTMinter.address,
            chainId: currentChain.id, 
            address
          });
          
          // Send transaction using wagmi wallet client with the appropriate chain
          const hash = await wagmiWalletClient.writeContract({
            chain: currentChain,
            address: profileNFTMinter.address,
            abi: profileNFTMinter.abi,
            functionName: 'createProfile',
            args: [username, metadataStr],
            account: address
          });
          
          console.log(`[ProfileForm] Transaction submitted with wagmiWalletClient: ${hash}`);
          return hash;
        } catch (error) {
          const wagmiError = error as Error;
          console.error('[ProfileForm] Fallback to wagmiWalletClient also failed:', wagmiError);
          throw new Error(`Failed with wagmiWalletClient: ${wagmiError.message}`);
        }
      }
      
      throw new Error('Wallet not connected: ' + (!walletClient ? 'Missing walletClient' : 'Missing address'));
    }
    
    console.log('[ProfileForm] Creating profile directly with wallet client');
    
    try {
      // Get contract addresses from config using the current chain's ID
      const { profileNFTMinter } = getContracts(currentChain.id);
      
      console.log('[ProfileForm] Using contracts:', { 
        profileNFTMinter: profileNFTMinter.address,
        chainId: currentChain.id, 
        walletClient,
        account: address
      });
      
      // Send transaction directly using the wallet client with the appropriate chain
      const hash = await walletClient.writeContract({
        chain: currentChain,
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'createProfile',
        args: [username, metadataStr],
        account: address
      });
      
      console.log(`[ProfileForm] Transaction submitted: ${hash}`);
      return hash;
    } catch (error) {
      console.error('[ProfileForm] Error sending transaction directly:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[ProfileForm] Form submission attempted');
    
    // Validate form
    if (!username && mode === 'create') {
      showNotification('Username is required', 'error');
      return;
    }

    if (mode === 'create') {
      if (!validateUsername(username)) {
        showNotification('Invalid username format', 'error');
        return;
      }

      if (!isUsernameAvailable) {
        showNotification('Username is not available', 'error');
        return;
      }
    }

    // Check wallet connection
    if (!isConnected) {
      showNotification('Please connect your wallet to create a profile', 'error');
      return;
    }

    if (!isTargetNetwork) {
      showNotification('Please switch to the correct network', 'error');
      return;
    }

    console.log('[ProfileForm] Starting profile creation/update...');
    setIsLoading(true);
    
    try {
      // Prepare metadata for both create and edit modes
      const metadata = JSON.stringify({
        avatar: avatar,
        bio: bio,
        location: location,
        website: website,
        social: {
          twitter: twitter,
          instagram: instagram,
          discord: discord
        }
      });
      
      // Create or update profile
      if (mode === 'edit' && existingProfile) {
        // For edit mode, still use the SDK update function
        try {
          // Convert tokenId to number if it's a string or bigint
          const tokenId = typeof existingProfile.tokenId === 'string' 
            ? parseInt(existingProfile.tokenId) 
            : typeof existingProfile.tokenId === 'bigint'
              ? Number(existingProfile.tokenId)
              : existingProfile.tokenId || 0;
              
          console.log(`[ProfileForm] Updating profile ${tokenId}`);
          
          await updateProfileMetadata(tokenId, metadata);
          showNotification('Profile updated successfully!', 'success');
        } catch (error) {
          const err = error as Error;
          console.error('[ProfileForm] Error updating profile:', err);
          showNotification(`Update failed: ${err.message}`, 'error');
          setIsLoading(false);
          return;
        }
      } else {
        // For create mode, use our direct approach ONLY
        try {
          console.log('[ProfileForm] Attempting direct profile creation');
          
          // Send transaction directly - NEVER try to use the SDK for creation
          const hash = await createProfileDirectly(username, metadata);
          showNotification('Profile creation transaction submitted!', 'success');
        } catch (error) {
          const err = error as Error;
          console.error('[ProfileForm] Direct profile creation failed:', err);
          showNotification(`Error: ${err.message}`, 'error');
          setIsLoading(false);
          return;
        }
      }
      
      // Handle success
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // This block catches any other errors that might occur
      const error = err as Error;
      console.error('[ProfileForm] Unexpected error during form submission:', error);
      showNotification(`Unexpected error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add network switch handler - moved the hook call to the top level
  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(MONAD_TESTNET.id);
      showNotification('Switching to Monad Devnet...', 'info');
    } catch (err) {
      console.error('[ProfileForm] Network switch error:', err);
      showNotification('Failed to switch network', 'error');
    }
  };

  // If wallet is loading, show loading indicator
  if (isWalletLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h1 className="text-3xl font-bold mb-2">
        {mode === 'edit' ? 'Edit Profile' : 'Create Your Profile'}
      </h1>
      <p className="text-gray-400 mb-8">
        {mode === 'edit' 
          ? 'Update your profile information.'
          : 'Choose a unique username and fill in your profile details.'}
      </p>

      {/* Network warning */}
      {!isTargetNetwork && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <h3 className="text-lg font-medium text-red-500 mb-2">Wrong Network</h3>
          <p className="text-gray-300 mb-3">
            You need to be on the Monad Devnet to create or update your profile.
            {currentChainId && (
              <span className="block mt-1">
                Current network: Chain ID {currentChainId} / Required: Chain ID {MONAD_TESTNET.id}
              </span>
            )}
          </p>
          <button
            onClick={handleSwitchNetwork}
            className="py-2 px-4 bg-red-500 text-white rounded-lg font-medium transition-colors hover:bg-red-600"
          >
            Switch to Monad Devnet
          </button>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            Username {mode === 'create' && '*'}
          </label>
          <div className="mt-1 relative">
            <input
              id="username"
              name="username"
              type="text"
              required={mode === 'create'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={mode === 'edit'}
              className={`appearance-none block w-full px-3 py-2 bg-black/50 border ${
                !isUsernameAvailable ? 'border-red-500' : 
                isCheckingUsername ? 'border-yellow-500' : 
                isUsernameAvailable && username.length >= USERNAME_CONSTRAINTS.MIN_LENGTH ? 'border-green-500' : 
                'border-white/10'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent ${
                mode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter username"
            />
            
            {/* Inline status indicators */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isCheckingUsername && (
                <div className="text-yellow-400 animate-spin h-5 w-5">⟳</div>
              )}
              
              {!isCheckingUsername && mode === 'create' && username.length >= USERNAME_CONSTRAINTS.MIN_LENGTH && isUsernameAvailable && (
                <div className="text-green-500 text-xl">✓</div>
              )}
              
              {!isCheckingUsername && mode === 'create' && username.length >= USERNAME_CONSTRAINTS.MIN_LENGTH && !isUsernameAvailable && (
                <div className="text-red-500 text-xl">✗</div>
              )}
            </div>
          </div>
          
          {/* Username validation messages */}
          {mode === 'create' && username.length > 0 && username.length < USERNAME_CONSTRAINTS.MIN_LENGTH && (
            <p className="mt-1 text-sm text-yellow-500">Username must be at least {USERNAME_CONSTRAINTS.MIN_LENGTH} characters</p>
          )}
          
          {mode === 'create' && username.length >= USERNAME_CONSTRAINTS.MIN_LENGTH && !isUsernameAvailable && (
            <p className="mt-1 text-sm text-red-500">Username is not available</p>
          )}
          
          {mode === 'create' && username.length >= USERNAME_CONSTRAINTS.MIN_LENGTH && isUsernameAvailable && !isCheckingUsername && (
            <p className="mt-1 text-sm text-green-500">Username is available</p>
          )}
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-300">
            Avatar URL (optional)
          </label>
          <div className="mt-1">
            <input
              id="avatar"
              name="avatar"
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="appearance-none block w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
              placeholder="Enter avatar URL"
            />
          </div>
        </div>

        {/* Bio Input */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
            Bio (optional)
          </label>
          <div className="mt-1">
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="appearance-none block w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
              placeholder="Tell us about yourself"
            />
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={
              isLoading || 
              isCheckingUsername || 
              (mode === 'create' && (
                !username || 
                username.length < USERNAME_CONSTRAINTS.MIN_LENGTH || 
                !isUsernameAvailable
              ))
            }
            className="flex-1 py-2 px-4 bg-theme-primary text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {/* Show spinner inside button when loading */}
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center bg-theme-primary rounded-lg">
                <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
              </span>
            )}
            {isLoading 
              ? (mode === 'edit' ? 'Saving...' : 'Creating...') 
              : (mode === 'edit' ? 'Save Changes' : 'Create Profile')}
          </button>
        </div>

        <p className="mt-4 text-sm text-center text-gray-400">
          {mode === 'edit'
            ? 'This action requires a small gas fee to update your profile'
            : 'This action requires a small gas fee to mint your profile NFT'}
        </p>
      </form>
    </div>
  );
} 