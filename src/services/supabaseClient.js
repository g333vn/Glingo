// src/services/supabaseClient.js
// 🔌 Supabase Client Configuration
// Single point of Supabase client creation and configuration

import { createClient } from '@supabase/supabase-js';

/**
 * ========================================
 * ENVIRONMENT VARIABLES
 * ========================================
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * ========================================
 * VALIDATION
 * ========================================
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ⚠️  Missing configuration:',
    !supabaseUrl ? 'VITE_SUPABASE_URL' : '',
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''
  );
  console.warn('[Supabase] ℹ️  Set these in .env.local to enable Supabase features');
}

/**
 * ========================================
 * CREATE CLIENT
 * ========================================
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // ✅ Session persistence - automatically restore session on page reload
    persistSession: true,

    // ✅ Auto-refresh token before expiry
    autoRefreshToken: true,

    // ✅ Use localStorage for session storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // ✅ Custom storage key for debugging
    storageKey: 'sb-glingo-auth-token',

    // ✅ Detect OAuth redirects (for social login)
    detectSessionInUrl: true,

    // ✅ Use PKCE flow (recommended for web apps)
    flowType: 'pkce',
  },

  // ✅ Global configuration
  db: {
    schema: 'public',
  },

  // ✅ Realtime configuration (for subscriptions)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Test if Supabase is configured
 * @returns {boolean} True if both URL and key are set
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Get current Supabase URL
 * @returns {string|null}
 */
export function getSupabaseUrl() {
  return supabaseUrl || null;
}

/**
 * Get current Supabase project name
 * @returns {string|null}
 */
export function getSupabaseProjectName() {
  if (!supabaseUrl) return null;
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

/**
 * ========================================
 * EXPORTS
 * ========================================
 */

export default supabase;

/**
 * ========================================
 * TYPES (for TypeScript/JSDoc)
 * ========================================
 * 
 * Supabase client methods:
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
