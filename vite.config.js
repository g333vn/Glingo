import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// ✅ FIX: Plugin to inject process polyfill at the start of ALL chunks
const processPolyfillPlugin = () => {
  // CRITICAL: This polyfill MUST be the first line in each chunk
  // It defines process before any code tries to access process.version
  // Using IIFE that executes immediately and sets process on all possible global objects
  const polyfillCode = `(function(){'use strict';var p={env:{},version:'v18.0.0',browser:true};try{if(typeof window!=='undefined'){window.process=p;window.global=window;}if(typeof globalThis!=='undefined'){globalThis.process=p;globalThis.global=globalThis;}if(typeof process==='undefined'){var g=typeof globalThis!=='undefined'?globalThis:typeof window!=='undefined'?window:typeof self!=='undefined'?self:typeof global!=='undefined'?global:this;if(g){g.process=p;g.global=g;}}}catch(e){console.error('Polyfill error:',e);}})();`;
  
  // ✅ CRITICAL: Use blocking script (no async/defer) to ensure it runs before modulepreload
  const polyfillScript = `<script>${polyfillCode}</script>`;
  
  return {
    name: 'process-polyfill',
    enforce: 'pre', // Run before other plugins
    buildStart() {
      // Ensure process is defined at the very start of the build
      if (typeof global !== 'undefined' && typeof global.process === 'undefined') {
        global.process = { env: {}, version: 'v18.0.0', browser: true }
      }
    },
    transformIndexHtml(html) {
      // ✅ CRITICAL: Inject polyfill script into index.html as FIRST script
      // Must be before any modulepreload links or module scripts
      // Remove any existing polyfill scripts first to avoid duplicates
      html = html.replace(/<script[^>]*>[\s\S]*?polyfill[\s\S]*?<\/script>/gi, '');
      
      const headMatch = html.match(/<head[^>]*>/i);
      if (headMatch) {
        // Insert polyfill right after <head> tag, before ANY other content
        html = html.replace(
          headMatch[0],
          `${headMatch[0]}\n    ${polyfillScript}`
        );
      }
      
      // ✅ CRITICAL: Ensure antd-vendor modulepreload comes before vendor
      // This ensures React is loaded before vendor chunk tries to use it
      const modulepreloadRegex = /<link[^>]*rel=["']modulepreload["'][^>]*>/gi;
      const allPreloads = html.match(modulepreloadRegex) || [];
      
      if (allPreloads.length > 0) {
        const antdVendor = allPreloads.find(link => link.includes('antd-vendor'));
        const vendor = allPreloads.find(link => link.includes('vendor') && !link.includes('antd-vendor') && !link.includes('router-vendor') && !link.includes('supabase-vendor') && !link.includes('storage-vendor'));
        const otherPreloads = allPreloads.filter(link => link !== antdVendor && link !== vendor);
        
        // Remove all modulepreload links
        allPreloads.forEach(link => {
          html = html.replace(link, '');
        });
        
        // Re-insert in correct order: antd-vendor first, then vendor, then others
        const scriptMatch = html.match(/<script[^>]*type=["']module["'][^>]*>/i);
        if (scriptMatch) {
          let newPreloads = '';
          if (antdVendor) newPreloads += '    ' + antdVendor + '\n';
          if (vendor) newPreloads += '    ' + vendor + '\n';
          otherPreloads.forEach(link => {
            newPreloads += '    ' + link + '\n';
          });
          // Insert after the script tag closes, not inside it
          const scriptEnd = html.indexOf('</script>', html.indexOf(scriptMatch[0]));
          if (scriptEnd > 0) {
            html = html.slice(0, scriptEnd) + '\n' + newPreloads + html.slice(scriptEnd);
          } else {
            // Fallback: insert after script tag
            html = html.replace(scriptMatch[0], scriptMatch[0] + '\n' + newPreloads);
          }
        }
      }
      
      return html;
    },
    transform(code, id) {
      // In dev mode: Only inject into specific vendor modules that are known to need process
      // This is more selective to avoid performance issues
      if (id.includes('node_modules')) {
        // Only inject into modules that are likely to access process.version
        const needsPolyfill = id.includes('@supabase') || 
                             id.includes('antd') || 
                             (id.includes('vendor') && code.includes('process.version'))
        
        if (needsPolyfill && !code.includes('window.process') && !code.trim().startsWith('(function(){')) {
          return polyfillCode + '\n' + code
        }
      }
      return null
    },
    generateBundle(options, bundle) {
      // ✅ CRITICAL: Inject polyfill in ALL chunks (including vendor chunks) during build
      // Must be first line to ensure process exists before any code runs
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName]
        if (chunk.type === 'chunk') {
          // Check if polyfill is already at the start (by checking for the function pattern)
          const hasPolyfill = chunk.code.trim().startsWith('(function(){') && 
                             (chunk.code.includes('var p={env:{},version:') || 
                              chunk.code.includes('process={env:{},version:'));
          
          // Always inject at the very beginning if not already present
          // Use more aggressive check - if code starts with import, inject before it
          if (!hasPolyfill) {
            // If chunk starts with import statement, inject polyfill before it
            if (chunk.code.trim().startsWith('import')) {
              chunk.code = polyfillCode + '\n' + chunk.code
            } else {
              // Otherwise inject at the very beginning
              chunk.code = polyfillCode + '\n' + chunk.code
            }
          }
          
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    processPolyfillPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'logo/main.png'
      ],
      manifest: {
        name: 'Learn Your Approach - Japanese Learning Platform',
        short_name: 'GLPT',
        description: 'Nền tảng luyện thi JLPT với đề thi mô phỏng, sách học và lộ trình rõ ràng.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#111827',
        icons: [
          {
            src: '/logo/main.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo/main.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
        // Tăng giới hạn kích thước file được precache (mặc định 2 MiB)
        // để bundle chính và các ảnh meme lớn không làm fail build.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'document' ||
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 ngày
              }
            }
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 ngày
              }
            }
          },
          // ✅ PHASE 5: Cache API responses (Supabase, etc.)
          {
            urlPattern: ({ url }) => url.origin.includes('supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 ngày
              },
              networkTimeoutSeconds: 3
            }
          },
          // ✅ PHASE 5: Cache font files
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 năm
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd'],
    force: true
  },
  define: {
    // ✅ FIX: Provide process polyfill for browser environment
    // Some libraries may try to access process.version or process.env
    // Vite's define does string replacement at build time
    // Note: Only define specific properties, not the whole object to avoid conflicts
    'process.env': JSON.stringify({}),
    'process.version': JSON.stringify('v18.0.0'),
    'process.browser': 'true',
    global: 'globalThis',
  },
  server: {
    // ✅ Cấu hình để xử lý SPA routing - redirect tất cả routes về index.html
    historyApiFallback: true
  },
  build: {
    // ✅ CRITICAL: Giữ lại console.log trong production build
    // Để [AUTH] logs vẫn hiển thị sau khi deploy
    minify: 'esbuild',
    // ✅ Esbuild options - đảm bảo không remove console.log
    esbuild: {
      drop: [], // ✅ KHÔNG drop console hoặc debugger
      // drop: ['console', 'debugger'] // ❌ KHÔNG dùng dòng này
    },
      rollupOptions: {
      output: {
        // ✅ CRITICAL: Ensure antd-vendor loads before vendor chunk
        // This prevents vendor chunk from trying to import React before it's available
        chunkFileNames: (chunkInfo) => {
          // Ensure antd-vendor has a predictable name that loads first
          if (chunkInfo.name === 'antd-vendor') {
            return 'assets/antd-vendor-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        // ✅ PHASE 1: Code Splitting - Route-based chunking strategy
        manualChunks: (id) => {
          // Vendor chunks - Tách riêng các thư viện lớn
          if (id.includes('node_modules')) {
            // ✅ FIX: Bundle React with Ant Design to ensure React is available
            // Check more specific packages first to avoid false matches
            
            // ✅ CRITICAL: React core MUST be checked FIRST and put in antd-vendor
            // This ensures React is available before any other vendor code tries to use it
            // React core (react, react-dom, scheduler) - MUST be in antd-vendor
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'antd-vendor';
            }
            // React Router (check before react to avoid matching react-router as react)
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Ant Design (UI library - lớn) - includes React, so must load before vendor
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            // Additional React-related packages that might be missed
            if (id.includes('/react') && !id.includes('react-router')) {
              return 'antd-vendor';
            }
            // Supabase client
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Icons libraries
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // IndexedDB library
            if (id.includes('idb')) {
              return 'storage-vendor';
            }
            // Other vendor code
            return 'vendor';
          }
          
          // Feature-based chunks - Tách theo module
          // Level Module (Books, Lessons, Quizzes)
          if (id.includes('features/books') || id.includes('features/books/')) {
            return 'level-module';
          }
          
          // JLPT Module (Exams, Practice)
          if (id.includes('features/jlpt') || id.includes('features/jlpt/')) {
            return 'jlpt-module';
          }
          
          // Admin Module (Admin pages, components)
          if (id.includes('pages/admin') || id.includes('components/admin')) {
            return 'admin-module';
          }
          
          // Editor Module (Editor pages, components)
          if (id.includes('pages/editor') || id.includes('components/editor')) {
            return 'editor-module';
          }
          
          // SRS Module (Flashcards, Review)
          if (id.includes('FlashcardReviewPage') || 
              id.includes('StatisticsDashboard') || 
              id.includes('UserDashboard')) {
            return 'srs-module';
          }
          
          // Data chunks - Tách data lớn
          // Level data (books, quizzes data)
          if (id.includes('data/level')) {
            return 'level-data';
          }
          
          // JLPT data (exams, dictionary)
          if (id.includes('data/jlpt') || id.includes('jlptDictionary')) {
            return 'jlpt-data';
          }
          
          // Services chunks
          if (id.includes('services/')) {
            // Auth services
            if (id.includes('authService') || id.includes('userManagementService')) {
              return 'auth-services';
            }
            // Other services
            return 'services';
          }
          
          // Components chunks
          if (id.includes('components/')) {
            // Dictionary components (có thể lớn)
            if (id.includes('api_translate') || id.includes('Dictionary')) {
              return 'dictionary-components';
            }
            // Other components
            return 'components';
          }
        }
      }
    }
  }
})