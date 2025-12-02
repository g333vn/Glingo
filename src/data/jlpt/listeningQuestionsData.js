// src/data/jlpt/listeningQuestionsData.js
// CLEAN MODE: No hard-coded JLPT listening questions.

export function getListeningQuestions(level, examId) {
  console.warn('[JLPT] getListeningQuestions called in clean mode. Returning empty data.', {
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
  getListeningQuestions
};


