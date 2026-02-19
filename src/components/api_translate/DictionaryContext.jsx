// src/components/api_translate/DictionaryContext.jsx
// Context quản lý state tra từ điển

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  lookupWord,
  formatDictionaryResult,
  enrichWithEnglish,
  saveWord,
  getSavedWords,
  removeSavedWord,
  addToHistory,
  getHistory,
  clearHistory
} from '../../services/api_translate/dictionaryService.js';

const DictionaryContext = createContext(null);

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within DictionaryProvider');
  }
  return context;
}

export function DictionaryProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(false); // Bật/tắt chế độ tra từ
  const [isLoading, setIsLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState(null); // Từ đang tra
  const [result, setResult] = useState(null); // Kết quả tra từ
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [savedWords, setSavedWords] = useState(getSavedWords());
  const [history, setHistory] = useState(getHistory());

  // Bật/tắt chế độ tra từ
  const toggleDictionary = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (showPopup) {
      setShowPopup(false);
    }
  }, [showPopup]);

  // Tra từ
  const lookup = useCallback(async (word, x, y) => {
    if (!word || !word.trim()) return;

    setIsLoading(true);
    setCurrentWord(word);
    setPopupPosition({ x, y });
    setShowPopup(true);

    try {
      // OPTIMIZED: Check cache first to avoid CORS issues
      const cacheKey = `lookup_complete_${word.trim()}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const rawData = JSON.parse(cached);
          
          // Kiem tra cache cu cua JLPT (format cu khong co vietnamese_definitions)
          // Neu la cache cu thi xoa di de tra lai tu dau voi format moi
          if (rawData.source === 'JLPT' && rawData.senses && rawData.senses[0] 
              && !rawData.senses[0].vietnamese_definitions) {
            localStorage.removeItem(cacheKey);
            console.log(`[Dictionary] Xoa cache JLPT format cu cho: ${word}`);
            // Khong return, de tiep tuc goi lookupWord ben duoi
          } else {
            console.log(`[Dictionary] Using cached data for: ${word}`);
            
            // Format cached data
            const formattedData = await formatDictionaryResult(rawData);
            setResult(formattedData);
            
            // Luu vao lich su
            if (formattedData.success) {
              addToHistory(word);
              setHistory(getHistory());
            }
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Cache bi loi, xoa di
          localStorage.removeItem(cacheKey);
        }
      }
      
      // Goi API neu khong co cache
      const rawData = await lookupWord(word);
      
      // Format ket qua (voi JLPT se co Vietnamese ngay, English rong)
      const formattedData = await formatDictionaryResult(rawData);

      setResult(formattedData);
      setIsLoading(false);

      // Luu vao lich su
      if (formattedData.success) {
        addToHistory(word);
        setHistory(getHistory());
      }
      
      // Neu la tu JLPT (chua co English), tai nghia Anh async o background
      // Popup da hien voi nghia Viet, English se cap nhat khi san sang
      if (rawData.source === 'JLPT' && formattedData.success) {
        const vietnameseMeaning = rawData.senses?.[0]?.vietnamese_definitions?.[0] || '';
        
        // Chay background - khong block UI
        enrichWithEnglish(word, vietnameseMeaning).then(enriched => {
          if (enriched.englishDefinitions.length > 0) {
            // Cap nhat result voi nghia tieng Anh moi
            setResult(prev => {
              if (!prev || !prev.success || !prev.meanings) return prev;
              return {
                ...prev,
                meanings: prev.meanings.map((m, idx) => {
                  if (idx === 0) {
                    return {
                      ...m,
                      english: enriched.englishDefinitions.slice(0, 5),
                      // Neu co parts of speech tu Jisho, bo sung luon
                      ...(enriched.partsOfSpeech.length > 0 && m.partOfSpeech.length === 0
                        ? { partOfSpeech: enriched.partsOfSpeech }
                        : {})
                    };
                  }
                  return m;
                })
              };
            });
            console.log(`[Dictionary] Da cap nhat English cho: ${word}`);
          }
        }).catch(err => {
          console.warn(`[Dictionary] Enrichment that bai cho ${word}:`, err.message);
        });
      }
    } catch (error) {
      console.error('Lookup error:', error);
      setResult({
        success: false,
        message: 'Có lỗi xảy ra khi tra từ'
      });
      setIsLoading(false);
    }
  }, []);

  // Hiển thị popup với data đã có (từ search result)
  const showDictionaryResult = useCallback(async (rawData, word, x, y) => {
    if (!word || !word.trim()) return;

    setIsLoading(true);
    setCurrentWord(word);
    setPopupPosition({ x, y });
    setShowPopup(true);

    try {
      // Format data đã có
      const formattedData = await formatDictionaryResult(rawData);
      setResult(formattedData);

      // Lưu vào lịch sử
      if (formattedData.success) {
        addToHistory(word);
        setHistory(getHistory());
      }
    } catch (error) {
      console.error('Format dictionary result error:', error);
      setResult({
        success: false,
        message: 'Có lỗi xảy ra khi hiển thị từ điển'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Đóng popup
  const closePopup = useCallback(() => {
    setShowPopup(false);
    setCurrentWord(null);
    setResult(null);
  }, []);

  // Lưu từ
  const handleSaveWord = useCallback((wordData) => {
    const result = saveWord(wordData);
    if (result.success) {
      setSavedWords(getSavedWords());
    }
    return result;
  }, []);

  // Xóa từ đã lưu
  const handleRemoveWord = useCallback((word) => {
    const result = removeSavedWord(word);
    if (result.success) {
      setSavedWords(getSavedWords());
    }
    return result;
  }, []);

  // Xóa lịch sử
  const handleClearHistory = useCallback(() => {
    const result = clearHistory();
    if (result.success) {
      setHistory([]);
    }
    return result;
  }, []);

  // Kiểm tra từ đã được lưu chưa
  const isWordSaved = useCallback((word) => {
    return savedWords.some(w => w.word === word);
  }, [savedWords]);

  const value = {
    // State
    isEnabled,
    isLoading,
    currentWord,
    result,
    popupPosition,
    showPopup,
    savedWords,
    history,

    // Actions
    toggleDictionary,
    lookup,
    showDictionaryResult,
    closePopup,
    saveWord: handleSaveWord,
    removeWord: handleRemoveWord,
    clearHistory: handleClearHistory,
    isWordSaved
  };

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

export default DictionaryContext;
