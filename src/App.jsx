// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx'; 
import Footer from './components/Footer.jsx'; 
import LoginModal from './components/LoginModal.jsx';

// ✅ EXISTING: Import DictionaryProvider
import { DictionaryProvider } from './components/api_translate/index.js';

// ✅ NEW: Import AuthProvider
import { AuthProvider } from './contexts/AuthContext.jsx';

// ✅ NEW: Import LanguageProvider
import { LanguageProvider } from './contexts/LanguageContext.jsx';

// ✅ NEW: Import JLPT Dictionary initialization
import { initJLPTDictionary } from './services/api_translate/dictionaryService.js';

// ✅ NEW: Import ToastProvider
import { ToastProvider } from './components/ToastNotification.jsx';

// ✅ NEW: Import GlobalSearch
import GlobalSearch from './components/GlobalSearch.jsx';

const backgroundImageUrl = '/background/main.jpg';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  const handleOpenLoginModal = () => { setShowLoginModal(true); };
  const handleCloseLoginModal = () => { setShowLoginModal(false); };
  
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

  return (
    // ✅ NEW: Wrap với AuthProvider (outermost)
    <AuthProvider>
      {/* ✅ NEW: Wrap với LanguageProvider */}
      <LanguageProvider>
        {/* ✅ NEW: Wrap với ToastProvider */}
        <ToastProvider>
          {/* ✅ EXISTING: Wrap với DictionaryProvider */}
          <DictionaryProvider>
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
          
          <Header onUserIconClick={handleOpenLoginModal} />

          <main className="flex-1 relative pt-6 pb-12 overflow-x-hidden">
            <div className="relative z-0 flex justify-center items-start px-3 sm:px-4">
              <div className="w-full max-w-7xl mx-auto">
                <Outlet />
              </div>
            </div>
          </main>

          <Footer />

          {showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
          
          {/* Global Search */}
          <GlobalSearch />
          </div>
          </DictionaryProvider>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;