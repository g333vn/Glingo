// src/data/users.secure.example.js
// EXAMPLE: Secure version của users.js với password hashing và obfuscation
// Đây là file ví dụ, không thay thế users.js hiện tại
// Sử dụng làm reference để migrate sang secure storage

import { secureStorage, hashPassword, verifyPassword } from '@/utils/storageEncryption';
import { logger } from '../utils/logger.js';

/**
 * SECURE VERSION: Save user password với hashing
 * Passwords được hash (SHA-256) trước khi lưu vào secure storage
 */
export async function saveUserPasswordSecure(userId, username, password) {
  try {
    // Hash password trước khi lưu
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      console.error('[SAVE_PASSWORD] Failed to hash password');
      return false;
    }
    
    // Lấy passwords đã lưu (nếu có)
    const savedPasswords = secureStorage.getItem('userPasswords') || {};
    
    // CRITICAL: Lưu bằng cả id (number và string) và username để dễ tìm
    // Đảm bảo tương thích với cả number và string ID
    savedPasswords[userId] = hashedPassword;
    savedPasswords[String(userId)] = hashedPassword; // Lưu cả string ID
    savedPasswords[username] = hashedPassword;
    
    // Lưu vào secure storage (tự động obfuscate)
    const success = secureStorage.setItem('userPasswords', savedPasswords);
    
    if (success) {
      logger.info('[SAVE_PASSWORD] ✅ Password saved securely', {
        userId,
        username,
        passwordHashed: true,
        keysSaved: [userId, String(userId), username],
      });
    } else {
      logger.error('[SAVE_PASSWORD] ❌ Failed to save password');
    }
    
    return success;
  } catch (error) {
    console.error('[SAVE_PASSWORD] Error saving user password:', error);
    return false;
  }
}

/**
 * SECURE VERSION: Login với password verification
 * So sánh password input với hash đã lưu
 */
export async function loginSecure(username, password) {
  try {
    // Lấy users từ localStorage nếu có, không thì dùng users mặc định
    const allUsers = getUsers();
    
    // Tìm user theo username
    const user = allUsers.find(u => {
      const isSupabaseUser = u.isSupabaseUser || u.supabaseId || (typeof u.id === 'string' && u.id.startsWith('supabase_'));
      // Chỉ match local users (không phải Supabase users)
      return !isSupabaseUser && u.username === username;
    });
    
    if (!user) {
      console.error('[LOGIN] ❌ User not found:', username);
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
      };
    }
    
    // Lấy saved passwords từ secure storage
    const savedPasswords = secureStorage.getItem('userPasswords') || {};
    
    // Tìm hash password của user (thử cả id và username)
    const savedHash = savedPasswords[user.id] || 
                     savedPasswords[String(user.id)] || 
                     savedPasswords[username];
    
    if (!savedHash) {
      console.error('[LOGIN] ❌ No password hash found for user:', username);
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
      };
    }
    
    // Verify password
    const isValid = await verifyPassword(password, savedHash);
    
    if (!isValid) {
      console.error('[LOGIN] ❌ Password does not match for user:', username);
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
      };
    }
    
    logger.info('[LOGIN] ✅ User authenticated successfully', {
      id: user.id,
      username: user.username,
      role: user.role,
    });
    
    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      role: roles[user.role]
    };
  } catch (error) {
    logger.error('[LOGIN] Error during login', { error });
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.'
    };
  }
}

/**
 * MIGRATION: Migrate passwords từ plaintext sang hashed
 * Chạy một lần để convert dữ liệu cũ
 */
export async function migratePasswordsToSecure() {
  try {
    logger.info('[MIGRATION] Starting password migration...');
    
    // 1. Đọc passwords cũ (plaintext)
    const oldPasswordsStr = localStorage.getItem('userPasswords');
    if (!oldPasswordsStr) {
      logger.info('[MIGRATION] No old passwords found, skipping migration');
      return { success: true, migrated: 0 };
    }
    
    const oldPasswords = JSON.parse(oldPasswordsStr);
    logger.info('[MIGRATION] Found passwords to migrate', {
      count: Object.keys(oldPasswords).length,
    });
    
    // 2. Hash từng password
    const newPasswords = {};
    let migrated = 0;
    
    for (const [key, plainPassword] of Object.entries(oldPasswords)) {
      // Skip nếu đã là hash (64 chars hex = SHA-256)
      if (typeof plainPassword === 'string' && plainPassword.length === 64 && /^[a-f0-9]+$/i.test(plainPassword)) {
        logger.debug('[MIGRATION] Key already appears to be hashed, skipping', { key });
        newPasswords[key] = plainPassword;
        continue;
      }
      
      // Hash password
      const hashed = await hashPassword(plainPassword);
      if (hashed) {
        newPasswords[key] = hashed;
        migrated++;
        logger.info('[MIGRATION] Migrated password for key', { key });
      } else {
        logger.error('[MIGRATION] Failed to hash password for key', { key });
      }
    }
    
    // 3. Lưu passwords mới vào secure storage
    secureStorage.setItem('userPasswords', newPasswords);
    
    // 4. Xóa passwords cũ (sau khi đã migrate thành công)
    localStorage.removeItem('userPasswords');
    
    logger.info('[MIGRATION] ✅ Migration completed', {
      total: Object.keys(oldPasswords).length,
      migrated,
      skipped: Object.keys(oldPasswords).length - migrated,
    });
    
    return {
      success: true,
      migrated,
      total: Object.keys(oldPasswords).length
    };
  } catch (error) {
    logger.error('[MIGRATION] ❌ Error during migration', { error });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * USAGE EXAMPLE:
 * 
 * // 1. Migrate passwords (chạy một lần)
 * await migratePasswordsToSecure();
 * 
 * // 2. Save password mới
 * await saveUserPasswordSecure(userId, username, password);
 * 
 * // 3. Login
 * const result = await loginSecure(username, password);
 * if (result.success) {
 *   console.log('Logged in as:', result.user);
 * }
 */

