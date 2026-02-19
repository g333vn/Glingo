// src/utils/secureUserStorage.js
// Secure User Storage - Quản lý an toàn thông tin user trong localStorage
// Thay thế các cách lưu trữ không an toàn

import { hashPassword, verifyPassword, secureStorage as encryptedStorage } from './storageEncryption.js';
import { logger } from './logger.js';

/**
 * ========================================
 * CONSTANTS
 * ========================================
 */

// Key obfuscated cho passwords (không dùng tên rõ ràng)
const PASSWORDS_KEY = '_sp_'; // secure passwords
const AUTH_USER_KEY = '_au_'; // auth user minimal
const MIGRATED_FLAG = '_pm_v2_'; // password migrated v2

/**
 * ========================================
 * PASSWORD MANAGEMENT (Hashed + Obfuscated)
 * ========================================
 */

/**
 * Lưu password đã hash vào secure storage
 * @param {string|number} userId 
 * @param {string} username 
 * @param {string} plainPassword - Password gốc (sẽ được hash)
 */
export async function savePasswordSecure(userId, username, plainPassword) {
  try {
    if (!plainPassword) {
      logger.warn('[SecureUserStorage] No password provided');
      return false;
    }

    // Hash password
    const hashedPassword = await hashPassword(plainPassword);
    if (!hashedPassword) {
      logger.error('[SecureUserStorage] Failed to hash password');
      return false;
    }

    // Lấy passwords đã lưu
    const savedPasswords = encryptedStorage.getItem(PASSWORDS_KEY) || {};

    // Lưu bằng nhiều key để dễ tìm
    savedPasswords[String(userId)] = hashedPassword;
    savedPasswords[username] = hashedPassword;

    // Lưu vào secure storage (obfuscated)
    const success = encryptedStorage.setItem(PASSWORDS_KEY, savedPasswords);

    if (success) {
      logger.debug('[SecureUserStorage] Password saved securely', { userId, username });
    }

    return success;
  } catch (error) {
    logger.error('[SecureUserStorage] Error saving password', { error });
    return false;
  }
}

/**
 * Verify password
 * @param {string|number} userId 
 * @param {string} username 
 * @param {string} plainPassword 
 * @returns {Promise<boolean>}
 */
export async function verifyUserPassword(userId, username, plainPassword) {
  try {
    const savedPasswords = encryptedStorage.getItem(PASSWORDS_KEY) || {};

    // Tìm hash theo userId hoặc username
    const savedHash = savedPasswords[String(userId)] || savedPasswords[username];

    if (!savedHash) {
      logger.warn('[SecureUserStorage] No password found for user', { userId, username });
      return false;
    }

    // Verify
    const isValid = await verifyPassword(plainPassword, savedHash);
    return isValid;
  } catch (error) {
    logger.error('[SecureUserStorage] Error verifying password', { error });
    return false;
  }
}

/**
 * Xoá password của user
 * @param {string|number} userId 
 * @param {string} username 
 */
export function removePassword(userId, username) {
  try {
    const savedPasswords = encryptedStorage.getItem(PASSWORDS_KEY) || {};

    delete savedPasswords[String(userId)];
    delete savedPasswords[username];

    encryptedStorage.setItem(PASSWORDS_KEY, savedPasswords);
    logger.debug('[SecureUserStorage] Password removed', { userId, username });
  } catch (error) {
    logger.error('[SecureUserStorage] Error removing password', { error });
  }
}

/**
 * ========================================
 * MIGRATION: Chuyển passwords cũ sang secure storage
 * ========================================
 */

/**
 * Migrate passwords từ localStorage plaintext sang secure storage (hashed)
 * Chạy một lần khi app khởi động
 */
export async function migratePasswords() {
  try {
    // Kiểm tra đã migrate chưa
    const alreadyMigrated = localStorage.getItem(MIGRATED_FLAG);
    if (alreadyMigrated === 'true') {
      return { success: true, alreadyMigrated: true };
    }

    logger.info('[SecureUserStorage] Starting password migration...');

    // Đọc passwords cũ (plaintext)
    const oldPasswordsStr = localStorage.getItem('userPasswords');
    if (!oldPasswordsStr) {
      logger.info('[SecureUserStorage] No old passwords found');
      localStorage.setItem(MIGRATED_FLAG, 'true');
      return { success: true, migratedCount: 0 };
    }

    const oldPasswords = JSON.parse(oldPasswordsStr);
    const keys = Object.keys(oldPasswords);
    logger.info('[SecureUserStorage] Found passwords to migrate', { count: keys.length });

    let migratedCount = 0;
    const newPasswords = {};

    for (const key of keys) {
      const password = oldPasswords[key];

      // Kiểm tra nếu đã là hash (64 chars hex = SHA-256)
      if (typeof password === 'string' && password.length === 64 && /^[a-f0-9]+$/i.test(password)) {
        // Đã là hash, giữ nguyên
        newPasswords[key] = password;
        continue;
      }

      // Hash password
      const hashed = await hashPassword(password);
      if (hashed) {
        newPasswords[key] = hashed;
        migratedCount++;
      }
    }

    // Lưu vào secure storage
    encryptedStorage.setItem(PASSWORDS_KEY, newPasswords);

    // Xoá passwords cũ (plaintext)
    localStorage.removeItem('userPasswords');

    // Đánh dấu đã migrate
    localStorage.setItem(MIGRATED_FLAG, 'true');

    logger.info('[SecureUserStorage] Migration completed', { migratedCount, total: keys.length });

    return { success: true, migratedCount, total: keys.length };
  } catch (error) {
    logger.error('[SecureUserStorage] Migration error', { error });
    return { success: false, error: error.message };
  }
}

/**
 * ========================================
 * AUTH USER METADATA (Minimal, không nhạy cảm)
 * ========================================
 */

/**
 * Lưu thông tin user tối thiểu (không password, không token)
 * @param {object} user 
 */
export function saveAuthUser(user) {
  if (!user) return;

  // Chỉ lưu các field an toàn
  const minimalUser = {
    id: user.id,
    displayName: user.displayName || user.display_name || user.name || user.username,
    role: user.role,
    // KHÔNG lưu: email đầy đủ, password, token, secret
  };

  try {
    // Dùng obfuscated key
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(minimalUser));
    logger.debug('[SecureUserStorage] Auth user saved', { id: minimalUser.id, role: minimalUser.role });
  } catch (error) {
    logger.error('[SecureUserStorage] Error saving auth user', { error });
  }
}

/**
 * Đọc thông tin user tối thiểu
 * @returns {object|null}
 */
export function getAuthUser() {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error('[SecureUserStorage] Error reading auth user', { error });
    return null;
  }
}

/**
 * Xoá thông tin auth user
 */
export function clearAuthUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    // Xoá cả key cũ nếu còn
    localStorage.removeItem('authUser');
    logger.debug('[SecureUserStorage] Auth user cleared');
  } catch (error) {
    logger.error('[SecureUserStorage] Error clearing auth user', { error });
  }
}

/**
 * ========================================
 * ADMIN USERS (Metadata only, không password)
 * ========================================
 */

/**
 * Lưu danh sách users (metadata only, tự động xoá password)
 * @param {Array} users 
 */
export function saveAdminUsers(users) {
  if (!Array.isArray(users)) return;

  // Xoá password và các field nhạy cảm
  const safeUsers = users.map(user => {
    const { password, token, secret, accessToken, refreshToken, ...safeUser } = user;
    return safeUser;
  });

  try {
    localStorage.setItem('adminUsers', JSON.stringify(safeUsers));
    logger.debug('[SecureUserStorage] Admin users saved', { count: safeUsers.length });

    // Dispatch event
    window.dispatchEvent(new CustomEvent('adminUsersUpdated', {
      detail: { updatedUsers: safeUsers }
    }));
  } catch (error) {
    logger.error('[SecureUserStorage] Error saving admin users', { error });
  }
}

/**
 * Đọc danh sách admin users
 * @returns {Array}
 */
export function getAdminUsers() {
  try {
    const data = localStorage.getItem('adminUsers');
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logger.error('[SecureUserStorage] Error reading admin users', { error });
    return [];
  }
}

/**
 * ========================================
 * CLEANUP
 * ========================================
 */

/**
 * Xoá tất cả data nhạy cảm (khi logout)
 */
export function clearAllSensitiveData() {
  try {
    // Xoá auth user
    clearAuthUser();

    // Xoá Supabase tokens
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (/^sb-.*-auth-token$/.test(key)) {
        localStorage.removeItem(key);
      }
    }

    // KHÔNG xoá passwords (để user có thể login lại)
    // KHÔNG xoá adminUsers (để admin có thể quản lý)

    logger.info('[SecureUserStorage] Sensitive data cleared');
  } catch (error) {
    logger.error('[SecureUserStorage] Error clearing sensitive data', { error });
  }
}

/**
 * Audit localStorage - kiểm tra có key nào không an toàn
 * @returns {object}
 */
export function auditStorage() {
  const result = {
    safe: [],
    warning: [],
    danger: [],
  };

  const dangerPatterns = ['password', 'secret', 'token', 'key'];
  const warningKeys = ['authUser', 'userPasswords'];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const lowerKey = key.toLowerCase();

      // Check danger
      if (dangerPatterns.some(p => lowerKey.includes(p)) && key !== AUTH_USER_KEY) {
        result.danger.push(key);
        continue;
      }

      // Check warning
      if (warningKeys.includes(key)) {
        result.warning.push(key);
        continue;
      }

      result.safe.push(key);
    }
  } catch (error) {
    logger.error('[SecureUserStorage] Audit error', { error });
  }

  return result;
}

/**
 * ========================================
 * INIT - Chạy khi app khởi động
 * ========================================
 */

/**
 * Khởi tạo secure storage - migrate passwords cũ
 */
export async function initSecureStorage() {
  try {
    // Migrate passwords
    await migratePasswords();

    // Migrate authUser cũ sang key mới
    const oldAuthUser = localStorage.getItem('authUser');
    if (oldAuthUser) {
      try {
        const parsed = JSON.parse(oldAuthUser);
        saveAuthUser(parsed);
        localStorage.removeItem('authUser');
        logger.info('[SecureUserStorage] Migrated old authUser');
      } catch (e) {
        localStorage.removeItem('authUser');
      }
    }

    logger.info('[SecureUserStorage] Initialization complete');
  } catch (error) {
    logger.error('[SecureUserStorage] Initialization error', { error });
  }
}

export default {
  savePasswordSecure,
  verifyUserPassword,
  removePassword,
  migratePasswords,
  saveAuthUser,
  getAuthUser,
  clearAuthUser,
  saveAdminUsers,
  getAdminUsers,
  clearAllSensitiveData,
  auditStorage,
  initSecureStorage,
};

