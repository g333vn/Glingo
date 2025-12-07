// src/components/GlobalSearch.jsx
// 🔍 Smart Global Search - Search everything (pages, features, content, settings)

import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import storageManager from '../utils/localStorageManager.js';
import { searchItems, getCategoryLabel } from '../config/searchableItems.js';
import { lookupWord } from '../services/api_translate/dictionaryService.js';
import { lookupJLPT, getJLPTDictionary } from '../data/jlptDictionary.js';
import DictionaryContext from '../components/api_translate/DictionaryContext.jsx';

function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({
    items: [],      // Searchable items (pages, features, settings)
    dictionary: [], // Dictionary results
    books: [],
    chapters: [],
    lessons: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const modalRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  
  // Get user role for filtering
  const userRole = user?.role || null;
  
  // Dictionary context for opening popup (optional - may not be available)
  // Use useContext with null default to avoid throwing error if provider is missing
  const dictionaryContextRaw = useContext(DictionaryContext);
  const dictionaryContext = dictionaryContextRaw && (typeof dictionaryContextRaw.lookup === 'function' || typeof dictionaryContextRaw.showDictionaryResult === 'function')
    ? dictionaryContextRaw 
    : null;
  
  // Check if query contains Japanese characters
  const isJapaneseQuery = useCallback((query) => {
    if (!query) return false;
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    return japaneseRegex.test(query);
  }, []);
  
  // Memoize all results calculation for better performance
  const allResults = useMemo(() => [
    ...results.dictionary, // Dictionary results first (highest priority when Japanese)
    ...results.items,
    ...results.books,
    ...results.chapters,
    ...results.lessons
  ], [results.dictionary, results.items, results.books, results.chapters, results.lessons]);
  
  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('globalSearchHistory');
      if (saved) {
        const history = JSON.parse(saved);
        setSearchHistory(history.slice(0, 10)); // Max 10 items
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);
  
  // Save search to history
  const saveToHistory = useCallback((query) => {
    if (!query || query.trim().length < 1) return;
    
    const trimmedQuery = query.trim().toLowerCase();
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmedQuery);
      const updated = [trimmedQuery, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      return updated;
    });
  }, []);

  // Remove a single item from history
  const removeFromHistory = useCallback((itemToRemove) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== itemToRemove);
      try {
        localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update search history:', error);
      }
      return updated;
    });
  }, []);

  // Clear all search history
  const clearAllHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('globalSearchHistory');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);
  
  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);
  
  // Centralized state reset function for consistency
  const resetSearchState = useCallback(() => {
    setSearchQuery('');
    setSelectedIndex(0);
    setResults({ items: [], dictionary: [], books: [], chapters: [], lessons: [] });
    isScrollingRef.current = false;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);
  
  // Handle open/close modal - defined early for use in useEffect
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    resetSearchState();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [resetSearchState]);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetSearchState();
  }, [resetSearchState]);
  
  // Navigate to result - memoized with useCallback
  const handleResultClick = useCallback((result) => {
    // Save search query to history
    if (searchQuery.trim().length > 0) {
      saveToHistory(searchQuery);
    }
    
    // Handle dictionary results
    if (result.type === 'dictionary') {
      const wordToLookup = result.word || result.japanese || searchQuery.trim();
      console.log('[GlobalSearch] Dictionary result clicked:', result);
      console.log('[GlobalSearch] Word to lookup:', wordToLookup);
      console.log('[GlobalSearch] Dictionary context available:', !!dictionaryContext);
      console.log('[GlobalSearch] Has raw data:', !!result.rawData);
      console.log('[GlobalSearch] Dictionary context methods:', {
        hasLookup: dictionaryContext && typeof dictionaryContext.lookup === 'function',
        hasShowResult: dictionaryContext && typeof dictionaryContext.showDictionaryResult === 'function',
        hasClosePopup: dictionaryContext && typeof dictionaryContext.closePopup === 'function'
      });
      
      if (!dictionaryContext) {
        console.error('[GlobalSearch] Dictionary context is null! Make sure DictionaryProvider is wrapping the app.');
        handleClose();
        return;
      }
      
      if (!wordToLookup) {
        console.error('[GlobalSearch] Word to lookup is empty!');
        handleClose();
        return;
      }
      
      // Close search modal first
      handleClose();
      
      // Small delay to ensure modal is closed before opening popup
      setTimeout(() => {
        // Open dictionary popup at center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // ✅ OPTIMIZED: Use raw data if available to avoid CORS issues
        if (result.rawData && typeof dictionaryContext.showDictionaryResult === 'function') {
          console.log('[GlobalSearch] Using raw data to show popup', {
            word: wordToLookup,
            hasRawData: !!result.rawData,
            rawDataSuccess: result.rawData.success
          });
          try {
            dictionaryContext.showDictionaryResult(result.rawData, wordToLookup, centerX, centerY);
            console.log('[GlobalSearch] showDictionaryResult called successfully');
          } catch (error) {
            console.error('[GlobalSearch] Error showing dictionary result:', error);
            // Fallback to lookup if showDictionaryResult fails
            if (typeof dictionaryContext.lookup === 'function') {
              console.log('[GlobalSearch] Fallback to lookup');
              dictionaryContext.lookup(wordToLookup, centerX, centerY);
            }
          }
        } else if (typeof dictionaryContext.lookup === 'function') {
          // Fallback: use lookup (will check cache first)
          console.log('[GlobalSearch] Using lookup (will check cache)', {
            word: wordToLookup,
            hasRawData: !!result.rawData
          });
          try {
            dictionaryContext.lookup(wordToLookup, centerX, centerY);
            console.log('[GlobalSearch] lookup called successfully');
          } catch (error) {
            console.error('[GlobalSearch] Error calling lookup:', error);
          }
        } else {
          console.error('[GlobalSearch] No valid dictionary method available!');
        }
      }, 200); // Increased delay to ensure modal closes completely
      return;
    }
    
    // Handle searchable items (pages, features, settings)
    if (result.category) {
      if (result.path) {
        navigate(result.path);
      } else {
        // Feature without path - show info or trigger action
        console.log('Feature clicked:', result.title);
        // Could show a toast or modal explaining the feature
      }
    }
    // Handle content items
    else if (result.type === 'book') {
      navigate(`/level/${result.level}/${result.id}`);
    } else if (result.type === 'chapter') {
      navigate(`/level/${result.level}/${result.bookId}/chapter/${result.id}`);
    } else if (result.type === 'lesson') {
      navigate(`/level/${result.level}/${result.bookId}/chapter/${result.chapterId}/lesson/${result.id}`);
    }
    
    handleClose();
  }, [navigate, handleClose, searchQuery, saveToHistory, dictionaryContext, handleClose]);
  
  // Highlight search terms in text
  const highlightText = useCallback((text, query) => {
    if (!query || query.length < 1) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 font-bold">{part}</mark>
      ) : part
    );
  }, []);
  
  // Open/close search with Ctrl+K or Cmd+K (toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        
        if (isOpen) {
          // Close if already open
          handleClose();
        } else {
          // Open if closed
          handleOpen();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleOpen, handleClose]);
  
  // Handle Escape key - only when search modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [isOpen, handleClose]);
  
  // Smart Search Logic - 1 character minimum with consistent state management
  useEffect(() => {
    // Reset selectedIndex when search query changes
    setSelectedIndex(0);
    isScrollingRef.current = false;
    
    if (!searchQuery || searchQuery.length < 1) {
      setResults({ items: [], dictionary: [], books: [], chapters: [], lessons: [] });
      return;
    }
    
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.trim();
        const queryLower = query.toLowerCase();
        const searchResults = {
          items: [],
          dictionary: [],
          books: [],
          chapters: [],
          lessons: []
        };
        
        // 0. Search dictionary - if query contains Japanese characters or is a single word
        const isJapanese = isJapaneseQuery(query);
        const isSingleWord = query.split(/\s+/).length === 1;
        
        if (isJapanese || (isSingleWord && query.length >= 1)) {
          try {
            // ✅ OPTIMIZED: Only search JLPT dictionary (local, no CORS) during search
            // Jisho API will be called when user clicks on result (if needed)
            let jlptResult = null;
            let foundKey = null;
            
            // First try exact match
            jlptResult = await lookupJLPT(query);
            if (jlptResult) {
              foundKey = query;
              console.log('[GlobalSearch] JLPT exact match found:', query);
            } else {
              // If not found, search by kanji or hiragana variant
              if (isJapanese) {
                try {
                  const dict = await getJLPTDictionary();
                  console.log('[GlobalSearch] Searching JLPT dictionary, total entries:', Object.keys(dict).length);
                  
                  // Search all entries for variant match
                  for (const [key, value] of Object.entries(dict)) {
                    // Check if query matches kanji or hiragana
                    if (value.kanji === query || value.hiragana === query) {
                      jlptResult = { ...value, word: key };
                      foundKey = key;
                      console.log('[GlobalSearch] Found JLPT by variant:', key, 'for query:', query);
                      break;
                    }
                  }
                  
                  if (!jlptResult) {
                    console.log('[GlobalSearch] No JLPT result found for:', query);
                  }
                } catch (error) {
                  console.error('[GlobalSearch] Error searching JLPT dictionary:', error);
                }
              }
            }
            
            if (jlptResult) {
              // Get reading (hiragana or kanji depending on key)
              // If found by variant, use the original key as word
              const wordKey = foundKey || query;
              const reading = jlptResult.hiragana || jlptResult.kanji || '';
              const displayWord = jlptResult.kanji || wordKey;
              
              // Create rawData format for JLPT result
              const jlptRawData = {
                success: true,
                word: wordKey,
                japanese: [{ word: displayWord, reading: reading }],
                senses: [{
                  parts_of_speech: ['Noun'], // Default
                  english_definitions: [jlptResult.vietnamese || 'Nghĩa không có'],
                  tags: [],
                  info: []
                }],
                isCommon: true,
                jlpt: jlptResult.level ? [jlptResult.level] : [],
                tags: []
              };
              
              searchResults.dictionary.push({
                type: 'dictionary',
                word: wordKey, // Use the actual dictionary key
                japanese: displayWord,
                reading: reading,
                meaning: jlptResult.vietnamese || 'Nghĩa không có',
                source: 'JLPT',
                isCommon: true,
                priority: isJapanese ? 1000 : 500, // Higher priority if Japanese
                rawData: jlptRawData // ✅ Save raw data format for JLPT
              });
              console.log('[GlobalSearch] Added JLPT result:', {
                word: wordKey,
                displayWord,
                reading,
                meaning: jlptResult.vietnamese
              });
            } else {
              // ✅ OPTIMIZED: Check cache first before calling Jisho API
              // Only call Jisho if query is Japanese and not in JLPT
              if (isJapanese && query.length >= 1) {
                const cacheKey = `lookup_complete_${query.trim()}`;
                const cached = localStorage.getItem(cacheKey);
                
                if (cached) {
                  try {
                    const jishoResult = JSON.parse(cached);
                    if (jishoResult && jishoResult.success) {
                      const firstSense = jishoResult.senses?.[0];
                      const meanings = firstSense?.english_definitions || [];
                      const japaneseForms = jishoResult.japanese || [];
                      
                      // Get the actual word from Jisho result (prefer word over reading)
                      const actualWord = japaneseForms.find(j => j.word)?.word || 
                                       japaneseForms.find(j => j.reading)?.reading || 
                                       query;
                      
                      searchResults.dictionary.push({
                        type: 'dictionary',
                        word: actualWord,
                        japanese: japaneseForms.map(j => j.word || j.reading).join(', ') || query,
                        reading: japaneseForms.find(j => j.reading)?.reading || '',
                        meaning: meanings.join(', ') || 'Nghĩa không có',
                        source: 'Jisho',
                        isCommon: jishoResult.isCommon || false,
                        jlpt: jishoResult.jlpt || [],
                        priority: isJapanese ? 900 : 400,
                        rawData: jishoResult // ✅ Use cached data
                      });
                      console.log('[GlobalSearch] Using cached Jisho result');
                    }
                  } catch (e) {
                    // Cache corrupted, ignore
                    console.log('[GlobalSearch] Cache corrupted, skipping');
                  }
                }
                
                // ✅ If no JLPT and no cache, show a placeholder result
                // User can click to lookup the word (will call API when clicked)
                if (!jlptResult && !cached && isJapanese) {
                  searchResults.dictionary.push({
                    type: 'dictionary',
                    word: query,
                    japanese: query,
                    reading: '',
                    meaning: 'Click để tra từ này',
                    source: 'Lookup',
                    isCommon: false,
                    jlpt: [],
                    priority: isJapanese ? 800 : 300,
                    needsLookup: true // Flag to indicate need to lookup when clicked
                  });
                  console.log('[GlobalSearch] Added placeholder dictionary result for:', query);
                } else {
                  console.log('[GlobalSearch] No JLPT result and no cache for:', query);
                }
                // ✅ Don't call Jisho API during search to avoid CORS
                // Will be called when user clicks on result if needed
              }
            }
          } catch (error) {
            console.error('[Search] Dictionary lookup failed:', error);
            // Continue with other searches even if dictionary fails
          }
        }
        
        // 1. Search searchable items (pages, features, settings) - INSTANT
        const matchedItems = searchItems(queryLower, userRole);
        searchResults.items = matchedItems.slice(0, 8); // Top 8 most relevant
        
        // 2. Search content (books, chapters, lessons) - only if query >= 2 chars
        if (queryLower.length >= 2) {
          const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
          
          for (const level of levels) {
            // Search books
            const books = await storageManager.getBooks(level);
            if (books) {
              const matchedBooks = books.filter(book =>
                book.title?.toLowerCase().includes(queryLower) ||
                book.id?.toLowerCase().includes(queryLower)
              ).map(book => ({ ...book, level, type: 'book' }));
              searchResults.books.push(...matchedBooks);
            }
            
            // Search chapters and lessons
            if (books) {
              for (const book of books) {
                // Search chapters
                const chapters = await storageManager.getChapters(book.id);
                if (chapters) {
                  const matchedChapters = chapters.filter(chapter =>
                    chapter.title?.toLowerCase().includes(queryLower) ||
                    chapter.id?.toLowerCase().includes(queryLower)
                  ).map(chapter => ({
                    ...chapter,
                    level,
                    bookId: book.id,
                    bookTitle: book.title,
                    type: 'chapter'
                  }));
                  searchResults.chapters.push(...matchedChapters);
                  
                  // Search lessons in each chapter
                  for (const chapter of chapters) {
                    const lessons = await storageManager.getLessons(book.id, chapter.id);
                    if (lessons) {
                      const matchedLessons = lessons.filter(lesson =>
                        lesson.title?.toLowerCase().includes(queryLower) ||
                        lesson.id?.toLowerCase().includes(queryLower) ||
                        lesson.description?.toLowerCase().includes(queryLower)
                      ).map(lesson => ({
                        ...lesson,
                        level,
                        bookId: book.id,
                        bookTitle: book.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        type: 'lesson'
                      }));
                      searchResults.lessons.push(...matchedLessons);
                    }
                  }
                }
              }
            }
          }
        }
        
        // Limit results
        searchResults.dictionary = searchResults.dictionary.slice(0, 3); // Max 3 dictionary results
        searchResults.books = searchResults.books.slice(0, 5);
        searchResults.chapters = searchResults.chapters.slice(0, 5);
        searchResults.lessons = searchResults.lessons.slice(0, 8);
        
        setResults(searchResults);
        // Reset selectedIndex when new results arrive
        setSelectedIndex(0);
        isScrollingRef.current = false;
      } catch (error) {
        console.error('Search error:', error);
        // Reset state on error
        setResults({ items: [], dictionary: [], books: [], chapters: [], lessons: [] });
        setSelectedIndex(0);
      } finally {
        setIsSearching(false);
      }
    };
    
    // Faster debounce for instant feel
    const debounce = setTimeout(performSearch, 150);
    return () => {
      clearTimeout(debounce);
      // Cancel any pending scrolls
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [searchQuery, userRole, isJapaneseQuery]);
  
  // Reset selectedIndex when results change and it's out of bounds
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset selectedIndex if it's out of bounds
    if (selectedIndex >= allResults.length && allResults.length > 0) {
      setSelectedIndex(0);
    } else if (selectedIndex > 0 && allResults.length === 0) {
      setSelectedIndex(0);
    }
  }, [isOpen, allResults.length, selectedIndex]);
  
  // Improved auto-scroll: Scroll selected item into view with better handling
  useEffect(() => {
    if (!isOpen || !resultsRef.current || isScrollingRef.current) return;
    
    // Clear any pending scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce scroll to avoid conflicts
    scrollTimeoutRef.current = setTimeout(() => {
      const selectedElement = resultsRef.current?.querySelector(`[data-selected-index="${selectedIndex}"]`);
      
      if (selectedElement && resultsRef.current) {
        isScrollingRef.current = true;
        
        const container = resultsRef.current;
        const elementRect = selectedElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if element is fully visible
        const isFullyVisible = 
          elementRect.top >= containerRect.top &&
          elementRect.bottom <= containerRect.bottom;
        
        if (!isFullyVisible) {
          // Calculate scroll position
          const scrollTop = container.scrollTop;
          const elementOffsetTop = selectedElement.offsetTop;
          const containerHeight = container.clientHeight;
          const elementHeight = selectedElement.offsetHeight;
          
          let newScrollTop;
          
          // If element is above viewport
          if (elementRect.top < containerRect.top) {
            newScrollTop = elementOffsetTop - 10; // 10px padding from top
          } 
          // If element is below viewport
          else if (elementRect.bottom > containerRect.bottom) {
            newScrollTop = elementOffsetTop - containerHeight + elementHeight + 10; // 10px padding from bottom
          } else {
            newScrollTop = scrollTop; // No change needed
          }
          
          // Smooth scroll
          container.scrollTo({
            top: newScrollTop,
            behavior: 'smooth'
          });
        }
        
        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
      }
    }, 50); // Small debounce for better performance
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen, selectedIndex]);
  
  // Focus trap - keep focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);
  
  // Improved keyboard navigation with better arrow key handling
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      // Handle navigation keys when in input
      const isInInput = e.target === inputRef.current;
      
      // Always allow arrow keys to navigate, even when typing
      if (isInInput && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End' || e.key === 'PageDown' || e.key === 'PageUp')) {
        e.preventDefault();
        e.stopPropagation();
        // Continue to navigation logic below
      } else if (isInInput && e.key !== 'Enter' && e.key !== 'Escape' && e.key !== 'Tab') {
        // Let user type normally for other keys
        return;
      }
      
      if (allResults.length === 0) {
        // Handle Enter on empty results - save to history
        if (e.key === 'Enter' && isInInput) {
          e.preventDefault();
          if (searchQuery.trim().length > 0) {
            saveToHistory(searchQuery);
          }
        }
        return;
      }
      
      // Navigation keys
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => {
            const next = Math.min(prev + 1, allResults.length - 1);
            return next;
          });
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => {
            const next = Math.max(prev - 1, 0);
            return next;
          });
          break;
          
        case 'PageDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => {
            // Jump by ~5 items or to end
            const jump = Math.min(5, allResults.length - prev - 1);
            return Math.min(prev + jump, allResults.length - 1);
          });
          break;
          
        case 'PageUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => {
            // Jump by ~5 items or to start
            const jump = Math.min(5, prev);
            return Math.max(prev - jump, 0);
          });
          break;
          
        case 'Home':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(allResults.length - 1);
          break;
          
        case 'Enter':
          if (allResults[selectedIndex]) {
            e.preventDefault();
            e.stopPropagation();
            handleResultClick(allResults[selectedIndex]);
          }
          break;
          
        default:
          // Other keys are handled elsewhere or ignored
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, allResults, selectedIndex, handleResultClick, searchQuery, saveToHistory]);
  
  const totalResults = results.dictionary.length + results.items.length + results.books.length + results.chapters.length + results.lessons.length;
  
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-20 sm:bottom-6 right-3 sm:right-4 md:right-6 z-50 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-500 text-white rounded-full border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center gap-2"
        aria-label="Search"
      >
        <span className="text-lg sm:text-xl">🔍</span>
        <span className="hidden md:inline text-sm">{t('search.searchButton')}</span>
      </button>
    );
  }
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleClose}
      />
      
      {/* Search Modal */}
      <div 
        ref={modalRef}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-2xl px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b-[3px] border-black">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔍</span>
              <input
                ref={inputRef}
                type="text"
                id="search-modal-title"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-lg font-bold focus:outline-none"
                aria-label="Search input"
                aria-autocomplete="list"
                aria-controls="search-results"
                autoComplete="off"
              />
              {isSearching && (
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"
                  aria-label="Searching..."
                ></div>
              )}
              {!isSearching && searchQuery.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Results */}
          <div 
            ref={resultsRef} 
            id="search-results"
            className="max-h-[60vh] overflow-y-auto p-4"
            role="listbox"
            aria-label="Search results"
          >
            {searchQuery.length < 1 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">{t('search.minChars')}</p>
                <p className="text-xs mt-2">{t('search.shortcut')}: <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">K</kbd></p>
                
                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <div className="mt-6 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-700">🕐 {t('search.recentSearches')}:</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllHistory();
                        }}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                        type="button"
                        title="Xóa tất cả lịch sử"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="group relative inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors"
                        >
                          <button
                            onClick={() => {
                              setSearchQuery(item);
                              inputRef.current?.focus();
                            }}
                            className="flex-1 text-left"
                            type="button"
                          >
                            {item}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 ml-1 text-gray-500 hover:text-red-600 transition-all duration-200 flex-shrink-0"
                            type="button"
                            title="Xóa mục này"
                            aria-label="Xóa mục này"
                          >
                            <span className="text-sm font-bold">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {user && (
                  <div className="mt-4 text-xs">
                    <p className="font-bold text-gray-700 mb-2">🎯 {t('search.quickTips')}:</p>
                    <p className="text-gray-600">• {t('search.tipHome')}</p>
                    <p className="text-gray-600">• {t('search.tipLevel')}</p>
                    <p className="text-gray-600">• {t('search.tipJLPT')}</p>
                    {user.role === 'admin' && (
                      <>
                        <p className="text-red-600 font-bold mt-2">{t('search.adminShortcuts')}:</p>
                        <p className="text-gray-600">• {t('search.tipAdmin')}</p>
                        <p className="text-gray-600">• {t('search.tipContent')}</p>
                        <p className="text-gray-600">• {t('search.tipSettings')}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>❌ {t('search.noResults')}</p>
                <p className="text-xs mt-2">{t('search.tryOther')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Dictionary Results - Highest Priority */}
                {results.dictionary.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">
                      📖 {t('dictionary.title') || 'Dictionary'} ({results.dictionary.length})
                    </h3>
                    <div className="space-y-2">
                      {results.dictionary.map((dict, index) => {
                        const globalIndex = index; // Dictionary comes first
                        return (
                          <button
                            key={`dict-${dict.word}-${index}`}
                            data-selected-index={globalIndex}
                            onClick={() => handleResultClick(dict)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-yellow-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''
                            }`}
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">📖</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 mb-1">
                                  <span className="text-lg">{dict.japanese}</span>
                                  {dict.reading && (
                                    <span className="text-sm text-gray-500 ml-2">({dict.reading})</span>
                                  )}
                                </div>
                                <div className={`text-sm ${dict.needsLookup ? 'text-gray-500 italic' : 'text-gray-600'}`}>
                                  {dict.meaning}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                    dict.source === 'JLPT' 
                                      ? 'text-yellow-700 bg-yellow-100 border border-yellow-300'
                                      : dict.source === 'Jisho'
                                      ? 'text-blue-700 bg-blue-100 border border-blue-300'
                                      : 'text-gray-700 bg-gray-100 border border-gray-300'
                                  }`}>
                                    {dict.source}
                                  </span>
                                  {dict.isCommon && (
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-green-700 bg-green-100 border border-green-300">
                                      Common
                                    </span>
                                  )}
                                  {dict.jlpt && dict.jlpt.length > 0 && (
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-blue-700 bg-blue-100 border border-blue-300">
                                      JLPT {dict.jlpt.join(', ')}
                                    </span>
                                  )}
                                  {dict.needsLookup && (
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-orange-700 bg-orange-100 border border-orange-300">
                                      Click to lookup
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Searchable Items (Pages, Features, Settings) */}
                {results.items.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">
                      ⚡ {t('search.quickSuggestions')} ({results.items.length})
                    </h3>
                    <div className="space-y-2">
                      {results.items.map((item, index) => {
                        const categoryInfo = getCategoryLabel(item.category);
                        const globalIndex = results.dictionary.length + index; // Offset by dictionary results
                        const bgColors = {
                          blue: 'bg-blue-50 border-blue-300',
                          green: 'bg-green-50 border-green-300',
                          purple: 'bg-purple-50 border-purple-300',
                          red: 'bg-red-50 border-red-300',
                          orange: 'bg-orange-50 border-orange-300',
                          gray: 'bg-gray-50 border-gray-300'
                        };
                        const textColors = {
                          blue: 'text-blue-700',
                          green: 'text-green-700',
                          purple: 'text-purple-700',
                          red: 'text-red-700',
                          orange: 'text-orange-700',
                          gray: 'text-gray-700'
                        };
                        
                        return (
                          <button
                            key={item.id}
                            data-selected-index={globalIndex}
                            onClick={() => handleResultClick(item)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] hover:shadow-md transition-all ${
                              selectedIndex === globalIndex 
                                ? `${bgColors[categoryInfo.color]} shadow-md scale-[1.02] ring-2 ring-blue-400` 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                                  <span className="truncate">{highlightText(item.title, searchQuery)}</span>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${textColors[categoryInfo.color]} bg-white border border-current`}>
                                    {t(categoryInfo.labelKey)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 truncate">{highlightText(item.description, searchQuery)}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Books */}
                {results.books.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">📚 {t('search.books')} ({results.books.length})</h3>
                    <div className="space-y-2">
                      {results.books.map((book, index) => {
                        const globalIndex = results.dictionary.length + results.items.length + index;
                        return (
                          <button
                            key={`book-${book.id}`}
                            data-selected-index={globalIndex}
                            onClick={() => handleResultClick(book)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-blue-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-100 ring-2 ring-blue-400' : ''
                            }`}
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                          >
                            <div className="font-bold text-gray-800">{highlightText(book.title, searchQuery)}</div>
                            <div className="text-xs text-gray-500 uppercase">{book.level}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Chapters */}
                {results.chapters.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">📂 {t('search.chapters')} ({results.chapters.length})</h3>
                    <div className="space-y-2">
                      {results.chapters.map((chapter, index) => {
                        const globalIndex = results.dictionary.length + results.items.length + results.books.length + index;
                        return (
                          <button
                            key={`chapter-${chapter.id}`}
                            data-selected-index={globalIndex}
                            onClick={() => handleResultClick(chapter)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-blue-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-100 ring-2 ring-blue-400' : ''
                            }`}
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                          >
                            <div className="font-bold text-gray-800">{highlightText(chapter.title, searchQuery)}</div>
                            <div className="text-xs text-gray-500">{highlightText(chapter.bookTitle, searchQuery)} • {chapter.level.toUpperCase()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Lessons */}
                {results.lessons.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">📝 {t('search.lessons')} ({results.lessons.length})</h3>
                    <div className="space-y-2">
                      {results.lessons.map((lesson, index) => {
                        const globalIndex = results.dictionary.length + results.items.length + results.books.length + results.chapters.length + index;
                        return (
                          <button
                            key={`lesson-${lesson.id}`}
                            data-selected-index={globalIndex}
                            onClick={() => handleResultClick(lesson)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-blue-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-100 ring-2 ring-blue-400' : ''
                            }`}
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                          >
                            <div className="font-bold text-gray-800">{highlightText(lesson.title, searchQuery)}</div>
                            <div className="text-xs text-gray-500">
                              {highlightText(lesson.bookTitle, searchQuery)} → {highlightText(lesson.chapterTitle, searchQuery)} • {lesson.level.toUpperCase()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* View all link */}
                {totalResults > 0 && (
                  <div className="text-center pt-2 border-t-[2px] border-gray-200 mt-4 pt-4">
                    <p className="text-xs text-gray-500 font-medium">
                      ✅ {t('search.found')} <span className="font-bold text-gray-700">{totalResults}</span> {t('search.results')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('search.useArrows')} <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] ml-1">↓</kbd> {t('search.toMove')}, 
                      <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] ml-1">Enter</kbd> {t('search.toSelect')},
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] ml-1">Home</kbd>/<kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">End</kbd> {t('search.toJump')},
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] ml-1">PgUp</kbd>/<kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">PgDn</kbd> {t('search.toPage')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalSearch;

