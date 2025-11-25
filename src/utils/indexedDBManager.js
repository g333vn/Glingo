// src/utils/indexedDBManager.js
// 💾 IndexedDB Manager - Unlimited storage for large data

import { users as staticUsers } from '../data/users.js';

import { openDB } from 'idb';

class IndexedDBManager {
  constructor() {
    this.db = null;
    this.dbName = 'elearning-db';
    this.dbVersion = 3; // ✅ Phase 3: Added SRS tables
  }

  // Initialize database
  async init() {
    if (!('indexedDB' in window)) {
      console.warn('⚠️ IndexedDB is not supported in this browser');
      return false;
    }

    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`🔄 Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);
          
          try {
            // Books store: { level, id } as keyPath
            if (!db.objectStoreNames.contains('books')) {
              const booksStore = db.createObjectStore('books', { keyPath: ['level', 'id'] });
              booksStore.createIndex('level', 'level');
              console.log('✅ Created books store');
            }

            // Series store: { level, id } as keyPath
            if (!db.objectStoreNames.contains('series')) {
              const seriesStore = db.createObjectStore('series', { keyPath: ['level', 'id'] });
              seriesStore.createIndex('level', 'level');
              console.log('✅ Created series store');
            }

            // Chapters store: bookId as keyPath, stores array of chapters
            if (!db.objectStoreNames.contains('chapters')) {
              db.createObjectStore('chapters', { keyPath: 'bookId' });
              console.log('✅ Created chapters store');
            }

            // Lessons store: { bookId, chapterId } as keyPath, stores array of lessons
            if (!db.objectStoreNames.contains('lessons')) {
              const lessonsStore = db.createObjectStore('lessons', { keyPath: ['bookId', 'chapterId'] });
              lessonsStore.createIndex('bookId', 'bookId');
              lessonsStore.createIndex('chapterId', 'chapterId');
              console.log('✅ Created lessons store');
            }

            // Quizzes store: { bookId, chapterId, lessonId } as keyPath
            if (oldVersion < 2 && db.objectStoreNames.contains('quizzes')) {
              // Upgrade từ version 1: migrate data và thêm lessonId
              console.log('🔄 Upgrading quizzes store to include lessonId...');
              
              // Lưu reference để migrate sau
              // Note: Không thể dùng await trong upgrade callback
              // Sẽ migrate data sau khi upgrade xong (trong init function)
              
              // Xóa store cũ
              db.deleteObjectStore('quizzes');
              
              // Tạo store mới với key [bookId, chapterId, lessonId]
              const newQuizStore = db.createObjectStore('quizzes', { keyPath: ['bookId', 'chapterId', 'lessonId'] });
              newQuizStore.createIndex('bookId', 'bookId');
              newQuizStore.createIndex('chapterId', 'chapterId');
              newQuizStore.createIndex('lessonId', 'lessonId');
              
              console.log('✅ Created new quizzes store with lessonId (migration will happen on next access)');
            } else if (!db.objectStoreNames.contains('quizzes')) {
              // Tạo mới store
              const quizStore = db.createObjectStore('quizzes', { keyPath: ['bookId', 'chapterId', 'lessonId'] });
              quizStore.createIndex('bookId', 'bookId');
              quizStore.createIndex('chapterId', 'chapterId');
              quizStore.createIndex('lessonId', 'lessonId');
              console.log('✅ Created quizzes store with lessonId');
            }

            // Exams store: { level, examId } as keyPath
            if (!db.objectStoreNames.contains('exams')) {
              const examsStore = db.createObjectStore('exams', { keyPath: ['level', 'examId'] });
              examsStore.createIndex('level', 'level');
              console.log('✅ Created exams store');
            }

            // Level Configs store: level as keyPath
            if (!db.objectStoreNames.contains('levelConfigs')) {
              db.createObjectStore('levelConfigs', { keyPath: 'level' });
              console.log('✅ Created levelConfigs store');
            }

            // ========== PHASE 3: SRS TABLES ==========
            
            // SRS Progress store: { cardId, userId } as keyPath
            if (!db.objectStoreNames.contains('srsProgress')) {
              const srsProgressStore = db.createObjectStore('srsProgress', { keyPath: ['cardId', 'userId'] });
              srsProgressStore.createIndex('by-user', 'userId');
              srsProgressStore.createIndex('by-deck', 'deckId');
              srsProgressStore.createIndex('by-user-deck', ['userId', 'deckId']);
              srsProgressStore.createIndex('by-next-review', 'nextReview');
              srsProgressStore.createIndex('by-state', 'state');
              console.log('✅ Created srsProgress store (Phase 3)');
            }

            // Review History store: id as keyPath
            if (!db.objectStoreNames.contains('reviews')) {
              const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id' });
              reviewsStore.createIndex('by-user', 'userId');
              reviewsStore.createIndex('by-deck', 'deckId');
              reviewsStore.createIndex('by-card', 'cardId');
              reviewsStore.createIndex('by-timestamp', 'timestamp');
              reviewsStore.createIndex('by-user-deck', ['userId', 'deckId']);
              console.log('✅ Created reviews store (Phase 3)');
            }

            // Daily Stats store: { userId, deckId, date } as keyPath
            if (!db.objectStoreNames.contains('dailyStats')) {
              const dailyStatsStore = db.createObjectStore('dailyStats', { keyPath: ['userId', 'deckId', 'date'] });
              dailyStatsStore.createIndex('by-user', 'userId');
              dailyStatsStore.createIndex('by-deck', 'deckId');
              dailyStatsStore.createIndex('by-date', 'date');
              dailyStatsStore.createIndex('by-user-deck', ['userId', 'deckId']);
              console.log('✅ Created dailyStats store (Phase 3)');
            }
          } catch (upgradeError) {
            console.error('❌ Error during upgrade:', upgradeError);
            throw upgradeError; // Re-throw để abort transaction
          }
        },
        blocked() {
          console.warn('⚠️ IndexedDB upgrade blocked - another tab is using the database');
        },
        blocking() {
          console.warn('⚠️ IndexedDB upgrade blocking - need to close other tabs');
        }
      });

      console.log('✅ IndexedDB initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ IndexedDB initialization failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Nếu lỗi do version conflict, thử xóa database cũ và tạo lại
      if (error.name === 'VersionError' || error.name === 'AbortError') {
        console.warn('⚠️ Attempting to delete old database and recreate...');
        try {
          await this.deleteDatabase();
          // Retry initialization
          return await this.init();
        } catch (retryError) {
          console.error('❌ Failed to recreate database:', retryError);
          return false;
        }
      }
      
      return false;
    }
  }

  // Delete database (for recovery)
  async deleteDatabase() {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      await indexedDB.deleteDatabase(this.dbName);
      console.log('🗑️ Deleted old database');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete database:', error);
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

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Thêm metadata timestamp vào dữ liệu
   * @param {Object} item - Dữ liệu cần thêm metadata
   * @param {boolean} isNew - true nếu là item mới, false nếu là update
   * @returns {Object} - Dữ liệu đã có metadata
   */
  addMetadata(item, isNew = true) {
    const now = new Date().toISOString();
    return {
      ...item,
      createdAt: isNew ? now : (item.createdAt || now),
      updatedAt: now
    };
  }

  /**
   * Kiểm tra item có trong date range không
   * @param {Object} item - Item cần kiểm tra
   * @param {string} startDate - Ngày bắt đầu (ISO string)
   * @param {string} endDate - Ngày kết thúc (ISO string)
   * @param {string} dateField - Field dùng để check ('createdAt', 'updatedAt', hoặc 'date' cho exams)
   * @returns {boolean}
   */
  isInDateRange(item, startDate, endDate, dateField = 'createdAt') {
    const itemDate = item[dateField] || item.createdAt || item.updatedAt || item.date;
    if (!itemDate) return false;
    
    const date = new Date(itemDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end date
    
    return date >= start && date <= end;
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

  // ✅ NEW: Get a single book by ID (search across all levels)
  async getBook(bookId) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const allBooks = await store.getAll();
      return allBooks.find(b => b.id === bookId) || null;
    } catch (error) {
      console.error('Error getting book:', error);
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

      // Add new books with metadata
      for (const book of books) {
        // Check if book already exists to preserve createdAt
        const existingBook = existingBooks.find(b => b.id === book.id);
        const bookWithMetadata = this.addMetadata(book, !existingBook);
        await store.put({ ...bookWithMetadata, level });
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

      // Add new series with metadata
      for (const s of series) {
        // Check if series already exists to preserve createdAt
        const existingS = existingSeries.find(ser => ser.id === s.id);
        const seriesWithMetadata = this.addMetadata(s, !existingS);
        await store.put({ ...seriesWithMetadata, level });
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
      
      // Get existing chapters to preserve metadata
      const existing = await store.get(bookId);
      const existingChapters = existing ? existing.chapters : [];
      
      // Add metadata to each chapter
      const chaptersWithMetadata = chapters.map(chapter => {
        const existingChapter = existingChapters.find(c => c.id === chapter.id);
        return this.addMetadata(chapter, !existingChapter);
      });
      
      await store.put({ 
        bookId, 
        chapters: chaptersWithMetadata,
        updatedAt: new Date().toISOString()
      });
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

  // ==================== LESSONS ====================

  async getLessons(bookId, chapterId) {
    if (!(await this.isAvailable())) return null;

    try {
      const tx = this.db.transaction('lessons', 'readonly');
      const store = tx.objectStore('lessons');
      const key = [bookId, chapterId];
      const result = await store.get(key);
      return result ? result.lessons : null;
    } catch (error) {
      console.error('Error getting lessons:', error);
      return null;
    }
  }

  async saveLessons(bookId, chapterId, lessons) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('lessons', 'readwrite');
      const store = tx.objectStore('lessons');
      
      // Get existing lessons to preserve metadata
      const existing = await store.get([bookId, chapterId]);
      const existingLessons = existing ? existing.lessons : [];
      
      // Add metadata to each lesson
      const lessonsWithMetadata = lessons.map(lesson => {
        const existingLesson = existingLessons.find(l => l.id === lesson.id);
        return this.addMetadata(lesson, !existingLesson);
      });
      
      await store.put({ 
        bookId, 
        chapterId, 
        lessons: lessonsWithMetadata,
        updatedAt: new Date().toISOString()
      });
      await tx.done;
      console.log(`✅ Saved ${lessons.length} lessons to IndexedDB (${bookId}/${chapterId})`);
      return true;
    } catch (error) {
      console.error('Error saving lessons:', error);
      return false;
    }
  }

  async deleteLessons(bookId, chapterId) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('lessons', 'readwrite');
      const store = tx.objectStore('lessons');
      await store.delete([bookId, chapterId]);
      await tx.done;
      console.log(`🗑️ Deleted lessons (${bookId}/${chapterId})`);
      return true;
    } catch (error) {
      console.error('Error deleting lessons:', error);
      return false;
    }
  }

  // ==================== QUIZZES ====================

  async getQuiz(bookId, chapterId, lessonId) {
    if (!(await this.isAvailable())) {
      console.log(`❌ IndexedDB not available for getQuiz(${bookId}, ${chapterId}, ${lessonId})`);
      return null;
    }

    try {
      const tx = this.db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const key = [bookId, chapterId, lessonId];
      console.log(`🔍 IndexedDB: Looking for quiz with key:`, key);
      const result = await store.get(key);
      console.log(`📦 IndexedDB: Quiz result:`, result ? 'Found' : 'Not found');
      
      return result || null;
    } catch (error) {
      console.error('❌ Error getting quiz from IndexedDB:', error);
      return null;
    }
  }

  async saveQuiz(bookId, chapterId, lessonId, quizData) {
    if (!(await this.isAvailable())) {
      console.log(`❌ IndexedDB not available for saveQuiz(${bookId}, ${chapterId}, ${lessonId})`);
      return false;
    }

    try {
      const tx = this.db.transaction('quizzes', 'readwrite');
      const store = tx.objectStore('quizzes');
      const key = [bookId, chapterId, lessonId];
      // Get existing quiz to preserve metadata
      const existing = await store.get(key);
      const isNew = !existing;
      
      const dataToSave = {
        bookId,
        chapterId,
        lessonId,
        ...this.addMetadata(quizData, isNew)
      };
      console.log(`💾 IndexedDB: Saving quiz with key:`, key);
      console.log(`   - Title: ${quizData.title || 'N/A'}`);
      console.log(`   - Questions: ${quizData.questions?.length || 0}`);
      console.log(`   - Is new: ${isNew}`);
      await store.put(dataToSave);
      await tx.done;
      console.log(`✅ Saved quiz to IndexedDB (${bookId}/${chapterId}/${lessonId}, ${quizData.questions?.length || 0} questions)`);
      return true;
    } catch (error) {
      console.error('❌ Error saving quiz to IndexedDB:', error);
      return false;
    }
  }

  async deleteQuiz(bookId, chapterId, lessonId) {
    if (!(await this.isAvailable())) return false;

    try {
      const tx = this.db.transaction('quizzes', 'readwrite');
      const store = tx.objectStore('quizzes');
      await store.delete([bookId, chapterId, lessonId]);
      await tx.done;
      console.log(`🗑️ Deleted quiz (${bookId}/${chapterId}/${lessonId})`);
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
  }

  // Get all quizzes for a chapter (for backward compatibility)
  async getQuizzesByChapter(bookId, chapterId) {
    if (!(await this.isAvailable())) return [];

    try {
      const tx = this.db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const index = store.index('chapterId');
      const quizzes = await index.getAll(chapterId);
      return quizzes.filter(q => q.bookId === bookId) || [];
    } catch (error) {
      console.error('Error getting quizzes by chapter:', error);
      return [];
    }
  }

  async getAllQuizzes() {
    if (!(await this.isAvailable())) return [];

    try {
      const tx = this.db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const allQuizzes = await store.getAll();
      return allQuizzes || [];
    } catch (error) {
      console.error('Error getting all quizzes:', error);
      return [];
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
      if (!result) {
        console.log(`📭 IndexedDB: Exam not found (${level}/${examId})`);
        return null;
      }
      
      // Remove level and examId from result (they're metadata, not part of exam data)
      const { level: _, examId: __, ...examData } = result;
      
      // ✅ FIX: Log để debug
      const knowledgeSections = examData.knowledge?.sections || [];
      const totalQuestions = knowledgeSections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
      console.log(`✅ IndexedDB: Loaded exam (${level}/${examId}):`, {
        hasKnowledge: !!examData.knowledge,
        sectionsCount: knowledgeSections.length,
        totalQuestions,
        questionIds: knowledgeSections.flatMap(s => s.questions?.map(q => q.id) || [])
      });
      
      return examData;
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
      
      // Get existing exam to preserve metadata
      const existing = await store.get([level, examId]);
      const isNew = !existing;
      
      // ✅ FIX: Log trước khi save
      const knowledgeSections = examData.knowledge?.sections || [];
      const totalQuestions = knowledgeSections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
      console.log(`💾 IndexedDB: Saving exam (${level}/${examId}):`, {
        isNew,
        hasKnowledge: !!examData.knowledge,
        sectionsCount: knowledgeSections.length,
        totalQuestions,
        questionIds: knowledgeSections.flatMap(s => s.questions?.map(q => q.id) || [])
      });
      
      await store.put({
        level,
        examId,
        ...this.addMetadata(examData, isNew)
      });
      await tx.done;
      console.log(`✅ IndexedDB: Saved exam (${level}/${examId})`);
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
        version: '2.0.0',
        books: {},
        series: {},
        chapters: {},
        lessons: {},
        quizzes: {},
        exams: {},
        levelConfigs: {}
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

      // Export lessons
      const lessonsTx = this.db.transaction('lessons', 'readonly');
      const lessonsStore = lessonsTx.objectStore('lessons');
      const allLessons = await lessonsStore.getAll();
      for (const lesson of allLessons) {
        const key = `${lesson.bookId}_${lesson.chapterId}`;
        data.lessons[key] = lesson.lessons;
      }

      // Export quizzes
      const quizzesTx = this.db.transaction('quizzes', 'readonly');
      const quizzesStore = quizzesTx.objectStore('quizzes');
      const allQuizzes = await quizzesStore.getAll();
      for (const quiz of allQuizzes) {
        const key = `${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId || quiz.chapterId}`;
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

      // Export level configs
      const configsTx = this.db.transaction('levelConfigs', 'readonly');
      const configsStore = configsTx.objectStore('levelConfigs');
      const allConfigs = await configsStore.getAll();
      for (const config of allConfigs) {
        data.levelConfigs[config.level] = config.config;
      }

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // ✅ NEW: Export data for a specific level
  async exportLevel(level) {
    if (!(await this.isAvailable())) return null;

    try {
      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        level: level,
        books: [],
        series: [],
        chapters: {},
        lessons: {},
        quizzes: {},
        exams: {},
        levelConfigs: {}
      };

      // Export books for this level
      const booksTx = this.db.transaction('books', 'readonly');
      const booksStore = booksTx.objectStore('books');
      const booksIndex = booksStore.index('level');
      const levelBooks = await booksIndex.getAll(level);
      data.books = levelBooks;

      // Export series for this level
      const seriesTx = this.db.transaction('series', 'readonly');
      const seriesStore = seriesTx.objectStore('series');
      const seriesIndex = seriesStore.index('level');
      const levelSeries = await seriesIndex.getAll(level);
      data.series = levelSeries;

      // Export chapters for books in this level
      const chaptersTx = this.db.transaction('chapters', 'readonly');
      const chaptersStore = chaptersTx.objectStore('chapters');
      const allChapters = await chaptersStore.getAll();
      for (const ch of allChapters) {
        // Check if this chapter belongs to a book in this level
        const book = levelBooks.find(b => b.id === ch.bookId);
        if (book) {
          data.chapters[ch.bookId] = ch.chapters;
        }
      }

      // Export lessons for books in this level
      const lessonsTx = this.db.transaction('lessons', 'readonly');
      const lessonsStore = lessonsTx.objectStore('lessons');
      const allLessons = await lessonsStore.getAll();
      for (const lesson of allLessons) {
        // Check if this lesson belongs to a book in this level
        const book = levelBooks.find(b => b.id === lesson.bookId);
        if (book) {
          const key = `${lesson.bookId}_${lesson.chapterId}`;
          data.lessons[key] = lesson.lessons;
        }
      }

      // Export quizzes for books in this level
      const quizzesTx = this.db.transaction('quizzes', 'readonly');
      const quizzesStore = quizzesTx.objectStore('quizzes');
      const allQuizzes = await quizzesStore.getAll();
      for (const quiz of allQuizzes) {
        // Check if this quiz belongs to a book in this level
        const book = levelBooks.find(b => b.id === quiz.bookId);
        if (book) {
          const key = `${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId || quiz.chapterId}`;
          data.quizzes[key] = quiz;
        }
      }

      // Export exams for this level
      const examsTx = this.db.transaction('exams', 'readonly');
      const examsStore = examsTx.objectStore('exams');
      const allExams = await examsStore.getAll();
      for (const exam of allExams) {
        if (exam.level === level) {
          const key = `${exam.level}_${exam.examId}`;
          data.exams[key] = exam;
        }
      }

      // Export level config for this level
      const configsTx = this.db.transaction('levelConfigs', 'readonly');
      const configsStore = configsTx.objectStore('levelConfigs');
      const config = await configsStore.get(level);
      if (config) {
        data.levelConfigs[level] = config.config;
      }

      return data;
    } catch (error) {
      console.error(`Error exporting level ${level}:`, error);
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

      // Import lessons
      for (const key in data.lessons) {
        const [bookId, chapterId] = key.split('_');
        await this.saveLessons(bookId, chapterId, data.lessons[key]);
      }

      // Import quizzes
      for (const key in data.quizzes) {
        const quiz = data.quizzes[key];
        // Support both old format (without lessonId) and new format
        const lessonId = quiz.lessonId || quiz.chapterId;
        await this.saveQuiz(quiz.bookId, quiz.chapterId, lessonId, quiz);
      }

      // Import exams
      for (const key in data.exams) {
        const exam = data.exams[key];
        await this.saveExam(exam.level, exam.examId, exam);
      }

      // Import level configs
      if (data.levelConfigs) {
        for (const level in data.levelConfigs) {
          await this.saveLevelConfig(level, data.levelConfigs[level]);
        }
      }

      console.log('✅ Imported all data to IndexedDB');
      return { success: true, imported: Object.keys(data).length };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ NEW: Export a specific Series with all its content
  async exportSeries(level, seriesId) {
    if (!(await this.isAvailable())) return null;

    try {
      // Get series
      const series = await this.getSeries(level);
      const seriesItem = series.find(s => s.id === seriesId || s.name === seriesId);
      if (!seriesItem) {
        throw new Error(`Series not found: ${seriesId}`);
      }

      // Get all books in this series
      const books = await this.getBooks(level);
      const seriesBooks = books.filter(b => b.category === seriesItem.name);

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'series',
        level: level,
        series: seriesItem,
        books: seriesBooks,
        chapters: {},
        lessons: {},
        quizzes: {}
      };

      // Export chapters, lessons, quizzes for all books in series
      for (const book of seriesBooks) {
        const chapters = await this.getChapters(book.id);
        if (chapters && chapters.length > 0) {
          data.chapters[book.id] = chapters;

          for (const chapter of chapters) {
            const lessons = await this.getLessons(book.id, chapter.id);
            if (lessons && lessons.length > 0) {
              data.lessons[`${book.id}_${chapter.id}`] = lessons;

              for (const lesson of lessons) {
                const quiz = await this.getQuiz(book.id, chapter.id, lesson.id);
                if (quiz) {
                  data.quizzes[`${book.id}_${chapter.id}_${lesson.id}`] = quiz;
                }
              }
            }
          }
        }
      }

      return data;
    } catch (error) {
      console.error(`Error exporting series ${seriesId}:`, error);
      return null;
    }
  }

  // ✅ NEW: Export a specific Book with all its content
  async exportBook(level, bookId) {
    if (!(await this.isAvailable())) return null;

    try {
      // Get book
      const books = await this.getBooks(level);
      const book = books.find(b => b.id === bookId);
      if (!book) {
        throw new Error(`Book not found: ${bookId}`);
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'book',
        level: level,
        book: book,
        chapters: {},
        lessons: {},
        quizzes: {}
      };

      // Export chapters, lessons, quizzes
      const chapters = await this.getChapters(bookId);
      if (chapters && chapters.length > 0) {
        data.chapters[bookId] = chapters;

        for (const chapter of chapters) {
          const lessons = await this.getLessons(bookId, chapter.id);
          if (lessons && lessons.length > 0) {
            data.lessons[`${bookId}_${chapter.id}`] = lessons;

            for (const lesson of lessons) {
              const quiz = await this.getQuiz(bookId, chapter.id, lesson.id);
              if (quiz) {
                data.quizzes[`${bookId}_${chapter.id}_${lesson.id}`] = quiz;
              }
            }
          }
        }
      }

      return data;
    } catch (error) {
      console.error(`Error exporting book ${bookId}:`, error);
      return null;
    }
  }

  // ✅ NEW: Export a specific Chapter with all its content
  async exportChapter(bookId, chapterId) {
    if (!(await this.isAvailable())) return null;

    try {
      // Get chapter
      const chapters = await this.getChapters(bookId);
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (!chapter) {
        throw new Error(`Chapter not found: ${chapterId}`);
      }

      // Get book info
      const book = await this.getBook(bookId);
      if (!book) {
        throw new Error(`Book not found: ${bookId}`);
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'chapter',
        level: book.level,
        book: book,
        chapter: chapter,
        lessons: {},
        quizzes: {}
      };

      // Export lessons and quizzes
      const lessons = await this.getLessons(bookId, chapterId);
      if (lessons && lessons.length > 0) {
        data.lessons[`${bookId}_${chapterId}`] = lessons;

        for (const lesson of lessons) {
          const quiz = await this.getQuiz(bookId, chapterId, lesson.id);
          if (quiz) {
            data.quizzes[`${bookId}_${chapterId}_${lesson.id}`] = quiz;
          }
        }
      }

      return data;
    } catch (error) {
      console.error(`Error exporting chapter ${chapterId}:`, error);
      return null;
    }
  }

  // ✅ NEW: Export a specific Lesson with its quiz
  async exportLesson(bookId, chapterId, lessonId) {
    if (!(await this.isAvailable())) return null;

    try {
      // Get lesson
      const lessons = await this.getLessons(bookId, chapterId);
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) {
        throw new Error(`Lesson not found: ${lessonId}`);
      }

      // Get book and chapter info
      const book = await this.getBook(bookId);
      const chapters = await this.getChapters(bookId);
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (!book || !chapter) {
        throw new Error(`Book or Chapter not found`);
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'lesson',
        level: book.level,
        book: book,
        chapter: chapter,
        lesson: lesson,
        quiz: null
      };

      // Export quiz if exists
      const quiz = await this.getQuiz(bookId, chapterId, lessonId);
      if (quiz) {
        data.quiz = quiz;
      }

      return data;
    } catch (error) {
      console.error(`Error exporting lesson ${lessonId}:`, error);
      return null;
    }
  }

  // ✅ NEW: Export a specific Quiz
  async exportQuiz(bookId, chapterId, lessonId) {
    if (!(await this.isAvailable())) return null;

    try {
      // Get quiz
      const quiz = await this.getQuiz(bookId, chapterId, lessonId);
      if (!quiz) {
        throw new Error(`Quiz not found`);
      }

      // Get book, chapter, lesson info
      const book = await this.getBook(bookId);
      const chapters = await this.getChapters(bookId);
      const chapter = chapters.find(ch => ch.id === chapterId);
      const lessons = await this.getLessons(bookId, chapterId);
      const lesson = lessons.find(l => l.id === lessonId);
      if (!book || !chapter || !lesson) {
        throw new Error(`Book, Chapter, or Lesson not found`);
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'quiz',
        level: book.level,
        book: book,
        chapter: chapter,
        lesson: lesson,
        quiz: quiz
      };

      return data;
    } catch (error) {
      console.error(`Error exporting quiz:`, error);
      return null;
    }
  }

  // ✅ NEW: Export a specific Exam
  async exportExam(level, examId) {
    if (!(await this.isAvailable())) {
      console.error('❌ IndexedDB not available');
      return null;
    }

    try {
      console.log(`🔍 Getting exam: ${level}/${examId}`);
      const exam = await this.getExam(level, examId);
      console.log(`📦 Exam data retrieved:`, exam ? 'Found' : 'Not found', exam);
      
      if (!exam) {
        console.warn(`⚠️ Exam not found in IndexedDB full data: ${level}/${examId}`);
        // Try to get from exams list (metadata only)
        const examsList = await this.getExams(level);
        console.log(`📋 Exams list for ${level}:`, examsList);
        const examMeta = examsList?.find(e => e.id === examId);
        console.log(`🔍 Looking for examId "${examId}" in list:`, examMeta);
        
        if (examMeta) {
          console.warn(`⚠️ Found exam metadata but no full data. Exam may not have questions yet.`);
          // Return metadata with empty sections - still allow export
          return {
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            type: 'exam',
            level: level,
            examId: examId,
            exam: {
              title: examMeta.title,
              date: examMeta.date,
              status: examMeta.status,
              imageUrl: examMeta.imageUrl || '',
              knowledge: { sections: [] },
              listening: { sections: [] }
            },
            examMetadata: examMeta,
            warning: 'Exam chỉ có metadata, chưa có câu hỏi. Vui lòng nhập câu hỏi trong mục "Quản lý Đề thi".'
          };
        }
        // If not found in metadata either, return null (will be handled by caller)
        console.error(`❌ Exam not found in metadata list either: ${level}/${examId}`);
        console.error(`   Available exam IDs:`, examsList?.map(e => e.id) || 'No exams');
        return null;
      }

      // Check if exam has actual content
      const hasContent = (exam.knowledge && exam.knowledge.sections && exam.knowledge.sections.length > 0) ||
                        (exam.listening && exam.listening.sections && exam.listening.sections.length > 0);
      
      if (!hasContent) {
        console.warn(`⚠️ Exam found but has no questions: ${level}/${examId}`);
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'exam',
        level: level,
        examId: examId,
        exam: exam
      };

      console.log(`✅ Exam export data prepared:`, {
        hasKnowledge: !!(exam.knowledge?.sections?.length),
        hasListening: !!(exam.listening?.sections?.length),
        knowledgeSections: exam.knowledge?.sections?.length || 0,
        listeningSections: exam.listening?.sections?.length || 0
      });

      return data;
    } catch (error) {
      console.error(`❌ Error exporting exam ${level}/${examId}:`, error);
      return null;
    }
  }

  // ✅ NEW: Export exams by year (e.g., all 2024 exams for a level)
  async exportExamByYear(level, year) {
    if (!(await this.isAvailable())) return null;

    try {
      const exams = await this.getExams(level);
      if (!exams || exams.length === 0) {
        throw new Error(`No exams found for level ${level}`);
      }

      // Filter exams by year (examId format: YYYY-MM)
      const yearExams = exams.filter(exam => exam.id.startsWith(year));
      
      if (yearExams.length === 0) {
        throw new Error(`No exams found for year ${year} in level ${level}`);
      }

      // Get full exam data for each exam
      const examsData = {};
      for (const exam of yearExams) {
        const fullExam = await this.getExam(level, exam.id);
        if (fullExam) {
          examsData[exam.id] = fullExam;
        }
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'exam-year',
        level: level,
        year: year,
        exams: examsData,
        examMetadata: yearExams
      };

      return data;
    } catch (error) {
      console.error(`Error exporting exams by year ${year} for level ${level}:`, error);
      return null;
    }
  }

  // ✅ NEW: Export a specific exam section (knowledge or listening)
  async exportExamSection(level, examId, sectionType) {
    if (!(await this.isAvailable())) return null;

    try {
      const exam = await this.getExam(level, examId);
      if (!exam) {
        throw new Error(`Exam not found: ${level}/${examId}`);
      }

      if (!exam[sectionType]) {
        throw new Error(`Section ${sectionType} not found in exam ${level}/${examId}`);
      }

      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'exam-section',
        level: level,
        examId: examId,
        sectionType: sectionType,
        section: exam[sectionType],
        examMetadata: {
          title: exam.title || '',
          date: exam.date || '',
          status: exam.status || ''
        }
      };

      return data;
    } catch (error) {
      console.error(`Error exporting exam section ${sectionType} for ${level}/${examId}:`, error);
      return null;
    }
  }

  /**
   * Export users data
   * @param {boolean} includePassword - Có bao gồm password không (mặc định: false)
   * @returns {Array} - Array of users (with or without password)
   */
  exportUsers(includePassword = false) {
    try {
      // Sử dụng static users từ import để lấy password

      const savedUsers = localStorage.getItem('adminUsers');
      let users = [];
      
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        
        if (includePassword) {
          // Merge với static users để lấy password
          users = parsed.map(savedUser => {
            const originalUser = staticUsers.find(
              u => u.id === savedUser.id || u.username === savedUser.username
            );
            // Nếu có trong static file → lấy password từ đó
            // Nếu không → user mới, không có password (sẽ null)
            return originalUser 
              ? { ...savedUser, password: originalUser.password }
              : { ...savedUser, password: null }; // User mới, không có password trong static file
          });
          
          // Thêm users từ static file nếu chưa có trong localStorage
          staticUsers.forEach(staticUser => {
            if (!users.find(u => u.id === staticUser.id || u.username === staticUser.username)) {
              users.push(staticUser);
            }
          });
        } else {
          // Không bao gồm password
          users = parsed.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });
        }
      } else {
        // Không có trong localStorage, dùng static users
        if (includePassword) {
          users = staticUsers;
        } else {
          users = staticUsers.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error exporting users:', error);
      return [];
    }
  }

  // ✅ NEW: Export data by date range
  async exportByDateRange(startDate, endDate, dataTypes = ['all'], includeRelated = false, includeUsers = false, includeUserPasswords = false) {
    if (!(await this.isAvailable())) return null;

    try {
      const data = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        type: 'date-range',
        dateRange: {
          from: startDate,
          to: endDate
        },
        dataTypes: dataTypes,
        includeRelated: includeRelated,
        includeUsers: includeUsers,
        includeUserPasswords: includeUserPasswords,
        books: {},
        series: {},
        chapters: {},
        lessons: {},
        quizzes: {},
        exams: {},
        levelConfigs: {},
        users: [] // Users data (có thể có hoặc không có password tùy option)
      };

      const exportAll = dataTypes.includes('all');

      // Export Books
      if (exportAll || dataTypes.includes('books')) {
        const booksTx = this.db.transaction('books', 'readonly');
        const booksStore = booksTx.objectStore('books');
        const allBooks = await booksStore.getAll();
        
        for (const book of allBooks) {
          if (this.isInDateRange(book, startDate, endDate, 'createdAt')) {
            const level = book.level;
            if (!data.books[level]) data.books[level] = [];
            data.books[level].push(book);
            
            // Include related data if requested
            if (includeRelated) {
              const chapters = await this.getChapters(book.id);
              if (chapters && chapters.length > 0) {
                data.chapters[book.id] = chapters;
                
                for (const chapter of chapters) {
                  const lessons = await this.getLessons(book.id, chapter.id);
                  if (lessons && lessons.length > 0) {
                    data.lessons[`${book.id}_${chapter.id}`] = lessons;
                    
                    for (const lesson of lessons) {
                      const quiz = await this.getQuiz(book.id, chapter.id, lesson.id);
                      if (quiz) {
                        data.quizzes[`${book.id}_${chapter.id}_${lesson.id}`] = quiz;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Export Series
      if (exportAll || dataTypes.includes('series')) {
        const seriesTx = this.db.transaction('series', 'readonly');
        const seriesStore = seriesTx.objectStore('series');
        const allSeries = await seriesStore.getAll();
        
        for (const s of allSeries) {
          if (this.isInDateRange(s, startDate, endDate, 'createdAt')) {
            const level = s.level;
            if (!data.series[level]) data.series[level] = [];
            data.series[level].push(s);
          }
        }
      }

      // Export Chapters (if not included via books)
      if ((exportAll || dataTypes.includes('chapters')) && !includeRelated) {
        const chaptersTx = this.db.transaction('chapters', 'readonly');
        const chaptersStore = chaptersTx.objectStore('chapters');
        const allChapters = await chaptersStore.getAll();
        
        for (const ch of allChapters) {
          // Check if any chapter in the array is in date range
          const hasInRange = ch.chapters?.some(chapter => 
            this.isInDateRange(chapter, startDate, endDate, 'createdAt')
          );
          
          if (hasInRange) {
            // Filter chapters in range
            const filteredChapters = ch.chapters.filter(chapter =>
              this.isInDateRange(chapter, startDate, endDate, 'createdAt')
            );
            if (filteredChapters.length > 0) {
              data.chapters[ch.bookId] = filteredChapters;
            }
          }
        }
      }

      // Export Lessons (if not included via books)
      if ((exportAll || dataTypes.includes('lessons')) && !includeRelated) {
        const lessonsTx = this.db.transaction('lessons', 'readonly');
        const lessonsStore = lessonsTx.objectStore('lessons');
        const allLessons = await lessonsStore.getAll();
        
        for (const lesson of allLessons) {
          const hasInRange = lesson.lessons?.some(l =>
            this.isInDateRange(l, startDate, endDate, 'createdAt')
          );
          
          if (hasInRange) {
            const filteredLessons = lesson.lessons.filter(l =>
              this.isInDateRange(l, startDate, endDate, 'createdAt')
            );
            if (filteredLessons.length > 0) {
              const key = `${lesson.bookId}_${lesson.chapterId}`;
              data.lessons[key] = filteredLessons;
            }
          }
        }
      }

      // Export Quizzes
      if (exportAll || dataTypes.includes('quizzes')) {
        const quizzesTx = this.db.transaction('quizzes', 'readonly');
        const quizzesStore = quizzesTx.objectStore('quizzes');
        const allQuizzes = await quizzesStore.getAll();
        
        for (const quiz of allQuizzes) {
          if (this.isInDateRange(quiz, startDate, endDate, 'createdAt')) {
            const key = `${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId || quiz.chapterId}`;
            data.quizzes[key] = quiz;
          }
        }
      }

      // Export Exams (use 'date' field for exams, fallback to createdAt)
      if (exportAll || dataTypes.includes('exams')) {
        const examsTx = this.db.transaction('exams', 'readonly');
        const examsStore = examsTx.objectStore('exams');
        const allExams = await examsStore.getAll();
        
        for (const exam of allExams) {
          // For exams, check both 'date' and 'createdAt'
          const inRange = this.isInDateRange(exam, startDate, endDate, 'date') ||
                         this.isInDateRange(exam, startDate, endDate, 'createdAt');
          
          if (inRange) {
            const key = `${exam.level}_${exam.examId}`;
            data.exams[key] = exam;
          }
        }
      }

      // Export Users (if requested)
      if (includeUsers) {
        const users = this.exportUsers(includeUserPasswords);
        data.users = users;
        if (includeUserPasswords) {
          const usersWithPassword = users.filter(u => u.password).length;
          const usersWithoutPassword = users.filter(u => !u.password).length;
          console.log(`✅ Exported ${users.length} users (${usersWithPassword} with password, ${usersWithoutPassword} without password)`);
          if (usersWithoutPassword > 0) {
            console.warn(`⚠️ ${usersWithoutPassword} users không có password (users mới hoặc đã đổi password)`);
          }
        } else {
          console.log(`✅ Exported ${users.length} users (metadata only, no passwords)`);
        }
      }

      // Count summary
      const summary = {
        books: Object.values(data.books).flat().length,
        series: Object.values(data.series).flat().length,
        chapters: Object.keys(data.chapters).length,
        lessons: Object.keys(data.lessons).length,
        quizzes: Object.keys(data.quizzes).length,
        exams: Object.keys(data.exams).length,
        users: includeUsers ? data.users.length : 0
      };
      
      data.summary = summary;

      return data;
    } catch (error) {
      console.error('Error exporting by date range:', error);
      return null;
    }
  }

  // ✅ NEW: Import a specific item (Series, Book, Chapter, Lesson, Quiz, or Exam)
  async importItem(data) {
    if (!(await this.isAvailable())) return { success: false, error: 'IndexedDB not available' };

    try {
      if (data.type === 'series') {
        // Import series
        const series = await this.getSeries(data.level);
        const updatedSeries = series.filter(s => s.id !== data.series.id);
        updatedSeries.push(data.series);
        await this.saveSeries(data.level, updatedSeries);

        // Import books
        if (data.books && Array.isArray(data.books)) {
          const books = await this.getBooks(data.level);
          const updatedBooks = books.filter(b => !data.books.find(db => db.id === b.id));
          updatedBooks.push(...data.books);
          await this.saveBooks(data.level, updatedBooks);
        }

        // Import chapters, lessons, quizzes
        if (data.chapters) {
          for (const bookId in data.chapters) {
            await this.saveChapters(bookId, data.chapters[bookId]);
          }
        }
        if (data.lessons) {
          for (const key in data.lessons) {
            const [bookId, chapterId] = key.split('_');
            await this.saveLessons(bookId, chapterId, data.lessons[key]);
          }
        }
        if (data.quizzes) {
          for (const key in data.quizzes) {
            const quiz = data.quizzes[key];
            const lessonId = quiz.lessonId || quiz.chapterId;
            await this.saveQuiz(quiz.bookId, quiz.chapterId, lessonId, quiz);
          }
        }

        return { success: true, imported: 'series' };
      } else if (data.type === 'book') {
        // Import book
        const books = await this.getBooks(data.level);
        const updatedBooks = books.filter(b => b.id !== data.book.id);
        updatedBooks.push(data.book);
        await this.saveBooks(data.level, updatedBooks);

        // Import chapters, lessons, quizzes
        if (data.chapters) {
          for (const bookId in data.chapters) {
            await this.saveChapters(bookId, data.chapters[bookId]);
          }
        }
        if (data.lessons) {
          for (const key in data.lessons) {
            const [bookId, chapterId] = key.split('_');
            await this.saveLessons(bookId, chapterId, data.lessons[key]);
          }
        }
        if (data.quizzes) {
          for (const key in data.quizzes) {
            const quiz = data.quizzes[key];
            const lessonId = quiz.lessonId || quiz.chapterId;
            await this.saveQuiz(quiz.bookId, quiz.chapterId, lessonId, quiz);
          }
        }

        return { success: true, imported: 'book' };
      } else if (data.type === 'chapter') {
        // Import book if needed
        const books = await this.getBooks(data.level);
        if (!books.find(b => b.id === data.book.id)) {
          books.push(data.book);
          await this.saveBooks(data.level, books);
        }

        // Import chapter
        const chapters = await this.getChapters(data.book.id);
        const updatedChapters = chapters.filter(ch => ch.id !== data.chapter.id);
        updatedChapters.push(data.chapter);
        await this.saveChapters(data.book.id, updatedChapters);

        // Import lessons, quizzes
        if (data.lessons) {
          for (const key in data.lessons) {
            const [bookId, chapterId] = key.split('_');
            await this.saveLessons(bookId, chapterId, data.lessons[key]);
          }
        }
        if (data.quizzes) {
          for (const key in data.quizzes) {
            const quiz = data.quizzes[key];
            const lessonId = quiz.lessonId || quiz.chapterId;
            await this.saveQuiz(quiz.bookId, quiz.chapterId, lessonId, quiz);
          }
        }

        return { success: true, imported: 'chapter' };
      } else if (data.type === 'lesson') {
        // Import book and chapter if needed
        const books = await this.getBooks(data.level);
        if (!books.find(b => b.id === data.book.id)) {
          books.push(data.book);
          await this.saveBooks(data.level, books);
        }
        const chapters = await this.getChapters(data.book.id);
        if (!chapters.find(ch => ch.id === data.chapter.id)) {
          chapters.push(data.chapter);
          await this.saveChapters(data.book.id, chapters);
        }

        // Import lesson
        const lessons = await this.getLessons(data.book.id, data.chapter.id);
        const updatedLessons = lessons.filter(l => l.id !== data.lesson.id);
        updatedLessons.push(data.lesson);
        await this.saveLessons(data.book.id, data.chapter.id, updatedLessons);

        // Import quiz if exists
        if (data.quiz) {
          await this.saveQuiz(data.book.id, data.chapter.id, data.lesson.id, data.quiz);
        }

        return { success: true, imported: 'lesson' };
      } else if (data.type === 'quiz') {
        // Import book, chapter, lesson if needed
        const books = await this.getBooks(data.level);
        if (!books.find(b => b.id === data.book.id)) {
          books.push(data.book);
          await this.saveBooks(data.level, books);
        }
        const chapters = await this.getChapters(data.book.id);
        if (!chapters.find(ch => ch.id === data.chapter.id)) {
          chapters.push(data.chapter);
          await this.saveChapters(data.book.id, chapters);
        }
        const lessons = await this.getLessons(data.book.id, data.chapter.id);
        if (!lessons.find(l => l.id === data.lesson.id)) {
          lessons.push(data.lesson);
          await this.saveLessons(data.book.id, data.chapter.id, lessons);
        }

        // Import quiz
        await this.saveQuiz(data.book.id, data.chapter.id, data.lesson.id, data.quiz);

        return { success: true, imported: 'quiz' };
      } else if (data.type === 'exam') {
        // Import exam
        await this.saveExam(data.level, data.examId, data.exam);
        return { success: true, imported: 'exam' };
      } else if (data.type === 'exam-year') {
        // Import exams by year
        for (const examId in data.exams) {
          await this.saveExam(data.level, examId, data.exams[examId]);
        }
        return { success: true, imported: `exam-year (${Object.keys(data.exams).length} exams)` };
      } else if (data.type === 'exam-section') {
        // Import exam section - need to get existing exam first
        const existingExam = await this.getExam(data.level, data.examId);
        if (!existingExam) {
          // Create new exam with just this section
          await this.saveExam(data.level, data.examId, {
            title: data.examMetadata?.title || '',
            date: data.examMetadata?.date || '',
            status: data.examMetadata?.status || 'Có sẵn',
            [data.sectionType]: data.section
          });
        } else {
          // Update existing exam with new section
          existingExam[data.sectionType] = data.section;
          await this.saveExam(data.level, data.examId, existingExam);
        }
        return { success: true, imported: `exam-section (${data.sectionType})` };
      } else {
        throw new Error(`Unknown import type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error importing item:', error);
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

      // Clear lessons
      const lessonsTx = this.db.transaction('lessons', 'readwrite');
      const lessonsStore = lessonsTx.objectStore('lessons');
      await lessonsStore.clear();
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

      // Clear level configs
      const configsTx = this.db.transaction('levelConfigs', 'readwrite');
      const configsStore = configsTx.objectStore('levelConfigs');
      await configsStore.clear();
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
      const stores = ['books', 'series', 'chapters', 'lessons', 'quizzes', 'exams'];
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

