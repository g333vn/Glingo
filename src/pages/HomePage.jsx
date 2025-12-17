import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSettings, loadSettingsFromSupabase } from '../utils/settingsManager.js';
import { subscribeToAppSettings } from '../services/appSettingsService.js';

function HomePage() {
  const { t, currentLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Listen for settings updates (localStorage events + Supabase real-time)
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      setSettings(event.detail);
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    // ✅ Load from Supabase on mount to get latest data
    const loadInitialSettings = async () => {
      try {
        const loadedSettings = await loadSettingsFromSupabase();
        setSettings(loadedSettings);
      } catch (error) {
        console.warn('[HomePage] Error loading from Supabase, using localStorage:', error);
        const currentSettings = getSettings();
        setSettings(currentSettings);
      }
    };
    
    loadInitialSettings();

    // ✅ Subscribe to Supabase real-time changes
    const unsubscribe = subscribeToAppSettings(async (updatedAppSettings) => {
      // When app_settings is updated (system_settings or user_settings), reload from Supabase
      if (updatedAppSettings?.system_settings || updatedAppSettings?.user_settings) {
        console.log('[HomePage] 🔄 Real-time update detected, reloading settings from Supabase...');
        try {
          const loadedSettings = await loadSettingsFromSupabase();
          setSettings(loadedSettings);
        } catch (error) {
          console.warn('[HomePage] ⚠️ Error reloading settings from Supabase:', error);
          // Fallback to current settings
          const currentSettings = getSettings();
          setSettings(currentSettings);
        }
      }
    });
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      unsubscribe();
    };
  }, []);

  // Re-render when language changes to update platformDescription
  useEffect(() => {
    // Force re-render by updating settings (this will trigger re-render with new currentLanguage)
    const currentSettings = getSettings();
    setSettings(currentSettings);
  }, [currentLanguage]);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-20 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* MAIN CONTAINER */}
      <div className="mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden max-w-6xl border-2 border-white/50 relative z-0">
        <section className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 py-12 md:px-12 md:py-24">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <img
                  src="/logo/main.webp"
                  alt="Learn Your Approach Logo"
                  width={192}
                  height={192}
                  className="h-32 md:h-48 w-auto object-contain drop-shadow-2xl animate-float"
                />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                Learn Your Approach
              </h1>

              <p className="text-xl md:text-2xl text-gray-800 mb-12 font-bold drop-shadow">
                {(() => {
                  const desc = settings?.system?.platformDescription;
                  if (typeof desc === 'object' && desc !== null) {
                    // New format: object with vi, en, ja
                    // Priority: currentLanguage -> vi -> en -> ja -> fallback
                    const text = desc[currentLanguage] || desc.vi || desc.en || desc.ja;
                    return text || t('home.tagline');
                  } else if (typeof desc === 'string' && desc.trim()) {
                    // Old format: string (backward compatibility)
                    return desc;
                  }
                  return t('home.tagline');
                })()}
              </p>

              <div className={`flex flex-col sm:flex-row gap-6 justify-center items-stretch mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <a
                  href="/level"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden w-full sm:w-[280px]"
                >
                  <span className="text-2xl relative z-10">📚</span>
                  <span className="relative z-10 text-center">
                    {t('home.startLearning')}
                    <br />
                    <span className="text-sm font-normal opacity-90">{t('home.startLearningSubtitle')}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>

                <a
                  href="/jlpt"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden border-2 border-white/30 w-full sm:w-[280px]"
                >
                  <span className="text-2xl relative z-10">📝</span>
                  <span className="relative z-10 text-center">
                    {t('home.practiceJLPT')}
                    <br />
                    <span className="text-sm font-normal opacity-90">{t('home.practiceJLPTSubtitle')}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>

              <div className={`mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full blur-lg opacity-30 animate-pulseGlow"></div>
                  
                  <a
                    href="/about"
                    className="relative group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white via-gray-50 to-white text-transparent bg-clip-text border-2 border-transparent rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #a855f7, #ec4899, #ef4444)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm -z-10"></div>
                    
                    <span className="text-2xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 filter drop-shadow-lg">
                      💫
                    </span>
                    
                    <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-700 group-hover:to-red-700 transition-all duration-300">
                      {t('home.myStory')}
                    </span>
                    
                    <span className="text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300">
                      →
                    </span>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  </a>

                  <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse pointer-events-none">✨</div>
                  <div className="absolute -bottom-2 -left-2 text-pink-400 text-xl animate-pulse animation-delay-500 pointer-events-none">✨</div>
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* 1. JLPT Tests */}
                <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-yellow-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">📝</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.jlptTests')}</h3>
                  <p className="text-sm text-gray-700 font-medium">{t('home.jlptTestsDesc')}</p>
                </div>

                {/* 2. Comprehensive Content */}
                <div className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">📚</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.comprehensiveContent')}</h3>
                  <p className="text-sm text-gray-700 font-medium">{t('home.comprehensiveContentDesc')}</p>
                </div>

                {/* 3. Smart Flashcards */}
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">🎴</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.smartFlashcards')}</h3>
                  <p className="text-sm text-gray-700 font-medium">{t('home.smartFlashcardsDesc')}</p>
                </div>

                {/* 4. Study Streak */}
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">🔥</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.studyStreak')}</h3>
                  <p className="text-sm text-gray-700 font-medium">{t('home.studyStreakDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulseGlow"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulseGlow animation-delay-1000"></div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;