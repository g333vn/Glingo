// src/components/admin/content/AllLevelsOverview.jsx
// Component hiển thị tổng quan tất cả 5 levels với statistics

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import storageManager from '../../../utils/localStorageManager.js';

function AllLevelsOverview({ onLevelClick, refreshTrigger }) {
  const { t } = useLanguage();
  const [levelsStats, setLevelsStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllLevelsStats = async () => {
      setLoading(true);
      const stats = {};
      const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
      
      for (const level of levels) {
        const [series, books] = await Promise.all([
          storageManager.getSeries(level),
          storageManager.getBooks(level)
        ]);
        
        // Calculate lessons and quizzes count
        let lessonsCount = 0;
        let quizzesCount = 0;
        
        for (const book of books || []) {
          const chapters = await storageManager.getChapters(book.id, level);
          for (const chapter of chapters || []) {
            const lessons = await storageManager.getLessons(book.id, chapter.id, level);
            lessonsCount += (lessons || []).length;
            for (const lesson of lessons || []) {
              const quiz = await storageManager.getQuiz(book.id, chapter.id, lesson.id, level);
              if (quiz) quizzesCount++;
            }
          }
        }
        
        // Calculate status counts
        let published = 0;
        let draft = 0;
        let empty = 0;
        
        for (const s of series || []) {
          // Use stored status if available
          if (s.status) {
            if (s.status === 'published') published++;
            else if (s.status === 'draft') draft++;
            else if (s.status === 'empty') empty++;
            continue;
          }
          
          // Calculate status based on content
          const seriesBooks = (books || []).filter(b => b.category === s.name);
          if (seriesBooks.length === 0) {
            empty++;
          } else {
            // Check if books have content
            let hasContent = false;
            for (const book of seriesBooks) {
              const chapters = await storageManager.getChapters(book.id, level);
              if (chapters && chapters.length > 0) {
                hasContent = true;
                break;
              }
            }
            if (hasContent) published++;
            else draft++;
          }
        }
        
        stats[level] = {
          series: (series || []).length,
          books: (books || []).length,
          lessons: lessonsCount,
          quizzes: quizzesCount,
          published,
          draft,
          empty
        };
      }
      
      setLevelsStats(stats);
      setLoading(false);
    };
    
    loadAllLevelsStats();
  }, [refreshTrigger]); // ✅ Reload khi refreshTrigger thay đổi

  const levelInfo = {
    n5: { name: 'JLPT N5', description: t('contentManagement.levels.n5'), color: 'from-green-50 to-emerald-50', borderColor: 'border-green-300' },
    n4: { name: 'JLPT N4', description: t('contentManagement.levels.n4'), color: 'from-blue-50 to-cyan-50', borderColor: 'border-blue-300' },
    n3: { name: 'JLPT N3', description: t('contentManagement.levels.n3'), color: 'from-yellow-50 to-amber-50', borderColor: 'border-yellow-300' },
    n2: { name: 'JLPT N2', description: t('contentManagement.levels.n2'), color: 'from-orange-50 to-red-50', borderColor: 'border-orange-300' },
    n1: { name: 'JLPT N1', description: t('contentManagement.levels.n1'), color: 'from-purple-50 to-pink-50', borderColor: 'border-purple-300' }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">{t('contentManagement.loading')}</p>
      </div>
    );
  }

  // Calculate totals
  const totals = Object.values(levelsStats).reduce((acc, stats) => ({
    series: acc.series + stats.series,
    books: acc.books + stats.books,
    lessons: acc.lessons + stats.lessons,
    quizzes: acc.quizzes + stats.quizzes
  }), { series: 0, books: 0, lessons: 0, quizzes: 0 });

  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6 space-y-6">
      {/* System Overview Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-[3px] border-blue-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-4">📊 {t('contentManagement.systemOverview')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">5</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 font-bold">{t('contentManagement.levels.title')}</div>
          </div>
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-green-600">{totals.series}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 font-bold">{t('contentManagement.series.title')}</div>
          </div>
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-purple-600">{totals.books}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 font-bold">{t('contentManagement.books.title')}</div>
          </div>
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-orange-600">{totals.lessons}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 font-bold">{t('contentManagement.lessons.title')}</div>
          </div>
        </div>
      </div>

      {/* Level Cards */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-gray-800">📋 {t('contentManagement.levelList')}</h2>
        {['n1', 'n2', 'n3', 'n4', 'n5'].map(level => {
          const info = levelInfo[level];
          const stats = levelsStats[level] || { series: 0, books: 0, lessons: 0, quizzes: 0, published: 0, draft: 0, empty: 0 };
          const hasAlerts = stats.empty > 0;
          
          return (
            <div
              key={level}
              className={`bg-gradient-to-r ${info.color} rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer`}
              onClick={() => onLevelClick(level)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-800">
                    🎓 {info.name} - {info.description}
                  </h3>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-black text-sm">
                  {t('contentManagement.viewDetails')} →
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="text-sm">
                  <span className="font-black text-gray-700">📊 {stats.series} {t('contentManagement.series.title')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-black text-gray-700">📖 {stats.books} {t('contentManagement.books.title')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-black text-gray-700">📝 {stats.lessons} {t('contentManagement.lessons.title')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-black text-gray-700">❓ {stats.quizzes} {t('contentManagement.quizzes.title')}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className={`px-2 py-1 rounded-full border-[2px] border-black font-bold ${stats.published > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  🟢 {stats.published} {t('contentManagement.status.published')}
                </span>
                <span className={`px-2 py-1 rounded-full border-[2px] border-black font-bold ${stats.draft > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                  🟡 {stats.draft} {t('contentManagement.status.draft')}
                </span>
                <span className={`px-2 py-1 rounded-full border-[2px] border-black font-bold ${stats.empty > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                  🔴 {stats.empty} {t('contentManagement.status.empty')}
                </span>
              </div>
              
              {hasAlerts && (
                <div className="mt-3 p-2 bg-orange-100 border-[3px] border-orange-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs text-orange-800 font-bold">
                  ⚠️ {t('contentManagement.emptySeriesWarning', { count: stats.empty })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AllLevelsOverview;

