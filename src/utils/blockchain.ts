/**
 * Re-export from blockchainUtils for backward compatibility
 * This file ensures that existing imports continue to work while
 * consolidating the actual implementation in blockchainUtils.ts
 */

export * from './blockchainUtils';

// Log a deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'Warning: Importing from "blockchain.ts" is deprecated. Please update imports to use "blockchainUtils.ts" instead.'
  );
} 