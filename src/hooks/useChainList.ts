import { useMemo } from 'react';
import { 
  CHAIN_LIST, 
  ChainInfo, 
  ChainType,
  getEnabledChains,
  getChainsByType,
  getEnabledChainsByType,
  getChainById,
  isChainEnabled,
  getEVMChains,
  getEnabledEVMChains
} from '../config/chains';

export const useChainList = () => {
  const allChains = useMemo(() => CHAIN_LIST, []);
  const enabledChains = useMemo(() => getEnabledChains(), []);
  const evmChains = useMemo(() => getEVMChains(), []);
  const enabledEvmChains = useMemo(() => getEnabledEVMChains(), []);

  const getChains = (type?: ChainType, enabledOnly: boolean = false) => {
    if (!type) {
      return enabledOnly ? enabledChains : allChains;
    }
    return enabledOnly ? getEnabledChainsByType(type) : getChainsByType(type);
  };

  const getChainInfo = (chainId: string): ChainInfo | undefined => {
    return getChainById(chainId);
  };

  const isEnabled = (chainId: string): boolean => {
    return isChainEnabled(chainId);
  };

  const getChainLogo = (chainId: string): string => {
    const chain = getChainById(chainId);
    return chain?.chainLogo || '';
  };

  const getChainName = (chainId: string): string => {
    const chain = getChainById(chainId);
    return chain?.chainName || 'Unknown Chain';
  };

  return {
    allChains,
    enabledChains,
    evmChains,
    enabledEvmChains,
    getChains,
    getChainInfo,
    isEnabled,
    getChainLogo,
    getChainName
  };
}; 