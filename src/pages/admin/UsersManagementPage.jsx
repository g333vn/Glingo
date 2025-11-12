// src/pages/admin/UsersManagementPage.jsx
// Trang quản lý users - Xem, thêm, sửa, xóa users và thay đổi mật khẩu

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { users as initialUsers, roles } from '../../data/users.js';

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
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'user'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load users from localStorage (nếu có) hoặc dùng initialUsers
  useEffect(() => {
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (parsed && parsed.length > 0) {
          // Merge với initialUsers để lấy password (chỉ trong memory)
          const mergedUsers = parsed.map(savedUser => {
            const originalUser = initialUsers.find(u => u.id === savedUser.id || u.username === savedUser.username);
            return originalUser ? { ...savedUser, password: originalUser.password } : savedUser;
          });
          // Thêm users mới từ initialUsers nếu chưa có
          initialUsers.forEach(originalUser => {
            if (!mergedUsers.find(u => u.id === originalUser.id || u.username === originalUser.username)) {
              mergedUsers.push(originalUser);
            }
          });
          setUsers(mergedUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
  }, []);

  // Save users to localStorage (KHÔNG lưu password - chỉ lưu metadata)
  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    // ⚠️ BẢO MẬT: Chỉ lưu users metadata, KHÔNG lưu password
    const usersWithoutPassword = updatedUsers.map(({ password, ...user }) => user);
    localStorage.setItem('adminUsers', JSON.stringify(usersWithoutPassword));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add new user
  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...formData
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setFormData({ username: '', password: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
    alert('✅ Đã thêm user mới!');
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Không hiển thị password
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowAddForm(true);
  };

  // Update user
  const handleUpdateUser = (e) => {
    e.preventDefault();
    const updatedUsers = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...formData, password: formData.password || u.password }
        : u
    );
    saveUsers(updatedUsers);
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
    alert('✅ Đã cập nhật user!');
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    if (userId === currentUser?.id) {
      alert('⚠️ Không thể xóa tài khoản của chính bạn!');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa user này?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      saveUsers(updatedUsers);
      alert('✅ Đã xóa user!');
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
    
    // Nếu đổi mật khẩu cho chính mình, cần nhập mật khẩu hiện tại
    if (changePasswordUser.id === currentUser?.id) {
      if (passwordData.currentPassword !== changePasswordUser.password) {
        alert('❌ Mật khẩu hiện tại không đúng!');
        return;
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('❌ Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    const updatedUsers = users.map(u =>
      u.id === changePasswordUser.id
        ? { ...u, password: passwordData.newPassword }
        : u
    );
    saveUsers(updatedUsers);
    setShowChangePasswordModal(false);
    setChangePasswordUser(null);
    alert('✅ Đã thay đổi mật khẩu!');
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', email: '', role: 'user' });
    setShowAddForm(false);
  };

  // ✅ Lock body scroll when modal is open
  useBodyScrollLock(showChangePasswordModal);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          👥 Quản lý Users
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Quản lý tài khoản người dùng, thêm, sửa, xóa và thay đổi mật khẩu
        </p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            {editingUser ? '✏️ Sửa User' : '➕ Thêm User mới'}
          </h2>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
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
                  {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Password *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hiển thị *
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
            Danh sách Users ({users.length})
          </h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>➕</span>
              <span>Thêm User mới</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tên</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
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
                        Bạn
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
                        onClick={() => handleChangePassword(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-xs font-medium"
                        title="Thay đổi mật khẩu"
                      >
                        🔑
                        <span className="hidden sm:inline ml-1">Đổi mật khẩu</span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs font-medium"
                        title="Sửa"
                      >
                        ✏️
                        <span className="hidden sm:inline ml-1">Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser?.id}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa"
                      >
                        🗑️
                        <span className="hidden sm:inline ml-1">Xóa</span>
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-overlay-enter"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChangePasswordModal(false);
              setChangePasswordUser(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto modal-content-enter">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🔑 Thay đổi mật khẩu
            </h2>
            <p className="text-gray-600 mb-4">
              User: <strong>{changePasswordUser.name || changePasswordUser.username}</strong>
            </p>
            
            <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
              {/* Current Password (chỉ khi đổi mật khẩu của chính mình) */}
              {changePasswordUser.id === currentUser?.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại *
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
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới *
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
                  💾 Lưu mật khẩu mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setChangePasswordUser(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagementPage;

