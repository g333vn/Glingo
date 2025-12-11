// src/utils/localStorageManager.js
// 💾 Unified Storage Manager - Supabase (cloud) + IndexedDB (cache) + localStorage (fallback)
// ✅ Supports unlimited storage via IndexedDB (>100 MB)
// ✅ Cloud sync via Supabase

import indexedDBManager from './indexedDBManager.js';
import * as contentService from '../services/contentService.js';
import * as examService from '../services/examService.js';

/**
 * Storage Strategy:
 * 1. Try Supabase first (cloud, multi-device sync)
 * 2. Fallback to IndexedDB (local cache, unlimited storage)
 * 3. Fallback to localStorage (5-10 MB limit)
 * 4. Sync between all for backward compatibility
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
    
    console.log('[StorageManager.getBooks] 🔍 Loading books for level:', level);

    // 1. Try Supabase first (cloud) - nguồn dữ liệu "chuẩn"
    try {
      const { success, data } = await contentService.getBooks(level);

      if (success) {
        const supaBooks = Array.isArray(data) ? data : [];

        if (supaBooks.length > 0) {
          // ✅ Có dữ liệu trên server → dùng server làm nguồn chính
          console.log('[StorageManager.getBooks] ✅ Loaded', supaBooks.length, 'books from Supabase');

          // Cache to IndexedDB for offline support
          if (this.useIndexedDB) {
            await indexedDBManager.saveBooks(level, supaBooks);
          }

          // Also cache to localStorage
          if (this.storageAvailable) {
            const key = `adminBooks_${level}`;
            localStorage.setItem(key, JSON.stringify(supaBooks));
          }

          return supaBooks;
        }

        // ✅ Supabase trả về RỖNG (server hiện không có sách nào)
        //    → Xoá cache local/IndexedDB để client đồng bộ với server
        console.log('[StorageManager.getBooks] ℹ️ Supabase has 0 books for level', level, '- clearing local caches');

        if (this.useIndexedDB) {
          await indexedDBManager.saveBooks(level, []); // xoá tất cả books level này trong IndexedDB
        }

        if (this.storageAvailable) {
          const key = `adminBooks_${level}`;
          localStorage.removeItem(key);
        }

        // Trả về mảng rỗng, KHÔNG fallback sang cache cũ nữa
        return [];
      }

      console.log('[StorageManager.getBooks] ⚠️ Supabase request not successful, will try local caches');
    } catch (err) {
      console.warn('[StorageManager.getBooks] ❌ Supabase getBooks failed, trying local:', err);
    }
    
    // 2. Try IndexedDB (local cache)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getBooks(level);
      if (result && result.length > 0) {
        console.log('[StorageManager.getBooks] ✅ Loaded', result.length, 'books from IndexedDB');
        return result;
      }
    }

    // 3. Fallback to localStorage
    if (this.storageAvailable) {
      const key = `adminBooks_${level}`;
      const data = localStorage.getItem(key);
      if (data) {
        const books = JSON.parse(data);
        console.log('[StorageManager.getBooks] ✅ Loaded', books.length, 'books from localStorage');
        // Sync to IndexedDB for future use
        if (this.useIndexedDB) {
          await indexedDBManager.saveBooks(level, books);
        }
        return books;
      }
    }

    console.log('[StorageManager.getBooks] ❌ No books found anywhere');
    return null;
  }

  async saveBooks(level, books, userId = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // 🔍 DEBUG: Log userId check
    console.log('[StorageManager.saveBooks] userId:', userId, 'isValid:', userId && typeof userId === 'string' && userId.length > 0);
    
    // 1. Save to Supabase if userId provided (admin)
    if (userId) {
      console.log('[StorageManager.saveBooks] 📤 Saving', books.length, 'books to Supabase for level:', level);
      try {
        // Save each book to Supabase
        for (const book of books) {
          console.log('[StorageManager.saveBooks] 💾 Saving book:', book.id, book.title);
          const result = await contentService.saveBook({ ...book, level }, userId);
          if (!result.success) {
            console.warn('[StorageManager] ❌ Failed to save book to Supabase:', book.id, result.error);
          } else {
            console.log('[StorageManager] ✅ Saved book to Supabase:', book.id);
          }
        }
      } catch (err) {
        console.warn('[StorageManager] ❌ Supabase saveBooks failed, continuing with local save:', err);
      }
    } else {
      console.warn('[StorageManager.saveBooks] ⚠️ No userId provided, books will NOT be saved to Supabase!');
    }
    
    // 2. Save to IndexedDB (local cache)
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

    // 3. Fallback to localStorage only
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

    // 1. Try Supabase trước (nếu có level)
    if (level) {
      try {
        const { success, data } = await contentService.getSeries(level);
        if (success && data && data.length > 0) {
          // Cache to IndexedDB
          if (this.useIndexedDB) {
            await indexedDBManager.saveSeries(level, data);
          }
          // Cache to localStorage
          if (this.storageAvailable) {
            const key = `adminSeries_${level}`;
            localStorage.setItem(key, JSON.stringify(data));
          }
          return data;
        }
      } catch (err) {
        console.warn('[StorageManager] Supabase getSeries failed, trying local cache:', err);
      }
    }
    
    // 2. Try IndexedDB (local cache)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getSeries(level);
      if (result) return result;
    }

    // 3. Fallback to localStorage
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

  async saveSeries(level, series, userId = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();

    // 1. Save to Supabase nếu có level + userId (admin)
    if (level && userId) {
      try {
        const result = await contentService.saveSeries(level, series, userId);
        if (!result.success) {
          console.warn('[StorageManager] Failed to save series to Supabase:', result.error);
        } else {
          console.log(`[StorageManager] ✅ Saved ${series.length} series to Supabase for level ${level}`);
        }
      } catch (err) {
        console.warn('[StorageManager] Supabase saveSeries failed, continuing with local save:', err);
      }
    }
    
    // 2. Save to IndexedDB (primary)
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

    // 3. Fallback to localStorage
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
  
  async getChapters(bookId, level = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // 1. Try Supabase first if level provided
    if (level) {
      try {
        const { success, data } = await contentService.getChapters(bookId, level);
        if (success) {
          // ✅ FIXED: Nếu Supabase trả về data (có thể là empty array), dùng data đó
          if (data && data.length > 0) {
            // Cache to IndexedDB
            if (this.useIndexedDB) {
              await indexedDBManager.saveChapters(bookId, data, level);
            }
            // Cache to localStorage
            if (this.storageAvailable) {
              const key = `adminChapters_${level}_${bookId}`;
              localStorage.setItem(key, JSON.stringify(data));
            }
            return data;
          }
          
          // ✅ FIXED: Nếu Supabase trả về empty array (data = []), clear cache cũ và return []
          // Điều này đảm bảo không hiển thị chapters cũ từ cache khi Supabase đã confirm là không có
          if (Array.isArray(data) && data.length === 0) {
            console.log('[StorageManager.getChapters] ℹ️ Supabase returned empty array - clearing old cache');
            // Clear IndexedDB cache
            if (this.useIndexedDB) {
              await indexedDBManager.saveChapters(bookId, [], level);
            }
            // Clear localStorage cache
            if (this.storageAvailable) {
              const key = `adminChapters_${level}_${bookId}`;
              localStorage.removeItem(key);
            }
            return [];
          }
          
          // ✅ Supabase trả về success nhưng data = null (có thể là error hoặc không tồn tại)
          //    → Không clear cache, fallback về local cache
          console.log('[StorageManager.getChapters] ℹ️ Supabase returned null, will try local cache');
        } else {
          console.log('[StorageManager.getChapters] ⚠️ Supabase request not successful, will try local cache');
        }
      } catch (err) {
        console.warn('[StorageManager] Supabase getChapters failed, trying local:', err);
      }
    }
    
    // 2. Try IndexedDB (local cache) - chỉ khi Supabase không trả về empty array
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getChapters(bookId, level);
      if (result) {
        console.log('[StorageManager.getChapters] ✅ Loaded chapters from IndexedDB');
        return result;
      }
    }

    // 3. Fallback to localStorage - chỉ khi Supabase không trả về empty array
    if (this.storageAvailable && level) {
      const key = `adminChapters_${level}_${bookId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const chapters = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveChapters(bookId, chapters, level);
        }
        console.log('[StorageManager.getChapters] ✅ Loaded chapters from localStorage');
        return chapters;
      }
    }

    console.log('[StorageManager.getChapters] ❌ No chapters found anywhere');
    return null;
  }

  async saveChapters(bookId, chapters, level = null, userId = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // 1. Save to Supabase if level and userId provided
    if (level && userId) {
      try {
        const result = await contentService.saveChapters(bookId, level, chapters, userId);
        if (!result.success) {
          console.warn('[StorageManager] Failed to save chapters to Supabase:', result.error);
        }
      } catch (err) {
        console.warn('[StorageManager] Supabase saveChapters failed, continuing with local save:', err);
      }
    }
    
    // 2. Save to IndexedDB (local cache)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveChapters(bookId, chapters, level);
      if (success) {
        // Also save to localStorage for backward compatibility
        if (this.storageAvailable) {
          try {
            const key = level ? `adminChapters_${level}_${bookId}` : `adminChapters_${bookId}`;
            localStorage.setItem(key, JSON.stringify(chapters));
          } catch (e) {
            // localStorage might be full, that's OK - IndexedDB has it
            console.warn('localStorage full, but data saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // 3. Fallback to localStorage only
    if (this.storageAvailable && level) {
      try {
        const key = `adminChapters_${level}_${bookId}`;
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

  async deleteChapters(bookId, level = null) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteChapters(bookId, level);
    }

    // Delete from localStorage
    if (this.storageAvailable && level) {
      const key = `adminChapters_${level}_${bookId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== LESSONS ====================
  
  async getLessons(bookId, chapterId, level = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // 1. Try Supabase first if level provided
    if (level) {
      try {
        const { success, data } = await contentService.getLessons(bookId, chapterId, level);
        if (success && data && data.length > 0) {
          // Cache to IndexedDB
          if (this.useIndexedDB) {
            await indexedDBManager.saveLessons(bookId, chapterId, data, level);
          }
          // Cache to localStorage
          if (this.storageAvailable) {
            const key = `adminLessons_${level}_${bookId}_${chapterId}`;
            localStorage.setItem(key, JSON.stringify(data));
          }
          return data;
        }
      } catch (err) {
        console.warn('[StorageManager] Supabase getLessons failed, trying local:', err);
      }
    }
    
    // 2. Try IndexedDB (local cache)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getLessons(bookId, chapterId, level);
      if (result) return result;
    }

    // 3. Fallback to localStorage
    if (this.storageAvailable && level) {
      const key = `adminLessons_${level}_${bookId}_${chapterId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const lessons = JSON.parse(data);
        // Sync to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveLessons(bookId, chapterId, lessons, level);
        }
        return lessons;
      }
    }

    return null;
  }

  async saveLessons(bookId, chapterId, lessons, level = null, userId = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // 1. Save to Supabase if level and userId provided
    if (level && userId) {
      try {
        const result = await contentService.saveLessons(bookId, chapterId, level, lessons, userId);
        if (!result.success) {
          console.warn('[StorageManager] Failed to save lessons to Supabase:', result.error);
        }
      } catch (err) {
        console.warn('[StorageManager] Supabase saveLessons failed, continuing with local save:', err);
      }
    }
    
    // 2. Save to IndexedDB (local cache)
    if (this.useIndexedDB) {
      const success = await indexedDBManager.saveLessons(bookId, chapterId, lessons, level);
      if (success) {
        // Also save to localStorage for backward compatibility
        if (this.storageAvailable) {
          try {
            const key = level ? `adminLessons_${level}_${bookId}_${chapterId}` : `adminLessons_${bookId}_${chapterId}`;
            localStorage.setItem(key, JSON.stringify(lessons));
          } catch (e) {
            console.warn('localStorage full, but data saved to IndexedDB');
          }
        }
        return true;
      }
    }

    // 3. Fallback to localStorage only
    if (this.storageAvailable && level) {
      try {
        const key = `adminLessons_${level}_${bookId}_${chapterId}`;
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

  async deleteLessons(bookId, chapterId, level = null) {
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteLessons(bookId, chapterId, level);
    }

    // Delete from localStorage
    if (this.storageAvailable && level) {
      const key = `adminLessons_${level}_${bookId}_${chapterId}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Deleted ${key}`);
    }
  }

  // ==================== QUIZZES ====================
  
  async getQuiz(bookId, chapterId, lessonId = null, level = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Nếu không có lessonId, dùng chapterId làm lessonId (backward compatibility)
    const finalLessonId = lessonId || chapterId;
    
    console.log(`[StorageManager.getQuiz] 🔍 Loading quiz for:`, { bookId, chapterId, lessonId: finalLessonId, level });

    // ✅ FIXED: Bắt chước logic getBooks/getChapters/getLessons - luôn load từ Supabase trước nếu có level
    // 1. Try Supabase first if level provided (giống như getBooks/getChapters/getLessons)
    if (level) {
      try {
        const { success, data } = await contentService.getQuiz(bookId, chapterId, finalLessonId, level);

        if (success) {
          // ✅ FIXED: Giống getBooks - nếu Supabase trả về data thì dùng, nếu không thì fallback
          if (data) {
            console.log('[StorageManager.getQuiz] ✅ Loaded quiz from Supabase:', { id: data.id, title: data.title, questionsCount: data.questions?.length });

            // Cache to IndexedDB
            if (this.useIndexedDB) {
              await indexedDBManager.saveQuiz(bookId, chapterId, finalLessonId, data, level);
            }
            // Cache to localStorage
            if (this.storageAvailable) {
              try {
                const key = `adminQuiz_${level}_${bookId}_${chapterId}_${finalLessonId}`;
                localStorage.setItem(key, JSON.stringify(data));
              } catch (e) {
                console.warn('[StorageManager.getQuiz] ⚠️ Failed to cache to localStorage:', e);
              }
            }

            return data;
          }

          // ✅ Supabase trả về success nhưng data = null (quiz không tồn tại)
          //    → Giống getBooks, không fallback về cache cũ, return null
          console.log('[StorageManager.getQuiz] ℹ️ Quiz not found in Supabase, will try local caches');
        } else {
          console.log('[StorageManager.getQuiz] ⚠️ Supabase request not successful, will try local caches');
        }
      } catch (err) {
        console.warn('[StorageManager.getQuiz] ❌ Supabase getQuiz failed, trying local:', err);
      }
    }
    
    // 2. Try IndexedDB (local cache) - giống getBooks/getChapters/getLessons
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getQuiz(bookId, chapterId, finalLessonId, level);
      if (result) {
        console.log('[StorageManager.getQuiz] ✅ Loaded quiz from IndexedDB');
        return result;
      }
    }

    // 3. Fallback to localStorage (scoped by level) - giống getBooks/getChapters/getLessons
    if (this.storageAvailable && level) {
      const key = `adminQuiz_${level}_${bookId}_${chapterId}_${finalLessonId}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const quiz = JSON.parse(data);
          console.log('[StorageManager.getQuiz] ✅ Loaded quiz from localStorage');
          // Sync to IndexedDB
          if (this.useIndexedDB) {
            await indexedDBManager.saveQuiz(bookId, chapterId, finalLessonId, quiz, level);
          }
          return quiz;
        } catch (e) {
          console.warn('[StorageManager.getQuiz] ⚠️ Failed to parse quiz from localStorage:', e);
        }
      }
    }

    console.log('[StorageManager.getQuiz] ❌ No quiz found anywhere');
    return null;
  }

  async saveQuiz(bookId, chapterId, lessonId, quiz, level = null, userId = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // Nếu lessonId không được cung cấp, dùng chapterId (backward compatibility)
    const finalLessonId = lessonId || quiz.lessonId || chapterId;
    
    console.log(`💾 storageManager.saveQuiz(${bookId}, ${chapterId}, ${finalLessonId})`);
    console.log(`   - Quiz title: ${quiz.title || 'N/A'}`);
    console.log(`   - Questions count: ${quiz.questions?.length || 0}`);
    
    // 1. Save to Supabase if level and userId provided
    if (level && userId) {
      try {
        console.log(`[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...`);
        console.log(`[StorageManager.saveQuiz]   - bookId: ${bookId}`);
        console.log(`[StorageManager.saveQuiz]   - chapterId: ${chapterId}`);
        console.log(`[StorageManager.saveQuiz]   - lessonId: ${finalLessonId}`);
        console.log(`[StorageManager.saveQuiz]   - level: ${level}`);
        console.log(`[StorageManager.saveQuiz]   - userId: ${userId}`);
        console.log(`[StorageManager.saveQuiz]   - quiz title: ${quiz.title}`);
        console.log(`[StorageManager.saveQuiz]   - questions count: ${quiz.questions?.length || 0}`);
        
        const result = await contentService.saveQuiz({
          ...quiz,
          bookId,
          chapterId,
          lessonId: finalLessonId,
          level
        }, userId);
        
        if (!result.success) {
          console.error('[StorageManager.saveQuiz] ❌ Failed to save quiz to Supabase:', result.error);
          console.error('[StorageManager.saveQuiz] ❌ Error code:', result.error?.code);
          console.error('[StorageManager.saveQuiz] ❌ Error message:', result.error?.message);
          console.error('[StorageManager.saveQuiz] ❌ Error details:', JSON.stringify(result.error, null, 2));
          
          // ✅ NEW: Hiển thị alert cho user biết lỗi cụ thể
          if (result.error?.code === '42501') {
            console.error('[StorageManager.saveQuiz] ❌ RLS Policy Error - User không có quyền INSERT');
            alert(
              '⚠️ LỖI: Bạn không có quyền lưu quiz lên Supabase!\n\n' +
              'Nguyên nhân có thể:\n' +
              '1. User không có role = "admin" trong bảng profiles\n' +
              '2. RLS policies chưa được setup đúng\n\n' +
              'Vui lòng:\n' +
              '- Kiểm tra user role trong Supabase\n' +
              '- Chạy script: update_user_role_to_admin.sql\n' +
              '- Chạy script: fix_quizzes_rls_for_anonymous.sql\n\n' +
              'Quiz đã được lưu vào local storage nhưng KHÔNG sync lên Supabase.'
            );
          } else if (result.error?.code === '23505') {
            console.error('[StorageManager.saveQuiz] ❌ Unique Constraint Error - Quiz đã tồn tại');
            alert(
              '⚠️ LỖI: Quiz đã tồn tại trong Supabase!\n\n' +
              'Quiz với ID này đã được tạo trước đó.\n' +
              'Hệ thống sẽ cập nhật quiz hiện có.\n\n' +
              'Error: ' + (result.error?.message || 'Unknown error')
            );
          } else if (result.error?.code === '23503') {
            console.error('[StorageManager.saveQuiz] ❌ Foreign Key Constraint Error');
            console.error('[StorageManager.saveQuiz] ❌ Quiz đang cố reference đến book/chapter/lesson không tồn tại');
            alert(
              '⚠️ LỖI: Foreign Key Constraint Violation!\n\n' +
              'Quiz đang cố reference đến book/chapter/lesson KHÔNG TỒN TẠI trong database.\n\n' +
              'Nguyên nhân:\n' +
              '- Book với id và level này chưa được tạo\n' +
              '- Hoặc Chapter với id, book_id, level này chưa được tạo\n' +
              '- Hoặc Lesson với id, book_id, chapter_id, level này chưa được tạo\n\n' +
              'Giải pháp:\n' +
              '1. Kiểm tra Console log để xem book_id, chapter_id, lesson_id, level\n' +
              '2. Tạo book/chapter/lesson trong Supabase trước khi save quiz\n' +
              '3. Hoặc chạy script: fix_quizzes_foreign_key_error.sql\n\n' +
              'Error: ' + (result.error?.message || 'Unknown error')
            );
          } else {
            console.error('[StorageManager.saveQuiz] ❌ Unknown error:', result.error);
            alert(
              '⚠️ LỖI khi lưu quiz lên Supabase!\n\n' +
              'Error code: ' + (result.error?.code || 'Unknown') + '\n' +
              'Error message: ' + (result.error?.message || 'Unknown error') + '\n\n' +
              'Quiz đã được lưu vào local storage nhưng KHÔNG sync lên Supabase.\n' +
              'Vui lòng kiểm tra Console để xem chi tiết.'
            );
          }
        } else {
          console.log(`[StorageManager.saveQuiz] ✅ Successfully saved quiz to Supabase`);
          console.log(`[StorageManager.saveQuiz] ✅ Supabase response:`, result.data);
        }
      } catch (err) {
        console.error('[StorageManager.saveQuiz] ❌ Supabase saveQuiz exception:', err);
        console.error('[StorageManager.saveQuiz] ❌ Exception details:', err.message, err.stack);
      }
    } else {
      if (!level) {
        console.warn('[StorageManager.saveQuiz] ⚠️ No level provided - quiz will NOT be saved to Supabase');
      }
      if (!userId) {
        console.warn('[StorageManager.saveQuiz] ⚠️ No userId provided - quiz will NOT be saved to Supabase');
        console.warn('[StorageManager.saveQuiz] ⚠️ User must be logged in to sync quiz across devices');
      }
    }
    
    // 2. Save to IndexedDB (local cache)
    if (this.useIndexedDB) {
      console.log(`💾 Attempting to save to IndexedDB...`);
      const success = await indexedDBManager.saveQuiz(bookId, chapterId, finalLessonId, quiz, level);
      console.log(`   - IndexedDB save result: ${success ? 'SUCCESS' : 'FAILED'}`);
      if (success) {
        // Try to save to localStorage for backward compatibility
        // But don't fail if localStorage is full (IndexedDB has it)
        if (this.storageAvailable && level) {
          try {
            const key = `adminQuiz_${level}_${bookId}_${chapterId}_${finalLessonId}`;
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

    // 3. Fallback to localStorage only (might fail if too large)
    if (this.storageAvailable && level) {
      try {
        const key = `adminQuiz_${level}_${bookId}_${chapterId}_${finalLessonId}`;
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

  async getAllQuizzes(level = null) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();

    console.log(`[StorageManager.getAllQuizzes] 🔍 Loading quizzes for level:`, level);

    // ✅ FIXED: Bắt chước logic getBooks - luôn load từ Supabase trước nếu có level
    // 1. Try Supabase first if level provided (giống như getBooks)
    if (level) {
      try {
        const { success, data } = await contentService.getAllQuizzesByLevel(level);

        if (success) {
          const supaQuizzes = Array.isArray(data) ? data : [];

          if (supaQuizzes.length > 0) {
            // ✅ Có dữ liệu trên server → dùng server làm nguồn chính (giống getBooks)
            console.log('[StorageManager.getAllQuizzes] ✅ Loaded', supaQuizzes.length, 'quizzes from Supabase');

            // Cache to IndexedDB for offline support
            if (this.useIndexedDB) {
              for (const quiz of supaQuizzes) {
                await indexedDBManager.saveQuiz(quiz.bookId, quiz.chapterId, quiz.lessonId, quiz, level);
              }
            }

            // Also cache to localStorage
            if (this.storageAvailable) {
              for (const quiz of supaQuizzes) {
                try {
                  const key = `adminQuiz_${level}_${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId}`;
                  localStorage.setItem(key, JSON.stringify(quiz));
                } catch (e) {
                  console.warn('[StorageManager.getAllQuizzes] ⚠️ localStorage full, but quiz cached to IndexedDB');
                }
              }
            }

            return supaQuizzes;
          }

          // ✅ Supabase trả về RỖNG (server hiện không có quiz nào)
          //    → Xoá cache local/IndexedDB để client đồng bộ với server (giống getBooks)
          console.log('[StorageManager.getAllQuizzes] ℹ️ Supabase has 0 quizzes for level', level, '- clearing local caches');

          if (this.useIndexedDB) {
            // Clear quizzes for this level from IndexedDB
            const allQuizzes = await indexedDBManager.getAllQuizzes();
            const filteredQuizzes = allQuizzes.filter(q => q.level !== level);
            // Note: IndexedDB doesn't have a direct way to delete by level, so we'll just return empty
          }

          if (this.storageAvailable) {
            // Clear localStorage keys for this level
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(`adminQuiz_${level}_`)) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }

          // Trả về mảng rỗng, KHÔNG fallback sang cache cũ nữa (giống getBooks)
          return [];
        }

        console.log('[StorageManager.getAllQuizzes] ⚠️ Supabase request not successful, will try local caches');
      } catch (err) {
        console.warn('[StorageManager.getAllQuizzes] ❌ Supabase getAllQuizzes failed, trying local:', err);
      }
    }
    
    // 2. Try IndexedDB (local cache) - giống getBooks
    if (this.useIndexedDB) {
      const quizzes = await indexedDBManager.getAllQuizzes(level);
      if (quizzes && quizzes.length > 0) {
        console.log('[StorageManager.getAllQuizzes] ✅ Loaded', quizzes.length, 'quizzes from IndexedDB');
        return quizzes;
      }
    }

    // 3. Fallback to localStorage - giống getBooks
    const allQuizzes = [];
    if (this.storageAvailable) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('adminQuiz_')) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const quiz = JSON.parse(data);
              // Extract level, bookId, chapterId, lessonId from new key format
              // New format: adminQuiz_level_bookId_chapterId_lessonId
              const parts = key.replace('adminQuiz_', '').split('_');
              if (parts.length >= 4) {
                const [quizLevel, bookId, chapterId, ...lessonParts] = parts;
                const lessonId = lessonParts.join('_');
                if (!level || quizLevel === level) {
                  allQuizzes.push({
                    level: quizLevel,
                    bookId,
                    chapterId,
                    lessonId,
                    ...quiz
                  });
                }
              }
            }
          } catch (e) {
            console.warn(`[StorageManager.getAllQuizzes] ⚠️ Error parsing quiz from key ${key}:`, e);
          }
        }
      }
      if (allQuizzes.length > 0) {
        console.log('[StorageManager.getAllQuizzes] ✅ Loaded', allQuizzes.length, 'quizzes from localStorage');
      }
    }

    console.log('[StorageManager.getAllQuizzes] ❌ No quizzes found anywhere');
    return allQuizzes;
  }

  async deleteQuiz(bookId, chapterId, lessonId = null, level = null) {
    // Nếu không có lessonId, dùng chapterId (backward compatibility)
    const finalLessonId = lessonId || chapterId;
    
    console.log(`🗑️ storageManager.deleteQuiz(${bookId}, ${chapterId}, ${finalLessonId}, level=${level})`);
    
    // ✅ FIXED: Xóa từ Supabase trước (nếu có level)
    if (level) {
      try {
        // Xóa quiz từ Supabase bằng cách gọi contentService
        // Note: contentService không có deleteQuiz function, nhưng có thể xóa trực tiếp
        const { supabase } = await import('../services/supabaseClient.js');
        const { error } = await supabase
          .from('quizzes')
          .delete()
          .eq('book_id', bookId)
          .eq('chapter_id', chapterId)
          .eq('lesson_id', finalLessonId)
          .eq('level', level);
        
        if (error) {
          console.warn('[StorageManager] ⚠️ Failed to delete quiz from Supabase:', error);
        } else {
          console.log(`✅ Deleted quiz from Supabase`);
        }
      } catch (err) {
        console.warn('[StorageManager] ⚠️ Error deleting quiz from Supabase:', err);
      }
    }
    
    // ✅ FIXED: Xóa tất cả quiz liên quan từ local storage (cả quiz cũ không có lessonId)
    // Delete from IndexedDB
    if (this.useIndexedDB) {
      await indexedDBManager.deleteQuiz(bookId, chapterId, finalLessonId, level);
      // ✅ Cũng thử xóa quiz cũ không có lessonId (backward compatibility)
      try {
        const allQuizzes = await indexedDBManager.getAllQuizzes(level);
        const relatedQuizzes = allQuizzes.filter(q => 
          q.bookId === bookId && 
          q.chapterId === chapterId && 
          (!q.lessonId || q.lessonId === chapterId) // Quiz cũ dùng chapterId làm lessonId
        );
        for (const q of relatedQuizzes) {
          await indexedDBManager.deleteQuiz(bookId, chapterId, q.lessonId || chapterId, level);
        }
      } catch (e) {
        console.warn('[StorageManager] Error cleaning up old quizzes from IndexedDB:', e);
      }
    }

    // Delete from localStorage (both old and new format)
    if (this.storageAvailable && level) {
      // Delete new format
      const newKey = `adminQuiz_${level}_${bookId}_${chapterId}_${finalLessonId}`;
      localStorage.removeItem(newKey);
      
      // ✅ FIXED: Xóa tất cả quiz liên quan (có thể có nhiều quiz với các lessonId khác nhau)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`adminQuiz_${level}_${bookId}_${chapterId}_`)) {
          // Xóa tất cả quiz của chapter này (có thể có quiz cũ với lessonId khác)
          localStorage.removeItem(key);
          console.log(`🗑️ Deleted related quiz key: ${key}`);
        }
      }
      
      console.log(`🗑️ Deleted quiz keys for level ${level}: ${newKey} and related quizzes`);
    }
  }

  // ==================== JLPT EXAMS ====================
  
  async getExams(level) {
    // ✅ Đảm bảo init() hoàn thành trước
    await this.ensureInitialized();
    
    // 1. Try Supabase first (nguồn dữ liệu chuẩn, dùng chung cho mọi user)
    try {
      const { success, data } = await examService.getExamsByLevel(level);

      if (success) {
        const supaExams = Array.isArray(data) ? data : [];

        if (supaExams.length > 0) {
          console.log('[StorageManager.getExams] ✅ Loaded', supaExams.length, 'exams from Supabase for level', level);

          // Cache to IndexedDB
          if (this.useIndexedDB) {
            await indexedDBManager.saveExams(level, supaExams);
          }

          // Cache to localStorage
          if (this.storageAvailable) {
            const key = `adminExams_${level}`;
            localStorage.setItem(key, JSON.stringify(supaExams));
          }

          return supaExams;
        }

        // Supabase trả về rỗng → đồng bộ xoá cache local cho level này
        console.log('[StorageManager.getExams] ℹ️ Supabase has 0 exams for level', level, '- clearing local caches');

        if (this.useIndexedDB) {
          await indexedDBManager.saveExams(level, []);
        }

        if (this.storageAvailable) {
          const key = `adminExams_${level}`;
          localStorage.removeItem(key);
        }

        return [];
      }

      console.log('[StorageManager.getExams] ⚠️ Supabase request not successful, will try local caches');
    } catch (err) {
      console.warn('[StorageManager.getExams] ❌ Supabase getExamsByLevel failed, trying local:', err);
    }
    
    // 2. Try IndexedDB (local cache)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getExams(level);
      if (result) return result;
    }

    // 3. Fallback to localStorage
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
    
    // 1. Try Supabase first (nguồn chuẩn)
    try {
      const { success, data } = await examService.getExam(level, examId);
      if (success && data) {
        // Cache to IndexedDB
        if (this.useIndexedDB) {
          await indexedDBManager.saveExam(level, examId, data);
        }
        // Cache to localStorage
        if (this.storageAvailable) {
          const key = `adminExam_${level}_${examId}`;
          localStorage.setItem(key, JSON.stringify(data));
        }
        return data;
      }
    } catch (err) {
      console.warn('[StorageManager.getExam] ❌ Supabase getExam failed, trying local:', err);
    }
    
    // 2. Try IndexedDB (local cache)
    if (this.useIndexedDB) {
      const result = await indexedDBManager.getExam(level, examId);
      if (result) return result;
    }

    // 3. Fallback to localStorage
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
        const chaptersKey = `adminChapters_${level}_${book.id}`;
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
          const lessonsKey = `adminLessons_${level}_${book.id}_${chapter.id}`;
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
            const quizKey = `adminQuiz_${level}_${book.id}_${chapter.id}_${lesson.id}`;
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
            const parts = key.replace('adminChapters_', '').split('_');
            const level = parts.shift();
            const bookId = parts.join('_');
            if (level && bookId) {
              data.chapters[`${level}_${bookId}`] = value;
            }
          } else if (key.startsWith('adminQuiz_')) {
            const parts = key.replace('adminQuiz_', '').split('_');
            const level = parts.shift();
            const bookId = parts.shift();
            const chapterId = parts.shift();
            const lessonId = parts.join('_');
            if (level && bookId && chapterId && lessonId) {
              data.quizzes[`${level}_${bookId}_${chapterId}_${lessonId}`] = value;
            }
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
      for (const scopedBookId in data.chapters) {
        const [level, ...bookParts] = scopedBookId.split('_');
        const bookId = bookParts.join('_');
        const key = level ? `adminChapters_${level}_${bookId}` : `adminChapters_${scopedBookId}`;
        try {
          localStorage.setItem(key, JSON.stringify(data.chapters[scopedBookId]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import chapters for ${scopedBookId}:`, e);
        }
      }

      // Import quizzes
      for (const scopedKey in data.quizzes) {
        const parts = scopedKey.split('_');
        const level = parts.shift();
        const storageKey = level ? `adminQuiz_${scopedKey}` : `adminQuiz_${parts.join('_')}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.quizzes[scopedKey]));
          imported++;
        } catch (e) {
          console.warn(`Failed to import quiz ${scopedKey}:`, e);
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

