// src/components/dashboard/ActivityFeed.jsx
// Real-time Activity Feed Component

import React from 'react';

function ActivityFeed({ activities, maxItems = 10 }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="font-semibold">Chưa có hoạt động nào</p>
      </div>
    );
  }

  const getActivityIcon = (action) => {
    const icons = {
      register: '👤',
      login: '🔓',
      logout: '🔒',
      profile_update: '✏️',
      lesson_complete: '📚',
      quiz_attempt: '✍️',
      exam_attempt: '📋',
      exam_complete: '✅',
      content_create: '➕',
      content_update: '🔄',
      content_delete: '🗑️'
    };
    return icons[action] || '📌';
  };

  const getActivityColor = (action) => {
    if (action.includes('register') || action.includes('create')) return 'bg-green-400 text-green-900';
    if (action.includes('delete')) return 'bg-red-400 text-red-900';
    if (action.includes('update')) return 'bg-blue-400 text-blue-900';
    if (action.includes('complete')) return 'bg-purple-400 text-purple-900';
    return 'bg-gray-400 text-gray-900';
  };

  const getActivityMessage = (activity) => {
    const messages = {
      register: `đã đăng ký tài khoản`,
      login: `đã đăng nhập`,
      logout: `đã đăng xuất`,
      profile_update: `đã cập nhật profile`,
      lesson_complete: `đã hoàn thành bài học`,
      quiz_attempt: `đã làm quiz`,
      exam_attempt: `đã bắt đầu bài thi`,
      exam_complete: `đã hoàn thành bài thi`,
      content_create: `đã tạo nội dung mới`,
      content_update: `đã cập nhật nội dung`,
      content_delete: `đã xóa nội dung`
    };
    return messages[activity.action] || activity.action;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-2">
      {activities.slice(0, maxItems).map((activity, index) => (
        <div 
          key={activity.id || index}
          className="flex items-center gap-3 p-3 bg-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-[2px] border-black ${getActivityColor(activity.action)}`}>
            {getActivityIcon(activity.action)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              <span className="font-black text-blue-600">{activity.username}</span>
              {' '}
              {getActivityMessage(activity)}
            </p>
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <p className="text-xs text-gray-600 truncate">
                {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                  <span key={key} className="mr-2">
                    {key}: <span className="font-semibold">{value}</span>
                  </span>
                ))}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <span className="text-xs font-semibold text-gray-500">
              {formatTimestamp(activity.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;

