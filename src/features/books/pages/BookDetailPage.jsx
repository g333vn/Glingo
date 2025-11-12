// (grid bài học)chọn menu bài học sách hiện tại
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import storageManager from '../../../utils/localStorageManager.js';
import { bookData } from '../../../data/level/bookData.js';

const contentsPerPage = 15;

// Component LessonCard - Improved Design (220px height, better visual)
const LessonCard = ({ title, lessonId, levelId }) => {
  const colorClass = levelId === 'n1' ? 'from-red-100 to-red-300 text-red-800' : 
                     levelId === 'n2' ? 'from-orange-100 to-orange-300 text-orange-800' :
                     levelId === 'n3' ? 'from-yellow-100 to-yellow-300 text-yellow-800' :
                     levelId === 'n4' ? 'from-green-100 to-green-300 text-green-800' :
                     levelId === 'n5' ? 'from-blue-100 to-blue-300 text-blue-800' :
                     'from-gray-100 to-gray-300 text-gray-800';
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 p-5 border-2 border-gray-200 hover:border-yellow-400 h-full group">
      <div className="flex flex-col items-center text-center h-full justify-between">
        {/* Icon - Prominent */}
        <div className={`w-20 h-20 mb-3 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-3xl font-extrabold shadow-md group-hover:shadow-lg transition-shadow`}>
          📘
        </div>
        
        {/* Title - Clear and readable */}
        <h3 className="font-bold text-base text-gray-800 mb-2 leading-tight flex-grow flex items-center justify-center">
          {title}
        </h3>
        
        {/* Badge */}
        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
          Bài học
        </span>
      </div>
    </div>
  );
};

function BookDetailPage() {
  const { levelId, bookId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [bookContents, setBookContents] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);

  // Load book and chapters
  useEffect(() => {
    const loadChapters = async () => {
      // Try IndexedDB/localStorage first for chapters
      const savedChapters = await storageManager.getChapters(bookId);
      
      if (savedChapters && savedChapters.length > 0) {
        // Use saved chapters (IndexedDB or localStorage)
        setBookContents(savedChapters);
        console.log(`✅ Loaded ${savedChapters.length} chapters from storage`);
      } else {
        // Fallback to static data
        const book = bookData[bookId] || bookData.default;
        setBookContents(book.contents || []);
        console.log(`📁 Loaded ${book.contents?.length || 0} chapters from static file`);
      }

      // Get book info
      setCurrentBook(bookData[bookId] || bookData.default);
    };

    loadChapters();
  }, [bookId]);

  const startIndex = (currentPage - 1) * contentsPerPage;
  const endIndex = startIndex + contentsPerPage;
  const currentContents = bookContents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(bookContents.length / contentsPerPage);

  const breadcrumbPaths = [
    { name: 'ホーム', link: '/' },
    { name: 'LEVEL', link: '/level' },
    { name: levelId.toUpperCase(), link: `/level/${levelId}` },
    { name: currentBook?.title || bookId, link: `/level/${levelId}/${bookId}` }
  ];

  // Create grid items (fill empty slots)
  const gridItems = Array.from({ length: contentsPerPage }, (_, i) => currentContents[i] || null);

  // Improved Pagination Component
  const GridPagination = ({ total, current, onChange }) => (
    totalPages > 1 && (
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => onChange(prev => Math.max(1, prev - 1))}
          className="px-4 py-2 border-2 border-gray-400 bg-white bg-opacity-90 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          disabled={current === 1}
        >
          &lt; Trước
        </button>
        
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onChange(i + 1)}
            className={`px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all ${
              current === i + 1
                ? 'border-yellow-400 bg-yellow-400 text-black shadow-md'
                : 'border-gray-400 bg-white bg-opacity-90 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
        
        <button
          onClick={() => onChange(prev => Math.min(total, prev + 1))}
          className="px-4 py-2 border-2 border-gray-400 bg-white bg-opacity-90 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          disabled={current === total}
        >
          次へ &gt;
        </button>
      </div>
    )
  );

  return (
    <div className="w-full pr-0 md:pr-4 flex flex-col md:flex-row">
      <div className="flex flex-col md:flex-row items-start gap-0 md:gap-6 mt-4 w-full">
        
        {/* Sidebar */}
        <Sidebar className="flex-shrink-0" />

        {/* Main Content - HEIGHT MATCH SIDEBAR */}
        <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full min-h-app">
          
          {/* ========== BREADCRUMBS - Compact ========== */}
          <div className="pt-3 px-5 pb-2 flex-shrink-0">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* ========== LESSON CARDS GRID - Optimized (220px cards) ========== */}
          <div className="flex-1 px-5 py-3 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-4">
              {gridItems.map((content, index) => (
                <div 
                  key={content?.id || `empty-${index}`} 
                  className="h-[220px]"
                >
                  {content ? (
                    <Link 
                      to={`/level/${levelId}/${bookId}/lesson/${content.id}`}
                      className="block h-full"
                    >
                      <LessonCard
                        title={content.title}
                        lessonId={content.id}
                        levelId={levelId}
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========== PAGINATION - Fixed at bottom ========== */}
          <div className="px-5 py-4 border-t-2 border-gray-300 flex-shrink-0 bg-white/50">
            <GridPagination total={totalPages} current={currentPage} onChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;