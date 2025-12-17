// src/features/books/components/BookCard.jsx
// Dynamic placeholder design based on placeholderVersion (1-10)

import React, { useState, lazy, Suspense } from 'react';

// Lazy load placeholder components
const Ver1 = lazy(() => import('./ver1.jsx'));
const Ver2 = lazy(() => import('./ver2.jsx'));
const Ver3 = lazy(() => import('./ver3.jsx'));
const Ver4 = lazy(() => import('./ver4.jsx'));
const Ver5 = lazy(() => import('./ver5.jsx'));
const Ver6 = lazy(() => import('./ver6.jsx'));
const Ver7 = lazy(() => import('./ver7.jsx'));
const Ver8 = lazy(() => import('./ver8.jsx'));
const Ver9 = lazy(() => import('./ver9.jsx'));
const Ver10 = lazy(() => import('./ver10.jsx'));

// Map version numbers to components
const placeholderComponents = {
  1: Ver1,
  2: Ver2,
  3: Ver3,
  4: Ver4,
  5: Ver5,
  6: Ver6,
  7: Ver7,
  8: Ver8,
  9: Ver9,
  10: Ver10
};

function BookCard({ 
  imageUrl, 
  title, 
  isComingSoon = false, 
  status = null,
  placeholderVersion = 1 // ✅ NEW: Placeholder design version (1-10, default 1)
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const showPlaceholder = !imageUrl || imageError || isComingSoon;
  
  // Get the appropriate placeholder component
  // Clamp placeholderVersion to valid range (1-10)
  const validVersion = Math.max(1, Math.min(10, placeholderVersion || 1));
  const PlaceholderComponent = placeholderComponents[validVersion] || Ver1;
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] group self-start w-full">
      
      {/* Container Ảnh */}
      <div className={`relative border-b-[4px] border-black overflow-hidden ${showPlaceholder ? 'bg-gray-200' : 'bg-gray-200'}`} style={{ aspectRatio: '3/4' }}>
        {!showPlaceholder ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            )}
            <img 
              src={imageUrl} 
              alt={title} 
              width={300}
              height={400}
              className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          /* --- DYNAMIC PLACEHOLDER DESIGN --- */
          <Suspense fallback={
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          }>
            <PlaceholderComponent 
              imageUrl={imageUrl}
              title={title}
              isComingSoon={isComingSoon}
              status={status}
            />
          </Suspense>
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
