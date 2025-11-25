// src/utils/emailValidator.js
// Utility để validate email với pattern chặt chẽ

/**
 * Validate email với pattern chặt chẽ:
 * - Phải có @
 * - Phải có tên domain (ít nhất 1 ký tự)
 * - Phải có TLD (top-level domain) như .com, .net, .org, .vn, etc. (ít nhất 2 ký tự)
 * 
 * @param {string} email - Email cần validate
 * @returns {boolean} true nếu email hợp lệ, false nếu không hợp lệ
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Pattern: 
  // - Phần trước @: [a-zA-Z0-9._-]+ (ít nhất 1 ký tự, cho phép chữ, số, dấu chấm, gạch dưới, gạch ngang)
  // - @
  // - Tên domain: [a-zA-Z0-9][a-zA-Z0-9.-]* (bắt đầu bằng chữ/số, có thể có chữ, số, dấu chấm, gạch ngang)
  // - Dấu chấm
  // - TLD: [a-zA-Z]{2,} (ít nhất 2 ký tự, chỉ chữ cái)
  // - Có thể có sub-TLD như .com.vn: (\.[a-zA-Z]{2,})?
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

  return emailPattern.test(email.trim());
}

/**
 * Get error message cho email không hợp lệ
 * @param {string} email - Email cần validate
 * @returns {string} Error message hoặc empty string nếu hợp lệ
 */
export function getEmailErrorMessage(email) {
  if (!email || !email.trim()) {
    return 'Email không được để trống';
  }

  if (!isValidEmail(email)) {
    return 'Email không hợp lệ. Email phải có định dạng: tên@domain.com (ví dụ: user@example.com)';
  }

  return '';
}

