import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Feed } from '../components/feed/Feed';
import { FeedLayout } from '../components/layout/FeedLayout';
import { TribeSidebar } from '../components/sidebars/TribeSidebar';
import { CreatePost } from '../components/CreatePost';
import { useTribesData } from '../hooks/useTribesData';
import { usePostsManagement } from '../hooks/usePostsManagement';
import { Tribe } from '../types/tribe';
import { 
  getTribeAvatar, 
  getTribeDescription, 
  getTribeCoverImage,
  getTribeTopics
} from '../utils/tribeHelpers';
import { blockchain } from '../utils/blockchainUtils';
import { getContractAddresses } from '../constants/contracts';
import { ABIS } from '../config/abis';
import { ethers } from 'ethers';
import { useNotification } from '../contexts/NotificationContext';
import { PostType } from '../types/post';
import { UnifiedFeed } from '../components/feed/UnifiedFeed';

// Define Topic type directly since it might be missing from tribe.ts
interface Topic {
  id: string;
  name: string;
}

import type { FeedItem } from '../types/feed';
import clsx from 'clsx';

export function TribeView() {
  const { tribeId } = useParams();
  const { tribes, isLoading: isLoadingTribes } = useTribesData();
  const { posts, loading: postsLoading, error: postsError, fetchFeed } = usePostsManagement();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'events'>('all');
  const { showNotification } = useNotification();
  
  // Find tribe by ID with proper type checking
  const tribe = useMemo(() => {
    return tribes?.find(t => t.id.toString() === tribeId?.toString());
  }, [tribes, tribeId]);

  // Extract tribe display properties using helper functions to avoid linter errors
  const tribeDisplay = useMemo(() => {
    if (!tribe) return null;
    
    return {
      id: tribe.id,
      name: tribe.name,
      description: getTribeDescription(tribe),
      avatar: getTribeAvatar(tribe),
      coverImage: getTribeCoverImage(tribe),
      memberCount: tribe.memberCount,
      // We can safely cast the tribe to any inside this helper fn
      isVerified: (tribe as any).isVerified || false,
      members: (tribe as any).members || [],
      topics: getTribeTopics(tribe)
    };
  }, [tribe]);

  // Check if the user is a member of the tribe
  useEffect(() => {
    const checkMembership = async () => {
      if (!tribeId) return;
      
      try {
        // Connect to blockchain
        await blockchain.connect();
        
        // Get user address
        const userAddress = await blockchain.getAddress();
        
        // Get current chain ID
        const chainId = await blockchain.getCurrentChainId();
        
        // Get contract addresses for the current chain
        const addresses = getContractAddresses(chainId);
        
        // Get provider and signer
        const provider = await blockchain.getProvider();
        const signer = await blockchain.getSigner();
        
        if (!signer) {
          console.error('No signer available');
          return;
        }
        
        // Create contract instance
        const tribeControllerContract = new ethers.Contract(
          addresses.TRIBE_CONTROLLER,
          ABIS.TribeController,
          signer
        );
        
        // Check if user is a member
        const isMember = await tribeControllerContract.isMember(
          Number(tribeId),
          userAddress
        );

        console.log(`[TribeView]: isMember: ${isMember} ${userAddress} ${tribeId}`);
        
        setIsJoined(isMember);
        console.log(`User ${userAddress} is${isMember ? '' : ' not'} a member of tribe ${tribeId}`);
      } catch (error) {
        console.error('Error checking tribe membership:', error);
      }
    };
    
    checkMembership();
  }, [tribeId]);

  // Handle joining or leaving the tribe
  const handleToggleMembership = async () => {
    if (!tribeId) return;
    
    try {
      setIsJoining(true);
      
      // Connect to blockchain
      await blockchain.connect();
      
      // Get current chain ID
      const chainId = await blockchain.getCurrentChainId();
      
      // Get contract addresses for the current chain
      const addresses = getContractAddresses(chainId);
      
      // Get provider and signer
      const provider = await blockchain.getProvider();
      const signer = await blockchain.getSigner();
      
      if (!signer) {
        throw new Error('No signer available');
      }
      
      // Create contract instance
      const tribeControllerContract = new ethers.Contract(
        addresses.TRIBE_CONTROLLER,
        ABIS.TribeController,
        signer
      );
      
      if (isJoined) {
        // Leave tribe
        const tx = await tribeControllerContract.leaveTribe(Number(tribeId), {
          gasLimit: 300000
        });
        
        showNotification('Leaving tribe transaction has been sent', 'info');
        
        console.log('Leave tribe transaction sent:', tx.hash);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Leave tribe transaction confirmed:', receipt);
        
        setIsJoined(false);
        
        showNotification('You have left the tribe', 'success');
      } else {
        console.log(`[TribeView]: Joining tribe ${tribeId}`);
        // Join tribe
        // First check if the tribe requires approval
        const tribeDetails = await tribeControllerContract.getTribeDetails(Number(tribeId));
        console.log(`[TribeView]: Tribe details: ${tribeDetails}`,`[tribeDetailsJoinType]: joinType: ${tribeDetails?.joinType}`);
        // JoinType: 0 = Open, 1 = Approval, 2 = Invite, 3 = NFT
        const joinType = tribeDetails.joinType;
        
        if (joinType == 0) {
          console.log(`[TribeView]: Joining open tribe ${tribeId}`);
          // Open tribe - join directly
          const tx = await tribeControllerContract.joinTribe(Number(tribeId), {
            gasLimit: 300000
          });

          console.log(`[TribeView]: Joining tribe ${tribeId} with tx: ${tx.hash}`);
          showNotification('Joining tribe transaction has been sent', 'info');
          
          console.log('Join tribe transaction sent:', tx.hash);
          
          // Wait for transaction confirmation
          const receipt = await tx.wait();
          console.log('Join tribe transaction confirmed:', receipt);
          
          setIsJoined(true);
          
          showNotification('You have joined the tribe', 'success');
        } else if (joinType === 1) {
          // Approval required
          console.log(`[TribeView]: Approval required for tribe ${tribeId}`);
          const tx = await tribeControllerContract.requestToJoinTribe(Number(tribeId), {
            gasLimit: 300000
          });
          
          showNotification('Your request to join the tribe has been sent', 'info');
          
          console.log('Request to join tribe sent:', tx.hash);
          
          // Wait for transaction confirmation
          const receipt = await tx.wait();
          console.log('Request to join tribe confirmed:', receipt);
          
          showNotification('Your request is pending approval from tribe admins', 'info');
        } else {
          console.log(`[TribeView]: Other join types (invite, NFT) for tribe ${tribeId} ${joinType}`);
          // Other join types (invite, NFT) - show appropriate message
          showNotification('This tribe requires an invitation or specific NFT to join', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling tribe membership:', error);
      
      showNotification(`Failed to ${isJoined ? 'leave' : 'join'} tribe: ${(error as Error).message}`, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  // Debug logging to help troubleshoot tribe data issues - with proper dependencies
  useEffect(() => {
    if (tribe) {
      console.log('Found tribe:', tribe);
      console.log('Formatted tribe display:', tribeDisplay);
      
    } else if (tribes?.length > 0) {
      console.log('Tribes available but none match ID:', tribeId);
      console.log('Available tribe IDs:', tribes.map(t => t.id));
    }
  }, [tribe, tribes, tribeId]); // Removed tribeDisplay to prevent infinite loop

  // Update the tribePosts useMemo to filter by tribeId
  const tribePosts = useMemo(() => {
    if (!posts || !tribeId) return [];
    
    // Convert posts object to array
    const postsArray = Object.values(posts);
    console.log(`[TribeView]: Filtering ${postsArray.length} posts for tribe ${tribeId}`);
    
    // Filter posts by the current tribe ID
    const filtered = postsArray.filter(post => {
      const postTribeId = post.tribeId?.toString();
      const currentTribeId = tribeId.toString();
      const isMatch = postTribeId === currentTribeId;
      
      if (isMatch) {
        console.log(`[TribeView]: Post ${post.id} matches tribe ${tribeId}`);
      }
      
      return isMatch;
    });
    
    console.log(`[TribeView]: Found ${filtered.length} posts for tribe ${tribeId}`);
    return filtered;
  }, [posts, tribeId]);

  // Update the filteredPosts useMemo to filter from tribePosts by type
  const filteredPosts = useMemo(() => {
    if (activeTab === 'all') {
      return tribePosts;
    } else if (activeTab === 'media') {
      // Filter for image and video posts
      return tribePosts.filter(post => {
        const type = post.type;
        return type === PostType.IMAGE || type === PostType.VIDEO;
      });
    } else if (activeTab === 'events') {
      // Filter for event posts
      return tribePosts.filter(post => post.type === PostType.EVENT);
    }
    
    return tribePosts;
  }, [tribePosts, activeTab]);

  // Add this function to fetch posts by type
  const fetchPostsByType = async (type: 'all' | 'media' | 'events') => {
    if (!tribeId) return;
    
    try {
      // Connect to blockchain
      await blockchain.connect();
      
      // Get current chain ID
      const chainId = await blockchain.getCurrentChainId();
      
      // Get contract addresses for the current chain
      const addresses = getContractAddresses(chainId);
      
      // Get provider and signer
      const provider = await blockchain.getProvider();
      const signer = await blockchain.getSigner();
      
      if (!signer) {
        console.error('No signer available');
        return;
      }
      
      // Create contract instance
      const tribeControllerContract = new ethers.Contract(
        addresses.TRIBE_CONTROLLER,
        ABIS.TribeController,
        signer
      );
      
      // Get all posts for the tribe
      const posts = await tribeControllerContract.getTribePosts(Number(tribeId));
      console.log(`[TribeView]: Fetched ${posts.length} posts for tribe ${tribeId}`);
      
      // Filter posts by type
      let filtered = posts;
      
      if (type === 'media') {
        // Filter for image and video posts
        filtered = posts.filter((post: any) => {
          const metadata = JSON.parse(post.metadata || '{}');
          return metadata.type === 'IMAGE' || metadata.type === 'VIDEO' || metadata.type === 'RICH_MEDIA';
        });
      } else if (type === 'events') {
        // Filter for event posts
        filtered = posts.filter((post: any) => {
          const metadata = JSON.parse(post.metadata || '{}');
          return metadata.type === 'EVENT';
        });
      }
      
      // Format posts for display
      const formattedPosts = filtered.map((post: any) => {
        const metadata = JSON.parse(post.metadata || '{}');
        return {
          id: post.id.toString(),
          content: metadata.content || '',
          title: metadata.title || '',
          author: post.creator,
          tribeId: Number(tribeId),
          createdAt: post.createdAt ? Number(post.createdAt) * 1000 : Date.now(),
          type: metadata.type || 'TEXT',
          metadata
        };
      });
      
      // setFilteredPosts(formattedPosts);
      
    } catch (error) {
      console.error('Error fetching posts by type:', error);
    }
  };

  // Update the activeTab state to trigger post filtering
  useEffect(() => {
    fetchPostsByType(activeTab);
  }, [activeTab, tribeId]);

  // Update the tab click handlers
  const handleTabClick = (tab: 'all' | 'media' | 'events') => {
    setActiveTab(tab);
  };

  // Update the Feed component to use filteredPosts when available
  const postsToDisplay = filteredPosts.length > 0 ? filteredPosts : tribePosts;

  // Replace the fetchPostsByTribe effect with fetchFeed
  useEffect(() => {
    console.log('[TribeView]: Fetching all posts using fetchFeed');
    fetchFeed().catch(error => {
      console.error('Error fetching feed:', error);
    });
  }, [fetchFeed]);

  // Update the post creation success handler to use fetchFeed
  const handlePostCreationSuccess = (postId: string) => {
    console.log(`[TribeView]: Post created successfully with ID: ${postId}`);
    // Refresh all posts
    fetchFeed();
    // Close the create post modal
    setShowCreatePost(false);
  };

  if (isLoadingTribes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse bg-accent/10 rounded-xl h-48 w-96" />
      </div>
    );
  }

  if (!tribe || !tribeDisplay) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tribe not found
      </div>
    );
  }

  const handleItemClick = (item: any) => {
    // Handle item clicks here
    console.log('Clicked item:', item);
  };

  const rightSidebar = (
    <div className="space-y-4">
      {/* Tribe Info Card */}
      <div className="bg-card rounded-xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-24 relative">
          {tribeDisplay.coverImage && (
            <img
              src={tribeDisplay.coverImage}
              alt={tribeDisplay.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-cover.png';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        {/* Tribe Info */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mt-2">
            <img
              src={tribeDisplay.avatar}
              alt={tribeDisplay.name}
              className="w-16 h-16 rounded-xl border-4 border-background"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold flex items-center gap-1">
                {tribeDisplay.name}
                {tribeDisplay.isVerified && (
                  <span className="text-theme-primary text-sm">✓</span>
                )}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span>{tribeDisplay.memberCount.toLocaleString()} members</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{tribeDisplay.description}</p>
          <button
            onClick={handleToggleMembership}
            disabled={isJoining}
            className={clsx(
              'w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isJoining ? 'bg-gray-700/50 cursor-not-allowed' : 
              isJoined
                ? 'bg-gray-700/10 hover:bg-gray-700/20 text-white'
                : 'bg-theme-primary hover:bg-theme-primary/90 text-white'
            )}
          >
            {isJoining ? 'Processing...' : isJoined ? 'Joined' : 'Join Tribe'}
          </button>
        </div>
      </div>

      {/* Topics */}
      <TribeSidebar
        members={tribeDisplay.members}
        topics={tribeDisplay.topics}
        onTopicSelect={setSelectedTopic}
        selectedTopicId={selectedTopic?.id}
      />
    </div>
  );

  return (
    <FeedLayout rightSidebar={rightSidebar}>
      <div className="min-w-[320px] overflow-x-hidden">
        {/* Feed Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => handleTabClick('all')}
              className={clsx(
                'px-4 py-2 rounded-full whitespace-nowrap',
                activeTab === 'all'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Posts
            </button>
            <button
              onClick={() => handleTabClick('media')}
              className={clsx(
                'px-4 py-2 rounded-full whitespace-nowrap',
                activeTab === 'media'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Media
            </button>
            <button
              onClick={() => handleTabClick('events')}
              className={clsx(
                'px-4 py-2 rounded-full whitespace-nowrap',
                activeTab === 'events'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Events
            </button>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-theme-primary text-white rounded-full font-medium hover:bg-theme-primary/90 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <UnifiedFeed 
              items={filteredPosts}
              loading={postsLoading}
              showCreateButton={false}
              onItemClick={handleItemClick}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">
                Be the first to create a post in this tribe!
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="inline-flex items-center px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-[600px] rounded-t-xl sm:rounded-xl">
            <CreatePost 
              onClose={() => setShowCreatePost(false)} 
              isOpen={showCreatePost}
              tribeId={tribe.id}
              onSuccess={handlePostCreationSuccess}
            />
          </div>
        </div>
      )}
    </FeedLayout>
  );
} 