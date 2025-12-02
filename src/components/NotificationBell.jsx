// src/components/NotificationBell.jsx
// 🔔 Notification Bell Component - Display notifications in header

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../utils/notificationManager.js';

function NotificationBell() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'thisWeek', 'thisMonth'
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setAllNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      const userNotifs = await getUserNotifications(user);
      const unread = await getUnreadCount(user);
      
      setAllNotifications(userNotifs);
      setUnreadCount(unread);
    };

    loadNotifications();

    // Listen for notification updates
    const handleUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notificationsUpdated', handleUpdate);
    
    // Cleanup expired notifications periodically
    const cleanupInterval = setInterval(() => {
      const { cleanupExpiredNotifications } = require('../utils/notificationManager.js');
      cleanupExpiredNotifications();
      loadNotifications();
    }, 60 * 60 * 1000); // Every hour

    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
      clearInterval(cleanupInterval);
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = useCallback(async (notification) => {
    if (user) {
      await markAsRead(notification.id, user);
      const unread = await getUnreadCount(user);
      setUnreadCount(unread);
    }
  }, [user]);

  const handleMarkAllRead = useCallback(async () => {
    if (user) {
      await markAllAsRead(user);
      // Reload notifications from server to update UI
      const userNotifs = await getUserNotifications(user);
      const unread = await getUnreadCount(user);
      setAllNotifications(userNotifs);
      setUnreadCount(unread);
    }
  }, [user]);

  const getNotificationIcon = useCallback((type) => {
    const typeLower = (type || '').toLowerCase();
    switch (typeLower) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢'; // Custom type icon
    }
  }, []);

  const getNotificationColor = useCallback((type) => {
    const typeLower = (type || '').toLowerCase();
    switch (typeLower) {
      case 'success':
        return 'bg-green-50 border-green-400';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400';
      case 'error':
        return 'bg-red-50 border-red-400';
      case 'info':
        return 'bg-blue-50 border-blue-400';
      default:
        return 'bg-purple-50 border-purple-400'; // Custom type color
    }
  }, []);

  // Helper function to translate notification messages based on pattern matching
  const translateNotification = useCallback((notification) => {
    const title = notification.title || '';
    const message = notification.message || '';
    
    // Extract streak number from message if present (look for {streak} or actual numbers)
    let streak = '';
    if (message.includes('{streak}')) {
      // If message has {streak} placeholder, try to extract from original message
      const numberMatch = message.match(/(\d+)\s*(ngày|days|日)/i);
      streak = numberMatch ? numberMatch[1] : '';
    } else {
      // Try to extract number from message
      const numberMatch = message.match(/(\d+)\s*(ngày|days|日)/i);
      streak = numberMatch ? numberMatch[1] : '';
    }
    
    // Pattern matching for Vietnamese default messages
    // Warning notification
    if (title.includes('Nhắc nhở học tập') || title.includes('Study Reminder') || title.includes('学習リマインダー') ||
        message.includes('bỏ lỡ 1 ngày học') || message.includes('missed 1 day') || message.includes('1日学習を逃')) {
      return {
        title: t('streakNotifications.messages.warning.title') || title,
        message: t('streakNotifications.messages.warning.message') || message
      };
    }
    
    // Reset notification
    if (title.includes('Streak đã bị reset') || title.includes('Streak Reset') || title.includes('ストリークリセット') ||
        message.includes('reset về 0') || message.includes('reset to 0') || message.includes('0にリセット')) {
      return {
        title: t('streakNotifications.messages.reset.title') || title,
        message: t('streakNotifications.messages.reset.message') || message
      };
    }
    
    // Daily encouragement
    if (title.includes('Duy trì streak') || title.includes('Maintain Streak') || title.includes('ストリークを維持') ||
        (message.includes('học liên tục') || message.includes('studied continuously') || message.includes('連続で学習')) &&
        !message.includes('đạt') && !message.includes('reached') && !message.includes('達成')) {
      let translatedMessage = t('streakNotifications.messages.daily.message') || message;
      if (streak) {
        translatedMessage = translatedMessage.replace('{streak}', streak);
      }
      return {
        title: t('streakNotifications.messages.daily.title') || title,
        message: translatedMessage
      };
    }
    
    // Milestone notification
    if (title.includes('Mốc quan trọng') || title.includes('Important Milestone') || title.includes('重要なマイルストーン') ||
        (message.includes('đạt') && message.includes('ngày học liên tục')) || 
        (message.includes('reached') && message.includes('consecutive study days')) ||
        (message.includes('達成') && message.includes('連続で学習'))) {
      let translatedMessage = t('streakNotifications.messages.milestone.message') || message;
      if (streak) {
        translatedMessage = translatedMessage.replace('{streak}', streak);
      }
      return {
        title: t('streakNotifications.messages.milestone.title') || title,
        message: translatedMessage
      };
    }
    
    // If no pattern matches, return original
    return { title, message };
  }, [t]);

  // Filter notifications by time and search term
  const filteredNotifications = useMemo(() => {
    let filtered = [...allNotifications];

    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(notif => {
        if (!notif.createdAt) return false;
        const notifDate = new Date(notif.createdAt);
        
        switch (timeFilter) {
          case 'today':
            return notifDate >= today;
          case 'thisWeek':
            return notifDate >= thisWeek;
          case 'thisMonth':
            return notifDate >= thisMonth;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notif => {
        const titleMatch = notif.title?.toLowerCase().includes(searchLower);
        const messageMatch = notif.message?.toLowerCase().includes(searchLower);
        return titleMatch || messageMatch;
      });
    }

    return filtered;
  }, [allNotifications, timeFilter, searchTerm]);

  // Memoize translated notifications to avoid re-translating on every render
  const translatedNotifications = useMemo(() => {
    return filteredNotifications.map(notif => ({
      ...notif,
      translated: translateNotification(notif)
    }));
  }, [filteredNotifications, translateNotification]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border-[2px] border-white/30 hover:border-white bg-white/10 hover:bg-white/20 transition-all duration-200"
        title={t('notifications.title') || 'Thông báo'}
      >
        <span className="text-lg md:text-xl">🔔</span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      <div className={`fixed md:absolute right-2 md:right-0 top-20 md:top-full mt-0 md:mt-2 w-[calc(100vw-1rem)] md:w-80 lg:w-96 max-w-[calc(100vw-1rem)] md:max-w-none bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[60] max-h-[calc(100vh-6rem)] md:max-h-[600px] flex flex-col transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'}`}>
          {/* Header - Neo Brutalism Style */}
          <div className="flex items-center justify-between p-4 bg-yellow-400 border-b-[3px] border-black">
            <h3 className="font-black text-lg text-black uppercase tracking-wide">
              {t('notifications.title') || 'Thông báo'}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2 py-1 text-[10px] font-black text-white bg-blue-500 rounded border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase whitespace-nowrap"
                title={t('notifications.markAllRead') || 'Đánh dấu tất cả đã đọc'}
              >
                ✓ {t('notifications.markAllRead') || 'Tất cả'}
              </button>
            )}
          </div>

          {/* Filters - Neo Brutalism Style */}
          <div className="p-3 bg-gray-50 border-b-[3px] border-black space-y-2">
            {/* Time Filters */}
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-[3px] border-black transition-all uppercase ${
                  timeFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                }`}
              >
                {t('notifications.filter.all') || 'Tất cả'}
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-[3px] border-black transition-all uppercase ${
                  timeFilter === 'today'
                    ? 'bg-blue-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                }`}
              >
                {t('notifications.filter.today') || 'Hôm nay'}
              </button>
              <button
                onClick={() => setTimeFilter('thisWeek')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-[3px] border-black transition-all uppercase ${
                  timeFilter === 'thisWeek'
                    ? 'bg-blue-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                }`}
              >
                {t('notifications.filter.thisWeek') || 'Tuần này'}
              </button>
              <button
                onClick={() => setTimeFilter('thisMonth')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-[3px] border-black transition-all uppercase ${
                  timeFilter === 'thisMonth'
                    ? 'bg-blue-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                }`}
              >
                {t('notifications.filter.thisMonth') || 'Tháng này'}
              </button>
            </div>

            {/* Search Input - Neo Brutalism Style */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('notifications.search') || '🔍 Tìm kiếm (tiêu đề, nội dung)...'}
                className="w-full px-3 py-2 text-sm font-bold border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black text-xs"
                  title={t('notifications.clearSearch') || 'Xóa tìm kiếm'}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center bg-gray-50">
                <span className="text-5xl mb-3 block">📭</span>
                <p className="text-sm text-gray-700 font-black uppercase tracking-wide">
                  {t('notifications.empty') || 'Không có thông báo nào'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black">
                {translatedNotifications.map((notif) => {
                  const isRead = user && notif.readBy && notif.readBy.includes(user.id);
                  
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 cursor-pointer transition-all border-l-[4px] ${
                        !isRead 
                          ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100' 
                          : 'bg-white border-l-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg border-[3px] border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          notif.type === 'success' ? 'bg-green-500' :
                          notif.type === 'warning' ? 'bg-yellow-500' :
                          notif.type === 'error' ? 'bg-red-500' :
                          notif.type === 'info' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}>
                          <span className="text-white">{getNotificationIcon(notif.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-black text-sm text-black uppercase tracking-wide">
                              {notif.translated.title}
                            </h4>
                            {!isRead && (
                              <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1 border-[2px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 mb-2 leading-relaxed font-semibold">
                            {notif.translated.message}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`inline-block px-2 py-1 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getNotificationColor(notif.type)}`}>
                              <span className="text-[10px] font-black text-black uppercase">
                                {notif.type === 'success' && (t('notifications.type.success') || 'Thành công')}
                                {notif.type === 'warning' && (t('notifications.type.warning') || 'Cảnh báo')}
                                {notif.type === 'error' && (t('notifications.type.error') || 'Lỗi')}
                                {notif.type === 'info' && (t('notifications.type.info') || 'Thông tin')}
                                {!['success', 'warning', 'error', 'info'].includes((notif.type || '').toLowerCase()) && (notif.type || 'Custom')}
                              </span>
                            </div>
                          </div>
                          {notif.createdAt && (
                            <p className="text-[10px] text-gray-500 font-bold">
                              {new Date(notif.createdAt).toLocaleDateString(navigator.language || 'vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default NotificationBell;

