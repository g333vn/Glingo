// src/hooks/useAccessControl.jsx
// Hook để kiểm tra quyền truy cập cho các module LEVEL và JLPT

import { useAuth } from '../contexts/AuthContext.jsx';
import { hasAccess } from '../utils/accessControlManager.js';

/**
 * Hook để kiểm tra quyền truy cập
 * @param {string} module - 'level' or 'jlpt'
 * @param {string} levelId - 'n1', 'n2', 'n3', 'n4', 'n5'
 * @returns {boolean} True nếu user có quyền truy cập
 */
export function useAccessControl(module, levelId) {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }

  return hasAccess(module, levelId, user);
}

export default useAccessControl;

