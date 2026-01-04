// src/features/jlpt/pages/ExamListeningPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate as useNavigateRouter } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getListeningQuestions } from '../../../data/jlpt/listeningQuestionsData.js';
import { getExam as getExamFromSupabase } from '../../../services/examService.js';
import storageManager from '../../../utils/localStorageManager.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { saveLearningProgress } from '../../../services/learningProgressService.js';
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
// ✅ UPDATED: Exam mode - chỉ play một lần, không pause/seek (giống thi thật)
// ✅ FIX: Mobile audio playback support
const AudioPlayer = ({ sectionAudioUrl, currentQuestion, allQuestions, onAudioStarted, t }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // ✅ NEW: Track xem đã bấm play chưa (chỉ được bấm một lần)
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  // ✅ NEW: Error state for mobile debugging
  const [playError, setPlayError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ NEW: Preload audio when component mounts or URL changes
  useEffect(() => {
    if (!audioRef.current || !sectionAudioUrl) return;

    setIsLoading(true);
    setPlayError(null);

    // Load audio metadata
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('✅ Audio can play - readyState:', audio.readyState);
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio load started');
      setIsLoading(true);
    };

    const handleError = (e) => {
      console.error('❌ Audio load error:', e);
      setIsLoading(false);
      setPlayError('Không thể tải audio. Vui lòng kiểm tra kết nối mạng.');
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);

    // ✅ FIX: Set src và load metadata
    audio.src = sectionAudioUrl;
    audio.load(); // Force load metadata

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
    };
  }, [sectionAudioUrl]);

  // ✅ UPDATED: Logic thi thật - chỉ play một lần, không pause/seek
  // ✅ FIX: Mobile-friendly play handler - Đợi audio ready trước khi play
  const handlePlay = async (e) => {
    // ✅ CRITICAL: Prevent default to ensure user gesture is preserved
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!audioRef.current || hasStarted) return;

    const audio = audioRef.current;
    setPlayError(null);

    // ✅ FIX: Đợi audio ready trước khi play (readyState >= 2 = HAVE_CURRENT_DATA)
    // readyState values: 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
    if (audio.readyState < 2) {
      console.warn('⚠️ Audio not fully ready (readyState:', audio.readyState, '), waiting for metadata...');
      setPlayError('Đang tải audio, vui lòng đợi...');
      
      // Đợi metadata load xong
      const waitForReady = () => {
        return new Promise((resolve, reject) => {
          if (audio.readyState >= 2) {
            resolve();
            return;
          }
          
          const timeout = setTimeout(() => {
            audio.removeEventListener('loadedmetadata', onMetadataLoaded);
            audio.removeEventListener('canplay', onCanPlay);
            reject(new Error('Timeout waiting for audio to load'));
          }, 10000); // 10 seconds timeout
          
          const onMetadataLoaded = () => {
            clearTimeout(timeout);
            audio.removeEventListener('loadedmetadata', onMetadataLoaded);
            audio.removeEventListener('canplay', onCanPlay);
            console.log('✅ Audio metadata loaded, readyState:', audio.readyState);
            resolve();
          };
          
          const onCanPlay = () => {
            clearTimeout(timeout);
            audio.removeEventListener('loadedmetadata', onMetadataLoaded);
            audio.removeEventListener('canplay', onCanPlay);
            console.log('✅ Audio can play, readyState:', audio.readyState);
            resolve();
          };
          
          audio.addEventListener('loadedmetadata', onMetadataLoaded, { once: true });
          audio.addEventListener('canplay', onCanPlay, { once: true });
          
          // Trigger load nếu chưa load
          if (audio.readyState === 0) {
            audio.load();
          }
        });
      };
      
      try {
        await waitForReady();
        setPlayError(null);
      } catch (error) {
        console.error('❌ Timeout waiting for audio:', error);
        setPlayError('Không thể tải audio. Vui lòng thử lại hoặc kiểm tra kết nối mạng.');
        return;
      }
    }

    // ✅ CRITICAL: Call play() after audio is ready
    // Note: Even though this is async, the user gesture context is preserved
    const playPromise = audio.play();

    // ✅ Handle promise if returned (modern browsers)
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // ✅ Success - update state
          setHasStarted(true);
          setIsPlaying(true);
          setIsLoading(false);
          
          // ✅ NEW: Notify parent component that audio has started
          if (onAudioStarted) {
            onAudioStarted();
          }
          
          console.log('🎵 Audio started - Exam mode: no pause/seek allowed');
          console.log('📱 Mobile check - User agent:', navigator.userAgent);
        })
        .catch((error) => {
          console.error('❌ Error playing audio:', error);
          setIsLoading(false);
          
          // ✅ Detailed error messages for debugging
          let errorMessage = 'Không thể phát audio. ';
          
          if (error.name === 'NotAllowedError') {
            errorMessage += 'Trình duyệt đã chặn phát audio. Vui lòng bấm lại nút phát.';
          } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Định dạng audio không được hỗ trợ.';
          } else if (error.name === 'AbortError') {
            errorMessage += 'Phát audio bị hủy.';
          } else if (error.message && error.message.includes('play() request was interrupted')) {
            errorMessage += 'Yêu cầu phát bị gián đoạn. Vui lòng thử lại.';
          } else {
            errorMessage += `Lỗi: ${error.message || error.name || 'Unknown error'}`;
          }
          
          setPlayError(errorMessage);
          
          // ✅ For mobile: Try to provide helpful instructions
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            console.warn('📱 Mobile device detected - Audio play failed');
            console.warn('💡 Tip: Make sure audio is triggered by direct user interaction');
            console.warn('💡 Error details:', {
              name: error.name,
              message: error.message,
              readyState: audio.readyState,
              networkState: audio.networkState
            });
          }
        });
    } else {
      // ✅ Legacy browser - play() doesn't return promise
      // Assume success and update state
      setHasStarted(true);
      setIsPlaying(true);
      setIsLoading(false);
      
      if (onAudioStarted) {
        onAudioStarted();
      }
      
      console.log('🎵 Audio started (legacy browser)');
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
      console.log('✅ Audio metadata loaded - Duration:', audioRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    if (audioRef.current) {
      console.log('✅ Audio can play - readyState:', audioRef.current.readyState);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsFinished(true);
    console.log('✅ Audio finished');
  };

  const handlePlayStart = () => {
    setIsPlaying(true);
    setPlayError(null);
    console.log('▶️ Audio playback started');
  };

  const handlePlayPause = () => {
    setIsPlaying(false);
    console.log('⏸️ Audio paused');
  };

  // ❌ REMOVED: handleSeek - không cho phép tua trong thi thật

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ✅ UPDATED: Validate sectionAudioUrl - không render nếu không hợp lệ
  // ✅ DEBUG: Log để kiểm tra
  console.log('🔍 AudioPlayer - sectionAudioUrl:', sectionAudioUrl);
  
  if (!sectionAudioUrl || sectionAudioUrl.trim() === '' || sectionAudioUrl === '/audio/sample.mp3') {
    console.warn('⚠️ AudioPlayer - Invalid audioUrl:', sectionAudioUrl);
    return (
      <div className="bg-yellow-50 rounded-lg shadow-md p-4 mb-6 border border-yellow-200">
        <p className="text-sm text-yellow-700">⚠️ Audio file không có sẵn cho listening part này.</p>
        <p className="text-xs text-yellow-600 mt-1">Audio URL: {sectionAudioUrl || '(empty)'}</p>
      </div>
    );
  }
  
  // ✅ FIX: Kiểm tra nếu là blob URL không hợp lệ (blob URL chỉ tồn tại trong session)
  // Nhưng cho phép data URL (base64) và URL thực tế
  if (sectionAudioUrl.startsWith('blob:') && !sectionAudioUrl.includes('http')) {
    console.warn('⚠️ Invalid blob URL (expired):', sectionAudioUrl);
    return (
      <div className="bg-yellow-50 rounded-lg shadow-md p-4 mb-6 border border-yellow-200">
        <p className="text-sm text-yellow-700">⚠️ Audio file không hợp lệ (blob URL đã hết hạn).</p>
      </div>
    );
  }
  
  // ✅ FIX: Log audio URL type for debugging
  if (sectionAudioUrl.startsWith('data:')) {
    console.log('✅ Using base64 audio data (data URL)');
  } else if (sectionAudioUrl.startsWith('blob:')) {
    console.log('⚠️ Using blob URL (may expire)');
  } else {
    console.log('✅ Using regular audio URL:', sectionAudioUrl);
  }
  
  // ❌ REMOVED: Question markers - audio chạy liên tục, không cần markers

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mb-6">
      <audio
        ref={audioRef}
        src={sectionAudioUrl}
        preload="metadata"
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onPlay={handlePlayStart}
        onPause={handlePlayPause}
        onEnded={handleEnded}
        onError={(e) => {
          console.error('❌ Audio load error:', e);
          const audio = e.target;
          const error = audio.error;
          if (error) {
            let errorMsg = 'Lỗi tải audio: ';
            switch (error.code) {
              case error.MEDIA_ERR_ABORTED:
                errorMsg += 'Tải bị hủy';
                break;
              case error.MEDIA_ERR_NETWORK:
                errorMsg += 'Lỗi mạng';
                break;
              case error.MEDIA_ERR_DECODE:
                errorMsg += 'Lỗi giải mã';
                break;
              case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMsg += 'Định dạng không được hỗ trợ';
                break;
              default:
                errorMsg += `Lỗi ${error.code}`;
            }
            setPlayError(errorMsg);
          }
          setIsPlaying(false);
          setIsLoading(false);
        }}
      />
      
      {/* ✅ NEW: Error message - Show if play failed */}
      {playError && (
        <div className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm border border-red-300 rounded-lg">
          <p className="text-xs text-red-900 font-medium text-center">
            ⚠️ {playError}
          </p>
          <p className="text-xs text-red-700 text-center mt-1">
            Vui lòng thử bấm nút phát lại hoặc làm mới trang.
          </p>
        </div>
      )}

      {/* ✅ NEW: Loading message */}
      {isLoading && !hasStarted && (
        <div className="mb-4 p-3 bg-blue-100/80 backdrop-blur-sm border border-blue-300 rounded-lg">
          <p className="text-xs text-blue-900 font-medium text-center">
            ⏳ Đang tải audio...
          </p>
        </div>
      )}

      {/* ✅ NEW: Warning message - Compact design */}
      {!hasStarted && !playError && !isLoading && (
        <div className="mb-4 p-3 bg-amber-100/80 backdrop-blur-sm border border-amber-300 rounded-lg">
          <p className="text-xs text-amber-900 font-medium text-center">
            {t('jlpt.listeningPage.audioWarning')}
          </p>
        </div>
      )}

      {/* ✅ NEW: Finished message - Compact design */}
      {isFinished && (
        <div className="mb-4 p-3 bg-green-100/80 backdrop-blur-sm border border-green-300 rounded-lg">
          <p className="text-xs text-green-900 font-medium text-center">
            {t('jlpt.listeningPage.audioFinished')}
          </p>
        </div>
      )}
      
      {/* ✅ NEW: Audio Player - Minimalist Card Design */}
      <div className="bg-white border-2 border-gray-300 rounded-2xl p-5 shadow-lg relative overflow-visible">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all relative
              ${hasStarted 
                ? 'bg-gray-200' 
                : 'bg-red-500 shadow-md hover:shadow-lg'
              }
            `}>
              {!hasStarted ? (
                <button
                  onClick={handlePlay}
                  disabled={isLoading}
                  className="w-full h-full flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  title={isLoading ? 'Đang tải audio...' : t('jlpt.listeningPage.audioPlayerPlayButtonTitle')}
                  type="button"
                >
                  {isLoading ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              ) : (
                <div 
                  className="text-gray-600 cursor-not-allowed"
                  onClick={() => {
                    // ✅ NEW: Show alert when clicking pause button
                    alert(t('jlpt.listeningPage.audioPlayerCannotPause'));
                  }}
                  title={t('jlpt.listeningPage.audioPlayerCannotPauseTooltip')}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{t('jlpt.listeningPage.audioPlayerTitle')}</h3>
              <p className="text-xs text-gray-500">
                {!hasStarted 
                  ? t('jlpt.listeningPage.audioPlayerStatusReady')
                  : isPlaying 
                  ? t('jlpt.listeningPage.audioPlayerStatusPlaying')
                  : isFinished 
                  ? t('jlpt.listeningPage.audioPlayerStatusFinished')
                  : t('jlpt.listeningPage.audioPlayerStatusStopped')
                }
              </p>
            </div>
          </div>
          
          {/* Time Display - Compact */}
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-gray-800">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-500">
              / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Progress Bar - Sleek Design */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`
                h-full rounded-full transition-all duration-300 ease-out
                ${hasStarted && isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : hasStarted
                  ? 'bg-gray-400'
                  : 'bg-gray-300'
                }
              `}
              style={{ width: `${progressPercentage}%` }}
            >
              {hasStarted && isPlaying && (
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              )}
            </div>
          </div>
          
          {/* Progress percentage text */}
          {hasStarted && (
            <div className="mt-2 text-center">
              <span className="text-xs font-semibold text-gray-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {hasStarted && isPlaying && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-600 font-medium">{t('jlpt.listeningPage.audioPlayerStatusPlayingText')}</span>
          </div>
        )}
      </div>

      {/* Custom CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
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
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-lg mb-2 text-center">聴解</h3>
        <div className="text-sm text-gray-600 text-center">
          ⏱ {sections.reduce((acc, s) => acc + (s.timeLimit || 0), 0)}分
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
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

        {/* Footer - Fixed */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Đã trả lời:</span>
            <span className="font-bold">
              {Object.keys(answers).length}/{sections.reduce((acc, s) => acc + s.questions.length, 0)}
            </span>
          </div>
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
  const { user } = useAuth();

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

  // ✅ UPDATED: Load exam data từ Supabase → storage → static file
  useEffect(() => {
    const loadExamData = async () => {
      setIsLoading(true);
      try {
        // 1️⃣ Ưu tiên load đề thi từ Supabase
        const { success, data: supabaseExam } = await getExamFromSupabase(levelId, examId);
        let sourceExam = supabaseExam;

        if (!success) {
          console.warn('[ExamListeningPage] Failed to load exam from Supabase, will try local/static.');
        }

        if (!sourceExam) {
          // 2️⃣ Fallback: storage (admin created exams, cached)
          const savedExam = await storageManager.getExam(levelId, examId);
          if (savedExam) {
            console.log('✅ ExamListeningPage: Loaded exam from storage');
            sourceExam = {
              ...savedExam,
              level: savedExam.level || levelId,
              examId: savedExam.examId || examId,
            };
          }
        } else {
          // Đồng bộ Supabase exam về storage để có cache
          try {
            await storageManager.saveExam(levelId, examId, {
              ...sourceExam,
              level: sourceExam.level || levelId,
              examId: sourceExam.id || examId,
            });
          } catch (syncErr) {
            console.warn('[ExamListeningPage] Failed to sync Supabase exam to local storage:', syncErr);
          }
        }

        if (sourceExam) {
          console.log('📦 Full exam data (Supabase/local):', JSON.stringify(sourceExam, null, 2));
          console.log('📊 Exam data structure:', {
            hasListening: !!sourceExam.listening,
            hasSections: !!sourceExam.listening?.sections,
            sectionsCount: sourceExam.listening?.sections?.length || 0,
            totalQuestions:
              sourceExam.listening?.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0,
            listeningType: typeof sourceExam.listening,
            sectionsType: typeof sourceExam.listening?.sections,
            sectionsIsArray: Array.isArray(sourceExam.listening?.sections),
            // ✅ NEW: Log audio fields
            hasAudioUrl: !!sourceExam.listening?.audioUrl,
            audioUrl: sourceExam.listening?.audioUrl || '(empty)',
            audioPath: sourceExam.listening?.audioPath || '(empty)',
            audioName: sourceExam.listening?.audioName || '(empty)'
          });

          // ✅ Đảm bảo exam data có structure đúng (knowledge, reading, listening)
          const normalizedExamData = {
            ...sourceExam,
            knowledge: sourceExam.knowledge || { sections: [] },
            reading: sourceExam.reading || { sections: [] },
            listening: {
              ...(sourceExam.listening || {}),
              sections: sourceExam.listening?.sections || [],
              // ✅ NEW: Preserve audio fields from listening part level
              audioUrl: sourceExam.listening?.audioUrl || '',
              audioPath: sourceExam.listening?.audioPath || '',
              audioName: sourceExam.listening?.audioName || ''
            },
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
          
          // Extract exam metadata
          const examMetadata = {
            id: examId,
            title: normalizedExamData.title || `JLPT ${examId}`,
            date: normalizedExamData.date || examId,
            status: normalizedExamData.status || 'Có sẵn',
            imageUrl: normalizedExamData.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: normalizedExamData.level || levelId,
          };
          
          setCurrentExam(examMetadata);
          
          // ✅ UPDATED: Transform listening data - audio is now at listening part level
          if (normalizedExamData.listening.sections && normalizedExamData.listening.sections.length > 0) {
            // ✅ DEBUG: Log raw data để kiểm tra audioUrl
            console.log('🔍 ExamListeningPage - Raw listening data:', {
              hasAudioUrl: !!normalizedExamData.listening.audioUrl,
              audioUrl: normalizedExamData.listening.audioUrl,
              audioPath: normalizedExamData.listening.audioPath,
              audioName: normalizedExamData.listening.audioName,
              sectionsCount: normalizedExamData.listening.sections.length
            });
            
            const transformedData = {
              // ✅ NEW: Audio is at listening part level (not section level)
              audioUrl: normalizedExamData.listening.audioUrl || '',
              audioPath: normalizedExamData.listening.audioPath || '',
              audioName: normalizedExamData.listening.audioName || '',
              sections: normalizedExamData.listening.sections.map(section => ({
                id: section.id,
                title: section.title,
                instruction: section.instruction || '',
                timeLimit: section.timeLimit || 0,
                // ❌ REMOVED: Audio fields - audio is now at listening part level
                questions: (section.questions || []).map(q => ({
                  number: q.number || String(q.id).padStart(2, '0'),
                  subNumber: q.subNumber || q.id,
                  category: q.category || 'listening',
                  // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation || ''
                }))
              }))
            };
            console.log('🔍 ExamListeningPage - Transformed data:', {
              hasAudioUrl: !!transformedData.audioUrl,
              audioUrl: transformedData.audioUrl,
              sectionsCount: transformedData.sections.length
            });
            setExamData(transformedData);
          } else {
            // Exam tồn tại nhưng chưa có listening sections
            setExamData(null);
          }
        } else {
          // 3️⃣ Fallback: static file (exam cứng trong code)
          console.log('📁 ExamListeningPage: Loading exam from static file...');
          const staticExam = getExamById(levelId, examId);
          const staticData = getListeningQuestions(levelId, examId);

          if (staticExam && staticData) {
            setCurrentExam(staticExam);
            setExamData(staticData);
          } else {
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

  // ✅ NEW: State để track xem audio đã bắt đầu chưa (để prevent navigation khi đang thi)
  const [audioHasStarted, setAudioHasStarted] = useState(false);

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

  // ✅ NEW: Prevent navigation away (close tab/refresh) khi đang thi
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Chỉ prevent khi đang thi (có exam data)
      if (examData && (audioHasStarted || Object.keys(answers).length > 0)) {
        e.preventDefault();
        e.returnValue = 'Bạn đang làm bài thi. Rời trang sẽ mất tiến độ. Bạn có chắc muốn thoát?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examData, audioHasStarted, answers]);

  // ✅ Early returns - PHẢI đặt SAU tất cả hooks
  if (isLoading) {
    return (
      <LoadingSpinner
        label={t('jlpt.listeningPage.loading') || 'Đang tải đề thi...'}
        icon="🎧"
      />
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
  
  // ✅ DEBUG: Log audioUrl khi render
  console.log('🔍 ExamListeningPage - Current state:', {
    hasExamData: !!examData,
    hasSections: !!examData?.sections,
    sectionsCount: sections.length,
    totalQuestions: allQuestions.length,
    // ✅ NEW: Log audioUrl
    hasAudioUrl: !!examData?.audioUrl,
    audioUrl: examData?.audioUrl || '(empty)',
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
  // ✅ NEW: Get current section to access audio URL
  const currentSection = currentQuestion ? sections.find(s => s.id === currentQuestion.sectionId) : null;
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
      const userAnswer = answers[key];
      const correctAnswer = q.correctAnswer;
      // ✅ FIX: Normalize về cùng type để so sánh (string hoặc number)
      const normalizedUserAnswer = userAnswer !== undefined ? Number(userAnswer) : undefined;
      const normalizedCorrectAnswer = Number(correctAnswer);
      const isCorrect = normalizedUserAnswer !== undefined && normalizedUserAnswer === normalizedCorrectAnswer;
      
      if (isCorrect) {
        correctCount++;
      }

      // NEW: Breakdown for listening (all questions are 'listening' category)
      listeningTotal++;
      if (isCorrect) listeningCorrect++;
    });

    // ✅ DEBUG: Log breakdown để kiểm tra
    console.log('[ExamListening] Breakdown calculated:', {
      listeningCorrect,
      listeningTotal,
      totalQuestions: allQuestions.length,
      answersCount: Object.keys(answers).length
    });

    const score = Math.round((correctCount / allQuestions.length) * 100);

    // ✅ FIX: Đảm bảo breakdown được lưu đúng format
    const breakdown = {
      listening: listeningCorrect,
      total: listeningTotal
    };
    
    console.log('[ExamListening] Saving breakdown to localStorage:', breakdown);
    localStorage.setItem(`exam-${levelId}-${examId}-listening-breakdown`, JSON.stringify(breakdown));

    localStorage.setItem(`exam-${levelId}-${examId}-listening-score`, score);
    localStorage.setItem(`exam-${levelId}-${examId}-listening-completed`, 'true');

    // ✅ NEW: Lưu progress vào Supabase nếu user đã đăng nhập
    if (user && typeof user.id === 'string') {
      saveLearningProgress({
        userId: user.id,
        type: 'exam_attempt',
        levelId: levelId,
        examId: examId,
        status: 'completed',
        score: listeningCorrect,
        total: listeningTotal,
        attempts: 1,
        metadata: {
          listeningCorrect,
          listeningTotal,
          scorePercentage: score
        }
      }).catch(err => {
        console.error('[ExamListening] Error saving progress to Supabase:', err);
      });
    }

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
          {/* ✅ FIX: Container câu hỏi - Fixed height giống sidebar (giống admin panel) */}
          <div className="w-full md:flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
            <div className="p-4 sm:p-6 border-b border-gray-300 flex-shrink-0">
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

            {/* ✅ FIX: Scrollable content với fixed height */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                {/* ✅ DEBUG: Log audioUrl trước khi render AudioPlayer */}
                {(() => {
                  console.log('🔍 ExamListeningPage - Rendering AudioPlayer with audioUrl:', examData?.audioUrl || '(empty)');
                  return null;
                })()}
                <AudioPlayer 
                  sectionAudioUrl={examData?.audioUrl || ''}
                  currentQuestion={currentQuestion}
                  allQuestions={allQuestions}
                  onAudioStarted={() => setAudioHasStarted(true)}
                  t={t}
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

          {/* ✅ FIX: Sidebar - Fixed height giống container câu hỏi (giống admin panel) */}
          <div className="w-full md:w-72 md:sticky md:top-4 mt-4 md:mt-0 flex-shrink-0">
            <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex flex-col">
              <NavigationPanel
                sections={sections}
                currentQuestion={currentQuestionKey}
                answers={answers}
                onQuestionSelect={setCurrentQuestionKey}
              />
            </div>
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
              overflowY: 'auto',
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
                overscrollBehavior: 'contain',
              }}
              onWheel={(e) => {
                // ✅ Allow scroll inside modal content
                // Only prevent body scroll when at boundaries
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;
                const isAtTop = scrollTop <= 1;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                // If at top and scrolling up, or at bottom and scrolling down, prevent body scroll
                if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                  e.stopPropagation();
                }
                // Otherwise, allow normal scroll in modal
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
              overflowY: 'auto',
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
                overscrollBehavior: 'contain',
              }}
              onWheel={(e) => {
                // ✅ Allow scroll inside modal content
                // Only prevent body scroll when at boundaries
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;
                const isAtTop = scrollTop <= 1;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                // If at top and scrolling up, or at bottom and scrolling down, prevent body scroll
                if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                  e.stopPropagation();
                }
                // Otherwise, allow normal scroll in modal
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