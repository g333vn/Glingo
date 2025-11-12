// src/pages/LoginPage.jsx
// Trang đăng nhập cho toàn bộ hệ thống

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state (nếu có)
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = login(username, password);
    
    if (result.success) {
      // Redirect to original page or home
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Đăng nhập thất bại!');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔐</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Đăng Nhập
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Tên đăng nhập:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Nhập tên đăng nhập..."
              className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
              autoFocus
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">📝 Tài khoản demo:</p>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Editor:</strong> editor / editor123</p>
            <p><strong>User:</strong> user1 / user123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 hover:underline text-sm sm:text-base transition-colors inline-flex items-center gap-1"
          >
            <span>←</span>
            <span>Quay về trang chủ</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

