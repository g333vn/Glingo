// src/utils/lessonProgressTracker.js
// 📊 Lesson Progress Tracker - Track completion, scores, weak lessons

import {
  sendWarningNotification,
  sendResetNotification,
  sendDailyEncouragement,
  sendMilestoneNotification
} from './streakNotificationManager.js';

/**
 * Get lesson completion status
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @returns {boolean}
 */
export function getLessonCompletion(bookId, chapterId, lessonId) {
  const key = `lesson_completed_${bookId}_${chapterId}_${lessonId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Set lesson completion status
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @param {boolean} completed 
 */
export function setLessonCompletion(bookId, chapterId, lessonId, completed) {
  const key = `lesson_completed_${bookId}_${chapterId}_${lessonId}`;
  localStorage.setItem(key, completed.toString());
  
  // Update completion timestamp
  if (completed) {
    const timestampKey = `lesson_completed_at_${bookId}_${chapterId}_${lessonId}`;
    localStorage.setItem(timestampKey, new Date().toISOString());
  }
}

/**
 * Get lesson quiz scores (all attempts)
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @returns {Array<{score: number, total: number, percentage: number, timestamp: string}>}
 */
export function getLessonQuizScores(bookId, chapterId, lessonId) {
  const key = `quiz_scores_${bookId}_${chapterId}_${lessonId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Add lesson quiz score
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @param {number} score 
 * @param {number} total 
 */
export function addLessonQuizScore(bookId, chapterId, lessonId, score, total) {
  const scores = getLessonQuizScores(bookId, chapterId, lessonId);
  const percentage = Math.round((score / total) * 100);
  
  scores.push({
    score,
    total,
    percentage,
    timestamp: new Date().toISOString()
  });
  
  const key = `quiz_scores_${bookId}_${chapterId}_${lessonId}`;
  localStorage.setItem(key, JSON.stringify(scores));
}

/**
 * Get best score for a lesson
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @returns {number} percentage (0-100)
 */
export function getLessonBestScore(bookId, chapterId, lessonId) {
  const scores = getLessonQuizScores(bookId, chapterId, lessonId);
  if (scores.length === 0) return 0;
  
  return Math.max(...scores.map(s => s.percentage));
}

/**
 * Get average score for a lesson
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @returns {number} percentage (0-100)
 */
export function getLessonAverageScore(bookId, chapterId, lessonId) {
  const scores = getLessonQuizScores(bookId, chapterId, lessonId);
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, s) => acc + s.percentage, 0);
  return Math.round(sum / scores.length);
}

/**
 * Get chapter progress (% of lessons completed)
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {Array<{id: string}>} lessons - Array of lesson objects
 * @returns {{completed: number, total: number, percentage: number}}
 */
export function getChapterProgress(bookId, chapterId, lessons) {
  const total = lessons.length;
  const completed = lessons.filter(lesson => 
    getLessonCompletion(bookId, chapterId, lesson.id)
  ).length;
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Get book progress (% of all lessons completed across all chapters)
 * @param {string} bookId 
 * @param {Array<{id: string, lessons: Array}>} chapters - Array of chapter objects with lessons
 * @returns {{completed: number, total: number, percentage: number}}
 */
export function getBookProgress(bookId, chapters) {
  let totalLessons = 0;
  let completedLessons = 0;
  
  chapters.forEach(chapter => {
    if (chapter.lessons && Array.isArray(chapter.lessons)) {
      totalLessons += chapter.lessons.length;
      completedLessons += chapter.lessons.filter(lesson => 
        getLessonCompletion(bookId, chapter.id, lesson.id)
      ).length;
    }
  });
  
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  return { completed: completedLessons, total: totalLessons, percentage };
}

/**
 * Get weak lessons (lessons with low average scores)
 * @param {string} bookId 
 * @param {Array<{id: string, chapterId: string, title: string}>} allLessons - Flat array of all lessons with chapterId
 * @param {number} threshold - Minimum score to not be considered weak (default 70%)
 * @returns {Array<{lessonId: string, chapterId: string, title: string, averageScore: number}>}
 */
export function getWeakLessons(bookId, allLessons, threshold = 70) {
  const weakLessons = [];
  
  allLessons.forEach(lesson => {
    const scores = getLessonQuizScores(bookId, lesson.chapterId, lesson.id);
    
    // Only consider lessons that have been attempted
    if (scores.length > 0) {
      const averageScore = getLessonAverageScore(bookId, lesson.chapterId, lesson.id);
      
      if (averageScore < threshold) {
        weakLessons.push({
          lessonId: lesson.id,
          chapterId: lesson.chapterId,
          title: lesson.title,
          averageScore
        });
      }
    }
  });
  
  // Sort by lowest score first
  return weakLessons.sort((a, b) => a.averageScore - b.averageScore);
}

/**
 * Get study streak (consecutive days with at least one lesson completed OR flashcard reviewed)
 * ✅ ENHANCED: Tính cả SRS reviews từ IndexedDB
 * @returns {{streak: number, lastStudyDate: string}}
 */
/**
 * Check and reset streak if user missed a day
 * This should be called on app load or daily check
 * @param {Object} user - User object (optional, for notifications)
 * @returns {Object} { streak: number, wasReset: boolean, oldStreak: number, daysMissed: number }
 */
export function checkAndResetStreak(user = null) {
  const streakKey = 'study_streak';
  const lastDateKey = 'study_last_date';
  
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(lastDateKey);
  const currentStreak = parseInt(localStorage.getItem(streakKey) || '0');
  
  // If no last date, streak is 0
  if (!lastDate) {
    return {
      streak: 0,
      wasReset: false,
      oldStreak: currentStreak,
      lastStudyDate: null,
      daysMissed: 0
    };
  }
  
  // If studied today, no reset needed
  if (lastDate === today) {
    return {
      streak: currentStreak,
      wasReset: false,
      oldStreak: currentStreak,
      lastStudyDate: lastDate,
      daysMissed: 0
    };
  }
  
  // Calculate days since last study
  const lastDateObj = new Date(lastDate);
  const todayObj = new Date(today);
  const daysDiff = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));
  
  // Send notifications based on days missed
  if (user) {
    if (daysDiff === 1) {
      // 1 day missed - send warning
      sendWarningNotification(user);
    } else if (daysDiff >= 2) {
      // 2+ days missed - reset and send reset notification
      const oldStreak = currentStreak;
      localStorage.setItem(streakKey, '0');
      sendResetNotification(user, oldStreak);
      
      return {
        streak: 0,
        wasReset: true,
        oldStreak: oldStreak,
        lastStudyDate: lastDate,
        daysMissed: daysDiff
      };
    }
  }
  
  // If missed more than 1 day (and no user provided), reset to 0
  if (daysDiff > 1) {
    const oldStreak = currentStreak;
    localStorage.setItem(streakKey, '0');
    console.log(`💔 Streak reset due to missed days! ${oldStreak} → 0 (Last study: ${lastDate}, ${daysDiff} days ago)`);
    
    return {
      streak: 0,
      wasReset: true,
      oldStreak: oldStreak,
      lastStudyDate: lastDate,
      daysMissed: daysDiff
    };
  }
  
  // If last study was yesterday, streak is still valid (will be updated when user studies today)
  return {
    streak: currentStreak,
    wasReset: false,
    oldStreak: currentStreak,
    lastStudyDate: lastDate,
    daysMissed: daysDiff
  };
}

export function getStudyStreak(user = null) {
  const streakKey = 'study_streak';
  const lastDateKey = 'study_last_date';
  
  // First check and reset if needed
  const checkResult = checkAndResetStreak(user);
  
  return {
    streak: checkResult.streak,
    lastStudyDate: checkResult.lastStudyDate,
    wasReset: checkResult.wasReset,
    oldStreak: checkResult.oldStreak,
    daysMissed: checkResult.daysMissed
  };
}

/**
 * Update study streak (call this when a lesson is completed OR flashcard session finished)
 * ✅ RULE: Học ít nhất 1 trong các hoạt động sau mỗi ngày:
 *    - Hoàn thành lesson (tick "Đã học xong")
 *    - Ôn ít nhất 1 flashcard
 *    - Làm quiz (future)
 * ✅ RESET: Nếu bỏ lỡ 1 ngày (không học gì) → Streak về 0
 * @param {Object} user - User object (optional, for notifications)
 * @returns {Object} { newStreak: number, wasIncremented: boolean, wasReset: boolean }
 */
export function updateStudyStreak(user = null) {
  const streakKey = 'study_streak';
  const lastDateKey = 'study_last_date';
  
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(lastDateKey);
  
  if (lastDate === today) {
    // Already studied today, no update needed
    const currentStreak = parseInt(localStorage.getItem(streakKey) || '0');
    console.log('⏭️ Streak already updated today');
    return {
      newStreak: currentStreak,
      wasIncremented: false,
      wasReset: false
    };
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  let newStreak = 0;
  let wasIncremented = false;
  let wasReset = false;
  
  if (lastDate === yesterdayStr) {
    // Consecutive day - increment streak
    const currentStreak = parseInt(localStorage.getItem(streakKey) || '0');
    newStreak = currentStreak + 1;
    localStorage.setItem(streakKey, newStreak.toString());
    wasIncremented = true;
    console.log(`🔥 Streak increased: ${currentStreak} → ${newStreak}`);
    
    // Send notifications
    if (user) {
      // Send daily encouragement (skip if milestone)
      if (newStreak % 5 !== 0) {
        sendDailyEncouragement(user, newStreak);
      }
      
      // Send milestone notification (every 5 days)
      if (newStreak % 5 === 0) {
        sendMilestoneNotification(user, newStreak);
      }
    }
  } else if (!lastDate) {
    // First time ever
    newStreak = 1;
    localStorage.setItem(streakKey, '1');
    wasIncremented = true;
    console.log('🆕 Streak started: 1 day');
    
    // Send first day notification
    if (user) {
      sendDailyEncouragement(user, 1);
    }
  } else {
    // Streak broken - reset to 0 (user missed days)
    const oldStreak = parseInt(localStorage.getItem(streakKey) || '0');
    newStreak = 1; // Start new streak
    localStorage.setItem(streakKey, '1');
    wasReset = true;
    console.log(`💔 Streak broken! ${oldStreak} → 1 (Last study: ${lastDate})`);
    
    // Send first day notification for new streak
    if (user) {
      sendDailyEncouragement(user, 1);
    }
  }
  
  localStorage.setItem(lastDateKey, today);
  console.log(`📅 Last study date updated: ${today}`);
  
  return {
    newStreak,
    wasIncremented,
    wasReset
  };
}

/**
 * Get recent study activity (last N days)
 * @param {number} days - Number of days to look back
 * @returns {Array<{date: string, lessonsCompleted: number}>}
 */
export function getRecentStudyActivity(days = 7) {
  const activity = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    
    // Count lessons completed on this date
    // We need to check all lesson completion timestamps
    let count = 0;
    
    // This is a simplified version - in production you might want to maintain a separate activity log
    // For now, we'll just show 0 for past days and current streak for today
    if (i === 0) {
      const { streak } = getStudyStreak();
      count = streak > 0 ? 1 : 0; // Simplification
    }
    
    activity.push({
      date: dateStr,
      lessonsCompleted: count
    });
  }
  
  return activity;
}

/**
 * Get all lesson statistics for analytics
 * @param {string} bookId 
 * @param {Array<{id: string, chapterId: string, title: string}>} allLessons 
 * @returns {Array<{lessonId: string, chapterId: string, title: string, completed: boolean, attempts: number, bestScore: number, averageScore: number}>}
 */
export function getAllLessonStats(bookId, allLessons) {
  return allLessons.map(lesson => {
    const completed = getLessonCompletion(bookId, lesson.chapterId, lesson.id);
    const scores = getLessonQuizScores(bookId, lesson.chapterId, lesson.id);
    const bestScore = getLessonBestScore(bookId, lesson.chapterId, lesson.id);
    const averageScore = getLessonAverageScore(bookId, lesson.chapterId, lesson.id);
    
    return {
      lessonId: lesson.id,
      chapterId: lesson.chapterId,
      title: lesson.title,
      completed,
      attempts: scores.length,
      bestScore,
      averageScore
    };
  });
}

/**
 * Clear all progress data (for testing or reset)
 */
export function clearAllProgress() {
  const keys = Object.keys(localStorage);
  const progressKeys = keys.filter(key => 
    key.startsWith('lesson_completed_') ||
    key.startsWith('quiz_scores_') ||
    key === 'study_streak' ||
    key === 'study_last_date'
  );
  
  progressKeys.forEach(key => localStorage.removeItem(key));
  
  console.log(`🗑️ Cleared ${progressKeys.length} progress items`);
}

export default {
  getLessonCompletion,
  setLessonCompletion,
  getLessonQuizScores,
  addLessonQuizScore,
  getLessonBestScore,
  getLessonAverageScore,
  getChapterProgress,
  getBookProgress,
  getWeakLessons,
  getStudyStreak,
  updateStudyStreak,
  getRecentStudyActivity,
  getAllLessonStats,
  clearAllProgress
};

