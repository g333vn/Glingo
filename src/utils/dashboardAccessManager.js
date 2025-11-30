// src/utils/dashboardAccessManager.js
// 🔒 DASHBOARD ACCESS CONTROL MANAGEMENT SYSTEM
// Quản lý quyền truy cập dashboard cho người dùng

const STORAGE_KEY = 'dashboardAccessControl';

const DEFAULT_CONFIG = {
  // Mặc định: tất cả users (trừ admin) đều bị khóa
  defaultLocked: true,
  // Danh sách user IDs được phép truy cập (ngoài admin)
  allowedUsers: [],
  // Danh sách roles được phép truy cập (ngoài admin)
  allowedRoles: []
};

/**
 * Get dashboard access config
 * @returns {Object} Dashboard access config
 */
export function getDashboardAccessConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Nếu chưa có config, tạo mặc định
      const defaultConfig = { ...DEFAULT_CONFIG };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
      return defaultConfig;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('[DASHBOARD ACCESS] Error getting config:', error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Set dashboard access config
 * @param {Object} config - Dashboard access config
 */
export function setDashboardAccessConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...DEFAULT_CONFIG,
      ...config
    }));
    return true;
  } catch (error) {
    console.error('[DASHBOARD ACCESS] Error setting config:', error);
    return false;
  }
}

/**
 * Check if a user has access to dashboard
 * @param {Object} user - User object with id
 * @param {Object} profile - Profile object with role (optional, can be passed separately)
 * @returns {boolean} True if user has access
 */
export function hasDashboardAccess(user, profile = null) {
  // Get role from profile if provided, or from user object
  const userRole = profile?.role || user?.role;
  
  // Admin always has access
  if (userRole === 'admin') {
    return true;
  }

  const config = getDashboardAccessConfig();

  // Nếu defaultLocked = false, tất cả users đều có quyền truy cập
  if (!config.defaultLocked) {
    return true;
  }

  // Nếu defaultLocked = true, chỉ users trong allowedUsers hoặc allowedRoles mới có quyền
  if (!user) {
    return false; // Guest users không có quyền
  }

  // Kiểm tra role
  if (userRole && config.allowedRoles.includes(userRole)) {
    return true;
  }

  // Kiểm tra user ID
  if (user.id) {
    const userId = user.id;
    const isAllowed = config.allowedUsers.some(allowedId => 
      allowedId === userId || 
      String(allowedId) === String(userId) ||
      Number(allowedId) === Number(userId)
    );
    if (isAllowed) {
      return true;
    }
  }

  // Mặc định: không có quyền
  return false;
}

/**
 * Get all users with dashboard access
 * @returns {Object} { allowedUsers: [], allowedRoles: [], defaultLocked: boolean }
 */
export function getAllDashboardAccess() {
  return getDashboardAccessConfig();
}

/**
 * Reset dashboard access config to default
 */
export function resetDashboardAccess() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('[DASHBOARD ACCESS] Error resetting config:', error);
    return false;
  }
}

