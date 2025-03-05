import { cva } from 'class-variance-authority';
import { colors } from '../../../theme/foundations/colors';

// Type colors - Maps post types to consistent colors 
const TYPE_COLORS = {
  text: {
    border: 'border-neutral-800 hover:border-neutral-700',
    accent: 'bg-neutral-800/30 text-neutral-200',
    icon: 'text-neutral-400',
  },
  image: {
    border: 'border-blue-900 hover:border-blue-800',
    accent: 'bg-blue-900/30 text-blue-200',
    icon: 'text-blue-400',
  },
  video: {
    border: 'border-purple-900 hover:border-purple-800',
    accent: 'bg-purple-900/30 text-purple-200',
    icon: 'text-purple-400',
  },
  link: {
    border: 'border-green-900 hover:border-green-800',
    accent: 'bg-green-900/30 text-green-200',
    icon: 'text-green-400',
  },
  event: {
    border: 'border-yellow-900 hover:border-yellow-800',
    accent: 'bg-yellow-900/30 text-yellow-200',
    icon: 'text-yellow-400',
  },
  poll: {
    border: 'border-orange-900 hover:border-orange-800',
    accent: 'bg-orange-900/30 text-orange-200',
    icon: 'text-orange-400',
  },
  bounty: {
    border: 'border-emerald-900 hover:border-emerald-800',
    accent: 'bg-emerald-900/30 text-emerald-200',
    icon: 'text-emerald-400',
  },
  project: {
    border: 'border-indigo-900 hover:border-indigo-800',
    accent: 'bg-indigo-900/30 text-indigo-200',
    icon: 'text-indigo-400',
  },
};

// Base post container styles with more refined styling
export const postContainerStyles = cva(
  'relative w-full rounded-xl border p-5 shadow-md transition-all hover:shadow-lg bg-neutral-900 text-white backdrop-blur-sm',
  {
    variants: {
      type: {
        text: TYPE_COLORS.text.border,
        image: TYPE_COLORS.image.border,
        video: TYPE_COLORS.video.border,
        link: TYPE_COLORS.link.border,
        event: TYPE_COLORS.event.border,
        poll: TYPE_COLORS.poll.border,
        bounty: TYPE_COLORS.bounty.border,
        project: TYPE_COLORS.project.border,
      },
    },
    defaultVariants: {
      type: 'text',
    },
  }
);

// Badge for post type indicator
export const postTypeBadgeStyles = cva(
  'absolute top-4 right-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      type: {
        text: TYPE_COLORS.text.accent,
        image: TYPE_COLORS.image.accent,
        video: TYPE_COLORS.video.accent,
        link: TYPE_COLORS.link.accent,
        event: TYPE_COLORS.event.accent,
        poll: TYPE_COLORS.poll.accent,
        bounty: TYPE_COLORS.bounty.accent,
        project: TYPE_COLORS.project.accent,
      }
    },
    defaultVariants: {
      type: 'text',
    },
  }
);

// Icon container for post type
export const postTypeIconStyles = cva(
  'flex items-center justify-center w-10 h-10 rounded-full',
  {
    variants: {
      type: {
        text: TYPE_COLORS.text.accent,
        image: TYPE_COLORS.image.accent,
        video: TYPE_COLORS.video.accent,
        link: TYPE_COLORS.link.accent,
        event: TYPE_COLORS.event.accent,
        poll: TYPE_COLORS.poll.accent,
        bounty: TYPE_COLORS.bounty.accent,
        project: TYPE_COLORS.project.accent,
      }
    },
    defaultVariants: {
      type: 'text',
    },
  }
);

// Tag styles with refined design
export const tagStyles = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
        blue: 'bg-blue-900/50 text-blue-200 hover:bg-blue-800/50',
        purple: 'bg-purple-900/50 text-purple-200 hover:bg-purple-800/50',
        green: 'bg-green-900/50 text-green-200 hover:bg-green-800/50',
        yellow: 'bg-yellow-900/50 text-yellow-200 hover:bg-yellow-800/50',
        orange: 'bg-orange-900/50 text-orange-200 hover:bg-orange-800/50',
        red: 'bg-red-900/50 text-red-200 hover:bg-red-800/50',
        indigo: 'bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800/50',
        emerald: 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Action button styles with improved hover states
export const actionButtonStyles = cva(
  'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
        primary: 'text-primary hover:bg-primary/20',
        destructive: 'text-red-400 hover:bg-red-900/20 hover:text-red-200',
        success: 'text-green-400 hover:bg-green-900/20 hover:text-green-200',
      },
      active: {
        true: '',
        false: '',
      }
    },
    compoundVariants: [
      {
        variant: 'default',
        active: true,
        className: 'text-white bg-neutral-800',
      },
      {
        variant: 'primary',
        active: true,
        className: 'text-white bg-primary/20',
      },
      {
        variant: 'destructive',
        active: true,
        className: 'text-red-200 bg-red-900/20',
      },
      {
        variant: 'success',
        active: true,
        className: 'text-green-200 bg-green-900/20',
      },
    ],
    defaultVariants: {
      variant: 'default',
      active: false,
    },
  }
);

// Post metadata styles with improved spacing
export const metadataStyles = 'flex items-center gap-2 text-sm text-neutral-400 mt-2';

// Post content styles with better readability
export const contentStyles = 'mt-4 text-neutral-100 whitespace-pre-wrap break-words leading-relaxed text-base';

// Media container styles with subtle shadow
export const mediaContainerStyles = 'mt-4 overflow-hidden rounded-lg border border-neutral-800 shadow-sm';

// Author styles with improved spacing
export const authorStyles = 'flex items-center gap-3';
export const authorNameStyles = 'font-semibold text-white hover:text-accent transition-colors';
export const authorAvatarStyles = 'h-10 w-10 rounded-full bg-neutral-800';

// Timestamp styles
export const timestampStyles = 'text-sm text-neutral-400';

// Section divider
export const dividerStyles = 'border-t border-neutral-800 my-4';

// Button styles
export const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-black hover:bg-accent/90 focus:ring-accent/50',
        secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 focus:ring-neutral-400/30',
        outline: 'border border-neutral-700 text-white hover:bg-neutral-800 focus:ring-neutral-400/30',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400/30',
        ghost: 'text-white hover:bg-neutral-800 focus:ring-neutral-400/30',
      },
      size: {
        sm: 'text-xs px-2.5 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-5 py-2.5',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
); 