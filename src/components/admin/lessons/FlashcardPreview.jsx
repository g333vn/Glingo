// src/components/admin/lessons/FlashcardPreview.jsx
// 🎴 Flashcard Preview Component - Interactive flip card preview

import React, { useState } from 'react';

/**
 * FlashcardPreview Component
 * Shows an interactive flip card with example SRS content
 * 
 * @param {object} sampleCard - Sample flashcard data { front, back, reading, example }
 * @param {function} onTest - Callback khi test "Good" button (for stats demo)
 */
function FlashcardPreview({ sampleCard, onTest }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [testResult, setTestResult] = useState(null); // 'again' | 'hard' | 'good' | 'easy'
  
  // Default sample data
  const defaultSample = {
    front: '食べる',
    back: 'Ăn (to eat)',
    reading: 'たべる',
    example: 'りんごを食べます',
    exampleTranslation: 'Tôi ăn táo'
  };
  
  const card = sampleCard || defaultSample;
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setTestResult(null);
  };
  
  const handleTest = (result) => {
    setTestResult(result);
    if (onTest) {
      onTest(result);
    }
    // Auto-flip back after 1s
    setTimeout(() => {
      setIsFlipped(false);
      setTestResult(null);
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      {/* ========== Flip Card ========== */}
      <div 
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-64 transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Side */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center justify-center">
              <div className="text-6xl font-black text-white mb-4">
                {card.front}
              </div>
              {card.reading && (
                <div className="text-2xl text-blue-100 font-semibold">
                  {card.reading}
                </div>
              )}
              <div className="absolute bottom-4 text-sm text-blue-100 font-bold">
                👆 Click để lật thẻ
              </div>
            </div>
          </div>
          
          {/* Back Side */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center justify-center">
              <div className="text-3xl font-black text-white mb-4 text-center">
                {card.back}
              </div>
              {card.example && (
                <div className="mt-4 p-3 bg-white/20 rounded-lg border-2 border-white/30 backdrop-blur">
                  <p className="text-lg text-white font-semibold">
                    {card.example}
                  </p>
                  {card.exampleTranslation && (
                    <p className="text-sm text-purple-100 mt-1">
                      {card.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
              <div className="absolute bottom-4 text-sm text-purple-100 font-bold">
                👆 Click để lật lại
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ========== SRS Test Buttons (Anki-style) ========== */}
      {isFlipped && !testResult && (
        <div className="grid grid-cols-4 gap-2 animate-fade-in">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTest('again');
            }}
            className="px-3 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black text-xs transition-all"
          >
            <div>❌ Again</div>
            <div className="text-[10px] font-normal">&lt;1m</div>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTest('hard');
            }}
            className="px-3 py-2 bg-yellow-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black text-xs transition-all"
          >
            <div>😅 Hard</div>
            <div className="text-[10px] font-normal">1d</div>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTest('good');
            }}
            className="px-3 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black text-xs transition-all"
          >
            <div>✅ Good</div>
            <div className="text-[10px] font-normal">3d</div>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTest('easy');
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black text-xs transition-all"
          >
            <div>😎 Easy</div>
            <div className="text-[10px] font-normal">7d</div>
          </button>
        </div>
      )}
      
      {/* ========== Test Result Feedback ========== */}
      {testResult && (
        <div className={`p-4 rounded-lg border-[3px] border-black text-center font-black animate-bounce ${
          testResult === 'again' ? 'bg-red-100 text-red-900' :
          testResult === 'hard' ? 'bg-yellow-100 text-yellow-900' :
          testResult === 'good' ? 'bg-green-100 text-green-900' :
          'bg-blue-100 text-blue-900'
        }`}>
          {testResult === 'again' && '❌ Sẽ xem lại trong <1 phút'}
          {testResult === 'hard' && '😅 Sẽ xem lại sau 1 ngày'}
          {testResult === 'good' && '✅ Sẽ xem lại sau 3 ngày'}
          {testResult === 'easy' && '😎 Sẽ xem lại sau 7 ngày'}
        </div>
      )}
      
      {/* ========== Instructions ========== */}
      <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <p className="text-sm font-bold text-blue-900 mb-2">💡 Cách hoạt động:</p>
        <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
          <li><strong>Click thẻ</strong> để lật xem nghĩa</li>
          <li><strong>4 nút test:</strong> Again/Hard/Good/Easy (giống Anki)</li>
          <li><strong>SM-2 Algorithm:</strong> Tự động tính interval dựa trên độ khó</li>
          <li><strong>Retention tracking:</strong> Thống kê tỷ lệ nhớ theo thời gian</li>
          <li><strong>Phase 2:</strong> Sẽ có card editor để thêm thẻ thực tế</li>
        </ul>
      </div>
    </div>
  );
}

export default FlashcardPreview;

