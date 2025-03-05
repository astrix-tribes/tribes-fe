import React from 'react';
import { ArrowLeft, Bell, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../constants/theme';

interface Collectible {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  image: string;
  price: number;
  currency: string;
  daysLeft: number;
  tags: string[];
}

const collectibles: Collectible[] = [
  {
    id: '1',
    title: 'Blockchain Bytes - Stellar ft. Astrix',
    creator: 'Stellar Events',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&h=400&fit=crop',
    price: 1999,
    currency: 'XLM',
    daysLeft: 5,
    tags: ['Songs', 'Collectible', 'Music']
  },
  {
    id: '2',
    title: 'Queen Greatest Hits Collection',
    creator: 'Music Legends',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop',
    price: 2999,
    currency: 'XLM',
    daysLeft: 5,
    tags: ['Music', 'Collectible']
  },
  {
    id: '3',
    title: 'Art & Design Workshop Pass',
    creator: 'Creative Hub',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
    price: 1499,
    currency: 'XLM',
    daysLeft: 5,
    tags: ['Art', 'Workshop']
  }
];

const categories = ['All', 'Tickets', 'Collectible'];

export function Marketplace() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-12 z-10 bg-black/80 backdrop-blur-xl">

        <div className="flex space-x-4 px-4 pb-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1 rounded-full whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-white text-black'
                  : 'text-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {collectibles.map((item) => (
          <div key={item.id} className="bg-white/5 rounded-2xl overflow-hidden">
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-full text-sm flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 bg-[${COLORS.monad.bg}] rounded-full`} />
                <span>{item.daysLeft} Days left</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  src={item.creatorAvatar}
                  alt={item.creator}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-400">By</span>
                <span className="text-sm">{item.creator}</span>
              </div>

              <h3 className="text-lg font-bold">{item.title}</h3>

              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/5 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <div className="text-sm text-gray-400">Floor Price</div>
                  <div className="font-bold">
                    <span className={`text-[${COLORS.monad.bg}]`}>☆</span> {item.price}
                  </div>
                </div>
                <button className={`px-6 py-2 bg-[${COLORS.monad.bg}] text-[${COLORS.text.primary}] rounded-full font-medium hover:bg-[${COLORS.monad.bg}]/90`}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}