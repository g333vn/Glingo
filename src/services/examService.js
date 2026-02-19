// src/services/examService.js
// Service để lưu và đọc JLPT exam từ Supabase

import { supabase } from './supabaseClient.js';

/**
 * Save exam to Supabase
 * @param {Object} exam - Exam data
 * @param {string} exam.level - Level (n1, n2, n3, n4, n5)
 * @param {string} exam.examId - Exam ID (ví dụ: '2024-12')
 * @param {string} exam.title - Title
 * @param {string} exam.date - Date (ví dụ: '2024/12')
 * @param {string} exam.status - Status (ví dụ: 'Có sẵn')
 * @param {string} exam.imageUrl - Image URL
 * @param {Object} exam.knowledge - Knowledge sections
 * @param {Object} exam.reading - Reading sections
 * @param {Object} exam.listening - Listening sections
 * @param {Object} exam.config - Config/metadata
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveExam(exam, userId) {
  try {
    console.log('[ExamService.saveExam] 💾 Saving exam:', {
      level: exam.level,
      examId: exam.examId || exam.id,
      title: exam.title,
      hasKnowledge: !!exam.knowledge,
      hasReading: !!exam.reading,
      hasListening: !!exam.listening
    });

    // Validate required fields
    if (!exam.level || !(exam.examId || exam.id)) {
      return {
        success: false,
        error: { message: 'Level and examId are required' }
      };
    }

    // Transform data structure
    // NEW: For listening, save as object with sections + audio fields (not just sections array)
    const listeningData = exam.listening || {};
    const listeningSectionsData = Array.isArray(listeningData.sections) 
      ? listeningData.sections 
      : (listeningData.sections || []);
    
    // Build listening_sections as object (not array) to include audio at part level
    const listeningSectionsPayload = {
      sections: listeningSectionsData,
      // NEW: Include audio fields at listening part level
      ...(listeningData.audioUrl && { audioUrl: listeningData.audioUrl }),
      ...(listeningData.audioPath && { audioPath: listeningData.audioPath }),
      ...(listeningData.audioName && { audioName: listeningData.audioName })
    };
    
    const examData = {
      level: exam.level,
      exam_id: exam.examId || exam.id,
      title: exam.title || '',
      date: exam.date || null,
      status: exam.status || null,
      image_url: exam.imageUrl || null,
      knowledge_sections: exam.knowledge?.sections || [],
      reading_sections: exam.reading?.sections || [],
      listening_sections: listeningSectionsPayload, // UPDATED: Object with sections + audio
      config: exam.config || {},
      created_by: userId,
      updated_at: new Date().toISOString()
    };

    // Log sections count
    console.log('[ExamService.saveExam] 📊 Sections count:', {
      knowledge: examData.knowledge_sections.length,
      reading: examData.reading_sections.length,
      listening: Array.isArray(examData.listening_sections) 
        ? examData.listening_sections.length 
        : (examData.listening_sections?.sections?.length || 0),
      // NEW: Log audio info
      listeningHasAudio: !!(examData.listening_sections?.audioUrl),
      listeningAudioUrl: examData.listening_sections?.audioUrl || '(none)'
    });

    const { data, error } = await supabase
      .from('exams')
      .upsert(examData, {
        onConflict: 'level,exam_id'
      })
      .select()
      .single();

    if (error) {
      console.error('[ExamService] ❌ Error saving exam:', error);
      return { success: false, error };
    }

    console.log('[ExamService] ✅ Saved exam to Supabase:', data.id);
    return { success: true, data };
  } catch (err) {
    console.error('[ExamService] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get exam from Supabase
 * @param {string} level - Level (n1, n2, ...)
 * @param {string} examId - Exam ID
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getExam(level, examId) {
  try {
    console.log('[ExamService.getExam] 🔍 Fetching exam:', { level, examId });

    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('level', level)
      .eq('exam_id', examId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('[ExamService] ❌ Error fetching exam:', error);
      return { success: false, error };
    }

    if (!data) {
      console.log('[ExamService] ⚠️ Exam not found:', { level, examId });
      return { success: true, data: null };
    }

    // Transform to app format
    // UPDATED: Handle listening_sections as object (with sections + audio) or array (backward compatibility)
    const listeningSectionsRaw = data.listening_sections || [];
    let listeningSections = [];
    let listeningAudioUrl = null;
    let listeningAudioPath = null;
    let listeningAudioName = null;
    
    if (Array.isArray(listeningSectionsRaw)) {
      // Backward compatibility: old format (array of sections)
      listeningSections = listeningSectionsRaw;
    } else if (listeningSectionsRaw && typeof listeningSectionsRaw === 'object') {
      // New format: object with sections + audio fields
      listeningSections = listeningSectionsRaw.sections || [];
      listeningAudioUrl = listeningSectionsRaw.audioUrl || null;
      listeningAudioPath = listeningSectionsRaw.audioPath || null;
      listeningAudioName = listeningSectionsRaw.audioName || null;
    }
    
    const exam = {
      id: data.exam_id,
      level: data.level,
      title: data.title,
      date: data.date,
      status: data.status,
      imageUrl: data.image_url,
      knowledge: {
        sections: data.knowledge_sections || []
      },
      reading: {
        sections: data.reading_sections || []
      },
      listening: {
        sections: listeningSections,
        // NEW: Include audio fields at listening part level
        ...(listeningAudioUrl && { audioUrl: listeningAudioUrl }),
        ...(listeningAudioPath && { audioPath: listeningAudioPath }),
        ...(listeningAudioName && { audioName: listeningAudioName })
      },
      config: data.config || {}
    };

    console.log('[ExamService] ✅ Loaded exam from Supabase:', {
      id: exam.id,
      knowledgeSections: exam.knowledge.sections.length,
      readingSections: exam.reading.sections.length,
      listeningSections: exam.listening.sections.length,
      // NEW: Log audio info
      listeningHasAudio: !!exam.listening.audioUrl,
      listeningAudioUrl: exam.listening.audioUrl || '(none)'
    });

    return { success: true, data: exam };
  } catch (err) {
    console.error('[ExamService] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get all exams by level
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getExamsByLevel(level) {
  try {
    console.log('[ExamService.getExamsByLevel] 🔍 Fetching exams for level:', level);

    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('level', level)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) {
      console.error('[ExamService] ❌ Error fetching exams:', error);
      return { success: false, error };
    }

    // Transform to app format (metadata only, no sections)
    const exams = (data || []).map(exam => ({
      id: exam.exam_id,
      level: exam.level,
      title: exam.title,
      date: exam.date,
      status: exam.status,
      imageUrl: exam.image_url
    }));

    console.log('[ExamService] ✅ Loaded', exams.length, 'exams from Supabase');
    return { success: true, data: exams };
  } catch (err) {
    console.error('[ExamService] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete exam (soft delete)
 * @param {string} level - Level (n1, n2, ...)
 * @param {string} examId - Exam ID
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, error?: Object}>}
 */
export async function deleteExam(level, examId, userId) {
  try {
    console.log('[ExamService.deleteExam] 🗑️ Deleting exam:', { level, examId });

    const { error } = await supabase
      .from('exams')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('level', level)
      .eq('exam_id', examId)
      .is('deleted_at', null);

    if (error) {
      console.error('[ExamService] ❌ Error deleting exam:', error);
      return { success: false, error };
    }

    console.log('[ExamService] ✅ Deleted exam from Supabase');
    return { success: true };
  } catch (err) {
    console.error('[ExamService] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Hard delete exam (permanent delete - admin only)
 * @param {string} level - Level (n1, n2, ...)
 * @param {string} examId - Exam ID
 * @returns {Promise<{success: boolean, error?: Object}>}
 */
export async function hardDeleteExam(level, examId) {
  try {
    console.log('[ExamService.hardDeleteExam] 🗑️ Hard deleting exam:', { level, examId });

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('level', level)
      .eq('exam_id', examId);

    if (error) {
      console.error('[ExamService] ❌ Error hard deleting exam:', error);
      return { success: false, error };
    }

    console.log('[ExamService] ✅ Hard deleted exam from Supabase');
    return { success: true };
  } catch (err) {
    console.error('[ExamService] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

