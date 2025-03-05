import { useAccount, useConfig } from 'wagmi';
import { SUPPORTED_CHAINS } from '../constants/networks';

export const useNetwork = () => {
  const { chain } = useAccount();
  const { chains } = useConfig();

  const isSupported = (chainId?: number) => {
    if (!chainId) return false;
    return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
  };

  const isCorrectNetwork = isSupported(chain?.id);

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        const targetChain = SUPPORTED_CHAINS.find(chain => chain.id === targetChainId);
        if (!targetChain) {
          throw new Error(`Chain ID ${targetChainId} is not supported`);
        }

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${targetChainId.toString(16)}`,
            chainName: targetChain.name,
            nativeCurrency: targetChain.nativeCurrency,
            rpcUrls: targetChain.rpcUrls.default.http,
            blockExplorerUrls: [targetChain.blockExplorers?.default.url],
          }],
        });
      } else {
        throw error;
      }
    }
  };

  return {
    chainId: chain?.id,
    isSupported,
    isCorrectNetwork,
    switchNetwork,
  };
}; 