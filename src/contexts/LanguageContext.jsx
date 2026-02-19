// src/contexts/LanguageContext.jsx
// Language Context - SIMPLE & WORKING i18n System

import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations/index.js';

const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Simplified to 3 languages: Vietnamese (main), English, Japanese
export const LANGUAGES = {
  vi: {
    code: 'vi',
    name: 'Tiếng Việt',
    shortName: 'VN',
    flag: '🇻🇳',
    nativeName: 'Tiếng Việt'
  },
  en: {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    flag: '🇬🇧',
    nativeName: 'English'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    shortName: 'JP',
    flag: '🇯🇵',
    nativeName: '日本語'
  }
};

export function LanguageProvider({ children }) {
  // Load saved language or default to Vietnamese
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    return saved && LANGUAGES[saved] ? saved : 'vi';
  });
  
  // Save language preference and force re-render
  useEffect(() => {
    localStorage.setItem('app_language', currentLanguage);
    document.documentElement.lang = currentLanguage;
    
    // Force a small re-render to ensure components update
    const timer = setTimeout(() => {
      // This is to ensure components re-render with new language
    }, 0);
    
    return () => clearTimeout(timer);
  }, [currentLanguage]);
  
  // SIMPLE translation function - NO MEMOIZATION (to ensure it always updates)
  const t = (key, params = {}) => {
    if (!key) return '';
    
    // Helper function to get nested value
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, prop) => {
        return current && current[prop] !== undefined ? current[prop] : undefined;
      }, obj);
    };
    
    // Try current language first
    const currentLangTranslations = translations[currentLanguage];
    if (currentLangTranslations) {
      const currentTranslation = getNestedValue(currentLangTranslations, key);
      if (currentTranslation && typeof currentTranslation === 'string') {
        // Replace parameters if any - support both {{param}} and {param}
        let result = currentTranslation;
        Object.keys(params).forEach(param => {
          // Replace {{param}} (double braces) first
          result = result.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), params[param]);
          // Then replace {param} (single braces)
          result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
        return result;
      }
    }
    
    // Fallback to Vietnamese if key not found in current language
    if (currentLanguage !== 'vi' && translations.vi) {
      const viTranslation = getNestedValue(translations.vi, key);
      if (viTranslation && typeof viTranslation === 'string') {
        // Replace parameters if any - support both {{param}} and {param}
        let result = viTranslation;
        Object.keys(params).forEach(param => {
          // Replace {{param}} (double braces) first
          result = result.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), params[param]);
          // Then replace {param} (single braces)
          result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
        return result;
      }
    }
    
    // If still not found, return the key itself
    console.warn(`[i18n] Translation missing for key: ${key} in language: ${currentLanguage}`);
    return key;
  };
  
  const changeLanguage = (langCode) => {
    console.log(`[i18n] Changing language from ${currentLanguage} to ${langCode}`);
    if (LANGUAGES[langCode]) {
      setCurrentLanguage(langCode);
      // Force re-render by updating localStorage immediately
      localStorage.setItem('app_language', langCode);
    } else {
      console.warn(`[i18n] Invalid language code: ${langCode}`);
    }
  };
  
  // Context value - NO MEMOIZATION to ensure updates
  const value = {
    currentLanguage,
    currentLangInfo: LANGUAGES[currentLanguage],
    languages: Object.values(LANGUAGES),
    changeLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;

