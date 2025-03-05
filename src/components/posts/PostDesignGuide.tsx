import React from 'react';
import { 
  postContainerStyles, 
  postTypeBadgeStyles, 
  postTypeIconStyles,
  tagStyles,
  actionButtonStyles,
  buttonStyles
} from './styles/post.styles';
import { 
  FileText, 
  Image, 
  Video, 
  Link, 
  Calendar, 
  BarChart2, 
  Bug, 
  Briefcase 
} from 'lucide-react';

const PostDesignGuide: React.FC = () => {
  // All post types
  const postTypes = [
    { type: 'text', icon: <FileText className="w-4 h-4" />, name: 'Text' },
    { type: 'image', icon: <Image className="w-4 h-4" />, name: 'Image' },
    { type: 'video', icon: <Video className="w-4 h-4" />, name: 'Video' },
    { type: 'link', icon: <Link className="w-4 h-4" />, name: 'Link' },
    { type: 'event', icon: <Calendar className="w-4 h-4" />, name: 'Event' },
    { type: 'poll', icon: <BarChart2 className="w-4 h-4" />, name: 'Poll' },
    { type: 'bounty', icon: <Bug className="w-4 h-4" />, name: 'Bounty' },
    { type: 'project', icon: <Briefcase className="w-4 h-4" />, name: 'Project' },
  ];

  // Tag variants
  const tagVariants = [
    'default', 'blue', 'purple', 'green', 'yellow', 'orange', 'red', 'indigo', 'emerald'
  ] as const;

  // Button variants
  const buttonVariants = [
    'primary', 'secondary', 'outline', 'destructive', 'ghost'
  ] as const;

  // Action button variants
  const actionVariants = [
    'default', 'primary', 'destructive', 'success'
  ] as const;

  return (
    <div className="p-6 space-y-8 bg-neutral-950 text-white">
      <h1 className="text-3xl font-bold">Post Design System</h1>
      
      {/* Post Type Containers */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Post Containers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {postTypes.map((postType) => (
            <div 
              key={postType.type}
              className={postContainerStyles({ type: postType.type as any })}
            >
              <div className={postTypeBadgeStyles({ type: postType.type as any })}>
                {postType.icon}
                <span className="ml-1">{postType.name}</span>
              </div>
              <h3 className="mt-4 text-lg font-medium">{postType.name} Post</h3>
              <p className="mt-2 text-sm text-neutral-400">
                This is an example of a {postType.name.toLowerCase()} post container with its unique styling.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Post Type Icons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Post Type Icons</h2>
        <div className="flex flex-wrap gap-4">
          {postTypes.map((postType) => (
            <div key={postType.type} className="flex flex-col items-center">
              <div className={postTypeIconStyles({ type: postType.type as any })}>
                {postType.icon}
              </div>
              <span className="mt-2 text-sm">{postType.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tagVariants.map((variant) => (
            <span 
              key={variant} 
              className={tagStyles({ variant: variant })}
            >
              {variant}
            </span>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          {buttonVariants.map((variant) => (
            <button 
              key={variant} 
              className={buttonStyles({ variant: variant })}
            >
              {variant}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {buttonVariants.map((variant) => (
            <button 
              key={variant} 
              className={buttonStyles({ variant: variant, size: 'sm' })}
            >
              {variant} small
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {buttonVariants.map((variant) => (
            <button 
              key={variant} 
              className={buttonStyles({ variant: variant, size: 'lg' })}
            >
              {variant} large
            </button>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Action Buttons</h2>
        <div className="flex flex-wrap gap-2 bg-neutral-900 p-4 rounded-lg">
          {actionVariants.map((variant) => (
            <React.Fragment key={variant}>
              <button 
                className={actionButtonStyles({ variant: variant })}
              >
                <FileText className="mr-1 h-4 w-4" />
                <span>{variant}</span>
              </button>
              <button 
                className={actionButtonStyles({ variant: variant, active: true })}
              >
                <FileText className="mr-1 h-4 w-4" />
                <span>{variant} active</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Post Type Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {postTypes.map((postType) => (
            <div 
              key={postType.type}
              className={`p-4 rounded-lg ${postContainerStyles({ type: postType.type as any })}`}
            >
              <div className="flex items-center gap-2">
                <div className={postTypeIconStyles({ type: postType.type as any })}>
                  {postType.icon}
                </div>
                <div>
                  <h3 className="font-medium">{postType.name}</h3>
                  <p className="text-xs text-neutral-400">Type: {postType.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PostDesignGuide; 