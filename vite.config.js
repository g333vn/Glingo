import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// ✅ FIX: Plugin to transform unsafe React.version access in node_modules
const reactVersionTransformPlugin = () => {
  return {
    name: 'react-version-transform',
    enforce: 'pre', // Run before other transforms
    transform(code, id) {
      // ✅ CRITICAL: Transform unsafe React.version access in node_modules
      // Fix antd and rc-util code that accesses React.version immediately
      if (id.includes('node_modules') && 
          (id.includes('antd') || id.includes('rc-util')) &&
          code.includes('version.split')) {
        
        // Pattern 1: React.version.split('.')[0]
        if (code.includes('React.version.split')) {
          code = code.replace(
            /React\.version\.split\(['"]\.['"]\)\[0\]/g,
            '(React && React.version ? React.version.split(".")[0] : "19")'
          );
          code = code.replace(
            /Number\.parseInt\(React\.version\.split\(['"]\.['"]\)\[0\]/g,
            'Number.parseInt(React && React.version ? React.version.split(".")[0] : "19"'
          );
        }
        
        // Pattern 2: _react.version.split('.')[0] (rc-util)
        if (code.includes('_react.version.split') || code.includes('react.version.split')) {
          // Fix: Number(_react.version.split('.')[0])
          code = code.replace(
            /Number\((_react|react)\.version\.split\(['"]\.['"]\)\[0\]\)/g,
            'Number(($1 && $1.version ? $1.version.split(".")[0] : "19"))'
          );
          // Fix: var ReactMajorVersion = Number(_react.version.split('.')[0]);
          code = code.replace(
            /(_react|react)\.version\.split\(['"]\.['"]\)\[0\]/g,
            '($1 && $1.version ? $1.version.split(".")[0] : "19")'
          );
        }
      }
      
      return code;
    },
    generateBundle(options, bundle) {
      // ✅ CRITICAL: Fix ALL React.version access patterns in vendor chunks AFTER bundling
      // This runs after all transforms, so we can fix the final bundled code
      // Patterns to fix: p.version, b.version, React.version, _react.version, Xo.version, etc.
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          // Fix ALL patterns: Number(anyVar.version.split(".")[0])
          // This catches: p.version, b.version, React.version, _react.version, Xo.version, etc.
          if (chunk.code.includes('.version.split') && chunk.code.includes('Number')) {
            // Pattern 1: var Gi=Number(b.version.split(".")[0])
            chunk.code = chunk.code.replace(
              /var\s+(\w+)\s*=\s*Number\((\w+)\.version\.split\(["']\.["']\)\[0\]\)/g,
              (match, varName, reactVar) => {
                return `var ${varName}=(typeof ${reactVar}!=='undefined'&&${reactVar}&&${reactVar}.version?Number(${reactVar}.version.split(".")[0]):19)`;
              }
            );
            
            // Pattern 2: const Gi=Number(b.version.split(".")[0])
            chunk.code = chunk.code.replace(
              /const\s+(\w+)\s*=\s*Number\((\w+)\.version\.split\(["']\.["']\)\[0\]\)/g,
              (match, varName, reactVar) => {
                return `const ${varName}=(typeof ${reactVar}!=='undefined'&&${reactVar}&&${reactVar}.version?Number(${reactVar}.version.split(".")[0]):19)`;
              }
            );
            
            // Pattern 3: Number((Xo||"").split(".")[0]) - already has fallback, but ensure safety
            chunk.code = chunk.code.replace(
              /Number\(\((\w+)\|\|["']{2}\)\.split\(["']\.["']\)\[0\]\)/g,
              (match, reactVar) => {
                return `Number((typeof ${reactVar}!=='undefined'&&${reactVar}&&${reactVar}.version?${reactVar}.version.split(".")[0]:"19"))`;
              }
            );
            
            // Pattern 4: var li=Number(p.version.split(".")[0]) - original pattern
            chunk.code = chunk.code.replace(
              /var\s+li\s*=\s*Number\(p\.version\.split\(["']\.["']\)\[0\]\)/g,
              'var li=(typeof p!==\'undefined\'&&p&&p.version?Number(p.version.split(".")[0]):19)'
            );
            
            // Pattern 5: li=Number(p.version.split(".")[0])
            chunk.code = chunk.code.replace(
              /li\s*=\s*Number\(p\.version\.split\(["']\.["']\)\[0\]\)/g,
              'li=(typeof p!==\'undefined\'&&p&&p.version?Number(p.version.split(".")[0]):19)'
            );
            
            // Pattern 6: const li=Number(p.version.split(".")[0])
            chunk.code = chunk.code.replace(
              /const\s+li\s*=\s*Number\(p\.version\.split\(["']\.["']\)\[0\]\)/g,
              'const li=(typeof p!==\'undefined\'&&p&&p.version?Number(p.version.split(".")[0]):19)'
            );
          }
        }
      });
    }
  }
}

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
      
      // ✅ CRITICAL: Ensure react-vendor loads FIRST using BLOCKING preload
      // modulepreload is non-blocking, we need blocking preload for react-vendor
      const modulepreloadRegex = /<link[^>]*rel=["']modulepreload["'][^>]*>/gi;
      const allPreloads = html.match(modulepreloadRegex) || [];
      
      if (allPreloads.length > 0) {
        const reactVendor = allPreloads.find(link => link.includes('react-vendor'));
        const antdVendor = allPreloads.find(link => link.includes('antd-vendor'));
        const vendor = allPreloads.find(link => link.includes('vendor') && !link.includes('antd-vendor') && !link.includes('react-vendor') && !link.includes('router-vendor') && !link.includes('supabase-vendor') && !link.includes('storage-vendor'));
        const otherPreloads = allPreloads.filter(link => link !== reactVendor && link !== antdVendor && link !== vendor);
        
        // Remove all modulepreload links
        allPreloads.forEach(link => {
          html = html.replace(link, '');
        });
        
        // ✅ CRITICAL: Convert react-vendor to BLOCKING preload (not modulepreload)
        // This ensures react-vendor loads BEFORE any other code executes
        let reactVendorPreload = reactVendor;
        if (reactVendor) {
          // Extract href from modulepreload link
          const hrefMatch = reactVendor.match(/href=["']([^"']+)["']/);
          if (hrefMatch) {
            const href = hrefMatch[1];
            // Create BLOCKING preload link (not modulepreload)
            // Use 'fetch' instead of 'script' to ensure it loads before module execution
            reactVendorPreload = `<link rel="preload" href="${href}" as="fetch" crossorigin>`;
          }
        }
        
        // Re-insert in correct order: react-vendor FIRST (as blocking preload), then others
        const scriptMatch = html.match(/<script[^>]*type=["']module["'][^>]*>/i);
        if (scriptMatch) {
          let newPreloads = '';
          // ✅ CRITICAL: react-vendor as BLOCKING preload FIRST
          if (reactVendorPreload) newPreloads += '    ' + reactVendorPreload + '\n';
          // Then antd-vendor and vendor as modulepreload
          if (antdVendor) newPreloads += '    ' + antdVendor + '\n';
          if (vendor) newPreloads += '    ' + vendor + '\n';
          otherPreloads.forEach(link => {
            newPreloads += '    ' + link + '\n';
          });
          // Insert BEFORE the script tag
          html = html.replace(scriptMatch[0], newPreloads + '    ' + scriptMatch[0]);
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
          
          // ✅ CRITICAL FIX: If vendor chunk accesses p.version immediately after import,
          // wrap it in a safety check to ensure p is defined
          // Pattern: var li=Number(p.version.split(".")[0])
          if (fileName.includes('vendor') && !fileName.includes('react-vendor') && 
              chunk.code.includes('p.version') && chunk.code.includes('Number(p.version.split')) {
            // Replace unsafe access with safe version
            chunk.code = chunk.code.replace(
              /var\s+li\s*=\s*Number\(p\.version\.split\(["']\.["']\)\[0\]\)/g,
              'var li=(p&&p.version?Number(p.version.split(".")[0]):19)'
            );
          }
          
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    reactVersionTransformPlugin(), // ✅ CRITICAL: Transform React.version access FIRST
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
    // ✅ CRITICAL: Ensure React is only loaded once
    // This prevents multiple React instances and ensures React is available
    dedupe: ['react', 'react-dom'],
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
          // Ensure react-vendor has a predictable name that loads first
          if (chunkInfo.name === 'react-vendor') {
            return 'assets/react-vendor-[hash].js';
          }
          if (chunkInfo.name === 'antd-vendor') {
            return 'assets/antd-vendor-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        // ✅ CRITICAL FIX: KHÔNG tách React ra chunk riêng
        // Để React ở entry chunk đảm bảo React LUÔN load TRƯỚC tất cả code khác
        // Đây là cách DUY NHẤT để fix lỗi p.version undefined
        manualChunks: (id) => {
          // Vendor chunks - Tách riêng các thư viện lớn
          if (id.includes('node_modules')) {
            // ✅ CRITICAL: KHÔNG tách React, React-DOM, Scheduler
            // Để chúng ở trong entry chunk để load ĐỒNG BỘ
            // ❌ KHÔNG LÀM: if (id.includes('react/') || id.includes('react-dom/')) return 'react-vendor';
            
            // React Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Ant Design (UI library - lớn)
            if (id.includes('antd') || id.includes('@ant-design')) {
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
            // Other vendor code (but NOT React)
            if (!id.includes('react/') && !id.includes('react-dom/') && !id.includes('scheduler')) {
              return 'vendor';
            }
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