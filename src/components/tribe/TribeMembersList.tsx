import React, { useState, useEffect } from 'react';
import { useTribesManagement } from '../../hooks/useTribesManagement';
import { useWalletClient } from 'wagmi';
import { MemberStatus } from '../../types/tribe';

// Mock tribe management functions - in a real app, these would come from a separate hook or service
// These functions simulate what would normally be available through contracts or a backend
const fetchTribeMembers = async (tribeId: number): Promise<Member[]> => {
  console.log(`Fetching members for tribe ${tribeId}`);
  return [
    { address: '0x123...', status: MemberStatus.Admin },
    { address: '0x456...', status: MemberStatus.Member },
    { address: '0x789...', status: MemberStatus.Member }
  ];
};

const fetchPendingMembers = async (tribeId: number): Promise<Member[]> => {
  console.log(`Fetching pending members for tribe ${tribeId}`);
  return [
    { address: '0xabc...', status: MemberStatus.Pending },
    { address: '0xdef...', status: MemberStatus.Pending }
  ];
};

const approveMember = async (tribeId: number, address: string): Promise<void> => {
  console.log(`Approving member ${address} for tribe ${tribeId}`);
};

const rejectMember = async (tribeId: number, address: string): Promise<void> => {
  console.log(`Rejecting member ${address} for tribe ${tribeId}`);
};

const banMember = async (tribeId: number, address: string): Promise<void> => {
  console.log(`Banning member ${address} from tribe ${tribeId}`);
};

const promoteToAdmin = async (tribeId: number, address: string): Promise<void> => {
  console.log(`Promoting member ${address} to admin in tribe ${tribeId}`);
};

interface Member {
  address: string;
  status: MemberStatus;
}

interface TribeMembersListProps {
  tribeId: number;
  currentUserIsAdmin?: boolean;
}

export const TribeMembersList: React.FC<TribeMembersListProps> = ({
  tribeId,
  currentUserIsAdmin = false
}) => {
  const { data: walletClient } = useWalletClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [activePage, setActivePage] = useState<'members' | 'pending'>('members');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tribe management hook
  const {
    isLoading: isHookLoading,
    error: hookError
  } = useTribesManagement();
  
  // Load members on component mount
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [membersData, pendingData] = await Promise.all([
          fetchTribeMembers(tribeId),
          fetchPendingMembers(tribeId)
        ]);
        
        setMembers(membersData);
        setPendingMembers(pendingData);
      } catch (err: any) {
        console.error('Error loading tribe members:', err);
        setError(err.message || 'Failed to load tribe members');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMembers();
  }, [tribeId]);
  
  // Admin actions for managing members
  const handleApproveMember = async (address: string) => {
    setIsLoading(true);
    
    try {
      await approveMember(tribeId, address);
      
      // Update local state to reflect changes
      setPendingMembers(prev => prev.filter(member => member.address !== address));
      setMembers(prev => [...prev, { address, status: MemberStatus.Member }]);
    } catch (err: any) {
      console.error('Error approving member:', err);
      setError(err.message || 'Failed to approve member');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRejectMember = async (address: string) => {
    setIsLoading(true);
    
    try {
      await rejectMember(tribeId, address);
      
      // Update local state to reflect changes
      setPendingMembers(prev => prev.filter(member => member.address !== address));
    } catch (err: any) {
      console.error('Error rejecting member:', err);
      setError(err.message || 'Failed to reject member');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBanMember = async (address: string) => {
    setIsLoading(true);
    
    try {
      await banMember(tribeId, address);
      
      // Update local state to reflect changes
      setMembers(prev => prev.filter(member => member.address !== address));
    } catch (err: any) {
      console.error('Error banning member:', err);
      setError(err.message || 'Failed to ban member');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromoteToAdmin = async (address: string) => {
    setIsLoading(true);
    
    try {
      await promoteToAdmin(tribeId, address);
      
      // Update local state to reflect changes
      setMembers(prev => 
        prev.map(member => 
          member.address === address 
            ? { ...member, status: MemberStatus.Admin } 
            : member
        )
      );
    } catch (err: any) {
      console.error('Error promoting member:', err);
      setError(err.message || 'Failed to promote member');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format addresses
  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get member status text
  const getMemberStatusText = (status: MemberStatus): string => {
    switch (status) {
      case MemberStatus.Admin: return 'Admin';
      case MemberStatus.Member: return 'Member';
      case MemberStatus.Pending: return 'Pending';
      case MemberStatus.Rejected: return 'Banned';
      default: return 'Unknown';
    }
  };
  
  // Determine if the component is loading
  const loading = isLoading || isHookLoading;
  
  // Determine if there's an error
  const displayError = error || hookError;
  
  // Render admin actions for a member
  const renderAdminActions = (member: Member) => {
    if (!currentUserIsAdmin) return null;
    
    if (member.status === MemberStatus.Pending) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApproveMember(member.address)}
            disabled={loading}
            className="px-2 py-1 bg-green-600 text-white text-xs rounded"
          >
            Approve
          </button>
          <button
            onClick={() => handleRejectMember(member.address)}
            disabled={loading}
            className="px-2 py-1 bg-red-600 text-white text-xs rounded"
          >
            Reject
          </button>
        </div>
      );
    }
    
    if (member.status === MemberStatus.Member) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handlePromoteToAdmin(member.address)}
            disabled={loading}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
          >
            Make Admin
          </button>
          <button
            onClick={() => handleBanMember(member.address)}
            disabled={loading}
            className="px-2 py-1 bg-red-600 text-white text-xs rounded"
          >
            Ban
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {displayError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {displayError}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tribe Members</h2>
        
        {currentUserIsAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => setActivePage('members')}
              className={`px-3 py-1 rounded ${
                activePage === 'members' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActivePage('pending')}
              className={`px-3 py-1 rounded ${
                activePage === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pending
              {pendingMembers.length > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full text-xs px-2">
                  {pendingMembers.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activePage === 'members' && (
            <div className="divide-y">
              {members.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">No members found</p>
              ) : (
                members.map(member => (
                  <div key={member.address} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{formatAddress(member.address)}</p>
                      <p className="text-sm text-gray-500">{getMemberStatusText(member.status)}</p>
                    </div>
                    {renderAdminActions(member)}
                  </div>
                ))
              )}
            </div>
          )}
          
          {activePage === 'pending' && (
            <div className="divide-y">
              {pendingMembers.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">No pending requests</p>
              ) : (
                pendingMembers.map(member => (
                  <div key={member.address} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{formatAddress(member.address)}</p>
                      <p className="text-sm text-gray-500">Pending Approval</p>
                    </div>
                    {renderAdminActions(member)}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}; 