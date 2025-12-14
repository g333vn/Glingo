// src/features/books/components/BookCard.jsx
// OPTION 4: 8-BIT RETRO GAME STYLE

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-indigo-500' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
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
          /* --- PLACEHOLDER DESIGN: PIXEL ART --- */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500 p-4 font-mono overflow-hidden">
            {/* Background Grid Pixel */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ 
                    backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', 
                    backgroundSize: '16px 16px' 
                 }}>
            </div>

            {/* Pixel Ghost / Monster */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 mb-4 transition-transform group-hover:scale-110 duration-200">
               {/* Vẽ pixel bằng div đơn giản */}
               <div className="w-full h-full bg-white relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[4px] border-black flex items-center justify-center">
                   <div className="flex gap-2">
                       <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
                       <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
                   </div>
                   <div className="absolute bottom-3 w-8 h-1 bg-black"></div>
               </div>
            </div>

            {/* Retro Text Box */}
            <div className="relative z-10 border-[3px] border-white bg-black px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest text-center animate-pulse">
                    INSERT COIN
                </p>
            </div>
            
            {/* Decorative pixels corners */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-white"></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-white"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-white"></div>
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