# Tribes Application Architecture

This document outlines the architecture of the Tribes application service layer, which has been refactored to follow best practices for TypeScript applications.

## Architecture Overview

The application follows a layered architecture with clear separation of concerns:

```
src/
├── types/
│   ├── tribe.ts           // Tribe-related types
│   ├── post.ts            // Post-related types  
│   ├── interaction.ts     // Interaction types
│   ├── user.ts            // User/profile types
│   └── error.ts           // Error types
├── services/
│   ├── tribe/
│   │   ├── ITribeService.ts        // Interface
│   │   └── TribeService.ts         // Implementation
│   ├── post/
│   │   ├── IPostService.ts         // Interface
│   │   └── PostService.ts          // Implementation
│   ├── profile/
│   │   ├── IProfileService.ts      // Interface  
│   │   └── ProfileService.ts       // Implementation
│   └── TribesSDK.ts               // Facade for all services
├── utils/
│   ├── metadataUtils.ts    // Metadata handling
│   ├── blockchainUtils.ts  // Blockchain helpers
│   └── typeMappers.ts      // Type conversion utilities
└── hooks/
    └── useTribes.ts        // React hook for the SDK
```

## Design Principles

1. **Interface-Based Programming**: Services implement clearly defined interfaces.
2. **Single Responsibility Principle**: Each class has a single responsibility.
3. **Dependency Inversion**: High-level modules don't depend on low-level modules.
4. **Type Safety**: Strong typing throughout the application.
5. **Separation of Concerns**: UI logic is separate from business logic.

## Services Layer

### TribesSDK

The `TribesSDK` class serves as a facade for all services, providing a unified API for application developers. It handles:

- Service initialization
- Wallet connection
- Chain management
- Coordinating between different service implementations

Example usage:
```typescript
const sdk = new TribesSDK();
await sdk.initialize();
await sdk.connect(walletClient, address);

// Get tribe data
const tribe = await sdk.getTribe(tribeId);

// Create a new tribe
const tribeId = await sdk.createTribe(name, metadata);
```

### TribeService

The `TribeService` class implements the `ITribeService` interface and handles all tribe-related operations:

- Creating tribes
- Joining tribes
- Getting tribe data
- Managing tribe membership

### Other Services

- `PostService`: Manages posts, comments, and interactions
- `ProfileService`: Handles user profiles and authentication

## React Integration

The application provides a React hook for easy integration:

```typescript
const { 
  loading, 
  error, 
  userTribes, 
  createTribe,
  getTribe,
  joinTribe
} = useTribes();
```

## Type Definitions

The application uses a clear type hierarchy:

1. **Domain Types**: Represent core business entities (Tribe, Post, User)
2. **API Types**: Used for communication with the blockchain (TribeData, PostWithMetadata)
3. **UI Types**: Optimized for component rendering

## Type Mapping

The `typeMappers.ts` utilities provide conversion between different type layers:

- `mapPostDataToUI`: Converts blockchain post data to UI-friendly format
- `mapUIPostToBlockchain`: Converts UI post to blockchain format
- `mapTribeDataToUI`: Converts tribe data to UI format
- `mapProfileToUser`: Converts profile data to user format

## Error Handling

The application uses consistent error handling via the `ErrorType` enum:

```typescript
enum ErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN'
}
```

## Utilities

### Metadata Utilities

Handles serialization, deserialization, and caching of metadata:

- `parseMetadata`: Safely parses JSON metadata
- `stringifyMetadata`: Safely stringifies metadata with BigInt handling
- `getMetadataFromCache`: Retrieves cached metadata
- `storeMetadataInCache`: Stores metadata in cache

### Blockchain Utilities

Provides helpers for blockchain interaction:

- `getCurrentChainId`: Gets current chain ID
- `getChainConfig`: Gets chain configuration
- `extractMetadataFromTransaction`: Extracts metadata from transaction
- `waitForTransaction`: Waits for transaction confirmation

## Migration Guide

If you're working with the old `tribesHelper.ts` implementation, use the new structure as follows:

1. Import the SDK:
```typescript
import { TribesSDK } from '../services/TribesSDK';
```

2. Initialize and connect:
```typescript
const sdk = new TribesSDK(chainId);
await sdk.initialize();
await sdk.connect(walletClient, address);
```

3. Use the unified API:
```typescript
// Old approach
const helper = new TribesHelperImpl(chainId);
const tribe = await helper.getTribeData(tribeId);

// New approach
const sdk = new TribesSDK(chainId);
const tribe = await sdk.getTribeData(tribeId);
``` 