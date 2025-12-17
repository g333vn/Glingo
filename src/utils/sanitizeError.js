// src/utils/sanitizeError.js
// 🔒 Sanitize error messages: production chỉ trả về message user-friendly,
// chi tiết kỹ thuật chỉ log ở server / dev console.

import { logger } from './logger.js';

/**
 * Map các error code / pattern sang message user-friendly
 */
const ERROR_MAP = {
  // Supabase Auth errors
  'invalid_credentials': 'Email hoặc mật khẩu không đúng.',
  'Invalid login credentials': 'Email hoặc mật khẩu không đúng.',
  'Email not confirmed': 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.',
  'User already registered': 'Email này đã được đăng ký.',
  'Password should be at least': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'rate limit': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  
  // Database / RLS errors
  '42501': 'Bạn không có quyền thực hiện thao tác này.',
  'row-level security': 'Bạn không có quyền truy cập dữ liệu này.',
  'RLS': 'Bạn không có quyền truy cập dữ liệu này.',
  '23505': 'Dữ liệu đã tồn tại.',
  'duplicate key': 'Dữ liệu đã tồn tại.',
  'unique constraint': 'Dữ liệu đã tồn tại.',
  'PGRST116': 'Không tìm thấy dữ liệu.',
  
  // Network errors
  'Failed to fetch': 'Không thể kết nối. Vui lòng kiểm tra mạng.',
  'NetworkError': 'Lỗi kết nối mạng.',
  'timeout': 'Yêu cầu quá lâu. Vui lòng thử lại.',
  
  // Generic
  'session': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
};

/**
 * Default message khi không match pattern nào
 */
const DEFAULT_ERROR = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';

/**
 * Sanitize error message cho client
 * - Production: trả về message user-friendly, log chi tiết ở server
 * - Dev: vẫn trả về message user-friendly nhưng log chi tiết ra console
 * 
 * @param {Error|string|object} error - Error object hoặc message
 * @param {string} context - Context để log (vd: '[AuthService]')
 * @returns {string} User-friendly error message
 */
export function sanitizeError(error, context = '') {
  // Extract message từ error object
  let rawMessage = '';
  let errorCode = '';
  
  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message || '';
  } else if (error && typeof error === 'object') {
    rawMessage = error.message || error.error || error.msg || JSON.stringify(error);
    errorCode = error.code || '';
  }
  
  // Log chi tiết (chỉ ở dev, hoặc gửi server ở prod)
  logger.debug(`${context} Raw error`, { 
    message: rawMessage, 
    code: errorCode,
    type: typeof error 
  });
  
  // Tìm message user-friendly
  // 1. Check error code trước
  if (errorCode && ERROR_MAP[errorCode]) {
    return ERROR_MAP[errorCode];
  }
  
  // 2. Check message patterns
  const lowerMessage = rawMessage.toLowerCase();
  for (const [pattern, friendlyMsg] of Object.entries(ERROR_MAP)) {
    if (lowerMessage.includes(pattern.toLowerCase())) {
      return friendlyMsg;
    }
  }
  
  // 3. Nếu không match, trả về default
  return DEFAULT_ERROR;
}

/**
 * Sanitize error và log chi tiết
 * Dùng khi muốn vừa log error vừa trả về message sạch
 * 
 * @param {Error|string|object} error 
 * @param {string} context 
 * @returns {string}
 */
export function sanitizeAndLogError(error, context = '') {
  // Log error đầy đủ (chỉ ở dev hoặc gửi server)
  logger.error(`${context} Error occurred`, { error });
  
  // Trả về message sạch
  return sanitizeError(error, context);
}

/**
 * Wrap một async function để tự động sanitize error
 * 
 * @param {Function} fn - Async function cần wrap
 * @param {string} context - Context để log
 * @returns {Function} Wrapped function
 */
export function withSanitizedError(fn, context = '') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const sanitized = sanitizeAndLogError(error, context);
      return { success: false, error: sanitized };
    }
  };
}

