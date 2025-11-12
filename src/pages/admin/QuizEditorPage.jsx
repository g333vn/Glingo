// src/pages/admin/QuizEditorPage.jsx
// Tool nhập liệu quiz - Dễ dàng tạo quiz mới và export ra JSON
// ⚠️ PROTECTED: Chỉ admin mới có thể truy cập (bảo vệ bằng ProtectedRoute)

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { n1BooksMetadata } from '../../data/level/n1/books-metadata.js';
import { n1Books } from '../../data/level/n1/books.js';
// TODO: Import các level khác khi có data
// import { n2BooksMetadata } from '../../data/level/n2/books-metadata.js';
// import { n2Books } from '../../data/level/n2/books.js';

function QuizEditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ✅ NEW: Location selection states
  const [selectedLevel, setSelectedLevel] = useState('n1');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' }
      ],
      correct: 'A',
      explanation: ''
    }
  ]);

  const [exportedJSON, setExportedJSON] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // ✅ NEW: Get books by level (check localStorage first, fallback to default)
  const getBooksByLevel = (levelId) => {
    // Check localStorage first (saved from Content Management)
    const savedBooks = localStorage.getItem(`adminBooks_${levelId}`);
    if (savedBooks) {
      try {
        return JSON.parse(savedBooks);
      } catch (error) {
        console.error('Error loading saved books:', error);
      }
    }
    
    // Fallback to default data
    switch(levelId) {
      case 'n1': return n1BooksMetadata;
      // TODO: Thêm các level khác
      // case 'n2': return n2BooksMetadata;
      // case 'n3': return n3BooksMetadata;
      // case 'n4': return n4BooksMetadata;
      // case 'n5': return n5BooksMetadata;
      default: return [];
    }
  };

  // ✅ NEW: Get book data by level and bookId
  const getBookData = (levelId, bookId) => {
    switch(levelId) {
      case 'n1': return n1Books[bookId];
      // TODO: Thêm các level khác
      default: return null;
    }
  };

  // ✅ NEW: Available books for selected level
  const availableBooks = useMemo(() => {
    return getBooksByLevel(selectedLevel);
  }, [selectedLevel]);

  // ✅ NEW: Available chapters for selected book
  const availableChapters = useMemo(() => {
    if (!selectedBook || !selectedLevel) return [];
    const bookData = getBookData(selectedLevel, selectedBook);
    return bookData?.contents || [];
  }, [selectedBook, selectedLevel]);

  // ✅ NEW: Reset book and chapter when level changes
  useEffect(() => {
    setSelectedBook('');
    setSelectedChapter('');
  }, [selectedLevel]);

  // ✅ NEW: Reset chapter when book changes
  useEffect(() => {
    setSelectedChapter('');
  }, [selectedBook]);

  // ✅ NEW: Auto-fill quiz title from chapter
  useEffect(() => {
    if (selectedChapter && availableChapters.length > 0 && !quizTitle) {
      const chapter = availableChapters.find(ch => ch.id === selectedChapter);
      if (chapter?.title) {
        setQuizTitle(chapter.title);
      }
    }
  }, [selectedChapter, availableChapters, quizTitle]);

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text' || field === 'correct' || field === 'explanation') {
      newQuestions[index][field] = value;
    } else if (field.startsWith('option-')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex].text = value;
    }
    setQuestions(newQuestions);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      text: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' }
      ],
      correct: 'A',
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      alert('⚠️ Phải có ít nhất 1 câu hỏi!');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    // Re-number questions
    const renumberedQuestions = newQuestions.map((q, i) => ({
      ...q,
      id: i + 1
    }));
    setQuestions(renumberedQuestions);
  };

  // Duplicate question
  const duplicateQuestion = (index) => {
    const questionToDuplicate = questions[index];
    const newQuestion = {
      ...questionToDuplicate,
      id: questions.length + 1,
      text: questionToDuplicate.text + ' (Copy)',
      options: questionToDuplicate.options.map(opt => ({ ...opt }))
    };
    setQuestions([...questions, newQuestion]);
  };

  // Generate JSON
  const generateJSON = () => {
    const quizData = {
      title: quizTitle || 'Untitled Quiz',
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options.map(opt => ({
          label: opt.label,
          text: opt.text
        })),
        correct: q.correct,
        explanation: q.explanation
      }))
    };

    return JSON.stringify(quizData, null, 2);
  };

  // Export JSON
  const handleExport = () => {
    const json = generateJSON();
    setExportedJSON(json);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportedJSON || generateJSON());
    alert('✅ Đã copy JSON vào clipboard!');
  };

  // Download JSON file
  const handleDownload = () => {
    const json = generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // ✅ NEW: Generate filename based on location
    let filename = 'quiz.json';
    if (selectedChapter) {
      filename = `${selectedChapter}.json`;
    } else if (selectedBook) {
      filename = `${selectedBook}-quiz.json`;
    } else {
      filename = `bai-${questions[0]?.id || 'X'}.json`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ NEW: Get file path for display
  const getFilePath = () => {
    if (!selectedLevel || !selectedBook || !selectedChapter) {
      return 'Chưa chọn đầy đủ thông tin';
    }
    
    // Map bookId to folder name (some books have different folder structure)
    let bookFolder = selectedBook;
    if (selectedBook === 'skm-n1-bunpou') {
      bookFolder = 'shinkanzen-n1-bunpou';
    }
    
    return `src/data/level/${selectedLevel}/${bookFolder}/quizzes/${selectedChapter}.json`;
  };

  // Validate form
  const isValid = () => {
    if (!quizTitle.trim()) return false;
    if (!selectedLevel || !selectedBook || !selectedChapter) {
      return false; // ✅ NEW: Require location selection
    }
    return questions.every(q => 
      q.text.trim() && 
      q.options.every(opt => opt.text.trim()) &&
      q.explanation.trim()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          📝 Quiz Editor
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Tạo quiz mới và export ra JSON format. Dễ dàng thêm vào project!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Form Input - 2 columns */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* ✅ NEW: Location Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-4 sm:p-6 border-2 border-blue-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
              📍 Chọn vị trí lưu Quiz
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ (Level) *
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
                  required
                >
                  <option value="n1">N1</option>
                  <option value="n2">N2</option>
                  <option value="n3">N3</option>
                  <option value="n4">N4</option>
                  <option value="n5">N5</option>
                </select>
              </div>

              {/* Book Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sách (Book) *
                </label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  disabled={!selectedLevel || availableBooks.length === 0}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Chọn sách --</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chương (Chapter) *
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  disabled={!selectedBook || availableChapters.length === 0}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Chọn chương --</option>
                  {availableChapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title || chapter.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ NEW: Display file path */}
            {selectedLevel && selectedBook && selectedChapter && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
                <p className="text-xs text-gray-600 mb-1">📁 Đường dẫn file sẽ được lưu:</p>
                <p className="text-sm font-mono text-blue-700 break-all">
                  {getFilePath()}
                </p>
              </div>
            )}
          </div>

          {/* Quiz Title */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📚 Tên Quiz (Title) *
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Ví dụ: Bài 1: Phân biệt cấu trúc A và B"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            {selectedChapter && availableChapters.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Tên đã được tự động điền từ chương đã chọn. Bạn có thể chỉnh sửa.
              </p>
            )}
          </div>

          {/* Questions */}
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Câu hỏi {question.id}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500">
                    ({questions.length} câu hỏi)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={question.correct}
                    onChange={(e) => updateQuestion(qIndex, 'correct', e.target.value)}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  >
                    <option value="A">Đáp án đúng: A</option>
                    <option value="B">Đáp án đúng: B</option>
                    <option value="C">Đáp án đúng: C</option>
                    <option value="D">Đáp án đúng: D</option>
                  </select>
                  <button
                    onClick={() => duplicateQuestion(qIndex)}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm font-medium"
                    title="Duplicate câu hỏi này"
                  >
                    📋 <span className="hidden sm:inline">Copy</span>
                  </button>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium"
                    title="Xóa câu hỏi này"
                    disabled={questions.length <= 1}
                  >
                    🗑️ <span className="hidden sm:inline">Xóa</span>
                  </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Câu hỏi:
                  </label>
                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    placeholder="Nhập câu hỏi tiếng Nhật..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {option.label}:
                      </label>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateQuestion(qIndex, `option-${optIndex}`, e.target.value)}
                        placeholder={`Đáp án ${option.label}`}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          question.correct === option.label ? 'border-green-500 bg-green-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giải thích:
                  </label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    placeholder="Giải thích tại sao đáp án đúng..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}

          {/* Add Question Button */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-2 border-dashed border-gray-300">
            <button
              onClick={addQuestion}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-base sm:text-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl sm:text-2xl">➕</span>
              Thêm câu hỏi mới
            </button>
            <p className="text-center text-gray-500 text-xs sm:text-sm mt-2">
              Hiện tại có {questions.length} câu hỏi. Click để thêm câu hỏi mới.
            </p>
          </div>
          </div>

        {/* Sidebar - Preview & Export */}
        <div className="space-y-4 sm:space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  {showPreview ? '👁️ Ẩn Preview' : '👁️ Xem Preview'}
                </button>

                <button
                  onClick={handleExport}
                  disabled={!isValid()}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  📤 Export JSON
                </button>

                {exportedJSON && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                    >
                      📋 Copy JSON
                    </button>

                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                      💾 Download File
                    </button>
                  </>
                )}
              </div>

              {/* Validation Status */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className={`text-sm font-medium ${isValid() ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid() ? '✅ Form hợp lệ' : '⚠️ Vui lòng điền đầy đủ thông tin'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Số câu hỏi: <strong>{questions.length}</strong>
                </p>
                {/* ✅ NEW: Location validation */}
                {(!selectedLevel || !selectedBook || !selectedChapter) && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Vui lòng chọn đầy đủ: Level → Book → Chapter
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
                    <p className="font-semibold text-blue-800">{quizTitle || 'Untitled Quiz'}</p>
                  </div>
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-800 mb-2">
                        Câu {q.id}: {q.text || '(Chưa có câu hỏi)'}
                      </p>
                      <div className="space-y-1 text-sm">
                        {q.options.map((opt) => (
                          <p
                            key={opt.label}
                            className={q.correct === opt.label ? 'text-green-600 font-semibold' : 'text-gray-600'}
                          >
                            {opt.label}. {opt.text || '(Chưa có đáp án)'}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
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

        {/* Back to Dashboard */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                📝 Quiz Editor Module
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Tạo và quản lý quiz cho các bài học
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              ← Về Dashboard
            </button>
          </div>
        </div>

              {/* Instructions */}
              <div className="mt-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">📖 Hướng dẫn sử dụng</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li className="mb-2">
                    <strong>Chọn vị trí lưu Quiz:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                      <li>Chọn <strong>Cấp độ</strong> (N1, N2, N3, N4, N5)</li>
                      <li>Chọn <strong>Sách</strong> (từ danh sách sách của level đã chọn)</li>
                      <li>Chọn <strong>Chương</strong> (từ danh sách chương của sách đã chọn)</li>
                      <li>Tên quiz sẽ tự động điền từ tên chương (có thể chỉnh sửa)</li>
                    </ul>
                  </li>
                  <li className="mb-2">Thêm câu hỏi: Click nút "➕ Thêm câu hỏi mới" (không giới hạn số lượng)</li>
                  <li className="mb-2">Điền đầy đủ thông tin cho mỗi câu hỏi:
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                      <li>Câu hỏi (text)</li>
                      <li>4 đáp án (A, B, C, D)</li>
                      <li>Chọn đáp án đúng</li>
                      <li>Giải thích (khuyến khích)</li>
                    </ul>
                  </li>
                  <li className="mb-2">Có thể xóa câu hỏi bằng nút "🗑️ Xóa" hoặc copy bằng nút "📋 Copy"</li>
                  <li className="mb-2">Click "Export JSON" để tạo file JSON</li>
                  <li className="mb-2">Click "Copy JSON" hoặc "Download File" để lưu</li>
                  <li className="mb-2">
                    <strong>Lưu file:</strong> Copy file vào đúng đường dẫn hiển thị ở trên
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs mt-1 inline-block">
                      {selectedLevel && selectedBook && selectedChapter ? getFilePath() : 'src/data/level/[level]/[book]/quizzes/[chapter].json'}
                    </code>
                  </li>
                </ol>
              </div>
    </div>
  );
}

export default QuizEditorPage;

