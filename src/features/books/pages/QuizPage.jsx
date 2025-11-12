// src/features/books/pages/QuizPage.jsx
// ✅ UPDATED: Tách dữ liệu quiz ra file riêng ở src/data/level, giữ nguyên UI/logic
// ✅ BƯỚC 2: Lazy loading quiz data từ JSON files

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { bookData } from '../../../data/level/bookData.js';

// ✅ NEW: Import dữ liệu từ thư mục data/level (đường dẫn tương tự bookData)
// ✅ BƯỚC 2: Giữ backward compatibility với quizData cũ
import { quizData } from '../../../data/level/quizData.js';

// ✅ BƯỚC 2: Import helper để lazy load quiz từ JSON
import { loadQuizData } from '../../../data/level/n1/shinkanzen-n1-bunpou/quizzes/quiz-loader.js';

// ✅ NEW: Import dictionary components
import { DictionaryButton, DictionaryPopup, useDictionaryDoubleClick } from '../../../components/api_translate/index.js';

function QuizPage() {
  const { levelId, bookId, lessonId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ UPDATED: Ref cho TOÀN BỘ content container để tra từ bất cứ đâu
  const quizContentRef = useRef(null);
  useDictionaryDoubleClick(quizContentRef);

  // ✅ BƯỚC 2: Lazy load quiz data từ JSON
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        // Thử load từ JSON trước (cho shinkanzen-n1-bunpou)
        if (bookId === 'skm-n1-bunpou') {
          const quiz = await loadQuizData(lessonId);
          if (quiz && quiz.questions && quiz.questions.length > 0) {
            setCurrentQuiz(quiz);
            setIsLoading(false);
            return;
          }
        }
        // Fallback về quizData cũ nếu không tìm thấy JSON
        const fallbackQuiz = quizData[lessonId] || quizData.default;
        setCurrentQuiz(fallbackQuiz);
      } catch (error) {
        console.error('Error loading quiz:', error);
        // Fallback về quizData cũ
        const fallbackQuiz = quizData[lessonId] || quizData.default;
        setCurrentQuiz(fallbackQuiz);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [bookId, lessonId]);

  const currentBook = bookData[bookId] || bookData.default;
  
  // Loading state
  if (isLoading || !currentQuiz) {
    return (
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col min-h-app">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải quiz...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = currentQuiz.questions.length;
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  const breadcrumbPaths = [
    { name: 'ホーム', link: '/' },
    { name: 'LEVEL', link: '/level' },
    { name: levelId.toUpperCase(), link: `/level/${levelId}` },
    { name: currentBook.title, link: `/level/${levelId}/${bookId}` },
    { name: currentQuiz.title, link: `/level/${levelId}/${bookId}/lesson/${lessonId}` }
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
      setIsQuizComplete(true);
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

    return (
      <>
        {/* ✅ NEW: Dictionary components */}
        <DictionaryButton />
        <DictionaryPopup />

        <div className="w-full pr-0 md:pr-4">
          <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
            <Sidebar />
            <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col min-h-app">
              <div className="pt-3 px-5 pb-1 flex-shrink-0">
                <Breadcrumbs paths={breadcrumbPaths} />
              </div>
              
              <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-y-auto">
                <div className="w-full max-w-3xl">
                  <div className={`rounded-2xl shadow-2xl p-6 ${
                    isPerfect ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500' :
                    isGood ? 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500' :
                    isPass ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-sky-500' :
                    'bg-gradient-to-br from-gray-400 via-slate-400 to-zinc-500'
                  }`}>
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      
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
                          {isPerfect ? '🎉 Perfect Score! 🎉' :
                           isGood ? 'Excellent Work!' :
                           isPass ? 'Good Job!' :
                           'Keep Practicing!'}
                        </h1>
                        
                        <p className="text-base sm:text-lg text-gray-700 font-medium">
                          You scored <span className="font-bold text-lg sm:text-xl">{percentage}%</span>
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
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-md border-2 border-gray-200 transform hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-1">{score.total}</h3>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Total</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 shadow-md border-2 border-green-300 transform hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-green-700 mb-1">{score.correct}</h3>
                            <p className="text-xs font-semibold text-green-700 uppercase">Correct</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-4 shadow-md border-2 border-red-300 transform hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-red-700 mb-1">{wrong}</h3>
                            <p className="text-xs font-semibold text-red-700 uppercase">Wrong</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mb-6 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 font-medium italic">
                          {isPerfect ? '"Perfect! You\'ve mastered this lesson! Keep up the amazing work! 🌟"' :
                           isGood ? '"Great job! You\'re doing really well. Keep going! 💪"' :
                           isPass ? '"Good effort! Keep practicing and you\'ll improve even more! 📚"' :
                           '"Don\'t give up! Every mistake is a chance to learn. Try again! 🔥"'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                          onClick={handleRetryQuiz} 
                          className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Again
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </button>

                        <button 
                          onClick={handleNextLesson} 
                          className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
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
  return (
    <>
      {/* ✅ NEW: Dictionary components */}
      <DictionaryButton />
      <DictionaryPopup />

      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />

          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col min-h-app">
            <div className="pt-4 px-6 mb-4">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            
            {/* ✅ UPDATED: Wrap toàn bộ content với ref để tra từ mọi nơi */}
            <div ref={quizContentRef} className="px-6 pb-6 flex-1 flex flex-col overflow-y-auto select-text">
              <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center md:text-left">
                {currentQuiz.title}
              </h1>

              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600">Câu {currentQuestionIndex + 1} / {totalQuestions}</p>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 shadow-md">
                <p className="text-lg text-gray-800 mb-4 leading-relaxed">
                  {currentQuestion.text}
                </p>
                
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <label key={option.label} className="flex items-center p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name="answer"
                        value={option.label}
                        checked={selectedAnswer === option.label}
                        onChange={() => handleAnswerSelect(option.label)}
                        className="mr-3 text-blue-600 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}. {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ UPDATED: Explanation không cần ref riêng nữa */}
              {showExplanation && (
                <div 
                  className={`mb-4 p-4 rounded-lg ${selectedAnswer === currentQuestion.correct ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}
                >
                  <div className="flex items-center mb-2">
                    {selectedAnswer === currentQuestion.correct ? (
                      <>
                        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold text-green-700 text-lg">正解！</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold text-red-700 text-lg">不正解</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Đáp án đúng:</strong> {currentQuestion.correct}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Giải thích:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="flex-1"></div>

              <div className="border-t border-gray-300 pt-4 flex justify-between items-center mt-auto">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Đóng cửa
                </button>
                
                {!showExplanation ? (
                  <button
                    onClick={handleSolution}
                    disabled={!selectedAnswer}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    解答
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    次へ 
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