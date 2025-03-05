# Migration Guide: From tribesHelper.ts to the New Service Architecture

This guide will help you migrate from the old monolithic `tribesHelper.ts` approach to the new service-based architecture.

## Step 1: Import the SDK Instead of the Helper

**Old Way:**
```typescript
import { TribesHelperImpl } from '../utils/tribesHelper';

// Create an instance of the helper
const helper = new TribesHelperImpl(chainId);
```

**New Way:**
```typescript
import { TribesSDK } from '../services/TribesSDK';

// Create an instance of the SDK
const sdk = new TribesSDK(chainId);
await sdk.initialize();
```

## Step 2: Connect to Wallet

**Old Way:**
```typescript
await helper.connect(walletClient, address);
```

**New Way:**
```typescript
await sdk.connect(walletClient, address);
```

## Step 3: Replace Helper Method Calls with SDK Method Calls

### Tribe Operations

**Old Way:**
```typescript
// Create a tribe
const tribeId = await helper.createTribe(name, metadata, admins, joinType, entryFee, nftRequirements);

// Get tribe data
const tribeData = await helper.getTribeData(tribeId);

// Join a tribe
await helper.joinTribe(tribeId);

// Request to join a tribe
await helper.requestToJoinTribe(tribeId, entryFee);

// Get user tribes
const userTribes = await helper.getUserTribes(address);
```

**New Way:**
```typescript
// Create a tribe
const tribeId = await sdk.createTribe(name, metadata, admins, joinType, entryFee, nftRequirements);

// Get tribe data (raw blockchain format)
const tribeData = await sdk.getTribeData(tribeId);

// Get tribe data (UI-friendly format)
const tribe = await sdk.getTribe(tribeId);

// Join a tribe
await sdk.joinTribe(tribeId);

// Request to join a tribe
await sdk.requestToJoinTribe(tribeId, entryFee);

// Get user tribes
const userTribes = await sdk.getUserTribes(address);
```

### Post Operations

**Old Way:**
```typescript
// Create a post
const post = await helper.createPost(postWithMetadata);

// Get post
const post = await helper.getPost(postId);

// Like post
await helper.likePost(postId);
```

**New Way:**
Post operations will be available in a future update to the SDK.

## Step 4: React Integration - Use the Hook

Instead of manually creating and managing the SDK instance, use the provided hook:

```typescript
import { useTribes } from '../hooks/useTribes';

function MyComponent() {
  const { 
    loading, 
    error, 
    userTribes, 
    createTribe,
    getTribe,
    joinTribe,
    requestToJoinTribe,
    getMemberStatus,
    refreshTribes
  } = useTribes();

  // Now use these functions directly
  const handleCreateTribe = async () => {
    const tribeId = await createTribe(name, metadata);
    console.log('Created tribe:', tribeId);
  };
}
```

## Step 5: Type Mapping for Interoperability

If you need to work with both the old and new types, use the type mappers:

```typescript
import { mapTribeDataToUI, mapUIPostToBlockchain } from '../utils/typeMappers';

// Convert blockchain data to UI format
const uiTribe = mapTribeDataToUI(tribeData, chainId);

// Convert UI post to blockchain format
const blockchainPost = mapUIPostToBlockchain(uiPost);
```

## Expected Benefits

By migrating to the new architecture, you'll gain:

1. **Improved maintainability**: Smaller, focused service classes
2. **Better type safety**: Strict interfaces and type definitions
3. **Testing capabilities**: Each service can be tested in isolation
4. **Simplified API**: The SDK provides a clean, unified interface

If you encounter any issues during migration, please consult the full documentation in `./README.md`. 