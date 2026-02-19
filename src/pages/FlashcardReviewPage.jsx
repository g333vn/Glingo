// src/pages/FlashcardReviewPage.jsx
// Flashcard Review Page - Student review interface with SRS

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { supabase } from '../services/supabaseClient.js';
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
  const location = useLocation();
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

  // Tim bai hoc tu nhieu nguon: route state > IndexedDB > Supabase
  const findLesson = async (db) => {
    // Nguon 1: Route state (truyen tu SRSWidget, du lieu chinh xac nhat)
    const stateLesson = location.state?.lesson;
    if (stateLesson && stateLesson.id === deckId) {
      console.log('  - Tim thay lesson tu route state');
      return stateLesson;
    }

    // Nguon 2: IndexedDB cache (ho tro offline)
    try {
      const allLessonGroups = await db.getAll('lessons');
      for (const group of allLessonGroups) {
        if (group.lessons && Array.isArray(group.lessons)) {
          const found = group.lessons.find(l => l.id === deckId);
          if (found) {
            console.log(`  - Tim thay lesson trong IndexedDB [${group.bookId}, ${group.chapterId}]`);
            return found;
          }
        }
      }
    } catch (err) {
      console.warn('  - Khong the doc IndexedDB:', err.message);
    }

    // Nguon 3: Truy van truc tiep Supabase (fallback khi cache thieu hoac cu)
    try {
      console.log('  - Thu truy van Supabase theo lesson ID...');
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', deckId)
        .maybeSingle();

      if (!error && data) {
        // Chuyen doi tu dinh dang Supabase sang dinh dang app
        const lesson = {
          id: data.id,
          bookId: data.book_id,
          chapterId: data.chapter_id,
          level: data.level,
          title: data.title,
          description: data.description,
          contentType: data.content_type,
          pdfUrl: data.pdf_url,
          htmlContent: data.html_content,
          theory: data.theory,
          srs: data.srs,
          orderIndex: data.order_index
        };
        console.log('  - Tim thay lesson tu Supabase');
        return lesson;
      }
    } catch (err) {
      console.warn('  - Khong the truy van Supabase:', err.message);
    }

    return null;
  };

  const loadReviewSession = async () => {
    try {
      setIsLoading(true);

      console.log('Loading review session cho deckId:', deckId);

      // Su dung version 4 dong bo voi indexedDBManager
      const db = await openDB('elearning-db', 4);

      // Tim bai hoc tu nhieu nguon du lieu
      const lesson = await findLesson(db);
      
      console.log('Ket qua tim bai hoc:', lesson ? (lesson.title || lesson.id) : 'KHONG TIM THAY');
      
      if (!lesson) {
        alert('Khong tim thay bai hoc!\n\n' +
              `Deck ID: ${deckId}\n\n` +
              'Co the do:\n' +
              'Bai hoc chua duoc luu trong he thong\n' +
              'Flashcard chua duoc them vao bai hoc\n' +
              'Du lieu da bi xoa\n\n' +
              'Vui long quay lai trang quan ly bai hoc va kiem tra lai.');
        navigate(-1);
        return;
      }
      
      if (!lesson.srs?.enabled) {
        alert('Flashcard chua duoc bat!\n\n' +
              `Bai hoc: ${lesson.title || deckId}\n\n` +
              'Vui long:\n' +
              '1. Vao trang Quan ly Bai hoc\n' +
              '2. Chinh sua bai hoc nay\n' +
              '3. Bat tinh nang Flashcard SRS\n' +
              '4. Them flashcard vao bai hoc');
        navigate(-1);
        return;
      }
      
      console.log('Lesson found:', lesson.title || lesson.id);
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
        // Khong con the due/new -> load tat ca the de nguoi dung xem lai
        const browseQueue = allCards.map(card => {
          const existingProgress = allProgress.find(p => p.cardId === card.id);
          return {
            card,
            progress: existingProgress || initializeCardProgress(card.id, deckId, userId)
          };
        });

        const now = new Date();
        setSession({
          deckId,
          deckName: lesson.title || 'Flashcard Deck',
          userId,
          reviewQueue: browseQueue,
          settings: lesson.srs,
          allCardsCount: allCards.length,
          masteredCount: allProgress.filter(p => p.state === 'mastered').length,
          isBrowseMode: true
        });

        setSessionStats({
          totalCards: browseQueue.length,
          reviewedCards: 0,
          correctCards: 0,
          startTime: now,
          endTime: null
        });

        setStartTime(now);
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

      // Luu vao IndexedDB (version 4 dong bo voi indexedDBManager)
      const db = await openDB('elearning-db', 4);
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
          {/* Responsive: chi ap dung sticky va chieu cao co dinh tu md tro len */}
          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col
                          md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 m-4 sm:m-6">
                <div className="text-5xl sm:text-6xl mb-4">❌</div>
                <p className="text-lg sm:text-xl font-black text-gray-900 mb-4">Không tìm thấy deck!</p>
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
          {/* Responsive: chi ap dung sticky va chieu cao co dinh tu md tro len */}
          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col
                          md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 m-4 sm:m-6">
                <div className="text-5xl sm:text-6xl mb-4">❌</div>
                <p className="text-lg sm:text-xl font-black text-gray-900 mb-4">Không tìm thấy thẻ!</p>
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
        {/* Responsive: chi ap dung sticky va chieu cao co dinh tu md tro len */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col
                        md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
          <div className="flex-1 md:overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 break-words min-w-0 mr-2">
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

            {/* Thong ke phien hoc */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-700">
              <div className="flex items-center gap-1 sm:gap-2">
                <span>⏱️</span>
                <span>{timeElapsed}s</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span>✅</span>
                <span>{sessionStats.correctCards}/{sessionStats.reviewedCards}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span>⭐</span>
                <span>
                  {sessionStats.reviewedCards > 0
                    ? Math.round((sessionStats.correctCards / sessionStats.reviewedCards) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            {/* Goi y phim tat - an tren mobile vi khong co ban phim */}
            <div className="mt-3 sm:mt-4 text-center text-xs text-gray-700 font-medium hidden sm:block">
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
      {/* Responsive: chieu cao the nho hon tren mobile */}
      <div
        className={`
          relative w-full h-56 sm:h-72 md:h-96 transition-transform duration-500 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Mat truoc */}
        <div
          className="absolute inset-0 p-4 sm:p-6 md:p-8 rounded-lg border-[3px] sm:border-[4px] border-black
                   bg-gradient-to-br from-blue-400 to-blue-600
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                   flex flex-col items-center justify-center text-center
                   backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 sm:mb-4 md:mb-6 break-words max-w-full">
            {card.front}
          </p>
          {card.reading && (
            <p className="text-lg sm:text-xl md:text-2xl font-mono text-blue-100">
              {card.reading}
            </p>
          )}
          <p className="text-xs sm:text-sm text-blue-200 mt-4 sm:mt-6 md:mt-8">
            👆 {t('srs.clickToReveal') || 'Click to reveal answer'}
          </p>
        </div>

        {/* Mat sau */}
        <div
          className="absolute inset-0 p-4 sm:p-6 md:p-8 rounded-lg border-[3px] sm:border-[4px] border-black
                   bg-gradient-to-br from-green-400 to-green-600
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                   flex flex-col items-center justify-center text-center
                   backface-hidden overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <p className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2 sm:mb-3 md:mb-4 break-words max-w-full">
            {card.back}
          </p>
          {card.example && (
            <div className="mt-3 sm:mt-4 md:mt-6 p-2 sm:p-3 md:p-4 bg-white/20 rounded-lg backdrop-blur-sm max-w-md w-full">
              <p className="text-sm sm:text-base md:text-lg text-white font-semibold break-words">
                {card.example}
              </p>
              {card.exampleTranslation && (
                <p className="text-xs sm:text-sm text-green-100 mt-1 sm:mt-2 break-words">
                  {card.exampleTranslation}
                </p>
              )}
            </div>
          )}
          {card.notes && (
            <p className="text-xs sm:text-sm text-green-100 mt-2 sm:mt-4 italic break-words max-w-full">
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
    // Responsive: 2 cot tren mobile, 4 cot tu md tro len
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {grades.map(({ value, key }) => {
        const info = getGradeInfo(value);
        const interval = getIntervalPreview(progress, value);

        return (
          <button
            key={value}
            onClick={() => onGrade(value)}
            className={`
              relative p-2 sm:p-3 md:p-4 rounded-lg border-[2px] sm:border-[3px] border-black
              font-black text-base sm:text-lg transition-all
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[-2px] hover:translate-y-[-2px]
              ${info.color === 'red' ? 'bg-red-400 hover:bg-red-500' : ''}
              ${info.color === 'orange' ? 'bg-orange-400 hover:bg-orange-500' : ''}
              ${info.color === 'green' ? 'bg-green-400 hover:bg-green-500' : ''}
              ${info.color === 'blue' ? 'bg-blue-400 hover:bg-blue-500' : ''}
              text-white
            `}
          >
            <div className="text-2xl sm:text-3xl mb-1">{info.emoji}</div>
            <div className="text-xs sm:text-sm">{info.label}</div>
            <div className="text-[10px] sm:text-xs opacity-80 mt-1">{interval}</div>
            {/* An phim tat tren mobile vi khong co ban phim */}
            <kbd className="absolute top-1 right-1 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/20 rounded text-[10px] sm:text-xs hidden sm:block">
              {key}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}

// ========== MAN HINH DA HOAN THANH TAT CA THE ==========
function AllCaughtUpScreen({ session, navigate }) {
  const { t } = useLanguage();
  
  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        {/* Responsive: chi ap dung sticky va chieu cao co dinh tu md tro len */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col
                        md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
          <div className="flex-1 md:overflow-y-auto overflow-x-hidden flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-8">
            <div className="max-w-2xl w-full">
              {/* Phan dau */}
              <div className="bg-white border-b-[4px] border-black p-4 sm:p-6 md:p-8 text-center mb-4 sm:mb-6">
                <div className="text-6xl sm:text-7xl md:text-8xl mb-4 animate-bounce">🎉</div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  {t('srs.excellent') || 'Excellent!'}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 font-semibold">
                  {t('srs.allDoneToday') || 'You completed all cards today!'}
                </p>
              </div>

              {/* Noi dung */}
              <div className="p-3 sm:p-5 md:p-8">
                {/* Thong ke */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black text-purple-600 mb-1">
                      {session.allCardsCount || 0}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">Tổng số thẻ</p>
                  </div>
                  <div className="p-3 sm:p-5 bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black text-green-600 mb-1">
                      {session.masteredCount || 0}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">Đã thành thạo</p>
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

// ========== MAN HINH TONG KET PHIEN HOC ==========
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
        {/* Responsive: chi ap dung sticky va chieu cao co dinh tu md tro len */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col
                        md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
          <div className="flex-1 md:overflow-y-auto overflow-x-hidden flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-8">
            <div className="max-w-2xl w-full">
              {/* Phan dau */}
              <div className="text-center mb-5 sm:mb-6 md:mb-8">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4">🎉</div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
                  {t('srs.sessionComplete') || 'Session Complete!'}
                </h1>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {t('srs.greatWork') || 'Great work! Keep it up!'} 💪
                </p>
              </div>

              {/* Luoi thong ke */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-5 sm:mb-6 md:mb-8">
                <div className="p-2 sm:p-3 md:p-4 bg-white border-[2px] sm:border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600">{stats.totalCards}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{t('srs.cards') || 'Cards'}</p>
                </div>
                <div className="p-2 sm:p-3 md:p-4 bg-white border-[2px] sm:border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-green-600">{stats.correctCards}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{t('srs.correct') || 'Correct'}</p>
                </div>
                <div className="p-2 sm:p-3 md:p-4 bg-white border-[2px] sm:border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-purple-600">{accuracy}%</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{t('srs.accuracy') || 'Accuracy'}</p>
                </div>
                <div className="p-2 sm:p-3 md:p-4 bg-white border-[2px] sm:border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-orange-600">{minutes}m {seconds}s</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{t('srs.time') || 'Time'}</p>
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

