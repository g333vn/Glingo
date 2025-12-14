// src/features/books/components/BookCard.jsx
// OPTION 10: SWISS ORANGE TYPOGRAPHY

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-[#ea580c]' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
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
          /* --- PLACEHOLDER DESIGN: SWISS ORANGE --- */
          <div className="absolute inset-0 bg-[#ea580c] p-4 flex flex-col justify-between overflow-hidden">
            
            {/* Vòng tròn trang trí lớn (Negative space) */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#fff7ed] rounded-full border-[4px] border-black"></div>
            
            {/* Số thứ tự hoặc Mã giả */}
            <div className="relative z-10">
                <span className="text-5xl font-black text-black opacity-20 block leading-none">13</span>
                <span className="text-5xl font-black text-black opacity-20 block leading-none">12</span>
            </div>

            {/* Typography chính */}
            <div className="relative z-10 bg-white border-[4px] border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
                <h3 className="text-2xl font-black text-black uppercase leading-none tracking-tighter">
                    NO<br/>IMAGE
                </h3>
                <div className="w-full h-1 bg-black my-1"></div>
                <p className="text-[10px] font-bold text-black uppercase">
                    YET AVAILABLE
                </p>
            </div>
            
            {/* Họa tiết kẻ sọc nhỏ góc dưới */}
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-black opacity-10" 
                 style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)' }}>
            </div>
          </div>
        )}
      </div>
      
      {/* Tên sách - Chỉnh lại màu cho hợp với tông cam */}
      <div 
        className={`p-2 sm:p-2.5 md:p-3 text-center transition-colors duration-200 border-t-0 ${
          isComingSoon ? 'bg-[#fdba74] group-hover:bg-[#fb923c]' : 'bg-[#fb923c] group-hover:bg-[#f97316]'
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