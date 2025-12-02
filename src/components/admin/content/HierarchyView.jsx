// src/components/admin/content/HierarchyView.jsx
// Component hiển thị hierarchy navigation với step-by-step flow

import React, { useMemo } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import SeriesListView from './SeriesListView.jsx';

function HierarchyView({
  selectedLevel,
  hierarchyPath,
  setHierarchyPath,
  books,
  series,
  chaptersData,
  lessonsData,
  quizzesData,
  booksWithChapters,
  searchQuery = '',
  statusFilter = 'all',
  sortBy = 'name',
  viewType = 'card',
  seriesPage = 1,
  setSeriesPage,
  itemsPerPage = 10,
  expandedSeries = {},
  setExpandedSeries,
  onAddSeries,
  onAddBook,
  onAddChapter,
  onAddLesson,
  onAddQuiz,
  onEditSeries,
  onEditBook,
  onEditChapter,
  onEditLesson,
  onEditQuiz,
  onDeleteSeries,
  onDeleteBook,
  onDeleteChapter,
  onDeleteLesson,
  onDeleteQuiz,
}) {
  const { t } = useLanguage();
  // Group books by series (use seriesId as key để ổn định theo Supabase)
  const booksBySeries = useMemo(() => {
    const grouped = {};
    booksWithChapters.forEach(book => {
      const key = book.seriesId || '__no_series__';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(book);
    });
    return grouped;
  }, [booksWithChapters]);

  // Get current series from hierarchyPath
  const currentSeries = hierarchyPath.series 
    ? series.find(s => s.id === hierarchyPath.series || s.name === hierarchyPath.series)
    : null;

  // Get current book from hierarchyPath
  const currentBook = hierarchyPath.book
    ? booksWithChapters.find(b => b.id === hierarchyPath.book)
    : null;

  // Get current chapter
  const currentChapter = currentBook && hierarchyPath.chapter
    ? (currentBook.chapters || []).find(ch => ch.id === hierarchyPath.chapter)
    : null;

  // Get current lesson
  const currentLesson = currentBook && currentChapter && hierarchyPath.lesson
    ? (lessonsData[`${currentBook.id}_${currentChapter.id}`] || []).find(l => l.id === hierarchyPath.lesson)
    : null;

  // Render based on hierarchy level
  if (!hierarchyPath.level) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('contentManagement.hierarchy.selectLevel')}</h2>
        <p className="text-gray-600">{t('contentManagement.hierarchy.selectLevelHint')}</p>
      </div>
    );
  }

  // ✅ NEW: Show Series List with search, filter, pagination, expandable cards
  if (!hierarchyPath.series) {
    return (
      <SeriesListView
        series={series}
        booksBySeries={booksBySeries}
        chaptersData={chaptersData}
        lessonsData={lessonsData}
        quizzesData={quizzesData}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortBy={sortBy}
        viewType={viewType}
        seriesPage={seriesPage}
        setSeriesPage={setSeriesPage}
        itemsPerPage={itemsPerPage}
        expandedSeries={expandedSeries}
        setExpandedSeries={setExpandedSeries}
        onAddSeries={onAddSeries}
        onEditSeries={onEditSeries}
        onDeleteSeries={onDeleteSeries}
        onAddBook={onAddBook}
        onEditBook={onEditBook}
        onDeleteBook={onDeleteBook}
        onAddChapter={onAddChapter}
        onEditChapter={onEditChapter}
        onDeleteChapter={onDeleteChapter}
        onAddLesson={onAddLesson}
        onEditLesson={onEditLesson}
        onDeleteLesson={onDeleteLesson}
        onAddQuiz={onAddQuiz}
        onSeriesClick={(seriesId) => {
          setHierarchyPath({ ...hierarchyPath, series: seriesId });
        }}
        level={selectedLevel}
      />
    );
  }

  if (!hierarchyPath.book) {
    // Show Books in selected Series
    const seriesBooks = booksBySeries[currentSeries?.id || '__no_series__'] || [];
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Series: {currentSeries?.name || hierarchyPath.series} - {t('contentManagement.hierarchy.selectBook')}
          </h2>
          <button
            onClick={onAddBook}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
          >
            {t('contentManagement.hierarchy.addBook')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seriesBooks.map(book => (
            <div
              key={book.id}
              onClick={() => setHierarchyPath({ ...hierarchyPath, book: book.id })}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg cursor-pointer transition-all bg-gradient-to-br from-white to-purple-50"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800">📚 {book.title}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBook(book);
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBook(book.id);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">ID: {book.id}</p>
              <p className="text-xs text-gray-500">
                {book.chapters?.length || 0} {t('contentManagement.hierarchy.chapters')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hierarchyPath.chapter) {
    // Show Chapters in selected Book
    const bookChapters = currentBook?.chapters || [];
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Book: {currentBook?.title} - {t('contentManagement.hierarchy.selectChapter')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => onAddChapter(currentBook)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
            >
              {t('contentManagement.hierarchy.addChapter')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookChapters.map(chapter => {
            const lessons = lessonsData[`${currentBook.id}_${chapter.id}`] || [];
            return (
              <div
                key={chapter.id}
                onClick={() => setHierarchyPath({ ...hierarchyPath, chapter: chapter.id })}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-lg cursor-pointer transition-all bg-gradient-to-br from-white to-orange-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">📝 {chapter.title || chapter.id}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditChapter(chapter);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(currentBook.id, chapter.id);
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {lessons.length} {t('contentManagement.series.lessons')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!hierarchyPath.lesson) {
    // Show Lessons in selected Chapter
    const chapterLessons = lessonsData[`${currentBook.id}_${currentChapter.id}`] || [];
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Chapter: {currentChapter?.title} - {t('contentManagement.hierarchy.selectLesson')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => onAddLesson(currentBook, currentChapter)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
            >
              {t('contentManagement.hierarchy.addLesson')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapterLessons.map(lesson => {
            const quiz = quizzesData[`${currentBook.id}_${currentChapter.id}_${lesson.id}`];
            return (
              <div
                key={lesson.id}
                onClick={() => setHierarchyPath({ ...hierarchyPath, lesson: lesson.id })}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:shadow-lg cursor-pointer transition-all bg-gradient-to-br from-white to-red-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">📖 {lesson.title || lesson.id}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLesson(lesson);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLesson(currentBook.id, currentChapter.id, lesson.id);
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {quiz ? t('contentManagement.hierarchy.hasQuiz') : t('contentManagement.hierarchy.noQuiz')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Show Quiz for selected Lesson
  const quiz = quizzesData[`${currentBook.id}_${currentChapter.id}_${currentLesson.id}`];
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            📝 Quiz: {currentLesson?.title || currentLesson?.id}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            📚 {currentBook?.title} → 📑 {currentChapter?.title} → 📖 {currentLesson?.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAddQuiz(currentBook, currentChapter, currentLesson)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
          >
            {quiz ? '✏️ Sửa Quiz' : '➕ Thêm Quiz'}
          </button>
          {quiz && (
            <button
              onClick={() => {
                if (confirm('⚠️ Bạn có chắc muốn xóa quiz này?')) {
                  onDeleteQuiz(currentBook.id, currentChapter.id, currentLesson.id);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              🗑️ Xóa Quiz
            </button>
          )}
        </div>
      </div>
      
      {quiz ? (
        <div className="space-y-4">
          {/* Quiz Info */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-blue-800">{quiz.title}</h3>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                {quiz.questions?.length || 0} câu hỏi
              </span>
            </div>
            <div className="text-sm text-blue-600">
              <p>📍 Book: {currentBook?.title}</p>
              <p>📑 Chapter: {currentChapter?.title}</p>
              <p>📖 Lesson: {currentLesson?.title}</p>
            </div>
          </div>

          {/* Questions List */}
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 text-lg">📋 Danh sách câu hỏi:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id || index}
                    className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-gray-800">
                        Câu {index + 1}: {question.text?.substring(0, 50) || 'N/A'}
                        {question.text && question.text.length > 50 ? '...' : ''}
                      </h5>
                    </div>
                    <div className="space-y-1 text-xs">
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-0.5">
                          {question.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`px-2 py-1 rounded ${
                                opt.label === question.correct
                                  ? 'bg-green-100 text-green-800 font-semibold'
                                  : 'bg-white text-gray-700'
                              }`}
                            >
                              <span className="font-medium">{opt.label}:</span> {opt.text || 'N/A'}
                              {opt.label === question.correct && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-gray-700">
                          <span className="font-medium">💡 Giải thích:</span> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">⚠️ Quiz này chưa có câu hỏi nào</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEditQuiz(currentBook, currentChapter, currentLesson)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              ✏️ Sửa Quiz
            </button>
            <button
              onClick={() => {
                if (confirm('⚠️ Bạn có chắc muốn xóa quiz này?')) {
                  onDeleteQuiz(currentBook.id, currentChapter.id, currentLesson.id);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              🗑️ Xóa Quiz
            </button>
            <button
              onClick={() => setHierarchyPath({ ...hierarchyPath, lesson: null })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
            >
              ← Quay lại Danh sách Bài học
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">❓</div>
          <p className="text-lg font-semibold text-gray-700 mb-2">Chưa có quiz cho bài học này</p>
          <p className="text-sm text-gray-600 mb-6">
            Tạo quiz để học sinh có thể làm bài kiểm tra cho bài học "{currentLesson?.title}"
          </p>
          <button
            onClick={() => onAddQuiz(currentBook, currentChapter, currentLesson)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base shadow-lg"
          >
            ➕ Tạo Quiz mới
          </button>
        </div>
      )}
    </div>
  );
}

export default HierarchyView;

