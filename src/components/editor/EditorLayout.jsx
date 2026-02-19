// src/components/editor/EditorLayout.jsx
// Layout chung cho Editor Panel với sidebar navigation

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function EditorLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Menu items cho Editor (quiz-editor và exam-editor)
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/editor',
      icon: '📊'
    },
    {
      id: 'quiz-editor',
      label: 'Quiz Editor',
      path: '/editor/quiz-editor',
      icon: '✏️'
    },
    {
      id: 'exam-editor',
      label: 'Tạo Đề thi',
      path: '/editor/exams',
      icon: '📋'
    }
  ];

  const isActive = (path) => {
    if (path === '/editor') {
      return location.pathname === '/editor';
    }
    return location.pathname.startsWith(path);
  };

  // Mobile/Tablet sidebar state - Menu ẩn/hiện (giống Level/JLPT)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile/Tablet Toggle Button - Giống Level/JLPT */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-20 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg"
        aria-label="Toggle Sidebar"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile/Tablet Backdrop - Giống Level/JLPT */}
      {isMobileMenuOpen && (
        <div
          id="mobile-backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Layout Container - Flex như Level/JLPT */}
      <div className="w-full pr-0 md:pr-4 flex flex-col md:flex-row">
        <div className="flex flex-col md:flex-row items-start gap-0 md:gap-6 mt-4 w-full">
          
          {/* SIDEBAR - STICKY ON DESKTOP, FIXED OVERLAY ON MOBILE - Giống Level/JLPT */}
          <div className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            fixed md:sticky 
            top-20 md:top-24
            left-0 
            h-[calc(100vh-80px)] md:h-[calc(100vh-120px)]
            max-h-[calc(100vh-80px)] md:max-h-[calc(100vh-120px)]
            ${isSidebarOpen ? 'w-64' : 'w-20'} 
            bg-white shadow-2xl md:shadow-lg
            rounded-lg md:rounded-lg 
            flex flex-col overflow-hidden 
            z-50 md:z-10
            transition-[width,transform] duration-300 ease-in-out
            md:translate-x-0
          `}>
            {/* Sidebar Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
              {isSidebarOpen && (
                <div className="transition-opacity duration-300 min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-gray-800 truncate">Editor Panel</h1>
                  <p className="text-xs text-gray-500 truncate">Biên tập nội dung</p>
                </div>
              )}
              {/* Desktop only: Toggle sidebar collapse */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSidebarOpen ? 'Thu gọn' : 'Mở rộng'}
              >
                {isSidebarOpen ? '◀' : '▶'}
              </button>
              {/* Mobile/Tablet: Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đóng menu"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
              {isSidebarOpen ? (
                <div className="transition-opacity duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'E'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      {profile?.role || user?.role}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center transition-opacity duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'E'}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu - Scrollable */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        // Đóng mobile menu khi click (giống Level/JLPT)
                        if (isMobileMenuOpen) {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${!isSidebarOpen ? 'justify-center' : ''}`}
                      title={!isSidebarOpen ? item.label : ''}
                    >
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      {isSidebarOpen && (
                        <div className="flex-1 min-w-0 transition-opacity duration-300">
                          <span className="block text-left font-medium truncate">{item.label}</span>
                          {item.viewOnly && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              View Only
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Button - Fixed at Bottom */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  if (isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 ${
                  !isSidebarOpen ? 'justify-center' : ''
                }`}
                title={!isSidebarOpen ? 'Đăng xuất' : ''}
              >
                <span className="text-xl flex-shrink-0">🚪</span>
                {isSidebarOpen && (
                  <span className="font-medium transition-opacity duration-300">Đăng xuất</span>
                )}
              </button>
            </div>
          </div>

          {/* Main Content - Giống Level/JLPT layout - Transition smooth khi sidebar thay đổi */}
          <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col min-h-app transition-all duration-300 ease-in-out">
            <div className="p-4 sm:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorLayout;

