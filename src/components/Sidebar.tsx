import { useNavigate, useLocation } from 'react-router-dom';
import { X, Hash, Users, Globe, Lock } from 'lucide-react';
import { useTribesData } from '../hooks/useTribesData';
import clsx from 'clsx';
import { getTribeAvatar, getTribePrivacy, getTribeTopics } from '../utils/tribeHelpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tribes, isLoading } = useTribesData();
  const currentPath = location.pathname;

  // Get all topics from tribes with proper error handling
  const allTopics = tribes?.flatMap(tribe => {
    const topics = getTribeTopics(tribe);
    return topics.map(topic => ({
      ...topic,
      tribeName: tribe.name,
      tribeId: tribe.id
    }));
  }) || [];

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed md:sticky top-[64px] left-0 h-[calc(100vh-64px-64px)] w-64',
          'bg-theme-bg/90 backdrop-blur-xl z-30',
          'transform transition-transform duration-200 ease-in-out',
          'overflow-hidden flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Mobile Header */}
        <div className="p-4 flex justify-between items-center md:hidden">
          <h2 className="text-xl font-bold text-text-primary">Navigation</h2>
          <button onClick={onClose} className="p-1 text-text-primary hover:text-theme-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-8">
            {/* Tribes Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4 text-sm font-medium text-text-secondary sticky top-0 bg-theme-bg/90 backdrop-blur-xl py-2">
                <Users className="w-4 h-4" />
                <span>TRIBES</span>
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-theme-primary/5 h-9 rounded-lg" />
                  ))
                ) : tribes?.map(tribe => {
                  const avatarUrl = getTribeAvatar(tribe);
                  const privacy = getTribePrivacy(tribe);
                  
                  return (
                    <button
                      key={tribe.id}
                      onClick={() => {
                        navigate(`/tribes/${tribe.id}`);
                        onClose();
                      }}
                      className={clsx(
                        'w-full px-2 py-1.5 rounded-lg',
                        'flex gap-2 transition-colors',
                        'text-text-secondary hover:text-text-primary',
                        'hover:bg-theme-primary/5',
                        currentPath === `/tribes/${tribe.id}` ? 'bg-theme-primary/10 text-text-primary' : ''
                      )}
                    >
                      <img
                        src={avatarUrl}
                        alt={tribe.name}
                        className="w-6 h-6 rounded-lg"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                        }}
                      />
                      <span className="flex-1 truncate text-sm text-left">{tribe.name}</span>
                      {privacy === 'public' ? (
                        <Globe className="w-3 h-3 opacity-50" />
                      ) : (
                        <Lock className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topics Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4 text-sm font-medium text-text-secondary sticky top-0 bg-theme-bg/90 backdrop-blur-xl py-2">
                <Hash className="w-4 h-4" />
                <span>TOPICS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  // Loading skeleton
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-theme-primary/5 h-7 w-24 rounded-full" />
                  ))
                ) : allTopics.length > 0 ? (
                  allTopics.map(topic => (
                    <button
                      key={`${topic.tribeId}-${topic.id}`}
                      onClick={() => {
                        navigate(`/tribes/${topic.tribeId}/topics/${topic.id}`);
                        onClose();
                      }}
                      className={clsx(
                        'inline-flex items-center px-3 py-1 rounded-full',
                        'text-sm transition-colors gap-1',
                        'hover:bg-theme-primary/5',
                        currentPath === `/tribes/${topic.tribeId}/topics/${topic.id}`
                          ? 'bg-theme-primary/10 text-text-primary'
                          : 'bg-black/50 text-text-secondary hover:text-text-primary'
                      )}
                    >
                      <Hash className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{topic.name}</span>
                      <span className="text-xs opacity-50 shrink-0">
                        {topic.postCount}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-text-secondary italic px-2">
                    No topics available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}