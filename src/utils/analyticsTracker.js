// src/utils/analyticsTracker.js
// Analytics & Tracking System for Dashboard

/**
 * Analytics Tracker - Hệ thống tracking cho Dashboard
 * Lưu trữ các metrics quan trọng trong localStorage
 */

// Keys for localStorage
const KEYS = {
  USER_ACTIVITY: 'analytics_user_activity',
  LEARNING_PROGRESS: 'analytics_learning_progress',
  SYSTEM_LOGS: 'analytics_system_logs',
  DAILY_METRICS: 'analytics_daily_metrics',
  RETENTION_DATA: 'analytics_retention'
};

/**
 * Track user activity (login, register, logout)
 */
export function trackUserActivity(userId, username, action, metadata = {}) {
  try {
    const activities = JSON.parse(localStorage.getItem(KEYS.USER_ACTIVITY) || '[]');
    
    const activity = {
      id: Date.now(),
      userId,
      username,
      action, // 'login', 'register', 'logout', 'profile_update'
      timestamp: new Date().toISOString(),
      metadata
    };
    
    activities.unshift(activity); // Add to beginning
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.length = 100;
    }
    
    localStorage.setItem(KEYS.USER_ACTIVITY, JSON.stringify(activities));
    
    // Update daily metrics
    updateDailyMetrics('user_activity', action);
    
    return activity;
  } catch (error) {
    console.error('[ANALYTICS] Error tracking user activity:', error);
    return null;
  }
}

/**
 * Track learning progress (lesson completion, quiz attempt, exam attempt)
 */
export function trackLearningProgress(userId, type, data) {
  try {
    const progress = JSON.parse(localStorage.getItem(KEYS.LEARNING_PROGRESS) || '[]');
    
    const record = {
      id: Date.now(),
      userId,
      type, // 'lesson_complete', 'quiz_attempt', 'exam_attempt', 'exam_complete'
      timestamp: new Date().toISOString(),
      data
    };
    
    progress.unshift(record);
    
    // Keep only last 200 records
    if (progress.length > 200) {
      progress.length = 200;
    }
    
    localStorage.setItem(KEYS.LEARNING_PROGRESS, JSON.stringify(progress));
    
    // Update daily metrics
    updateDailyMetrics('learning', type);
    
    return record;
  } catch (error) {
    console.error('[ANALYTICS] Error tracking learning progress:', error);
    return null;
  }
}

/**
 * Track system events (errors, warnings, info)
 */
export function trackSystemEvent(level, message, details = {}) {
  try {
    const logs = JSON.parse(localStorage.getItem(KEYS.SYSTEM_LOGS) || '[]');
    
    const log = {
      id: Date.now(),
      level, // 'error', 'warning', 'info', 'success'
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    logs.unshift(log);
    
    // Keep only last 50 logs
    if (logs.length > 50) {
      logs.length = 50;
    }
    
    localStorage.setItem(KEYS.SYSTEM_LOGS, JSON.stringify(logs));
    
    return log;
  } catch (error) {
    console.error('[ANALYTICS] Error tracking system event:', error);
    return null;
  }
}

/**
 * Update daily metrics (DAU, MAU, etc.)
 */
function updateDailyMetrics(category, action) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const metrics = JSON.parse(localStorage.getItem(KEYS.DAILY_METRICS) || '{}');
    
    if (!metrics[today]) {
      metrics[today] = {
        date: today,
        users: new Set(),
        actions: {}
      };
    }
    
    // Track unique users per day
    const currentUser = localStorage.getItem('authUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (!Array.isArray(metrics[today].users)) {
        metrics[today].users = [];
      }
      if (!metrics[today].users.includes(user.id)) {
        metrics[today].users.push(user.id);
      }
    }
    
    // Track actions
    const actionKey = `${category}_${action}`;
    metrics[today].actions[actionKey] = (metrics[today].actions[actionKey] || 0) + 1;
    
    // Keep only last 90 days
    const dates = Object.keys(metrics).sort();
    if (dates.length > 90) {
      dates.slice(0, dates.length - 90).forEach(date => {
        delete metrics[date];
      });
    }
    
    localStorage.setItem(KEYS.DAILY_METRICS, JSON.stringify(metrics));
  } catch (error) {
    console.error('[ANALYTICS] Error updating daily metrics:', error);
  }
}

/**
 * Get analytics data for dashboard
 */
export function getAnalyticsData() {
  try {
    const activities = JSON.parse(localStorage.getItem(KEYS.USER_ACTIVITY) || '[]');
    const progress = JSON.parse(localStorage.getItem(KEYS.LEARNING_PROGRESS) || '[]');
    const logs = JSON.parse(localStorage.getItem(KEYS.SYSTEM_LOGS) || '[]');
    const dailyMetrics = JSON.parse(localStorage.getItem(KEYS.DAILY_METRICS) || '{}');
    
    return {
      activities,
      progress,
      logs,
      dailyMetrics
    };
  } catch (error) {
    console.error('[ANALYTICS] Error getting analytics data:', error);
    return {
      activities: [],
      progress: [],
      logs: [],
      dailyMetrics: {}
    };
  }
}

/**
 * Calculate KPIs
 */
export function calculateKPIs(analytics, users) {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // DAU (Daily Active Users) - users active today
    const dailyMetrics = analytics.dailyMetrics[today] || { users: [] };
    const dau = Array.isArray(dailyMetrics.users) ? dailyMetrics.users.length : 0;
    
    // MAU (Monthly Active Users) - unique users in last 30 days
    const mauSet = new Set();
    Object.entries(analytics.dailyMetrics).forEach(([date, data]) => {
      if (date >= thirtyDaysAgo && Array.isArray(data.users)) {
        data.users.forEach(userId => mauSet.add(userId));
      }
    });
    const mau = mauSet.size;
    
    // Completion Rate - % of completed lessons vs attempted
    const completedLessons = analytics.progress.filter(p => p.type === 'lesson_complete').length;
    const attemptedLessons = analytics.progress.filter(p => 
      p.type === 'lesson_complete' || p.type === 'quiz_attempt'
    ).length;
    const completionRate = attemptedLessons > 0 
      ? Math.round((completedLessons / attemptedLessons) * 100) 
      : 0;
    
    // JLPT Pass Rate - % of exams passed
    const completedExams = analytics.progress.filter(p => p.type === 'exam_complete');
    const passedExams = completedExams.filter(e => 
      e.data && e.data.passed === true
    ).length;
    const jlptPassRate = completedExams.length > 0 
      ? Math.round((passedExams / completedExams.length) * 100) 
      : 0;
    
    // Average Session Length (minutes) - estimate from activity timestamps
    const sessions = [];
    let currentSession = null;
    
    [...analytics.activities].reverse().forEach(activity => {
      if (activity.action === 'login') {
        currentSession = {
          start: new Date(activity.timestamp),
          end: null
        };
      } else if (activity.action === 'logout' && currentSession) {
        currentSession.end = new Date(activity.timestamp);
        const duration = (currentSession.end - currentSession.start) / (1000 * 60); // minutes
        if (duration > 0 && duration < 480) { // Max 8 hours
          sessions.push(duration);
        }
        currentSession = null;
      }
    });
    
    const avgSessionLength = sessions.length > 0
      ? Math.round(sessions.reduce((a, b) => a + b, 0) / sessions.length)
      : 0;
    
    // Growth Rate - % change in users (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const recentUsers = new Set();
    const previousUsers = new Set();
    
    Object.entries(analytics.dailyMetrics).forEach(([date, data]) => {
      if (date >= sevenDaysAgo && Array.isArray(data.users)) {
        data.users.forEach(userId => recentUsers.add(userId));
      } else if (date >= fourteenDaysAgo && date < sevenDaysAgo && Array.isArray(data.users)) {
        data.users.forEach(userId => previousUsers.add(userId));
      }
    });
    
    const growthRate = previousUsers.size > 0
      ? Math.round(((recentUsers.size - previousUsers.size) / previousUsers.size) * 100)
      : 0;
    
    return {
      dau,
      mau,
      dauMauRatio: mau > 0 ? Math.round((dau / mau) * 100) : 0,
      completionRate,
      jlptPassRate,
      avgSessionLength,
      growthRate,
      totalUsers: users.length,
      activeUsers: mau,
      totalLessons: completedLessons,
      totalExams: completedExams.length
    };
  } catch (error) {
    console.error('[ANALYTICS] Error calculating KPIs:', error);
    return {
      dau: 0,
      mau: 0,
      dauMauRatio: 0,
      completionRate: 0,
      jlptPassRate: 0,
      avgSessionLength: 0,
      growthRate: 0,
      totalUsers: users.length,
      activeUsers: 0,
      totalLessons: 0,
      totalExams: 0
    };
  }
}

/**
 * Get retention data (D1, D7, D30)
 */
export function getRetentionData(analytics) {
  try {
    const retentionData = {
      d1: 0, // % users active day 1 after registration
      d7: 0, // % users active day 7 after registration
      d30: 0 // % users active day 30 after registration
    };
    
    // Simple retention calculation based on activities
    const registrations = analytics.activities.filter(a => a.action === 'register');
    
    if (registrations.length === 0) {
      return retentionData;
    }
    
    // For each registration, check if user was active on D1, D7, D30
    let d1Count = 0, d7Count = 0, d30Count = 0;
    
    registrations.forEach(reg => {
      const regDate = new Date(reg.timestamp);
      const userId = reg.userId;
      
      // Check D1 (1 day after registration)
      const d1Start = new Date(regDate.getTime() + 24 * 60 * 60 * 1000);
      const d1End = new Date(d1Start.getTime() + 24 * 60 * 60 * 1000);
      const d1Active = analytics.activities.some(a => 
        a.userId === userId && 
        new Date(a.timestamp) >= d1Start && 
        new Date(a.timestamp) < d1End &&
        a.action === 'login'
      );
      if (d1Active) d1Count++;
      
      // Check D7
      const d7Start = new Date(regDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const d7End = new Date(d7Start.getTime() + 24 * 60 * 60 * 1000);
      const d7Active = analytics.activities.some(a => 
        a.userId === userId && 
        new Date(a.timestamp) >= d7Start && 
        new Date(a.timestamp) < d7End &&
        a.action === 'login'
      );
      if (d7Active) d7Count++;
      
      // Check D30
      const d30Start = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const d30End = new Date(d30Start.getTime() + 24 * 60 * 60 * 1000);
      const d30Active = analytics.activities.some(a => 
        a.userId === userId && 
        new Date(a.timestamp) >= d30Start && 
        new Date(a.timestamp) < d30End &&
        a.action === 'login'
      );
      if (d30Active) d30Count++;
    });
    
    retentionData.d1 = Math.round((d1Count / registrations.length) * 100);
    retentionData.d7 = Math.round((d7Count / registrations.length) * 100);
    retentionData.d30 = Math.round((d30Count / registrations.length) * 100);
    
    return retentionData;
  } catch (error) {
    console.error('[ANALYTICS] Error calculating retention:', error);
    return { d1: 0, d7: 0, d30: 0 };
  }
}

/**
 * Clear old analytics data (older than 90 days)
 */
export function clearOldAnalytics() {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    // Clear activities
    const activities = JSON.parse(localStorage.getItem(KEYS.USER_ACTIVITY) || '[]');
    const recentActivities = activities.filter(a => a.timestamp >= ninetyDaysAgo);
    localStorage.setItem(KEYS.USER_ACTIVITY, JSON.stringify(recentActivities));
    
    // Clear progress
    const progress = JSON.parse(localStorage.getItem(KEYS.LEARNING_PROGRESS) || '[]');
    const recentProgress = progress.filter(p => p.timestamp >= ninetyDaysAgo);
    localStorage.setItem(KEYS.LEARNING_PROGRESS, JSON.stringify(recentProgress));
    
    // Clear logs
    const logs = JSON.parse(localStorage.getItem(KEYS.SYSTEM_LOGS) || '[]');
    const recentLogs = logs.filter(l => l.timestamp >= ninetyDaysAgo);
    localStorage.setItem(KEYS.SYSTEM_LOGS, JSON.stringify(recentLogs));
    
    console.log('[ANALYTICS] Cleared old analytics data');
    return true;
  } catch (error) {
    console.error('[ANALYTICS] Error clearing old analytics:', error);
    return false;
  }
}

export default {
  trackUserActivity,
  trackLearningProgress,
  trackSystemEvent,
  getAnalyticsData,
  calculateKPIs,
  getRetentionData,
  clearOldAnalytics
};

