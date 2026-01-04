import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSettings, loadSettingsFromSupabase } from '../utils/settingsManager.js';
import { subscribeToAppSettings } from '../services/appSettingsService.js';

function HomePage() {
  const { t, currentLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    const handleSettingsUpdate = (event) => setSettings(event.detail);
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    const loadInitialSettings = async () => {
      try { const loadedSettings = await loadSettingsFromSupabase(); setSettings(loadedSettings); }
      catch (error) { setSettings(getSettings()); }
    };
    loadInitialSettings();
    const unsubscribe = subscribeToAppSettings(async (updatedAppSettings) => {
      if (updatedAppSettings?.system_settings || updatedAppSettings?.user_settings) {
        try { const loadedSettings = await loadSettingsFromSupabase(); setSettings(loadedSettings); }
        catch (error) { setSettings(getSettings()); }
      }
    });
    return () => { window.removeEventListener('settingsUpdated', handleSettingsUpdate); unsubscribe(); };
  }, []);

  useEffect(() => { setSettings(getSettings()); }, [currentLanguage]);

  // Texture giấy Washi (Noise nhẹ)
  const paperTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-20 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden max-w-6xl border-2 border-white/50 relative z-0">
        <section className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 py-12 md:px-12 md:py-24">
            <div className="text-center">
              <div className="flex justify-center mb-8 min-h-[128px] md:min-h-[192px]">
                <img src="/logo/main.webp" alt="Learn Your Approach Logo" width={192} height={192} className="h-32 md:h-48 w-auto object-contain drop-shadow-2xl animate-float" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient drop-shadow-lg">Learn Your Approach</h1>
              
              <p className="text-xl md:text-2xl text-gray-800 mb-12 font-bold drop-shadow">
                {(() => {
                  const desc = settings?.system?.platformDescription;
                  if (typeof desc === 'object' && desc !== null) return desc[currentLanguage] || desc.vi || desc.en || desc.ja || t('home.tagline');
                  else if (typeof desc === 'string' && desc.trim()) return desc;
                  return t('home.tagline');
                })()}
              </p>

              <div className={`flex flex-col sm:flex-row gap-6 justify-center items-stretch mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <a href="/level" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden w-full sm:w-[280px]">
                  <span className="text-2xl relative z-10">📚</span>
                  <span className="relative z-10 text-center">{t('home.startLearning')}<br /><span className="text-sm font-normal opacity-90">{t('home.startLearningSubtitle')}</span></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                <a href="/jlpt" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden border-2 border-white/30 w-full sm:w-[280px]">
                  <span className="text-2xl relative z-10">📝</span>
                  <span className="relative z-10 text-center">{t('home.practiceJLPT')}<br /><span className="text-sm font-normal opacity-90">{t('home.practiceJLPTSubtitle')}</span></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>

              {/* === UPGRADED ARTISTIC CONCEPT: "PREMIUM ARTISAN WASHI" === */}
              <div className={`mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative inline-block my-4">
                  <a
                    href="/about"
                    className="group relative inline-flex items-center gap-4 px-10 py-3.5 bg-transparent transition-all duration-500 transform hover:scale-[1.02]"
                  >
                    {/* 1. Nét vẽ tay viền xung quanh (Hand-drawn Border) - Đổi sang màu Stone/Sepia ấm áp */}
                    <div className="absolute inset-0 border-[2.5px] border-stone-700/80 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] group-hover:border-orange-700 transition-colors duration-500 pointer-events-none" style={{ filter: 'url(#rough-edges)' }}></div>
                    
                    {/* 2. Lớp nền giấy Washi với Texture */}
                    <div 
                        className="absolute inset-[2px] bg-orange-50/80 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] -z-10 group-hover:bg-orange-100 transition-all duration-500 shadow-sm group-hover:shadow-md"
                        style={{ backgroundImage: paperTexture }}
                    ></div>

                    {/* 3. Dấu triện đỏ (Premium Hankō) - Đậm hơn, sắc nét hơn */}
                    <div className="flex items-center justify-center w-7 h-7 border-2 border-red-700 bg-red-50 rounded-sm rotate-6 group-hover:rotate-12 transition-transform duration-500 shadow-sm">
                        <span className="text-sm text-red-800 font-serif font-bold leading-none mt-0.5">私</span>
                    </div>

                    {/* 4. Text: Font Serif màu nâu mực tàu (Warm Ink) */}
                    <span className="font-serif text-xl italic text-stone-800 group-hover:text-orange-900 transition-colors duration-300 tracking-wide">
                      {t('home.myStory')}
                    </span>
                  </a>
                  
                  {/* SVG Filter để tạo nét vẽ sần sùi tự nhiên (Ẩn) */}
                  <svg width="0" height="0">
                    <filter id="rough-edges">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                    </filter>
                  </svg>
                </div>
              </div>
              {/* === END UPGRADED ARTISTIC CONCEPT === */}

              <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-yellow-300">
                  <div className="text-4xl mb-3">📝</div><h3 className="font-bold text-gray-900 text-lg">{t('home.jlptTests')}</h3><p className="text-sm text-gray-700">{t('home.jlptTestsDesc')}</p>
                </div>
                <div className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-300">
                  <div className="text-4xl mb-3">📚</div><h3 className="font-bold text-gray-900 text-lg">{t('home.comprehensiveContent')}</h3><p className="text-sm text-gray-700">{t('home.comprehensiveContentDesc')}</p>
                </div>
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-300">
                  <div className="text-4xl mb-3">🎴</div><h3 className="font-bold text-gray-900 text-lg">{t('home.smartFlashcards')}</h3><p className="text-sm text-gray-700">{t('home.smartFlashcardsDesc')}</p>
                </div>
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-300">
                  <div className="text-4xl mb-3">🔥</div><h3 className="font-bold text-gray-900 text-lg">{t('home.studyStreak')}</h3><p className="text-sm text-gray-700">{t('home.studyStreakDesc')}</p>
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