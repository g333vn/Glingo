// src/utils/localStorageManager.js
// 💾 Unified Local Storage Manager - Quản lý TẤT CẢ dữ liệu local

/**
 * LocalStorage Keys Convention:
 * - adminBooks_{level}     - Books metadata
 * - adminSeries_{level}    - Book series
 * - adminChapters_{bookId} - Chapters for each book
 * - adminQuizzes_{bookId}_{chapterId} - Quiz questions
 * - adminExams_{level}_{examId} - JLPT exam questions
 * - authUser               - User authentication
 * - jlpt_{level}_{examId}_{section} - Exam progress
 */

class LocalStorageManager {
  constructor() {
    this.storageAvailable = this.checkStorageAvailable();
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
  getStorageInfo() {
    if (!this.storageAvailable) return null;

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
      items: items.sort((a, b) => b.size - a.size),
      limit: '5-10 MB (browser dependent)',
      percentUsed: Math.round((totalSize / (5 * 1024 * 1024)) * 100) // Assume 5MB limit
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
  
  getBooks(level) {
    const key = `adminBooks_${level}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveBooks(level, books) {
    const key = `adminBooks_${level}`;
    localStorage.setItem(key, JSON.stringify(books));
    console.log(`✅ Saved ${books.length} books to ${key}`);
  }

  deleteBooks(level) {
    const key = `adminBooks_${level}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted ${key}`);
  }

  // ==================== SERIES ====================
  
  getSeries(level) {
    const key = `adminSeries_${level}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveSeries(level, series) {
    const key = `adminSeries_${level}`;
    localStorage.setItem(key, JSON.stringify(series));
    console.log(`✅ Saved ${series.length} series to ${key}`);
  }

  deleteSeries(level) {
    const key = `adminSeries_${level}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted ${key}`);
  }

  // ==================== CHAPTERS ====================
  
  getChapters(bookId) {
    const key = `adminChapters_${bookId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveChapters(bookId, chapters) {
    const key = `adminChapters_${bookId}`;
    localStorage.setItem(key, JSON.stringify(chapters));
    console.log(`✅ Saved ${chapters.length} chapters to ${key}`);
  }

  deleteChapters(bookId) {
    const key = `adminChapters_${bookId}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted ${key}`);
  }

  // ==================== QUIZZES ====================
  
  getQuiz(bookId, chapterId) {
    const key = `adminQuiz_${bookId}_${chapterId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveQuiz(bookId, chapterId, quiz) {
    const key = `adminQuiz_${bookId}_${chapterId}`;
    localStorage.setItem(key, JSON.stringify(quiz));
    console.log(`✅ Saved quiz to ${key} (${quiz.questions?.length || 0} questions)`);
  }

  deleteQuiz(bookId, chapterId) {
    const key = `adminQuiz_${bookId}_${chapterId}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted ${key}`);
  }

  // ==================== JLPT EXAMS ====================
  
  getExam(level, examId) {
    const key = `adminExam_${level}_${examId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveExam(level, examId, examData) {
    const key = `adminExam_${level}_${examId}`;
    localStorage.setItem(key, JSON.stringify(examData));
    console.log(`✅ Saved exam to ${key}`);
  }

  deleteExam(level, examId) {
    const key = `adminExam_${level}_${examId}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted ${key}`);
  }

  // ==================== BULK OPERATIONS ====================
  
  // Export ALL data to JSON
  exportAll() {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      books: {},
      series: {},
      chapters: {},
      quizzes: {},
      exams: {}
    };

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          
          if (key.startsWith('adminBooks_')) {
            data.books[key] = value;
          } else if (key.startsWith('adminSeries_')) {
            data.series[key] = value;
          } else if (key.startsWith('adminChapters_')) {
            data.chapters[key] = value;
          } else if (key.startsWith('adminQuiz_')) {
            data.quizzes[key] = value;
          } else if (key.startsWith('adminExam_')) {
            data.exams[key] = value;
          }
        } catch (e) {
          console.warn(`Failed to parse ${key}:`, e);
        }
      }
    }

    return data;
  }

  // Import data from JSON
  importAll(data) {
    let imported = 0;
    
    try {
      // Import books
      for (let key in data.books) {
        localStorage.setItem(key, JSON.stringify(data.books[key]));
        imported++;
      }

      // Import series
      for (let key in data.series) {
        localStorage.setItem(key, JSON.stringify(data.series[key]));
        imported++;
      }

      // Import chapters
      for (let key in data.chapters) {
        localStorage.setItem(key, JSON.stringify(data.chapters[key]));
        imported++;
      }

      // Import quizzes
      for (let key in data.quizzes) {
        localStorage.setItem(key, JSON.stringify(data.quizzes[key]));
        imported++;
      }

      // Import exams
      for (let key in data.exams) {
        localStorage.setItem(key, JSON.stringify(data.exams[key]));
        imported++;
      }

      console.log(`✅ Imported ${imported} items`);
      return { success: true, imported };
    } catch (e) {
      console.error('Import failed:', e);
      return { success: false, error: e.message };
    }
  }

  // Clear ALL admin data (keep user auth & progress)
  clearAllAdminData() {
    const keysToRemove = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        if (key.startsWith('admin')) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keysToRemove.length} admin data items`);
    return keysToRemove.length;
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

