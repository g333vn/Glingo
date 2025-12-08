// src/utils/imageUtils.js
// ✅ PHASE 4: Image Utility Functions for Optimization

/**
 * Check if browser supports WebP format
 */
export function supportsWebP() {
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
export function getWebPUrl(url) {
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
 * @param {Array<number>} widths - Array of widths (e.g., [400, 800, 1200])
 * @returns {string} - srcset string
 */
export function generateSrcSet(baseUrl, widths = [400, 800, 1200]) {
  if (!baseUrl) return '';
  
  // For now, return empty (can be extended with actual responsive image generation)
  // In production, you'd generate multiple sizes and serve them via CDN or image service
  // Example: `${baseUrl}?w=400 400w, ${baseUrl}?w=800 800w, ${baseUrl}?w=1200 1200w`
  
  return widths
    .map(width => {
      // If baseUrl has query params, append width; otherwise use ?w=
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}w=${width} ${width}w`;
    })
    .join(', ');
}

/**
 * Compress image using Canvas API (client-side)
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1080)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @param {string} format - Output format: 'webp' | 'jpeg' | 'png' (default: 'webp')
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'webp') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        const mimeType = format === 'webp' ? 'image/webp' : file.type;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, `.${format}`), {
                type: mimeType,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          mimeType,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get optimal image size based on container width
 * @param {number} containerWidth - Container width in pixels
 * @param {Array<number>} breakpoints - Available image widths
 * @returns {number} - Optimal image width
 */
export function getOptimalImageSize(containerWidth, breakpoints = [400, 800, 1200, 1920]) {
  // Find the smallest breakpoint that's larger than container width
  for (const breakpoint of breakpoints) {
    if (breakpoint >= containerWidth) {
      return breakpoint;
    }
  }
  
  // Return largest breakpoint if container is larger
  return breakpoints[breakpoints.length - 1];
}

/**
 * Preload critical images
 * @param {Array<string>} urls - Array of image URLs to preload
 */
export function preloadImages(urls) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}
