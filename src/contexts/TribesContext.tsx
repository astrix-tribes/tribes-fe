import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { TribesSDK } from '../services/TribesSDK';
import { Tribe } from '../types/tribe';
import { useWallet } from '../hooks/useWallet';

interface TribesContextType {
  sdk: TribesSDK | null;
  isInitialized: boolean;
  tribes: Tribe[];
  isLoading: boolean;
  error: string | null;
  refreshTribes: () => Promise<void>;
  getTribe: (tribeId: number) => Promise<Tribe | null>;
}

const defaultContext: TribesContextType = {
  sdk: null,
  isInitialized: false,
  tribes: [],
  isLoading: false,
  error: null,
  refreshTribes: async () => {},
  getTribe: async () => null
};

const TribesContext = createContext<TribesContextType>(defaultContext);

interface TribesProviderProps {
  children: ReactNode;
  sdk: TribesSDK | null;
  isInitialized: boolean;
}

export function TribesProvider({ children, sdk, isInitialized }: TribesProviderProps) {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useWallet();

  const refreshTribes = useCallback(async () => {
    if (!sdk || !isInitialized) {
      console.log('Cannot refresh tribes: SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Refreshing tribes...');
      
      // Get total tribes count
      const count = await sdk.getTribesCount();
      console.log(`Found ${count} tribes`);
      
      // Fetch all tribes
      const allTribes: Tribe[] = [];
      for (let i = 1; i <= count; i++) {
        try {
          const tribe = await sdk.getTribe(i);
          if (tribe) {
            allTribes.push(tribe);
          }
        } catch (err) {
          console.error(`Error fetching tribe ${i}:`, err);
        }
      }
      
      setTribes(allTribes);
      console.log('Loaded tribes:', allTribes);
    } catch (err) {
      console.error('Error refreshing tribes:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isInitialized]);

  const getTribe = useCallback(async (tribeId: number): Promise<Tribe | null> => {
    if (!sdk || !isInitialized) {
      console.log('Cannot get tribe: SDK not initialized');
      return null;
    }

    try {
      return await sdk.getTribe(tribeId);
    } catch (err) {
      console.error(`Error getting tribe ${tribeId}:`, err);
      return null;
    }
  }, [sdk, isInitialized]);

  // Load tribes on initialization and when address changes
  useEffect(() => {
    if (isInitialized) {
      refreshTribes();
    }
  }, [isInitialized, address, refreshTribes]);

  return (
    <TribesContext.Provider 
      value={{ 
        sdk, 
        isInitialized, 
        tribes, 
        isLoading, 
        error, 
        refreshTribes,
        getTribe
      }}
    >
      {children}
    </TribesContext.Provider>
  );
}

export function useTribesSDK() {
  const context = useContext(TribesContext);
  if (context === undefined) {
    throw new Error('useTribesSDK must be used within a TribesProvider');
  }
  return context;
} 