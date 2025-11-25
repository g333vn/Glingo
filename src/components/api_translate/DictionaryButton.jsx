// src/components/api_translate/DictionaryButton.jsx
// REDESIGNED VERSION - Beautiful Tooltips with Perfect Arrows

import React, { useEffect, useState } from 'react';
import { useDictionary } from './DictionaryContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import SavedWordsDrawer from './SavedWordsDrawer.jsx';

function DictionaryButton() {
  const { isEnabled, toggleDictionary, savedWords } = useDictionary();
  const { t } = useLanguage();
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);
  const [hintStep, setHintStep] = useState(1); // 1: Chưa bật, 2: Đã bật
  const [showSavedWordsDrawer, setShowSavedWordsDrawer] = useState(false);

  useEffect(() => {
    // ✅ IMPROVED: Check if user has seen the hint before
    const hasSeenHint = localStorage.getItem('dictionary-hint-seen');
    if (!hasSeenHint) {
      // Hiển thị tooltip ngay từ đầu (khi chưa bật)
      setShowFirstTimeHint(true);
      setHintStep(1);
      
      // Auto-hide sau 12 giây (tăng từ 8 giây)
      const timer = setTimeout(() => {
        setShowFirstTimeHint(false);
        localStorage.setItem('dictionary-hint-seen', 'true');
      }, 12000);
      
      return () => clearTimeout(timer);
    }
  }, []); // ✅ FIXED: Không phụ thuộc vào isEnabled

  // ✅ NEW: Cập nhật hint khi user bật chức năng
  useEffect(() => {
    if (showFirstTimeHint && isEnabled && hintStep === 1) {
      // Chuyển sang bước 2 khi user bật
      setHintStep(2);
      // Reset timer để hiển thị thêm 10 giây nữa
      setTimeout(() => {
        setShowFirstTimeHint(false);
        localStorage.setItem('dictionary-hint-seen', 'true');
      }, 10000);
    }
  }, [isEnabled, showFirstTimeHint, hintStep]);

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
      {/* Main Button - ✨ NEO BRUTALISM DESIGN - HIGH CTA POSITION */}
      <button
        onClick={toggleDictionary}
        className={`fixed top-32 md:top-36 lg:top-40 right-6 z-[60] group transition-all duration-200 ${
          isEnabled
            ? 'bg-yellow-400 text-black'
            : 'bg-green-500 text-white'
        } rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] animate-pulse`}
        title={isEnabled ? t('dictionary.turnOff') : t('dictionary.turnOn')}
      >
        {/* Button Content - ✨ NEO BRUTALISM */}
        <div className="relative px-4 py-3 flex items-center gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full border-[3px] border-black flex items-center justify-center ${
            isEnabled ? 'bg-black' : 'bg-white'
          }`}>
            <svg className={`w-7 h-7 ${isEnabled ? 'text-yellow-400' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-start">
            <span className="font-black text-base uppercase tracking-wider">
              {isEnabled ? t('dictionary.enabled').toUpperCase() : t('dictionary.turnOn').toUpperCase()}
            </span>
            <span className={`font-black opacity-100 ${isEnabled ? 'text-xs' : 'text-xs'}`}>
              {isEnabled ? (
                <>
                  <span className="text-green-600">✓</span> {t('dictionary.doubleClickWord')}
                </>
              ) : (
                <>
                  {t('dictionary.clickToEnable')} → {t('dictionary.thenDoubleClick')}
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

      {/* ✅ NEW: Saved Words Button */}
      {savedWords.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSavedWordsDrawer(true);
          }}
          className="fixed top-48 md:top-52 lg:top-56 right-6 z-[60] transition-all duration-200 bg-blue-500 text-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
          title={t('dictionary.viewSavedWords')}
        >
          <div className="relative px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border-[2px] border-black flex items-center justify-center">
              <span className="text-lg">📚</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black text-xs uppercase tracking-wide">
                {t('dictionary.savedWords').toUpperCase()}
              </span>
              <span className="text-xs font-black">
                {savedWords.length} {savedWords.length === 1 ? t('dictionary.word') : t('dictionary.words')}
              </span>
            </div>
            {/* Badge số lượng */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-black border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-black">{savedWords.length}</span>
            </div>
          </div>
        </button>
      )}

      {/* ✅ NEW: Saved Words Drawer */}
      <SavedWordsDrawer
        isOpen={showSavedWordsDrawer}
        onClose={() => setShowSavedWordsDrawer(false)}
      />

      {/* ✅ IMPROVED: First-Time Hint Popup - Hiển thị 2 bước rõ ràng */}
      {showFirstTimeHint && (
        <div className="fixed top-40 md:top-44 lg:top-48 right-6 z-[60] animate-slide-in">
          <div className="relative">
            {/* Main Tooltip Card - ✨ NEO BRUTALISM */}
            <div className="relative bg-yellow-400 text-black p-5 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm">
              
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-[2px] border-black flex items-center justify-center">
                  <span className="text-xl">💡</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-wide mb-3">Hướng dẫn sử dụng</h4>
                  
                  {/* ✅ NEW: Tooltip 2 bước */}
                  {hintStep === 1 ? (
                    // Bước 1: Chưa bật
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-lg p-3 border-[2px] border-black">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-500 text-white text-xs font-black px-2 py-1 rounded border-[2px] border-black">{t('dictionary.step1')}</span>
                          <span className="text-xs font-black text-black">{t('dictionary.enableFeature')}</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-black">
                          {t('dictionary.clickButton')} <span className="bg-green-500 text-white px-1 rounded">"{t('dictionary.turnOn').toUpperCase()}"</span>
                        </p>
                      </div>
                      
                      <div className="bg-white/50 rounded-lg p-3 border-[2px] border-black opacity-60">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gray-400 text-white text-xs font-black px-2 py-1 rounded border-[2px] border-black">{t('dictionary.step2')}</span>
                          <span className="text-xs font-black text-gray-600">{t('dictionary.doubleClickToTranslate')}</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-gray-600">
                          {t('dictionary.thenDoubleClick')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Bước 2: Đã bật
                    <div className="space-y-3">
                      <div className="bg-green-100 rounded-lg p-3 border-[2px] border-green-600">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-green-600 text-white text-xs font-black px-2 py-1 rounded border-[2px] border-black">✓ {t('dictionary.completed')}</span>
                          <span className="text-xs font-black text-green-800">{t('dictionary.enabledMessage')}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 rounded-lg p-3 border-[2px] border-black animate-pulse">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-500 text-white text-xs font-black px-2 py-1 rounded border-[2px] border-black">{t('dictionary.step2')}</span>
                          <span className="text-xs font-black text-black">{t('dictionary.doubleClickToTranslate')}!</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-black mb-2">
                          {t('dictionary.doubleClickWord')} (JP-VI-EN)
                        </p>
                        <div className="flex items-center gap-2 text-xs bg-blue-100 rounded px-2 py-1 border-[2px] border-blue-500">
                          <span className="text-base">👆</span>
                          <span className="text-black font-black">{t('dictionary.tryNow')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={() => {
                    setShowFirstTimeHint(false);
                    localStorage.setItem('dictionary-hint-seen', 'true');
                  }}
                  className="flex-shrink-0 text-black hover:bg-black hover:text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 text-xl leading-none font-black border-[2px] border-black"
                  title="Đóng hướng dẫn"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Arrow Pointer - ✨ NEO BRUTALISM */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-4px] z-20">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-yellow-400"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-black mt-[-18px]"></div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default DictionaryButton;