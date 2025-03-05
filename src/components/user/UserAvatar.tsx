import React from 'react';
import { generateAvatarFromAddress } from '../../utils/avatar';

interface UserAvatarProps {
  address?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ address, className = '' }) => {
  const avatarUrl = React.useMemo(() => generateAvatarFromAddress(address), [address]);
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 ${className}`}
      title={address || 'Unknown User'}
    >
      <img
        src={avatarUrl}
        alt={`Avatar for ${address || 'Unknown User'}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-full" />
    </div>
  );
};

export default UserAvatar; 