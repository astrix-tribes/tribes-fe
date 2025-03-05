import { useState, useCallback, useEffect } from 'react';
import { Address } from 'viem';
import { useWallet } from './useWallet';
import { TribesSDK } from '../services/TribesSDK';
import { NFTRequirement } from '../types/tribe';

export interface TribesManagementHookResult {
  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  createTribe: (
    name: string,
    metadata: string,
    admins?: string[],
    joinType?: number,
    entryFee?: bigint,
    nftRequirements?: NFTRequirement[]
  ) => Promise<number>;
  joinTribe: (tribeId: number) => Promise<void>;
  requestToJoinTribe: (tribeId: number, entryFee: bigint) => Promise<void>;
  getTribesCount: () => Promise<number>;
}

/**
 * Hook for managing tribes (create, join, etc.)
 */
export function useTribesManagement(): TribesManagementHookResult {
  const [sdk, setSdk] = useState<TribesSDK | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, chainId, isConnected, walletClient } = useWallet();

  // Initialize SDK
  useEffect(() => {
    const initSdk = async () => {
      try {
        setIsLoading(true);
        const tribesSDK = await TribesSDK.create(chainId);
        setSdk(tribesSDK);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    initSdk();
  }, [chainId]);

  // Connect to wallet when available
  useEffect(() => {
    const connectSdk = async () => {
      if (sdk && isConnected && walletClient && address) {
        try {
          await sdk.connect(walletClient, address);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    };

    connectSdk();
  }, [sdk, isConnected, walletClient, address]);

  const createTribe = useCallback(async (
    name: string,
    metadata: string,
    admins?: string[],
    joinType?: number,
    entryFee?: bigint,
    nftRequirements?: NFTRequirement[]
  ): Promise<number> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tribeId = await sdk.createTribe(
        name,
        metadata,
        admins,
        joinType,
        entryFee,
        nftRequirements
      );
      return tribeId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tribe';
      setError(errorMessage);
      console.error('Error creating tribe:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const joinTribe = useCallback(async (tribeId: number): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      await sdk.joinTribe(tribeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join tribe';
      setError(errorMessage);
      console.error('Error joining tribe:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const requestToJoinTribe = useCallback(async (tribeId: number, entryFee: bigint): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      await sdk.requestToJoinTribe(tribeId, entryFee);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request to join tribe';
      setError(errorMessage);
      console.error('Error requesting to join tribe:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const getTribesCount = useCallback(async (): Promise<number> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      return await sdk.getTribesCount();
    } catch (err) {
      console.error('Error getting tribes count:', err);
      throw err;
    }
  }, [sdk]);

  return {
    isLoading,
    error,
    createTribe,
    joinTribe,
    requestToJoinTribe,
    getTribesCount,
  };
} 