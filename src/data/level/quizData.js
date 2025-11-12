// src/data/level/quizData.js
// ✅ UPDATED: Import từ các file đã tách theo level
// Giữ nguyên export để tương thích với code cũ

import { shinkanzenQuizData } from './n1/index.js';

// Export tất cả quiz data (hiện tại chỉ có N1, sẽ thêm sau)
export const quizData = {
  ...shinkanzenQuizData,
  // Thêm quiz data cho các sách/level khác sau
  
  // Default fallback
  'default': {
    title: "Bài không tồn tại",
    questions: []
  }
};