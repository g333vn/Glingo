// src/features/books/components/BookCard.jsx
// OPTION 8: RETRO LIBRARY CARD STYLE

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-[#f0f0e0]' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
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
          /* --- PLACEHOLDER DESIGN: LIBRARY CARD --- */
          <div className="absolute inset-0 flex flex-col bg-[#fcfbf4] p-0 overflow-hidden">
            
            {/* Header màu hồng/đỏ */}
            <div className="w-full bg-pink-500 border-b-[3px] border-black p-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-white">NO. 1312</span>
            </div>

            {/* Dòng kẻ ngang mô phỏng giấy */}
            <div className="flex-1 w-full relative" 
                 style={{
                     backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #a5b4fc 24px)',
                     backgroundSize: '100% 24px',
                     backgroundPosition: '0 10px'
                 }}>
                 
                 {/* Nội dung đóng dấu đè lên dòng kẻ */}
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="border-[3px] border-black p-2 transform -rotate-12 opacity-80 mix-blend-multiply">
                         <span className="text-xl sm:text-2xl font-black text-black uppercase block text-center leading-none">
                             BOOK<br/>MISSING
                         </span>
                     </div>
                 </div>
            </div>

            {/* Footer Text */}
            <div className="p-2 text-center border-t-[3px] border-black bg-yellow-400">
                <p className="text-[10px] font-bold text-black uppercase">CLICK TO OPEN</p>
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