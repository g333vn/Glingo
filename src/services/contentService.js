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
    const { data, error } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        level: book.level,
        title: book.title,
        description: book.description || null,
        image_url: book.imageUrl || null,
        series_id: book.seriesId || null,
        order_index: book.orderIndex || 0,
        created_by: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id,level'
      })
      .select()
      .single();

    if (error) {
      console.error('[ContentService] Error saving book:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved book to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
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
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('level', level)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[ContentService] Error fetching books:', error);
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
      orderIndex: book.order_index
    }));

    return { success: true, data: books };
  } catch (err) {
    console.error('[ContentService] Unexpected error:', err);
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

