// src/data/level/n1/shinkanzen-n1-bunpou/quizzes/quiz-loader.js
// CLEAN MODE: Stub loader – không còn dữ liệu quiz cứng trong code.
// QuizPage vẫn có thể import `loadQuizData`, nhưng luôn nhận quiz rỗng.

/**
 * Lazy load quiz data for a given lesson.
 * In clean mode this always returns an empty quiz object.
 */
export async function loadQuizData(lessonId) {
  console.warn('[QUIZ_LOADER] loadQuizData called in clean mode. Returning empty quiz.', {
    lessonId,
  });

  return {
    title: 'No Quiz',
    questions: [],
    metadata: {
      lessonId,
      source: 'clean-mode-stub',
    },
  };
}

export default {
  loadQuizData,
};


