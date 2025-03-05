/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    selectedAddress?: string;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
  } | any; // Using union type to support both the specific type and 'any'
  tribesHelper?: import('./types/tribes').TribesHelper;
}
