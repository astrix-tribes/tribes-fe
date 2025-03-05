import type { FeedItem } from '../../types/feed';
import type { Post } from '../../types/post';
import { ProposalFeedItem } from './ProposalFeedItem';
import { BountyFeedItem } from './BountyFeedItem';
import { EventFeedItem } from './EventFeedItem';
import { NFTFeedItem } from './NFTFeedItem';
import { ProjectFeedItem } from './ProjectFeedItem';
import { LivestreamFeedItem } from './LivestreamFeedItem';
import { PollFeedItem } from './PollFeedItem';
import { PostFeedItem } from './PostFeedItem';

interface FeedProps {
  items: (FeedItem | Post)[];
  onItemClick?: (item: FeedItem | Post) => void;
}

export function Feed({ items, onItemClick }: FeedProps) {
  const renderFeedItem = (item: FeedItem | Post) => {
    const handleClick = () => onItemClick?.(item);

    // Check if item is a Post
    if ('content' in item && 'metadata' in item) {
      return <PostFeedItem key={item.id} post={item} onClick={handleClick} />;
    }

    // Handle other feed item types
    switch (item.type) {
      case 'proposal':
        return <ProposalFeedItem key={item.id} item={item} onClick={handleClick} />;
      case 'bounty':
        return <BountyFeedItem key={item.id} item={item} onClick={handleClick} />;
      case 'event':
        return <EventFeedItem key={item.id} item={item} onClick={handleClick} />;
      case 'nft':
        return <NFTFeedItem key={item.id} item={item} onClick={handleClick} />;
      case 'project':
        return <ProjectFeedItem key={item.id} item={item} onClick={handleClick} />;
      case 'livestream':
        return <LivestreamFeedItem key={item.id} item={item} onClick={handleClick} />;
      case 'poll':
        return <PollFeedItem key={item.id} item={item} onClick={handleClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {items.map(renderFeedItem)}
    </div>
  );
} 