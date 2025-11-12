// src/features/jlpt/pages/JLPTExamDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';

// Component đồng hồ analog
const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const s = currentTime.getSeconds();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const hourAngle = (hours * 30) + (minutes * 0.5);
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;

  return (
    <div className="relative w-52 h-52 mx-auto">
      <div className="absolute inset-0 bg-white rounded-full shadow-2xl border-8 border-gray-300">
        {[...Array(12)].map((_, i) => {
          const angle = i * 30;
          const isMainHour = i % 3 === 0;
          return (
            <div
              key={i}
              className={`absolute ${isMainHour ? 'w-1.5 h-5' : 'w-1 h-3'} bg-gray-400`}
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${isMainHour ? '94px' : '96px'})`,
                transformOrigin: 'center'
              }}
            />
          );
        })}
        
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-30" />
        
        <div
          className="absolute left-1/2 top-1/2 w-2 h-16 bg-gray-800 rounded-full origin-bottom transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
            transformOrigin: '50% 100%'
          }}
        />
        
        <div
          className="absolute left-1/2 top-1/2 w-1.5 h-24 bg-blue-600 rounded-full origin-bottom transition-transform duration-500 ease-out z-10"
          style={{ 
            transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
            transformOrigin: '50% 100%'
          }}
        />
        
        <div
          className="absolute left-1/2 top-1/2 w-0.5 h-28 bg-pink-500 rounded-full origin-bottom transition-transform duration-1000 ease-linear z-20"
          style={{ 
            transform: `translateX(-50%) translateY(-100%) rotate(${secondAngle}deg)`,
            transformOrigin: '50% 100%'
          }}
        />
      </div>
      
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-base font-mono text-gray-700 font-semibold">
        {formatTime()}
      </div>
    </div>
  );
};

// Component nút bài thi
const ExamButton = ({ title, score, bgColor, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative ${bgColor} rounded-full px-8 py-6 shadow-xl border-4 border-red-600 
        transition-all duration-300 min-w-[280px]
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl cursor-pointer'}`}
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-2">{title}</div>
        <div className="text-3xl font-bold text-gray-900">
          ({score}分)
        </div>
      </div>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 rounded-full">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </button>
  );
};

function JLPTExamDetailPage() {
  const [knowledgeTestCompleted, setKnowledgeTestCompleted] = useState(false);
  const [listeningCompleted, setListeningCompleted] = useState(false);
  
  const { levelId, examId } = useParams();
  const { navigate, WarningModal } = useExamGuard(); // ✅ Sử dụng navigate có cảnh báo
  
  const currentExam = getExamById(levelId, examId) || { title: 'Đề thi không tồn tại', date: '', level: 'N1' };

  // Check localStorage
  useEffect(() => {
    const knowledgeCompleted = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-completed`);
    const listeningCompletedLS = localStorage.getItem(`exam-${levelId}-${examId}-listening-completed`);
    
    setKnowledgeTestCompleted(knowledgeCompleted === 'true');
    setListeningCompleted(listeningCompletedLS === 'true');
  }, [levelId, examId]);

  if (!currentExam || currentExam.status === 'Sắp diễn ra') {
    return (
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full min-h-app p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Đề thi không khả dụng</h1>
            <p className="text-gray-600 mb-4">Đề thi này chưa có sẵn hoặc chưa diễn ra. Quay về danh sách.</p>
            <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              ← Quay về danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Breadcrumb paths với navigate có cảnh báo (tất cả đều hoạt động)
  const breadcrumbPaths = [
    { name: 'ホーム', onClick: () => navigate('/') },
    { name: 'JLPT', onClick: () => navigate('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => navigate(`/jlpt/${levelId}`) },
    { name: currentExam.title } // Trang hiện tại - không có onClick
  ];

  const handleKnowledgeTest = () => {
    navigate(`/jlpt/${levelId}/${examId}/knowledge`);
  };

  // ✅ FIX: Listening button bây giờ sẽ navigate đúng cách
  const handleListeningTest = () => {
    if (knowledgeTestCompleted) {
      navigate(`/jlpt/${levelId}/${examId}/listening`);
    }
  };

  const handleViewResults = () => {
    if (knowledgeTestCompleted && listeningCompleted) {
      navigate(`/jlpt/${levelId}/${examId}/result`);
    }
  };

  const bothCompleted = knowledgeTestCompleted && listeningCompleted;

  return (
    <>
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          
          <Sidebar />

          <div className="flex-1 min-w-0 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg shadow-lg flex flex-col w-full min-h-app">
            
            <div className="pt-4 px-6 pb-2">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            
            <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col items-center justify-center">
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-12 tracking-tight">
                {currentExam.title}
              </h1>
              
              <div className="mb-12">
                <Clock />
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
                <ExamButton
                  title="言語、知識、読解"
                  score={110}
                  bgColor="bg-gradient-to-br from-yellow-300 to-yellow-400"
                  disabled={false}
                  onClick={handleKnowledgeTest}
                />
                
                <ExamButton
                  title="聴解"
                  score={60}
                  bgColor="bg-gradient-to-br from-yellow-300 to-yellow-400"
                  disabled={!knowledgeTestCompleted}
                  onClick={handleListeningTest}
                />
              </div>

              {!knowledgeTestCompleted && (
                <p className="text-gray-700 text-center text-base md:text-lg">
                  ※ 聴解は言語、知識、読解の試験を完了後に受験できます
                </p>
              )}
              
              {knowledgeTestCompleted && !listeningCompleted && (
                <p className="text-green-700 font-semibold text-center text-base md:text-lg">
                  ✓ 言語、知識、読解が完了しました。聴解を受験できます
                </p>
              )}

              {bothCompleted && (
                <div className="mt-8 text-center">
                  <p className="text-green-700 font-semibold text-center text-base md:text-lg mb-4">
                    ✓ すべての試験が完了しました。
                  </p>
                  <button
                    onClick={handleViewResults}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    結果を見る
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Hiển thị Modal cảnh báo từ useExamGuard */}
      {WarningModal}
    </>
  );
}

export default JLPTExamDetailPage;