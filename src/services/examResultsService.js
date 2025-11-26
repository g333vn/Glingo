// src/services/examResultsService.js
// Service để lưu và đọc kết quả JLPT exam từ Supabase

import { supabase } from './supabaseClient.js';

/**
 * Lưu kết quả exam vào Supabase
 * @param {Object} examResult - Dữ liệu kết quả exam
 * @param {string} examResult.userId - UUID của user
 * @param {string} examResult.levelId - Level (n1, n2, ...)
 * @param {string} examResult.examId - ID của exam
 * @param {number} examResult.knowledgeScore - Điểm phần kiến thức
 * @param {number} examResult.readingScore - Điểm phần đọc
 * @param {number} examResult.listeningScore - Điểm phần nghe
 * @param {number} examResult.totalScore - Tổng điểm
 * @param {number} examResult.knowledgeCorrect - Số câu đúng phần kiến thức
 * @param {number} examResult.knowledgeTotal - Tổng câu phần kiến thức
 * @param {number} examResult.readingCorrect - Số câu đúng phần đọc
 * @param {number} examResult.readingTotal - Tổng câu phần đọc
 * @param {number} examResult.listeningCorrect - Số câu đúng phần nghe
 * @param {number} examResult.listeningTotal - Tổng câu phần nghe
 * @param {boolean} examResult.isPassed - Đã đậu chưa
 * @param {number} examResult.timeSpent - Thời gian làm bài (giây)
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveExamResult(examResult) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .insert({
        user_id: examResult.userId,
        level_id: examResult.levelId,
        exam_id: examResult.examId,
        knowledge_score: examResult.knowledgeScore,
        reading_score: examResult.readingScore,
        listening_score: examResult.listeningScore,
        total_score: examResult.totalScore,
        knowledge_correct: examResult.knowledgeCorrect,
        knowledge_total: examResult.knowledgeTotal,
        reading_correct: examResult.readingCorrect,
        reading_total: examResult.readingTotal,
        listening_correct: examResult.listeningCorrect,
        listening_total: examResult.listeningTotal,
        is_passed: examResult.isPassed,
        time_spent: examResult.timeSpent,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[ExamResults] Error saving exam result:', error);
      return { success: false, error };
    }

    console.log('[ExamResults] ✅ Saved exam result to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ExamResults] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy tất cả kết quả exam của một user
 * @param {string} userId - UUID của user
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getUserExamResults(userId) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('[ExamResults] Error fetching exam results:', error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[ExamResults] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Lấy kết quả exam cụ thể của một user
 * @param {string} userId - UUID của user
 * @param {string} levelId - Level (n1, n2, ...)
 * @param {string} examId - ID của exam
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getExamResult(userId, levelId, examId) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', userId)
      .eq('level_id', levelId)
      .eq('exam_id', examId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Không tìm thấy là OK (chưa làm exam này)
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      console.error('[ExamResults] Error fetching exam result:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[ExamResults] Unexpected error:', err);
    return { success: false, error: err };
  }
}

