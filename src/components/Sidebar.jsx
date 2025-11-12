import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Modal } from 'antd';
import ProtectedLink from './ProtectedLink.jsx';
import { jlptExams } from '../data/jlpt/jlptData.js';
import { useExamGuard } from '../hooks/useExamGuard.jsx';

function Sidebar({ selectedCategory, onCategoryClick }) {
  const location = useLocation();
  const params = useParams();
  const [activeItem, setActiveItem] = useState(selectedCategory || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const itemsPerPage = 14;
  
  // ✅ State cho Modal "Sắp diễn ra"
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  // ✅ Tích hợp useExamGuard
  const { navigate: guardedNavigate, WarningModal } = useExamGuard();

  // ✅ Kiểm tra JLPT route
  const isJlptRoute = location.pathname.startsWith('/jlpt/');
  const isLevelRoute = location.pathname.startsWith('/level/');

  const getCurrentTitle = () => {
    const path = location.pathname;
    
    if (path === '/level') return { title: 'LEVEL', link: '/level' };
    
    if (path.startsWith('/level/n1')) return { title: 'N1', link: '/level/n1' };
    if (path.startsWith('/level/n2')) return { title: 'N2', link: '/level/n2' };
    if (path.startsWith('/level/n3')) return { title: 'N3', link: '/level/n3' };
    if (path.startsWith('/level/n4')) return { title: 'N4', link: '/level/n4' };
    if (path.startsWith('/level/n5')) return { title: 'N5', link: '/level/n5' };
    
    if (path === '/jlpt') return { title: 'JLPT', link: '/jlpt' };
    
    if (path.startsWith('/jlpt/n1')) return { title: 'N1 - 試験', link: '/jlpt/n1' };
    if (path.startsWith('/jlpt/n2')) return { title: 'N2 - 試験', link: '/jlpt/n2' };
    if (path.startsWith('/jlpt/n3')) return { title: 'N3 - 試験', link: '/jlpt/n3' };
    if (path.startsWith('/jlpt/n4')) return { title: 'N4 - 試験', link: '/jlpt/n4' };
    if (path.startsWith('/jlpt/n5')) return { title: 'N5 - 試験', link: '/jlpt/n5' };
    
    return { title: 'LEVEL', link: '/level' };
  };

  const currentTitle = getCurrentTitle();
  
  const isLevelPage = location.pathname === '/level';
  const isJlptPage = location.pathname === '/jlpt';

  // ✅ Lấy examId hiện tại để highlight
  const currentExamId = params.examId;

  const getMenuItems = () => {
    const levelId = params.levelId;
    const isJlptMode = location.pathname.startsWith('/jlpt/') && levelId;

    if (isJlptMode) {
      const exams = jlptExams[levelId] || [];
      return exams.map(exam => ({
        name: `${exam.title} (${exam.date})`,
        id: exam.id,
        status: exam.status
      }));
    } else {
      return [
        { name: '新完全マスター', id: 'shinkanzen' },
        { name: 'TRY!', id: 'try' },
        { name: '徹底トレーニング', id: 'tettei' },
        { name: '日本語総まとめ', id: 'nihongo' },
        { name: '耳から覚える', id: 'mimikara' },
        { name: '学ぼう！にほんご', id: 'manabou' },
        { name: 'ドリル', id: 'drill' },
        { name: '20日合格', id: '20days' },
        { name: '読解戦略', id: 'dokkai' },
        { name: 'GENKI', id: 'genki' },
        { name: 'Tài liệu phụ 1', id: 'sup1' },
        { name: 'Tài liệu phụ 2', id: 'sup2' },
        { name: 'Tài liệu phụ 3', id: 'sup3' },
        { name: 'Tài liệu phụ 4', id: 'sup4' },
        { name: 'Tài liệu phụ 5', id: 'sup5' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = menuItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(menuItems.length / itemsPerPage);

  const PaginationControls = ({ total, current, onChange }) => (
    totalPages > 1 && (
      <div className="flex items-center justify-center space-x-1 pt-4">
        <button
          onClick={() => onChange(prev => Math.max(1, prev - 1))}
          className="px-2 py-1 border border-gray-400 bg-white bg-opacity-80 rounded-md text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={current === 1}
        >&lt;</button>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onChange(i + 1)}
            className={`px-2 py-1 border rounded-md text-xs ${
              current === i + 1
                ? 'border-yellow-400 bg-yellow-400 text-black font-semibold'
                : 'border-gray-400 bg-white bg-opacity-80 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onChange(prev => Math.min(total, prev + 1))}
          className="px-2 py-1 border border-gray-400 bg-white bg-opacity-80 rounded-md text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={current === total}
        >次へ &gt;</button>
      </div>
    )
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && event.target.id === 'mobile-backdrop') {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const handleTitleClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // ✅ Handler cho Module LEVEL (filter logic)
  const handleLevelCategoryClick = (categoryName) => {
    const newCategory = activeItem === categoryName ? null : categoryName;
    
    if (onCategoryClick) {
      onCategoryClick(newCategory);
    }
    setActiveItem(newCategory);
  };

  // ✅ Handler cho Module JLPT (navigate logic)
  const handleJlptExamClick = (item) => {
    const { id: examId, status } = item;
    const levelId = params.levelId;
    
    // 1. Kiểm tra status "Sắp diễn ra" TRƯỚC
    const isUpcoming = status === 'Sắp diễn ra' || 
                       status?.trim() === 'Sắp diễn ra' ||
                       status?.includes('Sắp');
    
    if (isUpcoming) {
      // ✅ Hiện Modal ngay lập tức
      setShowUpcomingModal(true);
      return;
    }

    // 2. Kiểm tra nếu đang ở chính đề này (ignore duplicate click)
    if (currentExamId === examId) {
      if (isMobileOpen) {
        setIsMobileOpen(false);
      }
      return;
    }

    // 3. Navigate với guard protection
    const targetPath = `/jlpt/${levelId}/${examId}`;
    guardedNavigate(targetPath);

    // 4. Đóng mobile sidebar sau navigate
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // ✅ Xác định handler dựa trên module
  const handleCategoryClick = (item) => {
    if (isJlptRoute && params.levelId) {
      // Module JLPT: Navigate logic
      handleJlptExamClick(item);
    } else {
      // Module LEVEL: Filter logic
      handleLevelCategoryClick(item.name);
    }
  };

  // ✅ Dynamic NavLink cho title
  const TitleLink = isJlptRoute ? ProtectedLink : 'a';

  return (
    <>
      {/* ✅ Render Warning Modal từ useExamGuard */}
      {WarningModal}
      
      {/* ✅ Modal "Sắp diễn ra" - State-based */}
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

      {/* 🔘 Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-20 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg"
        aria-label="Toggle Sidebar"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* 🌑 Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 📌 SIDEBAR CONTAINER - ✅ STICKY ON DESKTOP */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed md:sticky 
        top-20 md:top-24
        left-0 
        h-[calc(100vh-80px)] md:h-[calc(100vh-120px)]
        max-h-[calc(100vh-80px)] md:max-h-[calc(100vh-120px)]
        w-56 md:w-56 
        bg-gray-100/90 backdrop-blur-sm 
        rounded-lg md:rounded-lg shadow-lg 
        flex flex-col overflow-hidden 
        z-50 md:z-10
        transition-transform duration-300 ease-in-out
        md:translate-x-0
      `}>
        {/* ✅ Title với bảo vệ - dùng dynamic TitleLink */}
        {isJlptRoute ? (
          <TitleLink
            to={currentTitle.link}
            onClick={handleTitleClick}
            className="block text-lg font-bold cursor-pointer px-4 py-3 rounded-t-lg transition-colors duration-200 border-b-2 border-gray-300 text-gray-800 hover:bg-gray-200/50 text-center flex-shrink-0"
          >
            {currentTitle.title}
          </TitleLink>
        ) : (
          <a
            href={currentTitle.link}
            onClick={handleTitleClick}
            className="block text-lg font-bold cursor-pointer px-4 py-3 rounded-t-lg transition-colors duration-200 border-b-2 border-gray-300 text-gray-800 hover:bg-gray-200/50 text-center flex-shrink-0"
          >
            {currentTitle.title}
          </a>
        )}

        {/* 📜 Menu Items - Scrollable Area */}
        {!isLevelPage && !isJlptPage && (
          <div className="px-2 flex-1 overflow-y-auto">
            <ul className="space-y-0">
              {currentItems.map((item, index) => {
                const isActive = isJlptRoute && params.levelId
                  ? currentExamId === item.id
                  : activeItem === item.name;

                return (
                  <li key={item.id || item.name} className="border-b border-gray-300">
                    <button
                      onClick={() => handleCategoryClick(item)}
                      className={`block py-3 px-3 text-sm transition-colors duration-200 rounded-sm text-center w-full ${
                        isActive
                          ? 'bg-yellow-400 text-black font-semibold'
                          : 'text-gray-700 hover:bg-gray-200/50'
                      }`}
                    >
                      {item.name}
                    </button>
                  </li>
                );
              })}

              {Array.from({ length: itemsPerPage - currentItems.length }).map((_, i) => (
                <li key={`placeholder-${i}`} className={`py-3 px-3 h-[45px] ${i === (itemsPerPage - currentItems.length - 1) ? 'last:border-b-0' : ''}`}>
                  &nbsp;
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty Space for Level/JLPT Main Pages */}
        {(isLevelPage || isJlptPage) && (
          <div className="flex-1"></div>
        )}

        {/* 🔢 Pagination - Fixed at Bottom */}
        {!isLevelPage && !isJlptPage && (
          <div className="mt-auto px-4 pb-4 flex-shrink-0">
            <PaginationControls total={totalPages} current={currentPage} onChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay (fallback) */}
      {isMobileOpen && <div className="md:hidden fixed inset-0 z-30" />}
    </>
  );
}

export default Sidebar;