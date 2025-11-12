// src/components/admin/AdminLayout.jsx
// Layout chung cho Admin Dashboard với sidebar navigation

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Menu items
  const menuItems = [
    {
      id: 'dashboard',
      label: '📊 Dashboard',
      path: '/admin',
      icon: '📊'
    },
    {
      id: 'quiz-editor',
      label: '✏️ Quiz Editor',
      path: '/admin/quiz-editor',
      icon: '✏️'
    },
    {
      id: 'users',
      label: '👥 Quản lý Users',
      path: '/admin/users',
      icon: '👥',
      comingSoon: true
    },
    {
      id: 'content',
      label: '📚 Quản lý Nội dung',
      path: '/admin/content',
      icon: '📚',
      comingSoon: true
    },
    {
      id: 'settings',
      label: '⚙️ Cài đặt',
      path: '/admin/settings',
      icon: '⚙️',
      comingSoon: true
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-40 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-500">Quản trị hệ thống</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-200">
          {isSidebarOpen ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (!item.comingSoon) {
                      navigate(item.path);
                    }
                  }}
                  disabled={item.comingSoon}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-blue-500 text-white shadow-lg'
                      : item.comingSoon
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${!isSidebarOpen ? 'justify-center' : ''}`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.comingSoon && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all ${
              !isSidebarOpen ? 'justify-center' : ''
            }`}
            title={!isSidebarOpen ? 'Đăng xuất' : ''}
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
