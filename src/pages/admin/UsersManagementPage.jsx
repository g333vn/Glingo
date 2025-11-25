// src/pages/admin/UsersManagementPage.jsx
// Trang quản lý users - Xem, thêm, sửa, xóa users và thay đổi mật khẩu

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { users as initialUsers, roles, saveUserPassword, getUsers as getUsersFromData, addToDeletedUsers, clearDeletedUsers } from '../../data/users.js';
import { isValidEmail, getEmailErrorMessage } from '../../utils/emailValidator.js';
import { resetToFactoryDefaults } from '../../utils/seedManager.js';

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

  // Load users from localStorage (nếu có) hoặc dùng initialUsers
  useEffect(() => {
    console.log('[USERS_MGMT] useEffect running...');
    try {
      // ✅ FIX: Sử dụng getUsers() từ users.js để đảm bảo logic nhất quán
      console.log('[USERS_MGMT] Calling getUsersFromData()...');
      const allUsers = getUsersFromData();
      console.log('[USERS_MGMT] getUsersFromData() returned:', allUsers);
      
      // ✅ DEBUG: Log users loaded
      if (allUsers && Array.isArray(allUsers)) {
        console.log('[USERS_MGMT] Users loaded from getUsers():', allUsers.map(u => ({ id: u.id, username: u.username, role: u.role })));
        
        if (allUsers.length > 0) {
          setUsers(allUsers);
          console.log('[USERS_MGMT] Users set successfully');
          return;
        }
      } else {
        console.warn('[USERS_MGMT] getUsers() returned invalid data:', allUsers);
      }
    } catch (error) {
      console.error('[USERS_MGMT] Error loading users:', error);
      console.error('[USERS_MGMT] Error stack:', error.stack);
    }
    
    // Fallback về initialUsers nếu có lỗi hoặc không có data
    console.log('[USERS_MGMT] Using initialUsers as fallback');
    setUsers(initialUsers);
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

  // Add new user
  const handleAddUser = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!formData.email || !formData.email.trim()) {
      alert(t('userManagement.messages.emailRequired'));
      return;
    }
    
    const emailError = getEmailErrorMessage(formData.email);
    if (emailError) {
      alert(`⚠️ ${emailError}`);
      return;
    }
    
    // ✅ Validate password confirmation
    if (!formData.password || formData.password.trim() === '') {
      alert(t('userManagement.messages.passwordRequired'));
      return;
    }
    
    if (formData.password.length < 6) {
      alert(t('userManagement.messages.passwordMinLength'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert(t('userManagement.messages.passwordMismatch'));
      return;
    }
    
    // ✅ FIX: Tạo ID mới dựa trên tất cả users (bao gồm cả trong localStorage)
    const allExistingUsers = getUsersFromData();
    const maxId = allExistingUsers.length > 0 
      ? Math.max(...allExistingUsers.map(u => u.id || 0)) 
      : 0;
    const newUser = {
      id: maxId + 1,
      ...formData
    };
    
    // ✅ CRITICAL: Đảm bảo password không bị rỗng
    if (!newUser.password || newUser.password.trim() === '') {
      alert(t('userManagement.messages.passwordRequired'));
      return;
    }
    
    console.log('[ADD_USER] Creating new user:', {
      newUserId: newUser.id,
      username: newUser.username,
      role: newUser.role,
      hasPassword: !!newUser.password,
      passwordLength: newUser.password ? newUser.password.length : 0,
      passwordValue: newUser.password ? '***' : 'EMPTY',
      maxIdFromAllUsers: maxId,
      allUsersCount: allExistingUsers.length
    });
    
    const updatedUsers = [...users, newUser];
    
    // ✅ DEBUG: Verify newUser has password before saving
    console.log('[ADD_USER] New user object before saveUsers:', {
      id: newUser.id,
      username: newUser.username,
      password: newUser.password ? '***' : 'EMPTY',
      passwordLength: newUser.password ? newUser.password.length : 0
    });
    
    saveUsers(updatedUsers);
    
    // ✅ DEBUG: Verify password was saved immediately after saveUsers
    setTimeout(() => {
      try {
        const savedPasswords = localStorage.getItem('userPasswords');
        if (savedPasswords) {
          const passwordsMap = JSON.parse(savedPasswords);
          const savedPassword = passwordsMap[newUser.id] || passwordsMap[newUser.username];
          console.log('[ADD_USER] Password verification after save:', {
            userId: newUser.id,
            username: newUser.username,
            passwordSaved: savedPassword ? 'YES' : 'NO',
            passwordLength: savedPassword ? savedPassword.length : 0
          });
        }
      } catch (e) {
        console.error('[ADD_USER] Error verifying password:', e);
      }
    }, 100);
    setFormData({ username: '', password: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
    alert(t('userManagement.messages.addSuccess', {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      role: formData.role
    }));
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Không hiển thị password
      confirmPassword: '', // Reset confirm password
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowAddForm(true);
  };

  // Update user
  const handleUpdateUser = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!formData.email || !formData.email.trim()) {
      alert(t('userManagement.messages.emailRequired'));
      return;
    }
    
    const emailError = getEmailErrorMessage(formData.email);
    if (emailError) {
      alert(`⚠️ ${emailError}`);
      return;
    }
    
    // ✅ Validate password confirmation if password is provided
    if (formData.password && formData.password.trim() !== '') {
      if (formData.password.length < 6) {
        alert(t('userManagement.messages.passwordMinLength'));
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        alert(t('userManagement.messages.newPasswordMismatch'));
        return;
      }
    }
    
    // ✅ DEBUG: Log formData trước khi update
    console.log('[UPDATE_USER] FormData:', formData);
    console.log('[UPDATE_USER] Editing user ID:', editingUser.id);
    
    // ✅ FIX: Đảm bảo password được giữ lại hoặc lấy từ userPasswords
    const updatedUsers = users.map(u => {
      if (u.id === editingUser.id) {
        // Nếu có password mới trong formData, dùng password mới
        // Nếu không, giữ password cũ từ state
        // Nếu state không có password, lấy từ userPasswords
        let finalPassword = formData.password || u.password;
        
        // Nếu vẫn không có password, lấy từ userPasswords
        if (!finalPassword) {
          try {
            const savedPasswords = localStorage.getItem('userPasswords');
            if (savedPasswords) {
              const passwordsMap = JSON.parse(savedPasswords);
              finalPassword = passwordsMap[u.id] || passwordsMap[u.username] || '';
            }
          } catch (e) {
            console.error('Error reading password from storage:', e);
          }
        }
        
        const updatedUser = { 
          ...u, 
          ...formData, // ✅ CRITICAL: formData chứa role mới
          password: finalPassword 
        };
        
        // ✅ DEBUG: Log user sau khi update
        console.log('[UPDATE_USER] Updated user:', {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          name: updatedUser.name,
          email: updatedUser.email
        });
        
        return updatedUser;
      }
      return u;
    });
    
    // ✅ DEBUG: Log tất cả users trước khi save
    console.log('[UPDATE_USER] All updated users:', updatedUsers.map(u => ({ id: u.id, username: u.username, role: u.role })));
    console.log('[UPDATE_USER] User1 role check:', updatedUsers.find(u => u.username === 'user1')?.role);
    
    saveUsers(updatedUsers);
    setEditingUser(null);
    setFormData({ username: '', password: '', confirmPassword: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
    alert(t('userManagement.messages.updateSuccess', {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      role: formData.role
    }));
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    if (userId === currentUser?.id) {
      alert(t('userManagement.messages.cannotDeleteSelf'));
      return;
    }
    if (confirm(t('userManagement.messages.confirmDelete'))) {
      const userToDelete = users.find(u => u.id === userId);
      const updatedUsers = users.filter(u => u.id !== userId);
      saveUsers(updatedUsers);
      
      // ✅ FIX: Add to deleted users blacklist (prevent demo users from reappearing)
      addToDeletedUsers(userId);
      console.log('[DELETE_USER] Added user to blacklist:', userId);
      
      // ✅ FIX: Xóa password khỏi userPasswords khi xóa user
      if (userToDelete) {
        try {
          const savedPasswords = localStorage.getItem('userPasswords');
          if (savedPasswords) {
            let passwordsMap = JSON.parse(savedPasswords);
            delete passwordsMap[userToDelete.id];
            delete passwordsMap[String(userToDelete.id)];
            delete passwordsMap[userToDelete.username];
            localStorage.setItem('userPasswords', JSON.stringify(passwordsMap));
            console.log('[DELETE_USER] Deleted password for:', userToDelete.username);
          }
        } catch (e) {
          console.error('[DELETE_USER] Error deleting password:', e);
        }
      }
      
      alert(t('userManagement.messages.deleteSuccess', { username: userToDelete?.username || userId }));
    }
  };

  // Change password
  const handleChangePassword = (user) => {
    setChangePasswordUser(user);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePasswordModal(true);
  };

  // Submit password change
  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    
    // ✅ FIX: Lấy password hiện tại từ userPasswords nếu không có trong state
    let currentPassword = changePasswordUser.password;
    if (!currentPassword) {
      try {
        const savedPasswords = localStorage.getItem('userPasswords');
        if (savedPasswords) {
          const passwordsMap = JSON.parse(savedPasswords);
          currentPassword = passwordsMap[changePasswordUser.id] || passwordsMap[changePasswordUser.username] || '';
        }
      } catch (e) {
        console.error('Error reading password from storage:', e);
      }
    }
    
    // Nếu đổi mật khẩu cho chính mình, cần nhập mật khẩu hiện tại
    if (changePasswordUser.id === currentUser?.id) {
      if (passwordData.currentPassword !== currentPassword) {
        alert(t('userManagement.messages.currentPasswordWrong'));
        return;
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('userManagement.messages.newPasswordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert(t('userManagement.messages.passwordMinLength'));
      return;
    }

    // ✅ FIX: Cập nhật user với password mới
    const updatedUsers = users.map(u =>
      u.id === changePasswordUser.id
        ? { ...u, password: passwordData.newPassword }
        : u
    );
    
    // Lưu vào localStorage
    saveUsers(updatedUsers);
    
    // ✅ FIX: Đảm bảo password được lưu vào userPasswords (gọi thêm một lần để chắc chắn)
    saveUserPassword(changePasswordUser.id, changePasswordUser.username, passwordData.newPassword);
    
    setShowChangePasswordModal(false);
    setChangePasswordUser(null);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    alert(t('userManagement.messages.passwordChangeSuccess', {
      username: changePasswordUser.username,
      name: changePasswordUser.name
    }));
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', confirmPassword: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
  };

  // ✅ NEW: View user details (for admin only)
  const handleViewUser = (user) => {
    // Get full user info including password
    const fullUser = getUsersFromData().find(u => u.id === user.id);
    setViewingUser(fullUser);
    setShowPassword(false);
    setShowViewModal(true);
  };

  // ✅ Lock body scroll when password modal is open (but NOT for view modal)
  // View modal allows natural scroll: inside modal = scroll modal, outside = scroll page
  useBodyScrollLock(showChangePasswordModal);

  // ✅ DEBUG: Log component render
  console.log('[USERS_MGMT] Component rendering, users count:', users.length);

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              👥 {t('userManagement.title')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
              {t('userManagement.subtitle')}
            </p>
          </div>
          
          {/* Advanced Actions */}
          <div className="flex gap-2 flex-shrink-0">
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
        </div>

        {/* Info Note about Seed Data */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-[3px] border-blue-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs sm:text-sm font-bold text-blue-900 mb-2">
            💡 <strong>{t('userManagement.demoUsersInfo.title')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>{t('userManagement.demoUsersInfo.point1')}</li>
            <li>{t('userManagement.demoUsersInfo.point2')}</li>
            <li>{t('userManagement.demoUsersInfo.point3')}</li>
            <li>{t('userManagement.demoUsersInfo.point4')}</li>
            <li>{t('userManagement.demoUsersInfo.point5')}</li>
          </ul>
        </div>

        {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            {editingUser ? t('userManagement.form.editUser') : t('userManagement.form.addUser')}
          </h2>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('userManagement.form.usernameRequired')}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {!editingUser && formData.password && formData.password.length < 6 && (
                  <p className="text-xs text-red-600 mt-1">{t('userManagement.form.passwordMinLength')}</p>
                )}
              </div>
              {(editingUser && formData.password) || !editingUser ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{t('userManagement.form.passwordMismatch')}</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && formData.password.length >= 6 && (
                    <p className="text-xs text-green-600 mt-1">{t('userManagement.form.passwordMatch')}</p>
                  )}
                  {editingUser && !formData.password && (
                    <p className="text-xs text-gray-500 mt-1">{t('userManagement.form.passwordOptional')}</p>
                  )}
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('userManagement.form.displayNameRequired')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
              >
                {editingUser ? '💾 Lưu thay đổi' : '➕ Thêm User'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm sm:text-base"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {t('userManagement.userList')} ({users.length})
          </h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>➕</span>
              <span>{t('userManagement.addUser')}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userManagement.table.id')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userManagement.table.username')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">{t('userManagement.table.name')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">{t('userManagement.table.email')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userManagement.table.role')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userManagement.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-gray-500 sm:hidden">{user.name}</span>
                      <span className="text-xs text-gray-400 md:hidden">{user.email}</span>
                    </div>
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        {t('userManagement.badges.you')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">{user.name}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">{user.email}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {roles[user.role]?.name || user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-medium"
                        title={t('userManagement.actions.viewDetails')}
                      >
                        👁️
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.view')}</span>
                      </button>
                      <button
                        onClick={() => handleChangePassword(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-xs font-medium"
                        title={t('userManagement.actions.changePassword')}
                      >
                        🔑
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.changePassword')}</span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs font-medium"
                        title={t('userManagement.actions.edit')}
                      >
                        ✏️
                        <span className="hidden sm:inline ml-1">{t('userManagement.actions.edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser?.id}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

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
          <div 
            className="modal-content-enter"
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '1.5rem',
              maxWidth: '28rem',
              width: '100%',
              maxHeight: 'calc(100vh - 4rem)',
              overflowY: 'auto',
            }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('userManagement.changePassword.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('userManagement.changePassword.user')} <strong>{changePasswordUser.name || changePasswordUser.username}</strong>
            </p>
            
            <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
              {/* Current Password (chỉ khi đổi mật khẩu của chính mình) */}
              {changePasswordUser.id === currentUser?.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('userManagement.changePassword.currentPasswordRequired')}
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('userManagement.changePassword.newPasswordRequired')}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{t('userManagement.changePassword.minLength')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('userManagement.changePassword.confirmNewPasswordRequired')}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {t('userManagement.changePassword.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setChangePasswordUser(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  {t('userManagement.changePassword.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ NEW: View User Details Modal (Admin Only) */}
      {/* Natural Scroll: hover in modal = scroll modal, hover outside = scroll page */}
      {showViewModal && viewingUser && (
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
            overflowY: 'auto' // ✅ Allow page scroll when hovering overlay
          }}
          onClick={() => {
            setShowViewModal(false);
            setViewingUser(null);
            setShowPassword(false);
          }}
        >
          <div 
            className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4 my-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.3s ease-out',
              maxHeight: 'calc(100vh - 4rem)' // ✅ Dynamic height based on viewport
            }}
          >
            {/* Fixed Header */}
            <div className="p-6 pb-4 border-b-[3px] border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
                  {t('userManagement.viewUser.title')}
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingUser(null);
                    setShowPassword(false);
                  }}
                  className="text-gray-500 hover:text-red-500 font-black text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 pt-4 pb-8 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFB800 #f3f4f6' }}>
              {/* Security Warning */}
              <div className="mb-4 p-3 bg-red-100 border-[3px] border-red-400 rounded-lg">
                <p className="text-xs font-bold text-red-900 flex items-center gap-2">
                  <span>🔒</span>
                  <span>{t('userManagement.viewUser.securityWarning')}</span>
                </p>
                <p className="text-xs text-red-800 mt-1">
                  {t('userManagement.viewUser.securityNote')}
                </p>
              </div>

              <div className="space-y-4">
                {/* ID */}
                <div className="p-3 bg-gray-50 rounded border-[2px] border-gray-300">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('userManagement.viewUser.id')}</p>
                  <p className="text-base font-bold text-gray-800">{viewingUser.id}</p>
                </div>

                {/* Username */}
                <div className="p-3 bg-blue-50 rounded border-[2px] border-blue-300">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">{t('userManagement.viewUser.username')}</p>
                  <p className="text-base font-bold text-gray-800">{viewingUser.username}</p>
                </div>

                {/* Password */}
                <div className="p-3 bg-yellow-50 rounded border-[2px] border-yellow-400">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-yellow-700 uppercase">{t('userManagement.viewUser.password')}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded border-[2px] border-black text-xs font-black hover:bg-yellow-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      >
                        {showPassword ? t('userManagement.viewUser.hidePassword') : t('userManagement.viewUser.showPassword')}
                      </button>
                      {showPassword && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(viewingUser.password);
                            alert(t('userManagement.messages.passwordCopied'));
                          }}
                          className="px-2 py-1 bg-blue-400 text-blue-900 rounded border-[2px] border-black text-xs font-black hover:bg-blue-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                          title={t('userManagement.viewUser.copyPasswordTitle')}
                        >
                          {t('userManagement.viewUser.copyPassword')}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-base font-mono font-bold text-gray-800 break-all">
                    {showPassword ? viewingUser.password : '••••••••'}
                  </p>
                  {showPassword && (
                    <p className="text-xs text-gray-500 mt-2">
                      {t('userManagement.viewUser.copyPasswordHint')}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div className="p-3 bg-green-50 rounded border-[2px] border-green-300">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">{t('userManagement.viewUser.displayName')}</p>
                  <p className="text-base font-bold text-gray-800">{viewingUser.name}</p>
                </div>

                {/* Email */}
                <div className="p-3 bg-purple-50 rounded border-[2px] border-purple-300">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-1">{t('userManagement.viewUser.email')}</p>
                  <p className="text-base font-bold text-gray-800 break-all">{viewingUser.email}</p>
                </div>

                {/* Role */}
                <div className="p-3 bg-orange-50 rounded border-[2px] border-orange-300">
                  <p className="text-xs font-bold text-orange-600 uppercase mb-1">{t('userManagement.viewUser.role')}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-bold rounded-full border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      viewingUser.role === 'admin' ? 'bg-red-400 text-red-900' :
                      viewingUser.role === 'editor' ? 'bg-blue-400 text-blue-900' :
                      'bg-green-400 text-green-900'
                    }`}>
                      {roles[viewingUser.role]?.name || viewingUser.role}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-3 bg-gray-50 rounded border-[2px] border-gray-300">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-2">{t('userManagement.viewUser.additionalInfo')}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('userManagement.viewUser.userId')}</span>
                      <span className="font-bold text-gray-800">{viewingUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('userManagement.viewUser.usernameLabel')}</span>
                      <span className="font-bold text-gray-800">{viewingUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('userManagement.viewUser.passwordLength')}</span>
                      <span className="font-bold text-gray-800">{viewingUser.password ? viewingUser.password.length : 0} {t('userManagement.viewUser.characters')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 mt-4 mb-4 border-t-[3px] border-gray-200">
                  <button
                    onClick={() => {
                      handleEditUser(viewingUser);
                      setShowViewModal(false);
                      setViewingUser(null);
                      setShowPassword(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm"
                  >
                    {t('userManagement.viewUser.edit')}
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingUser(null);
                      setShowPassword(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm"
                  >
                    {t('userManagement.viewUser.close')}
                  </button>
                </div>
                
                {/* Extra padding for scroll safety */}
                <div className="h-4"></div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default UsersManagementPage;

