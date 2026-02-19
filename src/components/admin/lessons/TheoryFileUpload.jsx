// src/components/admin/lessons/TheoryFileUpload.jsx
// File Upload Component - Drag & drop với preview

import React, { useState, useCallback, useRef } from 'react';

/**
 * TheoryFileUpload Component
 * Phase 2: File upload với drag & drop, progress bar, preview
 * 
 * @param {string} fileType - Type of file to upload ('pdf' | 'audio' | 'image')
 * @param {string} currentUrl - Current file URL (if any)
 * @param {function} onUploadComplete - Callback khi upload xong (url)
 * @param {function} onDelete - Callback khi xóa file
 * @param {number} maxSizeMB - Max file size in MB (default 10)
 */
function TheoryFileUpload({ 
  fileType = 'pdf', 
  currentUrl = '', 
  onUploadComplete,
  onDelete,
  maxSizeMB = 10 
}) {
  // ========== STATE ==========
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  // ========== CONFIG ==========
  const config = {
    pdf: {
      accept: '.pdf',
      icon: '📄',
      label: 'PDF',
      mimeTypes: ['application/pdf']
    },
    audio: {
      accept: '.mp3,.wav,.m4a',
      icon: '🎧',
      label: 'Audio',
      mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4']
    },
    image: {
      accept: '.jpg,.jpeg,.png,.webp',
      icon: '🖼️',
      label: 'Image',
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    }
  };

  const currentConfig = config[fileType];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // ========== VALIDATION ==========
  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File quá lớn! Tối đa ${maxSizeMB}MB (file này: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!currentConfig.accept.includes(fileExtension)) {
      return `File không đúng định dạng! Chỉ chấp nhận: ${currentConfig.accept}`;
    }

    return null;
  };

  // ========== UPLOAD SIMULATION ==========
  /**
   * Simulate file upload with progress
   * In production: Replace with actual API call (AWS S3, Firebase Storage, etc.)
   */
  const simulateUpload = (file) => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError('');

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Create local URL for preview
          const url = URL.createObjectURL(file);
          
          // In production: Replace with actual uploaded URL
          // const url = response.data.url; // from S3, Firebase, etc.
          
          setPreviewUrl(url);
          setIsUploading(false);
          setUploadProgress(100);
          
          // Generate pseudo URL for saving
          const pseudoUrl = `/uploads/${fileType}s/${Date.now()}-${file.name}`;
          
          resolve({
            url: pseudoUrl,
            localUrl: url, // For preview
            fileName: file.name,
            fileSize: file.size
          });
        }
        setUploadProgress(Math.min(progress, 100));
      }, 200);

      // Simulate error (optional)
      // setTimeout(() => {
      //   clearInterval(interval);
      //   reject(new Error('Upload failed'));
      // }, 5000);
    });
  };

  // ========== HANDLERS ==========
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Upload file
      const result = await simulateUpload(file);
      
      // Callback
      if (onUploadComplete) {
        onUploadComplete(result.url, result);
      }
      
      console.log('✅ Upload complete:', result);
    } catch (err) {
      setError(err.message || 'Upload failed!');
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDeleteFile = () => {
    setPreviewUrl('');
    setUploadProgress(0);
    setError('');
    if (onDelete) {
      onDelete();
    }
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
      {/* ========== Upload Area ========== */}
      {!previewUrl && !isUploading && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          className={`
            relative p-8 border-[3px] border-dashed rounded-lg
            transition-all duration-200 cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-400 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          {/* Icon */}
          <div className="text-center">
            <div className="text-6xl mb-4">{currentConfig.icon}</div>
            <p className="text-lg font-black text-gray-700 mb-2">
              {isDragging ? '⬇️ Thả file vào đây' : `📤 Upload ${currentConfig.label}`}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Kéo & thả hoặc <span className="text-blue-600 font-bold">click để chọn file</span>
            </p>
            
            {/* File info */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-xs text-gray-600">
              <span>📋 Định dạng: <strong>{currentConfig.accept}</strong></span>
              <span>•</span>
              <span>📦 Tối đa: <strong>{maxSizeMB}MB</strong></span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={currentConfig.accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* ========== Uploading State ========== */}
      {isUploading && (
        <div className="p-6 bg-blue-50 border-[3px] border-blue-400 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-bounce">{currentConfig.icon}</div>
              <div>
                <p className="font-black text-blue-900">Đang upload...</p>
                <p className="text-xs text-blue-700">{uploadProgress.toFixed(0)}% hoàn thành</p>
              </div>
            </div>
            <button
              onClick={handleCancelUpload}
              className="px-3 py-1 text-sm font-bold text-red-600 hover:text-red-800 
                       border-2 border-red-400 rounded hover:bg-red-50 transition-colors"
            >
              ❌ Hủy
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-6 bg-white border-2 border-blue-300 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out
                       flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress > 10 && `${uploadProgress.toFixed(0)}%`}
            </div>
          </div>
        </div>
      )}

      {/* ========== Preview (PDF) ========== */}
      {previewUrl && fileType === 'pdf' && (
        <div className="p-4 bg-green-50 border-[3px] border-green-400 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-green-900 flex items-center gap-2">
              <span>✅</span>
              <span>PDF đã upload thành công!</span>
            </p>
            <div className="flex gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm font-bold text-blue-700 bg-white
                         border-2 border-blue-400 rounded hover:bg-blue-50 transition-colors"
              >
                👁️ Xem
              </a>
              <button
                onClick={handleDeleteFile}
                className="px-3 py-1 text-sm font-bold text-red-700 bg-white
                         border-2 border-red-400 rounded hover:bg-red-50 transition-colors"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
          
          {/* PDF preview frame */}
          <div className="bg-white border-2 border-gray-300 rounded overflow-hidden">
            <iframe
              src={previewUrl}
              className="w-full h-96"
              title="PDF Preview"
            />
          </div>
        </div>
      )}

      {/* ========== Preview (Audio) ========== */}
      {previewUrl && fileType === 'audio' && (
        <div className="p-4 bg-green-50 border-[3px] border-green-400 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-green-900 flex items-center gap-2">
              <span>✅</span>
              <span>Audio đã upload thành công!</span>
            </p>
            <button
              onClick={handleDeleteFile}
              className="px-3 py-1 text-sm font-bold text-red-700 bg-white
                       border-2 border-red-400 rounded hover:bg-red-50 transition-colors"
            >
              🗑️ Xóa
            </button>
          </div>
          
          {/* Audio player */}
          <div className="bg-white border-2 border-gray-300 rounded p-4">
            <audio
              src={previewUrl}
              controls
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* ========== Preview (Image) ========== */}
      {previewUrl && fileType === 'image' && (
        <div className="p-4 bg-green-50 border-[3px] border-green-400 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-green-900 flex items-center gap-2">
              <span>✅</span>
              <span>Image đã upload thành công!</span>
            </p>
            <button
              onClick={handleDeleteFile}
              className="px-3 py-1 text-sm font-bold text-red-700 bg-white
                       border-2 border-red-400 rounded hover:bg-red-50 transition-colors"
            >
              🗑️ Xóa
            </button>
          </div>
          
          {/* Image preview */}
          <div className="bg-white border-2 border-gray-300 rounded overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-96 object-contain"
            />
          </div>
        </div>
      )}

      {/* ========== Error Message ========== */}
      {error && (
        <div className="p-4 bg-red-50 border-[3px] border-red-400 rounded-lg">
          <p className="text-sm font-bold text-red-900 flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* ========== Info Box ========== */}
      <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <p className="text-xs font-bold text-blue-900 mb-2">💡 Lưu ý:</p>
        <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
          <li>File sẽ được lưu local trong browser (IndexedDB)</li>
          <li>Phase 2.5 sẽ hỗ trợ cloud storage (AWS S3, Firebase)</li>
          <li>Đảm bảo file không chứa thông tin nhạy cảm</li>
        </ul>
      </div>
    </div>
  );
}

export default TheoryFileUpload;

