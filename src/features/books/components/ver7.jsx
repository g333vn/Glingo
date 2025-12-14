// src/features/books/components/BookCard.jsx
// OPTION 7: GEOMETRIC BOOK STYLE

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-cyan-400' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
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
          /* --- PLACEHOLDER DESIGN: GEOMETRIC BOOK --- */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-400 p-4 overflow-hidden">
             
            {/* Background Circle */}
            <div className="absolute w-40 h-40 bg-white border-[3px] border-black rounded-full opacity-20 transform translate-y-8"></div>

            {/* Icon Quyển sách hình học */}
            <div className="relative z-10 flex items-end justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                {/* Trang trái */}
                <div className="w-8 h-12 bg-white border-[3px] border-black border-r-[1.5px] transform -skew-y-12 origin-bottom-right rounded-tl-sm shadow-sm"></div>
                {/* Trang phải */}
                <div className="w-8 h-12 bg-white border-[3px] border-black border-l-[1.5px] transform skew-y-12 origin-bottom-left rounded-tr-sm shadow-sm">
                    {/* Dòng kẻ giả chữ */}
                    <div className="mt-2 mx-1 h-0.5 bg-black/30"></div>
                    <div className="mt-1 mx-1 h-0.5 bg-black/30"></div>
                    <div className="mt-1 mx-1 w-1/2 h-0.5 bg-black/30"></div>
                </div>
            </div>

            {/* Text Box */}
            <div className="relative z-10 bg-black text-white px-3 py-1 border-[2px] border-transparent transform rotate-2">
                <p className="text-xs font-bold uppercase tracking-widest font-mono">
                    DEFAULT
                </p>
            </div>
            
            {/* Góc trang trí */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-[3px] border-l-[3px] border-black"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-[3px] border-r-[3px] border-black"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-[3px] border-l-[3px] border-black"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-[3px] border-r-[3px] border-black"></div>
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