// src/features/books/components/LessonCard.jsx
// ✨ NEO BRUTALISM - Consistent Design with Fixed Height + Progress
// ✅ PHASE 2: Extracted and memoized for performance optimization

import React, { memo } from 'react';
import { getChapterProgress } from '../../../utils/lessonProgressTracker.js';

function LessonCard({ title, lessonId, levelId, isLesson = false, bookId, chapterId, lessons = [], t }) {
  const colorClass = levelId === 'n1' ? 'from-red-100 to-red-300 text-red-800' : 
                     levelId === 'n2' ? 'from-orange-100 to-orange-300 text-orange-800' :
                     levelId === 'n3' ? 'from-yellow-100 to-yellow-300 text-yellow-800' :
                     levelId === 'n4' ? 'from-green-100 to-green-300 text-green-800' :
                     levelId === 'n5' ? 'from-blue-100 to-blue-300 text-blue-800' :
                     'from-gray-100 to-gray-300 text-gray-800';
  
  // Calculate progress for chapters (not lessons)
  let progress = null;
  if (!isLesson && bookId && chapterId && lessons.length > 0) {
    progress = getChapterProgress(bookId, chapterId, lessons);
  }
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 p-5 group hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer h-[240px] flex flex-col">
      {/* Icon - ✨ NEO BRUTALISM - ALWAYS PERFECT CIRCLE */}
      <div 
        className="flex-shrink-0 bg-yellow-400 rounded-full flex items-center justify-center font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mx-auto mb-3"
        style={{
          width: '80px',
          height: '80px',
          minWidth: '80px',
          minHeight: '80px'
        }}
      >
        <span className="text-3xl">📘</span>
      </div>
      
      {/* Title - ✨ NEO BRUTALISM - Fixed height area with ellipsis */}
      <div className="flex-1 w-full px-2 mb-3 overflow-hidden flex items-center justify-center">
        <h3 
          className="font-black text-sm sm:text-base text-black uppercase tracking-wide text-center w-full"
          style={{ 
            fontFamily: "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', sans-serif",
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            lineHeight: '1.3'
          }}
          title={title}
        >
          {title}
        </h3>
      </div>
      
      {/* Progress Bar (for chapters only) */}
      {progress && (
        <div className="flex-shrink-0 mb-2 px-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border-[2px] border-black">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-700 font-bold mt-1">
            {progress.completed}/{progress.total} ({progress.percentage}%)
          </p>
        </div>
      )}
      
      {/* Badge - ✨ NEO BRUTALISM - Always at bottom */}
      <div className="flex-shrink-0 flex justify-center">
        <span className="text-xs px-3 py-1 rounded-md border-[2px] border-black bg-blue-500 text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {isLesson ? t('lesson.lessonBadge') : t('lesson.chapterBadge')}
        </span>
      </div>
    </div>
  );
}

// ✅ PHASE 2: Memoize component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(LessonCard, (prevProps, nextProps) => {
  // Deep comparison for lessons array
  const lessonsEqual = prevProps.lessons.length === nextProps.lessons.length &&
    prevProps.lessons.every((lesson, index) => 
      lesson.id === nextProps.lessons[index]?.id
    );
  
  return (
    prevProps.title === nextProps.title &&
    prevProps.lessonId === nextProps.lessonId &&
    prevProps.levelId === nextProps.levelId &&
    prevProps.isLesson === nextProps.isLesson &&
    prevProps.bookId === nextProps.bookId &&
    prevProps.chapterId === nextProps.chapterId &&
    lessonsEqual
  );
});
