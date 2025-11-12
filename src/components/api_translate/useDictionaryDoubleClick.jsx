// src/components/api_translate/useDictionaryDoubleClick.jsx
// Custom hook để xử lý double-click tra từ

import { useEffect } from 'react';
import { useDictionary } from './DictionaryContext.jsx';

/**
 * Hook để bật tính năng tra từ khi double-click
 * @param {React.RefObject} containerRef - Ref của container chứa text
 */
export function useDictionaryDoubleClick(containerRef) {
  const { isEnabled, lookup } = useDictionary();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    function handleDoubleClick(event) {
      // Lấy từ được chọn
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (!selectedText) return;

      // Chỉ tra từ tiếng Nhật (có ký tự Hiragana, Katakana, hoặc Kanji)
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
      if (!japaneseRegex.test(selectedText)) {
        return; // Không phải tiếng Nhật, bỏ qua
      }

      // Lấy vị trí click
      const x = event.clientX;
      const y = event.clientY;

      // Tra từ
      lookup(selectedText, x, y);
    }

    container.addEventListener('dblclick', handleDoubleClick);

    return () => {
      container.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [containerRef, isEnabled, lookup]);
}

export default useDictionaryDoubleClick;