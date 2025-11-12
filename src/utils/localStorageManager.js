// src/utils/localStorageManager.js
// 💾 Unified Storage Manager - IndexedDB (primary) + localStorage (fallback)
// ✅ Supports unlimited storage via IndexedDB (>100 MB)

import indexedDBManager from './indexedDBManager.js';

/**
 * Storage Strategy:
 * 1. Try IndexedDB first (unlimited storage)
 * 2. Fallback to localStorage (5-10 MB limit)
 * 3. Sync between both for backward compatibility
 */

class LocalStorageManager {
  constructor() {
    this.storageAvailable = this.checkStorageAvailable();
    this.useIndexedDB = false;
    this.init();
  }

  // Initialize IndexedDB
  async init() {
    try {
      this.useIndexedDB = await indexedDBManager.init();
      if (this.useIndexedDB) {
        console.log('✅ Using IndexedDB for storage (unlimited capacity)');
      } else {
        console.log('⚠️ IndexedDB not available, using localStorage (5-10 MB limit)');
      }
    } catch (error) {
      console.warn('IndexedDB initialization failed, using localStorage:', error);
      this.useIndexedDB = false;
    }
  }

  // ✅ Check if localStorage is available
  checkStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('localStorage is not available:', e);
      return false;
    }
  }

  // ✅ Get storage info
  async getStorageInfo() {
    // Get IndexedDB info (primary)
    if (this.useIndexedDB) {
      const indexedInfo = await indexedDBManager.getStorageInfo();
      if (indexedInfo) {
        // Merge with localStorage info
        const localInfo = this.getLocalStorageInfo();
        return {
          ...indexedInfo,
          localStorage: localInfo,
          storageType: 'IndexedDB (primary) + localStorage (fallback)'
        };
      }
    }

    // Fallback to localStorage only
    return this.getLocalStorageInfo();
  }

  getLocalStorageInfo() {
    if (!this.storageAvailable) {
      return {
        totalSize: '0 Bytes',
        totalSizeBytes: 0,
        itemCount: 0,
        items: [],
        limit: '5-10 MB (browser dependent)',
        percentUsed: 0,
        storageType: 'localStorage only'
      };
    }

    let totalSize = 0;
    const items = [];

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        totalSize += size;
        items.push({ key, size: this.formatBytes(size) });
      }
    }

    return {
      totalSize: this.formatBytes(totalSize),
      totalSizeBytes: totalSize,
      itemCount: items.length,
      items: items.sort((a, b) => {
        const sizeA = parseInt(a.size) || 0;
        const sizeB = parseInt(b.size) || 0;
        return sizeB - sizeA;
      }),
      limit: '5-10 MB (browser dependent)',
      percentUsed: Math.round((totalSize / (5 * 1024 * 1024)) * 100), // Assume 5MB limit
      storageType: 'localStorage only'
    };
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // ==================== BOOKS ====================
  
  async getBooks(level) {
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getBooks(level);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminBooks_${level}`;
      const data = localStorage.getItem(key);
      if (data) {
        const books = JSON.parse(data);
        // Sync to IndexedDB for future use
        if (this.useIndexedDB) {
          await indexedDBManager.saveBooks(level, books);
        }
        return books;
      }
    }

    return null;
  }

  async saveBooks(level, books) {
    // Save to IndexedDB (primary)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveBooks(level, books);
      if (success) {
        // Also save to localStorage for backward compatibility
        if (this.storageAvailable) {
          const key = `adminBooks_${level}`;
          localStorage.setItem(key, JSON.stringify(books));
        }
        return true;
      }
    }

    // Fallback to localStorage only
    if (this.storageAvailable) {
      const key = `adminBooks_${level}`;
      localStorage.setItem(key, JSON.stringify(books));
      console.log(`✅ Saved ${books.length} books to localStorage (${key})`);
      return true;
    }

    return false;
  }

  async deleteBooks(level) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteBooks(level);
    }

    // Delete from localStorage
    if (this.storageAvailable) {
      const key = `adminBooks_${level}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== SERIES ====================
  
  async getSeries(level) {
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getSeries(level);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminSeries_${level}`;
      const data = localStorage.getItem(key);
      if (data) {
        const series = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveSeries(level, series);
        }
        return series;
      }
    }

    return null;
  }

  async saveSeries(level, series) {
    // Save to IndexedDB (primary)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveSeries(level, series);
      if (success) {
        // Also save to localStorage
        if (this.storageAvailable) {
          const key = `adminSeries_${level}`;
          localStorage.setItem(key, JSON.stringify(series));
        }
        return true;
      }
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminSeries_${level}`;
      localStorage.setItem(key, JSON.stringify(series));
      console.log(`✅ Saved ${series.length} series to localStorage (${key})`);
      return true;
    }

    return false;
  }

  async deleteSeries(level) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteSeries(level);
    }

    // Delete from localStorage
    if (this.storageAvailable) {
      const key = `adminSeries_${level}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== CHAPTERS ====================
  
  async getChapters(bookId) {
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getChapters(bookId);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminChapters_${bookId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const chapters = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveChapters(bookId, chapters);
        }
        return chapters;
      }
    }

    return null;
  }

  async saveChapters(bookId, chapters) {
    // Save to IndexedDB (primary) - UNLIMITED STORAGE!
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveChapters(bookId, chapters);
      if (success) {
        // Also save to localStorage for backward compatibility
        if (this.storageAvailable) {
          try {
            const key = `adminChapters_${bookId}`;
            localStorage.setItem(key, JSON.stringify(chapters));
          } catch (e) {
            // localStorage might be full, that's OK - IndexedDB has it
            console.warn('localStorage full, but data saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // Fallback to localStorage only
    if (this.storageAvailable) {
      try {
        const key = `adminChapters_${bookId}`;
        localStorage.setItem(key, JSON.stringify(chapters));
        console.log(`✅ Saved ${chapters.length} chapters to localStorage (${key})`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded! Consider using IndexedDB.');
          alert('⚠️ Dung lượng localStorage đã đầy! Vui lòng xóa dữ liệu cũ hoặc export ra file.');
        }
        return false;
      }
    }

    return false;
  }

  async deleteChapters(bookId) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteChapters(bookId);
    }

    // Delete from localStorage
    if (this.storageAvailable) {
      const key = `adminChapters_${bookId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== QUIZZES ====================
  
  async getQuiz(bookId, chapterId) {
    // Try IndexedDB first (UNLIMITED STORAGE for large quizzes!)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getQuiz(bookId, chapterId);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminQuiz_${bookId}_${chapterId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const quiz = JSON.parse(data);
        // Sync to IndexedDB for future use
        if (this.useIndexedDB) {
          await indexedDBManager.saveQuiz(bookId, chapterId, quiz);
        }
        return quiz;
      }
    }

    return null;
  }

  async saveQuiz(bookId, chapterId, quiz) {
    // Save to IndexedDB (primary) - UNLIMITED STORAGE!
    // This is CRITICAL for 50 questions/chapter (250 MB total)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveQuiz(bookId, chapterId, quiz);
      if (success) {
        // Try to save to localStorage for backward compatibility
        // But don't fail if localStorage is full (IndexedDB has it)
        if (this.storageAvailable) {
          try {
            const key = `adminQuiz_${bookId}_${chapterId}`;
            localStorage.setItem(key, JSON.stringify(quiz));
          } catch (e) {
            // localStorage might be full, that's OK - IndexedDB has it
            console.warn('localStorage full, but quiz saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // Fallback to localStorage only (might fail if too large)
    if (this.storageAvailable) {
      try {
        const key = `adminQuiz_${bookId}_${chapterId}`;
        localStorage.setItem(key, JSON.stringify(quiz));
        console.log(`✅ Saved quiz to localStorage (${key}, ${quiz.questions?.length || 0} questions)`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded! Quiz too large. Need IndexedDB.');
          alert('⚠️ Quiz quá lớn! localStorage không đủ dung lượng. Vui lòng sử dụng IndexedDB.');
        }
        return false;
      }
    }

    return false;
  }

  async deleteQuiz(bookId, chapterId) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteQuiz(bookId, chapterId);
    }

    // Delete from localStorage
    if (this.storageAvailable) {
      const key = `adminQuiz_${bookId}_${chapterId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== JLPT EXAMS ====================
  
  async getExam(level, examId) {
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getExam(level, examId);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminExam_${level}_${examId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const exam = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveExam(level, examId, exam);
        }
        return exam;
      }
    }

    return null;
  }

  async saveExam(level, examId, examData) {
    // Save to IndexedDB (primary)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveExam(level, examId, examData);
      if (success) {
        // Also save to localStorage if possible
        if (this.storageAvailable) {
          try {
            const key = `adminExam_${level}_${examId}`;
            localStorage.setItem(key, JSON.stringify(examData));
          } catch (e) {
            console.warn('localStorage full, but exam saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      try {
        const key = `adminExam_${level}_${examId}`;
        localStorage.setItem(key, JSON.stringify(examData));
        console.log(`✅ Saved exam to localStorage (${key})`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded!');
          alert('⚠️ Exam quá lớn! localStorage không đủ. Cần IndexedDB.');
        }
        return false;
      }
    }

    return false;
  }

  async deleteExam(level, examId) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteExam(level, examId);
    }

    // Delete from localStorage
    if (this.storageAvailable) {
      const key = `adminExam_${level}_${examId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== BULK OPERATIONS ====================
  
  // Export ALL data to JSON
  async exportAll() {
    // Try IndexedDB first (has all data)
    if (this.useIndexedDB) {
      const indexedData = await indexedDBManager.exportAll();
      if (indexedData) {
        // Merge with localStorage data (if any)
        const localData = this.exportAllFromLocalStorage();
        return this.mergeExportData(indexedData, localData);
      }
    }

    // Fallback to localStorage only
    return this.exportAllFromLocalStorage();
  }

  exportAllFromLocalStorage() {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      books: {},
      series: {},
      chapters: {},
      quizzes: {},
      exams: {}
    };

    if (!this.storageAvailable) return data;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          
          if (key.startsWith('adminBooks_')) {
            const level = key.replace('adminBooks_', '');
            if (!data.books[level]) data.books[level] = [];
            data.books[level] = value;
          } else if (key.startsWith('adminSeries_')) {
            const level = key.replace('adminSeries_', '');
            if (!data.series[level]) data.series[level] = [];
            data.series[level] = value;
          } else if (key.startsWith('adminChapters_')) {
            const bookId = key.replace('adminChapters_', '');
            data.chapters[bookId] = value;
          } else if (key.startsWith('adminQuiz_')) {
            const parts = key.replace('adminQuiz_', '').split('_');
            const bookId = parts[0];
            const chapterId = parts.slice(1).join('_');
            data.quizzes[`${bookId}_${chapterId}`] = value;
          } else if (key.startsWith('adminExam_')) {
            const parts = key.replace('adminExam_', '').split('_');
            const level = parts[0];
            const examId = parts.slice(1).join('_');
            data.exams[`${level}_${examId}`] = value;
          }
        } catch (e) {
          console.warn(`Failed to parse ${key}:`, e);
        }
      }
    }

    return data;
  }

  mergeExportData(indexedData, localData) {
    // Merge books
    for (const level in localData.books) {
      if (!indexedData.books[level]) {
        indexedData.books[level] = localData.books[level];
      }
    }

    // Merge series
    for (const level in localData.series) {
      if (!indexedData.series[level]) {
        indexedData.series[level] = localData.series[level];
      }
    }

    // Merge chapters
    Object.assign(indexedData.chapters, localData.chapters);

    // Merge quizzes
    Object.assign(indexedData.quizzes, localData.quizzes);

    // Merge exams
    Object.assign(indexedData.exams, localData.exams);

    return indexedData;
  }

  // Import data from JSON
  async importAll(data) {
    // Try IndexedDB first (can handle large data)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.importAll(data);
      if (result.success) {
        // Also import to localStorage if possible (for backward compatibility)
        this.importAllToLocalStorage(data);
        return result;
      }
    }

    // Fallback to localStorage only
    return this.importAllToLocalStorage(data);
  }

  importAllToLocalStorage(data) {
    let imported = 0;
    
    if (!this.storageAvailable) {
      return { success: false, error: 'localStorage not available' };
    }

    try {
      // Import books
      for (const level in data.books) {
        const key = `adminBooks_${level}`;
        try {
          localStorage.setItem(key, JSON.stringify(data.books[level]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import books for ${level}:`, e);
        }
      }

      // Import series
      for (const level in data.series) {
        const key = `adminSeries_${level}`;
        try {
          localStorage.setItem(key, JSON.stringify(data.series[level]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import series for ${level}:`, e);
        }
      }

      // Import chapters
      for (const bookId in data.chapters) {
        const key = `adminChapters_${bookId}`;
        try {
          localStorage.setItem(key, JSON.stringify(data.chapters[bookId]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import chapters for ${bookId}:`, e);
        }
      }

      // Import quizzes
      for (const key in data.quizzes) {
        const storageKey = `adminQuiz_${key}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.quizzes[key]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import quiz ${key}:`, e);
        }
      }

      // Import exams
      for (const key in data.exams) {
        const storageKey = `adminExam_${key}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.exams[key]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import exam ${key}:`, e);
        }
      }

      console.log(`✅ Imported ${imported} items to localStorage`);
      return { success: true, imported };
    } catch (e) {
      console.error('Import failed:', e);
      return { success: false, error: e.message };
    }
  }

  // Clear ALL admin data (keep user auth & progress)
  async clearAllAdminData() {
    let count = 0;

    // Clear from IndexedDB
    if (this.useIndexedDB) {
      count = await indexedDBManager.clearAllAdminData();
    }

    // Clear from localStorage
    if (this.storageAvailable) {
      const keysToRemove = [];
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('admin')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      count += keysToRemove.length;
      console.log(`🗑️ Cleared ${keysToRemove.length} items from localStorage`);
    }

    return count;
  }

  // Clear EVERYTHING (including user auth)
  clearAll() {
    const count = localStorage.length;
    localStorage.clear();
    console.log(`🗑️ Cleared ALL localStorage (${count} items)`);
    return count;
  }

  // ==================== COMPRESSION ====================
  
  // Compress data before saving (for large content)
  compressAndSave(key, data) {
    try {
      // Simple compression: Remove whitespace from JSON
      const compressed = JSON.stringify(data);
      localStorage.setItem(key, compressed);
      console.log(`✅ Saved compressed data to ${key}`);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('❌ localStorage quota exceeded!');
        alert('⚠️ Dung lượng localStorage đã đầy! Vui lòng xóa dữ liệu cũ hoặc export ra file.');
      }
      return false;
    }
  }
}

// Export singleton instance
const storageManager = new LocalStorageManager();
export default storageManager;

// Export helper functions
export const {
  getBooks,
  saveBooks,
  deleteBooks,
  getSeries,
  saveSeries,
  deleteSeries,
  getChapters,
  saveChapters,
  deleteChapters,
  getQuiz,
  saveQuiz,
  deleteQuiz,
  getExam,
  saveExam,
  deleteExam,
  exportAll,
  importAll,
  clearAllAdminData,
  clearAll,
  getStorageInfo
} = storageManager;

