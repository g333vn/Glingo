// src/components/skeletons/UserDashboardSkeleton.jsx
// 📊 Skeleton screen cho UserDashboard theo Neo-Brutalism

import React from 'react';

function UserDashboardSkeleton() {
  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-2 sm:mt-4">
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            {/* Header skeleton */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6 lg:p-8 animate-pulse">
                <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded-md mb-3 w-1/2" />
                <div className="h-4 sm:h-5 bg-gray-200 rounded-md w-3/4" />
              </div>
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg sm:rounded-xl border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-pulse"
                >
                  <div className="bg-gray-200 p-2 sm:p-3 md:p-4 border-b-[3px] sm:border-b-[4px] border-black">
                    <div className="h-8 sm:h-10 bg-gray-300 rounded-md mb-2" />
                    <div className="h-4 sm:h-5 bg-gray-300 rounded-md w-2/3" />
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded-md w-3/4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar skeleton */}
            <div className="bg-purple-200 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 animate-pulse">
              <div className="h-5 sm:h-6 bg-purple-300 rounded-md w-1/3 mb-4" />
              <div className="h-10 sm:h-12 md:h-16 bg-gray-200 rounded-lg border-[3px] sm:border-[4px] border-black overflow-hidden">
                <div className="h-full w-1/2 bg-purple-400" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-2 sm:p-3 md:p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="h-6 sm:h-7 bg-gray-200 rounded-md mb-2" />
                    <div className="h-3 sm:h-4 bg-gray-200 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Deck list skeleton */}
            <div className="bg-white rounded-xl border-[3px] sm:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-4 sm:mb-6 md:mb-8">
              <div className="bg-indigo-300 border-b-[3px] sm:border-b-[4px] border-black p-3 sm:p-4 md:p-6 animate-pulse">
                <div className="h-6 sm:h-7 bg-indigo-200 rounded-md w-1/2 mb-2" />
                <div className="h-4 sm:h-5 bg-indigo-200 rounded-md w-2/3" />
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg sm:rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse p-3 sm:p-4 md:p-5"
                  >
                    <div className="h-5 sm:h-6 bg-gray-200 rounded-md w-2/3 mb-3" />
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                      {[0, 1, 2].map((j) => (
                        <div key={j} className="h-10 sm:h-12 bg-gray-100 rounded-md border-[2px] border-black" />
                      ))}
                    </div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded-md w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboardSkeleton;


