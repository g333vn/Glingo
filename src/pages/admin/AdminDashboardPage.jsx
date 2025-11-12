// src/pages/admin/AdminDashboardPage.jsx
// Trang Dashboard chính của Admin

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import storageManager from '../../utils/localStorageManager.js';

function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storageInfo, setStorageInfo] = useState(null);

  // Load storage info on mount
  useEffect(() => {
    setStorageInfo(storageManager.getStorageInfo());
  }, []);

  const stats = [
    {
      title: 'Tổng số Quiz',
      value: '3',
      icon: '✏️',
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
      // ✅ REMOVED: comingSoon - Module đã hoàn thành
    },
    {
      title: 'Tổng số Đề thi',
      value: '75',
      icon: '📋',
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
      color: 'bg-purple-500 hover:bg-purple-600'
      // ✅ REMOVED: comingSoon - Module đã hoàn thành
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

      {/* Storage Monitoring */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💾 LocalStorage Status
          </h2>
          
          {storageInfo && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Size</p>
                  <p className="text-2xl font-bold text-blue-700">{storageInfo.totalSize}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Items</p>
                  <p className="text-2xl font-bold text-green-700">{storageInfo.itemCount}</p>
                </div>
                <div className={`bg-gradient-to-br p-4 rounded-lg ${
                  storageInfo.percentUsed > 80 ? 'from-red-50 to-red-100' :
                  storageInfo.percentUsed > 50 ? 'from-yellow-50 to-yellow-100' :
                  'from-green-50 to-green-100'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Usage</p>
                  <p className={`text-2xl font-bold ${
                    storageInfo.percentUsed > 80 ? 'text-red-700' :
                    storageInfo.percentUsed > 50 ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {storageInfo.percentUsed}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Limit</p>
                  <p className="text-xs font-semibold text-purple-700 mt-2">{storageInfo.limit}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Storage Usage</span>
                  <span>{storageInfo.totalSize} / ~5-10 MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                  <div 
                    className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white ${
                      storageInfo.percentUsed > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                      storageInfo.percentUsed > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
                  >
                    {storageInfo.percentUsed > 10 && `${storageInfo.percentUsed}%`}
                  </div>
                </div>
                {storageInfo.percentUsed > 80 && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Cảnh báo: Dung lượng sắp đầy! Hãy export dữ liệu hoặc xóa bớt.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => {
                    const data = storageManager.exportAll();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `elearning-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    alert('✅ Đã export toàn bộ dữ liệu!');
                  }}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all shadow-md font-semibold flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>Export All Data</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (confirm('⚠️ Xóa TẤT CẢ dữ liệu admin?\n\n- Books\n- Chapters\n- Quizzes\n- Series\n\nHành động này không thể hoàn tác!\nBạn nên export dữ liệu trước.')) {
                      const count = storageManager.clearAllAdminData();
                      alert(`✅ Đã xóa ${count} items!`);
                      setStorageInfo(storageManager.getStorageInfo());
                    }
                  }}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-all shadow-md font-semibold flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  <span>Clear All Admin Data</span>
                </button>

                <button 
                  onClick={() => {
                    setStorageInfo(storageManager.getStorageInfo());
                    alert('✅ Đã refresh thông tin storage!');
                  }}
                  className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all shadow-md font-semibold flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>Refresh</span>
                </button>
              </div>
            </>
          )}
        </div>
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

