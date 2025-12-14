// src/features/books/components/BookCard.jsx
// OPTION 3: INDUSTRIAL TYPOGRAPHY STYLE

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
          /* --- PLACEHOLDER DESIGN --- */
          <div className="absolute inset-0 flex flex-col justify-between bg-yellow-400 overflow-hidden">
            
            {/* Background Stripes (Đường kẻ chéo) */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ 
                   backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 4px, transparent 0, transparent 50%)', 
                   backgroundSize: '20px 20px' 
                 }}>
            </div>

            {/* Top decorative element */}
            <div className="relative z-10 flex justify-between p-2">
                 <div className="w-2 h-2 bg-black"></div>
                 <div className="w-2 h-2 bg-black"></div>
            </div>

            {/* Main Typo - Xoay dọc */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="transform -rotate-90 whitespace-nowrap">
                    <h2 className="text-4xl sm:text-5xl font-black text-transparent stroke-black tracking-tighter uppercase" 
                        style={{ WebkitTextStroke: '2px black' }}>
                        EMPTY
                    </h2>
                    <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tighter uppercase absolute top-0 left-0 transform translate-x-1 translate-y-1 opacity-50">
                        EMPTY
                    </h2>
                </div>
            </div>

             {/* Bottom Badge */}
            <div className="relative z-10 p-3 w-full">
                <div className="bg-black text-yellow-400 p-2 text-center border-2 border-transparent group-hover:border-white transition-colors">
                    <span className="text-xs font-bold uppercase tracking-widest block">Updating</span>
                </div>
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