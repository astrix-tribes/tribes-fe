/**
 * React hook for using the TribesSDK
 */
import { useState, useEffect, useCallback } from 'react';
import { TribesSDK } from '../services/TribesSDK';
import { Tribe } from '../types/tribe';
import { useWallet } from './useWallet';

/**
 * Hook for interacting with tribes
 * @returns Tribes-related methods and state
 */
export const useTribes = () => {
  const [sdk, setSdk] = useState<TribesSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userTribes, setUserTribes] = useState<number[]>([]);
  const [allTribes, setAllTribes] = useState<Tribe[]>([]);
  const { address, walletClient, chainId, isConnected } = useWallet();

  // Initialize SDK
  useEffect(() => {
    const initSdk = async () => {
      try {
        setLoading(true);
        const tribesSDK = await TribesSDK.create(chainId);
        setSdk(tribesSDK);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
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
          loadUserTribes();
        } catch (err) {
          setError(err as Error);
        }
      }
    };

    connectSdk();
  }, [sdk, isConnected, walletClient, address]);

  // Load user tribes
  const loadUserTribes = useCallback(async () => {
    if (!sdk || !address) return;

    try {
      setLoading(true);
      const tribes = await sdk.getUserTribes(address);
      setUserTribes(tribes);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [sdk, address]);

  // Load all tribes
  const loadAllTribes = useCallback(async () => {
    if (!sdk) return;

    try {
      setLoading(true);
      const tribes = await sdk.getAllTribes();
      setAllTribes(tribes);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [sdk]);

  // Load all tribes on mount
  useEffect(() => {
    loadAllTribes();
  }, [loadAllTribes]);

  // Create a tribe
  const createTribe = useCallback(
    async (
      name: string,
      metadata: string,
      admins?: string[],
      joinType?: number,
      entryFee?: bigint,
      nftRequirements?: any[]
    ) => {
      if (!sdk) throw new Error('SDK not initialized');

      setLoading(true);
      try {
        const tribeId = await sdk.createTribe(
          name,
          metadata,
          admins,
          joinType,
          entryFee,
          nftRequirements
        );
        await Promise.all([loadUserTribes(), loadAllTribes()]);
        return tribeId;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sdk, loadUserTribes, loadAllTribes]
  );

  // Get tribe by ID
  const getTribe = useCallback(
    async (tribeId: number): Promise<Tribe> => {
      if (!sdk) throw new Error('SDK not initialized');

      try {
        return await sdk.getTribe(tribeId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [sdk]
  );

  // Join a tribe
  const joinTribe = useCallback(
    async (tribeId: number) => {
      if (!sdk) throw new Error('SDK not initialized');

      setLoading(true);
      try {
        await sdk.joinTribe(tribeId);
        await Promise.all([loadUserTribes(), loadAllTribes()]);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sdk, loadUserTribes, loadAllTribes]
  );

  // Request to join a tribe
  const requestToJoinTribe = useCallback(
    async (tribeId: number, entryFee: bigint) => {
      if (!sdk) throw new Error('SDK not initialized');

      setLoading(true);
      try {
        await sdk.requestToJoinTribe(tribeId, entryFee);
        await loadUserTribes();
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sdk, loadUserTribes]
  );

  // Get member status in tribe
  const getMemberStatus = useCallback(
    async (tribeId: number, memberAddress: string) => {
      if (!sdk) throw new Error('SDK not initialized');

      try {
        return await sdk.getMemberStatus(tribeId, memberAddress);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [sdk]
  );

  return {
    loading,
    error,
    userTribes,
    allTribes,
    createTribe,
    getTribe,
    joinTribe,
    requestToJoinTribe,
    getMemberStatus,
    refreshTribes: useCallback(async () => {
      await Promise.all([loadUserTribes(), loadAllTribes()]);
    }, [loadUserTribes, loadAllTribes]),
  };
}; 