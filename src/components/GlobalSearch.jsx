// src/components/GlobalSearch.jsx
// 🔍 Smart Global Search - Search everything (pages, features, content, settings)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import storageManager from '../utils/localStorageManager.js';
import { searchItems, getCategoryLabel } from '../config/searchableItems.js';

function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({
    items: [],      // Searchable items (pages, features, settings)
    books: [],
    chapters: [],
    lessons: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Get user role for filtering
  const userRole = user?.role || null;
  
  // Open search with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Smart Search Logic - 1 character minimum
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults({ items: [], books: [], chapters: [], lessons: [] });
      return;
    }
    
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.toLowerCase();
        const searchResults = {
          items: [],
          books: [],
          chapters: [],
          lessons: []
        };
        
        // 1. Search searchable items (pages, features, settings) - INSTANT
        const matchedItems = searchItems(query, userRole);
        searchResults.items = matchedItems.slice(0, 8); // Top 8 most relevant
        
        // 2. Search content (books, chapters, lessons) - only if query >= 2 chars
        if (query.length >= 2) {
          const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
          
          for (const level of levels) {
            // Search books
            const books = await storageManager.getBooks(level);
            if (books) {
              const matchedBooks = books.filter(book =>
                book.title?.toLowerCase().includes(query) ||
                book.id?.toLowerCase().includes(query)
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
                    chapter.title?.toLowerCase().includes(query) ||
                    chapter.id?.toLowerCase().includes(query)
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
                        lesson.title?.toLowerCase().includes(query) ||
                        lesson.id?.toLowerCase().includes(query) ||
                        lesson.description?.toLowerCase().includes(query)
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
        searchResults.books = searchResults.books.slice(0, 5);
        searchResults.chapters = searchResults.chapters.slice(0, 5);
        searchResults.lessons = searchResults.lessons.slice(0, 8);
        
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    // Faster debounce for instant feel
    const debounce = setTimeout(performSearch, 150);
    return () => clearTimeout(debounce);
  }, [searchQuery, userRole]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      const allResults = [
        ...results.items,
        ...results.books,
        ...results.chapters,
        ...results.lessons
      ];
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allResults[selectedIndex]) {
        e.preventDefault();
        handleResultClick(allResults[selectedIndex]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);
  
  // Navigate to result
  const handleResultClick = (result) => {
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
    
    setIsOpen(false);
    setSearchQuery('');
  };
  
  const totalResults = results.items.length + results.books.length + results.chapters.length + results.lessons.length;
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-3 sm:right-4 md:right-6 z-50 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-500 text-white rounded-full border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center gap-2"
        aria-label="Search"
      >
        <span className="text-lg sm:text-xl">🔍</span>
        <span className="hidden md:inline text-sm">Search (Ctrl+K)</span>
      </button>
    );
  }
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
      />
      
      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-2xl px-4">
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b-[3px] border-black">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <input
                ref={inputRef}
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-lg font-bold focus:outline-none"
              />
              {isSearching && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              )}
            </div>
          </div>
          
          {/* Results */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto p-4">
            {searchQuery.length < 1 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">{t('search.minChars')}</p>
                <p className="text-xs mt-2">{t('search.shortcut')}: <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">K</kbd></p>
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
              <div className="space-y-4">{/* Searchable Items (Pages, Features, Settings) */}
                {results.items.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">
                      ⚡ {t('search.quickSuggestions')} ({results.items.length})
                    </h3>
                    <div className="space-y-2">
                      {results.items.map((item, index) => {
                        const categoryInfo = getCategoryLabel(item.category);
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
                            onClick={() => handleResultClick(item)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] hover:shadow-md transition-all ${
                              selectedIndex === index 
                                ? `${bgColors[categoryInfo.color]} shadow-md scale-[1.02]` 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                                  <span className="truncate">{item.title}</span>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${textColors[categoryInfo.color]} bg-white border border-current`}>
                                    {t(categoryInfo.labelKey)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 truncate">{item.description}</div>
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
                        const globalIndex = results.items.length + index;
                        return (
                          <button
                            key={`book-${book.id}`}
                            onClick={() => handleResultClick(book)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-blue-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-100' : ''
                            }`}
                          >
                            <div className="font-bold text-gray-800">{book.title}</div>
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
                        const globalIndex = results.items.length + results.books.length + index;
                        return (
                          <button
                            key={`chapter-${chapter.id}`}
                            onClick={() => handleResultClick(chapter)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-blue-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-100' : ''
                            }`}
                          >
                            <div className="font-bold text-gray-800">{chapter.title}</div>
                            <div className="text-xs text-gray-500">{chapter.bookTitle} • {chapter.level.toUpperCase()}</div>
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
                        const globalIndex = results.items.length + results.books.length + results.chapters.length + index;
                        return (
                          <button
                            key={`lesson-${lesson.id}`}
                            onClick={() => handleResultClick(lesson)}
                            className={`w-full text-left p-3 rounded-lg border-[2px] border-black hover:bg-blue-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-100' : ''
                            }`}
                          >
                            <div className="font-bold text-gray-800">{lesson.title}</div>
                            <div className="text-xs text-gray-500">
                              {lesson.bookTitle} → {lesson.chapterTitle} • {lesson.level.toUpperCase()}
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
                      <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] ml-1">Enter</kbd> {t('search.toSelect')}
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

