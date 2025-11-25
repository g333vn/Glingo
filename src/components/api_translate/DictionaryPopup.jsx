// src/components/api_translate/DictionaryPopup.jsx
// Popup hiển thị nghĩa từ

import React, { useEffect, useRef } from 'react';
import { useDictionary } from './DictionaryContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function DictionaryPopup() {
  const {
    showPopup,
    result,
    isLoading,
    currentWord,
    popupPosition,
    closePopup,
    saveWord,
    isWordSaved,
    savedWords
  } = useDictionary();
  const { t } = useLanguage();

  const popupRef = useRef(null);
  const contentRef = useRef(null);

  // ✅ IMPROVED: Quản lý scroll - chỉ prevent body scroll khi scroll trong popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        // Đảm bảo unlock body scroll khi đóng popup
        document.body.style.overflow = '';
      };
    }
  }, [showPopup, closePopup]);

  // Đóng popup khi nhấn Escape
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closePopup();
      }
    }

    if (showPopup) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showPopup, closePopup]);

  if (!showPopup) return null;

  // Tính toán vị trí popup (tránh tràn màn hình) - center trên màn nhỏ
  const calculatePosition = () => {
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 20;

    // Small screens: center the popup
    if (window.innerWidth < 640) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    let x = popupPosition.x;
    let y = popupPosition.y + 20; // Offset xuống dưới cursor

    // Nếu tràn phải
    if (x + 400 > maxWidth) {
      x = maxWidth - 400;
    }

    // Nếu tràn dưới
    if (y + 300 > maxHeight) {
      y = popupPosition.y - 320; // Hiển thị phía trên cursor
    }

    return { left: `${x}px`, top: `${y}px` };
  };

  const position = calculatePosition();
  // Ensure safe-area on iOS when centered
  if (position.transform) {
    position.left = 'calc(env(safe-area-inset-left) + 50%)';
    position.top = 'calc(env(safe-area-inset-top) + 50%)';
  }

  // Xử lý lưu từ
  const handleSave = () => {
    if (result && result.success) {
      const saveResult = saveWord(result);
      if (saveResult.success) {
        // ✅ Không cần alert nữa, UI đã tự update
        // savedWords sẽ được update tự động qua DictionaryContext
      } else {
        alert(`⚠️ ${saveResult.message}`);
      }
    }
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-[90vw] sm:w-[380px] max-w-sm max-h-[500px] overflow-hidden"
      style={{ ...position, overscrollBehavior: 'contain' }}
      onTouchMove={(e) => { e.stopPropagation(); }}
    >
      {/* ✅ Header - NEO BRUTALISM DESIGN */}
      <div className="bg-yellow-400 text-black px-4 py-3 flex items-center justify-between border-b-[4px] border-black">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black border-[2px] border-black flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-black text-lg uppercase tracking-wide">📖 {t('dictionary.title')}</h3>
        </div>
        <button
          onClick={closePopup}
          className="w-8 h-8 rounded-full bg-black text-yellow-400 hover:bg-gray-800 border-[2px] border-black flex items-center justify-center transition-all duration-200 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          title={t('dictionary.close')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="overflow-y-auto max-h-[420px] p-4"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        onWheel={(e) => {
          // ✅ IMPROVED: Chỉ prevent body scroll khi scroll trong popup
          const content = contentRef.current;
          if (!content) return;

          const { scrollTop, scrollHeight, clientHeight } = content;
          const isAtTop = scrollTop <= 1; // Cho phép một chút tolerance
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
          const isScrollingDown = e.deltaY > 0;
          const isScrollingUp = e.deltaY < 0;

          // Nếu scroll đến đầu/cuối và tiếp tục scroll theo hướng đó, cho phép scroll body
          if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
            // Cho phép scroll body (không prevent)
            document.body.style.overflow = '';
            return;
          }

          // Nếu đang scroll trong popup (chưa đến đầu/cuối), prevent body scroll
          e.stopPropagation();
          e.preventDefault();
          
          // Scroll trong popup
          const scrollAmount = e.deltaY;
          content.scrollTop += scrollAmount;
        }}
        onTouchMove={(e) => {
          // Prevent body scroll khi touch trong popup
          e.stopPropagation();
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-black border-t-yellow-400 mb-3"></div>
            <p className="text-black font-black text-sm uppercase">{t('dictionary.loading')}</p>
          </div>
        ) : result ? (
          result.success ? (
            <div>
              {/* Từ tra cứu - NEO BRUTALISM */}
              <div className="mb-4 pb-3 border-b-[3px] border-black">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-black text-black uppercase">{currentWord}</h4>
                  <button
                    onClick={handleSave}
                    disabled={isWordSaved(currentWord)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-black uppercase transition-all duration-200 border-[3px] border-black ${
                      isWordSaved(currentWord)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-400'
                        : 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                    }`}
                  >
                    {isWordSaved(currentWord) ? `✓ ${t('dictionary.saved')}` : `⭐ ${t('dictionary.save')}`}
                  </button>
                </div>
                
                {/* Hiển thị các dạng đọc - NEO BRUTALISM */}
                {result.readings && result.readings.length > 0 && (
                  <div className="space-y-2">
                    {result.readings.map((reading, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {reading.word && (
                          <span className="font-black text-lg text-black">{reading.word}</span>
                        )}
                        {reading.reading && (
                          <span className="text-black bg-yellow-100 px-2 py-1 rounded-lg font-black border-[2px] border-black">
                            【{reading.reading}】
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags - NEO BRUTALISM */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.isCommon && (
                    <span className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-black uppercase border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {t('dictionary.common')}
                    </span>
                  )}
                  {result.jlpt && result.jlpt.length > 0 && (
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-black uppercase border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {result.jlpt[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Nghĩa - NEO BRUTALISM */}
              {result.meanings && result.meanings.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-black text-black uppercase tracking-wide flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black border-[2px] border-black flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {t('dictionary.meaning')}:
                  </h5>
                  {result.meanings.map((meaning, idx) => (
                    <div key={idx} className="pl-3 border-l-[4px] border-black bg-yellow-50/50 rounded-r-lg p-3">
                      {/* Từ loại - NEO BRUTALISM */}
                      {meaning.vietnamesePartOfSpeech && meaning.vietnamesePartOfSpeech.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meaning.vietnamesePartOfSpeech.map((pos, i) => (
                            <span key={i} className="text-xs bg-purple-500 text-white px-2 py-1 rounded-lg font-black uppercase border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {pos}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ✅ UPDATED: Ưu tiên nghĩa tiếng Việt */}
                      {meaning.vietnamese && meaning.vietnamese.length > 0 && (
                        <div className="mb-2">
                          <span className="font-black text-lg text-black">
                            {idx + 1}. {meaning.vietnamese.join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Nghĩa tiếng Anh (phụ, nhỏ hơn) */}
                      {meaning.english && meaning.english.length > 0 && (
                        <div className="text-sm text-gray-500 italic mb-1">
                          EN: {meaning.english.join(', ')}
                        </div>
                      )}

                      {/* Thông tin bổ sung */}
                      {meaning.info && meaning.info.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          💡 {meaning.info.join('; ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-black border-[4px] border-black mx-auto mb-3 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-black font-black uppercase mb-1">{result.message}</p>
              <p className="text-gray-600 text-sm font-bold">{t('dictionary.notFound')}</p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-black font-black uppercase">{t('dictionary.selectWord')}</p>
          </div>
        )}
      </div>

      {/* ✅ Footer - NEO BRUTALISM */}
      <div className="bg-yellow-400 text-black px-4 py-2 border-t-[4px] border-black flex items-center justify-center text-xs font-black uppercase">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black border-[1px] border-black flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>{t('dictionary.doubleClickToLookup')}</span>
        </div>
      </div>
    </div>
  );
}

export default DictionaryPopup;
