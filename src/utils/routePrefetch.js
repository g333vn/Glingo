// src/utils/routePrefetch.js
// ✅ PHASE 5: Route Prefetching for Critical Routes
// Prefetch route chunks when user hovers over links or when idle

/**
 * Prefetch a route chunk
 * @param {Function} importFn - Lazy import function (e.g., () => import('./Page.jsx'))
 */
export function prefetchRoute(importFn) {
  if (typeof importFn === 'function') {
    // Prefetch the chunk
    importFn().catch(err => {
      console.warn('[RoutePrefetch] Failed to prefetch route:', err);
    });
  }
}

/**
 * Prefetch multiple routes
 * @param {Array<Function>} importFns - Array of lazy import functions
 */
export function prefetchRoutes(importFns) {
  importFns.forEach(importFn => {
    prefetchRoute(importFn);
  });
}

/**
 * Prefetch route on link hover
 * @param {HTMLElement} linkElement - Link element
 * @param {Function} importFn - Lazy import function
 */
export function prefetchOnHover(linkElement, importFn) {
  if (!linkElement || !importFn) return;

  let prefetched = false;
  const prefetch = () => {
    if (!prefetched) {
      prefetched = true;
      prefetchRoute(importFn);
    }
  };

  // Prefetch on hover
  linkElement.addEventListener('mouseenter', prefetch, { once: true });
  linkElement.addEventListener('touchstart', prefetch, { once: true });

  return () => {
    linkElement.removeEventListener('mouseenter', prefetch);
    linkElement.removeEventListener('touchstart', prefetch);
  };
}

/**
 * Prefetch routes when browser is idle
 * @param {Array<Function>} importFns - Array of lazy import functions
 * @param {number} delay - Delay in ms before prefetching (default: 2000)
 */
export function prefetchOnIdle(importFns, delay = 2000) {
  if (!('requestIdleCallback' in window)) {
    // Fallback: use setTimeout
    setTimeout(() => {
      prefetchRoutes(importFns);
    }, delay);
    return;
  }

  requestIdleCallback(
    () => {
      prefetchRoutes(importFns);
    },
    { timeout: delay }
  );
}

/**
 * Prefetch critical routes (home, level pages, JLPT pages)
 * Call this after initial page load
 */
export function prefetchCriticalRoutes() {
  // Prefetch after a short delay to not interfere with initial load
  setTimeout(() => {
    // Prefetch level pages (most common navigation)
    const levelPages = [
      () => import('../features/books/pages/LevelN1Page.jsx'),
      () => import('../features/books/pages/LevelN2Page.jsx'),
      () => import('../features/books/pages/LevelN3Page.jsx'),
      () => import('../features/books/pages/LevelN4Page.jsx'),
      () => import('../features/books/pages/LevelN5Page.jsx'),
    ];

    // Prefetch JLPT pages
    const jlptPages = [
      () => import('../features/jlpt/pages/JLPTLevelN1Page.jsx'),
      () => import('../features/jlpt/pages/JLPTLevelN2Page.jsx'),
      () => import('../features/jlpt/pages/JLPTLevelN3Page.jsx'),
      () => import('../features/jlpt/pages/JLPTLevelN4Page.jsx'),
      () => import('../features/jlpt/pages/JLPTLevelN5Page.jsx'),
    ];

    // Prefetch on idle
    prefetchOnIdle([...levelPages, ...jlptPages], 3000);
  }, 2000);
}

/**
 * Setup prefetching for navigation links
 * @param {string} selector - CSS selector for links (default: 'a[href^="/"]')
 */
export function setupLinkPrefetching(selector = 'a[href^="/"]') {
  // This would require route mapping, which is complex
  // For now, we'll use a simpler approach with data attributes
  const links = document.querySelectorAll(`${selector}[data-prefetch]`);
  
  links.forEach(link => {
    const routeName = link.getAttribute('data-prefetch');
    if (routeName) {
      // Map route names to import functions (would need to be defined)
      // For now, just log
      console.log('[RoutePrefetch] Would prefetch:', routeName);
    }
  });
}
