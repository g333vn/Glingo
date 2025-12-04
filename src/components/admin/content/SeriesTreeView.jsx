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
  onDeleteQuiz // ✅ NEW: Delete quiz handler
}) {
  const [expandedNodes, setExpandedNodes] = useState({});

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
              <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded">
                <button
                  onClick={() => toggleNode(`series-${seriesItem.id}`)}
                  className="text-gray-600 hover:text-gray-800 w-6 text-center"
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
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => onEditSeries(seriesItem)}
                    className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
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
                          <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded">
                            <button
                              onClick={() => toggleNode(`book-${book.id}`)}
                              className="text-gray-600 hover:text-gray-800 w-6 text-center"
                            >
                              {isBookExpanded ? '▼' : '▶'}
                            </button>
                            <span className="font-medium text-gray-700">📘 {book.title}</span>
                            <span className="text-xs text-gray-500">
                              ({bookChapters.length} Chapters, {bookLessons} Lessons, {bookQuizzes} Quizzes)
                            </span>
                            <div className="flex gap-1 ml-auto">
                              {onAddChapter && (
                                <button
                                  onClick={() => onAddChapter(book)}
                                  className="px-2 py-0.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                  title="Add Chapter"
                                >
                                  ➕ Chapter
                                </button>
                              )}
                              <button
                                onClick={() => onEditBook(book)}
                                className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                title="Edit Book"
                              >
                                ✏️
                              </button>
                              <button
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
                                      <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded">
                                        <button
                                          onClick={() => toggleNode(`chapter-${book.id}-${chapter.id}`)}
                                          className="text-gray-600 hover:text-gray-800 w-6 text-center"
                                        >
                                          {isChapterExpanded ? '▼' : '▶'}
                                        </button>
                                        <span className="text-gray-600 font-medium">📑 {chapter.title || chapter.id}</span>
                                        <span className="text-xs text-gray-500">
                                          ({lessons.length} Lessons, {chapterQuizzes} Quizzes)
                                        </span>
                                        <div className="flex gap-1 ml-auto">
                                          {onAddLesson && (
                                            <button
                                              onClick={() => onAddLesson(book, chapter)}
                                              className="px-2 py-0.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                                              title="Add Lesson"
                                            >
                                              ➕ Lesson
                                            </button>
                                          )}
                                          <button
                                            onClick={() => onEditChapter(chapter)}
                                            className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                            title="Edit Chapter"
                                          >
                                            ✏️
                                          </button>
                                          <button
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
                                            lessons.map(lesson => {
                                              const hasQuiz = !!quizzesData[`${book.id}_${chapter.id}_${lesson.id}`];
                                              return (
                                                <div key={lesson.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded pl-2 border-l-2 border-dashed border-gray-300">
                                                  <span className="text-gray-600 text-sm">📖 {lesson.title || lesson.id}</span>
                                                  
                                                  {/* Quiz Status & Actions */}
                                                  {hasQuiz ? (
                                                    <>
                                                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold border border-green-300">
                                                        ✅ Quiz
                                                      </span>
                                                      {onDeleteQuiz && (
                                                        <button
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
                                                  <div className="flex gap-1 ml-auto">
                                                    <button
                                                      onClick={() => onEditLesson(lesson)}
                                                      className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                                      title="Edit Lesson"
                                                    >
                                                      ✏️
                                                    </button>
                                                    <button
                                                      onClick={() => onDeleteLesson(book.id, chapter.id, lesson.id)}
                                                      className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                                      title="Delete Lesson"
                                                    >
                                                      🗑️
                                                    </button>
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

