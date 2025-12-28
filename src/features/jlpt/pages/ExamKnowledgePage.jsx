// src/features/jlpt/pages/ExamKnowledgePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useExamGuard } from '../../../hooks/useExamGuard.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getExamQuestions } from '../../../data/jlpt/examQuestionsData.js';
import storageManager from '../../../utils/localStorageManager.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { saveLearningProgress } from '../../../services/learningProgressService.js';
import { getExam as getExamFromSupabase } from '../../../services/examService.js';
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
      <div 
        className="text-lg font-semibold mb-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: question.question }}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
        }}
      />
      
      {question.passage && (
        <div 
          className="bg-gray-50 p-4 rounded mb-4 text-base leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: question.passage }}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
          }}
        />
      )}
      
      {question.text && (
        <div className="mb-6 text-lg prose prose-sm max-w-none">
          {question.underline ? (
            <span>
              {question.text.split(question.underline)[0]}
              <span className="underline decoration-2 decoration-gray-600 font-bold">
                {question.underline}
              </span>
              {question.text.split(question.underline)[1]}
            </span>
          ) : (
            <span 
              dangerouslySetInnerHTML={{ __html: question.text }}
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
              }}
            />
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
const NavigationPanel = ({ sections, currentQuestion, answers, onQuestionSelect, t, totalTime, knowledgeSections, readingSections, allQuestions }) => {
  // ✅ FIX: Dùng composite key (sectionId + testType) để phân biệt sections trùng ID
  const getSectionKey = (section, testType) => `${testType}:${section.id}`;
  
  const [expandedSections, setExpandedSections] = useState(() => {
    // Auto-expand section chứa câu hỏi hiện tại khi mount lần đầu
    // ✅ FIX: Tìm section dựa trên vị trí của câu hỏi trong allQuestions
    // để xác định nó thuộc knowledge hay reading (tránh duplicate IDs)
    const questionIndex = allQuestions?.findIndex(q => String(q.id) === String(currentQuestion)) ?? -1;
    const knowledgeQuestionsCount = knowledgeSections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0;
    
    let currentSection = null;
    let sectionTestType = null;
    if (questionIndex >= 0 && questionIndex < knowledgeQuestionsCount) {
      // Câu hỏi thuộc phần knowledge
      currentSection = knowledgeSections?.find(s => 
        s.questions?.some(q => String(q.id) === String(currentQuestion))
      );
      sectionTestType = 'knowledge';
    } else {
      // Câu hỏi thuộc phần reading
      currentSection = readingSections?.find(s => 
        s.questions?.some(q => String(q.id) === String(currentQuestion))
      );
      sectionTestType = 'reading';
    }
    
    return currentSection && sectionTestType ? new Set([getSectionKey(currentSection, sectionTestType)]) : new Set();
  });

  const prevQuestionRef = useRef(currentQuestion);
  const isUserTogglingRef = useRef(false);
  const sectionsRef = useRef(sections);
  const knowledgeSectionsRef = useRef(knowledgeSections);
  const readingSectionsRef = useRef(readingSections);
  const allQuestionsRef = useRef(allQuestions);

  // Cập nhật refs khi data thay đổi (nhưng không trigger useEffect)
  useEffect(() => {
    sectionsRef.current = sections;
    knowledgeSectionsRef.current = knowledgeSections;
    readingSectionsRef.current = readingSections;
    allQuestionsRef.current = allQuestions;
  }, [sections, knowledgeSections, readingSections, allQuestions]);

  // Auto-expand section chứa câu hỏi hiện tại CHỈ KHI câu hỏi thực sự thay đổi
  // VÀ không phải khi user đang toggle section
  useEffect(() => {
    // Bỏ qua auto-expand nếu user đang toggle section
    if (isUserTogglingRef.current) {
      isUserTogglingRef.current = false;
      prevQuestionRef.current = currentQuestion;
      return;
    }

    // Chỉ auto-expand nếu câu hỏi thực sự thay đổi (không phải cùng một câu)
    if (prevQuestionRef.current !== currentQuestion) {
      // ✅ FIX: Tìm section dựa trên vị trí của câu hỏi trong allQuestions
      // để xác định nó thuộc knowledge hay reading (tránh duplicate IDs)
      const questionIndex = allQuestionsRef.current?.findIndex(q => String(q.id) === String(currentQuestion)) ?? -1;
      const knowledgeQuestionsCount = knowledgeSectionsRef.current?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0;
      
      let currentSection = null;
      let sectionTestType = null;
      if (questionIndex >= 0 && questionIndex < knowledgeQuestionsCount) {
        // Câu hỏi thuộc phần knowledge - tìm trong knowledge sections
        currentSection = knowledgeSectionsRef.current?.find(s => 
          s.questions?.some(q => String(q.id) === String(currentQuestion))
        );
        sectionTestType = 'knowledge';
      } else if (questionIndex >= knowledgeQuestionsCount) {
        // Câu hỏi thuộc phần reading - tìm trong reading sections
        currentSection = readingSectionsRef.current?.find(s => 
          s.questions?.some(q => String(q.id) === String(currentQuestion))
        );
        sectionTestType = 'reading';
      }
      
      if (currentSection && currentSection.id && sectionTestType) {
        const sectionKey = getSectionKey(currentSection, sectionTestType);
        setExpandedSections(prev => {
          // Chỉ thêm section này, không thêm các sections khác có cùng section ID
          if (!prev.has(sectionKey)) {
            return new Set([...prev, sectionKey]);
          }
          return prev;
        });
      }
      prevQuestionRef.current = currentQuestion;
    }
  }, [currentQuestion]); // ✅ FIX: Chỉ depend on currentQuestion, không depend on sections

  const toggleSection = (sectionKey, event) => {
    // ✅ FIX: Ngăn chặn mọi side effect khi toggle section
    event?.stopPropagation();
    event?.preventDefault();
    
    // Đánh dấu rằng user đang toggle section (không phải chọn câu hỏi mới)
    isUserTogglingRef.current = true;
    
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
    
    // ✅ FIX: Reset flag sau một khoảng thời gian ngắn để đảm bảo useEffect không chạy
    setTimeout(() => {
      isUserTogglingRef.current = false;
    }, 100);
  };

  const isExpanded = (section, testType) => {
    const sectionKey = getSectionKey(section, testType);
    return expandedSections.has(sectionKey);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-lg mb-2 text-center">{t('jlpt.knowledgePage.navigationTitle')}</h3>
        <div className="text-sm text-gray-600 text-center">
          {t('jlpt.knowledgePage.totalTime', { minutes: totalTime })}
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {(() => {
          // ✅ FIX: Loại bỏ duplicate sections - ưu tiên knowledge nếu trùng ID
          const seenSectionIds = new Set();
          const uniqueSections = [];
          
          // Thêm knowledge sections trước
          knowledgeSections?.forEach(section => {
            if (!seenSectionIds.has(section.id)) {
              seenSectionIds.add(section.id);
              uniqueSections.push({ ...section, _testType: 'knowledge' });
            }
          });
          
          // Thêm reading sections sau (bỏ qua nếu đã có trong knowledge)
          readingSections?.forEach(section => {
            if (!seenSectionIds.has(section.id)) {
              seenSectionIds.add(section.id);
              uniqueSections.push({ ...section, _testType: 'reading' });
            }
          });
          
          return uniqueSections;
        })().map((section) => {
          const sectionId = section.id;
          // ✅ FIX: Dùng _testType đã được gán khi filter
          const sectionTestType = section._testType || (knowledgeSections?.some(s => s.id === sectionId) 
            ? 'knowledge' 
            : readingSections?.some(s => s.id === sectionId) 
              ? 'reading' 
              : 'unknown');
          const expanded = isExpanded(section, sectionTestType);
          const sectionKey = getSectionKey(section, sectionTestType);
          
          return (
            <div key={sectionKey} className="mb-4">
              {/* Section header - clickable để expand/collapse */}
              <button
                onClick={(e) => toggleSection(sectionKey, e)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors mb-2"
              >
                {section.title && (
                  <h4 className="font-semibold text-sm text-gray-700 text-left flex-1">
                    {section.title}
                  </h4>
                )}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Section content - collapsible */}
              {expanded && (
                <div className="ml-2">
                  {/* Instruction - chỉ hiển thị khi expand, có thể ẩn nếu quá dài */}
                  {section.instruction && (
                    <div 
                      className="text-xs text-gray-600 mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: section.instruction }}
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                      title={section.instruction.replace(/<[^>]*>/g, '')}
                    />
                  )}
                  
                  {/* Question buttons grid */}
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-1.5">
                    {section.questions.map((q) => {
                      const questionKey = String(q.id);
                      const isAnswered = answers[questionKey] !== undefined;
                      const isCurrent = currentQuestion === questionKey;
                      
                      return (
                        <button
                          key={questionKey}
                          onClick={() => onQuestionSelect(questionKey)}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded border-2 font-semibold text-xs sm:text-sm transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-500 text-white shadow-md scale-105'
                              : isAnswered
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {q.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer - Fixed */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{t('jlpt.knowledgePage.answeredLabel')}</span>
          <span className="font-bold text-base">
            {Object.keys(answers).length}/{sections.flatMap(s => s.questions).length}
          </span>
        </div>
      </div>
    </div>
  );
};

function ExamKnowledgePage() {
  const { levelId, examId } = useParams();
  const { navigate, WarningModal, clearExamData } = useExamGuard();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [currentExam, setCurrentExam] = useState(null);
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState('1');
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false); // ✅ Modal cảnh báo thiếu câu
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [levelConfig, setLevelConfig] = useState(null); // ✅ NEW: Store levelConfig for time limit
  
  // ✅ REMOVED: Don't lock body scroll - allow scrolling in modal and outside modal
  // useBodyScrollLock(showSubmitModal || showIncompleteWarning);

  // ✅ Load exam metadata + questions (Supabase → storage → static)
  useEffect(() => {
    let isMounted = true;

    // ✅ FIX: Clean HTML artifacts from section title and instruction
    const cleanHTML = (html) => {
      if (!html || typeof html !== 'string') return html || '';
      // Remove HTML comment tags (StartFragment, EndFragment, etc.)
      return html
        .replace(/<!--\s*StartFragment\s*-->/gi, '')
        .replace(/<!--\s*EndFragment\s*-->/gi, '')
        .replace(/<!--[^>]*-->/g, '') // Remove all HTML comments
        .trim();
    };
    
    // ✅ FIX: Normalize section title and instruction
    const normalizeSection = (section) => {
      // Clean HTML artifacts from title and instruction
      let cleanTitle = cleanHTML(section.title || '');
      let cleanInstruction = cleanHTML(section.instruction || '');
      
      // If instruction contains both title and instruction (combined format)
      if (cleanInstruction && !cleanTitle && cleanInstruction.includes('\n\n')) {
        const lines = cleanInstruction.split('\n');
        const firstLine = lines[0]?.trim() || '';
        const rest = lines.slice(1).join('\n').trim();
        if (firstLine && rest) {
          return {
            ...section,
            title: firstLine,
            instruction: rest,
            passageImages: section.passageImages, // ✅ NEW: Preserve passageImages array
            passageImage: section.passageImage // ✅ Backward compatibility: preserve old format
          };
        }
      }
      // If title contains instruction (backward compatibility)
      if (cleanTitle && !cleanInstruction && cleanTitle.includes('\n\n')) {
        const lines = cleanTitle.split('\n');
        const firstLine = lines[0]?.trim() || '';
        const rest = lines.slice(1).join('\n').trim();
        if (firstLine && rest) {
          return {
            ...section,
            title: firstLine,
            instruction: rest,
            passageImages: section.passageImages, // ✅ NEW: Preserve passageImages array
            passageImage: section.passageImage // ✅ Backward compatibility: preserve old format
          };
        }
      }
      // Return with cleaned values
      return {
        ...section,
        title: cleanTitle || section.title,
        instruction: cleanInstruction || section.instruction,
        passageImages: section.passageImages, // ✅ NEW: Preserve passageImages array
        passageImage: section.passageImage // ✅ Backward compatibility: preserve old format
      };
    };
    
    const normalizeExamData = (data) => {
      if (!data) return null;
      
      // Normalize sections
      const normalizeSections = (sections) => {
        if (!Array.isArray(sections)) return [];
        return sections.map(normalizeSection);
      };
      
      return {
        knowledge: {
          sections: normalizeSections(data.knowledge?.sections || [])
        },
        reading: {
          sections: normalizeSections(data.reading?.sections || [])
        }
      };
    };

    const loadExamData = async () => {
      setIsLoading(true);
      try {
        // ✅ NEW: Load levelConfig để lấy timeLimit
        const config = await storageManager.getLevelConfig(levelId);
        if (config) {
          setLevelConfig(config);
        }
        
        // 1️⃣ Ưu tiên load đề thi từ Supabase
        const { success, data: supabaseExam } = await getExamFromSupabase(levelId, examId);
        let sourceExam = supabaseExam;

        if (!success) {
          console.warn('[ExamKnowledgePage] Failed to load exam from Supabase, will try local/static.');
        }

        if (!sourceExam) {
          // 2️⃣ Fallback: storage (exam do admin tạo, cache)
          const savedExam = await storageManager.getExam(levelId, examId);
          if (savedExam) {
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
            console.warn('[ExamKnowledgePage] Failed to sync Supabase exam to local storage:', syncErr);
          }
        }

        if (!isMounted) return;

        if (sourceExam) {
          const examMetadata = {
            id: examId,
            title: sourceExam.title || `JLPT ${examId}`,
            date: sourceExam.date || examId,
            status: sourceExam.status || 'Có sẵn',
            imageUrl: sourceExam.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: sourceExam.level || levelId,
          };
          setCurrentExam(examMetadata);
          setExamData(normalizeExamData(sourceExam));
        } else {
          // 3️⃣ Cuối cùng: static file
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
  // ✅ Tổng thời gian bài Ngôn ngữ (Chữ + Từ vựng + Ngữ pháp + Đọc hiểu)
  // chỉ dựa trên phần "knowledge" theo levelConfig (reading không có thời gian riêng)
  const sections = [...knowledgeSections, ...readingSections];
  const allQuestions = sections.flatMap(s => s.questions || []);
  const normalizedCurrentId = String(currentQuestionId);
  const currentQuestion = allQuestions.find(q => String(q.id) === normalizedCurrentId);
  const currentIndex = allQuestions.findIndex(q => String(q.id) === normalizedCurrentId);
  // ✅ FIX: Lấy tổng thời gian từ levelConfig (không cộng dồn từ sections)
  // Knowledge + Reading = 110 phút (từ levelConfig.knowledge.timeLimit)
  // Không cộng dồn timeLimit từ sections vì sẽ bị nhân đôi (110 + 110 = 220)
  const totalTime = levelConfig?.knowledge?.timeLimit || 110; // Default 110 phút nếu không có config

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
    
    // ✅ NEW: Lưu progress vào Supabase nếu user đã đăng nhập
    if (user && typeof user.id === 'string') {
      saveLearningProgress({
        userId: user.id,
        type: 'exam_attempt',
        levelId: levelId,
        examId: examId,
        status: 'completed',
        score: totalCorrect,
        total: totalQuestions,
        attempts: 1,
        metadata: {
          knowledgeCorrect,
          knowledgeTotal,
          readingCorrect,
          readingTotal,
          scorePercentage: score
        }
      }).catch(err => {
        console.error('[ExamKnowledge] Error saving progress to Supabase:', err);
      });
    }
    
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
      <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          {/* ✅ FIX: Container câu hỏi - Fixed height giống sidebar (giống admin panel) */}
          <div className="w-full md:flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-300 flex-shrink-0">
              <Breadcrumbs paths={breadcrumbPaths} />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mt-3 md:mt-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">{currentExam.title}</h1>
                <CountdownTimer initialTime={totalTime} onTimeUp={handleTimeUp} />
              </div>
            </div>

            {/* ✅ FIX: Scrollable content với fixed height */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
              <div className="max-w-4xl mx-auto w-full">
                {/* ✅ NEW: Display passage images if section has any */}
                {(() => {
                  // Find the section that contains the current question
                  const currentSection = sections.find(section => 
                    section.questions?.some(q => String(q.id) === normalizedCurrentId)
                  );
                  
                  if (!currentSection) return null;
                  
                  // ✅ NEW: Support both passageImages (array) and passageImage (single) for backward compatibility
                  let imagesToDisplay = [];
                  
                  if (currentSection.passageImages && Array.isArray(currentSection.passageImages) && currentSection.passageImages.length > 0) {
                    // New format: array of images
                    imagesToDisplay = currentSection.passageImages
                      .filter(img => img.url)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                  } else if (currentSection.passageImage?.url) {
                    // Old format: single image, convert to array for display
                    imagesToDisplay = [currentSection.passageImage];
                  }
                  
                  if (imagesToDisplay.length === 0) return null;
                  
                  return (
                    <div className="mb-6 space-y-4">
                      {imagesToDisplay.map((image, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-lg p-4">
                          <img
                            src={image.url}
                            alt={`Reading passage ${idx + 1}`}
                            className="w-full max-w-full h-auto object-contain rounded-lg mx-auto"
                            style={{ maxHeight: '600px' }}
                            loading={idx === 0 ? 'eager' : 'lazy'} // Preload first image
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
                
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

          <div className="w-full md:w-72 md:sticky md:top-4 mt-4 md:mt-0 flex-shrink-0">
            <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex flex-col">
              <NavigationPanel
                sections={sections}
                currentQuestion={normalizedCurrentId}
                answers={answers}
                onQuestionSelect={setCurrentQuestionId}
                t={t}
                totalTime={totalTime}
                knowledgeSections={knowledgeSections}
                readingSections={readingSections}
                allQuestions={allQuestions}
              />
            </div>
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