// src/pages/StatisticsDashboard.jsx
// Statistics Dashboard - Comprehensive learning statistics

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { openDB } from 'idb';
import {
  calculateOverallStats,
  getTodayProgress,
  getReviewHistory,
  getDueCardsCount,
  forecastReviews,
  calculateMasteryLevel
} from '../services/progressTracker.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

/**
 * StatisticsDashboard Component
 * Visual statistics dashboard with charts and metrics
 */
function StatisticsDashboard() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ========== STATE ==========
  const [isLoading, setIsLoading] = useState(true);
  const [deckInfo, setDeckInfo] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [masteryLevel, setMasteryLevel] = useState(0);

  // ========== LOAD DATA ==========
  useEffect(() => {
    loadStatistics();
  }, [deckId]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);

      console.log('📊 Loading statistics for deckId:', deckId);

      const db = await openDB('elearning-db', 3);

      // FIXED: Scan all lesson groups to find the lesson (same fix as FlashcardReviewPage)
      let lesson = null;
      
      console.log('  - Scanning all lesson groups in IndexedDB...');
      const allLessonGroups = await db.getAll('lessons');
      console.log('  - Total lesson groups:', allLessonGroups.length);
      
      // Each group contains { bookId, chapterId, lessons: [...] }
      for (const group of allLessonGroups) {
        if (group.lessons && Array.isArray(group.lessons)) {
          const found = group.lessons.find(l => l.id === deckId);
          if (found) {
            lesson = found;
            console.log(`  - ✅ Found lesson in group [${group.bookId}, ${group.chapterId}]`);
            break;
          }
        }
      }
      
      if (!lesson) {
        alert('❌ Không tìm thấy deck!\n\n' +
              `Deck ID: ${deckId}\n\n` +
              'Vui lòng quay lại trang bài học và thử lại.');
        navigate(-1);
        return;
      }

      console.log('✅ Deck found:', lesson.title || lesson.id);

      setDeckInfo({
        id: deckId,
        name: lesson.title || 'Flashcard Deck',
        totalCards: lesson.srs?.cardCount || lesson.srs?.cards?.length || 0
      });

      // Get current user (simplified)
      const userId = 'user-001'; // TODO: Get from auth context

      // Load all statistics
      const [today, overall, reviewHistory, forecastData, due, mastery] = await Promise.all([
        getTodayProgress(userId, deckId),
        calculateOverallStats(userId, deckId),
        getReviewHistory(userId, deckId, 30),
        forecastReviews(userId, deckId),
        getDueCardsCount(userId, deckId),
        calculateMasteryLevel(userId, deckId)
      ]);

      setTodayStats(today);
      setOverallStats(overall);
      setHistory(reviewHistory);
      setForecast(forecastData);
      setDueCount(due);
      setMasteryLevel(mastery);

      setIsLoading(false);

      console.log('✅ Statistics loaded:', {
        today,
        overall,
        historyDays: reviewHistory.length
      });

    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      alert('Error loading statistics!');
      navigate(-1);
    }
  };

  // ========== RENDER ==========

  if (isLoading) {
    return (
      <LoadingSpinner
        label="Loading statistics..."
        icon="📊"
      />
    );
  }

  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  📊 {t('srs.statistics') || 'Statistics'}
                </h1>
                <p className="text-gray-700 mt-1 font-medium">
                  {deckInfo?.name}
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-black text-gray-900 hover:text-gray-700 border-[3px] border-black rounded-lg bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                ← {t('common.back') || 'Back'}
              </button>
            </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <OverviewCard
            icon="📚"
            label={t('srs.stats.newCards') || 'New Cards'}
            value={todayStats?.newCards || 0}
            subtitle={t('srs.stats.studiedToday') || 'Studied today'}
            color="blue"
          />
          <OverviewCard
            icon="🔄"
            label={t('srs.stats.toReview') || 'To Review'}
            value={dueCount}
            subtitle={t('srs.stats.dueNow') || 'Due now'}
            color="orange"
          />
          <OverviewCard
            icon="⭐"
            label={t('srs.stats.retention') || 'Retention'}
            value={`${Math.round((overallStats?.retention || 0) * 100)}%`}
            subtitle={t('srs.stats.accuracy') || 'Accuracy'}
            color="green"
          />
          <OverviewCard
            icon="🔥"
            label={t('srs.stats.streak') || 'Streak'}
            value={overallStats?.studyStreak || 0}
            subtitle={t('srs.stats.consecutiveDays') || 'Consecutive days'}
            color="red"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Review Chart */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              📈 {t('srs.stats.reviewsLast7Days') || 'Reviews (Last 7 Days)'}
            </h3>
            <ReviewChart data={history.slice(-7)} t={t} />
          </div>

          {/* Card Distribution */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              🎯 {t('srs.stats.cardDistribution') || 'Card Distribution'}
            </h3>
            <CardDistribution stats={overallStats} totalCards={deckInfo?.totalCards || 0} t={t} />
          </div>
        </div>

        {/* Forecast & Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Forecast */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              🔮 {t('srs.stats.upcomingReviews') || 'Upcoming Reviews'}
            </h3>
            <ForecastChart data={forecast} t={t} />
          </div>

          {/* Study Heatmap */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              📅 {t('srs.stats.studyHistory') || 'Study History'}
            </h3>
            <StudyHeatmap history={history} t={t} />
          </div>
        </div>

        {/* Overall Stats */}
        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h3 className="text-lg font-black text-gray-800 mb-4">
            📊 {t('srs.overallStatistics') || 'Overall Statistics'}
          </h3>
          <OverallStatsTable stats={overallStats} deckInfo={deckInfo} t={t} />
        </div>

        {/* Mastery Progress */}
        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
          <h3 className="text-lg font-black text-gray-800 mb-4">
            🎓 {t('srs.masteryLevel') || 'Mastery Level'}
          </h3>
          <MasteryProgress level={masteryLevel} stats={overallStats} t={t} />
        </div>

            {/* Action Buttons */}
            <div className="mt-6">
              {dueCount > 0 ? (
                // Has cards to review - Show active button
                <div className="text-center">
                  <button
                    onClick={() => navigate(`/review/${deckId}`)}
                    className="px-8 py-5 bg-yellow-400 text-gray-900 rounded-lg border-[4px] border-black
                             font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                             hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                             transition-all"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl">🚀</span>
                      <div>
                        <div>{t('srs.startReview') || 'START REVIEW'}</div>
                        <div className="text-sm font-medium opacity-90">{dueCount} {t('srs.cardsWaitingForYou') || 'cards waiting'}</div>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                // No cards due - Show "all caught up" state
                <div className="p-6 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-center">
                    <div className="text-6xl mb-3">🎉</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                      {t('srs.excellent') || 'Excellent! All done!'}
                    </h3>
                    <p className="text-base text-gray-700 mb-4 font-medium">
                      {t('srs.allDoneToday') || 'You completed all cards today!'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black
                                 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                                 transition-all"
                      >
                        ← {t('srs.backToLesson') || 'Back to Lesson'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mt-4 font-medium">
                      💡 {t('srs.comeBackLater') || 'Cards will be ready to review at the right time. Come back later!'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== OVERVIEW CARD ==========
function OverviewCard({ icon, label, value, subtitle, color }) {
  return (
    <div className="p-4 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <p className="text-xs text-gray-700 font-medium">{subtitle}</p>
    </div>
  );
}

// ========== REVIEW CHART ==========
function ReviewChart({ data }) {
  const maxReviews = Math.max(...data.map(d => d.reviews), 1);

  return (
    <div className="space-y-2">
      {data.map((day, index) => {
        const width = (day.reviews / maxReviews) * 100;
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 text-xs font-bold text-gray-900">{dayName}</div>
            <div className="flex-1 h-8 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black">
              <div
                className="h-full bg-blue-500 transition-all duration-500
                         flex items-center justify-end pr-2"
                style={{ width: `${Math.max(width, 5)}%` }}
              >
                {day.reviews > 0 && (
                  <span className="text-xs font-bold text-white">{day.reviews}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== CARD DISTRIBUTION ==========
function CardDistribution({ stats, totalCards, t }) {
  if (!stats) return null;

  const total = totalCards || stats.total || 1;
  const data = [
    { 
      label: t('srs.newCards') || 'New', 
      value: stats.new || 0, 
      color: 'bg-blue-500', 
      percent: ((stats.new || 0) / total) * 100,
      description: t('srs.neverStudied') || 'Never studied'
    },
    { 
      label: t('srs.learning') || 'Learning', 
      value: stats.learning || 0, 
      color: 'bg-yellow-500', 
      percent: ((stats.learning || 0) / total) * 100,
      description: t('srs.stats.newlyLearned') || 'Newly learned'
    },
    { 
      label: t('srs.stats.familiar') || 'Familiar', 
      value: stats.young || 0, 
      color: 'bg-orange-500', 
      percent: ((stats.young || 0) / total) * 100,
      description: t('srs.stats.intervalLessThan21') || 'Interval < 21 days'
    },
    { 
      label: t('srs.mastered') || 'Mastered', 
      value: stats.mature || 0, 
      color: 'bg-green-500', 
      percent: ((stats.mature || 0) / total) * 100,
      description: t('srs.stats.intervalMoreThan21') || 'Interval > 21 days'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Pie-like bars */}
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-bold text-gray-900">{item.label}</span>
              <span className="text-xs text-gray-700 ml-2 font-medium">({item.description})</span>
            </div>
            <span className="font-bold text-gray-900">{item.value} ({Math.round(item.percent)}%)</span>
          </div>
          <div className="h-6 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black">
            <div
              className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end pr-2`}
              style={{ width: `${Math.max(item.percent, 5)}%` }}
            >
              {item.value > 0 && item.percent > 15 && (
                <span className="text-xs font-bold text-white">{item.value}</span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t-[3px] border-black">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-gray-900">{t('srs.stats.total') || 'Total'}:</span>
          <span className="text-gray-900 text-base">{total} {t('srs.cards') || 'cards'}</span>
        </div>
      </div>
    </div>
  );
}

// ========== FORECAST CHART ==========
function ForecastChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((day, index) => {
        const height = (day.count / maxCount) * 100;
        const isToday = index === 0;

        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 text-xs font-bold text-gray-900">{day.dayName}</div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black flex items-end">
                <div
                  className={`w-full transition-all duration-500 flex items-center justify-center
                           ${isToday ? 'bg-purple-500' : 'bg-gray-400'}`}
                  style={{ height: `${Math.max(height, 20)}%` }}
                >
                  <span className="text-xs font-bold text-white">{day.count}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== STUDY HEATMAP ==========
function StudyHeatmap({ history }) {
  // Group by week
  const weeks = [];
  let currentWeek = [];

  history.slice(-28).forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === history.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const maxReviews = Math.max(...history.map(d => d.reviews), 1);

  return (
    <div className="space-y-2">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex gap-1">
          {week.map((day, dayIndex) => {
            const intensity = Math.min((day.reviews / maxReviews) * 4, 4);
            const colors = ['bg-gray-200', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'];
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div
                key={dayIndex}
                className={`flex-1 h-12 ${colors[Math.floor(intensity)]} border-[3px] border-black rounded-lg
                         flex items-center justify-center text-xs font-bold
                         hover:scale-110 transition-transform cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                title={`${dayName}: ${day.reviews} reviews`}
              >
                {day.reviews > 0 && day.reviews}
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex items-center justify-between text-xs text-gray-900 mt-2 font-medium">
        <span>Less</span>
        <div className="flex gap-1">
          {['bg-gray-200', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'].map((color, i) => (
            <div key={i} className={`w-4 h-4 ${color} border-[2px] border-black rounded-lg`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

// ========== OVERALL STATS TABLE ==========
function OverallStatsTable({ stats, deckInfo, t }) {
  if (!stats) return null;

  const rows = [
    { label: t('srs.stats.totalCards') || 'Total Cards', value: stats.total || 0, icon: '📚' },
    { label: t('srs.stats.totalReviews') || 'Total Reviews', value: stats.totalReviews || 0, icon: '🔄' },
    { label: t('srs.stats.correctReviews') || 'Correct Reviews', value: Math.round((stats.retention || 0) * (stats.totalReviews || 0)), icon: '✅' },
    { label: t('srs.stats.retentionRate') || 'Retention Rate', value: `${Math.round((stats.retention || 0) * 100)}%`, icon: '⭐' },
    { label: t('srs.stats.averageEase') || 'Average Ease', value: (stats.averageEase || 2.5).toFixed(2), icon: '📊' },
    { label: t('srs.stats.timeSpent') || 'Time Spent', value: formatTime(stats.totalTimeSpent || 0), icon: '⏱️' },
    { label: t('srs.stats.currentStreak') || 'Current Streak', value: `${stats.studyStreak || 0} ${t('srs.stats.days') || 'days'}`, icon: '🔥' },
    { label: t('srs.stats.longestStreak') || 'Longest Streak', value: `${stats.longestStreak || 0} ${t('srs.stats.days') || 'days'}`, icon: '🏆' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{row.icon}</span>
            <span className="font-bold text-gray-900">{row.label}</span>
          </div>
          <span className="text-lg font-black text-gray-900">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// ========== MASTERY PROGRESS ==========
function MasteryProgress({ level, stats, t }) {
  const getMasteryColor = (level) => {
    if (level < 25) return 'bg-red-500';
    if (level < 50) return 'bg-orange-500';
    if (level < 75) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getMasteryLabel = (level) => {
    if (level < 25) return (t('srs.stats.beginner') || 'Beginner') + ' 🌱';
    if (level < 50) return (t('srs.stats.learningLevel') || 'Learning') + ' 📚';
    if (level < 75) return (t('srs.stats.intermediate') || 'Intermediate') + ' 💪';
    if (level < 90) return (t('srs.stats.advanced') || 'Advanced') + ' 🎓';
    return (t('srs.stats.master') || 'Master') + ' 👑';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-black text-gray-900">{getMasteryLabel(level)}</span>
        <span className="text-4xl font-black text-gray-900">{level}%</span>
      </div>

      <div className="h-12 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black">
        <div
          className={`h-full ${getMasteryColor(level)} transition-all duration-1000 ease-out
                   flex items-center justify-center text-white text-lg font-black`}
          style={{ width: `${level}%` }}
        >
          {level > 10 && `${level}%`}
        </div>
      </div>

      <div className="mt-4 p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-sm text-gray-900 text-center font-medium">
          <strong className="text-green-600">{stats?.mature || 0}</strong> / <strong>{stats?.total || 0}</strong> {t('srs.cardsMastered') || 'cards mastered'}
        </p>
        <p className="text-xs text-gray-700 text-center mt-1 font-medium">
          ({t('srs.stats.intervalMoreThan21') || 'Interval > 21 days'})
        </p>
      </div>
    </div>
  );
}

// ========== HELPERS ==========
function formatTime(seconds) {
  if (!seconds) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export default StatisticsDashboard;

