// src/pages/admin/ContentManagementPage.jsx
// Module quản lý nội dung - Quản lý sách, chapters, và đề thi

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { n1BooksMetadata } from '../../data/level/n1/books-metadata.js';
import { n1Books } from '../../data/level/n1/books.js';

function ContentManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'exams'
  const [selectedLevel, setSelectedLevel] = useState('n1');
  
  // Books management states
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

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
  }, [selectedLevel]);

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
    alert(`✅ Chapter đã được chuẩn bị!\n\nĐể lưu chapter, bạn cần:\n1. Cập nhật file: src/data/level/${selectedLevel}/${selectedBook.id || 'book-id'}.js\n2. Thêm chapter vào mảng 'chapters'\n\nHoặc sử dụng Quiz Editor để tạo quiz cho chapter mới.`);
    setShowChapterForm(false);
  };

  const handleDeleteChapter = (bookId, chapterId) => {
    if (confirm('Bạn có chắc muốn xóa chương này?')) {
      alert('⚠️ Để xóa chapter, bạn cần chỉnh sửa file source code trực tiếp.\n\nFile: src/data/level/' + selectedLevel + '/' + bookId + '.js');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          📚 Quản lý Nội dung
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Quản lý sách, chapters (Level module) và đề thi (JLPT module)
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            activeTab === 'books'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📖 Quản lý Sách
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            activeTab === 'exams'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📝 Quản lý Đề thi (Coming Soon)
        </button>
      </div>

      {/* Books Management */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {/* Level Selection */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Cấp độ (Level)
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
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
            <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Danh sách Sách ({books.length})
              </h2>
              <button
                onClick={handleAddBook}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>➕</span>
                <span>Thêm Sách mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">ID</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[80px]">Ảnh bìa</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sách</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell w-[150px]">Category</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">Chapters</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[200px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {booksWithChapters.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.id}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/book_card/placeholder.jpg';
                          }}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                        <div className="truncate">{book.title}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {book.category || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {book.chapters.length} chương
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleAddChapter(book.id)}
                            className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-150 text-xs font-medium"
                            title="Thêm chương"
                          >
                            ➕ Chương
                          </button>
                          <button
                            onClick={() => handleEditBook(book)}
                            className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150 text-xs font-medium"
                            title="Sửa"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-150 text-xs font-medium"
                            title="Xóa"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Exams Management - Coming Soon */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Quản lý Đề thi
          </h2>
          <p className="text-gray-600">
            Module này sẽ được phát triển trong tương lai
          </p>
        </div>
      )}

      {/* Book Form Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              {editingBook ? '✏️ Sửa Sách' : '➕ Thêm Sách mới'}
            </h2>
            
            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base"
                    placeholder="skm-n1-bunpou"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID dùng để định danh sách (không có khoảng trắng)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="新完全マスター"
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="新完全マスター 文法 N1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Ảnh bìa *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bookForm.imageUrl}
                      onChange={(e) => setBookForm({ ...bookForm, imageUrl: e.target.value })}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg"
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
                    💡 Đường dẫn ảnh từ thư mục public (ví dụ: /book_card/n1/...)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                >
                  💾 {editingBook ? 'Lưu thay đổi' : 'Thêm Sách'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm sm:text-base"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Form Modal */}
      {showChapterForm && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {editingChapter ? '✏️ Sửa Chương' : '➕ Thêm Chương mới'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Sách: <strong>{selectedBook.title || 'N/A'}</strong>
            </p>
            
            <form onSubmit={handleSaveChapter} className="space-y-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Bài 1: Phân biệt cấu trúc A và B"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Lưu ý:</strong> Để lưu chapter vào hệ thống, bạn cần:
                  <br />
                  1. Cập nhật file: <code className="bg-yellow-100 px-1 rounded">src/data/level/{selectedLevel}/{selectedBook.id || 'book-id'}.js</code>
                  <br />
                  2. Thêm chapter vào mảng <code className="bg-yellow-100 px-1 rounded">chapters</code>
                  <br />
                  3. Hoặc sử dụng Quiz Editor để tạo quiz cho chapter mới
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                >
                  💾 {editingChapter ? 'Lưu thay đổi' : 'Thêm Chương'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChapterForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm sm:text-base"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentManagementPage;

