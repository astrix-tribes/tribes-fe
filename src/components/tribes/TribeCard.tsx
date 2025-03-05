import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, Globe, Lock } from 'lucide-react';
import type { Tribe } from '../../types/tribe';
import { Card, CardContent, Badge } from '../common/ui';
import { 
  getTribeAvatar, 
  getTribeCoverImage, 
  getTribeDescription, 
  getTribePrivacy, 
  getTribeTopics,
  getTribeMembershipStatus
} from '../../utils/tribeHelpers';

interface TribeCardProps {
  tribe: Tribe;
}

export function TribeCard({ tribe }: TribeCardProps) {
  const navigate = useNavigate();
  
  const coverImage = getTribeCoverImage(tribe);
  const avatar = getTribeAvatar(tribe);
  const description = getTribeDescription(tribe);
  const privacy = getTribePrivacy(tribe);
  const topics = getTribeTopics(tribe);
  
  // For properties that don't have helpers, we'll provide defaults
  const isVerified = tribe.metadata ? JSON.parse(tribe.metadata)?.isVerified || false : false;
  const onlineCount = tribe.metadata ? JSON.parse(tribe.metadata)?.onlineCount || 0 : 0;

  return (
    <Card 
      variant="enhanced"
      onClick={() => navigate(`/tribes/${tribe.id}`)}
      className="cursor-pointer overflow-hidden"
    >
      {coverImage && (
        <div className="h-32 overflow-hidden">
          <img
            src={coverImage}
            alt={tribe.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <img
            src={avatar}
            alt={tribe.name}
            className="w-16 h-16 rounded-2xl"
          />
          <div className="flex-1">
            <div className="mb-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">{tribe.name}</h3>
                {isVerified && (
                  <div className="w-5 h-5 bg-success-main rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex space-x-3">
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{tribe.memberCount.toLocaleString()} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-success-main rounded-full" />
                  <span>{onlineCount.toLocaleString()} online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {privacy === 'public' ? (
              <Globe className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        <p className="mt-3 text-muted-foreground line-clamp-2">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {topics.slice(0, 3).map((topic) => (
            <Badge
              key={topic.id}
              variant="secondary"
            >
              {topic.name}
            </Badge>
          ))}
          {topics.length > 3 && (
            <Badge variant="secondary">
              +{topics.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}