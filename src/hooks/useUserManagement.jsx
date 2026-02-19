// src/hooks/useUserManagement.jsx
// Custom hook for user management operations (admin)
// Handles: listing, searching, updating, deleting users

import { useCallback, useState, useEffect } from 'react';
import * as userService from '../services/userManagementService.js';

/**
 * useUserManagement - User management operations
 * @param {Object} options - { initialPage, initialLimit, initialRole, initialSearch }
 * @returns {Object} Users, pagination, actions, loading state
 */
export function useUserManagement(options = {}) {
  const {
    initialPage = 1,
    initialLimit = 20,
    initialRole = null,
    initialSearch = '',
  } = options;

  // State
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  /**
   * Fetch users
   */
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { success, users: fetchedUsers, total: totalUsers, error: fetchError } =
        await userService.getAllUsers({
          page,
          limit,
          search,
          role,
          sortBy,
          sortOrder,
        });

      if (!success) {
        setError(fetchError);
        setUsers([]);
        setTotal(0);
        return;
      }

      setUsers(fetchedUsers);
      setTotal(totalUsers);
    } catch (err) {
      console.error('[useUserManagement] Error fetching users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, role, sortBy, sortOrder]);

  /**
   * Auto-fetch when parameters change
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Search users
   */
  const handleSearch = useCallback((query) => {
    setSearch(query);
    setPage(1); // Reset to first page
  }, []);

  /**
   * Filter by role
   */
  const handleFilterRole = useCallback((selectedRole) => {
    setRole(selectedRole);
    setPage(1); // Reset to first page
  }, []);

  /**
   * Sort
   */
  const handleSort = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  /**
   * Update pagination
   */
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
  }, []);

  /**
   * Get single user
   */
  const getUserById = useCallback(async (userId) => {
    try {
      setError(null);
      const { success, user, error: getUserError } = await userService.getUserById(userId);

      if (!success) {
        setError(getUserError);
        return { success: false, error: getUserError };
      }

      return { success: true, user };
    } catch (err) {
      console.error('[useUserManagement] Error getting user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Update user
   */
  const updateUser = useCallback(async (userId, updates) => {
    try {
      setError(null);
      const { success, user, error: updateError } = await userService.adminUpdateUser(userId, updates);

      if (!success) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      // Update local state
      setUsers(users.map(u => u.user_id === userId ? user : u));

      return { success: true, user };
    } catch (err) {
      console.error('[useUserManagement] Error updating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [users]);

  /**
   * Change user role
   */
  const changeUserRole = useCallback(async (userId, newRole) => {
    try {
      setError(null);
      const { success, user, error: roleError } = await userService.changeUserRole(userId, newRole);

      if (!success) {
        setError(roleError);
        return { success: false, error: roleError };
      }

      // Update local state
      setUsers(users.map(u => u.user_id === userId ? user : u));

      return { success: true, user };
    } catch (err) {
      console.error('[useUserManagement] Error changing role:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [users]);

  /**
   * Ban user
   */
  const banUserAction = useCallback(async (userId) => {
    try {
      setError(null);
      const { success, user, error: banError } = await userService.banUser(userId);

      if (!success) {
        setError(banError);
        return { success: false, error: banError };
      }

      // Update local state
      setUsers(users.map(u => u.user_id === userId ? user : u));

      return { success: true, user };
    } catch (err) {
      console.error('[useUserManagement] Error banning user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [users]);

  /**
   * Unban user
   */
  const unbanUserAction = useCallback(async (userId) => {
    try {
      setError(null);
      const { success, user, error: unbanError } = await userService.unbanUser(userId);

      if (!success) {
        setError(unbanError);
        return { success: false, error: unbanError };
      }

      // Update local state
      setUsers(users.map(u => u.user_id === userId ? user : u));

      return { success: true, user };
    } catch (err) {
      console.error('[useUserManagement] Error unbanning user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [users]);

  /**
   * Delete user
   */
  const deleteUserAction = useCallback(async (userId) => {
    try {
      setError(null);
      const { success, error: deleteError } = await userService.deleteUserAccount(userId);

      if (!success) {
        setError(deleteError);
        return { success: false, error: deleteError };
      }

      // Update local state
      setUsers(users.filter(u => u.user_id !== userId));
      setTotal(total - 1);

      return { success: true };
    } catch (err) {
      console.error('[useUserManagement] Error deleting user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [users, total]);

  /**
   * Get statistics
   */
  const getStatistics = useCallback(async () => {
    try {
      setError(null);
      const { success, stats, error: statsError } = await userService.getUserStatistics();

      if (!success) {
        setError(statsError);
        return { success: false, error: statsError };
      }

      return { success: true, stats };
    } catch (err) {
      console.error('[useUserManagement] Error getting statistics:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Export users
   */
  const exportUsers = useCallback(async () => {
    try {
      setError(null);
      const csv = await userService.exportUsersToCSV();

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('[useUserManagement] Error exporting users:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setSearch('');
    setRole(null);
    setPage(1);
    setSortBy('created_at');
    setSortOrder('desc');
  }, []);

  return {
    // State
    users,
    total,
    page,
    limit,
    search,
    role,
    isLoading,
    error,
    sortBy,
    sortOrder,

    // Pagination
    handlePageChange,
    handleLimitChange,

    // Filtering & Sorting
    handleSearch,
    handleFilterRole,
    handleSort,
    resetFilters,

    // User actions
    getUserById,
    updateUser,
    changeUserRole,
    banUserAction,
    unbanUserAction,
    deleteUserAction,

    // Utilities
    getStatistics,
    exportUsers,
    fetchUsers,
    clearError,
  };
}

export default useUserManagement;

