// src/features/books/components/BookCard.jsx
import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Determine if we need to show placeholder
  const showPlaceholder = !imageUrl || imageError || isComingSoon;

  // COLOR PALETTE
  // Teal (Main Background): #0099c3
  // Sky Blue (Dots pattern): #6dcae8
  // Dark Blue (Text/Buttons): #034c7f
  // Mustard Yellow (Accents/Title): #fdc800
  // Pink (No Cover Text): #ffbdc5
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Phần hình ảnh - NEO BRUTALISM với Placeholder */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-[#0099c3]' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
        {!showPlaceholder ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            )}
            
            {/* Real image */}
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
          /* ================================================================================== */
          /* DESIGN MỚI: MANGA POP STYLE - FINAL COLOR FIX                                      */
          /* ================================================================================== */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0099c3] p-4 overflow-hidden">
            
            {/* 1. Background Pattern: Manga Halftone Dots */}
            <div className="absolute inset-0 opacity-30" 
                style={{
                  backgroundImage: 'radial-gradient(circle, #6dcae8 2px, transparent 2.5px)',
                  backgroundSize: '12px 12px'
                }}>
            </div>

            {/* 2. Geometric Shape: Hình tròn lớn ở giữa */}
            <div className="relative z-10 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white border-[4px] border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-300">
                {/* Chữ Kanji: BOOK (本 - Hon) */}
                <span className="text-4xl sm:text-5xl font-black text-[#034c7f] select-none" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                    本
                </span>
                
                {/* Decorative Badge nhỏ ở góc */}
                <div className="absolute -top-2 -right-2 bg-[#fdc800] border-[3px] border-black px-1.5 py-0.5 transform rotate-12">
                     <span className="text-[10px] font-black text-[#034c7f] uppercase leading-none">N/A</span>
                </div>
            </div>

            {/* 3. Text "NO COVER" bên dưới */}
            {/* Background: #034c7f (Xanh đậm) */}
            {/* Text Color: #ffbdc5 (Hồng phấn - Updated) */}
            <div className="relative z-10 mt-4 bg-[#034c7f] border-[3px] border-black px-3 py-1 transform -rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs sm:text-sm font-black text-[#ffbdc5] uppercase tracking-widest font-mono">
                    NO COVER
                </p>
            </div>

             {/* Decorative lines (Gạch chéo trang trí ở góc) */}
             <div className="absolute bottom-0 right-0 w-16 h-16 bg-black transform translate-x-8 translate-y-8 rotate-45 opacity-20"></div>
          </div>
        )}
      </div>
      
      {/* Phần tên sách */}
      <div 
        className={`p-2 sm:p-2.5 md:p-3 text-center transition-colors duration-200 border-t-0 ${
          isComingSoon ? 'bg-[#fdc800]/80 group-hover:bg-[#fdc800]' : 'bg-[#fdc800] group-hover:bg-[#fdc800]/90'
        }`}
      >
        <p 
          className="text-xs sm:text-sm md:text-base font-black text-[#034c7f] uppercase tracking-wide line-clamp-2" 
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