// src/data/level/n1/shinkanzen-n1-bunpou/quizzes/quiz-loader.js
// Helper function để lazy load quiz data từ JSON files

// ✅ Với Vite, sử dụng import.meta.glob để lazy load tất cả JSON files
const quizModules = import.meta.glob('./*.json', { eager: false });

/**
 * Load quiz data cho một bài cụ thể
 * @param {string} lessonId - ID của bài (ví dụ: 'bai-1')
 * @returns {Promise<Object>} Quiz data
 */
export async function loadQuizData(lessonId) {
  try {
    // Tìm file JSON tương ứng với lessonId
    const modulePath = `./${lessonId}.json`;
    
    if (quizModules[modulePath]) {
      // Lazy load module
      const module = await quizModules[modulePath]();
      return module.default || module;
    } else {
      throw new Error(`Quiz file not found: ${lessonId}.json`);
    }
  } catch (error) {
    console.error(`Failed to load quiz data for ${lessonId}:`, error);
    // Return default quiz data nếu không tìm thấy
    return {
      title: "Bài không tồn tại",
      questions: []
    };
  }
}

/**
 * Load tất cả quiz data (dùng cho backward compatibility)
 * @returns {Promise<Object>} Object chứa tất cả quiz data
 */
export async function loadAllQuizData() {
  // Lazy load tất cả quiz files
  // Hiện tại chỉ có bai-1, sẽ thêm các bài khác sau
  const quizData = {};
  
  try {
    const bai1 = await loadQuizData('bai-1');
    quizData['bai-1'] = bai1;
  } catch (error) {
    console.error('Failed to load bai-1:', error);
  }
  
  // Thêm default fallback
  quizData['default'] = {
    title: "Bài không tồn tại",
    questions: []
  };
  
  return quizData;
}

