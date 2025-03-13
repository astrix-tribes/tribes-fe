import { PublicClient, WalletClient, createPublicClient, createWalletClient, http, custom } from 'viem';
import { ABIS } from './abis';
import { MONAD_TESTNET } from '../constants/networks';
import { getCurrentChain, getContractAddresses as getAddresses } from '../constants/contracts';

// Use the same interface as in constants/contracts.ts to avoid mismatches
interface ContractAddresses {
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
}

// Get addresses directly from constants/contracts.ts to avoid duplication
export function getContractAddresses(chainId: number = MONAD_TESTNET.id): ContractAddresses {
  return getAddresses(chainId);
}

// Get chain-specific public client
export function getPublicClient(chainId: number = MONAD_TESTNET.id): PublicClient {
  const chain = getCurrentChain(chainId);
  return createPublicClient({
    chain,
    transport: http()
  });
}

// Get chain-specific wallet client
export async function getWalletClient(chainId: number = MONAD_TESTNET.id): Promise<WalletClient> {
  const provider = window.ethereum;
  if (!provider) {
    throw new Error('No provider available');
  }

  const chain = getCurrentChain(chainId);
  const [account] = await provider.request({ method: 'eth_requestAccounts' });

  return createWalletClient({
    account,
    chain,
    transport: custom(provider)
  });
}

// Get chain-specific contract configurations
export function getContracts(chainId: number = MONAD_TESTNET.id) {
  const addresses = getContractAddresses(chainId);
  
  return {
    profileNFTMinter: {
      address: addresses.PROFILE_NFT_MINTER,
      abi: ABIS.ProfileNFTMinter
    },
    // Use TRIBE_CONTROLLER for tribesContract for backward compatibility
    tribesContract: {
      address: addresses.TRIBE_CONTROLLER,
      abi: ABIS.TribeController
    },
    tribeController: {
      address: addresses.TRIBE_CONTROLLER,
      abi: ABIS.TribeController
    },
    collectibleController: {
      address: addresses.COLLECTIBLE_CONTROLLER,
      abi: ABIS.CollectibleController
    },
    eventController: {
      address: addresses.EVENT_CONTROLLER,
      abi: ABIS.EventController
    },
    communityPoints: {
      address: addresses.COMMUNITY_POINTS,
      abi: ABIS.CommunityPoints
    },
    voting: {
      address: addresses.VOTING,
      abi: ABIS.Voting
    },
    roleManager: {
      address: addresses.ROLE_MANAGER,
      abi: ABIS.RoleManager
    },
    superCommunityController: {
      address: addresses.SUPER_COMMUNITY_CONTROLLER,
      abi: ABIS.SuperCommunityController
    },
    contentManager: {
      address: addresses.CONTENT_MANAGER,
      abi: ABIS.ContentManager
    },
    postMinter: {
      address: addresses.POST_MINTER,
      abi: ABIS.PostMinter
    }
  } as const;
}

// Helper to get current chain info
export const getCurrentChainInfo = (chainId?: number) => {
  const chain = chainId ? getCurrentChain(chainId) : MONAD_TESTNET;
  return {
    chain,
    contracts: getContracts(chain.id),
    publicClient: getPublicClient(chain.id),
    getWalletClient: () => getWalletClient(chain.id)
  };
}; 