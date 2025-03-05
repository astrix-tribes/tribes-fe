import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Info } from 'lucide-react';

// Comment out the extended interfaces for now
// We will properly map topics to post tags in a future implementation

/**
 * TopicsView - Display a global view of topics across the platform
 * 
 * TODO: Implement proper mapping between topics and post tags
 */
export function TopicsView() {
  const { topicId } = useParams();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
          <Info className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Topics View</h1>
          <p className="text-gray-300 mb-4">
            This feature is currently under development. Topics will soon be mapped to post tags 
            to provide a unified view of content across tribes.
          </p>
          <p className="text-gray-400">
            Topic ID: {topicId || 'None selected'}
          </p>
          <div className="mt-6">
            <Link 
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 