// src/features/jlpt/pages/ExamAnswersPage.jsx
// ✅ UPDATED: Thêm tính năng tra từ điển

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getExamQuestions } from '../../../data/jlpt/examQuestionsData.js';
import { getListeningQuestions } from '../../../data/jlpt/listeningQuestionsData.js';
import ReactModal from 'react-modal';

// ✅ NEW: Import dictionary components
import { DictionaryButton, DictionaryPopup, useDictionaryDoubleClick } from '../../../components/api_translate/index.js';

ReactModal.setAppElement('#root');

// Quick Answer Key component
const QuickAnswerKey = ({ knowledgeQuestions, listeningQuestions, knowledgeAnswers, listeningAnswers }) => {
  const [isOpen, setIsOpen] = useState(true);

  const indexToLetter = (index) => {
    const letters = ['A', 'B', 'C', 'D'];
    return letters[index] || '?';
  };

  const AnswerItem = ({ questionId, correctAnswer, userAnswer }) => {
    const isCorrect = userAnswer === correctAnswer;
    const userLetter = userAnswer !== undefined ? indexToLetter(userAnswer) : '-';
    const correctLetter = indexToLetter(correctAnswer);

    return (
      <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
        userAnswer === undefined 
          ? 'bg-gray-200 text-gray-600'
          : isCorrect 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {questionId}-{userLetter}
        {!isCorrect && userAnswer !== undefined && (
          <span className="text-xs ml-1">({correctLetter})</span>
        )}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden border-2 border-blue-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 flex items-center justify-between hover:from-blue-600 hover:to-purple-600 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="text-left">
            <h2 className="text-xl font-bold">📋 Đáp án tóm tắt / Quick Answer Key</h2>
            <p className="text-sm opacity-90">✓ Xanh = Đúng | ✗ Đỏ = Sai | (A) = Đáp án đúng</p>
          </div>
        </div>
        <svg 
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Part 1: Knowledge/Reading */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-lg font-bold mb-3 text-blue-700 flex items-center gap-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded">Part 1</span>
                言語知識・読解
              </h3>
              <div className="flex flex-wrap gap-2">
                {knowledgeQuestions.map((q) => (
                  <AnswerItem
                    key={q.id}
                    questionId={q.id}
                    correctAnswer={q.correctAnswer}
                    userAnswer={knowledgeAnswers[q.id]}
                  />
                ))}
              </div>
            </div>

            {/* Part 2: Listening */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-lg font-bold mb-3 text-purple-700 flex items-center gap-2">
                <span className="bg-purple-500 text-white px-2 py-1 rounded">Part 2</span>
                聴解
              </h3>
              <div className="flex flex-wrap gap-2">
                {listeningQuestions.map((q) => {
                  const questionKey = `${q.sectionId}-${q.number}`;
                  return (
                    <AnswerItem
                      key={questionKey}
                      questionId={q.number}
                      correctAnswer={q.correctAnswer}
                      userAnswer={listeningAnswers[questionKey]}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">1-A</span>
              <span className="text-gray-600">= Câu 1, chọn A (Đúng)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">2-B (A)</span>
              <span className="text-gray-600">= Câu 2, chọn B sai, đáp án đúng là A</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded bg-gray-200 text-gray-600 font-semibold">3--</span>
              <span className="text-gray-600">= Câu 3 chưa trả lời</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component hiển thị một câu hỏi với đáp án
const AnswerCard = ({ question, userAnswer, index, section }) => {
  // ✅ UPDATED: Ref cho TOÀN BỘ card để tra từ mọi nơi (sau khi xem đáp án)
  const cardRef = useRef(null);
  useDictionaryDoubleClick(cardRef);

  const isCorrect = userAnswer === question.correctAnswer;
  const isListening = section === 'listening';
  
  return (
    // ✅ UPDATED: Wrap toàn bộ card với ref và select-text
    <div 
      ref={cardRef}
      className={`bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 select-text ${
        isCorrect ? 'border-green-500' : 'border-red-500'
      }`}
    >
      {/* Header với số câu và trạng thái */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base md:text-lg ${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {index}
          </div>
          <span className="text-gray-600 text-sm">
            {isListening ? `問題${question.number} (${question.subNumber}番)` : `問題${question.id}`}
          </span>
        </div>
        <div className={`px-4 py-1 rounded-full text-sm font-semibold ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect ? '✓ 正解' : '✗ 不正解'}
        </div>
      </div>

      {/* Câu hỏi */}
      <div className="mb-4">
        {question.passage && (
          <div className="bg-gray-50 p-4 rounded mb-3 text-sm leading-relaxed">
            {question.passage}
          </div>
        )}
        <div className="text-base sm:text-lg font-semibold mb-3">
          {question.question || question.instruction}
        </div>
        {question.text && (
          <div className="text-base mb-3">
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
      </div>

      {/* Đáp án */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, idx) => {
          const isUserChoice = userAnswer === idx;
          const isCorrectAnswer = question.correctAnswer === idx;
          
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 ${
                isCorrectAnswer
                  ? 'border-green-500 bg-green-50'
                  : isUserChoice
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCorrectAnswer
                    ? 'bg-green-500 text-white'
                    : isUserChoice
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                <span className={`${
                  isCorrectAnswer || isUserChoice ? 'font-semibold' : ''
                }`}>
                  {option}
                </span>
                {isCorrectAnswer && (
                  <span className="ml-auto text-green-600 font-bold">✓ 正解</span>
                )}
                {isUserChoice && !isCorrectAnswer && (
                  <span className="ml-auto text-red-600 font-bold">あなたの答え</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ UPDATED: Giải thích không cần ref riêng nữa, đã có ref toàn card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-blue-800">解説</span>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {question.explanation || '解説は準備中です。'}
        </p>
      </div>
    </div>
  );
};

// Component thống kê tổng quan
const ScoreSummary = ({ knowledgeScore, listeningScore, totalQuestions, correctAnswers }) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg p-6 mb-6 text-white">
      <h2 className="text-2xl font-bold mb-4">解答結果</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">正解数</div>
          <div className="text-2xl sm:text-3xl font-bold">{correctAnswers}/{totalQuestions}</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">正解率</div>
          <div className="text-2xl sm:text-3xl font-bold">{percentage}%</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">言語知識・読解</div>
          <div className="text-2xl sm:text-3xl font-bold">{knowledgeScore}点</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">聴解</div>
          <div className="text-2xl sm:text-3xl font-bold">{listeningScore}点</div>
        </div>
      </div>
    </div>
  );
};

function ExamAnswersPage() {
  const { levelId, examId } = useParams();
  const navigate = useNavigate();
  
  const currentExam = getExamById(levelId, examId);
  const knowledgeData = getExamQuestions(levelId, examId);
  const listeningData = getListeningQuestions(levelId, examId);
  
  const [knowledgeAnswers, setKnowledgeAnswers] = useState({});
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState('');

  // Load user answers và scores
  useEffect(() => {
    const savedKnowledgeAnswers = localStorage.getItem(`exam-${levelId}-${examId}-knowledge`);
    const savedListeningAnswers = localStorage.getItem(`exam-${levelId}-${examId}-listening`);
    const savedKnowledgeScore = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-score`);
    const savedListeningScore = localStorage.getItem(`exam-${levelId}-${examId}-listening-score`);
    
    if (savedKnowledgeAnswers) setKnowledgeAnswers(JSON.parse(savedKnowledgeAnswers));
    if (savedListeningAnswers) setListeningAnswers(JSON.parse(savedListeningAnswers));
    if (savedKnowledgeScore) setKnowledgeScore(parseInt(savedKnowledgeScore));
    if (savedListeningScore) setListeningScore(parseInt(savedListeningScore));
  }, [levelId, examId]);

  if (!currentExam || !knowledgeData || !listeningData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">データが見つかりません</h1>
        <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
          ← 戻る
        </button>
      </div>
    );
  }

  const knowledgeQuestions = knowledgeData.knowledge.sections.flatMap(s => s.questions);
  const listeningQuestions = listeningData.sections.flatMap(s => 
    s.questions.map(q => ({ ...q, sectionId: s.id }))
  );
  const allQuestions = [...knowledgeQuestions, ...listeningQuestions];
  
  // Calculate correct answers
  let correctCount = 0;
  
  knowledgeQuestions.forEach(q => {
    if (knowledgeAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });
  
  listeningQuestions.forEach(q => {
    const key = `${q.sectionId}-${q.number}`;
    if (listeningAnswers[key] === q.correctAnswer) {
      correctCount++;
    }
  });

  const handleNavigateWithConfirm = (path) => {
    setPendingPath(path);
    setShowExitModal(true);
  };

  const handleExitConfirmed = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`exam-${levelId}-${examId}`)) {
        localStorage.removeItem(key);
      }
    });
    setShowExitModal(false);
    navigate(pendingPath);
  };

  const handleRetakeConfirmed = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`exam-${levelId}-${examId}`)) {
        localStorage.removeItem(key);
      }
    });
    setShowConfirmModal(false);
    navigate(`/jlpt/${levelId}/${examId}`);
  };

  const breadcrumbPaths = [
    { name: 'ホーム', onClick: () => handleNavigateWithConfirm('/') },
    { name: 'JLPT', onClick: () => handleNavigateWithConfirm('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => handleNavigateWithConfirm(`/jlpt/${levelId}`) },
    { name: currentExam.title, onClick: () => handleNavigateWithConfirm(`/jlpt/${levelId}/${examId}`) },
    { name: '結果', onClick: () => navigate(`/jlpt/${levelId}/${examId}/result`) },
    { name: '解答・解説' }
  ];

  return (
    <>
      {/* ✅ NEW: Dictionary components */}
      <DictionaryButton />
      <DictionaryPopup />

      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          
          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full">
            <div className="p-4 sm:p-5 md:p-6 border-b border-gray-300">
              <Breadcrumbs paths={breadcrumbPaths} />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-3 sm:mt-4">
                {currentExam.title} - 解答・解説
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
              <div className="max-w-4xl mx-auto">
                <ScoreSummary
                  knowledgeScore={knowledgeScore}
                  listeningScore={listeningScore}
                  totalQuestions={allQuestions.length}
                  correctAnswers={correctCount}
                />

                <QuickAnswerKey
                  knowledgeQuestions={knowledgeQuestions}
                  listeningQuestions={listeningQuestions}
                  knowledgeAnswers={knowledgeAnswers}
                  listeningAnswers={listeningAnswers}
                />

                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-sm sm:text-base">Part 1</span>
                    <span className="text-base sm:text-lg md:text-xl">言語知識・読解</span>
                  </h2>
                  {knowledgeQuestions.map((q, idx) => (
                    <AnswerCard
                      key={q.id}
                      question={q}
                      userAnswer={knowledgeAnswers[q.id]}
                      index={idx + 1}
                      section="knowledge"
                    />
                  ))}
                </div>

                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="bg-purple-500 text-white px-2 sm:px-3 py-1 rounded text-sm sm:text-base">Part 2</span>
                    <span className="text-base sm:text-lg md:text-xl">聴解</span>
                  </h2>
                  {listeningQuestions.map((q, idx) => {
                    const questionKey = `${q.sectionId}-${q.number}`;
                    return (
                      <AnswerCard
                        key={questionKey}
                        question={q}
                        userAnswer={listeningAnswers[questionKey]}
                        index={knowledgeQuestions.length + idx + 1}
                        section="listening"
                      />
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => navigate(`/jlpt/${levelId}/${examId}/result`)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    ← 結果画面に戻る
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    🔄 もう一度受験する
                  </button>
                  <button
                    onClick={() => handleNavigateWithConfirm(`/jlpt/${levelId}`)}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    📋 試験一覧へ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận thoát */}
      <ReactModal
        isOpen={showExitModal}
        onRequestClose={() => setShowExitModal(false)}
        shouldCloseOnOverlayClick={true}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 md:mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <h2 className="text-xl font-bold">確認</h2>
        </div>
        <p className="mb-6 text-gray-700">本当に終了しますか？データは削除されます。</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => setShowExitModal(false)} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-all duration-300 transform hover:scale-105"
          >
            キャンセル
          </button>
          <button 
            onClick={handleExitConfirmed} 
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            確認
          </button>
        </div>
      </ReactModal>

      {/* Modal xác nhận làm lại */}
      <ReactModal
        isOpen={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        shouldCloseOnOverlayClick={true}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 md:mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <h2 className="text-xl font-bold">確認</h2>
        </div>
        <p className="mb-6 text-gray-700">もう一度受験しますか？データは削除されます。</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => setShowConfirmModal(false)} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-all duration-300 transform hover:scale-105"
          >
            キャンセル
          </button>
          <button 
            onClick={handleRetakeConfirmed} 
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            確認
          </button>
        </div>
      </ReactModal>
    </>
  );
}

export default ExamAnswersPage;
