// src/pages/admin/ExamManagementPage.jsx
// Module quản lý đề thi JLPT - Cấu hình và nhập đề thi

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Modal from '../../components/Modal.jsx';
import storageManager from '../../utils/localStorageManager.js';
import { jlptExams } from '../../data/jlpt/jlptData.js';

function ExamManagementPage() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState('n1');
  const [activeSubTab, setActiveSubTab] = useState('config'); // 'config' | 'exams' | 'questions'
  
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
    status: 'Có sẵn',
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
    audioUrl: '' // Cho listening
  });
  const [sectionForm, setSectionForm] = useState({
    id: '',
    title: '',
    instruction: '',
    timeLimit: null
  });

  // Load exams when level changes
  useEffect(() => {
    loadExams();
    loadLevelConfig();
  }, [selectedLevel]);

  const loadExams = async () => {
    const savedExams = await storageManager.getExams(selectedLevel);
    if (savedExams && savedExams.length > 0) {
      setExams(savedExams);
    } else {
      // Fallback to default data
      setExams(jlptExams[selectedLevel] || []);
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
      alert('✅ Đã lưu cấu hình!');
    } else {
      alert('❌ Lỗi khi lưu cấu hình!');
    }
  };

  // Exam CRUD
  const handleAddExam = () => {
    setEditingExam(null);
    setExamForm({
      id: '',
      title: '',
      date: '',
      status: 'Có sẵn',
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
      alert('⚠️ Vui lòng điền đầy đủ thông tin!');
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

    // Sort by date (newest first)
    updatedExams.sort((a, b) => b.date.localeCompare(a.date));

    const success = await storageManager.saveExams(selectedLevel, updatedExams);
    if (success) {
      setExams(updatedExams);
      setShowExamForm(false);
      alert('✅ Đã lưu đề thi!');
    } else {
      alert('❌ Lỗi khi lưu đề thi!');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (confirm('⚠️ Xóa đề thi này? Tất cả câu hỏi sẽ bị xóa!')) {
      const updatedExams = exams.filter(e => e.id !== examId);
      await storageManager.saveExams(selectedLevel, updatedExams);
      await storageManager.deleteExam(selectedLevel, examId);
      setExams(updatedExams);
      alert('✅ Đã xóa đề thi!');
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
      setExamData(data);
      setSections(data[selectedTestType]?.sections || []);
    } else {
      // Initialize empty exam data
      const emptyData = {
        knowledge: { sections: [] },
        reading: { sections: [] },
        listening: { sections: [] }
      };
      setExamData(emptyData);
      setSections([]);
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
      alert('⚠️ Vui lòng điền đầy đủ ID và Tiêu đề section!');
      return;
    }

    const updatedSections = [...sections];
    if (editingSection) {
      const index = updatedSections.findIndex(s => s.id === editingSection.id);
      if (index >= 0) {
        updatedSections[index] = {
          ...editingSection,
          ...sectionForm,
          questions: editingSection.questions || []
        };
      }
    } else {
      if (updatedSections.find(s => s.id === sectionForm.id)) {
        alert('⚠️ ID section đã tồn tại!');
        return;
      }
      updatedSections.push({
        ...sectionForm,
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
    alert('✅ Đã lưu section!');
  };

  const handleDeleteSection = async (sectionId) => {
    if (confirm('⚠️ Xóa section này? Tất cả câu hỏi trong section sẽ bị xóa!')) {
      const updatedSections = sections.filter(s => s.id !== sectionId);
      await saveSections(updatedSections);
      alert('✅ Đã xóa section!');
    }
  };

  const saveSections = async (updatedSections) => {
    setSections(updatedSections);
    
    const updatedExamData = {
      ...examData,
      [selectedTestType]: {
        sections: updatedSections
      }
    };
    setExamData(updatedExamData);
    
    await storageManager.saveExam(selectedLevel, selectedExam.id, updatedExamData);
  };

  // Question CRUD
  const handleAddQuestion = (section) => {
    setSelectedSection(section);
    setEditingQuestion(null);
    setQuestionForm({
      id: '',
      category: selectedTestType,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      audioUrl: '',
      audioFile: null
    });
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (section, question) => {
    setSelectedSection(section);
    setEditingQuestion(question);
    setQuestionForm({
      id: question.id || question.number || question.subNumber,
      category: question.category || selectedTestType,
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 0,
      explanation: question.explanation || '',
      audioUrl: question.audioUrl || '',
      audioFile: null
    });
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question || !selectedSection) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Validate options
    const validOptions = questionForm.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('⚠️ Cần ít nhất 2 lựa chọn!');
      return;
    }

    const updatedSections = sections.map(section => {
      if (section.id === selectedSection.id) {
        const questions = [...(section.questions || [])];
        
        // Prepare question data with proper structure
        const questionData = {
          ...questionForm,
          options: validOptions
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
          }
        } else {
          // Check for duplicate
          const isDuplicate = questions.find(q => 
            q.id === questionForm.id || 
            (selectedTestType === 'listening' && q.number === questionData.number)
          );
          if (isDuplicate) {
            alert('⚠️ ID câu hỏi đã tồn tại!');
            return section;
          }
          questions.push(questionData);
        }

        // Sort questions by ID
        questions.sort((a, b) => {
          const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
          const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
          return idA - idB;
        });

        return { ...section, questions };
      }
      return section;
    });

    await saveSections(updatedSections);
    setShowQuestionForm(false);
    alert('✅ Đã lưu câu hỏi!');
  };

  const handleDeleteQuestion = async (section, question) => {
    if (confirm('⚠️ Xóa câu hỏi này?')) {
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
      alert('✅ Đã xóa câu hỏi!');
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-4 sm:pb-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          📋 Quản lý Đề thi JLPT
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Cấu hình điểm, thời gian và quản lý đề thi cho từng level
        </p>
      </div>

      {/* Level Selection */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Chọn Cấp độ (Level)
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
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-lg p-1.5 sm:p-2 flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeSubTab === 'config'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">⚙️ </span>Cấu hình
        </button>
        <button
          onClick={() => setActiveSubTab('exams')}
          className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeSubTab === 'exams'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">📋 </span>Danh sách Đề thi
        </button>
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`flex-1 min-w-full sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeSubTab === 'questions'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">✏️ </span>Nhập Câu hỏi
        </button>
      </div>

      {/* Config Tab */}
      {activeSubTab === 'config' && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            ⚙️ Cấu hình Điểm và Thời gian - Level {selectedLevel.toUpperCase()}
          </h2>
          
          <div className="space-y-6">
            {/* Level Overall Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                📊 Cấu hình Tổng thể
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm chuẩn (Điểm đậu) *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Điểm tối thiểu để đậu kỳ thi
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng điểm tối đa của kỳ thi
                  </p>
                </div>
              </div>
            </div>

            {/* Knowledge Test Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                📚 Kiến thức (言語知識・読解)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm chết (Điểm tối thiểu) *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tối đa *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút) *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Reading Test Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                📖 Đọc hiểu (読解)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm chết (Điểm tối thiểu) *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tối đa *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Đọc hiểu không có thời gian riêng, nằm trong phần Kiến thức
              </p>
            </div>

            {/* Listening Test Config */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                🎧 Nghe hiểu (聴解)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm chết (Điểm tối thiểu) *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tối đa *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút) *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveLevelConfig}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold"
              >
                💾 Lưu Cấu hình
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
                Danh sách Đề thi ({exams.length})
              </h2>
              <button
                onClick={handleAddExam}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-0"
              >
                <span>➕</span>
                <span>Thêm Đề thi mới</span>
              </button>
            </div>

            {/* Exams Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày thi</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[180px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {exams.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-8 text-center text-gray-500">
                        Chưa có đề thi nào
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm font-mono text-gray-900">{exam.id}</td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">{exam.title}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{exam.date}</td>
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
                              exam.status === 'Có sẵn' ? 'bg-green-100 text-green-800' :
                              exam.status === 'Sắp diễn ra' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="Có sẵn">Có sẵn</option>
                            <option value="Sắp diễn ra">Sắp diễn ra</option>
                            <option value="Đã kết thúc">Đã kết thúc</option>
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
                              title="Nhập câu hỏi"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleEditExam(exam)}
                              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                              title="Sửa"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              title="Xóa"
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
                Chọn Đề thi
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng chọn một đề thi từ danh sách để nhập câu hỏi
              </p>
              <button
                onClick={() => setActiveSubTab('exams')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Đi đến Danh sách Đề thi
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
                      onClick={() => setSelectedTestType('knowledge')}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        selectedTestType === 'knowledge'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📚 Kiến thức
                    </button>
                    <button
                      onClick={() => setSelectedTestType('reading')}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        selectedTestType === 'reading'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📖 Đọc hiểu
                    </button>
                    <button
                      onClick={() => setSelectedTestType('listening')}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        selectedTestType === 'listening'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🎧 Nghe hiểu
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                {examStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Kiến thức</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.knowledge.count} câu</div>
                      {examStats.knowledge.time > 0 && (
                        <div className="text-xs text-gray-500">{examStats.knowledge.time} phút</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Đọc hiểu</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.reading.count} câu</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Nghe hiểu</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.listening.count} câu</div>
                      {examStats.listening.time > 0 && (
                        <div className="text-xs text-gray-500">{examStats.listening.time} phút</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Tổng cộng</div>
                      <div className="text-lg font-bold text-blue-700">{examStats.total} câu</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sections List */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    Sections ({sections.length})
                  </h3>
                  <button
                    onClick={handleAddSection}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <span>➕</span>
                    <span>Thêm Section</span>
                  </button>
                </div>

                {sections.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="mb-4">Chưa có section nào</p>
                    <button
                      onClick={handleAddSection}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      ➕ Thêm Section đầu tiên
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
                                {section.questions?.length || 0} câu hỏi
                              </span>
                              {section.timeLimit && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                  {section.timeLimit} phút
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAddQuestion(section)}
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                              title="Thêm câu hỏi"
                            >
                              ➕
                            </button>
                            <button
                              onClick={() => handleEditSection(section)}
                              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                              title="Sửa section"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              title="Xóa section"
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
                                      Đáp án: <span className="font-semibold">
                                        {typeof question.correctAnswer === 'number' 
                                          ? String.fromCharCode(65 + question.correctAnswer)
                                          : question.correctAnswer}
                                      </span>
                                    </div>
                                    {question.audioUrl && (
                                      <div className="text-xs text-blue-600 mb-1">
                                        🎧 Audio: {question.audioUrl}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditQuestion(section, question)}
                                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                      title="Sửa"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(section, question)}
                                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                      title="Xóa"
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
                            Chưa có câu hỏi nào. Nhấn ➕ để thêm.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Exam Form Modal */}
      <Modal
        isOpen={showExamForm}
        onClose={() => setShowExamForm(false)}
        title={editingExam ? '✏️ Sửa Đề thi' : '➕ Thêm Đề thi mới'}
        maxWidth="32rem"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Đề thi * (ví dụ: 2024-12)
            </label>
            <input
              type="text"
              value={examForm.id}
              onChange={(e) => setExamForm({ ...examForm, id: e.target.value })}
              required
              disabled={!!editingExam}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="2024-12"
            />
            <p className="text-xs text-gray-500 mt-1">ID dùng để định danh đề thi</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="JLPT 2024/12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày thi *
            </label>
            <input
              type="text"
              value={examForm.date}
              onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2024/12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái *
            </label>
            <select
              value={examForm.status}
              onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Có sẵn">Có sẵn</option>
              <option value="Sắp diễn ra">Sắp diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Ảnh (tùy chọn)
            </label>
            <input
              type="text"
              value={examForm.imageUrl}
              onChange={(e) => setExamForm({ ...examForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/jlpt/n1/2024-12.jpg"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              💾 {editingExam ? 'Lưu thay đổi' : 'Thêm Đề thi'}
            </button>
            <button
              type="button"
              onClick={() => setShowExamForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Section Form Modal */}
      <Modal
        isOpen={showSectionForm}
        onClose={() => setShowSectionForm(false)}
        title={editingSection ? '✏️ Sửa Section' : '➕ Thêm Section mới'}
        maxWidth="32rem"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Section * (ví dụ: section1, section2)
            </label>
            <input
              type="text"
              value={sectionForm.id}
              onChange={(e) => setSectionForm({ ...sectionForm, id: e.target.value })}
              required
              disabled={!!editingSection}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="section1"
            />
            <p className="text-xs text-gray-500 mt-1">ID dùng để định danh section</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề * (ví dụ: 問題1, 問題2)
            </label>
            <input
              type="text"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="問題1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hướng dẫn (Instruction)
            </label>
            <textarea
              value={sectionForm.instruction}
              onChange={(e) => setSectionForm({ ...sectionForm, instruction: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。"
            />
          </div>
          {(selectedTestType === 'knowledge' || selectedTestType === 'listening') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian (phút) {selectedTestType === 'knowledge' ? '(tùy chọn)' : '*'}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedTestType === 'knowledge' 
                  ? 'Thời gian cho section này (tùy chọn, có thể để trống)'
                  : 'Thời gian bắt buộc cho listening section'}
              </p>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              💾 {editingSection ? 'Lưu thay đổi' : 'Thêm Section'}
            </button>
            <button
              type="button"
              onClick={() => setShowSectionForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Question Form Modal */}
      <Modal
        isOpen={showQuestionForm}
        onClose={() => {
          // Clean up blob URL if exists
          if (questionForm.audioUrl && questionForm.audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(questionForm.audioUrl);
          }
          setShowQuestionForm(false);
        }}
        title={editingQuestion ? '✏️ Sửa Câu hỏi' : '➕ Thêm Câu hỏi mới'}
        maxWidth="48rem"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          {/* Header Info */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-800 font-semibold">
              📍 Loại bài thi: <span className="uppercase">{selectedTestType}</span>
              {selectedSection && (
                <> | Section: <span className="font-mono">{selectedSection.title} ({selectedSection.id})</span></>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Câu hỏi * (ví dụ: 1, 2, 3)
              </label>
              <input
                type="text"
                value={questionForm.id}
                onChange={(e) => setQuestionForm({ ...questionForm, id: e.target.value })}
                required
                disabled={!!editingQuestion}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">ID dùng để định danh câu hỏi</p>
            </div>
            {selectedTestType === 'listening' && questionForm.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format cho Listening
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                  Key: {selectedSection?.id || 'section'}-{String(questionForm.id).padStart(2, '0')}
                </div>
                <p className="text-xs text-gray-500 mt-1">Format này sẽ được dùng trong ExamListeningPage</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu hỏi *
            </label>
            <textarea
              value={questionForm.question}
              onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="彼の説明は（　　）で、誰にでも理解できる。"
            />
          </div>
          {/* Options - Grid Layout like Quiz Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lựa chọn * (ít nhất 2 lựa chọn)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      questionForm.correctAnswer === idx ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder={`Đáp án ${label}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Đáp án đúng sẽ được highlight màu xanh lá. Có thể để trống lựa chọn C và D nếu chỉ có 2 lựa chọn.
            </p>
          </div>

          {/* Correct Answer Selection - Like Quiz Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đáp án đúng *
            </label>
            <select
              value={questionForm.correctAnswer}
              onChange={(e) => setQuestionForm({ 
                ...questionForm, 
                correctAnswer: parseInt(e.target.value) 
              })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {questionForm.options.map((opt, idx) => {
                if (!opt.trim()) return null;
                return (
                  <option key={idx} value={idx}>
                    Đáp án đúng: {String.fromCharCode(65 + idx)}
                  </option>
                );
              })}
            </select>
            {questionForm.options[questionForm.correctAnswer] && (
              <p className="text-xs text-green-600 mt-1 font-semibold">
                ✅ Đã chọn: {String.fromCharCode(65 + questionForm.correctAnswer)} - {questionForm.options[questionForm.correctAnswer]}
              </p>
            )}
          </div>
          {/* Audio Upload Section - Always visible for listening, hidden for others */}
          {selectedTestType === 'listening' && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 sm:p-6 border-2 border-purple-300 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎧</span>
                <div>
                  <label className="block text-base font-bold text-gray-800">
                    File Audio * (Bắt buộc cho Listening)
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Upload file audio hoặc nhập URL cho câu hỏi nghe hiểu
                  </p>
                </div>
              </div>
              
              {/* File Upload - Prominent */}
              <div className="mb-4">
                <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-400 hover:border-purple-500 transition-colors">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📤 Upload File Audio
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Validate file size (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          alert('⚠️ File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');
                          e.target.value = '';
                          return;
                        }
                        
                        // Validate file type
                        if (!file.type.startsWith('audio/')) {
                          alert('⚠️ Vui lòng chọn file audio!');
                          e.target.value = '';
                          return;
                        }

                        // Create object URL for preview
                        const audioUrl = URL.createObjectURL(file);
                        setQuestionForm({ ...questionForm, audioUrl, audioFile: file });
                      }
                    }}
                    className="w-full px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white cursor-pointer text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    📎 Chọn file audio (MP3, WAV, OGG) - Tối đa 10MB
                  </p>
                  {questionForm.audioFile && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                      <p className="text-sm text-green-800 font-bold flex items-center gap-2">
                        <span>✅</span>
                        <span>Đã chọn: {questionForm.audioFile.name}</span>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Kích thước: {(questionForm.audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Preview - Always show if URL exists */}
              {questionForm.audioUrl && (
                <div className="mb-4 bg-white rounded-lg p-4 border-2 border-purple-300 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🔊</span>
                    <p className="text-sm font-bold text-gray-800">Preview Audio</p>
                  </div>
                  <audio controls className="w-full h-10">
                    <source src={questionForm.audioUrl} type="audio/mpeg" />
                    Trình duyệt không hỗ trợ audio.
                  </audio>
                  {questionForm.audioUrl.startsWith('blob:') && (
                    <div className="mt-3 p-2 bg-orange-50 rounded border-2 border-orange-300">
                      <p className="text-xs text-orange-800 font-semibold">
                        ⚠️ File tạm thời (blob URL)
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Cần upload file vào thư mục public/audio và nhập URL cố định để lưu vĩnh viễn.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* URL Input (Alternative) - More Prominent */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  🔗 Hoặc nhập URL Audio (nếu đã upload sẵn)
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
                    placeholder="/audio/n1/2024-12/listening-1.mp3"
                  />
                  {questionForm.audioUrl && !questionForm.audioUrl.startsWith('blob:') && (
                    <button
                      type="button"
                      onClick={() => {
                        const audio = new Audio(questionForm.audioUrl);
                        audio.play().catch(() => alert('⚠️ Không thể phát audio. Kiểm tra lại URL.'));
                      }}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm shadow-md transition-colors"
                      title="Test audio URL"
                    >
                      ▶️ Test
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <span>💡</span>
                  <span>Đường dẫn từ thư mục public (ví dụ: /audio/n1/2024-12/q1-01.mp3)</span>
                </p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giải thích *
            </label>
            <textarea
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="「簡潔」は「短くてわかりやすい」という意味で、説明の質を表すのに最適です。"
            />
            <p className="text-xs text-gray-500 mt-1">
              Giải thích chi tiết tại sao đáp án này đúng
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              💾 {editingQuestion ? 'Lưu thay đổi' : 'Thêm Câu hỏi'}
            </button>
            <button
              type="button"
              onClick={() => setShowQuestionForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ExamManagementPage;

