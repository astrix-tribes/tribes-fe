import React from 'react';
import type { Post } from '../../types/post';
import { Check } from 'lucide-react';

// Define missing interfaces for poll data
interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface PollData {
  options: PollOption[];
  totalVotes: number;
  endsIn: string;
}

// Extended Post with poll-specific properties
interface PostWithPoll extends Post {
  pollData: PollData;
}

interface PostPollProps {
  post: Post;
}

export function PostPoll({ post }: PostPollProps) {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [hasVoted, setHasVoted] = React.useState(false);
  
  // Cast to the extended type
  const pollPost = post as PostWithPoll;

  const handleVote = (optionId: number) => {
    if (!hasVoted) {
      setSelectedOption(optionId);
      setHasVoted(true);
    }
  };

  if (!pollPost.pollData) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {pollPost.pollData.options.map((option) => {
          const percentage = Math.round((option.votes / pollPost.pollData.totalVotes) * 100) || 0;
          const isSelected = selectedOption === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted && !isSelected}
              className="w-full"
            >
              <div className="relative">
                <div
                  className={`w-full p-3 rounded-xl border ${
                    isSelected
                      ? 'border-[#4ADE80] bg-[#4ADE80]/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.text}</span>
                    {hasVoted && (
                      <span className="text-sm text-gray-400">{percentage}%</span>
                    )}
                  </div>
                </div>
                {hasVoted && (
                  <div
                    className="absolute top-0 left-0 h-full bg-[#4ADE80]/10 rounded-xl transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{pollPost.pollData.totalVotes.toLocaleString()} votes</span>
        <span>{pollPost.pollData.endsIn} left</span>
      </div>
    </div>
  );
}