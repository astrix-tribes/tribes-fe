export const STORAGE_KEYS = {
  AUTH: 'tribes_auth',
  PROFILE: 'tribes_profile',
  FOLLOWERS: 'tribes_followers',
  ONBOARDING: 'tribes_onboarding'
} as const;

export interface AuthData {
  address: string | null;
  isConnected: boolean;
}

export interface ProfileData {
  username: string;
  avatarUrl: string;
  avatarNFT: string;
  avatarTokenId: number;
}

export interface OnboardingState {
  hasSkippedFollowing: boolean;
  currentStep: number;
  username?: string;
  avatarUrl?: string;
}

// Auth Storage
export const getAuthData = (): AuthData => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH);
  return data ? JSON.parse(data) : { address: null, isConnected: false };
};

export const saveAuthData = (data: AuthData): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data));
};

// Profile Storage
export const getProfileData = (): ProfileData | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveProfileData = (data: ProfileData): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
};

// Followers Storage
export const getFollowers = (): string[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FOLLOWERS);
  return data ? JSON.parse(data) : [];
};

export const saveFollowers = (followers: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.FOLLOWERS, JSON.stringify(followers));
};

export const hasMinimumFollows = (): boolean => {
  const followers = getFollowers();
  return followers.length >= 3;
};

// Onboarding Storage
export const getOnboardingState = (): OnboardingState => {
  const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
  return data ? JSON.parse(data) : {
    hasSkippedFollowing: false,
    currentStep: 0
  };
};

export const saveOnboardingState = (state: OnboardingState): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(state));
};

export const clearOnboardingState = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
}; 