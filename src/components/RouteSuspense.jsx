// src/components/RouteSuspense.jsx
// ✅ Suspense wrapper for lazy-loaded routes with loading state

import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * RouteSuspense - Wrapper component for lazy-loaded routes
 * Provides consistent loading state across all routes
 */
function RouteSuspense({ children, fallback = null }) {
  const defaultFallback = fallback || (
    <LoadingSpinner 
      label="Đang tải trang..." 
      icon="📚"
      fullHeight={true}
    />
  );

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
}

export default RouteSuspense;
