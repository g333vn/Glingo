// src/data/jlpt/jlptData.js
// CLEAN MODE: All JLPT data is empty
// Use Supabase for all exam data

export const jlptExams = {
  n1: [],
  n2: [],
  n3: [],
  n4: [],
  n5: [],
};

// Level information (metadata, không phải exam data)
export const jlptLevelInfo = {
  n1: { level: 'N1', title: 'JLPT N1', description: 'Advanced' },
  n2: { level: 'N2', title: 'JLPT N2', description: 'Upper-Intermediate' },
  n3: { level: 'N3', title: 'JLPT N3', description: 'Intermediate' },
  n4: { level: 'N4', title: 'JLPT N4', description: 'Lower-Intermediate' },
  n5: { level: 'N5', title: 'JLPT N5', description: 'Beginner' },
};

/**
 * Get exams by level
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Array} Empty array in clean mode
 */
export function getExamsByLevel(level) {
  return jlptExams[level.toLowerCase()] || [];
}

/**
 * Get exam by ID
 * @param {string} levelId - Level ID
 * @param {string} examId - Exam ID
 * @returns {Object|null} Exam object or null
 */
export function getExamById(levelId, examId) {
  const exams = jlptExams[levelId.toLowerCase()] || [];
  return exams.find(exam => exam.id === examId) || null;
}

export default jlptExams;
