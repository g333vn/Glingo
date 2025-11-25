// src/utils/notificationManager.js
// 🔔 NOTIFICATION MANAGEMENT SYSTEM
// Quản lý thông báo từ hệ thống và admin gửi cho users

const STORAGE_KEY = 'systemNotifications';
const CUSTOM_TYPES_KEY = 'notificationCustomTypes';
const MAX_NOTIFICATIONS = 1000; // Giới hạn số lượng notifications tối đa

/**
 * Default notification structure
 */
const DEFAULT_NOTIFICATION = {
  id: null,
  title: '',
  message: '',
  type: 'info', // 'info', 'warning', 'success', 'error'
  targetUsers: [], // Array of user IDs, empty = no users (must select to send)
  targetRoles: [], // Array of roles, empty = no roles (must select to send)
  createdAt: null,
  expiresAt: null, // null = never expires
  isRead: false,
  readBy: [] // Array of user IDs who read this
};

/**
 * Get all notifications
 * @returns {Array} Array of notifications
 */
export function getAllNotifications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('[NOTIFICATIONS] Error loading notifications:', error);
    return [];
  }
}

/**
 * Get notifications for a specific user
 * @param {Object} user - User object with id and role
 * @returns {Array} Array of notifications for the user
 */
export function getUserNotifications(user) {
  const allNotifications = getAllNotifications();
  const now = new Date().getTime();
  
  return allNotifications.filter(notif => {
    // Check if expired
    if (notif.expiresAt && new Date(notif.expiresAt).getTime() < now) {
      return false;
    }
    
    // If no targets specified, don't send to anyone
    const hasTargetUsers = notif.targetUsers && notif.targetUsers.length > 0;
    const hasTargetRoles = notif.targetRoles && notif.targetRoles.length > 0;
    
    if (!hasTargetUsers && !hasTargetRoles) {
      return false; // No targets = don't send to anyone
    }
    
    // Check if user matches target users
    if (hasTargetUsers) {
      if (user && notif.targetUsers.includes(user.id)) {
        return true; // User is in target list
      }
    }
    
    // Check if user's role matches target roles
    if (hasTargetRoles) {
      if (user && notif.targetRoles.includes(user.role)) {
        return true; // User's role is in target list
      }
    }
    
    // User doesn't match any target
    return false;
  }).sort((a, b) => {
    // Sort by created date, newest first
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/**
 * Get unread count for a user
 * @param {Object} user - User object
 * @returns {number} Unread count
 */
export function getUnreadCount(user) {
  const notifications = getUserNotifications(user);
  return notifications.filter(notif => {
    if (!user) return false;
    return !notif.readBy || !notif.readBy.includes(user.id);
  }).length;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {Object} user - User object
 * @returns {boolean} Success status
 */
export function markAsRead(notificationId, user) {
  if (!user) return false;
  
  try {
    const allNotifications = getAllNotifications();
    const notification = allNotifications.find(n => n.id === notificationId);
    
    if (!notification) return false;
    
    if (!notification.readBy) {
      notification.readBy = [];
    }
    
    if (!notification.readBy.includes(user.id)) {
      notification.readBy.push(user.id);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {Object} user - User object
 * @returns {boolean} Success status
 */
export function markAllAsRead(user) {
  if (!user) return false;
  
  try {
    const allNotifications = getAllNotifications();
    const userNotifications = getUserNotifications(user);
    
    // Update readBy for each notification that user can see
    userNotifications.forEach(notif => {
      const notifIndex = allNotifications.findIndex(n => n.id === notif.id);
      if (notifIndex !== -1) {
        if (!allNotifications[notifIndex].readBy) {
          allNotifications[notifIndex].readBy = [];
        }
        if (!allNotifications[notifIndex].readBy.includes(user.id)) {
          allNotifications[notifIndex].readBy.push(user.id);
        }
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking all as read:', error);
    return false;
  }
}

/**
 * Create a new notification (Admin only)
 * @param {Object} notificationData - Notification data
 * @returns {Object} Created notification
 */
export function createNotification(notificationData) {
  try {
    // Cleanup old notifications first to prevent quota exceeded
    cleanupExpiredNotifications();
    cleanupOldNotifications();
    
    const allNotifications = getAllNotifications();
    
    const newNotification = {
      ...DEFAULT_NOTIFICATION,
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      readBy: []
    };
    
    // Try to save with new notification, if quota exceeded, cleanup more aggressively
    let saved = false;
    const limits = [1000, 500, 200, 100, 50, 20, 10, 5, 1];
    
    for (const limit of limits) {
      try {
        // Sort by date, newest first
        const sorted = [...allNotifications].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        
        // Keep only the most recent ones, then add new notification
        const kept = sorted.slice(0, Math.max(0, limit - 1));
        const toSave = [newNotification, ...kept];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        saved = true;
        
        if (limit < 1000) {
          console.warn(`[NOTIFICATIONS] Storage quota exceeded, kept only ${limit} most recent notifications`);
        }
        
        break;
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError' && limit > 1) {
          // Try next smaller limit
          continue;
        } else if (quotaError.name === 'QuotaExceededError' && limit === 1) {
          // Even 1 notification is too large, localStorage is completely full
          console.error('[NOTIFICATIONS] Storage completely full, cannot save notification');
          return null;
        } else {
          throw quotaError;
        }
      }
    }
    
    if (!saved) {
      console.error('[NOTIFICATIONS] Failed to save notification after all cleanup attempts');
      return null;
    }
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return newNotification;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error creating notification:', error);
    return null;
  }
}

/**
 * Update a notification (Admin only)
 * @param {string} notificationId - Notification ID
 * @param {Object} updates - Updates to apply
 * @returns {boolean} Success status
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
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error updating notification:', error);
    return false;
  }
}

/**
 * Delete a notification (Admin only)
 * @param {string} notificationId - Notification ID
 * @returns {boolean} Success status
 */
export function deleteNotification(notificationId) {
  try {
    const allNotifications = getAllNotifications();
    const filtered = allNotifications.filter(n => n.id !== notificationId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error deleting notification:', error);
    return false;
  }
}

/**
 * Delete expired notifications
 * @returns {number} Number of deleted notifications
 */
export function cleanupExpiredNotifications() {
  try {
    const allNotifications = getAllNotifications();
    const now = new Date().getTime();
    
    const active = allNotifications.filter(notif => {
      if (!notif.expiresAt) return true;
      return new Date(notif.expiresAt).getTime() >= now;
    });
    
    const deleted = allNotifications.length - active.length;
    
    if (deleted > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    
    return deleted;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error cleaning up:', error);
    return 0;
  }
}

/**
 * Cleanup old notifications to free up space
 * Keeps only the most recent MAX_NOTIFICATIONS
 * @returns {number} Number of deleted notifications
 */
export function cleanupOldNotifications() {
  try {
    const allNotifications = getAllNotifications();
    
    if (allNotifications.length <= MAX_NOTIFICATIONS) {
      return 0;
    }
    
    // Sort by createdAt, newest first
    const sorted = allNotifications.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    // Keep only the most recent ones
    const kept = sorted.slice(0, MAX_NOTIFICATIONS);
    const deleted = allNotifications.length - kept.length;
    
    if (deleted > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      console.log(`[NOTIFICATIONS] Cleaned up ${deleted} old notifications`);
    }
    
    return deleted;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error cleaning up old notifications:', error);
    return 0;
  }
}

/**
 * Get custom notification types
 * @returns {Array} Array of custom types
 */
export function getCustomTypes() {
  try {
    const stored = localStorage.getItem(CUSTOM_TYPES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('[NOTIFICATIONS] Error loading custom types:', error);
    return [];
  }
}

/**
 * Add a custom notification type
 * @param {Object} typeData - Type data with value, label, icon, color
 * @returns {boolean} Success status
 */
export function addCustomType(typeData) {
  try {
    const customTypes = getCustomTypes();
    
    // Check if type already exists
    if (customTypes.find(t => t.value === typeData.value)) {
      return false;
    }
    
    customTypes.push({
      ...typeData,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(customTypes));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('notificationTypesUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error adding custom type:', error);
    return false;
  }
}

/**
 * Delete a custom notification type
 * @param {string} typeValue - Type value to delete
 * @returns {boolean} Success status
 */
export function deleteCustomType(typeValue) {
  try {
    const customTypes = getCustomTypes();
    const filtered = customTypes.filter(t => t.value !== typeValue);
    
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(filtered));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('notificationTypesUpdated'));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error deleting custom type:', error);
    return false;
  }
}

export default {
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

