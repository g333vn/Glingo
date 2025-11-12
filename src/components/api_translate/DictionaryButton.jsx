// src/components/api_translate/DictionaryButton.jsx
// REDESIGNED VERSION - Beautiful Tooltips with Perfect Arrows

import React, { useEffect, useState } from 'react';
import { useDictionary } from './DictionaryContext.jsx';

function DictionaryButton() {
  const { isEnabled, toggleDictionary } = useDictionary();
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);

  useEffect(() => {
    // Check if user has seen the hint before
    const hasSeenHint = localStorage.getItem('dictionary-hint-seen');
    if (!hasSeenHint && isEnabled) {
      setShowFirstTimeHint(true);
      setTimeout(() => {
        setShowFirstTimeHint(false);
        localStorage.setItem('dictionary-hint-seen', 'true');
      }, 8000); // Hide after 8 seconds
    }
  }, [isEnabled]);

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
      {/* Main Button - Compact for Mobile, Expanded for Desktop */}
      <button
        onClick={toggleDictionary}
        className={`fixed top-20 right-6 z-40 group transition-all duration-300 transform hover:scale-105 ${
          isEnabled
            ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:from-green-600 hover:via-emerald-600 hover:to-teal-600'
            : 'bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white hover:from-gray-700 hover:via-gray-800 hover:to-gray-900'
        } rounded-2xl shadow-2xl`}
        style={{
          boxShadow: isEnabled 
            ? '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)' 
            : '0 10px 40px rgba(75, 85, 99, 0.4)'
        }}
        title={isEnabled ? 'Nhấn để tắt tra từ' : 'Nhấn để bật tra từ'}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Pulse Ring Effect when ON */}
        {isEnabled && (
          <div className="absolute inset-0 rounded-2xl animate-pulse-ring"></div>
        )}

        {/* Button Content */}
        <div className="relative z-10 px-4 py-3 flex items-center gap-3">
          {/* Icon with Glow */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-md ${
              isEnabled ? 'bg-green-300 opacity-70 animate-click-demo' : 'bg-gray-400 opacity-40'
            }`}></div>
            
            <svg className="w-7 h-7 relative z-10 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            
            {/* Active Indicator */}
            {isEnabled && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400 shadow-lg"></span>
              </span>
            )}
          </div>

          {/* Text Content - Always Visible */}
          <div className="flex flex-col items-start">
            {/* Status Label */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide">
                TRA TỪ
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isEnabled 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-gray-300'
              }`}>
                {isEnabled ? 'BẬT' : 'TẮT'}
              </span>
            </div>
            
            {/* Instruction - Always Visible */}
            <span className="text-[10px] md:text-xs font-medium opacity-90 mt-0.5 leading-tight">
              {isEnabled ? (
                <span className="text-green-100">
                  ✓ Double-click từ
                </span>
              ) : (
                <span className="text-gray-300">
                  Nhấn để kích hoạt
                </span>
              )}
            </span>
          </div>

          {/* NEW Badge */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg animate-bounce-hint">
            MỚI
          </div>
        </div>
      </button>

      {/* First-Time Hint Popup - BEAUTIFUL REDESIGN */}
      {showFirstTimeHint && isEnabled && (
        <div className="fixed top-[4.5rem] right-[14rem] sm:right-[17rem] z-50 animate-slide-in">
          <div className="relative">
            {/* Main Tooltip Card */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-5 rounded-2xl shadow-2xl max-w-xs border-2 border-white/20 backdrop-blur-sm">
              {/* Animated Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              
              <div className="relative z-10 flex items-start gap-3">
                {/* Animated Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md animate-pulse"></div>
                    <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-2.5 border-2 border-white/40 shadow-xl">
                      <span className="text-2xl block animate-click-demo">💡</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-base">Hướng dẫn nhanh</h4>
                    <span className="text-[10px] bg-yellow-400 text-indigo-900 px-2 py-0.5 rounded-full font-bold">NEW</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/95 mb-3">
                    <span className="font-semibold text-yellow-300">Double-click</span> vào bất kỳ từ nào trên trang để xem nghĩa 
                    <span className="font-semibold text-green-300"> Nhật-Việt-Anh</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 shadow-inner">
                    <span className="text-yellow-300 text-base">👆</span>
                    <span className="text-white/90 font-medium">Thử ngay với từ bất kỳ!</span>
                  </div>
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={() => setShowFirstTimeHint(false)}
                  className="flex-shrink-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 text-xl leading-none font-bold hover:scale-110 hover:rotate-90"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Beautiful Arrow Pointer with Shadow */}
            <div className="absolute top-1/2 -right-2.5 transform -translate-y-1/2 z-20">
              {/* Shadow Layer */}
              <div className="absolute inset-0 translate-x-0.5">
                <div className="w-5 h-5 bg-black/20 transform rotate-45 blur-sm"></div>
              </div>
              {/* Main Arrow with Gradient */}
              <div className="relative">
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 transform rotate-45 border-r-2 border-t-2 border-white/20"></div>
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0">
                <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 transform rotate-45 blur-md opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Helper Text - ELEGANT REDESIGN - Only on Desktop, Only When OFF */}
      {!isEnabled && (
        <div className="hidden lg:block fixed top-[5rem] right-[15rem] z-30 animate-bounce-hint">
          <div className="relative">
            {/* Helper Card with Premium Design */}
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white px-4 py-3 rounded-xl shadow-2xl max-w-[240px] border border-gray-700/50 backdrop-blur-sm">
              {/* Subtle Animated Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-lg animate-pulse"></div>
              
              <div className="relative z-10 space-y-2">
                {/* Title with Icon */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm animate-pulse"></div>
                    <span className="relative text-yellow-400 text-base">💡</span>
                  </div>
                  <p className="font-bold text-sm bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Tính năng mới!
                  </p>
                </div>
                
                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  Bật để tra nghĩa từ nhanh chóng bằng cách <span className="font-semibold text-white bg-gray-700/50 px-1.5 py-0.5 rounded">double-click</span>
                </p>
                
                {/* Visual Hint */}
                <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-700/50">
                  <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Nhật → Việt → Anh</span>
                </div>
              </div>
            </div>
            
            {/* Elegant Arrow Pointer */}
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
              {/* Shadow */}
              <div className="absolute inset-0 translate-x-0.5">
                <div className="w-4 h-4 bg-black/20 transform rotate-45 blur-sm"></div>
              </div>
              {/* Main Arrow */}
              <div className="relative">
                <div className="w-4 h-4 bg-gradient-to-br from-gray-800 to-black transform rotate-45 border-r border-t border-gray-700/50"></div>
              </div>
              {/* Subtle Glow */}
              <div className="absolute inset-0">
                <div className="w-4 h-4 bg-gray-700 transform rotate-45 blur-sm opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DictionaryButton;