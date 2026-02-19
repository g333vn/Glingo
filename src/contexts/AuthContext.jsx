// src/contexts/AuthContext.jsx
// Authentication Context - Global auth state management
// Provides: user, login, register, logout, updateProfile, isLoading

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.js';
import * as authService from '../services/authService.js';

// Create context
const AuthContext = createContext(null);

/**
 * ========================================
 * AUTH PROVIDER COMPONENT
 * ========================================
 */
export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state on mount
   * Listen for Supabase auth changes
   */
  useEffect(() => {
    let subscription = null;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.log('[AuthContext] Supabase not configured, skipping initialization');
          setIsLoading(false);
          return;
        }

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Load profile with timeout protection
          try {
            await Promise.race([
              loadUserProfile(session.user),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile load timeout')), 8000)
              )
            ]);
          } catch (profileError) {
            console.warn('[AuthContext] Profile load failed or timeout:', profileError);
            // Still set user even if profile fails
            setUser({
              id: session.user.id,
              email: session.user.email,
              emailConfirmed: session.user.email_confirmed_at !== null,
            });
          }
        }

        setIsLoading(false);

        // Listen for auth state changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthContext] Auth state changed:', event);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              // Load profile with timeout protection
              try {
                await Promise.race([
                  loadUserProfile(session.user),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Profile load timeout')), 8000)
                  )
                ]);
              } catch (profileError) {
                console.warn('[AuthContext] Profile load failed or timeout:', profileError);
                // Still set user even if profile fails
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                  emailConfirmed: session.user.email_confirmed_at !== null,
                });
              }
            }
            // Ensure loading is false after sign in
            setIsLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setError(null);
            setIsLoading(false);
          }
        });

        subscription = data.subscription;
      } catch (err) {
        console.error('[AuthContext] Initialization error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  /**
   * Load user profile from database
   */
  const loadUserProfile = useCallback(async (authUser) => {
    try {
      if (!authUser?.id) {
        console.warn('[AuthContext] No authUser.id provided');
        return;
      }

      // Get profile with timeout to avoid infinite loading
      const profilePromise = authService.getUserProfile(authUser.id);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile load timeout')), 10000)
      );

      let profileResult;
      try {
        profileResult = await Promise.race([profilePromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('[AuthContext] Profile load timeout or error:', timeoutError);
        // FIXED: Don't reset profile on timeout - keep existing profile if available
        // This prevents role reset when network is slow or database is temporarily unavailable
        // Profile will be reloaded on next successful connection
        console.warn('[AuthContext] Profile load failed, but preserving existing profile to prevent role reset');
        profileResult = { success: false, profile: null };
      }

      const { success, profile: profileData } = profileResult;

      if (success && profileData) {
        setProfile(profileData);
      } else {
        // FIXED: Only create profile if it truly doesn't exist (not just load failure)
        // Retry loading profile first before creating new one
        console.log('[AuthContext] Profile not loaded, retrying...');
        try {
          // Retry getting profile with a short delay (up to 3 retries)
          let retryResult = null;
          for (let retry = 0; retry < 3; retry++) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
            retryResult = await authService.getUserProfile(authUser.id);
            
            if (retryResult.success && retryResult.profile) {
              console.log(`[AuthContext] ✅ Profile found on retry ${retry + 1}`);
              setProfile(retryResult.profile);
              return; // Exit early if profile found
            }
          }
          
          // Profile truly doesn't exist after all retries - only then create it
          console.log('[AuthContext] Profile not found after retries, creating new profile...');
          const createResult = await authService.createUserProfile(authUser.id, {
            display_name: authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            role: 'user',
          });

          // Try to get profile again after creation
          if (createResult.success && createResult.profile) {
            setProfile(createResult.profile);
          } else {
            // Final retry to get profile (might have been created by trigger)
            const finalRetry = await authService.getUserProfile(authUser.id);
            if (finalRetry.success && finalRetry.profile) {
              setProfile(finalRetry.profile);
            }
          }
        } catch (createError) {
          console.warn('[AuthContext] Could not create/load profile:', createError);
          // FIXED: Don't reset profile on error - keep existing profile to prevent role reset
          // Continue without updating profile - user can still use the app
          // Profile will be reloaded on next successful connection
        }
      }

      // Set user even if profile failed to load
      setUser({
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: authUser.email_confirmed_at !== null,
      });

      setError(null);
    } catch (err) {
      console.error('[AuthContext] Error loading profile:', err);
      setError(err.message);
      // Still set user even if profile fails
      if (authUser?.id) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          emailConfirmed: authUser.email_confirmed_at !== null,
        });
      }
    }
  }, []);

  /**
   * ========================================
   * AUTH ACTIONS
   * ========================================
   */

  /**
   * Sign up
   */
  const register = useCallback(async (email, password, displayName) => {
    try {
      setError(null);
      setIsLoading(true);

      const { success, data, error: signUpError } = await authService.signUp({
        email,
        password,
        displayName,
      });

      if (!success) {
        setError(signUpError);
        return { success: false, error: signUpError };
      }

      // NEW: Auto-confirm user email để có thể đăng nhập ngay
      if (data?.user?.id) {
        console.log('[AuthContext] Confirming user email...');
        const confirmResult = await authService.confirmUserEmail(data.user.id);
        if (confirmResult.success) {
          console.log('[AuthContext] ✅ User email confirmed successfully');
        } else {
          console.warn('[AuthContext] ⚠️ Failed to confirm user email:', confirmResult.error);
          if (confirmResult.needsManualConfirmation) {
            console.warn('[AuthContext] ⚠️ User needs manual confirmation in Supabase Dashboard');
            // Vẫn tiếp tục, user có thể confirm sau qua email
          }
        }
      }

      // User created successfully
      console.log('[AuthContext] Registration successful:', email);
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      // Don't set isLoading here - onAuthStateChange will handle it
      // This prevents infinite loading if profile load gets stuck

      const { success, data, error: signInError } = await authService.signIn({
        email,
        password,
      });

      if (!success) {
        setError(signInError);
        setIsLoading(false); // Set false on error
        return { success: false, error: signInError };
      }

      // Session established, onAuthStateChange will handle the rest
      // Profile will be loaded by onAuthStateChange listener
      // setIsLoading(false) will be called in onAuthStateChange
      console.log('[AuthContext] Login successful:', email);
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      setError(err.message);
      setIsLoading(false); // Ensure loading is false on error
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Sign out
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { success, error: signOutError } = await authService.signOut();

      if (!success) {
        setError(signOutError);
        return { success: false, error: signOutError };
      }

      // Clear local state
      setUser(null);
      setProfile(null);

      console.log('[AuthContext] Logout successful');
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'No user logged in' };
      }

      setError(null);
      const { success, profile: updatedProfile, error: updateError } = 
        await authService.updateUserProfile(user.id, updates);

      if (!success) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      setProfile(updatedProfile);
      console.log('[AuthContext] Profile updated');
      return { success: true, profile: updatedProfile };
    } catch (err) {
      console.error('[AuthContext] Profile update error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  /**
   * Update password
   */
  const updatePassword = useCallback(async (newPassword) => {
    try {
      setError(null);
      setIsLoading(true);

      const { success, error: updateError } = 
        await authService.updatePassword(newPassword);

      if (!success) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      console.log('[AuthContext] Password updated');
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Password update error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setError(null);

      const { success, error: resetError } = 
        await authService.resetPasswordEmail(email);

      if (!success) {
        setError(resetError);
        return { success: false, error: resetError };
      }

      console.log('[AuthContext] Password reset email sent');
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Password reset error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * ========================================
   * HELPER METHODS
   * ========================================
   */

  /**
   * Check if user has permission
   */
  const hasPermission = useCallback((permission) => {
    if (!profile) return false;

    const rolePermissions = {
      admin: ['*'], // All permissions
      editor: ['edit-content', 'view-all'],
      user: ['view-all'],
    };

    const permissions = rolePermissions[profile.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [profile]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return profile?.role === 'admin';
  }, [profile]);

  /**
   * Check if user is editor
   */
  const isEditor = useCallback(() => {
    return profile?.role === 'editor';
  }, [profile]);

  // Context value
  const value = {
    // State
    user,
    profile,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Actions
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    requestPasswordReset,

    // Helper methods
    hasPermission,
    isAdmin,
    isEditor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ========================================
 * CUSTOM HOOK
 * ========================================
 */

/**
 * Use auth context
 * @throws {Error} if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
