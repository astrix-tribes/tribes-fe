import React from 'react'
import { Navigate } from 'react-router-dom'
import { OnboardingStep } from '../constants/onboarding'
import { useOnboarding } from '../hooks/useOnboarding'
import { Navigation } from '../components/Navigation'
import { WalletConnect } from '../components/WalletConnect'
import { ProfileCreation } from './ProfileCreation'
import { FollowSuggestions } from '../components/FollowSuggestions'

export const Onboarding: React.FC = () => {
  const { getCurrentStep } = useOnboarding()
  const currentStep = getCurrentStep()

  // If onboarding is completed, redirect to dashboard
  if (currentStep === OnboardingStep.COMPLETED) {
    return <Navigate to="/dashboard" replace />
  }

  // Render the appropriate component based on current step
  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.WALLET_CONNECTION:
        return <WalletConnect />
      case OnboardingStep.PROFILE_CREATION:
        return <ProfileCreation />
      case OnboardingStep.FOLLOW_SUGGESTIONS:
        return <FollowSuggestions />
      default:
        return null
    }
  }

  return (
    <>
      <style>
        {`
          body {
            background-color: #111827;
            min-height: 100vh;
            margin: 0;
          }
        `}
      </style>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black">
        <Navigation onMenuClick={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full">
            {renderStep()}
          </div>
        </main>
      </div>
    </>
  )
} 