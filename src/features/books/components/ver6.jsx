// src/features/books/components/BookCard.jsx
// OPTION 6: VERTICAL TATEGAKI STYLE

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-white' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
        {!showPlaceholder ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            )}
            <img 
              src={imageUrl} 
              alt={title} 
              className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          /* --- PLACEHOLDER DESIGN: VERTICAL TATEGAKI --- */
          <div className="absolute inset-0 flex items-center justify-center bg-red-600 p-4 overflow-hidden">
            
            {/* Circle Sun Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[120%] aspect-square bg-red-500 rounded-full opacity-50 blur-xl"></div>
            </div>

            {/* Vertical Container */}
            <div className="relative z-10 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-3 py-4 md:py-6 h-[80%] flex flex-col items-center">
                
                {/* Text viết dọc (writing-mode) */}
                <div className="flex-1 flex items-center justify-center" style={{ writingMode: 'vertical-rl' }}>
                    <span className="text-2xl sm:text-3xl font-black text-black tracking-[0.2em] leading-none select-none" lang="ja">
                        .jpg
                    </span>
                </div>

                {/* Hanko (Con dấu đỏ) ở dưới cùng */}
                <div className="mt-2 w-8 h-8 border-[2px] border-red-600 rounded-sm flex items-center justify-center transform rotate-12 opacity-80">
                    <span className="text-[8px] font-bold text-red-600">未定</span>
                </div>
            </div>

            {/* Decorative dots pattern */}
            <div className="absolute top-0 right-0 p-2 grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
             <div className="absolute bottom-0 left-0 p-2 grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tên sách */}
      <div 
        className={`p-2 sm:p-2.5 md:p-3 text-center transition-colors duration-200 border-t-0 ${
          isComingSoon ? 'bg-yellow-300 group-hover:bg-yellow-400' : 'bg-yellow-400 group-hover:bg-yellow-500'
        }`}
      >
        <p 
          className="text-xs sm:text-sm md:text-base font-black text-black uppercase tracking-wide line-clamp-2" 
          title={title}
          style={{ 
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        > 
          {title}
        </p>
      </div>
    </div>
  );
}

export default BookCard;