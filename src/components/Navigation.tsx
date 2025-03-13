import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { 
  MONAD_TESTNET, 
  FUSE_EMBER, 
  CHILIZ_MAINNET, 
  MANTA_TESTNET, 
  ARBITRUM_SEPOLIA_TESTNET,
  SOMNIA_TESTNET,
  ABSTRACT_MAINNET,
  ABSTRACT_TESTNET
} from '../constants/networks';

interface NavigationProps {
  onMenuClick: () => void;
}

export function Navigation({ onMenuClick }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect } = useAuth();
  const { chainId, switchNetwork } = useNetwork();
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Don't show navigation on connect screen
  if (['/connect'].includes(location.pathname)) {
    return null;
  }

  const handleDisconnect = () => {
    disconnect();
    navigate('/connect');
    setShowDropdown(false);
  };

  // Navigate to dashboard when logo is clicked
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const formatChainName = () => {
    if (chainId === MONAD_TESTNET.id) {
      return 'Monad Testnet';
    }
    if (chainId === FUSE_EMBER.id) {
      return 'Flash Testnet';
    }
    // if (chainId === CHILIZ_MAINNET.id) {
    //   return 'Chiliz Mainnet';
    // }
    if (chainId === MANTA_TESTNET.id) {
      return 'Manta Testnet';
    }
    // if (chainId === ARBITRUM_SEPOLIA_TESTNET.id) {
    //   return 'Arbitrum Testnet';
    // }
    // if (chainId === SOMNIA_TESTNET.id) {
    //   return 'Somnia Testnet';
    // }
    // if (chainId === ABSTRACT_MAINNET.id) {
    //   return 'Abstract';
    // }
    // if (chainId === ABSTRACT_TESTNET.id) {
    //   return 'Abstract Testnet';
    // }
    return 'Unsupported Chain';
  };

  const getChainLogo = () => {
    if (chainId === MONAD_TESTNET.id) {
      return '/monad-white.svg';
    }
    if (chainId === FUSE_EMBER.id) {
      return '/fuse-white.svg';
    }
    // Add logos for other chains if available
    return '/monad-white.svg'; // Default logo
  };

  const getChainLogoAlt = () => {
    if (chainId === MONAD_TESTNET.id) {
      return 'Monad Logo';
    }
    if (chainId === FUSE_EMBER.id) {
      return 'Fuse Logo';
    }
    return 'Chain Logo';
  };

  // Get the primary color based on the current chain
  const getChainColor = () => {
    if (chainId === MONAD_TESTNET.id) {
      return 'monad-purple'; // Monad's purple
    }
    if (chainId === FUSE_EMBER.id) {
      return 'fuse-orange'; // Fuse's orange
    }
    return 'monad-purple'; // Default color
  };

  const primaryColor = getChainColor();

  // Get the first letter of the chain name for the icon
  const getChainInitial = (chainName: string) => {
    return chainName.charAt(0);
  };

  // All available networks
  const networks = [
    {
      id: MONAD_TESTNET.id,
      name: 'Monad Testnet',
      initial: 'M'
    },
    {
      id: FUSE_EMBER.id,
      name: 'Flash Testnet',
      initial: 'F'
    },
    // {
    //   id: CHILIZ_MAINNET.id,
    //   name: 'Chiliz Mainnet',
    //   initial: 'C'
    // },
    {
      id: MANTA_TESTNET.id,
      name: 'Manta Testnet',
      initial: 'M'
    },
    // {
    //   id: ARBITRUM_SEPOLIA_TESTNET.id,
    //   name: 'Arbitrum Sepolia Testnet',
    //   initial: 'A'
    // },
    // {
    //   id: SOMNIA_TESTNET.id,
    //   name: 'Somnia Testnet',
    //   initial: 'S'
    // },
    // {
    //   id: ABSTRACT_MAINNET.id,
    //   name: 'Abstract',
    //   initial: 'A'
    // },
    // {
    //   id: ABSTRACT_TESTNET.id,
    //   name: 'Abstract Testnet',
    //   initial: 'A'
    // }
  ];

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: 'var(--chain-bg)' }}>
      <div className="flex items-center justify-between py-5 px-5">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="md:hidden text-text-primary hover:bg-black/20 p-2 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={navigateToDashboard}
            aria-label="Go to Dashboard"
          >
            <img 
              src={getChainLogo()}
              alt={getChainLogoAlt()}
              className="w-9 h-9"
            />
            <span className="text-xl font-bold font-['Inter'] text-text-primary">Tribes</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between space-x-3 px-4 py-2.5 rounded-full bg-black/20 hover:bg-theme-primary/10 text-text-primary transition-colors min-w-[180px]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-theme-primary flex items-center justify-center text-text-primary text-xs font-bold">
                  {chainId === MONAD_TESTNET.id ? 'M' : 
                   chainId === FUSE_EMBER.id ? 'F' : 
                   chainId === CHILIZ_MAINNET.id ? 'C' : 
                   chainId === MANTA_TESTNET.id ? 'M' : 
                   chainId === ARBITRUM_SEPOLIA_TESTNET.id ? 'A' :
                   chainId === SOMNIA_TESTNET.id ? 'S' :
                   chainId === ABSTRACT_MAINNET.id ? 'A' :
                   chainId === ABSTRACT_TESTNET.id ? 'A' : '?'}
                </div>
                <span className="font-medium">{formatChainName()}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div 
                className="absolute top-full mt-2 right-0 w-64 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/10" 
                style={{ backgroundColor: 'var(--chain-bg)', opacity: 0.95 }}
              >
                <div className="py-2">
                  <div className="px-4 py-2 text-xs text-gray-400 uppercase font-semibold">
                    Select Network
                  </div>
                  {networks.map(network => (
                    <button
                      key={network.id}
                      onClick={() => {
                        switchNetwork(network.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center px-4 py-3.5 hover:bg-theme-primary/10 text-text-primary text-left transition-colors ${chainId === network.id ? 'bg-theme-primary/15' : ''}`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-theme-primary flex items-center justify-center text-xs font-bold">
                          {network.initial}
                        </div>
                        <span className="font-medium">{network.name}</span>
                      </div>
                      {chainId === network.id && (
                        <span className="text-xs bg-theme-primary/20 px-2 py-1 rounded-full">Active</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 mt-1">
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center space-x-2 px-4 py-3.5 text-error-main hover:bg-black/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Disconnect Wallet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className={`w-10 h-10 flex items-center justify-center text-text-primary hover:bg-black/20 rounded-full transition-colors`}>
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}