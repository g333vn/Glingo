// src/data/seedData.js
// 🌱 SEED DATA - Initial demo users for development and testing
// ⚠️ In production, disable SEED_ENABLED or use proper database seeding

/**
 * Configuration for seed data
 * CLEAN MODE: Disable all automatic demo users.
 */
export const SEED_CONFIG = {
  ENABLED: false,      // ❌ Không tự tạo user demo nữa
  AUTO_SEED: false,    // ❌ Không auto seed khi không có user
  KEEP_AFTER_DELETE: false // Nếu false, user demo đã xoá sẽ không xuất hiện lại
};

/**
 * Default demo users for development/testing
 * These users will be automatically created when system starts
 */
export const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
    email: 'admin@example.com',
    isDemo: true // ✅ Flag to identify demo users
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    role: 'user',
    name: 'User 1',
    email: 'user1@example.com',
    isDemo: true
  },
  {
    id: 3,
    username: 'editor',
    password: 'editor123',
    role: 'editor',
    name: 'Editor',
    email: 'editor@example.com',
    isDemo: true
  }
];

/**
 * Get demo users based on configuration
 * @returns {Array} Demo users if enabled, empty array otherwise
 */
export function getDemoUsers() {
  if (!SEED_CONFIG.ENABLED) {
    console.log('[SEED] Demo users disabled by config');
    return [];
  }
  
  console.log('[SEED] Returning demo users:', DEMO_USERS.map(u => u.username));
  return [...DEMO_USERS];
}

/**
 * Check if seeding is enabled
 * @returns {boolean}
 */
export function isSeedEnabled() {
  return SEED_CONFIG.ENABLED;
}

/**
 * Check if auto-seeding is enabled
 * @returns {boolean}
 */
export function isAutoSeedEnabled() {
  return SEED_CONFIG.ENABLED && SEED_CONFIG.AUTO_SEED;
}

/**
 * Check if deleted demo users should reappear
 * @returns {boolean}
 */
export function shouldKeepAfterDelete() {
  return SEED_CONFIG.KEEP_AFTER_DELETE;
}

/**
 * Reset seed configuration to defaults
 */
export function resetSeedConfig() {
  SEED_CONFIG.ENABLED = true;
  SEED_CONFIG.AUTO_SEED = true;
  SEED_CONFIG.KEEP_AFTER_DELETE = false;
  console.log('[SEED] Configuration reset to defaults');
}

export default {
  SEED_CONFIG,
  DEMO_USERS,
  getDemoUsers,
  isSeedEnabled,
  isAutoSeedEnabled,
  shouldKeepAfterDelete,
  resetSeedConfig
};

