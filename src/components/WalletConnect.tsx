import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { getWalletClient } from '../config/contracts';
import { useNetwork } from '../hooks/useNetwork';
import { FUSE_EMBER } from '../constants/networks';

const DEBUG = true;
const STORAGE_KEY = 'tribes_auth_state';

// Debug function to track auth flow
const logDebug = (message: string, data?: any) => {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (data) {
    console.log(`[WalletConnect:${timestamp}] ${message}`, data);
  } else {
    console.log(`[WalletConnect:${timestamp}] ${message}`);
  }
};

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    installed: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    installed: false
  },
  {
    id: 'ledger',
    name: 'Ledger',
    icon: '📱',
    installed: false
  },
  {
    id: 'rainbow',
    name: 'Rainbow Wallet',
    icon: '🌈',
    installed: false
  }
];

export const WalletConnect = () => {
  const navigate = useNavigate();
  const { getProfileByAddress } = useProfile();
  const { chainId, switchNetwork } = useNetwork();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>();
  const connectionAttempt = useRef(0);
  
  // Clear localStorage on entry
  useEffect(() => {
    logDebug('WalletConnect component mounted - clearing redirect attempts');
    // Reset navigation attempts in localStorage
    try {
      const data = localStorage.getItem('redirect_attempts');
      if (data) {
        const attempts = JSON.parse(data);
        if (attempts['/connect'] && attempts['/connect'] > 5) {
          logDebug('Too many redirect attempts detected, clearing auth state');
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('tribes_auth');
          localStorage.removeItem('tribes_profile');
        }
      }
      localStorage.removeItem('redirect_attempts');
    } catch (e) {
      console.error('Error clearing redirect attempts:', e);
    }
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;
    
    // Increment connection attempt
    connectionAttempt.current += 1;
    logDebug(`Starting connection attempt ${connectionAttempt.current}`);

    try {
      setIsConnecting(true);
      setError(undefined);

      // Ensure we're on a supported chain first
      if (!chainId) {
        logDebug('No chain ID detected, switching network');
        await switchNetwork(FUSE_EMBER.id);
      }

      logDebug('Getting wallet client');
      const walletClient = await getWalletClient(chainId);
      logDebug('Requesting addresses from wallet');
      const [address] = await walletClient.requestAddresses();

      if (!address) {
        logDebug('No address returned from wallet');
        throw new Error('No address returned from wallet');
      }
      
      logDebug('Got address from wallet', { address });

      // Check if user has a profile on the current chain
      logDebug('Checking for profile');
      const { profile, error: profileError } = await getProfileByAddress(address as `0x${string}`);
      
      if (profileError) {
        logDebug('Profile check returned error', { code: profileError.code });
      }
      
      if (profileError?.code === 'WRONG_CHAIN') {
        logDebug('Wrong chain detected, switching network');
        await switchNetwork(FUSE_EMBER.id);
        throw new Error('Please connect to a supported network');
      }

      // Save auth state to localStorage to avoid redirect loops
      if (address) {
        logDebug('Saving address to localStorage');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          address,
          chainId: chainId || FUSE_EMBER.id,
          timestamp: Date.now()
        }));
      }

      if (profile) {
        // If profile exists, go to dashboard
        logDebug('Profile found, navigating to dashboard');
        navigate('/dashboard');
        return;
      }

      if (profileError?.code === 'NO_PROFILE') {
        // If no profile, go to create profile
        logDebug('No profile found, navigating to create-profile');
        navigate('/create-profile');
        return;
      }

      // If we get here, something went wrong
      logDebug('Unknown profile check result');
      setError('Failed to check profile status');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      logDebug('Connection error', { error });
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center mb-8">
        <button className="p-2" onClick={() => navigate('/')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center space-x-2">
          <div className="w-12 h-2 bg-monad-purple rounded-full" />
          <div className="w-2 h-2 bg-white/20 rounded-full" />
          <div className="w-2 h-2 bg-white/20 rounded-full" />
          <div className="w-2 h-2 bg-white/20 rounded-full" />
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-4">Connect with wallet</h1>
      <p className="text-gray-400 mb-8">
        We found the following options based on compatibility with Tribes.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => connectWallet()}
            disabled={isConnecting || !wallet.installed}
            className={`w-full flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors ${
              isConnecting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-2xl mr-3">{wallet.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{wallet.name}</div>
              <div className="text-sm text-gray-400">
                {isConnecting ? 'Connecting...' : 
                  wallet.id === 'metamask' ? 'Connect now' : 'Coming soon'}
              </div>
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-8">
        More wallet options coming soon
      </p>
    </div>
  );
};