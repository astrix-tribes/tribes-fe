import { MONAD_DEVNET, FUSE_EMBER, SUPPORTED_CHAINS } from './networks';
import { createPublicClient, createWalletClient, http, custom, Chain, PublicClient, WalletClient } from 'viem';

type ContractAddresses = {
  ROLE_MANAGER: `0x${string}`;
  PROFILE_NFT_MINTER: `0x${string}`;
  TRIBE_CONTROLLER: `0x${string}`;
  COLLECTIBLE_CONTROLLER: `0x${string}`;
  EVENT_CONTROLLER: `0x${string}`;
  SUPER_COMMUNITY_CONTROLLER: `0x${string}`;
  COMMUNITY_POINTS: `0x${string}`;
  VOTING: `0x${string}`;
  CONTENT_MANAGER: `0x${string}`;
  POST_MINTER: `0x${string}`;
};

type ChainAddresses = {
  [key: number]: ContractAddresses;
};

// Separate caches for public and wallet clients
const publicClientCache = new Map<number, PublicClient>();
const walletClientCache = new Map<number, WalletClient>();

// Contract Addresses by Chain
export const CONTRACT_ADDRESSES: ChainAddresses = {
  [MONAD_DEVNET.id]: {
    ROLE_MANAGER: '0x153777B9Cb7323a911E5D3E3132B3f1158bd71BE',
    PROFILE_NFT_MINTER: '0xFF65e7c1dD05df41e74a5b04c9958BbD661E1B0c',
    TRIBE_CONTROLLER: '0x16C4F870B59E55bB80A620547987Bd9302FC567d',
    COLLECTIBLE_CONTROLLER: '0x5dC8e5A38dC1edDC51aFae4FA27b7E32147D9895',
    EVENT_CONTROLLER: '0x77B123A5dA78c9C33E28ed20aC984dF41693a024',
    SUPER_COMMUNITY_CONTROLLER: '0x85083329E71b77430f9b7Cf7F4d17b5f9ff81290',
    COMMUNITY_POINTS: '0x3F1F0811E2d83003e085Ba812eC7a331795032dE',
    VOTING: '0xC27B7754950fa8554Cb588A7Aa04d406Ad639094',
    CONTENT_MANAGER: '0x4c1B99D32A3671a35c3229cb3647d080CFb94380',
    POST_MINTER: '0x5053a6C1c144Db7F876F7b898943b831cf3Fd817'
  },
  [FUSE_EMBER.id]: {
    ROLE_MANAGER: '0x661C2B7f1C3EC1ACEeA2c02818459061D40823bD',
    PROFILE_NFT_MINTER: '0x6fB6B1DDD4EA6640e04D70979C57E9C01c7b974a',
    TRIBE_CONTROLLER: '0x54812005171F747f5E69afA08989F41Cf06eeE48',
    COLLECTIBLE_CONTROLLER: '0xFD4E7c9AbEab99C9d23605519A883F1a3814595b',
    EVENT_CONTROLLER: '0xF4515E673EF9ED006dbFAF702A87Cd579b128f37',
    SUPER_COMMUNITY_CONTROLLER: '0x214653d9Cc9bbd148B0A1Fc833867c2cE8A0e609',
    COMMUNITY_POINTS: '0xdcF66412c2F2E76938Ed4F991f350Eb4CEA0c377',
    VOTING: '0xFCF9C955fB3A4B137E9526E1De979c67c9a7b45B',
    CONTENT_MANAGER: '0x8fa7A72aAB8595E0EA48bDd0A26e7c1b7F72B362',
    POST_MINTER: '0x58a1F6A010Eb711f5e564C073fC24bDa4AFA2392'
  }
} as const;

// Helper to get contract addresses for current chain
export const getContractAddresses = (chainId: number): ContractAddresses => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    console.warn(`No contract addresses found for chain ${chainId}, falling back to Monad Devnet`);
    return CONTRACT_ADDRESSES[MONAD_DEVNET.id];
  }
  return addresses;
};

// Get the current chain configuration
export const getCurrentChain = (chainId: number): Chain => {
  const chain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  if (!chain) {
    console.warn(`Chain ${chainId} not supported, falling back to Monad Devnet`);
    return MONAD_DEVNET;
  }
  return chain;
};

export const getPublicClient = (chainId?: number): PublicClient => {
  const chain = chainId ? getCurrentChain(chainId) : MONAD_DEVNET;
  const cached = publicClientCache.get(chain.id);
  
  if (cached) {
    return cached;
  }

  const client = createPublicClient({
    chain,
    transport: http(),
    batch: {
      multicall: true
    }
  });

  publicClientCache.set(chain.id, client);
  return client;
};

export const getWalletClient = (chainId?: number): WalletClient => {
  if (!window.ethereum) throw new Error('No ethereum provider found');
  
  const chain = chainId ? getCurrentChain(chainId) : MONAD_DEVNET;
  const cached = walletClientCache.get(chain.id);
  
  if (cached) {
    return cached;
  }

  const client = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  walletClientCache.set(chain.id, client);
  return client;
};

// Profile NFT Minter ABI
export const PROFILE_NFT_MINTER_ABI = [
  // Profile Creation
  {
    inputs: [
      { internalType: "string", name: "username", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" }
    ],
    name: "createProfile",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Username Checks
  {
    inputs: [{ internalType: "string", name: "username", type: "string" }],
    name: "usernameExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  // Profile Updates
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "newMetadataURI", type: "string" }
    ],
    name: "updateProfileMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Profile Queries
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getProfileByTokenId",
    outputs: [
      { internalType: "string", name: "username", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "address", name: "owner", type: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "username", type: "string" }],
    name: "getTokenIdByUsername",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const; 