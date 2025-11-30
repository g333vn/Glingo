// src/hooks/useAuthActions.jsx
// 🎣 Custom hook for common auth actions
// Simplifies login, register, logout, password reset, etc.

import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * useAuthActions - Common authentication actions
 * @returns {Object} Auth actions and state
 */
export function useAuthActions() {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  /**
   * Handle login
   */
  const handleLogin = useCallback(async (email, password) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const result = await auth.login(email, password);

      if (!result.success) {
        setActionError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed';
      setActionError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [auth]);

  /**
   * Handle register
   */
  const handleRegister = useCallback(async (email, password, displayName) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const result = await auth.register(email, password, displayName);

      if (!result.success) {
        setActionError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setActionError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [auth]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const result = await auth.logout();

      if (!result.success) {
        setActionError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err.message || 'Logout failed';
      setActionError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [auth]);

  /**
   * Handle update profile
   */
  const handleUpdateProfile = useCallback(async (updates) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const result = await auth.updateProfile(updates);

      if (!result.success) {
        setActionError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, profile: result.profile };
    } catch (err) {
      const message = err.message || 'Profile update failed';
      setActionError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [auth]);

  /**
   * Handle password update
   */
  const handleUpdatePassword = useCallback(async (newPassword) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const result = await auth.updatePassword(newPassword);

      if (!result.success) {
        setActionError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err.message || 'Password update failed';
      setActionError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [auth]);

  /**
   * Handle password reset request
   */
  const handleRequestPasswordReset = useCallback(async (email) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const result = await auth.requestPasswordReset(email);

      if (!result.success) {
        setActionError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const message = err.message || 'Password reset request failed';
      setActionError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [auth]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    // State
    isSubmitting,
    actionError,

    // Actions
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
    handleUpdatePassword,
    handleRequestPasswordReset,

    // Utilities
    clearError,
  };
}

export default useAuthActions;

