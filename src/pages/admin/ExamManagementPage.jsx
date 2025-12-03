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
} from '../../services/examService.js';

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

  let nextId = 1;
  const normalized = { ...data };

  TEST_TYPE_ORDER.forEach((type) => {
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
        return normalizedQuestion;
      });

      return normalizedSection;
    });

    normalized[type] = { ...typeData, sections: normalizedSections };
  });

  normalized.totalQuestions = nextId - 1;
  return { data: normalized, nextId: nextId - 1 };
};

const QUESTION_TEMPLATES = {
  knowledge: {
    id: '1',
    category: 'knowledge',
    question: '（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。',
    options: ['答え A', '答え B', '答え C', '答え D'],
    correctAnswer: 0,
    explanation: '正しい答えの理由をここに書きます。'
  },
  reading: {
    id: '10',
    category: 'reading',
    question: '次の文章を読んで、後の問いに答えなさい。',
    options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
    correctAnswer: 1,
    explanation: '本文のどの部分が根拠になるかを説明します。'
  },
  listening: {
    id: '30',
    category: 'listening',
    question: '音声を聞いて、最も正しい答えを選びなさい。',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 2,
    explanation: '音声中のキーフレーズなどを説明します。',
    audioUrl: '/audio/n1/2024-12/listening-30.mp3'
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
    explanation: '',
    audioUrl: '', // Cho listening
    audioFile: null
  });
  const [autoGeneratedId, setAutoGeneratedId] = useState(null);
  const [isFinalizingExam, setIsFinalizingExam] = useState(false);
  
  // ✅ Quiz Editor style states - Preview & Export
  const [showPreview, setShowPreview] = useState(false);
  const [exportedJSON, setExportedJSON] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    id: '',
    title: '',
    instruction: '',
    timeLimit: null
  });
  const jsonUploadInputRef = useRef(null);

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
    const savedExams = await storageManager.getExams(selectedLevel);
    if (savedExams && savedExams.length > 0) {
      // ✅ FIX: Sort theo năm mới nhất trước
      setExams(sortExamsByYear(savedExams));
    } else {
      // Fallback to default data
      const defaultExams = jlptExams[selectedLevel] || [];
      // ✅ FIX: Sort default exams cũng theo năm mới nhất trước
      setExams(sortExamsByYear(defaultExams));
    }
  };

  const loadLevelConfig = async () => {
    const config = await storageManager.getLevelConfig(selectedLevel);
    if (config) {
      setLevelConfig(config);
    }
  };

  const saveLevelConfig = async () => {
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
    
    const data = await storageManager.getExam(selectedLevel, selectedExam.id);
    if (data) {
      // ✅ FIX: Tự động set timeLimit cho sections không có timeLimit
      const updatedData = { ...data };
      ['knowledge', 'listening'].forEach(testType => {
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
      
      // Nếu có sections được update, lưu lại
      const hasUpdates = JSON.stringify(data) !== JSON.stringify(updatedData);
      if (hasUpdates) {
        console.log('✅ Đã tự động cập nhật timeLimit cho sections, đang lưu...');
        await storageManager.saveExam(selectedLevel, selectedExam.id, updatedData);
      }
      
      setExamData(updatedData);
      setSections(updatedData[selectedTestType]?.sections || []);
      setSelectedSection(updatedData[selectedTestType]?.sections?.[0] || null);
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

  // Section CRUD
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionForm({
      id: '',
      title: '',
      instruction: '',
      timeLimit: null
    });
    setShowSectionForm(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionForm({
      id: section.id,
      title: section.title,
      instruction: section.instruction || '',
      timeLimit: section.timeLimit || null
    });
    setShowSectionForm(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.id || !sectionForm.title) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillSectionInfo')}`);
      return;
    }

    const updatedSections = [...sections];
    if (editingSection) {
      const index = updatedSections.findIndex(s => s.id === editingSection.id);
      if (index >= 0) {
      updatedSections[index] = {
        ...editingSection,
        ...sectionForm,
        // ✅ FIX: Đảm bảo timeLimit được lưu (có thể là null nếu không set)
        timeLimit: sectionForm.timeLimit !== undefined ? sectionForm.timeLimit : editingSection.timeLimit,
        questions: editingSection.questions || []
      };
      }
    } else {
      if (updatedSections.find(s => s.id === sectionForm.id)) {
        alert(`⚠️ ${t('examManagement.questions.sections.idExists')}`);
        return;
      }
      updatedSections.push({
        ...sectionForm,
        // ✅ FIX: Đảm bảo timeLimit được lưu (có thể là null nếu không set)
        timeLimit: sectionForm.timeLimit !== undefined ? sectionForm.timeLimit : null,
        questions: []
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
    setShowSectionForm(false);
    alert(`✅ ${t('examManagement.config.saveSuccess')}\n\n` +
          `📝 ${editingSection ? t('examManagement.questions.questionForm.sectionSaved') : t('examManagement.questions.questionForm.sectionAdded')} ${t('examManagement.questions.questionForm.sectionSavedText')}:\n` +
          `   - ${t('examManagement.questions.testTypes.knowledge')}: ${sectionForm.type === 'knowledge' ? t('examManagement.questions.testTypes.knowledge') : t('examManagement.questions.testTypes.listening')}\n` +
          `   - ${t('examManagement.exams.table.title')}: ${selectedExam?.title || selectedExam?.id}\n` +
          `   - ${t('examManagement.selectLevel')}: ${selectedLevel.toUpperCase()}\n\n` +
          `💾 ${t('examManagement.questions.questionForm.savedToSystem')}`);
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
        sections: updatedSections
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
          listening: normalizedExam.listening || { sections: [] },
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
    if (!selectedSection || !questionForm.question) {
      return null;
    }
    
    const questionData = {
      id: questionForm.id,
      question: questionForm.question,
      options: questionForm.options
        .filter(opt => opt.trim() !== '')
        .map((opt, idx) => ({
          label: String.fromCharCode(65 + idx),
          text: opt
        })),
      correctAnswer: String.fromCharCode(65 + questionForm.correctAnswer),
      explanation: questionForm.explanation,
      ...(selectedTestType === 'listening' && questionForm.audioUrl && {
        audioUrl: questionForm.audioUrl
      })
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

  const isQuestionValid = () => {
    if (!questionForm.question.trim()) return false;
    if (!questionForm.id) return false;
    if (isDuplicateQuestionId && !editingQuestion) return false;
    const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return false;
    if (!questionForm.explanation.trim()) return false;
    if (selectedTestType === 'listening' && !questionForm.audioUrl) return false;
    return true;
  };

  // ✅ Helper: Lấy title mặc định cho section
  const getDefaultSectionTitle = (testType) => {
    const titles = {
      knowledge: '問題1',
      reading: '問題1',
      listening: '問題1'
    };
    return titles[testType] || '問題1';
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
      const defaultSection = {
        id: 'section1',
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
    const defaultIdValue = String(nextQuestionIdSuggestion);
    setAutoGeneratedId(defaultIdValue);
    setQuestionForm({
      id: defaultIdValue,
      category: selectedTestType, // ✅ Đảm bảo category được set từ selectedTestType (knowledge/reading/listening)
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      audioUrl: '',
      audioFile: null
    });
    setExportedJSON('');
    setShowPreview(false);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (section, question) => {
    setSelectedSection(section);
    setEditingQuestion(question);
    setAutoGeneratedId(null);
    // ✅ FIX: Use audioData if available (base64), otherwise use audioUrl
    const audioUrlToUse = question.audioData || question.audioUrl || '';
    setQuestionForm({
      id: question.id || question.number || question.subNumber,
      category: question.category || selectedTestType,
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 0,
      explanation: question.explanation || '',
      audioUrl: audioUrlToUse, // Can be data URL (base64) or regular URL
      audioFile: null
    });
    setExportedJSON('');
    setShowPreview(false);
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question || !selectedSection) {
      alert(`⚠️ ${t('examManagement.questions.questionForm.fillAllInfoGeneral')}`);
      return;
    }

    // Validate options
    const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('⚠️ Cần ít nhất 2 lựa chọn!');
      return;
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
          return; // ✅ FIX: Return early, không lưu gì cả
        }
      }
    }

    // ✅ FIX: Convert audio file to base64 BEFORE processing sections
    let convertedAudioData = null;
    if (selectedTestType === 'listening' && questionForm.audioFile && questionForm.audioUrl?.startsWith('blob:')) {
      try {
        convertedAudioData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(questionForm.audioFile);
        });
        console.log('✅ Converted audio file to base64:', {
          fileName: questionForm.audioFile.name,
          fileSize: questionForm.audioFile.size,
          base64Length: convertedAudioData.length
        });
      } catch (error) {
        console.error('❌ Error converting audio to base64:', error);
        alert('⚠️ Lỗi khi convert audio file. Vui lòng thử lại.');
        return; // Stop saving if conversion fails
      }
    }

    const updatedSections = sections.map((section) => {
      if (section.id === selectedSection.id) {
        const questions = [...(section.questions || [])];
        
        // Prepare question data with proper structure
        // Remove audioFile (File object cannot be serialized)
        const { audioFile, ...questionDataWithoutFile } = questionForm;
        
        // ✅ FIX: Determine audio storage format
        // If we converted a new file, use audioData
        // If audioUrl is a data URL (from existing audioData), save as audioData
        // Otherwise, save as audioUrl (regular URL)
        let audioStorage = {};
        if (convertedAudioData) {
          // New file converted to base64
          audioStorage = { audioData: convertedAudioData, audioUrl: '' };
        } else if (questionForm.audioUrl?.startsWith('data:')) {
          // Existing audioData loaded as data URL, save back as audioData
          audioStorage = { audioData: questionForm.audioUrl, audioUrl: '' };
        } else if (questionForm.audioUrl && !questionForm.audioUrl.startsWith('blob:')) {
          // Regular URL (not blob, not data)
          audioStorage = { audioUrl: questionForm.audioUrl };
        } else {
          // No audio or invalid blob URL
          audioStorage = { audioUrl: '' };
        }
        
        const questionData = {
          ...questionDataWithoutFile,
          options: validOptions,
          // ✅ FIX: Đảm bảo category được set đúng dựa trên selectedTestType
          category: questionForm.category || selectedTestType, // ✅ Set category từ testType (knowledge/reading/listening)
          // ✅ FIX: Save audio in appropriate format
          ...audioStorage
        };

        // For listening, ensure proper structure matching ExamListeningPage
        if (selectedTestType === 'listening') {
          // Convert id to number format (01, 02, etc.) for listening
          const numberStr = String(questionForm.id).padStart(2, '0');
          questionData.number = numberStr;
          questionData.subNumber = questionForm.id;
          // Ensure section.id is string for key format `${section.id}-${q.number}`
          if (typeof section.id !== 'string') {
            section.id = String(section.id);
          }
        }
        
        if (editingQuestion) {
          const index = questions.findIndex(q => 
            q.id === editingQuestion.id || 
            (selectedTestType === 'listening' && q.number === editingQuestion.number)
          );
          if (index >= 0) {
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
    
    // ✅ FIX: Revoke blob URL after saving (if converted to base64)
    if (convertedAudioData && questionForm.audioUrl && questionForm.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(questionForm.audioUrl);
      console.log('✅ Revoked blob URL after saving');
    }
    
    setShowQuestionForm(false);
    setAutoGeneratedId(null);
    alert(`✅ ${t('examManagement.config.saveSuccess')}\n\n` +
          `❓ ${editingQuestion ? t('examManagement.questions.questionForm.questionSaved') : t('examManagement.questions.questionForm.questionAdded')} ${t('examManagement.questions.questionForm.questionSavedText')}:\n` +
          `   - ID: ${questionForm.id || 'N/A'}\n` +
          `   - ${t('examManagement.questions.testTypes.knowledge')}: ${getTestTypeLabel(selectedTestType) || selectedTestType}\n` +
          `   - ${t('examManagement.exams.table.title')}: ${selectedExam?.title || selectedExam?.id}\n\n` +
          `💾 ${t('examManagement.questions.questionForm.savedToSystem')}`);
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

  const nextQuestionIdSuggestion = useMemo(() => {
    if (questionOverview.length === 0) return 1;
    const maxId = Math.max(...questionOverview.map((item) => item.numericId));
    return Number.isFinite(maxId) ? maxId + 1 : 1;
  }, [questionOverview]);

  const existingQuestionIdsSet = useMemo(() => {
    return new Set(questionOverview.map((item) => String(item.id || item.numericId)));
  }, [questionOverview]);

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

  const templateJSON = useMemo(() => {
    const template = QUESTION_TEMPLATES[selectedTestType] || QUESTION_TEMPLATES.knowledge;
    return JSON.stringify(template, null, 2);
  }, [selectedTestType]);

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
    reader.onload = () => {
      try {
        const text = reader.result;
        const data = typeof text === 'string' ? JSON.parse(text) : JSON.parse(new TextDecoder().decode(text));
        const normalizedOptions = ['', '', '', ''];
        if (Array.isArray(data.options)) {
          data.options.slice(0, 4).forEach((opt, idx) => {
            normalizedOptions[idx] = typeof opt === 'string' ? opt : '';
          });
        }
        const normalizedId = data.id !== undefined && data.id !== null ? String(data.id) : String(nextQuestionIdSuggestion);
        const normalizedQuestion = {
          id: normalizedId,
          category: selectedTestType,
          question: typeof data.question === 'string' ? data.question : '',
          options: normalizedOptions,
          correctAnswer: typeof data.correctAnswer === 'number' && data.correctAnswer >= 0 && data.correctAnswer <= 3 ? data.correctAnswer : 0,
          explanation: typeof data.explanation === 'string' ? data.explanation : '',
          audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : '',
          audioFile: null
        };

        if (!normalizedQuestion.question) {
          alert('⚠️ JSON chưa có nội dung câu hỏi.');
          resetInput();
          return;
        }

        if (selectedTestType === 'listening' && !normalizedQuestion.audioUrl) {
          alert('⚠️ JSON cần có trường audioUrl cho câu nghe hiểu.');
        }

        setQuestionForm(normalizedQuestion);
        setAutoGeneratedId(normalizedId);
        setExportedJSON(JSON.stringify(data, null, 2));
        setShowPreview(true);
        setEditingQuestion(null);
        alert('✅ Đã nạp JSON vào form. Vui lòng kiểm tra trước khi lưu.');
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

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
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
                  // Clean up blob URL if exists
                  if (questionForm.audioUrl && questionForm.audioUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(questionForm.audioUrl);
                  }
                  setShowQuestionForm(false);
                  setExportedJSON('');
                  setShowPreview(false);
                  setAutoGeneratedId(null);
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
              <form onSubmit={handleSaveQuestion} className="space-y-4 sm:space-y-6">
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

                {/* Question Text - Like Quiz Editor */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.questions.questionForm.questionLabel')}
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    required
                    placeholder={t('examManagement.questions.questionForm.questionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
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
                      <div key={idx}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}:
                        </label>
                        <input
                          type="text"
                          value={questionForm.options[idx] || ''}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={t('examManagement.questions.questionForm.optionPlaceholder', { label })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            questionForm.correctAnswer === idx ? 'border-green-500 bg-green-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation - Like Quiz Editor */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('examManagement.questions.questionForm.explanationLabel')}
                  </label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    required
                    placeholder={t('examManagement.questions.questionForm.explanationPlaceholder')}
                    rows={2}
                    className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>

                {/* Audio Upload Section - For Listening */}
                {selectedTestType === 'listening' && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-4 sm:p-6 border-2 border-purple-300">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🎧</span>
                      <div>
                        <label className="block text-base font-bold text-gray-800">
                          {t('examManagement.questions.questionForm.audioRequired')}
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          {t('examManagement.questions.questionForm.audioHint')}
                        </p>
                      </div>
                    </div>
                    
                    {/* File Upload */}
                    <div className="mb-4">
                      <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-400 hover:border-purple-500 transition-colors">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📤 {t('examManagement.questions.questionForm.uploadAudio')}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="audio/*"
                            id="audio-file-input"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  alert(`⚠️ ${t('examManagement.questions.questionForm.fileTooLarge')}`);
                                  e.target.value = '';
                                  return;
                                }
                                if (!file.type.startsWith('audio/')) {
                                  alert(`⚠️ ${t('examManagement.questions.questionForm.selectAudioFile')}`);
                                  e.target.value = '';
                                  return;
                                }
                                // ✅ FIX: Revoke old blob URL if exists to prevent memory leak
                                if (questionForm.audioUrl && questionForm.audioUrl.startsWith('blob:')) {
                                  URL.revokeObjectURL(questionForm.audioUrl);
                                }
                                // ✅ FIX: Create new blob URL and update state
                                const audioUrl = URL.createObjectURL(file);
                                console.log('✅ Created blob URL for preview:', audioUrl);
                                setQuestionForm(prev => ({ 
                                  ...prev, 
                                  audioUrl, 
                                  audioFile: file 
                                }));
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex items-center gap-2 px-3 py-2.5 border-2 border-purple-300 rounded-lg bg-white">
                            <button
                              type="button"
                              onClick={() => document.getElementById('audio-file-input')?.click()}
                              className="px-4 py-1.5 bg-purple-500 text-white rounded text-sm font-semibold hover:bg-purple-600 transition-colors"
                            >
                              {t('examManagement.questions.questionForm.chooseFile')}
                            </button>
                            <span className="text-sm text-gray-600 flex-1">
                              {questionForm.audioFile ? questionForm.audioFile.name : t('examManagement.questions.questionForm.noFileChosen')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          📎 {t('examManagement.questions.questionForm.selectAudio')}
                        </p>
                        {questionForm.audioFile && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                            <p className="text-sm text-green-800 font-bold flex items-center gap-2">
                              <span>✅</span>
                              <span>{t('examManagement.questions.questionForm.selectedFile')}: {questionForm.audioFile.name}</span>
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {t('examManagement.questions.questionForm.fileSize')}: {(questionForm.audioFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audio Preview */}
                    {questionForm.audioUrl && (
                      <div className="mb-4 bg-white rounded-lg p-4 border-2 border-purple-300 shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">🔊</span>
                          <p className="text-sm font-bold text-gray-800">{t('examManagement.questions.questionForm.previewAudio')}</p>
                        </div>
                        {/* ✅ FIX: Add key prop to force re-render when audioUrl changes */}
                        <audio 
                          key={questionForm.audioUrl} 
                          controls 
                          preload="auto"
                          className="w-full h-10"
                          onLoadedMetadata={(e) => {
                            console.log('✅ Audio preview loaded:', {
                              duration: e.target.duration,
                              src: questionForm.audioUrl.substring(0, 50) + '...'
                            });
                          }}
                          onError={(e) => {
                            console.error('❌ Audio preview error:', e);
                            console.error('Audio URL:', questionForm.audioUrl);
                          }}
                          onCanPlay={(e) => {
                            console.log('✅ Audio can play now');
                          }}
                        >
                          <source src={questionForm.audioUrl} type={questionForm.audioFile?.type || "audio/mpeg"} />
                          {t('examManagement.questions.questionForm.browserNotSupport')}
                        </audio>
                        {questionForm.audioUrl.startsWith('blob:') && (
                          <div className="mt-3 p-2 bg-orange-50 rounded border-2 border-orange-300">
                            <p className="text-xs text-orange-800 font-semibold">
                              ⚠️ {t('examManagement.questions.questionForm.tempFile')}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              {t('examManagement.questions.questionForm.tempFileHint')}
                            </p>
                          </div>
                        )}
                        {questionForm.audioUrl.startsWith('data:') && (
                          <div className="mt-3 p-2 bg-green-50 rounded border-2 border-green-300">
                            <p className="text-xs text-green-800 font-semibold">
                              ✅ {t('examManagement.questions.questionForm.savedAsBase64')}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {t('examManagement.questions.questionForm.savedPermanently')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* URL Input */}
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        🔗 {t('examManagement.questions.questionForm.audioUrlLabel')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={questionForm.audioUrl && !questionForm.audioUrl.startsWith('blob:') ? questionForm.audioUrl : ''}
                          onChange={(e) => {
                            if (!e.target.value.startsWith('blob:')) {
                              setQuestionForm({ ...questionForm, audioUrl: e.target.value, audioFile: null });
                            }
                          }}
                          className="flex-1 px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          placeholder={t('examManagement.questions.questionForm.audioUrlPlaceholder')}
                        />
                        {questionForm.audioUrl && !questionForm.audioUrl.startsWith('blob:') && (
                          <button
                            type="button"
                            onClick={() => {
                              const audio = new Audio(questionForm.audioUrl);
                              audio.play().catch(() => alert(`⚠️ ${t('examManagement.questions.questionForm.cannotPlayAudio')}`));
                            }}
                            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm shadow-md transition-colors"
                            title={t('examManagement.questions.questionForm.testAudioTitle')}
                          >
                            ▶️ {t('examManagement.questions.questionForm.testAudio')}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                        <span>💡</span>
                        <span>{t('examManagement.questions.questionForm.audioUrlHint')}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-2 border-dashed border-gray-300">
                  <button
                    type="submit"
                    disabled={isDuplicateQuestionId}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-all font-semibold text-base sm:text-lg flex items-center justify-center gap-2 ${
                      isDuplicateQuestionId
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">💾</span>
                    {editingQuestion ? t('examManagement.questions.questionForm.saveChanges') : t('examManagement.questions.questionForm.addQuestion')}
                  </button>
                  <p className="text-center text-gray-500 text-xs sm:text-sm mt-2">
                    {editingQuestion ? t('examManagement.questions.questionForm.saveChangesHint') : t('examManagement.questions.questionForm.addQuestionHint')}
                  </p>
                </div>
              </form>
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
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    {showTemplate ? `📄 ${t('examManagement.questions.questionForm.hideTemplate')}` : `📄 ${t('examManagement.questions.questionForm.showTemplate')}`}
                  </button>

                  {showTemplate && (
                    <div className="bg-gray-900 text-green-200 rounded-lg p-3 space-y-3 text-xs sm:text-sm max-h-64 overflow-y-auto border border-gray-700">
                      <div className="flex items-center justify-between text-gray-100">
                        <span>{t('examManagement.questions.questionForm.templateTitle', { type: getTestTypeLabel(selectedTestType) || selectedTestType })}</span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(templateJSON)}
                          className="px-2 py-1 text-[11px] bg-gray-700 rounded hover:bg-gray-600"
                        >
                          {t('examManagement.questions.questionForm.copy')}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">
{templateJSON}
                      </pre>
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

              {/* Preview */}
              {showPreview && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Preview</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-blue-800">
                        Câu hỏi {questionForm.id || 'mới'}: {questionForm.question || '(Chưa có câu hỏi)'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-1 text-sm">
                        {questionForm.options.map((opt, idx) => {
                          if (!opt.trim()) return null;
                          return (
                            <p
                              key={idx}
                              className={questionForm.correctAnswer === idx ? 'text-green-600 font-semibold' : 'text-gray-600'}
                            >
                              {String.fromCharCode(65 + idx)}. {opt || '(Chưa có đáp án)'}
                            </p>
                          );
                        })}
                      </div>
                      {questionForm.explanation && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            <strong>Giải thích:</strong> {questionForm.explanation}
                          </p>
                        </div>
                      )}
                      {selectedTestType === 'listening' && questionForm.audioUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-purple-600">
                            <strong>🎧 Audio:</strong> {questionForm.audioUrl}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.questions.sections.idLabel')}
            </label>
            <input
              type="text"
              value={sectionForm.id}
              onChange={(e) => setSectionForm({ ...sectionForm, id: e.target.value })}
              required
              disabled={!!editingSection}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder={t('examManagement.questions.sections.idPlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">{t('examManagement.questions.sections.idHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.questions.sections.titleLabel')}
            </label>
            <input
              type="text"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              required
              className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              placeholder={t('examManagement.questions.sections.titlePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('examManagement.questions.sections.instruction')}
            </label>
            <textarea
              value={sectionForm.instruction}
              onChange={(e) => setSectionForm({ ...sectionForm, instruction: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder={t('examManagement.questions.sections.instructionPlaceholder')}
            />
          </div>
          {(selectedTestType === 'knowledge' || selectedTestType === 'listening') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('examManagement.questions.sections.timeLimit')} {selectedTestType === 'knowledge' ? t('examManagement.questions.sections.timeLimitOptional') : '*'}
              </label>
              <input
                type="number"
                value={sectionForm.timeLimit || ''}
                onChange={(e) => setSectionForm({ 
                  ...sectionForm, 
                  timeLimit: e.target.value ? parseInt(e.target.value) : null 
                })}
                min="1"
                required={selectedTestType === 'listening'}
                className="w-full px-3 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                placeholder={t('examManagement.questions.sections.timeLimitPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedTestType === 'knowledge' 
                  ? t('examManagement.questions.sections.timeLimitHint')
                  : t('examManagement.questions.sections.timeLimitRequiredHint')}
              </p>
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

