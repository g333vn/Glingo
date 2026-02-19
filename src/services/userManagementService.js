// src/services/userManagementService.js
// User Management Service - Admin operations, user queries, bulk actions
// For: User listing, filtering, searching, bulk operations, statistics

import { supabase } from './supabaseClient.js';
import * as authService from './authService.js';
import { logger } from '../utils/logger.js';
import { sanitizeError } from '../utils/sanitizeError.js';

// SECURITY: Chỉ select các field cần thiết, không dùng SELECT *
const PROFILE_FIELDS_PUBLIC = 'user_id, email, display_name, role, avatar_url, is_banned, created_at, updated_at';
const PROFILE_FIELDS_MINIMAL = 'user_id, display_name, role, avatar_url';

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

    // SECURITY: Chỉ select field cần thiết
    let query = supabase
      .from('profiles')
      .select(PROFILE_FIELDS_PUBLIC, { count: 'exact' });

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
      logger.error('[UserManagement] Error fetching users', { error });
      return { success: false, users: [], total: 0, error: sanitizeError(error, '[UserManagement]') };
    }

    logger.debug('[UserManagement] Fetched users', { count: data?.length || 0 });
    return { success: true, users: data || [], total: count || 0 };
  } catch (err) {
    logger.error('[UserManagement] Unexpected error fetching users', { error: err });
    return { success: false, users: [], total: 0, error: sanitizeError(err, '[UserManagement]') };
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
      return { success: false, users: [], error: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' };
    }

    // SECURITY: Chỉ select field cần thiết
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS_MINIMAL)
      .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(50);

    if (error) {
      logger.error('[UserManagement] Error searching users', { error });
      return { success: false, users: [], error: sanitizeError(error, '[UserManagement]') };
    }

    logger.debug('[UserManagement] Search results', { count: data?.length || 0 });
    return { success: true, users: data || [] };
  } catch (err) {
    logger.error('[UserManagement] Unexpected error searching users', { error: err });
    return { success: false, users: [], error: sanitizeError(err, '[UserManagement]') };
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
    return { success, user: profile, error: error ? sanitizeError(error, '[UserManagement]') : undefined };
  } catch (err) {
    logger.error('[UserManagement] Error getting user', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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
      return { success: false, error: 'Email là bắt buộc' };
    }

    // SECURITY: Chỉ select field cần thiết
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS_PUBLIC)
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('[UserManagement] Error getting user by email', { error });
      return { success: false, error: sanitizeError(error, '[UserManagement]') };
    }

    return { success: true, user: data || null };
  } catch (err) {
    logger.error('[UserManagement] Unexpected error getting user by email', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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

    logger.debug('[UserManagement] Statistics', { stats });
    return { success: true, stats };
  } catch (err) {
    logger.error('[UserManagement] Error getting statistics', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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
    return { success, user: profile, error: error ? sanitizeError(error, '[UserManagement]') : undefined };
  } catch (err) {
    logger.error('[UserManagement] Error updating user', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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
    return { success, user: profile, error: error ? sanitizeError(error, '[UserManagement]') : undefined };
  } catch (err) {
    logger.error('[UserManagement] Error changing role', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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
    return { success, user: profile, error: error ? sanitizeError(error, '[UserManagement]') : undefined };
  } catch (err) {
    logger.error('[UserManagement] Error banning user', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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
    return { success, user: profile, error: error ? sanitizeError(error, '[UserManagement]') : undefined };
  } catch (err) {
    logger.error('[UserManagement] Error unbanning user', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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
    return { success, error: error ? sanitizeError(error, '[UserManagement]') : undefined };
  } catch (err) {
    logger.error('[UserManagement] Error deleting user', { error: err });
    return { success: false, error: sanitizeError(err, '[UserManagement]') };
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

    logger.info('[UserManagement] Bulk role change completed', { updated: results.updated, failed: results.failed });
    return { success: results.failed === 0, ...results };
  } catch (err) {
    logger.error('[UserManagement] Error in bulk role change', { error: err });
    return { success: false, updated: 0, failed: userIds.length, errors: { error: sanitizeError(err, '[UserManagement]') } };
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

    logger.info('[UserManagement] Bulk ban completed', { updated: results.updated, failed: results.failed });
    return { success: results.failed === 0, ...results };
  } catch (err) {
    logger.error('[UserManagement] Error in bulk ban', { error: err });
    return { success: false, updated: 0, failed: userIds.length, errors: { error: sanitizeError(err, '[UserManagement]') } };
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

    logger.info('[UserManagement] Bulk delete completed', { deleted: results.deleted, failed: results.failed });
    return { success: results.failed === 0, ...results };
  } catch (err) {
    logger.error('[UserManagement] Error in bulk delete', { error: err });
    return { success: false, deleted: 0, failed: userIds.length, errors: { error: sanitizeError(err, '[UserManagement]') } };
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
    logger.error('[UserManagement] Error exporting users', { error: err });
    throw new Error('Không thể xuất danh sách người dùng. Vui lòng thử lại.');
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
    const { success, user } = await getUserByEmail(email);

    if (!success) {
      return { available: true }; // If there's an error, assume available
    }

    return { available: !user };
  } catch (err) {
    logger.error('[UserManagement] Error checking email availability', { error: err });
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

