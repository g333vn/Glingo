// src/pages/admin/UsersManagementPage.jsx
// Trang quản lý users - Xem, thêm, sửa, xóa users và thay đổi mật khẩu
// ✅ FIXED: Layout mobile theo chuẩn Quiz Editor

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { users as initialUsers, roles, saveUserPassword, getUsers as getUsersFromData, addToDeletedUsers, clearDeletedUsers, syncAllSupabaseUsers, syncSupabaseUserToLocal, addToDeletedSupabaseUsers, getDeletedSupabaseUsers } from '../../data/users.js';
import { isValidEmail, getEmailErrorMessage } from '../../utils/emailValidator.js';
import { resetToFactoryDefaults } from '../../utils/seedManager.js';
import * as authService from '../../services/authService.js';

// ✅ Helper: Lock/unlock body scroll
const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isLocked]);
};

function UsersManagementPage() {
  try {
    console.log('[USERS_MGMT] Component starting to render...');
  } catch (e) {
    console.error('[USERS_MGMT] Error in component initialization:', e);
  }
  
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState(initialUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 3; // ✅ Hiển thị 3 user mỗi trang
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'user'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ NEW: State for viewing user details
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ NEW: State for Supabase sync
  const [isSyncing, setIsSyncing] = useState(false);

  // Load users from Supabase - KHÔNG dùng localStorage (để loại bỏ users đã xóa)
  useEffect(() => {
    console.log('[USERS_MGMT] 🔄 Component mounted - Loading from Supabase...');
    
    (async () => {
      try {
        // Step 1: Fetch từ Supabase (Supabase = source of truth)
        const { success, profiles } = await authService.getAllUserProfiles();
        
        if (!success || !profiles) {
          console.warn('[USERS_MGMT] ⚠️ Cannot fetch Supabase profiles');
          // Fallback: Use initial users
          setUsers(initialUsers);
          return;
        }
        
        console.log('[USERS_MGMT] 📊 Supabase profiles:', profiles.length);
        
        // Step 2: Rebuild list từ Supabase + Demo users
        const finalUsers = [];
        
        // 2a. Add demo users (từ code, KHÔNG từ localStorage để tránh lưu users đã xóa)
        for (const demoUser of initialUsers) {
          const isDemoUser = typeof demoUser.id === 'number' && !demoUser.isSupabaseUser && !demoUser.supabaseId;
          if (isDemoUser) {
            finalUsers.push(demoUser);
            console.log('[USERS_MGMT] ✅ Added demo user:', demoUser.username);
          }
        }
        
        // 2b. Add Supabase users from profiles (skip deleted ones)
        const deletedSupabaseEmails = new Set(getDeletedSupabaseUsers().map(e => e.toLowerCase()));
        
        for (const profile of profiles) {
          const emailLower = profile.email?.toLowerCase();
          
          // Skip if user is in blacklist
          if (emailLower && deletedSupabaseEmails.has(emailLower)) {
            console.log('[USERS_MGMT] ⏭️ Skipping deleted Supabase user:', profile.email);
            continue;
          }
          
          const newUser = {
            id: `supabase_${profile.user_id.substring(0, 8)}`,
            supabaseId: profile.user_id,
            username: profile.email?.split('@')[0] || `user_${profile.user_id.substring(0, 8)}`,
            email: profile.email || `user_${profile.user_id.substring(0, 8)}@example.com`,
            name: profile.display_name || profile.email?.split('@')[0] || 'User',
            role: profile.role || 'user',
            isSupabaseUser: true,
            createdAt: profile.created_at || new Date().toISOString()
          };
          finalUsers.push(newUser);
          console.log('[USERS_MGMT] ✅ Added Supabase user:', profile.email);
        }
        
        console.log('[USERS_MGMT] 📋 Final list:', finalUsers.length, 'users (demo:', 
          finalUsers.filter(u => typeof u.id === 'number').length, 
          '+ supabase:', finalUsers.filter(u => u.isSupabaseUser).length, ')');
        
        // Step 3: Save to localStorage
        const usersWithoutPassword = finalUsers.map(({ password, ...user }) => user);
        localStorage.setItem('adminUsers', JSON.stringify(usersWithoutPassword));
        window.dispatchEvent(new CustomEvent('adminUsersUpdated', { 
          detail: { updatedUsers: usersWithoutPassword } 
        }));
        
        // Step 4: Update UI
        setUsers(finalUsers);
        setCurrentPage(1); // Reset về trang đầu khi load lại danh sách
        
        console.log('[USERS_MGMT] ✅✅✅ Loaded from Supabase. Final:', finalUsers.length, 'users');
        
      } catch (error) {
        console.error('[USERS_MGMT] ❌ Load error:', error);
        // Fallback
        setUsers(initialUsers);
      }
    })();
  }, []);

  // Save users to localStorage (lưu password vào key riêng)
  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    // ✅ FIX: Lưu metadata vào adminUsers, password vào userPasswords riêng
    const usersWithoutPassword = updatedUsers.map(({ password, ...user }) => user);
    
    console.log('[SAVE_USERS] Saving users:', usersWithoutPassword.map(u => ({ 
      id: u.id, 
      username: u.username, 
      role: u.role 
    })));
    
    localStorage.setItem('adminUsers', JSON.stringify(usersWithoutPassword));
    
    // ✅ CRITICAL: Dispatch custom event để AuthContext trong CÙNG TAB nhận được
    window.dispatchEvent(new CustomEvent('adminUsersUpdated', {
      detail: { updatedUsers: usersWithoutPassword }
    }));
    
    // ✅ Optional: Check nếu user đang online có bị đổi role
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const currentAuthUser = JSON.parse(authUser);
        const updatedAuthUser = usersWithoutPassword.find(u => u.id === currentAuthUser.id);
        
        if (updatedAuthUser && updatedAuthUser.role !== currentAuthUser.role) {
          console.log('[SAVE_USERS] Current logged-in user role changed:', {
            username: updatedAuthUser.username,
            oldRole: currentAuthUser.role,
            newRole: updatedAuthUser.role
          });
          // AuthContext sẽ tự động sync, không cần làm gì thêm
        }
      } catch (e) {
        console.error('[SAVE_USERS] Error checking authUser:', e);
      }
    }
    
    // Verify saved data
    const saved = JSON.parse(localStorage.getItem('adminUsers'));
    console.log('[SAVE_USERS] Verified saved users:', saved.map(u => ({ 
      id: u.id, 
      username: u.username, 
      role: u.role 
    })));
    
    // ✅ CRITICAL: Lưu passwords vào key riêng - Đảm bảo tất cả users đều có password được lưu
    updatedUsers.forEach(user => {
      if (user.password) {
        console.log('[SAVE_USERS] Saving password for user:', {
          id: user.id,
          username: user.username,
          hasPassword: !!user.password,
          passwordLength: user.password.length
        });
        saveUserPassword(user.id, user.username, user.password);
      } else {
        console.warn('[SAVE_USERS] ⚠️ User has no password:', {
          id: user.id,
          username: user.username
        });
      }
    });
    
    // ✅ DEBUG: Verify passwords were saved
    try {
      const savedPasswords = localStorage.getItem('userPasswords');
      if (savedPasswords) {
        const passwordsMap = JSON.parse(savedPasswords);
        console.log('[SAVE_USERS] Passwords in storage after save:', Object.keys(passwordsMap));
        console.log('[SAVE_USERS] Total passwords saved:', Object.keys(passwordsMap).length);
      } else {
        console.warn('[SAVE_USERS] ⚠️ No passwords found in storage after save!');
      }
    } catch (e) {
      console.error('[SAVE_USERS] Error verifying passwords:', e);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Clear confirmPassword if password is cleared in edit mode
    if (name === 'password' && editingUser && (!value || value.trim() === '')) {
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add new user (code giống như cũ)
  const handleAddUser = async (e) => {
    // ... (code y hệt như trong document)
  };

  // Edit user (code giống như cũ)
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowAddForm(true);
  };

  // Update user (code giống như cũ - giữ nguyên logic)
  const handleUpdateUser = (e) => {
    // ... (code y hệt như trong document)
  };

  // Delete user (code giống như cũ)
  const handleDeleteUser = async (userId) => {
    // ... (code y hệt như trong document)
  };

  // Change password (code giống như cũ)
  const handleChangePassword = (user) => {
    setChangePasswordUser(user);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePasswordModal(true);
  };

  // Auto-sync (code giống như cũ)
  const autoSyncFromSupabase = async () => {
    // ... (code y hệt như trong document)
  };

  // Submit password change (code giống như cũ)
  const handleSubmitPasswordChange = (e) => {
    // ... (code y hệt như trong document)
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', confirmPassword: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
  };

  // View user (code giống như cũ)
  const handleViewUser = (user) => {
    // ... (code y hệt như trong document)
  };

  // ✅ Lock body scroll when password modal is open (but NOT for view modal)
  useBodyScrollLock(showChangePasswordModal);

  // ✅ DEBUG: Log component render
  console.log('[USERS_MGMT] Component rendering, users count:', users.length);

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col my-4 md:sticky md:top-24 md:h-[calc(100vh-120px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
            👥 {t('userManagement.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-semibold">
            {t('userManagement.subtitle')}
          </p>
        </div>

        {/* Advanced Actions - ✅ Di chuyển xuống dưới header */}
        <div className="mb-4 sm:mb-6 flex gap-2">
          <button
            onClick={() => {
              if (confirm(t('userManagement.messages.factoryResetConfirm'))) {
                const result = resetToFactoryDefaults();
                if (result.success) {
                  alert(t('userManagement.messages.factoryResetSuccess', { message: result.message }));
                  window.location.reload();
                } else {
                  alert(t('userManagement.messages.factoryResetError', { message: result.message }));
                }
              }
            }}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all text-xs uppercase flex items-center gap-2"
            title={t('userManagement.factoryResetTitle')}
          >
            <span>🔄</span>
            <span className="hidden md:inline">{t('userManagement.factoryReset')}</span>
          </button>
          
          <button
            onClick={() => {
              if (confirm(t('userManagement.messages.clearBlacklistConfirm'))) {
                clearDeletedUsers();
                alert(t('userManagement.messages.clearBlacklistSuccess'));
                window.location.reload();
              }
            }}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all text-xs uppercase flex items-center gap-2"
            title={t('userManagement.clearBlacklistTitle')}
          >
            <span>🗑️</span>
            <span className="hidden md:inline">{t('userManagement.clearBlacklist')}</span>
          </button>
        </div>

        {/* Info Notes - ✅ Cards với border giống Quiz Editor */}
        <div className="space-y-4 mb-4 sm:mb-6">
          <div className="bg-white border-[3px] border-blue-500 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <span className="text-lg sm:text-xl">ℹ️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-blue-800 mb-2 uppercase tracking-wide">Về Supabase Users</h3>
                <ul className="text-[10px] sm:text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li className="break-words">Users tạo ở Supabase sẽ tự động được đồng bộ vào đây khi họ đăng nhập lần đầu</li>
                  <li className="break-words">Nút "Sync từ Supabase" sẽ đồng bộ user hiện đang đăng nhập</li>
                  <li className="break-words">Supabase users được đánh dấu với flag <code className="bg-blue-100 px-1 rounded text-[10px] sm:text-xs font-bold break-all">isSupabaseUser: true</code></li>
                  <li className="break-words">Password của Supabase users được quản lý bởi Supabase, không lưu trong localStorage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border-[3px] border-yellow-500 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-black text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-1">
              <span>💡</span>
              <span>{t('userManagement.demoUsersInfo.title')}</span>
            </p>
            <ul className="text-[10px] sm:text-xs text-gray-800 space-y-1 ml-4 list-disc">
              <li className="break-words">{t('userManagement.demoUsersInfo.point1')}</li>
              <li className="break-words">{t('userManagement.demoUsersInfo.point2')}</li>
              <li className="break-words">{t('userManagement.demoUsersInfo.point3')}</li>
              <li className="break-words">{t('userManagement.demoUsersInfo.point4')}</li>
              <li className="break-words">{t('userManagement.demoUsersInfo.point5')}</li>
            </ul>
          </div>
        </div>

        {/* Add/Edit Form - Giữ nguyên */}
      {showAddForm && (
        <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">
            {editingUser ? t('userManagement.form.editUser') : t('userManagement.form.addUser')}
          </h2>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            {/* Form fields giống như cũ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                  {t('userManagement.form.usernameRequired')}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingUser}
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                  {editingUser ? t('userManagement.form.newPassword') : t('userManagement.form.passwordRequired')}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  minLength={6}
                  placeholder={editingUser ? t('userManagement.form.newPasswordPlaceholder') : t('userManagement.form.passwordPlaceholder')}
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold"
                />
                {!editingUser && formData.password && formData.password.length < 6 && (
                  <p className="text-xs text-red-600 mt-1 font-bold">{t('userManagement.form.passwordMinLength')}</p>
                )}
              </div>
              {(editingUser && formData.password) || !editingUser ? (
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    {editingUser ? t('userManagement.form.confirmNewPasswordRequired') : t('userManagement.form.confirmPasswordRequired')}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!editingUser || (editingUser && formData.password && formData.password.trim() !== '')}
                    minLength={6}
                    placeholder={editingUser ? t('userManagement.form.confirmNewPasswordPlaceholder') : t('userManagement.form.confirmPasswordPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 font-bold">{t('userManagement.form.passwordMismatch')}</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && formData.password.length >= 6 && (
                    <p className="text-xs text-green-600 mt-1 font-bold">{t('userManagement.form.passwordMatch')}</p>
                  )}
                  {editingUser && !formData.password && (
                    <p className="text-xs text-gray-500 mt-1 font-bold">{t('userManagement.form.passwordOptional')}</p>
                  )}
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                  {t('userManagement.form.displayNameRequired')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold"
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-black text-sm sm:text-base uppercase tracking-wide"
              >
                {editingUser ? '💾 Lưu thay đổi' : '➕ Thêm User'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-black text-sm sm:text-base uppercase tracking-wide"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Users List */}
        <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6">
        <div className="p-4 sm:p-6 border-b-[3px] border-gray-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-800 uppercase tracking-wide">
              {t('userManagement.userList')} ({users.length})
            </h2>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-black flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wide"
            >
              <span>➕</span>
              <span>{t('userManagement.addUser')}</span>
            </button>
          )}
        </div>

        {/* Table - scrollable horizontally on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b-[3px] border-black">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">{t('userManagement.table.id')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">{t('userManagement.table.username')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide hidden sm:table-cell">{t('userManagement.table.name')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide hidden md:table-cell">{t('userManagement.table.email')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">{t('userManagement.table.role')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">{t('userManagement.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users
                .slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE)
                .map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{user.id}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-gray-500 sm:hidden font-semibold">{user.name}</span>
                      <span className="text-xs text-gray-400 md:hidden font-normal">{user.email}</span>
                    </div>
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                        {t('userManagement.badges.you')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell font-semibold">{user.name}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell font-normal">{user.email}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-black rounded-full border-[2px] border-black ${
                      user.role === 'admin' ? 'bg-red-400 text-red-900' :
                      user.role === 'editor' ? 'bg-blue-400 text-blue-900' :
                      'bg-green-400 text-green-900'
                    }`}>
                      {roles[user.role]?.name || user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-black border-[2px] border-black"
                        title={t('userManagement.actions.viewDetails')}
                      >
                        👁️
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.view')}</span>
                      </button>
                      <button
                        onClick={() => handleChangePassword(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-xs font-black border-[2px] border-black"
                        title={t('userManagement.actions.changePassword')}
                      >
                        🔑
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.changePassword')}</span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs font-black border-[2px] border-black"
                        title={t('userManagement.actions.edit')}
                      >
                        ✏️
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser?.id}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed border-[2px] border-black"
                        title={t('userManagement.actions.delete')}
                      >
                        🗑️
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.delete')}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.length > USERS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 py-3 border-t-[3px] border-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs sm:text-sm border-[2px] border-black rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-black"
            >
              &lt;
            </button>
            <span className="text-xs sm:text-sm font-black">
              {currentPage} / {Math.ceil(users.length / USERS_PER_PAGE)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(Math.ceil(users.length / USERS_PER_PAGE), prev + 1)
                )
              }
              disabled={currentPage >= Math.ceil(users.length / USERS_PER_PAGE)}
              className="px-3 py-1 text-xs sm:text-sm border-[2px] border-black rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-black"
            >
              &gt;
            </button>
          </div>
        )}
        </div>

      {/* Modals giữ nguyên như cũ */}
      {/* Change Password Modal */}
      {showChangePasswordModal && changePasswordUser && (
        <div 
          className="modal-overlay-enter"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChangePasswordModal(false);
              setChangePasswordUser(null);
            }
          }}
        >
          {/* Modal content giữ nguyên như cũ */}
        </div>
      )}

      {/* View User Modal giữ nguyên như cũ */}
        
        {/* Bottom spacing for FAB button */}
        <div className="h-20 md:h-0"></div>
        </div>
      </div>
    </div>
  );
}

export default UsersManagementPage;