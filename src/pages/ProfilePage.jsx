// src/pages/ProfilePage.jsx
// Trang để user và editor thay đổi thông tin cá nhân

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getUsers, login, saveUserPassword } from '../data/users.js';
import { addEditorActivity } from '../utils/activityLogger.js';
import { isValidEmail, getEmailErrorMessage } from '../utils/emailValidator.js';
import { trackUserActivity } from '../utils/analyticsTracker.js';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('profile.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('profile.errors.emailRequired');
    } else {
      const emailError = getEmailErrorMessage(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    // Chỉ validate password nếu có thay đổi
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('profile.errors.currentPasswordRequired');
      }

      if (!formData.newPassword) {
        newErrors.newPassword = t('profile.errors.newPasswordRequired');
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = t('profile.errors.passwordMinLength');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('profile.errors.passwordMismatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Lấy danh sách users
      const allUsers = getUsers();
      const currentUser = allUsers.find(u => u.id === user.id || u.username === user.username);

      if (!currentUser) {
        setMessage({ type: 'error', text: t('profile.errors.userNotFound') });
        setIsLoading(false);
        return;
      }

      // Kiểm tra mật khẩu hiện tại nếu có thay đổi password
      if (formData.newPassword) {
        const loginResult = login(user.username, formData.currentPassword);
        if (!loginResult.success) {
          setErrors({ currentPassword: t('profile.errors.currentPasswordIncorrect') });
          setIsLoading(false);
          return;
        }
      }

      // Cập nhật thông tin user
      const updatedUser = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      // Cập nhật password nếu có
      if (formData.newPassword) {
        updatedUser.password = formData.newPassword;
      }

      // ✅ FIX: Lưu vào localStorage (adminUsers và userPasswords riêng)
      const updatedUsers = allUsers.map(u => 
        u.id === updatedUser.id || u.username === updatedUser.username 
          ? updatedUser 
          : u
      );
      // Lưu metadata (không có password)
      const usersWithoutPassword = updatedUsers.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      localStorage.setItem('adminUsers', JSON.stringify(usersWithoutPassword));
      
      // ✅ CRITICAL: Dispatch custom event để AuthContext trong CÙNG TAB nhận được
      window.dispatchEvent(new CustomEvent('adminUsersUpdated', {
        detail: { updatedUsers: usersWithoutPassword }
      }));
      
      // ✅ FIX: Lưu password vào key riêng nếu có thay đổi
      if (formData.newPassword) {
        saveUserPassword(updatedUser.id, updatedUser.username, formData.newPassword);
      }

      // Cập nhật user trong AuthContext
      const { password: _, ...userWithoutPassword } = updatedUser;
      updateUser(userWithoutPassword);

      // 📊 Track profile update activity
      trackUserActivity(updatedUser.id, updatedUser.username, 'profile_update', {
        role: updatedUser.role,
        hasPasswordChange: !!formData.newPassword,
        timestamp: new Date().toISOString()
      });

      // Ghi lại hoạt động vào Recent Activity của editor
      if (user.role === 'editor' || user.role === 'user') {
        const changes = [];
        if (currentUser.name !== formData.name.trim()) {
          changes.push(`Tên: "${currentUser.name}" → "${formData.name.trim()}"`);
        }
        if (currentUser.email !== formData.email.trim()) {
          changes.push(`Email: "${currentUser.email}" → "${formData.email.trim()}"`);
        }
        if (formData.newPassword) {
          changes.push('Đổi mật khẩu');
        }

        if (changes.length > 0) {
          addEditorActivity({
            type: 'profile_update',
            title: 'Cập nhật thông tin cá nhân',
            description: changes.join(', '),
            user: user.name || user.username,
            timestamp: new Date().toISOString()
          });
        }
      }

      setMessage({ 
        type: 'success', 
        text: t('profile.success.updateSuccess')
      });

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: t('profile.errors.updateError')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error khi user nhập lại
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-center">
          <p className="text-gray-900 font-bold mb-4">{t('profile.pleaseLogin')}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black"
          >
            {t('profile.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
        <div className="bg-blue-400 border-b-[4px] border-black -m-6 sm:-m-8 mb-6 sm:mb-8 p-6 sm:p-8 rounded-t-lg">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            👤 {t('profile.title')}
          </h1>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
            message.type === 'success' 
              ? 'bg-green-400 text-gray-900' 
              : 'bg-red-400 text-gray-900'
          }`}>
            <p className="font-black">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Section */}
          <div className="bg-purple-300 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-5 space-y-5">
            <h2 className="text-xl font-black text-gray-900 mb-4">📋 {t('profile.basicInfo')}</h2>
            
            {/* Username (read-only) */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.username')}
              </label>
              <input
                type="text"
                value={user.username || ''}
                disabled
                className="w-full px-4 py-2 border-[3px] border-black rounded-lg bg-white text-gray-900 cursor-not-allowed font-bold"
              />
              <p className="mt-1 text-xs font-bold text-gray-700">{t('profile.usernameCannotChange')}</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none font-bold ${
                  errors.name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-black bg-white'
                }`}
                placeholder={t('profile.enterName')}
              />
              {errors.name && (
                <p className="mt-1 text-sm font-black text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none font-bold ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-black bg-white'
                }`}
                placeholder={t('profile.enterEmail')}
              />
              {errors.email && (
                <p className="mt-1 text-sm font-black text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.role')}
              </label>
              <input
                type="text"
                value={user.role === 'admin' ? t('profile.administrator') : user.role === 'editor' ? t('profile.editor') : t('profile.user')}
                disabled
                className="w-full px-4 py-2 border-[3px] border-black rounded-lg bg-white text-gray-900 cursor-not-allowed font-bold"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-yellow-300 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-5 space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-2">
                🔐 {t('profile.changePassword')}
              </h2>
              <p className="text-sm font-bold text-gray-900">
                {t('profile.passwordOptional')}
              </p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.currentPassword')}
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none font-bold ${
                  errors.currentPassword 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-black bg-white'
                }`}
                placeholder={t('profile.enterCurrentPassword')}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm font-black text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none font-bold ${
                  errors.newPassword 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-black bg-white'
                }`}
                placeholder={t('profile.enterNewPassword')}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm font-black text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                {t('profile.confirmPassword')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none font-bold ${
                  errors.confirmPassword 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-black bg-white'
                }`}
                placeholder={t('profile.enterConfirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm font-black text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-green-400 text-gray-900 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:bg-gray-400 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed transition-all font-black"
            >
              {isLoading ? t('profile.saving') : `💾 ${t('profile.saveChanges')}`}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white text-gray-900 rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black"
            >
              {t('profile.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;

