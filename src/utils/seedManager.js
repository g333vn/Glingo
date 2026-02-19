// src/utils/seedManager.js
// SEED MANAGER - Professional seed data management
// Handles initialization, reset, and maintenance of demo data

import { getDemoUsers, SEED_CONFIG } from '../data/seedData.js';
import { saveUserPassword } from '../data/users.js';

/**
 * Seed initial demo users to localStorage
 * @returns {Object} Result with success status and count
 */
export function seedDemoUsers() {
  try {
    console.log('[SEED_MANAGER] Starting seed process...');
    
    if (!SEED_CONFIG.ENABLED) {
      console.log('[SEED_MANAGER] Seed disabled by config');
      return { success: false, message: 'Seed disabled', count: 0 };
    }
    
    const demoUsers = getDemoUsers();
    
    if (demoUsers.length === 0) {
      console.log('[SEED_MANAGER] No demo users to seed');
      return { success: false, message: 'No demo users', count: 0 };
    }
    
    // Save users to adminUsers (without passwords)
    const usersWithoutPasswords = demoUsers.map(({ password, ...user }) => user);
    localStorage.setItem('adminUsers', JSON.stringify(usersWithoutPasswords));
    console.log('[SEED_MANAGER] Saved demo users to adminUsers');
    
    // Save passwords separately
    demoUsers.forEach(user => {
      saveUserPassword(user.id, user.username, user.password);
    });
    console.log('[SEED_MANAGER] Saved demo passwords to userPasswords');
    
    // Clear deleted users blacklist
    localStorage.removeItem('deletedUsers');
    console.log('[SEED_MANAGER] Cleared deleted users blacklist');
    
    return { 
      success: true, 
      message: 'Demo users seeded successfully',
      count: demoUsers.length 
    };
  } catch (error) {
    console.error('[SEED_MANAGER] Error seeding demo users:', error);
    return { 
      success: false, 
      message: error.message,
      count: 0 
    };
  }
}

/**
 * Reset to factory defaults
 * Clears all user data and reseeds demo users
 * @returns {Object} Result with success status
 */
export function resetToFactoryDefaults() {
  try {
    console.log('[SEED_MANAGER] Resetting to factory defaults...');
    
    // Clear all user-related data
    localStorage.removeItem('adminUsers');
    localStorage.removeItem('userPasswords');
    localStorage.removeItem('deletedUsers');
    localStorage.removeItem('authUser');
    
    console.log('[SEED_MANAGER] Cleared all user data');
    
    // Reseed demo users
    const seedResult = seedDemoUsers();
    
    if (seedResult.success) {
      console.log('[SEED_MANAGER] Factory reset complete');
      return { 
        success: true, 
        message: `Reset complete! ${seedResult.count} demo users restored.`
      };
    } else {
      return {
        success: false,
        message: 'Reset complete but seeding failed'
      };
    }
  } catch (error) {
    console.error('[SEED_MANAGER] Error resetting to factory defaults:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

/**
 * Auto-seed if no users exist
 * Called on app initialization
 * @returns {boolean} True if seeded, false otherwise
 */
export function autoSeedIfNeeded() {
  try {
    if (!SEED_CONFIG.AUTO_SEED) {
      console.log('[SEED_MANAGER] Auto-seed disabled');
      return false;
    }
    
    const savedUsers = localStorage.getItem('adminUsers');
    
    // Only seed if no users exist
    if (!savedUsers || savedUsers === '[]') {
      console.log('[SEED_MANAGER] No users found, auto-seeding...');
      const result = seedDemoUsers();
      return result.success;
    }
    
    console.log('[SEED_MANAGER] Users already exist, skipping auto-seed');
    return false;
  } catch (error) {
    console.error('[SEED_MANAGER] Error in auto-seed:', error);
    return false;
  }
}

export default {
  seedDemoUsers,
  resetToFactoryDefaults,
  autoSeedIfNeeded
};

