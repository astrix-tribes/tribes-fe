import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { MONAD_DEVNET, FUSE_EMBER } from '../constants/networks';

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
    if (chainId === MONAD_DEVNET.id) {
      return 'Monad Devnet';
    }
    if (chainId === FUSE_EMBER.id) {
      return 'Flash Testnet';
    }
    return 'Unsupported Chain';
  };

  const getChainLogo = () => {
    if (chainId === MONAD_DEVNET.id) {
      return '/monad-white.svg';
    }
    if (chainId === FUSE_EMBER.id) {
      return '/fuse-white.svg';
    }
    return '/monad-white.svg'; // Default logo
  };

  const getChainLogoAlt = () => {
    if (chainId === MONAD_DEVNET.id) {
      return 'Monad Logo';
    }
    if (chainId === FUSE_EMBER.id) {
      return 'Fuse Logo';
    }
    return 'Chain Logo';
  };

  // Get the primary color based on the current chain
  const getChainColor = () => {
    if (chainId === MONAD_DEVNET.id) {
      return 'monad-purple'; // Monad's purple
    }
    if (chainId === FUSE_EMBER.id) {
      return 'fuse-orange'; // Fuse's orange
    }
    return 'monad-purple'; // Default color
  };

  const primaryColor = getChainColor();

  return (
    <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: 'var(--chain-bg)' }}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="md:hidden text-text-primary">
            <Menu className="w-6 h-6" />
          </button>
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={navigateToDashboard}
            aria-label="Go to Dashboard"
          >
            <img 
              src={getChainLogo()}
              alt={getChainLogoAlt()}
              className="w-8 h-8"
            />
            <span className="text-lg font-bold font-['Inter'] text-text-primary">Tribes</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/20 hover:bg-theme-primary/5 text-text-primary"
            >
              <div className="w-5 h-5 rounded-full bg-theme-primary flex items-center justify-center text-text-primary text-xs font-bold">
                {chainId === MONAD_DEVNET.id ? 'M' : 'F'}
              </div>
              <span>{formatChainName()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div 
                className="absolute top-full mt-2 right-0 w-48 backdrop-blur-sm rounded-xl shadow-lg" 
                style={{ backgroundColor: 'var(--chain-bg)', opacity: 0.9 }}
              >
                <button
                  onClick={() => {
                    switchNetwork(MONAD_DEVNET.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 hover:bg-theme-primary/5 text-text-primary text-left ${chainId === MONAD_DEVNET.id ? 'bg-theme-primary/10' : ''}`}
                >
                  <div className="w-5 h-5 rounded-full bg-theme-primary flex items-center justify-center text-xs font-bold">
                    M
                  </div>
                  <span>Switch to Monad</span>
                </button>
                <button
                  onClick={() => {
                    switchNetwork(FUSE_EMBER.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 hover:bg-theme-primary/5 text-text-primary text-left ${chainId === FUSE_EMBER.id ? 'bg-theme-primary/10' : ''}`}
                >
                  <div className="w-5 h-5 rounded-full bg-theme-primary flex items-center justify-center text-xs font-bold">
                    F
                  </div>
                  <span>Switch to Flash</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-error-main hover:bg-black/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
          <button className={`w-8 h-8 flex items-center justify-center text-text-primary hover:text-${primaryColor}`}>
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}