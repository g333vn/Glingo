// src/pages/editor/EditorDashboardPage.jsx
// Trang Dashboard chính của Editor

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import storageManager from '../../utils/localStorageManager.js';
import { getEditorActivities, formatActivityTime, getActivityIcon, clearEditorActivities } from '../../utils/activityLogger.js';

function EditorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storageInfo, setStorageInfo] = useState(null);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalExams: 0,
    isLoading: true
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Load storage info and statistics
  useEffect(() => {
    const loadData = async () => {
      // Load storage info
      const info = await storageManager.getStorageInfo();
      setStorageInfo(info);

      // Load statistics
      try {
        // IMPROVED: Get all quizzes directly from storage (more efficient and accurate)
        const allQuizzes = await storageManager.getAllQuizzes();
        const totalQuizzes = allQuizzes ? allQuizzes.length : 0;

        // Count exams from all levels
        let totalExams = 0;
        const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
        for (const level of levels) {
          const exams = await storageManager.getExams(level);
          if (exams && exams.length > 0) {
            totalExams += exams.length;
          }
        }

        setStats({
          totalQuizzes,
          totalExams,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading statistics:', error);
        setStats({ totalQuizzes: 0, totalExams: 0, isLoading: false });
      }

      // Load Recent Activities
      const activities = getEditorActivities();
      setRecentActivities(activities);
    };

    loadData();
  }, []);

  const statsCards = [
    {
      title: 'Tổng số Quiz',
      value: stats.isLoading ? '...' : stats.totalQuizzes.toString(),
      icon: '✏️',
      color: 'from-blue-500 to-blue-600',
      path: '/editor/quiz-editor'
    },
    {
      title: 'Tổng số Đề thi',
      value: stats.isLoading ? '...' : stats.totalExams.toString(),
      icon: '📋',
      color: 'from-orange-500 to-orange-600',
      path: '/editor/exams'
    }
  ];

  const quickActions = [
    {
      label: 'Tạo Quiz mới',
      icon: '➕',
      path: '/editor/quiz-editor',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Tạo Đề thi',
      icon: '📋',
      path: '/editor/exams',
      color: 'bg-orange-500 hover:bg-orange-600'
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
          Đây là trang biên tập nội dung. Bạn có quyền tạo và chỉnh sửa quiz và đề thi.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.path)}
            className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-4 sm:p-6 text-white cursor-pointer transform hover:scale-105 transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="text-3xl sm:text-4xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">⚡ Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-all transform hover:scale-105 text-sm sm:text-base`}
            >
              <span className="text-xl sm:text-2xl">{action.icon}</span>
              <span className="font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">📋 Hoạt động gần đây</h2>
          {recentActivities.length > 0 && (
            <button
              onClick={() => {
                if (confirm('⚠️ Bạn có chắc muốn xóa tất cả hoạt động gần đây?')) {
                  clearEditorActivities();
                  setRecentActivities([]);
                  alert('✅ Đã xóa tất cả hoạt động!');
                }
              }}
              className="text-xs sm:text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>
        {recentActivities.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500"
              >
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                    {activity.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      👤 {activity.user}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatActivityTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm sm:text-base">Chưa có hoạt động nào</p>
            <p className="text-xs text-gray-400 mt-2">
              Các thay đổi thông tin cá nhân sẽ được ghi lại ở đây
            </p>
          </div>
        )}
      </div>

      {/* Storage Monitoring */}
      {storageInfo && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💾 {storageInfo.indexedDB ? 'Storage Status (IndexedDB + localStorage)' : 'LocalStorage Status'}
            </h2>
            {storageInfo.indexedDB && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✅ <strong>IndexedDB đang hoạt động</strong> - Dữ liệu chính được lưu trong IndexedDB (không giới hạn).
                  <br />
                  localStorage chỉ dùng làm backup (~5-10 MB limit).
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Size</p>
                <p className="text-2xl font-bold text-blue-700">{storageInfo.totalSize}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Items</p>
                <p className="text-2xl font-bold text-green-700">{storageInfo.itemCount}</p>
                <p className="text-xs text-gray-500 mt-1">(localStorage keys)</p>
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
                <span>
                  {storageInfo.indexedDB 
                    ? 'localStorage Usage (Backup)' 
                    : 'localStorage Usage'}
                </span>
                <span>
                  {storageInfo.totalSize} / {
                    storageInfo.indexedDB 
                      ? '~5-10 MB (Backup only)' 
                      : '~5-10 MB'
                  }
                </span>
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
                onClick={async () => {
                  const data = await storageManager.exportAll();
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
                onClick={async () => {
                  const info = await storageManager.getStorageInfo();
                  setStorageInfo(info);
                  alert('✅ Đã refresh thông tin storage!');
                }}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all shadow-md font-semibold flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDashboardPage;
