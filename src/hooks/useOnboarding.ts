import { useState, useEffect, useCallback, useRef } from 'react'
import {
  OnboardingStep,
  OnboardingState,
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_STORAGE_KEY
} from '../constants/onboarding'
import { getProfileByAddress } from '../utils/profile'
import { Address } from 'viem'

const WALLET_CHECK_TIMEOUT = 3000 // 3 seconds
const MAX_RETRIES = 3

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return stored ? JSON.parse(stored) : INITIAL_ONBOARDING_STATE
  })
  
  const retryCount = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Effect to check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      
      if (!window.ethereum) {
        console.log('❌ No ethereum provider found')
        return
      }

      try {
        // Set timeout for wallet check
        const timeoutPromise = new Promise((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error('Wallet check timeout'))
          }, WALLET_CHECK_TIMEOUT)
        })

        // Race between wallet check and timeout
        const accounts = await Promise.race([
          window.ethereum.request({ method: 'eth_accounts' }),
          timeoutPromise
        ]) as string[]

        clearTimeout(timeoutRef.current)
        
        const isConnected = accounts && accounts.length > 0
        const address = isConnected ? accounts[0] : undefined
        const chainId = isConnected ? 
          await window.ethereum.request({ method: 'eth_chainId' }) : undefined


        if (isConnected && address) {
          
          // Check for existing profile
          const profile = await getProfileByAddress(address as Address, chainId as number)

          setState(prev => ({
            ...prev,
            walletAddress: address,
            chainId: chainId ? parseInt(chainId as string) : undefined,
            currentStep: profile ? OnboardingStep.COMPLETED : OnboardingStep.PROFILE_CREATION,
            isCompleted: !!profile,
            profileId: profile?.tokenId
          }))

          // Update wallet data atomically
          const walletData = { 
            isConnected, 
            address, 
            chainId,
            profileId: profile?.tokenId 
          }
          localStorage.setItem('wallet_data', JSON.stringify(walletData))
          
          retryCount.current = 0 // Reset retry count on success
        } else {
          throw new Error('No wallet connected')
        }
      } catch (error) {
        console.error('❌ Error checking wallet connection:', error)
        
        // Clear timeout if it exists
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Retry logic
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current++
          setTimeout(checkWalletConnection, 1000) // Retry after 1 second
        } else {
          console.log('❌ Max retries reached, resetting to initial state')
          setState(prev => ({
            ...prev,
            walletAddress: undefined,
            chainId: undefined,
            currentStep: OnboardingStep.WALLET_CONNECTION
          }))
        }
      }
    }

    checkWalletConnection()

    // Listen for account and chain changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWalletConnection)
      window.ethereum.on('chainChanged', checkWalletConnection)
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        window.ethereum.removeListener('accountsChanged', checkWalletConnection)
        window.ethereum.removeListener('chainChanged', checkWalletConnection)
      }
    }
  }, []) // Empty dependency array since we want this to run only on mount

  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getCurrentStep = useCallback((): OnboardingStep => {
    
    // Check wallet data from localStorage to ensure sync
    const walletData = localStorage.getItem('wallet_data')
    const { isConnected, address, profileId } = walletData ? JSON.parse(walletData) : {}
    
    if (!isConnected || !address) {
      return OnboardingStep.WALLET_CONNECTION
    }
    
    if (!profileId) {
      return OnboardingStep.PROFILE_CREATION
    }
    
    if (!state.isCompleted) {
      return OnboardingStep.FOLLOW_SUGGESTIONS
    }
    
    return OnboardingStep.COMPLETED
  }, [state])

  const updateWalletInfo = useCallback(async (walletAddress: string, chainId: number) => {
    
    // Check for existing profile
    const profile = await getProfileByAddress(walletAddress as Address, chainId as number)

    setState(prev => ({
      ...prev,
      walletAddress,
      chainId,
      currentStep: profile ? OnboardingStep.COMPLETED : OnboardingStep.PROFILE_CREATION,
      isCompleted: !!profile,
      profileId: profile?.tokenId
    }))
    
    localStorage.setItem('wallet_data', JSON.stringify({
      isConnected: true,
      address: walletAddress,
      chainId,
      profileId: profile?.tokenId
    }))
  }, [])

  const clearWalletInfo = useCallback(() => {
    setState(INITIAL_ONBOARDING_STATE)
    localStorage.removeItem('wallet_data')
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  }, [])

  const updateProfileId = useCallback((profileId: string) => {
    setState(prev => ({
      ...prev,
      profileId,
      currentStep: OnboardingStep.FOLLOW_SUGGESTIONS
    }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: OnboardingStep.COMPLETED,
      isCompleted: true
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setState(INITIAL_ONBOARDING_STATE)
    localStorage.removeItem('wallet_data')
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  }, [])

  return {
    ...state,
    getCurrentStep,
    updateWalletInfo,
    clearWalletInfo,
    updateProfileId,
    completeOnboarding,
    resetOnboarding
  }
} 