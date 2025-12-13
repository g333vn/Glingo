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
export async function getSystemSettingsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('system_settings')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    if (error) {
      console.error('[AppSettings] Error fetching system_settings:', error);
      return { success: false, settings: null, error };
    }

    const systemSettings = data?.system_settings || {};
    return { success: true, settings: systemSettings };
  } catch (err) {
    console.error('[AppSettings] Unexpected error fetching system_settings:', err);
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
    // Get current app_settings
    const { data: currentData, error: fetchError } = await supabase
      .from('app_settings')
      .select('system_settings')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[AppSettings] Error fetching current system_settings:', fetchError);
      return { success: false, error: fetchError };
    }

    // Merge with existing system_settings
    const currentSystemSettings = currentData?.system_settings || {};
    const updatedSystemSettings = {
      ...currentSystemSettings,
      ...systemSettings
    };

    // Update app_settings
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        system_settings: updatedSystemSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', APP_SETTINGS_ID);

    if (updateError) {
      console.error('[AppSettings] Error updating system_settings:', updateError);
      return { success: false, error: updateError };
    }

    console.log('[AppSettings] ✅ Successfully saved system settings to Supabase');
    return { success: true };
  } catch (err) {
    console.error('[AppSettings] Unexpected error:', err);
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


