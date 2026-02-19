// src/components/admin/lessons/LessonsManagement.jsx
// Lessons Management Component - Admin UI with Analytics Toggle

import React, { useState, useEffect } from 'react';
import storageManager from '../../../utils/localStorageManager.js';
import { useToast } from '../../ToastNotification.jsx';
import { getAllLessonStats } from '../../../utils/lessonProgressTracker.js';

function LessonsManagement({ bookId, chapterId, levelId }) {
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [sortBy, setSortBy] = useState('order'); // order, title, views, avgScore
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  
  const { success, error: showError, info } = useToast();
  
  // Load lessons
  useEffect(() => {
    const loadLessons = async () => {
      setIsLoading(true);
      try {
        const savedLessons = await storageManager.getLessons(bookId, chapterId);
        if (savedLessons && savedLessons.length > 0) {
          setLessons(savedLessons);
          setFilteredLessons(savedLessons);
        } else {
          setLessons([]);
          setFilteredLessons([]);
        }
      } catch (err) {
        console.error('Error loading lessons:', err);
        showError('Không thể tải danh sách bài học');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (bookId && chapterId) {
      loadLessons();
    }
  }, [bookId, chapterId]);
  
  // Filter and sort
  useEffect(() => {
    let result = [...lessons];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(lesson => 
        lesson.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(lesson => 
        filterStatus === 'published' ? lesson.published : !lesson.published
      );
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'order':
          return (a.order || 0) - (b.order || 0);
        default:
          return 0;
      }
    });
    
    setFilteredLessons(result);
  }, [lessons, searchQuery, filterStatus, sortBy]);
  
  // Get lesson stats
  const getLessonStats = (lessonId) => {
    if (!showAnalytics) return null;
    
    const allLessons = lessons.map(l => ({ ...l, chapterId }));
    const stats = getAllLessonStats(bookId, allLessons);
    return stats.find(s => s.lessonId === lessonId);
  };
  
  // Toggle select lesson
  const toggleSelectLesson = (lessonId) => {
    if (selectedLessons.includes(lessonId)) {
      setSelectedLessons(selectedLessons.filter(id => id !== lessonId));
    } else {
      setSelectedLessons([...selectedLessons, lessonId]);
    }
  };
  
  // Select all
  const toggleSelectAll = () => {
    if (selectedLessons.length === filteredLessons.length) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons(filteredLessons.map(l => l.id));
    }
  };
  
  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;
    
    try {
      const updatedLessons = lessons.filter(l => l.id !== lessonId);
      await storageManager.saveLessons(bookId, chapterId, updatedLessons);
      setLessons(updatedLessons);
      success('Đã xóa bài học', 3000, {
        label: '↩️ Undo',
        onClick: async () => {
          await storageManager.saveLessons(bookId, chapterId, lessons);
          setLessons(lessons);
          info('Đã hoàn tác xóa bài học');
        }
      });
    } catch (err) {
      console.error('Error deleting lesson:', err);
      showError('Không thể xóa bài học');
    }
  };
  
  // Toggle publish
  const handleTogglePublish = async (lessonId) => {
    try {
      const updatedLessons = lessons.map(l => 
        l.id === lessonId ? { ...l, published: !l.published } : l
      );
      await storageManager.saveLessons(bookId, chapterId, updatedLessons);
      setLessons(updatedLessons);
      
      const lesson = updatedLessons.find(l => l.id === lessonId);
      success(`Đã ${lesson.published ? 'publish' : 'unpublish'} bài học`);
    } catch (err) {
      console.error('Error toggling publish:', err);
      showError('Không thể cập nhật trạng thái');
    }
  };
  
  // Export to CSV
  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Title', 'Status', 'Has PDF', 'Has Quiz', 'Views', 'Avg Score', 'Completion Rate'].join(','),
      ...filteredLessons.map(lesson => {
        const stats = getLessonStats(lesson.id);
        return [
          lesson.id,
          `"${lesson.title || ''}"`,
          lesson.published ? 'Published' : 'Draft',
          lesson.pdfUrl ? 'Yes' : 'No',
          lesson.hasQuiz ? 'Yes' : 'No',
          stats?.views || 0,
          stats?.averageScore || 0,
          stats?.completed ? 'Yes' : 'No'
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lessons_${bookId}_${chapterId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    success('Đã export CSV');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-gray-800">📝 QUẢN LÝ LESSONS</h2>
          
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 text-sm uppercase"
            >
              + Thêm Lesson
            </button>
            
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 text-sm uppercase ${
                showAnalytics ? 'bg-yellow-400 text-black' : 'bg-white text-gray-800'
              }`}
            >
              📊 Analytics: {showAnalytics ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Tìm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border-[3px] border-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border-[3px] border-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border-[3px] border-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="order">Thứ tự</option>
            <option value="title">Tên A-Z</option>
          </select>
          
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 text-sm uppercase"
          >
            ⬇️ Export CSV
          </button>
        </div>
        
        {/* Bulk actions */}
        {selectedLessons.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-lg border-[3px] border-black">
            <span className="font-bold text-gray-800">
              Đã chọn: {selectedLessons.length} bài học
            </span>
          </div>
        )}
      </div>
      
      {/* Lessons List */}
      <div className="space-y-3">
        {filteredLessons.length === 0 ? (
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
            <p className="text-gray-600">Chưa có bài học nào</p>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const stats = getLessonStats(lesson.id);
            const isSelected = selectedLessons.includes(lesson.id);
            
            return (
              <div
                key={lesson.id}
                className={`bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 p-4 ${
                  isSelected ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectLesson(lesson.id)}
                    className="mt-1 w-5 h-5 cursor-pointer"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg text-gray-800 truncate">
                          📝 {lesson.title || lesson.id}
                        </h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full border-[2px] border-black font-bold text-xs ${
                          lesson.published ? 'bg-green-400 text-green-900' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {lesson.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span>📄 {lesson.pdfUrl ? '✅ PDF' : '❌ No PDF'}</span>
                      <span>❓ {lesson.hasQuiz ? '✅ Quiz' : '❌ No Quiz'}</span>
                      <span>🕐 {new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    {/* Analytics */}
                    {showAnalytics && stats && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-[2px] border-blue-300">
                        <p className="font-bold text-gray-800 mb-2">📊 ANALYTICS:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Attempts:</span>
                            <span className="font-bold text-gray-800 ml-2">{stats.attempts}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Avg Score:</span>
                            <span className="font-bold text-gray-800 ml-2">{stats.averageScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Best Score:</span>
                            <span className="font-bold text-gray-800 ml-2">{stats.bestScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-bold text-gray-800 ml-2">{stats.completed ? '✅' : '❌'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => handleTogglePublish(lesson.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded border-[2px] border-black font-bold hover:bg-blue-600 transition-colors text-xs"
                      >
                        {lesson.published ? '📥 Unpublish' : '📤 Publish'}
                      </button>
                      
                      <button className="px-3 py-1 bg-yellow-400 text-black rounded border-[2px] border-black font-bold hover:bg-yellow-500 transition-colors text-xs">
                        ✏️ Sửa
                      </button>
                      
                      <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded border-[2px] border-black font-bold hover:bg-gray-300 transition-colors text-xs">
                        👁️ Preview
                      </button>
                      
                      <button className="px-3 py-1 bg-purple-400 text-white rounded border-[2px] border-black font-bold hover:bg-purple-500 transition-colors text-xs">
                        📋 Duplicate
                      </button>
                      
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded border-[2px] border-black font-bold hover:bg-red-600 transition-colors text-xs"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LessonsManagement;

