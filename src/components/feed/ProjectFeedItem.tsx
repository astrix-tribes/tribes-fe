import React from 'react';
import { Github, Globe } from 'lucide-react';
import { Badge } from '../common/ui';
import { FeedCard } from './FeedCard';
import { getChainColor } from '../../utils/chain';
import type { ProjectFeedItem as ProjectFeedItemType } from '../../types/feed';

interface ProjectFeedItemProps {
  item: ProjectFeedItemType;
  onClick?: () => void;
}

export function ProjectFeedItem({ item, onClick }: ProjectFeedItemProps) {
  const chainColor = getChainColor(item.chainId);

  return (
    <FeedCard item={item} onClick={onClick}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: `${chainColor}20`,
                color: chainColor,
              }}
            >
              Project
            </Badge>
          </div>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Project Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, index) => (
              <Badge 
                key={index}
                className="bg-muted text-muted-foreground text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Project Links */}
        <div className="flex items-center space-x-4">
          {item.repository && (
            <a 
              href={item.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm hover:underline"
              style={{ color: chainColor }}
            >
              <Github className="w-4 h-4" />
              <span>View Repository</span>
            </a>
          )}
          {item.website && (
            <a 
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm hover:underline"
              style={{ color: chainColor }}
            >
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
            </a>
          )}
        </div>
      </div>
    </FeedCard>
  );
} 