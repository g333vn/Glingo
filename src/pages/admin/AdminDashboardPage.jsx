// src/pages/admin/AdminDashboardPage.jsx
// Trang Dashboard chính của Admin

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Tổng số Quiz',
      value: '3',
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      path: '/admin/quiz-editor'
    },
    {
      title: 'Tổng số Users',
      value: '3',
      icon: '👥',
      color: 'from-green-500 to-green-600',
      path: '/admin/users'
    },
    {
      title: 'Tổng số Sách',
      value: '25',
      icon: '📚',
      color: 'from-purple-500 to-purple-600',
      path: '/admin/content'
    },
    {
      title: 'Tổng số Level',
      value: '5',
      icon: '📊',
      color: 'from-orange-500 to-orange-600',
      path: '/admin/content'
    }
  ];

  const quickActions = [
    {
      label: 'Tạo Quiz mới',
      icon: '➕',
      path: '/admin/quiz-editor',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Quản lý Users',
      icon: '👥',
      path: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600'
      // ✅ REMOVED: comingSoon - Module đã hoàn thành
    },
    {
      label: 'Quản lý Nội dung',
      icon: '📚',
      path: '/admin/content',
      color: 'bg-purple-500 hover:bg-purple-600',
      comingSoon: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          👋 Chào mừng, {user?.name || user?.username}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Đây là trang quản trị hệ thống. Chọn module bên sidebar để bắt đầu.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => !stat.comingSoon && navigate(stat.path)}
            className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-4 sm:p-6 text-white cursor-pointer transform hover:scale-105 transition-all ${
              stat.comingSoon ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="text-3xl sm:text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">⚡ Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => !action.comingSoon && navigate(action.path)}
              disabled={action.comingSoon}
              className={`${action.color} text-white rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
            >
              <span className="text-xl sm:text-2xl">{action.icon}</span>
              <span className="font-semibold">{action.label}</span>
              {action.comingSoon && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Hoạt động gần đây</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📝</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Quiz Editor</p>
              <p className="text-sm text-gray-500">Đã tạo 3 quiz JSON</p>
            </div>
            <span className="text-xs text-gray-400">Hôm nay</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔐</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Hệ thống Authentication</p>
              <p className="text-sm text-gray-500">Đã setup hệ thống đăng nhập</p>
            </div>
            <span className="text-xs text-gray-400">Hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

