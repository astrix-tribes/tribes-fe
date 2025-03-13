import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/globals.css';

// Import Redux provider
import { Provider } from 'react-redux';
import { store } from './store/store';

// Import notification context
import { NotificationProvider } from './contexts/NotificationContext';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig } from 'wagmi';
import { 
  MONAD_TESTNET, 
  FUSE_EMBER, 
  CHILIZ_MAINNET, 
  MANTA_TESTNET, 
  ARBITRUM_SEPOLIA_TESTNET,
  SOMNIA_TESTNET 
} from './constants/networks';

// Create a new query client for react-query (required by wagmi v2)
const queryClient = new QueryClient();

// Create wagmi config with the supported chains
// Note: Using explicit definition of chains to avoid type issues
const config = createConfig({
  chains: [
    MONAD_TESTNET, 
    FUSE_EMBER, 
    CHILIZ_MAINNET, 
    MANTA_TESTNET, 
    ARBITRUM_SEPOLIA_TESTNET,
    SOMNIA_TESTNET
  ] as const,
  transports: {
    [MONAD_TESTNET.id]: http(MONAD_TESTNET.rpcUrls.default.http[0]),
    [FUSE_EMBER.id]: http(FUSE_EMBER.rpcUrls.default.http[0]),
    [CHILIZ_MAINNET.id]: http(CHILIZ_MAINNET.rpcUrls.default.http[0]),
    [MANTA_TESTNET.id]: http(MANTA_TESTNET.rpcUrls.default.http[0]),
    [ARBITRUM_SEPOLIA_TESTNET.id]: http(ARBITRUM_SEPOLIA_TESTNET.rpcUrls.default.http[0]),
    [SOMNIA_TESTNET.id]: http(SOMNIA_TESTNET.rpcUrls.default.http[0]),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* Add WagmiProvider with the config */}
      <WagmiProvider config={config}>
        {/* React Query is required by wagmi v2 */}
        <QueryClientProvider client={queryClient}>
          {/* Notification provider */}
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Provider>
  </React.StrictMode>
);

// Comment out service worker registration if it exists
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js');
// }
