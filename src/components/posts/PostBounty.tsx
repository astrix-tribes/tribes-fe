import React from 'react';
import type { Post } from '../../types/post';
import { Bug, ArrowUpRight, Github, Timer } from 'lucide-react';

// Define the bounty data interface that's missing from the Post type
interface BountyData {
  reward: string | number;
  currency: string;
  difficulty: string;
  deadline?: string;
  tags: string[];
  requirements: string[];
  repository?: string;
}

// Extend the Post type to include bountyData
interface PostWithBounty extends Post {
  bountyData: BountyData;
}

interface PostBountyProps {
  post: Post; // Keep the original prop type
}

export function PostBounty({ post }: PostBountyProps) {
  // Cast to the extended type inside the component
  const postWithBounty = post as PostWithBounty;
  
  // Safely check if bountyData exists
  if (!postWithBounty.bountyData) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'hard':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-white/10 text-white';
    }
  };

  const { bountyData } = postWithBounty;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center">
            <Bug className="w-6 h-6 text-[#4ADE80]" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {bountyData.reward} {bountyData.currency}
            </div>
            <div className="text-sm text-gray-400">Reward</div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(
            bountyData.difficulty
          )}`}
        >
          {bountyData.difficulty.charAt(0).toUpperCase() +
            bountyData.difficulty.slice(1)}
        </span>
      </div>

      {bountyData.deadline && (
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Timer className="w-4 h-4" />
          <span>Deadline: {new Date(bountyData.deadline).toLocaleDateString()}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {bountyData.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-white/5 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Requirements</h4>
        <ul className="space-y-2">
          {bountyData.requirements.map((req, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm text-gray-400">
              <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#4ADE80]" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {bountyData.repository && (
        <a
          href={bountyData.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 w-fit"
        >
          <Github className="w-4 h-4" />
          <span>View Repository</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      )}

      <button className="w-full py-3 bg-[#4ADE80] text-black rounded-xl font-medium">
        Apply for Bounty
      </button>
    </div>
  );
}