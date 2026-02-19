// src/utils/settingsManager.js
// SYSTEM SETTINGS MANAGER
// Professional settings management for the platform
// Priority: Supabase (Cloud) → localStorage (Local Cache)

import { getSystemSettingsFromSupabase, getUserSettingsFromSupabase } from '../services/appSettingsService.js';

/**
 * Default system settings
 */
const DEFAULT_SETTINGS = {
  system: {
    platformName: "Learn Your Approach",
    platformTagline: "Japanese Learning Platform",
    platformDescription: {
      vi: "Nền tảng học tiếng Nhật chuyên nghiệp với JLPT mock tests và tài liệu học tập đa dạng",
      en: "Professional Japanese learning platform with JLPT mock tests and diverse learning materials",
      ja: "JLPT模擬試験と多様な学習資料を備えたプロフェッショナルな日本語学習プラットフォーム"
    },
    contactEmail: "admin@example.com",
    maintenanceMode: false,
    registrationEnabled: true,
    debugMode: false
  },
  users: {
    defaultRole: "user", // 'user' | 'editor' | 'admin'
    passwordMinLength: 6,
    passwordMaxLength: 50
  },
  content: {
    showAnswersAfterCompletion: true,
    maxRetryAttempts: 3,
    maxRetryAttemptsCustom: 3
  },
  seed: {
    demoUsersEnabled: true,
    autoSeed: true,
    keepAfterDelete: false
  },
  analytics: {
    trackActivities: true,
    autoRefreshInterval: 30000, // 30 seconds
    autoCleanup: true,
    retentionDays: 90
  },
  appearance: {
    theme: "neo-brutalism",
    primaryColor: "#FFB800",
    accentColor: "#FF5722",
    sidebarDefaultOpen: true,
    itemsPerPage: 12
  }
};

/**
 * Get all settings (merge with defaults)
 * Priority: Supabase → localStorage → Defaults
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    // Try to load from localStorage first (synchronous, fast)
    const saved = localStorage.getItem('systemSettings');
    let parsed = null;
    
    if (saved) {
      parsed = JSON.parse(saved);
      
      // Migration: Convert old string platformDescription to object format
      if (parsed.system && typeof parsed.system.platformDescription === 'string') {
        const oldDescription = parsed.system.platformDescription;
        parsed.system.platformDescription = {
          vi: oldDescription,
          en: oldDescription,
          ja: oldDescription
        };
        // Debug only
        // eslint-disable-next-line no-console
        console.log('[SETTINGS] Migrated platformDescription from string to object format');
        // Save migrated settings
        localStorage.setItem('systemSettings', JSON.stringify(parsed));
      }
    }

    // Try to load from Supabase (async, but we'll sync it in the background)
    // For now, return localStorage settings immediately, but trigger async sync
    if (parsed) {
      // Trigger async sync from Supabase (non-blocking)
      syncFromSupabase();
      
      // Deep merge with defaults to ensure all keys exist
      return deepMerge(DEFAULT_SETTINGS, parsed);
    }
  } catch (error) {
    console.error('[SETTINGS] Error loading settings:', error);
  }
  
  // Fallback to defaults
  return { ...DEFAULT_SETTINGS };
}

/**
 * Load settings from Supabase and merge with localStorage
 * This is the primary function to get latest settings from Supabase
 * @returns {Promise<Object>} Settings object merged from Supabase and localStorage
 */
export async function loadSettingsFromSupabase() {
  try {
    // Load both system and user settings from Supabase in parallel
    const [systemResult, userResult] = await Promise.all([
      getSystemSettingsFromSupabase(),
      getUserSettingsFromSupabase()
    ]);
    
    const systemSuccess = systemResult.success && systemResult.settings && Object.keys(systemResult.settings).length > 0;
    const userSuccess = userResult.success && userResult.settings && Object.keys(userResult.settings).length > 0;
    
    if (systemSuccess || userSuccess) {
      // Get current localStorage settings
      const currentSettings = (() => {
        try {
          const saved = localStorage.getItem('systemSettings');
          return saved ? JSON.parse(saved) : {};
        } catch {
          return {};
        }
      })();

      // Merge Supabase system settings into current settings (Supabase takes priority)
      if (systemSuccess) {
        const supabaseSystemSettings = systemResult.settings;
        if (currentSettings.system) {
          currentSettings.system = {
            ...currentSettings.system,
            // Supabase values override localStorage (use !== undefined to allow empty strings)
            platformName: supabaseSystemSettings.platformName !== undefined 
              ? supabaseSystemSettings.platformName 
              : currentSettings.system.platformName,
            platformTagline: supabaseSystemSettings.platformTagline !== undefined 
              ? supabaseSystemSettings.platformTagline 
              : currentSettings.system.platformTagline,
            platformDescription: supabaseSystemSettings.platformDescription !== undefined 
              ? supabaseSystemSettings.platformDescription 
              : currentSettings.system.platformDescription,
            contactEmail: supabaseSystemSettings.contactEmail !== undefined 
              ? supabaseSystemSettings.contactEmail 
              : currentSettings.system.contactEmail
          };
        } else {
          currentSettings.system = {
            ...DEFAULT_SETTINGS.system,
            ...supabaseSystemSettings
          };
        }
      }

      // Merge Supabase user settings into current settings (Supabase takes priority)
      if (userSuccess) {
        const supabaseUserSettings = userResult.settings;
        if (currentSettings.users) {
          currentSettings.users = {
            ...currentSettings.users,
            // Supabase values override localStorage
            defaultRole: supabaseUserSettings.defaultRole || currentSettings.users.defaultRole,
            passwordMinLength: supabaseUserSettings.passwordMinLength !== undefined 
              ? supabaseUserSettings.passwordMinLength 
              : currentSettings.users.passwordMinLength,
            passwordMaxLength: supabaseUserSettings.passwordMaxLength !== undefined 
              ? supabaseUserSettings.passwordMaxLength 
              : currentSettings.users.passwordMaxLength
          };
        } else {
          currentSettings.users = {
            ...DEFAULT_SETTINGS.users,
            ...supabaseUserSettings
          };
        }
      }

      // Update localStorage cache
      localStorage.setItem('systemSettings', JSON.stringify(currentSettings));
      
      const mergedSettings = deepMerge(DEFAULT_SETTINGS, currentSettings);
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: mergedSettings
      }));
      
      console.log('[SETTINGS] ✅ Loaded from Supabase', { 
        system: systemSuccess, 
        user: userSuccess 
      });
      return mergedSettings;
    }
    
    // If Supabase has no data, return localStorage settings
    return getSettings();
  } catch (error) {
    console.warn('[SETTINGS] ⚠️ Error loading from Supabase:', error);
    // Fallback to localStorage
    return getSettings();
  }
}

// NEW: Flag to prevent concurrent syncs
let isSyncing = false;
let syncTimeout = null;
let lastSyncTime = 0;
const SYNC_DEBOUNCE_MS = 2000; // 2 seconds debounce
const MIN_SYNC_INTERVAL_MS = 5000; // Minimum 5 seconds between syncs

/**
 * Sync settings from Supabase (async, non-blocking)
 * Updates localStorage cache when Supabase has newer data
 * Includes debounce and prevents concurrent syncs
 */
async function syncFromSupabase() {
  // Prevent concurrent syncs
  if (isSyncing) {
    return;
  }

  // Debounce: Clear existing timeout and set new one
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // Check minimum interval
  const now = Date.now();
  if (now - lastSyncTime < MIN_SYNC_INTERVAL_MS) {
    // Schedule sync after debounce period
    syncTimeout = setTimeout(() => {
      syncTimeout = null;
      performSync();
    }, SYNC_DEBOUNCE_MS);
    return;
  }

  // Perform sync immediately if enough time has passed
  performSync();
}

/**
 * Actually perform the sync operation
 */
async function performSync() {
  if (isSyncing) {
    return;
  }

  isSyncing = true;
  lastSyncTime = Date.now();

  try {
    await loadSettingsFromSupabase();
  } catch (error) {
    // Only log if it's not a network/resource error (to avoid spam)
    if (!error.message?.includes('Failed to fetch') && !error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
      console.warn('[SETTINGS] ⚠️ Error syncing from Supabase:', error);
    }
    // Silent fail - continue with localStorage
  } finally {
    isSyncing = false;
  }
}

/**
 * Get a specific setting value
 * @param {string} category - Category name (system, users, content, etc.)
 * @param {string} key - Setting key
 * @returns {*} Setting value
 */
export function getSetting(category, key) {
  const settings = getSettings();
  return settings[category]?.[key];
}

/**
 * Save all settings
 * @param {Object} settings - Settings object to save
 * @returns {boolean} Success status
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    // Debug only
    // eslint-disable-next-line no-console
    console.log('[SETTINGS] Settings saved successfully');
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('settingsUpdated', { 
      detail: settings 
    }));
    
    return true;
  } catch (error) {
    console.error('[SETTINGS] Error saving settings:', error);
    return false;
  }
}

/**
 * Update a specific setting
 * @param {string} category - Category name
 * @param {string} key - Setting key
 * @param {*} value - New value
 * @returns {boolean} Success status
 */
export function updateSetting(category, key, value) {
  try {
    const settings = getSettings();
    if (!settings[category]) {
      settings[category] = {};
    }
    settings[category][key] = value;
    return saveSettings(settings);
  } catch (error) {
    console.error('[SETTINGS] Error updating setting:', error);
    return false;
  }
}

/**
 * Reset all settings to defaults
 * @returns {Object} Default settings
 */
export function resetSettings() {
  try {
    localStorage.removeItem('systemSettings');
    // Debug only
    // eslint-disable-next-line no-console
    console.log('[SETTINGS] Settings reset to defaults');
    
    window.dispatchEvent(new CustomEvent('settingsUpdated', { 
      detail: DEFAULT_SETTINGS 
    }));
    
    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error('[SETTINGS] Error resetting settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Export settings as JSON
 * @returns {string} JSON string of settings
 */
export function exportSettings() {
  const settings = getSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Import settings from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {Object} Result with success status
 */
export function importSettings(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    
    // Validate structure
    if (typeof imported !== 'object' || imported === null) {
      throw new Error('Invalid settings format');
    }
    
    // Merge with defaults to ensure all keys exist
    const merged = deepMerge(DEFAULT_SETTINGS, imported);
    
    saveSettings(merged);
    
    return { 
      success: true, 
      message: 'Settings imported successfully',
      settings: merged 
    };
  } catch (error) {
    console.error('[SETTINGS] Error importing settings:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Get default settings (useful for reset)
 * @returns {Object} Default settings
 */
export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

export default {
  getSettings,
  getSetting,
  saveSettings,
  updateSetting,
  resetSettings,
  exportSettings,
  importSettings,
  getDefaultSettings,
  loadSettingsFromSupabase
};

