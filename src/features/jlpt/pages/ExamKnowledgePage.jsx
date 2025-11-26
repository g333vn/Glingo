// src/features/jlpt/pages/ExamKnowledgePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getExamQuestions } from '../../../data/jlpt/examQuestionsData.js';
import storageManager from '../../../utils/localStorageManager.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

// ✅ Helper: Lock/unlock body scroll
const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isLocked]);
};

// Component đồng hồ đếm ngược
const CountdownTimer = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    if (timeLeft <= 300 && !isWarning) {
      setIsWarning(true);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000); 

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isWarning]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${
      isWarning ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-800'
    }`}>
      {hours.toString().padStart(2, '0')}:
      {minutes.toString().padStart(2, '0')}:
      {seconds.toString().padStart(2, '0')}
    </div>
  );
};

// Component câu hỏi
const QuestionDisplay = ({ question, selectedAnswer, onSelectAnswer, t }) => {
  if (!question) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-gray-500 text-sm mb-2">
        {t('jlpt.knowledgePage.questionLabel', { number: question.id })}
      </div>
      <div className="text-lg font-semibold mb-4">{question.question}</div>
      
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded mb-4 text-base leading-relaxed">
          {question.passage}
        </div>
      )}
      
      {question.text && (
        <div className="mb-6 text-lg">
          {question.underline ? (
            <span>
              {question.text.split(question.underline)[0]}
              <span className="underline decoration-2 decoration-gray-600 font-bold">
                {question.underline}
              </span>
              {question.text.split(question.underline)[1]}
            </span>
          ) : (
            question.text
          )}
        </div>
      )}
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedAnswer === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className="text-base">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Component navigation panel
const NavigationPanel = ({ sections, currentQuestion, answers, onQuestionSelect, t, totalTime }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-bold text-lg mb-4 text-center">{t('jlpt.knowledgePage.navigationTitle')}</h3>
      <div className="text-sm text-gray-600 mb-2 text-center">
        {t('jlpt.knowledgePage.totalTime', { minutes: totalTime })}
      </div>
      
      {sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">{section.title}</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {section.questions.map((q) => {
              const questionKey = String(q.id);
              const isAnswered = answers[questionKey] !== undefined;
              const isCurrent = currentQuestion === questionKey;
              
              return (
                <button
                  key={questionKey}
                  onClick={() => onQuestionSelect(questionKey)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded border-2 font-semibold text-xs sm:text-sm transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : isAnswered
                      ? 'border-green-500 bg-green-100 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex justify-between mb-1">
          <span>{t('jlpt.knowledgePage.answeredLabel')}</span>
          <span className="font-bold">{Object.keys(answers).length}/{sections.flatMap(s => s.questions).length}</span>
        </div>
      </div>
    </div>
  );
};

function ExamKnowledgePage() {
  const { levelId, examId } = useParams();
  const { navigate, WarningModal, clearExamData } = useExamGuard();
  const { t } = useLanguage();

  const [currentExam, setCurrentExam] = useState(null);
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState('1');
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false); // ✅ Modal cảnh báo thiếu câu
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  // ✅ REMOVED: Don't lock body scroll - allow scrolling in modal and outside modal
  // useBodyScrollLock(showSubmitModal || showIncompleteWarning);

  // ✅ Load exam metadata + questions (storage first, fallback static)
  useEffect(() => {
    let isMounted = true;

    const normalizeExamData = (data) => {
      if (!data) return null;
      return {
        knowledge: data.knowledge || { sections: [] },
        reading: data.reading || { sections: [] }
      };
    };

    const loadExamData = async () => {
      setIsLoading(true);
      try {
        const savedExam = await storageManager.getExam(levelId, examId);

        if (!isMounted) return;

        if (savedExam) {
          const examMetadata = {
            id: examId,
            title: savedExam.title || `JLPT ${examId}`,
            date: savedExam.date || examId,
            status: savedExam.status || 'Có sẵn',
            imageUrl: savedExam.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: savedExam.level || levelId
          };
          setCurrentExam(examMetadata);
          setExamData(normalizeExamData(savedExam));
        } else {
          const staticExam = getExamById(levelId, examId);
          const staticData = getExamQuestions(levelId, examId);
          setCurrentExam(staticExam || null);
          setExamData(normalizeExamData(staticData));
        }
      } catch (error) {
        console.error('❌ ExamKnowledgePage: Error loading exam data:', error);
        if (!isMounted) return;
        const fallbackExam = getExamById(levelId, examId);
        const fallbackData = getExamQuestions(levelId, examId);
        setCurrentExam(fallbackExam || null);
        setExamData(normalizeExamData(fallbackData));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadExamData();

    return () => {
      isMounted = false;
    };
  }, [levelId, examId]);

  // đảm bảo currentQuestionId tồn tại trong đề thi (đặc biệt với đề import từ admin)
  useEffect(() => {
    if (!examData) return;
    const combinedSections = [
      ...(examData.knowledge?.sections || []),
      ...(examData.reading?.sections || [])
    ];
    const allQuestions = combinedSections.flatMap(section => section.questions || []);
    if (allQuestions.length === 0) return;

    const exists = allQuestions.some(q => String(q.id) === String(currentQuestionId));
    if (!exists) {
      setCurrentQuestionId(String(allQuestions[0].id));
    }
  }, [examData, currentQuestionId]);

  // Load answers từ localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam-${levelId}-${examId}-knowledge`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [levelId, examId]);

  // Block browser back (popstate) while taking exam
  useEffect(() => {
    // Push a dummy state so that the first back triggers popstate
    const unblock = () => {
      window.history.pushState({ exam: true }, '');
    };
    unblock();
    const onPopState = (e) => {
      const leave = window.confirm(t('jlpt.knowledgePage.leaveConfirm'));
      if (!leave) {
        unblock();
      } else {
        clearExamData?.();
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [clearExamData, t]);

  if (isLoading) {
    return (
      <LoadingSpinner
        label={t('jlpt.commonTexts.loading')}
        icon="📚"
      />
    );
  }

  if (!currentExam || !examData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{t('jlpt.commonTexts.notFoundTitle')}</h1>
        <p className="text-gray-600 mb-4">
          {t('jlpt.commonTexts.notFoundDesc', { examId, level: levelId.toUpperCase() })}
        </p>
        <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
          {t('jlpt.commonTexts.backToList')}
        </button>
      </div>
    );
  }

  const knowledgeSections = examData.knowledge?.sections || [];
  const readingSections = examData.reading?.sections || [];
  const sections = [...knowledgeSections, ...readingSections];
  const allQuestions = sections.flatMap(s => s.questions || []);
  const normalizedCurrentId = String(currentQuestionId);
  const currentQuestion = allQuestions.find(q => String(q.id) === normalizedCurrentId);
  const currentIndex = allQuestions.findIndex(q => String(q.id) === normalizedCurrentId);
  const totalTime = sections.reduce((acc, s) => acc + (s.timeLimit || 0), 0);

  if (sections.length === 0 || allQuestions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">{t('jlpt.knowledgePage.emptyTitle')}</h1>
        <p className="text-gray-600 mb-4">
          {t('jlpt.knowledgePage.emptyDesc', { examId, level: levelId.toUpperCase() })}
        </p>
        <p className="text-gray-500 mb-4 text-sm">
          {t('jlpt.knowledgePage.emptyNote')}
        </p>
        <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
          {t('jlpt.commonTexts.backToList')}
        </button>
      </div>
    );
  }

  // ✅ Breadcrumb paths với navigate có cảnh báo (tất cả các link đều hoạt động)
  const breadcrumbPaths = [
    { name: t('common.home'), onClick: () => navigate('/') },
    { name: t('common.jlpt'), onClick: () => navigate('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => navigate(`/jlpt/${levelId}`) },
    { name: currentExam.title, onClick: () => navigate(`/jlpt/${levelId}/${examId}`) },
    { name: t('jlpt.knowledgePage.breadcrumbLabel') } // Trang hiện tại - không có onClick
  ];

  const handleSelectAnswer = (answerIndex) => {
    const questionKey = String(currentQuestionId);
    const newAnswers = { ...answers, [questionKey]: answerIndex };
    setAnswers(newAnswers);
    localStorage.setItem(`exam-${levelId}-${examId}-knowledge`, JSON.stringify(newAnswers));
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentQuestionId(String(allQuestions[currentIndex - 1].id));
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentQuestionId(String(allQuestions[currentIndex + 1].id));
    }
  };

  const handleTimeUp = () => {
    window.alert(t('jlpt.knowledgePage.timeUpMessage'));
    handleSubmit();
  };

  const handleSubmit = () => {
    let correctCount = 0;
    let knowledgeCorrect = 0, knowledgeTotal = 0;
    let readingCorrect = 0, readingTotal = 0;

    allQuestions.forEach(q => {
      const questionKey = String(q.id);
      const isCorrect = answers[questionKey] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }

      // NEW: Breakdown per category (expandable: assume q.category exists in data.js)
      if (q.category === 'knowledge') {
        knowledgeTotal++;
        if (isCorrect) knowledgeCorrect++;
      } else if (q.category === 'reading') {
        readingTotal++;
        if (isCorrect) readingCorrect++;
      }
    });

    const totalCorrect = knowledgeCorrect + readingCorrect;
    const totalQuestions = knowledgeTotal + readingTotal;
    const score = Math.round((totalCorrect / totalQuestions) * 100); // Existing % score
    
    // NEW: Lưu breakdown cho result page
    localStorage.setItem(`exam-${levelId}-${examId}-knowledge-breakdown`, JSON.stringify({
      knowledge: knowledgeCorrect,
      reading: readingCorrect,
      totals: { knowledge: knowledgeTotal, reading: readingTotal }
    }));
    
    localStorage.setItem(`exam-${levelId}-${examId}-knowledge-score`, score);
    localStorage.setItem(`exam-${levelId}-${examId}-knowledge-completed`, 'true');
    
    // ✅ Không cần clearExamData vì đã hoàn thành
    window.location.href = `/jlpt/${levelId}/${examId}`;
  };

  // ✅ FIX: Kiểm tra câu chưa làm trước khi submit
  const handleSubmitClick = () => {
    const unanswered = allQuestions.length - Object.keys(answers).length;
    
    if (unanswered > 0) {
      setUnansweredCount(unanswered);
      setShowIncompleteWarning(true); // Hiển thị modal cảnh báo thiết kế
    } else {
      setShowSubmitModal(true); // Hiển thị modal xác nhận submit
    }
  };

  // ✅ Xử lý khi user đồng ý submit dù thiếu câu
  const handleConfirmIncompleteSubmit = () => {
    setShowIncompleteWarning(false);
    setShowSubmitModal(true);
  };

  return (
    <>
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full">
            <div className="p-4 sm:p-6 border-b border-gray-300">
              <Breadcrumbs paths={breadcrumbPaths} />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mt-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{currentExam.title}</h1>
                <CountdownTimer initialTime={totalTime} onTimeUp={handleTimeUp} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
              <QuestionDisplay
                  question={currentQuestion}
                  selectedAnswer={answers[normalizedCurrentId]}
                  onSelectAnswer={handleSelectAnswer}
                  t={t}
                />

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition text-sm sm:text-base"
                  >
                    {t('jlpt.knowledgePage.prevButton')}
                  </button>
                  
                  {currentIndex === allQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmitClick}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm sm:text-base"
                    >
                      {t('jlpt.knowledgePage.submitButton')}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm sm:text-base"
                    >
                      {t('jlpt.knowledgePage.nextButton')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 md:sticky md:top-4 mt-4 md:mt-0">
            <NavigationPanel
              sections={sections}
              currentQuestion={normalizedCurrentId}
              answers={answers}
              onQuestionSelect={setCurrentQuestionId}
              t={t}
              totalTime={totalTime}
            />
          </div>
        </div>

        {/* ✅ Modal cảnh báo thiếu câu - Thiết kế mới */}
        {showIncompleteWarning && (
          <div 
            className="modal-overlay-enter"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowIncompleteWarning(false);
              }
            }}
          >
            <div 
              className="modal-content-enter"
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                maxWidth: '28rem',
                width: '100%',
                maxHeight: 'calc(100vh - 4rem)',
                overflowY: 'auto',
                overscrollBehavior: 'contain', // ✅ Prevent scroll chaining to body
              }}
              onWheel={(e) => {
                // ✅ Prevent body scroll when scrolling inside modal
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                // If can scroll more in modal, prevent body scroll
                if ((!isAtTop && e.deltaY < 0) || (!isAtBottom && e.deltaY > 0)) {
                  e.stopPropagation();
                }
              }}
            >
              <h2 className="text-xl font-bold mb-4 text-yellow-600">{t('jlpt.knowledgePage.incompleteModal.title')}</h2>
              <div className="mb-6">
                <p className="mb-3">
                  {t('jlpt.knowledgePage.incompleteModal.description', { count: unansweredCount })}
                </p>
                <p className="mb-3">
                  {t('jlpt.knowledgePage.incompleteModal.submitWarning')}
                </p>
                <p className="mb-3">
                  {t('jlpt.knowledgePage.incompleteModal.continueHint')}
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowIncompleteWarning(false)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  {t('jlpt.knowledgePage.incompleteModal.continueButton')}
                </button>
                <button
                  onClick={handleConfirmIncompleteSubmit}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                  {t('jlpt.knowledgePage.incompleteModal.submitButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận submit cuối cùng */}
        {showSubmitModal && (
          <div 
            className="modal-overlay-enter"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSubmitModal(false);
              }
            }}
          >
            <div 
              className="modal-content-enter"
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                maxWidth: '28rem',
                width: '100%',
                maxHeight: 'calc(100vh - 4rem)',
                overflowY: 'auto',
                overscrollBehavior: 'contain', // ✅ Prevent scroll chaining to body
              }}
              onWheel={(e) => {
                // ✅ Prevent body scroll when scrolling inside modal
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                // If can scroll more in modal, prevent body scroll
                if ((!isAtTop && e.deltaY < 0) || (!isAtBottom && e.deltaY > 0)) {
                  e.stopPropagation();
                }
              }}
            >
              <h2 className="text-xl font-bold mb-4">{t('jlpt.knowledgePage.submitModal.title')}</h2>
              <p className="mb-6">{t('jlpt.knowledgePage.submitModal.message')}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  {t('jlpt.knowledgePage.submitModal.cancelButton')}
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {t('jlpt.knowledgePage.submitModal.confirmButton')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Hiển thị Modal cảnh báo từ useExamGuard */}
      {WarningModal}
    </>
  );
}

export default ExamKnowledgePage;