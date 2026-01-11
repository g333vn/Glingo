// src/data/jlptDictionary.js
// AUTO-GENERATED JLPT Dictionary
// Total: 8,292 unique entries
// Source: Minna no Nihongo + Mimikara N1/N2/N3
// Levels: N1 (2,016) | N2 (1,920) | N3 (1,527) | N4/N5 (2,829)

/**
 * JLPT Dictionary - Fast lookup for Japanese to Vietnamese translation
 * 
 * Structure:
 * {
 *   "hiragana/kanji": {
 *     vietnamese: "nghĩa tiếng Việt",
 *     kanji: "漢字" (if hiragana key),
 *     hiragana: "ひらがな" (if kanji key),
 *     level: "N1" | "N2" | "N3" | "N4" | "N5"
 *   }
 * }
 */

// This file will be generated from jlpt_dictionary_full.json
// Loading it dynamically to avoid huge inline file

export async function loadJLPTDictionary() {
  try {
    console.log('[JLPT Dict] Fetching from /data/jlpt_dictionary.json');
    const response = await fetch('/data/jlpt_dictionary.json');
    if (!response.ok) {
      console.error(`[JLPT Dict] HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to load JLPT dictionary: HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log(`[JLPT Dict] Successfully loaded ${Object.keys(data).length} entries`);
    return data;
  } catch (error) {
    console.error('[JLPT Dict] Load error:', error.message);
    console.error('[JLPT Dict] Stack:', error.stack);
    return {};
  }
}

// In-memory cache
let _cachedDict = null;

/**
 * Get JLPT dictionary (lazy load + cache)
 */
export async function getJLPTDictionary() {
  if (_cachedDict) {
    return _cachedDict;
  }
  
  _cachedDict = await loadJLPTDictionary();
  return _cachedDict;
}

/**
 * Lookup word in JLPT dictionary
 * @param {string} word - Japanese word (hiragana or kanji)
 * @returns {Promise<Object|null>} Dictionary entry or null
 */
export async function lookupJLPT(word) {
  if (!word) return null;
  
  const dict = await getJLPTDictionary();
  return dict[word] || null;
}

/**
 * Check if word exists in JLPT dictionary
 * @param {string} word 
 * @returns {Promise<boolean>}
 */
export async function hasJLPTWord(word) {
  const entry = await lookupJLPT(word);
  return entry !== null;
}

/**
 * Get Vietnamese meaning from JLPT dictionary
 * @param {string} word 
 * @returns {Promise<string|null>}
 */
export async function getVietnameseMeaning(word) {
  const entry = await lookupJLPT(word);
  return entry ? entry.vietnamese : null;
}

/**
 * Get JLPT level of a word
 * @param {string} word 
 * @returns {Promise<string|null>} "N1" | "N2" | "N3" | "N4" | "N5" | null
 */
export async function getJLPTLevel(word) {
  const entry = await lookupJLPT(word);
  return entry ? entry.level : null;
}

/**
 * Statistics about the dictionary
 */
export const JLPT_DICT_STATS = {
  total: 8292,
  byLevel: {
    N1: 2016,
    N2: 1920,
    N3: 1527,
    N5: 2829 // Includes N4
  },
  coverage: {
    N5: '100%',
    N4: '100%',
    N3: '95%+',
    N2: '95%+',
    N1: '90%+'
  }
};

export default {
  load: loadJLPTDictionary,
  get: getJLPTDictionary,
  lookup: lookupJLPT,
  has: hasJLPTWord,
  getMeaning: getVietnameseMeaning,
  getLevel: getJLPTLevel,
  stats: JLPT_DICT_STATS
};