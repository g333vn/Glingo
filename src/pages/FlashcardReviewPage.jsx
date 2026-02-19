// src/pages/FlashcardReviewPage.jsx
// Flashcard Review Page - Student review interface with SRS

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  calculateNextReview, 
  initializeCardProgress,
  getDueCards,
  getNewCards,
  getGradeInfo,
  getIntervalPreview,
  GRADES,
  CARD_STATES
} from '../services/srsAlgorithm.js';
import { openDB } from 'idb';
import { updateStudyStreak } from '../utils/lessonProgressTracker.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

/**
 * FlashcardReviewPage Component
 * Student review interface with SRS algorithm
 * 
 * Features:
 * - Card flip animation
 * - Grade buttons (Again/Hard/Good/Easy)
 * - Progress tracking
 * - Keyboard shortcuts
 * - Session summary
 */
function FlashcardReviewPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  // ========== STATE ==========
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now()); // Add current time state
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    reviewedCards: 0,
    correctCards: 0,
    startTime: null,
    endTime: null
  });

  // ========== LOAD SESSION ==========
  useEffect(() => {
    loadReviewSession();
  }, [deckId]);

  const loadReviewSession = async () => {
    try {
      setIsLoading(true);

      console.log('🔍 Loading review session for deckId:', deckId);

      const db = await openDB('elearning-db', 3);

      // FIXED: Scan all lessons to find the one with matching ID
      // (IndexedDB uses composite key [bookId, chapterId], not lessonId)
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
      
      console.log('📦 Final lesson object:', lesson);
      
      if (!lesson) {
        alert('❌ Không tìm thấy bài học!\n\n' +
              `Deck ID: ${deckId}\n\n` +
              'Có thể do:\n' +
              '• Bài học chưa được lưu trong hệ thống\n' +
              '• Flashcard chưa được thêm vào bài học\n' +
              '• Dữ liệu đã bị xóa\n\n' +
              'Vui lòng quay lại trang quản lý bài học và kiểm tra lại.');
        navigate(-1);
        return;
      }
      
      if (!lesson.srs?.enabled) {
        alert('❌ Flashcard chưa được bật!\n\n' +
              `Bài học: ${lesson.title || deckId}\n\n` +
              'Vui lòng:\n' +
              '1. Vào trang Quản lý Bài học\n' +
              '2. Chỉnh sửa bài học này\n' +
              '3. Bật tính năng Flashcard SRS\n' +
              '4. Thêm flashcard vào bài học');
        navigate(-1);
        return;
      }
      
      console.log('✅ Lesson found:', lesson.title || lesson.id);
      console.log('  - SRS enabled:', lesson.srs.enabled);
      console.log('  - Card count:', lesson.srs.cardCount || lesson.srs.cards?.length || 0);

      // Get all cards for this deck
      const allCards = lesson.srs?.cards || [];
      if (allCards.length === 0) {
        alert('No flashcards in this deck!');
        navigate(`/lesson/${deckId}`);
        return;
      }

      // Get current user (simplified - in production, use auth context)
      const userId = 'user-001'; // TODO: Get from auth context

      // Get all progress for this deck
      const allProgress = await db.getAllFromIndex('srsProgress', 'by-deck', deckId);

      // Get due cards
      const dueCards = getDueCards(allProgress);

      // Get new cards (up to limit from settings)
      const newCardsLimit = lesson.srs?.newCardsPerDay || 20;
      const newCards = getNewCards(allProgress, allCards, newCardsLimit);

      // Combine due + new cards
      const reviewQueue = [
        ...dueCards.map(progress => ({
          card: allCards.find(c => c.id === progress.cardId),
          progress
        })),
        ...newCards.map(card => ({
          card,
          progress: initializeCardProgress(card.id, deckId, userId)
        }))
      ].filter(item => item.card); // Filter out any nulls

      if (reviewQueue.length === 0) {
        // FIXED: Don't alert, show friendly "all caught up" screen
        setSession({
          deckId,
          deckName: lesson.title || 'Flashcard Deck',
          userId,
          reviewQueue: [],
          settings: lesson.srs,
          allCardsCount: allCards.length,
          masteredCount: allProgress.filter(p => p.state === 'mastered').length
        });
        setIsLoading(false);
        return;
      }

      // Initialize session
      const now = new Date();
      setSession({
        deckId,
        deckName: lesson.title || 'Flashcard Deck',
        userId,
        reviewQueue,
        settings: lesson.srs
      });

      setSessionStats({
        totalCards: reviewQueue.length,
        reviewedCards: 0,
        correctCards: 0,
        startTime: now,
        endTime: null
      });

      setStartTime(now);
      setIsLoading(false);

      console.log('✅ Review session loaded:', {
        deck: lesson.title,
        dueCards: dueCards.length,
        newCards: newCards.length,
        total: reviewQueue.length
      });

    } catch (error) {
      console.error('❌ Failed to load review session:', error);
      alert('Error loading review session!');
      navigate('/');
    }
  };

  // ========== HANDLERS ==========
  
  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleGrade = async (grade) => {
    if (!isFlipped) {
      // Must flip card first before grading
      setIsFlipped(true);
      return;
    }

    try {
      const currentItem = session.reviewQueue[currentCardIndex];
      const { card, progress } = currentItem;

      // Calculate next review with SRS algorithm
      const updatedProgress = calculateNextReview(progress, grade);

      // Save to IndexedDB
      const db = await openDB('elearning-db', 3);
      await db.put('srsProgress', updatedProgress);

      // Save review history
      const reviewRecord = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        deckId: session.deckId,
        cardId: card.id,
        grade,
        timeSpent: Date.now() - startTime.getTime(),
        timestamp: new Date().toISOString()
      };
      await db.add('reviews', reviewRecord);

      // Update stats
      setSessionStats(prev => ({
        ...prev,
        reviewedCards: prev.reviewedCards + 1,
        correctCards: grade >= GRADES.GOOD ? prev.correctCards + 1 : prev.correctCards
      }));

      // Move to next card
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= session.reviewQueue.length) {
        // Session complete
        finishSession();
      } else {
        setCurrentCardIndex(nextIndex);
        setIsFlipped(false);
        setStartTime(new Date());
      }

      console.log('✅ Card graded:', {
        card: card.front,
        grade: getGradeInfo(grade).label,
        nextReview: updatedProgress.nextReview
      });

    } catch (error) {
      console.error('❌ Failed to grade card:', error);
      alert('Error saving review!');
    }
  };

  const finishSession = () => {
    setSessionStats(prev => ({
      ...prev,
      endTime: new Date()
    }));
    
    // Update study streak when finishing flashcard session
    updateStudyStreak(user);
    console.log('✅ Study streak updated after flashcard session');
  };

  // ========== TIMER UPDATE ==========
  useEffect(() => {
    // Update current time every second for live timer
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ========== KEYBOARD SHORTCUTS ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isLoading || !session) return;

      // Flip card
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
        return;
      }

      // Grade buttons (only when flipped)
      if (isFlipped) {
        if (e.key === '1') handleGrade(GRADES.AGAIN);
        else if (e.key === '2') handleGrade(GRADES.HARD);
        else if (e.key === '3') handleGrade(GRADES.GOOD);
        else if (e.key === '4') handleGrade(GRADES.EASY);
      }

      // Exit session
      if (e.code === 'Escape') {
        if (confirm('Exit review session?')) {
          navigate(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoading, session, isFlipped, handleFlip, handleGrade]);

  // ========== RENDER ==========

  if (isLoading) {
    return (
      <LoadingSpinner
        label={t('srs.loadingReview') || 'Loading review session...'}
        icon="📚"
      />
    );
  }

  // Session complete
  if (sessionStats.endTime) {
    return <SessionSummary stats={sessionStats} session={session} />;
  }

  // NEW: All Caught Up Screen - Friendly UX
  if (!session) {
    return (
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 m-6">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-xl font-black text-gray-900 mb-4">Không tìm thấy deck!</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  ← Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.reviewQueue.length === 0) {
    return <AllCaughtUpScreen session={session} navigate={navigate} />;
  }
  
  if (!session.reviewQueue[currentCardIndex]) {
    return (
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 m-6">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-xl font-black text-gray-900 mb-4">Không tìm thấy thẻ!</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  ← Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = session.reviewQueue[currentCardIndex];
  const { card, progress } = currentItem;
  const progressPercent = ((currentCardIndex + 1) / session.reviewQueue.length) * 100;
  // Calculate time elapsed using currentTime state (updates every second)
  const timeElapsed = startTime ? Math.floor((currentTime - startTime.getTime()) / 1000) : 0;

  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-black text-gray-900">
                  📚 {session.deckName}
                </h1>
                <button
                  onClick={() => {
                    if (confirm('Exit review session?')) navigate(-1);
                  }}
                  className="px-4 py-2 text-sm font-black text-gray-900 hover:text-gray-700 border-[2px] border-black rounded-lg bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  ✖️ Exit
                </button>
              </div>

              {/* Progress Bar - Neo Brutalism Style */}
              <div className="relative">
                <div className="h-6 bg-gray-200 rounded-lg overflow-hidden border-[3px] border-black">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500 ease-out
                             flex items-center justify-center text-gray-900 text-xs font-bold"
                    style={{ width: `${progressPercent}%` }}
                  >
                    {progressPercent > 20 && `${Math.round(progressPercent)}%`}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 text-center font-medium">
                  {t('srs.cardProgress', { current: currentCardIndex + 1, total: session.reviewQueue.length }) || `Card ${currentCardIndex + 1} of ${session.reviewQueue.length}`}
                </p>
              </div>
            </div>

            {/* Flashcard */}
            <div className="mb-6">
              <FlashcardDisplay
                card={card}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                progress={progress}
                t={t}
              />
            </div>

            {/* Grade Buttons */}
            {isFlipped && (
              <GradeButtons
                progress={progress}
                onGrade={handleGrade}
              />
            )}

            {/* Footer Stats */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>{timeElapsed}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{sessionStats.correctCards}/{sessionStats.reviewedCards}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span>
              {sessionStats.reviewedCards > 0
                ? Math.round((sessionStats.correctCards / sessionStats.reviewedCards) * 100)
                : 0}%
            </span>
          </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="mt-4 text-center text-xs text-gray-700 font-medium">
              💡 {t('srs.keyboardHints') || 'Space to flip • 1-4 to grade • Esc to exit'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== FLASHCARD DISPLAY COMPONENT ==========
function FlashcardDisplay({ card, isFlipped, onFlip, progress, t }) {
  return (
    <div
      className="perspective-1000 cursor-pointer"
      onClick={onFlip}
    >
      <div
        className={`
          relative w-full h-96 transition-transform duration-500 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 p-8 rounded-lg border-[4px] border-black
                   bg-gradient-to-br from-blue-400 to-blue-600
                   shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                   flex flex-col items-center justify-center text-center
                   backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-6xl font-black text-white mb-6">
            {card.front}
          </p>
          {card.reading && (
            <p className="text-2xl font-mono text-blue-100">
              {card.reading}
            </p>
          )}
          <p className="text-sm text-blue-200 mt-8">
            👆 {t('srs.clickToReveal') || 'Click to reveal answer'}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 p-8 rounded-lg border-[4px] border-black
                   bg-gradient-to-br from-green-400 to-green-600
                   shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                   flex flex-col items-center justify-center text-center
                   backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <p className="text-5xl font-black text-white mb-4">
            {card.back}
          </p>
          {card.example && (
            <div className="mt-6 p-4 bg-white/20 rounded-lg backdrop-blur-sm max-w-md">
              <p className="text-lg text-white font-semibold">
                {card.example}
              </p>
              {card.exampleTranslation && (
                <p className="text-sm text-green-100 mt-2">
                  {card.exampleTranslation}
                </p>
              )}
            </div>
          )}
          {card.notes && (
            <p className="text-sm text-green-100 mt-4 italic">
              💡 {card.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== GRADE BUTTONS COMPONENT ==========
function GradeButtons({ progress, onGrade }) {
  const grades = [
    { value: GRADES.AGAIN, key: '1' },
    { value: GRADES.HARD, key: '2' },
    { value: GRADES.GOOD, key: '3' },
    { value: GRADES.EASY, key: '4' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {grades.map(({ value, key }) => {
        const info = getGradeInfo(value);
        const interval = getIntervalPreview(progress, value);

        return (
          <button
            key={value}
            onClick={() => onGrade(value)}
            className={`
              relative p-4 rounded-lg border-[3px] border-black
              font-black text-lg transition-all
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[-2px] hover:translate-y-[-2px]
              ${info.color === 'red' ? 'bg-red-400 hover:bg-red-500' : ''}
              ${info.color === 'orange' ? 'bg-orange-400 hover:bg-orange-500' : ''}
              ${info.color === 'green' ? 'bg-green-400 hover:bg-green-500' : ''}
              ${info.color === 'blue' ? 'bg-blue-400 hover:bg-blue-500' : ''}
              text-white
            `}
          >
            <div className="text-3xl mb-1">{info.emoji}</div>
            <div className="text-sm">{info.label}</div>
            <div className="text-xs opacity-80 mt-1">{interval}</div>
            <kbd className="absolute top-2 right-2 px-2 py-1 bg-black/20 rounded text-xs">
              {key}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}

// ========== ALL CAUGHT UP SCREEN ==========
function AllCaughtUpScreen({ session, navigate }) {
  const { t } = useLanguage();
  
  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto flex items-center justify-center px-6 py-8">
            <div className="max-w-2xl w-full">
              {/* Header */}
              <div className="bg-white border-b-[4px] border-black p-8 text-center mb-6">
                <div className="text-8xl mb-4 animate-bounce">🎉</div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  {t('srs.excellent') || 'Excellent!'}
                </h1>
                <p className="text-xl text-gray-700 font-semibold">
                  {t('srs.allDoneToday') || 'You completed all cards today!'}
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Stats - Neo Brutalism Style */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-5xl font-black text-purple-600 mb-1">
                      {session.allCardsCount || 0}
                    </div>
                    <p className="text-sm font-bold text-gray-900">Tổng số thẻ</p>
                  </div>
                  <div className="p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-5xl font-black text-green-600 mb-1">
                      {session.masteredCount || 0}
                    </div>
                    <p className="text-sm font-bold text-gray-900">Đã thành thạo</p>
                  </div>
                </div>

                {/* Message - Neo Brutalism Style */}
                <div className="mb-6 p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-center text-gray-900">
                    <span className="text-2xl mr-2">⏰</span>
                    <strong className="font-black">{t('srs.seeYouAgain') || 'See you again!'}</strong>
                  </p>
                  <p className="text-sm text-gray-700 text-center mt-2 font-medium">
                    {t('srs.comeBackLater') || 'Cards will be ready to review at the right time. Come back later!'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/statistics/${session.deckId}`)}
                    className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-lg border-[3px] border-black
                             font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                             hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                             transition-all"
                  >
                    📊 {t('srs.viewStatistics') || 'View Statistics'}
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-4 bg-gray-300 text-gray-900 rounded-lg border-[3px] border-black
                             font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                             hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                             transition-all"
                  >
                    ← {t('srs.backToLesson') || 'Back to Lesson'}
                  </button>
                </div>

                {/* Tips - Neo Brutalism Style */}
                <div className="mt-6 p-4 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-xs text-gray-900 flex items-start gap-2">
                    <span className="text-base flex-shrink-0">💡</span>
                    <span>
                      <strong className="text-gray-900 font-black">{t('srs.studyTip') || 'Study Tip'}:</strong> {t('srs.studyTipMessage') || 'Study consistently every day. Come back tomorrow to continue!'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== SESSION SUMMARY COMPONENT ==========
function SessionSummary({ stats, session }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const duration = Math.floor((stats.endTime - stats.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const accuracy = stats.reviewedCards > 0
    ? Math.round((stats.correctCards / stats.reviewedCards) * 100)
    : 0;

  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto flex items-center justify-center px-6 py-8">
            <div className="max-w-2xl w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">🎉</div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  {t('srs.sessionComplete') || 'Session Complete!'}
                </h1>
                <p className="text-gray-700 font-medium">
                  {t('srs.greatWork') || 'Great work! Keep it up!'} 💪
                </p>
              </div>

              {/* Stats Grid - Neo Brutalism Style */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-3xl font-black text-blue-600">{stats.totalCards}</p>
                  <p className="text-sm font-bold text-gray-900">{t('srs.cards') || 'Cards'}</p>
                </div>
                <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-3xl font-black text-green-600">{stats.correctCards}</p>
                  <p className="text-sm font-bold text-gray-900">{t('srs.correct') || 'Correct'}</p>
                </div>
                <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-3xl font-black text-purple-600">{accuracy}%</p>
                  <p className="text-sm font-bold text-gray-900">{t('srs.accuracy') || 'Accuracy'}</p>
                </div>
                <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-3xl font-black text-orange-600">{minutes}m {seconds}s</p>
                  <p className="text-sm font-bold text-gray-900">{t('srs.time') || 'Time'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-4 bg-green-500 text-white rounded-lg border-[3px] border-black
                           font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all"
                >
                  🔄 {t('srs.reviewAgain') || 'Review Again'}
                </button>
                <button
                  onClick={() => navigate(`/statistics/${session.deckId}`)}
                  className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-lg border-[3px] border-black
                           font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all"
                >
                  📊 {t('srs.viewStats') || 'View Stats'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-4 bg-gray-300 text-gray-900 rounded-lg border-[3px] border-black
                           font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all"
                >
                  ← {t('common.back') || 'Back'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashcardReviewPage;

