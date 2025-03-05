import React from 'react';
import type { Post } from '../../types/post';
import { Timer } from 'lucide-react';

// Define missing interfaces
interface NFTData {
  price: string | number;
  currency: string;
  endTime: string;
}

// Extended Post with NFT-specific properties
interface PostWithNFT extends Post {
  nftData: NFTData;
  image?: string;
  title?: string;
}

interface PostNFTProps {
  post: Post;
}

export function PostNFT({ post }: PostNFTProps) {
  const [timeLeft, setTimeLeft] = React.useState('');
  
  // Cast to the extended type
  const nftPost = post as PostWithNFT;

  React.useEffect(() => {
    if (!nftPost.nftData) return;

    const updateTimeLeft = () => {
      const end = new Date(nftPost.nftData.endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [nftPost.nftData]);

  if (!nftPost.nftData) return null;

  // Get the image from metadata or from the direct property
  const imageUrl = nftPost.image || 
    (nftPost.metadata?.media && nftPost.metadata.media.length > 0 ? 
      nftPost.metadata.media[0].url : undefined);
      
  // Get the title from metadata or from the direct property
  const title = nftPost.title || nftPost.metadata?.title || 'NFT';

  return (
    <div className="space-y-4">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full rounded-xl aspect-square object-cover"
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">Current Bid</div>
          <div className="text-xl font-bold">
            {nftPost.nftData.price} {nftPost.nftData.currency}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Ends in</div>
          <div className="flex items-center text-[#4ADE80]">
            <Timer className="w-4 h-4 mr-1" />
            {timeLeft}
          </div>
        </div>
      </div>
      <button className="w-full py-3 bg-[#4ADE80] text-black rounded-xl font-medium">
        Place Bid
      </button>
    </div>
  );
}