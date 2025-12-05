// src/features/books/pages/QuizPage.jsx
// ✅ UPDATED: Tách dữ liệu quiz ra file riêng ở src/data/level, giữ nguyên UI/logic
// ✅ BƯỚC 2: Lazy loading quiz data từ JSON files

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { bookData } from '../../../data/level/bookData.js';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';

// ✅ NEW: Import dữ liệu từ thư mục data/level (đường dẫn tương tự bookData)
// ✅ BƯỚC 2: Giữ backward compatibility với quizData cũ
import storageManager from '../../../utils/localStorageManager.js';
import { quizData } from '../../../data/level/quizData.js';
import { demoQuizzes } from '../../../data/level/n1/demo-book/quizzes.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';

// ✅ BƯỚC 2: Import helper để lazy load quiz từ JSON
import { loadQuizData } from '../../../data/level/n1/shinkanzen-n1-bunpou/quizzes/quiz-loader.js';

// ✅ NEW: Import progress tracker
import { addLessonQuizScore, getLessonQuizScores } from '../../../utils/lessonProgressTracker.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { saveLearningProgress } from '../../../services/learningProgressService.js';

// ✅ NEW: Import dictionary components
import { DictionaryButton, DictionaryPopup, useDictionaryDoubleClick } from '../../../components/api_translate/index.js';
import { getSettings } from '../../../utils/settingsManager.js';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

function QuizPage() {
  const { levelId, bookId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Backward compatibility: nếu không có chapterId, dùng lessonId làm chapterId
  const finalChapterId = chapterId || lessonId;
  const finalLessonId = lessonId || chapterId;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [booksMetadata, setBooksMetadata] = useState([]);
  const [chapterTitle, setChapterTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');

  // ✅ UPDATED: Ref cho TOÀN BỘ content container để tra từ bất cứ đâu
  const quizContentRef = useRef(null);
  useDictionaryDoubleClick(quizContentRef);

  // ✅ UPDATED: Load books metadata for category navigation
  useEffect(() => {
    const loadBooksMetadata = async () => {
      // ✅ Load from IndexedDB/localStorage first (via storageManager)
      const savedBooks = await storageManager.getBooks(levelId);
      if (savedBooks && savedBooks.length > 0) {
        setBooksMetadata(savedBooks);
        console.log(`✅ Loaded ${savedBooks.length} books from storage for ${levelId}`);
      } else {
        // Fallback to default based on level
        if (levelId === 'n1') {
          setBooksMetadata(n1BooksMetadata);
          console.log(`📁 Loaded ${n1BooksMetadata.length} books from static file`);
        }
      }
    };

    loadBooksMetadata();
  }, [levelId]);

  // ✅ NEW: Load chapter & lesson titles for accurate breadcrumb
  useEffect(() => {
    const loadTitles = async () => {
      try {
        // Load chapters
        let chapters = await storageManager.getChapters(bookId);
        if (!chapters || chapters.length === 0) {
          const bookStatic = bookData[bookId] || bookData.default;
          chapters = bookStatic?.contents || [];
        }

        const chapter = chapters.find(ch => ch.id === finalChapterId);
        setChapterTitle(chapter?.title || finalChapterId);

        // Load lessons for this chapter
        let lessons = await storageManager.getLessons(bookId, finalChapterId);
        if (!lessons || lessons.length === 0) {
          // Fallback: dùng chính chapter làm lesson
          lessons = [{ id: finalChapterId, title: chapter?.title || finalChapterId }];
        }
        const lesson = lessons.find(l => l.id === finalLessonId);
        setLessonTitle(lesson?.title || finalLessonId);
      } catch (err) {
        console.warn('[QuizPage] Could not load chapter/lesson titles:', err);
        setChapterTitle(finalChapterId);
        setLessonTitle(finalLessonId);
      }
    };

    loadTitles();
  }, [bookId, finalChapterId, finalLessonId]);

  // ✅ UPDATED: Load quiz with IndexedDB/localStorage priority
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        // 1. Try IndexedDB/localStorage first (highest priority)
        console.log(`🔍 Loading quiz: bookId=${bookId}, chapterId=${finalChapterId}, lessonId=${finalLessonId}`);
        let savedQuiz = await storageManager.getQuiz(bookId, finalChapterId, finalLessonId);
        
        // ✅ FALLBACK: Try demo quizzes if not in storage
        if (!savedQuiz && bookId === 'demo-complete-001') {
          const quizKey = `${bookId}_${finalChapterId}_${finalLessonId}`;
          savedQuiz = demoQuizzes[quizKey];
          if (savedQuiz) {
            console.log(`📁 Loaded DEMO quiz from static file: ${savedQuiz.title}`);
          }
        }
        
        console.log(`📦 Quiz result:`, savedQuiz);
        if (savedQuiz) {
          // ✅ FIXED: Transform quiz format from QuizEditor to QuizPage format
          // QuizEditor saves: { question, correctAnswer, audioUrl, audioPath, audioName }
          // QuizPage expects: { text, correct, audioUrl, audioName }
          let quizToSet = savedQuiz;
          
          if (savedQuiz.questions && Array.isArray(savedQuiz.questions)) {
            // Transform format
              quizToSet = {
                ...savedQuiz,
              questions: savedQuiz.questions.map(q => {
                console.log(`  - Question ${q.id}:`, {
                  hasAudioUrl: !!q.audioUrl,
                  hasAudioPath: !!q.audioPath,
                  hasAudioName: !!q.audioName,
                  audioUrlPreview: q.audioUrl ? q.audioUrl.substring(0, 50) : 'none'
                });
                
                return {
                  id: q.id,
                  text: q.question || q.text,
                  options: q.options || [],
                  correct: q.correctAnswer || q.correct,
                  explanation: q.explanation || '',
                  audioUrl: q.audioUrl || '', // ✅ Preserve audio URL
                  audioPath: q.audioPath || '',
                  audioName: q.audioName || ''
                };
              })
              };
              console.log(`🔄 Transformed quiz format from QuizEditor to QuizPage`);
          }
          
          setCurrentQuiz(quizToSet);
          console.log(`✅ Loaded quiz with ${quizToSet.questions.filter(q => q.audioUrl).length} audio questions`);
          setIsLoading(false);
          return;
        }

        // 2. Try load từ JSON (cho shinkanzen-n1-bunpou)
        if (bookId === 'skm-n1-bunpou') {
          try {
            const quiz = await loadQuizData(finalLessonId);
            if (quiz && quiz.questions && quiz.questions.length > 0) {
              setCurrentQuiz(quiz);
              console.log(`📁 Loaded quiz from JSON: ${bookId}/${finalChapterId}/${finalLessonId}`);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            // File không tồn tại hoặc lỗi khác - không sao, sẽ fallback
            console.log(`📄 JSON file not found for ${finalLessonId}, using fallback`);
          }
        }
        
        // 3. Fallback về quizData cũ nếu không tìm thấy JSON
        const fallbackQuiz = quizData[finalLessonId] || quizData.default;
        setCurrentQuiz(fallbackQuiz);
        console.log(`📄 Loaded quiz from static file: ${finalLessonId}`);
      } catch (error) {
        console.error('Error loading quiz:', error);
        // Fallback về quizData cũ
        const fallbackQuiz = quizData[finalLessonId] || quizData.default;
        setCurrentQuiz(fallbackQuiz);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [bookId, finalChapterId, finalLessonId]);

  // ✅ Ưu tiên lấy thông tin sách từ booksMetadata (Supabase) thay vì static bookData
  const currentBookMeta = Array.isArray(booksMetadata)
    ? booksMetadata.find(book => book.id === bookId)
    : null;
  const currentBookTitle = currentBookMeta?.title || bookId;
  
  // ✅ Tìm category của book hiện tại để highlight trong sidebar
  const currentBookCategory = currentBookMeta?.category || null;

  // ✅ Handler cho category click trong sidebar (phải định nghĩa trước khi dùng)
  const handleCategoryClick = (categoryName) => {
    if (!categoryName) {
      // Nếu click lại category đang active (toggle off) → navigate về level page
      navigate(`/level/${levelId}`);
      return;
    }

    // Tìm book đầu tiên có category này (chỉ khi booksMetadata đã được load)
    if (Array.isArray(booksMetadata) && booksMetadata.length > 0) {
      const firstBookInCategory = booksMetadata.find(book => book.category === categoryName);
      
      if (firstBookInCategory) {
        // Navigate đến book đầu tiên của category
        navigate(`/level/${levelId}/${firstBookInCategory.id}`);
        return;
      }
    }
    
    // Nếu không tìm thấy, navigate về level page
    navigate(`/level/${levelId}`);
  };
  
  // Loading state / not found
  if (isLoading) {
    return (
      <>
        <DictionaryButton />
        <DictionaryPopup />
        <LoadingSpinner label={t('quiz.loading') || 'Đang tải quiz...'} icon="❓" />
      </>
    );
  }

  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <>
        <DictionaryButton />
        <DictionaryPopup />
        <div className="w-full pr-0 md:pr-4">
          <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
            <Sidebar 
              selectedCategory={currentBookCategory}
              onCategoryClick={handleCategoryClick}
            />
            <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
              <div className="flex-1 flex items-center justify-center md:overflow-y-auto overflow-x-hidden">
                <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 md:p-8 m-3 sm:m-4 md:m-6 w-full max-w-full">
                  <h2 className="text-lg sm:text-xl font-bold text-red-500 mb-3 md:mb-4 break-words">{t('quiz.notFoundTitle') || 'Quiz không tồn tại'}</h2>
                  <button 
                    onClick={() => navigate(`/level/${levelId}/${bookId}`)}
                    className="px-4 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[48px]"
                  >
                    ← {t('common.back') || 'Quay về'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalQuestions = currentQuiz.questions.length;
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  const breadcrumbPaths = [
    { name: t('common.home') || 'Home', link: '/' },
    { name: 'LEVEL', link: '/level' },
    { name: levelId.toUpperCase(), link: `/level/${levelId}` },
    { name: currentBookTitle, link: `/level/${levelId}/${bookId}` },
    { name: chapterTitle || finalChapterId, link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}` },
    { name: lessonTitle || finalLessonId, link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}/lesson/${finalLessonId}` },
    { name: t('lesson.quiz') || t('common.quiz') || 'Quiz', link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}/lesson/${finalLessonId}/quiz` }
  ];

  const handleAnswerSelect = (label) => {
    setSelectedAnswer(label);
  };

  const handleSolution = () => {
    if (selectedAnswer) {
      const isCorrect = selectedAnswer === currentQuestion.correct;
      setScore(prev => ({
        ...prev,
        total: prev.total + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct
      }));
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed - save score
      setIsQuizComplete(true);
      addLessonQuizScore(bookId, finalChapterId, finalLessonId, score.correct, score.total);
      
      // ✅ NEW: Lưu progress vào Supabase nếu user đã đăng nhập
      if (user && typeof user.id === 'string') {
        const percentage = Math.round((score.correct / score.total) * 100);
        saveLearningProgress({
          userId: user.id,
          type: 'quiz_attempt',
          bookId: bookId,
          chapterId: finalChapterId,
          lessonId: finalLessonId,
          status: 'completed',
          score: score.correct,
          total: score.total,
          attempts: 1,
          metadata: {
            percentage: percentage,
            levelId: levelId
          }
        }).catch(err => {
          console.error('[QuizPage] Error saving progress to Supabase:', err);
        });
      }
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setIsQuizComplete(false);
  };

  const handleNextLesson = () => {
    window.history.back();
  };

  // Quiz Complete Screen
  if (isQuizComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const isPerfect = score.correct === score.total;
    const isGood = percentage >= 80;
    const isPass = percentage >= 60;
    const wrong = score.total - score.correct;

    // === Retry control based on global settings ===
    const settings = getSettings();
    const contentSettings = settings.content || {};
    let maxAttemptsSetting = contentSettings.maxRetryAttempts;
    // -2: use custom, 0: no retry, -1 or undefined: unlimited
    if (maxAttemptsSetting === -2) {
      maxAttemptsSetting = contentSettings.maxRetryAttemptsCustom || -1;
    }
    const scores = getLessonQuizScores(bookId, finalChapterId, finalLessonId);
    const attemptsSoFar = scores.length; // includes current attempt
    const noRetry = maxAttemptsSetting === 0;
    const unlimited = !noRetry && (!maxAttemptsSetting || maxAttemptsSetting < 0);
    const remainingAttempts = (unlimited || noRetry)
      ? null
      : Math.max(0, maxAttemptsSetting - attemptsSoFar);
    const canRetry = !noRetry && (unlimited || remainingAttempts > 0);

    return (
      <>
        {/* ✅ NEW: Dictionary components */}
        <DictionaryButton />
        <DictionaryPopup />

        <div className="w-full pr-0 md:pr-4">
          <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
            <Sidebar 
              selectedCategory={currentBookCategory}
              onCategoryClick={handleCategoryClick}
            />
            <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
              <div className="pt-3 px-3 sm:px-4 md:px-5 pb-1 flex-shrink-0">
                <Breadcrumbs paths={breadcrumbPaths} />
              </div>
              
              <div className="flex-1 flex items-center justify-center px-3 sm:px-4 md:px-6 py-4 md:overflow-y-auto overflow-x-hidden">
                <div className="w-full max-w-3xl">
                  <div className={`rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 ${
                    isPerfect ? 'bg-yellow-400' :
                    isGood ? 'bg-green-500' :
                    isPass ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}>
                    <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                      
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center mb-3">
                          {isPerfect ? (
                            <div className="relative">
                              <svg className="w-20 h-20 text-yellow-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-ping"></div>
                            </div>
                          ) : (
                            <svg className={`w-20 h-20 ${isGood ? 'text-green-500' : isPass ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        
                        <h1 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${
                          isPerfect ? 'text-yellow-600' :
                          isGood ? 'text-green-600' :
                          isPass ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {isPerfect ? '🎉 ' + t('lesson.excellent') + '! 🎉' :
                           isGood ? t('lesson.excellent') + '!' :
                           isPass ? t('lesson.goodJob') + '!' :
                           t('lesson.keepPracticing') + '!'}
                        </h1>
                        
                        <p className="text-base sm:text-lg text-gray-700 font-medium">
                          {t('lesson.youScored')} <span className="font-bold text-lg sm:text-xl">{percentage}%</span>
                        </p>
                      </div>

                      <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isPerfect ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            isGood ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            isPass ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                            'bg-gradient-to-r from-gray-400 to-slate-500'
                          }`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 bg-gray-500 rounded-full flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-1">{score.total}</h3>
                            <p className="text-xs font-semibold text-gray-600 uppercase">{t('lesson.total')}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-green-700 mb-1">{score.correct}</h3>
                            <p className="text-xs font-semibold text-green-700 uppercase">{t('lesson.correct')}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 bg-red-500 rounded-full flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-red-700 mb-1">{wrong}</h3>
                            <p className="text-xs font-semibold text-red-700 uppercase">{t('lesson.wrong')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mb-6 p-3 bg-blue-400 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-sm text-gray-700 font-medium italic">
                          {isPerfect ? `"${t('lesson.excellent')} 🌟"` :
                           isGood ? `"${t('lesson.goodJob')} 💪"` :
                           isPass ? `"${t('lesson.goodJob')} 📚"` :
                           `"${t('lesson.dontGiveUp')} 🔥"`}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {canRetry && (
                          <button 
                            onClick={handleRetryQuiz} 
                            className="px-6 py-3 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {t('quiz.retry') || 'Try Again'}
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                          </button>
                        )}

                        {!unlimited && !noRetry && (
                          <p className="text-xs text-gray-700 font-semibold text-center sm:text-left">
                            {remainingAttempts > 0
                              ? (t('quiz.retryRemaining', { used: attemptsSoFar, max: maxAttemptsSetting }) ||
                                 `Lần làm: ${attemptsSoFar}/${maxAttemptsSetting}`)
                              : (t('quiz.retryLimitReached', { max: maxAttemptsSetting }) ||
                                 `Bạn đã dùng hết ${maxAttemptsSetting} lần làm lại được phép.`)
                            }
                          </p>
                        )}

                        <button 
                          onClick={handleNextLesson} 
                          className="px-6 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Next Lesson
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Normal Quiz Screen
  // Read content settings (answers visibility) once per render
  const settings = getSettings();
  const contentSettings = settings.content || {};
  const showAnswersSetting = contentSettings.showAnswersAfterCompletion !== false;

  return (
    <>
      {/* ✅ NEW: Dictionary components */}
      <DictionaryButton />
      <DictionaryPopup />

      <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar 
            selectedCategory={currentBookCategory}
            onCategoryClick={handleCategoryClick}
          />

          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
            <div className="pt-3 px-3 sm:px-4 md:px-6 mb-3 md:mb-4 flex-shrink-0">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            
            {/* ✅ UPDATED: Wrap toàn bộ content với ref để tra từ mọi nơi */}
            <div ref={quizContentRef} className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6 flex-1 flex flex-col md:overflow-y-auto overflow-x-hidden select-text">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800 text-center md:text-left break-words">
                {currentQuiz.title}
              </h1>

              <div className="mb-3 md:mb-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600">{t('lesson.questionCounter')} {currentQuestionIndex + 1} / {totalQuestions}</p>
              </div>

              <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 mb-3 md:mb-4">
                <p className="text-base sm:text-lg text-gray-800 mb-3 md:mb-4 leading-relaxed break-words">
                  {currentQuestion.text}
                </p>
                
                {/* ✅ Audio Player - For listening questions */}
                {currentQuestion.audioUrl && (
                  <div className="mb-3 md:mb-4 p-3 sm:p-4 bg-purple-50 border-[3px] border-purple-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm font-bold text-purple-900 flex items-center gap-2">
                        <span className="text-base sm:text-lg">🎧</span>
                        <span className="break-words">{t('quiz.listeningQuestion') || 'Listening Question'}</span>
                      </p>
                    </div>
                    <audio controls className="w-full" style={{ height: '40px' }}>
                      <source src={currentQuestion.audioUrl} type={currentQuestion.audioUrl.startsWith('data:') ? 'audio/mpeg' : undefined} />
                      {t('quiz.browserNotSupport') || 'Browser does not support audio.'}
                    </audio>
                    <p className="text-[10px] sm:text-xs text-green-600 mt-2 font-semibold text-center break-words">
                      ✅ {t('quiz.playAudioToAnswer') || 'Listen to the audio and choose the correct answer'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <label key={option.label} className="flex items-start sm:items-center p-2.5 sm:p-3 bg-white rounded-md border-[3px] border-black cursor-pointer hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-bold">
                      <input
                        type="radio"
                        name="answer"
                        value={option.label}
                        checked={selectedAnswer === option.label}
                        onChange={() => handleAnswerSelect(option.label)}
                        className="mr-2 sm:mr-3 text-blue-600 h-4 w-4 flex-shrink-0 mt-0.5 sm:mt-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 break-words flex-1">
                        {option.label}. {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ UPDATED: Explanation không cần ref riêng nữa */}
              {showExplanation && (
                <div 
                  className={`mb-3 md:mb-4 p-3 sm:p-4 rounded-lg border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${selectedAnswer === currentQuestion.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                  <div className="flex items-center mb-2">
                    {selectedAnswer === currentQuestion.correct ? (
                      <>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-black text-white text-sm sm:text-base md:text-lg uppercase break-words">✅ {t('lesson.correct')}!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-black text-white text-sm sm:text-base md:text-lg uppercase break-words">❌ {t('lesson.wrong')}</span>
                      </>
                    )}
                  </div>
                  {showAnswersSetting && (
                    <>
                      <p className="text-xs sm:text-sm text-white mb-2 font-black break-words">
                        <strong>{t('lesson.correctAnswer')}:</strong> {currentQuestion.correct}
                      </p>
                      <p className="text-xs sm:text-sm text-white font-black break-words">
                        <strong>{t('lesson.explanation')}:</strong> {currentQuestion.explanation}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="flex-1"></div>

              <div className="border-t border-gray-300 pt-3 md:pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 mt-auto">
                <button
                  onClick={() => window.history.back()}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#2D2D2D] text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide min-h-[48px]"
                >
                  {t('lesson.closeWindow')}
                </button>
                
                {!showExplanation ? (
                  <button
                    onClick={handleSolution}
                    disabled={!selectedAnswer}
                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {t('lesson.checkAnswer') || 'Check'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide min-h-[48px]"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? (t('lesson.next') || 'Next') : (t('lesson.finish') || 'Finish')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuizPage;