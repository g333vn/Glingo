// src/components/api_translate/DictionaryContext.jsx
// Context quản lý state tra từ điển

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  lookupWord,
  formatDictionaryResult,
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
          console.log(`[Dictionary] Using cached data for: ${word}`);
          
          // Format cached data
          const formattedData = await formatDictionaryResult(rawData);
          setResult(formattedData);
          
          // Lưu vào lịch sử
          if (formattedData.success) {
            addToHistory(word);
            setHistory(getHistory());
          }
          setIsLoading(false);
          return;
        } catch (e) {
          // Cache corrupted, remove it
          localStorage.removeItem(cacheKey);
        }
      }
      
      // Gọi API nếu không có cache
      const rawData = await lookupWord(word);
      
      // UPDATED: formatDictionaryResult giờ là async (auto-translate)
      const formattedData = await formatDictionaryResult(rawData);

      setResult(formattedData);

      // Lưu vào lịch sử
      if (formattedData.success) {
        addToHistory(word);
        setHistory(getHistory());
      }
    } catch (error) {
      console.error('Lookup error:', error);
      setResult({
        success: false,
        message: 'Có lỗi xảy ra khi tra từ'
      });
    } finally {
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
