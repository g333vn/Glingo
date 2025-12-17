// src/components/Footer.jsx - ✨ NEO BRUTALISM + JAPANESE AESTHETIC
import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSettings, loadSettingsFromSupabase } from '../utils/settingsManager.js';
import { subscribeToAppSettings } from '../services/appSettingsService.js';

function Footer() {
  const { t, currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    // Listen for settings updates (localStorage events + Supabase real-time)
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
        console.warn('[Footer] Error loading from Supabase, using localStorage:', error);
        const currentSettings = getSettings();
        setSettings(currentSettings);
      }
    };
    
    loadInitialSettings();

    // ✅ Subscribe to Supabase real-time changes
    const unsubscribe = subscribeToAppSettings(async (updatedAppSettings) => {
      // When app_settings is updated (system_settings or user_settings), reload from Supabase
      if (updatedAppSettings?.system_settings || updatedAppSettings?.user_settings) {
        console.log('[Footer] 🔄 Real-time update detected, reloading settings from Supabase...');
        try {
          const loadedSettings = await loadSettingsFromSupabase();
          setSettings(loadedSettings);
        } catch (error) {
          console.warn('[Footer] ⚠️ Error reloading settings from Supabase:', error);
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
    <footer className="relative overflow-hidden mt-0">
      {/* ✨ NEO BRUTALISM FOOTER */}
      <div className="bg-[#2D2D2D] border-t-[4px] border-black relative">
        
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Brand Section - NEO BRUTALISM */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3 group">
                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1 group-hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                  <img
                    src="/logo/main.png"
                    alt="Learn Your Approach Logo"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <span className="font-black text-lg text-white transition-colors duration-200 group-hover:text-yellow-400" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                  {settings.system.platformName}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed font-medium">
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
            </div>

            {/* Quick Links - NEO BRUTALISM */}
            <div className="text-center">
              <h3 className="text-white font-black text-lg mb-4 flex items-center justify-center gap-2 uppercase tracking-wide">
                <span className="text-xl">📚</span>
                <span>{t('footer.quickLinks')}</span>
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/" 
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm font-black group"
                  >
                    <span className="text-base">🏠</span>
                    <span>{t('common.home')}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/level" 
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm font-black group"
                  >
                    <span className="text-base">📖</span>
                    <span>{t('home.levelSystem')}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/jlpt" 
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm font-black group"
                  >
                    <span className="text-base">📝</span>
                    <span>{t('home.practiceJLPT')}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/about" 
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm font-black group"
                  >
                    <span className="text-base">💫</span>
                    <span>{t('common.aboutMe')}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Social - NEO BRUTALISM */}
            <div className="text-center md:text-right">
              <h3 className="text-white font-black text-lg mb-4 flex items-center justify-center md:justify-end gap-2 uppercase tracking-wide">
                <span className="text-xl">📧</span>
                <span>{t('footer.contact')}</span>
              </h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${settings.system.contactEmail}`}
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm font-black group"
                >
                  <span className="text-base">✉️</span>
                  <span className="text-xs">{settings.system.contactEmail}</span>
                </a>
                
                <div className="flex items-center justify-center md:justify-end gap-2 text-sm">
                  <span className="text-gray-300 text-base">🌐</span>
                  <a 
                    href="https://hocJLPTonline.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
                  >
                    hocJLPTonline.com
                  </a>
                </div>

                {/* Social Media - NEO BRUTALISM BUTTONS */}
                <div className="flex items-center justify-center md:justify-end gap-3 mt-4">
                  <button 
                    className="p-2 text-gray-300 hover:text-black hover:bg-yellow-400 rounded-lg border-[3px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
                    aria-label="Facebook"
                    title="Coming soon"
                  >
                    <Facebook size={20} />
                  </button>
                  <button 
                    className="p-2 text-gray-300 hover:text-black hover:bg-yellow-400 rounded-lg border-[3px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
                    aria-label="Instagram"
                    title="Coming soon"
                  >
                    <Instagram size={20} />
                  </button>
                  <button 
                    className="p-2 text-gray-300 hover:text-black hover:bg-yellow-400 rounded-lg border-[3px] border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
                    aria-label="Line"
                    title="Coming soon"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider - NEO BRUTALISM */}
          <div className="relative mb-6">
            <div className="border-t-[3px] border-black"></div>
          </div>

          {/* Bottom Section - NEO BRUTALISM */}
          <div className="flex flex-col items-center gap-4">
            {/* Row 1: Legal Links */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <a 
                href="/terms" 
                className="text-gray-400 hover:text-yellow-400 transition-colors font-medium"
              >
                {t('footer.terms')}
              </a>
              <span className="text-gray-600">|</span>
              <a 
                href="/privacy" 
                className="text-gray-400 hover:text-yellow-400 transition-colors font-medium"
              >
                {t('footer.privacy')}
              </a>
            </div>
            
            {/* Row 2: Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full">
              <p className="text-gray-400 text-xs sm:text-sm text-center font-bold">
                © {currentYear} {settings.system.platformName} (Glingo). {t('footer.copyright')}.
              </p>
            </div>

            {/* Row 2: Japanese Quote - NEO BRUTALISM CARD */}
            <div className="relative group">
              <div className="relative text-center px-6 py-3 rounded-lg bg-white/10 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]">
                <p className="text-gray-300 text-sm font-bold italic" style={{ fontFamily: "'Kaisei Decol', 'Yuji Syuku', 'Noto Serif JP', serif" }}>
                  "天は人の上に人を造らず人の下に人を造らず"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Import Japanese fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;500;700&family=Yuji+Syuku&family=Noto+Serif+JP:wght@400;500;600&display=swap" rel="stylesheet" />
    </footer>
  );
}

export default Footer;
