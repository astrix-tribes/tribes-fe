import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useNotification } from '../contexts/NotificationContext'
import { useAuth } from '../hooks/useAuth'
import { ProfileForm } from '../components/profile/ProfileForm'
import type { Profile as ProfileType } from '../types/contracts'
import { Copy, ExternalLink, Edit2, Users2, Medal, Star } from 'lucide-react'
import { useNetwork } from '../hooks/useNetwork'
import { blockchain } from '../utils/blockchainUtils'
import { ethers } from 'ethers'
import { getContractAddresses } from '../utils/contracts'
import { TribesABI } from '../utils/abis'
import { PostsService } from '../services/posts.service'
import { Post } from '../types/post'

export function Profile() {
  const navigate = useNavigate()
  const { isConnected, address } = useAuth()
  const { chainId } = useNetwork()
  const { getProfileByAddress } = useProfile()
  const { showNotification } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileType | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const postsService = PostsService.getInstance()

  const loadProfile = async () => {
    try {
      if (!isConnected || !address) {
        console.log('[Profile] Not connected or no address, redirecting to connect');
        navigate('/connect');
        return;
      }

      if (!chainId) {
        console.log('[Profile] No chain ID, showing network error');
        showNotification('Please connect to a supported network', 'error');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      // Get profile from blockchain
      console.log('🔍 Fetching profile from blockchain:', { address, chainId });
      if (!getProfileByAddress) {
        console.error('[Profile] Profile service not available');
        showNotification('Profile service not available', 'error');
        setIsLoading(false);
        return;
      }
      
      const { profile, error } = await getProfileByAddress(address as `0x${string}`);
      
      if (error?.code === 'WRONG_CHAIN') {
        console.log('[Profile] Wrong chain detected');
        showNotification('Please connect to a supported network', 'error');
        return;
      }
      
      if (profile) {
        console.log('[Profile] Profile found:', profile);
        const defaultMetadata = {
          avatar: '',
          bio: '',
          createdAt: Date.now()
        };
        
        let metadata;
        try {
          metadata = typeof profile.metadata === 'string' 
            ? JSON.parse(profile.metadata) 
            : profile.metadata || defaultMetadata;
        } catch (e) {
          console.warn('[Profile] Failed to parse metadata:', e);
          metadata = defaultMetadata;
        }
        
        const fullProfile: ProfileType = {
          tokenId: BigInt(profile.tokenId),
          username: profile.username,
          metadata: JSON.stringify(metadata),
          nftUri: metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
          owner: profile.owner.toLowerCase() as `0x${string}`
        };
        
        console.log('[Profile] Setting profile data:', fullProfile);
        setProfileData(fullProfile);
        setError(null);
        return;
      }

      console.log('[Profile] No profile found, redirecting to setup');
      navigate('/username-setup');
    } catch (error) {
      console.error('[Profile] Error loading profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
      showNotification('Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile when chain or address changes
  useEffect(() => {
    loadProfile()
  }, [isConnected, address, chainId])

  // Format address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string | undefined) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    async function fetchUserPosts() {
      if (!address) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Connecting to blockchain to fetch posts');
        await blockchain.connect();
        
        // Use a default chainId (Fuse Ember) if chainId is undefined
        const currentChainId = chainId || 1264453517; // Default to Fuse Ember if chainId is undefined
        console.log('Using chain ID:', currentChainId);
        
        const addresses = getContractAddresses(currentChainId);
        const signer = blockchain.getSigner();
        const contract = new ethers.Contract(addresses.tribes, TribesABI);
        
        console.log('Fetching posts for user', address);
        const posts = await contract.getUserPosts(address);
        
        if (posts && Array.isArray(posts) && posts.length > 0) {
          console.log('Found posts:', posts);
          
          const mappedPosts: any = posts
            .map((post: any) => {
              try {
                return postsService.mapBlockchainPostToUIPost(post);
              } catch (error) {
                console.error('Failed to map post:', error);
                return null;
              }
            })
            .filter(Boolean);
            
          console.log('Processed posts:', mappedPosts);
          setUserPosts(mappedPosts);
        } else {
          console.log('No posts found');
          setUserPosts([]);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserPosts();
  }, [address, chainId, postsService]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-monad-purple"></div>
      </div>
    )
  }

  if (!profileData || !profileData.owner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-400 mb-4">No profile found</p>
        <button
          onClick={() => navigate('/username-setup')}
          className="px-6 py-3 bg-theme-primary text-white rounded-lg font-medium hover:bg-theme-primary/90 transition-colors"
        >
          Create Profile
        </button>
      </div>
    )
  }

  const metadata = profileData.metadata ? JSON.parse(profileData.metadata) : { bio: '' }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Profile Header with Wallet Info */}
      <div className="relative py-6 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-center">
          {/* Column 1: Avatar and Profile Info */}
          <div className="flex items-start space-x-4">
            <img
              src={profileData.nftUri || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-[#4ADE80]/20"
            />
            <div className="flex flex-col space-y-2">
              <h1 className="text-xl font-bold text-white">@{profileData.username}</h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-400 text-sm">{formatAddress(profileData.owner)}</p>
                <button
                  onClick={() => {
                    if (profileData.owner) {
                      navigator.clipboard.writeText(profileData.owner)
                      showNotification('Address copied!', 'success')
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://explorer-devnet.monadinfra.com/address/${profileData.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-gray-200 text-sm">{metadata.bio || 'No bio yet'}</p>
            </div>
          </div>

          {/* Column 2: Stats Row */}
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users2 className="w-5 h-5 text-[#4ADE80]" />
              <span className="text-lg font-bold text-white">0</span>
            </div>
            <div className="flex items-center space-x-2">
              <Medal className="w-5 h-5 text-[#4ADE80]" />
              <span className="text-lg font-bold text-white">0</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold text-white">0</span>
            </div>
          </div>

          {/* Column 3: Actions */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#4ADE80] text-black rounded-lg hover:bg-[#4ADE80]/90 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collectibles Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Collectibles</h2>
          <button className="text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors text-sm">
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Placeholder for collectibles */}
          <div className="aspect-square bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 flex items-center justify-center">
            <p className="text-gray-400 text-sm">No collectibles</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          <button className="text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors text-sm">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Placeholder for activity items */}
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3 border border-white/10">
            <p className="text-gray-400 text-sm text-center">No recent activity</p>
          </div>
        </div>
      </div>

      {/* Display user posts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
        
        {loading && <p>Loading posts...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {userPosts.length === 0 && !loading && !error && (
          <p className="text-gray-500">No posts found. Create your first post!</p>
        )}
        
        <div className="space-y-4">
          {userPosts.map(post => (
            <div key={post.id} className="p-4 bg-gray-800 rounded-lg">
              <p className="text-lg">{post.content}</p>
              <p className="text-sm text-gray-400 mt-2">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Drawer */}
      {isEditing && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50">
          <div className="h-full overflow-y-auto p-6">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ProfileForm
              mode="edit"
              existingProfile={profileData}
              onSuccess={() => {
                setIsEditing(false)
                loadProfile()
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 