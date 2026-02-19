// src/services/supabaseClient.js
// Cấu hình Supabase Client (Client Supabase)
// Điểm tạo và cấu hình Supabase client duy nhất

import { createClient } from '@supabase/supabase-js';

/**
 * ========================================
 * ENVIRONMENT VARIABLES (Biến môi trường)
 * ========================================
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * ========================================
 * VALIDATION (Kiểm tra)
 * ========================================
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ⚠️  Thiếu cấu hình:',
    !supabaseUrl ? 'VITE_SUPABASE_URL' : '',
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''
  );
  console.warn('[Supabase] ℹ️  Đặt các biến này trong .env.local để bật tính năng Supabase');
}

/**
 * ========================================
 * CREATE CLIENT (Tạo Client)
 * ========================================
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // Session persistence (Duy trì phiên) - tự động khôi phục session khi tải lại trang
    persistSession: true,

    // Auto-refresh token (Tự động làm mới token) trước khi hết hạn
    autoRefreshToken: true,

    // Sử dụng localStorage để lưu trữ session
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // Custom storage key (Khóa lưu trữ tùy chỉnh) để debug
    storageKey: 'sb-glingo-auth-token',

    // Detect OAuth redirects (Phát hiện chuyển hướng OAuth) cho social login
    detectSessionInUrl: true,

    // Use PKCE flow (Sử dụng luồng PKCE) - khuyến nghị cho web apps
    flowType: 'pkce',
  },

  // Global configuration (Cấu hình toàn cục)
  db: {
    schema: 'public',
  },

  // Realtime configuration (Cấu hình Realtime) cho subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * ========================================
 * UTILITY FUNCTIONS (Hàm tiện ích)
 * ========================================
 */

/**
 * Test if Supabase is configured (Kiểm tra xem Supabase đã được cấu hình chưa)
 * @returns {boolean} True nếu cả URL và key đều được đặt
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Get current Supabase URL (Lấy URL Supabase hiện tại)
 * @returns {string|null}
 */
export function getSupabaseUrl() {
  return supabaseUrl || null;
}

/**
 * Get current Supabase project name (Lấy tên dự án Supabase hiện tại)
 * @returns {string|null}
 */
export function getSupabaseProjectName() {
  if (!supabaseUrl) return null;
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

/**
 * ========================================
 * EXPORTS (Xuất)
 * ========================================
 */

export default supabase;

/**
 * ========================================
 * TYPES (Kiểu dữ liệu) - for TypeScript/JSDoc
 * ========================================
 * 
 * Supabase client methods (Các phương thức của Supabase client):
 * 
 * - supabase.auth.signUp({ email, password, options })
 * - supabase.auth.signInWithPassword({ email, password })
 * - supabase.auth.signOut()
 * - supabase.auth.getSession()
 * - supabase.auth.getUser()
 * - supabase.auth.updateUser({ password, data })
 * - supabase.auth.resetPasswordForEmail(email, options)
 * - supabase.auth.onAuthStateChange(callback)
 * 
 * - supabase.from(tableName).select(columns)
 * - supabase.from(tableName).insert(data)
 * - supabase.from(tableName).update(data).eq(column, value)
 * - supabase.from(tableName).delete().eq(column, value)
 * 
 * - supabase.storage.from(bucketName).upload(path, file)
 * - supabase.storage.from(bucketName).download(path)
 * - supabase.storage.from(bucketName).remove(paths)
 */
