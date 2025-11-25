// (grid bài học)chọn menu bài học sách hiện tại
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import storageManager from '../../../utils/localStorageManager.js';
import { bookData } from '../../../data/level/bookData.js';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';
import { demoChapters } from '../../../data/level/n1/demo-book/chapters.js';
import { demoLessons } from '../../../data/level/n1/demo-book/lessons.js';
import { calculateChapterProgress, LESSON_STATUS } from '../../../data/lessonTypes.js';
import { getChapterProgress, getBookProgress } from '../../../utils/lessonProgressTracker.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';

const contentsPerPage = 10; // ✅ Reduced from 15 to 10 for better spacing

// Component LessonCard - ✨ NEO BRUTALISM - Consistent Design with Fixed Height + Progress
const LessonCard = ({ title, lessonId, levelId, isLesson = false, bookId, chapterId, lessons = [], t }) => {
  const colorClass = levelId === 'n1' ? 'from-red-100 to-red-300 text-red-800' : 
                     levelId === 'n2' ? 'from-orange-100 to-orange-300 text-orange-800' :
                     levelId === 'n3' ? 'from-yellow-100 to-yellow-300 text-yellow-800' :
                     levelId === 'n4' ? 'from-green-100 to-green-300 text-green-800' :
                     levelId === 'n5' ? 'from-blue-100 to-blue-300 text-blue-800' :
                     'from-gray-100 to-gray-300 text-gray-800';
  
  // Calculate progress for chapters (not lessons)
  let progress = null;
  if (!isLesson && bookId && chapterId && lessons.length > 0) {
    progress = getChapterProgress(bookId, chapterId, lessons);
  }
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 p-5 group hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer h-[240px] flex flex-col">
      {/* Icon - ✨ NEO BRUTALISM - ALWAYS PERFECT CIRCLE */}
      <div 
        className="flex-shrink-0 bg-yellow-400 rounded-full flex items-center justify-center font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mx-auto mb-3"
        style={{
          width: '80px',
          height: '80px',
          minWidth: '80px',
          minHeight: '80px'
        }}
      >
        <span className="text-3xl">📘</span>
      </div>
      
      {/* Title - ✨ NEO BRUTALISM - Fixed height area with ellipsis */}
      <div className="flex-1 w-full px-2 mb-3 overflow-hidden flex items-center justify-center">
        <h3 
          className="font-black text-sm sm:text-base text-black uppercase tracking-wide text-center w-full"
          style={{ 
            fontFamily: "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', sans-serif",
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            lineHeight: '1.3'
          }}
          title={title}
        >
          {title}
        </h3>
      </div>
      
      {/* Progress Bar (for chapters only) */}
      {progress && (
        <div className="flex-shrink-0 mb-2 px-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border-[2px] border-black">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-700 font-bold mt-1">
            {progress.completed}/{progress.total} ({progress.percentage}%)
          </p>
        </div>
      )}
      
      {/* Badge - ✨ NEO BRUTALISM - Always at bottom */}
      <div className="flex-shrink-0 flex justify-center">
        <span className="text-xs px-3 py-1 rounded-md border-[2px] border-black bg-blue-500 text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {isLesson ? t('lesson.lessonBadge') : t('lesson.chapterBadge')}
        </span>
      </div>
    </div>
  );
};

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
      // ✅ UPDATED: Load from IndexedDB/localStorage first (via storageManager)
      const savedBooks = await storageManager.getBooks(levelId);
      if (savedBooks && savedBooks.length > 0) {
        setBooksMetadata(savedBooks);
        console.log(`✅ Loaded ${savedBooks.length} books from storage for ${levelId}`);
      } else {
        // Fallback to default based on level
        if (levelId === 'n1') {
          setBooksMetadata(n1BooksMetadata);
          console.log(`📁 Loaded ${n1BooksMetadata.length} books from static file`);
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
        
        // ✅ Load lessons for this chapter from storage
        let savedLessons = await storageManager.getLessons(bookId, chapterId);
        
        // ✅ FALLBACK: Load demo lessons if not in storage
        if ((!savedLessons || savedLessons.length === 0) && bookId === 'demo-complete-001') {
          const demoKey = `${bookId}_${chapterId}`;
          savedLessons = demoLessons[demoKey];
          if (savedLessons) {
            console.log(`📁 Loaded ${savedLessons.length} DEMO lessons from static file`);
          }
        }
        
        if (savedLessons && savedLessons.length > 0) {
          setBookContents(savedLessons);
          console.log(`✅ Loaded ${savedLessons.length} lessons for chapter ${chapterId}`);
        } else {
          // Fallback: use chapter as a single lesson (backward compatibility)
          const chapter = { id: chapterId, title: `Bài ${chapterId}` };
          setBookContents([chapter]);
          console.log(`📁 No lessons found, using chapter as lesson`);
        }
        
        // ✅ Find and set current chapter info from storage first
        const savedChapters = await storageManager.getChapters(bookId);
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
        
        // ✅ Try IndexedDB/localStorage first for chapters
        let savedChapters = await storageManager.getChapters(bookId);
        
        // ✅ FALLBACK: Load demo chapters if this is demo book
        if ((!savedChapters || savedChapters.length === 0) && bookId === 'demo-complete-001') {
          savedChapters = demoChapters;
          console.log(`📁 Loaded ${demoChapters.length} DEMO chapters from static file`);
        }
        
        if (savedChapters && savedChapters.length > 0) {
          // Use saved chapters (IndexedDB or localStorage or demo)
          setBookContents(savedChapters);
          console.log(`✅ Loaded ${savedChapters.length} chapters`);
          
          // Load lessons for all chapters to calculate progress
          const lessonsMap = {};
          for (const chapter of savedChapters) {
            let lessons = await storageManager.getLessons(bookId, chapter.id);
            
            // ✅ FALLBACK: Load demo lessons if not in storage
            if ((!lessons || lessons.length === 0) && bookId === 'demo-complete-001') {
              const demoKey = `${bookId}_${chapter.id}`;
              lessons = demoLessons[demoKey];
              if (lessons) {
                console.log(`📁 Loaded ${lessons.length} DEMO lessons for ${chapter.id}`);
              }
            }
            
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
    <div className="w-full pr-0 md:pr-4 flex flex-col md:flex-row">
      <div className="flex flex-col md:flex-row items-start gap-0 md:gap-6 mt-4 w-full">
        
        {/* Sidebar - Pass category click handler và selectedCategory để highlight */}
        <Sidebar 
          selectedCategory={currentBookCategory}
          onCategoryClick={handleCategoryClick}
        />

        {/* Main Content - HEIGHT MATCH SIDEBAR */}
        <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
          
          {/* ========== BREADCRUMBS - Compact ========== */}
          <div className="pt-3 px-5 pb-2 flex-shrink-0">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* ========== PAGE TITLE ========== */}
          {isShowingLessons && currentChapter ? (
            <div className="px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <h2 className="text-xl font-black text-gray-900">
                {currentChapter.title || `Chapter ${chapterId}`}
              </h2>
              <p className="text-sm text-gray-700 mt-1 font-medium">{t('lesson.lessonList')}</p>
            </div>
          ) : (
            <div className="px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <h2 className="text-xl font-black text-gray-900">
                {currentBook?.title || bookId}
              </h2>
              <p className="text-sm text-gray-700 mt-1 font-medium">{t('lesson.chapterList')}</p>
            </div>
          )}

          {/* ========== LESSON CARDS GRID - Optimized (240px cards, gap-6, max 10 items) ========== */}
          <div className="flex-1 px-5 py-4 overflow-y-auto">
            {gridItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-bold">{t('lesson.emptyState') || 'No content available'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
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
          <div className="px-5 py-4 border-t-[3px] border-black flex-shrink-0 bg-white">
            <GridPagination total={totalPages} current={currentPage} onChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;