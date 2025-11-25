// src/components/admin/lessons/LessonManagementEnhanced.jsx
// 📚 Enhanced Lesson Management - Clear Structure with All Features

import React, { useState, useEffect, useMemo } from 'react';
import storageManager from '../../../utils/localStorageManager.js';
import { useToast } from '../../ToastNotification.jsx';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import Modal from '../../Modal.jsx';

function LessonManagementEnhanced({ 
  bookId, 
  chapterId, 
  levelId,
  bookTitle = '',
  chapterTitle = '',
  onClose 
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Lessons data
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    id: '',
    title: '',
    description: '',
    order: 1,
    pdfUrl: '',
    content: '',
    published: true
  });
  
  // Knowledge/Theory management
  const [showKnowledgeEditor, setShowKnowledgeEditor] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState(null);
  
  // Quiz management
  const [showQuizManager, setShowQuizManager] = useState(false);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null);
  
  // UI states
  const [expandedLessons, setExpandedLessons] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, hasKnowledge, hasQuiz, empty
  const [sortBy, setSortBy] = useState('order'); // order, title, newest
  
  const { success, error: showError, info } = useToast();
  const { t } = useLanguage();
  
  // ============================================
  // LOAD DATA
  // ============================================
  
  useEffect(() => {
    loadLessons();
  }, [bookId, chapterId]);
  
  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const savedLessons = await storageManager.getLessons(bookId, chapterId);
      setLessons(savedLessons || []);
    } catch (err) {
      console.error('Error loading lessons:', err);
      showError(t('lessonManagement.messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const generateLessonId = (existingLessons) => {
    if (!existingLessons || existingLessons.length === 0) return 'lesson-1';
    const numbers = existingLessons
      .map(l => {
        const match = l.id.match(/lesson-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `lesson-${maxNum + 1}`;
  };
  
  const generateOrder = (existingLessons) => {
    if (!existingLessons || existingLessons.length === 0) return 1;
    const maxOrder = Math.max(...existingLessons.map(l => l.order || 0));
    return maxOrder + 1;
  };
  
  const getLessonStatus = (lesson) => {
    const hasKnowledge = !!(lesson.pdfUrl || lesson.content);
    const hasQuiz = lesson.hasQuiz || false;
    
    if (hasKnowledge && hasQuiz) return 'complete';
    if (hasKnowledge) return 'hasKnowledge';
    if (hasQuiz) return 'hasQuiz';
    return 'empty';
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      complete: { text: t('lessonManagement.status.complete'), bg: 'bg-green-500', color: 'text-white' },
      hasKnowledge: { text: t('lessonManagement.status.hasKnowledge'), bg: 'bg-blue-400', color: 'text-white' },
      hasQuiz: { text: t('lessonManagement.status.hasQuiz'), bg: 'bg-purple-400', color: 'text-white' },
      empty: { text: t('lessonManagement.status.empty'), bg: 'bg-gray-300', color: 'text-gray-700' }
    };
    return badges[status] || badges.empty;
  };
  
  // Filter and sort lessons
  const filteredLessons = useMemo(() => {
    let result = [...lessons];
    
    // Search filter
    if (searchQuery) {
      result = result.filter(l => 
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      result = result.filter(l => {
        const status = getLessonStatus(l);
        if (filterType === 'hasKnowledge') return status === 'complete' || status === 'hasKnowledge';
        if (filterType === 'hasQuiz') return status === 'complete' || status === 'hasQuiz';
        if (filterType === 'empty') return status === 'empty';
        return true;
      });
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'order') return (a.order || 0) - (b.order || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      return 0;
    });
    
    return result;
  }, [lessons, searchQuery, filterType, sortBy]);
  
  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  const handleAddLesson = () => {
    const autoId = generateLessonId(lessons);
    const autoOrder = generateOrder(lessons);
    
    setEditingLesson(null);
    setLessonForm({
      id: autoId,
      title: '',
      description: '',
      order: autoOrder,
      pdfUrl: '',
      content: '',
      published: true
    });
    setShowLessonForm(true);
  };
  
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      id: lesson.id,
      title: lesson.title || '',
      description: lesson.description || '',
      order: lesson.order || 1,
      pdfUrl: lesson.pdfUrl || '',
      content: lesson.content || '',
      published: lesson.published !== false
    });
    setShowLessonForm(true);
  };
  
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    
    if (!lessonForm.id || !lessonForm.title) {
      showError(t('lessonManagement.messages.fillRequired'));
      return;
    }
    
    try {
      let updatedLessons = [...lessons];
      
      if (editingLesson) {
        // Update existing
        updatedLessons = updatedLessons.map(l =>
          l.id === editingLesson.id ? { ...lessonForm, updatedAt: Date.now() } : l
        );
      } else {
        // Add new
        if (lessons.find(l => l.id === lessonForm.id)) {
          showError(t('lessonManagement.messages.idExists'));
          return;
        }
        updatedLessons.push({ ...lessonForm, createdAt: Date.now() });
      }
      
      // Sort by order
      updatedLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const saveSuccess = await storageManager.saveLessons(bookId, chapterId, updatedLessons);
      
      if (saveSuccess) {
        setLessons(updatedLessons);
        setShowLessonForm(false);
        setEditingLesson(null);
        success(`✅ ${editingLesson ? t('lessonManagement.messages.saveSuccess') : t('lessonManagement.messages.addSuccess')}`);
      } else {
        showError(t('lessonManagement.messages.saveError'));
      }
    } catch (err) {
      console.error('Save lesson error:', err);
      showError(t('lessonManagement.messages.saveError'));
    }
  };
  
  const handleDeleteLesson = async (lessonId) => {
    if (!confirm(`⚠️ ${t('lessonManagement.messages.deleteConfirm')}`)) return;
    
    try {
      const updatedLessons = lessons.filter(l => l.id !== lessonId);
      const saveSuccess = await storageManager.saveLessons(bookId, chapterId, updatedLessons);
      
      if (saveSuccess) {
        // Also delete quiz
        await storageManager.deleteQuiz(bookId, chapterId, lessonId);
        setLessons(updatedLessons);
        success(`✅ ${t('lessonManagement.messages.deleteSuccess')}`);
      } else {
        showError(t('lessonManagement.messages.deleteError'));
      }
    } catch (err) {
      console.error('Delete lesson error:', err);
      showError(t('lessonManagement.messages.deleteError'));
    }
  };
  
  const handleDuplicateLesson = (lesson) => {
    const newId = generateLessonId(lessons);
    const newOrder = generateOrder(lessons);
    
    setEditingLesson(null);
    setLessonForm({
      ...lesson,
      id: newId,
      title: `${lesson.title} (Copy)`,
      order: newOrder,
      published: false // Draft by default
    });
    setShowLessonForm(true);
  };
  
  const handleTogglePublish = async (lessonId) => {
    try {
      const updatedLessons = lessons.map(l =>
        l.id === lessonId ? { ...l, published: !l.published, updatedAt: Date.now() } : l
      );
      
      const saveSuccess = await storageManager.saveLessons(bookId, chapterId, updatedLessons);
      
      if (saveSuccess) {
        setLessons(updatedLessons);
        const lesson = updatedLessons.find(l => l.id === lessonId);
        info(`${lesson.published ? `📤 ${t('lessonManagement.messages.published')}` : `📥 ${t('lessonManagement.messages.unpublished')}`}: ${lesson.title}`);
      }
    } catch (err) {
      showError('Lỗi khi thay đổi trạng thái!');
    }
  };
  
  const handleReorder = async (lessonId, direction) => {
    const index = lessons.findIndex(l => l.id === lessonId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;
    
    const reordered = [...lessons];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    
    // Update order numbers
    reordered.forEach((l, i) => {
      l.order = i + 1;
    });
    
      const saveSuccess = await storageManager.saveLessons(bookId, chapterId, reordered);
      if (saveSuccess) {
        setLessons(reordered);
        info(`✅ ${t('lessonManagement.messages.reorderSuccess')}`);
      }
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* ============================================
          HEADER - Breadcrumb + Actions
          ============================================ */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              📚 {t('lessonManagement.title')}
            </h2>
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="font-bold">📍 {t('lessonManagement.path')}</span>
              <span>{levelId?.toUpperCase()}</span>
              <span>→</span>
              <span className="truncate max-w-[200px]">{bookTitle}</span>
              <span>→</span>
              <span className="truncate max-w-[200px]">{chapterTitle}</span>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black transition-all duration-200"
            >
              ← {t('lessonManagement.back')}
            </button>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-gray-900">{lessons.length}</div>
            <div className="text-xs text-gray-700 font-medium">{t('lessonManagement.totalLessons')}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-gray-900">
              {lessons.filter(l => l.pdfUrl || l.content).length}
            </div>
            <div className="text-xs text-gray-700 font-medium">{t('lessonManagement.hasTheory')}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-gray-900">
              {lessons.filter(l => l.hasQuiz).length}
            </div>
            <div className="text-xs text-gray-700 font-medium">{t('lessonManagement.hasQuiz')}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-gray-900">
              {lessons.filter(l => l.published !== false).length}
            </div>
            <div className="text-xs text-gray-700 font-medium">{t('lessonManagement.published')}</div>
          </div>
        </div>
      </div>
      
      {/* ============================================
          CONTROLS - Search, Filter, Sort, Actions
          ============================================ */}
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Left: Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`🔍 ${t('lessonManagement.searchPlaceholder')}`}
              className="w-full px-4 py-2 border-[2px] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            />
          </div>
          
          {/* Right: Actions */}
          <button
            onClick={handleAddLesson}
            className="px-6 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            ➕ {t('lessonManagement.addLesson')}
          </button>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mt-3 items-center">
          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">{t('lessonManagement.filter')}</span>
            <div className="flex gap-1">
              {[
                { value: 'all', label: t('lessonManagement.all'), icon: '📋' },
                { value: 'hasKnowledge', label: t('lessonManagement.hasKnowledge'), icon: '📄' },
                { value: 'hasQuiz', label: t('lessonManagement.hasQuizFilter'), icon: '❓' },
                { value: 'empty', label: t('lessonManagement.empty'), icon: '⚠️' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-3 py-1 rounded-md border-[2px] border-black font-bold text-xs transition-all ${
                    filterType === filter.value
                      ? 'bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sort by */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">{t('lessonManagement.sort')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border-[2px] border-black rounded-md font-bold text-xs bg-white"
            >
              <option value="order">{t('lessonManagement.byOrder')}</option>
              <option value="title">{t('lessonManagement.byTitle')}</option>
              <option value="newest">{t('lessonManagement.newest')}</option>
            </select>
          </div>
          
          {/* Count */}
          <div className="ml-auto text-sm text-gray-600 font-medium">
            {t('lessonManagement.showing')} <span className="font-black text-gray-800">{filteredLessons.length}</span> / {lessons.length}
          </div>
        </div>
      </div>
      
      {/* ============================================
          LESSONS LIST - Cards with All Info
          ============================================ */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">
            {searchQuery || filterType !== 'all' 
              ? `❌ ${t('lessonManagement.noLessonsFound')}` 
              : `📝 ${t('lessonManagement.noLessons')}`}
          </p>
          <p className="text-sm text-gray-400">
            {searchQuery || filterType !== 'all'
              ? t('lessonManagement.tryChangeFilter')
              : t('lessonManagement.clickToAdd')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6 space-y-4 -mx-4 md:-mx-6 my-0 md:my-0">
          {filteredLessons.map((lesson, index) => {
            const status = getLessonStatus(lesson);
            const badge = getStatusBadge(status);
            const isExpanded = expandedLessons[lesson.id];
            
            return (
              <div
                key={lesson.id}
                className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                {/* ============================================
                    LESSON CARD HEADER - Compact Info
                    ============================================ */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                      <span className="text-xl font-black">{lesson.order || index + 1}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title + Badges */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-black text-gray-800 mb-1 truncate">
                            {lesson.title || lesson.id}
                          </h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                          )}
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            ID: {lesson.id}
                          </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex flex-col gap-2 items-end">
                          <span className={`px-3 py-1 rounded-full border-[2px] border-black font-bold text-xs ${badge.bg} ${badge.color}`}>
                            {badge.text}
                          </span>
                          {!lesson.published && (
                            <span className="px-2 py-0.5 rounded border border-gray-400 bg-gray-100 text-gray-600 font-bold text-xs">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Info Icons */}
                      <div className="flex flex-wrap gap-3 text-sm mb-3">
                        <div className={`flex items-center gap-1.5 ${lesson.pdfUrl ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>📎</span>
                          <span className="font-medium">PDF</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${lesson.content ? 'text-blue-600' : 'text-gray-400'}`}>
                          <span>📝</span>
                          <span className="font-medium">HTML</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${lesson.hasQuiz ? 'text-purple-600' : 'text-gray-400'}`}>
                          <span>❓</span>
                          <span className="font-medium">Quiz</span>
                        </div>
                      </div>
                      
                      {/* ============================================
                          ACTION BUTTONS - Clear & Organized
                          ============================================ */}
                      <div className="flex flex-wrap gap-2">
                        {/* Primary Actions */}
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="px-4 py-2 bg-yellow-400 text-black rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black transition-all duration-200 text-sm"
                        >
                          ✏️ {t('lessonManagement.actions.edit')}
                        </button>
                        
                        <button
                          onClick={() => setExpandedLessons({ ...expandedLessons, [lesson.id]: !isExpanded })}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black transition-all duration-200 text-sm"
                        >
                          📄 {isExpanded ? t('lessonManagement.actions.hideTheory') : t('lessonManagement.actions.manageTheory')}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedLessonForQuiz(lesson);
                            setShowQuizManager(true);
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black transition-all duration-200 text-sm"
                        >
                          ❓ {t('lessonManagement.actions.manageQuiz')}
                        </button>
                        
                        {/* Secondary Actions */}
                        <button
                          onClick={() => handleTogglePublish(lesson.id)}
                          className={`px-3 py-2 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200 text-sm ${
                            lesson.published 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {lesson.published ? `📤 ${t('lessonManagement.actions.published')}` : `📥 ${t('lessonManagement.actions.draft')}`}
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateLesson(lesson)}
                          className="px-3 py-2 bg-white text-gray-800 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 font-bold transition-all duration-200 text-sm"
                        >
                          📋 {t('lessonManagement.actions.copy')}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 font-bold transition-all duration-200 text-sm"
                        >
                          🗑️ {t('lessonManagement.actions.delete')}
                        </button>
                        
                        {/* Reorder */}
                        {index > 0 && (
                          <button
                            onClick={() => handleReorder(lesson.id, 'up')}
                            className="px-2 py-2 bg-gray-200 text-gray-800 rounded border-[2px] border-black font-bold hover:bg-gray-300 transition-colors text-sm"
                            title={t('lessonManagement.actions.moveUp')}
                          >
                            ↑
                          </button>
                        )}
                        {index < lessons.length - 1 && (
                          <button
                            onClick={() => handleReorder(lesson.id, 'down')}
                            className="px-2 py-2 bg-gray-200 text-gray-800 rounded border-[2px] border-black font-bold hover:bg-gray-300 transition-colors text-sm"
                            title={t('lessonManagement.actions.moveDown')}
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* ============================================
                      EXPANDED - Knowledge/Theory Details
                      ============================================ */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-[3px] border-gray-200">
                      <h4 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                        <span>📄</span>
                        {t('lessonManagement.expanded.theoryContent')}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* PDF Status */}
                        <div className="bg-white border-[3px] border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-green-800">📎 {t('lessonManagement.expanded.pdfDocument')}</span>
                            {lesson.pdfUrl && (
                              <span className="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-bold">✓ {t('lessonManagement.expanded.hasPdf')}</span>
                            )}
                          </div>
                          {lesson.pdfUrl ? (
                            <div>
                              <div className="text-xs text-green-700 font-mono bg-white/50 p-2 rounded mb-2 break-all">
                                {lesson.pdfUrl}
                              </div>
                              <a
                                href={lesson.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                              >
                                🔗 {t('lessonManagement.expanded.viewPdf')}
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">{t('lessonManagement.expanded.noPdf')}</p>
                          )}
                        </div>
                        
                        {/* HTML Content Status */}
                        <div className="bg-white border-[3px] border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-blue-800">📝 {t('lessonManagement.expanded.htmlContent')}</span>
                            {lesson.content && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-bold">✓ {t('lessonManagement.expanded.hasHtml')}</span>
                            )}
                          </div>
                          {lesson.content ? (
                            <div className="text-xs text-blue-700 bg-white/50 p-2 rounded max-h-20 overflow-y-auto font-mono">
                              {lesson.content.substring(0, 150)}
                              {lesson.content.length > 150 && '...'}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">{t('lessonManagement.expanded.noHtml')}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Knowledge Actions */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingKnowledge(lesson);
                            setShowKnowledgeEditor(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black transition-all duration-200 text-sm"
                        >
                          {lesson.pdfUrl || lesson.content ? `✏️ ${t('lessonManagement.expanded.editTheory')}` : `➕ ${t('lessonManagement.expanded.addTheory')}`}
                        </button>
                        
                        {(lesson.pdfUrl || lesson.content) && (
                          <button
                            onClick={async () => {
                              if (!confirm(t('lessonManagement.expanded.confirmDeleteTheory'))) return;
                              const updated = lessons.map(l =>
                                l.id === lesson.id ? { ...l, pdfUrl: '', content: '' } : l
                              );
                              await storageManager.saveLessons(bookId, chapterId, updated);
                              setLessons(updated);
                              success(`✅ ${t('lessonManagement.messages.deleteTheorySuccess')}`);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg border-[2px] border-red-300 font-bold hover:bg-red-200 transition-colors text-sm"
                          >
                            🗑️ {t('lessonManagement.expanded.deleteTheory')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* ============================================
          LESSON FORM MODAL - Clear Structure
          ============================================ */}
      <Modal
        isOpen={showLessonForm}
        onClose={() => setShowLessonForm(false)}
        title={editingLesson ? '✏️ Sửa Bài học' : '➕ Thêm Bài học mới'}
        maxWidth="42rem"
      >
        <form onSubmit={handleSaveLesson} className="space-y-6">
          {/* ============================================
              SECTION 1: Basic Info
              ============================================ */}
          <div className="bg-white rounded-lg p-4 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span>
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ID Lesson * <span className="text-red-500">⚠</span>
                </label>
                <input
                  type="text"
                  value={lessonForm.id}
                  onChange={(e) => setLessonForm({ ...lessonForm, id: e.target.value })}
                  required
                  disabled={!!editingLesson}
                  className={`w-full px-4 py-2 border-[2px] rounded-lg font-mono text-sm ${
                    editingLesson 
                      ? 'bg-gray-200 cursor-not-allowed border-gray-400'
                      : 'border-blue-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="lesson-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingLesson ? '🔒 Không thể sửa ID' : '✅ Auto-generated'}
                </p>
              </div>
              
              {/* Order */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thứ tự * <span className="text-blue-500">🔢</span>
                </label>
                <input
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border-[2px] border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thứ tự hiển thị (nhỏ hơn = hiển thị trước)
                </p>
              </div>
            </div>
            
            {/* Title */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên Bài học * <span className="text-yellow-500">📝</span>
              </label>
              <input
                type="text"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                required
                className="w-full px-4 py-2 border-[2px] border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm"
                placeholder="Bài 1.1 - Ngữ pháp cơ bản"
              />
            </div>
            
            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả ngắn (tùy chọn) <span className="text-gray-400">💬</span>
              </label>
              <textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="w-full px-4 py-2 border-[2px] border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
                rows="2"
                placeholder="Học cách sử dụng trợ từ は và が trong câu"
              />
            </div>
            
            {/* Published */}
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lessonForm.published}
                  onChange={(e) => setLessonForm({ ...lessonForm, published: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-bold text-gray-700">
                  📤 Publish ngay (user có thể thấy)
                </span>
              </label>
            </div>
          </div>
          
          {/* ============================================
              SECTION 2: Knowledge/Theory Content
              ============================================ */}
          <div className="bg-white rounded-lg p-4 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <span>📄</span>
              Nội dung Lý thuyết
            </h3>
            
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 mb-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1 text-sm text-gray-700">
                  <p className="font-bold mb-1">Hướng dẫn:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Ưu tiên dùng <strong>PDF</strong> cho nội dung dài, có hình ảnh</li>
                    <li>Dùng <strong>HTML</strong> cho nội dung ngắn, cần format đặc biệt</li>
                    <li>Có thể có <strong>CẢ HAI</strong> (PDF ưu tiên hiển thị)</li>
                    <li>Để <strong>TRỐNG</strong> nếu lesson chỉ có Quiz</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* PDF URL */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📎 URL PDF Lý thuyết (Khuyến nghị)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lessonForm.pdfUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                  className="flex-1 px-4 py-2 border-[2px] border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm font-mono"
                  placeholder="/pdfs/n1/shinkanzen/bunpou/lesson1-grammar.pdf"
                />
                {lessonForm.pdfUrl && (
                  <a
                    href={lessonForm.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[2px] border-black font-bold hover:bg-blue-600 transition-colors text-sm whitespace-nowrap"
                  >
                    🔗 Xem
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Upload PDF vào <code className="bg-gray-200 px-1.5 py-0.5 rounded">public/pdfs/</code> rồi nhập path
              </p>
            </div>
            
            {/* HTML Content */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📝 Nội dung HTML (Alternative)
              </label>
              <textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                className="w-full px-4 py-3 border-[2px] border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                rows="8"
                placeholder="<div>
  <h2>Ngữ pháp: Trợ từ は</h2>
  <p>Trợ từ は được dùng để chỉ chủ đề của câu.</p>
  
  <h3>Ví dụ:</h3>
  <ul>
    <li><strong>私は学生です</strong> - Tôi là sinh viên</li>
    <li><strong>今日はいい天気です</strong> - Hôm nay thời tiết đẹp</li>
  </ul>
  
  <h3>Lưu ý:</h3>
  <p>Phát âm là 'wa' nhưng viết là 'は'</p>
</div>"
              />
              <div className="flex items-start gap-2 mt-2">
                <span className="text-xs">ℹ️</span>
                <p className="text-xs text-gray-600">
                  Support: &lt;h1&gt; &lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;ul&gt; &lt;ol&gt; &lt;li&gt; &lt;strong&gt; &lt;em&gt; &lt;code&gt; &lt;a&gt; &lt;img&gt;
                </p>
              </div>
              
              {lessonForm.content && (
                <div className="mt-3 p-3 bg-white border-2 border-blue-200 rounded-lg">
                  <p className="text-xs font-bold text-blue-800 mb-2">📺 Preview:</p>
                  <div 
                    className="prose prose-sm max-w-none max-h-40 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: lessonForm.content }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* ============================================
              SECTION 3: Summary & Save
              ============================================ */}
          <div className="bg-white rounded-lg p-4 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-black text-gray-800 mb-3">📊 Tóm tắt:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-bold text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded ${
                  lessonForm.published ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                } font-bold text-xs`}>
                  {lessonForm.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Có PDF:</span>
                <span className={`ml-2 ${lessonForm.pdfUrl ? 'text-green-600' : 'text-gray-400'}`}>
                  {lessonForm.pdfUrl ? '✓ Có' : '✗ Không'}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Có HTML:</span>
                <span className={`ml-2 ${lessonForm.content ? 'text-blue-600' : 'text-gray-400'}`}>
                  {lessonForm.content ? '✓ Có' : '✗ Không'}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Thứ tự:</span>
                <span className="ml-2 text-gray-800 font-bold">#{lessonForm.order}</span>
              </div>
            </div>
          </div>
          
          {/* Save Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
            >
              💾 {editingLesson ? 'Lưu Thay Đổi' : 'Thêm Lesson'}
            </button>
            <button
              type="button"
              onClick={() => setShowLessonForm(false)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-600 font-black transition-all duration-200 uppercase"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
      
      {/* ============================================
          TODO: Knowledge Editor Modal (Future)
          ============================================ */}
      {showKnowledgeEditor && (
        <Modal
          isOpen={true}
          onClose={() => setShowKnowledgeEditor(false)}
          title="📄 Quản lý Lý thuyết"
          maxWidth="50rem"
        >
          <div className="p-4">
            <p className="text-gray-600">Knowledge Editor - Under Development</p>
            <p className="text-sm text-gray-500 mt-2">
              Hiện tại bạn có thể sửa trong form "✏️ Sửa Info"
            </p>
          </div>
        </Modal>
      )}
      
      {/* ============================================
          TODO: Quiz Manager Modal (Future)
          ============================================ */}
      {showQuizManager && (
        <Modal
          isOpen={true}
          onClose={() => setShowQuizManager(false)}
          title="❓ Quản lý Quiz"
          maxWidth="50rem"
        >
          <div className="p-4">
            <p className="text-gray-600">Quiz Manager - Under Development</p>
            <p className="text-sm text-gray-500 mt-2">
              Hiện tại bạn có thể quản lý quiz qua Quiz Editor
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default LessonManagementEnhanced;

