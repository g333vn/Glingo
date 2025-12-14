// src/features/books/components/BookCard.jsx
// OPTION 9: CYBER TOKYO STYLE

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-purple-900' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
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
          /* --- PLACEHOLDER DESIGN: CYBER TOKYO --- */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a0b2e] p-4 font-mono overflow-hidden">
            
            {/* Grid nền xanh neon mờ */}
            <div className="absolute inset-0 opacity-20" 
                 style={{
                    backgroundImage: 'linear-gradient(transparent 95%, #34d399 95%)',
                    backgroundSize: '100% 10px'
                 }}>
            </div>

            {/* Icon "No Image" kiểu kỹ thuật số */}
            <div className="relative z-10 w-16 h-16 border-[4px] border-green-400 mb-3 flex items-center justify-center shadow-[4px_4px_0px_0px_#34d399]">
                <div className="text-4xl font-black text-green-400">X</div>
                {/* Glitch effect layer */}
                <div className="absolute top-0 left-0 w-full h-full border-[4px] border-pink-500 opacity-50 transform translate-x-1 translate-y-1"></div>
            </div>

            {/* Text chạy marquee giả lập */}
            <div className="relative z-10 w-full overflow-hidden">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest text-center whitespace-nowrap">
                    &lt;NO COVER/&gt;
                </p>
                <p className="text-[10px] text-pink-500 uppercase tracking-widest text-center mt-1">
                    ERR_IMG_404
                </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Tên sách - Style riêng cho Cyber (Đổi màu nền phần title cho hợp tông tối) */}
      <div 
        className={`p-2 sm:p-2.5 md:p-3 text-center transition-colors duration-200 border-t-0 ${
            // Dùng màu tím nhạt hơn cho phần title để tạo sự liền mạch với dark mode của ảnh
          isComingSoon ? 'bg-[#c084fc] group-hover:bg-[#d8b4fe]' : 'bg-[#a855f7] group-hover:bg-[#c084fc]'
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