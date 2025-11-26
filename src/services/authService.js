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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { success: false, error, user: null };
  }

  return { success: true, user };
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




