import { ExternalLink, GitBranch, Globe } from 'lucide-react';
import { FONTS } from '../../constants/theme';
import type { Post } from '../../types/post';

interface PostProjectProps {
  post: Post | any;
}

export function PostProject({ post }: PostProjectProps) {
  if (!post.projectData) return null;

  const styles = {
    wrapper: 'mt-4 rounded-xl border border-[--monad-purple]/20',
    header: 'flex items-center justify-between p-4 border-b border-[--monad-purple]/10',
    title: `text-[--text-primary] font-[${FONTS.weights.medium}] flex items-center gap-2`,
    content: 'p-4',
    links: 'flex items-center gap-3 text-[--text-secondary]',
    linkButton: 'flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[--monad-purple]/10 transition-colors'
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <GitBranch className="w-4 h-4" />
          <span>Project Repository</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.links}>
          {post.projectData.github && (
            <a 
              href={post.projectData.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkButton}
            >
              <GitBranch className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {post.projectData.website && (
            <a
              href={post.projectData.website}
              target="_blank"
              rel="noopener noreferrer" 
              className={styles.linkButton}
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}