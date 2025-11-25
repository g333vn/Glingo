// src/components/admin/lessons/EnhancedLessonModal.jsx
// 🎯 Enhanced Lesson Modal - Modal với tabs system (Theory/Flashcard/Quiz)

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import Modal from '../../Modal.jsx';
import ContentTypeSelector from './ContentTypeSelector.jsx';
import LessonTabs, { TabPanel } from './LessonTabs.jsx';
import TheoryTabEnhanced from './tabs/TheoryTabEnhanced.jsx';
import FlashcardTab from './tabs/FlashcardTab.jsx';
import { 
  CONTENT_TYPES, 
  createLessonStructure, 
  getEnabledTabs 
} from '../../../types/lessonTypes.js';

/**
 * EnhancedLessonModal Component
 * Phase 1: ContentType selector + Tab system + Theory/Flashcard tabs
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close callback
 * @param {function} onSave - Save callback
 * @param {object} initialLesson - Lesson data for editing (null for new)
 * @param {object} chapterInfo - Chapter info for display
 */
function EnhancedLessonModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialLesson = null,
  chapterInfo = {}
}) {
  const { t } = useLanguage();
  // ========== STATE ==========
  const [lessonData, setLessonData] = useState(createLessonStructure());
  const [activeTab, setActiveTab] = useState('theory');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // ========== INITIALIZE ==========
  useEffect(() => {
    if (initialLesson) {
      // Edit mode: Load existing lesson
      setLessonData(createLessonStructure(initialLesson));
    } else {
      // Create mode: Fresh lesson with auto-ID
      // ✅ ENHANCED: Auto-generate ID based on existing lessons to avoid duplicates
      let autoId = 'lesson-1';
      const existingLessons = chapterInfo?.existingLessons || [];
      
      if (chapterInfo && chapterInfo.bookId && chapterInfo.chapterId) {
        const chapterNum = chapterInfo.chapterId.match(/\d+/)?.[0] || '1';
        
        // ✅ Find the highest lesson number in this chapter
        const lessonNumbers = existingLessons
          .map(lesson => {
            // Support formats: lesson-1-1, lesson-1-2, etc.
            const match = lesson.id?.match(/lesson-(\d+)-(\d+)/);
            if (match && match[1] === chapterNum) {
              return parseInt(match[2], 10);
            }
            // Fallback: check for simple format lesson-1, lesson-2
            const simpleMatch = lesson.id?.match(/lesson-(\d+)/);
            if (simpleMatch && simpleMatch[1] === chapterNum) {
              return 1; // Assume first lesson
            }
            return 0;
          })
          .filter(n => n > 0);
        
        const maxNum = lessonNumbers.length > 0 ? Math.max(...lessonNumbers) : 0;
        const nextNum = maxNum + 1;
        autoId = `lesson-${chapterNum}-${nextNum}`;
      } else if (existingLessons.length > 0) {
        // Fallback: if no chapter info, just find max number
        const numbers = existingLessons
          .map(lesson => {
            const match = lesson.id?.match(/lesson-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => n > 0);
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        autoId = `lesson-${maxNum + 1}`;
      }
      
      setLessonData({
        ...createLessonStructure(),
        id: autoId
      });
    }
  }, [initialLesson, isOpen, chapterInfo]);
  
  // ========== HANDLERS ==========
  
  /**
   * Handle content type change
   * ✅ ENHANCED: Auto-switch tab và highlight relevant tabs
   */
  const handleContentTypeChange = (newType) => {
    setLessonData(prev => ({
      ...prev,
      contentType: newType
    }));
    
    // ✅ Auto-enable SRS if vocabulary/kanji và switch to flashcard tab
    if (newType === CONTENT_TYPES.VOCABULARY || newType === CONTENT_TYPES.KANJI) {
      setLessonData(prev => ({
        ...prev,
        srs: {
          ...prev.srs,
          enabled: true
        }
      }));
      // Auto-switch to flashcard tab để admin thấy ngay
      setTimeout(() => setActiveTab('flashcard'), 100);
    } else {
      // Switch to theory tab cho các loại khác
      setActiveTab('theory');
    }
  };
  
  /**
   * Handle theory data change
   * ✅ Track unsaved changes
   */
  const handleTheoryChange = (newTheoryData) => {
    setLessonData(prev => ({
      ...prev,
      theory: newTheoryData
    }));
    setHasUnsavedChanges(true);
  };
  
  /**
   * Handle SRS data change
   * ✅ Track unsaved changes
   */
  const handleSRSChange = (newSRSData) => {
    setLessonData(prev => ({
      ...prev,
      srs: newSRSData
    }));
    setHasUnsavedChanges(true);
  };
  
  /**
   * ✅ NEW: Validate entire lesson data
   */
  const validateLesson = () => {
    const errors = [];
    
    // Basic fields
    if (!lessonData.id) errors.push(t('contentManagement.lessonModal.validation.idRequired'));
    if (!lessonData.title) errors.push(t('contentManagement.lessonModal.validation.titleRequired'));
    
    // ✅ Check duplicate ID (only for new lessons)
    if (!initialLesson && chapterInfo?.existingLessons) {
      const isDuplicate = chapterInfo.existingLessons.some(
        lesson => lesson.id === lessonData.id
      );
      if (isDuplicate) {
        errors.push(t('contentManagement.lessonModal.validation.idExists', { id: lessonData.id }));
      }
    }
    
    // ✅ Content validation: Require at least ONE of: Theory OR Flashcards
    const hasTheory = lessonData.theory?.pdfUrl || 
                     lessonData.theory?.htmlContent || 
                     lessonData.theory?.videoUrl || 
                     lessonData.theory?.audioUrl;
    
    const hasFlashcards = lessonData.srs?.enabled && 
                         lessonData.srs?.cards && 
                         lessonData.srs.cards.length > 0;
    
    if (!hasTheory && !hasFlashcards) {
      errors.push(t('contentManagement.lessonModal.validation.needContent'));
    }
    
    // SRS validation (if enabled)
    if (lessonData.srs?.enabled) {
      if (!lessonData.srs.newCardsPerDay || lessonData.srs.newCardsPerDay < 1) {
        errors.push(t('contentManagement.lessonModal.validation.srsNewCards'));
      }
      if (!lessonData.srs.reviewsPerDay || lessonData.srs.reviewsPerDay < 10) {
        errors.push(t('contentManagement.lessonModal.validation.srsReviews'));
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  /**
   * ✅ NEW: Save as draft
   */
  const handleSaveDraft = async () => {
    // Validate first
    if (!validateLesson()) {
      alert(t('contentManagement.lessonModal.validation.validationError', { errors: validationErrors.join('\n') }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mark as draft
      const draftData = {
        ...lessonData,
        published: false,
        updatedAt: new Date().toISOString()
      };
      
      await onSave(draftData);
      setHasUnsavedChanges(false);
      
      alert(t('contentManagement.lessonModal.saveDraft.success'));
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(t('contentManagement.lessonModal.saveDraft.error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * ✅ ENHANCED: Handle form submit with full validation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Full validation
    if (!validateLesson()) {
      alert(t('contentManagement.lessonModal.validation.validationError', { errors: validationErrors.join('\n') }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate save delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update timestamps
      const finalData = {
        ...lessonData,
        updatedAt: new Date().toISOString()
      };
      
      // Call parent save handler
      await onSave(finalData);
      
      setHasUnsavedChanges(false);
      
      // Success feedback
      alert(t('contentManagement.lessonModal.save.success', {
        title: lessonData.title,
        id: lessonData.id,
        type: lessonData.contentType,
        srs: lessonData.srs?.enabled ? t('contentManagement.lessonModal.save.yes') : t('contentManagement.lessonModal.save.no'),
        published: lessonData.published ? t('contentManagement.lessonModal.save.yes') : t('contentManagement.lessonModal.save.draft')
      }));
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert(t('contentManagement.lessonModal.save.error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * ✅ NEW: Handle close with confirmation
   */
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(t('contentManagement.lessonModal.close.confirm'));
      if (!confirm) return;
    }
    onClose();
  };
  
  // ========== COMPUTE TAB CONFIG ==========
  const enabledTabIds = getEnabledTabs(lessonData.contentType);
  
  // ✅ ENHANCED: Tabs with dynamic highlighting
  const tabs = [
    {
      id: 'theory',
      label: t('contentManagement.lessonModal.theory'),
      icon: '📖',
      color: 'blue',
      disabled: !enabledTabIds.includes('theory'),
      // Highlight khi auto-enable
      highlight: lessonData.contentType && enabledTabIds.includes('theory')
    },
    {
      id: 'flashcard',
      label: 'Flashcard',
      icon: '🎴',
      color: 'purple',
      disabled: !enabledTabIds.includes('flashcard'),
      badge: lessonData.srs?.enabled ? lessonData.srs.cardCount || 0 : null,
      // Highlight khi vocabulary/kanji và SRS enabled
      highlight: lessonData.srs?.enabled && enabledTabIds.includes('flashcard'),
      // Show pulse animation khi mới enable
      pulse: lessonData.srs?.enabled && activeTab !== 'flashcard'
    },
    {
      id: 'quiz',
      label: t('contentManagement.lessonModal.quiz'),
      icon: '📊',
      color: 'green',
      disabled: !enabledTabIds.includes('quiz'),
      badge: lessonData.hasQuiz ? '✓' : null,
      highlight: lessonData.hasQuiz && enabledTabIds.includes('quiz')
    }
  ];
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {initialLesson ? '✏️' : '➕'}
          </span>
          <div>
            <h2 className="text-xl font-black">
              {initialLesson ? t('contentManagement.lessonModal.editLesson') : t('contentManagement.lessonModal.addLesson')}
            </h2>
            {chapterInfo.title && (
              <p className="text-sm text-gray-600 font-normal">
                {t('contentManagement.lessonModal.chapter')} {chapterInfo.title}
              </p>
            )}
          </div>
        </div>
      }
      maxWidth="56rem"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== SECTION 1: Content Type ========== */}
        <ContentTypeSelector
          value={lessonData.contentType}
          onChange={handleContentTypeChange}
          disabled={!!initialLesson} // Cannot change type after creation
        />
        
        {/* ========== SECTION 2: Basic Info ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✅ ENHANCED: ID with Auto-fill and Stepper */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t('contentManagement.lessonModal.lessonId')} {!initialLesson && t('contentManagement.lessonModal.autoId')}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={lessonData.id}
                readOnly
                className="flex-1 px-4 py-2 border-2 border-blue-300 bg-blue-50 rounded-lg text-sm font-mono font-semibold text-blue-900 cursor-not-allowed"
              />
              {!initialLesson && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      // Decrement lesson number
                      const match = lessonData.id.match(/lesson-(\d+)-(.*)/);
                      if (match) {
                        const chapterNum = match[1];
                        const currentNum = parseInt(match[2], 10);
                        if (currentNum > 1) {
                          const newId = `lesson-${chapterNum}-${currentNum - 1}`;
                          // Check if new ID is available
                          const existingLessons = chapterInfo?.existingLessons || [];
                          const isAvailable = !existingLessons.some(l => l.id === newId);
                          if (isAvailable || currentNum - 1 > 0) {
                            setLessonData(prev => ({ ...prev, id: newId }));
                          }
                        }
                      }
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
                    title={t('contentManagement.lessonModal.decreaseNumber')}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Increment lesson number - find next available ID
                      const match = lessonData.id.match(/lesson-(\d+)-(.*)/);
                      if (match) {
                        const chapterNum = match[1];
                        const currentNum = parseInt(match[2], 10);
                        const existingLessons = chapterInfo?.existingLessons || [];
                        
                        // Find next available number
                        let nextNum = currentNum + 1;
                        let maxAttempts = 100; // Safety limit
                        while (
                          existingLessons.some(l => l.id === `lesson-${chapterNum}-${nextNum}`) &&
                          maxAttempts > 0
                        ) {
                          nextNum++;
                          maxAttempts--;
                        }
                        
                        const newId = `lesson-${chapterNum}-${nextNum}`;
                        setLessonData(prev => ({ ...prev, id: newId }));
                      }
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
                    title={t('contentManagement.lessonModal.increaseNumber')}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              {initialLesson ? (
                <>
                  <span>🔒</span>
                  <span>Không thể thay đổi ID</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>
                    {t('contentManagement.lessonModal.autoIdByChapter')}
                    {chapterInfo?.bookId && ` (${t('contentManagement.lessonModal.bookLabel')} ${chapterInfo.bookId})`}
                  </span>
                </>
              )}
            </p>
          </div>
          
          {/* Order */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t('contentManagement.lessonModal.order')}
            </label>
            <input
              type="number"
              value={lessonData.order}
              onChange={(e) => setLessonData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
              min="1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {t('contentManagement.lessonModal.lessonName')}
          </label>
          <input
            type="text"
            value={lessonData.title}
            onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder={t('contentManagement.lessonModal.lessonNamePlaceholder')}
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {t('contentManagement.lessonModal.description')}
          </label>
          <input
            type="text"
            value={lessonData.description}
            onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder={t('contentManagement.lessonModal.descriptionPlaceholder')}
          />
        </div>
        
        {/* Published Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
          <input
            type="checkbox"
            id="published"
            checked={lessonData.published}
            onChange={(e) => setLessonData(prev => ({ ...prev, published: e.target.checked }))}
            className="w-5 h-5 rounded border-2 border-black cursor-pointer"
          />
          <label htmlFor="published" className="text-sm font-semibold text-gray-700 cursor-pointer">
            {t('contentManagement.lessonModal.publishNow')}
          </label>
        </div>
        
        {/* ✅ NEW: Existing Lessons List - Check for duplicates */}
        {!initialLesson && chapterInfo?.existingLessons && chapterInfo.existingLessons.length > 0 && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📋</span>
              <h3 className="text-sm font-bold text-gray-800">
                {t('contentManagement.lessonModal.existingLessons', { count: chapterInfo.existingLessons.length })}
              </h3>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {chapterInfo.existingLessons.map((lesson, idx) => {
                const isDuplicate = !initialLesson && lesson.id === lessonData.id;
                return (
                  <div
                    key={lesson.id || idx}
                    className={`p-2 rounded border-2 text-xs ${
                      isDuplicate
                        ? 'bg-red-100 border-red-400 border-[3px]'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">
                            {lesson.id}
                          </span>
                          {isDuplicate && (
                            <span className="text-red-600 font-bold text-[10px] px-1.5 py-0.5 bg-red-200 rounded">
                              ⚠️ TRÙNG LẶP!
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 truncate mt-0.5">
                          {lesson.title || '(Chưa có tiêu đề)'}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-gray-500">
                        {lesson.published ? '✅' : '⏸️'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {lessonData.id && chapterInfo.existingLessons.some(l => l.id === lessonData.id) && (
              <div className="mt-3 p-2 bg-red-100 border-2 border-red-400 rounded text-xs text-red-700 font-bold">
                ⚠️ CẢNH BÁO: ID "{lessonData.id}" đã tồn tại! Vui lòng chọn ID khác.
              </div>
            )}
          </div>
        )}
        
        {/* ========== SECTION 3: Tabs Content ========== */}
        <div className="border-t-[3px] border-gray-300 pt-6">
          <LessonTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {/* Theory Tab */}
          <TabPanel isActive={activeTab === 'theory'}>
            <TheoryTabEnhanced
              theoryData={lessonData.theory}
              onChange={handleTheoryChange}
            />
          </TabPanel>
          
          {/* Flashcard Tab */}
          <TabPanel isActive={activeTab === 'flashcard'}>
            <FlashcardTab
              srsData={lessonData.srs}
              onChange={handleSRSChange}
              lessonId={lessonData.id}
              pdfUrl={lessonData.theory?.pdfUrl}
            />
          </TabPanel>
          
          {/* Quiz Tab (Phase 2) */}
          <TabPanel isActive={activeTab === 'quiz'}>
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-bold">{t('contentManagement.lessonModal.theoryTab.quizTabComingSoon')}</p>
              <p className="text-sm mt-2">{t('contentManagement.lessonModal.theoryTab.quizTabTemporary')}</p>
            </div>
          </TabPanel>
        </div>
        
        {/* ========== SECTION 4: Validation Errors ========== */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border-[3px] border-red-300 rounded-lg animate-pulse">
            <p className="text-sm font-black text-red-900 mb-2">⚠️ Lỗi Validation:</p>
            <ul className="text-xs text-red-800 space-y-1 ml-4 list-disc">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* ========== SECTION 5: Action Buttons ========== */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-[3px] border-gray-300">
          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white rounded-lg
                     border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-black text-base uppercase tracking-wide
                     transition-all duration-200"
          >
            💾 {t('contentManagement.lessonModal.buttons.saveDraft')}
          </button>
          
          {/* Publish Button */}
          <button
            type="submit"
            disabled={isSubmitting || validationErrors.length > 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg
                     border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-black text-base uppercase tracking-wide
                     transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>{initialLesson ? t('contentManagement.lessonModal.buttons.saveAndPublish') : t('contentManagement.lessonModal.buttons.createAndPublish')}</span>
              </>
            )}
          </button>
          
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg
                     border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-black text-base uppercase tracking-wide
                     transition-all duration-200"
          >
            {hasUnsavedChanges ? t('contentManagement.lessonModal.close.cancel') : t('contentManagement.lessonModal.close.close')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EnhancedLessonModal;

