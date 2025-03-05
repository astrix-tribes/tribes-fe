import { BrowserProvider } from 'ethers';

// Singleton provider instance
let provider: BrowserProvider | null = null;
let isInitialized = false;

export async function initializeProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  if (!provider) {
    provider = new BrowserProvider(window.ethereum);
  }
  
  // Request accounts to trigger the MetaMask popup if needed
  await provider.send('eth_requestAccounts', []);
  isInitialized = true;
  
  return provider;
}

export function getProvider(): BrowserProvider {
  if (!isInitialized || !provider) {
    throw new Error('Provider not initialized. Call initializeProvider first.');
  }
  return provider;
}

export function resetProvider(): void {
  provider = null;
  isInitialized = false;
}

// Listen for network changes
if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('chainChanged', () => {
    resetProvider();
  });
  
  window.ethereum.on('accountsChanged', () => {
    resetProvider();
  });
} 