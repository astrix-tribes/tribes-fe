import { useCallback } from 'react';
import { Address } from 'viem';
import { useWallet } from './useWallet';
import { Tribe } from '../types/tribe';
import { useTribesSDK } from '../contexts/TribesContext';

export interface TribesDataHookResult {
  // State
  isLoading: boolean;
  error: string | null;
  tribes: Tribe[];
  userTribes: number[];

  // Actions
  getTribe: (tribeId: number) => Promise<Tribe>;
  getAllTribes: () => Promise<void>;
  getUserTribes: (address: Address) => Promise<number[]>;
  getMemberStatus: (tribeId: number, memberAddress: Address) => Promise<number>;
  refreshTribes: () => Promise<void>;
}

/**
 * Hook for reading tribes data
 */
export function useTribesData(): TribesDataHookResult {
  const { 
    sdk, 
    isInitialized, 
    tribes, 
    isLoading, 
    error, 
    refreshTribes: contextRefreshTribes,
    getTribe: contextGetTribe
  } = useTribesSDK();
  
  const { address } = useWallet();
  
  // Wrapper functions to maintain backward compatibility
  const getTribe = useCallback(async (tribeId: number): Promise<Tribe> => {
    const tribe = await contextGetTribe(tribeId);
    if (!tribe) {
      throw new Error(`Tribe ${tribeId} not found`);
    }
    return tribe;
  }, [contextGetTribe]);

  const getAllTribes = useCallback(async (): Promise<void> => {
    return contextRefreshTribes();
  }, [contextRefreshTribes]);
  
  const refreshTribes = useCallback(async (): Promise<void> => {
    return contextRefreshTribes();
  }, [contextRefreshTribes]);

  // These functions are still needed for specific use cases
  const getUserTribes = useCallback(async (userAddress: Address): Promise<number[]> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      return await sdk.getUserTribes(userAddress);
    } catch (err) {
      console.error('Error getting user tribes:', err);
      throw err;
    }
  }, [sdk]);

  const getMemberStatus = useCallback(async (tribeId: number, memberAddress: Address): Promise<number> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      return await sdk.getMemberStatus(tribeId, memberAddress);
    } catch (err) {
      console.error('Error getting member status:', err);
      throw err;
    }
  }, [sdk]);

  return {
    isLoading,
    error,
    tribes,
    userTribes: [], // This comes from the context now
    getTribe,
    getAllTribes,
    getUserTribes,
    getMemberStatus,
    refreshTribes
  };
} 