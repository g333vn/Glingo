// src/types/lessonTypes.js
// 📚 Lesson Data Structure - Extended for SRS Integration

/**
 * Content Types - Quyết định modules nào được enable
 */
export const CONTENT_TYPES = {
  GRAMMAR: 'grammar',        // Ngữ pháp - Theory + Quiz only
  VOCABULARY: 'vocabulary',  // Từ vựng - Theory + SRS + Quiz
  KANJI: 'kanji',           // Kanji - Theory + SRS + Writing + Quiz
  MIXED: 'mixed',           // Hỗn hợp - Enable all modules
  READING: 'reading',       // Đọc hiểu - Theory + Quiz
  LISTENING: 'listening'    // Nghe - Theory + Audio + Quiz
};

/**
 * Content Type Config - Quy định features cho từng loại
 */
export const CONTENT_TYPE_CONFIG = {
  [CONTENT_TYPES.GRAMMAR]: {
    label: 'Ngữ pháp (Grammar)',
    description: 'Lý thuyết + Quiz',
    enableTheory: true,
    enableSRS: false,
    enableQuiz: true,
    icon: '📖',
    color: 'blue'
  },
  [CONTENT_TYPES.VOCABULARY]: {
    label: 'Từ vựng (Vocabulary)',
    description: 'Lý thuyết + Flashcard SRS + Quiz',
    enableTheory: true,
    enableSRS: true,
    enableQuiz: true,
    icon: '📚',
    color: 'purple'
  },
  [CONTENT_TYPES.KANJI]: {
    label: 'Kanji',
    description: 'Lý thuyết + Flashcard + Viết + Quiz',
    enableTheory: true,
    enableSRS: true,
    enableQuiz: true,
    enableWriting: true,
    icon: '🈯',
    color: 'red'
  },
  [CONTENT_TYPES.MIXED]: {
    label: 'Hỗn hợp (Mixed)',
    description: 'Tất cả tính năng',
    enableTheory: true,
    enableSRS: true,
    enableQuiz: true,
    enableWriting: true,
    icon: '🎯',
    color: 'green'
  },
  [CONTENT_TYPES.READING]: {
    label: 'Đọc hiểu (Reading)',
    description: 'Văn bản + Quiz',
    enableTheory: true,
    enableSRS: false,
    enableQuiz: true,
    icon: '📄',
    color: 'teal'
  },
  [CONTENT_TYPES.LISTENING]: {
    label: 'Nghe (Listening)',
    description: 'Audio + Quiz',
    enableTheory: true,
    enableSRS: false,
    enableQuiz: true,
    enableAudio: true,
    icon: '🎧',
    color: 'indigo'
  }
};

/**
 * Theory Content Types
 */
export const THEORY_TYPES = {
  HTML: 'html',
  PDF: 'pdf',
  VIDEO: 'video',
  AUDIO: 'audio',
  MARKDOWN: 'markdown'
};

/**
 * Extended Lesson Structure
 * Mở rộng từ structure cũ, backward compatible
 */
export const createLessonStructure = (baseData = {}) => ({
  // ========== BASIC INFO (giữ nguyên) ==========
  id: baseData.id || '',
  title: baseData.title || '',
  description: baseData.description || '',
  order: baseData.order || 1,
  published: baseData.published !== undefined ? baseData.published : true,
  
  // ========== NEW: Content Type ==========
  contentType: baseData.contentType || CONTENT_TYPES.GRAMMAR,
  
  // ========== MODULE 1: THEORY (mở rộng) ==========
  theory: {
    // Backward compatible với code cũ
    type: baseData.theory?.type || (baseData.pdfUrl ? THEORY_TYPES.PDF : THEORY_TYPES.HTML),
    
    // PDF content
    pdfUrl: baseData.pdfUrl || baseData.theory?.pdfUrl || '',
    allowDownload: baseData.theory?.allowDownload !== undefined ? baseData.theory.allowDownload : true,
    
    // HTML content
    htmlContent: baseData.content || baseData.theory?.htmlContent || '',
    
    // Audio content (mới)
    audioUrl: baseData.theory?.audioUrl || '',
    
    // Video content (mới)
    videoUrl: baseData.theory?.videoUrl || '',
    
    // Display order (mới - Phase 1.5)
    displayOrder: baseData.theory?.displayOrder || ['video', 'pdf', 'html', 'audio'],
    
    // Metadata
    estimatedReadTime: baseData.theory?.estimatedReadTime || null, // minutes
    difficulty: baseData.theory?.difficulty || 'medium', // easy, medium, hard
    tags: baseData.theory?.tags || []
  },
  
  // ========== MODULE 2: SRS FLASHCARD (mới) ==========
  srs: {
    enabled: baseData.srs?.enabled || false,
    deckId: baseData.srs?.deckId || null, // Link to deck collection
    
    // Auto-extract settings
    autoExtract: {
      enabled: baseData.srs?.autoExtract?.enabled || false,
      source: baseData.srs?.autoExtract?.source || 'pdf', // pdf, html
      lastExtractedAt: baseData.srs?.autoExtract?.lastExtractedAt || null,
      extractedCount: baseData.srs?.autoExtract?.extractedCount || 0
    },
    
    // Deck settings
    cardCount: baseData.srs?.cardCount || 0,
    newCardsPerDay: baseData.srs?.newCardsPerDay || 20,
    reviewsPerDay: baseData.srs?.reviewsPerDay || 100,
    
    // Stats
    stats: {
      totalReviews: baseData.srs?.stats?.totalReviews || 0,
      retention: baseData.srs?.stats?.retention || 0, // 0-1
      averageEase: baseData.srs?.stats?.averageEase || 2.5
    }
  },
  
  // ========== MODULE 3: QUIZ (giữ nguyên) ==========
  hasQuiz: baseData.hasQuiz || false,
  quizId: baseData.quizId || null,
  
  // ========== METADATA ==========
  createdAt: baseData.createdAt || new Date().toISOString(),
  updatedAt: baseData.updatedAt || new Date().toISOString(),
  createdBy: baseData.createdBy || 'admin',
  
  // ========== ANALYTICS ==========
  stats: {
    views: baseData.stats?.views || 0,
    theoryViews: baseData.stats?.theoryViews || 0,
    srsSessionCount: baseData.stats?.srsSessionCount || 0,
    quizAttempts: baseData.stats?.quizAttempts || 0,
    completionRate: baseData.stats?.completionRate || 0,
    averageScore: baseData.stats?.averageScore || 0
  }
});

/**
 * Flashcard Structure (for SRS module)
 */
export const createFlashcardStructure = (baseData = {}) => ({
  id: baseData.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  deckId: baseData.deckId || '',
  lessonId: baseData.lessonId || '',
  
  // Card content
  front: baseData.front || '', // e.g., 食べる
  back: baseData.back || '',   // e.g., Ăn (to eat)
  
  // Additional info
  reading: baseData.reading || '',     // e.g., たべる
  example: baseData.example || '',     // e.g., りんごを食べます
  exampleTranslation: baseData.exampleTranslation || '',
  notes: baseData.notes || '',
  audio: baseData.audio || '',         // Audio URL
  image: baseData.image || '',         // Image URL
  
  // SRS Algorithm data (SM-2)
  srsData: {
    interval: baseData.srsData?.interval || 0,        // Days until next review
    repetitions: baseData.srsData?.repetitions || 0,  // Number of successful reviews
    easeFactor: baseData.srsData?.easeFactor || 2.5,  // Ease factor (2.5 default)
    dueDate: baseData.srsData?.dueDate || new Date().toISOString(),
    lastReviewed: baseData.srsData?.lastReviewed || null,
    lapses: baseData.srsData?.lapses || 0             // Number of times forgot
  },
  
  // Metadata
  source: baseData.source || 'manual', // manual, auto-extracted
  tags: baseData.tags || [],
  createdAt: baseData.createdAt || new Date().toISOString(),
  updatedAt: baseData.updatedAt || new Date().toISOString()
});

/**
 * Deck Structure (collection of flashcards)
 */
export const createDeckStructure = (baseData = {}) => ({
  id: baseData.id || `deck-${Date.now()}`,
  lessonId: baseData.lessonId || '',
  bookId: baseData.bookId || '',
  chapterId: baseData.chapterId || '',
  
  // Basic info
  name: baseData.name || '',
  description: baseData.description || '',
  
  // Settings
  settings: {
    newCardsPerDay: baseData.settings?.newCardsPerDay || 20,
    reviewsPerDay: baseData.settings?.reviewsPerDay || 100,
    showFront: baseData.settings?.showFront || 'kanji', // kanji, kana, both
    showBack: baseData.settings?.showBack || 'vietnamese', // vietnamese, english, both
    autoPlayAudio: baseData.settings?.autoPlayAudio || false
  },
  
  // Stats
  stats: {
    totalCards: baseData.stats?.totalCards || 0,
    newCards: baseData.stats?.newCards || 0,
    learningCards: baseData.stats?.learningCards || 0,
    reviewCards: baseData.stats?.reviewCards || 0,
    retention: baseData.stats?.retention || 0,
    totalReviews: baseData.stats?.totalReviews || 0
  },
  
  // Metadata
  createdAt: baseData.createdAt || new Date().toISOString(),
  updatedAt: baseData.updatedAt || new Date().toISOString()
});

/**
 * Helper: Check if lesson has specific module
 */
export const hasModule = (lesson, moduleName) => {
  const config = CONTENT_TYPE_CONFIG[lesson.contentType];
  if (!config) return false;
  
  switch (moduleName) {
    case 'theory':
      return config.enableTheory;
    case 'srs':
      return config.enableSRS;
    case 'quiz':
      return config.enableQuiz;
    case 'writing':
      return config.enableWriting;
    case 'audio':
      return config.enableAudio;
    default:
      return false;
  }
};

/**
 * Helper: Get enabled tabs for lesson
 */
export const getEnabledTabs = (contentType) => {
  const config = CONTENT_TYPE_CONFIG[contentType];
  if (!config) return ['theory'];
  
  const tabs = [];
  if (config.enableTheory) tabs.push('theory');
  if (config.enableSRS) tabs.push('flashcard');
  if (config.enableQuiz) tabs.push('quiz');
  
  return tabs;
};

/**
 * Helper: Migrate old lesson to new structure
 */
export const migrateLegacyLesson = (oldLesson) => {
  return createLessonStructure({
    ...oldLesson,
    // Map old fields to new structure
    theory: {
      pdfUrl: oldLesson.pdfUrl || '',
      htmlContent: oldLesson.content || '',
      allowDownload: true
    },
    hasQuiz: oldLesson.hasQuiz || false,
    quizId: oldLesson.quizId || null
  });
};

export default {
  CONTENT_TYPES,
  CONTENT_TYPE_CONFIG,
  THEORY_TYPES,
  createLessonStructure,
  createFlashcardStructure,
  createDeckStructure,
  hasModule,
  getEnabledTabs,
  migrateLegacyLesson
};

