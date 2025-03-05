import { Chain } from 'viem';

export type ChainType = 'EVM' | 'EVM-like' | 'Rust' | 'Move';

export interface ChainInfo {
  chainId: string;
  chainName: string;
  chainType: ChainType;
  chainLogo: string;
  enabled: boolean;
}

export const CHAIN_LIST: ChainInfo[] = [
  {
    chainId: "1",
    chainName: "Ethereum Mainnet",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
    enabled: true
  },
  {
    chainId: "56",
    chainName: "Binance Smart Chain",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_bsc.jpg",
    enabled: true
  },
  {
    chainId: "42161",
    chainName: "Arbitrum One",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg",
    enabled: true
  },
  {
    chainId: "137",
    chainName: "Polygon",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",
    enabled: true
  },
  {
    chainId: "43114",
    chainName: "Avalanche C-Chain",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg",
    enabled: false
  },
  {
    chainId: "250",
    chainName: "Fantom Opera",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_fantom.jpg",
    enabled: false
  },
  {
    chainId: "10",
    chainName: "Optimism",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg",
    enabled: false
  },
  {
    chainId: "25",
    chainName: "Cronos",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_cronos.jpg",
    enabled: false
  },
  {
    chainId: "100",
    chainName: "Gnosis Chain",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_gnosis.jpg",
    enabled: false
  },
  {
    chainId: "1284",
    chainName: "Moonbeam",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_moonbeam.jpg",
    enabled: false
  },
  {
    chainId: "42220",
    chainName: "Celo",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_celo.jpg",
    enabled: false
  },
  {
    chainId: "8217",
    chainName: "Klaytn",
    chainType: "EVM",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_klaytn.jpg",
    enabled: false
  },
  {
    chainId: "Tron",
    chainName: "Tron",
    chainType: "EVM-like",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_tron.jpg",
    enabled: false
  },
  {
    chainId: "Solana",
    chainName: "Solana",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_solana.jpg",
    enabled: false
  },
  {
    chainId: "Polkadot",
    chainName: "Polkadot",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_polkadot.jpg",
    enabled: false
  },
  {
    chainId: "Kusama",
    chainName: "Kusama",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_kusama.jpg",
    enabled: false
  },
  {
    chainId: "NEAR Protocol",
    chainName: "NEAR Protocol",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_near.jpg",
    enabled: false
  },
  {
    chainId: "Terra 2.0",
    chainName: "Terra 2.0",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_terra.jpg",
    enabled: false
  },
  {
    chainId: "Osmosis",
    chainName: "Osmosis",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_osmosis.jpg",
    enabled: false
  },
  {
    chainId: "Stellar",
    chainName: "Stellar",
    chainType: "Rust",
    chainLogo: "https://icons.llamao.fi/icons/chains/rsz_stellar.jpg",
    enabled: true
  },
  {
    chainId: "Partisia",
    chainName: "Partisia",
    chainType: "Rust",
    chainLogo: "https://partisia.org/wp-content/uploads/2022/11/partisia_logo.png",
    enabled: true
  },
  {
    chainId: "Aptos",
    chainName: "Aptos",
    chainType: "Move",
    chainLogo: "https://cryptologos.cc/logos/aptos-apt-logo.png?v=013",
    enabled: false
  },
  {
    chainId: "Sui",
    chainName: "Sui",
    chainType: "Move",
    chainLogo: "https://cryptologos.cc/logos/sui-sui-logo.png?v=013",
    enabled: false
  }
];

// Helper functions

export const getEnabledChains = (): ChainInfo[] => {
  return CHAIN_LIST.filter(chain => chain.enabled);
};

export const getChainsByType = (type: ChainType): ChainInfo[] => {
  return CHAIN_LIST.filter(chain => chain.chainType === type);
};

export const getEnabledChainsByType = (type: ChainType): ChainInfo[] => {
  return CHAIN_LIST.filter(chain => chain.chainType === type && chain.enabled);
};

export const getChainById = (chainId: string): ChainInfo | undefined => {
  return CHAIN_LIST.find(chain => chain.chainId === chainId);
};

export const isChainEnabled = (chainId: string): boolean => {
  const chain = getChainById(chainId);
  return chain ? chain.enabled : false;
};

export const getEVMChains = (): ChainInfo[] => {
  return getChainsByType('EVM');
};

export const getEnabledEVMChains = (): ChainInfo[] => {
  return getEnabledChainsByType('EVM');
};

// Constants for chain types
export const CHAIN_TYPES = {
  EVM: 'EVM',
  EVM_LIKE: 'EVM-like',
  RUST: 'Rust',
  MOVE: 'Move'
} as const;

// Chain IDs as constants for easy reference
export const CHAIN_IDS = {
  ETHEREUM: '1',
  BSC: '56',
  ARBITRUM: '42161',
  POLYGON: '137',
  AVALANCHE: '43114',
  FANTOM: '250',
  OPTIMISM: '10',
  CRONOS: '25',
  GNOSIS: '100',
  MOONBEAM: '1284',
  CELO: '42220',
  KLAYTN: '8217'
} as const; 