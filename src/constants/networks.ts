import { Chain, defineChain } from 'viem'

export const MONAD_TESTNET_ID = '0x279f'
export const MONAD_TESTNET_DECIMAL = 10143

export const FUSE_EMBER_ID = '0x4B5E078D' // 1264453517 in hex
export const FUSE_EMBER_DECIMAL = 1264453517

export const SOMNIA_TESTNET_ID = '0xC498' // 50312 in hex
export const SOMNIA_TESTNET_DECIMAL = 50312

export const ABSTRACT_MAINNET_ID = '0xA9B1' // 2741 in hex
export const ABSTRACT_MAINNET_DECIMAL = 2741

export const ABSTRACT_TESTNET_ID = '0x2B38' // 11124 in hex
export const ABSTRACT_TESTNET_DECIMAL = 11124

export const MONAD_TESTNET = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://monad-testnet.g.alchemy.com/v2/5OeRT0SHza89NcfCn83h1lQmRY8iGjsw'],
    },
    public: {
      http: ['https://monad-testnet.g.alchemy.com/v2/5OeRT0SHza89NcfCn83h1lQmRY8iGjsw'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadExplorer',
      url: 'https://explorer-devnet.monadinfra.com',
    },
  },
  testnet: true,
})

export const SOMNIA_TESTNET = defineChain({
  id: SOMNIA_TESTNET_DECIMAL,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SomniaExplorer',
      url: 'https://shannon-explorer.somnia.network/',
    },
  },
  testnet: true,
})

export const FUSE_EMBER = defineChain({
  id: FUSE_EMBER_DECIMAL,
  name: 'Flash Testnet',
  network: 'fuse-ember',
  nativeCurrency: {
    decimals: 18,
    name: 'Fuse',
    symbol: 'FUSE',
  },
  rpcUrls: {
    default: {
      http: ['/fuse-rpc'],
    },
    public: {
      http: ['/fuse-rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'FuseExplorer',
      url: 'https://explorer.flash.fuse.io',
    },
  },
  testnet: true,
})

export const CHILIZ_MAINNET = defineChain({
  id: 88888,
  name: 'Chiliz Chain',
  network: 'Chiliz Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Chiliz',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://chiliz.publicnode.com'],
    },
    public: {
      http: ['https://chiliz.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Chain Explorer',
      url: 'https://chiliscan.com/',
    },
  },
  testnet: true,
})

export const MANTA_TESTNET = defineChain({
  id: 3441006,
  name: 'Manta Pacific Sepolia Testnet',
  network: 'Manta Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MANTA',
    symbol: 'MANTA',
  },
  rpcUrls: {
    default: {
      http: ['https://pacific-rpc.sepolia-testnet.manta.network/http'],
    },
    public: {
      http: ['https://pacific-rpc.sepolia-testnet.manta.network/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Manta Sepolia Explorer',
      url: 'https://pacific-explorer.sepolia-testnet.manta.network',
    },
  },
  testnet: true,
})

export const ARBITRUM_SEPOLIA_TESTNET = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia Testnet',
  network: 'Arbitrum Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://arbitrum-sepolia-rpc.publicnode.com'],
    },
    public: {
      http: ['https://arbitrum-sepolia-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbitrum Sepolia Explorer',
      url: 'https://sepolia.arbiscan.io',
    },
  },
  testnet: true,
})

export const ABSTRACT_MAINNET = defineChain({
  id: ABSTRACT_MAINNET_DECIMAL,
  name: 'Abstract',
  network: 'abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet.abs.xyz'],
    },
    public: {
      http: ['https://api.mainnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Abstract Explorer',
      url: 'https://abscan.org/',
    },
  },
  testnet: false,
})

export const ABSTRACT_TESTNET = defineChain({
  id: ABSTRACT_TESTNET_DECIMAL,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
    public: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Abstract Testnet Explorer',
      url: 'https://sepolia.abscan.org/',
    },
  },
  testnet: true,
})

export const SUPPORTED_CHAINS: Chain[] = [
  MONAD_TESTNET, 
  FUSE_EMBER, 
  CHILIZ_MAINNET, 
  MANTA_TESTNET, 
  ARBITRUM_SEPOLIA_TESTNET, 
  SOMNIA_TESTNET,
  ABSTRACT_MAINNET,
  ABSTRACT_TESTNET
]

export const DEFAULT_CHAIN = MONAD_TESTNET

// Network switching configuration type
export interface NetworkConfig {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

// Network switching configurations for MetaMask
export const MONAD_NETWORK_CONFIG: NetworkConfig = {
  chainId: MONAD_TESTNET_ID,
  chainName: MONAD_TESTNET.name,
  nativeCurrency: MONAD_TESTNET.nativeCurrency,
  rpcUrls: [MONAD_TESTNET.rpcUrls.default.http[0]],
  blockExplorerUrls: [MONAD_TESTNET.blockExplorers.default.url]
}

export const FUSE_NETWORK_CONFIG: NetworkConfig = {
  chainId: FUSE_EMBER_ID,
  chainName: FUSE_EMBER.name,
  nativeCurrency: FUSE_EMBER.nativeCurrency,
  rpcUrls: [FUSE_EMBER.rpcUrls.default.http[0]],
  blockExplorerUrls: [FUSE_EMBER.blockExplorers.default.url]
}

// Add Somnia network config
export const SOMNIA_NETWORK_CONFIG: NetworkConfig = {
  chainId: SOMNIA_TESTNET_ID,
  chainName: SOMNIA_TESTNET.name,
  nativeCurrency: SOMNIA_TESTNET.nativeCurrency,
  rpcUrls: [SOMNIA_TESTNET.rpcUrls.default.http[0]],
  blockExplorerUrls: [SOMNIA_TESTNET.blockExplorers.default.url]
}

// Error messages for network switching
export const NETWORK_ERRORS = {
  WRONG_NETWORK: 'Please switch to a supported network',
  NETWORK_SWITCH_FAILED: 'Failed to switch network',
  USER_REJECTED: 'User rejected network switch',
  CHAIN_NOT_ADDED: 'Network not added to wallet'
} as const 