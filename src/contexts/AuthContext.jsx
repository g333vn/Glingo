// src/contexts/AuthContext.jsx
// Context để quản lý authentication state toàn app

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginUser } from '../data/users.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (username, password) => {
    const result = loginUser(username, password);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('authUser', JSON.stringify(result.user));
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    // ⚠️ BẢO MẬT: Xóa dữ liệu users khỏi localStorage khi logout
    // (Lưu ý: adminUsers không chứa password, nhưng vẫn nên xóa để bảo mật)
    // Uncomment dòng dưới nếu muốn xóa hoàn toàn dữ liệu users khi logout
    localStorage.removeItem('adminUsers');
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user) return false;
    const { roles } = require('../data/users.js');
    const userRole = roles[user.role];
    if (!userRole) return false;
    return userRole.permissions.includes(permission);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isAdmin,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook để sử dụng auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

