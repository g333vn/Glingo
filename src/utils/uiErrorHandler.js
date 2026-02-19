// src/utils/uiErrorHandler.js
// UI Error Handler - Hiển thị lỗi user-friendly, không lộ chi tiết kỹ thuật

import { sanitizeError } from './sanitizeError.js';
import { logger } from './logger.js';

/**
 * Xử lý error và trả về message user-friendly để hiển thị
 * @param {Error|string|object} error 
 * @param {string} context - Context để log (vd: 'Upload', 'Save')
 * @returns {string} User-friendly message
 */
export function getErrorMessage(error, context = '') {
  // Log chi tiết (chỉ dev / server)
  logger.error(`[UI] ${context} error`, { error });
  
  // Trả về message sạch
  return sanitizeError(error, `[UI] ${context}`);
}

/**
 * Hiển thị alert với message user-friendly
 * @param {Error|string|object} error 
 * @param {string} context 
 * @param {string} prefix - Prefix cho message (vd: ' Lỗi:')
 */
export function showErrorAlert(error, context = '', prefix = '❌ Lỗi') {
  const message = getErrorMessage(error, context);
  alert(`${prefix}: ${message}`);
}

/**
 * Tạo error message object cho state (type: 'error', text: ...)
 * @param {Error|string|object} error 
 * @param {string} context 
 * @returns {{ type: 'error', text: string }}
 */
export function createErrorState(error, context = '') {
  return {
    type: 'error',
    text: getErrorMessage(error, context)
  };
}

/**
 * Map các loại lỗi phổ biến sang message tiếng Việt
 * Dùng khi cần message cụ thể hơn sanitizeError
 */
export const ERROR_MESSAGES = {
  // Upload
  uploadFailed: 'Không thể tải lên. Vui lòng thử lại.',
  fileTooLarge: 'File quá lớn. Vui lòng chọn file nhỏ hơn.',
  invalidFileType: 'Định dạng file không hợp lệ.',
  
  // Save / Update
  saveFailed: 'Không thể lưu. Vui lòng thử lại.',
  updateFailed: 'Không thể cập nhật. Vui lòng thử lại.',
  deleteFailed: 'Không thể xoá. Vui lòng thử lại.',
  
  // Network
  networkError: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
  serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  timeout: 'Yêu cầu quá lâu. Vui lòng thử lại.',
  
  // Auth
  unauthorized: 'Bạn không có quyền thực hiện thao tác này.',
  sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  
  // Generic
  unknown: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
};

/**
 * Lấy message từ ERROR_MESSAGES hoặc fallback
 * @param {string} key 
 * @param {string} fallback 
 * @returns {string}
 */
export function getErrorText(key, fallback = ERROR_MESSAGES.unknown) {
  return ERROR_MESSAGES[key] || fallback;
}

export default {
  getErrorMessage,
  showErrorAlert,
  createErrorState,
  ERROR_MESSAGES,
  getErrorText,
};

