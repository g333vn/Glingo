// src/services/quizResultsService.js
// Service để lưu và đọc chi tiết kết quả quiz từ Supabase
// 
// ⚠️ LƯU Ý: 
// - Service này được tạo sẵn nhưng CHƯA ĐƯỢC SỬ DỤNG
// - Code hiện tại vẫn dùng learning_progress (không thay đổi)
// - Tính năng mới sẽ được phát triển sau khi có đủ user
// ============================================

import { supabase } from './supabaseClient.js';
import { saveLearningProgress } from './learningProgressService.js';

/**
 * Lưu kết quả quiz chi tiết vào Supabase
 * @param {Object} quizResult - Dữ liệu kết quả quiz
 * @param {string} quizResult.userId - UUID của user
 * @param {string} quizResult.bookId - ID của sách
 * @param {string} quizResult.chapterId - ID của chapter
 * @param {string} quizResult.lessonId - ID của lesson
 * @param {string} quizResult.quizId - ID của quiz
 * @param {string} quizResult.level - Level (n1, n2, ...)
 * @param {number} quizResult.score - Số câu đúng
 * @param {number} quizResult.total - Tổng số câu
 * @param {number} quizResult.percentage - Phần trăm đúng
 * @param {number} quizResult.timeSpent - Thời gian làm bài (giây)
 * @param {Array} quizResult.answers - Chi tiết từng câu hỏi
 * @param {string} quizResult.startedAt - Thời gian bắt đầu (ISO string)
 * @param {string} quizResult.completedAt - Thời gian hoàn thành (ISO string)
 * @param {number} quizResult.attemptNumber - Lần thứ mấy (1, 2, 3...)
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveQuizResult(quizResult) {
  try {
    // ✅ VALIDATION: Kiểm tra required fields
    if (!quizResult.userId || !quizResult.bookId || !quizResult.chapterId || 
        !quizResult.lessonId || !quizResult.level) {
      console.error('[QuizResults] ❌ Missing required fields');
      return { success: false, error: 'Missing required fields' };
    }

    // ✅ VALIDATION: Kiểm tra score/total hợp lệ
    if (quizResult.score === undefined || quizResult.total === undefined || 
        quizResult.score < 0 || quizResult.total <= 0 || quizResult.score > quizResult.total) {
      console.error('[QuizResults] ❌ Invalid score/total values');
      return { success: false, error: 'Invalid score or total values' };
    }

    // ✅ AUTO-CALCULATE: Tự động tính attempt_number nếu không có
    let attemptNumber = quizResult.attemptNumber;
    if (!attemptNumber || attemptNumber < 1) {
      const countResult = await getQuizAttemptCount(
        quizResult.userId,
        quizResult.bookId,
        quizResult.chapterId,
        quizResult.lessonId,
        quizResult.level
      );
      attemptNumber = (countResult.success ? countResult.count : 0) + 1;
    }

    // ✅ AUTO-CALCULATE: Tự động tính percentage nếu không có
    let percentage = quizResult.percentage;
    if (percentage === undefined || percentage < 0 || percentage > 100) {
      percentage = Math.round((quizResult.score / quizResult.total) * 100);
    }

    // ✅ FALLBACK: Quiz ID = Lesson ID nếu không có quizId riêng
    const quizId = quizResult.quizId || quizResult.lessonId;

    console.log('[QuizResults] 💾 Saving quiz result:', {
      userId: quizResult.userId,
      lessonId: quizResult.lessonId,
      score: `${quizResult.score}/${quizResult.total}`,
      attemptNumber: attemptNumber,
      percentage: percentage
    });

    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: quizResult.userId,
        book_id: quizResult.bookId,
        chapter_id: quizResult.chapterId,
        lesson_id: quizResult.lessonId,
        quiz_id: quizId,
        level: quizResult.level,
        score: quizResult.score,
        total: quizResult.total,
        percentage: percentage,
        time_spent: quizResult.timeSpent || null,
        answers: quizResult.answers || [],
        started_at: quizResult.startedAt || null,
        completed_at: quizResult.completedAt || new Date().toISOString(),
        attempt_number: attemptNumber
      })
      .select()
      .single();

    if (error) {
      console.error('[QuizResults] ❌ Error saving quiz result:', error);
      return { success: false, error };
    }

    // ✅ DUAL-WRITE: Cập nhật learning_progress (summary) để đảm bảo data consistency
    try {
      await saveLearningProgress({
        userId: quizResult.userId,
        type: 'quiz_attempt',
        bookId: quizResult.bookId,
        chapterId: quizResult.chapterId,
        lessonId: quizResult.lessonId,
        status: 'completed',
        score: quizResult.score,
        total: quizResult.total,
        attempts: attemptNumber, // Tổng số lần làm
        timeSpent: quizResult.timeSpent || null,
        metadata: {
          percentage: percentage,
          levelId: quizResult.level,
          lastAttemptAt: quizResult.completedAt || new Date().toISOString()
        }
      });
      console.log('[QuizResults] ✅ Also updated learning_progress (summary)');
    } catch (progressError) {
      // ⚠️ Warning: Nếu update learning_progress fail, vẫn trả về success vì đã lưu chi tiết
      console.warn('[QuizResults] ⚠️ Failed to update learning_progress (non-critical):', progressError);
    }

    console.log('[QuizResults] ✅ Saved quiz result to Supabase:', data.id);
    return { success: true, data };
  } catch (err) {
    console.error('[QuizResults] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy tất cả kết quả quiz của một user
 * @param {string} userId - UUID của user
 * @param {Object} filters - Filters (optional)
 * @param {string} filters.bookId - Filter by book ID
 * @param {string} filters.chapterId - Filter by chapter ID
 * @param {string} filters.lessonId - Filter by lesson ID
 * @param {string} filters.level - Filter by level
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getUserQuizResults(userId, filters = {}) {
  try {
    let query = supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.bookId) {
      query = query.eq('book_id', filters.bookId);
    }
    if (filters.chapterId) {
      query = query.eq('chapter_id', filters.chapterId);
    }
    if (filters.lessonId) {
      query = query.eq('lesson_id', filters.lessonId);
    }
    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[QuizResults] ❌ Error fetching quiz results:', error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[QuizResults] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy kết quả quiz của một lesson cụ thể
 * @param {string} userId - UUID của user
 * @param {string} bookId - ID của sách
 * @param {string} chapterId - ID của chapter
 * @param {string} lessonId - ID của lesson
 * @param {string} level - Level
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getLessonQuizResults(userId, bookId, chapterId, lessonId, level) {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .eq('level', level)
      .order('attempt_number', { ascending: true });

    if (error) {
      console.error('[QuizResults] ❌ Error fetching lesson quiz results:', error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[QuizResults] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy kết quả quiz cụ thể theo ID
 * @param {string} resultId - UUID của quiz result
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getQuizResult(resultId) {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      console.error('[QuizResults] ❌ Error fetching quiz result:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[QuizResults] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Đếm số lần làm quiz của một lesson
 * @param {string} userId - UUID của user
 * @param {string} bookId - ID của sách
 * @param {string} chapterId - ID của chapter
 * @param {string} lessonId - ID của lesson
 * @param {string} level - Level
 * @returns {Promise<{success: boolean, count?: number, error?: Object}>}
 */
export async function getQuizAttemptCount(userId, bookId, chapterId, lessonId, level) {
  try {
    const { count, error } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .eq('level', level);

    if (error) {
      console.error('[QuizResults] ❌ Error counting quiz attempts:', error);
      return { success: false, error };
    }

    return { success: true, count: count || 0 };
  } catch (err) {
    console.error('[QuizResults] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

