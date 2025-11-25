// src/components/admin/lessons/DisplayOrderConfig.jsx
// ⚡ Display Order Configuration - Drag & drop để sắp xếp thứ tự hiển thị content

import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';

/**
 * DisplayOrderConfig Component
 * Cho phép admin sắp xếp thứ tự hiển thị Video/PDF/HTML/Audio
 * 
 * @param {array} order - Current order array ['video', 'pdf', 'html', 'audio']
 * @param {object} availableContent - Which content types are available
 * @param {function} onChange - Callback when order changes
 */
function DisplayOrderConfig({ order = ['video', 'pdf', 'html', 'audio'], availableContent = {}, onChange }) {
  const { t } = useLanguage();
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  // Content type config
  const contentConfig = {
    video: {
      icon: '🎬',
      label: t('contentManagement.lessonModal.displayOrder.contentTypes.video'),
      color: 'purple',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-900'
    },
    pdf: {
      icon: '📄',
      label: t('contentManagement.lessonModal.displayOrder.contentTypes.pdf'),
      color: 'blue',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-900'
    },
    html: {
      icon: '📝',
      label: t('contentManagement.lessonModal.displayOrder.contentTypes.html'),
      color: 'green',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-400',
      textColor: 'text-green-900'
    },
    audio: {
      icon: '🎧',
      label: t('contentManagement.lessonModal.displayOrder.contentTypes.audio'),
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-400',
      textColor: 'text-indigo-900'
    }
  };
  
  /**
   * Handle drag start
   */
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };
  
  /**
   * Handle drag over
   */
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  
  /**
   * Handle drag leave
   */
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  /**
   * Handle drop
   */
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    // Reorder array
    const newOrder = [...order];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    
    // Update parent
    onChange(newOrder);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  /**
   * Handle drag end
   */
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  /**
   * Move item up
   */
  const moveUp = (index) => {
    if (index === 0) return;
    
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onChange(newOrder);
  };
  
  /**
   * Move item down
   */
  const moveDown = (index) => {
    if (index === order.length - 1) return;
    
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onChange(newOrder);
  };
  
  /**
   * Reset to default order
   */
  const resetOrder = () => {
    onChange(['video', 'pdf', 'html', 'audio']);
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <span>⚡</span>
          {t('contentManagement.lessonModal.displayOrder.title')}
        </h3>
        <button
          type="button"
          onClick={resetOrder}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded border-2 border-black font-bold text-xs
                   hover:bg-gray-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          title={t('contentManagement.lessonModal.displayOrder.resetTitle')}
        >
          {t('contentManagement.lessonModal.displayOrder.reset')}
        </button>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600">
        {t('contentManagement.lessonModal.displayOrder.description')}
      </p>
      
      {/* Draggable List */}
      <div className="space-y-2">
        {order.map((contentType, index) => {
          const config = contentConfig[contentType];
          const isAvailable = availableContent[contentType];
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          
          return (
            <div
              key={contentType}
              draggable={true}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                p-4 rounded-lg border-[3px] 
                transition-all duration-200 cursor-move
                ${config.bgColor} ${config.borderColor}
                ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                ${isDragOver ? 'ring-4 ring-yellow-400 scale-[1.02]' : ''}
                ${isAvailable ? '' : 'opacity-40'}
                hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[-2px] hover:translate-y-[-2px]
              `}
            >
              <div className="flex items-center justify-between">
                {/* Left: Order Number + Icon + Label */}
                <div className="flex items-center gap-3">
                  {/* Order Number */}
                  <div className={`
                    w-8 h-8 flex items-center justify-center rounded-full
                    border-2 border-black ${config.bgColor}
                    font-black text-sm
                  `}>
                    {index + 1}
                  </div>
                  
                  {/* Icon + Label */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <p className={`font-black text-sm ${config.textColor}`}>
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        {isAvailable ? t('contentManagement.lessonModal.displayOrder.hasContent') : t('contentManagement.lessonModal.displayOrder.noContent')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right: Move Buttons */}
                <div className="flex items-center gap-2">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move" title={t('contentManagement.lessonModal.displayOrder.dragToMove')}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                  
                  {/* Up Button */}
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="px-2 py-1 bg-white border-2 border-black rounded font-bold text-xs
                             hover:bg-yellow-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('contentManagement.lessonModal.displayOrder.moveUp')}
                  >
                    ↑
                  </button>
                  
                  {/* Down Button */}
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === order.length - 1}
                    className="px-2 py-1 bg-white border-2 border-black rounded font-bold text-xs
                             hover:bg-yellow-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('contentManagement.lessonModal.displayOrder.moveDown')}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Preview Box */}
      <div className="p-4 bg-yellow-50 border-[3px] border-yellow-300 rounded-lg">
        <p className="text-sm font-bold text-yellow-900 mb-2">
          {t('contentManagement.lessonModal.displayOrder.studentView')}
        </p>
        <ol className="text-xs text-yellow-800 space-y-1 ml-4 list-decimal">
          {order.map((type, index) => {
            const config = contentConfig[type];
            const isAvailable = availableContent[type];
            return (
              <li key={type} className={isAvailable ? 'font-bold' : 'opacity-50'}>
                {config.icon} <strong>{config.label}</strong>
                {!isAvailable && <span className="ml-2 text-xs">{t('contentManagement.lessonModal.displayOrder.willSkip')}</span>}
              </li>
            );
          })}
        </ol>
      </div>
      
      {/* Helper Text */}
      <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <p className="text-xs text-blue-800">
          {t('contentManagement.lessonModal.displayOrder.tip')}
        </p>
      </div>
    </div>
  );
}

export default DisplayOrderConfig;

