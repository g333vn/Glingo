// src/services/userManagementService.js
// 👥 User Management Service - Admin operations, user queries, bulk actions
// For: User listing, filtering, searching, bulk operations, statistics

import { supabase } from './supabaseClient.js';
import * as authService from './authService.js';

/**
 * ========================================
 * USER QUERYING & LISTING
 * ========================================
 */

/**
 * Get all users with pagination
 * @param {Object} options - { page, limit, search, role, sortBy }
 * @returns {Promise<{success: boolean, users: Array, total: number, error?: string}>}
 */
export async function getAllUsers(options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = null,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Filter by role
    if (role) {
      query = query.eq('role', role);
    }

    // Filter by search term (email or display_name)
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,display_name.ilike.%${search}%`
      );
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[UserManagement] Error fetching users:', error);
      return { success: false, users: [], total: 0, error: error.message };
    }

    console.log('[UserManagement] Fetched users:', data?.length || 0);
    return { success: true, users: data || [], total: count || 0 };
  } catch (err) {
    console.error('[UserManagement] Unexpected error fetching users:', err);
    return { success: false, users: [], total: 0, error: err.message };
  }
}

/**
 * Search users
 * @param {string} query - Search query
 * @returns {Promise<{success: boolean, users: Array, error?: string}>}
 */
export async function searchUsers(query) {
  try {
    if (!query || query.length < 2) {
      return { success: false, users: [], error: 'Query must be at least 2 characters' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(50);

    if (error) {
      console.error('[UserManagement] Error searching users:', error);
      return { success: false, users: [], error: error.message };
    }

    console.log('[UserManagement] Search results:', data?.length || 0);
    return { success: true, users: data || [] };
  } catch (err) {
    console.error('[UserManagement] Unexpected error searching users:', err);
    return { success: false, users: [], error: err.message };
  }
}

/**
 * Get user by ID
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function getUserById(userId) {
  try {
    const { success, profile, error } = await authService.getUserProfile(userId);
    return { success, user: profile, error };
  } catch (err) {
    console.error('[UserManagement] Error getting user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function getUserByEmail(email) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[UserManagement] Error getting user by email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data || null };
  } catch (err) {
    console.error('[UserManagement] Unexpected error getting user by email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * ========================================
 * USER STATISTICS
 * ========================================
 */

/**
 * Get user statistics
 * @returns {Promise<{success: boolean, stats?: Object, error?: string}>}
 */
export async function getUserStatistics() {
  try {
    // Get total users
    const { data: allUsers, count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (usersError) throw usersError;

    // Get users by role
    const { data: roleData, error: roleError } = await supabase
      .from('profiles')
      .select('role');

    if (roleError) throw roleError;

    const roleStats = (roleData || []).reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Get active users (logged in within 7 days - if tracking available)
    const { data: recentUsers, error: recentError } = await supabase
      .from('profiles')
      .select('id')
      .gt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (recentError) throw recentError;

    const stats = {
      total: totalUsers || 0,
      byRole: {
        admin: roleStats.admin || 0,
        editor: roleStats.editor || 0,
        user: roleStats.user || 0,
      },
      activeThisWeek: recentUsers?.length || 0,
      banned: roleData?.filter(u => u.is_banned)?.length || 0,
    };

    console.log('[UserManagement] Statistics:', stats);
    return { success: true, stats };
  } catch (err) {
    console.error('[UserManagement] Error getting statistics:', err);
    return { success: false, error: err.message };
  }
}

/**
 * ========================================
 * USER MODIFICATION
 * ========================================
 */

/**
 * Update user profile (admin)
 * @param {string} userId - Supabase user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function adminUpdateUser(userId, updates) {
  try {
    const { success, profile, error } = await authService.updateUserProfile(userId, updates);
    return { success, user: profile, error };
  } catch (err) {
    console.error('[UserManagement] Error updating user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Change user role (admin)
 * @param {string} userId - Supabase user ID
 * @param {string} newRole - 'admin' | 'editor' | 'user'
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function changeUserRole(userId, newRole) {
  try {
    const { success, profile, error } = await authService.updateUserRole(userId, newRole);
    return { success, user: profile, error };
  } catch (err) {
    console.error('[UserManagement] Error changing role:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Ban user (admin)
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function banUser(userId) {
  try {
    const { success, profile, error } = await authService.setBanStatus(userId, true);
    return { success, user: profile, error };
  } catch (err) {
    console.error('[UserManagement] Error banning user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Unban user (admin)
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function unbanUser(userId) {
  try {
    const { success, profile, error } = await authService.setBanStatus(userId, false);
    return { success, user: profile, error };
  } catch (err) {
    console.error('[UserManagement] Error unbanning user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete user (admin)
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteUserAccount(userId) {
  try {
    const { success, error } = await authService.deleteUser(userId);
    return { success, error };
  } catch (err) {
    console.error('[UserManagement] Error deleting user:', err);
    return { success: false, error: err.message };
  }
}

/**
 * ========================================
 * BULK OPERATIONS
 * ========================================
 */

/**
 * Bulk change user roles
 * @param {Array<string>} userIds - User IDs
 * @param {string} newRole - New role
 * @returns {Promise<{success: boolean, updated: number, failed: number, errors: Object}>}
 */
export async function bulkChangeRoles(userIds, newRole) {
  try {
    const results = {
      updated: 0,
      failed: 0,
      errors: {},
    };

    for (const userId of userIds) {
      const { success, error } = await changeUserRole(userId, newRole);
      if (success) {
        results.updated++;
      } else {
        results.failed++;
        results.errors[userId] = error;
      }
    }

    console.log('[UserManagement] Bulk role change completed:', results);
    return { success: results.failed === 0, ...results };
  } catch (err) {
    console.error('[UserManagement] Error in bulk role change:', err);
    return { success: false, updated: 0, failed: userIds.length, errors: { error: err.message } };
  }
}

/**
 * Bulk ban users
 * @param {Array<string>} userIds - User IDs
 * @returns {Promise<{success: boolean, updated: number, failed: number, errors: Object}>}
 */
export async function bulkBanUsers(userIds) {
  try {
    const results = {
      updated: 0,
      failed: 0,
      errors: {},
    };

    for (const userId of userIds) {
      const { success, error } = await banUser(userId);
      if (success) {
        results.updated++;
      } else {
        results.failed++;
        results.errors[userId] = error;
      }
    }

    console.log('[UserManagement] Bulk ban completed:', results);
    return { success: results.failed === 0, ...results };
  } catch (err) {
    console.error('[UserManagement] Error in bulk ban:', err);
    return { success: false, updated: 0, failed: userIds.length, errors: { error: err.message } };
  }
}

/**
 * Bulk delete users
 * @param {Array<string>} userIds - User IDs
 * @returns {Promise<{success: boolean, deleted: number, failed: number, errors: Object}>}
 */
export async function bulkDeleteUsers(userIds) {
  try {
    const results = {
      deleted: 0,
      failed: 0,
      errors: {},
    };

    for (const userId of userIds) {
      const { success, error } = await deleteUserAccount(userId);
      if (success) {
        results.deleted++;
      } else {
        results.failed++;
        results.errors[userId] = error;
      }
    }

    console.log('[UserManagement] Bulk delete completed:', results);
    return { success: results.failed === 0, ...results };
  } catch (err) {
    console.error('[UserManagement] Error in bulk delete:', err);
    return { success: false, deleted: 0, failed: userIds.length, errors: { error: err.message } };
  }
}

/**
 * ========================================
 * EXPORT & IMPORT
 * ========================================
 */

/**
 * Export all users to CSV
 * @returns {Promise<string>} CSV content
 */
export async function exportUsersToCSV() {
  try {
    const { users, error } = await getAllUsers({ limit: 10000 });

    if (!users || users.length === 0) {
      return 'No users to export';
    }

    // CSV header
    const headers = ['ID', 'Email', 'Display Name', 'Role', 'Created At', 'Updated At', 'Banned'];

    // CSV rows
    const rows = users.map(user => [
      user.user_id,
      user.email,
      user.display_name,
      user.role,
      new Date(user.created_at).toLocaleDateString(),
      new Date(user.updated_at).toLocaleDateString(),
      user.is_banned ? 'Yes' : 'No',
    ]);

    // Combine
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (err) {
    console.error('[UserManagement] Error exporting users:', err);
    throw err;
  }
}

/**
 * ========================================
 * VALIDATION & CHECKS
 * ========================================
 */

/**
 * Check if user email is available
 * @param {string} email - Email to check
 * @returns {Promise<{available: boolean, error?: string}>}
 */
export async function isEmailAvailable(email) {
  try {
    const { success, user, error } = await getUserByEmail(email);

    if (!success) {
      return { available: true }; // If there's an error, assume available
    }

    return { available: !user };
  } catch (err) {
    console.error('[UserManagement] Error checking email availability:', err);
    return { available: true };
  }
}

/**
 * Validate user data before creation/update
 * @param {Object} userData - User data to validate
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export function validateUserData(userData) {
  const errors = [];

  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Invalid email address');
  }

  if (!userData.display_name || userData.display_name.trim().length < 2) {
    errors.push('Display name must be at least 2 characters');
  }

  if (userData.role && !['admin', 'editor', 'user'].includes(userData.role)) {
    errors.push('Invalid role');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

