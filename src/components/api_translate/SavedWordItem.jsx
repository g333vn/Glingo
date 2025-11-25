// src/components/api_translate/SavedWordItem.jsx
// Component hiển thị từng từ đã lưu

import React from 'react';
import { useDictionary } from './DictionaryContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function SavedWordItem({ wordData }) {
  const { lookup, removeWord } = useDictionary();
  const { t } = useLanguage();

  const handleViewWord = () => {
    // Mở popup tra từ khi click vào từ
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    lookup(wordData.word, centerX, centerY);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Ngăn trigger handleViewWord
    if (window.confirm(`${t('dictionary.delete')} "${wordData.word}"?`)) {
      removeWord(wordData.word);
    }
  };

  // Format ngày lưu
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t('dictionary.justNow');
      if (diffMins < 60) return `${diffMins} ${t('dictionary.minutesAgo')}`;
      if (diffHours < 24) return `${diffHours} ${t('dictionary.hoursAgo')}`;
      if (diffDays < 7) return `${diffDays} ${t('dictionary.daysAgo')}`;
      
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Lấy preview nghĩa (1-2 nghĩa đầu)
  const getMeaningPreview = () => {
    if (!wordData.meanings || wordData.meanings.length === 0) {
      return t('dictionary.noMeaning');
    }
    
    const firstMeaning = wordData.meanings[0];
    if (firstMeaning.vietnamese && firstMeaning.vietnamese.length > 0) {
      return firstMeaning.vietnamese.slice(0, 2).join(', ');
    }
    if (firstMeaning.english && firstMeaning.english.length > 0) {
      return firstMeaning.english.slice(0, 2).join(', ');
    }
    return t('dictionary.noMeaning');
  };

  // Lấy reading
  const getReading = () => {
    if (wordData.readings && wordData.readings.length > 0) {
      return wordData.readings[0].reading;
    }
    return null;
  };

  const reading = getReading();
  const meaningPreview = getMeaningPreview();
  const savedDate = formatDate(wordData.savedAt);

  return (
    <div
      onClick={handleViewWord}
      className="bg-white border-[2px] border-black rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] group"
    >
      <div className="flex items-start justify-between gap-2">
        {/* Word Info */}
        <div className="flex-1 min-w-0">
          {/* Word + Reading */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-lg text-black uppercase">
              {wordData.word}
            </span>
            {reading && (
              <span className="text-sm bg-yellow-100 px-2 py-0.5 rounded-lg font-black border-[1px] border-black">
                【{reading}】
              </span>
            )}
          </div>

          {/* Meaning Preview */}
          <p className="text-sm text-gray-700 font-bold mb-1 line-clamp-2">
            {meaningPreview}
          </p>

          {/* Date + Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {savedDate && (
              <span className="text-xs text-gray-500 font-bold">
                {savedDate}
              </span>
            )}
            {wordData.jlpt && wordData.jlpt.length > 0 && (
              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-black uppercase border-[1px] border-black">
                {wordData.jlpt[0]}
              </span>
            )}
            {wordData.isCommon && (
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-black uppercase border-[1px] border-black">
                {t('dictionary.common')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-full bg-red-500 text-white border-[2px] border-black flex items-center justify-center hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            title={t('dictionary.delete')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavedWordItem;

