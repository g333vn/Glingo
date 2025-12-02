// src/pages/admin/NotificationManagementPage.jsx
// 🔔 NOTIFICATION MANAGEMENT PAGE (Unified)
// Quản lý thông báo hệ thống và template tự động

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { getUsers } from '../../data/users.js';
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  cleanupExpiredNotifications,
  getCustomTypes,
  addCustomType,
  deleteCustomType
} from '../../utils/notificationManager.js';
import {
  getStreakTemplates,
  updateStreakTemplate,
  resetStreakTemplates
} from '../../utils/streakNotificationManager.js';

function NotificationManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('system'); // 'system' or 'streak'
  
  // System Notifications State
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [customTypes, setCustomTypes] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [newTypeData, setNewTypeData] = useState({
    value: '',
    label: '',
    icon: '📢',
    color: 'purple'
  });
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetUsers: [],
    targetRoles: [],
    expiresAt: ''
  });

  // Streak Templates State
  const [templates, setTemplates] = useState({
    warning: { title: '', message: '', type: 'warning' },
    reset: { title: '', message: '', type: 'error' },
    daily: { title: '', message: '', type: 'success' },
    milestone: { title: '', message: '', type: 'success' }
  });
  const [editingKey, setEditingKey] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const defaultTypes = useMemo(() => [
    { value: 'info', label: t('notifications.type.info') || 'Thông tin', icon: 'ℹ️', color: 'blue', isDefault: true },
    { value: 'success', label: t('notifications.type.success') || 'Thành công', icon: '✅', color: 'green', isDefault: true },
    { value: 'warning', label: t('notifications.type.warning') || 'Cảnh báo', icon: '⚠️', color: 'yellow', isDefault: true },
    { value: 'error', label: t('notifications.type.error') || 'Lỗi', icon: '❌', color: 'red', isDefault: true }
  ], [t]);

  const notificationTypes = useMemo(() => [...defaultTypes, ...customTypes], [defaultTypes, customTypes]);

  useEffect(() => {
    loadData();
    
    // Listen for updates
    const handleUpdate = () => {
      loadData();
    };
    
    window.addEventListener('notificationsUpdated', handleUpdate);
    window.addEventListener('notificationTypesUpdated', handleUpdate);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showTypeDropdown && !event.target.closest('.notification-type-input-container')) {
        setShowTypeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
      window.removeEventListener('notificationTypesUpdated', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypeDropdown]);

  const loadData = () => {
    if (activeTab === 'system') {
      setNotifications(getAllNotifications());
      setUsers(getUsers());
      setCustomTypes(getCustomTypes());
    } else {
      const loaded = getStreakTemplates();
      setTemplates(loaded);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // ========== SYSTEM NOTIFICATIONS HANDLERS ==========
  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      targetUsers: [],
      targetRoles: [],
      expiresAt: ''
    });
    setShowTypeDropdown(false);
    setShowModal(true);
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      targetUsers: notification.targetUsers || [],
      targetRoles: notification.targetRoles || [],
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : ''
    });
    setUserSearchTerm('');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm(t('notifications.admin.deleteConfirm') || 'Bạn có chắc muốn xóa thông báo này?')) {
      deleteNotification(id);
      loadData();
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.message) {
      alert(t('notifications.admin.fillRequired') || 'Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }

    const hasTargetUsers = formData.targetUsers && formData.targetUsers.length > 0;
    const hasTargetRoles = formData.targetRoles && formData.targetRoles.length > 0;
    
    if (!hasTargetUsers && !hasTargetRoles) {
      alert(t('notifications.admin.selectTargets') || 'Vui lòng chọn ít nhất một user hoặc role để gửi thông báo!');
      return;
    }

    const notificationData = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetUsers: formData.targetUsers,
      targetRoles: formData.targetRoles,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
    };

    if (editingNotification) {
      // Hiện tại update chỉ cập nhật local cache
      updateNotification(editingNotification.id, notificationData);
    } else {
      // Tạo notification mới và đẩy lên Supabase (thông qua createNotification async)
      await createNotification(notificationData);
    }

    setShowModal(false);
    // Reload lại danh sách từ local
    loadData();
  };

  const toggleUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const handleCleanup = () => {
    const deleted = cleanupExpiredNotifications();
    alert(t('notifications.admin.cleanupSuccess', { count: deleted }) || `Đã xóa ${deleted} thông báo hết hạn!`);
    loadData();
  };

  const getNotificationTypeColor = (type) => {
    const typeLower = (type || '').toLowerCase();
    switch (typeLower) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      default:
        return 'bg-purple-100 border-purple-400 text-purple-800';
    }
  };

  // Helper function to translate notification title and message based on pattern matching
  const translateNotification = (notification) => {
    const title = notification.title || '';
    const message = notification.message || '';
    
    // Extract streak number from message if present
    let streak = '';
    const numberMatch = message.match(/(\d+)\s*(ngày|days|日)/i);
    streak = numberMatch ? numberMatch[1] : '';
    
    // Pattern matching for streak notifications
    // Warning notification
    if (title.includes('Nhắc nhở học tập') || title.includes('Study Reminder') || title.includes('学習リマインダー') ||
        title.includes('⚠️') && (title.includes('Nhắc nhở') || title.includes('Reminder')) ||
        message.includes('bỏ lỡ 1 ngày học') || message.includes('missed 1 day') || message.includes('1日学習を逃')) {
      return {
        title: t('streakNotifications.messages.warning.title') || title,
        message: t('streakNotifications.messages.warning.message') || message
      };
    }
    
    // Reset notification
    if (title.includes('Streak đã bị reset') || title.includes('Streak Reset') || title.includes('ストリークリセット') ||
        title.includes('💔') && (title.includes('Streak') || title.includes('reset')) ||
        message.includes('reset về 0') || message.includes('reset to 0') || message.includes('0にリセット')) {
      return {
        title: t('streakNotifications.messages.reset.title') || title,
        message: t('streakNotifications.messages.reset.message') || message
      };
    }
    
    // Daily encouragement
    if ((title.includes('Duy trì streak') || title.includes('Maintain Streak') || title.includes('ストリークを維持') ||
        (title.includes('🔥') && (title.includes('Duy trì') || title.includes('Maintain')))) ||
        ((message.includes('học liên tục') || message.includes('studied continuously') || message.includes('連続で学習')) &&
        !message.includes('đạt') && !message.includes('reached') && !message.includes('達成'))) {
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
        title.includes('🏆') && (title.includes('Mốc') || title.includes('Milestone')) ||
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
  };

  // ========== STREAK TEMPLATES HANDLERS ==========
  const loadTemplates = () => {
    const loaded = getStreakTemplates();
    setTemplates(loaded);
  };

  const handleTemplateEdit = (key) => {
    setEditingKey(key);
  };

  const handleTemplateSave = (key) => {
    if (updateStreakTemplate(key, templates[key])) {
      setEditingKey(null);
      alert(t('streakNotifications.saveSuccess') || 'Đã lưu thành công!');
    } else {
      alert(t('streakNotifications.saveError') || 'Lỗi khi lưu!');
    }
  };

  const handleTemplateReset = () => {
    if (resetStreakTemplates()) {
      loadTemplates();
      setShowResetConfirm(false);
      alert(t('streakNotifications.resetSuccess') || 'Đã reset về mặc định!');
    } else {
      alert(t('streakNotifications.resetError') || 'Lỗi khi reset!');
    }
  };

  const templateLabels = {
    warning: t('streakNotifications.templates.warning') || 'Cảnh báo (1 ngày không học)',
    reset: t('streakNotifications.templates.reset') || 'Reset (2+ ngày không học)',
    daily: t('streakNotifications.templates.daily') || 'Khích lệ hàng ngày',
    milestone: t('streakNotifications.templates.milestone') || 'Mốc quan trọng (mỗi 5 ngày)'
  };

  const templateDescriptions = {
    warning: t('streakNotifications.descriptions.warning') || 'Gửi khi user bỏ lỡ 1 ngày học',
    reset: t('streakNotifications.descriptions.reset') || 'Gửi khi streak bị reset (2+ ngày không học)',
    daily: t('streakNotifications.descriptions.daily') || 'Gửi mỗi ngày khi user học (trừ ngày milestone)',
    milestone: t('streakNotifications.descriptions.milestone') || 'Gửi mỗi 5 ngày (5, 10, 15, 20, ...)'
  };

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              🔔 {t('notifications.admin.title') || 'Quản lý thông báo'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('notifications.admin.subtitle') || 'Gửi thông báo hệ thống và quản lý template tự động'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6 flex gap-2 border-b-[3px] border-black overflow-x-auto">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 sm:px-4 py-2 font-black uppercase transition-all border-b-[4px] text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-gray-200 text-gray-700 border-transparent hover:bg-gray-300'
            }`}
          >
            🔔 {t('notifications.admin.tabs.system') || 'Thông báo hệ thống'}
          </button>
          <button
            onClick={() => setActiveTab('streak')}
            className={`px-3 sm:px-4 py-2 font-black uppercase transition-all border-b-[4px] text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'streak'
                ? 'bg-orange-500 text-white border-orange-600'
                : 'bg-gray-200 text-gray-700 border-transparent hover:bg-gray-300'
            }`}
          >
            🔥 {t('notifications.admin.tabs.streak') || 'Thông báo tự động'}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'system' ? (
          <>
            {/* System Notifications Actions */}
            <div className="mb-6 flex gap-2 justify-end">
              <button
                onClick={handleCleanup}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black transition-all uppercase tracking-wide text-xs"
              >
                🗑️ {t('notifications.admin.cleanup') || 'Dọn dẹp'}
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black transition-all uppercase tracking-wide text-xs"
              >
                ➕ {t('notifications.admin.create') || 'Tạo mới'}
              </button>
            </div>

            {/* Notifications Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[600px] sm:min-w-[800px] border-[3px] border-black">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                      {t('notifications.admin.table.title') || 'Tiêu đề'}
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                      {t('notifications.admin.table.type') || 'Loại'}
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                      {t('notifications.admin.table.target') || 'Đối tượng'}
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                      {t('notifications.admin.table.created') || 'Ngày tạo'}
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                      {t('notifications.admin.table.actions') || 'Thao tác'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-2 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                        {t('notifications.admin.empty') || 'Chưa có thông báo nào'}
                      </td>
                    </tr>
                  ) : (
                    notifications.map((notif) => {
                      const translated = translateNotification(notif);
                      return (
                      <tr key={notif.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-gray-900">
                          {translated.title}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded border-[2px] ${getNotificationTypeColor(notif.type)}`}>
                            {t(`notifications.type.${notif.type}`) || notif.type}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-600">
                          {(!notif.targetUsers || notif.targetUsers.length === 0) &&
                           (!notif.targetRoles || notif.targetRoles.length === 0) ? (
                            <span className="font-bold text-red-600">{t('notifications.admin.noTargets') || 'Không gửi tới ai'}</span>
                          ) : (
                            <div className="space-y-1">
                              {notif.targetUsers && notif.targetUsers.length > 0 && (
                                <div>
                                  <span className="font-bold">{t('notifications.admin.table.users') || 'Users:'}</span>{' '}
                                  {notif.targetUsers.map((userId) => {
                                    const user = users.find(u => u.id === userId || u.id?.toString() === userId?.toString());
                                    return user ? (user.username || user.name || user.email || `ID: ${userId}`) : `ID: ${userId}`;
                                  }).join(', ')}
                                </div>
                              )}
                              {notif.targetRoles && notif.targetRoles.length > 0 && (
                                <div>
                                  <span className="font-bold">{t('notifications.admin.table.roles') || 'Roles:'}</span> {notif.targetRoles.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-600">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(notif)}
                              className="px-1.5 sm:px-2 py-1 bg-blue-500 text-white rounded border-[2px] border-black text-[10px] sm:text-xs font-bold hover:bg-blue-600"
                            >
                              {t('common.edit') || 'Sửa'}
                            </button>
                            <button
                              onClick={() => handleDelete(notif.id)}
                              className="px-1.5 sm:px-2 py-1 bg-red-500 text-white rounded border-[2px] border-black text-[10px] sm:text-xs font-bold hover:bg-red-600"
                            >
                              {t('common.delete') || 'Xóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Streak Templates Actions */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-sm uppercase flex items-center gap-2"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">{t('streakNotifications.resetToDefault') || 'Reset về mặc định'}</span>
              </button>
            </div>

            {/* Templates List */}
            <div className="space-y-4 sm:space-y-6">
              {Object.keys(templates).map((key) => {
                const template = templates[key];
                const isEditing = editingKey === key;
                // Use translated version for preview (keep original for editing)
                const translatedTemplate = translateNotification(template);

                return (
                  <div
                    key={key}
                    className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6"
                  >
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-black text-gray-800 mb-1 sm:mb-2 uppercase tracking-wide">
                        {templateLabels[key]}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                        {templateDescriptions[key]}
                      </p>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Title */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                            {t('streakNotifications.form.title') || 'Tiêu đề *'}
                          </label>
                          <input
                            type="text"
                            value={template.title}
                            onChange={(e) =>
                              setTemplates({
                                ...templates,
                                [key]: { ...template, title: e.target.value }
                              })
                            }
                            className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold text-sm sm:text-base"
                            placeholder={t('streakNotifications.form.titlePlaceholder') || 'Nhập tiêu đề...'}
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                            {t('streakNotifications.form.message') || 'Nội dung *'}
                          </label>
                          <textarea
                            value={template.message}
                            onChange={(e) =>
                              setTemplates({
                                ...templates,
                                [key]: { ...template, message: e.target.value }
                              })
                            }
                            rows={4}
                            className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold resize-y text-sm sm:text-base"
                            placeholder={t('streakNotifications.form.messagePlaceholder') || 'Nhập nội dung...'}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            💡 {t('streakNotifications.form.variables') || 'Có thể dùng {streak} để hiển thị số ngày streak'}
                          </p>
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                            {t('streakNotifications.form.type') || 'Loại'}
                          </label>
                          <select
                            value={template.type}
                            onChange={(e) =>
                              setTemplates({
                                ...templates,
                                [key]: { ...template, type: e.target.value }
                              })
                            }
                            className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold text-sm sm:text-base"
                          >
                            <option value="info">{t('streakNotifications.form.typeOptions.info') || 'Info'}</option>
                            <option value="success">{t('streakNotifications.form.typeOptions.success') || 'Success'}</option>
                            <option value="warning">{t('streakNotifications.form.typeOptions.warning') || 'Warning'}</option>
                            <option value="error">{t('streakNotifications.form.typeOptions.error') || 'Error'}</option>
                          </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleTemplateSave(key)}
                            className="flex-1 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all text-sm sm:text-base"
                          >
                            {t('common.save') || 'Lưu'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingKey(null);
                              loadTemplates();
                            }}
                            className="flex-1 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all text-sm sm:text-base"
                          >
                            {t('common.cancel') || 'Hủy'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Preview */}
                        <div className="bg-gray-50 border-[2px] border-gray-300 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-3 mb-2">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-[3px] border-black flex items-center justify-center text-lg sm:text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              template.type === 'success' ? 'bg-green-500' :
                              template.type === 'warning' ? 'bg-yellow-500' :
                              template.type === 'error' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}>
                              <span className="text-white">
                                {template.type === 'success' ? '✅' :
                                 template.type === 'warning' ? '⚠️' :
                                 template.type === 'error' ? '❌' :
                                 'ℹ️'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide mb-1">
                                {translatedTemplate.title || t('streakNotifications.preview.title') || 'Tiêu đề'}
                              </h4>
                              <p className="text-xs text-gray-700 font-semibold">
                                {translatedTemplate.message || t('streakNotifications.preview.message') || 'Nội dung thông báo...'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleTemplateEdit(key)}
                          className="w-full px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all text-sm sm:text-base"
                        >
                          {t('streakNotifications.edit') || 'Chỉnh sửa'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>

      {/* System Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-black mb-4">
                {editingNotification ? t('notifications.admin.editTitle') : t('notifications.admin.createTitle')}
              </h3>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.title') || 'Tiêu đề *'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
                  placeholder={t('notifications.admin.form.titlePlaceholder') || 'Nhập tiêu đề thông báo...'}
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.message') || 'Nội dung *'}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold resize-y"
                  placeholder={t('notifications.admin.form.messagePlaceholder') || 'Nhập nội dung thông báo...'}
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('notifications.admin.form.type') || 'Loại thông báo'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTypeData({ value: '', label: '', icon: '📢', color: 'purple' });
                      setShowAddTypeModal(true);
                    }}
                    className="px-2 py-1 bg-purple-500 text-white rounded border-[2px] border-black text-xs font-bold hover:bg-purple-600"
                    title={t('notifications.admin.addType') || 'Thêm loại mới'}
                  >
                    ➕ {t('notifications.admin.addType') || 'Thêm loại'}
                  </button>
                </div>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative notification-type-input-container">
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => {
                          setFormData({ ...formData, type: e.target.value });
                          setShowTypeDropdown(false);
                        }}
                        onFocus={() => setShowTypeDropdown(true)}
                        className="w-full px-4 py-2 pr-10 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
                        placeholder={t('notifications.admin.form.typePlaceholder') || 'Chọn hoặc nhập loại thông báo...'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown */}
                      {showTypeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-48 overflow-y-auto">
                          {notificationTypes.map((type) => (
                            <div
                              key={type.value}
                              className="flex items-center group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, type: type.value });
                                  setShowTypeDropdown(false);
                                }}
                                className={`flex-1 text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                                  formData.type === type.value ? 'bg-blue-50' : ''
                                }`}
                              >
                                <span className="text-lg">{type.icon}</span>
                                <span className="font-bold">{type.label}</span>
                                <span className="text-xs text-gray-500 ml-auto">({type.value})</span>
                              </button>
                              {!type.isDefault && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const confirmMessage = t('notifications.admin.deleteTypeConfirm') || 'Xóa loại này?';
                                    if (confirm(confirmMessage)) {
                                      deleteCustomType(type.value);
                                      if (formData.type === type.value) {
                                        setFormData({ ...formData, type: 'info' });
                                      }
                                      loadData();
                                    }
                                  }}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title={t('notifications.admin.deleteType') || 'Xóa loại'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {notificationTypes.map((type) => {
                        const isActive = formData.type === type.value;
                        const colorClasses = {
                          blue: isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
                          green: isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
                          yellow: isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600',
                          red: isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600',
                          purple: isActive ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                        };
                        
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, type: type.value });
                              setShowTypeDropdown(false);
                            }}
                            className={`px-3 py-2 rounded-lg border-[2px] border-black text-xs font-bold transition-all text-white ${
                              colorClasses[type.color] || 'bg-gray-500 hover:bg-gray-600'
                            } ${isActive ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                            title={type.label}
                          >
                            {type.icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💡 {t('notifications.admin.form.typeHint') || 'Chọn từ dropdown, click icon, hoặc nhập loại tùy chỉnh'}
                </p>
              </div>

              {/* Target Users */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.targetUsers') || 'Gửi cho Users (tick vào để gửi)'}
                </label>
                <div className="mb-2">
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border-[2px] border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-sm"
                    placeholder={t('notifications.admin.form.searchUsers') || '🔍 Tìm kiếm user (username, tên, email)...'}
                  />
                </div>
                <div className="max-h-32 overflow-y-auto border-[2px] border-gray-300 rounded-lg p-2 space-y-2">
                  {users
                    .filter((user) => {
                      if (!userSearchTerm || userSearchTerm.trim() === '') return true;
                      const searchLower = userSearchTerm.toLowerCase();
                      return (
                        user.username?.toLowerCase().includes(searchLower) ||
                        user.name?.toLowerCase().includes(searchLower) ||
                        user.email?.toLowerCase().includes(searchLower) ||
                        user.id?.toString().includes(searchLower)
                      );
                    })
                    .map((user) => (
                      <label key={user.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.targetUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 border-[2px] border-black"
                        />
                        <span className="text-sm font-bold">
                          {user.username} ({user.name || user.email || 'N/A'})
                        </span>
                      </label>
                    ))}
                  {users.filter((user) => {
                    if (!userSearchTerm || userSearchTerm.trim() === '') return false;
                    const searchLower = userSearchTerm.toLowerCase();
                    return (
                      user.username?.toLowerCase().includes(searchLower) ||
                      user.name?.toLowerCase().includes(searchLower) ||
                      user.email?.toLowerCase().includes(searchLower) ||
                      user.id?.toString().includes(searchLower)
                    );
                  }).length === 0 && userSearchTerm.trim() !== '' && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      {t('notifications.admin.form.noUsersFound') || 'Không tìm thấy user nào'}
                    </div>
                  )}
                </div>
              </div>

              {/* Target Roles */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.targetRoles') || 'Gửi cho Roles (tick vào để gửi)'}
                </label>
                <div className="space-y-2">
                  {['admin', 'editor', 'user'].map((role) => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 border-[2px] border-black"
                      />
                      <span className="text-sm font-bold">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expires At */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.expiresAt') || 'Hết hạn (để trống = không hết hạn)'}
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('notifications.admin.send') || 'Gửi'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowTypeDropdown(false);
                    setUserSearchTerm('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('common.cancel') || 'Hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Type Modal */}
      {showAddTypeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddTypeModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-black mb-4">
                {t('notifications.admin.addTypeTitle') || 'Thêm loại thông báo mới'}
              </h3>

              {/* Value */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.typeValue') || 'Giá trị (value) *'}
                </label>
                <input
                  type="text"
                  value={newTypeData.value}
                  onChange={(e) => setNewTypeData({ ...newTypeData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
                  placeholder="update, maintenance, promotion..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('notifications.admin.form.typeValueHint') || 'Chỉ dùng chữ thường, số và dấu gạch ngang'}
                </p>
              </div>

              {/* Label */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.typeLabel') || 'Nhãn hiển thị (label) *'}
                </label>
                <input
                  type="text"
                  value={newTypeData.label}
                  onChange={(e) => setNewTypeData({ ...newTypeData, label: e.target.value })}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
                  placeholder="Cập nhật, Bảo trì, Khuyến mãi..."
                />
              </div>

              {/* Icon */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.typeIcon') || 'Icon (emoji)'}
                </label>
                <input
                  type="text"
                  value={newTypeData.icon}
                  onChange={(e) => setNewTypeData({ ...newTypeData, icon: e.target.value })}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold text-2xl text-center"
                  placeholder="📢"
                  maxLength={2}
                />
              </div>

              {/* Color */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('notifications.admin.form.typeColor') || 'Màu'}
                </label>
                <select
                  value={newTypeData.color}
                  onChange={(e) => setNewTypeData({ ...newTypeData, color: e.target.value })}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
                >
                  <option value="purple">{t('notifications.admin.form.colorOptions.purple') || 'Purple'}</option>
                  <option value="blue">{t('notifications.admin.form.colorOptions.blue') || 'Blue'}</option>
                  <option value="green">{t('notifications.admin.form.colorOptions.green') || 'Green'}</option>
                  <option value="yellow">{t('notifications.admin.form.colorOptions.yellow') || 'Yellow'}</option>
                  <option value="red">{t('notifications.admin.form.colorOptions.red') || 'Red'}</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (!newTypeData.value || !newTypeData.label) {
                      alert(t('notifications.admin.fillTypeRequired') || 'Vui lòng điền đầy đủ giá trị và nhãn!');
                      return;
                    }
                    
                    if (notificationTypes.find(type => type.value === newTypeData.value)) {
                      alert(t('notifications.admin.typeExists') || 'Loại này đã tồn tại!');
                      return;
                    }
                    
                    if (addCustomType(newTypeData)) {
                      setFormData({ ...formData, type: newTypeData.value });
                      setShowAddTypeModal(false);
                      loadData();
                      alert(t('notifications.admin.typeAdded') || 'Đã thêm loại mới!');
                    } else {
                      alert(t('notifications.admin.typeAddError') || 'Lỗi khi thêm loại!');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('notifications.admin.add') || 'Thêm'}
                </button>
                <button
                  onClick={() => setShowAddTypeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('common.cancel') || 'Hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black mb-4">
              {t('streakNotifications.resetConfirm') || 'Reset về mặc định?'}
            </h3>
            <p className="text-gray-700 mb-6 font-semibold">
              {t('streakNotifications.resetConfirmMessage') || 'Tất cả các template sẽ được reset về giá trị mặc định. Bạn có chắc chắn?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTemplateReset}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
              >
                {t('streakNotifications.reset') || 'Reset'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
              >
                {t('common.cancel') || 'Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationManagementPage;
