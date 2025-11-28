// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx'; 
import Footer from './components/Footer.jsx'; 
import LoginModal from './components/LoginModal.jsx';

// ✅ NOTE: Providers are now in main.jsx, not here
// Import useAuth hook (AuthProvider is in main.jsx)
import { useAuth } from './contexts/AuthContext.jsx';

// ✅ NEW: Import JLPT Dictionary initialization
import { initJLPTDictionary } from './services/api_translate/dictionaryService.js';
// Supabase dev helper
import { testSupabaseConnection } from './services/authService.js';
// Global app settings (maintenance)
import { getGlobalMaintenanceMode } from './services/appSettingsService.js';

// ✅ NOTE: ToastProvider is now in main.jsx

// ✅ NEW: Import GlobalSearch
import GlobalSearch from './components/GlobalSearch.jsx';

// Maintenance
import MaintenancePage from './pages/MaintenancePage.jsx';
import { getSettings } from './utils/settingsManager.js';
import { initDebugConsoleFilter } from './utils/debugLogger.js';

const backgroundImageUrl = '/background/main.jpg';

// Inner app content that can use hooks like useAuth
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [globalMaintenance, setGlobalMaintenance] = useState(null);

  const isAdmin = user && user.role === 'admin';
  const localMaintenance = settings?.system?.maintenanceMode;
  // Ưu tiên maintenance global từ Supabase; nếu null thì fallback local
  const effectiveMaintenance =
    globalMaintenance === null ? localMaintenance : globalMaintenance;
  const isLoginRoute = location.pathname.startsWith('/login');
  // Show maintenance page for all non-admin users except on login route
  const showMaintenanceForUser = effectiveMaintenance && !isAdmin && !isLoginRoute;
  
  const handleOpenLoginModal = () => { setShowLoginModal(true); };
  const handleCloseLoginModal = () => { setShowLoginModal(false); };
  
  // Listen for settings changes (from Settings page)
  useEffect(() => {
    // Initialize debug console filter once
    initDebugConsoleFilter();

    const handler = (event) => {
      if (event?.detail) {
        setSettings(event.detail);
      } else {
        setSettings(getSettings());
      }
    };
    window.addEventListener('settingsUpdated', handler);
    return () => window.removeEventListener('settingsUpdated', handler);
  }, []);

  // ✅ Preload background image for better performance
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImageUrl;
    img.onload = () => {
      setBackgroundLoaded(true);
      console.log('✅ Background image loaded');
    };
    img.onerror = () => {
      setBackgroundLoaded(true); // Still set to true to show app
      console.warn('⚠️ Background image failed to load');
    };
  }, []);

  // ✅ NEW: Load JLPT Dictionary on app start (one-time)
  useEffect(() => {
    console.log('🚀 [App] Loading JLPT Dictionary...');
    
    initJLPTDictionary()
      .then(() => {
        console.log('✅ [App] JLPT Dictionary loaded successfully - 8,292 words!');
      })
      .catch((error) => {
        console.error('❌ [App] Failed to load JLPT Dictionary:', error);
      });
  }, []); // Empty deps array = run once on mount

  // ✅ NEW: Load global maintenance flag từ Supabase
  useEffect(() => {
    async function fetchMaintenance() {
      const { success, maintenance } = await getGlobalMaintenanceMode();
      if (success) {
        setGlobalMaintenance(maintenance);
        console.log('[App][Maintenance] Global maintenance_mode =', maintenance);
      }
    }
    fetchMaintenance();

    // Optional: poll lại mỗi 60s để bắt trạng thái mới từ Supabase UI
    const interval = setInterval(fetchMaintenance, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ DEV ONLY: Test Supabase connection on app start
  useEffect(() => {
    if (import.meta.env.DEV) {
      testSupabaseConnection();
    }
  }, []);

  return (
          <div className="flex flex-col min-h-screen relative overflow-x-hidden">
          {/* ✅ OPTIMIZED: bg-scroll + conditional loading for performance - Cover screen, prioritize showing important parts */}
          <div
            className={`absolute inset-0 w-full h-full bg-scroll -z-10 transition-opacity duration-500 ${
              backgroundLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              backgroundImage: backgroundLoaded ? `url(${backgroundImageUrl})` : 'none',
              backgroundColor: '#f5f5dc', // Fallback color (beige)
              backgroundSize: 'cover', // Cover entire screen (priority 1)
              backgroundPosition: 'center 25%', // Show the wave part (important area) while covering screen
              backgroundRepeat: 'no-repeat',
              willChange: 'auto', // Prevent GPU layer on scroll
              backgroundAttachment: 'scroll', // Explicit scroll for mobile
              transform: 'translateZ(0)', // Force GPU acceleration only for background
              backfaceVisibility: 'hidden' // Reduce flickering
            }}
          />
          
          {/* Subtle overlay to ensure content readability */}
          <div 
            className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/5 -z-10 pointer-events-none"
            style={{ mixBlendMode: 'normal' }}
          />
          
          <Header onUserIconClick={handleOpenLoginModal} isMaintenanceLock={showMaintenanceForUser} />

          <main className="flex-1 relative pt-20 md:pt-24 pb-12 overflow-x-hidden">
            {showMaintenanceForUser ? (
              <MaintenancePage />
            ) : (
              <div className="relative z-0 flex justify-center items-start px-3 sm:px-4">
                <div className="w-full max-w-7xl mx-auto">
                  <Outlet />
                </div>
              </div>
            )}
          </main>

          <Footer />

          {showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
          
          {/* Global Search */}
          <GlobalSearch />
          </div>
  );
}

// ✅ FIX: Providers are now in main.jsx wrapping RouterProvider
// App component no longer needs to provide contexts
function App() {
  return <AppContent />;
}

export default App;