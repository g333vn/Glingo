// src/components/admin/lessons/ContentTypeSelector.jsx
// Content Type Selector - Dropdown để chọn loại nội dung bài học

import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import { CONTENT_TYPES, CONTENT_TYPE_CONFIG } from '../../../types/lessonTypes.js';

/**
 * ContentTypeSelector Component
 * 
 * @param {string} value - Current selected content type
 * @param {function} onChange - Callback khi thay đổi
 * @param {boolean} disabled - Disable selector
 */
function ContentTypeSelector({ value, onChange, disabled = false }) {
  const { t } = useLanguage();
  const selectedConfig = CONTENT_TYPE_CONFIG[value] || CONTENT_TYPE_CONFIG[CONTENT_TYPES.GRAMMAR];
  
  // Helper function to get translated label
  const getTranslatedLabel = (contentType) => {
    const translationKey = `contentManagement.lessonModal.contentTypes.${contentType}.label`;
    const translated = t(translationKey);
    // Fallback to original label if translation not found
    return translated !== translationKey ? translated : CONTENT_TYPE_CONFIG[contentType]?.label || '';
  };
  
  // Helper function to get translated description
  const getTranslatedDescription = (contentType) => {
    const translationKey = `contentManagement.lessonModal.contentTypes.${contentType}.description`;
    const translated = t(translationKey);
    // Fallback to original description if translation not found
    return translated !== translationKey ? translated : CONTENT_TYPE_CONFIG[contentType]?.description || '';
  };
  
  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700">
        {t('contentManagement.lessonModal.contentType')}
      </label>
      
      {/* Dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 
          border-[3px] border-black rounded-lg
          bg-white
          font-bold text-base
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer'
          }
          focus:outline-none focus:ring-4 focus:ring-yellow-400
        `}
      >
        {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
          <option key={key} value={key}>
            {config.icon} {getTranslatedLabel(key)}
          </option>
        ))}
      </select>
      
      {/* Description Box */}
      <div className={`
        p-3 rounded-lg border-2 border-black
        bg-gradient-to-br ${getColorClasses(selectedConfig.color)}
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
      `}>
        <p className="text-sm font-bold text-gray-800 mb-1">
          {selectedConfig.icon} {getTranslatedLabel(value)}
        </p>
        <p className="text-xs text-gray-700">
          {getTranslatedDescription(value)}
        </p>
        
        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedConfig.enableTheory && (
            <span className="px-2 py-1 text-xs font-black bg-blue-400 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {t('contentManagement.lessonModal.theory')}
            </span>
          )}
          {selectedConfig.enableSRS && (
            <span className="px-2 py-1 text-xs font-black bg-purple-400 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {t('contentManagement.lessonModal.flashcardSRS')}
            </span>
          )}
          {selectedConfig.enableQuiz && (
            <span className="px-2 py-1 text-xs font-black bg-green-400 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {t('contentManagement.lessonModal.quiz')}
            </span>
          )}
          {selectedConfig.enableWriting && (
            <span className="px-2 py-1 text-xs font-black bg-red-400 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {t('contentManagement.lessonModal.writing')}
            </span>
          )}
          {selectedConfig.enableAudio && (
            <span className="px-2 py-1 text-xs font-black bg-indigo-400 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {t('contentManagement.lessonModal.audio')}
            </span>
          )}
        </div>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-gray-500 italic">
        {t('contentManagement.lessonModal.contentTypeHint')}
      </p>
    </div>
  );
}

/**
 * Helper: Get Tailwind color classes based on color name
 */
function getColorClasses(colorName) {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100',
    purple: 'from-purple-50 to-purple-100',
    red: 'from-red-50 to-red-100',
    green: 'from-green-50 to-green-100',
    teal: 'from-teal-50 to-teal-100',
    indigo: 'from-indigo-50 to-indigo-100',
    yellow: 'from-yellow-50 to-yellow-100'
  };
  
  return colorMap[colorName] || colorMap.blue;
}

export default ContentTypeSelector;

