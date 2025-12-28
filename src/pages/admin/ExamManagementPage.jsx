// src/pages/admin/ExamManagementPage.jsx
// Module quản lý đề thi JLPT - Cấu hình và nhập đề thi

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import Modal from '../../components/Modal.jsx';
import MonthPicker from '../../components/admin/MonthPicker.jsx';
import storageManager from '../../utils/localStorageManager.js';
import { jlptExams } from '../../data/jlpt/jlptData.js';
import {
  saveExam as saveExamToSupabase,
  deleteExam as deleteExamFromSupabase,
  getExam as getExamFromSupabase,
  getExamsByLevel as getExamsFromSupabase,
} from '../../services/examService.js';
import {
  saveExamLevelConfigToSupabase,
  getExamLevelConfigFromSupabase,
} from '../../services/appSettingsService.js';
// 🔒 SECURITY: Import error handler
import { getErrorMessage } from '../../utils/uiErrorHandler.js';
// ✅ NEW: Import shared rich text editor utilities
import {
  processPastedHTML,
  insertTextAtCursor as insertTextAtCursorUtil,
  autoResizeTextarea,
  checkDuplicateQuestion,
  normalizeOptions,
  extractQuestionsFromJSON,
  normalizeImportedQuestion
} from '../../utils/richTextEditorUtils.js';
// ✅ NEW: ContentEditable component for rich text editing
import ContentEditable from '../../components/ContentEditable.jsx';

const TEST_TYPE_ORDER = ['knowledge', 'reading', 'listening'];

const getNumericIdFromQuestion = (question) => {
  if (!question) return 0;
  const raw = question.id ?? question.number ?? question.subNumber;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeExamDataStructure = (data) => {
  if (!data) {
    return { data: data, nextId: 0 };
  }

  const normalized = { ...data };
  let totalQuestions = 0;
  let nextId = 1; // ✅ FIX: Knowledge và Reading đếm liên tục, Listening reset về 1

  TEST_TYPE_ORDER.forEach((type) => {
    // ✅ FIX: Listening là phần thi riêng → reset nextId về 1
    if (type === 'listening') {
      nextId = 1;
    }
    
    const typeData = normalized[type] || { sections: [] };
    const normalizedSections = (typeData.sections || []).map((section) => {
      const normalizedSection = { ...section };
      const sortedQuestions = [...(section.questions || [])].sort(
        (a, b) => getNumericIdFromQuestion(a) - getNumericIdFromQuestion(b)
      );

      normalizedSection.questions = sortedQuestions.map((question) => {
        const normalizedQuestion = { ...question };
        normalizedQuestion.id = String(nextId);
        if (type === 'listening') {
          normalizedQuestion.number = String(nextId).padStart(2, '0');
          normalizedQuestion.subNumber = String(nextId);
        }
        nextId += 1;
        totalQuestions += 1; // Đếm tổng số câu hỏi
        return normalizedQuestion;
      });

      return normalizedSection;
    });

    normalized[type] = { ...typeData, sections: normalizedSections };
  });

  normalized.totalQuestions = totalQuestions;
  return { data: normalized, nextId: totalQuestions };
};

// ✅ UPDATED: Question templates - question field contains ONLY actual question content (NOT section instruction)
// Section instruction should be set in Section Form, not in each question
const QUESTION_TEMPLATES = {
  knowledge: {
    id: '1',
    category: 'knowledge',
    question: '1余暇の楽しみ方は色々ある。',
    options: ['1 ようか', '2 よか', '3 よが', '4 ようが'],
    correctAnswer: 1,
    explanation: '余暇 (よか) : Thời gian rảnh rỗi, lúc rảnh rỗi.'
  },
  reading: {
    id: '10',
    category: 'reading',
    question: '（文章の内容がここに入ります）',
    options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
    correctAnswer: 1,
    explanation: '本文のどの部分が根拠になるかを説明します。'
  },
  listening: {
    id: '30',
    category: 'listening',
    question: '',
    options: ['1 選択肢1', '2 選択肢2', '3 選択肢3', '4 選択肢4'],
    correctAnswer: 1,
    explanation: '[Giải thích đáp án đúng]'
  }
};

// Helper function will be defined inside component to use t()

function ExamManagementPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const isEditor = user && user.role === 'editor';
  
  // Helper function to get test type label
  const getTestTypeLabel = (type) => {
    return t(`examManagement.questions.testTypes.${type}`);
  };
  
  // Helper function to get test type block message
  const getTestTypeBlockMessage = (type) => {
    if (type === 'reading') {
      return t('examManagement.questions.warning');
    }
    if (type === 'listening') {
      return t('examManagement.questions.warning');
    }
    return t('examManagement.questions.warning');
  };
  
  const [selectedLevel, setSelectedLevel] = useState('n1');
  // ✅ Editor không có quyền config, mặc định vào tab 'exams'
  const [activeSubTab, setActiveSubTab] = useState(isEditor ? 'exams' : 'config'); // 'config' | 'exams' | 'questions'
  
  // ✅ Config states - Cấu hình điểm và thời gian
  const [levelConfig, setLevelConfig] = useState({
    passingScore: 100,      // Điểm chuẩn (điểm đậu)
    maxScore: 180,          // Điểm tối đa
    knowledge: {
      minScore: 19,         // Điểm chết (điểm tối thiểu)
      maxScore: 60,        // Điểm tối đa
      timeLimit: 110        // Thời gian (phút)
    },
    reading: {
      minScore: 19,         // Điểm chết
      maxScore: 60,        // Điểm tối đa
      timeLimit: null      // Đọc hiểu không có thời gian riêng (nằm trong knowledge)
    },
    listening: {
      minScore: 19,         // Điểm chết
      maxScore: 60,        // Điểm tối đa
      timeLimit: 60         // Thời gian (phút)
    }
  });

  // ✅ Exams management states
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    date: '',
    status: t('examManagement.exams.status.available'),
    imageUrl: ''
  });

  // ✅ Questions management states
  const [selectedTestType, setSelectedTestType] = useState('knowledge'); // 'knowledge' | 'reading' | 'listening'
  const [examData, setExamData] = useState(null); // Full exam data with questions
  const [sections, setSections] = useState([]); // Current sections for selected test type
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    id: '',
    category: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
    // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
  });
  const [autoGeneratedId, setAutoGeneratedId] = useState(null);
  const [isFinalizingExam, setIsFinalizingExam] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false); // ✅ Track audio upload progress (for listening part audio)
  // ✅ NEW: Listening part audio state (for entire listening part, not per section)
  const [listeningPartAudio, setListeningPartAudio] = useState({
    audioUrl: '',
    audioPath: '',
    audioName: '',
    audioFile: null
  });
  
  // ✅ NEW: Image upload and textarea enhancement states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingImageField, setUploadingImageField] = useState(''); // 'question', 'explanation', 'instruction'
  const imageInputRefs = React.useRef({});
  const questionTextareaRef = React.useRef(null);
  const explanationTextareaRef = React.useRef(null);
  const instructionTextareaRef = React.useRef(null);
  const [showQuestionPreview, setShowQuestionPreview] = useState({}); // For question and explanation preview
  
  // ✅ NEW: Duplicate detection state
  const [isDuplicateQuestionText, setIsDuplicateQuestionText] = useState(false);
  
  // ✅ Quiz Editor style states - Preview & Export
  const [showPreview, setShowPreview] = useState(false);
  const [exportedJSON, setExportedJSON] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);
  
  // ✅ NEW: Imported questions state (for displaying multiple questions like Quiz Editor)
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [isImportMode, setIsImportMode] = useState(false); // Flag to show import mode UI
  const [sectionForm, setSectionForm] = useState({
    id: '',
    title: '',
    instruction: '',
    timeLimit: null,
    passageImages: [] // ✅ NEW: Array of images with order
    // ❌ REMOVED: Audio fields - audio is now at listening part level, not section level
  });
  const jsonUploadInputRef = useRef(null);
  
  // ✅ NEW: Ref và state cho container contents để tính toán vị trí và kích thước modal
  const containerContentsRef = useRef(null);
  const [containerBounds, setContainerBounds] = useState({ width: 1100, top: 0, left: 0, height: 0 });
  
  // ✅ NEW: Preview modal enhancements
  const [previewSortBy, setPreviewSortBy] = useState('id'); // 'id', 'status'
  const [previewFilter, setPreviewFilter] = useState('all'); // 'all', 'complete', 'incomplete'
  const previewContentRef = useRef(null); // For keyboard navigation

  // ✅ NEW: Check for duplicate question text
  useEffect(() => {
    if (!questionForm.question || !selectedSection || editingQuestion) {
      setIsDuplicateQuestionText(false);
      return;
    }
    
    const existingQuestions = selectedSection.questions || [];
    const isDuplicate = checkDuplicateQuestion(
      questionForm.question,
      existingQuestions,
      -1 // Not editing, so check all
    );
    setIsDuplicateQuestionText(isDuplicate);
  }, [questionForm.question, selectedSection, editingQuestion]);

  // ✅ NEW: Handle ESC key to close preview modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };
    
    if (showPreview) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showPreview]);

  // ✅ NEW: Tính toán vị trí và kích thước container contents khi mở preview
  useEffect(() => {
    if (showPreview && containerContentsRef.current) {
      const updateBounds = () => {
        if (containerContentsRef.current) {
          const rect = containerContentsRef.current.getBoundingClientRect();
          setContainerBounds({
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
          });
        }
      };

      // Tính toán ngay lập tức
      updateBounds();

      // ✅ ResizeObserver để theo dõi container thay đổi kích thước
      const resizeObserver = new ResizeObserver(() => {
        updateBounds();
      });
      resizeObserver.observe(containerContentsRef.current);

      // Tính toán lại khi window resize hoặc scroll
      window.addEventListener('resize', updateBounds);
      window.addEventListener('scroll', updateBounds, true);

      // ✅ Throttle để tránh update quá nhiều
      let rafId = null;
      const throttledUpdate = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          updateBounds();
          rafId = null;
        });
      };

      // ✅ MutationObserver để theo dõi thay đổi DOM của container
      const mutationObserver = new MutationObserver(throttledUpdate);
      if (containerContentsRef.current) {
        mutationObserver.observe(containerContentsRef.current, {
          attributes: true,
          attributeFilter: ['style', 'class'],
          childList: false,
          subtree: false
        });
      }

      // ✅ Interval check để đảm bảo luôn cập nhật (fallback)
      let lastWidth = 0;
      let lastHeight = 0;
      const intervalId = setInterval(() => {
        if (containerContentsRef.current) {
          const rect = containerContentsRef.current.getBoundingClientRect();
          const currentWidth = rect.width;
          const currentHeight = rect.height;
          // Chỉ update nếu kích thước thay đổi đáng kể (> 1px)
          if (Math.abs(currentWidth - lastWidth) > 1 || 
              Math.abs(currentHeight - lastHeight) > 1) {
            lastWidth = currentWidth;
            lastHeight = currentHeight;
            updateBounds();
          }
        }
      }, 100); // Check mỗi 100ms

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        clearInterval(intervalId);
        window.removeEventListener('resize', updateBounds);
        window.removeEventListener('scroll', updateBounds, true);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [showPreview]);

  useEffect(() => {
    if (sections.length === 0) {
      setSelectedSection(null);
      return;
    }
    setSelectedSection((prev) => {
      if (!prev) return sections[0];
      const matched = sections.find((section) => section.id === prev.id);
      return matched || sections[0];
    });
  }, [sections]);

  // Load exams when level changes
  useEffect(() => {
    loadExams();
    loadLevelConfig();
  }, [selectedLevel]);

  // ✅ FIX: Helper function để extract năm từ exam ID hoặc date
  const extractYear = (exam) => {
    // Thử extract từ ID (format: YYYY-MM hoặc YYYY-MM-DD)
    const idMatch = exam.id?.match(/^(\d{4})/);
    if (idMatch) return parseInt(idMatch[1]);
    
    // Thử extract từ date (format: YYYY/MM hoặc YYYY-MM)
    const dateMatch = exam.date?.match(/^(\d{4})/);
    if (dateMatch) return parseInt(dateMatch[1]);
    
    // Fallback: return 0 để đẩy xuống cuối
    return 0;
  };

  // ✅ FIX: Sort exams theo năm mới nhất trước
  const sortExamsByYear = (examsList) => {
    return [...examsList].sort((a, b) => {
      const yearA = extractYear(a);
      const yearB = extractYear(b);
      
      // Nếu cùng năm, sort theo ID (mới nhất trước)
      if (yearA === yearB) {
        return b.id.localeCompare(a.id);
      }
      
      // Năm mới nhất trước
      return yearB - yearA;
    });
  };

  const loadExams = async () => {
    // 1️⃣ Ưu tiên lấy từ local cache (IndexedDB/localStorage)
    const savedExams = await storageManager.getExams(selectedLevel);
    if (savedExams && savedExams.length > 0) {
      setExams(sortExamsByYear(savedExams));
      return;
    }

    // 2️⃣ Nếu local trống, thử lấy từ Supabase (nguồn chung cho toàn hệ thống)
    try {
      const { success, data } = await getExamsFromSupabase(selectedLevel);
      if (success && Array.isArray(data) && data.length > 0) {
        const sorted = sortExamsByYear(data);
        setExams(sorted);

        // Sync về local để admin làm việc offline nhanh hơn
        try {
          await storageManager.saveExams(selectedLevel, sorted);
        } catch (syncErr) {
          console.warn('[ExamManagementPage] Failed to sync Supabase exams to local storage:', syncErr);
        }
        return;
      }
    } catch (error) {
      console.error('[ExamManagementPage] Error loading exams from Supabase:', error);
    }

    // 3️⃣ Fallback cuối cùng: dữ liệu tĩnh (nếu còn)
    const defaultExams = jlptExams[selectedLevel] || [];
    setExams(sortExamsByYear(defaultExams));
  };

  const loadLevelConfig = async () => {
    // ✅ NEW: Try Supabase first (source of truth)
    if (user && (isAdmin || isEditor)) {
      try {
        const { success, config, error } = await getExamLevelConfigFromSupabase(selectedLevel);
        if (success && config) {
          console.log('[ExamManagement] ✅ Loaded level config from Supabase');
          setLevelConfig(config);
          // Cache to local storage for offline access
          await storageManager.saveLevelConfig(selectedLevel, config);
          return;
        } else if (error) {
          console.warn('[ExamManagement] ⚠️ Failed to load from Supabase, using local storage:', error);
        }
      } catch (err) {
        console.warn('[ExamManagement] ⚠️ Error loading from Supabase, using local storage:', err);
      }
    }

    // Fallback to local storage
    const config = await storageManager.getLevelConfig(selectedLevel);
    if (config) {
      setLevelConfig(config);
    }
  };

  const saveLevelConfig = async () => {
    // ✅ NEW: Save to Supabase first (if admin/editor)
    if (user && (isAdmin || isEditor)) {
      try {
        const { success, error } = await saveExamLevelConfigToSupabase(selectedLevel, levelConfig);
        if (success) {
          console.log('[ExamManagement] ✅ Saved level config to Supabase');
        } else {
          console.warn('[ExamManagement] ⚠️ Failed to save to Supabase, saving to local only:', error);
        }
      } catch (err) {
        console.warn('[ExamManagement] ⚠️ Error saving to Supabase, saving to local only:', err);
      }
    }

    // Also save to local storage (cache for offline access)
    const success = await storageManager.saveLevelConfig(selectedLevel, levelConfig);
    if (success) {
      // ✅ FIX: Tính tổng thời gian từ knowledge và listening
      const knowledgeTime = levelConfig.knowledge?.timeLimit || 0;
      const listeningTime = levelConfig.listening?.timeLimit || 0;
      const totalTime = knowledgeTime + listeningTime;
      
      alert(`✅ ${t('examManagement.config.saveSuccess')}\n\n` +
            `⚙️ ${t('examManagement.config.title', { level: selectedLevel.toUpperCase() })}:\n` +
            `   - ${t('examManagement.config.overall.passingScore')}: ${levelConfig.passingScore}\n` +
            `   - ${t('examManagement.config.overall.maxScore')}: ${levelConfig.maxScore}\n\n` +
            `📚 ${t('examManagement.config.knowledge.title')}:\n` +
            `   - ${t('examManagement.config.knowledge.minScore')}: ${levelConfig.knowledge?.minScore || 19}\n` +
            `   - ${t('examManagement.config.knowledge.maxScore')}: ${levelConfig.knowledge?.maxScore || 60}\n` +
            `   - ${t('examManagement.config.knowledge.timeLimit')}: ${knowledgeTime > 0 ? knowledgeTime + ' ' + t('examManagement.questions.stats.minutes') : 'N/A'}\n\n` +
            `📖 ${t('examManagement.config.reading.title')}:\n` +
            `   - ${t('examManagement.config.reading.minScore')}: ${levelConfig.reading?.minScore || 19}\n` +
            `   - ${t('examManagement.config.reading.maxScore')}: ${levelConfig.reading?.maxScore || 60}\n` +
            `   - ${t('examManagement.config.reading.noSeparateTime')}\n\n` +
            `🎧 ${t('examManagement.config.listening.title')}:\n` +
            `   - ${t('examManagement.config.listening.minScore')}: ${levelConfig.listening?.minScore || 19}\n` +
            `   - ${t('examManagement.config.listening.maxScore')}: ${levelConfig.listening?.maxScore || 60}\n` +
            `   - ${t('examManagement.config.listening.timeLimit')}: ${listeningTime > 0 ? listeningTime + ' ' + t('examManagement.questions.stats.minutes') : 'N/A'}\n\n` +
            `⏱️ ${t('examManagement.questions.stats.total')} ${t('examManagement.questions.stats.minutes')}: ${totalTime > 0 ? totalTime + ' ' + t('examManagement.questions.stats.minutes') : 'N/A'}\n\n` +
            `💾 ${t('examManagement.config.saveButton')}!`);
    } else {
      alert(`❌ ${t('examManagement.config.saveError')}\n\n${t('examManagement.config.saveErrorMessage')}`);
    }
  };

  // ✅ FIX: Helper function để generate ID và Title từ date
  const generateIdFromDate = (date) => {
    if (!date) return '';
    // Convert YYYY/MM hoặc YYYY-MM sang YYYY-MM
    const match = date.match(/^(\d{4})[\/\-](\d{1,2})/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}`;
    }
    return '';
  };

  const generateTitleFromDate = (date) => {
    if (!date) return '';
    // Convert YYYY/MM hoặc YYYY-MM sang JLPT YYYY/MM
    const match = date.match(/^(\d{4})[\/\-](\d{1,2})/);
    if (match) {
      const month = parseInt(match[2]);
      return `JLPT ${match[1]}/${month}`; // Không pad month trong title (JLPT 2024/12 thay vì 2024/12)
    }
    return '';
  };

  // ✅ FIX: Check duplicate ID
  const isDuplicateId = (id) => {
    if (!id) return false;
    if (editingExam && id === editingExam.id) return false; // Cho phép giữ nguyên ID khi edit
    return exams.some(e => e.id === id);
  };

  // Exam CRUD
  const handleAddExam = () => {
    setEditingExam(null);
    // ✅ FIX: Set date mặc định là tháng hiện tại
    const now = new Date();
    const currentMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const defaultId = generateIdFromDate(currentMonth);
    const defaultTitle = generateTitleFromDate(currentMonth);
    setExamForm({
      id: defaultId, // ✅ Auto-generate từ date
      title: defaultTitle, // ✅ Auto-generate từ date
      date: currentMonth, // ✅ Set mặc định là tháng hiện tại
      status: t('examManagement.exams.status.available'),
      imageUrl: ''
    });
    setShowExamForm(true);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      id: exam.id,
      title: exam.title,
      date: exam.date,
      status: exam.status,
      imageUrl: exam.imageUrl || ''
    });
    setShowExamForm(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.id || !examForm.title || !examForm.date) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
      return;
    }

    let updatedExams;
    if (editingExam) {
      updatedExams = exams.map(e => 
        e.id === editingExam.id ? { ...examForm } : e
      );
    } else {
      if (exams.find(e => e.id === examForm.id)) {
        alert('⚠️ ID đề thi đã tồn tại!');
        return;
      }
      updatedExams = [...exams, { ...examForm }];
    }

    // ✅ FIX: Sort lại sau khi thêm/sửa exam (theo năm mới nhất trước)
    const sortedExams = sortExamsByYear(updatedExams);

    const success = await storageManager.saveExams(selectedLevel, sortedExams);
    if (!success) {
      alert(`❌ ${t('examManagement.examForm.saveError')}\n\n${t('examManagement.examForm.saveErrorMessage')}`);
      return;
    }

    // ✅ NEW: Lưu exam metadata + cấu trúc (nếu có) lên Supabase để toàn hệ thống dùng chung
    if (user && (isAdmin || isEditor)) {
      try {
        // Thử lấy full exam data (bao gồm knowledge/reading/listening) từ storage
        const fullExamData = await storageManager.getExam(selectedLevel, examForm.id);

        const examPayload = {
          level: selectedLevel,
          examId: examForm.id,
          title: examForm.title,
          date: examForm.date,
          status: examForm.status,
          imageUrl: examForm.imageUrl,
          knowledge: fullExamData?.knowledge || { sections: [] },
          reading: fullExamData?.reading || { sections: [] },
          listening: fullExamData?.listening || { sections: [] },
          config: fullExamData?.config || {},
        };

        const result = await saveExamToSupabase(examPayload, user.id);
        if (!result.success) {
          console.warn('[ExamManagement] Failed to save exam to Supabase:', result.error);
        }
      } catch (error) {
        console.error('[ExamManagement] Unexpected error while saving exam to Supabase:', error);
      }
    }

    setExams(sortedExams);
    setShowExamForm(false);
    alert(
      `✅ ${t('examManagement.examForm.saveSuccess')}\n\n` +
        `📝 ${editingExam ? t('examManagement.examForm.updated') : t('examManagement.examForm.added')} ${t(
          'examManagement.examForm.savedExam',
        )}:\n` +
        `   - ID: ${examForm.id}\n` +
        `   - ${t('examManagement.exams.table.title')}: ${examForm.title}\n` +
        `   - ${t('examManagement.exams.table.date')}: ${examForm.date}\n` +
        `   - ${t('examManagement.selectLevel')}: ${selectedLevel.toUpperCase()}\n\n` +
        `💾 ${t('examManagement.examForm.savedToSystem')}`,
    );
  };

  const handleDeleteExam = async (examId) => {
    if (confirm(`⚠️ ${t('examManagement.delete.examConfirm')}`)) {
      const updatedExams = exams.filter(e => e.id !== examId);
      // ✅ FIX: Sort lại sau khi xóa exam (mặc dù không cần thiết nhưng để đảm bảo consistency)
      const sortedExams = sortExamsByYear(updatedExams);
      await storageManager.saveExams(selectedLevel, sortedExams);
      await storageManager.deleteExam(selectedLevel, examId);

       // ✅ NEW: Xóa exam trên Supabase (soft delete) để ẩn với toàn bộ user
       if (user && isAdmin) {
         try {
           const result = await deleteExamFromSupabase(selectedLevel, examId, user.id);
           if (!result.success) {
             console.warn('[ExamManagement] Failed to delete exam from Supabase:', result.error);
           }
         } catch (error) {
           console.error('[ExamManagement] Unexpected error while deleting exam from Supabase:', error);
         }
       }

      setExams(sortedExams);
      alert(`✅ ${t('examManagement.delete.examSuccess')}`);
    }
  };

  // Load exam data when exam or test type changes
  useEffect(() => {
    if (selectedExam && selectedTestType) {
      loadExamData();
    }
  }, [selectedExam, selectedTestType, selectedLevel]);

  const loadExamData = async () => {
    if (!selectedExam) return;

    // 1️⃣ Ưu tiên lấy exam đầy đủ từ local cache (nếu đã có)
    let data = await storageManager.getExam(selectedLevel, selectedExam.id);

    // 2️⃣ Nếu local chưa có dữ liệu chi tiết, thử load từ Supabase
    if (!data) {
      try {
        const { success, data: supabaseExam } = await getExamFromSupabase(selectedLevel, selectedExam.id);
        if (success && supabaseExam) {
          data = {
            level: supabaseExam.level || selectedLevel,
            examId: supabaseExam.id || selectedExam.id,
            title: supabaseExam.title || selectedExam.title || `JLPT ${selectedExam.id}`,
            date: supabaseExam.date || selectedExam.date || selectedExam.id,
            status: supabaseExam.status || selectedExam.status || 'Có sẵn',
            imageUrl: supabaseExam.imageUrl || selectedExam.imageUrl || `/jlpt/${selectedLevel}/${selectedExam.id}.jpg`,
            knowledge: supabaseExam.knowledge || { sections: [] },
            reading: supabaseExam.reading || { sections: [] },
            listening: supabaseExam.listening || { sections: [] },
            config: supabaseExam.config || {},
          };

          // Sync về local để lần sau load nhanh hơn
          try {
            await storageManager.saveExam(selectedLevel, selectedExam.id, data);
          } catch (syncErr) {
            console.warn('[ExamManagementPage] Failed to sync Supabase exam detail to local storage:', syncErr);
          }
        }
      } catch (error) {
        console.error('[ExamManagementPage] Error loading exam detail from Supabase:', error);
      }
    }

    if (data) {
      // ✅ NEW: Migrate passageImage (single) → passageImages (array) for backward compatibility
      const updatedData = { ...data };
      ['knowledge', 'reading'].forEach(testType => {
        if (updatedData[testType]?.sections) {
          updatedData[testType].sections = updatedData[testType].sections.map(section => {
            // Migrate passageImage → passageImages if needed
            if (section.passageImage?.url && (!section.passageImages || !Array.isArray(section.passageImages) || section.passageImages.length === 0)) {
              console.log(`🔄 Migrating passageImage → passageImages for section ${section.id} (${testType})`);
              return {
                ...section,
                passageImages: [{
                  url: section.passageImage.url,
                  path: section.passageImage.path || '',
                  name: section.passageImage.name || '',
                  order: 0
                }],
                // Keep passageImage for backward compatibility during transition
                passageImage: section.passageImage
              };
            }
            return section;
          });
        }
      });
      
      // ✅ FIX: Tự động set timeLimit cho sections không có timeLimit
      // 🔹 Knowledge: mỗi section có thể có timeLimit, nhưng tổng thời gian vẫn lấy từ levelConfig
      // 🔹 Listening: KHÔNG tự động set timeLimit cho tất cả sections để tránh cộng dồn thời gian
      ['knowledge'].forEach(testType => {
        if (updatedData[testType]?.sections) {
          updatedData[testType].sections = updatedData[testType].sections.map(section => {
            // Nếu section không có timeLimit hoặc timeLimit <= 0, set giá trị mặc định
            if (!section.timeLimit || section.timeLimit <= 0) {
              const defaultTimeLimit = getDefaultTimeLimit(testType);
              console.log(`⚠️ Section ${section.id} (${testType}) không có timeLimit, tự động set: ${defaultTimeLimit} phút`);
              return {
                ...section,
                timeLimit: defaultTimeLimit
              };
            }
            return section;
          });
        }
      });
      
      // Nếu có sections được update (migration hoặc timeLimit), lưu lại
      const hasUpdates = JSON.stringify(data) !== JSON.stringify(updatedData);
      if (hasUpdates) {
        console.log('✅ Đã tự động cập nhật sections (migration passageImage → passageImages hoặc timeLimit), đang lưu...');
        await storageManager.saveExam(selectedLevel, selectedExam.id, updatedData);
      }
      
      // ✅ NEW: Backward compatibility - Migrate audio from section level to listening part level
      if (updatedData.listening && updatedData.listening.sections) {
        const hasPartLevelAudio = updatedData.listening.audioUrl && !updatedData.listening.audioUrl.startsWith('blob:');
        const firstSectionWithAudio = updatedData.listening.sections.find(s => s.audioUrl && !s.audioUrl.startsWith('blob:'));
        
        // If no part-level audio but has section-level audio, migrate it
        if (!hasPartLevelAudio && firstSectionWithAudio) {
          console.log('🔄 Migrating audio from section level to listening part level:', {
            sectionId: firstSectionWithAudio.id,
            audioUrl: firstSectionWithAudio.audioUrl
          });
          
          updatedData.listening.audioUrl = firstSectionWithAudio.audioUrl;
          updatedData.listening.audioPath = firstSectionWithAudio.audioPath || '';
          updatedData.listening.audioName = firstSectionWithAudio.audioName || '';
          
          // Remove audio from all sections
          updatedData.listening.sections = updatedData.listening.sections.map(section => {
            const { audioUrl, audioPath, audioName, ...rest } = section;
            return rest;
          });
          
          // Save migrated data
          await storageManager.saveExam(selectedLevel, selectedExam.id, updatedData);
          console.log('✅ Audio migration completed and saved');
        }
      }
      
      // ✅ FIX: Normalize lại dữ liệu để đảm bảo ID được đánh số đúng
      // Knowledge và Reading đếm liên tục, Listening reset về 1
      const { data: normalizedData } = normalizeExamDataStructure(updatedData);
      
      // ✅ FIX: Kiểm tra xem có thay đổi về ID không bằng cách so sánh ID của questions
      let hasIdChanges = false;
      TEST_TYPE_ORDER.forEach((type) => {
        const originalSections = updatedData[type]?.sections || [];
        const normalizedSections = normalizedData[type]?.sections || [];
        
        originalSections.forEach((section, sIdx) => {
          const normalizedSection = normalizedSections[sIdx];
          if (!normalizedSection) return;
          
          const originalQuestions = section.questions || [];
          const normalizedQuestions = normalizedSection.questions || [];
          
          originalQuestions.forEach((q, qIdx) => {
            const normalizedQ = normalizedQuestions[qIdx];
            if (normalizedQ && String(q.id) !== String(normalizedQ.id)) {
              hasIdChanges = true;
              console.log(`🔄 ID thay đổi: ${type} - Section ${section.id} - Question ${q.id} → ${normalizedQ.id}`);
            }
          });
        });
      });
      
      if (hasIdChanges) {
        console.log('🔄 Phát hiện thay đổi về ID sau khi normalize, đang lưu lại...');
        try {
          await storageManager.saveExam(selectedLevel, selectedExam.id, normalizedData);
          console.log('✅ Đã lưu lại dữ liệu với ID đã được normalize');
        } catch (saveErr) {
          console.warn('⚠️ Không thể lưu dữ liệu đã normalize:', saveErr);
        }
      }
      
      setExamData(normalizedData);
      setSections(normalizedData[selectedTestType]?.sections || []);
      setSelectedSection(normalizedData[selectedTestType]?.sections?.[0] || null);
      
      // ✅ NEW: Load listening part audio (if listening part exists)
      if (updatedData.listening) {
        setListeningPartAudio({
          audioUrl: updatedData.listening.audioUrl || '',
          audioPath: updatedData.listening.audioPath || '',
          audioName: updatedData.listening.audioName || '',
          audioFile: null // Don't load file object
        });
      } else {
        setListeningPartAudio({
          audioUrl: '',
          audioPath: '',
          audioName: '',
          audioFile: null
        });
      }
    } else {
      // ✅ UPDATED: Initialize empty exam data với metadata từ selectedExam
      const emptyData = {
        level: selectedLevel,
        examId: selectedExam.id,
        title: selectedExam.title || `JLPT ${selectedExam.id}`,
        date: selectedExam.date || selectedExam.id,
        status: selectedExam.status || 'Có sẵn',
        imageUrl: selectedExam.imageUrl || `/jlpt/${selectedLevel}/${selectedExam.id}.jpg`,
        knowledge: { sections: [] },
        reading: { sections: [] },
        listening: { sections: [] }
      };
      setExamData(emptyData);
      setSections([]);
      
      // ✅ Lưu exam data với metadata ngay khi khởi tạo
      await storageManager.saveExam(selectedLevel, selectedExam.id, emptyData);
    }
  };

  // ✅ NEW: Generate next section ID automatically
  // ✅ FIX: Knowledge và Reading cùng một phần thi → kiểm tra section ID trong cả 2
  const getNextSectionId = useCallback(() => {
    // Lấy tất cả sections từ knowledge và reading (cùng một phần thi)
    const allSections = [
      ...(examData?.knowledge?.sections || []),
      ...(examData?.reading?.sections || [])
    ];
    
    // Nếu là listening, chỉ lấy sections từ listening
    const sectionsToCheck = (selectedTestType === 'knowledge' || selectedTestType === 'reading')
      ? allSections
      : (examData?.listening?.sections || []);
    
    if (sectionsToCheck.length === 0) return 'section1';
    
    // Extract numbers from existing section IDs (e.g., "section1" -> 1, "section2" -> 2)
    const getNumber = (id) => {
      const match = String(id).match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    const numbers = sectionsToCheck.map(s => getNumber(s.id)).filter(n => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `section${maxNum + 1}`;
  }, [sections, examData, selectedTestType]);

  // Section CRUD
  const handleAddSection = () => {
    setEditingSection(null);
    const nextId = getNextSectionId();
    const defaultTitle = getDefaultSectionTitle(selectedTestType);
    const defaultInstruction = getDefaultInstruction(selectedTestType);
    // ✅ UPDATED: Combine title and instruction with default values
    const combinedDefault = defaultTitle && defaultInstruction
      ? `${defaultTitle}\n\n${defaultInstruction}`
      : defaultTitle || defaultInstruction || '';
    
    setSectionForm({
      id: nextId, // ✅ Auto-generate ID
      instruction: combinedDefault, // ✅ Combined field with defaults
      timeLimit: null,
      passageImages: [] // ✅ NEW: Empty array for new section
      // ❌ REMOVED: Audio fields - audio is now at listening part level
    });
    setShowSectionForm(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    // ✅ UPDATED: Combine title and instruction for editing
    const combinedText = section.title && section.instruction
      ? `${section.title}\n\n${section.instruction}`
      : section.title || section.instruction || '';
    
    // ✅ NEW: Migrate passageImage (single) → passageImages (array) for backward compatibility
    let passageImages = [];
    if (section.passageImages && Array.isArray(section.passageImages)) {
      // New format: already an array
      passageImages = section.passageImages.map(img => ({
        ...img,
        file: null // Don't load file from saved data
      }));
    } else if (section.passageImage?.url) {
      // Old format: single image, convert to array
      passageImages = [{
        url: section.passageImage.url,
        path: section.passageImage.path || '',
        name: section.passageImage.name || '',
        order: 0,
        file: null
      }];
    }
    
    setSectionForm({
      id: section.id,
      instruction: combinedText, // ✅ Combined field
      timeLimit: section.timeLimit || null,
      passageImages: passageImages // ✅ NEW: Array of images
      // ❌ REMOVED: Audio fields - audio is now at listening part level
    });
    setShowSectionForm(true);
  };

  // ✅ NEW: Helper to split title and instruction from combined field
  const splitTitleAndInstruction = (combinedText) => {
    if (!combinedText || !combinedText.trim()) {
      return { title: '', instruction: '' };
    }
    
    // Split by first double newline or single newline
    const lines = combinedText.split('\n');
    const firstLine = lines[0]?.trim() || '';
    const rest = lines.slice(1).join('\n').trim();
    
    // If first line exists and rest exists, split them
    if (firstLine && rest) {
      return { title: firstLine, instruction: rest };
    }
    // If only first line exists, use it as title, instruction empty
    if (firstLine && !rest) {
      return { title: firstLine, instruction: '' };
    }
    // If no first line but has content, use all as instruction
    return { title: '', instruction: combinedText.trim() };
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.id || !sectionForm.instruction?.trim()) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillSectionInfo')}`);
      return;
    }
    
    // ✅ FIX: Kiểm tra duplicate section ID trong cả knowledge và reading (cùng một phần thi)
    // Kiểm tra cả khi tạo mới và khi edit (nếu ID thay đổi)
    const allSections = [
      ...(examData?.knowledge?.sections || []),
      ...(examData?.reading?.sections || [])
    ];
    
    const sectionsToCheck = (selectedTestType === 'knowledge' || selectedTestType === 'reading')
      ? allSections
      : (examData?.listening?.sections || []);
    
    // Tìm section có ID trùng (loại trừ section đang edit nếu ID không thay đổi)
    const existingSection = sectionsToCheck.find(s => {
      // Nếu đang edit và section này là section đang edit, bỏ qua
      if (editingSection && s.id === editingSection.id) {
        return false;
      }
      // Kiểm tra xem ID có trùng không
      return s.id === sectionForm.id;
    });
    
    if (existingSection) {
      const existingTestType = examData?.knowledge?.sections?.some(s => s.id === sectionForm.id)
        ? 'Kiến thức'
        : examData?.reading?.sections?.some(s => s.id === sectionForm.id)
          ? 'Đọc hiểu'
          : 'Nghe hiểu';
      alert(`⚠️ Section ID "${sectionForm.id}" đã tồn tại trong phần "${existingTestType}".\n\nVui lòng dùng ID khác hoặc click nút "🔄 Gợi ý ID" để tự động tạo ID tiếp theo.`);
      return;
    }
    
    // ❌ REMOVED: Audio validation and upload - audio is now at listening part level, not section level
    
    // ✅ NEW: Split title and instruction from combined field
    const { title, instruction } = splitTitleAndInstruction(sectionForm.instruction);
    const finalTitle = title || sectionForm.id; // Fallback to section ID if no title

    const updatedSections = [...sections];
    if (editingSection) {
      const index = updatedSections.findIndex(s => s.id === editingSection.id);
      if (index >= 0) {
        // ✅ Với listening: giữ nguyên timeLimit hiện có (không tự cộng dồn thêm)
        // ✅ Với knowledge: nếu chưa có, dùng getDefaultTimeLimit
        const existingTimeLimit =
          selectedTestType === 'listening'
            ? (editingSection.timeLimit || null)
            : (editingSection.timeLimit || getDefaultTimeLimit(selectedTestType) || null);

        // ✅ NEW: Save passageImages array (only uploaded images, no blob URLs)
        const savedPassageImages = (sectionForm.passageImages || [])
          .filter(img => img.url && !img.url.startsWith('blob:'))
          .map(img => ({
            url: img.url,
            path: img.path || '',
            name: img.name || '',
            order: img.order !== undefined ? img.order : 0
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        updatedSections[index] = {
          ...editingSection,
          id: sectionForm.id,
          title: finalTitle, // ✅ Use split title
          instruction: instruction, // ✅ Use split instruction
          timeLimit: existingTimeLimit,
          questions: editingSection.questions || [],
          passageImages: savedPassageImages.length > 0 ? savedPassageImages : undefined
          // ❌ REMOVED: Audio fields - audio is now at listening part level
        };
      }
    } else {
      // ✅ FIX: Kiểm tra duplicate trong cả knowledge và reading (đã kiểm tra ở trên, nhưng double-check)
      if (updatedSections.find(s => s.id === sectionForm.id)) {
        alert(`⚠️ ${t('examManagement.questions.sections.idExists')}`);
        return;
      }

      // ✅ NEW: Logic timeLimit khi tạo section mới
      let newSectionTimeLimit = null;
      if (selectedTestType === 'knowledge') {
        // Knowledge: có thể set timeLimit mặc định (nhưng tổng thời gian vẫn tính theo levelConfig)
        newSectionTimeLimit = getDefaultTimeLimit(selectedTestType) || null;
      } else if (selectedTestType === 'listening') {
        // Listening: chỉ section đầu tiên mới có timeLimit (ví dụ 60 phút),
        // các section sau để null/0 để tránh cộng dồn thời gian.
        const hasListeningSectionWithTime =
          updatedSections.some(s => s.timeLimit && s.timeLimit > 0);
        newSectionTimeLimit = hasListeningSectionWithTime
          ? null
          : (getDefaultTimeLimit(selectedTestType) || null);
      }

      // ✅ NEW: Save passageImages array (only uploaded images, no blob URLs)
      const savedPassageImages = (sectionForm.passageImages || [])
        .filter(img => img.url && !img.url.startsWith('blob:'))
        .map(img => ({
          url: img.url,
          path: img.path || '',
          name: img.name || '',
          order: img.order !== undefined ? img.order : 0
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      updatedSections.push({
        id: sectionForm.id,
        title: finalTitle, // ✅ Use split title
        instruction: instruction, // ✅ Use split instruction
        timeLimit: newSectionTimeLimit,
        questions: [],
        passageImages: savedPassageImages.length > 0 ? savedPassageImages : undefined
        // ❌ REMOVED: Audio fields - audio is now at listening part level
      });
    }

    // Sort sections by ID and ensure ID is string for listening compatibility
    updatedSections.sort((a, b) => {
      const getNumber = (id) => {
        const match = String(id).match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getNumber(a.id) - getNumber(b.id);
    });
    
    // Ensure section IDs are strings for listening format compatibility
    updatedSections.forEach(section => {
      if (selectedTestType === 'listening' && typeof section.id !== 'string') {
        section.id = String(section.id);
      }
    });

    await saveSections(updatedSections);
    
    // ❌ REMOVED: Revoke blob URL - audio is now at listening part level, not section level
    
    // ✅ NEW: Auto-select the newly created/edited section so template JSON updates
    const savedSection = updatedSections.find(s => s.id === sectionForm.id);
    if (savedSection) {
      setSelectedSection(savedSection);
    }
    
    setShowSectionForm(false);
    
    // ✅ FIX: Get correct test type label
    let testTypeLabel = '';
    if (selectedTestType === 'knowledge') {
      testTypeLabel = t('examManagement.questions.testTypes.knowledge');
    } else if (selectedTestType === 'reading') {
      testTypeLabel = t('examManagement.questions.testTypes.reading');
    } else if (selectedTestType === 'listening') {
      testTypeLabel = t('examManagement.questions.testTypes.listening');
    } else {
      testTypeLabel = selectedTestType || 'Unknown';
    }
    
    alert(`✅ ${t('examManagement.config.saveSuccess')}\n\n` +
          `📝 ${editingSection ? t('examManagement.questions.questionForm.sectionSaved') : t('examManagement.questions.questionForm.sectionAdded')} ${t('examManagement.questions.questionForm.sectionSavedText')}:\n` +
          `   - Loại: ${testTypeLabel}\n` +
          `   - ${t('examManagement.exams.table.title')}: ${selectedExam?.title || selectedExam?.id}\n` +
          `   - ${t('examManagement.selectLevel')}: ${selectedLevel.toUpperCase()}\n\n` +
          `💾 ${t('examManagement.questions.questionForm.savedToSystem')}`);
  };

  // ✅ NEW: Upload single passage image (called for each image in the array)
  const handleUploadSectionPassageImage = async (imageIndex) => {
    const image = sectionForm.passageImages[imageIndex];
    if (!image?.file || !image?.url?.startsWith('blob:')) {
      alert('⚠️ Vui lòng chọn file ảnh trước khi upload.');
      return;
    }

    if (!selectedExam || !selectedLevel || !selectedTestType || !sectionForm.id) {
      alert('⚠️ Vui lòng chọn exam, level, test type và section ID trước.');
      return;
    }

    setIsUploadingImage(true);
    setUploadingImageField(`passageImage-${imageIndex}`);
    try {
      const { uploadImage, generateFilePath } = await import('../../services/fileUploadService.js');
      
      // 📁 Đường dẫn: level / exam / testType / section / passage-{index}.jpg
      const safeLevel = selectedLevel || 'unknown-level';
      const safeExamId = selectedExam?.id || 'unknown-exam';
      const safeTestType = selectedTestType || 'unknown-type';
      const safeSectionId = sectionForm.id || 'unknown-section';
      const prefix = `level-${safeLevel}/exam-${safeExamId}/${safeTestType}/section-${safeSectionId}`;
      const path = generateFilePath(prefix, image.file.name);
      
      const result = await uploadImage(image.file, path);
      
      if (result.success) {
        const uploadedImageUrl = result.url;
        const uploadedImagePath = path;
        const uploadedImageName = image.file.name;
        
        // Update sectionForm với ảnh đã upload
        const updatedImages = [...sectionForm.passageImages];
        updatedImages[imageIndex] = {
          url: uploadedImageUrl,
          path: uploadedImagePath,
          name: uploadedImageName,
          order: image.order !== undefined ? image.order : imageIndex,
          file: null
        };
        
        setSectionForm({
          ...sectionForm,
          passageImages: updatedImages
        });
        
        // Revoke blob URL
        if (image.url?.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
        
        alert(`✅ Upload ảnh "${uploadedImageName}" thành công!`);
      } else {
        console.error('[ExamManagement] ❌ Error uploading passage image:', result.error);
        alert('❌ Lỗi upload ảnh!');
      }
    } catch (err) {
      console.error('[ExamManagement] ❌ Unexpected error uploading passage image:', err);
      alert('❌ Lỗi upload ảnh!');
    } finally {
      setIsUploadingImage(false);
      setUploadingImageField(null);
    }
  };

  // ✅ NEW: Upload multiple passage images
  const handleUploadMultiplePassageImages = async (files) => {
    if (!files || files.length === 0) return;
    
    if (!selectedExam || !selectedLevel || !selectedTestType || !sectionForm.id) {
      alert('⚠️ Vui lòng chọn exam, level, test type và section ID trước.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const newImages = [];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(`❌ File "${file.name}" không phải ảnh hợp lệ (JPEG, PNG, WEBP, GIF)`);
        continue;
      }
      
      if (file.size > maxSize) {
        alert(`❌ File "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB, giới hạn: 10MB)`);
        continue;
      }
      
      const blobUrl = URL.createObjectURL(file);
      const currentMaxOrder = sectionForm.passageImages.length > 0
        ? Math.max(...sectionForm.passageImages.map(img => img.order || 0))
        : -1;
      
      newImages.push({
        url: blobUrl,
        path: '',
        name: file.name,
        order: currentMaxOrder + 1,
        file: file
      });
    }
    
    if (newImages.length > 0) {
      setSectionForm({
        ...sectionForm,
        passageImages: [...sectionForm.passageImages, ...newImages]
      });
    }
  };

  // ✅ NEW: Move image up in order
  const handleMoveImageUp = (index) => {
    if (index <= 0) return;
    
    const updatedImages = [...sectionForm.passageImages];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[index - 1];
    updatedImages[index - 1] = temp;
    
    // Update order values
    updatedImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    setSectionForm({
      ...sectionForm,
      passageImages: updatedImages
    });
  };

  // ✅ NEW: Move image down in order
  const handleMoveImageDown = (index) => {
    if (index >= sectionForm.passageImages.length - 1) return;
    
    const updatedImages = [...sectionForm.passageImages];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[index + 1];
    updatedImages[index + 1] = temp;
    
    // Update order values
    updatedImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    setSectionForm({
      ...sectionForm,
      passageImages: updatedImages
    });
  };

  // ✅ NEW: Delete image from array
  const handleDeletePassageImage = (index) => {
    if (!confirm('⚠️ Bạn có chắc muốn xóa ảnh này?')) return;
    
    const image = sectionForm.passageImages[index];
    
    // Revoke blob URL if exists
    if (image?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }
    
    const updatedImages = sectionForm.passageImages.filter((_, idx) => idx !== index);
    // Reorder remaining images
    updatedImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    setSectionForm({
      ...sectionForm,
      passageImages: updatedImages
    });
  };

  // ✅ NEW: Upload audio for listening part (entire listening part, not per section)
  const handleUploadListeningPartAudio = async () => {
    if (!listeningPartAudio.audioFile || !listeningPartAudio.audioUrl?.startsWith('blob:')) {
      alert('⚠️ Vui lòng chọn file audio trước khi upload.');
      return;
    }

    if (!selectedExam || !selectedLevel) {
      alert('⚠️ Vui lòng chọn exam và level trước.');
      return;
    }

    setIsUploadingAudio(true);
    try {
      const { uploadAudio, generateFilePath } = await import('../../services/fileUploadService.js');
      
      // 📁 Đường dẫn: level / exam / listening / audio.mp3 (không có sectionId)
      const safeLevel = selectedLevel || 'unknown-level';
      const safeExamId = selectedExam?.id || 'unknown-exam';
      const prefix = `level-${safeLevel}/exam-${safeExamId}/listening`;
      const path = generateFilePath(prefix, listeningPartAudio.audioFile.name);
      
      const result = await uploadAudio(listeningPartAudio.audioFile, path);
      
      if (result.success) {
        const uploadedAudioUrl = result.url;
        const uploadedAudioPath = path;
        const uploadedAudioName = listeningPartAudio.audioFile.name;
        
        // Update listening part audio state
        setListeningPartAudio({
          audioUrl: uploadedAudioUrl,
          audioPath: uploadedAudioPath,
          audioName: uploadedAudioName,
          audioFile: null
        });
        
        // Update examData với audio ở listening part level
        const updatedExamData = {
          ...examData,
          listening: {
            ...examData?.listening,
            sections: examData?.listening?.sections || [],
            audioUrl: uploadedAudioUrl,
            audioPath: uploadedAudioPath,
            audioName: uploadedAudioName
          }
        };
        
        setExamData(updatedExamData);
        
        // Save to local storage
        await storageManager.saveExam(selectedLevel, selectedExam.id, updatedExamData);
        
        // ✅ NEW: Save to Supabase database để đồng bộ cho tất cả users
        if (user && (isAdmin || isEditor)) {
          try {
            const examPayload = {
              level: selectedLevel,
              examId: selectedExam.id,
              title: updatedExamData.title || selectedExam.title || `JLPT ${selectedExam.id}`,
              date: updatedExamData.date || selectedExam.date || selectedExam.id,
              status: updatedExamData.status || selectedExam.status || 'Có sẵn',
              imageUrl: updatedExamData.imageUrl || selectedExam.imageUrl || `/jlpt/${selectedLevel}/${selectedExam.id}.jpg`,
              knowledge: updatedExamData.knowledge || { sections: [] },
              reading: updatedExamData.reading || { sections: [] },
              listening: {
                ...(updatedExamData.listening || { sections: [] }),
                // ✅ NEW: Include audio at listening part level
                audioUrl: uploadedAudioUrl,
                audioPath: uploadedAudioPath,
                audioName: uploadedAudioName
              },
              config: updatedExamData.config || {}
            };
            
            const result = await saveExamToSupabase(examPayload, user.id);
            if (result.success) {
              console.log('✅ Listening part audio saved to Supabase database');
            } else {
              console.warn('⚠️ Failed to save listening part audio to Supabase database:', result.error);
            }
          } catch (error) {
            console.error('❌ Error saving listening part audio to Supabase database:', error);
          }
        }
        
        // Revoke blob URL
        if (listeningPartAudio.audioUrl && listeningPartAudio.audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(listeningPartAudio.audioUrl);
        }
        
        console.log('✅ Listening part audio uploaded to Supabase Storage:', {
          fileName: uploadedAudioName,
          fileSize: listeningPartAudio.audioFile.size,
          url: uploadedAudioUrl,
          path: uploadedAudioPath
        });
        
        alert('✅ Đã upload audio file cho listening part thành công!');
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading listening part audio to Supabase:', error);
      alert(`⚠️ Lỗi khi upload audio file cho listening part. Vui lòng thử lại.\n\n${getErrorMessage(error, 'Audio Upload')}`);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (confirm(`⚠️ ${t('examManagement.delete.sectionConfirm')}`)) {
      const updatedSections = sections.filter(s => s.id !== sectionId);
      await saveSections(updatedSections);
      alert(`✅ ${t('examManagement.delete.sectionSuccess')}`);
    }
  };

  const saveSections = async (updatedSections) => {
    // ✅ FIX: Log trước khi save
    const targetSection = updatedSections.find(s => s.id === selectedSection?.id);
    console.log(`💾 saveSections called:`, {
      selectedTestType,
      totalSections: updatedSections.length,
      targetSectionId: selectedSection?.id,
      questionsInTargetSection: targetSection?.questions?.length || 0,
      questionIds: targetSection?.questions?.map(q => q.id) || []
    });
    
    // ✅ UPDATED: Đảm bảo metadata được lưu cùng với exam data
    const updatedExamData = {
      // ✅ Giữ nguyên metadata nếu đã có
      level: selectedLevel,
      examId: selectedExam.id,
      title: selectedExam.title || examData?.title || `JLPT ${selectedExam.id}`,
      date: selectedExam.date || examData?.date || selectedExam.id,
      status: selectedExam.status || examData?.status || 'Có sẵn',
      imageUrl: selectedExam.imageUrl || examData?.imageUrl || `/jlpt/${selectedLevel}/${selectedExam.id}.jpg`,
      // ✅ Cập nhật sections - QUAN TRỌNG: Spread examData TRƯỚC để giữ các testType khác
      ...examData,
      [selectedTestType]: {
        sections: updatedSections,
        // ✅ NEW: For listening, preserve audio at part level (not section level)
        ...(selectedTestType === 'listening' && {
          audioUrl: examData?.listening?.audioUrl || listeningPartAudio.audioUrl || '',
          audioPath: examData?.listening?.audioPath || listeningPartAudio.audioPath || '',
          audioName: examData?.listening?.audioName || listeningPartAudio.audioName || ''
        })
      }
    };
    
    const { data: normalizedExam } = normalizeExamDataStructure(updatedExamData);
    const normalizedSections = normalizedExam[selectedTestType]?.sections || [];
    
    // ✅ FIX: Log exam data trước khi save
    console.log(`💾 About to save exam data:`, {
      examId: selectedExam.id,
      level: selectedLevel,
      testType: selectedTestType,
      sectionsCount: normalizedSections.length,
      totalQuestions: normalizedSections.reduce((acc, s) => acc + (s.questions?.length || 0), 0),
      sections: normalizedSections.map(s => ({
        id: s.id,
        questionsCount: s.questions?.length || 0,
        questionIds: s.questions?.map(q => q.id) || []
      }))
    });
    
    setSections(normalizedSections);
    setExamData(normalizedExam);
    setSelectedSection(prev => {
      if (!prev) return normalizedSections[0] || null;
      return normalizedSections.find(section => section.id === prev.id) || normalizedSections[0] || null;
    });
    
    const saveResult = await storageManager.saveExam(selectedLevel, selectedExam.id, normalizedExam);
    console.log(`💾 Save result:`, saveResult ? 'SUCCESS' : 'FAILED');

    // ✅ NEW: Đồng bộ exam (bao gồm questions) lên Supabase để mọi user đều dùng chung
    if (saveResult && user && (isAdmin || isEditor)) {
      try {
        const examPayload = {
          level: selectedLevel,
          examId: selectedExam.id,
          title: normalizedExam.title || selectedExam.title || `JLPT ${selectedExam.id}`,
          date: normalizedExam.date || selectedExam.date || selectedExam.id,
          status: normalizedExam.status || selectedExam.status || 'Có sẵn',
          imageUrl: normalizedExam.imageUrl || selectedExam.imageUrl || `/jlpt/${selectedLevel}/${selectedExam.id}.jpg`,
          knowledge: normalizedExam.knowledge || { sections: [] },
          reading: normalizedExam.reading || { sections: [] },
          listening: {
            ...(normalizedExam.listening || { sections: [] }),
            // ✅ NEW: Include audio at listening part level
            audioUrl: normalizedExam.listening?.audioUrl || listeningPartAudio.audioUrl || '',
            audioPath: normalizedExam.listening?.audioPath || listeningPartAudio.audioPath || '',
            audioName: normalizedExam.listening?.audioName || listeningPartAudio.audioName || ''
          },
          config: normalizedExam.config || {},
        };

        const result = await saveExamToSupabase(examPayload, user.id);
        if (!result.success) {
          console.warn('[ExamManagement] Failed to sync exam questions to Supabase:', result.error);
        }
      } catch (error) {
        console.error('[ExamManagement] Unexpected error while syncing exam questions to Supabase:', error);
      }
    }
    
    // ✅ FIX: Verify sau khi save (local)
    if (saveResult) {
      const verifyExam = await storageManager.getExam(selectedLevel, selectedExam.id);
      if (verifyExam) {
        const verifySections = verifyExam[selectedTestType]?.sections || [];
        const verifyQuestions = verifySections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
        console.log(`✅ Verification after save:`, {
          sectionsCount: verifySections.length,
          totalQuestions: verifyQuestions,
          questionIds: verifySections.flatMap(s => s.questions?.map(q => q.id) || [])
        });
      }
    }
  };

  // ✅ Quiz Editor style functions - Generate JSON, Export, Copy, Download
  const generateQuestionJSON = () => {
    // ✅ UPDATED: For listening, question can be empty (only read in audio)
    if (!selectedSection) {
      return null;
    }
    if (selectedTestType !== 'listening' && !questionForm.question) {
      return null;
    }
    
    const questionData = {
      id: questionForm.id,
      question: questionForm.question || '', // Allow empty for listening
      options: questionForm.options
        .filter(opt => opt.trim() !== '')
        .map((opt, idx) => ({
          label: String.fromCharCode(65 + idx),
          text: opt
        })),
      correctAnswer: String.fromCharCode(65 + questionForm.correctAnswer),
      explanation: questionForm.explanation,
      // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
    };
    
    return JSON.stringify(questionData, null, 2);
  };

  const handleExportQuestion = () => {
    const json = generateQuestionJSON();
    if (json) {
      setExportedJSON(json);
    } else {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfo')}`);
    }
  };

  const handleCopyQuestion = () => {
    const json = exportedJSON || generateQuestionJSON();
    if (json) {
      navigator.clipboard.writeText(json);
      alert(`✅ ${t('examManagement.questions.questionForm.copiedToClipboard')}`);
    } else {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfo')}`);
    }
  };

  const handleDownloadQuestion = () => {
    const json = generateQuestionJSON();
    if (!json) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfo')}`);
      return;
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const filename = selectedSection && questionForm.id 
      ? `${selectedLevel}-${selectedExam?.id}-${selectedTestType}-${selectedSection.id}-q${questionForm.id}.json`
      : `question-${Date.now()}.json`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ Đã download file "${filename}"!`);
  };

  // ✅ UPDATED: Enhanced validation with duplicate content detection
  const isQuestionValid = () => {
    // ✅ UPDATED: For listening, question can be empty (only read in audio)
    if (selectedTestType !== 'listening' && !questionForm.question.trim()) return false;
    if (!questionForm.id) return false;
    if (isDuplicateQuestionId && !editingQuestion) return false;
    const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return false;
    if (!questionForm.explanation.trim()) return false;
    
    // ✅ UPDATED: For listening, only validate listening part has audio (no timing needed)
    if (selectedTestType === 'listening') {
      // ✅ UPDATED: Check listening part has audio (not section level)
      const hasAudio = listeningPartAudio.audioUrl || examData?.listening?.audioUrl;
      if (!hasAudio) return false;
      // ❌ REMOVED: Timing validation - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
    }
    
    // ✅ NEW: Check for duplicate question text (but allow if editing)
    if (isDuplicateQuestionText && !editingQuestion) return false;
    return true;
  };
  
  // ✅ NEW: Check for duplicate question text
  useEffect(() => {
    if (!questionForm.question || !selectedSection || editingQuestion) {
      setIsDuplicateQuestionText(false);
      return;
    }
    
    const existingQuestions = selectedSection.questions || [];
    const isDuplicate = checkDuplicateQuestion(
      questionForm.question,
      existingQuestions,
      -1 // Not editing, so check all
    );
    setIsDuplicateQuestionText(isDuplicate);
  }, [questionForm.question, selectedSection, editingQuestion]);

  // ✅ Helper: Lấy title mặc định cho section
  const getDefaultSectionTitle = (testType) => {
    const titles = {
      knowledge: '問題1',
      reading: '問題1',
      listening: '問題1'
    };
    return titles[testType] || '問題1';
  };

  // ✅ NEW: Image upload handler (Supabase Storage + Insert into textarea)
  const handleImageUpload = async (file, field = 'question') => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Chỉ hỗ trợ ảnh: JPEG, PNG, WEBP, GIF');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`❌ Ảnh quá lớn!\n\nKích thước: ${(file.size / 1024 / 1024).toFixed(2)}MB\nGiới hạn: 5MB`);
      return;
    }
    
    setIsUploadingImage(true);
    setUploadingImageField(field);
    
    try {
      const { uploadImage, generateFilePath } = await import('../../services/fileUploadService.js');
      
      // 📁 Đường dẫn có ngữ nghĩa: level / exam / testType / section / question
      const safeLevel = selectedLevel || 'unknown-level';
      const safeExam = selectedExam?.id || 'unknown-exam';
      const safeTestType = selectedTestType || 'unknown-type';
      const safeSection = selectedSection?.id || 'unknown-section';
      const safeQuestion = questionForm.id || 'question-unknown';
      const prefix = `level-${safeLevel}/exam-${safeExam}/${safeTestType}/section-${safeSection}/${safeQuestion}`;
      const path = generateFilePath(prefix, file.name);
      
      const result = await uploadImage(file, path);
      
      if (!result.success) {
        console.error('[ExamManagement] ❌ Error uploading image to Supabase:', result.error);
        alert('❌ Lỗi upload ảnh!');
      } else {
        console.log('[ExamManagement] ✅ Image uploaded to Supabase:', result.url);
        
        const imgTag = `<img src="${result.url}" alt="${field === 'explanation' ? 'Explanation image' : field === 'instruction' ? 'Instruction image' : 'Question image'}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
        
        // ✅ Handle explanation field (ContentEditable) differently
        if (field === 'explanation') {
          // For ContentEditable, append to end (or could insert at cursor if needed)
          const currentValue = questionForm.explanation || '';
          setQuestionForm({ ...questionForm, explanation: currentValue + imgTag });
        } else {
          // Handle textarea fields (question, instruction)
          const textarea = field === 'instruction'
            ? instructionTextareaRef.current
            : questionTextareaRef.current;
            
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentValue = field === 'instruction'
              ? sectionForm.instruction || ''
              : questionForm.question || '';
            
            const newValue = 
              currentValue.substring(0, start) + 
              imgTag + 
              currentValue.substring(end);
            
            if (field === 'instruction') {
              setSectionForm({ ...sectionForm, instruction: newValue });
            } else {
              setQuestionForm({ ...questionForm, question: newValue });
            }
            
            // Restore cursor position
            setTimeout(() => {
              textarea.focus();
              const newPos = start + imgTag.length;
              textarea.setSelectionRange(newPos, newPos);
            }, 0);
          }
        }
        
        alert(`✅ Upload ảnh thành công!\n\nFile: ${file.name}`);
      }
    } catch (error) {
      console.error('[ExamManagement] ❌ Unexpected error during image upload:', error);
      alert('❌ Lỗi upload ảnh!');
    } finally {
      setIsUploadingImage(false);
      setUploadingImageField('');
    }
  };

  // ✅ UPDATED: Use shared processPastedHTML utility (already imported)

  // ✅ NEW: Paste handler for ContentEditable (explanation field)
  const handlePasteForContentEditable = async (e, file, html, plainText, field = 'explanation') => {
    // Handle image paste
    if (file) {
      const imgTag = await handleImageUploadForContentEditable(file, field);
      return imgTag || false;
    }
    
    // Handle HTML paste
    if (html && html.trim()) {
      const processed = processPastedHTML(html, plainText);
      return processed;
    }
    
    // ✅ NEW: Handle plain text with newlines
    if (plainText && plainText.trim()) {
      const processed = processPastedHTML(null, plainText);
      return processed;
    }
    
    return null;
  };

  // ✅ NEW: Image upload handler for ContentEditable
  const handleImageUploadForContentEditable = async (file, field = 'explanation') => {
    setIsUploadingImage(true);
    setUploadingImageField(field);
    
    try {
      const { uploadImage, generateFilePath } = await import('../../services/fileUploadService.js');
      
      const safeLevel = selectedLevel || 'unknown-level';
      const safeExam = selectedExam?.id || 'unknown-exam';
      const safeTestType = selectedTestType || 'unknown-type';
      const safeSection = selectedSection?.id || 'unknown-section';
      const safeQuestion = questionForm.id || 'question-unknown';
      const prefix = `level-${safeLevel}/exam-${safeExam}/${safeTestType}/section-${safeSection}/${safeQuestion}`;
      const path = generateFilePath(prefix, file.name);
      
      const result = await uploadImage(file, path);
      
      if (!result.success) {
        console.error('[ExamManagement] ❌ Error uploading image:', result.error);
        alert('❌ Lỗi upload ảnh!');
        return null;
      }
      
      console.log('[ExamManagement] ✅ Image uploaded:', result.url);
      
      const imgTag = `<img src="${result.url}" alt="${field === 'explanation' ? 'Explanation image' : 'Instruction image'}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
      
      alert(`✅ Upload ảnh thành công!\n\nFile: ${file.name}`);
      return imgTag;
    } catch (error) {
      console.error('[ExamManagement] ❌ Error during image upload:', error);
      alert('❌ Lỗi upload ảnh!');
      return null;
    } finally {
      setIsUploadingImage(false);
      setUploadingImageField('');
    }
  };

  // ✅ KEEP: Original paste handler for textarea fields (question, instruction)
  const handlePaste = async (e, field = 'question') => {
    // Only handle for textarea fields (not explanation which uses ContentEditable)
    if (field === 'explanation') {
      return; // This shouldn't be called for explanation anymore
    }
    const items = e.clipboardData.items;
    let hasImage = false;
    
    // Check for images first
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await handleImageUpload(file, field);
        }
        return;
      }
    }
    
    // No image → Process text/HTML
    if (!hasImage) {
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      
      if (html && html.trim()) {
        e.preventDefault();
        
        // Process HTML: clean up, convert formatting
        const processed = processPastedHTML(html);
        
        // Insert into textarea
        const textarea = field === 'explanation'
          ? explanationTextareaRef.current
          : field === 'instruction'
          ? instructionTextareaRef.current
          : questionTextareaRef.current;
          
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = field === 'explanation'
            ? questionForm.explanation || ''
            : field === 'instruction'
            ? sectionForm.instruction || ''
            : questionForm.question || '';
          
          const newValue = 
            currentValue.substring(0, start) + 
            processed + 
            currentValue.substring(end);
          
          if (field === 'explanation') {
            setQuestionForm({ ...questionForm, explanation: newValue });
          } else if (field === 'instruction') {
            setSectionForm({ ...sectionForm, instruction: newValue });
          } else {
            setQuestionForm({ ...questionForm, question: newValue });
          }
          
          // Restore cursor position
          setTimeout(() => {
            textarea.focus();
            const newPos = start + processed.length;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
      }
    }
  };

  // ✅ UPDATED: Toolbar functions using shared utilities
  const insertTextAtCursor = (beforeText, afterText = '', field = 'question') => {
    // ✅ Note: explanation field uses ContentEditable, toolbar buttons work via document.execCommand
    // For explanation field, we'll use a different approach if needed
    if (field === 'explanation') {
      // ContentEditable - use document.execCommand for formatting
      document.execCommand('insertText', false, beforeText);
      // Note: This is a simplified approach, full implementation would need selection handling
      return;
    }
    
    const textarea = field === 'instruction'
      ? instructionTextareaRef.current
      : questionTextareaRef.current;
    
    if (!textarea) return;
    
    const updateValue = (newValue) => {
      if (field === 'instruction') {
        setSectionForm({ ...sectionForm, instruction: newValue });
      } else {
        setQuestionForm({ ...questionForm, question: newValue });
      }
    };
    
    insertTextAtCursorUtil(textarea, beforeText, afterText, updateValue);
  };

  const handleFormatBold = (field = 'question') => {
    insertTextAtCursor('<strong>', '</strong>', field);
  };

  const handleFormatItalic = (field = 'question') => {
    insertTextAtCursor('<em>', '</em>', field);
  };

  const handleInsertLineBreak = (field = 'question') => {
    insertTextAtCursor('<br/>', '', field);
  };

  // ✅ UPDATED: Auto-resize textarea using shared utility
  const handleTextareaResize = (field = 'question') => {
    const textarea = field === 'explanation'
      ? explanationTextareaRef.current
      : field === 'instruction'
      ? instructionTextareaRef.current
      : questionTextareaRef.current;
    autoResizeTextarea(textarea);
  };

  // ✅ NEW: Toggle preview
  const togglePreview = (field = 'question') => {
    setShowQuestionPreview(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // ✅ Helper: Lấy instruction mặc định
  const getDefaultInstruction = (testType) => {
    const instructions = {
      knowledge: '（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。',
      reading: '次の文章を読んで、後の問いに答えなさい。',
      listening: '問題用紙には何も印刷されていません。まず文を聞いてください。それから、質問と選択肢を聞いて、1から4の中から、最もよいものを一つ選んでください。'
    };
    return instructions[testType] || '';
  };

  // ✅ Helper: Lấy timeLimit mặc định từ levelConfig
  const getDefaultTimeLimit = (testType) => {
    // Lấy từ levelConfig nếu có và là số hợp lệ (> 0)
    if (testType === 'knowledge' && levelConfig?.knowledge?.timeLimit && levelConfig.knowledge.timeLimit > 0) {
      return levelConfig.knowledge.timeLimit;
    }
    if (testType === 'listening' && levelConfig?.listening?.timeLimit && levelConfig.listening.timeLimit > 0) {
      return levelConfig.listening.timeLimit;
    }
    // ✅ FIX: Fallback về giá trị mặc định - LUÔN trả về số, không trả về null
    const defaults = {
      knowledge: 110,  // Mặc định 110 phút cho knowledge
      listening: 60    // Mặc định 60 phút cho listening
    };
    return defaults[testType] || (testType === 'knowledge' ? 110 : 60);
  };

  // ✅ UPDATED: Question CRUD - Tự động tạo section mặc định nếu chưa có
  const handleAddQuestion = async (section = null) => {
    if (!canSwitchToTestType(selectedTestType)) {
      alert(getTestTypeBlockMessage(selectedTestType));
      return;
    }

    // ✅ MỚI: Nếu chưa có section → Tự động tạo section mặc định
    if (!section && sections.length === 0) {
      // ✅ FIX: Dùng getNextSectionId() để đảm bảo section ID tiếp tục từ knowledge/reading
      const nextSectionId = getNextSectionId();
      const defaultSection = {
        id: nextSectionId,
        title: getDefaultSectionTitle(selectedTestType),
        instruction: getDefaultInstruction(selectedTestType),
        timeLimit: getDefaultTimeLimit(selectedTestType),
        questions: []
      };
      
      // Lưu section mặc định
      const updatedSections = [defaultSection];
      await saveSections(updatedSections);
      setSections(updatedSections);
      setSelectedSection(defaultSection);
      section = defaultSection;
      
      // Thông báo nhẹ nhàng (không hiển thị alert để không làm gián đoạn workflow)
      console.log('✅ Đã tự động tạo section mặc định:', defaultSection);
      // Có thể hiển thị toast notification nếu có (tùy chọn)
    } else if (!section && sections.length > 0) {
      // Đã có section → Dùng section đầu tiên
      section = sections[0];
    }
    
    if (!section) {
      alert('⚠️ Không thể tạo section. Vui lòng thử lại!');
      return;
    }
    
    // Tiếp tục logic cũ
    setSelectedSection(section);
    setEditingQuestion(null);
    
    // ✅ FIX: Đảm bảo tính nextId từ data đã được normalize
    // Nếu examData chưa được normalize, normalize lại trước khi tính
    let normalizedExamData = examData;
    if (examData) {
      const { data: normalized } = normalizeExamDataStructure(examData);
      normalizedExamData = normalized;
    }
    
    // Tính nextId từ normalized data
    let calculatedNextId = 1;
    if (normalizedExamData) {
      if (selectedTestType === 'knowledge' || selectedTestType === 'reading') {
        const knowledgeQuestions = (normalizedExamData.knowledge?.sections || [])
          .flatMap(s => s.questions || [])
          .map(q => getNumericIdFromQuestion(q));
        const readingQuestions = (normalizedExamData.reading?.sections || [])
          .flatMap(s => s.questions || [])
          .map(q => getNumericIdFromQuestion(q));
        const allIds = [...knowledgeQuestions, ...readingQuestions];
        if (allIds.length > 0) {
          const maxId = Math.max(...allIds);
          calculatedNextId = Number.isFinite(maxId) ? maxId + 1 : 1;
        }
      } else if (selectedTestType === 'listening') {
        const listeningQuestions = (normalizedExamData.listening?.sections || [])
          .flatMap(s => s.questions || [])
          .map(q => getNumericIdFromQuestion(q));
        if (listeningQuestions.length > 0) {
          const maxId = Math.max(...listeningQuestions);
          calculatedNextId = Number.isFinite(maxId) ? maxId + 1 : 1;
        }
      }
    } else {
      calculatedNextId = nextQuestionIdSuggestion;
    }
    
    const defaultIdValue = String(calculatedNextId);
    setAutoGeneratedId(defaultIdValue);
    // ✅ NEW: Calculate default timing for listening questions (from entire listening part, not just current section)
    let defaultStartTime = undefined;
    let defaultEndTime = undefined;
    if (selectedTestType === 'listening') {
      // ✅ UPDATED: Get last question from entire listening part (all sections)
      const allListeningQuestions = sections.flatMap(s => (s.questions || []).filter(q => q.startTime !== undefined && q.endTime !== undefined));
      if (allListeningQuestions.length > 0) {
        // Sort by endTime to get the last question chronologically
        const sortedQuestions = [...allListeningQuestions].sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
        const lastQuestion = sortedQuestions[0];
        defaultStartTime = lastQuestion.endTime !== undefined ? lastQuestion.endTime : (lastQuestion.startTime !== undefined ? lastQuestion.startTime + 15 : 0);
        defaultEndTime = defaultStartTime + 15; // Default 15 seconds per question
      }
    }
    
    setQuestionForm({
      id: defaultIdValue,
      category: selectedTestType, // ✅ Đảm bảo category được set từ selectedTestType (knowledge/reading/listening)
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      // ✅ NEW: Timing fields for listening (replaces audio fields)
      startTime: defaultStartTime,
      endTime: defaultEndTime
    });
    setExportedJSON('');
    setShowPreview(false);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (section, question) => {
    setSelectedSection(section);
    setEditingQuestion(question);
    setAutoGeneratedId(null);
    
    // ✅ FIX: Exit import mode when editing from question list
    setIsImportMode(false);
    
    // ✅ FIX: Normalize correctAnswer to number (0-3)
    let normalizedCorrectAnswer = 0;
    if (typeof question.correctAnswer === 'number' && question.correctAnswer >= 0 && question.correctAnswer < 4) {
      normalizedCorrectAnswer = question.correctAnswer;
    } else if (typeof question.correctAnswer === 'string') {
      const letterIndex = ['A', 'B', 'C', 'D'].indexOf(question.correctAnswer.toUpperCase());
      if (letterIndex >= 0) {
        normalizedCorrectAnswer = letterIndex;
      } else if (/^[0-3]$/.test(question.correctAnswer)) {
        normalizedCorrectAnswer = parseInt(question.correctAnswer, 10);
      }
    }
    
    setQuestionForm({
      id: question.id || question.number || question.subNumber,
      category: question.category || selectedTestType,
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: normalizedCorrectAnswer, // ✅ Normalized to number (0-3)
      explanation: question.explanation || '',
      // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
    });
    setExportedJSON('');
    setShowPreview(false);
    setShowQuestionForm(true);
  };

  // ✅ NEW: Handle save question (save and close form)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    
    // ✅ NEW: Check if editing question from imported questions
    const isEditingFromImported = editingQuestion && importedQuestions.length > 0 && 
      importedQuestions.some(q => String(q.id) === String(editingQuestion.id));
    
    if (isEditingFromImported) {
      // ✅ FIX: Validate form before saving
      // ✅ UPDATED: For listening, question can be empty (only read in audio)
      if (selectedTestType !== 'listening' && !questionForm.question) {
        alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
        return;
      }
      if (!selectedSection) {
        alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
        return;
      }
      
      const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        alert('⚠️ Cần ít nhất 2 lựa chọn!');
        return;
      }
      
      // ✅ FIX: Update the edited question in importedQuestions array
      const updatedImportedQuestions = importedQuestions.map(q => {
        if (String(q.id) === String(editingQuestion.id)) {
          // Update with form data
          return {
            ...q,
            id: questionForm.id,
            category: questionForm.category || selectedTestType,
            question: questionForm.question,
            options: validOptions,
            correctAnswer: questionForm.correctAnswer,
            explanation: questionForm.explanation
          };
        }
        return q;
      });
      
      // ✅ FIX: Save ALL imported questions (including the edited one) to section
      const updatedSections = sections.map((section) => {
        if (section.id === selectedSection.id) {
          const existingQuestions = [...(section.questions || [])];
          
          // Add/update all imported questions
          updatedImportedQuestions.forEach((normalizedQ) => {
            const existingIndex = existingQuestions.findIndex(
              q => String(q.id) === String(normalizedQ.id)
            );
            
            if (existingIndex !== -1) {
              existingQuestions[existingIndex] = {
                ...normalizedQ,
                options: normalizedQ.options.filter(opt => opt.trim() !== '')
              };
            } else {
              existingQuestions.push({
                ...normalizedQ,
                options: normalizedQ.options.filter(opt => opt.trim() !== '')
              });
            }
          });
          
          // Sort questions by ID
          existingQuestions.sort((a, b) => {
            const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
            const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
            return idA - idB;
          });
          
          return { ...section, questions: existingQuestions };
        }
        return section;
      });
      
      await saveSections(updatedSections);
      setSections(updatedSections);
      
      // Clear import mode
      setImportedQuestions([]);
      setIsImportMode(false);
      
      setShowQuestionForm(false);
      setAutoGeneratedId(null);
      setEditingQuestion(null);
      
      alert(`✅ Đã lưu thành công ${updatedImportedQuestions.length} câu hỏi (bao gồm câu đã sửa) vào section!\n\n` +
            `📝 Câu hỏi ID: ${questionForm.id} đã được cập nhật.\n` +
            `💾 Tất cả ${updatedImportedQuestions.length} câu hỏi đã được lưu vào hệ thống.`);
    } else {
      // Normal save (not from imported questions)
      const result = await saveQuestionData();
      if (result?.success) {
        setShowQuestionForm(false);
        setAutoGeneratedId(null);
        setEditingQuestion(null);
        alert(`✅ ${t('examManagement.config.saveSuccess')}\n\n` +
              `❓ ${editingQuestion ? t('examManagement.questions.questionForm.questionSaved') : t('examManagement.questions.questionForm.questionAdded')} ${t('examManagement.questions.questionForm.questionSavedText')}:\n` +
              `   - ID: ${result.questionId || 'N/A'}\n` +
              `   - ${t('examManagement.questions.testTypes.knowledge')}: ${getTestTypeLabel(selectedTestType) || selectedTestType}\n` +
              `   - ${t('examManagement.exams.table.title')}: ${selectedExam?.title || selectedExam?.id}\n\n` +
              `💾 ${t('examManagement.questions.questionForm.savedToSystem')}`);
      }
    }
  };

  // ✅ NEW: Handle save and add new question (save, reset form, keep form open)
  const handleSaveAndAddNew = async (e) => {
    e.preventDefault();
    
    // ✅ NEW: Check if editing question from imported questions
    const isEditingFromImported = editingQuestion && importedQuestions.length > 0 && 
      importedQuestions.some(q => String(q.id) === String(editingQuestion.id));
    
    if (isEditingFromImported) {
      // ✅ FIX: Validate form before saving
      // ✅ UPDATED: For listening, question can be empty (only read in audio)
      if (selectedTestType !== 'listening' && !questionForm.question) {
        alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
        return;
      }
      if (!selectedSection) {
        alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
        return;
      }
      
      const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        alert('⚠️ Cần ít nhất 2 lựa chọn!');
        return;
      }
      
      // ✅ FIX: Update the edited question in importedQuestions array
      const updatedImportedQuestions = importedQuestions.map(q => {
        if (String(q.id) === String(editingQuestion.id)) {
          // Update with form data
          return {
            ...q,
            id: questionForm.id,
            category: questionForm.category || selectedTestType,
            question: questionForm.question,
            options: validOptions,
            correctAnswer: questionForm.correctAnswer,
            explanation: questionForm.explanation
          };
        }
        return q;
      });
      
      // ✅ FIX: Save ALL imported questions (including the edited one) to section
      const updatedSections = sections.map((section) => {
        if (section.id === selectedSection.id) {
          const existingQuestions = [...(section.questions || [])];
          
          // Add/update all imported questions
          updatedImportedQuestions.forEach((normalizedQ) => {
            const existingIndex = existingQuestions.findIndex(
              q => String(q.id) === String(normalizedQ.id)
            );
            
            if (existingIndex !== -1) {
              existingQuestions[existingIndex] = {
                ...normalizedQ,
                options: normalizedQ.options.filter(opt => opt.trim() !== '')
              };
            } else {
              existingQuestions.push({
                ...normalizedQ,
                options: normalizedQ.options.filter(opt => opt.trim() !== '')
              });
            }
          });
          
          // Sort questions by ID
          existingQuestions.sort((a, b) => {
            const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
            const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
            return idA - idB;
          });
          
          return { ...section, questions: existingQuestions };
        }
        return section;
      });
      
      await saveSections(updatedSections);
      setSections(updatedSections);
      
      // ✅ FIX: Calculate nextId from updatedSections (not from nextQuestionIdSuggestion which may be stale)
      // Get all questions from updated sections for the current test type
      const allQuestionsFromUpdatedSections = updatedSections.flatMap(s => s.questions || []);
      const maxId = allQuestionsFromUpdatedSections.length > 0
        ? Math.max(...allQuestionsFromUpdatedSections.map(q => {
            const numericId = typeof q.id === 'number' ? q.id : parseInt(q.id) || 0;
            return Number.isFinite(numericId) ? numericId : 0;
          }))
        : 0;
      const nextId = maxId + 1;
      
      // Clear import mode
      setImportedQuestions([]);
      setIsImportMode(false);
      
      // Reset form for new question
      setQuestionForm({
        id: String(nextId),
        category: selectedTestType,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      setAutoGeneratedId(nextId);
      setEditingQuestion(null);
      
      // Reset textarea refs
      if (questionTextareaRef.current) {
        questionTextareaRef.current.value = '';
        handleTextareaResize('question');
      }
      // ✅ ContentEditable is controlled, no need to clear ref
      
      alert(`✅ Đã lưu thành công ${updatedImportedQuestions.length} câu hỏi (bao gồm câu đã sửa) vào section!\n\n` +
            `📝 Câu hỏi ID: ${questionForm.id} đã được cập nhật.\n` +
            `💾 Tất cả ${updatedImportedQuestions.length} câu hỏi đã được lưu vào hệ thống.\n\n` +
            `➕ Sẵn sàng thêm câu hỏi mới!`);
    } else {
      // Normal save (not from imported questions)
      const result = await saveQuestionData();
      if (result?.success) {
        // ✅ FIX: Tính nextId từ updatedSections vừa save (kết hợp với sections chưa update từ examData)
        // Knowledge và Reading cùng một phần thi → tính từ cả 2
        let nextId = 1;
        if (result.updatedSections && examData) {
          if (selectedTestType === 'knowledge' || selectedTestType === 'reading') {
            // Kết hợp updatedSections với sections chưa update từ examData
            const allKnowledgeSections = [
              ...result.updatedSections.filter(s => 
                examData?.knowledge?.sections?.some(ks => ks.id === s.id)
              ),
              ...(examData?.knowledge?.sections || []).filter(s => 
                !result.updatedSections.some(us => us.id === s.id)
              )
            ];
            const allReadingSections = [
              ...result.updatedSections.filter(s => 
                examData?.reading?.sections?.some(rs => rs.id === s.id)
              ),
              ...(examData?.reading?.sections || []).filter(s => 
                !result.updatedSections.some(us => us.id === s.id)
              )
            ];
            
            const allQuestions = [
              ...allKnowledgeSections.flatMap(s => s.questions || []),
              ...allReadingSections.flatMap(s => s.questions || [])
            ];
            
            if (allQuestions.length > 0) {
              const maxId = Math.max(...allQuestions.map(q => getNumericIdFromQuestion(q)));
              nextId = Number.isFinite(maxId) ? maxId + 1 : 1;
            }
          } else if (selectedTestType === 'listening') {
            const allListeningSections = [
              ...result.updatedSections.filter(s => 
                examData?.listening?.sections?.some(ls => ls.id === s.id)
              ),
              ...(examData?.listening?.sections || []).filter(s => 
                !result.updatedSections.some(us => us.id === s.id)
              )
            ];
            const allQuestions = allListeningSections.flatMap(s => s.questions || []);
            
            if (allQuestions.length > 0) {
              const maxId = Math.max(...allQuestions.map(q => getNumericIdFromQuestion(q)));
              nextId = Number.isFinite(maxId) ? maxId + 1 : 1;
            }
          }
        } else {
          // Fallback: dùng nextQuestionIdSuggestion nếu không có updatedSections
          nextId = nextQuestionIdSuggestion;
        }
        
        setQuestionForm({
          id: String(nextId),
          category: selectedTestType,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
          // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
        });
        setAutoGeneratedId(nextId);
        setEditingQuestion(null);
        
        // Reset textarea refs
        if (questionTextareaRef.current) {
          questionTextareaRef.current.value = '';
          handleTextareaResize('question');
        }
        // ✅ ContentEditable is controlled, no need to clear ref
        
        alert(`✅ ${t('examManagement.config.saveSuccess')}\n\n` +
              `❓ ${t('examManagement.questions.questionForm.questionAdded')} ${t('examManagement.questions.questionForm.questionSavedText')}:\n` +
              `   - ID: ${result.questionId || 'N/A'}\n\n` +
              `➕ ${t('examManagement.questions.questionForm.readyForNewQuestion') || 'Sẵn sàng thêm câu hỏi mới!'}`);
      }
    }
  };

  // ✅ NEW: Extract save logic to reusable function
  const saveQuestionData = async () => {
    // ✅ UPDATED: For listening, question can be empty (only read in audio)
    if (selectedTestType !== 'listening' && !questionForm.question) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
      return { success: false };
    }
    if (!selectedSection) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
      return { success: false };
    }

    // Validate options
    const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('⚠️ Cần ít nhất 2 lựa chọn!');
      return { success: false };
    }

    // ✅ FIX: Kiểm tra duplicate TRƯỚC khi map để tránh lưu nhầm
    if (!editingQuestion) {
      const targetSection = sections.find(s => s.id === selectedSection.id);
      if (targetSection) {
        const existingQuestions = targetSection.questions || [];
        const isDuplicate = existingQuestions.find(q => {
          if (selectedTestType === 'listening') {
            const numberStr = String(questionForm.id).padStart(2, '0');
            return q.number === numberStr;
          }
          return q.id === questionForm.id;
        });
        
        if (isDuplicate) {
          alert(`⚠️ ${t('examManagement.questions.questionForm.idExistsInSection', { id: questionForm.id })}`);
          return { success: false }; // ✅ FIX: Return early, không lưu gì cả
        }
      }
    }

    // ✅ NEW: Validate listening part has audio for listening questions
    if (selectedTestType === 'listening' && !listeningPartAudio.audioUrl && !examData?.listening?.audioUrl) {
      alert('⚠️ Listening part chưa có audio file. Vui lòng upload audio cho listening part trước khi thêm câu hỏi.');
      return { success: false };
    }

    const updatedSections = sections.map((section) => {
      if (section.id === selectedSection.id) {
        const questions = [...(section.questions || [])];
        
        // Prepare question data with proper structure
        const questionData = {
          id: questionForm.id,
          category: questionForm.category || selectedTestType,
          question: questionForm.question,
          options: validOptions,
          correctAnswer: questionForm.correctAnswer,
          explanation: questionForm.explanation,
          // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
        };

        if (editingQuestion) {
          const index = questions.findIndex(q => {
            if (selectedTestType === 'listening') {
              return q.number === editingQuestion.number;
            }
            return q.id === editingQuestion.id;
          });
          if (index !== -1) {
            questions[index] = questionData;
          } else {
            console.warn('⚠️ Question to edit not found, adding as new question');
            questions.push(questionData);
          }
        } else {
          // ✅ FIX: Đã kiểm tra duplicate ở trên, chỉ cần push
          questions.push(questionData);
        }

        // Sort questions by ID
        questions.sort((a, b) => {
          const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
          const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
          return idA - idB;
        });

        // ✅ FIX: Log để debug
        console.log(`💾 Saving question to section ${section.id}:`, {
          questionId: questionData.id,
          questionPreview: questionData.question?.substring(0, 30) || 'N/A',
          totalQuestionsInSection: questions.length,
          allQuestionIds: questions.map(q => q.id)
        });

        return { ...section, questions };
      }
      return section;
    });

    // ✅ FIX: Log trước khi lưu
    const targetSection = updatedSections.find(s => s.id === selectedSection.id);
    console.log(`💾 About to save sections:`, {
      totalSections: updatedSections.length,
      targetSectionId: selectedSection.id,
      questionsInTargetSection: targetSection?.questions?.length || 0,
      questionIds: targetSection?.questions?.map(q => q.id) || []
    });

    await saveSections(updatedSections);
    
    // ✅ FIX: Return updatedSections để tính nextId chính xác
    return { success: true, questionId: questionForm.id, updatedSections };
  };


  const handleDeleteQuestion = async (section, question) => {
    if (confirm(`⚠️ ${t('examManagement.delete.questionConfirm')}`)) {
      const updatedSections = sections.map(s => {
        if (s.id === section.id) {
          return {
            ...s,
            questions: (s.questions || []).filter(q => q.id !== question.id)
          };
        }
        return s;
      });
      await saveSections(updatedSections);
      alert(`✅ ${t('examManagement.delete.questionSuccess')}`);
    }
  };

  const questionOverview = useMemo(() => {
    if (!examData) return [];
    const summary = [];
    TEST_TYPE_ORDER.forEach((type) => {
      const sectionsList = examData[type]?.sections || [];
      sectionsList.forEach((section) => {
        (section.questions || []).forEach((question) => {
          summary.push({
            id: question.id ? String(question.id) : '',
            numericId: getNumericIdFromQuestion(question),
            testType: type,
            label: getTestTypeLabel(type),
            sectionTitle: section.title || section.id || '',
          });
        });
      });
    });
    return summary.sort((a, b) => {
      if (a.numericId === b.numericId) {
        return TEST_TYPE_ORDER.indexOf(a.testType) - TEST_TYPE_ORDER.indexOf(b.testType);
      }
      return a.numericId - b.numericId;
    });
  }, [examData]);

  // ✅ FIX: Knowledge và Reading đếm liên tục, Listening đếm riêng từ 1
  // ✅ FIX: Tính từ examData đã được normalize (không phải từ questionOverview có thể chưa normalize)
  const nextQuestionIdSuggestion = useMemo(() => {
    if (!examData) return 1;
    
    // ✅ FIX: Normalize lại data để đảm bảo tính chính xác
    const { data: normalizedData } = normalizeExamDataStructure(examData);
    
    // Knowledge và Reading cùng một phần thi → tính từ cả 2
    if (selectedTestType === 'knowledge' || selectedTestType === 'reading') {
      const knowledgeQuestions = (normalizedData.knowledge?.sections || [])
        .flatMap(s => s.questions || [])
        .map(q => getNumericIdFromQuestion(q));
      const readingQuestions = (normalizedData.reading?.sections || [])
        .flatMap(s => s.questions || [])
        .map(q => getNumericIdFromQuestion(q));
      const allIds = [...knowledgeQuestions, ...readingQuestions];
      if (allIds.length === 0) return 1;
      const maxId = Math.max(...allIds);
      return Number.isFinite(maxId) ? maxId + 1 : 1;
    }
    // Listening là phần thi riêng → chỉ tính từ listening
    else if (selectedTestType === 'listening') {
      const listeningQuestions = (normalizedData.listening?.sections || [])
        .flatMap(s => s.questions || [])
        .map(q => getNumericIdFromQuestion(q));
      if (listeningQuestions.length === 0) return 1;
      const maxId = Math.max(...listeningQuestions);
      return Number.isFinite(maxId) ? maxId + 1 : 1;
    }
    return 1;
  }, [examData, selectedTestType]);

  // ✅ FIX: Knowledge và Reading kiểm tra duplicate chung, Listening riêng
  const existingQuestionIdsSet = useMemo(() => {
    // Knowledge và Reading cùng một phần thi → kiểm tra duplicate chung
    if (selectedTestType === 'knowledge' || selectedTestType === 'reading') {
      const combinedQuestions = questionOverview.filter(
        (item) => item.testType === 'knowledge' || item.testType === 'reading'
      );
      return new Set(combinedQuestions.map((item) => String(item.id || item.numericId)));
    }
    // Listening là phần thi riêng → chỉ kiểm tra trong listening
    else if (selectedTestType === 'listening') {
      const listeningQuestions = questionOverview.filter(
        (item) => item.testType === 'listening'
      );
      return new Set(listeningQuestions.map((item) => String(item.id || item.numericId)));
    }
    return new Set();
  }, [questionOverview, selectedTestType]);

  const isDuplicateQuestionId = useMemo(() => {
    if (editingQuestion) return false;
    if (!questionForm.id) return false;
    return existingQuestionIdsSet.has(String(questionForm.id));
  }, [editingQuestion, questionForm.id, existingQuestionIdsSet]);

  // Statistics
  const examStats = useMemo(() => {
    if (!examData) return null;
    
    const knowledgeCount = examData.knowledge?.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0;
    const readingCount = examData.reading?.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0;
    const listeningCount = examData.listening?.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0;
    
    const knowledgeTime = examData.knowledge?.sections?.reduce((sum, s) => sum + (s.timeLimit || 0), 0) || 0;
    const listeningTime = examData.listening?.sections?.reduce((sum, s) => sum + (s.timeLimit || 0), 0) || 0;
    
    return {
      knowledge: { count: knowledgeCount, time: knowledgeTime },
      reading: { count: readingCount },
      listening: { count: listeningCount, time: listeningTime },
      total: knowledgeCount + readingCount + listeningCount
    };
  }, [examData]);

  const isExamComplete = useMemo(() => {
    if (!examStats) return false;
    return TEST_TYPE_ORDER.every((type) => (examStats[type]?.count || 0) > 0);
  }, [examStats]);

  // ✅ UPDATED: Generate Gemini Prompt Template - dynamically adjust based on selected section
  const geminiPromptTemplate = useMemo(() => {
    const testTypeLabel = getTestTypeLabel(selectedTestType) || selectedTestType;
    const sectionInfo = selectedSection 
      ? `\n- Section hiện tại: "${selectedSection.title}"\n- Instruction: "${selectedSection.instruction || '[Chưa có instruction]'}"`
      : '\n- Chưa chọn section (sẽ áp dụng cho tất cả sections)';
    
    let formatExample = '';
    if (selectedTestType === 'reading') {
      formatExample = `{
  "id": "11",
  "category": "reading",
  "question": "本文の内容と合っているものはどれか。",
  "passage": "長い文章の内容がここに入ります。",
  "options": [
    "選択肢1",
    "選択肢2",
    "選択肢3",
    "選択肢4"
  ],
  "correctAnswer": 3,
  "explanation": "本文の第2段落に...。"
}`;
    } else if (selectedTestType === 'listening') {
      formatExample = `{
  "id": "30",
  "category": "listening",
  "question": "音声を聞いて、最も正しい答えを選びなさい。",
  "options": [
    "選択肢1",
    "選択肢2",
    "選択肢3",
    "選択肢4"
  ],
  "correctAnswer": 2,
  "explanation": "音声中のキーフレーズ...。"
}`;
    } else {
      // knowledge
      formatExample = `{
  "id": "1",
  "category": "knowledge",
  "question": "余暇の楽しみ方は色々ある。",
  "options": [
    "ようか",
    "よか",
    "よが",
    "ようが"
  ],
  "correctAnswer": 2,
  "explanation": "余暇 (よか) : Thời gian rảnh rỗi, lúc rảnh rỗi."
}`;
    }
    
    return `Bạn là chuyên gia xử lý đề thi JLPT. Nhiệm vụ của bạn là phân tích ảnh câu hỏi và trả về JSON theo format sau:

${formatExample}

QUAN TRỌNG - ĐỌC KỸ:
1. correctAnswer phải là số 1, 2, 3, hoặc 4 (1-based), KHÔNG phải 0, 1, 2, 3 (0-based)
   - Đáp án ① = 1, ② = 2, ③ = 3, ④ = 4
   - Lấy từ ảnh đáp án (ảnh thứ 2 nếu có)
2. options chỉ chứa nội dung, KHÔNG có số thứ tự phía trước
   - Đúng: ["ようか", "よか", "よが", "ようが"]
   - Sai: ["1 ようか", "2 よか", "3 よが", "4 ようが"]
   - Trích xuất từ ảnh câu hỏi
3. question giữ nguyên format từ ảnh (có thể có gạch chân, chỗ trống, đoạn văn...)
   - Không thêm số thứ tự vào đầu question
   - Không thêm instruction của section vào question
   - Trích xuất chính xác từ ảnh câu hỏi
4. explanation: TRÍCH XUẤT từ ảnh đáp án (ảnh thứ 2), KHÔNG tự tạo giải thích
   - Nếu ảnh đáp án có giải thích/note → copy nguyên văn vào explanation
   - Nếu ảnh đáp án chỉ có đáp án đúng (ví dụ: "② よか") → explanation có thể để trống hoặc chỉ ghi đáp án
   - KHÔNG tự giải thích hay tạo nội dung mới
${selectedTestType === 'reading' ? '5. passage: Đoạn văn dài - trích xuất từ ảnh nếu có\n' : ''}${selectedTestType === 'listening' ? '5. listening: Audio được quản lý riêng, không cần thêm vào JSON\n' : ''}
LƯU Ý:
- Bạn chỉ cần TRÍCH XUẤT và FORMAT lại thông tin từ ảnh thành JSON
- KHÔNG tự tạo nội dung, KHÔNG tự giải thích
- Tất cả thông tin phải có trong ảnh đã cung cấp

Thông tin context (để tham khảo - KHÔNG cần thêm vào JSON):
- Loại câu hỏi: ${testTypeLabel}${sectionInfo}
${selectedSection ? `\n⚠️ LƯU Ý QUAN TRỌNG: Instruction "${selectedSection.instruction || '[Chưa có]'}" là của Section này, KHÔNG được thêm vào field "question" trong JSON. Field "question" chỉ chứa nội dung câu hỏi từ ảnh.` : ''}

Hãy phân tích ảnh câu hỏi và ảnh đáp án, trích xuất thông tin và trả về JSON chính xác theo format trên.`;
  }, [selectedTestType, selectedSection]);

  const canSwitchToTestType = useCallback((targetType) => {
    const targetIndex = TEST_TYPE_ORDER.indexOf(targetType);
    if (targetIndex <= 0) return true;
    if (!examStats) return false;
    for (let i = 0; i < targetIndex; i += 1) {
      const previousType = TEST_TYPE_ORDER[i];
      if ((examStats[previousType]?.count || 0) === 0) {
        return false;
      }
    }
    return true;
  }, [examStats]);

  const handleTestTypeChange = useCallback((type) => {
    if (type === selectedTestType) return;
    if (!canSwitchToTestType(type)) {
      alert(getTestTypeBlockMessage(type));
      return;
    }
    setSelectedTestType(type);
    setSelectedSection(null);
  }, [canSwitchToTestType, selectedTestType]);

  const handleFinalizeExam = async () => {
    if (!selectedExam || !examData) {
      alert('⚠️ Vui lòng chọn đề thi trước khi lưu.');
      return;
    }
    if (!isExamComplete) {
      alert(`⚠️ ${t('examManagement.questions.warning')}`);
      return;
    }
    setIsFinalizingExam(true);
    try {
      const { data: normalizedExam } = normalizeExamDataStructure(examData);
      setExamData(normalizedExam);
      await storageManager.saveExam(selectedLevel, selectedExam.id, normalizedExam);
      alert(`✅ ${t('examManagement.finalize.success')}`);
    } catch (error) {
      console.error('❌ Lỗi khi lưu tổng đề thi:', error);
      alert(`❌ ${t('examManagement.finalize.error')}`);
    } finally {
      setIsFinalizingExam(false);
    }
  };

  // ✅ UPDATED: Improved JSON import with flexible format support (like Quiz Editor)
  const handleQuestionJSONUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const resetInput = () => {
      event.target.value = '';
    };
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('⚠️ Vui lòng chọn file JSON hợp lệ.');
      resetInput();
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result;
        const data = typeof text === 'string' ? JSON.parse(text) : JSON.parse(new TextDecoder().decode(text));
        
        // ✅ NEW: Support multiple JSON formats (like Quiz Editor)
        const questionsPayload = extractQuestionsFromJSON(data);
        
        if (questionsPayload.length === 0) {
          // Single question format (backward compatibility)
          const normalizedQuestion = normalizeImportedQuestion(data, 0);
          
          if (!normalizedQuestion.question) {
            alert('⚠️ JSON chưa có nội dung câu hỏi.');
            resetInput();
            return;
          }

          // ✅ UPDATED: For listening, check if question has audioUrl (backward compatibility)
          // If yes, we'll need to migrate it to section
          if (selectedTestType === 'listening' && normalizedQuestion.audioUrl && !selectedSection?.audioUrl) {
            // Question has audio but section doesn't - need to migrate
            console.log('⚠️ [Backward Compatibility] Question has audioUrl, will need to migrate to section');
            alert('⚠️ Lưu ý: Câu hỏi có audioUrl (format cũ). Audio sẽ cần được migrate lên section. Vui lòng kiểm tra section có audio chưa.');
          }

          setQuestionForm({
            ...normalizedQuestion,
            category: selectedTestType,
            // ✅ Remove audio fields from questionForm (they're now at section level)
            audioUrl: '',
            audioPath: '',
            audioName: '',
            // ✅ Keep timing fields
            startTime: normalizedQuestion.startTime,
            endTime: normalizedQuestion.endTime
          });
          setAutoGeneratedId(normalizedQuestion.id);
          setExportedJSON(JSON.stringify(data, null, 2));
          setShowPreview(true);
          setEditingQuestion(null);
          alert('✅ Đã nạp JSON vào form. Vui lòng kiểm tra trước khi lưu.');
        } else {
          // ✅ UPDATED: Multiple questions format - Auto-save all questions to section (like Quiz Editor)
          if (!selectedSection) {
            alert('⚠️ Vui lòng chọn section trước khi import nhiều câu hỏi.');
            resetInput();
            return;
          }

          // Normalize all questions
          const normalizedQuestions = questionsPayload.map((q, idx) => {
            const normalized = normalizeImportedQuestion(q, idx);
            return {
              ...normalized,
              category: selectedTestType
            };
          });

          // ✅ UPDATED: Validate all questions - for listening, question can be empty
          const invalidQuestions = normalizedQuestions.filter(q => {
            // Listening questions can have empty question (only read in audio)
            if (selectedTestType === 'listening') {
              return false; // Allow empty question for listening
            }
            return !q.question || !q.question.trim();
          });
          if (invalidQuestions.length > 0) {
            alert(`⚠️ Có ${invalidQuestions.length} câu hỏi không hợp lệ (thiếu nội dung).`);
            resetInput();
            return;
          }

          // ✅ UPDATED: For listening, handle backward compatibility (migrate audio from question to section)
          if (selectedTestType === 'listening') {
            // Check if any question has audioUrl (old format)
            const questionsWithAudio = normalizedQuestions.filter(q => q.audioUrl);
            if (questionsWithAudio.length > 0 && !selectedSection.audioUrl) {
              // Migrate audio from first question to section
              const firstQuestionWithAudio = questionsWithAudio[0];
              console.log('✅ [Backward Compatibility] Migrating audio from question to section:', {
                questionId: firstQuestionWithAudio.id,
                audioUrl: firstQuestionWithAudio.audioUrl,
                audioPath: firstQuestionWithAudio.audioPath,
                audioName: firstQuestionWithAudio.audioName
              });
              
              // Update section with audio
              const sectionIndex = sections.findIndex(s => s.id === selectedSection.id);
              if (sectionIndex !== -1) {
                sections[sectionIndex] = {
                  ...sections[sectionIndex],
                  audioUrl: firstQuestionWithAudio.audioUrl,
                  audioPath: firstQuestionWithAudio.audioPath || '',
                  audioName: firstQuestionWithAudio.audioName || ''
                };
                // Update selectedSection state
                setSelectedSection(sections[sectionIndex]);
              }
              
              // Remove audio fields from all questions (they're now at section level)
              normalizedQuestions.forEach(q => {
                delete q.audioUrl;
                delete q.audioPath;
                delete q.audioName;
              });
              
              alert(`✅ Đã migrate audio từ question lên section (backward compatibility).\n\nAudio: ${firstQuestionWithAudio.audioName || firstQuestionWithAudio.audioUrl || 'N/A'}`);
            }
            
            // ✅ UPDATED: Check if listening part has audio (required for listening)
            const hasAudio = listeningPartAudio.audioUrl || examData?.listening?.audioUrl;
            if (!hasAudio) {
              alert('⚠️ Listening part chưa có audio file. Vui lòng upload audio cho listening part trước khi import questions (ở phần trên, không phải Section Form).');
              resetInput();
              return;
            }
          }

          // ✅ Auto-save all questions to section
          const updatedSections = sections.map((section) => {
            if (section.id === selectedSection.id) {
              const existingQuestions = [...(section.questions || [])];
              
              // Add all imported questions
              normalizedQuestions.forEach((normalizedQ) => {
                // Check for duplicate ID
                const existingIndex = existingQuestions.findIndex(
                  q => String(q.id) === String(normalizedQ.id)
                );
                
                // ✅ Prepare question data (remove audio fields, keep timing)
                const questionData = {
                  id: normalizedQ.id,
                  category: normalizedQ.category || selectedTestType,
                  question: normalizedQ.question,
                  options: normalizedQ.options.filter(opt => opt.trim() !== ''),
                  correctAnswer: normalizedQ.correctAnswer,
                  explanation: normalizedQ.explanation,
                  // ✅ For listening, include timing (not audio)
                  ...(selectedTestType === 'listening' && {
                    startTime: normalizedQ.startTime !== undefined ? normalizedQ.startTime : undefined,
                    endTime: normalizedQ.endTime !== undefined ? normalizedQ.endTime : undefined
                  })
                };
                
                if (existingIndex !== -1) {
                  // Update existing question
                  existingQuestions[existingIndex] = questionData;
                } else {
                  // Add new question
                  existingQuestions.push(questionData);
                }
              });

              // Sort questions by ID
              existingQuestions.sort((a, b) => {
                const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
                const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
                return idA - idB;
              });

              return { ...section, questions: existingQuestions };
            }
            return section;
          });

          // ✅ UPDATED: Instead of saving immediately, load all questions into form (like Quiz Editor)
          // Convert normalized questions to form format
          const questionsForForm = normalizedQuestions.map(q => {
            // ✅ FIX: correctAnswer đã được normalize từ normalizeImportedQuestion rồi (0-based, 0-3)
            // Chỉ cần đảm bảo nó là số hợp lệ (0-3), không cần normalize lại
            let finalCorrectAnswer = 0;
            if (typeof q.correctAnswer === 'number') {
              // normalizeImportedQuestion đã convert về 0-based rồi, chỉ cần validate
              if (q.correctAnswer >= 0 && q.correctAnswer < 4) {
                finalCorrectAnswer = q.correctAnswer;
              }
            } else if (typeof q.correctAnswer === 'string') {
              // Nếu vẫn là string (chưa được normalize), normalize lại
              const numValue = parseInt(q.correctAnswer, 10);
              if (!isNaN(numValue)) {
                if (numValue >= 1 && numValue <= 4) {
                  // 1-based index (1, 2, 3, 4) - convert to 0-based (0, 1, 2, 3)
                  finalCorrectAnswer = numValue - 1;
                } else if (numValue >= 0 && numValue < 4) {
                  // 0-based index (0, 1, 2, 3) - use as is
                  finalCorrectAnswer = numValue;
                }
              } else {
                // Not a number, try as letter (A, B, C, D)
                const letterIndex = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer.toUpperCase());
                if (letterIndex >= 0) {
                  finalCorrectAnswer = letterIndex;
                }
              }
            }
            
            // ✅ DEBUG: Log for first 3 questions
            if (normalizedQuestions.indexOf(q) < 3) {
              console.log(`🔍 [Form Q${normalizedQuestions.indexOf(q) + 1}] Original correctAnswer:`, q.correctAnswer, `Type:`, typeof q.correctAnswer, `→ Final:`, finalCorrectAnswer);
            }
            
            return {
              id: q.id,
              category: q.category || selectedTestType,
              question: q.question || '',
              options: q.options || ['', '', '', ''],
              correctAnswer: finalCorrectAnswer, // ✅ Use normalized value
              explanation: q.explanation || '',
              // ✅ UPDATED: For listening, include timing (not audio)
              ...(selectedTestType === 'listening' && {
                startTime: q.startTime !== undefined ? q.startTime : undefined,
                endTime: q.endTime !== undefined ? q.endTime : undefined
              })
            };
          });

          // Set imported questions state
          setImportedQuestions(questionsForForm);
          setIsImportMode(true);
          
          // Load first question into form for editing
          const firstQuestion = questionsForForm[0];
          setQuestionForm({
            ...firstQuestion,
            category: selectedTestType,
            audioFile: null
          });
          setAutoGeneratedId(firstQuestion.id);
          setExportedJSON(JSON.stringify(questionsPayload, null, 2));
          setShowPreview(true);
          setEditingQuestion(null);
          
          alert(
            `✅ Đã import thành công ${normalizedQuestions.length} câu hỏi!\n\n` +
            `📝 Tất cả ${normalizedQuestions.length} câu hỏi đã được load vào form.\n` +
            `👁️ Bạn có thể xem và edit tất cả các câu hỏi trong form.\n\n` +
            `💡 Sau khi chỉnh sửa xong, click "Lưu tất cả câu hỏi" để lưu vào section.`
          );
        }
      } catch (error) {
        console.error('Invalid JSON file', error);
        alert('❌ Không thể đọc file JSON. Kiểm tra lại định dạng!');
      } finally {
        resetInput();
      }
    };
    reader.onerror = () => {
      alert('❌ Lỗi khi đọc file JSON.');
      resetInput();
    };
    reader.readAsText(file);
  };

  // ✅ NEW: Preview modal helper functions
  // Check if question is complete
  const isQuestionComplete = (q) => {
    const hasQuestion = q.question && q.question.trim();
    const options = Array.isArray(q.options) 
      ? q.options 
      : (q.options && typeof q.options === 'object' 
          ? Object.values(q.options) 
          : []);
    const allOptionsValid = options.length >= 4 && options.every(opt => {
      const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || '');
      return optText && optText.trim();
    });
    const hasCorrect = q.correctAnswer !== null && q.correctAnswer !== undefined;
    return hasQuestion && allOptionsValid && hasCorrect;
  };

  // Get filtered and sorted questions for preview
  const getFilteredAndSortedQuestions = () => {
    if (!selectedSection || !selectedSection.questions) return [];
    
    let filtered = [...selectedSection.questions];

    // Apply filter
    if (previewFilter === 'complete') {
      filtered = filtered.filter(q => isQuestionComplete(q));
    } else if (previewFilter === 'incomplete') {
      filtered = filtered.filter(q => !isQuestionComplete(q));
    }

    // Apply sort
    if (previewSortBy === 'id') {
      filtered.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
        const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
        return idA - idB;
      });
    } else if (previewSortBy === 'status') {
      filtered.sort((a, b) => {
        const aComplete = isQuestionComplete(a);
        const bComplete = isQuestionComplete(b);
        if (aComplete === bComplete) {
          const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
          const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
          return idA - idB;
        }
        return aComplete ? 1 : -1; // Incomplete first
      });
    }

    return filtered;
  };

  // Copy question to clipboard (from preview)
  const handleCopyQuestionPreview = async (question) => {
    const options = Array.isArray(question.options) 
      ? question.options 
      : (question.options && typeof question.options === 'object' 
          ? Object.values(question.options) 
          : []);
    
    const correctAnswer = typeof question.correctAnswer === 'number' 
      ? String.fromCharCode(65 + question.correctAnswer)
      : (question.correctAnswer || 'N/A');

    const questionText = `
Câu hỏi ${question.id || question.number || 'N/A'}:
${question.question || '(Chưa nhập)'}

Đáp án:
${options.map((opt, idx) => {
  const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || '');
  return `${String.fromCharCode(65 + idx)}. ${optText || '(Chưa nhập)'}`;
}).join('\n')}

Đáp án đúng: ${correctAnswer}
${question.explanation ? `\nGiải thích:\n${question.explanation}` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(questionText);
      alert(`✅ Đã copy câu hỏi ${question.id || question.number || 'N/A'} vào clipboard!`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = questionText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`✅ Đã copy câu hỏi ${question.id || question.number || 'N/A'} vào clipboard!`);
    }
  };

  // Copy all questions to clipboard
  const handleCopyAllQuestions = async () => {
    if (!selectedSection || !selectedSection.questions || selectedSection.questions.length === 0) {
      alert('⚠️ Không có câu hỏi nào để copy!');
      return;
    }

    const allQuestionsText = selectedSection.questions.map(q => {
      const options = Array.isArray(q.options) 
        ? q.options 
        : (q.options && typeof q.options === 'object' 
            ? Object.values(q.options) 
            : []);
      
      const correctAnswer = typeof q.correctAnswer === 'number' 
        ? String.fromCharCode(65 + q.correctAnswer)
        : (q.correctAnswer || 'N/A');

      return `
Câu hỏi ${q.id || q.number || 'N/A'}:
${q.question || '(Chưa nhập)'}

Đáp án:
${options.map((opt, idx) => {
  const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || '');
  return `${String.fromCharCode(65 + idx)}. ${optText || '(Chưa nhập)'}`;
}).join('\n')}

Đáp án đúng: ${correctAnswer}
${q.explanation ? `\nGiải thích:\n${q.explanation}` : ''}
---
      `.trim();
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(allQuestionsText);
      alert(`✅ Đã copy tất cả ${selectedSection.questions.length} câu hỏi vào clipboard!`);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = allQuestionsText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`✅ Đã copy tất cả ${selectedSection.questions.length} câu hỏi vào clipboard!`);
    }
  };

  // Print preview
  const handlePrintPreview = () => {
    if (!selectedSection || !selectedSection.questions || selectedSection.questions.length === 0) {
      alert('⚠️ Không có câu hỏi nào để in!');
      return;
    }

    const printWindow = window.open('', '_blank');
    const questions = getFilteredAndSortedQuestions();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview Quiz - ${selectedSection.title || selectedSection.id || 'Section'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .section-title { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 20px; }
            .question { margin-bottom: 30px; padding: 15px; border: 2px solid #000; border-radius: 8px; }
            .question-header { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .question-text { margin-bottom: 15px; line-height: 1.6; }
            .options { margin-bottom: 15px; }
            .option { padding: 8px; margin-bottom: 5px; border: 1px solid #ccc; border-radius: 4px; }
            .option.correct { background-color: #d1fae5; border-color: #10b981; font-weight: bold; }
            .explanation { margin-top: 15px; padding: 10px; background-color: #f3e8ff; border-left: 4px solid #9333ea; }
            .incomplete { background-color: #fef3c7; border-color: #f59e0b; }
            @media print {
              body { padding: 10px; }
              .question { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="section-title">${selectedSection.title || selectedSection.id || 'Section'}</div>
          <p>Số câu hỏi: ${questions.length}</p>
          ${questions.map((q, idx) => {
            const isComplete = isQuestionComplete(q);
            const options = Array.isArray(q.options) 
              ? q.options 
              : (q.options && typeof q.options === 'object' 
                  ? Object.values(q.options) 
                  : []);
            const correctAnswer = typeof q.correctAnswer === 'number' 
              ? String.fromCharCode(65 + q.correctAnswer)
              : (q.correctAnswer || 'N/A');
            
            return `
              <div class="question ${!isComplete ? 'incomplete' : ''}">
                <div class="question-header">Câu hỏi ${q.id || q.number || idx + 1}${!isComplete ? ' ⚠️ (Chưa hoàn chỉnh)' : ''}</div>
                <div class="question-text">${q.question || '(Chưa nhập)'}</div>
                <div class="options">
                  ${options.map((opt, optIdx) => {
                    const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || '');
                    const isCorrect = typeof q.correctAnswer === 'number' 
                      ? q.correctAnswer === optIdx
                      : (q.correctAnswer === String.fromCharCode(65 + optIdx));
                    return `
                      <div class="option ${isCorrect ? 'correct' : ''}">
                        ${String.fromCharCode(65 + optIdx)}. ${optText || '(Chưa nhập)'} ${isCorrect ? '✓' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
                ${correctAnswer !== 'N/A' ? `<p><strong>Đáp án đúng: ${correctAnswer}</strong></p>` : ''}
                ${q.explanation ? `<div class="explanation"><strong>Giải thích:</strong><br>${q.explanation}</div>` : ''}
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Keyboard navigation for preview
  useEffect(() => {
    if (!showPreview) return;

    const handleKeyDown = (e) => {
      if (!previewContentRef.current) return;

      // Arrow keys for scrolling
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        previewContentRef.current.scrollBy({ top: 100, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        previewContentRef.current.scrollBy({ top: -100, behavior: 'smooth' });
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        previewContentRef.current.scrollBy({ top: 500, behavior: 'smooth' });
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        previewContentRef.current.scrollBy({ top: -500, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        previewContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        previewContentRef.current.scrollTo({ top: previewContentRef.current.scrollHeight, behavior: 'smooth' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview]);

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div 
        ref={containerContentsRef}
        className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              📋 {t('examManagement.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('examManagement.subtitle')}
            </p>
          </div>
        </div>

        {/* Level Selection */}
        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            {t('examManagement.selectLevel')}
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
          >
            <option value="n1">N1</option>
            <option value="n2">N2</option>
            <option value="n3">N3</option>
            <option value="n4">N4</option>
            <option value="n5">N5</option>
          </select>
        </div>

        {/* Sub Tabs */}
        <div className="mb-4 sm:mb-6 bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 sm:p-2 flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2">
        {/* ✅ Chỉ admin mới thấy tab Config */}
        {!isEditor && (
          <button
            onClick={() => setActiveSubTab('config')}
            className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
              activeSubTab === 'config'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="hidden sm:inline">⚙️ </span>{t('examManagement.tabs.config')}
          </button>
        )}
        <button
          onClick={() => setActiveSubTab('exams')}
          className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeSubTab === 'exams'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">📋 </span>{t('examManagement.tabs.exams')}
        </button>
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`flex-1 min-w-full sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeSubTab === 'questions'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">✏️ </span>{t('examManagement.tabs.questions')}
        </button>
        </div>

        {/* Config Tab - Chỉ admin mới thấy */}
        {!isEditor && activeSubTab === 'config' && (
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            ⚙️ {t('examManagement.config.title', { level: selectedLevel.toUpperCase() })}
          </h2>
          
          <div className="space-y-6">
            {/* Level Overall Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                📊 {t('examManagement.config.overall.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.overall.passingScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.passingScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      passingScore: parseInt(e.target.value) || 0
                    })}
                    min="0"
                    max={levelConfig.maxScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('examManagement.config.overall.passingScoreHint')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tối đa *
                  </label>
                  <input
                    type="number"
                    value={levelConfig.maxScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      maxScore: parseInt(e.target.value) || 0
                    })}
                    min={levelConfig.passingScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('examManagement.config.overall.maxScoreHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Knowledge Test Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                📚 {t('examManagement.config.knowledge.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.knowledge.minScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.knowledge.minScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      knowledge: {
                        ...levelConfig.knowledge,
                        minScore: parseInt(e.target.value) || 0
                      }
                    })}
                    min="0"
                    max={levelConfig.knowledge.maxScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.knowledge.maxScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.knowledge.maxScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      knowledge: {
                        ...levelConfig.knowledge,
                        maxScore: parseInt(e.target.value) || 0
                      }
                    })}
                    min={levelConfig.knowledge.minScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.knowledge.timeLimit')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.knowledge.timeLimit}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      knowledge: {
                        ...levelConfig.knowledge,
                        timeLimit: parseInt(e.target.value) || null
                      }
                    })}
                    min="1"
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* Reading Test Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                📖 {t('examManagement.config.reading.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.reading.minScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.reading.minScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      reading: {
                        ...levelConfig.reading,
                        minScore: parseInt(e.target.value) || 0
                      }
                    })}
                    min="0"
                    max={levelConfig.reading.maxScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.reading.maxScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.reading.maxScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      reading: {
                        ...levelConfig.reading,
                        maxScore: parseInt(e.target.value) || 0
                      }
                    })}
                    min={levelConfig.reading.minScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 {t('examManagement.config.reading.noSeparateTime')}
              </p>
            </div>

            {/* Listening Test Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                🎧 {t('examManagement.config.listening.title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.listening.minScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.listening.minScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      listening: {
                        ...levelConfig.listening,
                        minScore: parseInt(e.target.value) || 0
                      }
                    })}
                    min="0"
                    max={levelConfig.listening.maxScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.listening.maxScore')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.listening.maxScore}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      listening: {
                        ...levelConfig.listening,
                        maxScore: parseInt(e.target.value) || 0
                      }
                    })}
                    min={levelConfig.listening.minScore}
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.config.listening.timeLimit')}
                  </label>
                  <input
                    type="number"
                    value={levelConfig.listening.timeLimit}
                    onChange={(e) => setLevelConfig({
                      ...levelConfig,
                      listening: {
                        ...levelConfig.listening,
                        timeLimit: parseInt(e.target.value) || null
                      }
                    })}
                    min="1"
                    className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveLevelConfig}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
              >
                💾 {t('examManagement.config.saveButton')}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Exams List Tab */}
        {activeSubTab === 'exams' && (
          <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                {t('examManagement.exams.title', { count: exams.length })}
              </h2>
              <button
                onClick={handleAddExam}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-0"
              >
                <span>➕</span>
                <span>{t('examManagement.exams.addExam')}</span>
              </button>
            </div>

            {/* Exams Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">{t('examManagement.exams.table.id')}</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">{t('examManagement.exams.table.title')}</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">{t('examManagement.exams.table.date')}</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">{t('examManagement.exams.table.status')}</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[180px]">{t('examManagement.exams.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {exams.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-8 text-center text-gray-500">
                        {t('examManagement.exams.empty')}
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50">
                        {/* ✅ FIX: Format cứng ID - font-mono, không wrap */}
                        <td className="px-3 py-3 text-sm font-mono text-gray-900 whitespace-nowrap w-[120px]">{exam.id}</td>
                        {/* ✅ FIX: Format cứng Tiêu đề - font-medium, có thể wrap */}
                        <td className="px-3 py-3 text-sm font-medium text-gray-900 min-w-[200px]">{exam.title}</td>
                        {/* ✅ FIX: Format cứng Ngày thi - font-normal, không wrap */}
                        <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap w-[120px]">{exam.date}</td>
                        <td className="px-3 py-3 text-sm">
                          <select
                            value={exam.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const updatedExams = exams.map(e => 
                                e.id === exam.id ? { ...e, status: newStatus } : e
                              );
                              await storageManager.saveExams(selectedLevel, updatedExams);
                              setExams(updatedExams);
                            }}
                            className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                              exam.status === t('examManagement.exams.status.available') ? 'bg-green-100 text-green-800' :
                              exam.status === t('examManagement.exams.status.upcoming') ? 'bg-yellow-100 text-yellow-800' :
                              exam.status === t('examManagement.exams.status.ended') ? 'bg-gray-100 text-gray-600' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value={t('examManagement.exams.status.available')}>{t('examManagement.exams.status.available')}</option>
                            <option value={t('examManagement.exams.status.upcoming')}>{t('examManagement.exams.status.upcoming')}</option>
                            <option value={t('examManagement.exams.status.ended')}>{t('examManagement.exams.status.ended')}</option>
                          </select>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedExam(exam);
                                setActiveSubTab('questions');
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              title={t('examManagement.exams.actions.importQuestions')}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleEditExam(exam)}
                              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                              title={t('examManagement.exams.actions.edit')}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              title={t('examManagement.exams.actions.delete')}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Questions Tab - Full Implementation */}
      {activeSubTab === 'questions' && (
        <div className="space-y-4 sm:space-y-6">
          {!selectedExam ? (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {t('examManagement.questions.selectExam')}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t('examManagement.questions.selectExamDesc')}
              </p>
              <button
                onClick={() => setActiveSubTab('exams')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
              >
                {t('examManagement.questions.goToExamsList')}
              </button>
            </div>
          ) : (
            <>
              {/* Exam Info & Test Type Selection */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                      {selectedExam.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Level: {selectedLevel.toUpperCase()} | ID: {selectedExam.id}
                    </p>
                  </div>
                  
                  {/* Test Type Tabs */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleTestTypeChange('knowledge')}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        selectedTestType === 'knowledge'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📚 {t('examManagement.questions.testTypes.knowledge')}
                    </button>
                    <button
                      onClick={() => handleTestTypeChange('reading')}
                      disabled={!canSwitchToTestType('reading')}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        selectedTestType === 'reading'
                          ? 'bg-blue-500 text-white'
                          : canSwitchToTestType('reading')
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      📖 {t('examManagement.questions.testTypes.reading')}
                    </button>
                    <button
                      onClick={() => handleTestTypeChange('listening')}
                      disabled={!canSwitchToTestType('listening')}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        selectedTestType === 'listening'
                          ? 'bg-blue-500 text-white'
                          : canSwitchToTestType('listening')
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      🎧 {t('examManagement.questions.testTypes.listening')}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  ⚠️ {t('examManagement.questions.warning')}
                </p>

                {/* Statistics */}
                {examStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{t('examManagement.questions.stats.knowledge')}</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.knowledge.count} {t('examManagement.questions.stats.questions')}</div>
                      {examStats.knowledge.time > 0 && (
                        <div className="text-xs text-gray-500">{examStats.knowledge.time} {t('examManagement.questions.stats.minutes')}</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{t('examManagement.questions.stats.reading')}</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.reading.count} {t('examManagement.questions.stats.questions')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{t('examManagement.questions.stats.listening')}</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.listening.count} {t('examManagement.questions.stats.questions')}</div>
                      {examStats.listening.time > 0 && (
                        <div className="text-xs text-gray-500">{examStats.listening.time} {t('examManagement.questions.stats.minutes')}</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{t('examManagement.questions.stats.total')}</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.total} {t('examManagement.questions.stats.questions')}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ NEW: Listening Part Audio Upload (for entire listening part, not per section) */}
              {selectedTestType === 'listening' && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-4 sm:p-6 border-2 border-purple-300 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🎧</span>
                    <div className="flex-1">
                      <label className="block text-base font-bold text-gray-800">
                        Audio File cho Listening Part (Bắt buộc)
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Upload một file audio duy nhất cho toàn bộ listening part (tất cả sections). Audio này sẽ chạy liên tục cho tất cả các câu hỏi trong listening part.
                      </p>
                    </div>
                  </div>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-400 hover:border-purple-500 transition-colors">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📤 Upload Audio File
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="audio/*"
                          id="listening-part-audio-file-input"
                          disabled={isUploadingAudio}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Validate file type
                              const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];
                              if (!validTypes.includes(file.type)) {
                                alert('⚠️ Chỉ hỗ trợ file audio: MP3, WAV, OGG, M4A');
                                e.target.value = '';
                                return;
                              }
                              
                              if (file.size > 50 * 1024 * 1024) {
                                alert('⚠️ File quá lớn! Giới hạn: 50MB');
                                e.target.value = '';
                                return;
                              }
                              
                              // Revoke old blob URL if exists to prevent memory leak
                              if (listeningPartAudio.audioUrl && listeningPartAudio.audioUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(listeningPartAudio.audioUrl);
                              }
                              
                              // Create new blob URL for preview
                              const audioUrl = URL.createObjectURL(file);
                              console.log('✅ Created blob URL for listening part audio preview:', audioUrl);
                              setListeningPartAudio(prev => ({ 
                                ...prev, 
                                audioUrl, 
                                audioFile: file,
                                audioName: file.name,
                                audioPath: '' // Will be set when uploaded
                              }));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:opacity-0 disabled:cursor-not-allowed"
                        />
                        <div className={`flex items-center gap-2 px-3 py-2.5 border-2 border-purple-300 rounded-lg bg-white ${isUploadingAudio ? 'opacity-50' : ''}`}>
                          <button
                            type="button"
                            onClick={() => document.getElementById('listening-part-audio-file-input')?.click()}
                            disabled={isUploadingAudio}
                            className="px-4 py-1.5 bg-purple-500 text-white rounded text-sm font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Chọn File
                          </button>
                          <span className="text-sm text-gray-600 flex-1">
                            {isUploadingAudio 
                              ? 'Đang upload...'
                              : listeningPartAudio.audioFile 
                                ? listeningPartAudio.audioFile.name 
                                : listeningPartAudio.audioName || 'Chưa chọn file'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        📎 Chọn file audio (MP3, WAV, OGG, M4A). File sẽ được upload lên Supabase Storage khi click nút "Upload Audio".
                      </p>
                      {listeningPartAudio.audioFile && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                          <p className="text-sm text-green-800 font-bold flex items-center gap-2">
                            <span>✅</span>
                            <span>File đã chọn: {listeningPartAudio.audioFile.name}</span>
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Kích thước: {(listeningPartAudio.audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {listeningPartAudio.audioUrl?.startsWith('blob:') && (
                            <p className="text-xs text-orange-600 mt-1 font-semibold">
                              ⚠️ Chế độ xem trước - File sẽ được upload khi click nút "Upload Audio"
                            </p>
                          )}
                        </div>
                      )}
                      {listeningPartAudio.audioUrl && !listeningPartAudio.audioUrl.startsWith('blob:') && !listeningPartAudio.audioUrl.startsWith('data:') && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
                          <p className="text-sm text-blue-800 font-bold flex items-center gap-2">
                            <span>✅</span>
                            <span>Audio đã được upload: {listeningPartAudio.audioName || 'N/A'}</span>
                          </p>
                          <audio controls className="w-full mt-2" style={{ height: '40px' }}>
                            <source src={listeningPartAudio.audioUrl} type={listeningPartAudio.audioFile?.type || "audio/mpeg"} />
                            Browser does not support audio.
                          </audio>
                        </div>
                      )}
                      {listeningPartAudio.audioUrl?.startsWith('blob:') && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                          <p className="text-sm text-yellow-800 font-bold mb-2">🎵 Preview Audio:</p>
                          <audio controls className="w-full" style={{ height: '40px' }}>
                            <source src={listeningPartAudio.audioUrl} type={listeningPartAudio.audioFile?.type || "audio/mpeg"} />
                            Browser does not support audio.
                          </audio>
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ Đây là preview từ file local. File sẽ được upload khi click nút "Upload Audio".
                          </p>
                        </div>
                      )}
                      {listeningPartAudio.audioFile && listeningPartAudio.audioUrl?.startsWith('blob:') && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleUploadListeningPartAudio}
                            disabled={isUploadingAudio}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploadingAudio ? '⏳ Đang upload...' : '📤 Upload Audio'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sections List */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    {t('examManagement.questions.sections.title', { count: sections.length })}
                  </h3>
                  <button
                    onClick={handleAddSection}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                  >
                    <span>➕</span>
                    <span>{t('examManagement.questions.sections.addSection')}</span>
                  </button>
                </div>

                {sections.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="mb-4">{t('examManagement.questions.sections.noQuestions')}</p>
                    <button
                      onClick={() => handleAddQuestion()} // ✅ Tự động tạo section
                      className="px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
                    >
                      ➕ {t('examManagement.questions.sections.addFirstQuestion')}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      {t('examManagement.questions.sections.sectionAutoCreated')}
                    </p>
                    {/* ✅ Optional: Vẫn cho phép tạo section thủ công nếu cần */}
                    <button
                      onClick={handleAddSection}
                      className="mt-2 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 underline"
                      title={t('examManagement.questions.sections.createManualTitle')}
                    >
                      {t('examManagement.questions.sections.orCreateManual')}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sections.map((section) => (
                      <div key={section.id} className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-semibold text-gray-800">
                                {section.title}
                              </h4>
                              <span className="text-xs text-gray-500">({section.id})</span>
                            </div>
                            {section.instruction && (
                              <p className="text-sm text-gray-600 mb-1">{section.instruction}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {t('examManagement.questions.sections.questionsCount', { count: section.questions?.length || 0 })}
                              </span>
                              {section.timeLimit && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                  {t('examManagement.questions.sections.minutes', { count: section.timeLimit })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAddQuestion(section)}
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                              title={t('examManagement.questions.sections.addQuestion')}
                            >
                              ➕
                            </button>
                            <button
                              onClick={() => handleEditSection(section)}
                              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                              title={t('examManagement.questions.sections.editSection')}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              title={t('examManagement.delete.sectionTitle')}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Questions List */}
                        {section.questions && section.questions.length > 0 ? (
                          <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                            {section.questions.map((question, idx) => (
                              <div key={question.id || idx} className="bg-gray-50 rounded p-3">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-mono text-gray-500">#{question.id}</span>
                                      <span className="text-sm font-medium text-gray-800 line-clamp-2">
                                        {question.question}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-1">
                                      {t('examManagement.questions.sections.answer')}: <span className="font-semibold">
                                        {typeof question.correctAnswer === 'number' 
                                          ? String.fromCharCode(65 + question.correctAnswer)
                                          : question.correctAnswer}
                                      </span>
                                    </div>
                                    {question.audioUrl && (
                                      <div className="text-xs text-blue-600 mb-1">
                                        🎧 {t('examManagement.questions.sections.audio')}: {question.audioUrl}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditQuestion(section, question)}
                                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                      title={t('examManagement.exams.actions.edit')}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(section, question)}
                                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                      title={t('examManagement.delete.questionTitle')}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="ml-4 text-sm text-gray-500 italic">
                            {t('examManagement.questions.sections.noQuestionsInSection')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-800">{t('examManagement.finalize.title')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('examManagement.finalize.description')}
                    </p>
                    {!isExamComplete && (
                      <p className="text-xs text-red-500 mt-1">
                        {t('examManagement.questions.warning')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleFinalizeExam}
                    disabled={!isExamComplete || isFinalizingExam}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                      !isExamComplete || isFinalizingExam
                        ? 'bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed'
                        : 'bg-green-500 text-white border-black hover:-translate-x-0.5 hover:-translate-y-0.5'
                    }`}
                  >
                    {isFinalizingExam ? t('examManagement.finalize.saving') : `💾 ${t('examManagement.finalize.saveButton')}`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Question Form - Quiz Editor Style (Full Page Layout) */}
      {showQuestionForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {editingQuestion ? `✏️ ${t('examManagement.questions.questionForm.editTitle')}` : `➕ ${t('examManagement.questions.questionForm.addTitle')}`}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedSection && (
                    <>Section: <span className="font-mono">{selectedSection.title} ({selectedSection.id})</span> | </>
                  )}
                  Loại: <span className="uppercase font-semibold">{selectedTestType}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  // ❌ REMOVED: Clean up blob URL - audio is now at listening part level, not question level
                  setShowQuestionForm(false);
                  setExportedJSON('');
                  setShowPreview(false);
                  setAutoGeneratedId(null);
                  // ✅ NEW: Clear import mode when closing
                  setIsImportMode(false);
                  setImportedQuestions([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-sm"
              >
                ✕ {t('examManagement.questions.questionForm.close')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Form Input - 2 columns */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* ✅ NEW: Import Mode - Show all imported questions (like Quiz Editor) */}
              {isImportMode && importedQuestions.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">
                      📥 Đã import {importedQuestions.length} câu hỏi
                    </h3>
                    <p className="text-sm text-blue-700">
                      Bạn có thể xem và chỉnh sửa tất cả các câu hỏi bên dưới. Sau khi hoàn tất, click "Lưu tất cả câu hỏi" để lưu vào section.
                    </p>
                  </div>

                  {/* Display all imported questions */}
                  {importedQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                          Câu hỏi {question.id || qIndex + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            // ✅ FIX: Normalize correctAnswer when loading question into form
                            // ✅ Support both 1-based (1-4) and 0-based (0-3) for safety
                            let normalizedCorrectAnswer = 0;
                            if (typeof question.correctAnswer === 'number') {
                              if (question.correctAnswer >= 1 && question.correctAnswer <= 4) {
                                // 1-based index (1, 2, 3, 4) - convert to 0-based (0, 1, 2, 3)
                                normalizedCorrectAnswer = question.correctAnswer - 1;
                              } else if (question.correctAnswer >= 0 && question.correctAnswer < 4) {
                                // 0-based index (0, 1, 2, 3) - use as is
                                normalizedCorrectAnswer = question.correctAnswer;
                              }
                            } else if (typeof question.correctAnswer === 'string') {
                              const numValue = parseInt(question.correctAnswer, 10);
                              if (!isNaN(numValue)) {
                                if (numValue >= 1 && numValue <= 4) {
                                  // 1-based index (1, 2, 3, 4) - convert to 0-based (0, 1, 2, 3)
                                  normalizedCorrectAnswer = numValue - 1;
                                } else if (numValue >= 0 && numValue < 4) {
                                  // 0-based index (0, 1, 2, 3) - use as is
                                  normalizedCorrectAnswer = numValue;
                                }
                              } else {
                                // Not a number, try as letter (A, B, C, D)
                                const letterIndex = ['A', 'B', 'C', 'D'].indexOf(question.correctAnswer.toUpperCase());
                                if (letterIndex >= 0) {
                                  normalizedCorrectAnswer = letterIndex;
                                }
                              }
                            }
                            
                            // ✅ FIX: Switch to edit mode and load question into form
                            setIsImportMode(false); // Exit import mode to show edit form
                            setQuestionForm({
                              ...question,
                              category: selectedTestType,
                              correctAnswer: normalizedCorrectAnswer, // ✅ Normalized to number (0-3)
                              audioFile: null
                            });
                            setAutoGeneratedId(question.id);
                            setEditingQuestion(question); // ✅ Set editing question
                            setShowQuestionForm(true); // ✅ Ensure form is visible
                            // Scroll to top of form
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          ✏️ Edit
                        </button>
                      </div>

                      {/* Question Preview */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi:</label>
                          <div 
                            className="p-3 bg-gray-50 rounded border border-gray-200 text-sm"
                            dangerouslySetInnerHTML={{ __html: question.question || '(Chưa có câu hỏi)' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án:</label>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((opt, optIdx) => {
                              // ✅ FIX: Handle correctAnswer as both number and string
                              const isCorrect = typeof question.correctAnswer === 'number'
                                ? question.correctAnswer === optIdx
                                : (question.correctAnswer === String.fromCharCode(65 + optIdx) || 
                                    question.correctAnswer === optIdx.toString());
                              
                              return (
                                <div 
                                  key={optIdx}
                                  className={`p-2 rounded border-2 text-sm ${
                                    isCorrect
                                      ? 'bg-green-50 border-green-500 font-semibold' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <span className="font-bold">{String.fromCharCode(65 + optIdx)}:</span> {opt || '(Trống)'}
                                  {isCorrect && (
                                    <span className="ml-2 text-green-600 font-bold">✓</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Đáp án đúng: <strong className="text-green-600">
                              {typeof question.correctAnswer === 'number'
                                ? String.fromCharCode(65 + question.correctAnswer)
                                : question.correctAnswer || 'Chưa có'}
                            </strong>
                          </p>
                        </div>

                        {question.explanation && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích:</label>
                            <div 
                              className="p-3 bg-gray-50 rounded border border-gray-200 text-sm"
                              dangerouslySetInnerHTML={{ __html: question.explanation }}
                              style={{
                                whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
                              }}
                            />
                          </div>
                        )}

                        {question.audioUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">🎧 Audio:</label>
                            <audio controls className="w-full h-10">
                              <source src={question.audioUrl} />
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* ✅ UPDATED: Save Buttons - Split into "Save" and "Save & Continue" */}
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Button 1: Save Only */}
                      <button
                        type="button"
                        onClick={async () => {
                          // ✅ FIX: Save count before clearing
                          const questionsCount = importedQuestions.length;
                          const sectionTitle = selectedSection?.title || selectedSection?.id || 'section';
                          
                          // Save all imported questions to section
                          const updatedSections = sections.map((section) => {
                            if (section.id === selectedSection.id) {
                              const existingQuestions = [...(section.questions || [])];
                              
                              // Add all imported questions
                              importedQuestions.forEach((normalizedQ) => {
                                const existingIndex = existingQuestions.findIndex(
                                  q => String(q.id) === String(normalizedQ.id)
                                );
                                
                                if (existingIndex !== -1) {
                                  existingQuestions[existingIndex] = {
                                    ...normalizedQ,
                                    options: normalizedQ.options.filter(opt => opt.trim() !== '')
                                  };
                                } else {
                                  existingQuestions.push({
                                    ...normalizedQ,
                                    options: normalizedQ.options.filter(opt => opt.trim() !== '')
                                  });
                                }
                              });

                              existingQuestions.sort((a, b) => {
                                const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
                                const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
                                return idA - idB;
                              });

                              return { ...section, questions: existingQuestions };
                            }
                            return section;
                          });

                          await saveSections(updatedSections);
                          setSections(updatedSections);
                          
                          // Clear import mode and close form
                          setImportedQuestions([]);
                          setIsImportMode(false);
                          setShowQuestionForm(false);
                          
                          alert(`✅ Đã lưu thành công ${questionsCount} câu hỏi vào section "${sectionTitle}"!`);
                        }}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm sm:text-base flex items-center justify-center gap-2"
                      >
                        💾 Lưu {importedQuestions.length} câu hỏi
                      </button>
                      
                      {/* Button 2: Save & Continue (Create More) */}
                      <button
                        type="button"
                        onClick={async () => {
                          // ✅ FIX: Save count before clearing
                          const questionsCount = importedQuestions.length;
                          const sectionTitle = selectedSection?.title || selectedSection?.id || 'section';
                          
                          // Save all imported questions to section
                          const updatedSections = sections.map((section) => {
                            if (section.id === selectedSection.id) {
                              const existingQuestions = [...(section.questions || [])];
                              
                              // Add all imported questions
                              importedQuestions.forEach((normalizedQ) => {
                                const existingIndex = existingQuestions.findIndex(
                                  q => String(q.id) === String(normalizedQ.id)
                                );
                                
                                if (existingIndex !== -1) {
                                  existingQuestions[existingIndex] = {
                                    ...normalizedQ,
                                    options: normalizedQ.options.filter(opt => opt.trim() !== '')
                                  };
                                } else {
                                  existingQuestions.push({
                                    ...normalizedQ,
                                    options: normalizedQ.options.filter(opt => opt.trim() !== '')
                                  });
                                }
                              });

                              existingQuestions.sort((a, b) => {
                                const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
                                const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
                                return idA - idB;
                              });

                              return { ...section, questions: existingQuestions };
                            }
                            return section;
                          });

                          await saveSections(updatedSections);
                          setSections(updatedSections);
                          
                          // ✅ FIX: Calculate nextId from updatedSections (not from nextQuestionIdSuggestion which may be stale)
                          // Get all questions from updated sections for the current test type
                          const allQuestionsFromUpdatedSections = updatedSections.flatMap(s => s.questions || []);
                          const maxId = allQuestionsFromUpdatedSections.length > 0
                            ? Math.max(...allQuestionsFromUpdatedSections.map(q => {
                                const numericId = typeof q.id === 'number' ? q.id : parseInt(q.id) || 0;
                                return Number.isFinite(numericId) ? numericId : 0;
                              }))
                            : 0;
                          const nextId = maxId + 1;
                          
                          alert(`✅ Đã lưu thành công ${questionsCount} câu hỏi vào section "${sectionTitle}"!`);
                          
                          // Clear import mode but keep form open for manual creation
                          setImportedQuestions([]);
                          setIsImportMode(false);
                          
                          // Reset form for new question
                          setQuestionForm({
                            id: String(nextId),
                            category: selectedTestType,
                            question: '',
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                            explanation: '',
                            audioUrl: '',
                            audioPath: '',
                            audioName: '',
                            audioFile: null
                          });
                          setAutoGeneratedId(nextId);
                          setEditingQuestion(null);
                          
                          // Scroll to top of form
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm sm:text-base flex items-center justify-center gap-2"
                      >
                        💾 Lưu & ➕ Tạo tiếp
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      💡 "Lưu" để đóng form | "Lưu & Tạo tiếp" để lưu và tiếp tục tạo câu hỏi thủ công
                    </p>
                  </div>
                </div>
              ) : (
              <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 sm:space-y-6">
                {/* Question ID */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('examManagement.questions.questionForm.idLabel')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={questionForm.id}
                          onChange={(e) => setQuestionForm({ ...questionForm, id: e.target.value })}
                          required
                          disabled={!!editingQuestion}
                          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white disabled:bg-gray-100"
                          placeholder="1"
                        />
                        {!editingQuestion && (
                          <button
                            type="button"
                            onClick={() => {
                              const suggested = String(nextQuestionIdSuggestion);
                              setQuestionForm({ ...questionForm, id: suggested });
                              setAutoGeneratedId(suggested);
                            }}
                            className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100"
                          >
                            ↺ {t('examManagement.questions.questionForm.suggest')}
                          </button>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 space-y-1">
                        <p>{t('examManagement.questions.questionForm.currentId')} <strong>#{questionForm.id || autoGeneratedId || nextQuestionIdSuggestion}</strong>.</p>
                        <p>{t('examManagement.questions.questionForm.nextId')}: #{nextQuestionIdSuggestion}</p>
                        {isDuplicateQuestionId && (
                          <p className="text-red-600 font-semibold">⚠️ {t('examManagement.questions.questionForm.idExists')}</p>
                        )}
                      </div>
                    </div>
                    {selectedTestType === 'listening' && questionForm.id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('examManagement.questions.questionForm.formatLabel')}
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                          Key: {selectedSection?.id || 'section'}-{String(questionForm.id).padStart(2, '0')}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t('examManagement.questions.questionForm.formatHint')}</p>
                      </div>
                    )}
                  </div>

                  {questionOverview.length > 0 && (
                    <div className="border border-dashed border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50 max-h-48 overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-700 mb-2">{t('examManagement.questions.questionForm.createdIds')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {questionOverview.map((item) => (
                          <span
                            key={`${item.testType}-${item.numericId}-${item.sectionTitle}`}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                              questionForm.id && String(questionForm.id) === String(item.id)
                                ? 'border-red-400 text-red-600'
                                : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            #{item.numericId} · {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ ENHANCED: Question Text with Full Features (Paste, Upload, Format, Preview) */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('examManagement.questions.questionForm.questionLabel')}
                    </label>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFormatBold('question')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatItalic('question')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors italic"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertLineBreak('question')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Line Break"
                      >
                        ⏎
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const key = 'question';
                          if (!imageInputRefs.current[key]) {
                            imageInputRefs.current[key] = document.createElement('input');
                            imageInputRefs.current[key].type = 'file';
                            imageInputRefs.current[key].accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
                            imageInputRefs.current[key].onchange = (e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'question');
                            };
                          }
                          imageInputRefs.current[key].click();
                        }}
                        disabled={isUploadingImage && uploadingImageField === 'question'}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          isUploadingImage && uploadingImageField === 'question'
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Upload Image"
                      >
                        {isUploadingImage && uploadingImageField === 'question' ? '⏳' : '📷'}
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePreview('question')}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          showQuestionPreview['question']
                            ? 'bg-green-500 text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        title="Toggle Preview"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={questionTextareaRef}
                    value={questionForm.question}
                    onChange={(e) => {
                      setQuestionForm({ ...questionForm, question: e.target.value });
                      handleTextareaResize('question');
                    }}
                    onPaste={(e) => handlePaste(e, 'question')}
                    onInput={() => handleTextareaResize('question')}
                    required
                    placeholder={t('examManagement.questions.questionForm.questionPlaceholder') || 'Nhập câu hỏi tiếng Nhật... (Có thể paste từ Word/Google Docs hoặc paste ảnh)'}
                    rows={6}
                    style={{ minHeight: '150px', resize: 'vertical' }}
                    className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all bg-white font-mono text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${
                      isDuplicateQuestionText
                        ? 'border-red-500 bg-red-50 focus:border-red-500'
                        : 'border-black focus:border-black'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Paste từ Word/Google Docs sẽ tự động format. Paste ảnh (Ctrl+V) sẽ tự động upload và chèn vào.
                  </p>
                  {/* ✅ NEW: Duplicate Warning */}
                  {isDuplicateQuestionText && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-pulse font-black">
                      <span>⚠️</span>
                      <span>Câu hỏi này đã tồn tại trong section này!</span>
                    </p>
                  )}
                  {/* Preview Panel */}
                  {showQuestionPreview['question'] && questionForm.question && (
                    <div className="mt-3 p-3 bg-gray-50 border-[2px] border-gray-300 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-2">📺 Preview:</p>
                      <div 
                        className="prose prose-sm max-w-none text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: questionForm.question }}
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap', // ✅ FIX: Preserve line breaks from <br/> tags
                          lineHeight: '1.75'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Options - Grid Layout like Quiz Editor */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {t('examManagement.questions.questionForm.questionTitle', { id: questionForm.id || 'mới' })}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        value={questionForm.correctAnswer}
                        onChange={(e) => setQuestionForm({ 
                          ...questionForm, 
                          correctAnswer: parseInt(e.target.value) 
                        })}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      >
                        <option value="0">{t('examManagement.questions.questionForm.correctAnswer')}: A</option>
                        <option value="1">{t('examManagement.questions.questionForm.correctAnswer')}: B</option>
                        <option value="2">{t('examManagement.questions.questionForm.correctAnswer')}: C</option>
                        <option value="3">{t('examManagement.questions.questionForm.correctAnswer')}: D</option>
                      </select>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {['A', 'B', 'C', 'D'].map((label, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {label}:
                          </label>
                          {/* ✅ NEW: Button to set as correct answer */}
                          <button
                            type="button"
                            onClick={() => {
                              setQuestionForm({ ...questionForm, correctAnswer: idx });
                            }}
                            className={`px-2 py-1 text-xs rounded border-2 transition-all font-semibold ${
                              questionForm.correctAnswer === idx
                                ? 'bg-green-500 text-white border-green-600 shadow-md'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50 hover:border-green-300'
                            }`}
                            title={`Chọn ${label} làm đáp án đúng`}
                          >
                            {questionForm.correctAnswer === idx ? '✓ Đúng' : 'Chọn đúng'}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={questionForm.options[idx] || ''}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={t('examManagement.questions.questionForm.optionPlaceholder', { label })}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            questionForm.correctAnswer === idx 
                              ? 'border-green-500 bg-green-50 font-semibold' 
                              : 'border-gray-300 bg-white'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* ✅ NEW: Display current correct answer */}
                  {questionForm.correctAnswer !== undefined && questionForm.correctAnswer !== null && (
                    <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">
                        ✓ Đáp án đúng hiện tại: <span className="text-lg">{String.fromCharCode(65 + questionForm.correctAnswer)}</span>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Click nút "Chọn đúng" bên cạnh đáp án để thay đổi
                      </p>
                    </div>
                  )}
                </div>

                {/* ✅ ENHANCED: Explanation with Full Features (Paste, Upload, Format, Preview) */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('examManagement.questions.questionForm.explanationLabel')}
                    </label>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFormatBold('explanation')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatItalic('explanation')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors italic"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertLineBreak('explanation')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Line Break"
                      >
                        ⏎
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const key = 'explanation';
                          if (!imageInputRefs.current[key]) {
                            imageInputRefs.current[key] = document.createElement('input');
                            imageInputRefs.current[key].type = 'file';
                            imageInputRefs.current[key].accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
                            imageInputRefs.current[key].onchange = (e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'explanation');
                            };
                          }
                          imageInputRefs.current[key].click();
                        }}
                        disabled={isUploadingImage && uploadingImageField === 'explanation'}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          isUploadingImage && uploadingImageField === 'explanation'
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Upload Image"
                      >
                        {isUploadingImage && uploadingImageField === 'explanation' ? '⏳' : '📷'}
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePreview('explanation')}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          showQuestionPreview['explanation']
                            ? 'bg-green-500 text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        title="Toggle Preview"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                  <ContentEditable
                    value={questionForm.explanation || ''}
                    onChange={(newValue) => {
                      setQuestionForm({ ...questionForm, explanation: newValue });
                    }}
                    onPaste={async (e, file, html, plainText) => {
                      return await handlePasteForContentEditable(e, file, html, plainText, 'explanation');
                    }}
                    placeholder={t('examManagement.questions.questionForm.explanationPlaceholder') || 'Nhập giải thích... (Có thể paste từ Word/Google Docs hoặc paste ảnh)'}
                    className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] prose prose-sm max-w-none overflow-y-auto"
                    style={{ minHeight: '100px', maxHeight: '400px' }}
                    minHeight={100}
                    field="explanation"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Paste từ Word/Google Docs sẽ tự động format. Paste ảnh (Ctrl+V) sẽ tự động upload và chèn vào.
                  </p>
                  {/* Preview Panel */}
                  {showQuestionPreview['explanation'] && questionForm.explanation && (
                    <div className="mt-3 p-3 bg-gray-50 border-[2px] border-gray-300 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-2">📺 Preview:</p>
                      <div 
                        className="prose prose-sm max-w-none text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: questionForm.explanation }}
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap', // ✅ FIX: Preserve line breaks from <br/> tags
                          lineHeight: '1.75'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* ❌ REMOVED: Timing Section - Audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự */}

                {/* ✅ ENHANCED: Save Buttons - Save Question & Save and Add New */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Button 1: Save Question */}
                    <button
                      type="button"
                      onClick={handleSaveQuestion}
                      disabled={isDuplicateQuestionId}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-all font-semibold text-base sm:text-lg flex items-center justify-center gap-2 ${
                        isDuplicateQuestionId
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">💾</span>
                      {editingQuestion ? t('examManagement.questions.questionForm.saveChanges') : t('examManagement.questions.questionForm.saveQuestion') || 'Lưu câu hỏi'}
                    </button>
                    
                    {/* Button 2: Save and Add New */}
                    <button
                      type="button"
                      onClick={handleSaveAndAddNew}
                      disabled={isDuplicateQuestionId}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-all font-semibold text-base sm:text-lg flex items-center justify-center gap-2 ${
                        isDuplicateQuestionId
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">➕</span>
                      {t('examManagement.questions.questionForm.saveAndAddNew') || 'Lưu và thêm câu mới'}
                    </button>
                  </div>
                  <p className="text-center text-gray-500 text-xs sm:text-sm mt-3">
                    {editingQuestion 
                      ? t('examManagement.questions.questionForm.saveChangesHint') 
                      : t('examManagement.questions.questionForm.saveButtonsHint') || 'Click "Lưu câu hỏi" để lưu và đóng form. Click "Lưu và thêm câu mới" để lưu và tiếp tục thêm câu hỏi.'}
                  </p>
                </div>
              </form>
              )}
            </div>

            {/* Sidebar - Preview & Export - Like Quiz Editor */}
            <div className="space-y-4 sm:space-y-6">
              {/* Actions */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('examManagement.questions.questionForm.actions')}</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    {showPreview ? `👁️ ${t('examManagement.questions.questionForm.hidePreview')}` : `👁️ ${t('examManagement.questions.questionForm.showPreview')}`}
                  </button>

                  <button
                    onClick={handleExportQuestion}
                    disabled={!isQuestionValid()}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    📤 {t('examManagement.questions.questionForm.exportJSON')}
                  </button>

                  <button
                    type="button"
                    onClick={() => jsonUploadInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                  >
                    📥 {t('examManagement.questions.questionForm.importJSON')}
                  </button>
                  <input
                    type="file"
                    accept="application/json"
                    ref={jsonUploadInputRef}
                    className="hidden"
                    onChange={handleQuestionJSONUpload}
                  />

                  <button
                    type="button"
                    onClick={() => setShowTemplate(!showTemplate)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    {showTemplate ? `🤖 ${t('examManagement.questions.questionForm.hideGeminiPrompt') || 'Ẩn Gemini Prompt'}` : `🤖 ${t('examManagement.questions.questionForm.showGeminiPrompt') || 'Hiện Gemini Prompt'}`}
                  </button>

                  {showTemplate && (
                    <div className="bg-gray-900 text-green-200 rounded-lg p-3 space-y-3 text-xs sm:text-sm max-h-96 overflow-y-auto border border-gray-700">
                      <div className="flex items-center justify-between text-gray-100">
                        <span className="font-semibold">🤖 {t('examManagement.questions.questionForm.geminiPromptTitle') || 'Prompt Template cho Google Gemini'}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const promptText = geminiPromptTemplate;
                              console.log('🔍 Copying prompt, length:', promptText?.length);
                              console.log('🔍 First 100 chars:', promptText?.substring(0, 100));
                              
                              if (!promptText || promptText.trim().length === 0) {
                                alert('⚠️ Prompt template chưa sẵn sàng. Vui lòng thử lại.');
                                return;
                              }
                              
                              await navigator.clipboard.writeText(promptText);
                              alert('✅ Đã copy prompt vào clipboard!');
                            } catch (error) {
                              console.error('Error copying to clipboard:', error);
                              // Fallback: Select text manually
                              const textArea = document.createElement('textarea');
                              textArea.value = geminiPromptTemplate;
                              textArea.style.position = 'fixed';
                              textArea.style.opacity = '0';
                              textArea.style.left = '-9999px';
                              document.body.appendChild(textArea);
                              textArea.focus();
                              textArea.select();
                              try {
                                const successful = document.execCommand('copy');
                                if (successful) {
                                  alert('✅ Đã copy prompt vào clipboard!');
                                } else {
                                  throw new Error('execCommand failed');
                                }
                              } catch (err) {
                                console.error('Fallback copy failed:', err);
                                alert('⚠️ Không thể copy tự động. Vui lòng chọn và copy thủ công từ text bên dưới.');
                              }
                              document.body.removeChild(textArea);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700 font-semibold"
                        >
                          📋 {t('examManagement.questions.questionForm.copy') || 'Copy'}
                        </button>
                      </div>
                      <div className="bg-gray-800 rounded p-2 border border-gray-600">
                        <pre 
                          className="whitespace-pre-wrap break-words text-xs leading-relaxed font-mono select-all cursor-text"
                          onClick={(e) => {
                            // Select all text when clicking on pre
                            const range = document.createRange();
                            range.selectNodeContents(e.currentTarget);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                          }}
                        >
{geminiPromptTemplate}
                        </pre>
                      </div>
                      <div className="text-yellow-300 text-xs bg-yellow-900/30 p-2 rounded border border-yellow-700">
                        💡 <strong>Hướng dẫn:</strong> Copy prompt trên, paste vào Google Gemini, sau đó upload ảnh câu hỏi và đáp án. Gemini sẽ trả về JSON theo format trên.
                      </div>
                    </div>
                  )}

                  {exportedJSON && (
                    <>
                      <button
                        onClick={handleCopyQuestion}
                        className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                      >
                        📋 {t('examManagement.questions.questionForm.copyJSON')}
                      </button>

                      <button
                        onClick={handleDownloadQuestion}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                      >
                        💾 {t('examManagement.questions.questionForm.downloadFile')}
                      </button>
                    </>
                  )}
                </div>

                {/* Validation Status */}
                <div className="mt-4 p-3 rounded-lg bg-gray-50">
                  <p className={`text-sm font-medium ${isQuestionValid() ? 'text-green-600' : 'text-red-600'}`}>
                    {isQuestionValid() ? `✅ ${t('examManagement.questions.questionForm.formValid')}` : `⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ID: <strong>{questionForm.id || t('examManagement.questions.questionForm.noId')}</strong>
                  </p>
                  {!editingQuestion && isDuplicateQuestionId && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      ⚠️ {t('examManagement.questions.questionForm.idExistsUseSuggest')}
                    </p>
                  )}
                  {selectedTestType === 'listening' && !questionForm.audioUrl && (
                    <p className="text-xs text-red-600 mt-2">
                      ⚠️ {t('examManagement.questions.questionForm.audioRequiredForListening')}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview - Removed from sidebar to prevent overlap */}

              {/* Exported JSON */}
              {exportedJSON && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Exported JSON</h2>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
                    {exportedJSON}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Preview Modal - Hiển thị trong modal overlay, phụ thuộc vào vị trí và kích thước container contents */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[99999]"
          onClick={() => setShowPreview(false)}
          style={{ 
            zIndex: 99999
          }}
        >
          <div 
            className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'fixed',
              // ✅ Vị trí và kích thước phụ thuộc vào container contents
              top: containerBounds.width > 0 ? `${Math.max(containerBounds.top + 20, 80)}px` : '80px', // ✅ Fallback nếu chưa tính toán
              left: containerBounds.width > 0 ? `${Math.max(containerBounds.left + 20, 20)}px` : '50%', // ✅ Fallback: căn giữa nếu chưa tính toán
              width: containerBounds.width > 0 
                ? `${Math.max(Math.min(containerBounds.width - 40, 1000), 300)}px` 
                : 'min(90vw, 1000px)', // ✅ Fallback: responsive width
              maxWidth: containerBounds.width > 0 
                ? `${Math.max(containerBounds.width - 40, 300)}px` 
                : '1000px', // ✅ Fallback
              maxHeight: containerBounds.height > 0 
                ? `${Math.max(Math.min(containerBounds.height - 40, window.innerHeight - 120), 400)}px` 
                : '85vh', // ✅ Fallback
              transform: containerBounds.width > 0 ? 'none' : 'translateX(-50%)', // ✅ Căn giữa nếu chưa tính toán
              zIndex: 100000,
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b-[3px] border-black bg-gradient-to-r from-blue-500 to-blue-600">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
                <span>📺</span>
                <span>Preview</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Copy All Button */}
                {selectedSection && selectedSection.questions && selectedSection.questions.length > 0 && (
                  <button
                    onClick={handleCopyAllQuestions}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black text-xs sm:text-sm"
                    title="Copy tất cả câu hỏi"
                  >
                    📋 Copy All
                  </button>
                )}
                {/* Print Button */}
                {selectedSection && selectedSection.questions && selectedSection.questions.length > 0 && (
                  <button
                    onClick={handlePrintPreview}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black text-xs sm:text-sm"
                    title="In preview"
                  >
                    🖨️ Print
                  </button>
                )}
                {/* Close Button */}
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black text-sm sm:text-base"
                  title="Đóng Preview (ESC)"
                >
                  ✕ Đóng
                </button>
              </div>
            </div>

            {/* Filter & Sort Controls */}
            {selectedSection && selectedSection.questions && selectedSection.questions.length > 0 && (
              <div className="p-4 bg-gray-100 border-b-[2px] border-gray-300 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-gray-700">Lọc:</label>
                  <select
                    value={previewFilter}
                    onChange={(e) => setPreviewFilter(e.target.value)}
                    className="px-3 py-1 border-[2px] border-black rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">Tất cả ({(selectedSection.questions || []).length})</option>
                    <option value="complete">Hoàn chỉnh ({(selectedSection.questions || []).filter(q => isQuestionComplete(q)).length})</option>
                    <option value="incomplete">Chưa hoàn chỉnh ({(selectedSection.questions || []).filter(q => !isQuestionComplete(q)).length})</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-gray-700">Sắp xếp:</label>
                  <select
                    value={previewSortBy}
                    onChange={(e) => setPreviewSortBy(e.target.value)}
                    className="px-3 py-1 border-[2px] border-black rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="id">Theo ID</option>
                    <option value="status">Theo trạng thái</option>
                  </select>
                </div>
                <div className="ml-auto text-xs text-gray-600 font-semibold">
                  Hiển thị: <strong>{getFilteredAndSortedQuestions().length}</strong> / {(selectedSection.questions || []).length} câu hỏi
                </div>
              </div>
            )}

            {/* Modal Content - Scrollable */}
            <div 
              ref={previewContentRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50"
              tabIndex={0}
            >
              <div className="space-y-4">
                {/* Section Info */}
                {selectedSection && (
                  <div className="p-4 bg-blue-50 border-[3px] border-blue-300 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black text-blue-900 text-lg sm:text-xl">
                      {selectedSection.title || selectedSection.id || 'Section'}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Số câu hỏi: <strong>{(selectedSection.questions || []).length}</strong>
                    </p>
                    {selectedSection.instruction && (
                      <p className="text-sm text-blue-800 mt-2">
                        {selectedSection.instruction}
                      </p>
                    )}
                  </div>
                )}

                {/* Questions Preview */}
                {!selectedSection || !selectedSection.questions || selectedSection.questions.length === 0 ? (
                  <div className="p-6 bg-yellow-50 border-[3px] border-yellow-300 rounded-lg text-center">
                    <p className="text-yellow-800 font-semibold">⚠️ Chưa có câu hỏi nào trong section này</p>
                    <p className="text-xs text-yellow-700 mt-2">
                      {questionForm.question ? 'Câu hỏi hiện tại chưa được lưu vào section' : 'Vui lòng tạo câu hỏi mới'}
                    </p>
                  </div>
                ) : getFilteredAndSortedQuestions().length === 0 ? (
                  <div className="p-6 bg-yellow-50 border-[3px] border-yellow-300 rounded-lg text-center">
                    <p className="text-yellow-800 font-semibold">⚠️ Không có câu hỏi nào khớp với bộ lọc</p>
                  </div>
                ) : (
                  getFilteredAndSortedQuestions().map((q, idx) => {
                    // Handle both array and object options format
                    const options = Array.isArray(q.options) 
                      ? q.options 
                      : (q.options && typeof q.options === 'object' 
                          ? Object.values(q.options) 
                          : ['', '', '', '']);
                    
                    const correctAnswer = typeof q.correctAnswer === 'number' 
                      ? q.correctAnswer 
                      : (q.correctAnswer && typeof q.correctAnswer === 'string' 
                          ? q.correctAnswer.charCodeAt(0) - 65 
                          : null);

                    const isComplete = isQuestionComplete(q);

                    return (
                      <div 
                        key={q.id || idx} 
                        className={`rounded-lg border-[3px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 transition-all ${
                          isComplete 
                            ? 'bg-white border-black' 
                            : 'bg-yellow-50 border-yellow-400'
                        }`}
                      >
                        {/* Question Header with Copy Button */}
                        <div className="mb-3 pb-2 border-b-2 border-gray-300 flex items-center justify-between">
                          <p className="font-black text-gray-900 text-base sm:text-lg">
                            <span className="text-blue-600">Câu hỏi {q.id || q.number || idx + 1}:</span>
                            {!isComplete && (
                              <span className="ml-2 text-yellow-700 text-sm">⚠️ Chưa hoàn chỉnh</span>
                            )}
                          </p>
                          <button
                            onClick={() => handleCopyQuestionPreview(q)}
                            className="px-2 py-1 bg-blue-500 text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black text-xs"
                            title="Copy câu hỏi này"
                          >
                            📋 Copy
                          </button>
                        </div>

                        {/* Question Text */}
                        <div className="mb-4">
                          {q.question ? (
                            <div 
                              className="text-gray-800 text-sm sm:text-base leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: q.question }}
                            />
                          ) : (
                            <p className="text-yellow-600 italic font-semibold">⚠️ Chưa có câu hỏi</p>
                          )}
                        </div>

                        {/* Options */}
                        <div className="space-y-2 mb-4">
                          <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Đáp án:</p>
                          {options.map((opt, optIdx) => {
                            if (!opt || (typeof opt === 'string' && !opt.trim())) return null;
                            const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || '');
                            const isCorrect = correctAnswer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-lg border-[2px] transition-all ${
                                  isCorrect
                                    ? 'text-green-800 font-bold bg-green-100 border-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'text-gray-700 bg-gray-50 border-gray-300'
                                }`}
                              >
                                <span className="font-black text-base">{String.fromCharCode(65 + optIdx)}.</span>{' '}
                                <span className={isCorrect ? 'font-bold' : ''}>
                                  {optText || '(Chưa có đáp án)'}
                                </span>
                                {isCorrect && (
                                  <span className="ml-2 text-green-600 font-black">✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Correct Answer Indicator */}
                        {correctAnswer !== null && correctAnswer !== undefined ? (
                          <div className="mb-3 p-2 bg-blue-100 border-[2px] border-blue-300 rounded">
                            <p className="text-sm font-black text-blue-800">
                              ✅ Đáp án đúng: <span className="text-lg">{String.fromCharCode(65 + correctAnswer)}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="mb-3 p-2 bg-red-100 border-[2px] border-red-300 rounded">
                            <p className="text-sm font-black text-red-800">
                              ⚠️ Chưa chọn đáp án đúng
                            </p>
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-4 p-3 bg-purple-50 border-[2px] border-purple-300 rounded-lg">
                            <p className="font-black text-purple-800 mb-2 text-sm uppercase tracking-wide">💡 Giải thích:</p>
                            <div 
                              className="text-purple-900 text-sm leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: q.explanation }}
                            />
                          </div>
                        )}

                        {/* Audio (for listening type) */}
                        {selectedTestType === 'listening' && q.audioUrl && (
                          <div className="mt-3 p-2 bg-purple-100 border-[2px] border-purple-300 rounded">
                            <p className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                              <span>🎧</span>
                              <span>Audio URL:</span>
                              <span className="font-mono text-xs break-all">{q.audioUrl}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Show current question form if it's not saved yet */}
                {questionForm.question && (!selectedSection || !selectedSection.questions || !selectedSection.questions.find(q => q.id === questionForm.id)) && (
                  <div className="p-4 bg-yellow-50 border-[3px] border-yellow-400 rounded-lg">
                    <p className="text-xs font-black text-yellow-800 mb-2 uppercase">⚠️ Câu hỏi chưa lưu:</p>
                    <div className="bg-white rounded-lg border-[2px] border-yellow-300 p-3">
                      <p className="font-semibold text-gray-800 mb-2">
                        Câu hỏi {questionForm.id || 'mới'}: {questionForm.question || '(Chưa có câu hỏi)'}
                      </p>
                      <div className="space-y-1 text-sm">
                        {questionForm.options.map((opt, idx) => {
                          if (!opt.trim()) return null;
                          const isCorrect = questionForm.correctAnswer === idx;
                          return (
                            <p
                              key={idx}
                              className={isCorrect ? 'text-green-600 font-semibold' : 'text-gray-600'}
                            >
                              {String.fromCharCode(65 + idx)}. {opt}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t-[3px] border-black bg-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-gray-600 font-semibold space-y-1">
                <p>💡 Nhấn ESC hoặc click nút "Đóng" để đóng preview</p>
                <p className="text-[10px]">⌨️ Keyboard: ↑↓ để scroll, Page Up/Down, Home/End</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black text-sm"
              >
                ✕ Đóng Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Form Modal */}
      <Modal
        isOpen={showExamForm}
        onClose={() => setShowExamForm(false)}
        title={editingExam ? `✏️ ${t('examManagement.examForm.editTitle')}` : `➕ ${t('examManagement.examForm.addTitle')}`}
        maxWidth="32rem"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          {/* ✅ FIX: Date picker là input chính - Tự động generate ID và Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.examForm.dateLabel')}
            </label>
            <MonthPicker
              value={examForm.date ? (() => {
                // Convert từ YYYY/MM sang YYYY-MM cho month picker
                if (examForm.date.includes('/')) {
                  return examForm.date.replace('/', '-');
                }
                // Nếu đã là YYYY-MM thì giữ nguyên
                if (examForm.date.includes('-') && examForm.date.match(/^\d{4}-\d{2}$/)) {
                  return examForm.date;
                }
                // Nếu format khác, thử parse
                const match = examForm.date.match(/^(\d{4})[\/\-](\d{1,2})/);
                if (match) {
                  return `${match[1]}-${match[2].padStart(2, '0')}`;
                }
                return '';
              })() : ''}
              onChange={(e) => {
                // Convert từ format YYYY-MM (month picker) sang YYYY/MM (format hiển thị)
                const dateValue = e.target.value;
                if (dateValue) {
                  const formattedDate = dateValue.replace('-', '/');
                  const newId = generateIdFromDate(formattedDate);
                  const newTitle = generateTitleFromDate(formattedDate);
                  // ✅ Auto-generate ID và Title từ date
                  setExamForm({ 
                    ...examForm, 
                    date: formattedDate,
                    id: newId, // ✅ Luôn auto-generate ID
                    title: newTitle // ✅ Luôn auto-generate Title
                  });
                } else {
                  setExamForm({ ...examForm, date: '', id: '', title: '' });
                }
              }}
              required
              className=""
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('examManagement.examForm.dateHint')}
            </p>
          </div>

          {/* ✅ FIX: ID và Title chỉ hiển thị (read-only) hoặc có thể edit nếu cần */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.examForm.idLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={examForm.id}
                onChange={(e) => {
                  const newId = e.target.value;
                  setExamForm({ ...examForm, id: newId });
                  // ✅ Auto-update title nếu đang là auto-generated
                  if (examForm.title && examForm.title.startsWith('JLPT ')) {
                    const titleFromId = generateTitleFromDate(newId.replace('-', '/'));
                    if (titleFromId) {
                      setExamForm(prev => ({ ...prev, title: titleFromId }));
                    }
                  }
                }}
                required
                disabled={!!editingExam}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                  isDuplicateId(examForm.id) ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                } disabled:bg-gray-100`}
                placeholder="2024-12"
                title="ID tự động từ ngày thi (có thể chỉnh sửa nếu cần)"
              />
              {isDuplicateId(examForm.id) && (
                <div className="flex items-center px-2 text-red-600">
                  <span className="text-lg">⚠️</span>
                </div>
              )}
            </div>
            {isDuplicateId(examForm.id) && (
              <p className="text-xs text-red-600 mt-1 font-semibold">
                ⚠️ {t('examManagement.examForm.idDuplicate')}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('examManagement.examForm.idHint')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.examForm.titleLabel')}
            </label>
            <input
              type="text"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="JLPT 2024/12"
              title="Tiêu đề tự động từ ngày thi (có thể chỉnh sửa nếu cần)"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('examManagement.examForm.titleHint')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.examForm.statusLabel')}
            </label>
            <select
              value={examForm.status}
              onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
              required
              className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <option value={t('examManagement.exams.status.available')}>{t('examManagement.exams.status.available')}</option>
              <option value={t('examManagement.exams.status.upcoming')}>{t('examManagement.exams.status.upcoming')}</option>
              <option value={t('examManagement.exams.status.ended')}>{t('examManagement.exams.status.ended')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.examForm.imageUrlLabel')}
            </label>
            <input
              type="text"
              value={examForm.imageUrl}
              onChange={(e) => setExamForm({ ...examForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              placeholder="/jlpt/n1/2024-12.jpg"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
            >
              💾 {editingExam ? t('examManagement.examForm.saveButton') : t('examManagement.examForm.addButton')}
            </button>
            <button
              type="button"
              onClick={() => setShowExamForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
            >
              {t('examManagement.examForm.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Section Form Modal */}
      <Modal
        isOpen={showSectionForm}
        onClose={() => setShowSectionForm(false)}
        title={editingSection ? `✏️ ${t('examManagement.questions.sections.editTitle')}` : `➕ ${t('examManagement.questions.sections.addTitle')}`}
        maxWidth="32rem"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('examManagement.questions.sections.idLabel')}
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextId = getNextSectionId();
                  setSectionForm({ ...sectionForm, id: nextId });
                }}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                title="Tự động tạo ID tiếp theo"
              >
                🔄 Gợi ý ID
              </button>
            </div>
            <input
              type="text"
              value={sectionForm.id}
              onChange={(e) => setSectionForm({ ...sectionForm, id: e.target.value })}
              required
              // ✅ FIX: Cho phép edit section ID để có thể fix duplicate IDs
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
              placeholder={t('examManagement.questions.sections.idPlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">{t('examManagement.questions.sections.idHint')}</p>
            
            {/* ✅ NEW: Display existing section IDs to avoid duplicates */}
            {sections.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  📋 ID Section đang có ({sections.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {sections.map((s) => (
                    <span
                      key={s.id}
                      className={`text-xs px-2 py-1 rounded font-mono ${
                        s.id === sectionForm.id && !editingSection
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-white text-gray-600 border border-gray-300'
                      }`}
                    >
                      {s.id}
                    </span>
                  ))}
                </div>
                {!editingSection && sections.find(s => s.id === sectionForm.id) && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    ⚠️ ID này đã tồn tại! Vui lòng chọn ID khác hoặc click "Gợi ý ID".
                  </p>
                )}
              </div>
            )}
          </div>
          {/* ✅ UPDATED: Combined Title and Instruction - Single field for both */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề và Hướng dẫn *
              </label>
              {/* Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFormatBold('instruction')}
                  className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatItalic('instruction')}
                  className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors italic"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertLineBreak('instruction')}
                  className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                  title="Line Break"
                >
                  ⏎
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const key = 'instruction';
                    if (!imageInputRefs.current[key]) {
                      imageInputRefs.current[key] = document.createElement('input');
                      imageInputRefs.current[key].type = 'file';
                      imageInputRefs.current[key].accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
                      imageInputRefs.current[key].onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'instruction');
                      };
                    }
                    imageInputRefs.current[key].click();
                  }}
                  disabled={isUploadingImage && uploadingImageField === 'instruction'}
                  className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                    isUploadingImage && uploadingImageField === 'instruction'
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title="Upload Image"
                >
                  {isUploadingImage && uploadingImageField === 'instruction' ? '⏳' : '📷'}
                </button>
                <button
                  type="button"
                  onClick={() => togglePreview('instruction')}
                  className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                    showQuestionPreview['instruction']
                      ? 'bg-green-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                  title="Toggle Preview"
                >
                  👁
                </button>
              </div>
            </div>
            <textarea
              ref={instructionTextareaRef}
              value={sectionForm.instruction}
              onChange={(e) => {
                setSectionForm({ ...sectionForm, instruction: e.target.value });
                handleTextareaResize('instruction');
              }}
              onPaste={(e) => handlePaste(e, 'instruction')}
              onInput={() => handleTextareaResize('instruction')}
              rows={6}
              style={{ minHeight: '150px', resize: 'vertical' }}
              className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white text-sm resize-y"
              placeholder="Nhập tiêu đề và hướng dẫn... (Ví dụ: 問題1 (section1)\n\n（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 <strong>Hướng dẫn:</strong> Dòng đầu tiên sẽ là tiêu đề (ví dụ: 問題1), phần còn lại là hướng dẫn. Paste từ Word/Google Docs sẽ tự động format. Paste ảnh (Ctrl+V) sẽ tự động upload và chèn vào.
            </p>
            {/* Preview Panel */}
            {showQuestionPreview['instruction'] && sectionForm.instruction && (
              <div className="mt-3 p-3 bg-gray-50 border-[2px] border-gray-300 rounded-lg">
                <p className="text-xs font-bold text-gray-700 mb-2">📺 Preview:</p>
                <div 
                  className="prose prose-sm max-w-none text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sectionForm.instruction }}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                />
              </div>
            )}
          </div>
          
          {/* ✅ NEW: Passage Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Ảnh Passage (Đoạn văn) - Tùy chọn
            </label>
            <p className="text-xs text-gray-500 mb-2">
              💡 Upload nhiều ảnh passage nếu section này có đoạn văn dài cần hiển thị. Ảnh sẽ hiển thị ở main content theo thứ tự, không hiển thị trong sidebar.
            </p>
            
            {/* File Input - Multiple files */}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleUploadMultiplePassageImages(files);
                }
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Images List */}
            {sectionForm.passageImages && sectionForm.passageImages.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  📸 Danh sách ảnh ({sectionForm.passageImages.length}):
                </p>
                {sectionForm.passageImages
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((image, index) => {
                    const sortedIndex = sectionForm.passageImages
                      .map((img, idx) => ({ img, idx }))
                      .sort((a, b) => (a.img.order || 0) - (b.img.order || 0))
                      .findIndex(item => item.idx === index);
                    const actualIndex = sectionForm.passageImages.findIndex(img => img === image);
                    
                    return (
                      <div key={actualIndex} className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={image.url}
                              alt={`Passage ${sortedIndex + 1}`}
                              className="w-24 h-24 object-contain border border-gray-300 rounded"
                            />
                            {image.url.startsWith('blob:') && (
                              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                                ⚠️
                              </div>
                            )}
                          </div>
                          
                          {/* Info & Controls */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {sortedIndex + 1}. {image.name}
                                </p>
                                {image.url && !image.url.startsWith('blob:') && (
                                  <p className="text-xs text-green-600 mt-1">✅ Đã upload</p>
                                )}
                              </div>
                              
                              {/* Reorder Buttons */}
                              <div className="flex flex-col gap-1 ml-2">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImageUp(actualIndex)}
                                  disabled={actualIndex === 0}
                                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                    actualIndex === 0
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                                  title="Di chuyển lên"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImageDown(actualIndex)}
                                  disabled={actualIndex >= sectionForm.passageImages.length - 1}
                                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                    actualIndex >= sectionForm.passageImages.length - 1
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                                  title="Di chuyển xuống"
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2">
                              {image.file && image.url.startsWith('blob:') && (
                                <button
                                  type="button"
                                  onClick={() => handleUploadSectionPassageImage(actualIndex)}
                                  disabled={isUploadingImage && uploadingImageField === `passageImage-${actualIndex}`}
                                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                                    isUploadingImage && uploadingImageField === `passageImage-${actualIndex}`
                                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                                >
                                  {isUploadingImage && uploadingImageField === `passageImage-${actualIndex}` 
                                    ? '⏳ Đang upload...' 
                                    : '📤 Upload'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeletePassageImage(actualIndex)}
                                className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          
          {/* ❌ REMOVED: Audio Upload Section - Audio is now at listening part level, not section level */}
          
          {/* ✅ REMOVED: Time limit field - Time is configured at level config, not per section */}
          {/* Time limit is automatically set from levelConfig when section is created */}
          {(selectedTestType === 'knowledge' || selectedTestType === 'listening') && (
            <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Thời gian cho section này
                  </p>
                  <p className="text-xs text-blue-700">
                    Thời gian được cấu hình ở <strong>Cấu hình cấp độ thi</strong> (tab "Cấu hình").
                    {levelConfig?.[selectedTestType]?.timeLimit ? (
                      <span className="block mt-1">
                        Thời gian hiện tại cho <strong>{getTestTypeLabel(selectedTestType)}</strong>: <strong className="text-blue-900">{levelConfig[selectedTestType].timeLimit} phút</strong>
                      </span>
                    ) : (
                      <span className="block mt-1 text-orange-600">
                        ⚠️ Chưa cấu hình thời gian cho {getTestTypeLabel(selectedTestType)}. Vui lòng cấu hình ở tab "Cấu hình".
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
            >
              💾 {editingSection ? t('examManagement.questions.sections.save') : t('examManagement.questions.sections.add')}
            </button>
            <button
              type="button"
              onClick={() => setShowSectionForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
            >
              {t('examManagement.questions.sections.cancel')}
            </button>
          </div>
        </form>
      </Modal>
        </div>
      </div>
    </div>
  );
}

export default ExamManagementPage;

