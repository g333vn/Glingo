// src/utils/streakNotificationManager.js
// STREAK NOTIFICATION MANAGER
// Quản lý thông báo tự động cho study streak

import { createNotification } from './notificationManager.js';
import { getUsers } from '../data/users.js';

const STORAGE_KEY = 'streakNotificationTemplates';
const LAST_WARNING_KEY = 'streak_last_warning_'; // + userId
const LAST_MILESTONE_KEY = 'streak_last_milestone_'; // + userId

/**
 * Default notification templates
 */
const DEFAULT_TEMPLATES = {
  // Warning after 1 day missed
  warning: {
    title: '⚠️ Nhắc nhở học tập',
    message: 'Bạn đã bỏ lỡ 1 ngày học! Hãy quay lại học ngay hôm nay để duy trì streak nhé! 🔥',
    type: 'warning'
  },
  // Reset notification (after 2 days missed)
  reset: {
    title: '💔 Streak đã bị reset',
    message: 'Streak của bạn đã bị reset về 0. Đừng nản lòng! Hãy bắt đầu lại ngay hôm nay để xây dựng streak mới! 💪',
    type: 'error'
  },
  // Daily encouragement (every day)
  daily: {
    title: '🔥 Duy trì streak!',
    message: 'Tuyệt vời! Bạn đã học liên tục {streak} ngày! Tiếp tục phát huy nhé! 🎉',
    type: 'success'
  },
  // Milestone (every 5 days)
  milestone: {
    title: '🏆 Mốc quan trọng!',
    message: 'WOW! Bạn đã đạt {streak} ngày học liên tục! Đây là một thành tích tuyệt vời! Bạn đang xây dựng một thói quen học tập bền vững. Hãy tiếp tục duy trì và chinh phục những mốc cao hơn! 🌟💪🔥',
    type: 'success'
  }
};

/**
 * Get streak notification templates
 */
export function getStreakTemplates() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error loading templates:', error);
    return DEFAULT_TEMPLATES;
  }
}

/**
 * Update streak notification template
 */
export function updateStreakTemplate(key, template) {
  try {
    const templates = getStreakTemplates();
    templates[key] = template;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error updating template:', error);
    return false;
  }
}

/**
 * Reset templates to defaults
 */
export function resetStreakTemplates() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return true;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error resetting templates:', error);
    return false;
  }
}

/**
 * Check if warning was sent today for user
 */
function wasWarningSentToday(userId) {
  const key = LAST_WARNING_KEY + userId;
  const lastWarning = localStorage.getItem(key);
  if (!lastWarning) return false;
  
  const today = new Date().toDateString();
  return lastWarning === today;
}

/**
 * Mark warning as sent today
 */
function markWarningSentToday(userId) {
  const key = LAST_WARNING_KEY + userId;
  const today = new Date().toDateString();
  localStorage.setItem(key, today);
}

/**
 * Check if milestone was sent for this streak value
 */
function wasMilestoneSent(userId, streak) {
  const key = LAST_MILESTONE_KEY + userId;
  const lastMilestone = localStorage.getItem(key);
  if (!lastMilestone) return false;
  
  return parseInt(lastMilestone) === streak;
}

/**
 * Mark milestone as sent
 */
function markMilestoneSent(userId, streak) {
  const key = LAST_MILESTONE_KEY + userId;
  localStorage.setItem(key, streak.toString());
}

/**
 * Send warning notification (1 day missed)
 */
export function sendWarningNotification(user) {
  if (!user) return false;
  
  // Check if already sent today
  if (wasWarningSentToday(user.id)) {
    return false;
  }
  
  const templates = getStreakTemplates();
  const template = templates.warning || DEFAULT_TEMPLATES.warning;
  
  try {
    createNotification({
      title: template.title,
      message: template.message,
      type: template.type,
      targetUsers: [user.id],
      targetRoles: [],
      expiresAt: null
    });
    
    markWarningSentToday(user.id);
    return true;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error sending warning:', error);
    return false;
  }
}

/**
 * Send reset notification (2+ days missed)
 */
export function sendResetNotification(user, oldStreak) {
  if (!user) return false;
  
  const templates = getStreakTemplates();
  const template = templates.reset || DEFAULT_TEMPLATES.reset;
  
  let message = template.message;
  if (oldStreak > 0) {
    message = message.replace('{oldStreak}', oldStreak);
  }
  
  try {
    createNotification({
      title: template.title,
      message: message,
      type: template.type,
      targetUsers: [user.id],
      targetRoles: [],
      expiresAt: null
    });
    
    // Clear warning flag
    const warningKey = LAST_WARNING_KEY + user.id;
    localStorage.removeItem(warningKey);
    
    return true;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error sending reset:', error);
    return false;
  }
}

/**
 * Send daily encouragement notification
 */
export function sendDailyEncouragement(user, streak) {
  if (!user || streak <= 0) return false;
  
  // Don't send on milestone days (5, 10, 15, etc.)
  if (streak % 5 === 0) {
    return false;
  }
  
  const templates = getStreakTemplates();
  const template = templates.daily || DEFAULT_TEMPLATES.daily;
  
  let message = template.message.replace('{streak}', streak);
  
  try {
    createNotification({
      title: template.title,
      message: message,
      type: template.type,
      targetUsers: [user.id],
      targetRoles: [],
      expiresAt: null
    });
    
    return true;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error sending daily encouragement:', error);
    return false;
  }
}

/**
 * Send milestone notification (every 5 days)
 */
export function sendMilestoneNotification(user, streak) {
  if (!user || streak <= 0 || streak % 5 !== 0) return false;
  
  // Check if already sent for this milestone
  if (wasMilestoneSent(user.id, streak)) {
    return false;
  }
  
  const templates = getStreakTemplates();
  const template = templates.milestone || DEFAULT_TEMPLATES.milestone;
  
  let message = template.message.replace('{streak}', streak);
  
  try {
    createNotification({
      title: template.title,
      message: message,
      type: template.type,
      targetUsers: [user.id],
      targetRoles: [],
      expiresAt: null
    });
    
    markMilestoneSent(user.id, streak);
    return true;
  } catch (error) {
    console.error('[STREAK NOTIFICATIONS] Error sending milestone:', error);
    return false;
  }
}

export default {
  getStreakTemplates,
  updateStreakTemplate,
  resetStreakTemplates,
  sendWarningNotification,
  sendResetNotification,
  sendDailyEncouragement,
  sendMilestoneNotification
};

