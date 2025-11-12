// src/services/api_translate/dictionaryService.js
// ENHANCED VERSION with JLPT Dictionary (8,292 từ)

import { getJLPTDictionary, lookupJLPT } from '../../data/jlptDictionary.js';

// JLPT Dictionary cache (loaded once)
let JLPT_DICT = null;
let JLPT_DICT_LOADING = false;

/**
 * Initialize JLPT Dictionary (call on app start)
 */
export async function initJLPTDictionary() {
  if (JLPT_DICT || JLPT_DICT_LOADING) return;
  
  JLPT_DICT_LOADING = true;
  try {
    console.log('[JLPT Dict] Loading...');
    JLPT_DICT = await getJLPTDictionary();
    console.log(`[JLPT Dict] Loaded ${Object.keys(JLPT_DICT).length} entries`);
  } catch (error) {
    console.error('[JLPT Dict] Load failed:', error);
    JLPT_DICT = {}; // Empty fallback
  } finally {
    JLPT_DICT_LOADING = false;
  }
}

/**
 * Dịch text từ tiếng Anh sang tiếng Việt
 * ENHANCED với JLPT Dictionary priority
 * 
 * @param {string} text - Text cần dịch (English or Japanese)
 * @returns {Promise<string>} - Text tiếng Việt
 */
export async function translateToVietnamese(text) {
  if (!text || typeof text !== 'string') return text;
  
  const cacheKey = `translate_${text.toLowerCase()}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    // ===== LEVEL 1: JLPT DICTIONARY (HIGHEST PRIORITY) =====
    // 8,292 từ JLPT với nghĩa chuẩn
    if (JLPT_DICT && JLPT_DICT[text]) {
      const result = JLPT_DICT[text].vietnamese;
      sessionStorage.setItem(cacheKey, result);
      console.log(`[Dict] JLPT hit: ${text} -> ${result}`);
      return result;
    }
    
    // ===== LEVEL 2: MANUAL DICTIONARY (FALLBACK) =====
    // 200+ từ thông dụng
    const manualTranslation = translateWithDictionary(text);
    if (manualTranslation !== text) {
      sessionStorage.setItem(cacheKey, manualTranslation);
      console.log(`[Dict] Manual hit: ${text} -> ${manualTranslation}`);
      return manualTranslation;
    }
    
    // ===== LEVEL 3: GOOGLE TRANSLATE (LAST RESORT) =====
    const googleResult = await callGoogleTranslate(text);
    sessionStorage.setItem(cacheKey, googleResult);
    console.log(`[Dict] Google: ${text} -> ${googleResult}`);
    return googleResult;
    
  } catch (error) {
    console.warn('[Translate] All methods failed:', error);
    // Fallback: try manual dict one more time
    return translateWithDictionary(text);
  }
}

/**
 * Call Google Translate API
 * @param {string} text 
 * @returns {Promise<string>}
 */
async function callGoogleTranslate(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    return text;
  } catch (error) {
    console.warn('[Google Translate] Error:', error);
    return text;
  }
}

/**
 * Dịch sử dụng dictionary mapping (fallback)
 * @param {string} englishWord - Từ tiếng Anh
 * @returns {string} - Từ tiếng Việt hoặc giữ nguyên
 */
function translateWithDictionary(englishWord) {
  // Expanded Vietnamese dictionary mapping
  const basicDict = {
    // Common words
    'opposite': 'trái ngược, đối lập',
    'reverse': 'ngược lại, đảo ngược',
    'contrary': 'trái lại, ngược lại',
    'very': 'rất, vô cùng',
    'extremely': 'cực kỳ, vô cùng',
    'beautiful': 'đẹp, xinh đẹp',
    'pretty': 'đẹp, xinh',
    'study': 'học, học tập',
    'learn': 'học, học tập',
    'exam': 'kỳ thi, bài thi',
    'examination': 'kỳ thi, sự kiểm tra',
    'test': 'bài kiểm tra, bài thi',
    'pass': 'đỗ, qua, vượt qua',
    'fail': 'trượt, thất bại',
    
    // Particles (VERY IMPORTANT!)
    'は': 'trợ từ chỉ chủ đề',
    'が': 'trợ từ chỉ chủ ngữ',
    'を': 'trợ từ chỉ tân ngữ',
    'に': 'trợ từ chỉ địa điểm/thời gian/đích',
    'で': 'trợ từ chỉ địa điểm hành động/phương tiện',
    'と': 'trợ từ nối/trích dẫn',
    'や': 'trợ từ liệt kê',
    'の': 'trợ từ sở hữu/bổ nghĩa',
    'も': 'trợ từ nhấn mạnh (cũng)',
    'か': 'trợ từ nghi vấn',
    'ね': 'trợ từ nhấn mạnh (nhỉ)',
    'よ': 'trợ từ nhấn mạnh (nhé)',
    'から': 'từ (thời gian/địa điểm)',
    'まで': 'đến (thời gian/địa điểm)',
    
    // Common verbs
    'do': 'làm',
    'make': 'làm, tạo ra',
    'go': 'đi',
    'come': 'đến',
    'see': 'thấy, xem',
    'look': 'nhìn',
    'think': 'nghĩ, suy nghĩ',
    'know': 'biết',
    'understand': 'hiểu',
    'speak': 'nói',
    'say': 'nói',
    'tell': 'kể, bảo',
    'write': 'viết',
    'read': 'đọc',
    'listen': 'nghe',
    'hear': 'nghe thấy',
    'eat': 'ăn',
    'drink': 'uống',
    
    // Grammar terms
    'noun': 'danh từ',
    'verb': 'động từ',
    'adjective': 'tính từ',
    'adverb': 'trạng từ',
    'particle': 'trợ từ',
    'conjunction': 'liên từ',
    'pronoun': 'đại từ',
  };

  const lowerCase = englishWord.toLowerCase();
  return basicDict[lowerCase] || englishWord;
}

/**
 * Dịch một mảng các từ
 * @param {Array<string>} words 
 * @returns {Promise<Array<string>>}
 */
export async function translateMultipleWords(words) {
  if (!words || !Array.isArray(words)) return [];
  
  const translations = await Promise.all(
    words.map(word => translateToVietnamese(word))
  );
  
  return translations;
}

/**
 * CORS Proxy alternatives
 */
const CORS_PROXIES = [
  '',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

/**
 * Tra cứu từ tiếng Nhật (Jisho.org API)
 * @param {string} word 
 * @returns {Promise<Object>}
 */
export async function lookupWord(word) {
  try {
    const trimmedWord = word.trim();
    if (!trimmedWord) {
      throw new Error('Từ không hợp lệ');
    }

    const apiUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(trimmedWord)}`;
    
    let lastError;
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxy = CORS_PROXIES[i];
      const requestUrl = proxy ? `${proxy}${encodeURIComponent(apiUrl)}` : apiUrl;
      
      try {
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          return {
            success: false,
            message: 'Không tìm thấy từ này trong từ điển',
            word: trimmedWord
          };
        }

        const firstResult = data.data[0];
        return {
          success: true,
          word: trimmedWord,
          japanese: firstResult.japanese || [],
          senses: firstResult.senses || [],
          isCommon: firstResult.is_common || false,
          tags: firstResult.tags || [],
          jlpt: firstResult.jlpt || [],
          raw: firstResult
        };
        
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    throw lastError || new Error('Không thể kết nối đến từ điển');    
  } catch (error) {
    console.error('[Dictionary] Lookup failed:', error);
    return {
      success: false,
      message: 'Lỗi khi tra từ. Vui lòng thử lại sau.',
      word: word,
      error: error.message
    };
  }
}

/**
 * Format kết quả tra từ với auto-translation
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export async function formatDictionaryResult(data) {
  if (!data.success) {
    return {
      success: false,
      message: data.message
    };
  }

  const readings = data.japanese.map(item => ({
    word: item.word || '',
    reading: item.reading || ''
  }));

  const meanings = data.senses.map(sense => ({
    partOfSpeech: sense.parts_of_speech || [],
    english: sense.english_definitions || [],
    tags: sense.tags || [],
    info: sense.info || []
  }));

  // Auto-translate to Vietnamese
  const vietnameseMeanings = await Promise.all(
    meanings.map(async (meaning) => {
      const vietnamese = await Promise.all(
        meaning.english.map(eng => translateToVietnamese(eng))
      );
      
      const vietnamesePartOfSpeech = await Promise.all(
        meaning.partOfSpeech.map(pos => translatePartOfSpeech(pos))
      );
      
      return {
        ...meaning,
        vietnamese,
        vietnamesePartOfSpeech
      };
    })
  );

  return {
    success: true,
    word: data.word,
    readings,
    meanings: vietnameseMeanings,
    isCommon: data.isCommon,
    jlpt: data.jlpt,
    tags: data.tags
  };
}

/**
 * Dịch từ loại sang tiếng Việt
 * @param {string} partOfSpeech 
 * @returns {Promise<string>}
 */
async function translatePartOfSpeech(partOfSpeech) {
  const posDict = {
    'Noun': 'Danh từ',
    'Verb': 'Động từ',
    'Adjective': 'Tính từ',
    'Adverb': 'Trạng từ',
    'Particle': 'Trợ từ',
    'Conjunction': 'Liên từ',
    'Pronoun': 'Đại từ',
    'Interjection': 'Thán từ',
    'Prefix': 'Tiền tố',
    'Suffix': 'Hậu tố',
    'Counter': 'Số đếm',
    'Suru verb': 'Động từ Suru',
    'Godan verb': 'Động từ Godan',
    'Ichidan verb': 'Động từ Ichidan',
    'I-adjective': 'Tính từ đuôi い',
    'Na-adjective': 'Tính từ đuôi な',
    'No-adjective': 'Tính từ đuôi の',
    'Auxiliary': 'Trợ động từ',
    'Expression': 'Thành ngữ',
    'Numeric': 'Số',
  };
  
  return posDict[partOfSpeech] || partOfSpeech;
}

// Storage functions (unchanged)
export function saveWord(wordData) {
  try {
    const savedWords = getSavedWords();
    const isDuplicate = savedWords.some(w => w.word === wordData.word);
    if (isDuplicate) {
      return { success: false, message: 'Từ này đã được lưu' };
    }

    const wordWithTimestamp = {
      ...wordData,
      savedAt: new Date().toISOString()
    };

    savedWords.unshift(wordWithTimestamp);
    if (savedWords.length > 100) {
      savedWords.pop();
    }

    localStorage.setItem('dictionary_saved_words', JSON.stringify(savedWords));
    return { success: true, message: 'Đã lưu từ' };
  } catch (error) {
    console.error('Error saving word:', error);
    return { success: false, message: 'Lỗi khi lưu từ' };
  }
}

export function getSavedWords() {
  try {
    const saved = localStorage.getItem('dictionary_saved_words');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error getting saved words:', error);
    return [];
  }
}

export function removeSavedWord(word) {
  try {
    const savedWords = getSavedWords();
    const filtered = savedWords.filter(w => w.word !== word);
    localStorage.setItem('dictionary_saved_words', JSON.stringify(filtered));
    return { success: true, message: 'Đã xóa từ' };
  } catch (error) {
    console.error('Error removing word:', error);
    return { success: false, message: 'Lỗi khi xóa từ' };
  }
}

export function addToHistory(word) {
  try {
    const history = getHistory();
    const filtered = history.filter(w => w !== word);
    filtered.unshift(word);

    if (filtered.length > 50) {
      filtered.pop();
    }

    localStorage.setItem('dictionary_history', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

export function getHistory() {
  try {
    const history = localStorage.getItem('dictionary_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem('dictionary_history');
    return { success: true, message: 'Đã xóa lịch sử' };
  } catch (error) {
    console.error('Error clearing history:', error);
    return { success: false, message: 'Lỗi khi xóa lịch sử' };
  }
}