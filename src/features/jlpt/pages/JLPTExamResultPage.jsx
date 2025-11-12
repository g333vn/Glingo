// src/features/jlpt/pages/JLPTExamResultPage.jsx
// ✅ ULTIMATE VERSION: Full animations + effects + FIXED NAVIGATION

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

const SCORING_CONFIG = {
  knowledge: { max: 60, minPass: 19 },
  reading: { max: 60, minPass: 19 },
  listening: { max: 60, minPass: 19 },
  total: { max: 180, minPass: 100 }
};

// ✨ Confetti Component
const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 3,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            backgroundColor: particle.backgroundColor,
            animationDelay: `${particle.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

// ✨ Animated Number Counter
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

function JLPTExamResultPage() {
  const { levelId, examId } = useParams();
  const navigate = useNavigate();
  const currentExam = getExamById(levelId, examId);
  
  if (!currentExam) return <div>Đề thi không tồn tại</div>;

  const [scores, setScores] = useState({ knowledge: 0, reading: 0, listening: 0, total: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // ✅ Breakdown state for displaying correct/total questions
  const [breakdown, setBreakdown] = useState({ 
    knowledgeCorrect: 0, knowledgeTotal: 0,
    readingCorrect: 0, readingTotal: 0,
    listeningCorrect: 0, listeningTotal: 0 
  });

  useEffect(() => {
    const knowledgeBreakdown = JSON.parse(localStorage.getItem(`exam-${levelId}-${examId}-knowledge-breakdown`)) || { knowledge: 0, reading: 0, totals: { knowledge: 0, reading: 0 } };
    const listeningBreakdown = JSON.parse(localStorage.getItem(`exam-${levelId}-${examId}-listening-breakdown`)) || { listening: 0, total: 0 };

    const knowledgePoints = knowledgeBreakdown.totals.knowledge > 0
      ? Math.round((knowledgeBreakdown.knowledge / knowledgeBreakdown.totals.knowledge) * SCORING_CONFIG.knowledge.max)
      : 0;
    const readingPoints = knowledgeBreakdown.totals.reading > 0
      ? Math.round((knowledgeBreakdown.reading / knowledgeBreakdown.totals.reading) * SCORING_CONFIG.reading.max)
      : 0;
    const listeningPoints = listeningBreakdown.total > 0
      ? Math.round((listeningBreakdown.listening / listeningBreakdown.total) * SCORING_CONFIG.listening.max)
      : 0;

    const totalScore = knowledgePoints + readingPoints + listeningPoints;
    setScores({ knowledge: knowledgePoints, reading: readingPoints, listening: listeningPoints, total: totalScore });

    // ✅ Set breakdown for display
    setBreakdown({
      knowledgeCorrect: knowledgeBreakdown.knowledge,
      knowledgeTotal: knowledgeBreakdown.totals.knowledge,
      readingCorrect: knowledgeBreakdown.reading,
      readingTotal: knowledgeBreakdown.totals.reading,
      listeningCorrect: listeningBreakdown.listening,
      listeningTotal: listeningBreakdown.total
    });

    // Show confetti if pass
    const passed = totalScore >= SCORING_CONFIG.total.minPass &&
      knowledgePoints >= SCORING_CONFIG.knowledge.minPass &&
      readingPoints >= SCORING_CONFIG.reading.minPass &&
      listeningPoints >= SCORING_CONFIG.listening.minPass;
    
    if (passed) {
      setTimeout(() => setShowConfetti(true), 500);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [levelId, examId]);

  const isPass = scores.total >= SCORING_CONFIG.total.minPass &&
    scores.knowledge >= SCORING_CONFIG.knowledge.minPass &&
    scores.reading >= SCORING_CONFIG.reading.minPass &&
    scores.listening >= SCORING_CONFIG.listening.minPass;

  const handleNavigateWithConfirm = (path) => {
    setPendingPath(path);
    setShowExitModal(true);
  };

  // ✅ FIXED: Clear data and navigate
  const handleExitConfirmed = () => {
    console.log('🗑️ Clearing data and navigating to:', pendingPath);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`exam-${levelId}-${examId}`)) {
        localStorage.removeItem(key);
        console.log('Removed:', key);
      }
    });
    setShowExitModal(false);
    console.log('✅ Navigating to:', pendingPath);
    navigate(pendingPath);
  };

  // ✅ FIXED: Clear data and navigate to retake
  const handleRetakeConfirmed = () => {
    console.log('🗑️ Clearing data for retake');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`exam-${levelId}-${examId}`)) {
        localStorage.removeItem(key);
        console.log('Removed:', key);
      }
    });
    setShowConfirmModal(false);
    const retakePath = `/jlpt/${levelId}/${examId}`;
    console.log('✅ Navigating to:', retakePath);
    navigate(retakePath);
  };

  const handleViewAnswers = () => {
    console.log('📝 Navigating to answers');
    navigate(`/jlpt/${levelId}/${examId}/answers`);
  };

  const breadcrumbPaths = [
    { name: 'ホーム', onClick: () => handleNavigateWithConfirm('/') },
    { name: 'JLPT', onClick: () => handleNavigateWithConfirm('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => handleNavigateWithConfirm(`/jlpt/${levelId}`) },
    { name: currentExam.title }
  ];

  return (
    <>
      {showConfetti && <Confetti />}
      
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        .animate-confetti {
          animation: confetti 3s ease-in forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
          border: 2px solid transparent;
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .btn-glow:hover {
          box-shadow: 0 0 20px currentColor;
        }
      `}</style>

      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          <div className="flex-1 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg shadow-lg flex flex-col w-full min-h-app">
            <div className="pt-4 px-4 md:px-6 pb-2">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            <div className="flex-1 px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col items-center justify-center overflow-y-auto">
              {/* ✨ Animated Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 lg:mb-12 text-center animate-slideUp px-4">
                {currentExam.title} - 結果
              </h1>

              {/* ✨ Animated Layout - ✅ FIXED PERFECT ALIGNMENT */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center md:items-stretch mb-6 sm:mb-8 w-full max-w-4xl px-4">
                {/* ✨ Pass/Fail Card */}
                <div 
                  className={`rounded-xl shadow-md flex flex-col items-center justify-between w-full md:w-64 h-64 sm:h-72 md:h-80 glass-effect hover-lift animate-slideUp ${!isPass ? 'animate-shake' : ''}`}
                  style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
                >
                  <div className="flex-1 flex items-center justify-center pt-4 sm:pt-6">
                    <div className={`flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 border-4 rounded-full text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-500 ${isPass ? 'border-red-500 text-red-500 animate-pulse-slow' : 'border-gray-400 text-gray-500'}`}>
                      <div className={isPass ? 'animate-spin-slow' : ''}>
                        {isPass ? '合格' : '不合格'}
                      </div>
                    </div>
                  </div>
                  <div className={`text-white font-bold w-full text-center py-3 sm:py-4 rounded-b-xl text-lg sm:text-xl md:text-2xl transition-all duration-500 ${isPass ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                    <AnimatedNumber value={scores.total} /> / {SCORING_CONFIG.total.max}
                  </div>
                </div>

                {/* ✨ Score Cards - ✅ PERFECTLY ALIGNED */}
                <div className="flex flex-col gap-4 w-full md:flex-1 justify-between">
                  {/* 語彙・知識 */}
                  <div 
                    className="rounded-xl shadow-md w-full h-20 sm:h-24 flex flex-row items-center justify-between px-4 sm:px-6 glass-effect hover-lift gradient-border animate-slideUp"
                    style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">語彙・知識</span>
                      <span className="text-xs text-gray-500">({breakdown.knowledgeCorrect}/{breakdown.knowledgeTotal})</span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      <AnimatedNumber value={scores.knowledge} duration={1500} />点
                    </span>
                  </div>

                  {/* 読解 */}
                  <div 
                    className="rounded-xl shadow-md w-full h-20 sm:h-24 flex flex-row items-center justify-between px-4 sm:px-6 glass-effect hover-lift gradient-border animate-slideUp"
                    style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">読解</span>
                      <span className="text-xs text-gray-500">({breakdown.readingCorrect}/{breakdown.readingTotal})</span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      <AnimatedNumber value={scores.reading} duration={1500} />点
                    </span>
                  </div>

                  {/* 聴解 */}
                  <div 
                    className="rounded-xl shadow-md w-full h-20 sm:h-24 flex flex-row items-center justify-between px-4 sm:px-6 glass-effect hover-lift gradient-border animate-slideUp"
                    style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">聴解</span>
                      <span className="text-xs text-gray-500">({breakdown.listeningCorrect}/{breakdown.listeningTotal})</span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      <AnimatedNumber value={scores.listening} duration={1500} />点
                    </span>
                  </div>
                </div>
              </div>

              {/* ✨ Animated Action Buttons - ✅ FIXED */}
              <div className="flex flex-col gap-3 md:gap-4 w-full max-w-2xl animate-slideUp px-4" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                {/* View Answers Button */}
                <button
                  onClick={handleViewAnswers}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-2xl text-sm sm:text-base w-full transform hover:scale-105 btn-glow"
                >
                  📝 解答・解説を見る
                </button>
                
                {/* Retry & Exit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 text-sm sm:text-base flex-1 transform hover:scale-105 btn-glow"
                  >
                    🔄 もう一度受験する
                  </button>
                  <button
                    onClick={() => handleNavigateWithConfirm(`/jlpt/${levelId}`)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-sm sm:text-base flex-1 transform hover:scale-105 btn-glow"
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
        className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 md:mx-auto mt-32 animate-slideUp"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 md:mx-auto mt-32 animate-slideUp"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default JLPTExamResultPage;
// ```

// ---

// ## ✅ Key Changes:

// 1. **Import `useNavigate`** từ `react-router-dom` (dòng 2)
// 2. **Removed `useExamGuard`** - không dùng nữa
// 3. **Added console.log** để debug navigation (dòng 159-161, 171-173)
// 4. **Direct `navigate()` calls** trong handlers

// ---

// ## 🧪 Test & Debug:

// 1. Click nút → Modal → 確認
// 2. **Mở Console** (F12) → Xem logs:
// ```
//    🗑️ Clearing data and navigating to: /jlpt/n1
//    Removed: exam-n1-2024-12-knowledge
//    Removed: exam-n1-2024-12-listening
//    ✅ Navigating to: /jlpt/n1