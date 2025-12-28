// src/utils/richTextEditorUtils.js
// Shared utilities for rich text editing (used by Quiz Editor and Exam Management)

/**
 * Process pasted HTML - clean up, convert formatting, support furigana
 * ✅ IMPROVED: Better handling of Word/Google Docs formats
 * @param {string} html - HTML string from clipboard
 * @returns {string} - Cleaned HTML string
 */
export const processPastedHTML = (html, plainText = null) => {
  if (!html || !html.trim()) {
    // ✅ NEW: If no HTML, try to process plain text with newlines
    if (plainText) {
      return processPlainTextWithNewlines(plainText);
    }
    return '';
  }
  
  // ✅ DEBUG: Log original HTML to understand format (can remove in production)
  // console.log('[processPastedHTML] Original HTML:', html.substring(0, 500));
  
  // Create temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // ✅ IMPROVED: Remove all inline styles (Word/Google Docs add many)
  // But preserve structure - don't remove style attribute until after processing
  tempDiv.querySelectorAll('*').forEach(el => {
    // Store original style for processing if needed
    const originalStyle = el.getAttribute('style') || '';
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('id');
    // Store original style in data attribute temporarily if needed for processing
    if (originalStyle) {
      el.setAttribute('data-original-style', originalStyle);
    }
  });
  
  // Convert <b> to <strong>
  tempDiv.querySelectorAll('b').forEach(el => {
    const strong = document.createElement('strong');
    strong.innerHTML = el.innerHTML;
    el.replaceWith(strong);
  });
  
  // Convert <i> to <em>
  tempDiv.querySelectorAll('i').forEach(el => {
    const em = document.createElement('em');
    em.innerHTML = el.innerHTML;
    el.replaceWith(em);
  });
  
  // ✅ IMPROVED: Handle <span> with font-weight:bold → <strong>
  tempDiv.querySelectorAll('span').forEach(el => {
    const style = el.getAttribute('style') || '';
    if (style.includes('font-weight') && (style.includes('bold') || style.includes('700'))) {
      const strong = document.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.replaceWith(strong);
    } else if (style.includes('font-style') && style.includes('italic')) {
      const em = document.createElement('em');
      em.innerHTML = el.innerHTML;
      el.replaceWith(em);
    } else {
      // Just unwrap span, keep content
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    }
  });
  
  // ✅ IMPROVED: Convert <p> to preserve line breaks (handle empty paragraphs)
  // Process in reverse order to avoid issues with live NodeList
  const paragraphs = Array.from(tempDiv.querySelectorAll('p'));
  paragraphs.reverse().forEach((el) => {
    const text = el.textContent.trim();
    
    if (text) {
      // Replace <p> with its content + <br/> AFTER content
      // Move all children out first
      const fragment = document.createDocumentFragment();
      while (el.firstChild) {
        fragment.appendChild(el.firstChild);
      }
      // Insert content first
      el.parentNode.insertBefore(fragment, el);
      // Then insert <br/> after content (always add <br/> to preserve line breaks)
      const br = document.createElement('br');
      el.parentNode.insertBefore(br, el);
      el.remove();
    } else {
      // Empty paragraph = line break (always add <br/>)
      const br = document.createElement('br');
      el.replaceWith(br);
    }
  });
  
  // ✅ IMPROVED: Convert <div> to <br/> if it's a line break (better detection)
  // Process in reverse order to avoid issues with live NodeList
  const divs = Array.from(tempDiv.querySelectorAll('div'));
  divs.reverse().forEach((el) => {
    const hasBlockChildren = el.querySelector('p, div, h1, h2, h3, h4, h5, h6, ul, ol, table');
    const text = el.textContent.trim();
    
    if (text && !hasBlockChildren) {
      // Simple div = line break - insert content then <br/>
      const fragment = document.createDocumentFragment();
      while (el.firstChild) {
        fragment.appendChild(el.firstChild);
      }
      el.parentNode.insertBefore(fragment, el);
      // Add <br/> after content (always add <br/> to preserve line breaks)
      const br = document.createElement('br');
      el.parentNode.insertBefore(br, el);
      el.remove();
    } else if (!text && !hasBlockChildren) {
      // Empty div = line break (always add <br/>)
      const br = document.createElement('br');
      el.replaceWith(br);
    }
  });
  
  // ✅ IMPROVED: Handle line breaks from Word (often uses <o:p></o:p> or <br style="...">)
  tempDiv.querySelectorAll('br').forEach(br => {
    br.removeAttribute('style');
    br.removeAttribute('class');
  });
  
  // Remove Microsoft Office specific tags
  tempDiv.querySelectorAll('o\\:p, o\\:br, mso\\:*, w\\:*').forEach(el => el.remove());
  
  // Remove empty tags (but keep <br> and <img>)
  tempDiv.querySelectorAll('*').forEach(el => {
    if (el.tagName === 'BR' || el.tagName === 'IMG') return;
    if (!el.textContent.trim() && !el.querySelector('img, br')) {
      // Unwrap empty tags
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    }
  });
  
  // ✅ IMPROVED: Normalize whitespace (Word adds many &nbsp;)
  let processed = tempDiv.innerHTML;
  
  // ✅ FIX: Preserve line breaks - convert newlines between tags to spaces, but keep <br/> tags
  // First, protect <br/> tags by temporarily replacing them
  processed = processed.replace(/<br\s*\/?>/gi, '___BR_TAG___');
  
  // Replace multiple consecutive whitespace (spaces, tabs, newlines) with single space
  // But preserve the structure
  processed = processed.replace(/[\r\n\t]+/g, ' '); // Replace newlines/tabs with space
  processed = processed.replace(/[ \t]+/g, ' '); // Replace multiple spaces with single space
  
  // Restore <br/> tags
  processed = processed.replace(/___BR_TAG___/g, '<br/>');
  
  // Replace multiple consecutive <br/> with max 2 (for paragraph spacing)
  processed = processed.replace(/(<br\s*\/?>){3,}/gi, '<br/><br/>');
  
  // Replace &nbsp; with regular spaces (except in pre/code)
  processed = processed.replace(/&nbsp;/g, ' ');
  
  // Detect furigana pattern: 渋谷(しぶや) → <ruby>渋谷<rt>しぶや</rt></ruby>
  const furiganaPattern = /([\u4E00-\u9FAF]+)\(([\u3040-\u309F\u30A0-\u30FF]+)\)/g;
  processed = processed.replace(furiganaPattern, '<ruby>$1<rt>$2</rt></ruby>');
  
  // ✅ FIX: Don't remove all whitespace - only clean up excessive spaces between text
  // But preserve structure around tags
  processed = processed.replace(/>\s+</g, '><'); // Remove whitespace between tags
  processed = processed.replace(/>\s+/g, '>'); // Remove whitespace after opening tag
  processed = processed.replace(/\s+</g, '<'); // Remove whitespace before closing tag
  
  // Clean up leading/trailing whitespace
  processed = processed.trim();
  
  return processed;
};

/**
 * Process plain text with newlines - convert \n to <br/>
 * @param {string} text - Plain text string
 * @returns {string} - HTML string with <br/> tags
 */
const processPlainTextWithNewlines = (text) => {
  if (!text) return '';
  
  // Escape HTML first
  const div = document.createElement('div');
  div.textContent = text;
  let escaped = div.innerHTML;
  
  // Convert newlines to <br/>
  escaped = escaped.replace(/\r\n/g, '<br/>'); // Windows
  escaped = escaped.replace(/\n/g, '<br/>');   // Unix/Mac
  escaped = escaped.replace(/\r/g, '<br/>');     // Old Mac
  
  // Clean up multiple consecutive <br/> (max 2)
  escaped = escaped.replace(/(<br\s*\/?>){3,}/gi, '<br/><br/>');
  
  return escaped;
};

/**
 * Insert text at cursor position in textarea
 * @param {HTMLTextAreaElement} textarea - Textarea element
 * @param {string} beforeText - Text to insert before selection
 * @param {string} afterText - Text to insert after selection
 * @param {Function} updateValue - Function to update the value
 */
export const insertTextAtCursor = (textarea, beforeText, afterText, updateValue) => {
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentValue = textarea.value;
  const selectedText = currentValue.substring(start, end);
  
  const newValue = 
    currentValue.substring(0, start) + 
    beforeText + selectedText + afterText + 
    currentValue.substring(end);
  
  updateValue(newValue);
  
  // Restore cursor position
  setTimeout(() => {
    textarea.focus();
    const newPos = start + beforeText.length + selectedText.length + afterText.length;
    textarea.setSelectionRange(newPos, newPos);
  }, 0);
};

/**
 * Auto-resize textarea to fit content
 * @param {HTMLTextAreaElement} textarea - Textarea element
 */
export const autoResizeTextarea = (textarea) => {
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
};

/**
 * Check for duplicate question text
 * @param {string} questionText - Question text to check
 * @param {Array} existingQuestions - Array of existing questions
 * @param {number} currentIndex - Current question index (to exclude from check)
 * @returns {boolean} - True if duplicate found
 */
export const checkDuplicateQuestion = (questionText, existingQuestions = [], currentIndex = -1) => {
  if (!questionText || !existingQuestions || existingQuestions.length === 0) return false;
  
  const normalizedText = questionText.toLowerCase().trim();
  return existingQuestions.some((q, idx) => {
    if (idx === currentIndex) return false;
    const existingText = q.question || q.text || '';
    return existingText.toLowerCase().trim() === normalizedText;
  });
};

/**
 * Normalize options to standard format (4 choices A-D)
 * @param {Array} options - Options array (can be various formats)
 * @returns {Array} - Normalized options array
 */
export const normalizeOptions = (options = []) => {
  const defaultLabels = ['A', 'B', 'C', 'D'];
  const safeOptions = Array.isArray(options) ? options : [];

  const normalized = safeOptions.map((opt, idx) => {
    const label = opt?.label || defaultLabels[idx] || `Option ${idx + 1}`;
    const text =
      typeof opt === 'string'
        ? opt
        : opt?.text || opt?.value || opt?.answer || '';
    return { label, text };
  });

  // Pad to 4 options for compatibility
  while (normalized.length < 4) {
    const idx = normalized.length;
    normalized.push({ label: defaultLabels[idx] || `Option ${idx + 1}`, text: '' });
  }

  // Ensure only 4 options are kept
  return normalized.slice(0, 4);
};

/**
 * Extract questions from various JSON formats
 * @param {Object|Array} data - JSON data (can be various formats)
 * @returns {Array} - Array of questions
 */
export const extractQuestionsFromJSON = (data) => {
  if (!data) return [];
  
  // Array format: [{...}]
  if (Array.isArray(data)) {
    return data;
  }
  
  // { questions: [...] }
  if (Array.isArray(data.questions)) {
    return data.questions;
  }
  
  // { items: [...] }
  if (Array.isArray(data.items)) {
    return data.items;
  }
  
  // { quiz: { questions: [...] } }
  if (data.quiz && Array.isArray(data.quiz.questions)) {
    return data.quiz.questions;
  }
  
  // { data: { questions: [...] } }
  if (data.data && Array.isArray(data.data.questions)) {
    return data.data.questions;
  }
  
  return [];
};

/**
 * Normalize imported question to standard format
 * @param {Object} q - Question object from import
 * @param {number} idx - Index for default ID
 * @returns {Object} - Normalized question
 */
export const normalizeImportedQuestion = (q, idx = 0) => {
  const options = normalizeOptions(q?.options || q?.answers || []);
  const defaultCorrect = 0; // Default to index 0 (A)
  
  // ✅ FIX: Handle correctAnswer in multiple formats - FIXED ORDER
  let correctAnswer = defaultCorrect;
  
  // Case 1: Already a number - CHECK FIRST
  // Support both 0-based (0, 1, 2, 3) and 1-based (1, 2, 3, 4)
  // ✅ FIX: Check 1-based FIRST (most common in JSON), then 0-based
  if (typeof q?.correctAnswer === 'number') {
    if (q.correctAnswer >= 1 && q.correctAnswer <= 4) {
      // 1-based index (1, 2, 3, 4) - convert to 0-based (0, 1, 2, 3)
      correctAnswer = q.correctAnswer - 1;
    } else if (q.correctAnswer >= 0 && q.correctAnswer < 4) {
      // 0-based index (0, 1, 2, 3) - use as is
      correctAnswer = q.correctAnswer;
    }
  }
  // Case 2: Number as string - Support both 0-based and 1-based
  // ✅ FIX: Check 1-based FIRST (most common in JSON), then 0-based
  else if (typeof q?.correctAnswer === 'string') {
    const numValue = parseInt(q.correctAnswer, 10);
    if (!isNaN(numValue)) {
      if (numValue >= 1 && numValue <= 4) {
        // 1-based index (1, 2, 3, 4) - convert to 0-based (0, 1, 2, 3)
        correctAnswer = numValue - 1;
      } else if (numValue >= 0 && numValue < 4) {
        // 0-based index (0, 1, 2, 3) - use as is
        correctAnswer = numValue;
      }
    } else {
      // Not a number, try as letter (A, B, C, D)
      const correctStr = q.correctAnswer.toUpperCase();
      const letterIndex = ['A', 'B', 'C', 'D'].indexOf(correctStr);
      if (letterIndex >= 0) {
        correctAnswer = letterIndex;
      }
    }
  }
  // Case 3: String letter (A, B, C, D) - CHECK OTHER STRING FIELDS
  else if (typeof q?.correct === 'string' || typeof q?.answer === 'string') {
    const correctStr = (q?.correct || q?.answer || 'A').toUpperCase();
    const letterIndex = ['A', 'B', 'C', 'D'].indexOf(correctStr);
    if (letterIndex >= 0) {
      correctAnswer = letterIndex;
    }
  }
  
  // ✅ DEBUG: Log normalization for troubleshooting
  if (idx < 3) {
    console.log(`🔍 [Normalize Q${idx + 1}] Original:`, q?.correctAnswer, `Type:`, typeof q?.correctAnswer, `→ Normalized:`, correctAnswer);
  }

  // Convert \n to <br/> in explanation for proper display
  let explanation = q?.explanation || q?.explain || '';
  if (explanation && typeof explanation === 'string') {
    explanation = explanation.replace(/\n/g, '<br/>');
    explanation = explanation.replace(/\\n/g, '<br/>');
  }

  // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự

  return {
    id: q?.id || String(idx + 1),
    question: q?.text || q?.question || '',
    options: options.map(opt => opt.text || ''),
    correctAnswer: correctAnswer, // ✅ Now properly normalized to index (0-3)
    explanation: explanation,
    // ❌ REMOVED: Timing fields - audio chạy liên tục, thí sinh tự nghe và trả lời theo thứ tự
    // ✅ Keep audio fields for backward compatibility (will be migrated to section in ExamManagementPage)
    audioUrl: q?.audioUrl || '',
    audioPath: q?.audioPath || '',
    audioName: q?.audioName || ''
  };
};

