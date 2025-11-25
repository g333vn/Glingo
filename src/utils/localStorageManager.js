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
    this.initPromise = null; // ✅ Lưu promise để có thể await
    this.init();
  }

  // Initialize IndexedDB
  async init() {
    // ✅ Nếu đang init thì return promise hiện tại
    if (this.initPromise) {
      return this.initPromise;
    }

    // ✅ Tạo promise mới
    this.initPromise = (async () => {
      try {
        this.useIndexedDB = await indexedDBManager.init();
        if (this.useIndexedDB) {
          console.log('✅ Using IndexedDB for storage (unlimited capacity)');
        } else {
          console.log('⚠️ IndexedDB not available, using localStorage (5-10 MB limit)');
        }
        return this.useIndexedDB;
      } catch (error) {
        console.warn('IndexedDB initialization failed, using localStorage:', error);
        this.useIndexedDB = false;
        return false;
      }
    })();

    return this.initPromise;
  }

  // ✅ Đảm bảo init() hoàn thành trước khi sử dụng
  async ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise;
    } else {
      await this.init();
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
    // Ensure IndexedDB is initialized
    await this.ensureInitialized();
    
    // Get IndexedDB info (primary)
    if (this.useIndexedDB) {
      const indexedInfo = await indexedDBManager.getStorageInfo();
      if (indexedInfo) {
        // Merge with localStorage info
        const localInfo = this.getLocalStorageInfo();
        return {
          ...indexedInfo,
          indexedDB: true, // ✅ Explicitly mark IndexedDB as available
          localStorage: localInfo,
          storageType: 'IndexedDB (primary) + localStorage (fallback)'
        };
      }
    }

    // Fallback to localStorage only
    const localInfo = this.getLocalStorageInfo();
    return {
      ...localInfo,
      indexedDB: false, // ✅ Explicitly mark IndexedDB as unavailable
      localStorage: localInfo
    };
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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

  // ✅ NEW: Clear books data for a level (force refresh)
  async clearBooks(level) {
    await this.ensureInitialized();
    
    // Clear from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteBooks(level);
    }
    
    // Clear from localStorage
    if (this.storageAvailable) {
      const key = `adminBooks_${level}`;
      localStorage.removeItem(key);
    }
    
    console.log(`🗑️ Cleared books data for level: ${level}`);
    return true;
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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

  // ==================== LESSONS ====================
  
  async getLessons(bookId, chapterId) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getLessons(bookId, chapterId);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminLessons_${bookId}_${chapterId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const lessons = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveLessons(bookId, chapterId, lessons);
        }
        return lessons;
      }
    }

    return null;
  }

  async saveLessons(bookId, chapterId, lessons) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Save to IndexedDB (primary)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveLessons(bookId, chapterId, lessons);
      if (success) {
        // Also save to localStorage for backward compatibility
        if (this.storageAvailable) {
          try {
            const key = `adminLessons_${bookId}_${chapterId}`;
            localStorage.setItem(key, JSON.stringify(lessons));
          } catch (e) {
            console.warn('localStorage full, but data saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // Fallback to localStorage only
    if (this.storageAvailable) {
      try {
        const key = `adminLessons_${bookId}_${chapterId}`;
        localStorage.setItem(key, JSON.stringify(lessons));
        console.log(`✅ Saved ${lessons.length} lessons to localStorage (${key})`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded! Consider using IndexedDB.');
        }
        return false;
      }
    }

    return false;
  }

  async deleteLessons(bookId, chapterId) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteLessons(bookId, chapterId);
    }

    // Delete from localStorage
    if (this.storageAvailable) {
      const key = `adminLessons_${bookId}_${chapterId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== QUIZZES ====================
  
  async getQuiz(bookId, chapterId, lessonId = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Nếu không có lessonId, dùng chapterId làm lessonId (backward compatibility)
    const finalLessonId = lessonId || chapterId;
    
    console.log(`🔍 storageManager.getQuiz(${bookId}, ${chapterId}, ${finalLessonId})`);
    console.log(`   - useIndexedDB: ${this.useIndexedDB}`);
    console.log(`   - storageAvailable: ${this.storageAvailable}`);
    
    // Try IndexedDB first (UNLIMITED STORAGE for large quizzes!)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getQuiz(bookId, chapterId, finalLessonId);
      if (result) {
        console.log(`✅ Found quiz in IndexedDB`);
        return result;
      }
      console.log(`❌ Quiz not found in IndexedDB`);
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      // Try new format first: adminQuiz_bookId_chapterId_lessonId
      let key = `adminQuiz_${bookId}_${chapterId}_${finalLessonId}`;
      let data = localStorage.getItem(key);
      
      // Fallback to old format: adminQuiz_bookId_chapterId (backward compatibility)
      if (!data) {
        key = `adminQuiz_${bookId}_${chapterId}`;
        data = localStorage.getItem(key);
      }
      
      if (data) {
        const quiz = JSON.parse(data);
        console.log(`✅ Found quiz in localStorage`);
        // Sync to IndexedDB for future use (with lessonId)
        if (this.useIndexedDB) {
          await indexedDBManager.saveQuiz(bookId, chapterId, finalLessonId, quiz);
        }
        return quiz;
      }
      console.log(`❌ Quiz not found in localStorage`);
      
      // ✅ DEBUG: List all localStorage keys to see what's stored
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('adminQuiz_'));
      console.log(`📋 localStorage: All quiz keys:`, allKeys);
    }

    console.log(`❌ Quiz not found in any storage`);
    return null;
  }

  async saveQuiz(bookId, chapterId, lessonId, quiz) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Nếu lessonId không được cung cấp, dùng chapterId (backward compatibility)
    const finalLessonId = lessonId || quiz.lessonId || chapterId;
    
    console.log(`💾 storageManager.saveQuiz(${bookId}, ${chapterId}, ${finalLessonId})`);
    console.log(`   - useIndexedDB: ${this.useIndexedDB}`);
    console.log(`   - storageAvailable: ${this.storageAvailable}`);
    console.log(`   - Quiz title: ${quiz.title || 'N/A'}`);
    console.log(`   - Questions count: ${quiz.questions?.length || 0}`);
    
    // Save to IndexedDB (primary) - UNLIMITED STORAGE!
    // This is CRITICAL for 50 questions/chapter (250 MB total)
    if (this.useIndexedDB) {
      console.log(`💾 Attempting to save to IndexedDB...`);
      const success = await indexedDBManager.saveQuiz(bookId, chapterId, finalLessonId, quiz);
      console.log(`   - IndexedDB save result: ${success ? 'SUCCESS' : 'FAILED'}`);
      if (success) {
        // Try to save to localStorage for backward compatibility
        // But don't fail if localStorage is full (IndexedDB has it)
        if (this.storageAvailable) {
          try {
            const key = `adminQuiz_${bookId}_${chapterId}_${finalLessonId}`;
            localStorage.setItem(key, JSON.stringify(quiz));
            console.log(`✅ Also saved to localStorage: ${key}`);
          } catch (e) {
            // localStorage might be full, that's OK - IndexedDB has it
            console.warn('⚠️ localStorage full, but quiz saved to IndexedDB');
          }
        }
        console.log(`✅ Quiz saved successfully to IndexedDB`);
        return true;
      } else {
        console.log(`❌ Failed to save to IndexedDB, trying localStorage fallback...`);
      }
    }

    // Fallback to localStorage only (might fail if too large)
    if (this.storageAvailable) {
      try {
        const key = `adminQuiz_${bookId}_${chapterId}_${finalLessonId}`;
        console.log(`💾 Attempting to save to localStorage with key: ${key}`);
        localStorage.setItem(key, JSON.stringify(quiz));
        console.log(`✅ Saved quiz to localStorage (${key}, ${quiz.questions?.length || 0} questions)`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded! Quiz too large. Need IndexedDB.');
          alert('⚠️ Quiz quá lớn! localStorage không đủ dung lượng. Vui lòng sử dụng IndexedDB.');
        } else {
          console.error('❌ Error saving to localStorage:', e);
        }
        return false;
      }
    }

    console.error('❌ Cannot save quiz: IndexedDB not available and localStorage not available');
    return false;
  }

  async getAllQuizzes() {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();

    // Try IndexedDB first
    if (this.useIndexedDB) {
      const quizzes = await indexedDBManager.getAllQuizzes();
      if (quizzes && quizzes.length > 0) {
        return quizzes;
      }
    }

    // Fallback to localStorage
    const allQuizzes = [];
    if (this.storageAvailable) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('adminQuiz_')) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const quiz = JSON.parse(data);
              // Extract bookId, chapterId, lessonId from key format
              // New format: adminQuiz_bookId_chapterId_lessonId
              // Old format: adminQuiz_bookId_chapterId
              const parts = key.replace('adminQuiz_', '').split('_');
              if (parts.length >= 2) {
                const bookId = parts[0];
                const chapterId = parts[1];
                const lessonId = parts.length >= 3 ? parts.slice(2).join('_') : chapterId; // Fallback to chapterId
                allQuizzes.push({
                  bookId,
                  chapterId,
                  lessonId,
                  ...quiz
                });
              }
            }
          } catch (e) {
            console.warn(`Error parsing quiz from key ${key}:`, e);
          }
        }
      }
    }

    return allQuizzes;
  }

  async deleteQuiz(bookId, chapterId, lessonId = null) {
    // Nếu không có lessonId, dùng chapterId (backward compatibility)
    const finalLessonId = lessonId || chapterId;
    
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteQuiz(bookId, chapterId, finalLessonId);
    }

    // Delete from localStorage (both old and new format)
    if (this.storageAvailable) {
      // Delete new format
      const newKey = `adminQuiz_${bookId}_${chapterId}_${finalLessonId}`;
      localStorage.removeItem(newKey);
      
      // Delete old format (backward compatibility)
      const oldKey = `adminQuiz_${bookId}_${chapterId}`;
      localStorage.removeItem(oldKey);
      
      console.log(`🗑️ Deleted quiz keys: ${newKey}, ${oldKey}`);
    }
  }

  // ==================== JLPT EXAMS ====================
  
  async getExams(level) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getExams(level);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminExams_${level}`;
      const data = localStorage.getItem(key);
      if (data) {
        const exams = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveExams(level, exams);
        }
        return exams;
      }
    }

    return null;
  }

  async saveExams(level, exams) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Save to IndexedDB (primary)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveExams(level, exams);
      if (success) {
        // Also save to localStorage if possible
        if (this.storageAvailable) {
          try {
            const key = `adminExams_${level}`;
            localStorage.setItem(key, JSON.stringify(exams));
          } catch (e) {
            console.warn('localStorage full, but exams saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      try {
        const key = `adminExams_${level}`;
        localStorage.setItem(key, JSON.stringify(exams));
        console.log(`✅ Saved exams to localStorage (${key})`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded!');
        }
        return false;
      }
    }

    return false;
  }

  async getLevelConfig(level) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getLevelConfig(level);
      if (result) return result;
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminLevelConfig_${level}`;
      const data = localStorage.getItem(key);
      if (data) {
        const config = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveLevelConfig(level, config);
        }
        return config;
      }
    }

    return null;
  }

  async saveLevelConfig(level, config) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Save to IndexedDB (primary)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveLevelConfig(level, config);
      if (success) {
        // Also save to localStorage if possible
        if (this.storageAvailable) {
          try {
            const key = `adminLevelConfig_${level}`;
            localStorage.setItem(key, JSON.stringify(config));
          } catch (e) {
            console.warn('localStorage full, but config saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // Fallback to localStorage
    if (this.storageAvailable) {
      try {
        const key = `adminLevelConfig_${level}`;
        localStorage.setItem(key, JSON.stringify(config));
        console.log(`✅ Saved level config to localStorage (${key})`);
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage quota exceeded!');
        }
        return false;
      }
    }

    return false;
  }
  
  async getExam(level, examId) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
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

  // ✅ NEW: Export data for a specific level
  async exportLevel(level) {
    // Try IndexedDB first
    if (this.useIndexedDB) {
      const indexedData = await indexedDBManager.exportLevel(level);
      if (indexedData) {
        return indexedData;
      }
    }

    // Fallback to localStorage only
    return this.exportLevelFromLocalStorage(level);
  }

  // ✅ NEW: Export data by date range
  async exportByDateRange(startDate, endDate, dataTypes = ['all'], includeRelated = false, includeUsers = false, includeUserPasswords = false) {
    // Try IndexedDB first (has metadata)
    if (this.useIndexedDB) {
      const indexedData = await indexedDBManager.exportByDateRange(startDate, endDate, dataTypes, includeRelated, includeUsers, includeUserPasswords);
      if (indexedData) {
        return indexedData;
      }
    }

    // Fallback: return null (localStorage doesn't have metadata)
    console.warn('exportByDateRange requires IndexedDB with metadata. Please use IndexedDB.');
    return null;
  }

  // ✅ NEW: Export users
  exportUsers(includePassword = false) {
    return indexedDBManager.exportUsers(includePassword);
  }

  exportLevelFromLocalStorage(level) {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      level: level,
      books: [],
      series: [],
      chapters: {},
      lessons: {},
      quizzes: {},
      exams: {},
      levelConfigs: {}
    };

    if (!this.storageAvailable) return data;

    // Export books for this level
    const booksKey = `adminBooks_${level}`;
    const books = localStorage.getItem(booksKey);
    if (books) {
      try {
        data.books = JSON.parse(books);
      } catch (e) {
        console.warn(`Failed to parse books for ${level}:`, e);
      }
    }

    // Export series for this level
    const seriesKey = `adminSeries_${level}`;
    const series = localStorage.getItem(seriesKey);
    if (series) {
      try {
        data.series = JSON.parse(series);
      } catch (e) {
        console.warn(`Failed to parse series for ${level}:`, e);
      }
    }

    // Export chapters for books in this level
    if (data.books && Array.isArray(data.books)) {
      for (const book of data.books) {
        const chaptersKey = `adminChapters_${book.id}`;
        const chapters = localStorage.getItem(chaptersKey);
        if (chapters) {
          try {
            data.chapters[book.id] = JSON.parse(chapters);
          } catch (e) {
            console.warn(`Failed to parse chapters for ${book.id}:`, e);
          }
        }
      }
    }

    // Export lessons for books in this level
    if (data.books && Array.isArray(data.books)) {
      for (const book of data.books) {
        // Get chapters first
        const chapters = data.chapters[book.id] || [];
        for (const chapter of chapters) {
          const lessonsKey = `adminLessons_${book.id}_${chapter.id}`;
          const lessons = localStorage.getItem(lessonsKey);
          if (lessons) {
            try {
              data.lessons[`${book.id}_${chapter.id}`] = JSON.parse(lessons);
            } catch (e) {
              console.warn(`Failed to parse lessons for ${book.id}_${chapter.id}:`, e);
            }
          }
        }
      }
    }

    // Export quizzes for books in this level
    if (data.books && Array.isArray(data.books)) {
      for (const book of data.books) {
        const chapters = data.chapters[book.id] || [];
        for (const chapter of chapters) {
          const lessons = data.lessons[`${book.id}_${chapter.id}`] || [];
          for (const lesson of lessons) {
            const quizKey = `adminQuiz_${book.id}_${chapter.id}_${lesson.id}`;
            const quiz = localStorage.getItem(quizKey);
            if (quiz) {
              try {
                data.quizzes[`${book.id}_${chapter.id}_${lesson.id}`] = JSON.parse(quiz);
              } catch (e) {
                console.warn(`Failed to parse quiz for ${book.id}_${chapter.id}_${lesson.id}:`, e);
              }
            }
          }
        }
      }
    }

    return data;
  }

  exportAllFromLocalStorage() {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      books: {},
      series: {},
      chapters: {},
      quizzes: {},
      exams: {},
      levelConfigs: {}
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
          } else if (key.startsWith('adminExams_')) {
            const level = key.replace('adminExams_', '');
            // Exams metadata is stored separately, but we'll include it in export
            if (!data.exams) data.exams = {};
            // Note: This is metadata only, full exam data is in adminExam_ keys
          } else if (key.startsWith('adminLevelConfig_')) {
            const level = key.replace('adminLevelConfig_', '');
            data.levelConfigs[level] = value;
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

    // Merge level configs
    if (localData.levelConfigs) {
      Object.assign(indexedData.levelConfigs || {}, localData.levelConfigs);
    }

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

      // Import level configs
      if (data.levelConfigs) {
        for (const level in data.levelConfigs) {
          const key = `adminLevelConfig_${level}`;
          try {
            localStorage.setItem(key, JSON.stringify(data.levelConfigs[level]));
            imported++;
          } catch (e) {
            console.warn(`Failed to import level config for ${level}:`, e);
          }
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

  // ✅ NEW: Export a specific Series
  async exportSeries(level, seriesId) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportSeries(level, seriesId);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  // ✅ NEW: Export a specific Book
  async exportBook(level, bookId) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportBook(level, bookId);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  // ✅ NEW: Export a specific Chapter
  async exportChapter(bookId, chapterId) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportChapter(bookId, chapterId);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  // ✅ NEW: Export a specific Lesson
  async exportLesson(bookId, chapterId, lessonId) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportLesson(bookId, chapterId, lessonId);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  // ✅ NEW: Export a specific Quiz
  async exportQuiz(bookId, chapterId, lessonId) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportQuiz(bookId, chapterId, lessonId);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  // ✅ NEW: Export exam functions
  async exportExam(level, examId) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportExam(level, examId);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  async exportExamByYear(level, year) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportExamByYear(level, year);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  async exportExamSection(level, examId, sectionType) {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportExamSection(level, examId, sectionType);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return null;
  }

  // ✅ NEW: Import a specific item
  async importItem(data) {
    if (this.useIndexedDB) {
      return await indexedDBManager.importItem(data);
    }
    // Fallback: Not implemented for localStorage (too complex)
    return { success: false, error: 'IndexedDB required for item import' };
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

// Export helper to check if IndexedDB is being used
export const isUsingIndexedDB = () => storageManager.useIndexedDB;

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
  getLessons,
  saveLessons,
  deleteLessons,
  getQuiz,
  saveQuiz,
  deleteQuiz,
  getExam,
  saveExam,
  deleteExam,
  exportAll,
  exportLevel,
  exportSeries,
  exportBook,
  exportChapter,
  exportLesson,
  exportQuiz,
  exportByDateRange,
  importAll,
  importLevel,
  importItem,
  clearAllAdminData,
  clearAll,
  getStorageInfo
} = storageManager;

