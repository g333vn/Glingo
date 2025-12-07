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
          /* Placeholder Design - NEO BRUTALISM STYLE */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
            {/* Geometric background pattern - Neo Brutalism grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `
                linear-gradient(to right, black 1px, transparent 1px),
                linear-gradient(to bottom, black 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
            
            {/* Book icon container - NEO BRUTALISM */}
            <div className="relative z-10 mb-6 transform group-hover:scale-105 transition-transform duration-200">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-yellow-400 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <span className="text-5xl sm:text-6xl">📚</span>
              </div>
            </div>
            
            {/* Status badge - NEO BRUTALISM */}
            {isComingSoon && (
              <div className="relative z-10 px-5 py-2.5 bg-yellow-300 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transform -rotate-1 group-hover:rotate-0 transition-transform duration-200">
                <p 
                  className="text-xs sm:text-sm font-black text-black uppercase tracking-widest"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                  lang="en"
                >
                  Coming Soon
                </p>
              </div>
            )}
            
            {status && !isComingSoon && (
              <div className="relative z-10 px-4 py-2 bg-blue-500 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <p 
                  className="text-xs font-black text-white uppercase tracking-wider"
                  style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                  lang="en"
                >
                  {status}
                </p>
              </div>
            )}
            
            {/* No image indicator - NEO BRUTALISM */}
            {!isComingSoon && !status && (
              <div className="relative z-10 mt-4">
                <div className="px-4 py-2 bg-gray-100 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                  <p 
                    className="text-xs font-black text-black uppercase tracking-wider"
                    style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
                    lang="en"
                  >
                    No Cover Image
                  </p>
                </div>
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
