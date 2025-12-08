// src/utils/batchQueries.js
// ✅ PHASE 3: Batch Query Utilities for IndexedDB
// Load multiple resources in parallel instead of sequential

import indexedDBManager from './indexedDBManager.js';
import queryCache from './queryCache.js';

/**
 * Batch load books for multiple levels
 * @param {Array<string>} levels - Array of levels (e.g., ['n1', 'n2', 'n3'])
 * @returns {Promise<Object>} - Object with level as key and books array as value
 */
export async function batchGetBooks(levels) {
  const results = {};
  
  // Check cache first
  const uncachedLevels = [];
  for (const level of levels) {
    const cached = queryCache.get('getBooks', { level });
    if (cached !== null) {
      results[level] = cached;
    } else {
      uncachedLevels.push(level);
    }
  }

  // Load uncached levels in parallel
  if (uncachedLevels.length > 0) {
    const promises = uncachedLevels.map(async (level) => {
      const books = await indexedDBManager.getBooks(level);
      if (books) {
        queryCache.set('getBooks', { level }, books, 5 * 60 * 1000);
        return { level, books };
      }
      return { level, books: null };
    });

    const loaded = await Promise.all(promises);
    loaded.forEach(({ level, books }) => {
      results[level] = books;
    });
  }

  return results;
}

/**
 * Batch load chapters for multiple books
 * @param {Array<{bookId: string, levelId: string}>} bookIds - Array of {bookId, levelId}
 * @returns {Promise<Object>} - Object with bookId as key and chapters array as value
 */
export async function batchGetChapters(bookIds) {
  const results = {};
  
  // Load all chapters in parallel
  const promises = bookIds.map(async ({ bookId, levelId }) => {
    const cacheKey = 'getChapters';
    const cached = queryCache.get(cacheKey, { bookId, levelId });
    if (cached !== null) {
      return { bookId, chapters: cached };
    }

    const chapters = await indexedDBManager.getChapters(bookId);
    if (chapters) {
      queryCache.set(cacheKey, { bookId, levelId }, chapters, 5 * 60 * 1000);
    }
    return { bookId, chapters };
  });

  const loaded = await Promise.all(promises);
  loaded.forEach(({ bookId, chapters }) => {
    results[bookId] = chapters;
  });

  return results;
}

/**
 * Batch load lessons for multiple chapters
 * @param {Array<{bookId: string, chapterId: string, levelId: string}>} chapterIds - Array of {bookId, chapterId, levelId}
 * @returns {Promise<Object>} - Object with `${bookId}_${chapterId}` as key and lessons array as value
 */
export async function batchGetLessons(chapterIds) {
  const results = {};
  
  // Load all lessons in parallel
  const promises = chapterIds.map(async ({ bookId, chapterId, levelId }) => {
    const cacheKey = 'getLessons';
    const key = `${bookId}_${chapterId}`;
    const cached = queryCache.get(cacheKey, { bookId, chapterId, levelId });
    if (cached !== null) {
      return { key, lessons: cached };
    }

    const lessons = await indexedDBManager.getLessons(bookId, chapterId);
    if (lessons) {
      queryCache.set(cacheKey, { bookId, chapterId, levelId }, lessons, 5 * 60 * 1000);
    }
    return { key, lessons };
  });

  const loaded = await Promise.all(promises);
  loaded.forEach(({ key, lessons }) => {
    results[key] = lessons;
  });

  return results;
}

/**
 * Batch load exams for multiple levels
 * @param {Array<string>} levels - Array of levels (e.g., ['n1', 'n2', 'n3'])
 * @returns {Promise<Object>} - Object with level as key and exams array as value
 */
export async function batchGetExams(levels) {
  const results = {};
  
  // Check cache first
  const uncachedLevels = [];
  for (const level of levels) {
    const cached = queryCache.get('getExams', { level });
    if (cached !== null) {
      results[level] = cached;
    } else {
      uncachedLevels.push(level);
    }
  }

  // Load uncached levels in parallel
  if (uncachedLevels.length > 0) {
    const promises = uncachedLevels.map(async (level) => {
      const exams = await indexedDBManager.getExams(level);
      if (exams) {
        queryCache.set('getExams', { level }, exams, 5 * 60 * 1000);
        return { level, exams };
      }
      return { level, exams: null };
    });

    const loaded = await Promise.all(promises);
    loaded.forEach(({ level, exams }) => {
      results[level] = exams;
    });
  }

  return results;
}
