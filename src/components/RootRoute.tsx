import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { blockchain } from '../utils/blockchainUtils';
import { 
  getAuthData, 
  getOnboardingState, 
  hasMinimumFollows,
  getProfileData
} from '../utils/storage';

const DEBUG = true;
const STORAGE_KEY = 'tribes_auth_state';

// Debug function to track flow
const logDebug = (message: string, data?: any) => {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (data) {
    console.log(`[RootRoute:${timestamp}] ${message}`, data);
  } else {
    console.log(`[RootRoute:${timestamp}] ${message}`);
  }
};

export function RootRoute() {
  const navigate = useNavigate();
  const { isConnected, address } = useAuth();
  const checkInProgress = useRef(false);

  // Track navigation redirects to prevent loops
  const trackRedirect = (path: string) => {
    try {
      const redirects = localStorage.getItem('redirect_attempts') || '{}';
      const attempts = JSON.parse(redirects);
      attempts[path] = (attempts[path] || 0) + 1;
      localStorage.setItem('redirect_attempts', JSON.stringify(attempts));
      
      // If we've redirected to connect more than 5 times, reset auth state
      if (path === '/connect' && attempts[path] > 5) {
        logDebug('Too many redirects to connect page, clearing auth state');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('tribes_auth');
        localStorage.removeItem('tribes_profile');
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error tracking redirects:', e);
      return true;
    }
  };
  
  const safeNavigate = (path: string) => {
    if (trackRedirect(path)) {
      logDebug(`Navigating to ${path}`);
      navigate(path);
    } else {
      logDebug('Navigation blocked to prevent loop');
    }
  };

  useEffect(() => {
    const checkStateAndRedirect = async () => {
      // Prevent multiple simultaneous checks
      if (checkInProgress.current) {
        logDebug('Check already in progress, skipping');
        return;
      }
      
      checkInProgress.current = true;
      logDebug('Starting state check');
      
      try {
        // Check saved auth state first
        const savedAuth = getAuthData();
        logDebug('Auth data from storage', { isConnected: savedAuth.isConnected, hasAddress: !!savedAuth.address });
        
        if (!savedAuth.isConnected || !savedAuth.address) {
          logDebug('No saved auth, redirecting to connect');
          safeNavigate('/connect');
          return;
        }

        // If we have auth but no active connection, let user reconnect
        if (!isConnected || !address) {
          logDebug('No active connection, redirecting to connect');
          safeNavigate('/connect');
          return;
        }

        try {
          // Check if user has a profile
          logDebug('Checking profile for address', { address });
          const result: any = await blockchain.getProfileByAddress(address);
          logDebug('Profile check result', { exists: !!result.profile });
          
          const onboardingState = getOnboardingState();

          // No profile - start onboarding
          if (!result.profile) {
            logDebug('No profile, redirecting to username setup');
            safeNavigate('/username-setup');
            return;
          }

          // Has profile and avatar but hasn't completed follow step
          if (!onboardingState.hasSkippedFollowing && !hasMinimumFollows()) {
            logDebug('Profile exists but onboarding incomplete');
            safeNavigate('/onboarding');
            return;
          }

          // Everything complete - go to dashboard
          logDebug('Profile complete, redirecting to dashboard');
          safeNavigate('/dashboard');
        } catch (error) {
          console.error('Error checking profile:', error);
          logDebug('Error checking profile', { error });
          safeNavigate('/connect');
        }
      } finally {
        checkInProgress.current = false;
      }
    };

    checkStateAndRedirect();
  }, [isConnected, address, navigate]);

  // Return null as this is just a routing component
  logDebug('Rendering null');
  return null;
} 