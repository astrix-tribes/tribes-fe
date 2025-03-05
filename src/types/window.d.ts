import { EIP1193Provider } from 'viem';
import { TribesHelper } from '../utils/tribesHelper';

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
    tribesHelper?: TribesHelper;
  }
} 