// src/services/contentService.js
// Service để lưu và đọc content (books, chapters, lessons, quizzes) từ Supabase

import { supabase } from './supabaseClient.js';
import { safeSaveCollection } from '../utils/safeSaveHelper.js';

/**
 * Save book to Supabase
 * @param {Object} book - Book data
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveBook(book, userId) {
  try {
    console.log('[ContentService.saveBook] 💾 Saving book:', book.id, book.title, 'category:', book.category);

    const { data, error } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        level: book.level,
        title: book.title,
        description: book.description || null,
        image_url: book.imageUrl || null,
        series_id: book.seriesId || null,
        // ❗ Không ghi field `category` lên Supabase vì bảng `books` hiện chưa có cột này.
        //    Category chỉ dùng phía client, dựa trên seriesId/series.name.
        placeholder_version: book.placeholderVersion || 1, // ✅ NEW: Placeholder design version (1-10)
        order_index: book.orderIndex || 0,
        created_by: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id,level'
      })
      .select()
      .single();

    if (error) {
      console.error('[ContentService] ❌ Error saving book:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved book to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] ❌ Unexpected error in saveBook:', err);
    return { success: false, error: err };
  }
}

/**
 * Get books by level
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getBooks(level) {
  try {
    console.log('[ContentService.getBooks] 🔍 Loading books for level:', level);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('level', level)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[ContentService] ❌ Error fetching books:', error);
      return { success: false, error };
    }

    // Transform to app format
    const books = (data || []).map(book => ({
      id: book.id,
      level: book.level,
      title: book.title,
      description: book.description,
      imageUrl: book.image_url,
      seriesId: book.series_id,
      category: book.category || null, // ✅ Include category field from Supabase
      placeholderVersion: book.placeholder_version || 1, // ✅ NEW: Placeholder design version (1-10, default 1)
      orderIndex: book.order_index
    }));

    console.log('[ContentService.getBooks] ✅ Loaded', books.length, 'books from Supabase:', books.map(b => ({ id: b.id, title: b.title, category: b.category })));
    return { success: true, data: books };
  } catch (err) {
    console.error('[ContentService] ❌ Unexpected error in getBooks:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete book and all related content (chapters, lessons, quizzes) from Supabase
 * @param {string} bookId - Book ID
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, error?: Object}>}
 */
export async function deleteBookCascade(bookId, level) {
  try {
    console.log('[ContentService.deleteBookCascade] 🗑️ Deleting book and related content:', { bookId, level });

    // 1. Delete quizzes for this book (any chapter / lesson)
    const { error: quizError } = await supabase
      .from('quizzes')
      .delete()
      .eq('book_id', bookId)
      .eq('level', level);
    if (quizError) {
      console.warn('[ContentService.deleteBookCascade] ⚠️ Error deleting quizzes:', quizError);
    }

    // 2. Delete lessons for this book
    const { error: lessonError } = await supabase
      .from('lessons')
      .delete()
      .eq('book_id', bookId)
      .eq('level', level);
    if (lessonError) {
      console.warn('[ContentService.deleteBookCascade] ⚠️ Error deleting lessons:', lessonError);
    }

    // 3. Delete chapters for this book
    const { error: chapterError } = await supabase
      .from('chapters')
      .delete()
      .eq('book_id', bookId)
      .eq('level', level);
    if (chapterError) {
      console.warn('[ContentService.deleteBookCascade] ⚠️ Error deleting chapters:', chapterError);
    }

    // 4. Finally delete the book itself
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('level', level);
    if (bookError) {
      console.error('[ContentService.deleteBookCascade] ❌ Error deleting book:', bookError);
      return { success: false, error: bookError };
    }

    console.log('[ContentService.deleteBookCascade] ✅ Book and related content deleted:', { bookId, level });
    return { success: true };
  } catch (err) {
    console.error('[ContentService.deleteBookCascade] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Save chapters to Supabase
 * ✅ FIXED: Sử dụng safe save với merge thông minh để tránh mất dữ liệu
 * @param {string} bookId - Book ID
 * @param {string} level - Level
 * @param {Array} chapters - Array of chapters
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function saveChapters(bookId, level, chapters, userId) {
  try {
    console.log('[ContentService.saveChapters] 💾 Saving chapters with safe merge:', {
      bookId,
      level,
      chaptersCount: chapters?.length || 0
    });

    // ✅ FIXED: Load từ Supabase trước (source of truth)
    const getExisting = async () => {
      return await getChapters(bookId, level);
    };

    // ✅ FIXED: Dùng safeSaveCollection để merge thông minh
    // Tạo map index để preserve order
    const indexMap = new Map(chapters.map((ch, idx) => [ch.id, idx]));
    
    const result = await safeSaveCollection({
      tableName: 'chapters',
      getExistingFn: getExisting,
      newItems: chapters,
      compareKey: 'id',
      transformFn: (chapter, context) => {
        const index = indexMap.get(chapter.id) || 0;
        return {
          id: chapter.id,
          book_id: context.bookId,
          level: context.level,
          title: chapter.title,
          description: chapter.description || null,
          order_index: chapter.orderIndex !== undefined ? chapter.orderIndex : index,
          created_by: context.userId,
          updated_at: new Date().toISOString()
        };
      },
      userId,
      context: { bookId, level, userId },
      onConflict: null, // ✅ FIXED: Không dùng onConflict cho composite key - Supabase tự detect
      deleteWhere: { book_id: bookId, level: level } // Chỉ xóa chapters của book này
    });

    if (!result.success) {
      console.error('[ContentService.saveChapters] ❌ Error saving chapters:', result.error);
      return { success: false, error: result.error };
    }

    // Load lại để return data đầy đủ (backward compatible)
    const { success: loadSuccess, data: savedChapters } = await getChapters(bookId, level);
    
    if (!loadSuccess) {
      console.warn('[ContentService.saveChapters] ⚠️ Saved but failed to reload chapters');
      return { success: true, data: [] };
    }

    console.log('[ContentService.saveChapters] ✅ Saved chapters safely:', {
      total: savedChapters.length,
      inserted: result.data.inserted,
      updated: result.data.updated,
      deleted: result.data.deleted,
      unchanged: result.data.unchanged
    });

    return { success: true, data: savedChapters };
  } catch (err) {
    console.error('[ContentService.saveChapters] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get chapters by book
 * @param {string} bookId - Book ID
 * @param {string} level - Level
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getChapters(bookId, level) {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .eq('level', level)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[ContentService] Error fetching chapters:', error);
      return { success: false, error };
    }

    // Transform to app format
    const chapters = (data || []).map(chapter => ({
      id: chapter.id,
      bookId: chapter.book_id,
      level: chapter.level,
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.order_index
    }));

    return { success: true, data: chapters };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Save lessons to Supabase
 * ✅ FIXED: Sử dụng safe save với merge thông minh để tránh mất dữ liệu
 * @param {string} bookId - Book ID
 * @param {string} chapterId - Chapter ID
 * @param {string} level - Level
 * @param {Array} lessons - Array of lessons
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function saveLessons(bookId, chapterId, level, lessons, userId) {
  try {
    console.log('[ContentService.saveLessons] 💾 Saving lessons with safe merge:', {
      bookId,
      chapterId,
      level,
      lessonsCount: lessons?.length || 0
    });

    // ✅ FIXED: Load từ Supabase trước (source of truth)
    const getExisting = async () => {
      return await getLessons(bookId, chapterId, level);
    };

    // ✅ FIXED: Dùng safeSaveCollection để merge thông minh
    // Tạo map index để preserve order
    const indexMap = new Map(lessons.map((lesson, idx) => [lesson.id, idx]));
    
    const result = await safeSaveCollection({
      tableName: 'lessons',
      getExistingFn: getExisting,
      newItems: lessons,
      compareKey: 'id',
      transformFn: (lesson, context) => {
        const index = indexMap.get(lesson.id) || 0;
        // ✅ FIXED: Priority: orderIndex > order > index
        let orderIndex = lesson.orderIndex;
        if (orderIndex === undefined || orderIndex === null) {
          orderIndex = lesson.order !== undefined && lesson.order !== null ? lesson.order : index;
        }
        
        return {
          id: lesson.id,
          book_id: context.bookId,
          chapter_id: context.chapterId,
          level: context.level,
          title: lesson.title,
          description: lesson.description || null,
          content_type: lesson.contentType || 'pdf',
          pdf_url: lesson.pdfUrl || null,
          html_content: lesson.htmlContent || null,
          theory: lesson.theory || {},
          srs: lesson.srs || {},
          order_index: orderIndex,
          created_by: context.userId,
          updated_at: new Date().toISOString()
        };
      },
      userId,
      context: { bookId, chapterId, level, userId },
      onConflict: null, // ✅ FIXED: Không dùng onConflict cho composite key - Supabase tự detect
      deleteWhere: { book_id: bookId, chapter_id: chapterId, level: level } // Chỉ xóa lessons của chapter này
    });

    if (!result.success) {
      console.error('[ContentService.saveLessons] ❌ Error saving lessons:', result.error);
      return { success: false, error: result.error };
    }

    // Load lại để return data đầy đủ (backward compatible)
    const { success: loadSuccess, data: savedLessons } = await getLessons(bookId, chapterId, level);
    
    if (!loadSuccess) {
      console.warn('[ContentService.saveLessons] ⚠️ Saved but failed to reload lessons');
      return { success: true, data: [] };
    }

    console.log('[ContentService.saveLessons] ✅ Saved lessons safely:', {
      total: savedLessons.length,
      inserted: result.data.inserted,
      updated: result.data.updated,
      deleted: result.data.deleted,
      unchanged: result.data.unchanged
    });

    return { success: true, data: savedLessons };
  } catch (err) {
    console.error('[ContentService.saveLessons] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get lessons by chapter
 * @param {string} bookId - Book ID
 * @param {string} chapterId - Chapter ID
 * @param {string} level - Level
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getLessons(bookId, chapterId, level) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('level', level)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[ContentService] Error fetching lessons:', error);
      return { success: false, error };
    }

    // Transform to app format
    const lessons = (data || []).map(lesson => ({
      id: lesson.id,
      bookId: lesson.book_id,
      chapterId: lesson.chapter_id,
      level: lesson.level,
      title: lesson.title,
      description: lesson.description,
      contentType: lesson.content_type,
      pdfUrl: lesson.pdf_url,
      htmlContent: lesson.html_content,
      theory: lesson.theory,
      srs: lesson.srs,
      orderIndex: lesson.order_index
    }));

    return { success: true, data: lessons };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Save quiz to Supabase
 * @param {Object} quiz - Quiz data
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveQuiz(quiz, userId) {
  try {
    const quizId = quiz.id || `${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId}`;
    
    console.log('[ContentService.saveQuiz] 🔍 Attempting to save quiz:', {
      id: quizId,
      bookId: quiz.bookId,
      chapterId: quiz.chapterId,
      lessonId: quiz.lessonId,
      level: quiz.level,
      title: quiz.title,
      questionsCount: quiz.questions?.length || 0,
      userId: userId ? `${userId.substring(0, 8)}...` : 'NULL'
    });
    
    // ✅ NEW: Tự động tạo book/chapter/lesson nếu chưa có (để tránh foreign key error)
    // Thứ tự: Book → Chapter → Lesson (vì foreign key constraints)
    
    // 1. Kiểm tra và tạo book nếu chưa có
    console.log('[ContentService.saveQuiz] 🔍 Checking if book exists...');
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('id', quiz.bookId)
      .eq('level', quiz.level)
      .maybeSingle();
    
    if (!existingBook) {
      console.log('[ContentService.saveQuiz] ℹ️ Book does not exist, creating it...');
      const { error: createBookError } = await supabase
        .from('books')
        .insert({
          id: quiz.bookId,
          level: quiz.level,
          title: `Book ${quiz.bookId}`,
          created_by: userId,
          updated_at: new Date().toISOString()
        });
      
      if (createBookError) {
        console.warn('[ContentService.saveQuiz] ⚠️ Failed to create book (may already exist):', createBookError);
      } else {
        console.log('[ContentService.saveQuiz] ✅ Created book:', quiz.bookId);
      }
    }
    
    // 2. Kiểm tra và tạo chapter nếu chưa có
    console.log('[ContentService.saveQuiz] 🔍 Checking if chapter exists...');
    const { data: existingChapter } = await supabase
      .from('chapters')
      .select('id')
      .eq('id', quiz.chapterId)
      .eq('book_id', quiz.bookId)
      .eq('level', quiz.level)
      .maybeSingle();
    
    if (!existingChapter) {
      console.log('[ContentService.saveQuiz] ℹ️ Chapter does not exist, creating it...');
      const { error: createChapterError } = await supabase
        .from('chapters')
        .insert({
          id: quiz.chapterId,
          book_id: quiz.bookId,
          level: quiz.level,
          title: `Chapter ${quiz.chapterId}`,
          created_by: userId,
          updated_at: new Date().toISOString()
        });
      
      if (createChapterError) {
        console.warn('[ContentService.saveQuiz] ⚠️ Failed to create chapter (may already exist):', createChapterError);
      } else {
        console.log('[ContentService.saveQuiz] ✅ Created chapter:', quiz.chapterId);
      }
    }
    
    // 3. Kiểm tra và tạo lesson nếu chưa có
    console.log('[ContentService.saveQuiz] 🔍 Checking if lesson exists...');
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', quiz.lessonId)
      .eq('book_id', quiz.bookId)
      .eq('chapter_id', quiz.chapterId)
      .eq('level', quiz.level)
      .maybeSingle();
    
    if (!existingLesson) {
      console.log('[ContentService.saveQuiz] ℹ️ Lesson does not exist, creating it...');
      const { error: createLessonError } = await supabase
        .from('lessons')
        .insert({
          id: quiz.lessonId,
          book_id: quiz.bookId,
          chapter_id: quiz.chapterId,
          level: quiz.level,
          title: `Lesson ${quiz.lessonId}`, // Default title, can be updated later
          description: null,
          content_type: 'pdf',
          order_index: 0,
          created_by: userId,
          updated_at: new Date().toISOString()
        });
      
      if (createLessonError) {
        console.warn('[ContentService.saveQuiz] ⚠️ Failed to create lesson (may already exist):', createLessonError);
      } else {
        console.log('[ContentService.saveQuiz] ✅ Created lesson:', quiz.lessonId);
      }
    } else {
      console.log('[ContentService.saveQuiz] ✅ Lesson already exists');
    }
    
    const upsertData = {
      id: quizId,
      book_id: quiz.bookId,
      chapter_id: quiz.chapterId,
      lesson_id: quiz.lessonId,
      level: quiz.level,
      title: quiz.title,
      description: quiz.description || null,
      questions: quiz.questions || [],
      time_limit: quiz.timeLimit || null,
      passing_score: quiz.passingScore || 60,
      created_by: userId,
      updated_at: new Date().toISOString()
    };
    
    console.log('[ContentService.saveQuiz] 📤 Upsert data:', JSON.stringify(upsertData, null, 2));
    
    // ✅ FIXED: Bảng quizzes có composite primary key (id, book_id, chapter_id, lesson_id, level)
    // Lỗi 42P10: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
    // Nguyên nhân: Code đang dùng onConflict: 'id' nhưng id không phải unique constraint đơn lẻ
    // Giải pháp: Không dùng onConflict, Supabase sẽ tự detect composite primary key
    const { data, error } = await supabase
      .from('quizzes')
      .upsert(upsertData)
      .select()
      .single();

    if (error) {
      console.error('[ContentService.saveQuiz] ❌ Error saving quiz:', error);
      console.error('[ContentService.saveQuiz] ❌ Error code:', error.code);
      console.error('[ContentService.saveQuiz] ❌ Error message:', error.message);
      console.error('[ContentService.saveQuiz] ❌ Error details:', error.details);
      console.error('[ContentService.saveQuiz] ❌ Error hint:', error.hint);
      
      // ✅ NEW: Hiển thị thông tin chi tiết cho foreign key error
      if (error.code === '23503') {
        console.error('[ContentService.saveQuiz] ❌ Foreign Key Constraint Error!');
        console.error('[ContentService.saveQuiz] ❌ Quiz đang cố reference đến book/chapter/lesson không tồn tại');
        console.error('[ContentService.saveQuiz] ❌ Kiểm tra:');
        console.error('[ContentService.saveQuiz]   - book_id:', upsertData.book_id, 'level:', upsertData.level);
        console.error('[ContentService.saveQuiz]   - chapter_id:', upsertData.chapter_id);
        console.error('[ContentService.saveQuiz]   - lesson_id:', upsertData.lesson_id);
        console.error('[ContentService.saveQuiz] ❌ Vui lòng đảm bảo book/chapter/lesson tồn tại trong database');
        console.error('[ContentService.saveQuiz] ❌ Chạy script: fix_quizzes_foreign_key_error.sql để kiểm tra');
      }
      
      return { success: false, error };
    }

    console.log('[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase');
    console.log('[ContentService.saveQuiz] ✅ Saved data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService.saveQuiz] ❌ Unexpected error:', err);
    console.error('[ContentService.saveQuiz] ❌ Error stack:', err.stack);
    return { success: false, error: err };
  }
}

/**
 * Get quiz by lesson
 * @param {string} bookId - Book ID
 * @param {string} chapterId - Chapter ID
 * @param {string} lessonId - Lesson ID
 * @param {string} level - Level
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getQuiz(bookId, chapterId, lessonId, level) {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .eq('level', level)
      .maybeSingle();

    if (error) {
      // Not found is OK
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      // ✅ FIXED: Handle RLS/permission errors gracefully for anonymous users
      if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        console.warn('[ContentService] RLS/permission error (may be anonymous user):', error.message);
        // Return success with null data so caller can fallback to local storage
        return { success: true, data: null };
      }
      console.error('[ContentService] Error fetching quiz:', error);
      return { success: false, error };
    }

    if (!data) {
      return { success: true, data: null };
    }

    // Transform to app format
    const quiz = {
      id: data.id,
      bookId: data.book_id,
      chapterId: data.chapter_id,
      lessonId: data.lesson_id,
      level: data.level,
      title: data.title,
      description: data.description,
      questions: data.questions,
      timeLimit: data.time_limit,
      passingScore: data.passing_score
    };

    return { success: true, data: quiz };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
    // ✅ FIXED: Return success with null on error so caller can fallback
    return { success: true, data: null, error: err.message };
  }
}

/**
 * Get all quizzes by level from Supabase
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getAllQuizzesByLevel(level) {
  try {
    console.log('[ContentService.getAllQuizzesByLevel] 🔍 Loading quizzes for level:', level);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('level', level)
      .order('updated_at', { ascending: false });

    if (error) {
      // ✅ FIXED: Handle RLS/permission errors gracefully for anonymous users
      if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        console.warn('[ContentService] RLS/permission error (may be anonymous user):', error.message);
        // Return success with empty array so caller can fallback to local storage
        return { success: true, data: [] };
      }
      console.error('[ContentService] Error fetching quizzes:', error);
      return { success: false, error };
    }

    // Transform to app format
    const quizzes = (data || []).map(quiz => ({
      id: quiz.id,
      bookId: quiz.book_id,
      chapterId: quiz.chapter_id,
      lessonId: quiz.lesson_id,
      level: quiz.level,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      timeLimit: quiz.time_limit,
      passingScore: quiz.passing_score
    }));

    console.log('[ContentService.getAllQuizzesByLevel] ✅ Loaded', quizzes.length, 'quizzes from Supabase');
    return { success: true, data: quizzes };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
    // ✅ FIXED: Return success with empty array on error so caller can fallback
    return { success: true, data: [], error: err.message };
  }
}

/**
 * Save series to Supabase
 * ✅ FIXED: Sử dụng safe save với merge thông minh để tránh mất dữ liệu
 * @param {string} level - Level
 * @param {Array} series - Array of series
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function saveSeries(level, series, userId) {
  try {
    console.log('[ContentService.saveSeries] 💾 Saving series with safe merge:', {
      level,
      seriesCount: series?.length || 0
    });

    // ✅ FIXED: Load từ Supabase trước (source of truth)
    const getExisting = async () => {
      return await getSeries(level);
    };

    // ✅ FIXED: Dùng safeSaveCollection để merge thông minh
    // Tạo map index để preserve order
    const indexMap = new Map(series.map((s, idx) => [s.id, idx]));
    
    const result = await safeSaveCollection({
      tableName: 'series',
      getExistingFn: getExisting,
      newItems: series,
      compareKey: 'id',
      transformFn: (s, context) => {
        const index = indexMap.get(s.id) || 0;
        return {
          id: s.id,
          level: context.level,
          name: s.name,
          description: s.description || null,
          image_url: s.imageUrl || null,
          order_index: s.orderIndex !== undefined ? s.orderIndex : index,
          created_by: context.userId,
          updated_at: new Date().toISOString()
        };
      },
      userId,
      context: { level, userId },
      onConflict: null, // ✅ FIXED: Không dùng onConflict cho composite key - Supabase tự detect
      deleteWhere: { level: level } // Chỉ xóa series của level này
    });

    if (!result.success) {
      console.error('[ContentService.saveSeries] ❌ Error saving series:', result.error);
      return { success: false, error: result.error };
    }

    // Load lại để return data đầy đủ (backward compatible)
    const { success: loadSuccess, data: savedSeries } = await getSeries(level);
    
    if (!loadSuccess) {
      console.warn('[ContentService.saveSeries] ⚠️ Saved but failed to reload series');
      return { success: true, data: [] };
    }

    console.log('[ContentService.saveSeries] ✅ Saved series safely:', {
      total: savedSeries.length,
      inserted: result.data.inserted,
      updated: result.data.updated,
      deleted: result.data.deleted,
      unchanged: result.data.unchanged
    });

    return { success: true, data: savedSeries };
  } catch (err) {
    console.error('[ContentService.saveSeries] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get series by level
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getSeries(level) {
  try {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('level', level)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[ContentService] Error fetching series:', error);
      return { success: false, error };
    }

    // Transform to app format
    const series = (data || []).map(s => ({
      id: s.id,
      level: s.level,
      name: s.name,
      description: s.description,
      imageUrl: s.image_url,
      orderIndex: s.order_index
    }));

    return { success: true, data: series };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete series and all related content (books, chapters, lessons, quizzes) from Supabase
 * @param {string} seriesId - Series ID
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, error?: Object}>}
 */
export async function deleteSeriesCascade(seriesId, level) {
  try {
    console.log('[ContentService.deleteSeriesCascade] 🗑️ Deleting series and all related content:', { seriesId, level });

    // 1. Get all books in this series
    const { data: seriesBooks, error: booksError } = await supabase
      .from('books')
      .select('id')
      .eq('level', level)
      .eq('series_id', seriesId);

    if (booksError) {
      console.warn('[ContentService.deleteSeriesCascade] ⚠️ Error fetching books for series:', booksError);
    }

    const bookIds = (seriesBooks || []).map(book => book.id);
    console.log('[ContentService.deleteSeriesCascade] Found', bookIds.length, 'books in series');

    // 2. For each book, delete all related content (quizzes, lessons, chapters)
    for (const bookId of bookIds) {
      // Delete quizzes
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('book_id', bookId)
        .eq('level', level);
      if (quizError) {
        console.warn('[ContentService.deleteSeriesCascade] ⚠️ Error deleting quizzes for book', bookId, ':', quizError);
      }

      // Delete lessons
      const { error: lessonError } = await supabase
        .from('lessons')
        .delete()
        .eq('book_id', bookId)
        .eq('level', level);
      if (lessonError) {
        console.warn('[ContentService.deleteSeriesCascade] ⚠️ Error deleting lessons for book', bookId, ':', lessonError);
      }

      // Delete chapters
      const { error: chapterError } = await supabase
        .from('chapters')
        .delete()
        .eq('book_id', bookId)
        .eq('level', level);
      if (chapterError) {
        console.warn('[ContentService.deleteSeriesCascade] ⚠️ Error deleting chapters for book', bookId, ':', chapterError);
      }
    }

    // 3. Delete all books in this series
    if (bookIds.length > 0) {
      const { error: booksDeleteError } = await supabase
        .from('books')
        .delete()
        .eq('level', level)
        .eq('series_id', seriesId);
      
      if (booksDeleteError) {
        console.error('[ContentService.deleteSeriesCascade] ❌ Error deleting books:', booksDeleteError);
        return { success: false, error: booksDeleteError };
      }
    }

    // 4. Finally delete the series itself
    const { error: seriesError } = await supabase
      .from('series')
      .delete()
      .eq('id', seriesId)
      .eq('level', level);

    if (seriesError) {
      console.error('[ContentService.deleteSeriesCascade] ❌ Error deleting series:', seriesError);
      return { success: false, error: seriesError };
    }

    console.log('[ContentService.deleteSeriesCascade] ✅ Series and all related content deleted:', { seriesId, level, booksDeleted: bookIds.length });
    return { success: true, deletedBooks: bookIds.length };
  } catch (err) {
    console.error('[ContentService.deleteSeriesCascade] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

