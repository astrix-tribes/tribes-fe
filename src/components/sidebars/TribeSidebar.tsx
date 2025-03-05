import { Link } from 'react-router-dom';
import { Hash, Crown, Shield } from 'lucide-react';
import { Card, CardContent } from '../common/ui';
import type { Topic, TribeMember } from '../../types/tribe';

interface TribeSidebarProps {
  members: TribeMember[];
  topics: Topic[];
  onTopicSelect?: (topic: Topic) => void;
  selectedTopicId?: string;
}

export function TribeSidebar({
  members = [],
  topics = [],
  onTopicSelect,
  selectedTopicId,
}: TribeSidebarProps) {
  // Ensure members and topics are arrays
  const safeMembers = Array.isArray(members) ? members : [];
  const safeTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className="space-y-4">
      {/* Top Members */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-green-500" />
            Top Members
          </h3>
          <div className="space-y-2">
            {safeMembers.slice(0, 5).map((member) => (
              <Link
                key={member.id}
                to={`/profile/${member.username}`}
                className="flex items-center space-x-3 group p-2 hover:bg-green-100/20 rounded-lg transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={member.avatar}
                    alt={member.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {member.role === 'admin' && (
                    <Shield className="w-3.5 h-3.5 text-green-500 absolute -right-0.5 -bottom-0.5 bg-black rounded-full p-0.5" />
                  )}
                </div>
                <div className="flex-grow min-w-0 pr-1">
                  <p className="font-medium text-sm group-hover:text-green-500 truncate max-w-full">
                    @{member.username}
                  </p>
                  {member.role && (
                    <p className="text-xs text-gray-400 truncate max-w-full">
                      {member.role === 'admin' ? 'Admin' : member.role}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-green-500" />
            Topics
          </h3>
          <div className="space-y-2">
            {safeTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onTopicSelect?.(topic)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedTopicId === topic.id
                    ? 'bg-green-500 text-white'
                    : 'hover:bg-green-100/20 text-gray-400 hover:text-white'
                }`}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate text-left">{topic.name}</span>
                {topic.postCount && (
                  <span className={`text-xs ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-full ${
                    selectedTopicId === topic.id
                      ? 'bg-green-600 text-white' 
                      : 'bg-green-200/10 text-gray-400'
                  }`}>
                    {topic.postCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 