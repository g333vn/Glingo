// src/pages/admin/AdminDashboard.jsx
// Trang quản trị chính - Dashboard cho admin

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminModules = [
    {
      id: 'quiz-editor',
      title: 'Quiz Editor',
      description: 'Tạo và quản lý quiz cho các bài học',
      icon: '📝',
      path: '/admin/quiz-editor',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'users',
      title: 'Quản lý Users',
      description: 'Quản lý tài khoản người dùng và phân quyền',
      icon: '👥',
      path: '/admin/users',
      color: 'from-purple-500 to-pink-500',
      comingSoon: true
    },
    {
      id: 'content',
      title: 'Quản lý Nội dung',
      description: 'Quản lý sách, chương, và nội dung học tập',
      icon: '📚',
      path: '/admin/content',
      color: 'from-green-500 to-emerald-500',
      comingSoon: true
    },
    {
      id: 'jlpt',
      title: 'Quản lý JLPT',
      description: 'Quản lý đề thi và bài thi JLPT',
      icon: '📊',
      path: '/admin/jlpt',
      color: 'from-orange-500 to-red-500',
      comingSoon: true
    },
    {
      id: 'analytics',
      title: 'Thống kê & Phân tích',
      description: 'Xem thống kê người dùng và hiệu suất',
      icon: '📈',
      path: '/admin/analytics',
      color: 'from-indigo-500 to-purple-500',
      comingSoon: true
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      description: 'Cài đặt hệ thống và cấu hình',
      icon: '⚙️',
      path: '/admin/settings',
      color: 'from-gray-500 to-slate-500',
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🛡️ Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Chào mừng, <strong>{user?.name || user?.username}</strong>! Quản lý hệ thống tại đây.
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng số Quiz</p>
                <p className="text-2xl font-bold text-gray-800">3</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng số Users</p>
                <p className="text-2xl font-bold text-gray-800">3</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Role</p>
                <p className="text-2xl font-bold text-gray-800">{user?.role || 'N/A'}</p>
              </div>
              <div className="text-4xl">🔐</div>
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Modules Quản Trị</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => (
              <div
                key={module.id}
                onClick={() => !module.comingSoon && navigate(module.path)}
                className={`
                  relative bg-gradient-to-br ${module.color} rounded-xl shadow-lg p-6
                  cursor-pointer transform transition-all duration-300
                  ${module.comingSoon 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-2xl'
                  }
                `}
              >
                {module.comingSoon && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    Sắp ra mắt
                  </div>
                )}
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                <p className="text-white/90 text-sm">{module.description}</p>
                {!module.comingSoon && (
                  <div className="mt-4 flex items-center text-white text-sm font-medium">
                    <span>Mở module →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡ Thao tác nhanh</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin/quiz-editor')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ➕ Tạo Quiz mới
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              🏠 Về trang chủ
            </button>
            <button
              onClick={() => navigate('/level')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              📖 Xem LEVEL
            </button>
            <button
              onClick={() => navigate('/jlpt')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              📝 Xem JLPT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
