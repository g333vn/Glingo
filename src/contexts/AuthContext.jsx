// src/contexts/AuthContext.jsx
// Context để quản lý authentication state toàn app

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginUser, register as registerUser } from '../data/users.js';
import { trackUserActivity } from '../utils/analyticsTracker.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Hàm sync role từ adminUsers (Single Source of Truth)
  const syncUserFromAdminUsers = useCallback((currentUser) => {
    if (!currentUser) return null;
    
    try {
      const savedUsers = localStorage.getItem('adminUsers');
      if (!savedUsers) return currentUser;
      
      const allUsers = JSON.parse(savedUsers);
      const updatedUser = allUsers.find(
        u => u.id === currentUser.id || u.username === currentUser.username
      );
      
      if (!updatedUser) {
        // User đã bị xóa khỏi adminUsers → logout
        console.warn('[AUTH] User not found in adminUsers, logging out...');
        localStorage.removeItem('authUser');
        return null;
      }
      
      // Check nếu role hoặc thông tin khác đã thay đổi
      if (updatedUser.role !== currentUser.role || 
          updatedUser.name !== currentUser.name ||
          updatedUser.email !== currentUser.email) {
        
        console.log('[AUTH] User data changed, syncing:', {
          username: updatedUser.username,
          oldRole: currentUser.role,
          newRole: updatedUser.role,
          oldName: currentUser.name,
          newName: updatedUser.name
        });
        
        const syncedUser = {
          ...currentUser,
          role: updatedUser.role,
          name: updatedUser.name || currentUser.name,
          email: updatedUser.email || currentUser.email
        };
        
        // Update both state and localStorage
        setUser(syncedUser);
        localStorage.setItem('authUser', JSON.stringify(syncedUser));
        return syncedUser;
      }
      
      return currentUser;
    } catch (error) {
      console.error('[AUTH] Error syncing user:', error);
      return currentUser;
    }
  }, []);

  // ✅ Load user on mount (chỉ 1 lần)
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('[AUTH] User loaded from authUser:', { id: parsedUser.id, username: parsedUser.username, role: parsedUser.role });
        
        const syncedUser = syncUserFromAdminUsers(parsedUser);
        setUser(syncedUser);
      } catch (error) {
        console.error('[AUTH] Error loading user:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, [syncUserFromAdminUsers]);

  // ✅ Listen for localStorage changes từ other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // adminUsers thay đổi → sync role
      if (e.key === 'adminUsers' && user) {
        console.log('[AUTH] adminUsers changed (other tab), syncing...');
        syncUserFromAdminUsers(user);
      }
      
      // authUser bị xóa → logout
      if (e.key === 'authUser' && e.newValue === null && user) {
        console.log('[AUTH] authUser removed (other tab), logging out...');
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, syncUserFromAdminUsers]);

  // ✅ CRITICAL: Listen for adminUsers changes trong CÙNG TAB
  // storage event không fire trong cùng tab, phải dùng custom event
  useEffect(() => {
    const handleAdminUsersUpdate = () => {
      if (user) {
        console.log('[AUTH] adminUsers updated (same tab), syncing...');
        syncUserFromAdminUsers(user);
      }
    };

    window.addEventListener('adminUsersUpdated', handleAdminUsersUpdate);
    return () => window.removeEventListener('adminUsersUpdated', handleAdminUsersUpdate);
  }, [user, syncUserFromAdminUsers]);

  // ✅ Backup: Periodic sync mỗi 10 giây (fallback)
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      syncUserFromAdminUsers(user);
    }, 10000); // 10 giây
    
    return () => clearInterval(intervalId);
  }, [user, syncUserFromAdminUsers]);

  // Login function
  const login = (username, password) => {
    const result = loginUser(username, password);
    if (result.success) {
      // ✅ FIX: Đảm bảo role được load đúng từ getUsers()
      // result.user đã có role mới từ getUsers() nên không cần sync thêm
      setUser(result.user);
      localStorage.setItem('authUser', JSON.stringify(result.user));
      
      // 📊 Track login activity
      trackUserActivity(result.user.id, result.user.username, 'login', {
        role: result.user.role,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  };

  // Register function
  const register = (userData) => {
    const result = registerUser(userData);
    if (result.success) {
      // Auto login after successful registration
      setUser(result.user);
      localStorage.setItem('authUser', JSON.stringify(result.user));
      
      // 📊 Track registration activity
      trackUserActivity(result.user.id, result.user.username, 'register', {
        role: result.user.role,
        email: result.user.email,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  };

  // Update user function
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('authUser', JSON.stringify(updatedUserData));
  };

  // Logout function
  const logout = () => {
    // 📊 Track logout activity before clearing user
    if (user) {
      trackUserActivity(user.id, user.username, 'logout', {
        role: user.role,
        timestamp: new Date().toISOString()
      });
    }
    
    setUser(null);
    localStorage.removeItem('authUser');
    // ✅ CRITICAL: KHÔNG xóa adminUsers và userPasswords khi logout
    // Vì đây là dữ liệu của tất cả users trong hệ thống, không phải chỉ của user đang logout
    // Nếu xóa, tất cả users mới được tạo sẽ bị mất!
    // localStorage.removeItem('adminUsers'); // ❌ KHÔNG XÓA
    // localStorage.removeItem('userPasswords'); // ❌ KHÔNG XÓA
    
    console.log('[AUTH] Logout successful, authUser removed but adminUsers/userPasswords preserved');
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
    register,
    logout,
    updateUser,
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

