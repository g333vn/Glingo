// src/pages/UserDashboard.jsx
// 🎯 User Dashboard - Tổng quan tiến độ học tập toàn bộ

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { openDB } from 'idb';
import { calculateMasteryLevel, getDueCardsCount } from '../services/progressTracker.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createNotification } from '../utils/notificationManager.js';
import { getUserProgress } from '../services/learningProgressService.js';
import { getUserExamResults } from '../services/examResultsService.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import UserDashboardSkeleton from '../components/skeletons/UserDashboardSkeleton.jsx';
import DataSyncButton from '../components/DataSyncButton.jsx';

/**
 * UserDashboard Component
 * Overview của tất cả decks và tiến độ học tập tổng thể
 */
function UserDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [allDecks, setAllDecks] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    totalDue: 0,
    totalMastered: 0,
    averageMastery: 0,
    studyStreak: 0,
    totalReviews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isStreakExpanded, setIsStreakExpanded] = useState(true);
  
  // ✅ NEW: Supabase progress data
  const [supabaseProgress, setSupabaseProgress] = useState({
    lessons: [],
    quizzes: [],
    exams: []
  });
  const [examResults, setExamResults] = useState([]);
  const [supabaseStats, setSupabaseStats] = useState({
    completedLessons: 0,
    completedQuizzes: 0,
    passedExams: 0,
    averageQuizScore: 0,
    averageExamScore: 0
  });

  // Prefer authenticated user ID when available, fallback to demo ID for compatibility
  const userId = user?.id || 'user-001'; // TODO: Remove fallback when auth is fully integrated

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Loading user dashboard...');

      const db = await openDB('elearning-db', 3);

      // Load all lesson groups
      const allLessonGroups = await db.getAll('lessons');
      console.log('  - Total lesson groups:', allLessonGroups.length);

      // Extract all lessons with SRS enabled
      const decksWithStats = [];
      let totalCardsCount = 0;
      let totalDueCount = 0;
      let totalMasteredCount = 0;
      let totalMasterySum = 0;
      let deckCount = 0;
      let decksWithDueCount = 0;

      for (const group of allLessonGroups) {
        if (group.lessons && Array.isArray(group.lessons)) {
          for (const lesson of group.lessons) {
            if (lesson.srs?.enabled) {
              deckCount++;
              const cardCount = lesson.srs?.cardCount || lesson.srs?.cards?.length || 0;
              totalCardsCount += cardCount;

              // Get stats for this deck
              const [dueCount, mastery] = await Promise.all([
                getDueCardsCount(userId, lesson.id),
                calculateMasteryLevel(userId, lesson.id)
              ]);

              totalDueCount += dueCount;
              totalMasterySum += mastery;

              if (dueCount > 0) {
                decksWithDueCount += 1;
              }

              // Count mastered cards (approximation)
              const masteredCount = Math.round((cardCount * mastery) / 100);
              totalMasteredCount += masteredCount;

              decksWithStats.push({
                id: lesson.id,
                title: lesson.title || lesson.id,
                bookId: group.bookId,
                chapterId: group.chapterId,
                totalCards: cardCount,
                dueCount,
                mastery,
                masteredCount,
                contentType: lesson.contentType,
                published: lesson.published
              });
            }
          }
        }
      }

      // Sort by most cards due
      decksWithStats.sort((a, b) => b.dueCount - a.dueCount);

      setAllDecks(decksWithStats);

      // Calculate overall stats
      const avgMastery = deckCount > 0 ? Math.round(totalMasterySum / deckCount) : 0;

      // Get study streak (from any deck's progress)
      const allProgress = await db.getAll('srsProgress');
      const userProgress = allProgress.filter(p => p.userId === userId);
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date().toDateString();
      const uniqueDates = [...new Set(userProgress.map(p => new Date(p.lastReview).toDateString()))];
      uniqueDates.sort((a, b) => new Date(b) - new Date(a));
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const expectedDate = checkDate.toDateString();
        
        if (uniqueDates.includes(expectedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Get recent reviews
      const allReviews = await db.getAll('reviews');
      const userReviews = allReviews
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setRecentActivity(userReviews);

      setOverallStats({
        totalDecks: deckCount,
        totalCards: totalCardsCount,
        totalDue: totalDueCount,
        totalMastered: totalMasteredCount,
        averageMastery: avgMastery,
        studyStreak: currentStreak,
        totalReviews: userReviews.length
      });

      // ==============================
      // SRS REVIEW REMINDER NOTIFICATION
      // ==============================
      // When there are due cards, also push a notification to the user's notification box.
      // To avoid spamming, send at most one reminder per user per day.
      if (user && totalDueCount > 0 && decksWithDueCount > 0) {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const reminderKey = `srs_review_notif_${user.id}_${today}`;

          if (!localStorage.getItem(reminderKey)) {
            createNotification({
              title: t('dashboard.reviewTime.title') || 'Đã đến giờ ôn tập!',
              message:
                t('dashboard.reviewTime.message', {
                  count: totalDueCount,
                  deckCount: decksWithDueCount
                }) || `Bạn có ${totalDueCount} thẻ đang chờ từ ${decksWithDueCount} deck`,
              type: 'warning',
              targetUsers: [user.id],
              targetRoles: [],
              expiresAt: null
            });

            localStorage.setItem(reminderKey, '1');
          }
        } catch (notifError) {
          console.error('❌ Failed to create SRS review reminder notification:', notifError);
        }
      }

      // ✅ NEW: Load Supabase progress if user is authenticated
      if (user && typeof user.id === 'string') {
        try {
          const [progressResult, examResultsResult] = await Promise.all([
            getUserProgress(user.id),
            getUserExamResults(user.id)
          ]);

          if (progressResult.success && progressResult.data) {
            const allProgress = progressResult.data;
            const lessons = allProgress.filter(p => p.type === 'lesson_complete' && p.status === 'completed');
            const quizzes = allProgress.filter(p => p.type === 'quiz_attempt' && p.status === 'completed');
            const exams = allProgress.filter(p => p.type === 'exam_attempt' && p.status === 'completed');

            setSupabaseProgress({ lessons, quizzes, exams });

            // Calculate stats
            const quizScores = quizzes
              .filter(q => q.score !== null && q.total !== null)
              .map(q => (q.score / q.total) * 100);
            const averageQuizScore = quizScores.length > 0
              ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
              : 0;

            setSupabaseStats({
              completedLessons: lessons.length,
              completedQuizzes: quizzes.length,
              passedExams: 0, // Will be updated from examResults
              averageQuizScore,
              averageExamScore: 0 // Will be updated from examResults
            });
          }

          if (examResultsResult.success && examResultsResult.data) {
            setExamResults(examResultsResult.data);
            
            const passedExams = examResultsResult.data.filter(e => e.is_passed).length;
            const examScores = examResultsResult.data.map(e => e.total_score);
            const averageExamScore = examScores.length > 0
              ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length)
              : 0;

            setSupabaseStats(prev => ({
              ...prev,
              passedExams,
              averageExamScore
            }));
          }
        } catch (supabaseError) {
          console.error('❌ Failed to load Supabase progress:', supabaseError);
        }
      }

      setIsLoading(false);

      console.log('✅ Dashboard loaded:', {
        decks: deckCount,
        cards: totalCardsCount,
        due: totalDueCount,
        mastery: avgMastery
      });

    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // Kết hợp spinner trung tâm + skeleton layout cho trải nghiệm mượt hơn
    return (
      <>
        <LoadingSpinner label={t('dashboard.loading')} icon="📊" />
        <UserDashboardSkeleton />
      </>
    );
  }

  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-2 sm:mt-4">
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-1 sm:mb-2 md:mb-3">
                  🎯 {t('dashboard.title')}
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-medium">
                  {t('dashboard.subtitle')}
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-black text-gray-900 hover:text-gray-700 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all whitespace-nowrap flex-shrink-0"
              >
                ← {t('dashboard.backButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <StatCard
            icon="🎴"
            label={t('dashboard.stats.totalDecks')}
            value={overallStats.totalDecks}
            color="from-purple-400 to-purple-600"
            subtitle={`${overallStats.totalCards} ${t('dashboard.stats.cards')}`}
          />
          <StatCard
            icon="🔥"
            label={t('dashboard.stats.reviewNow')}
            value={overallStats.totalDue}
            color="from-orange-400 to-orange-600"
            subtitle={t('dashboard.stats.cardsDue')}
          />
          <StatCard
            icon="⭐"
            label={t('dashboard.stats.mastered')}
            value={overallStats.totalMastered}
            color="from-green-400 to-green-600"
            subtitle={`${overallStats.totalCards > 0 ? Math.round((overallStats.totalMastered / overallStats.totalCards) * 100) : 0}%`}
          />
          <StatCard
            icon="📈"
            label={t('dashboard.stats.streak')}
            value={overallStats.studyStreak}
            color="from-red-400 to-red-600"
            subtitle={t('dashboard.stats.consecutiveDays')}
          />
        </div>

        {/* Streak Explanation - NEW */}
        <div className="bg-orange-300 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 md:gap-4">
            <div className="text-4xl sm:text-5xl md:text-6xl flex-shrink-0">🔥</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>{t('dashboard.streak.title')}</span>
                  <span className="text-orange-600">{overallStats.studyStreak} {t('dashboard.streak.days')}</span>
                </h2>
                <button
                  onClick={() => setIsStreakExpanded(!isStreakExpanded)}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-black text-gray-700 bg-white border-[2px] border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex-shrink-0"
                  aria-label={isStreakExpanded ? 'Collapse' : 'Expand'}
                >
                  {isStreakExpanded ? '▲' : '▼'}
                </button>
              </div>
              
              {isStreakExpanded && (
              <div className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm md:text-base">
                <div className="p-3 sm:p-4 md:p-5 bg-green-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-black text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">🎯 {t('dashboard.streak.whenCounted')}</p>
                  <ul className="space-y-1.5 sm:space-y-2 text-gray-700 text-xs sm:text-sm">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✅</span>
                      <span><strong>{t('dashboard.streak.studyFlashcard')}:</strong> {t('dashboard.streak.studyFlashcardDesc')}</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✅</span>
                      <span><strong>{t('dashboard.streak.completeLesson')}:</strong> {t('dashboard.streak.completeLessonDesc')}</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✅</span>
                      <span><strong>{t('dashboard.streak.doQuiz')}:</strong> {t('dashboard.streak.doQuizDesc')}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 sm:p-4 md:p-5 bg-red-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-black text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">❌ {t('dashboard.streak.whenReset')}</p>
                  <ul className="space-y-1.5 sm:space-y-2 text-gray-700 text-xs sm:text-sm">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-red-600 font-bold flex-shrink-0">⚠️</span>
                      <span><strong>{t('dashboard.streak.skipDay')}:</strong> {t('dashboard.streak.skipDayDesc')}</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-yellow-600 font-bold flex-shrink-0">💡</span>
                      <span><strong>{t('dashboard.streak.note')}:</strong> {t('dashboard.streak.noteDesc')}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 sm:p-4 md:p-5 bg-blue-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-black text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <span>📈</span>
                    <span>{t('dashboard.streak.example')}:</span>
                  </p>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-800">
                    <p><strong>{t('dashboard.streak.day1')}:</strong> {t('dashboard.streak.day1Desc')}</p>
                    <p><strong>{t('dashboard.streak.day2')}:</strong> {t('dashboard.streak.day2Desc')}</p>
                    <p><strong>{t('dashboard.streak.day3')}:</strong> {t('dashboard.streak.day3Desc')}</p>
                    <p><strong>{t('dashboard.streak.day4')}:</strong> {t('dashboard.streak.day4Desc')}</p>
                    <p><strong>{t('dashboard.streak.day5')}:</strong> {t('dashboard.streak.day5Desc')}</p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-yellow-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
                  <p className="text-xs sm:text-sm md:text-base font-black text-gray-900">
                    <strong>💪 {t('dashboard.streak.tip')}:</strong> {t('dashboard.streak.tipDesc')}
                  </p>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Mastery Progress */}
        <div className="bg-purple-300 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <span>🎓</span>
            <span>{t('dashboard.overallProgress.title')}</span>
          </h2>
          <div className="mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                {getMasteryLabel(overallStats.averageMastery, t)}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                {overallStats.averageMastery}%
              </span>
            </div>
            <div className="h-10 sm:h-12 md:h-16 bg-gray-200 rounded-lg overflow-hidden border-[3px] sm:border-[4px] border-black">
              <div
                className={`h-full ${getMasteryColorSolid(overallStats.averageMastery)} transition-all duration-1000
                         flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-black`}
                style={{ width: `${overallStats.averageMastery}%` }}
              >
                {overallStats.averageMastery > 10 && `${overallStats.averageMastery}%`}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center text-[10px] sm:text-xs md:text-sm">
            <div className="p-2 sm:p-3 md:p-4 bg-blue-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{overallStats.totalCards}</p>
              <p className="text-[10px] sm:text-xs md:text-sm font-black text-gray-900">{t('dashboard.overallProgress.totalCards')}</p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-green-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{overallStats.totalMastered}</p>
              <p className="text-[10px] sm:text-xs md:text-sm font-black text-gray-900">{t('dashboard.overallProgress.mastered')}</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
                {overallStats.totalCards - overallStats.totalMastered}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm font-black text-gray-900">{t('dashboard.overallProgress.notMastered')}</p>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Supabase Learning Progress Section */}
        {user && typeof user.id === 'string' && (
          <div className="bg-white rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-4 sm:mb-6 md:mb-8">
            <div className="bg-green-400 border-b-[4px] border-black p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                    <span>📊</span>
                    <span>Tiến độ học tập (Supabase)</span>
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-900 mt-1 font-bold">
                    Đồng bộ trên tất cả thiết bị
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <DataSyncButton variant="full" />
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 md:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <div className="bg-green-100 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Lessons</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                    {supabaseStats.completedLessons}
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Quizzes</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                    {supabaseStats.completedQuizzes}
                  </div>
                </div>
                <div className="bg-purple-100 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Điểm Quiz TB</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                    {supabaseStats.averageQuizScore}%
                  </div>
                </div>
                <div className="bg-orange-100 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Exams đậu</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                    {supabaseStats.passedExams} / {examResults.length}
                  </div>
                </div>
              </div>

              {/* Exam Results Table */}
              {examResults.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">📝 Kết quả JLPT Exam</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b-2 border-black bg-gray-100">
                          <th className="text-left p-2 font-black">Level</th>
                          <th className="text-left p-2 font-black">Exam</th>
                          <th className="text-center p-2 font-black">Tổng</th>
                          <th className="text-center p-2 font-black">Kết quả</th>
                          <th className="text-left p-2 font-black">Ngày</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examResults.slice(0, 5).map((exam, idx) => (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="p-2 font-bold">{exam.level_id?.toUpperCase()}</td>
                            <td className="p-2">{exam.exam_id}</td>
                            <td className="p-2 text-center font-bold">{exam.total_score} / 180</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                exam.is_passed 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {exam.is_passed ? '✅' : '❌'}
                              </span>
                            </td>
                            <td className="p-2 text-gray-600">
                              {exam.completed_at ? new Date(exam.completed_at).toLocaleDateString('vi-VN') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Quiz Attempts */}
              {supabaseProgress.quizzes.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">🎯 Quiz gần đây</h3>
                  <div className="space-y-2">
                    {supabaseProgress.quizzes.slice(0, 5).map((quiz, idx) => {
                      const percentage = quiz.total > 0 
                        ? Math.round((quiz.score / quiz.total) * 100) 
                        : 0;
                      return (
                        <div key={idx} className="border-2 border-black rounded-lg p-2 sm:p-3 bg-white">
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs sm:text-sm truncate">
                                {quiz.book_id} / {quiz.chapter_id} / {quiz.lesson_id}
                              </div>
                              <div className="text-xs text-gray-600">
                                {quiz.completed_at ? new Date(quiz.completed_at).toLocaleDateString('vi-VN') : 'N/A'}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-lg sm:text-xl font-black">
                                {quiz.score} / {quiz.total}
                              </div>
                              <div className={`text-xs sm:text-sm font-bold ${
                                percentage >= 80 ? 'text-green-600' :
                                percentage >= 60 ? 'text-blue-600' :
                                'text-red-600'
                              }`}>
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Lessons */}
              {supabaseProgress.lessons.length > 0 ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">📚 Lessons đã hoàn thành</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {supabaseProgress.lessons.slice(0, 6).map((lesson, idx) => (
                      <div key={idx} className="border-2 border-black rounded-lg p-2 sm:p-3 bg-white">
                        <div className="font-bold text-xs sm:text-sm truncate">
                          {lesson.book_id} / {lesson.chapter_id} / {lesson.lesson_id}
                        </div>
                        <div className="text-xs text-gray-600">
                          {lesson.completed_at ? new Date(lesson.completed_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <div className="text-4xl sm:text-5xl mb-2">📭</div>
                  <p className="text-sm sm:text-base text-gray-600 font-bold">
                    Chưa có progress nào. Bắt đầu học để xem tiến độ ở đây!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Banner */}
        {overallStats.totalDue > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 bg-yellow-300 rounded-xl border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4">
              <div className="text-4xl sm:text-5xl md:text-6xl animate-pulse flex-shrink-0">⏰</div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1">
                  {t('dashboard.reviewTime.title')}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700">
                  {t('dashboard.reviewTime.message', { count: overallStats.totalDue, deckCount: allDecks.filter(d => d.dueCount > 0).length })}
                </p>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600">
                  {overallStats.totalDue}
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{t('dashboard.stats.cards')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Decks List */}
        <div className="bg-white rounded-xl border-[3px] sm:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-4 sm:mb-6 md:mb-8">
          <div className="bg-indigo-400 border-b-[3px] sm:border-b-[4px] border-black p-3 sm:p-4 md:p-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <span>📚</span>
              <span>{t('dashboard.deckList.title', { count: allDecks.length })}</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-900 mt-1 font-bold">
              {t('dashboard.deckList.subtitle')}
            </p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {allDecks.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4">📦</div>
                <p className="text-lg sm:text-xl font-bold text-gray-600 mb-2">
                  {t('dashboard.deckList.emptyTitle')}
                </p>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  {t('dashboard.deckList.emptyDesc')}
                </p>
                <button
                  onClick={() => navigate('/admin/content')}
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-purple-500 text-white rounded-lg border-[3px] border-black
                           font-bold text-sm sm:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all"
                >
                  ➕ {t('dashboard.deckList.createLesson')}
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {allDecks.map((deck, index) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    index={index}
                    navigate={navigate}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-4 sm:mb-6 md:mb-8">
            <div className="bg-blue-400 border-b-[4px] border-black p-3 sm:p-4 md:p-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <span>📝</span>
                <span>{t('dashboard.recentActivity.title')}</span>
              </h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <div className="space-y-1.5 sm:space-y-2">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="p-2 sm:p-3 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {t('dashboard.recentActivity.deck')}: {activity.deckId}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-700 font-medium">
                        {new Date(activity.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-base sm:text-lg flex-shrink-0 ml-2">
                      {getGradeEmoji(activity.grade)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ & Tips */}
        <div className="bg-white rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-green-400 border-b-[4px] border-black p-3 sm:p-4 md:p-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
              <span>❓</span>
              <span>{t('dashboard.faq.title')}</span>
            </h2>
          </div>
          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {/* FAQ Items */}
            <div className="p-3 sm:p-4 bg-blue-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">❓ {t('dashboard.faq.q1')}</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                <strong>{t('dashboard.faq.answer')}:</strong> {t('dashboard.faq.a1')}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-purple-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">❓ {t('dashboard.faq.q2')}</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                <strong>{t('dashboard.faq.recommendation')}:</strong> {t('dashboard.faq.a2')}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-yellow-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">❓ {t('dashboard.faq.q3')}</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                <strong>{t('dashboard.faq.tip')}:</strong> {t('dashboard.faq.a3')}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-orange-400 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">💡 {t('dashboard.faq.streakTip')}:</p>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                <li>• {t('dashboard.faq.streakTip1')}</li>
                <li>• {t('dashboard.faq.streakTip2')}</li>
                <li>• {t('dashboard.faq.streakTip3')}</li>
                <li>• {t('dashboard.faq.streakTip4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ icon, label, value, color, subtitle }) {
  // Map color prop to actual background color
  const bgColor = color.includes('purple') ? 'bg-purple-400' :
                   color.includes('orange') ? 'bg-orange-400' :
                   color.includes('green') ? 'bg-green-400' :
                   color.includes('red') ? 'bg-red-400' : 'bg-blue-400';
  
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform hover:scale-105 transition-all">
      <div className={`${bgColor} p-2 sm:p-3 md:p-4 border-b-[3px] sm:border-b-[4px] border-black`}>
        <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 text-center">{icon}</div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 text-center mb-0.5 sm:mb-1">
          {value}
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 text-center">
          {subtitle}
        </p>
      </div>
      <div className="p-1.5 sm:p-2 md:p-3 bg-white">
        <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900 text-center">
          {label}
        </p>
      </div>
    </div>
  );
}

// ========== DECK CARD ==========
function DeckCard({ deck, index, navigate, t }) {
  const masteryColor = deck.mastery >= 75 ? 'green' : deck.mastery >= 50 ? 'yellow' : deck.mastery >= 25 ? 'orange' : 'red';
  const masteryColorClass = {
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    orange: 'from-orange-400 to-orange-600',
    red: 'from-red-400 to-red-600'
  }[masteryColor];

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden">
      <div className="p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="text-base sm:text-lg md:text-xl">🎴</span>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-gray-900 truncate">
                {deck.title}
              </h3>
              {deck.dueCount > 0 && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
                  {deck.dueCount} {t('dashboard.deckCard.due')}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">
              📍 {deck.bookId} → {deck.chapterId}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
          <div className="text-center p-1.5 sm:p-2 md:p-3 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-blue-600">{deck.totalCards}</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-700">{t('dashboard.deckCard.totalCards')}</p>
          </div>
          <div className="text-center p-1.5 sm:p-2 md:p-3 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-green-600">{deck.masteredCount}</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-700">{t('dashboard.deckCard.mastered')}</p>
          </div>
          <div className="text-center p-1.5 sm:p-2 md:p-3 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-lg sm:text-xl md:text-2xl font-black text-orange-600">{deck.dueCount}</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-700">{t('dashboard.deckCard.needReview')}</p>
          </div>
        </div>

        {/* Mastery Progress */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">{t('dashboard.deckCard.proficiency')}</span>
            <span className="text-base sm:text-lg font-black text-gray-900">{deck.mastery}%</span>
          </div>
          <div className="h-5 sm:h-6 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black">
            <div
              className={`h-full ${getMasteryColorSolidFromClass(masteryColorClass)} transition-all duration-500 flex items-center justify-end pr-1 sm:pr-2`}
              style={{ width: `${deck.mastery}%` }}
            >
              {deck.mastery > 15 && (
                <span className="text-[10px] sm:text-xs font-bold text-white">
                  {deck.mastery}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          {deck.dueCount > 0 ? (
            <button
              onClick={() => navigate(`/review/${deck.id}`)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-yellow-400 text-gray-900 rounded-lg border-[3px] border-black
                       font-black text-xs sm:text-sm md:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all"
            >
              🚀 {t('dashboard.deckCard.learnNow', { count: deck.dueCount })}
            </button>
          ) : (
            <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black text-xs sm:text-sm md:text-base text-center">
              ✅ {t('dashboard.deckCard.completed')}
            </div>
          )}
          <button
            onClick={() => navigate(`/statistics/${deck.id}`)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black
                     font-bold text-xs sm:text-sm md:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                     transition-all"
          >
            📊 {t('dashboard.deckCard.details')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== HELPERS ==========
function getMasteryColor(level) {
  if (level < 25) return 'from-red-400 to-red-600';
  if (level < 50) return 'from-orange-400 to-orange-600';
  if (level < 75) return 'from-yellow-400 to-yellow-600';
  return 'from-green-400 to-green-600';
}

function getMasteryColorSolid(level) {
  if (level < 25) return 'bg-red-500';
  if (level < 50) return 'bg-orange-500';
  if (level < 75) return 'bg-yellow-400';
  return 'bg-green-500';
}

function getMasteryColorSolidFromClass(colorClass) {
  if (colorClass.includes('red')) return 'bg-red-500';
  if (colorClass.includes('orange')) return 'bg-orange-500';
  if (colorClass.includes('yellow')) return 'bg-yellow-400';
  if (colorClass.includes('green')) return 'bg-green-500';
  return 'bg-gray-500';
}

function getMasteryLabel(level, t) {
  if (level < 25) return t('dashboard.mastery.beginner');
  if (level < 50) return t('dashboard.mastery.learning');
  if (level < 75) return t('dashboard.mastery.intermediate');
  if (level < 90) return t('dashboard.mastery.advanced');
  return t('dashboard.mastery.master');
}

function getGradeEmoji(grade) {
  if (grade === 1) return '❌';
  if (grade === 2) return '😅';
  if (grade === 3) return '✅';
  if (grade === 4) return '🌟';
  return '❓';
}

export default UserDashboard;

