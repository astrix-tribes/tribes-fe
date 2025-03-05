import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  setChainId, 
  setIsCorrectNetwork, 
  setIsChainSwitching,
  setLastValidChainId 
} from '../store/slices/chainSlice';

export const useChainState = () => {
  const dispatch = useDispatch();
  const chainState = useSelector((state: RootState) => state.chain);

  const updateChainId = useCallback((chainId: number | undefined) => {
    dispatch(setChainId(chainId));
    
    if (chainId) {
      dispatch(setLastValidChainId(chainId));
      dispatch(setIsChainSwitching(false));
    } else if (chainState.lastValidChainId) {
      dispatch(setIsChainSwitching(true));
    }
  }, [dispatch, chainState.lastValidChainId]);

  const updateIsCorrectNetwork = useCallback((isCorrect: boolean) => {
    dispatch(setIsCorrectNetwork(isCorrect));
  }, [dispatch]);

  return {
    ...chainState,
    updateChainId,
    updateIsCorrectNetwork,
  };
};

export default useChainState; 