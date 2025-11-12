// src/data/users.js
// Quản lý users và roles
// ⚠️ Lưu ý: Đây là data cơ bản, trong production nên lưu trong database

export const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // TODO: Thay đổi password này!
    role: 'admin',
    name: 'Administrator',
    email: 'admin@example.com'
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    role: 'user',
    name: 'User 1',
    email: 'user1@example.com'
  },
  {
    id: 3,
    username: 'editor',
    password: 'editor123',
    role: 'editor',
    name: 'Editor',
    email: 'editor@example.com'
  }
];

// Roles và permissions
export const roles = {
  admin: {
    name: 'Administrator',
    permissions: ['quiz-editor', 'manage-users', 'view-all']
  },
  editor: {
    name: 'Editor',
    permissions: ['quiz-editor', 'view-all']
  },
  user: {
    name: 'User',
    permissions: ['view-all']
  }
};

// Helper function để check permission
export function hasPermission(userRole, permission) {
  const role = roles[userRole];
  if (!role) return false;
  return role.permissions.includes(permission);
}

// Helper function để get users (check localStorage trước)
// ⚠️ BẢO MẬT: localStorage KHÔNG chứa password, chỉ chứa metadata
// Password chỉ có trong users mặc định (trong code)
export function getUsers() {
  try {
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      // Merge với users mặc định để lấy password
      return parsed.map(savedUser => {
        const originalUser = users.find(u => u.id === savedUser.id || u.username === savedUser.username);
        return originalUser ? { ...savedUser, password: originalUser.password } : savedUser;
      });
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  return users; // Fallback về users mặc định
}

// Helper function để login
export function login(username, password) {
  // Lấy users từ localStorage nếu có, không thì dùng users mặc định
  const allUsers = getUsers();
  
  const user = allUsers.find(
    u => u.username === username && u.password === password
  );
  
  if (user) {
    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      role: roles[user.role]
    };
  }
  
  return {
    success: false,
    error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
  };
}

