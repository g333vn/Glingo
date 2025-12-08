// src/features/jlpt/components/ExamCard.jsx
// ✨ NEO BRUTALISM - Exam Card Component
// ✅ PHASE 2: Extracted and memoized for performance optimization
// ✅ PHASE 4: Optimized image loading

import React, { memo } from 'react';
import OptimizedImage from '../../../components/OptimizedImage.jsx';

const STATUS_BADGE_STYLES = {
  upcoming: 'bg-blue-500 text-white',
  finished: 'bg-gray-100 text-gray-600',
  available: 'bg-green-500 text-white'
};

function ExamCard({ title, date, statusLabel, statusType, memeImage }) {
  const badgeClasses = STATUS_BADGE_STYLES[statusType] || STATUS_BADGE_STYLES.available;

  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 p-4 h-full hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer">
      <div className="flex flex-col items-center text-center h-full">
        {/* ✅ PHASE 4: Optimized image with WebP support and lazy loading */}
        <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 border-[3px] border-black">
          <OptimizedImage
            src={memeImage}
            alt={title}
            className="w-full h-full object-cover"
            lazy={true}
            priority={false}
            sizes={[400, 800, 1200]}
            onError={(e) => {
              // Fallback to placeholder if image fails
              if (e.target.src !== '/book_card/placeholder.jpg') {
                e.target.src = '/book_card/placeholder.jpg';
              }
            }}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="font-black text-lg text-black mb-1 line-clamp-2 uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{title}</h3>
          <p className="text-sm text-gray-700 mb-2 font-bold">{date}</p>
          <div className="mt-auto">
            <span className={`inline-block text-xs px-3 py-1 rounded-md border-[2px] border-black font-black uppercase ${badgeClasses}`}>
              {statusLabel || statusType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ PHASE 2: Memoize component to prevent unnecessary re-renders
export default memo(ExamCard, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.date === nextProps.date &&
    prevProps.statusLabel === nextProps.statusLabel &&
    prevProps.statusType === nextProps.statusType &&
    prevProps.memeImage === nextProps.memeImage
  );
});
