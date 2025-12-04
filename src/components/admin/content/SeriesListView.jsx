// src/components/admin/content/SeriesListView.jsx
// Component quản lý hiển thị Series list với search, filter, sort, pagination

import React, { useMemo } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import SeriesCard from './SeriesCard.jsx';
import SeriesTableView from './SeriesTableView.jsx';
import SeriesTreeView from './SeriesTreeView.jsx';

function SeriesListView({
  series,
  booksBySeries,
  chaptersData,
  lessonsData,
  quizzesData,
  searchQuery,
  statusFilter,
  sortBy,
  viewType,
  seriesPage,
  setSeriesPage,
  itemsPerPage,
  expandedSeries,
  setExpandedSeries,
  onAddSeries,
  onEditSeries,
  onDeleteSeries,
  onAddBook,
  onEditBook,
  onAddChapter,
  onAddLesson,
  onAddQuiz,
  onSeriesClick,
  onExportItem,
  onImportItem,
  level, // ✅ NEW: Need level for export
  onDeleteBook,
  onEditChapter,
  onDeleteChapter,
  onEditLesson,
  onDeleteLesson,
  onDeleteQuiz, // ✅ NEW: Delete quiz handler
}) {
  const { t } = useLanguage();
  // ✅ Helper: Wrap onAddBook để truyền series name
  const handleAddBookWithSeries = (seriesName) => {
    if (onAddBook) {
      onAddBook(seriesName);
    }
  };
  // Helper function to get series status
  const getSeriesStatus = (seriesItem) => {
    // Use stored status if available
    if (seriesItem.status) return seriesItem.status;
    
    const seriesBooks = booksBySeries[seriesItem.name] || [];
    if (seriesBooks.length === 0) return 'empty';
    
    // Check if all books have content
    const hasContent = seriesBooks.some(book => {
      const chapters = chaptersData[book.id] || [];
      return chapters.length > 0;
    });
    return hasContent ? 'published' : 'draft';
  };

  // Filter and sort series
  const filteredAndSortedSeries = useMemo(() => {
    let filtered = series.filter(seriesItem => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = seriesItem.name.toLowerCase().includes(query);
        const matchesDescription = (seriesItem.description || '').toLowerCase().includes(query);
        const seriesBooks = booksBySeries[seriesItem.name] || [];
        const matchesBook = seriesBooks.some(book => 
          book.title.toLowerCase().includes(query) || book.id.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDescription && !matchesBook) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const status = getSeriesStatus(seriesItem);
        if (status !== statusFilter) return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const booksA = booksBySeries[a.name] || [];
      const booksB = booksBySeries[b.name] || [];
      
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          // TODO: Add created_at field
          return 0;
        case 'most-books':
          return booksB.length - booksA.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [series, searchQuery, statusFilter, sortBy, booksBySeries]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSeries.length / itemsPerPage);
  const startIndex = (seriesPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSeries = filteredAndSortedSeries.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {t('contentManagement.series.selectSeries')}
          {filteredAndSortedSeries.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({filteredAndSortedSeries.length} {t('contentManagement.series.series')})
            </span>
          )}
        </h2>
        <button
          onClick={onAddSeries}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
        >
          ➕ {t('contentManagement.series.addSeries')}
        </button>
      </div>
      
      {series.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-base font-medium text-gray-700 mb-2">{t('contentManagement.series.noSeries')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('contentManagement.series.clickToAdd')}</p>
          <button
            onClick={onAddSeries}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            ➕ {t('contentManagement.series.addSeries')}
          </button>
        </div>
      ) : filteredAndSortedSeries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-base font-medium text-gray-700 mb-2">{t('contentManagement.series.noResults')}</p>
          <p className="text-sm text-gray-500">{t('contentManagement.series.tryDifferentFilter')}</p>
        </div>
      ) : (
        <>
          {viewType === 'card' ? (
            <div className="space-y-4">
              {paginatedSeries.map(seriesItem => {
                const seriesBooks = booksBySeries[seriesItem.id] || [];
                const isExpanded = expandedSeries[seriesItem.id];
                
                return (
                  <div key={seriesItem.id}>
                    <SeriesCard
                      seriesItem={seriesItem}
                      seriesBooks={seriesBooks}
                      chaptersData={chaptersData}
                      lessonsData={lessonsData}
                      quizzesData={quizzesData}
                      isExpanded={isExpanded}
                      onToggleExpand={() => {
                        setExpandedSeries(prev => ({ ...prev, [seriesItem.id]: !prev[seriesItem.id] }));
                      }}
                      onEdit={onEditSeries}
                      onDelete={onDeleteSeries}
                      onAddBook={handleAddBookWithSeries}
                      onEditBook={onEditBook}
                      onDeleteBook={onDeleteBook}
                      onAddChapter={onAddChapter}
                      onEditChapter={onEditChapter}
                      onDeleteChapter={onDeleteChapter}
                      onAddLesson={onAddLesson}
                      onEditLesson={onEditLesson}
                      onDeleteLesson={onDeleteLesson}
                      onAddQuiz={onAddQuiz}
                      onDeleteQuiz={onDeleteQuiz}
                      onExportItem={onExportItem}
                      onImportItem={onImportItem}
                      level={level}
                    />
                    {!isExpanded && (
                      <div className="mt-2 text-center">
                        <button
                          onClick={() => onSeriesClick && onSeriesClick(seriesItem.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {t('contentManagement.series.viewDetails')} →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : viewType === 'table' ? (
            <SeriesTableView
              series={paginatedSeries}
              booksBySeries={booksBySeries}
              chaptersData={chaptersData}
              lessonsData={lessonsData}
              quizzesData={quizzesData}
              onEdit={onEditSeries}
              onDelete={onDeleteSeries}
            />
          ) : viewType === 'tree' ? (
            <SeriesTreeView
              series={paginatedSeries}
              booksBySeries={booksBySeries}
              chaptersData={chaptersData}
              lessonsData={lessonsData}
              quizzesData={quizzesData}
              onEditSeries={onEditSeries}
              onEditBook={onEditBook}
              onEditChapter={() => {}}
              onEditLesson={() => {}}
              onDeleteSeries={onDeleteSeries}
              onDeleteBook={() => {}}
              onDeleteChapter={() => {}}
              onDeleteLesson={() => {}}
              onDeleteQuiz={onDeleteQuiz}
            />
          ) : null}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                {t('contentManagement.series.showing')} <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredAndSortedSeries.length)}</span> {t('contentManagement.series.of')} <span className="font-semibold">{filteredAndSortedSeries.length}</span> {t('contentManagement.series.series')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSeriesPage(p => Math.max(1, p - 1))}
                  disabled={seriesPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  ← {t('contentManagement.series.previous')}
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (seriesPage <= 3) {
                      pageNum = i + 1;
                    } else if (seriesPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = seriesPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setSeriesPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          seriesPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setSeriesPage(p => Math.min(totalPages, p + 1))}
                  disabled={seriesPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {t('contentManagement.series.next')} →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SeriesListView;

