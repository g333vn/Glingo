// src/components/ContentEditable.jsx
// ContentEditable component để thay thế textarea - hiển thị format HTML trực tiếp

import React, { useRef, useEffect, useCallback } from 'react';

/**
 * ContentEditable component - Hiển thị và chỉnh sửa HTML với format trực tiếp
 * @param {string} value - HTML content
 * @param {Function} onChange - Callback khi content thay đổi
 * @param {Function} onPaste - Callback khi paste (optional, để xử lý custom paste)
 * @param {string} placeholder - Placeholder text
 * @param {string} className - CSS classes
 * @param {Object} style - Inline styles
 * @param {number} minHeight - Minimum height
 */
const ContentEditable = ({
  value = '',
  onChange,
  onPaste,
  placeholder = '',
  className = '',
  style = {},
  minHeight = 100,
  field = 'explanation',
  questionIndex = null // NEW: For toolbar functions to find this element
}) => {
  const contentRef = useRef(null);
  const isComposingRef = useRef(false);

  // Sync value với contentEditable
  useEffect(() => {
    if (contentRef.current && !isComposingRef.current) {
      const currentContent = contentRef.current.innerHTML;
      // Chỉ update nếu khác nhau (tránh loop)
      if (currentContent !== value) {
        contentRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Handle input change
  const handleInput = useCallback((e) => {
    if (isComposingRef.current) return;
    
    const newValue = e.target.innerHTML || '';
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Handle paste - xử lý HTML từ clipboard
  const handlePaste = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const items = e.clipboardData.items;
      let hasImage = false;
      let imageFile = null;
      
      // Check for images first
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          hasImage = true;
          imageFile = items[i].getAsFile();
          break;
        }
      }
      
      // Get HTML and text from clipboard
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      
      // FIX: Nếu có custom paste handler, dùng nó
      if (onPaste) {
        try {
          const result = await onPaste(e, imageFile, html, text);
          
          if (result === false) {
            // onPaste đã xử lý hoàn toàn (ví dụ: upload image và update state)
            return;
          }
          
          if (result && typeof result === 'string') {
            // onPaste trả về processed HTML, insert vào cursor
            insertHTMLAtCursor(result);
            // Trigger onChange
            setTimeout(() => {
              if (contentRef.current) {
                handleInput({ target: contentRef.current });
              }
            }, 0);
            return;
          }
        } catch (error) {
          console.error('[ContentEditable] Error in onPaste handler:', error);
          // Fall through to default behavior
        }
      }
      
      // FIX: Default paste behavior - luôn có fallback
      if (hasImage && imageFile) {
        // Image paste - nếu không có handler, insert img tag
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgTag = `<img src="${event.target.result}" alt="Pasted image" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
          insertHTMLAtCursor(imgTag);
          setTimeout(() => {
            if (contentRef.current) {
              handleInput({ target: contentRef.current });
            }
          }, 0);
        };
        reader.onerror = () => {
          console.error('[ContentEditable] Error reading image file');
          // Fallback to text if image fails
          if (text) {
            insertTextAtCursor(text);
            setTimeout(() => {
              if (contentRef.current) {
                handleInput({ target: contentRef.current });
              }
            }, 0);
          }
        };
        reader.readAsDataURL(imageFile);
        } else if (html && html.trim()) {
          // HTML paste - process và insert
          try {
            // Try to process HTML first (if processPastedHTML is available)
            const { processPastedHTML } = await import('../utils/richTextEditorUtils.js');
            const processed = processPastedHTML(html, text);
            insertHTMLAtCursor(processed);
          } catch (error) {
            // Fallback: insert HTML trực tiếp (browser sẽ clean)
            console.warn('[ContentEditable] Could not process HTML, using raw HTML:', error);
            insertHTMLAtCursor(html);
          }
        setTimeout(() => {
          if (contentRef.current) {
            handleInput({ target: contentRef.current });
          }
        }, 0);
      } else if (text) {
        // Plain text fallback - convert newlines to <br/>
        const processedText = text.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\r/g, '<br/>');
        if (processedText !== text) {
          // Has newlines, insert as HTML
          insertHTMLAtCursor(processedText);
        } else {
          // No newlines, insert as plain text
          insertTextAtCursor(text);
        }
        setTimeout(() => {
          if (contentRef.current) {
            handleInput({ target: contentRef.current });
          }
        }, 0);
      } else {
        // FIX: Nếu không có gì cả, vẫn cho phép browser paste mặc định
        console.warn('[ContentEditable] No content to paste from clipboard');
      }
    } catch (error) {
      console.error('[ContentEditable] Error handling paste:', error);
      // FIX: Nếu có lỗi, vẫn cố gắng paste text nếu có
      try {
        const text = e.clipboardData.getData('text/plain');
        if (text) {
          insertTextAtCursor(text);
          setTimeout(() => {
            if (contentRef.current) {
              handleInput({ target: contentRef.current });
            }
          }, 0);
        }
      } catch (fallbackError) {
        console.error('[ContentEditable] Fallback paste also failed:', fallbackError);
      }
    }
  }, [onPaste, handleInput]);

  // Insert HTML at cursor position
  const insertHTMLAtCursor = (html) => {
    if (!contentRef.current) return;
    
    const selection = window.getSelection();
    let range;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // FIX: Nếu không có selection, tạo range ở cuối content
      range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false); // Collapse to end
    }
    
    // FIX: Đảm bảo range nằm trong contentRef
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
    }
    
    range.deleteContents();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    
    range.insertNode(fragment);
    
    // Move cursor to end of inserted content
    range.setStartAfter(fragment.lastChild || range.startContainer);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // FIX: Focus vào contentEditable để đảm bảo cursor visible
    contentRef.current.focus();
  };

  // Insert text at cursor position
  const insertTextAtCursor = (text) => {
    if (!contentRef.current) return;
    
    const selection = window.getSelection();
    let range;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // FIX: Nếu không có selection, tạo range ở cuối content
      range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false); // Collapse to end
    }
    
    // FIX: Đảm bảo range nằm trong contentRef
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
    }
    
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // FIX: Focus vào contentEditable để đảm bảo cursor visible
    contentRef.current.focus();
  };

  // Handle composition (IME input for Japanese/Chinese)
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // Trigger onChange after composition ends
    if (contentRef.current) {
      handleInput({ target: contentRef.current });
    }
  };

  // Show placeholder when empty
  const isEmpty = !value || value.trim() === '' || value === '<br>' || value === '<br/>';

  // FIX: Ensure ContentEditable is focusable and can receive paste events
  useEffect(() => {
    if (contentRef.current) {
      // Ensure contentEditable is enabled
      contentRef.current.contentEditable = 'true';
      // Add tabIndex to ensure it's focusable
      if (!contentRef.current.hasAttribute('tabindex')) {
        contentRef.current.setAttribute('tabindex', '0');
      }
    }
  }, []);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        contentEditable="true"
        onInput={handleInput}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={(e) => {
          // FIX: Ensure cursor is visible when focused
          if (contentRef.current && !contentRef.current.textContent.trim()) {
            // If empty, set cursor position
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(contentRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }}
        data-placeholder={placeholder}
        data-field={field}
        data-question-index={questionIndex !== null ? questionIndex : undefined}
        className={className}
        tabIndex={0}
        style={{
          minHeight: `${minHeight}px`,
          whiteSpace: 'pre-wrap', // FIX: Preserve whitespace and line breaks
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          ...style,
          ...(isEmpty && placeholder ? {
            position: 'relative'
          } : {})
        }}
        suppressContentEditableWarning={true}
      />
      {isEmpty && placeholder && (
        <div
          className="absolute top-0 left-0 pointer-events-none text-gray-400"
          style={{
            padding: style.padding || '0.5rem 1rem',
            top: 0,
            left: 0
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default ContentEditable;

