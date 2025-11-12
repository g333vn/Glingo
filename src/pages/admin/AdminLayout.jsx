// src/pages/admin/AdminLayout.jsx
// Layout chung cho tất cả admin pages với sidebar navigation

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      path: '/admin',
      exact: true
    },
    {
      id: 'quiz-editor',
      title: 'Quiz Editor',
      icon: '✏️',
      path: '/admin/quiz-editor'
    },
    {
      id: 'users',
      title: 'Quản lý Users',
      icon: '👥',
      path: '/admin/users',
      comingSoon: true
    },
    {
      id: 'content',
      title: 'Quản lý Nội dung',
      icon: '📚',
      path: '/admin/content',
      comingSoon: true
    },
    {
      id: 'jlpt',
      title: 'Quản lý JLPT',
      icon: '📝',
      path: '/admin/jlpt',
      comingSoon: true
    },
    {
      id: 'analytics',
      title: 'Thống kê',
      icon: '📈',
      path: '/admin/analytics',
      comingSoon: true
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      icon: '⚙️',
      path: '/admin/settings',
      comingSoon: true
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          bg-gray-900 text-white transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          fixed h-screen z-40 overflow-y-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {isSidebarOpen && (
            <div>
              <h2 className="text-lg font-bold text-yellow-400">🛡️ Admin Panel</h2>
              <p className="text-xs text-gray-400 mt-1">{user?.name || user?.username}</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={isSidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => !item.comingSoon && navigate(item.path)}
                disabled={item.comingSoon}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${active
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : item.comingSoon
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                title={item.comingSoon ? 'Sắp ra mắt' : item.title}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="flex-1 text-left">
                    {item.title}
                    {item.comingSoon && (
                      <span className="ml-2 text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              bg-red-600 hover:bg-red-700 text-white
              transition-colors
            `}
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300 min-h-screen
        ${isSidebarOpen ? 'ml-64' : 'ml-20'}
      `}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

