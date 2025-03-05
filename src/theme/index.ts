import { colors, gradients } from './foundations/colors';
import { typography } from './foundations/typography';
import { spacing, layout } from './foundations/spacing';
import { shadows, blurs, animations } from './foundations/effects';

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  layout,
  shadows,
  blurs,
  animations,
};

export type Theme = typeof theme;

// Export individual foundations for direct access
export * from './foundations/colors';
export * from './foundations/typography';
export * from './foundations/spacing';
export * from './foundations/effects'; 