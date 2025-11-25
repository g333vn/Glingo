// src/services/srsAlgorithm.js
// 🧠 SRS Algorithm Engine - SuperMemo SM-2 Implementation

/**
 * SRS Algorithm Engine
 * Implementation of SuperMemo SM-2 algorithm (modified for optimal learning)
 * 
 * Based on: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 * 
 * @module srsAlgorithm
 */

// ========== CONSTANTS ==========

/**
 * Card States
 */
export const CARD_STATES = {
  NEW: 'new',              // Never studied
  LEARNING: 'learning',     // Currently learning (< 3 repetitions)
  REVIEW: 'review',         // Regular review (>= 3 repetitions)
  RELEARNING: 'relearning', // Forgot, relearning
  GRADUATED: 'graduated'    // Mastered (interval > 21 days)
};

/**
 * Grade Values
 * 0-5 scale (SuperMemo SM-2)
 */
export const GRADES = {
  AGAIN: 0,      // Complete blackout
  HARD: 2,       // Incorrect, but remembered with difficulty
  GOOD: 3,       // Correct with effort
  EASY: 4        // Perfect recall
};

/**
 * Default ease factor (SuperMemo recommendation)
 */
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Minimum ease factor
 */
export const MIN_EASE_FACTOR = 1.3;

/**
 * Learning steps (minutes for learning state)
 */
export const LEARNING_STEPS = [1, 10]; // 1 minute, then 10 minutes

/**
 * Graduating interval (first review after learning)
 */
export const GRADUATING_INTERVAL = 1; // 1 day

/**
 * Easy interval (if marked easy on first try)
 */
export const EASY_INTERVAL = 4; // 4 days

/**
 * Mature card threshold (days)
 */
export const MATURE_THRESHOLD = 21;

// ========== CORE ALGORITHM ==========

/**
 * Calculate next review based on grade
 * 
 * @param {object} cardProgress - Current card progress data
 * @param {number} grade - Grade (0-5)
 * @returns {object} Updated card progress
 */
export function calculateNextReview(cardProgress, grade) {
  // Validate input
  if (!cardProgress || typeof grade !== 'number') {
    throw new Error('Invalid input: cardProgress and grade required');
  }

  if (grade < 0 || grade > 5) {
    throw new Error('Invalid grade: must be 0-5');
  }

  // Clone progress to avoid mutation
  const progress = { ...cardProgress };
  
  // Get current values
  let easeFactor = progress.easeFactor || DEFAULT_EASE_FACTOR;
  let interval = progress.interval || 0;
  let repetitions = progress.repetitions || 0;
  let state = progress.state || CARD_STATES.NEW;

  // Calculate new ease factor (SM-2 formula)
  if (grade >= GRADES.HARD) {
    easeFactor = calculateEaseFactor(easeFactor, grade);
  }

  // Determine new interval and state based on grade
  if (grade < GRADES.HARD) {
    // Failed: Reset to learning/relearning
    interval = LEARNING_STEPS[0] / (24 * 60); // Convert minutes to days
    repetitions = 0;
    state = (state === CARD_STATES.NEW) ? CARD_STATES.LEARNING : CARD_STATES.RELEARNING;
    progress.lapses = (progress.lapses || 0) + 1;
  } else if (state === CARD_STATES.NEW) {
    // First time correct
    if (grade === GRADES.EASY) {
      interval = EASY_INTERVAL;
      repetitions = 1;
      state = CARD_STATES.REVIEW;
    } else {
      interval = LEARNING_STEPS[0] / (24 * 60);
      repetitions = 0;
      state = CARD_STATES.LEARNING;
    }
  } else if (state === CARD_STATES.LEARNING || state === CARD_STATES.RELEARNING) {
    // In learning phase
    repetitions += 1;
    
    if (repetitions >= LEARNING_STEPS.length) {
      // Graduate to review
      interval = GRADUATING_INTERVAL;
      if (grade === GRADES.EASY) {
        interval = EASY_INTERVAL;
      }
      state = CARD_STATES.REVIEW;
    } else {
      // Continue learning
      interval = LEARNING_STEPS[repetitions] / (24 * 60);
    }
  } else {
    // Regular review (SM-2 algorithm)
    repetitions += 1;
    
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      // Exponential growth with ease factor
      interval = Math.round(interval * easeFactor);
      
      // Apply grade multiplier
      if (grade === GRADES.HARD) {
        interval = Math.max(1, Math.round(interval * 0.7)); // 70% of normal
      } else if (grade === GRADES.EASY) {
        interval = Math.round(interval * 1.3); // 130% of normal
      }
    }
    
    state = CARD_STATES.REVIEW;
  }

  // Determine if graduated (mature)
  if (interval >= MATURE_THRESHOLD) {
    state = CARD_STATES.GRADUATED;
    if (!progress.graduatedAt) {
      progress.graduatedAt = new Date().toISOString();
    }
  }

  // Calculate next review date
  const now = new Date();
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  // Return updated progress
  return {
    ...progress,
    easeFactor,
    interval,
    repetitions,
    state,
    due: nextReview.toISOString(),
    lastReviewed: now.toISOString(),
    nextReview: nextReview.toISOString(),
    totalReviews: (progress.totalReviews || 0) + 1,
    correctReviews: grade >= GRADES.GOOD ? (progress.correctReviews || 0) + 1 : (progress.correctReviews || 0),
    updatedAt: now.toISOString()
  };
}

/**
 * Calculate new ease factor (SM-2 formula)
 * 
 * EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
 * 
 * @param {number} currentEF - Current ease factor
 * @param {number} grade - Grade (0-5)
 * @returns {number} New ease factor (>= 1.3)
 */
function calculateEaseFactor(currentEF, grade) {
  const newEF = currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  return Math.max(MIN_EASE_FACTOR, newEF);
}

// ========== HELPER FUNCTIONS ==========

/**
 * Initialize new card progress
 * 
 * @param {string} cardId - Card ID
 * @param {string} deckId - Deck ID
 * @param {string} userId - User ID
 * @returns {object} Initial progress data
 */
export function initializeCardProgress(cardId, deckId, userId) {
  const now = new Date().toISOString();
  
  return {
    cardId,
    deckId,
    userId,
    
    // SRS data
    state: CARD_STATES.NEW,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    
    // Schedule
    due: now, // Due immediately (new card)
    lastReviewed: null,
    nextReview: now,
    
    // Statistics
    totalReviews: 0,
    correctReviews: 0,
    lapses: 0,
    
    // Timestamps
    createdAt: now,
    updatedAt: now,
    graduatedAt: null
  };
}

/**
 * Check if card is due for review
 * 
 * @param {object} cardProgress - Card progress data
 * @returns {boolean} True if due
 */
export function isCardDue(cardProgress) {
  if (!cardProgress || !cardProgress.nextReview) {
    return false;
  }
  
  const now = new Date();
  const nextReview = new Date(cardProgress.nextReview);
  
  return nextReview <= now;
}

/**
 * Get cards due for review
 * 
 * @param {array} allProgress - All card progress data
 * @returns {array} Cards due for review (sorted by due date)
 */
export function getDueCards(allProgress) {
  const now = new Date();
  
  return allProgress
    .filter(progress => {
      const nextReview = new Date(progress.nextReview);
      return nextReview <= now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.nextReview);
      const dateB = new Date(b.nextReview);
      return dateA - dateB;
    });
}

/**
 * Get new cards (not yet studied)
 * 
 * @param {array} allProgress - All card progress data
 * @param {array} allCards - All flashcards
 * @param {number} limit - Max new cards to return
 * @returns {array} New cards (limited)
 */
export function getNewCards(allProgress, allCards, limit = 20) {
  const studiedCardIds = new Set(allProgress.map(p => p.cardId));
  
  return allCards
    .filter(card => !studiedCardIds.has(card.id))
    .slice(0, limit);
}

/**
 * Calculate retention rate
 * 
 * @param {object} cardProgress - Card progress data
 * @returns {number} Retention rate (0-1)
 */
export function calculateRetention(cardProgress) {
  if (!cardProgress || !cardProgress.totalReviews) {
    return 0;
  }
  
  return cardProgress.correctReviews / cardProgress.totalReviews;
}

/**
 * Calculate deck statistics
 * 
 * @param {array} allProgress - All card progress for deck
 * @returns {object} Deck statistics
 */
export function calculateDeckStats(allProgress) {
  const total = allProgress.length;
  
  if (total === 0) {
    return {
      total: 0,
      new: 0,
      learning: 0,
      review: 0,
      graduated: 0,
      due: 0,
      retention: 0,
      averageEase: DEFAULT_EASE_FACTOR
    };
  }

  const now = new Date();
  let newCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let graduatedCount = 0;
  let dueCount = 0;
  let totalCorrect = 0;
  let totalReviews = 0;
  let totalEase = 0;

  allProgress.forEach(progress => {
    // Count states
    if (progress.state === CARD_STATES.NEW) newCount++;
    else if (progress.state === CARD_STATES.LEARNING || progress.state === CARD_STATES.RELEARNING) learningCount++;
    else if (progress.state === CARD_STATES.REVIEW) reviewCount++;
    else if (progress.state === CARD_STATES.GRADUATED) graduatedCount++;

    // Count due cards
    if (new Date(progress.nextReview) <= now) dueCount++;

    // Sum for averages
    totalCorrect += progress.correctReviews || 0;
    totalReviews += progress.totalReviews || 0;
    totalEase += progress.easeFactor || DEFAULT_EASE_FACTOR;
  });

  return {
    total,
    new: newCount,
    learning: learningCount,
    review: reviewCount,
    graduated: graduatedCount,
    due: dueCount,
    retention: totalReviews > 0 ? totalCorrect / totalReviews : 0,
    averageEase: totalEase / total
  };
}

/**
 * Get grade description (for UI)
 * 
 * @param {number} grade - Grade (0-4)
 * @returns {object} Grade info
 */
export function getGradeInfo(grade) {
  const gradeMap = {
    [GRADES.AGAIN]: {
      label: 'Again',
      color: 'red',
      description: 'Complete blackout',
      emoji: '❌',
      interval: '<1m'
    },
    [GRADES.HARD]: {
      label: 'Hard',
      color: 'orange',
      description: 'Incorrect, but remembered',
      emoji: '😰',
      interval: '<10m'
    },
    [GRADES.GOOD]: {
      label: 'Good',
      color: 'green',
      description: 'Correct with effort',
      emoji: '✅',
      interval: '1d'
    },
    [GRADES.EASY]: {
      label: 'Easy',
      color: 'blue',
      description: 'Perfect recall',
      emoji: '🎯',
      interval: '4d'
    }
  };

  return gradeMap[grade] || gradeMap[GRADES.GOOD];
}

/**
 * Get interval preview for grade
 * 
 * @param {object} cardProgress - Current progress
 * @param {number} grade - Grade to preview
 * @returns {string} Interval description
 */
export function getIntervalPreview(cardProgress, grade) {
  // Simulate calculation
  const simulated = calculateNextReview(cardProgress, grade);
  const interval = simulated.interval;

  if (interval < 1 / 24) {
    // Less than 1 hour
    const minutes = Math.round(interval * 24 * 60);
    return `<${minutes}m`;
  } else if (interval < 1) {
    // Less than 1 day
    const hours = Math.round(interval * 24);
    return `${hours}h`;
  } else if (interval < 30) {
    // Less than 1 month
    return `${Math.round(interval)}d`;
  } else if (interval < 365) {
    // Less than 1 year
    const months = Math.round(interval / 30);
    return `${months}mo`;
  } else {
    // Years
    const years = Math.round(interval / 365);
    return `${years}y`;
  }
}

// ========== EXPORTS ==========

export default {
  // Core
  calculateNextReview,
  initializeCardProgress,
  
  // Query
  isCardDue,
  getDueCards,
  getNewCards,
  
  // Stats
  calculateRetention,
  calculateDeckStats,
  
  // UI Helpers
  getGradeInfo,
  getIntervalPreview,
  
  // Constants
  CARD_STATES,
  GRADES,
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  MATURE_THRESHOLD
};

