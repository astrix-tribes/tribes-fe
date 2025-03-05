export enum OnboardingStep {
  WALLET_CONNECTION = 'WALLET_CONNECTION',
  PROFILE_CREATION = 'PROFILE_CREATION',
  FOLLOW_SUGGESTIONS = 'FOLLOW_SUGGESTIONS',
  COMPLETED = 'COMPLETED'
}

export interface OnboardingState {
  currentStep: OnboardingStep
  isCompleted: boolean
  walletAddress?: string
  chainId?: number
  profileId?: string
}

export const ONBOARDING_STORAGE_KEY = 'tribes_onboarding'

export const STEP_TITLES = {
  [OnboardingStep.WALLET_CONNECTION]: 'Connect Wallet',
  [OnboardingStep.PROFILE_CREATION]: 'Create Profile',
  [OnboardingStep.FOLLOW_SUGGESTIONS]: 'Follow Users',
  [OnboardingStep.COMPLETED]: 'Welcome to Tribes'
}

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  currentStep: OnboardingStep.WALLET_CONNECTION,
  isCompleted: false
} 