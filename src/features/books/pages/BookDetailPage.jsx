// (grid bài học)chọn menu bài học sách hiện tại
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import storageManager from '../../../utils/localStorageManager.js';
import { bookData } from '../../../data/level/bookData.js';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';
import { calculateChapterProgress, LESSON_STATUS } from '../../../data/lessonTypes.js';
import { getChapterProgress, getBookProgress } from '../../../utils/lessonProgressTracker.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
// ✅ PHASE 2: Import memoized LessonCard component
import LessonCard from '../components/LessonCard.jsx';

const contentsPerPage = 10; // ✅ Reduced from 15 to 10 for better spacing

function BookDetailPage() {
  const { levelId, bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [bookContents, setBookContents] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [booksMetadata, setBooksMetadata] = useState([]);
  const [isShowingLessons, setIsShowingLessons] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [allChapterLessons, setAllChapterLessons] = useState({}); // { chapterId: [lessons] }

  // Load books metadata for category navigation
  useEffect(() => {
    const loadBooksMetadata = async () => {
      // ✅ Load from storage/Supabase first (admin data)
      const savedBooks = await storageManager.getBooks(levelId);

      if (savedBooks && savedBooks.length > 0) {
        let booksWithCategory = savedBooks;

        // ✅ Đồng bộ lại category từ seriesId nếu thiếu
        try {
          const seriesList = await storageManager.getSeries(levelId);
          if (Array.isArray(seriesList) && seriesList.length > 0) {
            const seriesMap = {};
            seriesList.forEach(s => {
              if (s && s.id) {
                seriesMap[s.id] = s.name || s.id;
              }
            });

            booksWithCategory = savedBooks.map(book => {
              if (book.category && book.category.length > 0) return book;
              const seriesName = book.seriesId ? seriesMap[book.seriesId] : null;
              return {
                ...book,
                category: seriesName || book.category || null,
              };
            });
          }
        } catch (err) {
          console.warn('[BookDetailPage] ⚠️ Could not load series for category mapping:', err);
        }

        setBooksMetadata(booksWithCategory);
        // Lưu lại metadata đã có category để các trang khác dùng chung
        await storageManager.saveBooks(levelId, booksWithCategory);
        console.log(`[BookDetailPage] ✅ Loaded ${booksWithCategory.length} books from storage for ${levelId} (categories synced)`);
      } else {
        // Fallback to default based on level (static file, đã được clean demo)
        if (levelId === 'n1') {
          setBooksMetadata(n1BooksMetadata);
          console.log(`[BookDetailPage] 📁 Loaded ${n1BooksMetadata.length} books from static file`);
        }
      }
    };

    loadBooksMetadata();
  }, [levelId]);

  // Load book, chapters, and lessons
  useEffect(() => {
    const loadData = async () => {
      // ✅ UPDATED: Get book info from booksMetadata (from storage) first
      const bookFromStorage = booksMetadata.find(b => b.id === bookId);
      if (bookFromStorage) {
        setCurrentBook({
          id: bookFromStorage.id,
          title: bookFromStorage.title,
          imageUrl: bookFromStorage.imageUrl
        });
        console.log(`✅ Loaded book info from storage: ${bookFromStorage.title}`);
      } else {
        // Fallback to static data
        const staticBook = bookData[bookId] || bookData.default;
        setCurrentBook(staticBook);
        console.log(`📁 Loaded book info from static file: ${staticBook?.title || bookId}`);
      }

      // If chapterId is provided, show lessons for that chapter
      if (chapterId) {
        setIsShowingLessons(true);
        
        // ✅ Load lessons for this chapter from storage + Supabase (multi-device)
        const savedLessons = await storageManager.getLessons(bookId, chapterId, levelId);
        
        if (savedLessons && savedLessons.length > 0) {
          setBookContents(savedLessons);
          console.log(`✅ Loaded ${savedLessons.length} lessons for chapter ${chapterId}`);
        } else {
          // Fallback: use chapter as a single lesson (backward compatibility)
          const chapter = { id: chapterId, title: `Bài ${chapterId}` };
          setBookContents([chapter]);
          console.log(`📁 No lessons found, using chapter as lesson`);
        }
        
        // ✅ Find and set current chapter info (Supabase + cache)
        const savedChapters = await storageManager.getChapters(bookId, levelId);
        let chapter = savedChapters?.find(ch => ch.id === chapterId);
        
        // Fallback to static data if not found in storage
        if (!chapter) {
          const staticBook = bookData[bookId] || bookData.default;
          chapter = (staticBook?.contents || []).find(ch => ch.id === chapterId);
        }
        
        setCurrentChapter(chapter || { id: chapterId, title: `Chapter ${chapterId}` });
      } else {
        // Show chapters
        setIsShowingLessons(false);
        setCurrentChapter(null);
        
        // ✅ Load chapters from Supabase + cache
        const savedChapters = await storageManager.getChapters(bookId, levelId);
        
        if (savedChapters && savedChapters.length > 0) {
          // Use saved chapters (IndexedDB or localStorage or demo)
          setBookContents(savedChapters);
          console.log(`✅ Loaded ${savedChapters.length} chapters`);
          
          // Load lessons for all chapters to calculate progress (Supabase + cache)
          const lessonsMap = {};
          for (const chapter of savedChapters) {
            const lessons = await storageManager.getLessons(bookId, chapter.id, levelId);
            
            if (lessons && lessons.length > 0) {
              lessonsMap[chapter.id] = lessons;
            }
          }
          setAllChapterLessons(lessonsMap);
        } else {
          // Fallback to static data
          const staticBook = bookData[bookId] || bookData.default;
          setBookContents(staticBook?.contents || []);
          console.log(`📁 Loaded ${staticBook?.contents?.length || 0} chapters from static file`);
        }
      }
    };

    // ✅ Only load when booksMetadata is ready
    if (booksMetadata.length > 0 || bookId) {
      loadData();
    }
  }, [bookId, chapterId, booksMetadata]);

  const startIndex = (currentPage - 1) * contentsPerPage;
  const endIndex = startIndex + contentsPerPage;
  const currentContents = bookContents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(bookContents.length / contentsPerPage);

  const breadcrumbPaths = [
    { name: 'Home', link: '/' },
    { name: 'Level', link: '/level' },
    { name: levelId.toUpperCase(), link: `/level/${levelId}` },
    { name: currentBook?.title || bookId, link: `/level/${levelId}/${bookId}` },
    ...(isShowingLessons && currentChapter ? [
      { name: currentChapter.title || `Chapter ${chapterId}`, link: `/level/${levelId}/${bookId}/chapter/${chapterId}` }
    ] : [])
  ];

  // ✅ Tìm category của book hiện tại để highlight trong sidebar
  const currentBookCategory = booksMetadata.find(book => book.id === bookId)?.category || null;

  // ✅ Tạo danh sách categories (bộ sách) từ booksMetadata để hiển thị ở Sidebar
  const categories = React.useMemo(() => {
    const categoryCounts = {};
    booksMetadata.forEach(book => {
      if (book.category) {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      }
    });

    return Object.keys(categoryCounts).map(name => ({
      name,
      id: name,
      count: categoryCounts[name],
    }));
  }, [booksMetadata]);

  // ✅ Handler cho category click trong sidebar
  const handleCategoryClick = (categoryName) => {
    if (!categoryName) {
      // Nếu click lại category đang active (toggle off) → navigate về level page
      navigate(`/level/${levelId}`);
      return;
    }

    // Tìm book đầu tiên có category này
    const firstBookInCategory = booksMetadata.find(book => book.category === categoryName);
    
    if (firstBookInCategory) {
      // Navigate đến book đầu tiên của category
      navigate(`/level/${levelId}/${firstBookInCategory.id}`);
    } else {
      // Nếu không tìm thấy, navigate về level page
      navigate(`/level/${levelId}`);
    }
  };

  // Create grid items from paginated contents
  const gridItems = currentContents;

  // Improved Pagination Component - Same style as Sidebar
  const GridPagination = ({ total, current, onChange }) => {
    const getPageNumbers = () => {
      const pages = [];
      // Logic ellipsis tích cực: Kích hoạt khi > 3 trang
      if (total <= 3) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        // Total >= 4
        if (current === 1) {
          // Trang đầu: 1 2 ... Total (Ẩn trang 3 nếu Total=4)
          pages.push(1, 2, '...', total);
        } else if (current === total) {
          // Trang cuối: 1 ... Total-1 Total (Ẩn trang 2 nếu Total=4)
          pages.push(1, '...', total - 1, total);
        } else if (current === 2) {
          // Trang 2: 1 2 3 ... Total (Nếu Total=4 thì hiện hết 1 2 3 4)
          if (total === 4) {
            pages.push(1, 2, 3, 4);
          } else {
            pages.push(1, 2, 3, '...', total);
          }
        } else if (current === total - 1) {
          // Trang áp chót: 1 ... Total-2 Total-1 Total (Nếu Total=4 thì hiện hết)
          if (total === 4) {
            pages.push(1, 2, 3, 4);
          } else {
            pages.push(1, '...', total - 2, total - 1, total);
          }
        } else {
          // Ở giữa: 1 ... Current ... Total
          pages.push(1, '...', current, '...', total);
        }
      }
      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex items-center justify-center gap-[2px] w-full">
        <button
          onClick={() => onChange(prev => Math.max(1, prev - 1))}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center border-[2px] border-black bg-white rounded text-[10px] font-bold hover:bg-yellow-400 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all"
          disabled={current === 1}
          aria-label={t('pagination.previous')}
        >&lt;</button>

        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="text-black font-bold text-[10px] w-4 text-center">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onChange(page)}
              className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border-[2px] rounded text-[10px] font-bold transition-all ${
                current === page
                  ? 'border-black bg-yellow-400 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-black bg-white text-black hover:bg-yellow-400 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onChange(prev => Math.min(total, prev + 1))}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center border-[2px] border-black bg-white rounded text-[10px] font-bold hover:bg-yellow-400 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all"
          disabled={current === total}
          aria-label={t('pagination.next')}
        >&gt;</button>
      </div>
    );
  };

  return (
    <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row items-start gap-0 md:gap-6 mt-4 w-full">
        
        {/* Sidebar - Pass category click handler, selectedCategory & categories để highlight và lọc */}
        <Sidebar
          selectedCategory={currentBookCategory}
          onCategoryClick={handleCategoryClick}
          categories={categories}
        />

        {/* Main Content - sticky chỉ trên màn hình lớn để mobile scroll tự nhiên */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col 
                        md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
          
          {/* ========== BREADCRUMBS - Compact ========== */}
          <div className="pt-3 px-3 sm:px-4 md:px-5 pb-2 flex-shrink-0">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* ========== PAGE TITLE ========== */}
          {isShowingLessons && currentChapter ? (
            <div className="px-3 sm:px-4 md:px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 break-words">
                {currentChapter.title || `Chapter ${chapterId}`}
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium">{t('lesson.lessonList')}</p>
            </div>
          ) : (
            <div className="px-3 sm:px-4 md:px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 break-words">
                {currentBook?.title || bookId}
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium">{t('lesson.chapterList')}</p>
            </div>
          )}

          {/* ========== LESSON CARDS GRID - Optimized (240px cards, gap-6, max 10 items) ========== */}
          <div className="flex-1 md:overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-5 py-3 md:py-4">
            {gridItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-bold">{t('lesson.emptyState') || 'No content available'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 pb-4 w-full max-w-full">
                {gridItems.map((content, index) => (
                  <div 
                    key={content?.id || `item-${index}`} 
                    className="h-[240px]"
                  >
                    {content && (
                      <Link 
                        to={isShowingLessons 
                          ? `/level/${levelId}/${bookId}/chapter/${chapterId}/lesson/${content.id}`
                          : `/level/${levelId}/${bookId}/chapter/${content.id}`
                        }
                        className="block h-full"
                      >
                        <LessonCard
                          title={content.title}
                          lessonId={content.id}
                          levelId={levelId}
                          isLesson={isShowingLessons}
                          bookId={bookId}
                          chapterId={content.id}
                          lessons={allChapterLessons[content.id] || []}
                          t={t}
                        />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== PAGINATION - Fixed at bottom ========== */}
          <div className="px-3 sm:px-4 md:px-5 py-3 md:py-4 border-t-[3px] border-black flex-shrink-0 bg-white">
            <GridPagination total={totalPages} current={currentPage} onChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;