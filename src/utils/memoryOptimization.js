// src/utils/memoryOptimization.js
// ✅ PHASE 5: Memory Optimization Utilities

/**
 * Clear unused caches and free memory
 */
export function cleanupMemory() {
  // Clear query cache if it exists
  if (window.queryCache) {
    const stats = window.queryCache.getStats();
    if (stats.expired > 0) {
      window.queryCache.cleanExpired();
      console.log('[MemoryOptimization] Cleaned', stats.expired, 'expired cache entries');
    }
  }

  // Force garbage collection if available (Chrome DevTools)
  if (window.gc) {
    window.gc();
  }

  // Clear unused image caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        // Keep only active caches
        if (cacheName.includes('workbox') || cacheName.includes('elearning')) {
          // Keep these
        } else {
          caches.delete(cacheName);
        }
      });
    });
  }
}

/**
 * Monitor memory usage
 * @returns {Object} Memory usage stats
 */
export function getMemoryUsage() {
  if (!('performance' in window) || !('memory' in performance)) {
    return null;
  }

  const memory = performance.memory;
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
    totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
    limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
  };
}

/**
 * Setup automatic memory cleanup
 * @param {number} interval - Cleanup interval in ms (default: 5 minutes)
 */
export function setupAutoCleanup(interval = 5 * 60 * 1000) {
  setInterval(() => {
    const memory = getMemoryUsage();
    if (memory && parseFloat(memory.usedMB) > 100) {
      // If memory usage > 100MB, cleanup
      cleanupMemory();
      console.log('[MemoryOptimization] Auto cleanup triggered. Memory:', memory.usedMB, 'MB');
    }
  }, interval);
}

/**
 * Debounce function to prevent excessive calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit call frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
