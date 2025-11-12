// src/pages/QuizEditorPage.jsx
// Tool nhập liệu quiz - Dễ dàng tạo quiz mới và export ra JSON
// ⚠️ PROTECTED: Chỉ admin mới có thể truy cập (bảo vệ bằng ProtectedRoute)

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function QuizEditorPage() {
  const { user, logout } = useAuth();
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
    a.download = `bai-${questions[0]?.id || 'X'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Validate form
  const isValid = () => {
    if (!quizTitle.trim()) return false;
    return questions.every(q => 
      q.text.trim() && 
      q.options.every(opt => opt.text.trim()) &&
      q.explanation.trim()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📝 Quiz Editor - Tool Nhập Liệu
          </h1>
          <p className="text-gray-600">
            Tạo quiz mới và export ra JSON format. Dễ dàng thêm vào project!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Title */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Tên Quiz (Title)
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Ví dụ: Bài 1: Phân biệt cấu trúc A và B"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Questions */}
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Câu hỏi {question.id}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({questions.length} câu hỏi)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={question.correct}
                      onChange={(e) => updateQuestion(qIndex, 'correct', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">Đáp án đúng: A</option>
                      <option value="B">Đáp án đúng: B</option>
                      <option value="C">Đáp án đúng: C</option>
                      <option value="D">Đáp án đúng: D</option>
                    </select>
                    <button
                      onClick={() => duplicateQuestion(qIndex)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      title="Duplicate câu hỏi này"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      title="Xóa câu hỏi này"
                      disabled={questions.length <= 1}
                    >
                      🗑️ Xóa
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
                <div className="grid grid-cols-2 gap-3 mb-4">
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
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300">
              <button
                onClick={addQuestion}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-lg flex items-center justify-center gap-2"
              >
                <span className="text-2xl">➕</span>
                Thêm câu hỏi mới
              </button>
              <p className="text-center text-gray-500 text-sm mt-2">
                Hiện tại có {questions.length} câu hỏi. Click để thêm câu hỏi mới.
              </p>
            </div>
          </div>

          {/* Sidebar - Preview & Export */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
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

        {/* User Info & Logout */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                👤 Đang đăng nhập: <strong>{user?.name || user?.username}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Role: <strong>{user?.role}</strong> | Email: {user?.email}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Hướng dẫn sử dụng</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Điền tên quiz</li>
            <li>Thêm câu hỏi: Click nút "➕ Thêm câu hỏi mới" để thêm câu hỏi (không giới hạn số lượng)</li>
            <li>Điền đầy đủ thông tin cho mỗi câu hỏi:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Câu hỏi (text)</li>
                <li>4 đáp án (A, B, C, D)</li>
                <li>Chọn đáp án đúng</li>
                <li>Giải thích (khuyến khích)</li>
              </ul>
            </li>
            <li>Có thể xóa câu hỏi bằng nút "🗑️ Xóa" hoặc copy câu hỏi bằng nút "📋 Copy"</li>
            <li>Click "Export JSON" để tạo file JSON</li>
            <li>Click "Copy JSON" để copy vào clipboard hoặc "Download File" để tải về</li>
            <li>Đặt tên file: <code className="bg-gray-100 px-2 py-1 rounded">bai-X.json</code> (X là số bài)</li>
            <li>Copy file vào: <code className="bg-gray-100 px-2 py-1 rounded">src/data/level/n1/shinkanzen-n1-bunpou/quizzes/</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default QuizEditorPage;

