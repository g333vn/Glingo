// src/components/ProtectedRoute.jsx
// Component để bảo vệ routes dựa trên role/permission

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function ProtectedRoute({ children, requiredPermission, requiredRole }) {
  const { user, hasPermission, isLoading } = useAuth();
  const location = useLocation();

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

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn cần quyền <strong>{requiredRole}</strong> để truy cập trang này.
          </p>
          <a
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Quay về trang chủ
          </a>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn không có quyền truy cập tính năng này.
          </p>
          <a
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Quay về trang chủ
          </a>
        </div>
      </div>
    );
  }

  // User has required role/permission
  return children;
}

export default ProtectedRoute;

