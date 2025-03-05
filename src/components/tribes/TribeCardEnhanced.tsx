import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, Globe, Lock, MessageSquare, Activity, Plus } from 'lucide-react';
import type { Tribe } from '../../types/tribe';
import { Card, CardContent, Badge } from '../common/ui';
import { useTribesManagement } from '../../hooks/useTribesManagement';
import { 
  getTribeAvatar, 
  getTribePrivacy, 
  getTribeTopics, 
  getTribeDescription, 
  getTribeCoverImage,
  getTribeMembershipStatus
} from '../../utils/tribeHelpers';

// Simpler interface that uses the base Tribe type
interface TribeCardEnhancedProps {
  tribe: Tribe;
  showJoinButton?: boolean;
}

export function TribeCardEnhanced({ tribe, showJoinButton = true }: TribeCardEnhancedProps) {
  const navigate = useNavigate();
  const { joinTribe, requestToJoinTribe } = useTribesManagement();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [avatarError, setAvatarError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  // Load and validate tribe data with metadata on mount
  useEffect(() => {
    if (!tribe) return;
    
    // Debug tribe data
    console.log('TribeCardEnhanced processing tribe:', {
      id: tribe.id,
      name: tribe.name,
      metadata: typeof tribe.metadata === 'string' ? (
        tribe.metadata.length > 100 ? `${tribe.metadata.substring(0, 100)}...` : tribe.metadata
      ) : 'Not a string',
      memberCount: tribe.memberCount
    });
    
    try {
      // Get and set avatar URL with helper
      const avatar = getTribeAvatar(tribe);
      setAvatarUrl(avatar);
      setAvatarError(false);
      
      // Get and set cover image URL with helper
      const cover = getTribeCoverImage(tribe);
      setCoverImageUrl(cover);
      setCoverError(false);
    } catch (error) {
      console.error('Error loading tribe media:', error);
    }
  }, [tribe]);

  const handleJoinTribe = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to tribe page
    
    if (isJoining) return;
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      // Get privacy from helper function
      const privacy = getTribePrivacy(tribe);
      
      if (privacy === 'public') {
        await joinTribe(Number(tribe.id));
      } else {
        // For private tribes, we need to handle entry fee if applicable
        const entryFee = tribe.entryFee || BigInt(0);
        await requestToJoinTribe(Number(tribe.id), entryFee);
      }
      // Show success state or update UI
    } catch (error) {
      console.error('Failed to join tribe:', error);
      setJoinError(error instanceof Error ? error.message : 'Failed to join tribe');
    } finally {
      setIsJoining(false);
    }
  };

  // Define activity levels
  const activityLevels = ['low', 'medium', 'high'] as const;
  type ActivityLevel = typeof activityLevels[number];

  // Calculate activity level based on recent posts and online members
  const getActivityLevel = (): ActivityLevel => {
    // Use memberCount from the tribe object directly, as it's required in the Tribe interface
    const memberCount = tribe.memberCount || 0;
    // These values aren't in the Tribe type, so set defaults
    const onlineCount = 0; // This would need to come from a different source
    const ratio = memberCount > 0 ? onlineCount / memberCount : 0;
    
    if (ratio > 0.3) return 'high';
    if (ratio > 0.1) return 'medium';
    return 'low';
  };

  const activityLevel = getActivityLevel();
  
  const activityColors = {
    low: 'text-gray-400',
    medium: 'text-yellow-500',
    high: 'text-green-500'
  };

  // Get membership status using helper function
  const { isMember, isPending, isAdmin } = getTribeMembershipStatus(tribe);

  // Use helper functions to get metadata properties
  const privacy = getTribePrivacy(tribe);
  const description = getTribeDescription(tribe);
  const topics = getTribeTopics(tribe);
  
  // Image error handlers
  const handleAvatarError = () => {
    console.warn(`Avatar load failed for tribe ${tribe.id}`);
    setAvatarError(true);
    setAvatarUrl('/images/default-avatar.png');
  };
  
  const handleCoverError = () => {
    console.warn(`Cover image load failed for tribe ${tribe.id}`);
    setCoverError(true);
    setCoverImageUrl('/images/default-cover.png');
  };

  return (
    <Card 
      className="overflow-hidden hover:border-theme-primary/30 transition-colors cursor-pointer h-full flex flex-col" 
      onClick={() => navigate(`/tribes/${tribe.id}`)}
    >
      {/* Cover Image */}
      {coverImageUrl && !coverError && (
        <div className="h-28 relative">
          <img 
            src={coverImageUrl} 
            alt={`${tribe.name} banner`}
            className="w-full h-full object-cover"
            onError={handleCoverError}
          />
          
          {/* Privacy Badge */}
          {privacy === 'private' && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </div>
          )}
        </div>
      )}
      
      <CardContent className="flex-1 flex flex-col px-4 py-3">
        {/* Avatar and Status */}
        <div className="flex items-start">
          <div className="relative -mt-6 mr-3">
            <img 
              src={avatarUrl}
              alt={tribe.name}
              className="w-14 h-14 rounded-xl ring-2 ring-theme-bg shadow-lg bg-theme-bg"
              onError={handleAvatarError}
            />
            
            {/* Membership Badge */}
            {isMember && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>
          
          <div className="flex-1 mt-1">
            <h3 className="font-bold text-lg text-white leading-tight flex items-center">
              {tribe.name}
            </h3>
            
            {/* Stats */}
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                {privacy === 'public' ? (
                  <Globe className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>{privacy === 'public' ? 'Public' : 'Private'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5" />
                <span>{tribe.memberCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>0</span> {/* Default post count since it's not in the Tribe type */}
              </div>
              <div className={`flex items-center space-x-1 ${activityColors[activityLevel]}`}>
                <Activity className="w-3.5 h-3.5" />
                <span className="capitalize">{activityLevel}</span>
              </div>
            </div>
          </div>
          
          {/* Join Button */}
          {showJoinButton && !isMember && !isPending && !isAdmin && (
            <button
              onClick={handleJoinTribe}
              disabled={isJoining}
              className={`
                flex items-center rounded-lg px-3 py-1.5 text-sm font-medium 
                ${isJoining ? 'bg-gray-700 text-gray-400' : 'bg-theme-primary text-black hover:bg-theme-primary/90'}
                transition-colors
              `}
            >
              {isJoining ? (
                <span>Joining...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Join</span>
                </>
              )}
            </button>
          )}
          
          {/* Pending Badge */}
          {isPending && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500 ml-auto">
              Pending
            </Badge>
          )}
        </div>

        <p className="mt-3 text-gray-300 line-clamp-2 text-sm">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {topics.length > 0 ? (
            <>
              {topics.slice(0, 3).map((topic) => (
                <Badge 
                  key={topic.id}
                  variant="secondary"
                  className="bg-gray-800/80 text-gray-300 text-xs"
                >
                  {topic.name}
                </Badge>
              ))}
              {topics.length > 3 && (
                <Badge 
                  variant="secondary"
                  className="bg-gray-800/80 text-gray-300 text-xs"
                >
                  +{topics.length - 3} more
                </Badge>
              )}
            </>
          ) : (
            <Badge 
              variant="secondary"
              className="bg-gray-800/80 text-gray-300 text-xs"
            >
              No topics
            </Badge>
          )}
        </div>
        
        {/* Error Message */}
        {joinError && (
          <div className="mt-3 text-red-500 text-xs">
            {joinError}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 