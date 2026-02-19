// src/services/lessonCompletionsService.js
// Service để lưu và đọc chi tiết quá trình học lesson từ Supabase
// 
// LƯU Ý: 
// - Service này được tạo sẵn nhưng CHƯA ĐƯỢC SỬ DỤNG
// - Code hiện tại vẫn dùng learning_progress (không thay đổi)
// - Tính năng mới sẽ được phát triển sau khi có đủ user
// ============================================

import { supabase } from './supabaseClient.js';
import { saveLearningProgress } from './learningProgressService.js';

/**
 * Lưu hoặc cập nhật lesson completion vào Supabase
 * @param {Object} completion - Dữ liệu lesson completion
 * @param {string} completion.userId - UUID của user
 * @param {string} completion.bookId - ID của sách
 * @param {string} completion.chapterId - ID của chapter
 * @param {string} completion.lessonId - ID của lesson
 * @param {string} completion.level - Level (n1, n2, ...)
 * @param {string} completion.status - Trạng thái ('not_started', 'theory_viewed', 'quiz_completed', 'fully_completed')
 * @param {Object} completion.theoryProgress - Chi tiết progress của theory (JSONB)
 * @param {Array} completion.quizScores - Danh sách điểm quiz (JSONB)
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveLessonCompletion(completion) {
  try {
    // VALIDATION: Kiểm tra required fields
    if (!completion.userId || !completion.bookId || !completion.chapterId || 
        !completion.lessonId || !completion.level) {
      console.error('[LessonCompletions] ❌ Missing required fields');
      return { success: false, error: 'Missing required fields' };
    }

    console.log('[LessonCompletions] 💾 Saving lesson completion:', {
      userId: completion.userId,
      lessonId: completion.lessonId,
      status: completion.status
    });

    // Kiểm tra xem đã có completion này chưa
    const { data: existing } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', completion.userId)
      .eq('book_id', completion.bookId)
      .eq('chapter_id', completion.chapterId)
      .eq('lesson_id', completion.lessonId)
      .eq('level', completion.level)
      .single();

    let result;
    if (existing) {
      // Update existing
      const updateData = {
        status: completion.status || existing.status,
        updated_at: new Date().toISOString()
      };

      // Update theory progress
      if (completion.theoryProgress !== undefined) {
        updateData.theory_progress = completion.theoryProgress;
      }
      if (completion.theoryStartedAt) {
        updateData.theory_started_at = completion.theoryStartedAt;
      }
      if (completion.theoryCompletedAt) {
        updateData.theory_completed_at = completion.theoryCompletedAt;
      }
      if (completion.theoryTimeSpent !== undefined) {
        updateData.theory_time_spent = completion.theoryTimeSpent;
      }
      if (completion.theoryViewCount !== undefined) {
        updateData.theory_view_count = completion.theoryViewCount;
      }

      // Update quiz progress
      if (completion.quizScores !== undefined) {
        updateData.quiz_scores = completion.quizScores;
      }
      if (completion.quizStartedAt) {
        updateData.quiz_started_at = completion.quizStartedAt;
      }
      if (completion.quizCompletedAt) {
        updateData.quiz_completed_at = completion.quizCompletedAt;
      }
      if (completion.quizTimeSpent !== undefined) {
        updateData.quiz_time_spent = completion.quizTimeSpent;
      }
      if (completion.quizAttemptCount !== undefined) {
        updateData.quiz_attempt_count = completion.quizAttemptCount;
      }

      // Update timestamps
      if (completion.firstViewedAt) {
        updateData.first_viewed_at = completion.firstViewedAt;
      }
      if (completion.lastViewedAt) {
        updateData.last_viewed_at = completion.lastViewedAt;
      }
      if (completion.completedAt) {
        updateData.completed_at = completion.completedAt;
      }

      const { data, error } = await supabase
        .from('lesson_completions')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = { success: true, data };
    } else {
      // Insert new
      const insertData = {
        user_id: completion.userId,
        book_id: completion.bookId,
        chapter_id: completion.chapterId,
        lesson_id: completion.lessonId,
        level: completion.level,
        status: completion.status || 'not_started',
        theory_progress: completion.theoryProgress || {},
        quiz_scores: completion.quizScores || [],
        theory_time_spent: completion.theoryTimeSpent || 0,
        quiz_time_spent: completion.quizTimeSpent || 0,
        theory_view_count: completion.theoryViewCount || 0,
        quiz_attempt_count: completion.quizAttemptCount || 0,
        theory_started_at: completion.theoryStartedAt || null,
        theory_completed_at: completion.theoryCompletedAt || null,
        quiz_started_at: completion.quizStartedAt || null,
        quiz_completed_at: completion.quizCompletedAt || null,
        first_viewed_at: completion.firstViewedAt || null,
        last_viewed_at: completion.lastViewedAt || null,
        completed_at: completion.completedAt || null
      };

      const { data, error } = await supabase
        .from('lesson_completions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      result = { success: true, data };
    }

    // DUAL-WRITE: Cập nhật learning_progress (summary) để đảm bảo data consistency
    try {
      // Map status từ lesson_completions sang learning_progress
      let progressStatus = 'in_progress';
      if (completion.status === 'fully_completed') {
        progressStatus = 'completed';
      } else if (completion.status === 'not_started') {
        progressStatus = 'not_started';
      }

      await saveLearningProgress({
        userId: completion.userId,
        type: 'lesson_complete',
        bookId: completion.bookId,
        chapterId: completion.chapterId,
        lessonId: completion.lessonId,
        status: progressStatus,
        timeSpent: (completion.theoryTimeSpent || 0) + (completion.quizTimeSpent || 0) || null,
        metadata: {
          levelId: completion.level,
          theoryViewCount: completion.theoryViewCount || 0,
          quizAttemptCount: completion.quizAttemptCount || 0,
          lastViewedAt: completion.lastViewedAt || new Date().toISOString(),
          completedAt: completion.completedAt || null
        }
      });
      console.log('[LessonCompletions] ✅ Also updated learning_progress (summary)');
    } catch (progressError) {
      // Warning: Nếu update learning_progress fail, vẫn trả về success vì đã lưu chi tiết
      console.warn('[LessonCompletions] ⚠️ Failed to update learning_progress (non-critical):', progressError);
    }

    console.log('[LessonCompletions] ✅ Saved lesson completion to Supabase:', result.data.id);
    return result;
  } catch (err) {
    console.error('[LessonCompletions] ❌ Error saving lesson completion:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy tất cả lesson completions của một user
 * @param {string} userId - UUID của user
 * @param {Object} filters - Filters (optional)
 * @param {string} filters.bookId - Filter by book ID
 * @param {string} filters.chapterId - Filter by chapter ID
 * @param {string} filters.level - Filter by level
 * @param {string} filters.status - Filter by status
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getUserLessonCompletions(userId, filters = {}) {
  try {
    let query = supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .order('last_viewed_at', { ascending: false, nullsFirst: false });

    if (filters.bookId) {
      query = query.eq('book_id', filters.bookId);
    }
    if (filters.chapterId) {
      query = query.eq('chapter_id', filters.chapterId);
    }
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[LessonCompletions] ❌ Error fetching lesson completions:', error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[LessonCompletions] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy lesson completion của một lesson cụ thể
 * @param {string} userId - UUID của user
 * @param {string} bookId - ID của sách
 * @param {string} chapterId - ID của chapter
 * @param {string} lessonId - ID của lesson
 * @param {string} level - Level
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getLessonCompletion(userId, bookId, chapterId, lessonId, level) {
  try {
    const { data, error } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .eq('level', level)
      .single();

    if (error) {
      // Không tìm thấy là OK (chưa có completion)
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      console.error('[LessonCompletions] ❌ Error fetching lesson completion:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[LessonCompletions] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Cập nhật theory progress
 * @param {string} userId - UUID của user
 * @param {string} bookId - ID của sách
 * @param {string} chapterId - ID của chapter
 * @param {string} lessonId - ID của lesson
 * @param {string} level - Level
 * @param {Object} theoryProgress - Chi tiết progress của theory
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function updateTheoryProgress(userId, bookId, chapterId, lessonId, level, theoryProgress) {
  try {
    const completion = await getLessonCompletion(userId, bookId, chapterId, lessonId, level);
    
    if (!completion.success) {
      return completion;
    }

    const existing = completion.data;
    const newStatus = existing?.status === 'not_started' ? 'theory_viewed' : existing?.status;

    return await saveLessonCompletion({
      userId,
      bookId,
      chapterId,
      lessonId,
      level,
      status: newStatus,
      theoryProgress: theoryProgress,
      lastViewedAt: new Date().toISOString(),
      theoryViewCount: (existing?.theory_view_count || 0) + 1
    });
  } catch (err) {
    console.error('[LessonCompletions] ❌ Error updating theory progress:', err);
    return { success: false, error: err };
  }
}

/**
 * Cập nhật quiz progress
 * @param {string} userId - UUID của user
 * @param {string} bookId - ID của sách
 * @param {string} chapterId - ID của chapter
 * @param {string} lessonId - ID của lesson
 * @param {string} level - Level
 * @param {Object} quizScore - Kết quả quiz mới
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function updateQuizProgress(userId, bookId, chapterId, lessonId, level, quizScore) {
  try {
    const completion = await getLessonCompletion(userId, bookId, chapterId, lessonId, level);
    
    if (!completion.success) {
      return completion;
    }

    const existing = completion.data;
    const existingScores = existing?.quiz_scores || [];
    const newScores = [...existingScores, quizScore];
    
    let newStatus = existing?.status || 'not_started';
    if (newStatus === 'theory_viewed' || newStatus === 'not_started') {
      newStatus = 'quiz_completed';
    }

    return await saveLessonCompletion({
      userId,
      bookId,
      chapterId,
      lessonId,
      level,
      status: newStatus,
      quizScores: newScores,
      quizAttemptCount: (existing?.quiz_attempt_count || 0) + 1,
      quizCompletedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[LessonCompletions] ❌ Error updating quiz progress:', err);
    return { success: false, error: err };
  }
}

