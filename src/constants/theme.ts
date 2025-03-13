// Define CSS variables in :root
const cssVariables = `
:root {
  /* Blockchain brand colors */
  --monad-green: #4ADE80;
  --monad-dark-green: #22c55e;
  --monad-bg: #0F2416;
  --monad-bg-rgb: 15, 36, 22;
  --fuse-blue: #1E88FA;
  --fuse-gold: #F9C846;
  --fuse-dark-blue: #0D2B47;
  --fuse-bg: #0A1F35;
  --fuse-bg-rgb: 10, 31, 53;
  --text-primary: #FBFAF9;
  --text-secondary: rgba(251, 250, 249, 0.7);
  --text-disabled: rgba(251, 250, 249, 0.5);
  --success-main: #22c55e;
  --error-main: #ef4444;
  
  /* Set chain-specific colors - default to Monad */
  --chain-primary: var(--monad-green);
  --chain-secondary: var(--monad-dark-green);
  --chain-bg: var(--monad-bg);
  --chain-bg-rgb: var(--monad-bg-rgb);
  --chain-accent: rgba(74, 222, 128, 0.2);
}
`;

// Add cssVariables to your index.css or inject it into the document head
const style = document.createElement('style');
style.textContent = cssVariables;
document.head.appendChild(style);

// Chain IDs
export const MONAD_TESTNET_ID = 20143;
export const FUSE_EMBER_ID = 1264453517;

// Function to update chain colors based on current chain
export const updateChainColors = (chainId: number) => {
  if (chainId === MONAD_TESTNET_ID) {
    document.documentElement.style.setProperty('--chain-primary', 'var(--monad-green)');
    document.documentElement.style.setProperty('--chain-secondary', 'var(--monad-dark-green)');
    document.documentElement.style.setProperty('--chain-bg', 'var(--monad-bg)');
    document.documentElement.style.setProperty('--chain-bg-rgb', 'var(--monad-bg-rgb)');
    document.documentElement.style.setProperty('--chain-accent', 'rgba(74, 222, 128, 0.2)');
    document.documentElement.style.setProperty('--theme-color', '#4ADE80');
    // Update theme-color meta tag for browser UI
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#4ADE80');
    }
  } else if (chainId === FUSE_EMBER_ID) {
    document.documentElement.style.setProperty('--chain-primary', 'var(--fuse-gold)');
    document.documentElement.style.setProperty('--chain-secondary', 'var(--fuse-dark-blue)');
    document.documentElement.style.setProperty('--chain-bg', 'var(--fuse-bg)');
    document.documentElement.style.setProperty('--chain-bg-rgb', 'var(--fuse-bg-rgb)');
    document.documentElement.style.setProperty('--chain-accent', 'rgba(249, 200, 70, 0.2)');
    document.documentElement.style.setProperty('--theme-color', '#F9C846');
    // Update theme-color meta tag for browser UI
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#F9C846');
    }
  }
};

export const COLORS = {
  primary: {
    light: 'var(--chain-primary)',
    main: 'var(--chain-primary)',
    dark: 'var(--chain-secondary)',
    contrastText: 'var(--text-primary)'
  },
  secondary: {
    light: 'var(--text-primary)',
    main: 'var(--chain-primary)',
    dark: 'var(--chain-secondary)',
    contrastText: 'var(--text-primary)'
  },
  background: {
    default: 'var(--chain-bg)',
    paper: 'var(--chain-bg)',
    accent: 'var(--chain-primary)'
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    disabled: 'var(--text-disabled)'
  },
  error: {
    main: 'var(--error-main)',
    dark: '#dc2626',
    contrastText: 'var(--text-primary)'
  },
  success: {
    main: 'var(--success-main)',
    dark: '#16a34a',
    contrastText: 'var(--text-primary)'
  },
  monad: {
    green: 'var(--monad-green)',
    darkGreen: 'var(--monad-dark-green)',
    bg: 'var(--monad-bg)',
    purple: 'var(--monad-purple)'
  },
  fuse: {
    gold: 'var(--fuse-gold)',
    blue: 'var(--fuse-blue)',
    darkBlue: 'var(--fuse-dark-blue)',
    bg: 'var(--fuse-bg)'
  }
}

export const FONTS = {
  primary: 'Inter, sans-serif',
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
}

export const SPACING = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
}

export const BORDER_RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px'
}

export const TRANSITIONS = {
  default: 'all 0.2s ease-in-out'
}

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  green: '0 4px 14px 0 rgba(74, 222, 128, 0.3)',
  gold: '0 4px 14px 0 rgba(249, 200, 70, 0.3)'
} 