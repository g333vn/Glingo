// src/features/books/components/BookCard.jsx
// OPTION 5: CONSTRUCTION / WARNING STYLE

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-yellow-400' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
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
          /* --- PLACEHOLDER DESIGN: CONSTRUCTION --- */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-400 overflow-hidden">
            
            {/* Caution Tape Background Stripes */}
            <div className="absolute inset-0 opacity-30" 
                 style={{ 
                   backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 10px, transparent 10px, transparent 20px)'
                 }}>
            </div>

            {/* Biển báo trung tâm */}
            <div className="relative z-10 bg-black border-[3px] border-white p-1 shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                <div className="border-[2px] border-white px-3 py-4 flex flex-col items-center">
                    {/* Kanji: Junbichu (Đang chuẩn bị) */}
                    <span className="text-3xl sm:text-4xl font-black text-white leading-none mb-1" lang="ja">
                        準備中
                    </span>
                    <div className="w-full h-0.5 bg-yellow-400 my-1"></div>
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
                        WAITING
                    </span>
                </div>
            </div>

             {/* Ốc vít trang trí 4 góc */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-black border-2 border-white opacity-50"></div>
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-black border-2 border-white opacity-50"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-black border-2 border-white opacity-50"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-black border-2 border-white opacity-50"></div>
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