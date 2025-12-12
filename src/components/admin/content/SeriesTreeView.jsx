// src/components/admin/content/SeriesTreeView.jsx
// Component hiển thị Series dạng tree (hierarchical)

import React, { useState } from 'react';

function SeriesTreeView({
  series,
  booksBySeries,
  chaptersData,
  lessonsData,
  quizzesData,
  onEditSeries,
  onEditBook,
  onEditChapter,
  onEditLesson,
  onDeleteSeries,
  onDeleteBook,
  onDeleteChapter,
  onDeleteLesson,
  onAddBook, // ✅ NEW: Add book handler
  onAddChapter, // ✅ NEW: Add chapter handler
  onAddLesson, // ✅ NEW: Add lesson handler
  onAddQuiz, // ✅ NEW: Add quiz handler
  onDeleteQuiz, // ✅ NEW: Delete quiz handler
  onReorderLessons // ✅ NEW: Reorder lessons handler
}) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [draggedLesson, setDraggedLesson] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const allNodes = {};
    series.forEach(s => {
      allNodes[`series-${s.id}`] = true;
      const books = booksBySeries[s.id] || [];
      books.forEach(book => {
        allNodes[`book-${book.id}`] = true;
        const chapters = chaptersData[book.id] || [];
        chapters.forEach(ch => {
          allNodes[`chapter-${book.id}-${ch.id}`] = true;
        });
      });
    });
    setExpandedNodes(allNodes);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const getSeriesStatus = (seriesItem) => {
    // Use stored status if available
    if (seriesItem.status) return seriesItem.status;
    
    const seriesBooks = booksBySeries[seriesItem.id] || [];
    if (seriesBooks.length === 0) return 'empty';
    
    // Check if all books have content
    const hasContent = seriesBooks.some(book => {
      const chapters = chaptersData[book.id] || [];
      return chapters.length > 0;
    });
    return hasContent ? 'published' : 'draft';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">🌲 Tree View</h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="font-mono text-sm space-y-1">
        {series.map(seriesItem => {
          const seriesBooks = booksBySeries[seriesItem.id] || [];
          const status = getSeriesStatus(seriesItem);
          const isExpanded = expandedNodes[`series-${seriesItem.id}`];
          
          // Calculate stats
          let totalLessons = 0;
          let totalQuizzes = 0;
          seriesBooks.forEach(book => {
            const chapters = chaptersData[book.id] || [];
            chapters.forEach(chapter => {
              const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
              totalLessons += lessons.length;
              lessons.forEach(lesson => {
                if (quizzesData[`${book.id}_${chapter.id}_${lesson.id}`]) totalQuizzes++;
              });
            });
          });

          return (
            <div key={seriesItem.id} className="pl-0">
              {/* Series Node */}
              <div 
                className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleNode(`series-${seriesItem.id}`);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="text-gray-600 hover:text-gray-800 w-6 text-center focus:outline-none z-10"
                  title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  status === 'published' ? 'bg-green-100 text-green-800' :
                  status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status === 'published' ? '🟢' : status === 'draft' ? '🟡' : '🔴'}
                </span>
                <span className="font-semibold text-gray-800">📦 {seriesItem.name}</span>
                <span className="text-xs text-gray-500">
                  ({seriesBooks.length} Books, {totalLessons} Lessons, {totalQuizzes} Quizzes)
                </span>
                <div className="flex gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    draggable={false}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onEditSeries(seriesItem)}
                    className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    draggable={false}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onDeleteSeries(seriesItem.id)}
                    className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Books in Series */}
              {isExpanded && (
                <div className="pl-6 space-y-1">
                  {seriesBooks.length === 0 ? (
                    <div className="text-xs text-gray-400 italic pl-6">No books</div>
                  ) : (
                    seriesBooks.map(book => {
                      const bookChapters = chaptersData[book.id] || [];
                      const isBookExpanded = expandedNodes[`book-${book.id}`];
                      
                      let bookLessons = 0;
                      let bookQuizzes = 0;
                      bookChapters.forEach(chapter => {
                        const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
                        bookLessons += lessons.length;
                        lessons.forEach(lesson => {
                          if (quizzesData[`${book.id}_${chapter.id}_${lesson.id}`]) bookQuizzes++;
                        });
                      });

                      return (
                        <div key={book.id} className="pl-0">
                          {/* Book Node */}
                          <div 
                            className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded"
                            onClick={(e) => {
                              // Prevent click from bubbling up to parent
                              e.stopPropagation();
                            }}
                          >
                            <button
                              draggable={false}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleNode(`book-${book.id}`);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="text-gray-600 hover:text-gray-800 w-6 text-center focus:outline-none z-10"
                              title={isBookExpanded ? 'Thu gọn' : 'Mở rộng'}
                            >
                              {isBookExpanded ? '▼' : '▶'}
                            </button>
                            <span className="font-medium text-gray-700">📘 {book.title}</span>
                            <span className="text-xs text-gray-500">
                              ({bookChapters.length} Chapters, {bookLessons} Lessons, {bookQuizzes} Quizzes)
                            </span>
                            <div className="flex gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                              {onAddChapter && (
                                <button
                                  type="button"
                                  onClick={() => onAddChapter(book)}
                                  className="px-2 py-0.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                  title="Add Chapter"
                                >
                                  ➕ Chapter
                                </button>
                              )}
                              <button
                                type="button"
                                draggable={false}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => onEditBook(book)}
                                className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                title="Edit Book"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                draggable={false}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => onDeleteBook(book.id)}
                                className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                title="Delete Book"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Chapters in Book */}
                          {isBookExpanded && (
                            <div className="pl-6 space-y-1">
                              {bookChapters.length === 0 ? (
                                <div className="text-xs text-gray-400 italic pl-6">No chapters</div>
                              ) : (
                                bookChapters.map(chapter => {
                                  const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
                                  const isChapterExpanded = expandedNodes[`chapter-${book.id}-${chapter.id}`];
                                  
                                  let chapterQuizzes = 0;
                                  lessons.forEach(lesson => {
                                    if (quizzesData[`${book.id}_${chapter.id}_${lesson.id}`]) chapterQuizzes++;
                                  });

                                  return (
                                    <div key={chapter.id} className="pl-0">
                                      {/* Chapter Node - Level 2 */}
                                      <div 
                                        className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded"
                                        onClick={(e) => {
                                          // Prevent any click on this div from bubbling up
                                          e.stopPropagation();
                                        }}
                                      >
                                        <button
                                          draggable={false}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleNode(`chapter-${book.id}-${chapter.id}`);
                                          }}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                          }}
                                          className="text-gray-600 hover:text-gray-800 w-6 text-center focus:outline-none z-10"
                                          title={isChapterExpanded ? 'Thu gọn' : 'Mở rộng'}
                                        >
                                          {isChapterExpanded ? '▼' : '▶'}
                                        </button>
                                        <span 
                                          className="text-gray-600 font-medium flex-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          📑 {chapter.title || chapter.id}
                                        </span>
                                        <span 
                                          className="text-xs text-gray-500"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          ({lessons.length} Lessons, {chapterQuizzes} Quizzes)
                                        </span>
                                        <div 
                                          className="flex gap-1 ml-auto"
                                          onClick={(e) => e.stopPropagation()}
                                          onMouseDown={(e) => e.stopPropagation()}
                                        >
                                          {onAddLesson && (
                                            <button
                                              type="button"
                                              draggable={false}
                                              onMouseDown={(e) => e.stopPropagation()}
                                              onClick={() => onAddLesson(book, chapter)}
                                              className="px-2 py-0.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                                              title="Add Lesson"
                                            >
                                              ➕ Lesson
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            draggable={false}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={() => onEditChapter(book, chapter)}
                                            className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                            title="Edit Chapter"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            type="button"
                                            draggable={false}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={() => onDeleteChapter(book.id, chapter.id)}
                                            className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                            title="Delete Chapter"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>

                                      {/* Lessons in Chapter - Level 3 */}
                                      {isChapterExpanded && (
                                        <div className="pl-6 space-y-1">
                                          {lessons.length === 0 ? (
                                            <div className="text-xs text-gray-400 italic pl-6">No lessons</div>
                                          ) : (
                                            // ✅ Sort lessons by order or extract number from id/title for proper natural ordering
                                            [...lessons].sort((a, b) => {
                                              // First try to sort by order field (if both have it)
                                              if (a.order !== undefined && b.order !== undefined) {
                                                return a.order - b.order;
                                              }
                                              if (a.order !== undefined) return -1;
                                              if (b.order !== undefined) return 1;
                                              
                                              // Extract number from id or title for natural sort (1, 2, ..., 10, 11, ...)
                                              const extractNumber = (lesson) => {
                                                const id = (lesson.id || '').toString();
                                                const title = (lesson.title || '').toString();
                                                
                                                // Priority 1: Try to extract number from title first (e.g., "Từ vựng 25", "Bài 25")
                                                // Match pattern like "Từ vựng 25" or "Bài 25" - get the number at the end
                                                const titleMatch = title.match(/(\d+)\s*$/);
                                                if (titleMatch) {
                                                  return parseInt(titleMatch[1], 10);
                                                }
                                                
                                                // Also try to match any number in title (fallback)
                                                const titleMatches = title.match(/\d+/g);
                                                if (titleMatches && titleMatches.length > 0) {
                                                  // Get the last number (usually the lesson number)
                                                  const lastMatch = titleMatches[titleMatches.length - 1];
                                                  return parseInt(lastMatch, 10);
                                                }
                                                
                                                // Priority 2: Try to extract number from id (e.g., "lesson-25", "tu-vung-25")
                                                // Match pattern like "lesson-25" or "tu-vung-25" - get number after dash
                                                const idMatch = id.match(/-(\d+)$/);
                                                if (idMatch) {
                                                  return parseInt(idMatch[1], 10);
                                                }
                                                
                                                // Also try to match any number in id (fallback)
                                                const idMatches = id.match(/\d+/g);
                                                if (idMatches && idMatches.length > 0) {
                                                  // Get the last number from id
                                                  const lastMatch = idMatches[idMatches.length - 1];
                                                  return parseInt(lastMatch, 10);
                                                }
                                                
                                                // If no number found, put at the end
                                                return 999999;
                                              };
                                              
                                              const numA = extractNumber(a);
                                              const numB = extractNumber(b);
                                              
                                              // Debug log (can be removed later)
                                              if (numA === 999999 || numB === 999999) {
                                                console.log('⚠️ [Sort] Could not extract number:', {
                                                  a: { id: a.id, title: a.title, extracted: numA },
                                                  b: { id: b.id, title: b.title, extracted: numB }
                                                });
                                              }
                                              
                                              // Natural sort: if numbers are equal, sort by id/title alphabetically
                                              if (numA === numB && numA !== 999999) {
                                                return (a.title || a.id || '').localeCompare(b.title || b.id || '');
                                              }
                                              
                                              return numA - numB;
                                            }).map(lesson => {
                                              const hasQuiz = !!quizzesData[`${book.id}_${chapter.id}_${lesson.id}`];
                                              // ✅ Fix title display: if title is just a number, use id or format properly
                                              const displayTitle = (() => {
                                                const title = lesson.title || '';
                                                const id = lesson.id || '';
                                                // If title is empty or just a number, try to use id or format
                                                if (!title || /^\d+$/.test(title.trim())) {
                                                  // If id contains "Từ vựng" or similar pattern, use it
                                                  if (id.includes('Từ vựng') || id.includes('từ-vựng')) {
                                                    const numMatch = (title || id).match(/(\d+)/);
                                                    return numMatch ? `Từ vựng ${numMatch[1]}` : (id || title || 'Untitled');
                                                  }
                                                  // Otherwise, use id if it's more descriptive
                                                  return id || title || 'Untitled';
                                                }
                                                return title;
                                              })();
                                              
                                              const sortedLessons = [...lessons].sort((a, b) => {
                                                if (a.order !== undefined && b.order !== undefined) {
                                                  return a.order - b.order;
                                                }
                                                if (a.order !== undefined) return -1;
                                                if (b.order !== undefined) return 1;
                                                
                                                const extractNumber = (l) => {
                                                  const id = (l.id || '').toString();
                                                  const title = (l.title || '').toString();
                                                  const titleMatch = title.match(/(\d+)\s*$/);
                                                  if (titleMatch) return parseInt(titleMatch[1], 10);
                                                  const titleMatches = title.match(/\d+/g);
                                                  if (titleMatches && titleMatches.length > 0) {
                                                    return parseInt(titleMatches[titleMatches.length - 1], 10);
                                                  }
                                                  const idMatch = id.match(/-(\d+)$/);
                                                  if (idMatch) return parseInt(idMatch[1], 10);
                                                  const idMatches = id.match(/\d+/g);
                                                  if (idMatches && idMatches.length > 0) {
                                                    return parseInt(idMatches[idMatches.length - 1], 10);
                                                  }
                                                  return 999999;
                                                };
                                                
                                                const numA = extractNumber(a);
                                                const numB = extractNumber(b);
                                                if (numA === numB && numA !== 999999) {
                                                  return (a.title || a.id || '').localeCompare(b.title || b.id || '');
                                                }
                                                return numA - numB;
                                              });
                                              
                                              const lessonIndex = sortedLessons.findIndex(l => l.id === lesson.id);
                                              const isDragging = draggedLesson === lesson.id;
                                              const isDragOver = dragOverIndex === lessonIndex;
                                              
                                              return (
                                                <div 
                                                  key={lesson.id} 
                                                  draggable={onReorderLessons ? true : false}
                                                  onDragStart={(e) => {
                                                    if (!onReorderLessons) {
                                                      e.preventDefault();
                                                      return false;
                                                    }
                                                    
                                                    // Prevent drag if starting from a button
                                                    const target = e.target;
                                                    if (target.tagName === 'BUTTON' || target.closest('button')) {
                                                      e.preventDefault();
                                                      return false;
                                                    }
                                                    
                                                    // Set drag data
                                                    setDraggedLesson(lesson.id);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                    e.dataTransfer.setData('text/plain', lesson.id);
                                                    e.dataTransfer.setData('application/json', JSON.stringify({ lessonId: lesson.id, bookId: book.id, chapterId: chapter.id }));
                                                    
                                                    // Add visual feedback
                                                    e.currentTarget.style.opacity = '0.5';
                                                    
                                                    console.log('🎯 [Drag Drop] Start dragging:', lesson.id);
                                                  }}
                                                  onDragOver={(e) => {
                                                    if (!onReorderLessons) return;
                                                    
                                                    // Prevent default to allow drop
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    
                                                    // Set drop effect
                                                    e.dataTransfer.dropEffect = 'move';
                                                    
                                                    // Update drag over index
                                                    setDragOverIndex(lessonIndex);
                                                  }}
                                                  onDragEnter={(e) => {
                                                    if (!onReorderLessons) return;
                                                    
                                                    // Prevent default
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    
                                                    // Only highlight if not the dragged item
                                                    if (draggedLesson !== lesson.id) {
                                                      setDragOverIndex(lessonIndex);
                                                    }
                                                  }}
                                                  onDragLeave={(e) => {
                                                    // Only clear if actually leaving the element
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const x = e.clientX;
                                                    const y = e.clientY;
                                                    
                                                    // Check if mouse is outside the element
                                                    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                                                      setDragOverIndex(null);
                                                    }
                                                  }}
                                                  onDrop={(e) => {
                                                    if (!onReorderLessons) return;
                                                    
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    
                                                    const draggedId = e.dataTransfer.getData('text/plain');
                                                    console.log('🎯 [Drag Drop] Drop event:', { draggedId, targetId: lesson.id, lessonIndex });
                                                    
                                                    if (draggedId && draggedId !== lesson.id) {
                                                      const fromIndex = sortedLessons.findIndex(l => l.id === draggedId);
                                                      const toIndex = lessonIndex;
                                                      
                                                      console.log('🎯 [Drag Drop] Reordering:', { fromIndex, toIndex, draggedId, targetId: lesson.id });
                                                      
                                                      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                                                        onReorderLessons(book, chapter, fromIndex, toIndex, sortedLessons);
                                                      }
                                                    }
                                                    
                                                    // Reset drag state
                                                    setDraggedLesson(null);
                                                    setDragOverIndex(null);
                                                    
                                                    // Reset opacity
                                                    e.currentTarget.style.opacity = '1';
                                                  }}
                                                  onDragEnd={(e) => {
                                                    // Reset drag state
                                                    setDraggedLesson(null);
                                                    setDragOverIndex(null);
                                                    
                                                    // Reset opacity
                                                    e.currentTarget.style.opacity = '1';
                                                    
                                                    console.log('🎯 [Drag Drop] Drag ended');
                                                  }}
                                                  onClick={(e) => {
                                                    // Prevent click from bubbling up to parent
                                                    e.stopPropagation();
                                                  }}
                                                  onMouseDown={(e) => {
                                                    // Allow drag from anywhere except buttons
                                                    if (onReorderLessons) {
                                                      const target = e.target;
                                                      if (target.tagName !== 'BUTTON' && !target.closest('button')) {
                                                        // This will allow drag to start
                                                        e.stopPropagation();
                                                      }
                                                    }
                                                  }}
                                                  className={`flex items-center gap-2 py-1 rounded pl-2 border-l-2 border-dashed transition-all ${
                                                    isDragging 
                                                      ? 'opacity-50 bg-blue-100 border-blue-400' 
                                                      : isDragOver 
                                                        ? 'bg-yellow-100 border-yellow-400 border-l-4' 
                                                        : 'hover:bg-gray-50 border-gray-300'
                                                  } ${onReorderLessons ? 'cursor-move' : ''}`}
                                                  title={onReorderLessons ? "Kéo thả để sắp xếp lại thứ tự (trừ các nút bấm)" : ""}
                                                >
                                                  {onReorderLessons && (
                                                    <div 
                                                      className="mr-2 select-none cursor-move inline-flex items-center justify-center rounded border border-gray-400 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                                      style={{ 
                                                        userSelect: 'none', 
                                                        WebkitUserSelect: 'none',
                                                        pointerEvents: 'auto',
                                                        touchAction: 'none',
                                                        width: '24px',
                                                        height: '24px',
                                                        lineHeight: '1'
                                                      }}
                                                      title="Kéo để sắp xếp lại thứ tự"
                                                    >
                                                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                      </svg>
                                                    </div>
                                                  )}
                                                  <span 
                                                    className="text-gray-600 text-sm flex-1 select-none"
                                                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                                  >
                                                    📖 {displayTitle}
                                                  </span>
                                                  
                                                  {/* Quiz Status & Actions */}
                                                  <div 
                                                    className="flex items-center gap-2" 
                                                    onMouseDown={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                    }}
                                                    style={{ pointerEvents: 'auto' }}
                                                  >
                                                    {hasQuiz ? (
                                                      <>
                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold border border-green-300">
                                                          ✅ Quiz
                                                        </span>
                                                        {onDeleteQuiz && (
                                                          <button
                                                            type="button"
                                                            draggable={false}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={() => {
                                                              if (confirm(`⚠️ Bạn có chắc muốn xóa quiz của bài "${lesson.title || lesson.id}"?`)) {
                                                                onDeleteQuiz(book, chapter, lesson);
                                                              }
                                                            }}
                                                            className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                                            title="Delete Quiz"
                                                          >
                                                            🗑️ Quiz
                                                          </button>
                                                        )}
                                                      </>
                                                    ) : (
                                                      <>
                                                        <span className="text-xs text-gray-400">(No quiz)</span>
                                                        {onAddQuiz && (
                                                          <button
                                                            type="button"
                                                            draggable={false}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={() => onAddQuiz(book, chapter, lesson)}
                                                            className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                                            title="Add Quiz"
                                                          >
                                                            ➕ Quiz
                                                          </button>
                                                        )}
                                                      </>
                                                    )}
                                                    
                                                    {/* Lesson Actions */}
                                                    <div 
                                                      className="flex gap-1"
                                                      onClick={(e) => e.stopPropagation()}
                                                      onMouseDown={(e) => e.stopPropagation()}
                                                    >
                                                      <button
                                                        type="button"
                                                        draggable={false}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                      onClick={() => onEditLesson(book, chapter, lesson)}
                                                        className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                                        title="Edit Lesson"
                                                      >
                                                        ✏️
                                                      </button>
                                                      <button
                                                        type="button"
                                                        draggable={false}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                      onClick={() => onDeleteLesson(book.id, chapter.id, lesson.id)}
                                                        className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                                        title="Delete Lesson"
                                                      >
                                                        🗑️
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SeriesTreeView;

