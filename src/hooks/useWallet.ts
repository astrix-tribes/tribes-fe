import { useState, useCallback, useEffect } from 'react'
import { WalletClient, createWalletClient, custom } from 'viem'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useNetwork } from './useNetwork'

export const useWallet = () => {
  const { address, isConnected } = useAccount()
  const { chainId } = useNetwork()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  // Initialize wallet client when connected
  useEffect(() => {
    const initWalletClient = async () => {
      if (isConnected && window.ethereum) {
        try {
          console.log('[useWallet] Initializing wallet client with ethereum provider');
          
          // Create a wallet client using viem
          const client = createWalletClient({
            transport: custom(window.ethereum)
          });
          
          console.log('[useWallet] Wallet client created:', { 
            hasClient: !!client,
            hasAccount: !!client.account,
            address: address
          });
          
          setWalletClient(client);
        } catch (error) {
          console.error('[useWallet] Failed to initialize wallet client:', error);
        }
      } else if (!isConnected) {
        setWalletClient(null);
      }
    };
    
    initWalletClient();
  }, [isConnected, address]);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No ethereum provider found')
      }
      await connectAsync({
        connector: injected()
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [connectAsync])

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnectAsync()
      setWalletClient(null)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }, [disconnectAsync])

  return {
    address,
    isConnected,
    chainId,
    walletClient,
    connectWallet,
    disconnectWallet,
  }
} 