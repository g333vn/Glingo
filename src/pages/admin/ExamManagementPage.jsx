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
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
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

  // Load exam questions
  const loadExamQuestions = async (examId, testType) => {
    const examData = await storageManager.getExam(selectedLevel, examId);
    return examData?.[testType] || null;
  };

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
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            exam.status === 'Có sẵn' ? 'bg-green-100 text-green-800' :
                            exam.status === 'Sắp diễn ra' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {exam.status}
                          </span>
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

      {/* Questions Tab - Placeholder */}
      {activeSubTab === 'questions' && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Nhập Câu hỏi
          </h2>
          <p className="text-sm text-gray-600">
            {selectedExam 
              ? `Đang phát triển module nhập câu hỏi cho đề thi: ${selectedExam.title}`
              : 'Vui lòng chọn một đề thi từ danh sách để nhập câu hỏi'}
          </p>
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
    </div>
  );
}

export default ExamManagementPage;

