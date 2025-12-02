// src/components/admin/content/SeriesCard.jsx
// Component hiển thị Series card với expandable books list

import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';

function SeriesCard({
  seriesItem,
  seriesBooks = [],
  chaptersData = {},
  lessonsData = {},
  quizzesData = {},
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddQuiz,
  onExportItem,
  onImportItem,
  level // ✅ NEW: Need level for export
}) {
  const { t } = useLanguage();
  const [expandedBooks, setExpandedBooks] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  // Calculate lessons and quizzes count
  let lessonsCount = 0;
  let quizzesCount = 0;
  seriesBooks.forEach(book => {
    const chapters = chaptersData[book.id] || [];
    chapters.forEach(chapter => {
      const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
      lessonsCount += lessons.length;
      lessons.forEach(lesson => {
        const quiz = quizzesData[`${book.id}_${chapter.id}_${lesson.id}`];
        if (quiz) quizzesCount++;
      });
    });
  });

  // Get status - Check seriesItem.status first, then fallback to calculated status
  const getStatus = () => {
    if (seriesItem.status) return seriesItem.status; // Use stored status if available
    if (seriesBooks.length === 0) return 'empty';
    // Check if all books have content
    const hasContent = seriesBooks.some(book => {
      const chapters = chaptersData[book.id] || [];
      return chapters.length > 0;
    });
    return hasContent ? 'published' : 'draft';
  };
  const status = getStatus();

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const lastUpdated = seriesItem.updatedAt || seriesItem.createdAt;
  const createdAt = seriesItem.createdAt;

  return (
    <div className="border-[4px] border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-white hover:translate-x-[-2px] hover:translate-y-[-2px]">
      <div
        className="p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <span className={`px-2 py-1 rounded-md border-[2px] border-black text-xs font-black uppercase ${
              status === 'published' ? 'bg-green-500 text-white' :
              status === 'draft' ? 'bg-yellow-400 text-black' :
              'bg-red-500 text-white'
            }`}>
              {status === 'published' ? '🟢' : status === 'draft' ? '🟡' : '🔴'}
            </span>
            <h3 className="font-black text-lg text-black uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>📦 {seriesItem.name}</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(seriesItem);
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
              title={t('contentManagement.series.edit')}
            >
              ✏️
            </button>
            {onExportItem && level && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExportItem('series', level, seriesItem.id);
                }}
                className="px-2 py-1 bg-green-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
                title={t('contentManagement.series.exportSeries')}
              >
                📥
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(seriesItem.id);
              }}
              className="px-2 py-1 bg-red-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
              title={t('contentManagement.series.delete')}
            >
              🗑️
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {seriesItem.description || t('contentManagement.series.noDescription')}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
          <span>📖 {seriesBooks.length} {t('contentManagement.books.title')}</span>
          <span>📝 {lessonsCount} {t('contentManagement.lessons.title')}</span>
          <span>❓ {quizzesCount} {t('contentManagement.quizzes.title')}</span>
          {seriesItem.studentsCount !== undefined && (
            <span>👥 {seriesItem.studentsCount || 0} Students</span>
          )}
          {seriesItem.rating !== undefined && seriesItem.rating > 0 && (
            <span>⭐ {seriesItem.rating.toFixed(1)}/5</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {lastUpdated && (
            <span>📅 {t('contentManagement.series.updated')} {formatDate(lastUpdated)}</span>
          )}
          {createdAt && (
            <span>📅 {t('contentManagement.series.created')} {formatDate(createdAt)}</span>
          )}
          {seriesItem.createdBy && (
            <span>👤 {t('contentManagement.series.by')} {seriesItem.createdBy}</span>
          )}
        </div>
      </div>
      
      {/* Expanded Books List */}
      {isExpanded && (
        <div className="border-t-[3px] border-black p-4 bg-yellow-400/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">📚 {t('contentManagement.series.booksInSeries')}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddBook(seriesItem.name); // ✅ Truyền series name vào
              }}
              className="px-3 py-1 bg-green-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 uppercase"
            >
              ➕ {t('contentManagement.series.addBook')}
            </button>
          </div>
          {seriesBooks.length === 0 ? (
            <p className="text-sm text-gray-500 italic">{t('contentManagement.series.noBooksInSeries')}</p>
          ) : (
            <div className="space-y-2">
              {seriesBooks.map(book => {
                const bookChapters = chaptersData[book.id] || [];
                let bookLessons = 0;
                let bookQuizzes = 0;
                bookChapters.forEach(chapter => {
                  const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
                  bookLessons += lessons.length;
                  lessons.forEach(lesson => {
                    if (quizzesData[`${book.id}_${chapter.id}_${lesson.id}`]) bookQuizzes++;
                  });
                });

                const isBookExpanded = !!expandedBooks[book.id];

                return (
                  <div
                    key={book.id}
                    className="bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
                    onClick={() =>
                      setExpandedBooks(prev => ({
                        ...prev,
                        [book.id]: !prev[book.id]
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-gray-700 font-mono text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedBooks(prev => ({
                                ...prev,
                                [book.id]: !prev[book.id]
                              }));
                            }}
                          >
                            {isBookExpanded ? '▼' : '▶'}
                          </span>
                          <span className="font-semibold text-gray-800">📘 {book.title}</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            🟢 Published
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span>{bookChapters.length} {t('contentManagement.series.chapters')}</span>
                          <span>|</span>
                          <span>{bookLessons} {t('contentManagement.lessons.title')}</span>
                          <span>|</span>
                          <span>{bookQuizzes} {t('contentManagement.quizzes.title')}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddChapter && onAddChapter(book);
                          }}
                          className="px-2 py-1 bg-green-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 uppercase"
                          title={t('contentManagement.series.addChapter')}
                        >
                          ➕ {t('common.chapter')}
                        </button>
                        {onExportItem && level && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onExportItem('book', level, book.id);
                            }}
                            className="px-2 py-1 bg-green-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
                            title={t('contentManagement.series.exportBook')}
                          >
                            📥
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBook && onEditBook(book);
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
                          title={t('contentManagement.series.editBook')}
                        >
                          ✏️
                        </button>
                        {onDeleteBook && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBook(book.id);
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
                            title={t('contentManagement.series.deleteBook')}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    {isBookExpanded && (
                      <div className="mt-3 border-t-[2px] border-dashed border-black pt-2">
                        <div className="text-xs font-bold text-gray-800 mb-1">
                          📑 {t('contentManagement.series.chapters')}
                        </div>
                        {bookChapters.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">
                            {t('contentManagement.empty.noChapters')}
                          </p>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {bookChapters.map((chapter) => {
                              const chapterKey = `${book.id}_${chapter.id}`;
                              const lessons = lessonsData[chapterKey] || [];
                              let chapterQuizzes = 0;
                              lessons.forEach((lesson) => {
                                if (quizzesData[`${book.id}_${chapter.id}_${lesson.id}`]) {
                                  chapterQuizzes++;
                                }
                              });

                              const isChapterExpanded = !!expandedChapters[chapterKey];

                              return (
                                <li
                                  key={chapter.id}
                                  className="bg-yellow-50 border border-black/40 rounded px-2 py-1 space-y-1"
                                >
                                  {/* Header dòng chương */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedChapters(prev => ({
                                            ...prev,
                                            [chapterKey]: !prev[chapterKey]
                                          }));
                                        }}
                                        className="text-gray-700 font-mono text-xs"
                                      >
                                        {isChapterExpanded ? '▼' : '▶'}
                                      </button>
                                      <span>📄 {chapter.title || chapter.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                      <span>{lessons.length} {t('contentManagement.lessons.title')}</span>
                                      <span>|</span>
                                      <span>{chapterQuizzes} {t('contentManagement.quizzes.title')}</span>
                                      {onAddLesson && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onAddLesson(book, chapter);
                                          }}
                                          className="ml-2 px-2 py-0.5 bg-purple-500 text-white rounded-md border-[1.5px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase"
                                          title={t('contentManagement.series.addLesson')}
                                        >
                                          ➕ {t('contentManagement.lessons.title')}
                                        </button>
                                      )}
                                      {onEditChapter && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onEditChapter(chapter, book);
                                          }}
                                          className="px-2 py-0.5 bg-blue-500 text-white rounded-md border-[1.5px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase"
                                          title={t('contentManagement.series.editChapter')}
                                        >
                                          ✏️
                                        </button>
                                      )}
                                      {onDeleteChapter && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteChapter(book.id, chapter.id);
                                          }}
                                          className="px-2 py-0.5 bg-red-500 text-white rounded-md border-[1.5px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase"
                                          title={t('contentManagement.series.deleteChapter')}
                                        >
                                          🗑️
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Danh sách bài trong chương (dropdown) */}
                                  {isChapterExpanded && lessons.length > 0 && (
                                    <ul className="pl-4 border-l-2 border-dashed border-black/50 space-y-0.5 text-[11px] text-gray-700">
                                      {lessons.map((lesson) => (
                                        <li key={lesson.id} className="flex items-center justify-between">
                                          <div className="flex items-center gap-1">
                                            <span>📘</span>
                                            <span>{lesson.title || lesson.id}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            {quizzesData[`${book.id}_${chapter.id}_${lesson.id}`] ? (
                                              <span className="text-green-700 font-semibold">✅ Quiz</span>
                                            ) : (
                                              onAddQuiz && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddQuiz(book, chapter, lesson);
                                                  }}
                                                  className="px-2 py-0.5 bg-orange-500 text-white rounded-md border-[1.5px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase"
                                                  title={t('contentManagement.series.addQuiz')}
                                                >
                                                  ➕ {t('contentManagement.quizzes.title')}
                                                </button>
                                              )
                                            )}
                                            {onEditLesson && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onEditLesson(lesson, book, chapter);
                                                }}
                                                className="px-2 py-0.5 bg-blue-500 text-white rounded-md border-[1.5px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase"
                                                title={t('contentManagement.series.editLesson')}
                                              >
                                                ✏️
                                              </button>
                                            )}
                                            {onDeleteLesson && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onDeleteLesson(book.id, chapter.id, lesson.id);
                                                }}
                                                className="px-2 py-0.5 bg-red-500 text-white rounded-md border-[1.5px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase"
                                                title={t('contentManagement.series.deleteLesson')}
                                              >
                                                🗑️
                                              </button>
                                            )}
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SeriesCard;

