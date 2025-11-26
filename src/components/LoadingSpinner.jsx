// src/components/LoadingSpinner.jsx
// 🎡 Generic Neo-Brutalism Loading Spinner + Text

import React from 'react';

function LoadingSpinner({ label, icon = '⏳', fullHeight = true }) {
  return (
    <div className={`w-full pr-0 md:pr-4 ${fullHeight ? '' : ''}`}>
      <div className={`flex flex-col md:flex-row gap-0 md:gap-6 items-start ${fullHeight ? 'mt-2 sm:mt-4' : ''}`}>
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 flex items-center justify-center overflow-y-auto">
            <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 md:p-8 m-3 sm:m-4 md:m-6">
              <div className="mb-4 flex items-center justify-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-[3px] border-black border-t-transparent bg-yellow-300" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl">
                    <span>{icon}</span>
                  </div>
                </div>
              </div>
              {label && (
                <p className="text-base sm:text-lg md:text-xl font-black text-gray-900">
                  {label}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;


