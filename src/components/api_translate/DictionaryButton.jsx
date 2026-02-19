// src/components/api_translate/DictionaryButton.jsx
// REDESIGNED VERSION - Beautiful Tooltips with Perfect Arrows

import React, { useEffect, useState } from 'react';
import { useDictionary } from './DictionaryContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import SavedWordsDrawer from './SavedWordsDrawer.jsx';

function DictionaryButton() {
  const { isEnabled, toggleDictionary, savedWords } = useDictionary();
  const { t } = useLanguage();
  const [showSavedWordsDrawer, setShowSavedWordsDrawer] = useState(false);

  useEffect(() => {
    const styleId = 'dictionary-button-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        
        @keyframes bounce-hint {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }
        
        @keyframes click-demo {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.9);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes highlight-pulse {
          0%, 100% {
            background-color: rgba(59, 130, 246, 0.1);
          }
          50% {
            background-color: rgba(59, 130, 246, 0.3);
          }
        }
        
        .animate-highlight-pulse {
          animation: highlight-pulse 2s ease-in-out infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce-hint {
          animation: bounce-hint 2s ease-in-out infinite;
        }
        
        .animate-click-demo {
          animation: click-demo 1s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      {/* Main Button - NEO BRUTALISM DESIGN - HIGH CTA POSITION */}
      <button
        onClick={toggleDictionary}
        className={`fixed top-32 md:top-36 lg:top-40 right-2 sm:right-4 md:right-6 z-[60] group transition-all duration-200 max-w-[calc(100vw-1rem)] sm:max-w-none ${
          isEnabled
            ? 'bg-yellow-400 text-black'
            : 'bg-green-500 text-white'
        } rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] animate-pulse`}
        title={isEnabled ? t('dictionary.turnOff') : t('dictionary.turnOn')}
      >
        {/* Button Content - NEO BRUTALISM */}
        <div className="relative px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-black flex items-center justify-center ${
            isEnabled ? 'bg-black' : 'bg-white'
          }`}>
            <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${isEnabled ? 'text-yellow-400' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="font-black text-xs sm:text-sm md:text-base uppercase tracking-wider break-words leading-tight">
              {isEnabled ? t('dictionary.enabled').toUpperCase() : t('dictionary.turnOn').toUpperCase()}
            </span>
            <span className={`font-black opacity-100 text-[10px] sm:text-xs leading-tight break-words`}>
              {isEnabled ? (
                <>
                  <span className="text-green-600">✓</span> {t('dictionary.doubleClickWord')}
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{t('dictionary.clickToEnable')} → </span>
                  <span>{t('dictionary.thenDoubleClick')}</span>
                </>
              )}
            </span>
          </div>

          {/* Status Indicator - Always visible when ON */}
          {isEnabled && (
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-500 border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {/* NEW Badge - High CTA */}
          {!isEnabled && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
              NEW!
            </div>
          )}
        </div>
      </button>

      {/* NEW: Saved Words Button */}
      {savedWords.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSavedWordsDrawer(true);
          }}
          className="fixed top-48 md:top-52 lg:top-56 right-2 sm:right-4 md:right-6 z-[60] transition-all duration-200 bg-blue-500 text-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] max-w-[calc(100vw-1rem)] sm:max-w-none"
          title={t('dictionary.viewSavedWords')}
        >
          <div className="relative px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-[2px] border-black flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg">📚</span>
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-black text-[10px] sm:text-xs uppercase tracking-wide break-words leading-tight">
                {t('dictionary.savedWords').toUpperCase()}
              </span>
              <span className="text-[10px] sm:text-xs font-black leading-tight">
                {savedWords.length} {savedWords.length === 1 ? t('dictionary.word') : t('dictionary.words')}
              </span>
            </div>
            {/* Badge số lượng */}
            <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 text-black border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <span className="text-[10px] sm:text-xs font-black">{savedWords.length}</span>
            </div>
          </div>
        </button>
      )}

      {/* NEW: Saved Words Drawer */}
      <SavedWordsDrawer
        isOpen={showSavedWordsDrawer}
        onClose={() => setShowSavedWordsDrawer(false)}
      />

    </>
  );
}

export default DictionaryButton;