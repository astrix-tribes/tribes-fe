import React, { useState, useEffect } from 'react';
import { useTribesManagement } from '../../hooks/useTribesManagement';
import { useWalletClient } from 'wagmi';
import { MemberStatus, TribeJoinType } from '../../types/tribe';

// Mock method to get member status - in a real app, this would come from a separate hook or service
const getMemberStatus = async (tribeId: number, address: string): Promise<MemberStatus> => {
  // This is just a mock implementation
  console.log(`Checking member status for address ${address} in tribe ${tribeId}`);
  return Math.random() > 0.5 ? MemberStatus.NotMember : MemberStatus.Member;
};

// Mock method to get tribe config - in a real app, this would come from a separate hook
const getTribeConfig = async (tribeId: number) => {
  console.log(`Fetching config for tribe ${tribeId}`);
  return {
    name: "Example Tribe",
    joinType: TribeJoinType.Open,
    entryFee: "0"
  };
};

interface JoinTribeButtonProps {
  tribeId: number;
  joinType?: TribeJoinType;
  entryFee?: bigint;
  onSuccess?: () => void;
}

export const JoinTribeButton: React.FC<JoinTribeButtonProps> = ({
  tribeId,
  joinType,
  entryFee = 0n,
  onSuccess
}) => {
  const { data: walletClient } = useWalletClient();
  const [memberStatus, setMemberStatus] = useState<MemberStatus>(MemberStatus.NotMember);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Tribe management hook
  const {
    isLoading,
    error: tribeError,
    joinTribe,
    requestToJoinTribe
  } = useTribesManagement();
  
  // Effect to fetch tribe config if joinType is not provided
  useEffect(() => {
    const fetchTribeConfig = async () => {
      if (joinType === undefined && tribeId) {
        try {
          await getTribeConfig(tribeId);
        } catch (err) {
          console.error('Error fetching tribe config:', err);
          setLocalError('Failed to fetch tribe settings');
        }
      }
    };
    
    fetchTribeConfig();
  }, [tribeId, joinType]);
  
  // Effect to check if user is already a member
  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!tribeId || !walletClient) return;
      
      try {
        const [address] = await walletClient.getAddresses();
        const status = await getMemberStatus(tribeId, address);
        setMemberStatus(status);
      } catch (err) {
        console.error('Error checking member status:', err);
      }
    };
    
    checkMemberStatus();
  }, [tribeId, walletClient]);
  
  // Handle joining a public tribe
  const handleJoinPublic = async () => {
    setLocalError(null);
    
    try {
      await joinTribe(tribeId);
      setMemberStatus(MemberStatus.Member);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error joining tribe:', err);
      setLocalError(err.message || 'Failed to join tribe');
    }
  };
  
  // Handle joining a private tribe
  const handleJoinPrivate = async () => {
    setLocalError(null);
    
    try {
      await requestToJoinTribe(tribeId, entryFee);
      setMemberStatus(MemberStatus.Pending);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error requesting to join tribe:', err);
      setLocalError(err.message || 'Failed to request joining tribe');
    }
  };
  
  // Handle submitting an invite code
  const handleSubmitInviteCode = () => {
    setLocalError(null);
    
    if (!inviteCode) {
      setLocalError('Please enter an invite code');
      return;
    }
    
    // TODO: Implement invite code submission when the contract method is available
    setLocalError('Invite code functionality not implemented yet');
  };
  
  // Determine button state based on member status and join type
  const renderButton = () => {
    if (!walletClient) {
      return (
        <button 
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md cursor-not-allowed"
          disabled
        >
          Connect Wallet to Join
        </button>
      );
    }
    
    if (memberStatus === MemberStatus.Member || memberStatus === MemberStatus.Admin) {
      return (
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded-md cursor-default"
          disabled
        >
          Already a Member
        </button>
      );
    }
    
    if (memberStatus === MemberStatus.Pending) {
      return (
        <button 
          className="px-4 py-2 bg-yellow-600 text-white rounded-md cursor-default"
          disabled
        >
          Approval Pending
        </button>
      );
    }
    
    if (memberStatus === MemberStatus.Rejected) {
      return (
        <button 
          className="px-4 py-2 bg-red-600 text-white rounded-md cursor-default"
          disabled
        >
          Banned from Tribe
        </button>
      );
    }
    
    // Not a member, show appropriate join button based on join type
    switch (joinType) {
      case TribeJoinType.Open:
        return (
          <button 
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleJoinPublic}
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Tribe'}
          </button>
        );
        
      case TribeJoinType.Approval:
        return (
          <button 
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleJoinPrivate}
            disabled={isLoading}
          >
            {isLoading ? 'Requesting...' : `Request to Join (${entryFee > 0n ? formatEntryFee(entryFee) : 'Free'})`}
          </button>
        );
        
      case TribeJoinType.Closed:
        return showInviteInput ? (
          <div className="flex space-x-2">
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              disabled={isLoading}
            />
            <button 
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSubmitInviteCode}
              disabled={isLoading || !inviteCode}
            >
              {isLoading ? 'Joining...' : 'Join'}
            </button>
          </div>
        ) : (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setShowInviteInput(true)}
          >
            Join with Invite Code
          </button>
        );
        
      default:
        return (
          <button 
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md cursor-not-allowed"
            disabled
          >
            Loading...
          </button>
        );
    }
  };
  
  // Helper function to format entry fee
  const formatEntryFee = (fee: bigint): string => {
    // Simple formatting for demonstration purposes
    // In a real app, you'd use ethers.js or a similar library
    return `${fee.toString()} wei`;
  };
  
  const error = localError || tribeError;
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {renderButton()}
    </div>
  );
}; 