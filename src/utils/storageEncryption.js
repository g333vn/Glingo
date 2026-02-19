// src/utils/storageEncryption.js
// Storage Encryption Utility
// Mã hóa/obfuscate dữ liệu trước khi lưu vào localStorage để giảm thiểu thông tin hiển thị trong Application tab

/**
 * Simple obfuscation using Base64 encoding
 * Lưu ý: Đây KHÔNG phải là mã hóa mạnh, chỉ để obfuscate dữ liệu
 * Để bảo mật thực sự, nên sử dụng server-side storage hoặc Web Crypto API với keys phức tạp hơn
 */
class StorageEncryption {
  constructor() {
    // Simple key for obfuscation (có thể thay đổi)
    // Trong production, nên generate key động hoặc lấy từ server
    this.obfuscationKey = this.generateKey();
  }

  /**
   * Generate a simple obfuscation key based on domain
   * Trong production, nên lấy key từ server hoặc generate phức tạp hơn
   */
  generateKey() {
    if (typeof window === 'undefined') return 'default-key';
    
    // Sử dụng domain + một số thông tin khác để tạo key
    const domain = window.location.hostname;
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily rotation
    return btoa(`${domain}-${timestamp}`).substring(0, 16);
  }

  /**
   * Obfuscate data (simple Base64 + XOR)
   * Đây KHÔNG phải mã hóa mạnh, chỉ để làm khó đọc
   */
  obfuscate(data) {
    try {
      const jsonString = JSON.stringify(data);
      const base64 = btoa(jsonString);
      
      // Simple XOR với key
      let obfuscated = '';
      for (let i = 0; i < base64.length; i++) {
        const keyChar = this.obfuscationKey[i % this.obfuscationKey.length];
        obfuscated += String.fromCharCode(base64.charCodeAt(i) ^ keyChar.charCodeAt(0));
      }
      
      return btoa(obfuscated);
    } catch (error) {
      console.error('[StorageEncryption] Error obfuscating data:', error);
      return null;
    }
  }

  /**
   * Deobfuscate data
   */
  deobfuscate(obfuscatedData) {
    try {
      // Reverse XOR
      const base64 = atob(obfuscatedData);
      let deobfuscated = '';
      for (let i = 0; i < base64.length; i++) {
        const keyChar = this.obfuscationKey[i % this.obfuscationKey.length];
        deobfuscated += String.fromCharCode(base64.charCodeAt(i) ^ keyChar.charCodeAt(0));
      }
      
      const jsonString = atob(deobfuscated);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('[StorageEncryption] Error deobfuscating data:', error);
      return null;
    }
  }

  /**
   * Hash password using Web Crypto API (SHA-256)
   * Lưu ý: SHA-256 là one-way hash, không thể reverse
   * Chỉ dùng để so sánh, không thể lấy lại password gốc
   */
  async hashPassword(password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('[StorageEncryption] Error hashing password:', error);
      return null;
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password, hash) {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Obfuscate key name
   * Thay vì dùng tên key rõ ràng như 'userPasswords', dùng tên obfuscated
   */
  obfuscateKey(key) {
    // Simple obfuscation: Base64 encode key name
    // Trong production, có thể dùng mapping table hoặc hash
    return btoa(key).replace(/[+/=]/g, (match) => {
      return { '+': '-', '/': '_', '=': '' }[match];
    });
  }

  /**
   * Deobfuscate key name
   */
  deobfuscateKey(obfuscatedKey) {
    try {
      // Add padding if needed
      let padded = obfuscatedKey.replace(/-/g, '+').replace(/_/g, '/');
      while (padded.length % 4) {
        padded += '=';
      }
      return atob(padded);
    } catch (error) {
      console.error('[StorageEncryption] Error deobfuscating key:', error);
      return null;
    }
  }
}

// Export singleton instance
const storageEncryption = new StorageEncryption();

/**
 * Secure storage wrapper
 * Tự động obfuscate data và key names
 */
export const secureStorage = {
  /**
   * Set item với obfuscation
   */
  setItem(key, value, options = {}) {
    try {
      const { obfuscateKey: obfuscateKeyName = true, obfuscateValue = true } = options;
      
      // Obfuscate key name
      const storageKey = obfuscateKeyName 
        ? storageEncryption.obfuscateKey(key)
        : key;
      
      // Obfuscate value
      const storageValue = obfuscateValue
        ? storageEncryption.obfuscate(value)
        : JSON.stringify(value);
      
      if (storageValue === null) {
        console.error('[SecureStorage] Failed to obfuscate value');
        return false;
      }
      
      localStorage.setItem(storageKey, storageValue);
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error setting item:', error);
      return false;
    }
  },

  /**
   * Get item với deobfuscation
   */
  getItem(key, options = {}) {
    try {
      const { obfuscateKey: obfuscateKeyName = true, obfuscateValue = true } = options;
      
      // Obfuscate key name để tìm
      const storageKey = obfuscateKeyName
        ? storageEncryption.obfuscateKey(key)
        : key;
      
      const storedValue = localStorage.getItem(storageKey);
      if (!storedValue) return null;
      
      // Deobfuscate value
      if (obfuscateValue) {
        return storageEncryption.deobfuscate(storedValue);
      } else {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error('[SecureStorage] Error getting item:', error);
      return null;
    }
  },

  /**
   * Remove item
   */
  removeItem(key, options = {}) {
    try {
      const { obfuscateKey: obfuscateKeyName = true } = options;
      const storageKey = obfuscateKeyName
        ? storageEncryption.obfuscateKey(key)
        : key;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error removing item:', error);
      return false;
    }
  },

  /**
   * Clear all secure storage items
   * Chỉ xóa các items được tạo bởi secureStorage
   */
  clear() {
    // Lưu ý: Khó xác định items nào là secure storage nếu keys đã obfuscated
    // Nên sử dụng prefix hoặc namespace
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      // Nếu key là base64 encoded (obfuscated), có thể là secure storage
      // Nhưng cách này không chính xác 100%
      try {
        atob(key.replace(/-/g, '+').replace(/_/g, '/'));
        localStorage.removeItem(key);
      } catch (e) {
        // Not a base64 key, skip
      }
    });
  }
};

/**
 * Hash password utility
 */
export async function hashPassword(password) {
  return await storageEncryption.hashPassword(password);
}

/**
 * Verify password utility
 */
export async function verifyPassword(password, hash) {
  return await storageEncryption.verifyPassword(password, hash);
}

export default storageEncryption;

