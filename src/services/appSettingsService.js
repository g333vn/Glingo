// src/services/appSettingsService.js
// Quản lý cấu hình global (như maintenance, system settings) từ Supabase

import { supabase } from './supabaseClient.js';

const APP_SETTINGS_ID = 1;

export async function getGlobalMaintenanceMode() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('maintenance_mode')
    .eq('id', APP_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[AppSettings] Error fetching maintenance_mode:', error);
    return { success: false, maintenance: null, error };
  }

  return { success: true, maintenance: data?.maintenance_mode ?? null };
}

export async function setGlobalMaintenanceMode(maintenance) {
  const { error } = await supabase
    .from('app_settings')
    .update({
      maintenance_mode: maintenance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', APP_SETTINGS_ID);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[AppSettings] Error updating maintenance_mode:', error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Get system settings from Supabase
 * @returns {Object} { success: boolean, settings: Object, error?: Error }
 */
/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000) // 10s timeout
        )
      ]);
    } catch (error) {
      // Don't retry on certain errors
      if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES') || 
          error.code === 'PGRST116' || // Not found
          attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function getSystemSettingsFromSupabase() {
  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('system_settings')
        .eq('id', APP_SETTINGS_ID)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { data, error: null };
    });

    const systemSettings = result.data?.system_settings || {};
    return { success: true, settings: systemSettings };
  } catch (err) {
    // Only log if it's not a network/resource error (to avoid spam)
    if (!err.message?.includes('Failed to fetch') && 
        !err.message?.includes('ERR_INSUFFICIENT_RESOURCES') &&
        !err.message?.includes('Request timeout')) {
      console.error('[AppSettings] Error fetching system_settings:', err);
    }
    return { success: false, settings: null, error: err };
  }
}

/**
 * Save system settings to Supabase
 * @param {Object} systemSettings - { platformName, platformTagline, platformDescription, contactEmail }
 * @returns {Object} { success: boolean, error?: Error }
 */
export async function saveSystemSettingsToSupabase(systemSettings) {
  try {
    console.log('[AppSettings] 💾 Saving system settings to Supabase:', systemSettings);
    
    // First, try to get current app_settings to check if row exists
    const { data: currentData, error: fetchError } = await supabase
      .from('app_settings')
      .select('system_settings, id')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    // If row doesn't exist (PGRST116), create it
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('[AppSettings] Row not found, creating new app_settings row...');
      const { data: insertData, error: insertError } = await supabase
        .from('app_settings')
        .insert({
          id: APP_SETTINGS_ID,
          system_settings: systemSettings,
          maintenance_mode: false,
          access_control: {},
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[AppSettings] Error creating app_settings row:', insertError);
        return { success: false, error: insertError };
      }

      console.log('[AppSettings] ✅ Successfully created app_settings row with system settings');
      return { success: true, data: insertData };
    }

    // If there's another error fetching
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[AppSettings] Error fetching current system_settings:', fetchError);
      return { success: false, error: fetchError };
    }

    // Merge with existing system_settings (Supabase values take priority)
    const currentSystemSettings = currentData?.system_settings || {};
    const updatedSystemSettings = {
      ...currentSystemSettings,
      ...systemSettings // New values override old ones
    };

    console.log('[AppSettings] Updating with merged settings:', updatedSystemSettings);

    // Update app_settings
    const { data: updateData, error: updateError } = await supabase
      .from('app_settings')
      .update({
        system_settings: updatedSystemSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', APP_SETTINGS_ID)
      .select()
      .single();

    if (updateError) {
      console.error('[AppSettings] ❌ Error updating system_settings:', updateError);
      console.error('[AppSettings] Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return { success: false, error: updateError };
    }

    console.log('[AppSettings] ✅ Successfully saved system settings to Supabase');
    console.log('[AppSettings] Updated data:', updateData);
    return { success: true, data: updateData };
  } catch (err) {
    console.error('[AppSettings] ❌ Unexpected error saving to Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Get user settings from Supabase
 * @returns {Object} { success: boolean, settings: Object, error?: Error }
 */
export async function getUserSettingsFromSupabase() {
  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('user_settings')
        .eq('id', APP_SETTINGS_ID)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { data, error: null };
    });

    const userSettings = result.data?.user_settings || {};
    return { success: true, settings: userSettings };
  } catch (err) {
    // Only log if it's not a network/resource error (to avoid spam)
    if (!err.message?.includes('Failed to fetch') && 
        !err.message?.includes('ERR_INSUFFICIENT_RESOURCES') &&
        !err.message?.includes('Request timeout')) {
      console.error('[AppSettings] Error fetching user_settings:', err);
    }
    return { success: false, settings: null, error: err };
  }
}

/**
 * Save user settings to Supabase
 * @param {Object} userSettings - { defaultRole, passwordMinLength, passwordMaxLength }
 * @returns {Object} { success: boolean, error?: Error }
 */
export async function saveUserSettingsToSupabase(userSettings) {
  try {
    console.log('[AppSettings] 💾 Saving user settings to Supabase:', userSettings);
    
    // First, try to get current app_settings to check if row exists
    const { data: currentData, error: fetchError } = await supabase
      .from('app_settings')
      .select('user_settings, id')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    // If row doesn't exist (PGRST116), create it
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('[AppSettings] Row not found, creating new app_settings row...');
      const { data: insertData, error: insertError } = await supabase
        .from('app_settings')
        .insert({
          id: APP_SETTINGS_ID,
          user_settings: userSettings,
          maintenance_mode: false,
          system_settings: {},
          access_control: {},
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[AppSettings] Error creating app_settings row:', insertError);
        return { success: false, error: insertError };
      }

      console.log('[AppSettings] ✅ Successfully created app_settings row with user settings');
      return { success: true, data: insertData };
    }

    // If there's another error fetching
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[AppSettings] Error fetching current user_settings:', fetchError);
      return { success: false, error: fetchError };
    }

    // Merge with existing user_settings (Supabase values take priority)
    const currentUserSettings = currentData?.user_settings || {};
    const updatedUserSettings = {
      ...currentUserSettings,
      ...userSettings // New values override old ones
    };

    console.log('[AppSettings] Updating with merged user settings:', updatedUserSettings);

    // Update app_settings
    const { data: updateData, error: updateError } = await supabase
      .from('app_settings')
      .update({
        user_settings: updatedUserSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', APP_SETTINGS_ID)
      .select()
      .single();

    if (updateError) {
      console.error('[AppSettings] ❌ Error updating user_settings:', updateError);
      console.error('[AppSettings] Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return { success: false, error: updateError };
    }

    console.log('[AppSettings] ✅ Successfully saved user settings to Supabase');
    console.log('[AppSettings] Updated data:', updateData);
    return { success: true, data: updateData };
  } catch (err) {
    console.error('[AppSettings] ❌ Unexpected error saving user settings to Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Subscribe to real-time changes in app_settings
 * @param {Function} callback - Callback function that receives the updated settings
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAppSettings(callback) {
  const channel = supabase
    .channel('app_settings_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'app_settings',
        filter: `id=eq.${APP_SETTINGS_ID}`
      },
      (payload) => {
        console.log('[AppSettings] 🔄 Real-time update received:', payload);
        if (callback) {
          callback(payload.new);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}


