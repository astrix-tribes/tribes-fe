import React from 'react'
import { useNetwork } from '../hooks/useNetwork'
import { useOnboarding } from '../hooks/useOnboarding'
import { OnboardingStep, STEP_TITLES } from '../constants/onboarding'

export const OnboardingHeader: React.FC = () => {
  const { chainId, isCorrectNetwork } = useNetwork()
  const { currentStep, walletAddress } = useOnboarding()

  const formatAddress = (address?: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const renderStepIndicator = () => {
    const steps = [
      OnboardingStep.WALLET_CONNECTION,
      OnboardingStep.PROFILE_CREATION,
      OnboardingStep.FOLLOW_SUGGESTIONS
    ]

    const currentStepIndex = steps.indexOf(currentStep)

    return (
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index <= currentStepIndex
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 ${
                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {STEP_TITLES[currentStep]}
            </h1>
            {walletAddress && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span>{formatAddress(walletAddress)}</span>
              </div>
            )}
          </div>
          <div className="hidden sm:block">{renderStepIndicator()}</div>
        </div>
      </div>
    </header>
  )
} 