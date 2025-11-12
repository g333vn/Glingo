// trang đề n1
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { jlptExams, jlptLevelInfo } from '../../../data/jlpt/jlptData.js';

const examsPerPage = 10;

// Component ExamCard với ảnh meme
const ExamCard = ({ title, date, status, memeImage }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-4 border-2 border-gray-200 hover:border-yellow-400 h-full">
      <div className="flex flex-col items-center text-center h-full">
        {/* Ảnh meme thay thế icon tròn */}
        <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={memeImage} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/book_card/placeholder.jpg'; // Fallback image
            }}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-2">{date}</p>
          <div className="mt-auto">
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${
              status === 'Sắp diễn ra' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function JLPTLevelN1Page() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // State cho Modal "Sắp diễn ra"
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  // Lấy data từ jlptData.js
  const jlptN1Exams = jlptExams.n1;

  const startIndex = (currentPage - 1) * examsPerPage;
  const endIndex = startIndex + examsPerPage;
  const currentExams = jlptN1Exams.slice(startIndex, endIndex);
  const totalPages = Math.ceil(jlptN1Exams.length / examsPerPage);

  // Function để lấy ảnh meme theo index (lặp lại 1-10 cho mỗi trang)
  const getMemeImage = (indexInPage) => {
    // indexInPage từ 0-9, chuyển thành 1-10 và lặp lại
    const memeNumber = String((indexInPage % 10) + 1).padStart(2, '0');
    return `/src/features/jlpt/components/meme/${memeNumber}.png`;
  };

  const handleExamClick = (examId) => {
    const exam = jlptN1Exams.find(e => e.id === examId);
    
    if (exam && exam.status === 'Sắp diễn ra') {
      setShowUpcomingModal(true);
      return;
    }
    
    // Navigate to exam detail page
    navigate(`/jlpt/n1/${examId}`);
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
    { name: 'JLPT', link: '/jlpt' },
    { name: 'N1', link: '/jlpt/n1' }
  ];

  const gridItems = Array.from({ length: examsPerPage }, (_, i) => currentExams[i] || null);

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
      {/* Modal "Sắp diễn ra" - State-based */}
      <Modal
        title="📅 Đề thi đang chuẩn bị"
        open={showUpcomingModal}
        onOk={() => setShowUpcomingModal(false)}
        onCancel={() => setShowUpcomingModal(false)}
        okText="Đã hiểu"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
        maskClosable={true}
      >
        <p className="py-4">
          Đề thi này đang trong quá trình chuẩn bị và sẽ sớm có sẵn. Vui lòng chọn đề thi khác!
        </p>
      </Modal>

      <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
        
        <Sidebar />

        <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full min-h-app">
          {/* Breadcrumbs - Fixed at top */}
          <div className="pt-4 px-6 pb-2">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* Fixed content area - No scroll */}
          <div className="flex-1 overflow-hidden px-6 py-4">
            {jlptN1Exams.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">試験がありません</p>
                <p className="text-sm mt-2">しばらくお待ちください</p>
              </div>
            ) : (
              <div 
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 h-full transition-opacity duration-150 ${
                  isTransitioning ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {gridItems.map((exam, index) => (
                  <div key={exam?.id || `empty-${index}`} className="h-full">
                    {exam ? (
                      <div 
                        onClick={() => handleExamClick(exam.id)} 
                        className="cursor-pointer w-full h-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleExamClick(exam.id);
                          }
                        }}
                        aria-label={`Open ${exam.title}`}
                      >
                        <ExamCard
                          title={exam.title}
                          date={exam.date}
                          status={exam.status}
                          memeImage={getMemeImage(index)}
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

export default JLPTLevelN1Page;