import React, { useEffect } from 'react';
import { ProfileForm } from '../components/profile/ProfileForm';
import { Navigation } from '../components/Navigation';

export function UsernameAvatarSetup() {
  // Add protection to prevent unwanted navigation cycles
  useEffect(() => {
    console.log('[UsernameAvatarSetup] Component mounted');
    // Mark that we're on this page, so profile checks won't navigate away
    window.localStorage.setItem('on_profile_setup_page', 'true');
    
    return () => {
      console.log('[UsernameAvatarSetup] Component unmounting');
      window.localStorage.removeItem('on_profile_setup_page');
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navigation onMenuClick={() => {}} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <ProfileForm mode="create" />
        </div>
      </div>
    </div>
  );
} 