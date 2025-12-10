// src/services/contentService.js
// Service để lưu và đọc content (books, chapters, lessons, quizzes) từ Supabase

import { supabase } from './supabaseClient.js';

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
 * @param {string} bookId - Book ID
 * @param {string} level - Level
 * @param {Array} chapters - Array of chapters
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function saveChapters(bookId, level, chapters, userId) {
  try {
    // Delete existing chapters for this book
    await supabase
      .from('chapters')
      .delete()
      .eq('book_id', bookId)
      .eq('level', level);

    // Insert new chapters
    const chaptersData = chapters.map((chapter, index) => ({
      id: chapter.id,
      book_id: bookId,
      level: level,
      title: chapter.title,
      description: chapter.description || null,
      order_index: chapter.orderIndex !== undefined ? chapter.orderIndex : index,
      created_by: userId,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('chapters')
      .insert(chaptersData)
      .select();

    if (error) {
      console.error('[ContentService] Error saving chapters:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved chapters to Supabase:', data.length);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
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
 * @param {string} bookId - Book ID
 * @param {string} chapterId - Chapter ID
 * @param {string} level - Level
 * @param {Array} lessons - Array of lessons
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function saveLessons(bookId, chapterId, level, lessons, userId) {
  try {
    // Delete existing lessons for this chapter
    await supabase
      .from('lessons')
      .delete()
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('level', level);

    // Insert new lessons
    const lessonsData = lessons.map((lesson, index) => ({
      id: lesson.id,
      book_id: bookId,
      chapter_id: chapterId,
      level: level,
      title: lesson.title,
      description: lesson.description || null,
      content_type: lesson.contentType || 'pdf',
      pdf_url: lesson.pdfUrl || null,
      html_content: lesson.htmlContent || null,
      theory: lesson.theory || {},
      srs: lesson.srs || {},
      order_index: lesson.orderIndex !== undefined ? lesson.orderIndex : index,
      created_by: userId,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonsData)
      .select();

    if (error) {
      console.error('[ContentService] Error saving lessons:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved lessons to Supabase:', data.length);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
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
    const { data, error } = await supabase
      .from('quizzes')
      .upsert({
        id: quiz.id || `${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId}`,
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
      }, {
        onConflict: 'id,book_id,chapter_id,lesson_id,level'
      })
      .select()
      .single();

    if (error) {
      console.error('[ContentService] Error saving quiz:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved quiz to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
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
    return { success: false, error: err };
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
    return { success: false, error: err };
  }
}

/**
 * Save series to Supabase
 * @param {string} level - Level
 * @param {Array} series - Array of series
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function saveSeries(level, series, userId) {
  try {
    // Delete existing series for this level
    await supabase
      .from('series')
      .delete()
      .eq('level', level);

    // Insert new series
    const seriesData = series.map((s, index) => ({
      id: s.id,
      level: level,
      name: s.name,
      description: s.description || null,
      image_url: s.imageUrl || null,
      order_index: s.orderIndex !== undefined ? s.orderIndex : index,
      created_by: userId,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('series')
      .insert(seriesData)
      .select();

    if (error) {
      console.error('[ContentService] Error saving series:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved series to Supabase:', data.length);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
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

