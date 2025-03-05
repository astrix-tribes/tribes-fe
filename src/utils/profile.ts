import { Address, keccak256, toHex, Log } from 'viem';
import { getPublicClient, getContracts } from '../config/contracts';
import { blockchain } from './blockchainUtils';

export interface ProfileMetadata {
  avatar: string;
  bio: string;
  createdAt: number;
}

export interface ProfileData {
  tokenId: string;
  username: string;
  metadata?: ProfileMetadata;
  owner: string;
}

export interface ProfileSearchResult {
  tokenId: string;
  username: string;
  bio: string;
  avatarNFT: string;
  avatarTokenId: string;
  website: string;
  twitter: string;
}

interface ProfileResponse {
  username: string;
  metadataURI: string;
  owner: string;
}

// Make storage key chain-specific
const getProfileStorageKey = (chainId: number) => `tribes_profile_data_${chainId}`;

// Save profile data to local storage with chain ID
const saveProfileToStorage = (profile: ProfileData, chainId: number) => {
  localStorage.setItem(getProfileStorageKey(chainId), JSON.stringify(profile));
};

// // Get profile data from local storage for specific chain
// const getProfileFromStorage = (chainId: number): ProfileData | null => {
//   const stored = localStorage.getItem(getProfileStorageKey(chainId));
//   if (stored) {
//     const profile = JSON.parse(stored);
//     return profile;
//   }
//   return null;
// };

// Read Operations
export async function searchProfileByUsername(username: string, chainId: number): Promise<ProfileSearchResult | null> {
  try {
    const contracts = getContracts(chainId);
    const client = getPublicClient(chainId);

    // First check if username exists
    const exists = await client.readContract({
      address: contracts.profileNFTMinter.address,
      abi: contracts.profileNFTMinter.abi,
      functionName: 'usernameExists',
      args: [username]
    });

    if (!exists) {
      return null;
    }
    
    // Get token ID by username
    const tokenId = await client.readContract({
      address: contracts.profileNFTMinter.address,
      abi: contracts.profileNFTMinter.abi,
      functionName: 'getTokenIdByUsername',
      args: [username]
    }) as bigint;

    // Get profile data using token ID
    const profileData = await client.readContract({
      address: contracts.profileNFTMinter.address,
      abi: contracts.profileNFTMinter.abi,
      functionName: 'getProfileByTokenId',
      args: [tokenId]
    }) as ProfileResponse;

    if (!profileData) return null;

    const owner = await client.readContract({
      address: contracts.profileNFTMinter.address,
      abi: contracts.profileNFTMinter.abi,
      functionName: 'ownerOf',
      args: [tokenId]
    });

    return {
      tokenId: tokenId.toString(),
      username: profileData.username,
      bio: profileData.metadataURI,
      avatarNFT: owner as string,
      avatarTokenId: '0',
      website: '',
      twitter: ''
    };
  } catch (error) {
    console.error('Error searching profile:', error);
    return null;
  }
}

export async function getProfileByAddress(address: Address, chainId: number): Promise<ProfileData | null> {
  // If chainId is undefined, log an error and try to get it
  if (!chainId) {
    console.error('❌ Chain ID is undefined in getProfileByAddress, using fallback');
    try {
      // Try to get chainId from ethereum provider
      const provider = window.ethereum;
      if (provider) {
        const rawChainId = await provider.request({ method: 'eth_chainId' });
        chainId = parseInt(rawChainId as string, 16);
        console.log('🔄 Retrieved chainId from provider:', chainId);
      } else {
        chainId = 20143; // Your target chain as fallback
        console.warn('⚠️ No provider, using fallback chainId:', chainId);
      }
    } catch (e) {
      console.error('❌ Failed to get chainId, using fallback:', e);
      chainId = 20143; // Your target chain as fallback
    }
  }

  const contracts = getContracts(chainId);
  const client = getPublicClient(chainId);
  
  try {
    // Ensure chainId is included in every log object
    const chainIdForLogs = chainId; // Store in a separate variable to be safe
    
    console.log('🔍 Checking profile on chain:', {
      chainId: chainIdForLogs, // Use the safe variable
      address,
      contractAddress: contracts.profileNFTMinter.address,
      rpcUrl: client.transport.url
    });
    
    // 1. Get token balance for the address
    const balance = await client.readContract({
      address: contracts.profileNFTMinter.address,
      abi: contracts.profileNFTMinter.abi,
      functionName: 'balanceOf',
      args: [address]
    }) as bigint;

    console.log('📊 Balance check result:', {
      balance: balance.toString(),
      chainId: chainIdForLogs, // Use the safe variable
      address
    });

    // Check if user has any profiles
    if (balance === BigInt(0)) {
      console.log('❌ No profile found - balance is 0', { chainId: chainIdForLogs, address });
      return null;
    }

    // 2. Find the first token ID owned by this address
    let userTokenId: number | null = null;
    
    for (let i = 0; i < 10; i++) {
      try {
        console.log('🔍 Checking token ownership:', { tokenId: i, chainId: chainIdForLogs });
        
        const owner = await client.readContract({
          address: contracts.profileNFTMinter.address,
          abi: contracts.profileNFTMinter.abi,
          functionName: 'ownerOf',
          args: [BigInt(i)]
        }) as string;

        console.log('👤 Token owner:', { tokenId: i, owner, chainId: chainIdForLogs });

        if (owner.toLowerCase() === address.toLowerCase()) {
          userTokenId = i;
          console.log('✅ Found matching token:', { tokenId: i, chainId: chainIdForLogs });
          break;
        }
      } catch (e) {
        console.log('⚠️ Token check error:', { tokenId: i, chainId: chainIdForLogs, error: e });
        continue;
      }
    }

    if (userTokenId === null) {
      console.log('❌ No owned token found', { chainId: chainIdForLogs, address });
      return null;
    }
    
    console.log('🔍 Fetching profile data:', { tokenId: userTokenId, chainId: chainIdForLogs });
    
    const profileResponse = await client.readContract({
      address: contracts.profileNFTMinter.address,
      abi: contracts.profileNFTMinter.abi,
      functionName: 'getProfileByTokenId',
      args: [BigInt(userTokenId)]
    }) as [string, string, string];

    const [username, metadataURI, owner] = profileResponse;
    
    console.log('📦 Raw profile data:', { 
      username, 
      metadataURI, 
      owner,
      chainId: chainIdForLogs 
    });

    // 4. Verify owner matches
    if (owner.toLowerCase() !== address.toLowerCase()) {
      console.log('❌ Owner mismatch:', {
        expectedOwner: address.toLowerCase(),
        actualOwner: owner.toLowerCase(),
        chainId: chainIdForLogs
      });
      return null;
    }

    let metadata: ProfileMetadata;
    try {
      const parsedMetadata = JSON.parse(metadataURI);
      metadata = {
        avatar: parsedMetadata.avatar || '',
        bio: parsedMetadata.bio || '',
        createdAt: parsedMetadata.createdAt || Date.now()
      };
      console.log('✅ Parsed metadata:', { metadata, chainId: chainIdForLogs });
    } catch (e) {
      console.warn('⚠️ Failed to parse metadata:', { metadataURI, error: e, chainId: chainIdForLogs });
      metadata = {
        avatar: '',
        bio: '',
        createdAt: Date.now()
      };
    }

    const profile: ProfileData = {
      tokenId: userTokenId.toString(),
      owner: address,
      username,
      metadata
    };

    console.log('✅ Profile found:', { profile, chainId: chainIdForLogs });
    return profile;

  } catch (error: any) {
    console.error('❌ Profile fetch error:', {
      error,
      chainId, // Use the original chainId variable
      address,
      contractAddress: contracts.profileNFTMinter.address,
      rpcUrl: client.transport.url
    });
    return null;
  }
}

// Write Operations - These now use the blockchain utility
export async function createProfile(
  username: string,
  metadata: ProfileMetadata,
  chainId: number
): Promise<{ success: boolean; tokenId?: string; error?: string }> {
  try {
    const metadataString = JSON.stringify(metadata);
    const hash = await blockchain.mintProfile({
      username,
      metadataURI: metadataString
    });

    // Get tokenId from event
    const client = getPublicClient(chainId);
    const receipt = await client.waitForTransactionReceipt({ hash });
    
    const eventSignature = 'ProfileCreated(uint256,address,string)';
    const eventTopic = keccak256(toHex(eventSignature));
    const createEvent = receipt.logs.find(
      (log: Log) => log.topics[0] === eventTopic
    );
    
    const tokenId = createEvent ? Number(createEvent.topics[1]).toString() : hash;

    // Save initial profile data to storage
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const profileData: ProfileData = {
      tokenId,
      username,
      metadata,
      owner: account
    };
    saveProfileToStorage(profileData, chainId);

    return { success: true, tokenId };
  } catch (error: any) {
    console.error('❌ Error creating profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create profile'
    };
  }
}

export async function updateProfile(
  tokenId: string,
  metadata: ProfileMetadata,
  chainId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const metadataString = JSON.stringify(metadata);
    await blockchain.updateProfile({
      tokenId: Number(tokenId),
      metadata: metadataString
    });

    // Update local storage
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const profile = await getProfileByAddress(account as Address, chainId);
    if (profile) {
      const updatedProfile = { ...profile, metadata };
      saveProfileToStorage(updatedProfile, chainId);
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update profile'
    };
  }
} 