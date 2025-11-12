// src/pages/admin/ContentManagementPage.jsx
// Module quản lý nội dung - Quản lý sách, chapters, và đề thi

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Modal from '../../components/Modal.jsx';
import { n1BooksMetadata } from '../../data/level/n1/books-metadata.js';
import { n1Books } from '../../data/level/n1/books.js';

function ContentManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'exams' | 'series'
  const [selectedLevel, setSelectedLevel] = useState('n1');
  
  // Books management states
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  
  // ✅ NEW: Pagination states
  const [booksPage, setBooksPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
  const itemsPerPage = 10;
  
  // ✅ NEW: Series/Category management states
  const [series, setSeries] = useState([]);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [seriesForm, setSeriesForm] = useState({
    id: '',
    name: '',
    description: ''
  });

  // Book form state
  const [bookForm, setBookForm] = useState({
    id: '',
    title: '',
    imageUrl: '',
    category: ''
  });

  // Chapter form state
  const [chapterForm, setChapterForm] = useState({
    id: '',
    title: ''
  });

  // Load books when level changes
  useEffect(() => {
    loadBooks();
    loadSeries();
  }, [selectedLevel]);
  
  // ✅ NEW: Load series/categories
  const loadSeries = () => {
    const savedSeries = localStorage.getItem(`adminSeries_${selectedLevel}`);
    if (savedSeries) {
      try {
        setSeries(JSON.parse(savedSeries));
      } catch (error) {
        console.error('Error loading series:', error);
        setSeries(getDefaultSeries());
      }
    } else {
      setSeries(getDefaultSeries());
    }
  };
  
  // ✅ NEW: Get default series from existing books
  const getDefaultSeries = () => {
    const allBooks = getDefaultBooks();
    const uniqueCategories = [...new Set(allBooks.map(book => book.category).filter(Boolean))];
    return uniqueCategories.map((cat, index) => ({
      id: `series-${index + 1}`,
      name: cat,
      description: `Bộ sách ${cat}`
    }));
  };
  
  // ✅ NEW: Save series
  const saveSeries = (updatedSeries) => {
    setSeries(updatedSeries);
    localStorage.setItem(`adminSeries_${selectedLevel}`, JSON.stringify(updatedSeries));
  };

  const loadBooks = () => {
    // Load from localStorage first, fallback to default data
    const savedBooks = localStorage.getItem(`adminBooks_${selectedLevel}`);
    if (savedBooks) {
      try {
        setBooks(JSON.parse(savedBooks));
      } catch (error) {
        console.error('Error loading books:', error);
        setBooks(getDefaultBooks());
      }
    } else {
      setBooks(getDefaultBooks());
    }
  };

  const getDefaultBooks = () => {
    switch(selectedLevel) {
      case 'n1': return n1BooksMetadata;
      // TODO: Add other levels
      default: return [];
    }
  };

  const saveBooks = (updatedBooks) => {
    setBooks(updatedBooks);
    localStorage.setItem(`adminBooks_${selectedLevel}`, JSON.stringify(updatedBooks));
  };

  // Get book data (with chapters) - Memoized để tránh re-compute
  const getBookData = useCallback((bookId) => {
    switch(selectedLevel) {
      case 'n1': return n1Books[bookId];
      default: return null;
    }
  }, [selectedLevel]);

  // Memoize books với chapters data để tránh re-compute mỗi lần render
  const booksWithChapters = useMemo(() => {
    return books.map(book => {
      const bookData = getBookData(book.id);
      return {
        ...book,
        chapters: bookData?.contents || []
      };
    });
  }, [books, getBookData]);

  // ✅ NEW: Pagination calculations
  const booksTotalPages = Math.ceil(booksWithChapters.length / itemsPerPage);
  const booksStartIndex = (booksPage - 1) * itemsPerPage;
  const booksEndIndex = booksStartIndex + itemsPerPage;
  const paginatedBooks = booksWithChapters.slice(booksStartIndex, booksEndIndex);

  const seriesTotalPages = Math.ceil(series.length / itemsPerPage);
  const seriesStartIndex = (seriesPage - 1) * itemsPerPage;
  const seriesEndIndex = seriesStartIndex + itemsPerPage;
  const paginatedSeries = series.slice(seriesStartIndex, seriesEndIndex);

  // Reset pagination when data changes
  useEffect(() => {
    setBooksPage(1);
  }, [books.length, selectedLevel]);

  useEffect(() => {
    setSeriesPage(1);
  }, [series.length, selectedLevel]);

  // ✅ Lock body scroll when any modal is open
  useBodyScrollLock(showBookForm || showChapterForm || showSeriesForm);

  // Book CRUD operations
  const handleAddBook = () => {
    setEditingBook(null);
    setBookForm({ id: '', title: '', imageUrl: '', category: '' });
    setShowBookForm(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      id: book.id,
      title: book.title,
      imageUrl: book.imageUrl,
      category: book.category || ''
    });
    setShowBookForm(true);
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    if (!bookForm.id || !bookForm.title) {
      alert('⚠️ Vui lòng điền đầy đủ ID và Tên sách!');
      return;
    }

    let updatedBooks;
    if (editingBook) {
      // Update existing book
      updatedBooks = books.map(b => 
        b.id === editingBook.id ? { ...bookForm } : b
      );
    } else {
      // Add new book
      if (books.find(b => b.id === bookForm.id)) {
        alert('⚠️ ID sách đã tồn tại!');
        return;
      }
      updatedBooks = [...books, { ...bookForm }];
    }
    
    saveBooks(updatedBooks);
    setShowBookForm(false);
    alert('✅ Đã lưu sách!');
  };

  const handleDeleteBook = (bookId) => {
    if (confirm('Bạn có chắc muốn xóa sách này? Tất cả chapters sẽ bị xóa!')) {
      const updatedBooks = books.filter(b => b.id !== bookId);
      saveBooks(updatedBooks);
      alert('✅ Đã xóa sách!');
    }
  };

  // Chapter CRUD operations
  const handleAddChapter = (bookId) => {
    const bookData = getBookData(bookId);
    setSelectedBook(bookData);
    setEditingChapter(null);
    setChapterForm({ id: '', title: '' });
    setShowChapterForm(true);
  };

  const handleEditChapter = (bookId, chapter) => {
    const bookData = getBookData(bookId);
    setSelectedBook(bookData);
    setEditingChapter(chapter);
    setChapterForm({
      id: chapter.id,
      title: chapter.title || chapter.id
    });
    setShowChapterForm(true);
  };

  const handleSaveChapter = (e) => {
    e.preventDefault();
    if (!chapterForm.id || !selectedBook) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Note: Chapters are stored in bookData files, not localStorage
    // This is a UI for managing, but actual save would need to update the source files
    // For now, we'll show instructions
    alert(`✅ Chapter đã được chuẩn bị!\n\nĐể lưu chapter, bạn cần:\n1. Cập nhật file: src/data/level/${selectedLevel}/${selectedBook?.id || 'book-id'}.js\n2. Thêm chapter vào mảng 'chapters'\n\nHoặc sử dụng Quiz Editor để tạo quiz cho chapter mới.`);
    setShowChapterForm(false);
  };

  const handleDeleteChapter = (bookId, chapterId) => {
    if (confirm('Bạn có chắc muốn xóa chương này?')) {
      alert('⚠️ Để xóa chapter, bạn cần chỉnh sửa file source code trực tiếp.\n\nFile: src/data/level/' + selectedLevel + '/' + bookId + '.js');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-4 sm:pb-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
          📚 Quản lý Nội dung
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Quản lý sách, chapters (Level module) và đề thi (JLPT module)
        </p>
      </div>

      {/* Tabs - Responsive */}
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-lg p-1.5 sm:p-2 flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeTab === 'books'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">📖 </span>Quản lý Sách
        </button>
        <button
          onClick={() => setActiveTab('series')}
          className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeTab === 'series'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">📚 </span>Bộ sách
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 min-w-full sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm ${
            activeTab === 'exams'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">📝 </span>Đề thi
        </button>
      </div>

      {/* Books Management */}
      {activeTab === 'books' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Level Selection */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Chọn Cấp độ (Level)
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
            >
              <option value="n1">N1</option>
              <option value="n2">N2</option>
              <option value="n3">N3</option>
              <option value="n4">N4</option>
              <option value="n5">N5</option>
            </select>
          </div>

          {/* Books List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                Danh sách Sách ({books.length})
              </h2>
              <button
                onClick={handleAddBook}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-0"
              >
                <span>➕</span>
                <span>Thêm Sách mới</span>
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              {booksWithChapters.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-base font-medium text-gray-700 mb-2">Chưa có sách nào</p>
                  <p className="text-sm text-gray-500 mb-4">Nhấn "Thêm Sách mới" để bắt đầu</p>
                  <button
                    onClick={handleAddBook}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    ➕ Thêm Sách mới
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">ID</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell w-[80px]">Ảnh</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sách</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell w-[150px]">Category</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Chapters</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[180px]">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedBooks.map((book) => (
                          <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-3 py-3 text-sm text-gray-900 font-mono text-xs">{book.id}</td>
                            <td className="px-3 py-3 hidden lg:table-cell">
                              {book.imageUrl ? (
                                <img
                                  src={book.imageUrl}
                                  alt={book.title}
                                  className="w-10 h-14 object-cover rounded"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.src = '/book_card/placeholder.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                  No img
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2 lg:gap-0">
                                {book.imageUrl ? (
                                  <img
                                    src={book.imageUrl}
                                    alt={book.title}
                                    className="w-10 h-14 object-cover rounded lg:hidden flex-shrink-0"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = '/book_card/placeholder.jpg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 lg:hidden flex-shrink-0">
                                    No img
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="truncate">{book.title}</div>
                                  {book.category && (
                                    <div className="text-xs text-blue-600 mt-1 md:hidden">📚 {book.category}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 hidden md:table-cell">
                              <div className="truncate">{book.category || '-'}</div>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {book.chapters.length}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  onClick={() => handleAddChapter(book.id)}
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 active:bg-green-700 transition-colors duration-150 text-xs font-medium"
                                  title="Thêm chương"
                                >
                                  ➕
                                </button>
                                <button
                                  onClick={() => handleEditBook(book)}
                                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 transition-colors duration-150 text-xs font-medium"
                                  title="Sửa"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700 transition-colors duration-150 text-xs font-medium"
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {booksTotalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-semibold">{booksStartIndex + 1}</span> - <span className="font-semibold">{Math.min(booksEndIndex, booksWithChapters.length)}</span> trong tổng số <span className="font-semibold">{booksWithChapters.length}</span> sách
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBooksPage(p => Math.max(1, p - 1))}
                          disabled={booksPage === 1}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          ← Trước
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, booksTotalPages) }, (_, i) => {
                            let pageNum;
                            if (booksTotalPages <= 5) {
                              pageNum = i + 1;
                            } else if (booksPage <= 3) {
                              pageNum = i + 1;
                            } else if (booksPage >= booksTotalPages - 2) {
                              pageNum = booksTotalPages - 4 + i;
                            } else {
                              pageNum = booksPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setBooksPage(pageNum)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  booksPage === pageNum
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
                          onClick={() => setBooksPage(p => Math.min(booksTotalPages, p + 1))}
                          disabled={booksPage === booksTotalPages}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {booksWithChapters.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Chưa có sách nào</p>
                  <p className="text-xs text-gray-500">Nhấn "Thêm Sách mới" để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-3 p-3">
                  {paginatedBooks.map((book) => (
                    <div key={book.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex gap-3 mb-3">
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded flex-shrink-0"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/book_card/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1 font-mono truncate">{book.id}</div>
                          <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</div>
                          {book.category && (
                            <div className="text-xs text-blue-600 mb-1">📚 {book.category}</div>
                          )}
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {book.chapters.length} chương
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleAddChapter(book.id)}
                          className="flex-1 min-w-[calc(33.333%-0.375rem)] px-2 py-2.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 active:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          ➕ Chương
                        </button>
                        <button
                          onClick={() => handleEditBook(book)}
                          className="flex-1 min-w-[calc(33.333%-0.375rem)] px-2 py-2.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="flex-1 min-w-[calc(33.333%-0.375rem)] px-2 py-2.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 active:bg-red-700 transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Mobile Pagination */}
              {booksTotalPages > 1 && (
                <div className="px-3 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => setBooksPage(p => Math.max(1, p - 1))}
                    disabled={booksPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-h-[44px]"
                  >
                    ← Trước
                  </button>
                  <div className="text-xs sm:text-sm text-gray-700 text-center">
                    Trang <span className="font-semibold">{booksPage}</span> / <span className="font-semibold">{booksTotalPages}</span>
                  </div>
                  <button
                    onClick={() => setBooksPage(p => Math.min(booksTotalPages, p + 1))}
                    disabled={booksPage === booksTotalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-h-[44px]"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Series/Category Management */}
      {activeTab === 'series' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Level Selection */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Chọn Cấp độ (Level)
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
            >
              <option value="n1">N1</option>
              <option value="n2">N2</option>
              <option value="n3">N3</option>
              <option value="n4">N4</option>
              <option value="n5">N5</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              💡 Mỗi level có danh sách bộ sách riêng. Bộ sách có thể trùng tên nhưng khác level.
            </p>
          </div>

          {/* Series List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                Danh sách Bộ sách ({series.length})
              </h2>
              <button
                onClick={() => {
                  setSeriesForm({ id: '', name: '', description: '' });
                  setEditingSeries(null);
                  setShowSeriesForm(true);
                }}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-0"
              >
                <span>➕</span>
                <span>Thêm Bộ sách mới</span>
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              {series.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-base font-medium text-gray-700 mb-2">Chưa có bộ sách nào</p>
                  <p className="text-sm text-gray-500 mb-4">Nhấn "Thêm Bộ sách mới" để bắt đầu</p>
                  <button
                    onClick={() => {
                      setSeriesForm({ id: '', name: '', description: '' });
                      setEditingSeries(null);
                      setShowSeriesForm(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    ➕ Thêm Bộ sách mới
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">ID</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên bộ sách</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Mô tả</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Số sách</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedSeries.map((s) => {
                          const booksInSeries = books.filter(b => b.category === s.name);
                          return (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-3 py-3 text-sm text-gray-900 font-mono text-xs">{s.id}</td>
                              <td className="px-3 py-3 text-sm font-medium text-gray-900">
                                <div className="min-w-0">
                                  <div className="truncate">{s.name}</div>
                                  {s.description && (
                                    <div className="text-xs text-gray-600 mt-1 lg:hidden truncate">{s.description}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600 hidden lg:table-cell">
                                <div className="truncate">{s.description || '-'}</div>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  {booksInSeries.length}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingSeries(s);
                                      setSeriesForm({
                                        id: s.id,
                                        name: s.name,
                                        description: s.description || ''
                                      });
                                      setShowSeriesForm(true);
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 transition-colors duration-150 text-xs font-medium"
                                    title="Sửa"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc muốn xóa bộ sách "${s.name}"? Tất cả sách trong bộ này sẽ mất category!`)) {
                                        const updatedSeries = series.filter(ser => ser.id !== s.id);
                                        saveSeries(updatedSeries);
                                        // Update books: remove category from books in this series
                                        const updatedBooks = books.map(b => 
                                          b.category === s.name ? { ...b, category: '' } : b
                                        );
                                        saveBooks(updatedBooks);
                                        alert('✅ Đã xóa bộ sách!');
                                      }
                                    }}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700 transition-colors duration-150 text-xs font-medium"
                                    title="Xóa"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {seriesTotalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-semibold">{seriesStartIndex + 1}</span> - <span className="font-semibold">{Math.min(seriesEndIndex, series.length)}</span> trong tổng số <span className="font-semibold">{series.length}</span> bộ sách
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSeriesPage(p => Math.max(1, p - 1))}
                          disabled={seriesPage === 1}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          ← Trước
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, seriesTotalPages) }, (_, i) => {
                            let pageNum;
                            if (seriesTotalPages <= 5) {
                              pageNum = i + 1;
                            } else if (seriesPage <= 3) {
                              pageNum = i + 1;
                            } else if (seriesPage >= seriesTotalPages - 2) {
                              pageNum = seriesTotalPages - 4 + i;
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
                          onClick={() => setSeriesPage(p => Math.min(seriesTotalPages, p + 1))}
                          disabled={seriesPage === seriesTotalPages}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {series.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Chưa có bộ sách nào</p>
                  <p className="text-xs text-gray-500">Nhấn "Thêm Bộ sách mới" để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-3 p-3">
                  {paginatedSeries.map((s) => {
                    const booksInSeries = books.filter(b => b.category === s.name);
                    return (
                      <div key={s.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1 font-mono">{s.id}</div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">{s.name}</div>
                          {s.description && (
                            <div className="text-xs text-gray-600 mb-2">{s.description}</div>
                          )}
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {booksInSeries.length} sách
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSeries(s);
                              setSeriesForm({
                                id: s.id,
                                name: s.name,
                                description: s.description || ''
                              });
                              setShowSeriesForm(true);
                            }}
                            className="flex-1 min-w-[calc(50%-0.375rem)] px-2 py-2.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors min-h-[44px] flex items-center justify-center"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa bộ sách "${s.name}"? Tất cả sách trong bộ này sẽ mất category!`)) {
                                const updatedSeries = series.filter(ser => ser.id !== s.id);
                                saveSeries(updatedSeries);
                                const updatedBooks = books.map(b => 
                                  b.category === s.name ? { ...b, category: '' } : b
                                );
                                saveBooks(updatedBooks);
                                alert('✅ Đã xóa bộ sách!');
                              }
                            }}
                            className="flex-1 min-w-[calc(50%-0.375rem)] px-2 py-2.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 active:bg-red-700 transition-colors min-h-[44px] flex items-center justify-center"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Mobile Pagination */}
              {seriesTotalPages > 1 && (
                <div className="px-3 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => setSeriesPage(p => Math.max(1, p - 1))}
                    disabled={seriesPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-h-[44px]"
                  >
                    ← Trước
                  </button>
                  <div className="text-xs sm:text-sm text-gray-700 text-center">
                    Trang <span className="font-semibold">{seriesPage}</span> / <span className="font-semibold">{seriesTotalPages}</span>
                  </div>
                  <button
                    onClick={() => setSeriesPage(p => Math.min(seriesTotalPages, p + 1))}
                    disabled={seriesPage === seriesTotalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-h-[44px]"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exams Management - Coming Soon */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🚧</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Quản lý Đề thi
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Module này sẽ được phát triển trong tương lai
          </p>
        </div>
      )}

      {/* Book Form Modal - Responsive */}
      <Modal 
        isOpen={showBookForm} 
        onClose={() => setShowBookForm(false)} 
        title={editingBook ? '✏️ Sửa Sách' : '➕ Thêm Sách mới'}
        maxWidth="42rem"
      >
        <form onSubmit={handleSaveBook} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Sách * (ví dụ: skm-n1-bunpou)
              </label>
              <input
                type="text"
                value={bookForm.id}
                onChange={(e) => setBookForm({ ...bookForm, id: e.target.value })}
                required
                disabled={!!editingBook}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base"
                placeholder="skm-n1-bunpou"
              />
              <p className="text-xs text-gray-500 mt-1">ID dùng để định danh sách (không có khoảng trắng)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bộ sách (Category) *
              </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={bookForm.category}
                      onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white min-h-[44px] sm:min-h-0"
                      required
                    >
                      <option value="">-- Chọn bộ sách --</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setSeriesForm({ id: '', name: '', description: '' });
                        setEditingSeries(null);
                        setShowSeriesForm(true);
                      }}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-sm font-semibold whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center justify-center"
                      title="Tạo bộ sách mới"
                    >
                      ➕ Mới
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn bộ sách có sẵn hoặc tạo bộ sách mới
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sách *
                  </label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="新完全マスター 文法 N1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Ảnh bìa (tùy chọn)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bookForm.imageUrl}
                      onChange={(e) => setBookForm({ ...bookForm, imageUrl: e.target.value })}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg (tùy chọn)"
                    />
                    {bookForm.imageUrl && (
                      <img
                        src={bookForm.imageUrl}
                        alt="Preview"
                        className="w-16 h-20 object-cover rounded border border-gray-300"
                        onError={(e) => {
                          e.target.src = '/book_card/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Đường dẫn ảnh từ thư mục public (ví dụ: /book_card/n1/...). Để trống nếu không có ảnh bìa.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  💾 {editingBook ? 'Lưu thay đổi' : 'Thêm Sách'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  Hủy
                </button>
              </div>
            </form>
      </Modal>

      {/* Chapter Form Modal - Responsive */}
      <Modal 
        isOpen={showChapterForm && !!selectedBook} 
        onClose={() => setShowChapterForm(false)} 
        title={`${editingChapter ? '✏️ Sửa Chương' : '➕ Thêm Chương mới'} - ${selectedBook?.title || 'N/A'}`}
        maxWidth="28rem"
      >
        <form onSubmit={handleSaveChapter} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Chương * (ví dụ: bai-1, unit-1)
                </label>
                <input
                  type="text"
                  value={chapterForm.id}
                  onChange={(e) => setChapterForm({ ...chapterForm, id: e.target.value })}
                  required
                  disabled={!!editingChapter}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base"
                  placeholder="bai-1"
                />
                <p className="text-xs text-gray-500 mt-1">ID dùng để tên file JSON (không có khoảng trắng)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Chương *
                </label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Bài 1: Phân biệt cấu trúc A và B"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Lưu ý:</strong> Để lưu chapter vào hệ thống, bạn cần:
                  <br />
                  1. Cập nhật file: <code className="bg-yellow-100 px-1 rounded">src/data/level/{selectedLevel}/{selectedBook?.id || 'book-id'}.js</code>
                  <br />
                  2. Thêm chapter vào mảng <code className="bg-yellow-100 px-1 rounded">chapters</code>
                  <br />
                  3. Hoặc sử dụng Quiz Editor để tạo quiz cho chapter mới
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  💾 {editingChapter ? 'Lưu thay đổi' : 'Thêm Chương'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChapterForm(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  Hủy
                </button>
              </div>
            </form>
      </Modal>

      {/* ✅ NEW: Series Form Modal - Responsive */}
      <Modal 
        isOpen={showSeriesForm} 
        onClose={() => setShowSeriesForm(false)} 
        title={editingSeries ? '✏️ Sửa Bộ sách' : '➕ Thêm Bộ sách mới'}
        maxWidth="28rem"
      >
        <form onSubmit={(e) => {
              e.preventDefault();
              if (!seriesForm.name) {
                alert('⚠️ Vui lòng điền tên bộ sách!');
                return;
              }

              let updatedSeries;
              if (editingSeries) {
                // Update existing series
                const oldName = editingSeries.name;
                updatedSeries = series.map(s => 
                  s.id === editingSeries.id ? { ...seriesForm } : s
                );
                // Update books: change category name if series name changed
                if (oldName !== seriesForm.name) {
                  const updatedBooks = books.map(b => 
                    b.category === oldName ? { ...b, category: seriesForm.name } : b
                  );
                  saveBooks(updatedBooks);
                }
              } else {
                // Add new series
                if (series.find(s => s.name === seriesForm.name)) {
                  alert('⚠️ Tên bộ sách đã tồn tại!');
                  return;
                }
                const newId = `series-${Date.now()}`;
                updatedSeries = [...series, { ...seriesForm, id: newId }];
              }
              
              saveSeries(updatedSeries);
              setShowSeriesForm(false);
              
              // ✅ Auto-select new series in book form if it was opened from book form
              if (!editingSeries && showBookForm && !bookForm.category) {
                setBookForm({ ...bookForm, category: seriesForm.name });
              }
              
              alert('✅ Đã lưu bộ sách!');
            }} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bộ sách * (ví dụ: 新完全マスター)
                </label>
                <input
                  type="text"
                  value={seriesForm.name}
                  onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                  required
                  disabled={!!editingSeries}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base"
                  placeholder="新完全マスター"
                />
                <p className="text-xs text-gray-500 mt-1">Tên bộ sách (không thể thay đổi sau khi tạo)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={seriesForm.description}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-y"
                  placeholder="Mô tả về bộ sách này..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  💾 {editingSeries ? 'Lưu thay đổi' : 'Thêm Bộ sách'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSeriesForm(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  Hủy
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
}

export default ContentManagementPage;

