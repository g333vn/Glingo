// src/utils/activityLogger.js
// Utility để lưu và quản lý Recent Activity cho Editor

const ACTIVITY_STORAGE_KEY = 'editorRecentActivities';
const MAX_ACTIVITIES = 50; // Giới hạn số lượng hoạt động

/**
 * Thêm một hoạt động mới vào Recent Activity
 * @param {Object} activity - Thông tin hoạt động
 * @param {string} activity.type - Loại hoạt động (profile_update, quiz_created, exam_created, etc.)
 * @param {string} activity.title - Tiêu đề hoạt động
 * @param {string} activity.description - Mô tả chi tiết
 * @param {string} activity.user - Tên user thực hiện
 * @param {string} activity.timestamp - Thời gian (ISO string)
 */
export function addEditorActivity(activity) {
  try {
    // Lấy danh sách hoạt động hiện tại
    const existingActivities = getEditorActivities();

    // Thêm hoạt động mới vào đầu danh sách
    const newActivity = {
      id: Date.now().toString(),
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString()
    };

    const updatedActivities = [newActivity, ...existingActivities];

    // Giới hạn số lượng hoạt động
    const limitedActivities = updatedActivities.slice(0, MAX_ACTIVITIES);

    // Lưu vào localStorage
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(limitedActivities));

    console.log('✅ Đã thêm hoạt động vào Recent Activity:', newActivity);
  } catch (error) {
    console.error('❌ Lỗi khi lưu hoạt động:', error);
  }
}

/**
 * Lấy danh sách Recent Activities
 * @returns {Array} Danh sách hoạt động
 */
export function getEditorActivities() {
  try {
    const data = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('❌ Lỗi khi đọc hoạt động:', error);
    return [];
  }
}

/**
 * Xóa tất cả hoạt động
 */
export function clearEditorActivities() {
  try {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    console.log('✅ Đã xóa tất cả hoạt động');
  } catch (error) {
    console.error('❌ Lỗi khi xóa hoạt động:', error);
  }
}

/**
 * Xóa một hoạt động cụ thể
 * @param {string} activityId - ID của hoạt động cần xóa
 */
export function deleteEditorActivity(activityId) {
  try {
    const activities = getEditorActivities();
    const filtered = activities.filter(activity => activity.id !== activityId);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(filtered));
    console.log('✅ Đã xóa hoạt động:', activityId);
  } catch (error) {
    console.error('❌ Lỗi khi xóa hoạt động:', error);
  }
}

/**
 * Format thời gian để hiển thị
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Thời gian đã format
 */
export function formatActivityTime(timestamp) {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Vừa xong';
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    return 'Không xác định';
  }
}

/**
 * Lấy icon cho loại hoạt động
 * @param {string} type - Loại hoạt động
 * @returns {string} Emoji icon
 */
export function getActivityIcon(type) {
  const icons = {
    profile_update: '👤',
    quiz_created: '✏️',
    quiz_updated: '📝',
    exam_created: '📋',
    exam_updated: '📄',
    content_created: '📚',
    content_updated: '📖',
    default: '📌'
  };
  return icons[type] || icons.default;
}

