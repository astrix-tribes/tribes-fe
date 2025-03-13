import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MONAD_TESTNET } from '../../constants/networks';

interface ChainState {
  chainId: number | undefined;
  isCorrectNetwork: boolean;
  isChainSwitching: boolean;
  lastValidChainId: number | undefined;
}

const initialState: ChainState = {
  chainId: undefined,
  isCorrectNetwork: false,
  isChainSwitching: false,
  lastValidChainId: MONAD_TESTNET.id
};

const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    setChainId: (state, action: PayloadAction<number | undefined>) => {
      state.chainId = action.payload;
    },
    setIsCorrectNetwork: (state, action: PayloadAction<boolean>) => {
      state.isCorrectNetwork = action.payload;
    },
    setIsChainSwitching: (state, action: PayloadAction<boolean>) => {
      state.isChainSwitching = action.payload;
    },
    setLastValidChainId: (state, action: PayloadAction<number>) => {
      state.lastValidChainId = action.payload;
    }
  }
});

export const { 
  setChainId, 
  setIsCorrectNetwork, 
  setIsChainSwitching,
  setLastValidChainId 
} = chainSlice.actions;

export default chainSlice.reducer; 