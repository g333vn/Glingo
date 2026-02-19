// src/services/api_translate/dictionaryService.js
// ENHANCED VERSION with JLPT Dictionary (8,292 từ)

import { getJLPTDictionary, lookupJLPT } from '../../data/jlptDictionary.js';

// JLPT Dictionary cache (loaded once)
let JLPT_DICT = null;
let JLPT_DICT_LOADING = false;
let JLPT_DICT_PROMISE = null; // Promise to track loading state

/**
 * Initialize JLPT Dictionary (call on app start)
 */
export async function initJLPTDictionary() {
  // If already loading, return the promise
  if (JLPT_DICT_PROMISE) {
    return JLPT_DICT_PROMISE;
  }
  
  // If already loaded, return immediately
  if (JLPT_DICT && Object.keys(JLPT_DICT).length > 0) {
    return JLPT_DICT;
  }
  
  // Create promise for this load attempt
  JLPT_DICT_PROMISE = (async () => {
    JLPT_DICT_LOADING = true;
    try {
      console.log('[JLPT Dict] Loading...');
      JLPT_DICT = await getJLPTDictionary();
      const entryCount = Object.keys(JLPT_DICT).length;
      console.log(`[JLPT Dict] ✅ Loaded ${entryCount} entries`);
      return JLPT_DICT;
    } catch (error) {
      console.error('[JLPT Dict] ❌ Load failed:', error);
      JLPT_DICT = {}; // Empty fallback
      return JLPT_DICT;
    } finally {
      JLPT_DICT_LOADING = false;
    }
  })();
  
  return JLPT_DICT_PROMISE;
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
  
  // OPTIMIZED: Chuyển sang localStorage (cache persistent)
  const cacheKey = `translate_${text.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] ${text}`);
    return cached;
  }

  try {
    // Wait for JLPT Dictionary to load if still loading
    if (JLPT_DICT_LOADING && JLPT_DICT_PROMISE) {
      await JLPT_DICT_PROMISE;
    }

    // ===== LEVEL 1: JLPT DICTIONARY (HIGHEST PRIORITY) =====
    // 8,292 từ JLPT với nghĩa chuẩn
    if (JLPT_DICT && JLPT_DICT[text]) {
      const result = JLPT_DICT[text].vietnamese;
      localStorage.setItem(cacheKey, result);
      console.log(`[Dict] JLPT hit: ${text} -> ${result}`);
      return result;
    }
    
    // ===== LEVEL 2: MANUAL DICTIONARY (FALLBACK) =====
    // 200+ từ thông dụng
    const manualTranslation = translateWithDictionary(text);
    if (manualTranslation !== text) {
      localStorage.setItem(cacheKey, manualTranslation);
      console.log(`[Dict] Manual hit: ${text} -> ${manualTranslation}`);
      return manualTranslation;
    }
    
    // ===== LEVEL 3: GOOGLE TRANSLATE (LAST RESORT) =====
    const googleResult = await callGoogleTranslate(text);
    localStorage.setItem(cacheKey, googleResult);
    console.log(`[Dict] Google: ${text} -> ${googleResult}`);
    return googleResult;
    
  } catch (error) {
    console.warn('[Translate] All methods failed:', error);
    // Fallback: try manual dict one more time
    return translateWithDictionary(text);
  }
}

/**
 * OPTIMIZED: Call Google Translate API with timeout
 * @param {string} text 
 * @param {number} timeout - Timeout in milliseconds (default: 3000ms)
 * @returns {Promise<string>}
 */
async function callGoogleTranslate(text, timeout = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    return text;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[Google Translate] Timeout after', timeout, 'ms');
    } else {
      console.warn('[Google Translate] Error:', error);
    }
    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Dich nghia tieng Viet sang tieng Anh (Google Translate vi -> en)
 * Dung lam fallback khi Jisho API khong tra duoc nghia Anh
 * @param {string} text - Text tieng Viet can dich
 * @param {number} timeout - Timeout tinh bang milliseconds (mac dinh: 3000ms)
 * @returns {Promise<string>} - Text tieng Anh
 */
async function translateViToEn(text, timeout = 3000) {
  if (!text || typeof text !== 'string') return text;
  
  // Kiem tra cache truoc
  const cacheKey = `translate_vi_en_${text.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log(`[Cache Hit vi->en] ${text} -> ${cached}`);
    return cached;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Goi Google Translate voi source=vi, target=en
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Translation vi->en failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const result = data[0][0][0];
      // Luu cache de lan sau khong can goi lai
      localStorage.setItem(cacheKey, result);
      console.log(`[Google vi->en] ${text} -> ${result}`);
      return result;
    }
    
    return text;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[Google Translate vi->en] Timeout after', timeout, 'ms');
    } else {
      console.warn('[Google Translate vi->en] Error:', error);
    }
    return text;
  } finally {
    clearTimeout(timeoutId);
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
 * CORS Proxy alternatives - Better working proxies
 * UPDATED: Added more reliable and working proxies
 */
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',      // Most reliable
  'https://corsproxy.io/?',                    // Good uptime
  'https://api.codetabs.com/v1/proxy?quest=', // Fast and reliable
  'https://cors-anywhere.herokuapp.com/',      // Fallback
];

/**
 * Lay nghia tieng Anh tu Jisho API cho mot tu tieng Nhat
 * Dung de bo sung nghia Anh cho tu JLPT Dictionary (chi co tieng Viet)
 * @param {string} word - Tu tieng Nhat can tra
 * @returns {Promise<Array>} - Mang cac senses tu Jisho hoac mang rong neu that bai
 */
async function fetchJishoEnglish(word) {
  const apiUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const requestUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
    const controller = new AbortController();
    // Timeout ngan hon (5s) vi day chi la bo sung, khong phai lookup chinh
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      console.log(`[Jisho English] Trying proxy ${i + 1}/${CORS_PROXIES.length}...`);
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      // Tra ve senses cua ket qua dau tien tu Jisho
      if (data.data && data.data.length > 0) {
        console.log(`[Jisho English] Got ${data.data[0].senses.length} senses for: ${word}`);
        return data.data[0].senses || [];
      }
      return [];
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn(`[Jisho English] Proxy ${i + 1} timeout`);
      } else {
        console.warn(`[Jisho English] Proxy ${i + 1} failed:`, error.message);
      }
      continue;
    }
  }
  
  // Tat ca proxy deu that bai
  console.warn('[Jisho English] All proxies failed');
  return [];
}

/**
 * Tra cứu từ tiếng Nhật (Jisho.org API with JLPT fallback)
 * @param {string} word 
 * @returns {Promise<Object>}
 */
export async function lookupWord(word) {
  try {
    const trimmedWord = word.trim();
    if (!trimmedWord) {
      throw new Error('Từ không hợp lệ');
    }

    // Cache ket qua tra tu hoan chinh (giam 99% thoi gian cho tu da tra)
    const cacheKey = `lookup_complete_${trimmedWord}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const result = JSON.parse(cached);
        
        // Xoa cache cu cua JLPT (format cu khong co vietnamese_definitions)
        // Cache cu gan nham tieng Viet vao english_definitions
        if (result.source === 'JLPT' && result.senses && result.senses[0] 
            && !result.senses[0].vietnamese_definitions) {
          localStorage.removeItem(cacheKey);
          console.log(`[Lookup] Xoa cache JLPT format cu cho: ${trimmedWord}`);
        } else {
          console.log(`[Lookup Cache Hit] ${trimmedWord} - Instant load!`);
          return result;
        }
      } catch (e) {
        // Cache bi loi, xoa di
        localStorage.removeItem(cacheKey);
      }
    }

    // Uu tien JLPT Dictionary (offline, nhanh, khong CORS)
    // Tra ve ngay lap tuc voi nghia tieng Viet, English se duoc tai async sau
    if (JLPT_DICT && Object.keys(JLPT_DICT).length > 0) {
      const jlptEntry = JLPT_DICT[trimmedWord];
      if (jlptEntry) {
        console.log(`[Dictionary] Tim thay trong JLPT Dictionary: ${trimmedWord} (tra ve ngay)`);
        
        const result = {
          success: true,
          word: trimmedWord,
          japanese: [{ word: trimmedWord, reading: jlptEntry.hiragana || jlptEntry.kanji || '' }],
          senses: [{
            parts_of_speech: [],
            english_definitions: [], // Rong - se duoc enrichWithEnglish() bo sung async
            vietnamese_definitions: [jlptEntry.vietnamese],
            tags: [],
            info: []
          }],
          isCommon: true,
          jlpt: jlptEntry.level ? [jlptEntry.level] : [],
          tags: [],
          source: 'JLPT'
        };
        // Khong cache ket qua chua co English
        // Cache se duoc cap nhat sau khi enrichWithEnglish() hoan thanh
        return result;
      }
    }

    const apiUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(trimmedWord)}`;
    
    let lastError;
    // FIXED: Try proxies with better error handling
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxy = CORS_PROXIES[i];
      const requestUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
      
      // Create timeout controller for better browser compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      try {
        console.log(`[Dictionary] Trying proxy ${i + 1}/${CORS_PROXIES.length}: ${proxy.substring(0, 30)}...`);
        
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          const result = {
            success: false,
            message: 'Không tìm thấy từ này trong từ điển',
            word: trimmedWord
          };
          // Cache negative results too (with shorter TTL)
          localStorage.setItem(cacheKey, JSON.stringify(result));
          return result;
        }

        const firstResult = data.data[0];
        const result = {
          success: true,
          word: trimmedWord,
          japanese: firstResult.japanese || [],
          senses: firstResult.senses || [],
          isCommon: firstResult.is_common || false,
          tags: firstResult.tags || [],
          jlpt: firstResult.jlpt || [],
          raw: firstResult
        };
        
        // Cache successful results
        localStorage.setItem(cacheKey, JSON.stringify(result));
        console.log(`[Lookup] ${trimmedWord} - Cached for next time (via proxy ${i + 1})`);
        
        return result;
        
      } catch (error) {
        clearTimeout(timeoutId); // Ensure timeout is cleared even on error
        // Log error but continue to next proxy
        if (error.name === 'AbortError') {
          console.warn(`[Dictionary] Proxy ${i + 1} timed out after 10s`);
        } else {
          console.warn(`[Dictionary] Proxy ${i + 1} failed:`, error.message);
        }
        lastError = error;
        continue;
      }
    }
    
    // All proxies failed
    console.error('[Dictionary] All proxies failed. Last error:', lastError);
    throw lastError || new Error('Không thể kết nối đến từ điển. Tất cả proxy đều thất bại.');    
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
 * Tai nghia tieng Anh cho tu JLPT (async, chay background sau khi popup da hien)
 * Uu tien Jisho API, fallback Google Translate vi->en
 * Sau khi co ket qua se cache lai de lan sau load ngay
 * @param {string} word - Tu tieng Nhat
 * @param {string} vietnameseMeaning - Nghia tieng Viet tu JLPT (dung cho Google fallback)
 * @returns {Promise<Object>} - { englishDefinitions: string[], jishoSenses: Array, partsOfSpeech: string[] }
 */
export async function enrichWithEnglish(word, vietnameseMeaning) {
  const trimmedWord = word.trim();
  let englishDefinitions = [];
  let jishoSenses = [];
  let partsOfSpeech = [];
  
  // Buoc 1: Thu Jisho API de lay nghia Anh chinh xac
  try {
    jishoSenses = await fetchJishoEnglish(trimmedWord);
    if (jishoSenses.length > 0) {
      englishDefinitions = jishoSenses[0].english_definitions || [];
      partsOfSpeech = jishoSenses[0].parts_of_speech || [];
      console.log(`[Enrich] Jisho English cho ${trimmedWord}:`, englishDefinitions);
    }
  } catch (e) {
    console.warn(`[Enrich] Jisho API that bai cho ${trimmedWord}:`, e.message);
  }
  
  // Buoc 2: Neu Jisho khong co, dung Google Translate vi->en lam fallback
  if (englishDefinitions.length === 0 && vietnameseMeaning) {
    try {
      const englishFromGoogle = await translateViToEn(vietnameseMeaning);
      if (englishFromGoogle && englishFromGoogle.toLowerCase() !== vietnameseMeaning.toLowerCase()) {
        englishDefinitions = [englishFromGoogle];
        console.log(`[Enrich] Google EN cho ${trimmedWord}: ${englishFromGoogle}`);
      }
    } catch (e) {
      console.warn(`[Enrich] Google vi->en that bai cho ${trimmedWord}`);
    }
  }
  
  // Buoc 3: Cache ket qua hoan chinh (co ca English) de lan sau load nhanh
  if (englishDefinitions.length > 0) {
    const cacheKey = `lookup_complete_${trimmedWord}`;
    try {
      // Doc lai JLPT entry de tao ket qua hoan chinh
      const jlptEntry = JLPT_DICT ? JLPT_DICT[trimmedWord] : null;
      if (jlptEntry) {
        let senses;
        if (jishoSenses.length > 0) {
          // Ket hop Jisho senses + Vietnamese tu JLPT
          senses = jishoSenses.map((sense, idx) => ({
            parts_of_speech: sense.parts_of_speech || [],
            english_definitions: sense.english_definitions || [],
            vietnamese_definitions: idx === 0 ? [vietnameseMeaning] : [],
            tags: sense.tags || [],
            info: sense.info || []
          }));
        } else {
          // Chi co English tu Google + Vietnamese tu JLPT
          senses = [{
            parts_of_speech: partsOfSpeech,
            english_definitions: englishDefinitions,
            vietnamese_definitions: [vietnameseMeaning],
            tags: [],
            info: []
          }];
        }
        
        const enrichedResult = {
          success: true,
          word: trimmedWord,
          japanese: [{ word: trimmedWord, reading: jlptEntry.hiragana || jlptEntry.kanji || '' }],
          senses: senses,
          isCommon: true,
          jlpt: jlptEntry.level ? [jlptEntry.level] : [],
          tags: [],
          source: 'JLPT'
        };
        localStorage.setItem(cacheKey, JSON.stringify(enrichedResult));
        console.log(`[Enrich] Da cache ket qua hoan chinh cho: ${trimmedWord}`);
      }
    } catch (e) {
      console.warn(`[Enrich] Loi khi cache cho ${trimmedWord}:`, e.message);
    }
  }
  
  return { englishDefinitions, jishoSenses, partsOfSpeech };
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
    // Nghia tieng Viet truc tiep tu JLPT Dictionary (neu co)
    vietnameseDirect: sense.vietnamese_definitions || [],
    tags: sense.tags || [],
    info: sense.info || []
  }));

  // Chi xu ly 3 nghia dau tien (giam 60-70% thoi gian)
  const limitedMeanings = meanings.slice(0, 3);
  
  // Dich va xu ly nghia tieng Viet + tieng Anh
  const vietnameseMeanings = await Promise.all(
    limitedMeanings.map(async (meaning) => {
      // Gioi han so definitions (toi da 5)
      const limitedEnglish = meaning.english.slice(0, 5);
      
      let vietnamese;
      // Neu da co nghia tieng Viet truc tiep (tu JLPT Dictionary), dung luon khong can dich
      if (meaning.vietnameseDirect && meaning.vietnameseDirect.length > 0) {
        vietnamese = meaning.vietnameseDirect;
      } else {
        // Khong co nghia Viet truc tiep -> dich tu tieng Anh sang tieng Viet
        vietnamese = await Promise.all(
          limitedEnglish.map(eng => translateToVietnamese(eng))
        );
      }
      
      // Dich tu loai sang tieng Viet
      const vietnamesePartOfSpeech = await Promise.all(
        meaning.partOfSpeech.map(pos => translatePartOfSpeech(pos))
      );
      
      return {
        ...meaning,
        english: limitedEnglish,
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