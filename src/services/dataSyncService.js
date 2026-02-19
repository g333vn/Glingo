// src/services/dataSyncService.js
// Service để sync dữ liệu giữa localStorage và Supabase

import { saveExamResult, getUserExamResults } from './examResultsService.js';
import { saveLearningProgress, getUserProgress } from './learningProgressService.js';
import { getLessonCompletion } from '../utils/lessonProgressTracker.js';
import { getLessonQuizScores } from '../utils/lessonProgressTracker.js';

/**
 * Scan localStorage để tìm exam results và convert sang format Supabase
 * @param {string} userId - UUID của user
 * @returns {Promise<{examResults: Array, progress: Array}>}
 */
export async function scanLocalStorageForSync(userId) {
  const examResults = [];
  const progress = [];

  try {
    // Scan exam results từ localStorage
    const examKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('exam-') && (
        key.includes('-knowledge-breakdown') || 
        key.includes('-listening-breakdown')
      )
    );

    // Group by exam (levelId-examId)
    const examGroups = {};
    examKeys.forEach(key => {
      const match = key.match(/exam-([^-]+)-([^-]+)-(knowledge|listening)-breakdown/);
      if (match) {
        const [, levelId, examId, type] = match;
        const examKey = `${levelId}-${examId}`;
        if (!examGroups[examKey]) {
          examGroups[examKey] = { levelId, examId, knowledge: null, listening: null };
        }
        examGroups[examKey][type] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    });

    // Convert exam groups thành exam results
    for (const [examKey, data] of Object.entries(examGroups)) {
      // Chỉ sync nếu có cả knowledge và listening
      if (data.knowledge && data.listening) {
        const knowledgeBreakdown = data.knowledge;
        const listeningBreakdown = data.listening;

        // PHƯƠNG ÁN 3 (HYBRID): Tính điểm theo công thức (correct/total) × maxScore
        // Xem chi tiết: archive/data/JLPT_SCORING_LOGIC_VI.md
        const SCORING_CONFIG = {
          knowledge: { max: 60 },
          reading: { max: 60 },
          listening: { max: 60 }
        };

        const calculateSectionScore = (correct, total, maxScore) => {
          if (total === 0) return 0;
          const accuracy = correct / total;
          return Math.round(accuracy * maxScore);
        };

        const knowledgePoints = calculateSectionScore(
          knowledgeBreakdown.knowledge,
          knowledgeBreakdown.totals?.knowledge || 0,
          SCORING_CONFIG.knowledge.max
        );
        const readingPoints = calculateSectionScore(
          knowledgeBreakdown.reading,
          knowledgeBreakdown.totals?.reading || 0,
          SCORING_CONFIG.reading.max
        );
        const listeningPoints = calculateSectionScore(
          listeningBreakdown.listening,
          listeningBreakdown.total || 0,
          SCORING_CONFIG.listening.max
        );

        const totalScore = knowledgePoints + readingPoints + listeningPoints;
        const isPassed = totalScore >= 100 &&
          knowledgePoints >= 19 &&
          readingPoints >= 19 &&
          listeningPoints >= 19;

        examResults.push({
          userId,
          levelId: data.levelId,
          examId: data.examId,
          knowledgeScore: knowledgePoints,
          readingScore: readingPoints,
          listeningScore: listeningPoints,
          totalScore,
          knowledgeCorrect: knowledgeBreakdown.knowledge || 0,
          knowledgeTotal: knowledgeBreakdown.totals?.knowledge || 0,
          readingCorrect: knowledgeBreakdown.reading || 0,
          readingTotal: knowledgeBreakdown.totals?.reading || 0,
          listeningCorrect: listeningBreakdown.listening || 0,
          listeningTotal: listeningBreakdown.total || 0,
          isPassed,
          timeSpent: null // Not stored in localStorage
        });
      }
    }

    // Scan lesson completion từ localStorage
    const lessonKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('lesson_completed_')
    );

    lessonKeys.forEach(key => {
      const match = key.match(/lesson_completed_(.+)_(.+)_(.+)/);
      if (match) {
        const [, bookId, chapterId, lessonId] = match;
        const completed = localStorage.getItem(key) === 'true';
        
        if (completed) {
          progress.push({
            userId,
            type: 'lesson_complete',
            bookId,
            chapterId,
            lessonId,
            status: 'completed',
            score: null,
            total: null,
            attempts: 1,
            timeSpent: null,
            metadata: {
              syncedFrom: 'localStorage'
            }
          });
        }
      }
    });

    // Scan quiz scores từ localStorage
    const quizScoreKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('quiz_scores_')
    );

    quizScoreKeys.forEach(key => {
      const match = key.match(/quiz_scores_(.+)_(.+)_(.+)/);
      if (match) {
        const [, bookId, chapterId, lessonId] = match;
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Lấy score tốt nhất hoặc score gần nhất
        if (scores.length > 0) {
          const bestScore = scores.reduce((best, current) => 
            current.percentage > best.percentage ? current : best
          );
          
          progress.push({
            userId,
            type: 'quiz_attempt',
            bookId,
            chapterId,
            lessonId,
            status: 'completed',
            score: bestScore.score,
            total: bestScore.total,
            attempts: scores.length,
            timeSpent: null,
            metadata: {
              syncedFrom: 'localStorage',
              allScores: scores
            }
          });
        }
      }
    });
    
    console.log('[DataSync] Scanned localStorage:', {
      examResults: examResults.length,
      progress: progress.length
    });

    return { examResults, progress };
  } catch (error) {
    console.error('[DataSync] Error scanning localStorage:', error);
    return { examResults: [], progress: [] };
  }
}

/**
 * Sync localStorage lên Supabase (backup)
 * @param {string} userId - UUID của user
 * @returns {Promise<{success: boolean, synced: {examResults: number, progress: number}, errors: Array}>}
 */
export async function syncLocalStorageToSupabase(userId) {
  const errors = [];
  let syncedExamResults = 0;
  let syncedProgress = 0;

  try {
    // Scan localStorage
    const { examResults, progress } = await scanLocalStorageForSync(userId);

    // Sync exam results
    for (const examResult of examResults) {
      try {
        // Check if already exists in Supabase
        const { success, data: existing } = await getUserExamResults(userId);
        
        if (success && existing) {
          const alreadyExists = existing.some(e => 
            e.level_id === examResult.levelId && 
            e.exam_id === examResult.examId
          );

          if (!alreadyExists) {
            const result = await saveExamResult(examResult);
            if (result.success) {
              syncedExamResults++;
            } else {
              errors.push(`Failed to sync exam ${examResult.levelId}-${examResult.examId}: ${result.error?.message}`);
            }
          }
        }
      } catch (err) {
        errors.push(`Error syncing exam ${examResult.levelId}-${examResult.examId}: ${err.message}`);
      }
    }

    // Sync progress
    for (const prog of progress) {
      try {
        const result = await saveLearningProgress(prog);
        if (result.success) {
          syncedProgress++;
        } else {
          errors.push(`Failed to sync progress ${prog.type}: ${result.error?.message}`);
        }
      } catch (err) {
        errors.push(`Error syncing progress: ${err.message}`);
      }
    }

    console.log('[DataSync] ✅ Sync to Supabase completed:', {
      examResults: syncedExamResults,
      progress: syncedProgress,
      errors: errors.length
    });

    return {
      success: errors.length === 0,
      synced: {
        examResults: syncedExamResults,
        progress: syncedProgress
      },
      errors
    };
  } catch (error) {
    console.error('[DataSync] Error syncing to Supabase:', error);
    return {
      success: false,
      synced: { examResults: 0, progress: 0 },
      errors: [error.message]
    };
  }
}

/**
 * Sync từ Supabase về localStorage (restore)
 * @param {string} userId - UUID của user
 * @returns {Promise<{success: boolean, restored: {examResults: number, progress: number}, errors: Array}>}
 */
export async function syncSupabaseToLocalStorage(userId) {
  const errors = [];
  let restoredExamResults = 0;
  let restoredProgress = 0;

  try {
    // Get exam results from Supabase
    const { success: examSuccess, data: examResults } = await getUserExamResults(userId);
    
    if (examSuccess && examResults && examResults.length > 0) {
      for (const exam of examResults) {
        try {
          // Convert Supabase format to localStorage format
          const levelId = exam.level_id;
          const examId = exam.exam_id;

          // Calculate breakdown from scores
          const knowledgeBreakdown = {
            knowledge: exam.knowledge_correct || 0,
            reading: exam.reading_correct || 0,
            totals: {
              knowledge: exam.knowledge_total || 0,
              reading: exam.reading_total || 0
            }
          };

          const listeningBreakdown = {
            listening: exam.listening_correct || 0,
            total: exam.listening_total || 0
          };

          // Save to localStorage
          localStorage.setItem(
            `exam-${levelId}-${examId}-knowledge-breakdown`,
            JSON.stringify(knowledgeBreakdown)
          );
          localStorage.setItem(
            `exam-${levelId}-${examId}-listening-breakdown`,
            JSON.stringify(listeningBreakdown)
          );

          // Calculate and save scores
          const knowledgeScore = knowledgeBreakdown.totals.knowledge > 0
            ? Math.round((knowledgeBreakdown.knowledge / knowledgeBreakdown.totals.knowledge) * 100)
            : 0;
          const listeningScore = listeningBreakdown.total > 0
            ? Math.round((listeningBreakdown.listening / listeningBreakdown.total) * 100)
            : 0;

          localStorage.setItem(`exam-${levelId}-${examId}-knowledge-score`, knowledgeScore);
          localStorage.setItem(`exam-${levelId}-${examId}-listening-score`, listeningScore);
          localStorage.setItem(`exam-${levelId}-${examId}-knowledge-completed`, 'true');
          localStorage.setItem(`exam-${levelId}-${examId}-listening-completed`, 'true');

          restoredExamResults++;
        } catch (err) {
          errors.push(`Error restoring exam ${exam.level_id}-${exam.exam_id}: ${err.message}`);
        }
      }
    }

    // Get progress from Supabase
    const { success: progressSuccess, data: progressData } = await getUserProgress(userId);
    
    if (progressSuccess && progressData && progressData.length > 0) {
      for (const prog of progressData) {
        try {
          if (prog.type === 'lesson_complete' && prog.status === 'completed') {
            // Restore lesson completion
            const key = `lesson_completed_${prog.book_id}_${prog.chapter_id}_${prog.lesson_id}`;
            localStorage.setItem(key, 'true');

            // Restore completion timestamp if available
            if (prog.completed_at) {
              const timestampKey = `lesson_completed_at_${prog.book_id}_${prog.chapter_id}_${prog.lesson_id}`;
              localStorage.setItem(timestampKey, prog.completed_at);
            }

            restoredProgress++;
          } else if (prog.type === 'quiz_attempt' && prog.status === 'completed' && prog.book_id) {
            // Restore quiz scores
            const quizKey = `quiz_scores_${prog.book_id}_${prog.chapter_id}_${prog.lesson_id}`;
            const existingScores = JSON.parse(localStorage.getItem(quizKey) || '[]');
            
            // Check if this score already exists
            const scoreExists = existingScores.some(s => 
              s.score === prog.score && s.total === prog.total
            );
            
            if (!scoreExists) {
              existingScores.push({
                score: prog.score,
                total: prog.total,
                percentage: prog.total > 0 ? Math.round((prog.score / prog.total) * 100) : 0,
                timestamp: prog.completed_at || prog.created_at || new Date().toISOString()
              });
              localStorage.setItem(quizKey, JSON.stringify(existingScores));
            }

            restoredProgress++;
          }
        } catch (err) {
          errors.push(`Error restoring progress: ${err.message}`);
        }
      }
    }

    console.log('[DataSync] ✅ Sync from Supabase completed:', {
      examResults: restoredExamResults,
      progress: restoredProgress,
      errors: errors.length
    });

    return {
      success: errors.length === 0,
      restored: {
        examResults: restoredExamResults,
        progress: restoredProgress
      },
      errors
    };
  } catch (error) {
    console.error('[DataSync] Error syncing from Supabase:', error);
    return {
      success: false,
      restored: { examResults: 0, progress: 0 },
      errors: [error.message]
    };
  }
}

/**
 * Full sync: Backup localStorage lên Supabase và restore từ Supabase về localStorage
 * Conflict resolution: Supabase > LocalStorage (Supabase is source of truth)
 * @param {string} userId - UUID của user
 * @returns {Promise<{success: boolean, backup: Object, restore: Object, errors: Array}>}
 */
export async function fullSync(userId) {
  try {
    console.log('[DataSync] 🔄 Starting full sync...');

    // Step 1: Backup localStorage to Supabase
    const backupResult = await syncLocalStorageToSupabase(userId);
    
    // Step 2: Restore from Supabase to localStorage (Supabase is source of truth)
    const restoreResult = await syncSupabaseToLocalStorage(userId);

    const allErrors = [...backupResult.errors, ...restoreResult.errors];

    console.log('[DataSync] ✅ Full sync completed:', {
      backup: backupResult.synced,
      restore: restoreResult.restored,
      errors: allErrors.length
    });

    return {
      success: allErrors.length === 0,
      backup: backupResult.synced,
      restore: restoreResult.restored,
      errors: allErrors
    };
  } catch (error) {
    console.error('[DataSync] Error in full sync:', error);
    return {
      success: false,
      backup: { examResults: 0, progress: 0 },
      restore: { examResults: 0, progress: 0 },
      errors: [error.message]
    };
  }
}

