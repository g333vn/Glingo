// src/utils/notificationManager.js
// 🔔 NOTIFICATION MANAGEMENT SYSTEM - Đồng bộ Supabase + Local Cache
// Quản lý thông báo từ hệ thống với đồng bộ hóa giữa các thiết bị

import { supabase } from '../services/supabaseClient.js';

const STORAGE_KEY = 'systemNotifications';
const CUSTOM_TYPES_KEY = 'notificationCustomTypes';
const MAX_NOTIFICATIONS = 1000;

const DEFAULT_NOTIFICATION = {
  id: null,
  title: '',
  message: '',
  type: 'info',
  target_users: [],
  target_roles: [],
  created_at: null,
  expires_at: null,
  read_by: []
};

/**
 * 📥 Load thông báo từ Supabase (nguồn chính) + cache local
 */
export async function getAllNotificationsFromServer(user) {
  if (!user || !user.id) return [];

  try {
    console.log(`[NOTIFICATIONS] 📡 Fetching from Supabase for user ${user.id}...`);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_users.cs.{"${user.id}"},target_roles.cs.{"${user.role || 'user'}"}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[NOTIFICATIONS] ⚠️ Supabase fetch error:', error);
      // Fallback to local cache
      return getAllNotificationsLocal();
    }

    const notifications = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type || 'info',
      target_users: row.target_users || [],
      target_roles: row.target_roles || [],
      created_at: row.created_at,
      expires_at: row.expires_at,
      read_by: row.read_by || []
    }));

    // Cache to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (cacheErr) {
      console.warn('[NOTIFICATIONS] ⚠️ Failed to cache:', cacheErr);
    }

    console.log(`[NOTIFICATIONS] ✅ Loaded ${notifications.length} notifications from Supabase`);
    return notifications;
  } catch (err) {
    console.error('[NOTIFICATIONS] ❌ Unexpected error:', err);
    return getAllNotificationsLocal();
  }
}

/**
 * 📂 Load từ cache local (fallback)
 */
export function getAllNotificationsLocal() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[NOTIFICATIONS] Error loading local cache:', error);
    return [];
  }
}

/**
 * Wrapper cho trang Admin (dùng local cache)
 */
export function getAllNotifications() {
  return getAllNotificationsLocal();
}

/**
 * 📋 Get thông báo cho user cụ thể
 */
export async function getUserNotifications(user) {
  const allNotifications = await getAllNotificationsFromServer(user);
  const now = new Date().getTime();
  
  return allNotifications.filter(notif => {
    // Kiểm tra expire
    if (notif.expires_at && new Date(notif.expires_at).getTime() < now) {
      return false;
    }
    
    // Kiểm tra target_users hoặc target_roles
    const hasUsers = notif.target_users && notif.target_users.length > 0 && 
                     notif.target_users.includes(user.id);
    const hasRoles = notif.target_roles && notif.target_roles.length > 0 && 
                     notif.target_roles.includes(user.role);
    
    return hasUsers || hasRoles;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * 🔔 Đếm thông báo chưa đọc
 */
export async function getUnreadCount(user) {
  const notifications = await getUserNotifications(user);
  return notifications.filter(notif => {
    if (!user) return false;
    return !notif.read_by || !notif.read_by.includes(user.id);
  }).length;
}

/**
 * ✅ Đánh dấu thông báo là đã đọc
 */
export async function markAsRead(notificationId, user) {
  if (!user) return false;

  try {
    // Update Supabase via RPC
    const { error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
      p_user_id: user.id
    });

    if (error) {
      console.error('[NOTIFICATIONS] ⚠️ Mark as read error:', error);
      return false;
    }

    // Update local cache
    const local = getAllNotificationsLocal();
    const notif = local.find(n => n.id === notificationId);
    if (notif) {
      if (!notif.read_by) notif.read_by = [];
      if (!notif.read_by.includes(user.id)) {
        notif.read_by.push(user.id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    }

    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking as read:', error);
    return false;
  }
}

/**
 * ✅ Đánh dấu tất cả là đã đọc
 */
export async function markAllAsRead(user) {
  if (!user) return false;

  try {
    // Get user's notifications first to only mark what they can see
    const userNotifications = await getUserNotifications(user);
    const notificationIds = userNotifications.map(n => n.id);

    // Update Supabase via RPC (if available)
    const { error: rpcError } = await supabase.rpc('mark_all_notifications_read', {
      p_user_id: user.id
    });

    if (rpcError) {
      console.warn('[NOTIFICATIONS] ⚠️ RPC mark_all_notifications_read not available or failed, using fallback:', rpcError);
      // Fallback: mark each notification individually
      for (const notifId of notificationIds) {
        await markAsRead(notifId, user);
      }
    }

    // Update local cache - only for notifications user can see
    const local = getAllNotificationsLocal().map(n => {
      const copy = { ...n };
      // Only mark notifications that user has access to
      const hasAccess = (copy.target_users && copy.target_users.includes(user.id)) ||
                       (copy.target_roles && copy.target_roles.includes(user.role || 'user'));
      
      if (hasAccess) {
        if (!copy.read_by) copy.read_by = [];
        if (!copy.read_by.includes(user.id)) {
          copy.read_by.push(user.id);
        }
      }
      return copy;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking all as read:', error);
    // Still try to update local cache even if there's an error
    try {
      const local = getAllNotificationsLocal().map(n => {
        const copy = { ...n };
        const hasAccess = (copy.target_users && copy.target_users.includes(user.id)) ||
                         (copy.target_roles && copy.target_roles.includes(user.role || 'user'));
        
        if (hasAccess) {
          if (!copy.read_by) copy.read_by = [];
          if (!copy.read_by.includes(user.id)) {
            copy.read_by.push(user.id);
          }
        }
        return copy;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (fallbackError) {
      console.error('[NOTIFICATIONS] Fallback update also failed:', fallbackError);
    }
    return false;
  }
}

/**
 * 📤 Tạo thông báo mới (từ Admin)
 */
export async function createNotification(notificationData) {
  try {
    cleanupExpiredNotifications();
    cleanupOldNotifications();
    
    const allNotifications = getAllNotifications();
    
    const newNotification = {
      ...DEFAULT_NOTIFICATION,
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      read_by: []
    };
    
    // Lưu local cache cho admin xem
    let saved = false;
    const limits = [1000, 500, 200, 100, 50, 20, 10, 5, 1];
    
    for (const limit of limits) {
      try {
        const sorted = [...allNotifications].sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        const kept = sorted.slice(0, Math.max(0, limit - 1));
        const toSave = [newNotification, ...kept];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        saved = true;
        
        if (limit < 1000) {
          console.warn(`[NOTIFICATIONS] ⚠️ Local storage quota managed, kept ${limit} notifications`);
        }
        break;
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError' && limit > 1) {
          continue;
        } else if (quotaError.name === 'QuotaExceededError' && limit === 1) {
          console.error('[NOTIFICATIONS] ❌ Local storage full');
          return null;
        } else {
          throw quotaError;
        }
      }
    }
    
    if (!saved) {
      console.error('[NOTIFICATIONS] ❌ Failed to save locally');
      return null;
    }
    
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));

    // ✅ Đẩy lên Supabase để các user khác thấy
    console.log(`[NOTIFICATIONS] 📤 Pushing to Supabase:`, {
      title: newNotification.title,
      target_users: newNotification.target_users,
      target_roles: newNotification.target_roles
    });

    const { error } = await supabase
      .from('notifications')
      .insert({
        title: newNotification.title || '',
        message: newNotification.message || '',
        type: newNotification.type || 'info',
        target_users: (newNotification.target_users || []).map(id => String(id)), // ✅ Convert to text[]
        target_roles: newNotification.target_roles || [],
        expires_at: newNotification.expires_at || null,
        created_at: newNotification.created_at
      });

    if (error) {
      console.error('[NOTIFICATIONS] ❌ Supabase insert error:', error);
      console.error('  Details:', error.details);
      console.error('  Message:', error.message);
      // Vẫn trả về success vì đã lưu local
      return newNotification;
    }

    console.log('[NOTIFICATIONS] ✅ Successfully pushed to Supabase');
    return newNotification;
  } catch (error) {
    console.error('[NOTIFICATIONS] ❌ Unexpected error in createNotification:', error);
    return null;
  }
}

/**
 * ✏️ Update thông báo
 */
export function updateNotification(notificationId, updates) {
  try {
    const allNotifications = getAllNotifications();
    const index = allNotifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) return false;
    
    allNotifications[index] = {
      ...allNotifications[index],
      ...updates
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error updating notification:', error);
    return false;
  }
}

/**
 * 🗑️ Xoá thông báo
 */
export function deleteNotification(notificationId) {
  try {
    const allNotifications = getAllNotifications();
    const filtered = allNotifications.filter(n => n.id !== notificationId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error deleting notification:', error);
    return false;
  }
}

/**
 * 🧹 Xoá expired
 */
export function cleanupExpiredNotifications() {
  try {
    const allNotifications = getAllNotifications();
    const now = new Date().getTime();
    
    const active = allNotifications.filter(notif => {
      if (!notif.expires_at) return true;
      return new Date(notif.expires_at).getTime() >= now;
    });
    
    const deleted = allNotifications.length - active.length;
    
    if (deleted > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return deleted;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error cleaning up expired:', error);
    return 0;
  }
}

/**
 * 🧹 Xoá cũ
 */
export function cleanupOldNotifications() {
  try {
    const allNotifications = getAllNotifications();
    
    if (allNotifications.length <= MAX_NOTIFICATIONS) {
      return 0;
    }
    
    const sorted = allNotifications.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    const kept = sorted.slice(0, MAX_NOTIFICATIONS);
    const deleted = allNotifications.length - kept.length;
    
    if (deleted > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      console.log(`[NOTIFICATIONS] 🧹 Cleaned up ${deleted} old notifications`);
    }
    
    return deleted;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error cleaning up old:', error);
    return 0;
  }
}

/**
 * Custom types management
 */
export function getCustomTypes() {
  try {
    const stored = localStorage.getItem(CUSTOM_TYPES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[NOTIFICATIONS] Error loading custom types:', error);
    return [];
  }
}

export function addCustomType(typeData) {
  try {
    const customTypes = getCustomTypes();
    
    if (customTypes.find(t => t.value === typeData.value)) {
      return false;
    }
    
    customTypes.push({
      ...typeData,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(customTypes));
    window.dispatchEvent(new CustomEvent('notificationTypesUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error adding custom type:', error);
    return false;
  }
}

export function deleteCustomType(typeValue) {
  try {
    const customTypes = getCustomTypes();
    const filtered = customTypes.filter(t => t.value !== typeValue);
    
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('notificationTypesUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error deleting custom type:', error);
    return false;
  }
}

export default {
  getAllNotificationsFromServer,
  getAllNotificationsLocal,
  getAllNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
  cleanupExpiredNotifications,
  cleanupOldNotifications,
  getCustomTypes,
  addCustomType,
  deleteCustomType
};
