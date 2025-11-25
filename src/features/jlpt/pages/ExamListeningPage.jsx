// src/features/jlpt/pages/ExamListeningPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate as useNavigateRouter } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getListeningQuestions } from '../../../data/jlpt/listeningQuestionsData.js';
import storageManager from '../../../utils/localStorageManager.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';

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
  // ✅ FIX: Chỉ khởi tạo timeLeft nếu initialTime hợp lệ (> 0)
  const [timeLeft, setTimeLeft] = useState(() => {
    const validTime = (initialTime && initialTime > 0) ? initialTime : 0;
    return validTime * 60;
  });
  const [isWarning, setIsWarning] = useState(false);
  
  // ✅ FIX: Sử dụng useRef để tránh re-create interval khi giá trị thay đổi
  const hasCalledTimeUpRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  
  // ✅ Update ref khi onTimeUp thay đổi
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // ✅ FIX: Reset timeLeft khi initialTime thay đổi
  useEffect(() => {
    if (initialTime && initialTime > 0) {
      setTimeLeft(initialTime * 60);
      hasCalledTimeUpRef.current = false;
      setIsWarning(false);
    }
  }, [initialTime]);

  // ✅ FIX: Chỉ tạo interval một lần khi component mount
  useEffect(() => {
    // Nếu không có thời gian hoặc thời gian <= 0, không tạo timer
    if (!initialTime || initialTime <= 0) {
      console.warn('⚠️ CountdownTimer: initialTime is invalid:', initialTime);
      return;
    }

    // Tạo interval để đếm ngược
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Cảnh báo khi còn 5 phút
        if (newTime <= 300) {
          setIsWarning(true);
        }
        
        // Nếu hết thời gian và chưa gọi onTimeUp, gọi một lần
        if (newTime <= 0 && !hasCalledTimeUpRef.current) {
          hasCalledTimeUpRef.current = true;
          // Gọi onTimeUp trong setTimeout để tránh gọi trong quá trình render
          setTimeout(() => onTimeUpRef.current(), 0);
        }
        
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialTime]); // ✅ FIX: Chỉ depend on initialTime

  // ✅ FIX: Nếu không có thời gian, hiển thị "Không giới hạn"
  if (!initialTime || initialTime <= 0) {
    return (
      <div className="text-lg font-semibold px-4 py-2 rounded-lg bg-gray-200 text-gray-600">
        Không giới hạn thời gian
      </div>
    );
  }

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

// Component Audio Player
const AudioPlayer = ({ audioUrl, currentQuestion }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Reset khi chuyển câu
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentQuestion]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ✅ FIX: Validate audioUrl - không render nếu không hợp lệ
  if (!audioUrl || audioUrl.trim() === '' || audioUrl === '/audio/sample.mp3') {
    return (
      <div className="bg-yellow-50 rounded-lg shadow-md p-4 mb-6 border border-yellow-200">
        <p className="text-sm text-yellow-700">⚠️ Audio file không có sẵn cho câu hỏi này.</p>
      </div>
    );
  }
  
  // ✅ FIX: Kiểm tra nếu là blob URL không hợp lệ (blob URL chỉ tồn tại trong session)
  // Nhưng cho phép data URL (base64) và URL thực tế
  if (audioUrl.startsWith('blob:') && !audioUrl.includes('http')) {
    console.warn('⚠️ Invalid blob URL (expired):', audioUrl);
    return (
      <div className="bg-yellow-50 rounded-lg shadow-md p-4 mb-6 border border-yellow-200">
        <p className="text-sm text-yellow-700">⚠️ Audio file không hợp lệ (blob URL đã hết hạn).</p>
      </div>
    );
  }
  
  // ✅ FIX: Log audio URL type for debugging
  if (audioUrl.startsWith('data:')) {
    console.log('✅ Using base64 audio data (data URL)');
  } else if (audioUrl.startsWith('blob:')) {
    console.log('⚠️ Using blob URL (may expire)');
  } else {
    console.log('✅ Using regular audio URL:', audioUrl);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('❌ Audio load error:', e);
          setIsPlaying(false);
        }}
      />
      
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          ⚙️
        </button>
      </div>
    </div>
  );
};

// Component câu hỏi
const QuestionDisplay = ({ question, selectedAnswer, onSelectAnswer }) => {
  if (!question) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-gray-500 text-sm mb-2">問題 {question.sectionTitle || question.sectionId}</div>
      <div className="text-lg font-semibold mb-6">{question.instruction || ''}</div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="text-gray-600 text-sm mb-2">番号 {question.number}</div>
        <div className="text-xl font-bold">{question.subNumber || question.number}番</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            className={`text-left p-4 sm:p-5 md:p-6 rounded-lg border-2 transition-all duration-200 ${
              selectedAnswer === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-base sm:text-lg font-bold ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className="text-base leading-relaxed">{option}</span>
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
      <h3 className="font-bold text-lg mb-4 text-center">聴解</h3>
      <div className="text-sm text-gray-600 mb-2 text-center">
        ⏱ {sections.reduce((acc, s) => acc + (s.timeLimit || 0), 0)}分
      </div>

      {sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">{section.title}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {section.questions.map((q) => {
              const questionKey = `${section.id}-${q.number}`;
              const isAnswered = answers[questionKey] !== undefined;
              const isCurrent = currentQuestion === questionKey;

              return (
                <button
                  key={questionKey}
                  onClick={() => onQuestionSelect(questionKey)}
                  className={`h-8 sm:h-9 md:h-10 rounded border-2 font-semibold text-xs sm:text-sm transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : isAnswered
                      ? 'border-green-500 bg-green-100 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {q.number}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex justify-between mb-1">
          <span>Đã trả lời:</span>
          <span className="font-bold">
            {Object.keys(answers).length}/{sections.reduce((acc, s) => acc + s.questions.length, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

function ExamListeningPage() {
  const { levelId, examId } = useParams();
  
  // ✅ Debug: Log params ngay đầu để kiểm tra
  console.log('🎧 ExamListeningPage render:', { levelId, examId, pathname: window.location.pathname });
  
  const { navigate, WarningModal, clearExamData } = useExamGuard();
  const navigateRouter = useNavigateRouter(); // ✅ Thêm navigate trực tiếp từ React Router
  const { t } = useLanguage(); // ✅ Added useLanguage for localization

  // ✅ Debug: Log params để kiểm tra
  useEffect(() => {
    console.log('🎧 ExamListeningPage mounted:', { levelId, examId, pathname: window.location.pathname });
  }, [levelId, examId]);

  // ✅ UPDATED: Load exam metadata từ storage trước, fallback về static file
  const [currentExam, setCurrentExam] = useState(null);
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentQuestionKey, setCurrentQuestionKey] = useState('1-01');
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  // ✅ REMOVED: Don't lock body scroll - allow scrolling in modal and outside modal
  // useBodyScrollLock(showSubmitModal || showIncompleteWarning);

  // ✅ UPDATED: Load exam data từ storage hoặc static file
  useEffect(() => {
    const loadExamData = async () => {
      setIsLoading(true);
      try {
        // 1. Thử load từ storage trước (admin created exams)
        const savedExam = await storageManager.getExam(levelId, examId);
        
        if (savedExam) {
          // Có dữ liệu trong storage
          console.log('✅ ExamListeningPage: Loaded exam from storage');
          console.log('📦 Full exam data:', JSON.stringify(savedExam, null, 2));
          console.log('📊 Exam data structure:', {
            hasListening: !!savedExam.listening,
            hasSections: !!savedExam.listening?.sections,
            sectionsCount: savedExam.listening?.sections?.length || 0,
            totalQuestions: savedExam.listening?.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0,
            listeningType: typeof savedExam.listening,
            sectionsType: typeof savedExam.listening?.sections,
            sectionsIsArray: Array.isArray(savedExam.listening?.sections)
          });
          
          // ✅ Đảm bảo exam data có structure đúng (knowledge, reading, listening)
          const normalizedExamData = {
            ...savedExam,
            knowledge: savedExam.knowledge || { sections: [] },
            reading: savedExam.reading || { sections: [] },
            listening: savedExam.listening || { sections: [] }
          };
          
          // ✅ Đảm bảo listening.sections là array
          if (!Array.isArray(normalizedExamData.listening.sections)) {
            console.warn('⚠️ listening.sections is not an array, converting...');
            normalizedExamData.listening.sections = [];
          }
          
          console.log('✅ Normalized exam data:', {
            hasListening: !!normalizedExamData.listening,
            sectionsIsArray: Array.isArray(normalizedExamData.listening.sections),
            sectionsCount: normalizedExamData.listening.sections.length
          });
          
          // Extract exam metadata từ savedExam
          const examMetadata = {
            id: examId,
            title: savedExam.title || `JLPT ${examId}`,
            date: savedExam.date || examId,
            status: savedExam.status || 'Có sẵn',
            imageUrl: savedExam.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: savedExam.level || levelId
          };
          
          setCurrentExam(examMetadata);
          
          // Transform listening data to match expected format
          if (normalizedExamData.listening.sections && normalizedExamData.listening.sections.length > 0) {
            const transformedData = {
              sections: normalizedExamData.listening.sections.map(section => ({
                id: section.id,
                title: section.title,
                instruction: section.instruction || '',
                timeLimit: section.timeLimit || 0,
                questions: (section.questions || []).map(q => ({
                  number: q.number || String(q.id).padStart(2, '0'),
                  subNumber: q.subNumber || q.id,
                  category: q.category || 'listening',
                  // ✅ FIX: Use audioData (base64) if available, otherwise use audioUrl
                  audioUrl: q.audioData || q.audioUrl || '',
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation || ''
                }))
              }))
            };
            setExamData(transformedData);
          } else {
            // Exam tồn tại nhưng chưa có listening sections
            setExamData(null);
          }
        } else {
          // 2. Fallback về static file
          console.log('📁 ExamListeningPage: Loading exam from static file...');
          const staticExam = getExamById(levelId, examId);
          const staticData = getListeningQuestions(levelId, examId);
          
          if (staticExam && staticData) {
            setCurrentExam(staticExam);
            setExamData(staticData);
          } else {
            // Không tìm thấy ở cả 2 nơi
            setCurrentExam(null);
            setExamData(null);
          }
        }
      } catch (error) {
        console.error('❌ ExamListeningPage: Error loading exam data:', error);
        // Fallback về static file
        const staticExam = getExamById(levelId, examId);
        const staticData = getListeningQuestions(levelId, examId);
        setCurrentExam(staticExam || null);
        setExamData(staticData || null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExamData();
  }, [levelId, examId]);

  // Load answers từ localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam-${levelId}-${examId}-listening`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [levelId, examId]);

  // ✅ Set default currentQuestionKey nếu chưa có hoặc không tìm thấy
  // ⚠️ QUAN TRỌNG: useEffect này PHẢI được đặt trước các early return
  useEffect(() => {
    if (!examData || !examData.sections) return;
    
    const sections = examData.sections || [];
    const allQuestions = sections.flatMap(s =>
      s.questions?.map(q => ({ ...q, sectionId: s.id, sectionTitle: s.title, instruction: s.instruction })) || []
    );
    
    if (allQuestions.length > 0) {
      const found = allQuestions.find(q => `${q.sectionId}-${q.number}` === currentQuestionKey);
      if (!found) {
        const firstQuestion = allQuestions[0];
        if (firstQuestion) {
          setCurrentQuestionKey(`${firstQuestion.sectionId}-${firstQuestion.number}`);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examData, currentQuestionKey]);

  // Block browser back (popstate) while taking exam
  useEffect(() => {
    const unblock = () => {
      window.history.pushState({ exam: true }, '');
    };
    unblock();
    const onPopState = () => {
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

  // ✅ Early returns - PHẢI đặt SAU tất cả hooks
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải đề thi...</p>
      </div>
    );
  }

  // Not found state
  if (!currentExam || !examData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Đề thi không tồn tại</h1>
        <p className="text-gray-600 mb-4">Không tìm thấy đề thi {examId} cho level {levelId.toUpperCase()}</p>
        <p className="text-gray-500 mb-4 text-sm">
          Debug info: currentExam={currentExam ? 'exists' : 'null'}, examData={examData ? 'exists' : 'null'}
        </p>
        <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
          ← Quay về
        </button>
      </div>
    );
  }

  // ✅ UPDATED: Safe access với null check và đảm bảo structure đúng
  const sections = examData?.sections || [];
  const allQuestions = sections.flatMap(s =>
    s.questions?.map(q => ({ ...q, sectionId: s.id, sectionTitle: s.title, instruction: s.instruction })) || []
  );
  
  console.log('🔍 ExamListeningPage - Current state:', {
    hasExamData: !!examData,
    hasSections: !!examData?.sections,
    sectionsCount: sections.length,
    totalQuestions: allQuestions.length,
    sections: sections.map(s => ({
      id: s.id,
      title: s.title,
      questionsCount: s.questions?.length || 0
    }))
  });
  
  // ✅ Nếu không có câu hỏi nào, hiển thị thông báo
  if (allQuestions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Đề thi chưa có câu hỏi</h1>
        <p className="text-gray-600 mb-4">
          Đề thi nghe {examId} cho level {levelId.toUpperCase()} chưa có câu hỏi nào.
        </p>
        <p className="text-gray-500 mb-2 text-sm">
          Sections: {sections.length} | Questions: {allQuestions.length}
        </p>
        <p className="text-gray-500 mb-4 text-sm">
          Vui lòng thêm câu hỏi trong Admin Panel → Quản lý Đề thi → Chọn đề → Chọn "Nghe hiểu" → Nhập Câu hỏi
        </p>
        <button 
          onClick={() => navigate(`/jlpt/${levelId}`)} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Quay về danh sách đề thi
        </button>
      </div>
    );
  }

  const currentQuestion = allQuestions.find(q => `${q.sectionId}-${q.number}` === currentQuestionKey);
  const currentIndex = allQuestions.findIndex(q => `${q.sectionId}-${q.number}` === currentQuestionKey);
  const totalTime = sections.reduce((acc, s) => acc + (s.timeLimit || 0), 0);

  const breadcrumbPaths = [
    { name: 'Home', onClick: () => navigate('/') },
    { name: 'JLPT', onClick: () => navigate('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => navigate(`/jlpt/${levelId}`) },
    { name: currentExam.title, onClick: () => navigate(`/jlpt/${levelId}/${examId}`) },
    { name: '聴解' }
  ];

  const handleSelectAnswer = (answerIndex) => {
    const newAnswers = { ...answers, [currentQuestionKey]: answerIndex };
    setAnswers(newAnswers);
    localStorage.setItem(`exam-${levelId}-${examId}-listening`, JSON.stringify(newAnswers));
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      const prevQ = allQuestions[currentIndex - 1];
      setCurrentQuestionKey(`${prevQ.sectionId}-${prevQ.number}`);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < allQuestions.length - 1) {
      const nextQ = allQuestions[currentIndex + 1];
      setCurrentQuestionKey(`${nextQ.sectionId}-${nextQ.number}`);
    }
  };

  const handleTimeUp = () => {
    alert('Hết giờ làm bài! Bài thi sẽ được tự động nộp.');
    handleSubmit();
  };

  const handleSubmit = () => {
    let correctCount = 0;
    let listeningCorrect = 0;
    let listeningTotal = 0;

    allQuestions.forEach(q => {
      const key = `${q.sectionId}-${q.number}`;
      const isCorrect = answers[key] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }

      // NEW: Breakdown for listening (all questions are 'listening' category)
      listeningTotal++;
      if (isCorrect) listeningCorrect++;
    });

    const score = Math.round((correctCount / allQuestions.length) * 100);

    // NEW: Lưu breakdown cho result page
    localStorage.setItem(`exam-${levelId}-${examId}-listening-breakdown`, JSON.stringify({
      listening: listeningCorrect,
      total: listeningTotal
    }));

    localStorage.setItem(`exam-${levelId}-${examId}-listening-score`, score);
    localStorage.setItem(`exam-${levelId}-${examId}-listening-completed`, 'true');

    // ✅ Sử dụng navigateRouter trực tiếp để đảm bảo navigation hoạt động đúng
    const detailPath = `/jlpt/${levelId}/${examId}`;
    console.log('Submitting listening exam, navigating to:', detailPath);
    navigateRouter(detailPath);
  };

  const handleSubmitClick = () => {
    const unanswered = allQuestions.length - Object.keys(answers).length;

    if (unanswered > 0) {
      setUnansweredCount(unanswered);
      setShowIncompleteWarning(true);
    } else {
      setShowSubmitModal(true);
    }
  };

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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{currentExam.title} - 聴解</h1>
                {totalTime > 0 ? (
                  <CountdownTimer initialTime={totalTime} onTimeUp={handleTimeUp} />
                ) : (
                  <div className="text-lg font-semibold px-4 py-2 rounded-lg bg-gray-200 text-gray-600">
                    Không giới hạn thời gian
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                <AudioPlayer 
                  audioUrl={currentQuestion?.audioUrl || '/audio/sample.mp3'} 
                  currentQuestion={currentQuestionKey}
                />

                {currentQuestion ? (
                  <QuestionDisplay
                    question={currentQuestion}
                    selectedAnswer={answers[currentQuestionKey]}
                    onSelectAnswer={handleSelectAnswer}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <p className="text-gray-600">Đang tải câu hỏi...</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition text-sm sm:text-base"
                  >
                    {t('jlpt.listeningPage.prevButton')}
                  </button>

                  {currentIndex === allQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmitClick}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm sm:text-base"
                    >
                      {t('jlpt.listeningPage.submitButton')}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm sm:text-base"
                    >
                      {t('jlpt.listeningPage.nextButton')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 md:sticky md:top-4 mt-4 md:mt-0">
            <NavigationPanel
              sections={sections}
              currentQuestion={currentQuestionKey}
              answers={answers}
              onQuestionSelect={setCurrentQuestionKey}
            />
          </div>
        </div>

        {/* Modal cảnh báo thiếu câu */}
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

        {/* Modal xác nhận submit */}
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
              <h2 className="text-xl font-bold mb-4">{t('jlpt.listeningPage.submitModal.title')}</h2>
              <p className="mb-6">{t('jlpt.listeningPage.submitModal.message')}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  {t('jlpt.listeningPage.submitModal.cancelButton')}
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {t('jlpt.listeningPage.submitModal.confirmButton')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {WarningModal}
    </>
  );
}

export default ExamListeningPage;