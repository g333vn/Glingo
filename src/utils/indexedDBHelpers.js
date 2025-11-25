// src/utils/indexedDBHelpers.js
// 🛠️ IndexedDB Helper Functions - Utilities for better performance and migration

import indexedDBManager from './indexedDBManager.js';

/**
 * Batch Operations Helper
 * Giúp lưu/xóa nhiều items cùng lúc một cách hiệu quả
 */
export class IndexedDBBatchHelper {
  /**
   * Save multiple quizzes in batch
   * @param {Array} quizzes - Array of quiz objects
   * @returns {Promise<{success: boolean, saved: number, errors: Array}>}
   */
  static async saveQuizzesBatch(quizzes) {
    if (!(await indexedDBManager.isAvailable())) {
      return { success: false, saved: 0, errors: ['IndexedDB not available'] };
    }

    const db = indexedDBManager.db;
    const tx = db.transaction('quizzes', 'readwrite');
    const store = tx.objectStore('quizzes');
    
    let saved = 0;
    const errors = [];

    try {
      for (const quiz of quizzes) {
        try {
          const dataToSave = {
            bookId: quiz.bookId,
            chapterId: quiz.chapterId,
            ...quiz
          };
          await store.put(dataToSave);
          saved++;
        } catch (error) {
          errors.push({
            quiz: `${quiz.bookId}/${quiz.chapterId}`,
            error: error.message
          });
        }
      }

      await tx.done;
      console.log(`✅ Batch saved ${saved}/${quizzes.length} quizzes`);
      return { success: true, saved, errors };
    } catch (error) {
      console.error('❌ Batch save error:', error);
      return { success: false, saved, errors: [error.message] };
    }
  }

  /**
   * Save multiple books in batch
   * @param {string} level - Level (n1, n2, etc.)
   * @param {Array} books - Array of book objects
   * @returns {Promise<{success: boolean, saved: number}>}
   */
  static async saveBooksBatch(level, books) {
    if (!(await indexedDBManager.isAvailable())) {
      return { success: false, saved: 0 };
    }

    const db = indexedDBManager.db;
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    
    let saved = 0;

    try {
      for (const book of books) {
        await store.put({ ...book, level });
        saved++;
      }

      await tx.done;
      console.log(`✅ Batch saved ${saved} books for level ${level}`);
      return { success: true, saved };
    } catch (error) {
      console.error('❌ Batch save books error:', error);
      return { success: false, saved };
    }
  }

  /**
   * Delete multiple quizzes in batch
   * @param {Array} keys - Array of [bookId, chapterId] keys
   * @returns {Promise<{success: boolean, deleted: number}>}
   */
  static async deleteQuizzesBatch(keys) {
    if (!(await indexedDBManager.isAvailable())) {
      return { success: false, deleted: 0 };
    }

    const db = indexedDBManager.db;
    const tx = db.transaction('quizzes', 'readwrite');
    const store = tx.objectStore('quizzes');
    
    let deleted = 0;

    try {
      for (const key of keys) {
        await store.delete(key);
        deleted++;
      }

      await tx.done;
      console.log(`✅ Batch deleted ${deleted} quizzes`);
      return { success: true, deleted };
    } catch (error) {
      console.error('❌ Batch delete error:', error);
      return { success: false, deleted };
    }
  }
}

/**
 * Migration Helper
 * Giúp export/import data dễ dàng cho migration
 */
export class IndexedDBMigrationHelper {
  /**
   * Export all data to JSON format (for migration to Supabase)
   * @returns {Promise<Object>}
   */
  static async exportForMigration() {
    const data = await indexedDBManager.exportAll();
    
    // Transform to migration-friendly format
    const migrationData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      books: [],
      chapters: [],
      quizzes: [],
      exams: []
    };

    // Transform books
    for (const level in data.books) {
      for (const book of data.books[level]) {
        migrationData.books.push({
          level: book.level,
          book_id: book.id,
          title: book.title,
          description: book.description || null
        });
      }
    }

    // Transform chapters
    for (const bookId in data.chapters) {
      const chapters = data.chapters[bookId];
      for (const chapter of chapters) {
        migrationData.chapters.push({
          book_id: bookId,
          chapter_id: chapter.id,
          title: chapter.title,
          order_index: chapter.order || null
        });
      }
    }

    // Transform quizzes
    for (const key in data.quizzes) {
      const quiz = data.quizzes[key];
      migrationData.quizzes.push({
        book_id: quiz.bookId,
        chapter_id: quiz.chapterId,
        lesson_id: quiz.lessonId || quiz.chapterId, // Fallback to chapterId
        title: quiz.title,
        questions: quiz.questions
      });
    }

    // Transform exams
    for (const key in data.exams) {
      const exam = data.exams[key];
      migrationData.exams.push({
        level: exam.level,
        exam_id: exam.examId,
        title: exam.title,
        knowledge_sections: exam.knowledge_sections || null,
        listening_sections: exam.listening_sections || null,
        config: exam.config || null
      });
    }

    return migrationData;
  }

  /**
   * Download export as JSON file
   * @param {Object} data - Data to export
   * @param {string} filename - Filename (optional)
   */
  static downloadAsJSON(data, filename = null) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `elearning-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ Export downloaded');
  }

  /**
   * Import from JSON file
   * @param {File} file - JSON file
   * @returns {Promise<{success: boolean, imported: number, errors: Array}>}
   */
  static async importFromFile(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const result = await indexedDBManager.importAll(data);
      return result;
    } catch (error) {
      console.error('❌ Import error:', error);
      return {
        success: false,
        imported: 0,
        errors: [error.message]
      };
    }
  }
}

/**
 * Performance Monitor
 * Giúp monitor performance và storage usage
 */
export class IndexedDBPerformanceMonitor {
  /**
   * Get detailed storage statistics
   * @returns {Promise<Object>}
   */
  static async getDetailedStats() {
    if (!(await indexedDBManager.isAvailable())) {
      return null;
    }

    const db = indexedDBManager.db;
    const stats = {
      timestamp: new Date().toISOString(),
      stores: {}
    };

    const storeNames = ['books', 'series', 'chapters', 'quizzes', 'exams', 'levelConfigs'];

    for (const storeName of storeNames) {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const allItems = await store.getAll();
        
        const size = JSON.stringify(allItems).length;
        const count = allItems.length;
        
        stats.stores[storeName] = {
          count,
          size,
          sizeFormatted: indexedDBManager.formatBytes(size),
          averageSize: count > 0 ? Math.round(size / count) : 0
        };
      } catch (error) {
        console.error(`Error getting stats for ${storeName}:`, error);
        stats.stores[storeName] = { error: error.message };
      }
    }

    // Calculate totals
    stats.total = {
      count: Object.values(stats.stores).reduce((sum, s) => sum + (s.count || 0), 0),
      size: Object.values(stats.stores).reduce((sum, s) => sum + (s.size || 0), 0)
    };
    stats.total.sizeFormatted = indexedDBManager.formatBytes(stats.total.size);

    return stats;
  }

  /**
   * Monitor query performance
   * @param {Function} queryFn - Query function to monitor
   * @param {string} label - Label for logging
   * @returns {Promise<{result: any, duration: number}>}
   */
  static async monitorQuery(queryFn, label = 'Query') {
    const start = performance.now();
    const result = await queryFn();
    const duration = performance.now() - start;
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  }
}

/**
 * Cache Helper
 * In-memory cache for frequently accessed data
 */
export class IndexedDBCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  /**
   * Get from cache or IndexedDB
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch from IndexedDB
   * @returns {Promise<any>}
   */
  async get(key, fetchFn) {
    // Check cache
    if (this.cache.has(key)) {
      // Update access order
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
      return this.cache.get(key);
    }

    // Fetch from IndexedDB
    const data = await fetchFn();
    if (data) {
      // Add to cache
      if (this.cache.size >= this.maxSize) {
        // Remove oldest (FIFO)
        const oldestKey = this.accessOrder.shift();
        this.cache.delete(oldestKey);
      }
      this.cache.set(key, data);
      this.accessOrder.push(key);
    }

    return data;
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache stats
   * @returns {Object}
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Cleanup Helper
 * Giúp cleanup old/unused data
 */
export class IndexedDBCleanupHelper {
  /**
   * Cleanup old quizzes (not accessed in X days)
   * @param {number} days - Number of days
   * @returns {Promise<{deleted: number}>}
   */
  static async cleanupOldQuizzes(days = 30) {
    if (!(await indexedDBManager.isAvailable())) {
      return { deleted: 0 };
    }

    const allQuizzes = await indexedDBManager.getAllQuizzes();
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const quiz of allQuizzes) {
      const lastAccessed = quiz.lastAccessed || quiz.updatedAt || 0;
      if (lastAccessed < cutoffDate) {
        await indexedDBManager.deleteQuiz(quiz.bookId, quiz.chapterId);
        deleted++;
      }
    }

    console.log(`🗑️ Cleaned up ${deleted} old quizzes`);
    return { deleted };
  }

  /**
   * Cleanup duplicate quizzes
   * @returns {Promise<{deleted: number}>}
   */
  static async cleanupDuplicates() {
    if (!(await indexedDBManager.isAvailable())) {
      return { deleted: 0 };
    }

    const allQuizzes = await indexedDBManager.getAllQuizzes();
    const seen = new Set();
    let deleted = 0;

    for (const quiz of allQuizzes) {
      const key = `${quiz.bookId}_${quiz.chapterId}`;
      if (seen.has(key)) {
        await indexedDBManager.deleteQuiz(quiz.bookId, quiz.chapterId);
        deleted++;
      } else {
        seen.add(key);
      }
    }

    console.log(`🗑️ Cleaned up ${deleted} duplicate quizzes`);
    return { deleted };
  }
}

// Export default instance of cache
export const indexedDBCache = new IndexedDBCache(50);

