// src/features/books/components/BookCard.jsx
// ✨ NEO BRUTALISM + JAPANESE AESTHETIC - Enhanced with Placeholder

import React, { useState } from 'react';

function BookCard({ imageUrl, title, isComingSoon = false, status = null }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Determine if we need to show placeholder
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group">
      
      {/* Phần hình ảnh - NEO BRUTALISM với Placeholder */}
      <div className="relative bg-gray-200 border-b-[4px] border-black" style={{ aspectRatio: '3/4' }}>
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
          /* Placeholder Design - Beautiful & Professional */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-4">
            {/* Background pattern - Japanese wave */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C15 6.716 21.716 0 30 0z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}></div>
            
            {/* Book icon - Large & prominent */}
            <div className="relative z-10 mb-4 transform group-hover:scale-110 transition-transform duration-300">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <span className="text-4xl sm:text-5xl">📚</span>
              </div>
            </div>
            
            {/* Status badge - ALWAYS ENGLISH */}
            {isComingSoon && (
              <div className="relative z-10 px-4 py-2 bg-yellow-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                <p 
                  className="text-xs sm:text-sm font-black text-black uppercase tracking-wider"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                  lang="en"
                >
                  Coming Soon
                </p>
              </div>
            )}
            
            {status && !isComingSoon && (
              <div className="relative z-10 px-3 py-1.5 bg-blue-500 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
                <p 
                  className="text-xs font-bold text-white uppercase"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                  lang="en"
                >
                  {status}
                </p>
              </div>
            )}
            
            {/* No image indicator - ALWAYS ENGLISH */}
            {!isComingSoon && !status && (
              <div className="relative z-10 mt-2">
                <p 
                  className="text-xs text-gray-500 font-medium"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                  lang="en"
                >
                  No Cover Image
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Phần tên sách - NEO BRUTALISM - ALWAYS ENGLISH */}
      <div 
        className={`p-3 text-center transition-colors duration-200 ${
          isComingSoon ? 'bg-yellow-300 group-hover:bg-yellow-400' : 'bg-yellow-400 group-hover:bg-yellow-500'
        }`}
        lang="en"
      >
        <p 
          className="text-sm font-black text-black uppercase tracking-wide line-clamp-2" 
          title={title}
          style={{ 
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            minHeight: '2.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFeatureSettings: 'normal',
            fontVariant: 'normal'
          }}
        > 
          {title}
        </p>
      </div>
    </div>
  );
}

export default BookCard;
