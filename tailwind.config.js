/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        monad: {
          green: 'var(--monad-green)',
          darkGreen: 'var(--monad-dark-green)',
          bg: 'var(--monad-bg)',
          offWhite: 'var(--text-primary)',
        },
        fuse: {
          gold: 'var(--fuse-gold)',
          blue: 'var(--fuse-blue)',
          darkBlue: 'var(--fuse-dark-blue)',
          bg: 'var(--fuse-bg)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          disabled: 'var(--text-disabled)',
        },
        success: {
          main: 'var(--success-main)',
        },
        error: {
          main: 'var(--error-main)',
        },
        theme: {
          primary: 'var(--chain-primary)',
          secondary: 'var(--chain-secondary)',
          bg: 'var(--chain-bg)',
          accent: 'var(--chain-accent)',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      ringColor: {
        DEFAULT: 'var(--chain-primary)',
      },
      borderColor: {
        DEFAULT: 'var(--chain-primary)',
      },
      gradientColorStops: {
        'monad-green': 'var(--monad-green)',
        'monad-dark-green': 'var(--monad-dark-green)',
        'monad-bg': 'var(--monad-bg)',
        'fuse-gold': 'var(--fuse-gold)',
        'fuse-blue': 'var(--fuse-blue)',
        'fuse-dark-blue': 'var(--fuse-dark-blue)',
        'fuse-bg': 'var(--fuse-bg)',
      }
    },
  },
  safelist: [
    // Monad colors
    'bg-monad-green',
    'text-monad-green',
    'border-monad-green',
    'ring-monad-green',
    'bg-monad-green/5',
    'bg-monad-green/10',
    'bg-monad-green/20',
    'bg-monad-bg',
    
    // Fuse colors
    'bg-fuse-gold',
    'text-fuse-gold',
    'border-fuse-gold',
    'ring-fuse-gold',
    'bg-fuse-gold/5',
    'bg-fuse-gold/10',
    'bg-fuse-gold/20',
    'bg-fuse-bg',
    
    // Theme colors - dynamically set based on active chain
    'bg-theme-primary',
    'text-theme-primary',
    'border-theme-primary',
    'ring-theme-primary',
    'bg-theme-primary/5',
    'bg-theme-primary/10',
    'bg-theme-primary/20',
    'bg-theme-bg',
    'bg-theme-bg/80',
    'bg-theme-bg/90',
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
