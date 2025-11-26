// src/services/appSettingsService.js
// Quản lý cấu hình global (như maintenance) từ Supabase

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


