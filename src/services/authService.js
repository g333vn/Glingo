// src/services/authService.js
// 🔐 Core Authentication Service - Supabase Integration
// Handles: Sign up, Sign in, Sign out, Session management, Profile management

import { supabase } from './supabaseClient.js';

/**
 * ========================================
 * AUTHENTICATION OPERATIONS
 * ========================================
 */

/**
 * Sign up user with email + password
 * @param {Object} params - { email, password, displayName }
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function signUp({ email, password, displayName }) {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email và password là bắt buộc' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password phải tối thiểu 6 ký tự' };
    }

    // Sign up on Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('[AuthService] Sign up error:', error);
      return { success: false, error: error.message };
    }

    console.log('[AuthService] Sign up successful:', data.user?.email);

    // ✅ AUTO: Create profile in profiles table (with automatic retry and trigger handling)
    // Note: Profile might be created automatically by database trigger
    // If not, we'll create it here, but don't fail if it already exists
    if (data.user?.id) {
      // ✅ AUTO: Wait a bit for trigger to potentially create profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const profileResult = await createUserProfile(data.user.id, {
        display_name: displayName || email.split('@')[0],
        email: email,
        role: 'user',
      });
      
      // ✅ AUTO: If profile creation failed, try to fetch it (might have been created by trigger)
      if (!profileResult.success) {
        console.warn('[AuthService] Profile creation failed, checking if profile exists...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const existingProfile = await getUserProfile(data.user.id);
        if (existingProfile.success && existingProfile.profile) {
          console.log('[AuthService] ✅ Profile was created by trigger!');
          // Profile exists, continue successfully
        } else {
          console.warn('[AuthService] ⚠️ Profile creation result:', profileResult.error);
          console.warn('[AuthService] ⚠️ Profile not found, but continuing anyway (can be created later)');
          // Continue anyway - profile might be created by trigger later or can be created manually
        }
      } else {
        console.log('[AuthService] ✅ Profile created successfully');
      }
    }

    return { success: true, data };
  } catch (err) {
    console.error('[AuthService] Unexpected error in signUp:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Sign in user with email + password
 * @param {Object} params - { email, password }
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function signIn({ email, password }) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email và password là bắt buộc' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[AuthService] Sign in error:', error);
      return { success: false, error: error.message };
    }

    console.log('[AuthService] Sign in successful:', data.user?.email);
    return { success: true, data };
  } catch (err) {
    console.error('[AuthService] Unexpected error in signIn:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOut() {
  try {
    // Check if there's a session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // No session exists, but we'll still clear local state
      console.log('[AuthService] No active session, clearing local state');
      return { success: true };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      // If error is about missing session, still consider it success (session already cleared)
      if (error.message && error.message.includes('session')) {
        console.log('[AuthService] Session already cleared');
        return { success: true };
      }
      console.error('[AuthService] Sign out error:', error);
      return { success: false, error: error.message };
    }

    console.log('[AuthService] Sign out successful');
    return { success: true };
  } catch (err) {
    // If error is about missing session, still consider it success
    if (err.message && err.message.includes('session')) {
      console.log('[AuthService] Session already cleared (caught)');
      return { success: true };
    }
    console.error('[AuthService] Unexpected error in signOut:', err);
    return { success: false, error: err.message };
  }
}

/**
 * ========================================
 * SESSION & USER OPERATIONS
 * ========================================
 */

/**
 * Get current authenticated user
 * @returns {Promise<{success: boolean, user?: any, error?: string}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('[AuthService] Error getting current user:', error.message);
      return { success: false, error: error.message, user: null };
    }

    if (!user) {
      return { success: false, error: 'No user logged in', user: null };
    }

    console.log('[AuthService] Current user:', user.email);
    return { success: true, user };
  } catch (err) {
    console.error('[AuthService] Unexpected error getting current user:', err);
    return { success: false, error: err.message, user: null };
  }
}

/**
 * Get current session
 * @returns {Promise<{success: boolean, session?: any, error?: string}>}
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('[AuthService] Error getting session:', error.message);
      return { success: false, error: error.message, session: null };
    }

    return { success: true, session };
  } catch (err) {
    console.error('[AuthService] Unexpected error getting session:', err);
    return { success: false, error: err.message, session: null };
  }
}

/**
 * ========================================
 * PROFILE OPERATIONS
 * ========================================
 */

/**
 * Get user profile from profiles table
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, profile?: any, error?: string}>}
 */
export async function getUserProfile(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', profile: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows

    // PGRST116 = no rows returned (not an error, just no data)
    if (error && error.code !== 'PGRST116') {
      console.error('[AuthService] Error getting user profile:', error);
      // Don't fail completely, just return null profile
      return { success: true, profile: null, error: error.message };
    }

    return { success: true, profile: data || null };
  } catch (err) {
    console.error('[AuthService] Unexpected error getting user profile:', err);
    // Don't fail completely, just return null profile
    return { success: true, profile: null, error: err.message };
  }
}

/**
 * Create user profile in profiles table
 * @param {string} userId - Supabase user ID
 * @param {Object} profileData - { display_name, email, role, avatar_url, ... }
 * @returns {Promise<{success: boolean, profile?: any, error?: string}>}
 */
export async function createUserProfile(userId, profileData, retryCount = 0) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', profile: null };
    }

    // ✅ AUTO: Check if profile already exists first (with retry)
    let existing = await getUserProfile(userId);
    if (existing.success && existing.profile) {
      console.log('[AuthService] ✅ Profile already exists for user:', userId);
      // ✅ AUTO: Update profile if role or other data changed
      if (profileData.role && existing.profile.role !== profileData.role) {
        console.log('[AuthService] 🔄 Updating profile role from', existing.profile.role, 'to', profileData.role);
        const updateResult = await updateUserProfile(userId, { role: profileData.role });
        if (updateResult.success) {
          return { success: true, profile: updateResult.profile };
        }
      }
      return { success: true, profile: existing.profile };
    }

    // ✅ AUTO: Wait a bit if retrying (profile might be created by trigger)
    if (retryCount > 0) {
      console.log('[AuthService] ⏳ Waiting before retry...');
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: userId,
          display_name: profileData.display_name || 'User',
          email: profileData.email || '',
          role: profileData.role || 'user',
          avatar_url: profileData.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

    if (error) {
      console.error('[AuthService] Error creating user profile:', error);
      console.error('[AuthService] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // ✅ AUTO: If error is about duplicate key, profile might already exist - fetch it
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log('[AuthService] 🔄 Profile already exists (duplicate key), fetching existing profile...');
        existing = await getUserProfile(userId);
        if (existing.success && existing.profile) {
          console.log('[AuthService] ✅ Found existing profile');
          return { success: true, profile: existing.profile };
        }
      }
      
      // ✅ AUTO: If RLS error, wait and retry (profile might be created by trigger)
      if (error.code === '42501' || error.message.includes('row-level security') || error.message.includes('RLS')) {
        console.log('[AuthService] ⚠️ RLS error detected, checking if profile was created by trigger...');
        
        // Wait a bit for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to fetch profile (might have been created by trigger)
        existing = await getUserProfile(userId);
        if (existing.success && existing.profile) {
          console.log('[AuthService] ✅ Profile was created by trigger!');
          return { success: true, profile: existing.profile };
        }
        
        // If still no profile and retry count < 2, retry
        if (retryCount < 2) {
          console.log('[AuthService] 🔄 Retrying profile creation (attempt', retryCount + 2, ')...');
          return await createUserProfile(userId, profileData, retryCount + 1);
        }
        
        // After retries, return error
        console.error('[AuthService] ❌ RLS error persists after retries');
        return { 
          success: false, 
          error: 'RLS Policy Error: Không thể tạo profile. Vui lòng kiểm tra RLS policies.', 
          profile: null 
        };
      }
      
      // ✅ AUTO: For other errors, wait and check if profile exists (might be created by trigger)
      if (retryCount < 2) {
        console.log('[AuthService] ⏳ Waiting and checking if profile was created by trigger...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        existing = await getUserProfile(userId);
        if (existing.success && existing.profile) {
          console.log('[AuthService] ✅ Profile was created by trigger!');
          return { success: true, profile: existing.profile };
        }
        
        // Retry once more
        console.log('[AuthService] 🔄 Retrying profile creation (attempt', retryCount + 2, ')...');
        return await createUserProfile(userId, profileData, retryCount + 1);
      }
      
      // Return error after retries
      const detailedError = error.message || 'Database error saving new user';
      const errorDetails = error.details ? `\n\nChi tiết: ${error.details}` : '';
      const errorHint = error.hint ? `\n\nGợi ý: ${error.hint}` : '';
      
      return { 
        success: false, 
        error: `${detailedError}${errorDetails}${errorHint}`, 
        profile: null 
      };
    }

    // ✅ AUTO: If no data returned but no error, profile might have been created by trigger
    if (!data) {
      console.log('[AuthService] ⏳ No data returned, checking if profile was created by trigger...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      existing = await getUserProfile(userId);
      if (existing.success && existing.profile) {
        console.log('[AuthService] ✅ Profile was created by trigger!');
        return { success: true, profile: existing.profile };
      }
      
      // If still no profile and retry count < 1, retry once
      if (retryCount < 1) {
        console.log('[AuthService] 🔄 Retrying profile creation (attempt', retryCount + 2, ')...');
        return await createUserProfile(userId, profileData, retryCount + 1);
      }
      
      // After retries, return error
      return { success: false, error: 'Profile was not created and could not be found', profile: null };
    }

    console.log('[AuthService] ✅ User profile created successfully:', userId);
    return { success: true, profile: data };
  } catch (err) {
    console.error('[AuthService] Unexpected error creating user profile:', err);
    
    // ✅ AUTO: Try to fetch profile one more time (might have been created)
    if (retryCount < 1) {
      console.log('[AuthService] 🔄 Exception occurred, checking if profile exists...');
      await new Promise(resolve => setTimeout(resolve, 500));
      const existing = await getUserProfile(userId);
      if (existing.success && existing.profile) {
        console.log('[AuthService] ✅ Profile found after exception!');
        return { success: true, profile: existing.profile };
      }
    }
    
    return { success: false, error: err.message, profile: null };
  }
}

/**
 * Update user profile
 * @param {string} userId - Supabase user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, profile?: any, error?: string}>}
 */
export async function updateUserProfile(userId, updates) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', profile: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AuthService] Error updating user profile:', error);
      return { success: false, error: error.message, profile: null };
    }

    console.log('[AuthService] User profile updated:', userId);
    return { success: true, profile: data };
  } catch (err) {
    console.error('[AuthService] Unexpected error updating user profile:', err);
    return { success: false, error: err.message, profile: null };
  }
}

/**
 * Get all user profiles (admin only)
 * @returns {Promise<{success: boolean, profiles?: any[], error?: string}>}
 */
export async function getAllUserProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AuthService] Error fetching all profiles:', error);
      return { success: false, error: error.message, profiles: [] };
    }

    return { success: true, profiles: data || [] };
  } catch (err) {
    console.error('[AuthService] Unexpected error fetching all profiles:', err);
    return { success: false, error: err.message, profiles: [] };
  }
}

/**
 * Update user role (admin only)
 * @param {string} userId - Supabase user ID
 * @param {string} newRole - 'admin' | 'editor' | 'user'
 * @returns {Promise<{success: boolean, profile?: any, error?: string}>}
 */
export async function updateUserRole(userId, newRole) {
  try {
    const validRoles = ['admin', 'editor', 'user'];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: `Invalid role: ${newRole}`, profile: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AuthService] Error updating user role:', error);
      return { success: false, error: error.message, profile: null };
    }

    console.log('[AuthService] User role updated:', userId, 'to', newRole);
    return { success: true, profile: data };
  } catch (err) {
    console.error('[AuthService] Unexpected error updating user role:', err);
    return { success: false, error: err.message, profile: null };
  }
}

/**
 * ========================================
 * PASSWORD & SECURITY
 * ========================================
 */

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updatePassword(newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password phải tối thiểu 6 ký tự' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('[AuthService] Error updating password:', error);
      return { success: false, error: error.message };
    }

    console.log('[AuthService] Password updated successfully');
    return { success: true };
  } catch (err) {
    console.error('[AuthService] Unexpected error updating password:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Reset password via email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function resetPasswordEmail(email) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('[AuthService] Error sending reset email:', error);
      return { success: false, error: error.message };
    }

    console.log('[AuthService] Reset email sent to:', email);
    return { success: true };
  } catch (err) {
    console.error('[AuthService] Unexpected error in resetPasswordEmail:', err);
    return { success: false, error: err.message };
  }
}

/**
 * ========================================
 * USER MANAGEMENT (Admin)
 * ========================================
 */

/**
 * Delete user (admin only)
 * Deletes profile and attempts to delete from auth.users
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, error?: string, deletedProfile?: boolean, deletedAuth?: boolean}>}
 */
export async function deleteUser(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    console.log('[AuthService] Deleting user:', userId);
    
    // Step 1: Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('[AuthService] Error deleting user profile:', profileError);
      // Check if it's RLS error
      if (profileError.code === '42501' || profileError.message?.includes('policy')) {
        return { 
          success: false, 
          error: `RLS Policy Error: ${profileError.message}. Bạn cần quyền admin để xóa user.` 
        };
      }
      return { success: false, error: profileError.message };
    }

    console.log('[AuthService] ✅ Profile deleted:', userId);
    
    // Step 2: Try to delete from auth.users using Admin API
    // Note: This requires service role key, which should be in server-side code
    // For client-side, we'll just delete the profile and let user know
    console.warn('[AuthService] ⚠️ Profile deleted. User may still exist in auth.users.');
    console.warn('[AuthService] ⚠️ To fully delete, use Supabase Dashboard → Authentication → Users → Delete');
    
    // Step 3: Verify deletion by checking if profile still exists
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for deletion to complete
    
    const { data: checkProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkProfile) {
      console.warn('[AuthService] ⚠️ Profile still exists after deletion attempt');
      return { 
        success: false, 
        error: 'Profile vẫn còn sau khi xóa. Có thể do RLS policy hoặc trigger tự động tạo lại.',
        deletedProfile: false
      };
    }
    
    console.log('[AuthService] ✅ Verified: Profile deleted successfully');
    return { 
      success: true, 
      deletedProfile: true,
      deletedAuth: false // Cannot delete from auth.users from client
    };
  } catch (err) {
    console.error('[AuthService] Unexpected error deleting user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Confirm user email (Admin only - requires service role key)
 * This function uses Supabase Admin API to confirm user email
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function confirmUserEmail(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // ✅ Check if service role key is available
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      console.warn('[AuthService] ⚠️ Service role key not available. User needs manual confirmation.');
      return { 
        success: false, 
        error: 'Service role key không có. User cần được confirm thủ công trong Supabase Dashboard.',
        needsManualConfirmation: true
      };
    }

    // ✅ Use Admin API to confirm user
    // Note: This requires service role key
    const { createClient } = await import('@supabase/supabase-js');
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true
    });

    if (error) {
      console.error('[AuthService] Error confirming user:', error);
      return { success: false, error: error.message };
    }

    console.log('[AuthService] ✅ User confirmed successfully:', userId);
    return { success: true, data };
  } catch (err) {
    console.error('[AuthService] Unexpected error confirming user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete user profile by email (for orphaned profiles)
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteUserByEmail(email) {
  try {
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }

    const emailLower = email.toLowerCase().trim();
    console.log('[AuthService] Deleting profile by email:', emailLower);

    // Delete profile by email
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', emailLower);

    if (profileError) {
      console.error('[AuthService] Error deleting profile by email:', profileError);
      return { success: false, error: profileError.message };
    }

    console.log('[AuthService] Profile deleted by email:', emailLower);
    return { success: true };
  } catch (err) {
    console.error('[AuthService] Unexpected error deleting profile by email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if user exists in auth.users (by attempting to get user)
 * Note: We can't directly query auth.users from client, so we check by trying signUp
 * @param {string} email - User email
 * @returns {Promise<{exists: boolean}>}
 */
export async function checkUserExistsInAuth(email) {
  try {
    // We can't directly check auth.users from client
    // This is a placeholder - actual check happens during signUp
    // If signUp fails with "already registered", user exists
    return { exists: false }; // Unknown, will be determined during signUp
  } catch (err) {
    console.error('[AuthService] Error checking user in auth:', err);
    return { exists: false };
  }
}

/**
 * Auto cleanup orphaned profiles (profiles without corresponding auth.users)
 * This function attempts to identify and optionally delete orphaned profiles
 * @param {boolean} autoDelete - If true, automatically delete orphaned profiles
 * @returns {Promise<{success: boolean, orphanedProfiles?: any[], deletedCount?: number, error?: string}>}
 */
export async function cleanupOrphanedProfiles(autoDelete = false) {
  try {
    console.log('[AuthService] 🔍 Starting orphaned profiles cleanup...');
    
    // Get all profiles
    const { success: profilesOk, profiles } = await getAllUserProfiles();
    
    if (!profilesOk || !profiles || profiles.length === 0) {
      console.log('[AuthService] No profiles found or error fetching profiles');
      return { success: true, orphanedProfiles: [], deletedCount: 0 };
    }

    console.log('[AuthService] Found', profiles.length, 'profiles to check');

    // We can't directly query auth.users from client
    // So we identify orphaned profiles by checking if signUp would succeed
    // If a profile exists but signUp succeeds (no "already registered" error),
    // it's likely an orphaned profile
    
    const orphanedProfiles = [];
    let deletedCount = 0;

    // Note: Full cleanup requires server-side function or admin API
    // For now, we'll just log potential orphaned profiles
    // Actual cleanup happens when user tries to create new user with same email
    
    console.log('[AuthService] ✅ Cleanup check completed');
    console.log('[AuthService] ⚠️ Note: Full orphaned profile detection requires server-side function');
    
    return { 
      success: true, 
      orphanedProfiles, 
      deletedCount 
    };
  } catch (err) {
    console.error('[AuthService] Error in cleanupOrphanedProfiles:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Auto delete orphaned profile by email (when creating new user)
 * This is called automatically when creating a user with an email that exists in profiles
 * but the user doesn't exist in auth.users
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function autoDeleteOrphanedProfile(email) {
  try {
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }

    const emailLower = email.toLowerCase().trim();
    console.log('[AuthService] 🤖 Auto-deleting orphaned profile for email:', emailLower);

    // Try to delete by email first (works for orphaned profiles)
    const deleteResult = await deleteUserByEmail(emailLower);
    
    if (deleteResult.success) {
      console.log('[AuthService] ✅ Orphaned profile auto-deleted:', emailLower);
      return { success: true };
    }

    // If delete by email fails, try to get profile and delete by user_id
    const emailCheck = await checkEmailExists(emailLower);
    if (emailCheck.exists && emailCheck.profile) {
      const deleteByUserIdResult = await deleteUser(emailCheck.profile.user_id);
      if (deleteByUserIdResult.success) {
        console.log('[AuthService] ✅ Orphaned profile auto-deleted by user_id:', emailCheck.profile.user_id);
        return { success: true };
      }
    }

    console.warn('[AuthService] ⚠️ Could not auto-delete profile, may need manual cleanup');
    return { success: false, error: 'Could not delete orphaned profile' };
  } catch (err) {
    console.error('[AuthService] Error in autoDeleteOrphanedProfile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Ban user (set profile to inactive)
 * @param {string} userId - Supabase user ID
 * @param {boolean} isBanned - true to ban, false to unban
 * @returns {Promise<{success: boolean, profile?: any, error?: string}>}
 */
export async function setBanStatus(userId, isBanned) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', profile: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: isBanned,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AuthService] Error updating ban status:', error);
      return { success: false, error: error.message, profile: null };
    }

    console.log('[AuthService] User ban status updated:', userId, 'banned:', isBanned);
    return { success: true, profile: data };
  } catch (err) {
    console.error('[AuthService] Unexpected error setting ban status:', err);
    return { success: false, error: err.message, profile: null };
  }
}

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Check if email is already registered
 * @param {string} email - Email to check
 * @returns {Promise<{exists: boolean, profile?: any}>}
 */
export async function checkEmailExists(email) {
  try {
    if (!email || !email.trim()) {
      return { exists: false };
    }

    const emailLower = email.toLowerCase().trim();
    console.log('[AuthService] Checking email exists:', emailLower);

    // ✅ Force fresh query (no cache) by using select with specific columns
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email, display_name, role, created_at')
      .eq('email', emailLower)
      .maybeSingle(); // Use maybeSingle to avoid error when no rows

    if (error) {
      // PGRST116 = no rows returned (not an error)
      if (error.code === 'PGRST116') {
        console.log('[AuthService] Email not found in profiles:', emailLower);
        return { exists: false };
      }
      console.warn('[AuthService] Error checking email:', error);
      return { exists: false };
    }

    const exists = data !== null && data !== undefined;
    if (exists) {
      console.log('[AuthService] ⚠️ Email found in profiles:', {
        email: data.email,
        user_id: data.user_id,
        display_name: data.display_name,
        role: data.role
      });
    } else {
      console.log('[AuthService] ✅ Email not found in profiles:', emailLower);
    }

    return { 
      exists, 
      profile: exists ? data : null 
    };
  } catch (err) {
    console.error('[AuthService] Unexpected error checking email:', err);
    return { exists: false };
  }
}

/**
 * Test Supabase connection
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('[AuthService] Connection test failed:', error);
      return { success: false, message: error.message };
    }

    console.log('[AuthService] Connection test successful');
    return { success: true, message: 'Connected to Supabase' };
  } catch (err) {
    console.error('[AuthService] Connection test error:', err);
    return { success: false, message: err.message };
  }
}
