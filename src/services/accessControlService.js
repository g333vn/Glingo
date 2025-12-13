// src/services/accessControlService.js
// 🔒 ACCESS CONTROL SERVICE - Quản lý quyền truy cập từ Supabase
// Đảm bảo đồng bộ thời gian thực cho toàn hệ thống

import { supabase } from './supabaseClient.js';

const APP_SETTINGS_ID = 1;

/**
 * Get access control configs from Supabase
 * @returns {Object} { levelConfigs, jlptConfigs, levelModuleConfig, jlptModuleConfig }
 */
export async function getAccessControlFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('access_control')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    if (error) {
      console.error('[AccessControlService] Error fetching access_control:', error);
      return { success: false, data: null, error };
    }

    const accessControl = data?.access_control || {};
    return {
      success: true,
      data: {
        levelConfigs: accessControl.level || {},
        jlptConfigs: accessControl.jlpt || {},
        levelModuleConfig: accessControl.levelModule || { accessType: 'all', allowedRoles: [], allowedUsers: [] },
        jlptModuleConfig: accessControl.jlptModule || { accessType: 'all', allowedRoles: [], allowedUsers: [] }
      }
    };
  } catch (err) {
    console.error('[AccessControlService] Unexpected error:', err);
    return { success: false, data: null, error: err };
  }
}

/**
 * Save access control configs to Supabase
 * @param {Object} configs - { levelConfigs, jlptConfigs, levelModuleConfig, jlptModuleConfig }
 * @returns {Object} { success: boolean, error?: Error }
 */
export async function saveAccessControlToSupabase(configs) {
  try {
    // Get current app_settings
    const { data: currentData, error: fetchError } = await supabase
      .from('app_settings')
      .select('access_control')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[AccessControlService] Error fetching current access_control:', fetchError);
      return { success: false, error: fetchError };
    }

    // Merge with existing access_control
    const currentAccessControl = currentData?.access_control || {};
    const updatedAccessControl = {
      ...currentAccessControl,
      level: configs.levelConfigs || currentAccessControl.level || {},
      jlpt: configs.jlptConfigs || currentAccessControl.jlpt || {},
      levelModule: configs.levelModuleConfig || currentAccessControl.levelModule || { accessType: 'all', allowedRoles: [], allowedUsers: [] },
      jlptModule: configs.jlptModuleConfig || currentAccessControl.jlptModule || { accessType: 'all', allowedRoles: [], allowedUsers: [] }
    };

    // Update app_settings
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        access_control: updatedAccessControl,
        updated_at: new Date().toISOString()
      })
      .eq('id', APP_SETTINGS_ID);

    if (updateError) {
      console.error('[AccessControlService] Error updating access_control:', updateError);
      return { success: false, error: updateError };
    }

    console.log('[AccessControlService] ✅ Successfully saved access control to Supabase');
    return { success: true };
  } catch (err) {
    console.error('[AccessControlService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Save level-specific access config to Supabase
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @param {Object} config - Access control config
 * @returns {Object} { success: boolean, error?: Error }
 */
export async function saveLevelAccessConfigToSupabase(module, levelId, config) {
  try {
    // Get current configs
    const { data, error: fetchError } = await supabase
      .from('app_settings')
      .select('access_control')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[AccessControlService] Error fetching access_control:', fetchError);
      return { success: false, error: fetchError };
    }

    const accessControl = data?.access_control || {};
    const moduleConfigs = accessControl[module] || {};
    
    // Update specific level config
    moduleConfigs[levelId] = config;
    accessControl[module] = moduleConfigs;

    // Save back to Supabase
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        access_control: accessControl,
        updated_at: new Date().toISOString()
      })
      .eq('id', APP_SETTINGS_ID);

    if (updateError) {
      console.error('[AccessControlService] Error updating level access config:', updateError);
      return { success: false, error: updateError };
    }

    console.log(`[AccessControlService] ✅ Saved ${module}/${levelId} config to Supabase`);
    return { success: true };
  } catch (err) {
    console.error('[AccessControlService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Save module-level access config to Supabase
 * @param {string} module - 'level' or 'jlpt'
 * @param {Object} config - Module-level access control config
 * @returns {Object} { success: boolean, error?: Error }
 */
export async function saveModuleAccessConfigToSupabase(module, config) {
  try {
    // Get current configs
    const { data, error: fetchError } = await supabase
      .from('app_settings')
      .select('access_control')
      .eq('id', APP_SETTINGS_ID)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[AccessControlService] Error fetching access_control:', fetchError);
      return { success: false, error: fetchError };
    }

    const accessControl = data?.access_control || {};
    
    // Update module-level config
    accessControl[`${module}Module`] = config;

    // Save back to Supabase
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        access_control: accessControl,
        updated_at: new Date().toISOString()
      })
      .eq('id', APP_SETTINGS_ID);

    if (updateError) {
      console.error('[AccessControlService] Error updating module access config:', updateError);
      return { success: false, error: updateError };
    }

    console.log(`[AccessControlService] ✅ Saved ${module} module config to Supabase`);
    return { success: true };
  } catch (err) {
    console.error('[AccessControlService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Subscribe to real-time changes in access_control
 * @param {Function} callback - Callback function that receives the updated access_control
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAccessControl(callback) {
  const channel = supabase
    .channel('access_control_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'app_settings',
        filter: `id=eq.${APP_SETTINGS_ID}`
      },
      (payload) => {
        console.log('[AccessControlService] 🔄 Real-time access_control update received:', payload);
        if (payload.new?.access_control && callback) {
          const accessControl = payload.new.access_control;
          const data = {
            levelConfigs: accessControl.level || {},
            jlptConfigs: accessControl.jlpt || {},
            levelModuleConfig: accessControl.levelModule || { accessType: 'all', allowedRoles: [], allowedUsers: [] },
            jlptModuleConfig: accessControl.jlptModule || { accessType: 'all', allowedRoles: [], allowedUsers: [] }
          };
          callback(data);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

