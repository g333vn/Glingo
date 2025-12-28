// src/components/admin/AdminLayout.jsx
// Layout chung cho Admin Dashboard với sidebar navigation

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function AdminLayout() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Menu items
  const menuItems = [
    {
      id: 'dashboard',
      label: t('adminLayout.sidebar.menuItems.dashboard'),
      path: '/admin',
      icon: '📊'
    },
    {
      id: 'quiz-editor',
      label: t('adminLayout.sidebar.menuItems.quizEditor'),
      path: '/admin/quiz-editor',
      icon: '✏️'
    },
    {
      id: 'users',
      label: t('adminLayout.sidebar.menuItems.manageUsers'),
      path: '/admin/users',
      icon: '👥'
    },
    {
      id: 'content',
      label: t('adminLayout.sidebar.menuItems.manageLessons'),
      path: '/admin/content',
      icon: '📚'
    },
    {
      id: 'exams',
      label: t('adminLayout.sidebar.menuItems.manageExams'),
      path: '/admin/exams',
      icon: '📋'
    },
    {
      id: 'export-import',
      label: t('adminLayout.sidebar.menuItems.backupRestore'),
      path: '/admin/export-import',
      icon: '💾'
    },
    {
      id: 'settings',
      label: t('adminLayout.sidebar.menuItems.settings'),
      path: '/admin/settings',
      icon: '⚙️'
    },
    {
      id: 'new-control',
      label: t('adminLayout.sidebar.menuItems.newControl'),
      path: '/admin/new-control',
      icon: '🔒'
    },
    {
      id: 'notifications',
      label: t('adminLayout.sidebar.menuItems.notifications'),
      path: '/admin/notifications',
      icon: '🔔'
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Mobile/Tablet sidebar state - Menu ẩn/hiện (giống Level/JLPT)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* 🔘 Mobile/Tablet Toggle Button - ✨ NEO BRUTALISM */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-20 left-4 z-[10000] bg-[#2D2D2D] hover:bg-yellow-400 text-white hover:text-black p-3 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
        aria-label="Toggle Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* 🌑 Mobile/Tablet Backdrop - Giống Level/JLPT */}
      {isMobileMenuOpen && (
        <div
          id="mobile-backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Layout Container - để pages tự quản lý width và padding */}
      <div className="w-full">
        <div className="w-full flex flex-col md:flex-row items-start gap-0 md:gap-3 mt-0 relative">
          
          {/* 📌 SIDEBAR - STICKY ON DESKTOP, FIXED OVERLAY ON MOBILE - ✨ NEO BRUTALISM */}
          <div className={`
            fixed md:sticky
            top-20 md:top-24
            left-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0
            h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)]
            max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)]
            ${isSidebarOpen ? 'w-64' : 'w-20'} 
            bg-white
            rounded-lg md:rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            flex flex-col overflow-hidden 
            z-[9999] md:z-10
            transition-all duration-300 ease-in-out
          `}>
            {/* Sidebar Header - ✨ NEO BRUTALISM */}
            <div className="h-20 flex items-center justify-between px-4 border-b-[3px] border-black bg-yellow-400 flex-shrink-0">
              {isSidebarOpen && (
                <div className="transition-opacity duration-300 min-w-0 flex-1">
                  <h1 className="text-xl font-black text-black truncate uppercase tracking-wide">{t('adminLayout.sidebar.title')}</h1>
                  <p className="text-xs text-gray-700 font-bold truncate">{t('adminLayout.sidebar.subtitle')}</p>
                </div>
              )}
              {/* Desktop only: Toggle sidebar collapse */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:block p-2 hover:bg-black hover:text-yellow-400 text-black rounded-lg transition-all duration-200 font-black border-[2px] border-black"
                title={isSidebarOpen ? t('adminLayout.sidebar.toggleCollapse') : t('adminLayout.sidebar.toggleExpand')}
              >
                {isSidebarOpen ? '◀' : '▶'}
              </button>
              {/* Mobile/Tablet: Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 hover:bg-black hover:text-yellow-400 text-black rounded-lg transition-all duration-200 font-black border-[2px] border-black"
                title={t('adminLayout.sidebar.closeMenu')}
              >
                ✕
              </button>
            </div>

            {/* User Info - ✨ NEO BRUTALISM */}
            <div className="px-4 py-4 border-b-[2px] border-gray-300 flex-shrink-0">
              {isSidebarOpen ? (
                <div className="transition-opacity duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-[2px] border-black flex items-center justify-center text-white font-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 text-sm truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-gray-600 font-bold truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded border-[2px] border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {(profile?.role || user?.role) === 'admin' ? t('profile.administrator') : 
                       (profile?.role || user?.role) === 'editor' ? t('profile.editor') : 
                       (profile?.role || user?.role) === 'user' ? t('profile.user') : 
                       (profile?.role || user?.role)?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center transition-opacity duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-[2px] border-black flex items-center justify-center text-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu - Scrollable - ✨ NEO BRUTALISM */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        if (!item.comingSoon) {
                          navigate(item.path);
                          // Đóng mobile menu khi click (giống Level/JLPT)
                          if (isMobileMenuOpen) {
                            setIsMobileMenuOpen(false);
                          }
                        }
                      }}
                      disabled={item.comingSoon}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-[2px] font-bold ${
                        isActive(item.path)
                          ? 'bg-blue-500 text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : item.comingSoon
                          ? 'text-gray-400 cursor-not-allowed border-gray-300'
                          : 'text-gray-700 hover:bg-yellow-400 border-gray-300 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      } ${!isSidebarOpen ? 'justify-center' : ''}`}
                      title={!isSidebarOpen ? item.label : ''}
                    >
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      {isSidebarOpen && (
                        <div className="flex-1 min-w-0 transition-opacity duration-300">
                          <span className="block text-left font-black truncate">{item.label}</span>
                          {item.comingSoon && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded border border-gray-400 font-bold">
                              {t('adminLayout.sidebar.comingSoon')}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Button - Fixed at Bottom - ✨ NEO BRUTALISM */}
            <div className="p-4 border-t-[2px] border-gray-300 flex-shrink-0">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  if (isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black ${
                  !isSidebarOpen ? 'justify-center' : ''
                }`}
                title={!isSidebarOpen ? t('adminLayout.sidebar.logout') : ''}
              >
                <span className="text-xl flex-shrink-0">🚪</span>
                {isSidebarOpen && (
                  <span className="font-black transition-opacity duration-300 uppercase tracking-wide">{t('adminLayout.sidebar.logout')}</span>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col min-h-app">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
