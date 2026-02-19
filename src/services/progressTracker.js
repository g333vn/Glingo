// src/services/progressTracker.js
// Progress Tracking Service - Track learning progress and statistics

import { openDB } from 'idb';
import { calculateRetention, CARD_STATES } from './srsAlgorithm.js';

/**
 * Progress Tracker Service
 * Tracks daily reviews, retention rate, streaks, and overall progress
 */

// ========== CONSTANTS ==========

const DB_NAME = 'elearning-db';
const DB_VERSION = 3;

// ========== DAILY STATS ==========

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get or create daily stats
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {object} Daily stats
 */
export async function getDailyStats(userId, deckId, date = getTodayDate()) {
  const db = await openDB(DB_NAME, DB_VERSION);
  
  let stats = await db.get('dailyStats', [userId, deckId, date]);
  
  if (!stats) {
    // Create new stats for today
    stats = {
      userId,
      deckId,
      date,
      newCards: 0,
      reviews: 0,
      correctReviews: 0,
      timeSpent: 0, // seconds
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.put('dailyStats', stats);
  }
  
  return stats;
}

/**
 * Update daily stats after review
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @param {object} review - Review data
 */
export async function updateDailyStats(userId, deckId, review) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const date = getTodayDate();
  
  const stats = await getDailyStats(userId, deckId, date);
  
  // Update stats
  stats.reviews += 1;
  if (review.grade >= 3) {
    stats.correctReviews += 1;
  }
  stats.timeSpent += review.timeSpent || 0;
  stats.updatedAt = new Date().toISOString();
  
  await db.put('dailyStats', stats);
  
  return stats;
}

/**
 * Increment new cards count
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 */
export async function incrementNewCards(userId, deckId) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const date = getTodayDate();
  
  const stats = await getDailyStats(userId, deckId, date);
  stats.newCards += 1;
  stats.updatedAt = new Date().toISOString();
  
  await db.put('dailyStats', stats);
  
  return stats;
}

// ========== STUDY STREAK ==========

/**
 * Calculate study streak (consecutive days)
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {object} Streak data
 */
export async function calculateStreak(userId, deckId) {
  const db = await openDB(DB_NAME, DB_VERSION);
  
  // Get all stats for this user+deck, sorted by date desc
  const allStats = await db.getAllFromIndex('dailyStats', 'by-user-deck', [userId, deckId]);
  
  if (allStats.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  // Sort by date descending
  allStats.sort((a, b) => b.date.localeCompare(a.date));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = getTodayDate();
  
  for (const stat of allStats) {
    if (stat.reviews > 0) {
      if (stat.date === expectedDate) {
        tempStreak += 1;
        
        // Move to previous day
        const prevDate = new Date(expectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        expectedDate = prevDate.toISOString().split('T')[0];
      } else {
        // Streak broken
        break;
      }
    }
  }
  
  currentStreak = tempStreak;
  
  // Calculate longest streak
  tempStreak = 0;
  let prevDate = null;
  
  for (const stat of allStats.reverse()) {
    if (stat.reviews > 0) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const current = new Date(stat.date);
        const prev = new Date(prevDate);
        const dayDiff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak += 1;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevDate = stat.date;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { current: currentStreak, longest: longestStreak };
}

// ========== OVERALL STATS ==========

/**
 * Calculate overall deck statistics
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {object} Overall stats
 */
export async function calculateOverallStats(userId, deckId) {
  const db = await openDB(DB_NAME, DB_VERSION);
  
  // Get all progress for this deck
  const allProgress = await db.getAllFromIndex('srsProgress', 'by-user-deck', [userId, deckId]);
  
  // Get all reviews for this deck
  const allReviews = await db.getAllFromIndex('reviews', 'by-user-deck', [userId, deckId]);
  
  // Get all daily stats
  const allDailyStats = await db.getAllFromIndex('dailyStats', 'by-user-deck', [userId, deckId]);
  
  // Calculate card distribution
  const total = allProgress.length;
  let newCount = 0;
  let learningCount = 0;
  let youngCount = 0; // interval 1-21 days
  let matureCount = 0; // interval > 21 days
  let totalCorrect = 0;
  let totalReviews = 0;
  let totalEase = 0;
  
  allProgress.forEach(progress => {
    if (progress.state === CARD_STATES.NEW) {
      newCount++;
    } else if (progress.state === CARD_STATES.LEARNING || progress.state === CARD_STATES.RELEARNING) {
      learningCount++;
    } else if (progress.interval < 21) {
      youngCount++;
    } else {
      matureCount++;
    }
    
    totalCorrect += progress.correctReviews || 0;
    totalReviews += progress.totalReviews || 0;
    totalEase += progress.easeFactor || 2.5;
  });
  
  // Calculate time spent
  const totalTimeSpent = allDailyStats.reduce((sum, stat) => sum + (stat.timeSpent || 0), 0);
  
  // Calculate streak
  const streak = await calculateStreak(userId, deckId);
  
  return {
    total,
    new: newCount,
    learning: learningCount,
    young: youngCount,
    mature: matureCount,
    
    retention: totalReviews > 0 ? totalCorrect / totalReviews : 0,
    averageEase: total > 0 ? totalEase / total : 2.5,
    
    totalReviews,
    totalTimeSpent, // seconds
    
    studyStreak: streak.current,
    longestStreak: streak.longest
  };
}

// ========== HISTORY ==========

/**
 * Get review history (last N days)
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @param {number} days - Number of days (default 30)
 * @returns {array} Daily stats array
 */
export async function getReviewHistory(userId, deckId, days = 30) {
  const db = await openDB(DB_NAME, DB_VERSION);
  
  // Get all stats for this deck
  const allStats = await db.getAllFromIndex('dailyStats', 'by-user-deck', [userId, deckId]);
  
  // Sort by date descending
  allStats.sort((a, b) => b.date.localeCompare(a.date));
  
  // Take last N days
  return allStats.slice(0, days).reverse();
}

/**
 * Get today's progress
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {object} Today's stats
 */
export async function getTodayProgress(userId, deckId) {
  const date = getTodayDate();
  return await getDailyStats(userId, deckId, date);
}

// ========== DUE CARDS COUNT ==========

/**
 * Get count of cards due for review
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {number} Count of due cards
 */
export async function getDueCardsCount(userId, deckId) {
  const db = await openDB(DB_NAME, DB_VERSION);
  
  const allProgress = await db.getAllFromIndex('srsProgress', 'by-user-deck', [userId, deckId]);
  
  const now = new Date();
  let dueCount = 0;
  
  allProgress.forEach(progress => {
    const nextReview = new Date(progress.nextReview);
    if (nextReview <= now) {
      dueCount++;
    }
  });
  
  return dueCount;
}

// ========== FORECAST ==========

/**
 * Forecast upcoming reviews (next 7 days)
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {array} Forecast data
 */
export async function forecastReviews(userId, deckId) {
  const db = await openDB(DB_NAME, DB_VERSION);
  
  const allProgress = await db.getAllFromIndex('srsProgress', 'by-user-deck', [userId, deckId]);
  
  const forecast = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    let count = 0;
    allProgress.forEach(progress => {
      const nextReview = new Date(progress.nextReview);
      if (nextReview >= date && nextReview < nextDate) {
        count++;
      }
    });
    
    forecast.push({
      date: dateStr,
      count,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return forecast;
}

// ========== MASTERY LEVEL ==========

/**
 * Calculate mastery level (0-100%)
 * Based on mature cards ratio
 * 
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {number} Mastery percentage (0-100)
 */
export async function calculateMasteryLevel(userId, deckId) {
  const stats = await calculateOverallStats(userId, deckId);
  
  if (stats.total === 0) return 0;
  
  // Mastery = (mature cards / total cards) * 100
  return Math.round((stats.mature / stats.total) * 100);
}

// ========== EXPORTS ==========

export default {
  // Daily
  getDailyStats,
  updateDailyStats,
  incrementNewCards,
  getTodayProgress,
  
  // Streak
  calculateStreak,
  
  // Overall
  calculateOverallStats,
  
  // History
  getReviewHistory,
  
  // Due cards
  getDueCardsCount,
  
  // Forecast
  forecastReviews,
  
  // Mastery
  calculateMasteryLevel
};

