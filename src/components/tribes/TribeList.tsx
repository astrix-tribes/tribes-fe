import { useTribesData } from '../../hooks/useTribesData';
import { TribeCardEnhanced } from './TribeCardEnhanced';
import { useEffect } from 'react';
import { Tribe } from '../../types/tribe';

// Define the ExtendedTribe interface to match TribeCardEnhanced expectations
// but without extending Tribe to avoid type conflicts
interface ExtendedTribe {
  id: string;
  name: string;
  metadata: string;
  owner: `0x${string}`;
  admins: `0x${string}`[];
  memberCount: number;
  createdAt: number;
  joinType: number;
  entryFee: string | number;
  nftRequirements: any[];
  privacy?: 'public' | 'private';
  onlineCount?: number;
  postCount?: number;
  coverImage?: string;
  avatar?: string;
  isVerified?: boolean;
  description?: string;
  topics?: Array<{ id: string; name: string }>;
  userMembershipStatus?: {
    isMember?: boolean;
    isPending?: boolean;
    isAdmin?: boolean;
  };
}

// Adapter function to convert Tribe to ExtendedTribe
function adaptTribeToExtendedTribe(tribe: Tribe): ExtendedTribe {
  return {
    id: tribe.id,
    name: tribe.name,
    metadata: tribe.metadata,
    owner: tribe.owner,
    admins: tribe.admins,
    memberCount: tribe.memberCount,
    createdAt: tribe.createdAt,
    joinType: tribe.joinType,
    entryFee: tribe.entryFee.toString(), // Convert bigint to string
    nftRequirements: tribe.nftRequirements,
    privacy: 'public', // Default to public if not specified
    onlineCount: 0,
    postCount: 0,
    description: '',
    topics: [],
    userMembershipStatus: {
      isMember: false,
      isPending: false,
      isAdmin: false
    }
  };
}

export function TribeList() {
  const { tribes, isLoading: loading, error, refreshTribes } = useTribesData();

  // Add debug logging 
  useEffect(() => {
    console.log('TribeList - Tribes data:', { 
      tribes, 
      loading, 
      error, 
      tribesLength: tribes?.length,
      tribesEmpty: !tribes?.length
    });
    
    if (!tribes?.length && !loading && !error) {
      console.log('TribeList - No tribes found, triggering refresh');
      refreshTribes().catch(err => {
        console.error('Failed to refresh tribes:', err);
      });
    }
  }, [tribes, loading, error, refreshTribes]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-800/30 rounded-xl h-48" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('TribeList - Error loading tribes:', error);
    return (
      <div className="text-center text-gray-400 py-8">
        Failed to load tribes. Please try again later.
        <pre className="mt-2 text-xs text-left bg-gray-800/30 p-2 rounded overflow-auto">
          {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
        </pre>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => refreshTribes()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tribes?.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        No tribes found on this network.
        <div className="mt-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => refreshTribes()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  console.log('TribeList - Rendering tribes:', tribes.map(t => ({ id: t.id, name: t.name })));
  
  // Adapt tribes to expected format
  const extendedTribes = tribes.map(adaptTribeToExtendedTribe);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {extendedTribes.map((tribe) => (
        <TribeCardEnhanced key={tribe.id} tribe={tribe as any} />
      ))}
    </div>
  );
}