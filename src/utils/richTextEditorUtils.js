// src/utils/richTextEditorUtils.js
// Shared utilities for rich text editing (used by Quiz Editor and Exam Management)

/**
 * Process pasted HTML - clean up, convert formatting, support furigana
 * @param {string} html - HTML string from clipboard
 * @returns {string} - Cleaned HTML string
 */
export const processPastedHTML = (html) => {
  if (!html || !html.trim()) return '';
  
  // Create temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
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
  
  // Convert <p> to preserve line breaks
  tempDiv.querySelectorAll('p').forEach(el => {
    if (el.textContent.trim()) {
      el.outerHTML = el.innerHTML + '<br/>';
    } else {
      el.remove();
    }
  });
  
  // Convert <div> to <br/> if it's a line break
  tempDiv.querySelectorAll('div').forEach(el => {
    if (el.textContent.trim() && !el.querySelector('p, div, h1, h2, h3, h4, h5, h6')) {
      el.outerHTML = el.innerHTML + '<br/>';
    }
  });
  
  // Remove empty tags
  tempDiv.querySelectorAll('*').forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('img, br')) {
      el.remove();
    }
  });
  
  // Detect furigana pattern: 渋谷(しぶや) → <ruby>渋谷<rt>しぶや</rt></ruby>
  let processed = tempDiv.innerHTML;
  const furiganaPattern = /([\u4E00-\u9FAF]+)\(([\u3040-\u309F\u30A0-\u30FF]+)\)/g;
  processed = processed.replace(furiganaPattern, '<ruby>$1<rt>$2</rt></ruby>');
  
  return processed;
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
  
  // Case 1: Already a number (0, 1, 2, 3) - CHECK FIRST
  if (typeof q?.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4) {
    correctAnswer = q.correctAnswer;
  }
  // Case 2: Number as string ("0", "1", "2", "3") - CHECK BEFORE LETTER STRINGS
  else if (typeof q?.correctAnswer === 'string' && /^[0-3]$/.test(q.correctAnswer)) {
    correctAnswer = parseInt(q.correctAnswer, 10);
  }
  // Case 3: String letter (A, B, C, D) - CHECK OTHER STRING FIELDS
  else if (typeof q?.correct === 'string' || typeof q?.correctAnswer === 'string' || typeof q?.answer === 'string') {
    const correctStr = (q?.correct || q?.correctAnswer || q?.answer || 'A').toUpperCase();
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

