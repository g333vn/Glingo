// src/data/jlpt/examQuestionsData.js
// CLEAN MODE: No hard-coded JLPT exam questions.
// Admin/Supabase should provide real questions. These stubs prevent import errors.

export function getExamQuestions(level, examId) {
  console.warn('[JLPT] getExamQuestions called in clean mode. Returning empty data.', {
    level,
    examId
  });

  return {
    success: true,
    sections: [],
    meta: { level, examId }
  };
}

export default {
  getExamQuestions
};


