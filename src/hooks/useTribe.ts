import { useCallback } from 'react';
import { Address } from 'viem';
import { getPublicClient, getContracts } from '../config/contracts';
import { JoinType, TribeConfig } from '../types/contracts';
import { useWallet } from './useWallet';
import { getCurrentChain } from '../constants/contracts';
import { MONAD_TESTNET } from '../constants/networks';
import { Tribe } from '../types/tribe';
import { useTribesSDK } from '../contexts/TribesContext';

const { tribeController } = getContracts();
const publicClient = getPublicClient();

export const useTribe = () => {
  const { address, chainId, walletClient } = useWallet();
  const { sdk } = useTribesSDK();

  const createTribe = useCallback(async (
    tribeName: string,
    tribeMetadata: string,
    whitelist: Address[],
    joinType: JoinType,
    entryFee: bigint,
    collectibleRequirement: Address
  ) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const chain = getCurrentChain(chainId ?? MONAD_TESTNET.id);
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: tribeController.address,
      abi: tribeController.abi,
      functionName: 'createTribe',
      args: [tribeName, tribeMetadata, whitelist, joinType, entryFee, collectibleRequirement],
      account,
      chain
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }, [walletClient, chainId]);

  const joinTribe = useCallback(async (tribeId: number) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const chain = getCurrentChain(chainId ?? MONAD_TESTNET.id);
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: tribeController.address,
      abi: tribeController.abi,
      functionName: 'joinTribe',
      args: [tribeId],
      account,
      chain
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }, [walletClient, chainId]);

  const requestToJoinTribe = useCallback(async (tribeId: number, entryFee: bigint) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const chain = getCurrentChain(chainId ?? MONAD_TESTNET.id);
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: tribeController.address,
      abi: tribeController.abi,
      functionName: 'requestToJoinTribe',
      args: [tribeId],
      account,
      chain,
      value: entryFee
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }, [walletClient, chainId]);

  const getTribeConfig = useCallback(async (tribeId: bigint): Promise<TribeConfig> => {
    const result = await publicClient.readContract({
      address: tribeController.address,
      abi: tribeController.abi,
      functionName: 'getTribeConfig',
      args: [tribeId]
    }) as [number, bigint, Address];

    const [joinType, entryFee, collectibleRequirement] = result;

    return {
      joinType,
      entryFee,
      collectibleRequirement
    };
  }, []);

  // New method to get tribe details by ID
  const getTribeDetails = useCallback(async (tribeId: string | number): Promise<Tribe | null> => {
    if (!sdk) {
      console.error('SDK not initialized');
      return null;
    }

    try {
      // Get all tribes and find the one with matching ID
      const allTribes = await sdk.getAllTribes();
      const tribe = allTribes.find((t: Tribe) => t.id.toString() === tribeId.toString());
      
      if (!tribe) {
        console.warn(`Tribe with ID ${tribeId} not found`);
        return null;
      }
      
      return tribe;
    } catch (error) {
      console.error(`Error getting tribe details for ID ${tribeId}:`, error);
      return null;
    }
  }, [sdk]);

  return {
    createTribe,
    joinTribe,
    requestToJoinTribe,
    getTribeConfig,
    getTribeDetails
  };
};