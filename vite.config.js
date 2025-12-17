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
  server: {
    // ✅ Cấu hình để xử lý SPA routing - redirect tất cả routes về index.html
    historyApiFallback: true
  },
  build: {
    // ========================================
    // 🔒 PRODUCTION SECURITY CONFIG
    // ========================================
    
    // ✅ Minify JS/CSS
    minify: 'esbuild',
    
    // ✅ Tắt source map trên production (F12 Sources không xem được code gốc)
    // Đổi thành 'hidden-source-map' nếu muốn debug production qua error tracking (Sentry)
    sourcemap: false,
    
    // ✅ Esbuild options cho production
    esbuild: {
      // 🔒 SECURITY: Drop debugger statements
      drop: ['debugger'],
      
      // 🔒 SECURITY: Drop ALL console methods (log, warn, error, info, debug)
      pure: ['console.log', 'console.warn', 'console.info', 'console.debug', 'console.trace'],
      
      // ✅ Xoá comment khỏi bundle
      legalComments: 'none',
    },
    
    rollupOptions: {
      output: {
        // ✅ CODE SPLITTING: Tách vendor libraries thành chunks riêng
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // UI libraries
          'vendor-ui': ['antd', '@ant-design/icons'],
        }
      }
    },
    // Tăng warning limit vì đã split chunks
    chunkSizeWarningLimit: 600
  }
})