// src/utils/indexedDBManager.js
// 💾 IndexedDB Manager - Unlimited storage for large data

import { openDB } from 'idb';

class IndexedDBManager {
  constructor() {
    this.db = null;
    this.dbName = 'elearning-db';
    this.dbVersion = 1;
  }

  // Initialize database
  async init() {
    if (!('indexedDB' in window)) {
      console.warn('⚠️ IndexedDB is not supported in this browser');
      return false;
    }

    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Books store: { level, id } as keyPath
          if (!db.objectStoreNames.contains('books')) {
            const booksStore = db.createObjectStore('books', { keyPath: ['level', 'id'] });
            booksStore.createIndex('level', 'level');
          }

          // Series store: { level, id } as keyPath
          if (!db.objectStoreNames.contains('series')) {
            const seriesStore = db.createObjectStore('series', { keyPath: ['level', 'id'] });
            seriesStore.createIndex('level', 'level');
          }

          // Chapters store: bookId as keyPath, stores array of chapters
          if (!db.objectStoreNames.contains('chapters')) {
            db.createObjectStore('chapters', { keyPath: 'bookId' });
          }

          // Quizzes store: { bookId, chapterId } as keyPath
          if (!db.objectStoreNames.contains('quizzes')) {
            db.createObjectStore('quizzes', { keyPath: ['bookId', 'chapterId'] });
            const quizStore = db.objectStore('quizzes');
            quizStore.createIndex('bookId', 'bookId');
          }

          // Exams store: { level, examId } as keyPath
          if (!db.objectStoreNames.contains('exams')) {
            const examsStore = db.createObjectStore('exams', { keyPath: ['level', 'examId'] });
            examsStore.createIndex('level', 'level');
          }

          // Level Configs store: level as keyPath
          if (!db.objectStoreNames.contains('levelConfigs')) {
            db.createObjectStore('levelConfigs', { keyPath: 'level' });
          }
        }
      });

      console.log('✅ IndexedDB initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ IndexedDB initialization failed:', error);
      return false;
    }
  }

  // Check if IndexedDB is available and initialized
  async isAvailable() {
    if (!this.db) {
      await this.init();
    }
    return this.db !== null;
  }

  // ==================== BOOKS ====================

  async getBooks(level) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const index = store.index('level');
      const books = await index.getAll(level);
      return books.length > 0 ? books : null;
    } catch (error) {
      console.error('Error getting books:', error);
      return null;
    }
  }

  async saveBooks(level, books) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');

      // Delete existing books for this level
      const index = store.index('level');
      const existingBooks = await index.getAll(level);
      for (const book of existingBooks) {
        await store.delete([level, book.id]);
      }

      // Add new books
      for (const book of books) {
        await store.put({ ...book, level });
      }

      await tx.done;
      console.log(`✅ Saved ${books.length} books to IndexedDB (level: ${level})`);
      return true;
    } catch (error) {
      console.error('Error saving books:', error);
      return false;
    }
  }

  async deleteBooks(level) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      const index = store.index('level');
      const books = await index.getAll(level);

      for (const book of books) {
        await store.delete([level, book.id]);
      }

      await tx.done;
      console.log(`🗑️ Deleted books for level ${level}`);
      return true;
    } catch (error) {
      console.error('Error deleting books:', error);
      return false;
    }
  }

  // ==================== SERIES ====================

  async getSeries(level) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('series', 'readonly');
      const store = tx.objectStore('series');
      const index = store.index('level');
      const series = await index.getAll(level);
      return series.length > 0 ? series : null;
    } catch (error) {
      console.error('Error getting series:', error);
      return null;
    }
  }

  async saveSeries(level, series) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('series', 'readwrite');
      const store = tx.objectStore('series');

      // Delete existing series for this level
      const index = store.index('level');
      const existingSeries = await index.getAll(level);
      for (const s of existingSeries) {
        await store.delete([level, s.id]);
      }

      // Add new series
      for (const s of series) {
        await store.put({ ...s, level });
      }

      await tx.done;
      console.log(`✅ Saved ${series.length} series to IndexedDB (level: ${level})`);
      return true;
    } catch (error) {
      console.error('Error saving series:', error);
      return false;
    }
  }

  async deleteSeries(level) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('series', 'readwrite');
      const store = tx.objectStore('series');
      const index = store.index('level');
      const series = await index.getAll(level);

      for (const s of series) {
        await store.delete([level, s.id]);
      }

      await tx.done;
      console.log(`🗑️ Deleted series for level ${level}`);
      return true;
    } catch (error) {
      console.error('Error deleting series:', error);
      return false;
    }
  }

  // ==================== CHAPTERS ====================

  async getChapters(bookId) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('chapters', 'readonly');
      const store = tx.objectStore('chapters');
      const result = await store.get(bookId);
      return result ? result.chapters : null;
    } catch (error) {
      console.error('Error getting chapters:', error);
      return null;
    }
  }

  async saveChapters(bookId, chapters) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('chapters', 'readwrite');
      const store = tx.objectStore('chapters');
      await store.put({ bookId, chapters });
      await tx.done;
      console.log(`✅ Saved ${chapters.length} chapters to IndexedDB (book: ${bookId})`);
      return true;
    } catch (error) {
      console.error('Error saving chapters:', error);
      return false;
    }
  }

  async deleteChapters(bookId) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('chapters', 'readwrite');
      const store = tx.objectStore('chapters');
      await store.delete(bookId);
      await tx.done;
      console.log(`🗑️ Deleted chapters for book ${bookId}`);
      return true;
    } catch (error) {
      console.error('Error deleting chapters:', error);
      return false;
    }
  }

  // ==================== QUIZZES ====================

  async getQuiz(bookId, chapterId) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const result = await store.get([bookId, chapterId]);
      return result || null;
    } catch (error) {
      console.error('Error getting quiz:', error);
      return null;
    }
  }

  async saveQuiz(bookId, chapterId, quizData) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('quizzes', 'readwrite');
      const store = tx.objectStore('quizzes');
      await store.put({
        bookId,
        chapterId,
        ...quizData
      });
      await tx.done;
      console.log(`✅ Saved quiz to IndexedDB (${bookId}/${chapterId}, ${quizData.questions?.length || 0} questions)`);
      return true;
    } catch (error) {
      console.error('Error saving quiz:', error);
      return false;
    }
  }

  async deleteQuiz(bookId, chapterId) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('quizzes', 'readwrite');
      const store = tx.objectStore('quizzes');
      await store.delete([bookId, chapterId]);
      await tx.done;
      console.log(`🗑️ Deleted quiz (${bookId}/${chapterId})`);
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
  }

  // ==================== EXAMS ====================

  async getExams(level) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('exams', 'readonly');
      const store = tx.objectStore('exams');
      const index = store.index('level');
      const exams = await index.getAll(level);
      return exams.length > 0 ? exams.map(e => ({
        id: e.examId,
        title: e.title,
        date: e.date,
        status: e.status,
        imageUrl: e.imageUrl
      })) : null;
    } catch (error) {
      console.error('Error getting exams:', error);
      return null;
    }
  }

  async saveExams(level, exams) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('exams', 'readwrite');
      const store = tx.objectStore('exams');

      // Delete existing exams for this level
      const index = store.index('level');
      const existingExams = await index.getAll(level);
      for (const exam of existingExams) {
        await store.delete([level, exam.examId]);
      }

      // Save new exams (metadata only, questions stored separately)
      for (const exam of exams) {
        await store.put({
          level,
          examId: exam.id,
          title: exam.title,
          date: exam.date,
          status: exam.status,
          imageUrl: exam.imageUrl || ''
        });
      }

      await tx.done;
      console.log(`✅ Saved ${exams.length} exams to IndexedDB (level: ${level})`);
      return true;
    } catch (error) {
      console.error('Error saving exams:', error);
      return false;
    }
  }

  async getLevelConfig(level) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('levelConfigs', 'readonly');
      const store = tx.objectStore('levelConfigs');
      const result = await store.get(level);
      return result ? result.config : null;
    } catch (error) {
      console.error('Error getting level config:', error);
      return null;
    }
  }

  async saveLevelConfig(level, config) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('levelConfigs', 'readwrite');
      const store = tx.objectStore('levelConfigs');
      await store.put({ level, config });
      await tx.done;
      console.log(`✅ Saved level config to IndexedDB (level: ${level})`);
      return true;
    } catch (error) {
      console.error('Error saving level config:', error);
      return false;
    }
  }

  async getExam(level, examId) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('exams', 'readonly');
      const store = tx.objectStore('exams');
      const result = await store.get([level, examId]);
      return result || null;
    } catch (error) {
      console.error('Error getting exam:', error);
      return null;
    }
  }

  async saveExam(level, examId, examData) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('exams', 'readwrite');
      const store = tx.objectStore('exams');
      await store.put({
        level,
        examId,
        ...examData
      });
      await tx.done;
      console.log(`✅ Saved exam to IndexedDB (${level}/${examId})`);
      return true;
    } catch (error) {
      console.error('Error saving exam:', error);
      return false;
    }
  }

  async deleteExam(level, examId) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('exams', 'readwrite');
      const store = tx.objectStore('exams');
      await store.delete([level, examId]);
      await tx.done;
      console.log(`🗑️ Deleted exam (${level}/${examId})`);
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      return false;
    }
  }

  // ==================== BULK OPERATIONS ====================

  async exportAll() {
    if (!(await this.isAvailable())) return null;

    try {
      const data = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        books: {},
        series: {},
        chapters: {},
        quizzes: {},
        exams: {}
      };

      // Export books
      const booksTx = this.db.transaction('books', 'readonly');
      const booksStore = booksTx.objectStore('books');
      const allBooks = await booksStore.getAll();
      for (const book of allBooks) {
        const level = book.level;
        if (!data.books[level]) data.books[level] = [];
        data.books[level].push(book);
      }

      // Export series
      const seriesTx = this.db.transaction('series', 'readonly');
      const seriesStore = seriesTx.objectStore('series');
      const allSeries = await seriesStore.getAll();
      for (const s of allSeries) {
        const level = s.level;
        if (!data.series[level]) data.series[level] = [];
        data.series[level].push(s);
      }

      // Export chapters
      const chaptersTx = this.db.transaction('chapters', 'readonly');
      const chaptersStore = chaptersTx.objectStore('chapters');
      const allChapters = await chaptersStore.getAll();
      for (const ch of allChapters) {
        data.chapters[ch.bookId] = ch.chapters;
      }

      // Export quizzes
      const quizzesTx = this.db.transaction('quizzes', 'readonly');
      const quizzesStore = quizzesTx.objectStore('quizzes');
      const allQuizzes = await quizzesStore.getAll();
      for (const quiz of allQuizzes) {
        const key = `${quiz.bookId}_${quiz.chapterId}`;
        data.quizzes[key] = quiz;
      }

      // Export exams
      const examsTx = this.db.transaction('exams', 'readonly');
      const examsStore = examsTx.objectStore('exams');
      const allExams = await examsStore.getAll();
      for (const exam of allExams) {
        const key = `${exam.level}_${exam.examId}`;
        data.exams[key] = exam;
      }

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async importAll(data) {
    if (!(await this.isAvailable())) return { success: false, error: 'IndexedDB not available' };

    try {
      // Import books
      for (const level in data.books) {
        await this.saveBooks(level, data.books[level]);
      }

      // Import series
      for (const level in data.series) {
        await this.saveSeries(level, data.series[level]);
      }

      // Import chapters
      for (const bookId in data.chapters) {
        await this.saveChapters(bookId, data.chapters[bookId]);
      }

      // Import quizzes
      for (const key in data.quizzes) {
        const quiz = data.quizzes[key];
        await this.saveQuiz(quiz.bookId, quiz.chapterId, quiz);
      }

      // Import exams
      for (const key in data.exams) {
        const exam = data.exams[key];
        await this.saveExam(exam.level, exam.examId, exam);
      }

      console.log('✅ Imported all data to IndexedDB');
      return { success: true, imported: Object.keys(data).length };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllAdminData() {
    if (!(await this.isAvailable())) return 0;

    try {
      let count = 0;

      // Clear books
      const booksTx = this.db.transaction('books', 'readwrite');
      const booksStore = booksTx.objectStore('books');
      await booksStore.clear();
      count++;

      // Clear series
      const seriesTx = this.db.transaction('series', 'readwrite');
      const seriesStore = seriesTx.objectStore('series');
      await seriesStore.clear();
      count++;

      // Clear chapters
      const chaptersTx = this.db.transaction('chapters', 'readwrite');
      const chaptersStore = chaptersTx.objectStore('chapters');
      await chaptersStore.clear();
      count++;

      // Clear quizzes
      const quizzesTx = this.db.transaction('quizzes', 'readwrite');
      const quizzesStore = quizzesTx.objectStore('quizzes');
      await quizzesStore.clear();
      count++;

      // Clear exams
      const examsTx = this.db.transaction('exams', 'readwrite');
      const examsStore = examsTx.objectStore('exams');
      await examsStore.clear();
      count++;

      console.log(`🗑️ Cleared all admin data from IndexedDB (${count} stores)`);
      return count;
    } catch (error) {
      console.error('Error clearing data:', error);
      return 0;
    }
  }

  // ==================== STORAGE INFO ====================

  async getStorageInfo() {
    if (!(await this.isAvailable())) {
      return {
        totalSize: '0 Bytes',
        totalSizeBytes: 0,
        itemCount: 0,
        items: [],
        limit: 'Unlimited (IndexedDB)',
        percentUsed: 0,
        storageType: 'IndexedDB'
      };
    }

    try {
      let totalSize = 0;
      const items = [];

      // Count items in each store
      const stores = ['books', 'series', 'chapters', 'quizzes', 'exams'];
      for (const storeName of stores) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const allItems = await store.getAll();
        const count = allItems.length;
        
        // Estimate size (rough calculation)
        const size = JSON.stringify(allItems).length;
        totalSize += size;
        
        items.push({
          store: storeName,
          count,
          size: this.formatBytes(size)
        });
      }

      return {
        totalSize: this.formatBytes(totalSize),
        totalSizeBytes: totalSize,
        itemCount: items.reduce((sum, item) => sum + item.count, 0),
        items,
        limit: 'Unlimited (IndexedDB)',
        percentUsed: 0, // IndexedDB doesn't have a fixed limit
        storageType: 'IndexedDB'
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Export singleton instance
const indexedDBManager = new IndexedDBManager();
export default indexedDBManager;

