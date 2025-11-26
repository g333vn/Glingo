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
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;


