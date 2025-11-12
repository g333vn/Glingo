// src/components/api_translate/DictionaryPopup.jsx
// Popup hiển thị nghĩa từ

import React, { useEffect, useRef } from 'react';
import { useDictionary } from './DictionaryContext.jsx';

function DictionaryPopup() {
  const {
    showPopup,
    result,
    isLoading,
    currentWord,
    popupPosition,
    closePopup,
    saveWord,
    isWordSaved
  } = useDictionary();

  const popupRef = useRef(null);

  // Đóng popup khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    }

    if (showPopup) {
      // Lock body scroll while popup is open (mobile Safari friendly)
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = previousOverflow || '';
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
        alert('✅ Đã lưu từ vào danh sách của bạn!');
      } else {
        alert(`⚠️ ${saveResult.message}`);
      }
    }
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 border-blue-400 w-[90vw] sm:w-[380px] max-w-sm max-h-[500px] overflow-hidden"
      style={{ ...position, overscrollBehavior: 'contain' }}
      onTouchMove={(e) => { e.stopPropagation(); }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="font-bold text-lg">辞書 Dictionary</h3>
        </div>
        <button
          onClick={closePopup}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto max-h-[420px] p-4"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => { e.stopPropagation(); }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-600 text-sm">Đang tra từ...</p>
          </div>
        ) : result ? (
          result.success ? (
            <div>
              {/* Từ tra cứu */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-bold text-gray-800">{currentWord}</h4>
                  <button
                    onClick={handleSave}
                    disabled={isWordSaved(currentWord)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                      isWordSaved(currentWord)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
                    }`}
                  >
                    {isWordSaved(currentWord) ? '✓ Đã lưu' : '⭐ Lưu từ'}
                  </button>
                </div>
                
                {/* Hiển thị các dạng đọc */}
                {result.readings && result.readings.length > 0 && (
                  <div className="space-y-1">
                    {result.readings.map((reading, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {reading.word && (
                          <span className="font-bold text-lg text-gray-800">{reading.word}</span>
                        )}
                        {reading.reading && (
                          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            【{reading.reading}】
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.isCommon && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Thông dụng
                    </span>
                  )}
                  {result.jlpt && result.jlpt.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {result.jlpt[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Nghĩa */}
              {result.meanings && result.meanings.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Nghĩa:
                  </h5>
                  {result.meanings.map((meaning, idx) => (
                    <div key={idx} className="pl-3 border-l-3 border-blue-300">
                      {/* Từ loại */}
                      {meaning.vietnamesePartOfSpeech && meaning.vietnamesePartOfSpeech.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {meaning.vietnamesePartOfSpeech.map((pos, i) => (
                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              {pos}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ✅ UPDATED: Ưu tiên nghĩa tiếng Việt */}
                      {meaning.vietnamese && meaning.vietnamese.length > 0 && (
                        <div className="mb-2">
                          <span className="font-bold text-lg text-blue-600">
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
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-semibold mb-1">{result.message}</p>
              <p className="text-gray-500 text-sm">Thử từ khác nhé!</p>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Chọn từ để tra cứu</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Double-click từ để tra</span>
        </div>
        <span className="text-gray-400">Powered by Jisho.org</span>
      </div>
    </div>
  );
}

export default DictionaryPopup;
