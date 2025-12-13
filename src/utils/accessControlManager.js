// src/utils/accessControlManager.js
// 🔒 ACCESS CONTROL MANAGEMENT SYSTEM
// Quản lý quyền truy cập cho các module LEVEL và JLPT
// ✅ UPDATED: Sync với Supabase để quản trị toàn hệ thống thời gian thực

import {
  getAccessControlFromSupabase,
  saveLevelAccessConfigToSupabase,
  saveModuleAccessConfigToSupabase
} from '../services/accessControlService.js';

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
 * ✅ UPDATED: Priority: Supabase > localStorage
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @returns {Object} Access control config
 */
export async function getAccessConfig(module, levelId) {
  try {
    // ✅ NEW: Try Supabase first (real-time sync)
    try {
      const { success, data } = await getAccessControlFromSupabase();
      if (success && data) {
        const moduleConfigs = module === 'level' ? data.levelConfigs : data.jlptConfigs;
        if (moduleConfigs && moduleConfigs[levelId]) {
          console.log(`[ACCESS] ✅ Loaded ${module}/${levelId} config from Supabase`);
          // Cache to localStorage for offline access
          const storageKey = STORAGE_KEYS[module];
          if (storageKey) {
            const stored = localStorage.getItem(storageKey);
            const allConfigs = stored ? JSON.parse(stored) : {};
            allConfigs[levelId] = moduleConfigs[levelId];
            localStorage.setItem(storageKey, JSON.stringify(allConfigs));
          }
          return { ...DEFAULT_ACCESS_CONFIG, ...moduleConfigs[levelId] };
        }
      }
    } catch (err) {
      console.warn(`[ACCESS] ⚠️ Failed to load from Supabase, using localStorage:`, err);
    }

    // Fallback to localStorage
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
 * Synchronous version for backward compatibility (uses localStorage only)
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @returns {Object} Access control config
 */
export function getAccessConfigSync(module, levelId) {
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
 * ✅ UPDATED: Priority: Supabase > localStorage
 * @param {string} module - 'level' or 'jlpt'
 * @returns {Object} Module-level access control config
 */
export async function getModuleAccessConfig(module) {
  try {
    // ✅ NEW: Try Supabase first (real-time sync)
    try {
      const { success, data } = await getAccessControlFromSupabase();
      if (success && data) {
        const moduleConfig = module === 'level' ? data.levelModuleConfig : data.jlptModuleConfig;
        if (moduleConfig && Object.keys(moduleConfig).length > 0) {
          console.log(`[ACCESS] ✅ Loaded ${module} module config from Supabase`);
          // Cache to localStorage
          const storageKey = STORAGE_KEYS[`${module}Module`];
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(moduleConfig));
          }
          return { ...DEFAULT_ACCESS_CONFIG, ...moduleConfig };
        }
      }
    } catch (err) {
      console.warn(`[ACCESS] ⚠️ Failed to load from Supabase, using localStorage:`, err);
    }

    // Fallback to localStorage
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
 * Synchronous version for backward compatibility (uses localStorage only)
 * @param {string} module - 'level' or 'jlpt'
 * @returns {Object} Module-level access control config
 */
export function getModuleAccessConfigSync(module) {
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
 * ✅ UPDATED: Save to both Supabase (real-time) and localStorage (cache)
 * @param {string} module - 'level' or 'jlpt'
 * @param {Object} config - Access control config
 * @returns {Promise<boolean>} Success status
 */
export async function setModuleAccessConfig(module, config) {
  try {
    const finalConfig = {
      ...DEFAULT_ACCESS_CONFIG,
      ...config
    };

    // ✅ NEW: Save to Supabase first (real-time sync)
    try {
      const { success, error } = await saveModuleAccessConfigToSupabase(module, finalConfig);
      if (success) {
        console.log(`[ACCESS] ✅ Saved ${module} module config to Supabase`);
      } else {
        console.warn(`[ACCESS] ⚠️ Failed to save to Supabase, saving to localStorage only:`, error);
      }
    } catch (err) {
      console.warn(`[ACCESS] ⚠️ Error saving to Supabase:`, err);
    }

    // Also save to localStorage (cache for offline access)
    const storageKey = STORAGE_KEYS[`${module}Module`];
    if (!storageKey) {
      console.warn(`[ACCESS] Unknown module for module-level: ${module}`);
      return false;
    }

    localStorage.setItem(storageKey, JSON.stringify(finalConfig));
    console.log(`[ACCESS] ✅ Saved ${module} module config to localStorage`);
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
  // ✅ DEBUG: Log access check
  console.log(`[ACCESS] Checking access for:`, {
    module,
    levelId,
    userId: user?.id || 'guest',
    userRole: user?.role || 'guest',
    hasUser: !!user
  });

  // Admin always has access
  if (user?.role === 'admin') {
    console.log(`[ACCESS] ✅ Admin user - granted access`);
    return true;
  }

  // Check module-level access control first
  // ✅ FIXED: Use sync version for hasAccess (called frequently, needs to be fast)
  const moduleConfig = getModuleAccessConfigSync(module);
  console.log(`[ACCESS] Module config:`, moduleConfig);
  
  // If module is blocked, deny access
  if (moduleConfig.accessType === 'none') {
    console.log(`[ACCESS] ❌ Module blocked (accessType: none) - denied`);
    return false;
  }

  // If module allows all, continue to level-specific check
  if (moduleConfig.accessType === 'all') {
    console.log(`[ACCESS] Module allows all - checking level-specific config`);
    // Continue to level-specific check
  } else if (moduleConfig.accessType === 'role') {
    // Role-based blocking at module level
    console.log(`[ACCESS] Module role-based blocking - checking roles:`, moduleConfig.allowedRoles);
    if (!user) {
      // If "guest" is in blocked roles, deny access
      if (moduleConfig.allowedRoles.includes('guest')) {
        console.log(`[ACCESS] ❌ Guest user blocked at module level - denied`);
        return false;
      }
    } else {
      // If user's role is in blocked list, deny access
      if (moduleConfig.allowedRoles.includes(user.role)) {
        console.log(`[ACCESS] ❌ User role "${user.role}" blocked at module level - denied`);
        return false;
      }
    }
    console.log(`[ACCESS] User not blocked at module level - checking level-specific config`);
  } else if (moduleConfig.accessType === 'user') {
    // User-specific blocking at module level
    console.log(`[ACCESS] Module user-based blocking - checking users:`, moduleConfig.allowedUsers);
    if (user?.id) {
      const userId = user.id;
      const isBlocked = moduleConfig.allowedUsers.some(blockedId => 
        blockedId === userId || 
        String(blockedId) === String(userId) ||
        Number(blockedId) === Number(userId)
      );
      if (isBlocked) {
        console.log(`[ACCESS] ❌ User ID "${userId}" blocked at module level - denied`);
        return false;
      }
    }
    console.log(`[ACCESS] User not blocked at module level - checking level-specific config`);
  }

  // Now check level-specific access control
  // ✅ FIXED: Use sync version for hasAccess (called frequently, needs to be fast)
  const config = getAccessConfigSync(module, levelId);
  console.log(`[ACCESS] Level config for ${module}/${levelId}:`, config);

  // No access
  if (config.accessType === 'none') {
    console.log(`[ACCESS] ❌ Level blocked (accessType: none) - denied`);
    return false;
  }

  // All users have access
  if (config.accessType === 'all') {
    console.log(`[ACCESS] ✅ Level allows all - granted`);
    return true;
  }

  // Role-based blocking: Selected roles are BLOCKED, others are allowed
  if (config.accessType === 'role') {
    console.log(`[ACCESS] Level role-based blocking - checking roles:`, config.allowedRoles);
    // Handle guest users (not logged in)
    if (!user) {
      // If "guest" is in blocked roles, deny access
      const isGuestBlocked = config.allowedRoles.includes('guest');
      console.log(`[ACCESS] Guest user - blocked: ${isGuestBlocked}`);
      return !isGuestBlocked;
    }
    // If user's role is in blocked list, deny access
    const isRoleBlocked = config.allowedRoles.includes(user.role);
    console.log(`[ACCESS] User role "${user.role}" - blocked: ${isRoleBlocked}`);
    return !isRoleBlocked;
  }

  // User-specific blocking: Selected users are BLOCKED, others are allowed
  if (config.accessType === 'user') {
    console.log(`[ACCESS] Level user-based blocking - checking users:`, config.allowedUsers);
    if (!user?.id) {
      console.log(`[ACCESS] ✅ No user ID - allowed (guest)`);
      return true; // No user ID = allow (or handle as needed)
    }
    // Handle both number and string IDs
    const userId = user.id;
    const isBlocked = config.allowedUsers.some(blockedId => 
      blockedId === userId || 
      String(blockedId) === String(userId) ||
      Number(blockedId) === Number(userId)
    );
    // If user is in blocked list, deny access
    console.log(`[ACCESS] User ID "${userId}" - blocked: ${isBlocked}`);
    return !isBlocked;
  }

  console.log(`[ACCESS] ❌ Unknown access type or no match - denied`);
  return false;
}

/**
 * Initialize default configs for all levels
 * @param {string} module - 'level' or 'jlpt'
 */
export function initializeDefaultConfigs(module) {
  const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
  const allConfigs = getAllAccessConfigs(module);

  console.log(`[ACCESS] Initializing default configs for ${module}:`, allConfigs);

  levels.forEach(levelId => {
    if (!allConfigs[levelId]) {
      console.log(`[ACCESS] Setting default config for ${module}/${levelId} (not exists)`);
      setAccessConfig(module, levelId, { ...DEFAULT_ACCESS_CONFIG });
    } else {
      console.log(`[ACCESS] Keeping existing config for ${module}/${levelId}:`, allConfigs[levelId]);
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

