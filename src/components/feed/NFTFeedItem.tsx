import React from 'react';
import { Image } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { NFTFeedItem as NFTFeedItemType } from '../../types/feed';

interface NFTFeedItemProps {
  item: NFTFeedItemType;
  onClick?: () => void;
}

export function NFTFeedItem({ item, onClick }: NFTFeedItemProps) {
  const chainColor = getChainColor(item.chainId);

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.collection}</h3>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: `${chainColor}20`,
                color: chainColor,
              }}
            >
              NFT
            </Badge>
          </div>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* NFT Preview */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.collection}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div className="flex items-center">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">
              {item.price ? `${item.price.amount} ${item.price.token}` : 'Not listed'}
            </p>
          </div>
        </div>

        {/* Action */}
        <div 
          className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
          style={{ 
            backgroundColor: `${chainColor}20`,
            color: chainColor,
          }}
        >
          View Collection
        </div>
      </div>
    </FeedCard>
  );
} 