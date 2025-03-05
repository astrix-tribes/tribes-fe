import { useState, useCallback } from 'react';
import { getPublicClient, getContracts } from '../config/contracts';

const { profileNFTMinter } = getContracts();
const publicClient = getPublicClient();

export interface ProfileSearchResult {
  tokenId: string;
  username: string;
  bio: string;
  avatarNFT: string;
  avatarTokenId: string;
  website: string;
  twitter: string;
}

export const useProfileSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfileByUsername = useCallback(async (username: string): Promise<ProfileSearchResult | null> => {
    setIsSearching(true);
    setError(null);
    
    try {
      // Get token ID by username
      const tokenId = await publicClient.readContract({
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'getTokenIdByUsername',
        args: [username]
      });

      if (!tokenId) {
        setError('Profile not found');
        return null;
      }

      // Get profile data using token ID
      const profileData = await publicClient.readContract({
        address: profileNFTMinter.address,
        abi: profileNFTMinter.abi,
        functionName: 'getProfileNFT',
        args: [tokenId]
      }) as any;

      return {
        tokenId: tokenId.toString(),
        username: profileData.username,
        bio: profileData.bio,
        avatarNFT: profileData.avatarNFT,
        avatarTokenId: profileData.avatarTokenId.toString(),
        website: profileData.website,
        twitter: profileData.twitter
      };
    } catch (err: any) {
      setError(err.message || 'Failed to search profile');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchProfileByUsername,
    isSearching,
    error
  };
}; 