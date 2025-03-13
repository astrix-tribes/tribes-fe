import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronUp, ChevronDown, Loader } from 'lucide-react';
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

// Network configurations
const networks = [
  {
    name: 'Flash Testnet',
    chainId: 1264453517,
    rpcUrl: 'https://rpc.flash.fuse.io',
    currencySymbol: 'FLASH',
    blockExplorer: 'https://flashscan.monad.xyz',
    iconUrl: '/flash-logo.png'
  },
  {
    name: 'Monad Testnet',
    chainId: 10143,
    rpcUrl: 'https://monad-testnet.g.alchemy.com/v2/5OeRT0SHza89NcfCn83h1lQmRY8iGjsw',
    currencySymbol: 'MONAD',
    blockExplorer: 'https://explorer.monad.xyz/testnet',
    iconUrl: '/monad-logo.png',
  },
  {
    name: 'Chiliz Chain',
    chainId: 88888,
    blockExplorer: 'https://chiliscan.com',
    rpcUrl: 'https://rpc.chiliz.com',
    currencySymbol: 'CHZ'
  },
  {
    name: 'Manta Pacific Sepolia Testnet',
    chainId: 3441006,
    blockExplorer: 'https://pacific-explorer.sepolia-testnet.manta.network',
    rpcUrl: 'https://pacific-rpc.sepolia-testnet.manta.network/http',
    currencySymbol: 'MANTA'
  },
  {
    name: 'Arbitrum Sepolia Testnet',
    chainId: 421614,
    blockExplorer: 'https://sepolia.arbiscan.io',
    rpcUrl: 'https://arbitrum-sepolia-rpc.publicnode.com',
    currencySymbol: 'ETH'
  },
  {
    name: 'Somnia Testnet',
    chainId: 50312,
    blockExplorer: 'https://shannon-explorer.somnia.network/',
    rpcUrl: 'https://dream-rpc.somnia.network',
    currencySymbol: 'STT'
  },
  // {
  //   name: 'Abstract',
  //   chainId: 2741,
  //   blockExplorer: 'https://abscan.org/',
  //   rpcUrl: 'https://api.mainnet.abs.xyz',
  //   currencySymbol: 'ETH'
  // },
  {
    name: 'Abstract Testnet',
    chainId: 11124,
    blockExplorer: 'https://sepolia.abscan.org/',
    rpcUrl: 'https://api.testnet.abs.xyz',
    currencySymbol: 'ETH'
  }
];

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    installed: true,
    enabled: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    installed: false,
    enabled: false
  },
  {
    id: 'ledger',
    name: 'Ledger',
    icon: '📱',
    installed: false,
    enabled: false
  },
  {
    id: 'rainbow',
    name: 'Rainbow Wallet',
    icon: '🌈',
    installed: false,
    enabled: false
  }
];

export const WalletConnect = () => {
  const navigate = useNavigate();
  const { getProfileByAddress } = useProfile();
  const { chainId, switchNetwork } = useNetwork();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const connectionAttempt = useRef(0);
  const [showNetworks, setShowNetworks] = useState(true);
  const [navigating, setNavigating] = useState(false);
  
  // Preload dashboard assets
  useEffect(() => {
    // Preload key components used in the dashboard
    const preloadAssets = async () => {
      try {
        // Preload critical JS chunks
        const preloadLinks = [
          '/src/screens/Dashboard.tsx',
          '/src/components/Layout.tsx',
          '/src/components/BottomNav.tsx'
        ];
        
        preloadLinks.forEach(link => {
          const preloadLink = document.createElement('link');
          preloadLink.rel = 'prefetch';
          preloadLink.href = link;
          document.head.appendChild(preloadLink);
        });
        
        // Optionally preload images
        const dashboardImages: any[] = [
          // Add paths to critical dashboard images here
        ];
        
        dashboardImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      } catch (e) {
        console.error('Error preloading assets:', e);
      }
    };
    
    preloadAssets();
  }, []);
  
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

  // Function to add a network to MetaMask
  const addNetwork = async (network: typeof networks[0]) => {
    if (!window.ethereum) {
      setError('MetaMask is not installed!');
      return;
    }

    try {
      logDebug(`Adding network: ${network.name}`);
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${network.chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: {
              name: network.currencySymbol,
              symbol: network.currencySymbol,
              decimals: 18
            },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.blockExplorer]
          }
        ]
      });
      logDebug(`${network.name} network added to MetaMask`);
    } catch (error) {
      console.error(`Error adding ${network.name} network to MetaMask:`, error);
      setError(`Failed to add ${network.name} network`);
    }
  };

  // Function to switch to a network
  const switchToNetwork = async (networkChainId: number) => {
    if (!window.ethereum) {
      setError('MetaMask is not installed!');
      return;
    }

    try {
      logDebug(`Switching to network with chainId: ${networkChainId}`);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkChainId.toString(16)}` }]
      });
      logDebug(`Switched to network with chainId: ${networkChainId}`);
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        logDebug('Network not added to MetaMask, attempting to add it');
        const network = networks.find(n => n.chainId === networkChainId);
        if (network) {
          await addNetwork(network);
        }
      } else {
        console.error('Error switching network:', error);
        setError('Failed to switch network');
      }
    }
  };

  // Navigate with transition
  const navigateWithTransition = (path: string) => {
    setNavigating(true);
    
    // Pre-cache data for dashboard if possible
    try {
      // Store any necessary data in localStorage for quick access
      localStorage.setItem('dashboard_prefetch', 'true');
    } catch (e) {
      console.error('Error caching data:', e);
    }
    
    // Short delay to ensure UI updates before navigation
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  const connectWallet = async (walletId: string) => {
    if (isConnecting) return;
    if (walletId !== 'metamask') return; // Only allow MetaMask for now
    
    // Set connecting state
    setIsConnecting(true);
    setConnectingWalletId(walletId);
    
    // Increment connection attempt
    connectionAttempt.current += 1;
    logDebug(`Starting connection attempt ${connectionAttempt.current} with ${walletId}`);

    try {
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
        navigateWithTransition('/dashboard');
        return;
      }

      if (profileError?.code === 'NO_PROFILE') {
        // If no profile, go to create profile
        logDebug('No profile found, navigating to create-profile');
        navigateWithTransition('/create-profile');
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
      if (!navigating) {
        setIsConnecting(false);
        setConnectingWalletId(null);
      }
    }
  };

  // If navigating, show a full-screen loader
  if (navigating) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="animate-spin mb-4">
          <Loader size={48} className="text-monad-purple" />
        </div>
        <h2 className="text-xl font-medium text-white">Loading your dashboard...</h2>
        <p className="text-gray-400 mt-2">Please wait while we prepare your experience</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => navigate('/')}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-center space-x-2">
            <div className="w-12 h-2 bg-monad-purple rounded-full" />
            <div className="w-2 h-2 bg-white/20 rounded-full" />
            <div className="w-2 h-2 bg-white/20 rounded-full" />
            <div className="w-2 h-2 bg-white/20 rounded-full" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-monad-purple to-blue-400 bg-clip-text text-transparent">Connect with wallet</h1>
        <p className="text-gray-400 mb-8">
          We found the following options based on compatibility with Tribes.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => wallet.enabled && connectWallet(wallet.id)}
              disabled={isConnecting || !wallet.enabled}
              className={`w-full flex items-center p-4 rounded-xl transition-all ${
                wallet.enabled 
                  ? 'bg-white/5 hover:bg-white/10 hover:shadow-lg hover:shadow-monad-purple/20 cursor-pointer' 
                  : 'bg-white/5 opacity-60 cursor-not-allowed'
              } ${isConnecting && connectingWalletId === wallet.id ? 'border border-monad-purple shadow-lg shadow-monad-purple/30' : ''}`}
            >
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{wallet.name}</div>
                <div className="text-sm text-gray-400">
                  {isConnecting 
                    ? connectingWalletId === wallet.id 
                      ? 'Connecting...' 
                      : 'Waiting...'
                    : wallet.enabled 
                      ? 'Connect now' 
                      : 'Coming soon'}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-8 bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/50">
          <button
            onClick={() => setShowNetworks(!showNetworks)}
            className="w-full py-3 px-4 flex items-center justify-between bg-white/10 hover:bg-white/15 transition-colors"
          >
            <span className="text-lg font-medium">Available Networks</span>
            {showNetworks ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>
          
          {showNetworks && (
            <div className="p-4 space-y-4">
              <p className="text-gray-400 text-sm">
                Select or add one of these networks to your wallet to use with Tribes:
              </p>
              <div className="grid gap-3">
                {networks.map((network) => (
                  <div key={network.chainId} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all hover:shadow-md hover:shadow-monad-purple/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-monad-purple to-blue-500 flex items-center justify-center text-white font-bold">
                          <span>{network.currencySymbol.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{network.name}</h3>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <span>Chain ID: {network.chainId}</span>
                            <span className="mx-2">•</span>
                            <a 
                              href={network.blockExplorer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-monad-purple hover:underline inline-flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Explorer <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            switchToNetwork(network.chainId);
                          }}
                          className="py-2 px-4 bg-gradient-to-r from-monad-purple to-blue-500 text-white text-sm rounded-lg hover:opacity-90 transition-all"
                        >
                          Switch
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNetwork(network);
                          }}
                          className="py-2 px-4 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-8">
          Don't have a wallet?{' '}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-monad-purple hover:text-blue-400 transition-colors hover:underline inline-flex items-center"
          >
            Get MetaMask <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </p>
      </div>
    </div>
  );
};