export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  enhanced: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
};

export const blurs = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const animations = {
  default: {
    duration: 200,
    easing: 'ease-in-out',
  },
  slow: {
    duration: 400,
    easing: 'ease-in-out',
  },
  float: {
    duration: 6000,
    easing: 'ease-in-out',
  },
}; 