// src/components/admin/lessons/tabs/TheoryTab.jsx
// 📖 Theory Tab - Quản lý nội dung lý thuyết (PDF/HTML/Audio)

import React, { useState } from 'react';
import TheoryFileUpload from '../TheoryFileUpload.jsx';

/**
 * TheoryTab Component
 * Phase 1: Basic - PDF URL + HTML textarea (giữ nguyên code cũ)
 * Phase 2: File upload + Preview
 * 
 * @param {object} theoryData - Theory data from lesson
 * @param {function} onChange - Callback khi thay đổi
 */
function TheoryTab({ theoryData, onChange }) {
  const [activeInput, setActiveInput] = useState(
    theoryData.pdfUrl ? 'pdf' : 'html'
  );
  
  /**
   * Handle field change
   */
  const handleChange = (field, value) => {
    onChange({
      ...theoryData,
      [field]: value
    });
  };
  
  return (
    <div className="space-y-6">
      {/* ========== SECTION: Input Type Toggle ========== */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setActiveInput('pdf')}
          className={`
            flex-1 px-4 py-3 font-black text-sm rounded-lg
            border-[3px] border-black
            transition-all duration-200
            ${activeInput === 'pdf'
              ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }
          `}
        >
          📄 PDF Document
        </button>
        <button
          type="button"
          onClick={() => setActiveInput('html')}
          className={`
            flex-1 px-4 py-3 font-black text-sm rounded-lg
            border-[3px] border-black
            transition-all duration-200
            ${activeInput === 'html'
              ? 'bg-green-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }
          `}
        >
          📝 HTML Content
        </button>
      </div>
      
      {/* ========== SECTION: PDF Input ========== */}
      {activeInput === 'pdf' && (
        <div className="space-y-4">
          {/* Phase 2: File Upload Component */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📤 Upload PDF Lý thuyết
            </label>
            <TheoryFileUpload
              fileType="pdf"
              currentUrl={theoryData.pdfUrl}
              onUploadComplete={(url) => handleChange('pdfUrl', url)}
              onDelete={() => handleChange('pdfUrl', '')}
              maxSizeMB={10}
            />
          </div>
          
          {/* Legacy: Manual URL Input (fallback) */}
          <div className="pt-4 border-t-2 border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📎 Hoặc nhập URL PDF thủ công
            </label>
            <input
              type="text"
              value={theoryData.pdfUrl || ''}
              onChange={(e) => handleChange('pdfUrl', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="/pdfs/n1/shinkanzen/lesson1-grammar.pdf"
            />
            <p className="text-xs text-gray-500 mt-2">
              Nếu PDF đã có sẵn trên server, nhập đường dẫn tại đây
            </p>
          </div>
          
          {/* PDF Preview Link */}
          {theoryData.pdfUrl && (
            <div className="p-4 bg-blue-50 border-[3px] border-blue-300 rounded-lg">
              <p className="text-sm font-bold text-blue-900 mb-2">📄 Preview PDF:</p>
              <a 
                href={theoryData.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                         border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                         hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         font-bold text-sm transition-all"
              >
                🔗 Xem trước PDF
              </a>
            </div>
          )}
          
          {/* Download Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
            <input
              type="checkbox"
              id="allowDownload"
              checked={theoryData.allowDownload !== false}
              onChange={(e) => handleChange('allowDownload', e.target.checked)}
              className="w-5 h-5 rounded border-2 border-black cursor-pointer"
            />
            <label htmlFor="allowDownload" className="text-sm font-semibold text-gray-700 cursor-pointer">
              ✅ Cho phép học viên download PDF
            </label>
          </div>
          
          {/* Info Box */}
          <div className="p-4 bg-yellow-50 border-[3px] border-yellow-300 rounded-lg">
            <p className="text-sm font-bold text-yellow-900 mb-2">💡 Lưu ý:</p>
            <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
              <li>PDF phù hợp cho nội dung dài, có nhiều hình ảnh</li>
              <li>Học viên có thể zoom, scroll mượt mà</li>
              <li>Nếu tắt download, học viên chỉ xem online</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* ========== SECTION: HTML Input ========== */}
      {activeInput === 'html' && (
        <div className="space-y-4">
          {/* HTML Textarea */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📝 Nội dung HTML
            </label>
            <textarea
              value={theoryData.htmlContent || ''}
              onChange={(e) => handleChange('htmlContent', e.target.value)}
              className="w-full px-4 py-3 border-[3px] border-black rounded-lg font-mono text-sm
                       shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       focus:outline-none focus:ring-4 focus:ring-green-300"
              rows="12"
              placeholder={`<div>
  <h2>Ngữ pháp: Trợ từ は</h2>
  <p>Trợ từ は được dùng để...</p>
  <ul>
    <li>Ví dụ 1: 私は学生です</li>
    <li>Ví dụ 2: 今日はいい天気です</li>
  </ul>
</div>`}
            />
            <p className="text-xs text-gray-500 mt-2">
              Hỗ trợ HTML tags: <code>&lt;h1&gt; &lt;h2&gt; &lt;p&gt; &lt;ul&gt; &lt;li&gt; &lt;strong&gt; &lt;em&gt; &lt;code&gt;</code>
            </p>
          </div>
          
          {/* HTML Preview */}
          {theoryData.htmlContent && (
            <div className="p-4 bg-green-50 border-[3px] border-green-300 rounded-lg">
              <p className="text-sm font-bold text-green-900 mb-3">👁️ Preview HTML:</p>
              <div 
                className="p-4 bg-white border-2 border-gray-300 rounded prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: theoryData.htmlContent }}
              />
            </div>
          )}
          
          {/* Info Box */}
          <div className="p-4 bg-yellow-50 border-[3px] border-yellow-300 rounded-lg">
            <p className="text-sm font-bold text-yellow-900 mb-2">💡 Lưu ý:</p>
            <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
              <li>HTML phù hợp cho nội dung ngắn, có nhiều tương tác</li>
              <li>Có thể embed video, audio, interactive elements</li>
              <li>Dùng thẻ semantic để dễ đọc: h2, p, ul, strong...</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* ========== SECTION: Audio (Optional) ========== */}
      <div className="border-t-[3px] border-gray-300 pt-6 space-y-4">
        <h3 className="text-lg font-black text-gray-800">🎧 Audio (Tùy chọn)</h3>
        
        {/* Phase 2: Audio Upload */}
        <TheoryFileUpload
          fileType="audio"
          currentUrl={theoryData.audioUrl}
          onUploadComplete={(url) => handleChange('audioUrl', url)}
          onDelete={() => handleChange('audioUrl', '')}
          maxSizeMB={5}
        />
        
        {/* Legacy: Manual URL Input */}
        <div className="pt-4 border-t-2 border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            📎 Hoặc nhập URL Audio thủ công
          </label>
          <input
            type="text"
            value={theoryData.audioUrl || ''}
            onChange={(e) => handleChange('audioUrl', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="/audio/lesson-1-pronunciation.mp3"
          />
          <p className="text-xs text-gray-500 mt-2">
            Audio phát âm, hướng dẫn đọc (nếu có)
          </p>
        </div>
      </div>
      
      {/* ========== Priority Notice ========== */}
      <div className="p-4 bg-blue-100 border-[3px] border-blue-400 rounded-lg">
        <p className="text-sm font-bold text-blue-900">
          ⚠️ Thứ tự ưu tiên hiển thị:
        </p>
        <p className="text-xs text-blue-800 mt-1">
          1️⃣ PDF (nếu có URL) → 2️⃣ HTML Content (nếu không có PDF) → 3️⃣ Audio (luôn hiện nếu có)
        </p>
      </div>
    </div>
  );
}

export default TheoryTab;

