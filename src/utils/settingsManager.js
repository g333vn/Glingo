// src/utils/settingsManager.js
// ⚙️ SYSTEM SETTINGS MANAGER
// Professional settings management for the platform

/**
 * Default system settings
 */
const DEFAULT_SETTINGS = {
  system: {
    platformName: "Learn Your Approach",
    platformTagline: "Japanese Learning Platform",
    platformDescription: "Nền tảng học tiếng Nhật chuyên nghiệp với JLPT mock tests và tài liệu học tập đa dạng",
    contactEmail: "admin@example.com",
    maintenanceMode: false,
    registrationEnabled: true,
    debugMode: false,
    analyticsEnabled: true
  },
  users: {
    defaultRole: "user", // 'user' | 'editor' | 'admin'
    passwordMinLength: 6,
    passwordMaxLength: 50,
    sessionTimeout: 3600000, // 1 hour in milliseconds
    autoLogoutInactive: false
  },
  content: {
    defaultQuizTimeLimit: 30, // minutes
    defaultPassingScore: 60, // percentage
    showAnswersAfterCompletion: true,
    allowRetry: true,
    maxRetryAttempts: 3
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
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    const saved = localStorage.getItem('systemSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Deep merge with defaults to ensure all keys exist
      return deepMerge(DEFAULT_SETTINGS, parsed);
    }
  } catch (error) {
    console.error('[SETTINGS] Error loading settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
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
  getDefaultSettings
};

