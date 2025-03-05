import { hsl } from '../utils/colors';

export const colors = {
  // Theme Colors
  background: hsl('224 71% 4%'),
  foreground: hsl('0 0% 98%'),
  card: hsl('222 84% 5%'),
  cardForeground: hsl('0 0% 98%'),
  popover: hsl('224 71% 4%'),
  popoverForeground: hsl('0 0% 98%'),
  primary: hsl('220 14% 96%'),
  primaryForeground: hsl('0 0% 9%'),
  secondary: hsl('0 0% 14.9%'),
  secondaryForeground: hsl('0 0% 98%'),
  muted: hsl('0 0% 14.9%'),
  mutedForeground: hsl('0 0% 63.9%'),
  accent: hsl('84 60% 71%'),
  accentForeground: hsl('0 0% 98%'),
  destructive: hsl('0 62.8% 30.6%'),
  destructiveForeground: hsl('0 0% 98%'),
  border: hsl('0 0% 14.9%'),
  input: hsl('0 0% 14.9%'),
  ring: hsl('0 0% 83.1%'),

  // Chart Colors
  chart: {
    1: hsl('220 70% 50%'),
    2: hsl('160 60% 45%'),
    3: hsl('30 80% 55%'),
    4: hsl('280 65% 60%'),
    5: hsl('340 75% 55%'),
  },

  // Status Colors
  status: {
    success: {
      bg: 'rgba(176, 230, 129, 0.2)',
      text: '#B0E681',
    },
    warning: {
      bg: 'rgba(234, 179, 8, 0.2)',
      text: '#EAB308',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.2)',
      text: '#EF4444',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.2)',
      text: '#3B82F6',
    },
  },
};

// Gradients
export const gradients = {
  page: 'radial-gradient(circle at top right, hsl(217, 91%, 8%), hsl(222, 84%, 4%), hsl(224, 71%, 2%))',
  card: 'linear-gradient(to bottom right, hsl(222, 84%, 5%), hsl(222, 84%, 4%), hsl(222, 84%, 3%))',
  glow: 'radial-gradient(circle at center, hsla(220, 14%, 96%, 0.15), transparent 50%)',
  hover: 'linear-gradient(to bottom right, hsla(84, 60%, 71%, 0.1), hsla(84, 60%, 71%, 0.05))',
}; 