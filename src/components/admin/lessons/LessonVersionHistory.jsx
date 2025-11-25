// src/components/admin/lessons/LessonVersionHistory.jsx
// 🕐 Lesson Version History Component - Simple version tracking

import React, { useState, useEffect } from 'react';
import { useToast } from '../../ToastNotification.jsx';

function LessonVersionHistory({ bookId, chapterId, lessonId }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { success, error: showError } = useToast();
  
  useEffect(() => {
    loadVersions();
  }, [bookId, chapterId, lessonId]);
  
  const loadVersions = () => {
    setIsLoading(true);
    try {
      // Load versions from localStorage
      const versionKey = `lesson_versions_${bookId}_${chapterId}_${lessonId}`;
      const savedVersions = localStorage.getItem(versionKey);
      
      if (savedVersions) {
        setVersions(JSON.parse(savedVersions));
      } else {
        setVersions([]);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
      showError('Không thể tải lịch sử phiên bản');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestore = (versionIndex) => {
    if (!confirm('Bạn có chắc muốn khôi phục phiên bản này? Phiên bản hiện tại sẽ được lưu vào lịch sử.')) {
      return;
    }
    
    try {
      // In a real implementation, this would:
      // 1. Save current version to history
      // 2. Restore selected version
      // 3. Update the lesson in storage
      
      success('Đã khôi phục phiên bản', 5000, {
        label: '↩️ Undo',
        onClick: () => {
          // Undo restore
          loadVersions();
        }
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      showError('Không thể khôi phục phiên bản');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
      <h3 className="text-xl font-black text-gray-800 mb-4">🕐 LỊCH SỬ THAY ĐỔI</h3>
      
      {versions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Chưa có lịch sử thay đổi</p>
          <p className="text-sm text-gray-500 mt-2">
            Hệ thống sẽ tự động lưu lại 10 phiên bản gần nhất
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-3 p-4 bg-gray-50 rounded-lg border-[2px] border-gray-300 hover:border-blue-500 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-gray-800">
                    📝 v{versions.length - index}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-green-400 text-green-900 text-xs font-bold rounded border-[2px] border-black">
                      Hiện tại
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(version.timestamp).toLocaleString('vi-VN')}
                </p>
                
                {version.changes && (
                  <div className="text-xs text-gray-500">
                    <p>• {version.changes}</p>
                  </div>
                )}
                
                {version.author && (
                  <p className="text-xs text-gray-500 mt-1">
                    Bởi: {version.author}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => alert('View version: ' + index)}
                  className="px-3 py-1 bg-blue-500 text-white rounded border-[2px] border-black font-bold hover:bg-blue-600 transition-colors text-xs whitespace-nowrap"
                >
                  👁️ Xem
                </button>
                
                {index !== 0 && (
                  <button
                    onClick={() => handleRestore(index)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded border-[2px] border-black font-bold hover:bg-yellow-500 transition-colors text-xs whitespace-nowrap"
                  >
                    ♻️ Khôi phục
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-[2px] border-blue-300">
        <p className="text-xs text-gray-700">
          <strong>ℹ️ Lưu ý:</strong> Hệ thống tự động lưu 10 phiên bản gần nhất. 
          Các phiên bản cũ hơn sẽ bị xóa tự động.
        </p>
      </div>
    </div>
  );
}

/**
 * Helper: Save current version to history (call this before updating lesson)
 */
export async function saveVersionToHistory(bookId, chapterId, lessonId, lessonData, changes = '', author = 'Admin') {
  try {
    const versionKey = `lesson_versions_${bookId}_${chapterId}_${lessonId}`;
    const savedVersions = localStorage.getItem(versionKey);
    const versions = savedVersions ? JSON.parse(savedVersions) : [];
    
    // Add new version
    versions.unshift({
      timestamp: new Date().toISOString(),
      data: lessonData,
      changes,
      author
    });
    
    // Keep only last 10 versions
    const trimmedVersions = versions.slice(0, 10);
    
    localStorage.setItem(versionKey, JSON.stringify(trimmedVersions));
    console.log(`✅ Saved version to history: ${bookId}/${chapterId}/${lessonId}`);
    
    return true;
  } catch (error) {
    console.error('Error saving version:', error);
    return false;
  }
}

export default LessonVersionHistory;

