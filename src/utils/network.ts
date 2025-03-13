import { MONAD_TESTNET_DECIMAL, MONAD_NETWORK_CONFIG, NETWORK_ERRORS } from '../constants/networks'

const LAST_NETWORK_KEY = 'last_selected_network'

/**
 * Check if the current network is Monad Devnet
 */
export const isMonadNetwork = (chainId?: number): boolean => {
  return chainId === MONAD_TESTNET_DECIMAL
}

/**
 * Save last selected network
 */
const saveLastNetwork = (chainId: string) => {
  localStorage.setItem(LAST_NETWORK_KEY, chainId)
}

/**
 * Get last selected network
 */
export const getLastNetwork = (): string | null => {
  return localStorage.getItem(LAST_NETWORK_KEY)
}

/**
 * Add Monad network to MetaMask
 */
export const addMonadNetwork = async (): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('No ethereum provider found')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: MONAD_NETWORK_CONFIG.chainId,
        chainName: MONAD_NETWORK_CONFIG.chainName,
        nativeCurrency: MONAD_NETWORK_CONFIG.nativeCurrency,
        rpcUrls: MONAD_NETWORK_CONFIG.rpcUrls,
        blockExplorerUrls: MONAD_NETWORK_CONFIG.blockExplorerUrls
      }]
    })
    saveLastNetwork(MONAD_NETWORK_CONFIG.chainId)
    return true
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error(NETWORK_ERRORS.USER_REJECTED)
    }
    throw new Error(NETWORK_ERRORS.CHAIN_NOT_ADDED)
  }
}

/**
 * Switch to Monad network
 */
export const switchToMonadNetwork = async (): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('No ethereum provider found')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_NETWORK_CONFIG.chainId }]
    })
    saveLastNetwork(MONAD_NETWORK_CONFIG.chainId)
    return true
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return addMonadNetwork()
    }
    if (error.code === 4001) {
      throw new Error(NETWORK_ERRORS.USER_REJECTED)
    }
    throw new Error(NETWORK_ERRORS.NETWORK_SWITCH_FAILED)
  }
}

/**
 * Setup network change listener
 */
export const setupNetworkListener = (callback: (chainId: number) => void): (() => void) => {
  if (!window.ethereum) {
    throw new Error('No ethereum provider found')
  }

  const handleChainChanged = (chainId: string) => {
    saveLastNetwork(chainId)
    callback(parseInt(chainId))
  }

  window.ethereum.on('chainChanged', handleChainChanged)

  // Return cleanup function
  return () => {
    window.ethereum.removeListener('chainChanged', handleChainChanged)
  }
}

/**
 * Restore last selected network
 */
export const restoreLastNetwork = async (): Promise<void> => {
  const lastNetwork = getLastNetwork()
  if (lastNetwork && window.ethereum) {
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (currentChainId !== lastNetwork) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: lastNetwork }]
        })
      }
    } catch (error) {
      console.error('Failed to restore last network:', error)
    }
  }
} 