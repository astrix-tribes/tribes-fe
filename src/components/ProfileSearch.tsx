import React, { useState } from 'react';
import { useProfileSearch, ProfileSearchResult } from '../hooks/useProfileSearch';
import { COLORS } from '../constants/theme';

export const ProfileSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ProfileSearchResult | null>(null);
  const { searchProfileByUsername, isSearching, error } = useProfileSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const result = await searchProfileByUsername(searchQuery.trim());
    setSearchResult(result);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ADE80] text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-2 bg-[#4ADE80] text-black rounded-lg font-medium hover:bg-[#4ADE80]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {searchResult && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${searchResult.username}`}
              alt={`${searchResult.username}'s avatar`}
              className="w-16 h-16 rounded-full ring-2 ring-[#4ADE80]/20"
            />
            <div>
              <h3 className="text-xl font-bold text-white">@{searchResult.username}</h3>
              <p className="text-gray-400">{searchResult.bio || 'No bio'}</p>
            </div>
          </div>

          {(searchResult.website || searchResult.twitter) && (
            <div className="border-t border-gray-700/50 pt-4 mt-4">
              <div className="space-y-2">
                {searchResult.website && (
                  <a
                    href={searchResult.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#4ADE80] hover:underline"
                  >
                    <span>🌐</span>
                    {searchResult.website}
                  </a>
                )}
                {searchResult.twitter && (
                  <a
                    href={`https://twitter.com/${searchResult.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#4ADE80] hover:underline"
                  >
                    <span>🐦</span>
                    @{searchResult.twitter}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 