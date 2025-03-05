import React from 'react';

interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // If image fails to load, set a default avatar image
        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random`;
      }}
    />
  );
};

export default Avatar; 