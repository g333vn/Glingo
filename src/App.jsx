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
// Global app settings (maintenance)
import { getGlobalMaintenanceMode } from './services/appSettingsService.js';
// Access control sync
import { getAccessControlFromSupabase, subscribeToAccessControl } from './services/accessControlService.js';

// ✅ NOTE: ToastProvider is now in main.jsx

// ✅ NEW: Import GlobalSearch
import GlobalSearch from './components/GlobalSearch.jsx';

// ✅ NEW: Import Vercel Speed Insights
import { SpeedInsights } from '@vercel/speed-insights/react';
// ✅ NEW: Import Vercel Web Analytics
import { Analytics } from '@vercel/analytics/react';

// Maintenance
import MaintenancePage from './pages/MaintenancePage.jsx';
import { getSettings } from './utils/settingsManager.js';
import { initDebugConsoleFilter } from './utils/debugLogger.js';

// 🔒 SECURITY: Secure storage initialization
import { initSecureStorage } from './utils/secureUserStorage.js';

const backgroundImageUrl = '/background/main.webp';

// Inner app content that can use hooks like useAuth
function AppContent() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [globalMaintenance, setGlobalMaintenance] = useState(null);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false); // ✅ NEW: Track if maintenance check is complete
  const [accessControlLoaded, setAccessControlLoaded] = useState(false); // ✅ NEW: Track if access control is loaded from Supabase

  // Get role from profile (role is in profile, not user)
  const userRole = profile?.role || user?.role;
  const isAdmin = userRole === 'admin';
  const localMaintenance = settings?.system?.maintenanceMode;
  
  // ✅ FIXED: Priority: globalMaintenance > localMaintenance
  // If globalMaintenance is null (still loading), use localMaintenance as fallback
  // If globalMaintenance is false but localMaintenance is true, use localMaintenance (sync issue)
  const effectiveMaintenance =
    globalMaintenance !== null ? globalMaintenance : localMaintenance;
  
  const isLoginRoute = location.pathname.startsWith('/login');
  
  // ✅ FIXED: Show maintenance page only if:
  // 1. Maintenance is enabled (either global or local)
  // 2. User is not admin
  // 3. Not on login route
  const showMaintenanceForUser = effectiveMaintenance && !isAdmin && !isLoginRoute;

  // ✅ DEBUG: Log maintenance state
  useEffect(() => {
    console.log('[App][Maintenance] State:', {
      globalMaintenance,
      localMaintenance,
      effectiveMaintenance,
      isAdmin,
      userRole,
      isLoginRoute,
      showMaintenanceForUser,
      maintenanceChecked
    });
  }, [globalMaintenance, localMaintenance, effectiveMaintenance, isAdmin, userRole, isLoginRoute, showMaintenanceForUser, maintenanceChecked]);

  const handleOpenLoginModal = () => { setShowLoginModal(true); };
  const handleCloseLoginModal = () => { setShowLoginModal(false); };

  // Listen for settings changes (from Settings page)
  useEffect(() => {
    // Initialize debug console filter once
    initDebugConsoleFilter();
    
    // 🔒 SECURITY: Initialize secure storage (migrate passwords, etc.)
    initSecureStorage();

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

  // ✅ FIXED: Load global maintenance flag từ Supabase
  useEffect(() => {
    async function fetchMaintenance() {
      const { success, maintenance } = await getGlobalMaintenanceMode();
      if (success) {
        setGlobalMaintenance(maintenance);
        setMaintenanceChecked(true); // ✅ Mark as checked
        console.log('[App][Maintenance] Global maintenance_mode =', maintenance);
      } else {
        // ✅ If fetch fails, still mark as checked to use local maintenance
        setMaintenanceChecked(true);
        console.warn('[App][Maintenance] Failed to fetch global maintenance, using local:', localMaintenance);
      }
    }
    
    // ✅ Fetch immediately on mount
    fetchMaintenance();

    // ✅ Poll lại mỗi 30s để bắt trạng thái mới từ Supabase (reduced from 60s for faster updates)
    const interval = setInterval(fetchMaintenance, 30000);
    return () => clearInterval(interval);
  }, []); // Empty deps - only run on mount

  // ✅ NEW: Load and sync access control from Supabase on app start
  useEffect(() => {
    async function loadAccessControl() {
      try {
        console.log('[App] 🔄 Loading access control from Supabase...');
        const { success, data } = await getAccessControlFromSupabase();
        if (success && data) {
          console.log('[App] ✅ Loaded access control from Supabase:', {
            levelConfigs: Object.keys(data.levelConfigs || {}).length,
            jlptConfigs: Object.keys(data.jlptConfigs || {}).length,
            levelModule: data.levelModuleConfig,
            jlptModule: data.jlptModuleConfig
          });
          
          // ✅ CRITICAL: Sync to localStorage FIRST before marking as loaded
          if (data.levelConfigs) {
            localStorage.setItem('levelAccessControl', JSON.stringify(data.levelConfigs));
            console.log('[App] ✅ Synced levelConfigs to localStorage');
          }
          if (data.jlptConfigs) {
            localStorage.setItem('jlptAccessControl', JSON.stringify(data.jlptConfigs));
            console.log('[App] ✅ Synced jlptConfigs to localStorage');
          }
          if (data.levelModuleConfig) {
            localStorage.setItem('levelModuleAccessControl', JSON.stringify(data.levelModuleConfig));
            console.log('[App] ✅ Synced levelModuleConfig to localStorage:', data.levelModuleConfig);
          }
          if (data.jlptModuleConfig) {
            localStorage.setItem('jlptModuleAccessControl', JSON.stringify(data.jlptModuleConfig));
            console.log('[App] ✅ Synced jlptModuleConfig to localStorage:', data.jlptModuleConfig);
          }
          
          // ✅ Mark as loaded AFTER syncing to localStorage
          setAccessControlLoaded(true);
          
          // Dispatch event to notify components
          window.dispatchEvent(new CustomEvent('accessControlUpdated', { 
            detail: data 
          }));
        } else {
          console.warn('[App] ⚠️ Failed to load access control from Supabase, using localStorage');
          // Still mark as loaded to allow app to continue
          setAccessControlLoaded(true);
        }
      } catch (error) {
        console.error('[App] ❌ Error loading access control from Supabase:', error);
        // Still mark as loaded to allow app to continue
        setAccessControlLoaded(true);
      }
    }
    
    // Load immediately on mount
    loadAccessControl();

    // ✅ Subscribe to real-time changes
    const unsubscribe = subscribeToAccessControl((updatedData) => {
      console.log('[App] 🔄 Access control updated via real-time subscription');
      
      // Sync to localStorage
      if (updatedData.levelConfigs) {
        localStorage.setItem('levelAccessControl', JSON.stringify(updatedData.levelConfigs));
      }
      if (updatedData.jlptConfigs) {
        localStorage.setItem('jlptAccessControl', JSON.stringify(updatedData.jlptConfigs));
      }
      if (updatedData.levelModuleConfig) {
        localStorage.setItem('levelModuleAccessControl', JSON.stringify(updatedData.levelModuleConfig));
      }
      if (updatedData.jlptModuleConfig) {
        localStorage.setItem('jlptModuleAccessControl', JSON.stringify(updatedData.jlptModuleConfig));
      }
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('accessControlUpdated', { 
        detail: updatedData 
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []); // Empty deps - only run on mount

  // ✅ NEW: Re-check maintenance when route changes (to catch route navigation)
  useEffect(() => {
    if (maintenanceChecked) {
      async function recheckMaintenance() {
        const { success, maintenance } = await getGlobalMaintenanceMode();
        if (success) {
          setGlobalMaintenance(maintenance);
          console.log('[App][Maintenance] Re-checked on route change, maintenance_mode =', maintenance);
        }
      }
      recheckMaintenance();
    }
  }, [location.pathname, maintenanceChecked]);



  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* ✅ OPTIMIZED: bg-scroll + conditional loading for performance - Cover screen, prioritize showing important parts */}
      <div
        className={`absolute inset-0 w-full h-full bg-scroll -z-10 transition-opacity duration-500 ${backgroundLoaded ? 'opacity-100' : 'opacity-0'
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
        {/* ✅ FIXED: Show loading while checking maintenance, then show maintenance page or content */}
        {!maintenanceChecked && !isLoginRoute ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang kiểm tra hệ thống...</p>
            </div>
          </div>
        ) : showMaintenanceForUser ? (
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

      {/* Vercel Speed Insights - Performance monitoring */}
      <SpeedInsights />
      
      {/* Vercel Web Analytics - Visitor and page view tracking */}
      <Analytics />
    </div>
  );
}

// ✅ FIX: Providers are now in main.jsx wrapping RouterProvider
// App component no longer needs to provide contexts
function App() {
  return <AppContent />;
}

export default App;