// src/services/supabaseClient.js
// ✅ Single place to create and export Supabase client

import { createClient } from '@supabase/supabase-js';

// Lấy config từ biến môi trường Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Log cảnh báo trong dev để bạn dễ phát hiện cấu hình sai
  // Không throw lỗi cứng để app vẫn chạy offline khi chưa setup Supabase
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase features will be disabled.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ✅ Session persistence
    persistSession: true,
    autoRefreshToken: true,

    // ✅ CRITICAL FIX: Explicit storage adapter for production
    // Ensures session tokens are stored in localStorage even on Vercel/production
    storage: window?.localStorage,

    // ✅ Custom storage key for better debugging
    storageKey: 'sb-glingo-auth-token',

    // ✅ Detect OAuth redirects (needed for social logins)
    detectSessionInUrl: true,

    // ✅ Use PKCE flow (recommended for web apps)
    flowType: 'pkce',
  },
});

export default supabase;


