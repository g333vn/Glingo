// src/utils/quizCleanup.js
// Utility để dọn dẹp quiz không hợp lệ trong storage

import storageManager from './localStorageManager.js';
import * as contentService from '../services/contentService.js';

/**
 * Kiểm tra quiz có hợp lệ không
 * @param {Object} quiz - Quiz object
 * @returns {boolean} - true nếu quiz hợp lệ
 */
function isValidQuiz(quiz) {
  if (!quiz) return false;
  
  // Quiz phải có questions
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    return false;
  }
  
  // Quiz phải có ít nhất 1 câu hỏi
  if (quiz.questions.length === 0) {
    return false;
  }
  
  // Ít nhất 1 câu hỏi phải có text hợp lệ
  const hasValidQuestion = quiz.questions.some(q => {
    const questionText = q.text || q.question || '';
    return questionText.trim().length > 0;
  });
  
  if (!hasValidQuestion) {
    return false;
  }
  
  return true;
}

/**
 * Dọn dẹp quiz không hợp lệ từ tất cả storage
 * @param {string} level - Level cần cleanup (optional, nếu không có thì cleanup tất cả)
 * @returns {Promise<{cleaned: number, errors: Array}>}
 */
export async function cleanupInvalidQuizzes(level = null) {
  console.log(`🧹 Starting quiz cleanup${level ? ` for level ${level}` : ' (all levels)'}...`);
  
  const cleaned = [];
  const errors = [];
  
  try {
    // 1. Lấy tất cả quiz từ storage
    const allQuizzes = await storageManager.getAllQuizzes(level);
    console.log(`📦 Found ${allQuizzes.length} total quizzes in storage`);
    
    // 2. Filter quiz theo level nếu có
    let quizzesToCheck = allQuizzes;
    if (level) {
      quizzesToCheck = allQuizzes.filter(q => {
        const quizLevel = q.level || q.metadata?.level;
        return quizLevel === level;
      });
      console.log(`📋 Filtered to ${quizzesToCheck.length} quizzes for level ${level}`);
    }
    
    // 3. Kiểm tra từng quiz
    for (const quiz of quizzesToCheck) {
      const bookId = quiz.bookId || quiz.metadata?.bookId;
      const chapterId = quiz.chapterId || quiz.metadata?.chapterId;
      const lessonId = quiz.lessonId || quiz.metadata?.lessonId;
      const quizLevel = quiz.level || quiz.metadata?.level;
      
      if (!bookId || !chapterId || !lessonId) {
        console.warn(`⚠️ Quiz missing required fields:`, { bookId, chapterId, lessonId });
        errors.push({
          quiz,
          reason: 'Missing required fields (bookId, chapterId, lessonId)'
        });
        continue;
      }
      
      // 4. Kiểm tra quiz có hợp lệ không
      if (!isValidQuiz(quiz)) {
        console.log(`🗑️ Found invalid quiz: ${bookId}/${chapterId}/${lessonId}`);
        cleaned.push({
          bookId,
          chapterId,
          lessonId,
          level: quizLevel,
          reason: 'Invalid quiz (no valid questions)'
        });
        
        // 5. Xóa quiz không hợp lệ
        try {
          await storageManager.deleteQuiz(bookId, chapterId, lessonId, quizLevel);
          console.log(`✅ Deleted invalid quiz: ${bookId}/${chapterId}/${lessonId}`);
        } catch (err) {
          console.error(`❌ Error deleting quiz ${bookId}/${chapterId}/${lessonId}:`, err);
          errors.push({
            quiz,
            reason: `Error deleting: ${err.message}`
          });
        }
        continue;
      }
      
      // 6. Kiểm tra quiz có tồn tại trong Supabase không (nếu có level)
      if (quizLevel) {
        try {
          const { success, data } = await contentService.getQuiz(bookId, chapterId, lessonId, quizLevel);
          
          // Nếu quiz không có trong Supabase nhưng có trong local storage
          // và quiz có vẻ là quiz cũ/không hợp lệ, có thể xóa
          if (!success || !data) {
            // Kiểm tra lại xem quiz có thực sự hợp lệ không
            // Nếu quiz có questions nhưng không có trong Supabase, có thể là quiz chưa được sync
            // Chỉ xóa nếu quiz rõ ràng là không hợp lệ
            const questionCount = quiz.questions?.length || 0;
            const hasValidContent = quiz.questions?.some(q => {
              const text = (q.text || q.question || '').trim();
              const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0;
              return text.length > 0 && hasOptions;
            });
            
            // Nếu quiz không có nội dung hợp lệ và không có trong Supabase, xóa nó
            if (!hasValidContent || questionCount === 0) {
              console.log(`🗑️ Found orphaned invalid quiz in storage (not in Supabase): ${bookId}/${chapterId}/${lessonId}`);
              cleaned.push({
                bookId,
                chapterId,
                lessonId,
                level: quizLevel,
                reason: 'Orphaned quiz (not in Supabase, invalid content)'
              });
              
              try {
                await storageManager.deleteQuiz(bookId, chapterId, lessonId, quizLevel);
                console.log(`✅ Deleted orphaned quiz: ${bookId}/${chapterId}/${lessonId}`);
              } catch (err) {
                console.error(`❌ Error deleting orphaned quiz:`, err);
                errors.push({
                  quiz,
                  reason: `Error deleting orphaned quiz: ${err.message}`
                });
              }
            }
          }
        } catch (err) {
          console.warn(`⚠️ Error checking quiz in Supabase:`, err);
          // Không coi đây là lỗi nghiêm trọng, có thể là network issue
        }
      }
    }
    
    console.log(`✅ Cleanup completed: ${cleaned.length} quizzes cleaned, ${errors.length} errors`);
    
    return {
      cleaned: cleaned.length,
      errors: errors.length,
      details: {
        cleaned,
        errors
      }
    };
  } catch (err) {
    console.error(`❌ Error during cleanup:`, err);
    return {
      cleaned: cleaned.length,
      errors: errors.length + 1,
      details: {
        cleaned,
        errors: [...errors, { reason: `Cleanup error: ${err.message}` }]
      }
    };
  }
}

/**
 * Dọn dẹp quiz cho một lesson cụ thể
 * @param {string} bookId - Book ID
 * @param {string} chapterId - Chapter ID
 * @param {string} lessonId - Lesson ID
 * @param {string} level - Level
 * @returns {Promise<boolean>} - true nếu đã xóa quiz không hợp lệ
 */
export async function cleanupQuizForLesson(bookId, chapterId, lessonId, level) {
  try {
    const quiz = await storageManager.getQuiz(bookId, chapterId, lessonId, level);
    
    if (!quiz) {
      return false; // Không có quiz, không cần cleanup
    }
    
    if (!isValidQuiz(quiz)) {
      console.log(`🗑️ Cleaning up invalid quiz for lesson: ${bookId}/${chapterId}/${lessonId}`);
      await storageManager.deleteQuiz(bookId, chapterId, lessonId, level);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`❌ Error cleaning up quiz for lesson:`, err);
    return false;
  }
}

export default {
  cleanupInvalidQuizzes,
  cleanupQuizForLesson,
  isValidQuiz
};

