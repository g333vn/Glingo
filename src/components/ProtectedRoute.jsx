// src/components/ProtectedRoute.jsx
// Component để bảo vệ routes dựa trên role/permission

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from './ToastNotification.jsx';

function ProtectedRoute({ children, requiredPermission, requiredRole, adminOnly, editorOnly, editorOrAdmin }) {
  const { user, hasPermission, isLoading } = useAuth();
  const location = useLocation();
  const { warning } = useToast();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const redirectWithMessage = (message) => {
    warning(message);
    return <Navigate to="/" replace />;
  };

  // Check editorOnly requirement
  // ✅ FIX: Admin should also have access to editor routes
  if (editorOnly && user.role !== 'editor' && user.role !== 'admin') {
    return redirectWithMessage('Bạn đã đăng nhập nhưng không có quyền editor/admin để truy cập trang này.');
  }

  // Check editorOrAdmin requirement
  if (editorOrAdmin && user.role !== 'editor' && user.role !== 'admin') {
    return redirectWithMessage('Bạn đã đăng nhập nhưng không có quyền editor/admin để truy cập trang này.');
  }

  // Check adminOnly requirement
  if (adminOnly && user.role !== 'admin') {
    return redirectWithMessage('Bạn đã đăng nhập nhưng không có quyền admin để truy cập trang này.');
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return redirectWithMessage(`Bạn đã đăng nhập nhưng không có quyền ${requiredRole} để truy cập trang này.`);
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return redirectWithMessage('Bạn đã đăng nhập nhưng không có quyền truy cập tính năng này.');
  }

  // User has required role/permission
  return children;
}

export default ProtectedRoute;

