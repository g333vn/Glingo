// src/components/admin/lessons/tabs/TheoryTabEnhanced.jsx
// 📖 Enhanced Theory Tab - File upload + HTML editor + Multi-format

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../../../contexts/LanguageContext.jsx';
import DisplayOrderConfig from '../DisplayOrderConfig.jsx';

/**
 * TheoryTabEnhanced Component
 * ✅ File upload từ thiết bị (drag & drop)
 * ✅ HTML Editor để tạo content trực tiếp
 * ✅ Multi-format: PDF, DOCX, Images, Audio, Video
 * 
 * @param {object} theoryData - Theory data from lesson
 * @param {function} onChange - Callback khi thay đổi
 */
function TheoryTabEnhanced({ theoryData, onChange }) {
  const { t } = useLanguage();
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'upload' | 'editor'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  /**
   * Handle field change
   */
  const handleChange = (field, value) => {
    onChange({
      ...theoryData,
      [field]: value
    });
  };
  
  /**
   * Handle file selection (from browse or drag & drop)
   */
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(`❌ ${t('contentManagement.lessonModal.theoryTab.fileTooLarge')}\n\n${t('contentManagement.lessonModal.theoryTab.fileSize')} ${(file.size / 1024 / 1024).toFixed(2)}MB\n${t('contentManagement.lessonModal.theoryTab.limit')} 50MB\n\n${t('contentManagement.lessonModal.theoryTab.pleaseChooseSmaller')}`);
      return;
    }
    
    // Validate file type
    const validTypes = {
      // Documents
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/msword': 'doc',
      'text/plain': 'txt',
      'text/html': 'html',
      'text/markdown': 'md',
      
      // Images
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      
      // Audio
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a',
      
      // Video
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogv'
    };
    
    if (!validTypes[file.type]) {
      alert(`❌ ${t('contentManagement.lessonModal.theoryTab.formatNotSupported')}\n\n${t('contentManagement.lessonModal.theoryTab.fileType')} ${file.type}\n\n${t('contentManagement.lessonModal.theoryTab.supportedFormatsList')}:\n- Documents: PDF, DOCX, DOC, TXT, HTML, MD\n- Images: JPG, PNG, GIF, WEBP\n- Audio: MP3, WAV, OGG, M4A\n- Video: MP4, WEBM, OGV`);
      return;
    }
    
    const fileExt = validTypes[file.type];
    const fileName = file.name;
    
    // Simulate upload (Phase 1: store in-memory Data URL)
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Convert file to base64 or blob URL for preview
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      reader.onload = async (e) => {
        const result = e.target.result;
        const updatedTheory = { ...theoryData };
        
        // Update lesson data trực tiếp bằng Data URL / text content
        if (fileExt === 'pdf' || file.type === 'application/pdf') {
          updatedTheory.pdfUrl = result;
          updatedTheory.type = 'pdf';
          } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt)) {
          updatedTheory.audioUrl = result;
          } else if (['mp4', 'webm', 'ogv'].includes(fileExt)) {
          updatedTheory.videoUrl = result;
          } else if (['jpg', 'png', 'gif', 'webp'].includes(fileExt)) {
          // Image - chèn trực tiếp vào HTML
          const imgHtml = `<img src="${result}" alt="${fileName}" style="max-width: 100%; height: auto;" />`;
          updatedTheory.htmlContent = (theoryData.htmlContent || '') + '\n' + imgHtml;
          updatedTheory.type = 'html';
        } else if (['txt', 'html', 'md'].includes(fileExt) || file.type.startsWith('text/')) {
          updatedTheory.htmlContent = result;
          updatedTheory.type = 'html';
        } else {
          // Các định dạng khác (doc, docx...) tạm thời chỉ lưu Data URL để download
          updatedTheory.pdfUrl = result;
          updatedTheory.type = 'pdf';
        }
        
        onChange(updatedTheory);
          
          setUploadProgress(100);
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          alert(`✅ ${t('contentManagement.lessonModal.theoryTab.uploadSuccess')}\n\n${t('contentManagement.lessonModal.theoryTab.file')} ${fileName}\n${t('contentManagement.lessonModal.theoryTab.size')} ${(file.size / 1024).toFixed(2)}KB\n\n${t('contentManagement.lessonModal.theoryTab.fileEmbedded')}`);
        }, 400);
      };
      
      reader.onerror = () => {
        alert(`❌ ${t('contentManagement.lessonModal.theoryTab.errorReadingFile')}`);
        setIsUploading(false);
      };
      
      // Read file based on type
      if (file.type.startsWith('text/') || fileExt === 'html' || fileExt === 'md') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`❌ ${t('contentManagement.lessonModal.theoryTab.errorUploading')}`);
      setIsUploading(false);
    }
  };
  
  /**
   * Handle drag events
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };
  
  /**
   * Handle browse button click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  /**
   * Handle file input change
   */
  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };
  
  return (
    <div className="space-y-6">
      {/* ========== CONTENT STATUS ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { key: 'videoUrl', label: 'Video', icon: '🎬', descKey: 'video' },
          { key: 'pdfUrl', label: 'PDF', icon: '📄', descKey: 'pdf' },
          { key: 'htmlContent', label: 'HTML', icon: '📝', descKey: 'html' },
          { key: 'audioUrl', label: 'Audio', icon: '🎧', descKey: 'audio' }
        ].map((item) => {
          const available = !!theoryData[item.key];
          return (
            <div
              key={item.key}
              className={`p-3 rounded-lg border-[3px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                available ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-black text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-600">
                    {available ? `✅ ${t('contentManagement.lessonModal.theoryTab.contentStatus.has')}` : `⚠️ ${t('contentManagement.lessonModal.theoryTab.contentStatus.notHas')}`}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{t(`contentManagement.lessonModal.theoryTab.contentStatus.${item.descKey}`)}</p>
            </div>
          );
        })}
      </div>
      
      {/* ========== MODE SELECTOR ========== */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 px-4 py-3 font-black text-sm rounded-lg border-[3px] border-black transition-all duration-200 ${
            uploadMode === 'url'
              ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          🔗 {t('contentManagement.lessonModal.theoryTab.enterUrl')}
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex-1 px-4 py-3 font-black text-sm rounded-lg border-[3px] border-black transition-all duration-200 ${
            uploadMode === 'upload'
              ? 'bg-purple-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          {t('contentManagement.lessonModal.theoryTab.uploadFile')}
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('editor')}
          className={`flex-1 px-4 py-3 font-black text-sm rounded-lg border-[3px] border-black transition-all duration-200 ${
            uploadMode === 'editor'
              ? 'bg-green-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          {t('contentManagement.lessonModal.theoryTab.editDirectly')}
        </button>
      </div>
      
      {/* ========== MODE: URL INPUT ========== */}
      {uploadMode === 'url' && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span>🔗</span>
            {t('contentManagement.lessonModal.theoryTab.enterFilePath')}
          </h3>
          
          {/* PDF URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t('contentManagement.lessonModal.theoryTab.pdfUrl')}
            </label>
            <input
              type="text"
              value={theoryData.pdfUrl || ''}
              onChange={(e) => handleChange('pdfUrl', e.target.value)}
              className="w-full px-4 py-3 border-[3px] border-black rounded-lg font-mono text-sm
                       shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       focus:outline-none focus:ring-4 focus:ring-blue-300"
              placeholder="/pdfs/n1/shinkanzen/lesson1-grammar.pdf"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('contentManagement.lessonModal.theoryTab.uploadHint', { path: 'public/pdfs/' })}
            </p>
          </div>
          
          {/* Audio URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🎧 {t('contentManagement.lessonModal.theoryTab.audioUrl')}
            </label>
            <input
              type="text"
              value={theoryData.audioUrl || ''}
              onChange={(e) => handleChange('audioUrl', e.target.value)}
              className="w-full px-4 py-3 border-[3px] border-gray-300 rounded-lg font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="/audio/lesson-1-pronunciation.mp3"
            />
          </div>
          
          {/* Video URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🎬 {t('contentManagement.lessonModal.theoryTab.videoUrl')}
            </label>
            <input
              type="text"
              value={theoryData.videoUrl || ''}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              className="w-full px-4 py-3 border-[3px] border-gray-300 rounded-lg font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="/videos/lesson-1-explanation.mp4"
            />
          </div>
          
          {/* Preview */}
          {(theoryData.pdfUrl || theoryData.audioUrl || theoryData.videoUrl) && (
            <div className="p-4 bg-blue-50 border-[3px] border-blue-300 rounded-lg">
              <p className="text-sm font-bold text-blue-900 mb-3">👁️ {t('contentManagement.lessonModal.theoryTab.preview')}</p>
              
              {theoryData.pdfUrl && (
                <a 
                  href={theoryData.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 mb-2 bg-blue-500 text-white rounded-lg
                           border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           font-bold text-sm transition-all"
                >
                  📄 {t('contentManagement.lessonModal.theoryTab.viewPdf')}
                </a>
              )}
              
              {theoryData.audioUrl && (
                <div className="mt-2">
                  <audio controls className="w-full">
                    <source src={theoryData.audioUrl} />
                    {t('contentManagement.lessonModal.theoryTab.browserNotSupportAudio')}
                  </audio>
                </div>
              )}
              
              {theoryData.videoUrl && (
                <div className="mt-2">
                  <video controls className="w-full rounded border-2 border-gray-300">
                    <source src={theoryData.videoUrl} />
                    {t('contentManagement.lessonModal.theoryTab.browserNotSupportVideo')}
                  </video>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ========== MODE: FILE UPLOAD ========== */}
      {uploadMode === 'upload' && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span>📤</span>
            {t('contentManagement.lessonModal.theoryTab.uploadFromDevice')}
          </h3>
          
          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative p-8 border-[4px] border-dashed rounded-lg
              transition-all duration-200 cursor-pointer
              ${isDragging 
                ? 'border-purple-500 bg-purple-50 scale-[1.02]' 
                : 'border-gray-400 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'
              }
              ${isUploading ? 'pointer-events-none opacity-60' : ''}
            `}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.txt,.html,.md,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.m4a,.mp4,.webm,.ogv"
              className="hidden"
            />
            
            {!isUploading ? (
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg font-black text-gray-800 mb-2">
                  {isDragging ? `📥 ${t('contentManagement.lessonModal.theoryTab.dropFileHere')}` : `📤 ${t('contentManagement.lessonModal.theoryTab.dragDropOrClick')}`}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {t('contentManagement.lessonModal.theoryTab.supportedFormats')}
                </p>
                
                {/* Format Grid */}
                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                  <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                    📄 PDF, DOCX, DOC
                  </div>
                  <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                    🖼️ JPG, PNG, GIF
                  </div>
                  <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                    🎧 MP3, WAV, OGG
                  </div>
                  <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                    🎬 MP4, WEBM
                  </div>
                  <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                    📝 TXT, HTML, MD
                  </div>
                  <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                    📦 Max 50MB
                  </div>
                </div>
              </div>
            ) : (
              // Upload Progress
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">⏳</div>
                <p className="text-lg font-black text-gray-800 mb-4">{t('contentManagement.lessonModal.theoryTab.uploading')}</p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-6 border-[3px] border-black overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white font-black text-xs transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{uploadProgress}% - {t('contentManagement.lessonModal.theoryTab.processingFile')}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Info Box */}
          <div className="p-4 bg-yellow-50 border-[3px] border-yellow-300 rounded-lg">
            <p className="text-sm font-bold text-yellow-900 mb-2">{t('contentManagement.lessonModal.theoryTab.uploadNote')}</p>
            <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
              <li><strong>PDF/Documents:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.pdfDocuments')}</li>
              <li><strong>Audio/Video:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.audioVideo')}</li>
              <li><strong>Images:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.images')}</li>
              <li><strong>Text files:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.textFiles')}</li>
              <li><strong>Max 50MB:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.maxSize')}</li>
              <li><strong>Phase 1:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.phase1')}</li>
              <li><strong>Phase 2:</strong> {t('contentManagement.lessonModal.theoryTab.uploadInfo.phase2')}</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* ========== MODE: HTML EDITOR ========== */}
      {uploadMode === 'editor' && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span>✍️</span>
            {t('contentManagement.lessonModal.theoryTab.editContentDirectly')}
          </h3>
          
          {/* HTML Editor with Toolbar */}
          <div className="border-[3px] border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Toolbar */}
            <div className="bg-gray-100 border-b-[3px] border-black p-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('htmlEditor');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = theoryData.htmlContent || '';
                  const newText = text.substring(0, start) + '<h2>Tiêu đề</h2>' + text.substring(end);
                  handleChange('htmlContent', newText);
                }}
                className="px-3 py-1 bg-white border-2 border-black rounded font-bold text-xs hover:bg-yellow-100"
                title={t('contentManagement.lessonModal.theoryTab.insertHeading')}
              >
                📝 H2
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('htmlEditor');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = theoryData.htmlContent || '';
                  const newText = text.substring(0, start) + '<p>Đoạn văn</p>' + text.substring(end);
                  handleChange('htmlContent', newText);
                }}
                className="px-3 py-1 bg-white border-2 border-black rounded font-bold text-xs hover:bg-yellow-100"
                title={t('contentManagement.lessonModal.theoryTab.insertParagraph')}
              >
                📄 P
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('htmlEditor');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = theoryData.htmlContent || '';
                  const newText = text.substring(0, start) + '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' + text.substring(end);
                  handleChange('htmlContent', newText);
                }}
                className="px-3 py-1 bg-white border-2 border-black rounded font-bold text-xs hover:bg-yellow-100"
                title={t('contentManagement.lessonModal.theoryTab.insertList')}
              >
                📋 UL
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('htmlEditor');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = theoryData.htmlContent || '';
                  const selected = text.substring(start, end);
                  const newText = text.substring(0, start) + `<strong>${selected || 'Chữ đậm'}</strong>` + text.substring(end);
                  handleChange('htmlContent', newText);
                }}
                className="px-3 py-1 bg-white border-2 border-black rounded font-bold text-xs hover:bg-yellow-100"
                title={t('contentManagement.lessonModal.theoryTab.bold')}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('htmlEditor');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = theoryData.htmlContent || '';
                  const selected = text.substring(start, end);
                  const newText = text.substring(0, start) + `<code>${selected || 'code'}</code>` + text.substring(end);
                  handleChange('htmlContent', newText);
                }}
                className="px-3 py-1 bg-white border-2 border-black rounded font-bold text-xs hover:bg-yellow-100 font-mono"
                title={t('contentManagement.lessonModal.theoryTab.code')}
              >
                &lt;/&gt;
              </button>
            </div>
            
            {/* Editor Textarea */}
            <textarea
              id="htmlEditor"
              value={theoryData.htmlContent || ''}
              onChange={(e) => handleChange('htmlContent', e.target.value)}
              className="w-full px-4 py-3 font-mono text-sm border-none focus:outline-none resize-none"
              rows="16"
              placeholder={`${t('contentManagement.lessonModal.theoryTab.htmlPlaceholder')}

${t('contentManagement.lessonModal.theoryTab.htmlExample')}:
<h2>${t('contentManagement.lessonModal.theoryTab.htmlExampleGrammar')}</h2>
<p>${t('contentManagement.lessonModal.theoryTab.htmlExampleText')}</p>

<h3>${t('contentManagement.lessonModal.theoryTab.htmlExampleTitle')}:</h3>
<ul>
  <li><strong>私は学生です</strong> - Tôi là sinh viên</li>
  <li><strong>今日はいい天気です</strong> - Hôm nay thời tiết đẹp</li>
</ul>

<p>💡 <em>${t('contentManagement.lessonModal.theoryTab.htmlExampleNote')}:</em> ${t('contentManagement.lessonModal.theoryTab.htmlExampleNoteText')}</p>`}
            />
          </div>
          
          {/* Live Preview */}
          {theoryData.htmlContent && (
            <div className="p-4 bg-green-50 border-[3px] border-green-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-green-900">👁️ {t('contentManagement.lessonModal.theoryTab.livePreview')}</p>
                <button
                  type="button"
                  onClick={() => handleChange('htmlContent', '')}
                  className="px-3 py-1 bg-red-500 text-white rounded border-2 border-black font-bold text-xs
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  🗑️ {t('contentManagement.lessonModal.theoryTab.delete')}
                </button>
              </div>
              <div 
                className="p-4 bg-white border-2 border-gray-300 rounded prose prose-sm max-w-none min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: theoryData.htmlContent }}
              />
            </div>
          )}
          
          {/* Helper Guide */}
          <div className="p-4 bg-blue-50 border-[3px] border-blue-300 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-2">📖 {t('contentManagement.lessonModal.theoryTab.htmlGuide')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div>
                <code className="bg-white px-2 py-1 rounded">&lt;h2&gt;Tiêu đề&lt;/h2&gt;</code>
                <p className="mt-1">→ {t('contentManagement.lessonModal.theoryTab.headingLevel2')}</p>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">&lt;p&gt;Đoạn văn&lt;/p&gt;</code>
                <p className="mt-1">→ {t('contentManagement.lessonModal.theoryTab.paragraph')}</p>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">&lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</code>
                <p className="mt-1">→ {t('contentManagement.lessonModal.theoryTab.bulletList')}</p>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">&lt;strong&gt;Đậm&lt;/strong&gt;</code>
                <p className="mt-1">→ {t('contentManagement.lessonModal.theoryTab.boldText')}</p>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">&lt;em&gt;Nghiêng&lt;/em&gt;</code>
                <p className="mt-1">→ {t('contentManagement.lessonModal.theoryTab.italicText')}</p>
              </div>
              <div>
                <code className="bg-white px-2 py-1 rounded">&lt;code&gt;Mã&lt;/code&gt;</code>
                <p className="mt-1">→ {t('contentManagement.lessonModal.theoryTab.codeInline')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ========== COMMON: Download Permission ========== */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
        <input
          type="checkbox"
          id="allowDownload"
          checked={theoryData.allowDownload !== false}
          onChange={(e) => handleChange('allowDownload', e.target.checked)}
          className="w-5 h-5 rounded border-2 border-black cursor-pointer"
        />
        <label htmlFor="allowDownload" className="text-sm font-semibold text-gray-700 cursor-pointer">
          ✅ {t('contentManagement.lessonModal.theoryTab.allowDownload')}
        </label>
      </div>
      
      {/* ========== SECTION: Display Order Configuration ========== */}
      <div className="border-t-[3px] border-gray-300 pt-6">
        <DisplayOrderConfig
          order={theoryData.displayOrder || ['video', 'pdf', 'html', 'audio']}
          availableContent={{
            video: !!theoryData.videoUrl,
            pdf: !!theoryData.pdfUrl,
            html: !!theoryData.htmlContent,
            audio: !!theoryData.audioUrl
          }}
          onChange={(newOrder) => handleChange('displayOrder', newOrder)}
        />
      </div>
    </div>
  );
}

export default TheoryTabEnhanced;

