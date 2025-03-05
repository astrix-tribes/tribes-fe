import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Info, Tag, ArrowLeft } from 'lucide-react';

/**
 * TopicView - Display a specific topic within a tribe 
 * 
 * TODO: Properly implement topic to post tag mapping
 */
export function TopicView() {
  const { tribeId, topicId } = useParams();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to={`/tribes/${tribeId}`} className="flex items-center text-gray-400 hover:text-blue-400 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tribe
        </Link>
        
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
          <Tag className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Topic View</h1>
          <p className="text-gray-300 mb-4">
            This feature is currently being updated to properly map topics to post tags 
            for improved content organization within tribes.
          </p>
          <div className="text-left max-w-md mx-auto bg-gray-800/50 rounded-lg p-4 mt-6">
            <div className="mb-2">
              <span className="text-gray-400">Tribe ID:</span>
              <span className="text-white ml-2">{tribeId || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-400">Topic ID:</span>
              <span className="text-white ml-2">{topicId || 'None'}</span>
            </div>
          </div>
          <div className="mt-6">
            <Link 
              to={`/tribes/${tribeId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Tribe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 