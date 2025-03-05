import { Chain, defineChain } from 'viem'

export const MONAD_DEVNET_ID = '0x4EAF'
export const MONAD_DEVNET_DECIMAL = 20143

export const FUSE_EMBER_ID = '0x4B5E078D' // 1264453517 in hex
export const FUSE_EMBER_DECIMAL = 1264453517

export const MONAD_DEVNET = defineChain({
  id: MONAD_DEVNET_DECIMAL,
  name: 'Monad Devnet',
  network: 'monad-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'DMON',
    symbol: 'DMON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
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

export const SUPPORTED_CHAINS: Chain[] = [MONAD_DEVNET, FUSE_EMBER]

export const DEFAULT_CHAIN = MONAD_DEVNET

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
  chainId: MONAD_DEVNET_ID,
  chainName: MONAD_DEVNET.name,
  nativeCurrency: MONAD_DEVNET.nativeCurrency,
  rpcUrls: [MONAD_DEVNET.rpcUrls.default.http[0]],
  blockExplorerUrls: [MONAD_DEVNET.blockExplorers.default.url]
}

export const FUSE_NETWORK_CONFIG: NetworkConfig = {
  chainId: FUSE_EMBER_ID,
  chainName: FUSE_EMBER.name,
  nativeCurrency: FUSE_EMBER.nativeCurrency,
  rpcUrls: [FUSE_EMBER.rpcUrls.default.http[0]],
  blockExplorerUrls: [FUSE_EMBER.blockExplorers.default.url]
}

// Error messages for network switching
export const NETWORK_ERRORS = {
  WRONG_NETWORK: 'Please switch to a supported network',
  NETWORK_SWITCH_FAILED: 'Failed to switch network',
  USER_REJECTED: 'User rejected network switch',
  CHAIN_NOT_ADDED: 'Network not added to wallet'
} as const 