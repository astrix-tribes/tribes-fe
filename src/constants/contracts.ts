import { MONAD_TESTNET, FUSE_EMBER, SUPPORTED_CHAINS, MANTA_TESTNET, CHILIZ_MAINNET } from './networks';
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
  
  [MANTA_TESTNET.id]: {
    ROLE_MANAGER: '0x2F86722E927f1f080AF80E943eaE45fa28C7C296',
    PROFILE_NFT_MINTER: '0xc7B5f9BE4F716eE179674E2f055d866a797D1126',
    TRIBE_CONTROLLER: '0x575Cc6B211b33aDA87C075AfE3bB878f6B0a8984',
    COLLECTIBLE_CONTROLLER: '0xD750B3e3A361B701c6C53B86A425F4CC345f142d',
    EVENT_CONTROLLER: '0x03f8E7E304dB8615207a0b6fdd02Eb2e30e89557',
    SUPER_COMMUNITY_CONTROLLER: '0x9814514576184fB43AAD956873AE806AA811851E',
    COMMUNITY_POINTS: '0xE05022e242778c50Be3f6b4DD156ac222A311eEb',
    VOTING: '0x1E644d081E2a702A6D4e816D8dc04A9DBaa12Acc',
    CONTENT_MANAGER: '0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb',
    POST_MINTER: '0xA1c3162cE3515bb876Ee4928fB0FD0B20bC37f34'
  },
  [CHILIZ_MAINNET.id]: {
    ROLE_MANAGER: '0x2F86722E927f1f080AF80E943eaE45fa28C7C296',
    PROFILE_NFT_MINTER: '0xc7B5f9BE4F716eE179674E2f055d866a797D1126',
    TRIBE_CONTROLLER: '0x575Cc6B211b33aDA87C075AfE3bB878f6B0a8984',
    COLLECTIBLE_CONTROLLER: '0xD750B3e3A361B701c6C53B86A425F4CC345f142d',
    EVENT_CONTROLLER: '0x03f8E7E304dB8615207a0b6fdd02Eb2e30e89557',
    SUPER_COMMUNITY_CONTROLLER: '0x9814514576184fB43AAD956873AE806AA811851E',
    COMMUNITY_POINTS: '0xE05022e242778c50Be3f6b4DD156ac222A311eEb',
    VOTING: '0x1E644d081E2a702A6D4e816D8dc04A9DBaa12Acc',
    CONTENT_MANAGER: '0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb',
    POST_MINTER: '0xA1c3162cE3515bb876Ee4928fB0FD0B20bC37f34'
  },
  [MONAD_TESTNET.id]: {
    ROLE_MANAGER: "0xd1e6F54a47705659856cdCf1De6bCf992668f7B8",
    CONTENT_MANAGER: '0x4c1B99D32A3671a35c3229cb3647d080CFb94380',
    PROFILE_NFT_MINTER: "0xb5D7997bE927511328a983387A0B8c08A78C2Ff6",
    TRIBE_CONTROLLER: "0x90628Ed5C38C5a902782911Be5b4C811A7bEf4F4",
    COLLECTIBLE_CONTROLLER: "0xE82448DEbBF0cD369912d58aA68F7b2371E24846",
    POST_MINTER: "0xb4a6E494a86679de41Bb18De850C1a497066ec1e",
    VOTING: "0x014656936ea2C31493Ce1374328819370D2443DE",
    COMMUNITY_POINTS: "0x8D682a9917c2d5F2b63Ede57D5d046ff4e08c27E",
    EVENT_CONTROLLER: "0x68Cb873203dc5Af0DbAC292eF94f83054Bc70fc8",
    SUPER_COMMUNITY_CONTROLLER: "0xe1B158fc958C3F8Af64949e40d973ebA32462E1F",
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
    return CONTRACT_ADDRESSES[MONAD_TESTNET.id];
  }
  return addresses;
};

// Get the current chain configuration
export const getCurrentChain = (chainId: number): Chain => {
  const chain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  if (!chain) {
    console.warn(`Chain ${chainId} not supported, falling back to Monad Devnet`);
    return MONAD_TESTNET;
  }
  return chain;
};

export const getPublicClient = (chainId?: number): PublicClient => {
  const chain = chainId ? getCurrentChain(chainId) : MONAD_TESTNET;
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
  
  const chain = chainId ? getCurrentChain(chainId) : MONAD_TESTNET;
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