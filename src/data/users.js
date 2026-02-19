// src/data/users.js
// USER MANAGEMENT SYSTEM
// Professional user data management with seed data pattern
// In production: Disable seed data and use proper database

// SECURITY: Import secure storage utilities
import { 
  savePasswordSecure, 
  verifyUserPassword, 
  saveAdminUsers, 
  getAdminUsers 
} from '../utils/secureUserStorage.js';
import { logger } from '../utils/logger.js';

/**
 * ========================================
 * ARCHITECTURE OVERVIEW
 * ========================================
 * 
 * This system uses a professional "Seed Data" pattern:
 * 
 * 1. SEED DATA (seedData.js)
 *    - Demo users defined separately
 *    - Configuration for enable/disable
 *    - Can be turned off for production
 * 
 * 2. USER STORAGE (localStorage)
 *    - adminUsers: User metadata (NO passwords)
 *    - Passwords: Hashed + obfuscated via secureUserStorage
 *    - deletedUsers: Blacklist of deleted demo users
 * 
 * 3. DATA PRIORITY
 *    - adminUsers = highest priority (user-modified data)
 *    - Demo users = fallback (only if not in adminUsers & not deleted)
 *    - Passwords: Hashed in secure storage
 * 
 * 4. DELETE BEHAVIOR
 *    - User-created users: Deleted from adminUsers
 *    - Demo users: Added to blacklist (hidden but code remains)
 *    - Blacklist prevents demo users from reappearing on reload
 * 
 * 5. WHY DEMO USERS STAY IN CODE?
 *    - Fallback if localStorage is cleared
 *    - Can be restored via "Clear Blacklist"
 *    - Easy to see default users at a glance
 *    - Professional pattern (like database seeds)
 * 
 * See: docs/USER_MANAGEMENT_ARCHITECTURE.md for full documentation
 */

import { getDemoUsers, shouldKeepAfterDelete } from './seedData.js';
import { getSetting } from '../utils/settingsManager.js';

/**
 * Get demo/seed users
 * This is a getter function to ensure config is always fresh
 * CLEAN MODE: Returns empty array
 */
export const users = [];

// Roles và permissions
export const roles = {
  admin: {
    name: 'Administrator',
    permissions: ['quiz-editor', 'manage-users', 'view-all']
  },
  editor: {
    name: 'Editor',
    permissions: ['quiz-editor', 'exam-editor', 'view-all']
  },
  user: {
    name: 'User',
    permissions: ['view-all']
  }
};

// Helper function để check permission
export function hasPermission(userRole, permission) {
  const role = roles[userRole];
  if (!role) return false;
  return role.permissions.includes(permission);
}

/**
 * ========================================
 * DELETED USERS BLACKLIST SYSTEM
 * ========================================
 * Prevents deleted demo users from reappearing after page reload
 * 
 * How it works:
 * 1. When admin deletes a demo user, ID is added to blacklist
 * 2. getUsers() filters out blacklisted IDs from demo users
 * 3. User stays deleted even after reload
 * 
 * Note: Only applies when SEED_CONFIG.KEEP_AFTER_DELETE = false
 */

/**
 * Get list of deleted user IDs (blacklist)
 * @returns {Array<number>} Array of deleted user IDs
 */
export function getDeletedUsers() {
  try {
    const deletedUsers = localStorage.getItem('deletedUsers');
    if (deletedUsers) {
      return JSON.parse(deletedUsers);
    }
  } catch (e) {
    console.error('[DELETED_USERS] Error reading deletedUsers:', e);
  }
  return [];
}

/**
 * Add user to deleted blacklist
 * @param {number|string} userId - User ID to blacklist (can be number for demo users or string for Supabase users)
 */
export function addToDeletedUsers(userId) {
  try {
    const deletedUsers = getDeletedUsers();
    if (!deletedUsers.includes(userId)) {
      deletedUsers.push(userId);
      localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
      console.log('[DELETED_USERS] Added to blacklist:', userId);
    }
  } catch (e) {
    console.error('[DELETED_USERS] Error adding to deletedUsers:', e);
  }
}

/**
 * Get list of deleted Supabase user emails (blacklist for Supabase users)
 * @returns {Array<string>} Array of deleted Supabase user emails
 */
export function getDeletedSupabaseUsers() {
  try {
    const deletedSupabaseUsers = localStorage.getItem('deletedSupabaseUsers');
    if (deletedSupabaseUsers) {
      return JSON.parse(deletedSupabaseUsers);
    }
  } catch (e) {
    console.error('[DELETED_SUPABASE_USERS] Error reading deletedSupabaseUsers:', e);
  }
  return [];
}

/**
 * Add Supabase user to deleted blacklist (by email)
 * @param {string} email - User email to blacklist
 */
export function addToDeletedSupabaseUsers(email) {
  try {
    if (!email) return;
    const deletedSupabaseUsers = getDeletedSupabaseUsers();
    const emailLower = email.toLowerCase().trim();
    if (!deletedSupabaseUsers.includes(emailLower)) {
      deletedSupabaseUsers.push(emailLower);
      localStorage.setItem('deletedSupabaseUsers', JSON.stringify(deletedSupabaseUsers));
      console.log('[DELETED_SUPABASE_USERS] Added to blacklist:', emailLower);
    }
  } catch (e) {
    console.error('[DELETED_SUPABASE_USERS] Error adding to deletedSupabaseUsers:', e);
  }
}

/**
 * Remove Supabase user from deleted blacklist (restore)
 * @param {string} email - User email to restore
 */
export function removeFromDeletedSupabaseUsers(email) {
  try {
    if (!email) return;
    const deletedSupabaseUsers = getDeletedSupabaseUsers();
    const emailLower = email.toLowerCase().trim();
    const filtered = deletedSupabaseUsers.filter(e => e !== emailLower);
    localStorage.setItem('deletedSupabaseUsers', JSON.stringify(filtered));
    console.log('[DELETED_SUPABASE_USERS] Removed from blacklist:', emailLower);
  } catch (e) {
    console.error('[DELETED_SUPABASE_USERS] Error removing from deletedSupabaseUsers:', e);
  }
}

/**
 * Remove user from deleted blacklist (restore)
 * @param {number} userId - User ID to restore
 */
export function removeFromDeletedUsers(userId) {
  try {
    const deletedUsers = getDeletedUsers();
    const filtered = deletedUsers.filter(id => id !== userId);
    localStorage.setItem('deletedUsers', JSON.stringify(filtered));
    console.log('[DELETED_USERS] Removed from blacklist:', userId);
  } catch (e) {
    console.error('[DELETED_USERS] Error removing from deletedUsers:', e);
  }
}

/**
 * Clear all deleted users blacklist
 */
export function clearDeletedUsers() {
  try {
    localStorage.removeItem('deletedUsers');
    console.log('[DELETED_USERS] Blacklist cleared');
  } catch (e) {
    console.error('[DELETED_USERS] Error clearing deletedUsers:', e);
  }
}

/**
 * ========================================
 * GET USERS - Main user retrieval function
 * ========================================
 * 
 * Priority (highest to lowest):
 * 1. Users from adminUsers (localStorage) - user-created or modified users
 * 2. Demo users from seed data - only if not in adminUsers and not deleted
 * 3. Passwords from userPasswords (localStorage) - stored separately for security
 * 
 * Blacklist Logic:
 * - Deleted demo users are stored in deletedUsers blacklist
 * - Demo users with IDs in blacklist won't be added back
 * - This prevents deleted demo users from reappearing after reload
 * 
 * @returns {Array} Array of user objects with passwords
 */
export function getUsers() {
  // DEBUG: Log call stack để trace nơi gọi
  const stack = new Error().stack;
  const caller = stack?.split('\n')[2]?.trim() || 'unknown';
  console.log('[GETUSERS] ========================================');
  console.log('[GETUSERS] getUsers() called from:', caller);
  console.log('[GETUSERS] ========================================');
  
  try {
    const savedUsers = localStorage.getItem('adminUsers');
    const savedPasswords = localStorage.getItem('userPasswords'); // Key riêng cho passwords
    
    // DEBUG: Log initial state
    console.log('[GETUSERS] Starting getUsers()...', {
      hasAdminUsers: !!savedUsers,
      savedUsersValue: savedUsers,
      savedUsersType: typeof savedUsers,
      adminUsersLength: savedUsers ? savedUsers.length : 0,
      hasUserPasswords: !!savedPasswords,
      userPasswordsLength: savedPasswords ? savedPasswords.length : 0
    });
    
    // CRITICAL: Check if adminUsers exists in localStorage
    if (!savedUsers) {
      console.error('[GETUSERS] ❌ ERROR: adminUsers is NULL or UNDEFINED in localStorage!');
      console.error('[GETUSERS] Checking localStorage directly...');
      const directCheck = localStorage.getItem('adminUsers');
      console.error('[GETUSERS] Direct check result:', {
        value: directCheck,
        type: typeof directCheck,
        isNull: directCheck === null,
        isUndefined: directCheck === undefined
      });
      console.error('[GETUSERS] All localStorage keys:', Object.keys(localStorage));
    }
    
    let passwordsMap = {};
    if (savedPasswords) {
      try {
        passwordsMap = JSON.parse(savedPasswords);
        console.log('[GETUSERS] Passwords map parsed successfully, keys:', Object.keys(passwordsMap));
      } catch (e) {
        console.error('[GETUSERS] Error parsing userPasswords:', e);
      }
    } else {
      console.warn('[GETUSERS] ⚠️ No userPasswords found in localStorage');
    }
    
    if (savedUsers) {
      let parsed;
      try {
        parsed = JSON.parse(savedUsers);
        console.log('[GETUSERS] adminUsers parsed successfully, count:', parsed.length);
      } catch (e) {
        console.error('[GETUSERS] ❌ ERROR parsing adminUsers JSON:', e);
        console.error('[GETUSERS] Raw adminUsers value:', savedUsers.substring(0, 200));
        // If parsing fails, initialize with default users
        console.warn('[GETUSERS] Initializing adminUsers with default users due to parse error');
        const defaultUsersWithoutPassword = users.map(({ password, ...user }) => user);
        localStorage.setItem('adminUsers', JSON.stringify(defaultUsersWithoutPassword));
        parsed = defaultUsersWithoutPassword;
      }
      
      // DEBUG: Log để kiểm tra
      console.log('[GETUSERS] Saved users from adminUsers:', parsed.map(u => ({ id: u.id, username: u.username, role: u.role })));
      console.log('[GETUSERS] Passwords map keys:', Object.keys(passwordsMap));
      
      // CRITICAL: savedUsers từ adminUsers có priority cao nhất
      // Không merge với users mặc định để tránh override role/password đã thay đổi
      const mergedUsers = parsed.map(savedUser => {
        // DEBUG: Log savedUser trước khi merge
        console.log(`[GETUSERS] Processing savedUser ${savedUser.username}:`, {
          id: savedUser.id,
          role: savedUser.role, // CRITICAL: Role từ adminUsers
          name: savedUser.name
        });
        
        // Ưu tiên password từ userPasswords (đã được lưu khi đổi password)
        // Nếu không có trong userPasswords, mới dùng từ users mặc định
        // CRITICAL: Tìm password bằng cả ID (number và string) và username
        const passwordFromStorage = 
          passwordsMap[savedUser.id] || 
          passwordsMap[String(savedUser.id)] || 
          passwordsMap[savedUser.username];
        const originalUser = users.find(u => u.id === savedUser.id || u.username === savedUser.username);
        
        // DEBUG: Log password lookup details
        if (!passwordFromStorage && !originalUser) {
          console.log(`[GETUSERS] Password lookup for ${savedUser.username}:`, {
            userId: savedUser.id,
            userIdType: typeof savedUser.id,
            username: savedUser.username,
            passwordsMapKeys: Object.keys(passwordsMap),
            passwordById: passwordsMap[savedUser.id] ? 'FOUND' : 'NOT_FOUND',
            passwordByIdString: passwordsMap[String(savedUser.id)] ? 'FOUND' : 'NOT_FOUND',
            passwordByUsername: passwordsMap[savedUser.username] ? 'FOUND' : 'NOT_FOUND'
          });
        }
        
        // CRITICAL: Ưu tiên password từ userPasswords (đã được admin/user đổi)
        // Chỉ dùng password mặc định nếu chưa bao giờ đổi password
        // FIX: Nếu là user mới (không có trong default users), password phải từ userPasswords
        // CRITICAL: Supabase users không có password trong localStorage (Supabase quản lý)
        const isSupabaseUser = savedUser.isSupabaseUser || savedUser.supabaseId || (typeof savedUser.id === 'string' && savedUser.id.startsWith('supabase_'));
        const password = passwordFromStorage || (originalUser ? originalUser.password : '');
        
        // DEBUG: Log password source - CRITICAL for new users
        // Không báo lỗi nếu là Supabase user (họ không có password trong localStorage)
        if (!password && !originalUser && !isSupabaseUser) {
          console.error(`[GETUSERS] ❌ ERROR: New user ${savedUser.username} (ID: ${savedUser.id}) has no password!`, {
            userId: savedUser.id,
            username: savedUser.username,
            passwordFromStorage: passwordFromStorage ? '***' : 'EMPTY',
            passwordFromStorageLength: passwordFromStorage ? passwordFromStorage.length : 0,
            originalUserExists: !!originalUser,
            passwordsMapKeys: Object.keys(passwordsMap)
          });
          console.error(`[GETUSERS] Check if password was saved correctly in userPasswords with key: ${savedUser.id} or ${savedUser.username}`);
        } else if (isSupabaseUser && !password) {
          // Supabase user không có password → OK (Supabase quản lý)
          console.log(`[GETUSERS] Supabase user ${savedUser.username} has no password in localStorage (managed by Supabase)`);
        }
        
        // DEBUG: Log merge process - Enhanced for debugging
        console.log(`[GETUSERS] Merging user ${savedUser.username}:`, {
          userId: savedUser.id,
          savedUserRole: savedUser.role, // CRITICAL: Role từ adminUsers
          originalUserRole: originalUser ? originalUser.role : 'none',
          originalUserExists: !!originalUser,
          passwordFromStorage: passwordFromStorage ? '***' : 'none',
          passwordFromStorageLength: passwordFromStorage ? passwordFromStorage.length : 0,
          passwordFromOriginal: originalUser ? (originalUser.password ? '***' : 'none') : 'N/A',
          finalPassword: password ? '***' : 'EMPTY',
          finalPasswordLength: password ? password.length : 0,
          isNewUser: !originalUser
        });
        
        // CRITICAL: Giữ nguyên tất cả thông tin từ savedUsers (bao gồm role mới)
        // KHÔNG merge với originalUser để tránh override role/password đã thay đổi
        // Supabase users không cần password (Supabase quản lý)
        const mergedUser = { 
          ...savedUser, // CRITICAL: Giữ nguyên role, name, email từ adminUsers - KHÔNG override
          password: isSupabaseUser ? null : password // Supabase users: null, local users: password
        };
        
        // DEBUG: Verify role is preserved
        if (mergedUser.role !== savedUser.role) {
          console.error(`[GETUSERS] ❌ ERROR: Role changed! savedUser.role=${savedUser.role}, mergedUser.role=${mergedUser.role}`);
        }
        
        console.log(`[GETUSERS] Final merged user ${mergedUser.username}:`, {
          id: mergedUser.id,
          role: mergedUser.role, // Should be same as savedUser.role
          name: mergedUser.name
        });
        
        return mergedUser;
      });
      
      // DEBUG: Check for duplicates before adding default users
      console.log('[GETUSERS] Merged users before adding defaults:', mergedUsers.map(u => ({ id: u.id, username: u.username, role: u.role })));
      
      // ========================================
      // DEMO USERS SEEDING
      // ========================================
      // Add demo/seed users if they don't exist in adminUsers
      // Respects blacklist to prevent deleted demo users from reappearing
      
      const deletedUsers = shouldKeepAfterDelete() ? [] : getDeletedUsers();
      console.log('[GETUSERS] Deleted users blacklist:', deletedUsers);
      console.log('[GETUSERS] Seed config - Keep after delete:', shouldKeepAfterDelete());
      
      const demoUsers = getDemoUsers();
      console.log('[GETUSERS] Available demo users:', demoUsers.map(u => u.username));
      
      demoUsers.forEach(demoUser => {
        const existsInSaved = mergedUsers.find(u => u.id === demoUser.id || u.username === demoUser.username);
        const isDeleted = deletedUsers.includes(demoUser.id);
        
        if (isDeleted) {
          console.log(`[GETUSERS] 🚫 Skipping demo user "${demoUser.username}" (ID: ${demoUser.id}) - in deleted blacklist`);
        } else if (existsInSaved) {
          console.log(`[GETUSERS] ⏭️  Skipping demo user "${demoUser.username}" - already exists in adminUsers (possibly modified)`);
        } else {
          console.log(`[GETUSERS] ✅ Adding demo user "${demoUser.username}" - not in adminUsers, not deleted`);
          // Check if password was modified and saved separately
          const passwordFromStorage = passwordsMap[demoUser.id] || passwordsMap[demoUser.username];
          mergedUsers.push({
            ...demoUser,
            password: passwordFromStorage || demoUser.password
          });
        }
      });
      
      // DEBUG: Check for duplicates after merge
      const duplicateCheck = mergedUsers.filter((u, index, self) => 
        index !== self.findIndex(usr => usr.id === u.id || usr.username === u.username)
      );
      if (duplicateCheck.length > 0) {
        console.error('[GETUSERS] ❌ ERROR: Found duplicate users!', duplicateCheck);
      }
      
      // DEBUG: Check user1 specifically
      const user1InMerged = mergedUsers.filter(u => u.username === 'user1');
      if (user1InMerged.length > 1) {
        console.error('[GETUSERS] ❌ ERROR: Found multiple user1 entries!', user1InMerged.map(u => ({ id: u.id, role: u.role })));
      } else if (user1InMerged.length === 1) {
        console.log('[GETUSERS] user1 in final list:', { id: user1InMerged[0].id, username: user1InMerged[0].username, role: user1InMerged[0].role });
      }
      
      console.log('[GETUSERS] Final merged users list:', mergedUsers.map(u => ({ id: u.id, username: u.username, role: u.role })));
      
      // CRITICAL: Check if testA exists in final list
      const testAInList = mergedUsers.find(u => u.username === 'testA');
      if (testAInList) {
        console.log('[GETUSERS] ✅ testA found in final list:', {
          id: testAInList.id,
          username: testAInList.username,
          role: testAInList.role,
          hasPassword: !!testAInList.password,
          passwordLength: testAInList.password ? testAInList.password.length : 0
        });
      } else {
        console.error('[GETUSERS] ❌ ERROR: testA NOT found in final list!', {
          totalUsers: mergedUsers.length,
          allUsernames: mergedUsers.map(u => u.username),
          parsedUsersCount: parsed.length,
          parsedUsernames: parsed.map(u => u.username)
        });
      }
      
      // CRITICAL: Return ngay lập tức, không fallback
      console.log('[GETUSERS] ✅ Returning mergedUsers, count:', mergedUsers.length);
      return mergedUsers;
    } else {
      // DEBUG: No savedUsers in localStorage - Initialize with default users
      console.warn('[GETUSERS] ⚠️ No adminUsers found in localStorage, initializing with default users');
      
      // CRITICAL: Initialize adminUsers with default users (without passwords)
      const defaultUsersWithoutPassword = users.map(({ password, ...user }) => user);
      localStorage.setItem('adminUsers', JSON.stringify(defaultUsersWithoutPassword));
      console.log('[GETUSERS] ✅ Initialized adminUsers with', defaultUsersWithoutPassword.length, 'default users');
      
      // Now proceed with the fallback logic to return users with passwords
    }
  } catch (error) {
    console.error('[GETUSERS] ❌ ERROR loading users from localStorage:', error);
    console.error('[GETUSERS] Error details:', {
      errorMessage: error.message,
      errorStack: error.stack,
      savedUsers: localStorage.getItem('adminUsers') ? 'EXISTS' : 'NOT_FOUND',
      savedPasswords: localStorage.getItem('userPasswords') ? 'EXISTS' : 'NOT_FOUND'
    });
    
    // CRITICAL: Nếu có adminUsers nhưng parse lỗi, KHÔNG fallback
    // Vì sẽ mất hết users mới được tạo
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      console.error('[GETUSERS] ❌ CRITICAL: adminUsers exists but parse failed! NOT using fallback to prevent data loss.');
      console.error('[GETUSERS] Attempting to return empty array to force error handling...');
      // Return empty array để force error, không fallback về default users
      return [];
    }
  }
  
  // Fallback: CHỈ dùng khi KHÔNG có adminUsers trong localStorage
  // CRITICAL: Nếu có adminUsers, không được fallback về đây
  console.warn('[GETUSERS] ⚠️ Using fallback: returning default users only (new users will be lost!)');
  console.warn('[GETUSERS] ⚠️ This should only happen if adminUsers does NOT exist in localStorage');
  
  let passwordsMap = {};
  try {
    const savedPasswords = localStorage.getItem('userPasswords');
    if (savedPasswords) {
      passwordsMap = JSON.parse(savedPasswords);
    }
  } catch (e) {
    console.error('Error parsing userPasswords:', e);
  }
  
  // Merge passwords từ localStorage vào users mặc định
  const fallbackUsers = users.map(user => {
    const passwordFromStorage = passwordsMap[user.id] || passwordsMap[String(user.id)] || passwordsMap[user.username];
    return {
      ...user,
      password: passwordFromStorage || user.password
    };
  });
  
  console.warn('[GETUSERS] ⚠️ Fallback returning', fallbackUsers.length, 'default users');
  return fallbackUsers;
}

// SECURITY: Helper function để lưu password (hashed + obfuscated)
export function saveUserPassword(userId, username, password) {
  // Sử dụng secure storage với hash
  savePasswordSecure(userId, username, password)
    .then(success => {
      if (success) {
        logger.debug('[SAVE_PASSWORD] Password saved securely', { userId, username });
      } else {
        logger.error('[SAVE_PASSWORD] Failed to save password', { userId, username });
      }
    })
    .catch(error => {
      logger.error('[SAVE_PASSWORD] Error saving password', { error });
    });
}

  // Helper function để login
export function login(username, password) {
  // Lấy users từ localStorage nếu có, không thì dùng users mặc định
  const allUsers = getUsers();
  
  // DEBUG: Log để kiểm tra - CRITICAL: Check user1 role
  console.log('[LOGIN] All users from getUsers():', allUsers.map(u => ({ id: u.id, username: u.username, role: u.role })));
  console.log('[LOGIN] Looking for user:', username, 'with password:', password ? '***' : 'none');
  
  // DEBUG: Log user1 specifically - CRITICAL
  const user1FromGetUsers = allUsers.find(u => u.username === 'user1');
  if (user1FromGetUsers) {
    console.log('[LOGIN] user1 from getUsers():', { 
      id: user1FromGetUsers.id, 
      username: user1FromGetUsers.username, 
      role: user1FromGetUsers.role, // CRITICAL: Should be 'editor'
      name: user1FromGetUsers.name, 
      password: user1FromGetUsers.password ? '***' : 'none' 
    });
    
    // CRITICAL: Check if role is wrong
    if (user1FromGetUsers.role !== 'editor') {
      console.error('[LOGIN] ❌ ERROR: user1 role in allUsers is', user1FromGetUsers.role, 'but should be editor!');
      console.error('[LOGIN] Full user1 object:', user1FromGetUsers);
    }
  } else {
    console.warn('[LOGIN] user1 not found in allUsers!');
  }
  
  // DEBUG: Log all users with user1
  const allUser1s = allUsers.filter(u => u.username === 'user1');
  console.log('[LOGIN] All user1 entries in allUsers:', allUser1s.map(u => ({ id: u.id, username: u.username, role: u.role, password: u.password ? '***' : 'none' })));
  
  // DEBUG: Check password matching for user1
  if (username === 'user1') {
    allUser1s.forEach(u => {
      const passwordMatch = u.password === password;
      console.log(`[LOGIN] user1 entry check:`, {
        id: u.id,
        username: u.username,
        role: u.role,
        passwordMatch: passwordMatch,
        storedPassword: u.password ? '***' : 'none',
        inputPassword: password ? '***' : 'none'
      });
    });
  }
  
  // DEBUG: Log all users with matching username (before password check)
  const usersWithMatchingUsername = allUsers.filter(u => u.username === username);
  console.log('[LOGIN] All users with matching username:', usersWithMatchingUsername.map(u => ({ 
    id: u.id, 
    username: u.username, 
    role: u.role, 
    isSupabaseUser: u.isSupabaseUser || u.supabaseId || (typeof u.id === 'string' && u.id.startsWith('supabase_')),
    password: u.password ? '***' : 'none',
    passwordLength: u.password ? u.password.length : 0,
    inputPasswordLength: password ? password.length : 0,
    passwordMatch: u.password === password
  })));
  
  // CRITICAL: Check if user exists but password is empty
  // Skip Supabase users (họ login qua Supabase, không qua local login)
  const userExists = usersWithMatchingUsername.length > 0;
  if (userExists) {
    usersWithMatchingUsername.forEach(u => {
      const isSupabaseUser = u.isSupabaseUser || u.supabaseId || (typeof u.id === 'string' && u.id.startsWith('supabase_'));
      if (!u.password || u.password === '') {
        if (isSupabaseUser) {
          // Supabase user không có password → OK (Supabase quản lý)
          console.log('[LOGIN] Supabase user found (password managed by Supabase):', {
            id: u.id,
            username: u.username,
            role: u.role
          });
          console.log('[LOGIN] Note: Supabase users should login via Supabase auth, not local login');
        } else {
          // Local user không có password → ERROR
          console.error('[LOGIN] ❌ ERROR: Local user found but has NO PASSWORD!', {
            id: u.id,
            username: u.username,
            role: u.role
          });
          console.error('[LOGIN] Check if password was saved correctly in userPasswords');
        }
      }
    });
  }
  
  // Skip Supabase users trong local login (họ login qua Supabase)
  const user = allUsers.find(
    u => {
      const isSupabaseUser = u.isSupabaseUser || u.supabaseId || (typeof u.id === 'string' && u.id.startsWith('supabase_'));
      // Chỉ match local users (không phải Supabase users)
      return !isSupabaseUser && u.username === username && u.password === password;
    }
  );
  
  if (user) {
    // DEBUG: Log user found
    console.log('[LOGIN] ✅ User found and password matches:', { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      name: user.name,
      password: user.password ? '***' : 'none'
    });
    
    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      role: roles[user.role]
    };
  }
  
  // DEBUG: Log why login failed
  if (userExists) {
    console.error('[LOGIN] ❌ Login failed: User exists but password does not match!', {
      username,
      usersFound: usersWithMatchingUsername.map(u => ({
        id: u.id,
        hasPassword: !!u.password,
        passwordLength: u.password ? u.password.length : 0,
        inputPasswordLength: password ? password.length : 0
      }))
    });
  } else {
    console.error('[LOGIN] ❌ Login failed: User not found!', {
      username,
      totalUsers: allUsers.length,
      allUsernames: allUsers.map(u => u.username)
    });
  }
  
  return {
    success: false,
    error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
  };
}

/**
 * SECURE LOGIN: Async version với hashed password verification
 * Sử dụng hàm này thay cho login() khi passwords đã được migrate sang secure storage
 */
export async function loginSecure(username, password) {
  try {
    const allUsers = getUsers();
    
    // Tìm user theo username (không phải Supabase user)
    const user = allUsers.find(u => {
      const isSupabaseUser = u.isSupabaseUser || u.supabaseId || (typeof u.id === 'string' && u.id.startsWith('supabase_'));
      return !isSupabaseUser && u.username === username;
    });
    
    if (!user) {
      logger.debug('[LOGIN_SECURE] User not found', { username });
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
      };
    }
    
    // Verify password với secure storage
    const isValid = await verifyUserPassword(user.id, username, password);
    
    if (!isValid) {
      logger.debug('[LOGIN_SECURE] Password verification failed', { username });
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
      };
    }
    
    logger.info('[LOGIN_SECURE] Login successful', { userId: user.id, username, role: user.role });
    
    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      role: roles[user.role]
    };
  } catch (error) {
    logger.error('[LOGIN_SECURE] Error during login', { error });
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.'
    };
  }
}

// Helper function để register user mới
export function register(userData) {
  try {
    // Check if registration is enabled
    const registrationEnabled = getSetting('system', 'registrationEnabled');
    if (registrationEnabled === false) {
      return {
        success: false,
        error: 'Đăng ký tài khoản hiện đang bị tắt. Vui lòng liên hệ admin!'
      };
    }
    
    const { username, password, name, email } = userData;
    
    // Validation
    if (!username || !password || !name || !email) {
      return {
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin!'
      };
    }
    
    // Check username length
    if (username.length < 3) {
      return {
        success: false,
        error: 'Tên đăng nhập phải có ít nhất 3 ký tự!'
      };
    }
    
    // Check password length from settings
    const passwordMinLength = getSetting('users', 'passwordMinLength') || 6;
    const passwordMaxLength = getSetting('users', 'passwordMaxLength') || 50;
    
    if (password.length < passwordMinLength) {
      return {
        success: false,
        error: `Mật khẩu phải có ít nhất ${passwordMinLength} ký tự!`
      };
    }
    
    if (password.length > passwordMaxLength) {
      return {
        success: false,
        error: `Mật khẩu không được quá ${passwordMaxLength} ký tự!`
      };
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Email không hợp lệ!'
      };
    }
    
    // Get all existing users
    const allUsers = getUsers();
    
    // Check if username already exists
    const usernameExists = allUsers.find(u => u.username === username);
    if (usernameExists) {
      return {
        success: false,
        error: 'Tên đăng nhập đã tồn tại!'
      };
    }
    
    // Check if email already exists
    const emailExists = allUsers.find(u => u.email === email);
    if (emailExists) {
      return {
        success: false,
        error: 'Email đã được sử dụng!'
      };
    }
    
    // Create new user with auto-increment ID
    const maxId = allUsers.length > 0 
      ? Math.max(...allUsers.map(u => u.id || 0)) 
      : 0;
    
    // Get default role from settings
    const defaultRole = getSetting('users', 'defaultRole') || 'user';
    
    const newUser = {
      id: maxId + 1,
      username,
      password,
      name,
      email,
      role: defaultRole // Use role from settings (configurable by admin)
    };
    
    console.log('[REGISTER] Creating new user:', {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    
    // Save to localStorage
    const savedUsers = localStorage.getItem('adminUsers');
    let usersList = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Add new user (without password in adminUsers)
    const { password: _, ...userWithoutPassword } = newUser;
    usersList.push(userWithoutPassword);
    localStorage.setItem('adminUsers', JSON.stringify(usersList));
    
    // Save password separately
    saveUserPassword(newUser.id, newUser.username, newUser.password);
    
    console.log('[REGISTER] ✅ User registered successfully:', {
      id: newUser.id,
      username: newUser.username
    });
    
    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('[REGISTER] ❌ ERROR:', error);
    return {
      success: false,
      error: 'Đã có lỗi xảy ra khi đăng ký!'
    };
  }
}

/**
 * ========================================
 * SUPABASE USER SYNC FUNCTIONS
 * ========================================
 * Đồng bộ users từ Supabase vào localStorage
 */

/**
 * Thêm hoặc cập nhật một Supabase user vào localStorage
 * @param {Object} supabaseUser - User từ Supabase auth
 * @param {Object} profile - Profile từ bảng profiles (optional)
 * @returns {Promise<Object>} { success: boolean, user: Object }
 */
export function syncSupabaseUserToLocal(supabaseUser, profile = null) {
  return Promise.resolve().then(() => {
    try {
      if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
        console.error('[SYNC_SUPABASE] Invalid Supabase user:', supabaseUser);
        return { success: false, error: 'Invalid Supabase user data' };
      }

      const savedUsers = localStorage.getItem('adminUsers');
      let usersList = savedUsers ? JSON.parse(savedUsers) : [];

      // Kiểm tra xem user đã tồn tại chưa (theo email hoặc UUID)
      const existingIndex = usersList.findIndex(
        u => u.email === supabaseUser.email || 
             (typeof u.id === 'string' && u.id === supabaseUser.id) ||
             (u.supabaseId === supabaseUser.id)
      );

      // Tạo user object từ Supabase data
      const userData = {
        id: existingIndex >= 0 ? usersList[existingIndex].id : `supabase_${supabaseUser.id.substring(0, 8)}`, // Dùng ID hiện có hoặc tạo mới
        supabaseId: supabaseUser.id, // Lưu Supabase ID để reference
        username: supabaseUser.email.split('@')[0], // Dùng phần trước @ làm username
        email: supabaseUser.email,
        name: profile?.display_name || supabaseUser.user_metadata?.display_name || supabaseUser.email.split('@')[0],
        role: profile?.role || 'user',
        isSupabaseUser: true, // Flag để đánh dấu đây là Supabase user
        createdAt: supabaseUser.created_at,
        // Không lưu password vì Supabase quản lý
      };

      if (existingIndex >= 0) {
        // Cập nhật user hiện có
        usersList[existingIndex] = { ...usersList[existingIndex], ...userData };
        console.log('[SYNC_SUPABASE] Updated existing user:', userData.email);
      } else {
        // Thêm user mới
        usersList.push(userData);
        console.log('[SYNC_SUPABASE] Added new Supabase user:', userData.email);
      }

      localStorage.setItem('adminUsers', JSON.stringify(usersList));
      
      // Dispatch event để notify các component khác
      window.dispatchEvent(new CustomEvent('adminUsersUpdated'));

      return { success: true, user: userData };
    } catch (error) {
      console.error('[SYNC_SUPABASE] Error syncing user:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * Đồng bộ tất cả users từ Supabase vào localStorage
 * Lưu ý: Có thể không lấy được tất cả users nếu RLS chỉ cho phép user xem profile của chính họ
 * @returns {Object} { success: boolean, synced: number, errors: Array }
 */
export async function syncAllSupabaseUsers() {
  try {
    // Dynamic import để tránh circular dependency
    const authService = await import('../services/authService.js');
    const { getAllProfiles, getCurrentUser, getUserProfile } = authService;

    const result = { success: false, synced: 0, errors: [] };

    // Thử lấy tất cả profiles
    const { success: profilesOk, profiles } = await getAllProfiles();
    
    if (profilesOk && profiles && profiles.length > 0) {
      // Có thể lấy được profiles → nhưng không có email trong profiles
      // Chỉ sync user hiện tại (có email từ auth)
      console.log('[SYNC_SUPABASE] Found', profiles.length, 'profiles, but can only sync current user (email required)');
      
      // Lấy user hiện tại để có email
      const { success: userOk, user: currentUser } = await getCurrentUser();
      
      if (userOk && currentUser) {
        // Tìm profile của user hiện tại
        const currentProfile = profiles.find(p => p.user_id === currentUser.id);
        const syncResult = await syncSupabaseUserToLocal(currentUser, currentProfile || null);
        if (syncResult.success) {
          result.synced = 1;
        } else {
          result.errors.push({ userId: currentUser.id, error: syncResult.error });
        }
      } else {
        result.errors.push({ error: 'No user logged in to sync' });
      }
    } else {
      // Không thể lấy tất cả profiles (RLS restriction)
      // Chỉ sync user hiện tại
      console.log('[SYNC_SUPABASE] Cannot fetch all profiles, syncing current user only');
      const { success: userOk, user: currentUser } = await getCurrentUser();
      
      if (userOk && currentUser) {
        const { success: profileOk, profile } = await getUserProfile(currentUser.id);
        
        const syncResult = syncSupabaseUserToLocal(currentUser, profile || null);
        if (syncResult.success) {
          result.synced = 1;
        } else {
          result.errors.push({ userId: currentUser.id, error: syncResult.error });
        }
      } else {
        result.errors.push({ error: 'No user logged in' });
      }
    }

    result.success = result.synced > 0;
    return result;
  } catch (error) {
    console.error('[SYNC_SUPABASE] Error in syncAllSupabaseUsers:', error);
    return { success: false, synced: 0, errors: [{ error: error.message }] };
  }
}

