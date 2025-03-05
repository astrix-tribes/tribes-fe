import React, { useState, useEffect } from 'react';
import { PostType } from '../../types/post';
import { createSampleEventPost } from '../../utils/eventHelpers';
import PostTypeMapper from '../posts/PostTypeMapper';
import { PostCreator } from '../post/PostCreator';

/**
 * Component for previewing what a post would look like when created
 */
const PostCreationPreview: React.FC = () => {
  // State for tracking the sample post
  const [samplePost, setSamplePost] = useState(createSampleEventPost());
  const [simulateBlockchain, setSimulateBlockchain] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(localStorage.getItem('connectedWallet') || '');
  const [debugMode, setDebugMode] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  
  // Create a blockchain event sample
  const createBlockchainEventPost = () => {
    const post = createSampleEventPost();
    
    // Add blockchain-specific fields
    if (post.metadata) {
      const eventId = 123;
      post.metadata.eventDetails = {
        ...post.metadata.eventDetails,
        isOnChain: true,
        eventId,
        maxTickets: 100,
        ticketsSold: 45,
        price: "0.05",
        priceInWei: "50000000000000000", // 0.05 ETH
        active: true,
        organizer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      };
    }
    
    return post;
  };

  // Handler for sample post actions
  const handlePostAction = (actionType: string) => {
    console.log(`Post action: ${actionType}`);
  };
  
  // Toggle blockchain simulation
  const toggleBlockchainSimulation = () => {
    setSimulateBlockchain(!simulateBlockchain);
    setSamplePost(simulateBlockchain ? createSampleEventPost() : createBlockchainEventPost());
  };
  
  // Connect wallet for testing
  const handleWalletConnect = () => {
    if (!connectedWallet) {
      const mockAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      setConnectedWallet(mockAddress);
      localStorage.setItem('connectedWallet', mockAddress);
    } else {
      setConnectedWallet('');
      localStorage.removeItem('connectedWallet');
    }
  };
  
  // Update wallet from localStorage
  useEffect(() => {
    const storedWallet = localStorage.getItem('connectedWallet');
    if (storedWallet) {
      setConnectedWallet(storedWallet);
    }
  }, []);
  
  // Reset ticket counts
  const resetTicketCounts = () => {
    const keys = [];
    
    // Find all localStorage keys related to tickets
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('event-') && key.includes('-tickets')) {
        keys.push(key);
      }
    }
    
    // Remove all ticket-related items
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('All ticket counts reset!');
  };
  
  // Set ticket count for testing
  const setTestTickets = () => {
    if (!connectedWallet) {
      alert('Please connect wallet first');
      return;
    }
    
    const eventId = samplePost.metadata?.eventDetails?.eventId;
    if (!eventId) {
      alert('No event ID found');
      return;
    }
    
    const ticketCount = 2;
    localStorage.setItem(`event-${eventId}-user-${connectedWallet}-tickets`, ticketCount.toString());
    alert(`Set ${ticketCount} tickets for event ${eventId}`);
    
    // Reload the post to refresh ticket counts
    setSamplePost({...samplePost});
  };

  const handlePostSuccess = (postId: string) => {
    console.log(`Post created successfully with ID: ${postId}`);
    alert(`Post created successfully with ID: ${postId}`);
    setShowCreator(false);
  };

  const handlePostError = (error: Error) => {
    console.error('Error creating post:', error);
    alert(`Error creating post: ${error.message}`);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Post Creation Preview</h2>
        <div>
          <button
            className={`rounded-md px-4 py-2 text-white ${showCreator ? 'bg-neutral-600 hover:bg-neutral-700' : 'bg-accent text-black hover:bg-accent/90'}`}
            onClick={() => setShowCreator(!showCreator)}
          >
            {showCreator ? 'Show Preview' : 'Try Post Creator'}
          </button>
        </div>
      </div>
      
      {showCreator ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h3 className="mb-4 text-lg font-medium">Post Creator</h3>
          <PostCreator 
            mode="inline"
            tribeId="preview-tribe"
            onSuccess={handlePostSuccess}
            onError={handlePostError}
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm text-neutral-400">
              This is a preview of what your post will look like when created. 
              Use this to check the formatting and appearance before publishing.
            </p>
            
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Post Type:</label>
                  <select 
                    className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white"
                    value={PostType.EVENT}
                    disabled
                  >
                    <option value={PostType.TEXT}>Text</option>
                    <option value={PostType.IMAGE}>Image</option>
                    <option value={PostType.VIDEO}>Video</option>
                    <option value={PostType.LINK}>Link</option>
                    <option value={PostType.EVENT}>Event</option>
                    <option value={PostType.POLL}>Poll</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Event Type:</label>
                  <div className="flex items-center h-10">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateBlockchain}
                        onChange={toggleBlockchainSimulation}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      <span className="ms-3 text-sm">Blockchain Event</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Blockchain Testing Controls */}
          {simulateBlockchain && (
            <div className="border border-indigo-900/50 rounded-lg bg-indigo-900/20 p-4">
              <h3 className="text-lg font-medium mb-3">Blockchain Testing Controls</h3>
              
              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-4 py-2 rounded-md text-sm ${connectedWallet ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={handleWalletConnect}
                >
                  {connectedWallet ? 'Disconnect Wallet' : 'Connect Wallet'}
                </button>
                
                <button
                  className="px-4 py-2 rounded-md text-sm bg-yellow-600 hover:bg-yellow-700"
                  onClick={setTestTickets}
                >
                  Set Test Tickets
                </button>
                
                <button
                  className="px-4 py-2 rounded-md text-sm bg-red-600 hover:bg-red-700"
                  onClick={resetTicketCounts}
                >
                  Reset Tickets
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md text-sm ${debugMode ? 'bg-green-600' : 'bg-neutral-600'}`}
                  onClick={() => setDebugMode(!debugMode)}
                >
                  {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
                </button>
              </div>
              
              {debugMode && (
                <div className="mt-3 text-xs font-mono bg-neutral-900 p-3 rounded border border-neutral-800 max-h-40 overflow-auto">
                  <div>Connected Wallet: {connectedWallet || '(none)'}</div>
                  <div>Event ID: {samplePost.metadata?.eventDetails?.eventId}</div>
                  <div>Tickets Owned: {localStorage.getItem(`event-${samplePost.metadata?.eventDetails?.eventId}-user-${connectedWallet}-tickets`) || '0'}</div>
                  <div>Event Data: {JSON.stringify(samplePost.metadata?.eventDetails, null, 2)}</div>
                </div>
              )}
            </div>
          )}
          
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-2 text-lg font-medium">Preview</h3>
            
            <div>
              {/* Use our PostTypeMapper to render the sample post */}
              <PostTypeMapper 
                post={samplePost} 
                onLike={() => handlePostAction('like')}
                onComment={() => handlePostAction('comment')}
                onShare={() => handlePostAction('share')}
                onReport={() => handlePostAction('report')}
                onClick={() => handlePostAction('click')}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-neutral-400">
                {simulateBlockchain 
                  ? '* Blockchain events include ticket purchasing functionality and on-chain data.' 
                  : '* Regular events include simple RSVP functionality.'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="rounded-md bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700"
                onClick={() => setSamplePost(simulateBlockchain ? createBlockchainEventPost() : createSampleEventPost())}
              >
                Regenerate Sample
              </button>
              
              <button
                className="rounded-md bg-accent px-4 py-2 text-black hover:bg-accent/90"
                onClick={() => console.log('Preview post data:', samplePost)}
              >
                Log Post Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostCreationPreview; 