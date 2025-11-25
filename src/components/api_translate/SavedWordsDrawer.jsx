// src/components/api_translate/SavedWordsDrawer.jsx
// Drawer hiển thị danh sách từ đã lưu

import React, { useState, useMemo } from 'react';
import { useDictionary } from './DictionaryContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import SavedWordItem from './SavedWordItem.jsx';

function SavedWordsDrawer({ isOpen, onClose }) {
  const { savedWords } = useDictionary();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter từ đã lưu theo search query
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) {
      return savedWords;
    }

    const query = searchQuery.toLowerCase();
    return savedWords.filter(wordData => {
      const word = (wordData.word || '').toLowerCase();
      const reading = wordData.readings?.[0]?.reading?.toLowerCase() || '';
      
      // Search trong nghĩa
      const meanings = wordData.meanings || [];
      const hasMatchingMeaning = meanings.some(meaning => {
        const vietnamese = (meaning.vietnamese || []).join(' ').toLowerCase();
        const english = (meaning.english || []).join(' ').toLowerCase();
        return vietnamese.includes(query) || english.includes(query);
      });

      return word.includes(query) || reading.includes(query) || hasMatchingMeaning;
    });
  }, [savedWords, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[70]"
        onClick={onClose}
      />

      {/* Drawer - NEO BRUTALISM - Higher z-index to be above dictionary button */}
      <div className="fixed top-28 right-4 bottom-6 w-[90vw] sm:w-[400px] md:top-32 lg:top-36 md:bottom-8 lg:bottom-10 bg-white border-l-[4px] border-[4px] rounded-lg border-black shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] z-[100] flex flex-col">
        {/* Header */}
        <div className="bg-yellow-400 text-black px-4 py-3 border-b-[4px] border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black border-[2px] border-black flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-wide">
                {t('dictionary.savedWords')}
              </h3>
              <p className="text-xs font-black">
                {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black text-yellow-400 hover:bg-gray-800 border-[2px] border-black flex items-center justify-center transition-all duration-200 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            title={t('dictionary.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        {savedWords.length > 0 && (
          <div className="p-4 border-b-[2px] border-black">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('dictionary.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border-[2px] border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-600 font-bold mt-2">
                {t('search.found')} {filteredWords.length} {filteredWords.length === 1 ? t('dictionary.word') : t('dictionary.words')}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {savedWords.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-100 border-[4px] border-black flex items-center justify-center mb-4">
                <span className="text-4xl">📖</span>
              </div>
              <h4 className="font-black text-lg uppercase mb-2 text-black">
                {t('dictionary.noSavedWords')}
              </h4>
              <p className="text-sm text-gray-600 font-bold max-w-xs">
                {t('dictionary.startSaving')} <span className="text-yellow-500 font-black">⭐ {t('dictionary.save')}</span> {t('dictionary.inPopup')}
              </p>
            </div>
          ) : filteredWords.length === 0 ? (
            // No Results
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-[4px] border-black flex items-center justify-center mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h4 className="font-black text-lg uppercase mb-2 text-black">
                {t('dictionary.noResults')}
              </h4>
              <p className="text-sm text-gray-600 font-bold">
                {t('search.tryOther')}
              </p>
            </div>
          ) : (
            // Word List
            <div>
              {filteredWords.map((wordData, index) => (
                <SavedWordItem key={`${wordData.word}-${index}`} wordData={wordData} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedWords.length > 0 && (
          <div className="bg-yellow-400 text-black px-4 py-2 border-t-[4px] border-black">
            <p className="text-xs font-black uppercase text-center">
              {t('dictionary.clickToView')}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default SavedWordsDrawer;

