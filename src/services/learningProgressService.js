// src/services/learningProgressService.js
// Service để lưu và đọc learning progress từ Supabase

import { supabase } from './supabaseClient.js';

/**
 * Lưu hoặc cập nhật learning progress
 * @param {Object} progress - Dữ liệu progress
 * @param {string} progress.userId - UUID của user
 * @param {string} progress.type - Loại progress ('lesson_complete', 'quiz_attempt', 'exam_attempt')
 * @param {string} progress.bookId - ID của sách (nullable)
 * @param {string} progress.chapterId - ID của chapter (nullable)
 * @param {string} progress.lessonId - ID của lesson (nullable)
 * @param {string} progress.levelId - Level cho exam (nullable)
 * @param {string} progress.examId - ID của exam (nullable)
 * @param {string} progress.status - Status ('not_started', 'in_progress', 'completed')
 * @param {number} progress.score - Điểm (nullable)
 * @param {number} progress.total - Tổng điểm (nullable)
 * @param {number} progress.attempts - Số lần thử (default: 1)
 * @param {number} progress.timeSpent - Thời gian (giây, nullable)
 * @param {Object} progress.metadata - Metadata bổ sung (nullable)
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveLearningProgress(progress) {
  try {
    // Kiểm tra xem đã có progress này chưa (để update thay vì insert mới)
    let existingProgress = null;
    
    if (progress.lessonId) {
      // Tìm progress của lesson này
      const { data: existing } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', progress.userId)
        .eq('type', progress.type)
        .eq('book_id', progress.bookId)
        .eq('chapter_id', progress.chapterId)
        .eq('lesson_id', progress.lessonId)
        .limit(1)
        .single();
      
      existingProgress = existing;
    } else if (progress.examId) {
      // Tìm progress của exam này
      const { data: existing } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', progress.userId)
        .eq('type', progress.type)
        .eq('level_id', progress.levelId)
        .eq('exam_id', progress.examId)
        .limit(1)
        .single();
      
      existingProgress = existing;
    }

    let result;
    if (existingProgress) {
      // Update existing
      const updateData = {
        status: progress.status,
        score: progress.score,
        total: progress.total,
        attempts: (existingProgress.attempts || 1) + (progress.attempts || 0),
        time_spent: progress.timeSpent,
        metadata: progress.metadata,
        updated_at: new Date().toISOString()
      };

      if (progress.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('learning_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) throw error;
      result = { success: true, data };
    } else {
      // Insert new
      const insertData = {
        user_id: progress.userId,
        type: progress.type,
        book_id: progress.bookId,
        chapter_id: progress.chapterId,
        lesson_id: progress.lessonId,
        level_id: progress.levelId,
        exam_id: progress.examId,
        status: progress.status,
        score: progress.score,
        total: progress.total,
        attempts: progress.attempts || 1,
        time_spent: progress.timeSpent,
        metadata: progress.metadata
      };

      if (progress.status === 'completed') {
        insertData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('learning_progress')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      result = { success: true, data };
    }

    console.log('[LearningProgress] ✅ Saved progress to Supabase:', result.data);
    return result;
  } catch (err) {
    console.error('[LearningProgress] Error saving progress:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy tất cả progress của một user
 * @param {string} userId - UUID của user
 * @param {string} type - Loại progress (optional, filter)
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getUserProgress(userId, type = null) {
  try {
    let query = supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[LearningProgress] Error fetching progress:', error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[LearningProgress] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy progress của một lesson cụ thể
 * @param {string} userId - UUID của user
 * @param {string} bookId - ID của sách
 * @param {string} chapterId - ID của chapter
 * @param {string} lessonId - ID của lesson
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getLessonProgress(userId, bookId, chapterId, lessonId) {
  try {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Không tìm thấy là OK (chưa có progress)
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      console.error('[LearningProgress] Error fetching lesson progress:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[LearningProgress] Unexpected error:', err);
    return { success: false, error: err };
  }
}

