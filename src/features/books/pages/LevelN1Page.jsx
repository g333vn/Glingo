import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';

const booksPerPage = 10;

function LevelN1Page() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // ✅ NEW: Load books from localStorage (admin added books) or default data
  const [n1Books, setN1Books] = useState([]);

  useEffect(() => {
    // Load books from localStorage first, fallback to default
    const savedBooks = localStorage.getItem('adminBooks_n1');
    if (savedBooks) {
      try {
        setN1Books(JSON.parse(savedBooks));
      } catch (error) {
        console.error('Error loading books from localStorage:', error);
        setN1Books(n1BooksMetadata);
      }
    } else {
      setN1Books(n1BooksMetadata);
    }
  }, []);

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
    { name: 'ホーム', link: '/' },
    { name: 'LEVEL', link: '/level' },
    { name: 'N1', link: '/level/n1' }
  ];

  // Tạo mảng đủ 10 phần tử cho grid (placeholders for empty)
  const gridItems = Array.from({ length: booksPerPage }, (_, i) => currentBooks[i] || null);

  const GridPagination = ({ total, current, onChange }) => (
    totalPages > 1 && (
      <div className="flex justify-end items-center space-x-1">
        <button
          onClick={() => onChange(Math.max(1, current - 1))}
          className="px-3 py-1.5 border border-gray-400 bg-white bg-opacity-90 rounded-md text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={current === 1}
          aria-label="Previous page"
        >&lt;</button>
        
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onChange(i + 1)}
            className={`px-3 py-1.5 border rounded-md text-sm transition-all duration-200 ${
              current === i + 1
                ? 'border-yellow-400 bg-yellow-400 text-black font-semibold shadow-md'
                : 'border-gray-400 bg-white bg-opacity-90 text-gray-700 hover:bg-gray-200 hover:border-gray-500'
            }`}
            aria-label={`Page ${i + 1}`}
            aria-current={current === i + 1 ? 'page' : undefined}
          >
            {i + 1}
          </button>
        ))}
        
        <button
          onClick={() => onChange(Math.min(total, current + 1))}
          className="px-3 py-1.5 border border-gray-400 bg-white bg-opacity-90 rounded-md text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={current === total}
          aria-label="Next page"
        >次へ &gt;</button>
      </div>
    )
  );

  return (
    <div className="w-full pr-0 md:pr-4">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        
        {/* Sidebar - Pass selectedCategory to Sidebar for active highlighting */}
        <Sidebar 
          selectedCategory={selectedCategory} 
          onCategoryClick={handleCategoryClick}
        />

        <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full min-h-app">
          {/* Breadcrumbs - Fixed at top */}
          <div className="pt-4 px-6 pb-2">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* Fixed content area - No scroll (đồng bộ với JLPTLevelN1Page) */}
          <div className="flex-1 overflow-hidden px-6 py-4">
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
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 h-full transition-opacity duration-150 ${
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
          <div className="px-6 py-4 border-t border-gray-300">
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