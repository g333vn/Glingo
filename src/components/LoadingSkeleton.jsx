// src/components/LoadingSkeleton.jsx
// ✅ PHASE 3: Loading Skeleton Components for better UX

import React from 'react';

/**
 * BookCard Skeleton - Loading state for book cards
 */
export function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border-[4px] border-gray-200 shadow-md p-4 animate-pulse">
      <div className="w-full aspect-square mb-3 rounded-lg bg-gray-200"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

/**
 * ExamCard Skeleton - Loading state for exam cards
 */
export function ExamCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border-[4px] border-gray-200 shadow-md p-4 h-full animate-pulse">
      <div className="w-full aspect-square mb-3 rounded-lg bg-gray-200"></div>
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

/**
 * List Skeleton - Loading state for lists
 */
export function ListSkeleton({ count = 5, ItemComponent = BookCardSkeleton }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ItemComponent key={index} />
      ))}
    </div>
  );
}

/**
 * Page Skeleton - Loading state for full pages
 */
export function PageSkeleton() {
  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        {/* Sidebar skeleton */}
        <div className="w-full md:w-64 bg-white rounded-lg border-[4px] border-gray-200 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="flex-1 bg-white rounded-lg border-[4px] border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default {
  BookCardSkeleton,
  ExamCardSkeleton,
  ListSkeleton,
  PageSkeleton
};
