import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input, Button } from '../components/common/ui';
import { Feed } from '../components/feed/Feed';
import { mockFeedItems } from '../data/mockFeed';
import { MONAD_CHAIN_ID, FLASH_CHAIN_ID, getChainColor } from '../utils/chain';
import type { FeedItem, FeedItemType } from '../types/feed';

const itemTypes: Array<{
  type: FeedItemType;
  label: string;
}> = [
  { type: 'proposal', label: 'Proposals' },
  { type: 'bounty', label: 'Bounties' },
  { type: 'event', label: 'Events' },
  { type: 'nft', label: 'NFTs' },
  { type: 'project', label: 'Projects' },
  { type: 'livestream', label: 'Livestreams' },
  { type: 'poll', label: 'Polls' },
];

const getSearchableText = (item: FeedItem): string => {
  switch (item.type) {
    case 'proposal':
      return `${item.title} ${item.description}`;
    case 'bounty':
      return `${item.title} ${item.description}`;
    case 'event':
      return `${item.title} ${item.description}`;
    case 'nft':
      return `${item.title} ${item.description}`;
    case 'project':
      return `${item.title} ${item.description}`;
    case 'livestream':
      return `${item.title} ${item.description}`;
    case 'poll':
      return `${item.question}`;
  }
};

export function FeedScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<FeedItemType | null>(null);

  const filteredItems = mockFeedItems.filter((item: any) => {
    const matchesChain = selectedChain ? item.chainId === selectedChain : true;
    const matchesType = selectedType ? item.type === selectedType : true;
    const matchesSearch = searchQuery
      ? getSearchableText(item).toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesChain && matchesType && matchesSearch;
  });
 
  // const handleItemClick = (item: FeedItem) => {
  //   console.log('Clicked item:', item);
  // };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Feed</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest activities across chains
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <Input
          variant="enhanced"
          placeholder="Search feed..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        <div className="flex flex-wrap gap-2">
          {/* Chain filters */}
          <Button
            variant={selectedChain === null ? 'default' : 'ghost'}
            onClick={() => setSelectedChain(null)}
          >
            All Chains
          </Button>
          <Button
            variant={selectedChain === MONAD_CHAIN_ID ? 'default' : 'ghost'}
            onClick={() => setSelectedChain(MONAD_CHAIN_ID)}
            style={selectedChain === MONAD_CHAIN_ID ? {
              backgroundColor: `${getChainColor(MONAD_CHAIN_ID)}20`,
              color: getChainColor(MONAD_CHAIN_ID),
            } : undefined}
          >
            Monad
          </Button>
          <Button
            variant={selectedChain === FLASH_CHAIN_ID ? 'default' : 'ghost'}
            onClick={() => setSelectedChain(FLASH_CHAIN_ID)}
            style={selectedChain === FLASH_CHAIN_ID ? {
              backgroundColor: `${getChainColor(FLASH_CHAIN_ID)}20`,
              color: getChainColor(FLASH_CHAIN_ID),
            } : undefined}
          >
            Flash
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type filters */}
          <Button
            variant={selectedType === null ? 'default' : 'ghost'}
            onClick={() => setSelectedType(null)}
          >
            All Types
          </Button>
          {itemTypes.map(({ type, label }) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'ghost'}
              onClick={() => setSelectedType(type)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {/* <Feed items={filteredItems} onItemClick={handleItemClick} /> */}
      <Feed items={filteredItems}/>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedChain || selectedType
              ? 'No items match your filters'
              : 'No items in the feed'}
          </p>
        </div>
      )}
    </div>
  );
} 