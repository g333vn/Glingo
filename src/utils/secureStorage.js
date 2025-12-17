// src/utils/secureStorage.js
// 🔒 Secure Storage Wrapper
// Quản lý những gì được phép lưu vào localStorage, tự động redact thông tin nhạy cảm.

/**
 * ========================================
 * WHITELIST: Các key được phép lưu vào localStorage
 * ========================================
 * 
 * ✅ AN TOÀN (thuần UI, không nhạy cảm):
 * - theme, language, locale
 * - levelAccessControl, jlptAccessControl (config quyền truy cập)
 * - levelModuleAccessControl, jlptModuleAccessControl
 * - systemSettings (maintenance mode, etc.)
 * - adminBooks_* (cache sách)
 * - viewedNotifications, dismissedBanners
 * 
 * ⚠️ CẦN CẨN THẬN (chỉ lưu tối thiểu):
 * - adminUsers (metadata user, KHÔNG có password)
 * - sb-*-auth-token (Supabase quản lý, httpOnly tốt hơn nhưng Supabase JS SDK cần)
 * 
 * ❌ KHÔNG BAO GIỜ LƯU:
 * - password, plaintext password
 * - secret, apiKey, serviceKey
 * - full profile với thông tin nhạy cảm
 * - token thủ công (ngoài Supabase SDK)
 */

const ALLOWED_KEYS = [
  // UI preferences
  'theme',
  'language',
  'locale',
  'sidebarCollapsed',
  
  // Access control (public config, không nhạy cảm)
  'levelAccessControl',
  'jlptAccessControl',
  'levelModuleAccessControl',
  'jlptModuleAccessControl',
  
  // System settings
  'systemSettings',
  
  // Content cache
  /^adminBooks_/,
  /^cache_/,
  
  // UI state
  'viewedNotifications',
  'dismissedBanners',
  'lastVisitedPage',
  
  // Supabase auth (SDK quản lý)
  /^sb-.*-auth-token$/,
  
  // Analytics (anonymous)
  'analyticsId',
  'pageViews',
  
  // Secure storage (obfuscated)
  /^_s_/,
];

/**
 * Các key KHÔNG ĐƯỢC PHÉP lưu (sẽ bị block hoặc redact)
 */
const BLOCKED_KEYS = [
  'password',
  'plainPassword',
  'secret',
  'apiKey',
  'serviceKey',
  'accessToken',
  'refreshToken',
];

/**
 * Các field trong object cần redact trước khi lưu
 */
const SENSITIVE_FIELDS = [
  'password',
  'plainPassword',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'serviceKey',
];

/**
 * Kiểm tra key có được phép lưu không
 */
function isAllowedKey(key) {
  return ALLOWED_KEYS.some(allowed => {
    if (typeof allowed === 'string') {
      return key === allowed;
    }
    if (allowed instanceof RegExp) {
      return allowed.test(key);
    }
    return false;
  });
}

/**
 * Kiểm tra key có bị block không
 */
function isBlockedKey(key) {
  const lowerKey = key.toLowerCase();
  return BLOCKED_KEYS.some(blocked => lowerKey.includes(blocked.toLowerCase()));
}

/**
 * Redact sensitive fields từ object
 */
function redactSensitiveData(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }
  
  const redacted = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (field in redacted) {
      delete redacted[field]; // Xoá hẳn, không lưu
    }
  }
  
  // Recursive cho nested objects
  for (const key of Object.keys(redacted)) {
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  
  return redacted;
}

/**
 * ========================================
 * SECURE STORAGE API
 * ========================================
 */

export const secureStorage = {
  /**
   * Lưu data vào localStorage (có kiểm tra whitelist + redact)
   * @param {string} key 
   * @param {any} value 
   * @param {object} options - { force: boolean } - bỏ qua whitelist check
   * @returns {boolean} success
   */
  setItem(key, value, options = {}) {
    try {
      // Block sensitive keys
      if (isBlockedKey(key)) {
        console.warn(`[SecureStorage] ❌ Blocked key "${key}" - không được phép lưu`);
        return false;
      }
      
      // Check whitelist (trừ khi force)
      if (!options.force && !isAllowedKey(key)) {
        console.warn(`[SecureStorage] ⚠️ Key "${key}" không trong whitelist. Dùng { force: true } nếu cần.`);
        return false;
      }
      
      // Redact sensitive data từ object
      let safeValue = value;
      if (typeof value === 'object' && value !== null) {
        safeValue = redactSensitiveData(value);
      }
      
      // Stringify nếu là object
      const stringValue = typeof safeValue === 'string' 
        ? safeValue 
        : JSON.stringify(safeValue);
      
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error saving "${key}":`, error);
      return false;
    }
  },
  
  /**
   * Đọc data từ localStorage
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {any}
   */
  getItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      // Try parse JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`[SecureStorage] Error reading "${key}":`, error);
      return defaultValue;
    }
  },
  
  /**
   * Xoá key khỏi localStorage
   * @param {string} key 
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[SecureStorage] Error removing "${key}":`, error);
    }
  },
  
  /**
   * Xoá tất cả data nhạy cảm (dùng khi logout)
   */
  clearSensitive() {
    try {
      // Xoá các key có thể chứa data nhạy cảm
      const keysToRemove = [
        'authUser',
        'userPasswords',
        'adminUsers',
      ];
      
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      
      // Xoá Supabase auth tokens
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && /^sb-.*-auth-token$/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      
      console.log('[SecureStorage] ✅ Cleared sensitive data');
    } catch (error) {
      console.error('[SecureStorage] Error clearing sensitive data:', error);
    }
  },
  
  /**
   * Audit: liệt kê tất cả key trong localStorage và phân loại
   * @returns {object} { safe: [], warning: [], blocked: [] }
   */
  audit() {
    const result = {
      safe: [],
      warning: [],
      blocked: [],
    };
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        if (isBlockedKey(key)) {
          result.blocked.push(key);
        } else if (isAllowedKey(key)) {
          result.safe.push(key);
        } else {
          result.warning.push(key);
        }
      }
    } catch (error) {
      console.error('[SecureStorage] Error auditing:', error);
    }
    
    return result;
  },
};

/**
 * ========================================
 * HELPER: Lưu user metadata an toàn
 * ========================================
 */

/**
 * Lưu user metadata (KHÔNG có password)
 * @param {object} user - User object
 */
export function saveUserMetadata(user) {
  if (!user) return;
  
  // Chỉ lưu các field an toàn
  const safeUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.display_name,
    role: user.role,
    email: user.email,
    // KHÔNG lưu: password, token, secret
  };
  
  secureStorage.setItem('currentUserMeta', safeUser, { force: true });
}

/**
 * Đọc user metadata
 * @returns {object|null}
 */
export function getUserMetadata() {
  return secureStorage.getItem('currentUserMeta', null);
}

/**
 * Xoá user metadata (khi logout)
 */
export function clearUserMetadata() {
  secureStorage.removeItem('currentUserMeta');
}

export default secureStorage;

