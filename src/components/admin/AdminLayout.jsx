// src/components/admin/AdminLayout.jsx
// Layout chung cho tất cả admin pages với sidebar navigation

import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const adminMenuItems = [
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
      icon: '📝',
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
      icon: '📊',
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

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          bg-white shadow-lg transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">🛡️ Admin</h2>
              <p className="text-xs text-gray-500">{user?.name || user?.username}</p>
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

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {adminMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => !item.comingSoon && navigate(item.path)}
                  disabled={item.comingSoon}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive(item.path, item.exact)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={item.comingSoon ? 'Sắp ra mắt' : item.title}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.title}</span>
                      {item.comingSoon && (
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              bg-red-50 text-red-600 hover:bg-red-100
              transition-colors font-medium
            `}
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

