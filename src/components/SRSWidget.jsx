// src/components/SRSWidget.jsx
// SRS Widget - Display SRS info and start review button

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDueCardsCount, calculateMasteryLevel } from '../services/progressTracker.js';
import { openDB } from 'idb';
import { useLanguage } from '../contexts/LanguageContext.jsx';

/**
 * SRSWidget Component
 * Shows SRS statistics and review button for lessons
 * 
 * @param {object} lesson - Lesson data with SRS enabled
 */
function SRSWidget({ lesson }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dueCount, setDueCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [mastery, setMastery] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const deckId = lesson.id;
  const userId = 'user-001'; // TODO: Get from auth context
  const totalCards = lesson.srs?.cardCount || 0;

  useEffect(() => {
    loadSRSStats();
  }, [deckId]);

  const loadSRSStats = async () => {
    try {
      const [due, masteryLevel] = await Promise.all([
        getDueCardsCount(userId, deckId),
        calculateMasteryLevel(userId, deckId)
      ]);

      // Get detailed card states
      const db = await openDB('elearning-db', 3);
      const allProgress = await db.getAllFromIndex('srsProgress', 'by-deck', deckId);
      
      const now = new Date();
      let newCardsCount = 0;
      let learningCardsCount = 0;
      let masteredCardsCount = 0;
      
      // Count cards by state
      allProgress.forEach(progress => {
        if (progress.state === 'new') {
          newCardsCount++;
        } else if (progress.state === 'learning') {
          learningCardsCount++;
        } else if (progress.state === 'mastered') {
          masteredCardsCount++;
        }
      });
      
      // Calculate new cards (cards not in progress yet)
      const progressCardIds = new Set(allProgress.map(p => p.cardId));
      const allCardIds = lesson.srs?.cards?.map(c => c.id) || [];
      newCardsCount = allCardIds.filter(id => !progressCardIds.has(id)).length;

      setDueCount(due);
      setNewCount(newCardsCount);
      setLearningCount(learningCardsCount);
      setMasteredCount(masteredCardsCount);
      setMastery(masteryLevel);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load SRS stats:', error);
      setIsLoading(false);
    }
  };

  const handleStartReview = () => {
    navigate(`/review/${deckId}`);
  };

  if (!lesson.srs?.enabled) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Header - Neo Brutalism Style */}
      <div className="bg-white border-b-[4px] border-black p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🎴</div>
          <div className="flex-1">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
              {t('srs.flashcards') || 'Flashcards'}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 font-semibold">
              {totalCards} {t('srs.cards') || 'cards'} • {t('srs.smartSystem') || 'Smart learning system'}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-6xl mb-3">⏳</div>
          <p className="text-base text-gray-600 font-medium">{t('srs.loading') || 'Loading...'}</p>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          {/* Stats Cards - Neo Brutalism Style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* New Cards */}
            <div className="group p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <div className="text-4xl sm:text-5xl font-black text-blue-600 mb-1">{newCount}</div>
              <p className="text-xs font-bold text-gray-900">✨ {t('srs.newCards') || 'New'}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{t('srs.neverStudied') || 'Never studied'}</p>
            </div>
            
            {/* Due Cards */}
            <div className="group p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <div className="text-4xl sm:text-5xl font-black text-orange-600 mb-1">{dueCount}</div>
              <p className="text-xs font-bold text-gray-900">🔄 {t('srs.dueCards') || 'Due'}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{t('srs.timeToReview') || 'Time to review'}</p>
            </div>
            
            {/* Learning Cards */}
            <div className="group p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <div className="text-4xl sm:text-5xl font-black text-yellow-600 mb-1">{learningCount}</div>
              <p className="text-xs font-bold text-gray-900">📖 {t('srs.learning') || 'Learning'}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{t('srs.stillLearning') || 'Still learning'}</p>
            </div>
            
            {/* Mastered Cards */}
            <div className="group p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <div className="text-4xl sm:text-5xl font-black text-green-600 mb-1">{masteredCount}</div>
              <p className="text-xs font-bold text-gray-900">⭐ {t('srs.mastered') || 'Mastered'}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{t('srs.wellRemembered') || 'Well remembered'}</p>
            </div>
          </div>

          {/* Progress Bar - Neo Brutalism Style */}
          <div className="mb-6 p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>📈</span>
                <span>{t('srs.overallProgress') || 'Overall Progress'}</span>
              </span>
              <span className="text-lg font-black text-gray-900">{mastery}%</span>
            </div>
            <div className="h-5 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black">
              <div 
                className="h-full bg-yellow-400 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ width: `${mastery}%` }}
              >
                {mastery > 10 && (
                  <span className="text-xs font-bold text-gray-900">
                    {mastery}%
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-700 mt-2 text-center font-medium">
              {masteredCount} / {totalCards} {t('srs.cardsMastered') || 'cards mastered'}
            </p>
          </div>

          {/* Status Banner - Neo Brutalism Style */}
          {newCount > 0 || dueCount > 0 ? (
            <div className="mb-5 p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-start gap-3">
                <div className="text-4xl flex-shrink-0">
                  {newCount > 0 && dueCount === 0 && '✨'}
                  {dueCount > 0 && newCount === 0 && '⏰'}
                  {dueCount > 0 && newCount > 0 && '🎯'}
                </div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-black text-gray-900 mb-1">
                    {newCount > 0 && dueCount === 0 && (t('srs.startNewCards') || 'Start learning new cards!')}
                    {dueCount > 0 && newCount === 0 && (t('srs.timeToReviewBanner') || 'Time to review!')}
                    {dueCount > 0 && newCount > 0 && (t('srs.readyToStudy') || 'Ready to study!')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {newCount > 0 && `📌 ${newCount} ${t('srs.newCardsWaiting') || 'new cards'}. `}
                    {dueCount > 0 && `📌 ${dueCount} ${t('srs.cardsNeedReview') || 'cards to review'}. `}
                    {t('srs.clickToStart') || 'Click button below to start!'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <div className="text-5xl">🎉</div>
                <div className="flex-1">
                  <p className="text-lg font-black text-gray-900 mb-1">
                    {t('srs.excellent') || 'Excellent! All done!'}
                  </p>
                  <p className="text-sm text-gray-700">
                    {t('srs.allCardsCompleted') || 'You have completed all cards. Come back later to review!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Main Study Button - Neo Brutalism Style */}
            <button
              onClick={handleStartReview}
              disabled={newCount === 0 && dueCount === 0}
              className={`
                w-full px-6 py-5 rounded-lg border-[4px] border-black font-black text-xl
                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                transition-all duration-200
                ${newCount > 0 || dueCount > 0
                  ? 'bg-yellow-400 text-gray-900 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">
                  {newCount > 0 || dueCount > 0 ? '🚀' : '✅'}
                </span>
                  <div>
                    <div>
                      {newCount > 0 && dueCount === 0 && (t('srs.studyNewCards') || 'STUDY NEW CARDS')}
                      {dueCount > 0 && newCount === 0 && (t('srs.reviewNow') || 'REVIEW NOW')}
                      {dueCount > 0 && newCount > 0 && (t('srs.startStudying') || 'START STUDYING')}
                      {newCount === 0 && dueCount === 0 && (t('srs.completed') || 'COMPLETED')}
                    </div>
                    {(newCount > 0 || dueCount > 0) && (
                      <div className="text-sm font-medium opacity-90">
                        {newCount + dueCount} {t('srs.cardsWaitingForYou') || 'cards waiting'}
                      </div>
                    )}
                  </div>
              </div>
            </button>
            
            {/* Secondary Button - Neo Brutalism Style */}
            <Link
              to={`/statistics/${deckId}`}
              className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black
                       font-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all"
            >
              📊 {t('srs.viewDetailedStats') || 'View Detailed Statistics'}
            </Link>
          </div>

          {/* Tips Section - Neo Brutalism Style */}
          <div className="mt-5 p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs sm:text-sm text-gray-900 flex items-start gap-2">
              <span className="text-lg flex-shrink-0">💡</span>
              <span>
                <strong className="text-gray-900 font-black">{t('srs.studyTip') || 'Study Tip'}:</strong> {t('srs.tipMessage', { count: lesson.srs?.newCardsPerDay || 20 }) || `Study ${lesson.srs?.newCardsPerDay || 20} new cards daily and review regularly. The system will automatically remind you at the right time for best retention!`}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SRSWidget;

