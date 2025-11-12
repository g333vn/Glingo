// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx'; 
import Footer from './components/Footer.jsx'; 
import LoginModal from './components/LoginModal.jsx';

// ✅ EXISTING: Import DictionaryProvider
import { DictionaryProvider } from './components/api_translate/index.js';

// ✅ NEW: Import JLPT Dictionary initialization
import { initJLPTDictionary } from './services/api_translate/dictionaryService.js';

const backgroundImageUrl = '/background/main.jpg';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleOpenLoginModal = () => { setShowLoginModal(true); };
  const handleCloseLoginModal = () => { setShowLoginModal(false); };

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
    // ✅ EXISTING: Wrap với DictionaryProvider
    <DictionaryProvider>
      <div className="flex flex-col min-h-screen relative">
        <div
          className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center -z-10"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
        
        <Header onUserIconClick={handleOpenLoginModal} />

        <main className="flex-1 relative pt-6 pb-12">
          <div className="relative z-0 flex justify-center items-start px-4">
            <div className="w-full max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>

        <Footer />

        {showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
      </div>
    </DictionaryProvider>
  );
}

export default App;