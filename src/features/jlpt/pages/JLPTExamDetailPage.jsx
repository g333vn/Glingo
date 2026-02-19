import React, { useState, useEffect } from 'react';
import { useParams, useNavigate as useNavigateRouter } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import storageManager from '../../../utils/localStorageManager.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import { getExam as getExamFromSupabase } from '../../../services/examService.js';

const STATUS_KEYWORDS = {
  upcoming: ['sắp', 'upcoming', 'coming', 'soon', 'đang chuẩn bị', '準備', 'まもなく'],
  finished: ['kết thúc', 'finished', 'ended', 'closed', '終了', '完了'],
  available: ['có sẵn', 'available', 'ready', 'open', '利用可', '利用可能']
};

const getStatusType = (status = '') => {
  const normalized = status?.toString().trim().toLowerCase();
  if (!normalized) return 'available';
  if (STATUS_KEYWORDS.upcoming.some(keyword => normalized.includes(keyword))) return 'upcoming';
  if (STATUS_KEYWORDS.finished.some(keyword => normalized.includes(keyword))) return 'finished';
  if (STATUS_KEYWORDS.available.some(keyword => normalized.includes(keyword))) return 'available';
  return 'available';
};

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
    <div className="relative mx-auto flex-shrink-0 flex flex-col items-center">
      {/* Clock face container */}
      <div 
        className="relative bg-white rounded-full shadow-2xl border-4 sm:border-6 md:border-8 lg:border-[10px] border-gray-300 w-40 h-40 sm:w-48 sm:h-48 md:w-[240px] md:h-[240px] lg:w-[280px] lg:h-[280px] xl:w-[320px] xl:h-[320px]"
        style={{ 
          aspectRatio: '1 / 1',
          flexShrink: 0
        }}
      >
        {[...Array(12)].map((_, i) => {
          const angle = i * 30;
          const isMainHour = i % 3 === 0;
          const hourNumber = i === 0 ? 12 : i;
          
          // Calculate position for markers (closer to edge)
          const markerRadius = 45; // percentage from center
          const numberRadius = 35; // percentage from center for numbers
          
          const markerX = 50 + markerRadius * Math.sin((angle * Math.PI) / 180);
          const markerY = 50 - markerRadius * Math.cos((angle * Math.PI) / 180);
          
          const numberX = 50 + numberRadius * Math.sin((angle * Math.PI) / 180);
          const numberY = 50 - numberRadius * Math.cos((angle * Math.PI) / 180);
          
          return (
            <React.Fragment key={i}>
              {/* Hour markers */}
              <div
                className={`absolute ${isMainHour ? 'w-1 h-3 sm:h-4 md:h-5 lg:h-6' : 'w-0.5 h-2 sm:h-2.5 md:h-3 lg:h-4'} bg-gray-700`}
                style={{
                  left: `${markerX}%`,
                  top: `${markerY}%`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  transformOrigin: 'center center'
                }}
              />
              {/* Hour numbers - show all on all screen sizes */}
              {isMainHour && (
                <div
                  className="absolute text-gray-800 font-bold text-sm sm:text-base md:text-lg lg:text-xl"
                  style={{
                    left: `${numberX}%`,
                    top: `${numberY}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {hourNumber}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gray-900 rounded-full -translate-x-1/2 -translate-y-1/2 z-30" />

        {/* Hour hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-gray-900 rounded-full z-20"
          style={{
            width: '6px',
            height: '28%',
            transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
            transformOrigin: 'center bottom'
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-blue-600 rounded-full z-10"
          style={{
            width: '4px',
            height: '38%',
            transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
            transformOrigin: 'center bottom'
          }}
        />

        {/* Second hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-pink-500 rounded-full z-20"
          style={{
            width: '2px',
            height: '42%',
            transform: `translateX(-50%) translateY(-100%) rotate(${secondAngle}deg)`,
            transformOrigin: 'center bottom'
          }}
        />
      </div>

      {/* Digital time - centered below clock */}
      <div className="text-center text-base sm:text-lg md:text-xl lg:text-2xl font-mono text-gray-800 font-semibold mt-3 sm:mt-4 md:mt-5">
        {formatTime()}
      </div>
    </div>
  );
};

// Component nút bài thi
const ExamButton = ({ title, score, bgColor, disabled, onClick }) => {
  const { t } = useLanguage();
  const formattedScore = `${score}点`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative ${bgColor} rounded-xl px-2 sm:px-3 md:px-4 border-[3px] border-black 
        transition-all duration-200 
        w-full max-w-full md:w-[340px] h-[140px] sm:h-[160px] md:h-[180px] flex flex-col justify-center items-center
        ${disabled
          ? 'opacity-50 cursor-not-allowed shadow-none'
          : 'hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer'}`}
    >
      <div className="text-center w-full px-2 sm:px-3">
        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black mb-2 min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center leading-tight break-words">
          {title}
        </div>
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-black">
          {formattedScore}
        </div>
      </div>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded-xl">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const { navigate, WarningModal } = useExamGuard();
  const navigateRouter = useNavigateRouter();
  const { t } = useLanguage();

  const [currentExam, setCurrentExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExam = async () => {
      setIsLoading(true);
      try {
        // 1 Ưu tiên load từ Supabase (toàn hệ thống dùng chung)
        const { success, data: supabaseExam } = await getExamFromSupabase(levelId, examId);
        if (success && supabaseExam) {
          const examMetadata = {
            id: supabaseExam.id,
            title: supabaseExam.title || `JLPT ${examId}`,
            date: supabaseExam.date || examId,
            status: supabaseExam.status || 'Có sẵn',
            imageUrl: supabaseExam.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: supabaseExam.level || levelId,
          };

          setCurrentExam(examMetadata);
          // Đồng bộ về storage để client có cache
          try {
            await storageManager.saveExam(levelId, examId, {
              ...supabaseExam,
              level: supabaseExam.level || levelId,
              examId: supabaseExam.id || examId,
            });
          } catch (syncErr) {
            console.warn('[JLPTExamDetailPage] Failed to sync Supabase exam to local storage:', syncErr);
          }
          return;
        }

        // 2 Fallback: storage (exam do admin tạo trước đó)
        const savedExam = await storageManager.getExam(levelId, examId);
        if (savedExam) {
          console.log('✅ ExamDetailPage: Loaded exam from storage:', savedExam);
          const examMetadata = {
            id: examId,
            title: savedExam.title || `JLPT ${examId}`,
            date: savedExam.date || examId,
            status: savedExam.status || 'Có sẵn',
            imageUrl: savedExam.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: savedExam.level || levelId,
          };
          setCurrentExam(examMetadata);
          return;
        }

        // 3 Cuối cùng: static file
        console.log('📁 ExamDetailPage: Loading exam from static file...');
        const staticExam = getExamById(levelId, examId);
        setCurrentExam(staticExam || null);
      } catch (error) {
        console.error('❌ ExamDetailPage: Error loading exam:', error);
        const staticExam = getExamById(levelId, examId);
        setCurrentExam(staticExam || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [levelId, examId]);

  const examStatusType = getStatusType(currentExam?.status);

  useEffect(() => {
    const knowledgeCompleted = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-completed`);
    const listeningCompletedLS = localStorage.getItem(`exam-${levelId}-${examId}-listening-completed`);

    setKnowledgeTestCompleted(knowledgeCompleted === 'true');
    setListeningCompleted(listeningCompletedLS === 'true');
  }, [levelId, examId]);

  if (isLoading) {
    return (
      <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] p-4 sm:p-6 md:p-8 text-center justify-center">
            <div className="text-lg sm:text-xl text-gray-500 font-bold">{t('jlpt.commonTexts.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentExam || examStatusType === 'upcoming') {
    return (
      <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] p-4 sm:p-6 md:p-8 text-center justify-center">
            <h1 className="text-xl sm:text-2xl font-black text-red-500 mb-3 sm:mb-4 break-words px-2">{t('jlpt.detailPage.unavailableTitle')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 font-medium break-words px-2">{t('jlpt.detailPage.unavailableDesc')}</p>
            <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[48px] w-full sm:w-auto max-w-xs">
              {t('jlpt.commonTexts.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFinished = examStatusType === 'finished';

  const breadcrumbPaths = [
    { name: t('common.home') || 'Home', onClick: () => navigate('/') },
    { name: t('common.jlpt') || 'JLPT', onClick: () => navigate('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => navigate(`/jlpt/${levelId}`) },
    { name: currentExam.title }
  ];

  const handleKnowledgeTest = () => {
    navigate(`/jlpt/${levelId}/${examId}/knowledge`);
  };

  const handleListeningTest = () => {
    if (knowledgeTestCompleted) {
      const listeningPath = `/jlpt/${levelId}/${examId}/listening`;
      console.log('🔵 Navigating to listening:', { levelId, examId, listeningPath, currentPath: window.location.pathname });
      navigateRouter(listeningPath, { replace: false });
    } else {
      console.log('⚠️ Knowledge test not completed yet');
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
      <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">

          <Sidebar />

          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] overflow-hidden">

            <div className="pt-3 px-3 sm:px-4 md:px-6 pb-2 flex-shrink-0">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>

            <div 
              className="flex-1 md:overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-6 py-2 md:py-4 flex flex-col items-center justify-center hide-scrollbar"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight px-2 sm:px-4 text-center break-words w-full flex-shrink-0 mb-4 sm:mb-6 md:mb-8">
                {currentExam.title}
              </h1>

              <div className="flex-shrink-0 w-full flex justify-center mb-6 sm:mb-8 md:mb-10">
                <Clock />
              </div>

              {isFinished ? (
                <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center w-full px-2 sm:px-4 max-w-full flex-shrink-0">
                  <div className="bg-gray-100 rounded-lg border-[3px] border-black p-4 sm:p-6 mb-3 sm:mb-4 text-center max-w-md w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-black text-base sm:text-lg font-bold mb-2 break-words">
                      📅 {t('jlpt.detailPage.finishedTitle')}
                    </p>
                    <p className="text-gray-700 text-xs sm:text-sm font-medium break-words">
                      {t('jlpt.detailPage.finishedDesc')}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full">
                    {bothCompleted && (
                      <button
                        onClick={handleViewResults}
                        className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[48px] w-full sm:w-auto"
                      >
                        {t('jlpt.detailPage.viewResults')}
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/jlpt/${levelId}/${examId}/answers`)}
                      className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-[#2D2D2D] text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[48px] w-full sm:w-auto"
                    >
                      {t('jlpt.detailPage.viewAnswers')}
                    </button>
                  </div>

                  {!bothCompleted && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-2 font-medium px-2 sm:px-4 break-words text-center">
                      {t('jlpt.detailPage.unfinishedNote')}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 items-center justify-center w-full px-2 sm:px-4 max-w-full flex-shrink-0 mb-4">
                    <ExamButton
                      title={t('jlpt.detailPage.knowledgeButton')}
                      score={110}
                      bgColor="bg-yellow-400"
                      disabled={false}
                      onClick={handleKnowledgeTest}
                    />

                    <ExamButton
                      title={t('jlpt.detailPage.listeningButton')}
                      score={60}
                      bgColor="bg-yellow-400"
                      disabled={!knowledgeTestCompleted}
                      onClick={handleListeningTest}
                    />
                  </div>

                  {!knowledgeTestCompleted && (
                    <p className="text-gray-700 text-center text-sm sm:text-base px-2 sm:px-4 break-words flex-shrink-0">
                      {t('jlpt.detailPage.listeningLocked')}
                    </p>
                  )}

                  {knowledgeTestCompleted && !listeningCompleted && (
                    <p className="text-green-700 font-semibold text-center text-sm sm:text-base px-2 sm:px-4 break-words flex-shrink-0">
                      ✓ {t('jlpt.detailPage.listeningUnlocked')}
                    </p>
                  )}

                  {bothCompleted && (
                    <div className="text-center px-2 sm:px-4 flex-shrink-0">
                      <p className="text-green-700 font-semibold text-center text-sm sm:text-base mb-3 sm:mb-4 break-words">
                        ✓ {t('jlpt.detailPage.allCompleted')}
                      </p>
                      <button
                        onClick={handleViewResults}
                        className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm sm:text-base min-h-[48px] w-full sm:w-auto"
                      >
                        {t('jlpt.detailPage.viewSummary')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {WarningModal}
    </>
  );
}

export default JLPTExamDetailPage;