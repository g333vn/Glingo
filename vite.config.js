import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
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
        // ✅ PHASE 1: Code Splitting - Route-based chunking strategy
        manualChunks: (id) => {
          // Vendor chunks - Tách riêng các thư viện lớn
          if (id.includes('node_modules')) {
            // ✅ FIX: Bundle React with Ant Design to ensure React is available
            // Check more specific packages first to avoid false matches
            
            // React Router (check before react to avoid matching react-router as react)
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Ant Design (UI library - lớn)
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            // React core (react, react-dom) - bundle with antd-vendor to ensure availability
            // ✅ CRITICAL: Include React in antd-vendor chunk to fix createContext error
            // This ensures React is available when Ant Design loads
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
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