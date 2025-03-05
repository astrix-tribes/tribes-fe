import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../common/ui';
import { getChainColor } from '../../utils/chain';

interface Profile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  chainId: number;
}

const suggestedProfiles: Profile[] = [
  {
    id: '1',
    username: 'monad.core',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=monad-core',
    bio: 'Official Monad Chain team',
    chainId: 20143,
  },
  {
    id: '2',
    username: 'flash.dev',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=flash-dev',
    bio: 'Flash Chain Developer Community',
    chainId: 20144,
  },
  {
    id: '3',
    username: 'defi.builder',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi-builder',
    bio: 'Building the future of DeFi',
    chainId: 20143,
  },
];

export function SuggestedFollows() {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Suggested to Follow</h3>
        <div className="space-y-4">
          {suggestedProfiles.map((profile) => (
            <Link
              key={profile.id}
              to={`/profile/${profile.username}`}
              className="flex items-start space-x-3 group"
            >
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:text-accent truncate">
                  @{profile.username}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {profile.bio}
                </p>
              </div>
              <button
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${getChainColor(profile.chainId)}20`,
                  color: getChainColor(profile.chainId),
                }}
              >
                Follow
              </button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 