// src/services/authService.js
// Thin wrapper around Supabase auth so that UI không phụ thuộc trực tiếp vào SDK

import { supabase } from './supabaseClient.js';

/**
 * Đăng ký user mới với email + password
 */
export async function signUp({ email, password, displayName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || null,
      },
    },
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * Đăng nhập bằng email + password
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * Đăng xuất
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error };
  }
  return { success: true };
}

/**
 * Lấy thông tin user hiện tại (nếu đã đăng nhập)
 */
export async function getCurrentUser() {
  // ✅ Kiểm tra xem Supabase có được config không
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase chưa được config → return false
    return { success: false, error: new Error('Supabase not configured'), user: null };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error, user: null };
    }

    return { success: true, user };
  } catch (err) {
    // Lỗi khi gọi Supabase → return false
    console.warn('[AuthService] Error getting current user:', err.message);
    return { success: false, error: err, user: null };
  }
}

/**
 * Dev helper: in ra console trạng thái Supabase auth hiện tại.
 * Không dùng cho logic thật, chỉ để kiểm tra kết nối.
 */
export async function testSupabaseConnection() {
  try {
    const { success, user, error } = await getCurrentUser();
    if (!success) {
      // eslint-disable-next-line no-console
      console.error('[Supabase][Test] Error getting current user:', error?.message || error);
      return;
    }
    // eslint-disable-next-line no-console
    console.log(
      '[Supabase][Test] Connection OK. Current user:',
      user ? { id: user.id, email: user.email } : 'No user logged in'
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Supabase][Test] Unexpected error:', err);
  }
}

/**
 * Lấy profile (role, display_name, ...) từ bảng profiles theo user_id
 */
export async function getUserProfile(userId) {
  if (!userId) {
    return { success: false, error: new Error('Missing userId'), profile: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { success: false, error, profile: null };
  }

  return { success: true, profile: data };
}

/**
 * Lấy tất cả profiles từ Supabase (nếu RLS cho phép)
 * Note: Có thể không hoạt động nếu RLS chỉ cho phép user xem profile của chính họ
 */
export async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

  if (error) {
    console.warn('[Supabase] Cannot fetch all profiles (RLS restriction?):', error.message);
    return { success: false, error, profiles: [] };
  }

  return { success: true, profiles: data || [] };
  } catch (err) {
    console.error('[Supabase] Error fetching profiles:', err);
    return { success: false, error: err, profiles: [] };
  }
}




