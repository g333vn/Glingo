// src/components/skeletons/LessonPageSkeleton.jsx
// Skeleton screen cho LessonPage (Sidebar + Lesson Content)

import React from 'react';
import Sidebar from '../Sidebar.jsx';

function LessonPageSkeleton({ currentBookCategory, onCategoryClick }) {
  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        <Sidebar
          selectedCategory={currentBookCategory}
          onCategoryClick={onCategoryClick}
        />
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="pt-3 px-5 pb-2 flex-shrink-0 animate-pulse">
            <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded-md w-1/2" />
          </div>

          <div className="px-5 py-3 border-b-[3px] border-black flex-shrink-0 animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded-md w-3/4" />
          </div>

          <div className="px-5 py-3 border-b-[3px] border-black flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="px-6 py-2 rounded-lg border-[3px] border-black bg-gray-100 animate-pulse h-10 w-28"
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-4 pb-6 min-h-full flex flex-col space-y-4 animate-pulse">
              <div className="bg-gray-100 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-64 md:h-80" />
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded-lg border-[3px] border-black"
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-12 bg-gray-100 rounded-lg border-[3px] border-black"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPageSkeleton;


