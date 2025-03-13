import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RootRoute } from './components/RootRoute'
import { WalletConnect } from './components/WalletConnect'
import { UsernameAvatarSetup } from './screens/UsernameAvatarSetup'
import { Dashboard } from './screens/Dashboard'
import { Profile } from './screens/Profile'
import { Tribes } from './screens/Tribes'
import { TribeDetails } from './screens/TribeDetails'
import { CreateTribe } from './screens/CreateTribe'
import { Onboarding } from './screens/Onboarding'
import { TopicDetails } from './screens/TopicDetails'
import { AuthGuard } from './components/AuthGuard'
import { useChainId } from 'wagmi'
import { updateChainColors } from './constants/theme'
import { initializeApp } from './utils/initApp'
import { TribesSDK } from './services/TribesSDK'
import { TribesProvider } from './contexts/TribesContext'
import LoadingScreen from './components/LoadingScreen'

// Lazy load routes
const DashboardLazy = lazy(() => import('./screens/Dashboard'));
// const CreateProfile = lazy(() => import('./screens/CreateProfile'))

const App: React.FC = () => {
  const chainId = useChainId()
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sdk, setSdk] = useState<TribesSDK | null>(null);

  // Update theme colors when chain changes
  useEffect(() => {
    if (chainId) {
      updateChainColors(chainId)
    }
  }, [chainId])

  useEffect(() => {
    // Initialize app services
    const init = async () => {
      try {
        setIsInitializing(true);
        // Initialize app services
        await initializeApp();

        // Initialize TribesSDK
        const tribesSDK = new TribesSDK(chainId);
        await tribesSDK.initialize();
        setSdk(tribesSDK);

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Even if initialization fails, we should still set isInitialized
        // to true so the app can render and show appropriate error states
        setIsInitialized(true);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [chainId]);

  useEffect(() => {
    console.log('App mounted');
    
    // Check for connection issues
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });
    
    return () => {
      window.removeEventListener('error', () => {});
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <TribesProvider sdk={sdk} isInitialized={isInitialized}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/connect" element={<WalletConnect />} />
            <Route path="/create-profile" element={<UsernameAvatarSetup />} />
            <Route path="/username-setup" element={<UsernameAvatarSetup />} />
            
            {/* Protected Routes */}
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
              <Route path="/dashboard" element={<DashboardLazy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tribes" element={<Tribes />} />
              <Route path="/tribes/create" element={<CreateTribe />} />
              <Route path="/tribes/:tribeId" element={<TribeDetails />} />
              <Route path="/tribes/:tribeId/topics/:topicId" element={<TopicDetails />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </TribesProvider>
  )
}

export default App