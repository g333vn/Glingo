import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';
import storageManager from '../../../utils/localStorageManager.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';

const booksPerPage = 10;

function LevelN1Page() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ UPDATED: Load books from Supabase/IndexedDB/localStorage (admin added books) or default data
  const [n1Books, setN1Books] = useState([]);
  useEffect(() => {
    const loadBooks = async () => {
      // Helper để loại bỏ sách DEMO và Extra Materials
      const filterDemoAndExtraBooks = (books) =>
        (books || []).filter(book => {
          if (!book) return false;
          const id = String(book.id || '');
          // Loại bỏ demo book & extra placeholders
          if (book.category === 'Extra Materials') return false;
          if (book.isDemo) return false;
          if (id === 'demo-complete-001') return false;
          if (id.includes('extra-')) return false;
          return true;
        });

      // 1. Lấy books từ storage/Supabase
      const savedBooksRaw = await storageManager.getBooks('n1');
      const cleanedSavedBooks = filterDemoAndExtraBooks(savedBooksRaw);

      // 1b. Lấy danh sách series để gán lại category (tên bộ sách) nếu thiếu
      let booksWithCategory = cleanedSavedBooks;
      try {
        const seriesList = await storageManager.getSeries('n1');
        if (Array.isArray(seriesList) && seriesList.length > 0) {
          const seriesMap = {};
          seriesList.forEach(s => {
            if (s && s.id) {
              seriesMap[s.id] = s.name || s.id;
            }
          });

          booksWithCategory = cleanedSavedBooks.map(book => {
            if (book.category && book.category.length > 0) return book;
            const seriesName = book.seriesId ? seriesMap[book.seriesId] : null;
            return {
              ...book,
              category: seriesName || book.category || null,
            };
          });
        }
      } catch (err) {
        console.warn('[LevelN1Page] ⚠️ Could not load series for category mapping:', err);
      }

      if (booksWithCategory && booksWithCategory.length > 0) {
        setN1Books(booksWithCategory);
        // Ghi đè lại storage để xoá sạch demo/extra cũ và lưu category đã khôi phục
        await storageManager.saveBooks('n1', booksWithCategory);
        console.log(`✅ Loaded ${booksWithCategory.length} N1 books (demo/extra removed, categories synced)`);
      } else {
        // 2. Không có data trong storage → dùng metadata mặc định (đã được clean)
        const cleanedDefaults = filterDemoAndExtraBooks(n1BooksMetadata);
        setN1Books(cleanedDefaults);
        await storageManager.saveBooks('n1', cleanedDefaults);
        console.log(`📁 Loaded ${cleanedDefaults.length} N1 books from static file (demo/extra removed)`);
      }
    };

    loadBooks();
  }, []);

  // ✅ Đọc category từ URL query parameter khi component mount hoặc URL thay đổi
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
      setCurrentPage(1);
    }
  }, [searchParams]);

  // ✅ Extract unique categories from books for Sidebar - Sort by number of books (most first)
  const categories = React.useMemo(() => {
    // Đếm số lượng books trong mỗi category
    const categoryCounts = {};
    n1Books.forEach(book => {
      if (book.category) {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      }
    });

    // Tạo array categories với số lượng books
    const categoriesWithCount = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      id: cat,
      count: categoryCounts[cat]
    }));

    // ✅ Sort theo số lượng books (nhiều nhất trước)
    return categoriesWithCount.sort((a, b) => b.count - a.count);
  }, [n1Books]);

  // Filter books based on category
  const filteredBooks = selectedCategory
    ? n1Books.filter(book => book.category === selectedCategory)
    : n1Books;

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handleBookClick = (bookId) => {
    navigate(`/level/n1/${bookId}`);
  };

  const handleCategoryClick = (category) => {
    setIsTransitioning(true);
    setSelectedCategory(category === selectedCategory ? null : category);
    setCurrentPage(1);

    // Smooth transition effect
    setTimeout(() => {
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  };

  const handlePageChange = (newPage) => {
    setIsTransitioning(true);
    setCurrentPage(newPage);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
  };

  const breadcrumbPaths = [
    { name: 'Home', link: '/' },
    { name: 'Level', link: '/level' },
    { name: 'N1', link: '/level/n1' }
  ];

  // Tạo mảng đủ 10 phần tử cho grid (placeholders for empty)
  const gridItems = Array.from({ length: booksPerPage }, (_, i) => currentBooks[i] || null);

  const GridPagination = ({ total, current, onChange }) => {
    // Logic ellipsis cho pagination
    const getPageNumbers = () => {
      const pages = [];
      if (total <= 4) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        if (current <= 3) {
          pages.push(1, 2, 3, 4, '...', total);
        } else if (current >= total - 2) {
          pages.push(1, '...', total - 3, total - 2, total - 1, total);
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', total);
        }
      }
      return pages;
    };

    return (
      total > 1 && (
        <div className="flex justify-end items-center space-x-2 mt-4">
          <button
            onClick={() => onChange(Math.max(1, current - 1))}
            className="min-w-[100px] h-[40px] px-4 py-2 border-[3px] border-black bg-white rounded-md text-sm text-black font-black hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center"
            disabled={current === 1}
            aria-label="Previous page"
          >&lt;&lt; {t('pagination.previous')}</button>

          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-black font-bold">...</span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => onChange(page)}
                className={`min-w-[40px] h-[40px] px-3 py-2 border-[3px] rounded-md text-sm transition-all duration-200 font-black flex items-center justify-center ${current === page
                    ? 'border-black bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-black bg-white text-black hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                aria-label={`Page ${page}`}
                aria-current={current === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => onChange(Math.min(total, current + 1))}
            className="min-w-[100px] h-[40px] px-4 py-2 border-[3px] border-black bg-white rounded-md text-sm text-black font-black hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center"
            disabled={current === total}
            aria-label="Next page"
          >{t('pagination.next')} &gt;&gt;</button>
        </div>
      )
    );
  };

  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">

        {/* Sidebar - Pass selectedCategory and categories to Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          categories={categories}
        />

        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full 
                        md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
          {/* Breadcrumbs - Fixed at top */}
          <div className="pt-3 px-3 sm:px-4 md:pt-4 md:px-6 pb-2 flex-shrink-0">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>

          {/* Content area */}
          <div className="flex-1 md:overflow-hidden overflow-y-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
            {filteredBooks.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg font-medium">カテゴリーに本がありません</p>
                <p className="text-sm mt-2">別のカテゴリーを選択してください</p>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 transition-opacity duration-150 ${
                  isTransitioning ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {gridItems.map((book, index) => (
                  <div key={book?.id || `empty-${index}`} className="flex items-start">
                    {book ? (
                      <div
                        onClick={() => handleBookClick(book.id)}
                        className="cursor-pointer w-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleBookClick(book.id);
                          }
                        }}
                        aria-label={`Open ${book.title}`}
                      >
                        <BookCard
                          title={book.title}
                          imageUrl={book.imageUrl}
                          isComingSoon={book.isComingSoon}
                          status={book.status}
                        />
                      </div>
                    ) : (
                      <div className="w-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination - Fixed at bottom */}
          <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 border-t border-black flex-shrink-0">
            <GridPagination
              total={totalPages}
              current={currentPage}
              onChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelN1Page;