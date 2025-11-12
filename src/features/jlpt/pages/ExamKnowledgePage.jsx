// src/features/jlpt/pages/ExamKnowledgePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getExamQuestions } from '../../../data/jlpt/examQuestionsData.js';

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
const QuestionDisplay = ({ question, selectedAnswer, onSelectAnswer }) => {
  if (!question) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-gray-500 text-sm mb-2">問題 {question.id}</div>
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
const NavigationPanel = ({ sections, currentQuestion, answers, onQuestionSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-bold text-lg mb-4 text-center">言語知識（文字・語彙・文法）・読解</h3>
      <div className="text-sm text-gray-600 mb-2 text-center">
        ⏱ {sections.reduce((acc, s) => acc + s.timeLimit, 0)}分
      </div>
      
      {sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">{section.title}</h4>
          <div className="grid grid-cols-6 gap-2">
            {section.questions.map((q) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = currentQuestion === q.id;
              
              return (
                <button
                  key={q.id}
                  onClick={() => onQuestionSelect(q.id)}
                  className={`w-10 h-10 rounded border-2 font-semibold text-sm transition-all ${
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
          <span>Đã trả lời:</span>
          <span className="font-bold">{Object.keys(answers).length}/{sections.flatMap(s => s.questions).length}</span>
        </div>
      </div>
    </div>
  );
};

function ExamKnowledgePage() {
  const { levelId, examId } = useParams();
  const { navigate, WarningModal, clearExamData } = useExamGuard();
  
  const currentExam = getExamById(levelId, examId);
  const examData = getExamQuestions(levelId, examId);
  
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false); // ✅ Modal cảnh báo thiếu câu
  const [unansweredCount, setUnansweredCount] = useState(0);

  // Load answers từ localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam-${levelId}-${examId}-knowledge`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [levelId, examId]);

  if (!currentExam || !examData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Đề thi không tồn tại</h1>
        <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
          ← Quay về
        </button>
      </div>
    );
  }

  const sections = examData.knowledge.sections;
  const allQuestions = sections.flatMap(s => s.questions);
  const currentQuestion = allQuestions.find(q => q.id === currentQuestionId);
  const currentIndex = allQuestions.findIndex(q => q.id === currentQuestionId);
  const totalTime = sections.reduce((acc, s) => acc + s.timeLimit, 0);

  // ✅ Breadcrumb paths với navigate có cảnh báo (tất cả các link đều hoạt động)
  const breadcrumbPaths = [
    { name: 'ホーム', onClick: () => navigate('/') },
    { name: 'JLPT', onClick: () => navigate('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => navigate(`/jlpt/${levelId}`) },
    { name: currentExam.title, onClick: () => navigate(`/jlpt/${levelId}/${examId}`) },
    { name: '言語知識・読解' } // Trang hiện tại - không có onClick
  ];

  const handleSelectAnswer = (answerIndex) => {
    const newAnswers = { ...answers, [currentQuestionId]: answerIndex };
    setAnswers(newAnswers);
    localStorage.setItem(`exam-${levelId}-${examId}-knowledge`, JSON.stringify(newAnswers));
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentQuestionId(allQuestions[currentIndex - 1].id);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentQuestionId(allQuestions[currentIndex + 1].id);
    }
  };

  const handleTimeUp = () => {
    alert('Hết giờ làm bài! Bài thi sẽ được tự động nộp.');
    handleSubmit();
  };

  const handleSubmit = () => {
    let correctCount = 0;
    let knowledgeCorrect = 0, knowledgeTotal = 0;
    let readingCorrect = 0, readingTotal = 0;

    allQuestions.forEach(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
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

  // Block browser back (popstate) while taking exam
  useEffect(() => {
    // Push a dummy state so that the first back triggers popstate
    const unblock = () => {
      window.history.pushState({ exam: true }, '');
    };
    unblock();
    const onPopState = (e) => {
      const leave = window.confirm('Bạn đang làm bài. Rời trang sẽ mất tiến độ. Bạn có chắc muốn thoát?');
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
  }, [clearExamData]);

  return (
    <>
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full">
            <div className="p-6 border-b border-gray-300">
              <Breadcrumbs paths={breadcrumbPaths} />
              <div className="flex justify-between items-center mt-4">
                <h1 className="text-2xl font-bold text-gray-800">{currentExam.title}</h1>
                <CountdownTimer initialTime={totalTime} onTimeUp={handleTimeUp} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <QuestionDisplay
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestionId]}
                  onSelectAnswer={handleSelectAnswer}
                />

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition"
                  >
                    ← 前へ
                  </button>
                  
                  {currentIndex === allQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmitClick}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                      提出する
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      次へ →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 md:sticky md:top-4">
            <NavigationPanel
              sections={sections}
              currentQuestion={currentQuestionId}
              answers={answers}
              onQuestionSelect={setCurrentQuestionId}
            />
          </div>
        </div>

        {/* ✅ Modal cảnh báo thiếu câu - Thiết kế mới */}
        {showIncompleteWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md">
              <h2 className="text-xl font-bold mb-4 text-yellow-600">⚠️ CẢNH BÁO: CÒN CÂU CHƯA TRẢ LỜI</h2>
              <div className="mb-6">
                <p className="mb-3">
                  Bạn còn <strong className="text-red-600">{unansweredCount} câu</strong> chưa trả lời.
                </p>
                <p className="mb-3">
                  • Nếu bấm <strong className="text-red-600">Tiếp tục nộp bài</strong>: 
                  Các câu chưa trả lời sẽ bị tính là sai.
                </p>
                <p className="mb-3">
                  • Nếu bấm <strong className="text-green-600">Quay lại làm tiếp</strong>: 
                  Bạn có thể hoàn thành các câu còn lại.
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowIncompleteWarning(false)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  Quay lại làm tiếp
                </button>
                <button
                  onClick={handleConfirmIncompleteSubmit}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                  Tiếp tục nộp bài
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận submit cuối cùng */}
        {showSubmitModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSubmitModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg p-8 max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">確認</h2>
              <p className="mb-6">本当に提出しますか？提出後は変更できません。</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  提出する
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

function ExamKnowledgePage() {
  const { levelId, examId } = useParams();
  const navigate = useNavigate();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // ✅ Lock body scroll when modal is open
  useBodyScrollLock(showSubmitModal);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // ✅ Lock body scroll when modal is open
  useBodyScrollLock(showSubmitModal);
  
  // ... rest of component