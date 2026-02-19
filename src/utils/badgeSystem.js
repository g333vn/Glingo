// src/utils/badgeSystem.js
// Badge System - Award badges for achievements

import { getStudyStreak, getAllLessonStats } from './lessonProgressTracker.js';

// Badge definitions
export const BADGES = {
  STREAK_7: {
    id: 'streak_7',
    name: 'Streak Master',
    description: 'Học 7 ngày liên tiếp',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
    requirement: 'Học liên tục ít nhất 7 ngày',
    type: 'streak'
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Dedicated Learner',
    description: 'Học 30 ngày liên tiếp',
    icon: '🔥🔥',
    color: 'from-red-500 to-pink-600',
    requirement: 'Học liên tục ít nhất 30 ngày',
    type: 'streak'
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Đạt 100 điểm trong 1 quiz',
    icon: '💯',
    color: 'from-yellow-400 to-orange-500',
    requirement: 'Làm quiz đạt 100% chính xác',
    type: 'achievement'
  },
  CHAPTER_MASTER: {
    id: 'chapter_master',
    name: 'Chapter Master',
    description: 'Hoàn thành 1 chapter (100%)',
    icon: '📚',
    color: 'from-blue-400 to-cyan-500',
    requirement: 'Hoàn thành tất cả bài học trong 1 chapter',
    type: 'achievement'
  },
  QUIZ_CHAMPION: {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Đạt 90+ điểm trong 10 quiz',
    icon: '⭐',
    color: 'from-green-400 to-emerald-500',
    requirement: 'Đạt điểm cao (90+) trong 10 quiz khác nhau',
    type: 'achievement'
  },
  SPEED_LEARNER: {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Hoàn thành 1 chapter trong 1 ngày',
    icon: '🚀',
    color: 'from-purple-400 to-pink-500',
    requirement: 'Hoàn thành tất cả bài học trong 1 chapter trong cùng 1 ngày',
    type: 'achievement'
  },
  BOOK_COMPLETE: {
    id: 'book_complete',
    name: 'Book Master',
    description: 'Hoàn thành toàn bộ 1 cuốn sách',
    icon: '📖',
    color: 'from-indigo-400 to-purple-600',
    requirement: 'Hoàn thành tất cả bài học trong 1 cuốn sách',
    type: 'achievement'
  }
};

/**
 * Check if user has earned a badge
 * @param {string} badgeId 
 * @param {Object} userData - { bookId, allLessons, chapters }
 * @returns {boolean}
 */
export function hasBadge(badgeId, userData = {}) {
  const { bookId, allLessons = [], chapters = [] } = userData;
  
  switch (badgeId) {
    case 'streak_7': {
      const { streak } = getStudyStreak();
      return streak >= 7;
    }
    
    case 'streak_30': {
      const { streak } = getStudyStreak();
      return streak >= 30;
    }
    
    case 'perfect_score': {
      // Check localStorage for any perfect score
      const keys = Object.keys(localStorage);
      const scoreKeys = keys.filter(key => key.startsWith('quiz_scores_'));
      
      for (const key of scoreKeys) {
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        if (scores.some(s => s.percentage === 100)) {
          return true;
        }
      }
      return false;
    }
    
    case 'chapter_master': {
      // Check if any chapter is 100% complete
      if (!bookId || !chapters.length) return false;
      
      const { getChapterProgress } = require('./lessonProgressTracker.js');
      
      for (const chapter of chapters) {
        if (chapter.lessons && chapter.lessons.length > 0) {
          const progress = getChapterProgress(bookId, chapter.id, chapter.lessons);
          if (progress.percentage === 100) {
            return true;
          }
        }
      }
      return false;
    }
    
    case 'quiz_champion': {
      // Check if user has 10+ quizzes with 90+ score
      const keys = Object.keys(localStorage);
      const scoreKeys = keys.filter(key => key.startsWith('quiz_scores_'));
      
      let highScoreCount = 0;
      
      for (const key of scoreKeys) {
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        // Check if this lesson has any score >= 90
        if (scores.some(s => s.percentage >= 90)) {
          highScoreCount++;
        }
      }
      
      return highScoreCount >= 10;
    }
    
    case 'speed_learner': {
      // This is complex to check - would need lesson completion timestamps
      // For now, simplified version: check if any chapter was completed in < 1 day
      // This would require storing chapter completion timestamps
      // Returning false for now - needs implementation
      return false;
    }
    
    case 'book_complete': {
      // Check if all chapters in a book are 100% complete
      if (!bookId || !chapters.length) return false;
      
      const { getBookProgress } = require('./lessonProgressTracker.js');
      const progress = getBookProgress(bookId, chapters);
      
      return progress.percentage === 100;
    }
    
    default:
      return false;
  }
}

/**
 * Get all earned badges for user
 * @param {Object} userData - { bookId, allLessons, chapters }
 * @returns {Array<Object>} - Array of badge objects with earnedAt date
 */
export function getEarnedBadges(userData = {}) {
  const earnedBadges = [];
  
  for (const badgeKey in BADGES) {
    const badge = BADGES[badgeKey];
    if (hasBadge(badge.id, userData)) {
      // Try to get earned date from localStorage
      const earnedKey = `badge_earned_${badge.id}`;
      let earnedAt = localStorage.getItem(earnedKey);
      
      if (!earnedAt) {
        // First time detecting this badge - save timestamp
        earnedAt = new Date().toISOString();
        localStorage.setItem(earnedKey, earnedAt);
      }
      
      earnedBadges.push({
        ...badge,
        earnedAt
      });
    }
  }
  
  return earnedBadges;
}

/**
 * Get badges in progress (not earned yet but show progress)
 * @param {Object} userData 
 * @returns {Array<Object>} - Array of badge objects with progress percentage
 */
export function getBadgesInProgress(userData = {}) {
  const inProgressBadges = [];
  const { bookId, allLessons = [], chapters = [] } = userData;
  
  for (const badgeKey in BADGES) {
    const badge = BADGES[badgeKey];
    
    // Skip if already earned
    if (hasBadge(badge.id, userData)) continue;
    
    let progress = 0;
    let current = 0;
    let target = 1;
    
    switch (badge.id) {
      case 'streak_7': {
        const { streak } = getStudyStreak();
        progress = Math.min((streak / 7) * 100, 99);
        current = streak;
        target = 7;
        break;
      }
      
      case 'streak_30': {
        const { streak } = getStudyStreak();
        progress = Math.min((streak / 30) * 100, 99);
        current = streak;
        target = 30;
        break;
      }
      
      case 'quiz_champion': {
        const keys = Object.keys(localStorage);
        const scoreKeys = keys.filter(key => key.startsWith('quiz_scores_'));
        
        let highScoreCount = 0;
        
        for (const key of scoreKeys) {
          const scores = JSON.parse(localStorage.getItem(key) || '[]');
          if (scores.some(s => s.percentage >= 90)) {
            highScoreCount++;
          }
        }
        
        progress = Math.min((highScoreCount / 10) * 100, 99);
        current = highScoreCount;
        target = 10;
        break;
      }
      
      default:
        continue; // Skip badges without progress tracking
    }
    
    // Only show if has some progress
    if (progress > 0) {
      inProgressBadges.push({
        ...badge,
        progress: Math.round(progress),
        current,
        target
      });
    }
  }
  
  return inProgressBadges;
}

/**
 * Get all badges (earned + in progress)
 * @param {Object} userData 
 * @returns {{ earned: Array, inProgress: Array }}
 */
export function getAllBadges(userData = {}) {
  return {
    earned: getEarnedBadges(userData),
    inProgress: getBadgesInProgress(userData)
  };
}

export default {
  BADGES,
  hasBadge,
  getEarnedBadges,
  getBadgesInProgress,
  getAllBadges
};

