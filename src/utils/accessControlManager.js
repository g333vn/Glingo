// src/utils/accessControlManager.js
// 🔒 ACCESS CONTROL MANAGEMENT SYSTEM
// Quản lý quyền truy cập cho các module LEVEL và JLPT

const STORAGE_KEYS = {
  level: 'levelAccessControl',
  jlpt: 'jlptAccessControl',
  levelModule: 'levelModuleAccessControl',
  jlptModule: 'jlptModuleAccessControl'
};

const DEFAULT_ACCESS_CONFIG = {
  accessType: 'all', // 'all' | 'role' | 'user' | 'none'
  allowedRoles: [], // ['admin', 'editor', 'user']
  allowedUsers: [] // [userId1, userId2, ...]
};

/**
 * Get access control config for a module and level
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @returns {Object} Access control config
 */
export function getAccessConfig(module, levelId) {
  try {
    const storageKey = STORAGE_KEYS[module];
    if (!storageKey) {
      console.warn(`[ACCESS] Unknown module: ${module}`);
      return { ...DEFAULT_ACCESS_CONFIG };
    }

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return { ...DEFAULT_ACCESS_CONFIG };
    }

    const config = JSON.parse(stored);
    return config[levelId] || { ...DEFAULT_ACCESS_CONFIG };
  } catch (error) {
    console.error(`[ACCESS] Error getting config for ${module}/${levelId}:`, error);
    return { ...DEFAULT_ACCESS_CONFIG };
  }
}

/**
 * Set access control config for a module and level
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @param {Object} config - Access control config
 */
export function setAccessConfig(module, levelId, config) {
  try {
    const storageKey = STORAGE_KEYS[module];
    if (!storageKey) {
      console.warn(`[ACCESS] Unknown module: ${module}`);
      return false;
    }

    const stored = localStorage.getItem(storageKey);
    const allConfigs = stored ? JSON.parse(stored) : {};

    allConfigs[levelId] = {
      ...DEFAULT_ACCESS_CONFIG,
      ...config
    };

    localStorage.setItem(storageKey, JSON.stringify(allConfigs));
    return true;
  } catch (error) {
    console.error(`[ACCESS] Error setting config for ${module}/${levelId}:`, error);
    return false;
  }
}

/**
 * Get all access control configs for a module
 * @param {string} module - 'level' or 'jlpt'
 * @returns {Object} All level configs
 */
export function getAllAccessConfigs(module) {
  try {
    const storageKey = STORAGE_KEYS[module];
    if (!storageKey) {
      return {};
    }

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(`[ACCESS] Error getting all configs for ${module}:`, error);
    return {};
  }
}

/**
 * Get module-level access control config
 * @param {string} module - 'level' or 'jlpt'
 * @returns {Object} Module-level access control config
 */
export function getModuleAccessConfig(module) {
  try {
    const storageKey = STORAGE_KEYS[`${module}Module`];
    if (!storageKey) {
      console.warn(`[ACCESS] Unknown module for module-level: ${module}`);
      return { ...DEFAULT_ACCESS_CONFIG };
    }

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return { ...DEFAULT_ACCESS_CONFIG };
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(`[ACCESS] Error getting module-level config for ${module}:`, error);
    return { ...DEFAULT_ACCESS_CONFIG };
  }
}

/**
 * Set module-level access control config
 * @param {string} module - 'level' or 'jlpt'
 * @param {Object} config - Access control config
 */
export function setModuleAccessConfig(module, config) {
  try {
    const storageKey = STORAGE_KEYS[`${module}Module`];
    if (!storageKey) {
      console.warn(`[ACCESS] Unknown module for module-level: ${module}`);
      return false;
    }

    localStorage.setItem(storageKey, JSON.stringify({
      ...DEFAULT_ACCESS_CONFIG,
      ...config
    }));
    return true;
  } catch (error) {
    console.error(`[ACCESS] Error setting module-level config for ${module}:`, error);
    return false;
  }
}

/**
 * Check if a user has access to a module/level
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @param {Object} user - User object with id, role
 * @returns {boolean} True if user has access
 */
export function hasAccess(module, levelId, user) {
  // Admin always has access
  if (user?.role === 'admin') {
    return true;
  }

  // Check module-level access control first
  const moduleConfig = getModuleAccessConfig(module);
  
  // If module is blocked, deny access
  if (moduleConfig.accessType === 'none') {
    return false;
  }

  // If module allows all, continue to level-specific check
  if (moduleConfig.accessType === 'all') {
    // Continue to level-specific check
  } else if (moduleConfig.accessType === 'role') {
    // Role-based blocking at module level
    if (!user) {
      // If "guest" is in blocked roles, deny access
      if (moduleConfig.allowedRoles.includes('guest')) {
        return false;
      }
    } else {
      // If user's role is in blocked list, deny access
      if (moduleConfig.allowedRoles.includes(user.role)) {
        return false;
      }
    }
  } else if (moduleConfig.accessType === 'user') {
    // User-specific blocking at module level
    if (user?.id) {
      const userId = user.id;
      const isBlocked = moduleConfig.allowedUsers.some(blockedId => 
        blockedId === userId || 
        String(blockedId) === String(userId) ||
        Number(blockedId) === Number(userId)
      );
      if (isBlocked) {
        return false;
      }
    }
  }

  // Now check level-specific access control
  const config = getAccessConfig(module, levelId);

  // No access
  if (config.accessType === 'none') {
    return false;
  }

  // All users have access
  if (config.accessType === 'all') {
    return true;
  }

  // Role-based blocking: Selected roles are BLOCKED, others are allowed
  if (config.accessType === 'role') {
    // Handle guest users (not logged in)
    if (!user) {
      // If "guest" is in blocked roles, deny access
      return !config.allowedRoles.includes('guest');
    }
    // If user's role is in blocked list, deny access
    return !config.allowedRoles.includes(user.role);
  }

  // User-specific blocking: Selected users are BLOCKED, others are allowed
  if (config.accessType === 'user') {
    if (!user?.id) return true; // No user ID = allow (or handle as needed)
    // Handle both number and string IDs
    const userId = user.id;
    const isBlocked = config.allowedUsers.some(blockedId => 
      blockedId === userId || 
      String(blockedId) === String(userId) ||
      Number(blockedId) === Number(userId)
    );
    // If user is in blocked list, deny access
    return !isBlocked;
  }

  return false;
}

/**
 * Initialize default configs for all levels
 * @param {string} module - 'level' or 'jlpt'
 */
export function initializeDefaultConfigs(module) {
  const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
  const allConfigs = getAllAccessConfigs(module);

  levels.forEach(levelId => {
    if (!allConfigs[levelId]) {
      setAccessConfig(module, levelId, { ...DEFAULT_ACCESS_CONFIG });
    }
  });
}

/**
 * Reset all configs for a module to default (including module-level config)
 * @param {string} module - 'level' or 'jlpt'
 */
export function resetModuleConfigs(module) {
  try {
    const storageKey = STORAGE_KEYS[module];
    const moduleStorageKey = STORAGE_KEYS[`${module}Module`];
    
    if (storageKey) {
      localStorage.removeItem(storageKey);
      initializeDefaultConfigs(module);
    }
    
    if (moduleStorageKey) {
      localStorage.removeItem(moduleStorageKey);
      setModuleAccessConfig(module, { ...DEFAULT_ACCESS_CONFIG });
    }
    
    return true;
  } catch (error) {
    console.error(`[ACCESS] Error resetting configs for ${module}:`, error);
    return false;
  }
}

