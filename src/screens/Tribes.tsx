import React, { useState } from 'react';
import { TribeList } from '../components/tribes/TribeList';
import { Plus, Search, Filter, Users, Sparkles } from 'lucide-react';
import { useTribesManagement } from '../hooks/useTribesManagement';
import { useNavigate } from 'react-router-dom';

export function Tribes() {
  const navigate = useNavigate();
  const { createTribe } = useTribesManagement();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'new' | 'joined'>('all');

  const handleCreateTribe = () => {
    // Navigate to create tribe page or open modal
    navigate('/tribes/create');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-10 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/tribes-pattern.svg')] opacity-10 z-0"></div>
        
        <div className="relative z-10 px-6 py-12 md:py-16 md:px-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Discover Tribes</h1>
          <p className="text-gray-300 text-lg max-w-2xl mb-6">
            Join communities of like-minded individuals, share ideas, and collaborate on projects that matter to you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tribes by name or description..."
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleCreateTribe}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Tribe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/30 text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            All Tribes
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeFilter === 'popular'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/30 text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Popular</span>
          </button>
          <button
            onClick={() => setActiveFilter('new')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/30 text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setActiveFilter('joined')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeFilter === 'joined'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/30 text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Joined</span>
          </button>
        </div>
        
        <button className="p-2 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Tribes List */}
      <TribeList />
    </div>
  );
} 