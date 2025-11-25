// src/data/lessonTypes.js
// Data structures và types cho Lesson system

/**
 * Lesson Content Types
 * - PDF: File PDF để học lý thuyết
 * - TEXT: Nội dung text HTML/Markdown
 * - VIDEO: Video embed (YouTube, Vimeo, etc.)
 * - EXTERNAL: Link external resource
 */
export const LESSON_CONTENT_TYPE = {
  PDF: 'pdf',
  TEXT: 'text',
  VIDEO: 'video',
  EXTERNAL: 'external'
};

/**
 * Lesson Status
 */
export const LESSON_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

/**
 * Sample Lesson Structure
 * {
 *   id: string,
 *   title: string,
 *   chapterId: string,
 *   order: number,
 *   
 *   // Theory Content
 *   theory: {
 *     type: 'pdf' | 'text' | 'video' | 'external',
 *     content: string (URL for PDF/Video, HTML for text, URL for external),
 *     duration: number (minutes estimated),
 *   },
 *   
 *   // Quiz (optional)
 *   hasQuiz: boolean,
 *   
 *   // Progress tracking
 *   isTheoryCompleted: boolean,
 *   isQuizCompleted: boolean,
 *   
 *   // Metadata
 *   description: string,
 *   keywords: string[],
 *   difficulty: 'easy' | 'medium' | 'hard',
 *   
 *   // Timestamps
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO),
 * }
 */

/**
 * User Progress for Lessons
 * Stored in localStorage: `lessonProgress_${userId}`
 * {
 *   bookId: {
 *     chapterId: {
 *       lessonId: {
 *         status: 'not_started' | 'in_progress' | 'completed',
 *         theoryCompleted: boolean,
 *         quizCompleted: boolean,
 *         quizScore: number,
 *         quizAttempts: number,
 *         lastVisited: string (ISO),
 *         timeSpent: number (seconds),
 *       }
 *     }
 *   }
 * }
 */

/**
 * Analytics Data Structure
 * {
 *   totalLessons: number,
 *   completedLessons: number,
 *   inProgressLessons: number,
 *   averageScore: number,
 *   totalTimeSpent: number (seconds),
 *   streak: number (days),
 *   lastStudyDate: string (ISO),
 *   studyHistory: [
 *     { date: string (YYYY-MM-DD), lessonsCount: number, timeSpent: number }
 *   ],
 *   weakLessons: [
 *     { lessonId: string, lessonTitle: string, score: number, bookId: string, chapterId: string }
 *   ]
 * }
 */

/**
 * Badges/Achievements
 * {
 *   id: string,
 *   name: string,
 *   description: string,
 *   icon: string (emoji),
 *   condition: {
 *     type: 'streak' | 'perfect_score' | 'chapter_complete' | 'quiz_champion' | 'speed_learner',
 *     value: number or object,
 *   },
 *   earnedAt: string (ISO) or null,
 *   progress: number (0-100%),
 * }
 */

export const BADGE_TYPES = {
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Học 7 ngày liên tiếp',
    icon: '🔥',
    condition: { type: 'streak', value: 7 }
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Đạt 100 điểm trong 1 quiz',
    icon: '💯',
    condition: { type: 'perfect_score', value: 100 }
  },
  CHAPTER_MASTER: {
    id: 'chapter_master',
    name: 'Chapter Master',
    description: 'Hoàn thành 1 chapter (100%)',
    icon: '📚',
    condition: { type: 'chapter_complete', value: 100 }
  },
  QUIZ_CHAMPION: {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Đạt 90+ điểm trong 10 quiz',
    icon: '⭐',
    condition: { type: 'quiz_champion', value: { count: 10, minScore: 90 } }
  },
  SPEED_LEARNER: {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Hoàn thành 1 chapter trong 1 ngày',
    icon: '🚀',
    condition: { type: 'speed_learner', value: { lessons: 5, hours: 24 } }
  }
};

/**
 * Helper functions
 */

/**
 * Calculate chapter progress
 * @param {Array} lessons - Array of lessons in chapter
 * @param {Object} progress - User progress object
 * @returns {{ completed: number, total: number, percentage: number }}
 */
export const calculateChapterProgress = (lessons, progress) => {
  const total = lessons.length;
  const completed = lessons.filter(lesson => {
    const lessonProgress = progress?.[lesson.id];
    return lessonProgress?.status === LESSON_STATUS.COMPLETED;
  }).length;
  
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

/**
 * Calculate book progress
 * @param {Array} chapters - Array of chapters in book
 * @param {Object} progress - User progress object
 * @returns {{ completed: number, total: number, percentage: number }}
 */
export const calculateBookProgress = (chapters, progress) => {
  let totalLessons = 0;
  let completedLessons = 0;
  
  chapters.forEach(chapter => {
    const chapterProgress = progress?.[chapter.id];
    if (chapterProgress && chapter.lessons) {
      const { completed, total } = calculateChapterProgress(chapter.lessons, chapterProgress);
      totalLessons += total;
      completedLessons += completed;
    }
  });
  
  return {
    completed: completedLessons,
    total: totalLessons,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  };
};

/**
 * Get weak lessons (score < 70%)
 * @param {Object} progress - User progress object
 * @param {Number} threshold - Score threshold (default 70)
 * @returns {Array} - Array of weak lessons
 */
export const getWeakLessons = (progress, threshold = 70) => {
  const weakLessons = [];
  
  for (const bookId in progress) {
    for (const chapterId in progress[bookId]) {
      for (const lessonId in progress[bookId][chapterId]) {
        const lessonProgress = progress[bookId][chapterId][lessonId];
        if (lessonProgress.quizCompleted && lessonProgress.quizScore < threshold) {
          weakLessons.push({
            bookId,
            chapterId,
            lessonId,
            lessonTitle: lessonProgress.lessonTitle || `Lesson ${lessonId}`,
            score: lessonProgress.quizScore
          });
        }
      }
    }
  }
  
  // Sort by score (lowest first)
  weakLessons.sort((a, b) => a.score - b.score);
  
  return weakLessons;
};

/**
 * Calculate study streak
 * @param {Array} studyHistory - Array of study dates
 * @returns {Number} - Streak count
 */
export const calculateStreak = (studyHistory) => {
  if (!studyHistory || studyHistory.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...studyHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sorted.length; i++) {
    const studyDate = new Date(sorted[i].date);
    studyDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - studyDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Get next lesson to study
 * @param {Array} lessons - All lessons
 * @param {Object} progress - User progress
 * @returns {Object|null} - Next lesson or null
 */
export const getNextLesson = (lessons, progress) => {
  // Find first not completed lesson
  const nextLesson = lessons.find(lesson => {
    const lessonProgress = progress?.[lesson.id];
    return !lessonProgress || lessonProgress.status !== LESSON_STATUS.COMPLETED;
  });
  
  return nextLesson || null;
};

/**
 * Sample lesson data for testing
 */
export const SAMPLE_LESSON = {
  id: 'lesson-1',
  title: 'Xin chào こんにちは',
  chapterId: 'chapter-1',
  order: 1,
  
  theory: {
    type: LESSON_CONTENT_TYPE.PDF,
    content: '/lessons/chapter-1/lesson-1.pdf',
    duration: 15
  },
  
  hasQuiz: true,
  isTheoryCompleted: false,
  isQuizCompleted: false,
  
  description: 'Học cách chào hỏi cơ bản trong tiếng Nhật',
  keywords: ['greeting', 'hello', 'basic'],
  difficulty: 'easy',
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

