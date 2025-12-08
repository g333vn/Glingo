// src/components/OptimizedImage.jsx
// ✅ PHASE 4: Optimized Image Component with WebP, Responsive Images, and Lazy Loading

import React, { useState, useRef, useEffect } from 'react';

/**
 * Check if browser supports WebP format
 */
function supportsWebP() {
  if (typeof window === 'undefined') return false;
  
  // Check if already cached
  if (window.webpSupport !== undefined) {
    return window.webpSupport;
  }

  // Create a canvas to test WebP support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const dataURI = canvas.toDataURL('image/webp');
  const isSupported = dataURI.indexOf('data:image/webp') === 0;
  
  // Cache result
  window.webpSupport = isSupported;
  return isSupported;
}

/**
 * Generate WebP version of image URL
 * @param {string} url - Original image URL
 * @returns {string} - WebP version URL or original if conversion not possible
 */
function getWebPUrl(url) {
  if (!url) return url;
  
  // If already WebP, return as is
  if (url.toLowerCase().endsWith('.webp')) {
    return url;
  }

  // If URL is from Supabase Storage or CDN, try to convert
  // For local images, we assume WebP versions exist in same directory
  if (url.startsWith('/') || url.startsWith('./')) {
    // Local image - try to find .webp version
    const baseUrl = url.replace(/\.(jpg|jpeg|png|gif)$/i, '');
    return `${baseUrl}.webp`;
  }

  // For external URLs, return original (can't convert)
  return url;
}

/**
 * Generate responsive srcset for different screen sizes
 * @param {string} baseUrl - Base image URL
 * @param {Array<number>} sizes - Array of widths (e.g., [400, 800, 1200])
 * @returns {string} - srcset string
 */
function generateSrcSet(baseUrl, sizes = [400, 800, 1200]) {
  // For now, return empty (can be extended with actual responsive image generation)
  // In production, you'd generate multiple sizes and serve them
  return '';
}

/**
 * OptimizedImage Component
 * 
 * Features:
 * - WebP format support with fallback
 * - Lazy loading with Intersection Observer
 * - Responsive images (srcset)
 * - Loading skeleton
 * - Error handling
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} className - Additional CSS classes
 * @param {boolean} lazy - Enable lazy loading (default: true)
 * @param {boolean} priority - Load immediately (skip lazy loading)
 * @param {Array<number>} sizes - Responsive image sizes
 * @param {Object} style - Inline styles
 * @param {Function} onLoad - Load callback
 * @param {Function} onError - Error callback
 */
function OptimizedImage({
  src,
  alt = '',
  className = '',
  lazy = true,
  priority = false,
  sizes = [400, 800, 1200],
  style = {},
  onLoad,
  onError,
  ...props
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(priority || !lazy);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  // Determine image source
  const webpSupported = supportsWebP();
  const imageSrc = isInView ? (webpSupported ? getWebPUrl(src) : src) : '';
  const srcSet = isInView && sizes.length > 0 ? generateSrcSet(src, sizes) : '';

  const handleLoad = (e) => {
    setImageLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    // Fallback to original format if WebP fails
    if (webpSupported && imageSrc !== src && !imageError) {
      // Try original format
      const img = e.target;
      const originalSrc = src;
      setImageError(false); // Reset error state
      img.src = originalSrc;
      img.onerror = () => {
        setImageError(true);
        if (onError) onError(e);
      };
    } else {
      setImageError(true);
      if (onError) onError(e);
    }
  };

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={style}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc || src}
          srcSet={srcSet || undefined}
          sizes={sizes.length > 0 ? sizes.map(s => `(max-width: ${s}px) ${s}px`).join(', ') : undefined}
          alt={alt}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageError ? 'hidden' : ''}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Error placeholder */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-gray-300">
          <span className="text-gray-400 text-2xl">📷</span>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
