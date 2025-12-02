// src/data/level/quizData.js
// CLEAN MODE: Legacy quizData map kept only for backward compatibility.
// All real quizzes should be stored in Supabase / IndexedDB via admin tools.

export const quizData = {
  // Legacy code expects a default entry
  default: {
    title: 'No Quiz',
    questions: [],
    metadata: {}
  }
};

export default quizData;


