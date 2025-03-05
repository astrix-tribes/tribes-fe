// Chain IDs (actual network IDs)
export const MONAD_CHAIN_ID = 20143; // Monad Devnet
export const FUSE_CHAIN_ID = 1264453517; // Fuse Ember
export const FLASH_CHAIN_ID = 1264453517; // Flash

export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case MONAD_CHAIN_ID:
      return 'Monad';
    case FUSE_CHAIN_ID:
      return 'Fuse';
    default:
      return 'Unknown';
  }
};

export const getChainColor = (chainId: number): string => {
  switch (chainId) {
    case MONAD_CHAIN_ID:
      return 'var(--monad-green)'; // Monad Green
    case FUSE_CHAIN_ID:
      return 'var(--fuse-gold)'; // Fuse Gold
    default:
      return '#6B7280'; // Gray
  }
};

export const getChainGradient = (chainId: number): string => {
  switch (chainId) {
    case MONAD_CHAIN_ID:
      return 'from-[var(--monad-green)] to-[var(--monad-dark-green)]';
    case FUSE_CHAIN_ID:
      return 'from-[var(--fuse-gold)] to-[var(--fuse-dark-blue)]';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export const getChainAccentColor = (chainId: number): string => {
  switch (chainId) {
    case MONAD_CHAIN_ID:
      return 'var(--chain-accent)'; // Use CSS variable for accent color
    case FUSE_CHAIN_ID:
      return 'var(--chain-accent)'; // Use CSS variable for accent color
    default:
      return 'rgba(107, 114, 128, 0.2)'; // Gray with opacity
  }
};

// Get the appropriate Tailwind class for a given chain
export const getChainColorClass = (chainId: number, type: 'bg' | 'text' | 'border' | 'ring' = 'bg'): string => {
  switch (chainId) {
    case MONAD_CHAIN_ID:
      return type === 'bg' ? 'bg-monad-green' : 
             type === 'text' ? 'text-monad-green' :
             type === 'border' ? 'border-monad-green' : 'ring-monad-green';
    case FUSE_CHAIN_ID:
      return type === 'bg' ? 'bg-fuse-gold' : 
             type === 'text' ? 'text-fuse-gold' :
             type === 'border' ? 'border-fuse-gold' : 'ring-fuse-gold';
    default:
      return type === 'bg' ? 'bg-gray-500' : 
             type === 'text' ? 'text-gray-500' :
             type === 'border' ? 'border-gray-500' : 'ring-gray-500';
  }
}; 