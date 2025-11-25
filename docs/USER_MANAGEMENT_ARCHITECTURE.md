# 👥 USER MANAGEMENT ARCHITECTURE

## 📊 Tổng quan hệ thống

Hệ thống quản lý users được thiết kế theo pattern chuyên nghiệp với **Seed Data**, **Blacklist**, và **Separation of Concerns**.

---

## 🏗️ Cấu trúc tệp

```
src/
├── data/
│   ├── seedData.js          # 🌱 Demo users & seed configuration
│   └── users.js             # 👥 User management logic
├── utils/
│   └── seedManager.js       # 🔧 Seed management utilities
└── pages/admin/
    └── UsersManagementPage.jsx  # 🎨 Admin UI
```

---

## 🌱 Seed Data System

### **seedData.js**

Quản lý demo users và configuration:

```javascript
SEED_CONFIG = {
  ENABLED: true,              // Enable/disable seed data
  AUTO_SEED: true,            // Auto-seed when no users exist
  KEEP_AFTER_DELETE: false    // Deleted demo users stay deleted
}

DEMO_USERS = [
  { id: 1, username: 'admin', ... },
  { id: 2, username: 'user1', ... },
  { id: 3, username: 'editor', ... }
]
```

**Functions:**
- `getDemoUsers()` - Get demo users (respects config)
- `isSeedEnabled()` - Check if seed is enabled
- `shouldKeepAfterDelete()` - Check delete behavior

---

## 🗄️ Data Storage

### **localStorage Keys:**

| Key | Purpose | Example |
|-----|---------|---------|
| `adminUsers` | User metadata (NO passwords) | `[{id:1, username:'admin', role:'admin',...}]` |
| `userPasswords` | Passwords (separate for security) | `{"1":"admin123", "admin":"admin123"}` |
| `deletedUsers` | Blacklist of deleted demo user IDs | `[2, 3]` |
| `authUser` | Current logged-in user | `{id:1, username:'admin',...}` |

---

## 🔄 User Data Flow

### **Complete System Diagram:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USER MANAGEMENT SYSTEM                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐        │
│  │ seedData.js │───▶│  users.js    │───▶│ UsersManagement │        │
│  │ (Config)    │    │  (Logic)     │    │ (UI)            │        │
│  └─────────────┘    └──────────────┘    └─────────────────┘        │
│         │                   │                      │                 │
│         ▼                   ▼                      ▼                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐        │
│  │ DEMO_USERS  │    │  getUsers()  │    │  Admin Panel    │        │
│  │ - admin     │    │  - Merge     │    │  - Add User     │        │
│  │ - user1     │    │  - Filter    │    │  - Edit User    │        │
│  │ - editor    │    │  - Return    │    │  - Delete User  │        │
│  └─────────────┘    └──────────────┘    │  - View User    │        │
│                                          └─────────────────┘        │
│                                                                       │
│  ┌────────────────── localStorage ─────────────────────────┐        │
│  │                                                          │        │
│  │  adminUsers: [{id:1, username:'admin', role:'admin'}]   │        │
│  │  userPasswords: {"1":"admin123", "admin":"admin123"}    │        │
│  │  deletedUsers: [2]  ← user1 deleted, won't reappear    │        │
│  │  authUser: {id:1, username:'admin',...}                 │        │
│  │                                                          │        │
│  └──────────────────────────────────────────────────────────┘        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### **1. Get Users Flow (getUsers())**

```
START getUsers()
        │
        ▼
┌─────────────────────────────────────────┐
│ 1. Load from localStorage:              │
│    - adminUsers (user metadata)         │
│    - userPasswords (passwords)          │
│    - deletedUsers (blacklist)           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 2. Merge adminUsers + passwords         │
│    Priority: adminUsers data            │
│    Password: userPasswords OR default   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 3. For each DEMO_USER:                  │
│    ├─ In blacklist? → Skip ✅           │
│    ├─ In adminUsers? → Skip ✅          │
│    └─ Else → Add to result ✅           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 4. Return merged users array            │
│    = adminUsers + non-deleted demos     │
└─────────────────────────────────────────┘
```

### **2. Delete User**

```
Admin clicks "Xóa" on user1
        │
        ▼
┌─────────────────────────────────────────┐
│ 1. Remove from adminUsers               │
│ 2. Add ID to deletedUsers blacklist     │
│ 3. Delete password from userPasswords   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        User1 deleted ✅
        
        Reload page
        │
        ▼
┌─────────────────────────────────────────┐
│ getUsers() runs:                        │
│ - adminUsers: no user1 ✅               │
│ - deletedUsers: [2] ✅                  │
│ - Demo users: has user1 BUT ID=2        │
│ - Blacklist check: Skip user1 ✅        │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Features

### **Password Management**

- Passwords stored in **separate** localStorage key (`userPasswords`)
- Never stored in `adminUsers` (only metadata)
- Multi-key lookup: `ID`, `String(ID)`, `username`

```javascript
// Save password
userPasswords = {
  "1": "admin123",        // By numeric ID
  "admin": "admin123"     // By username
}

// Lookup priority
password = passwords[user.id] || 
           passwords[String(user.id)] || 
           passwords[user.username] ||
           defaultPassword
```

---

## 🛠️ Admin Functions

### **Available in UsersManagementPage:**

| Function | Purpose | Warning |
|----------|---------|---------|
| **Factory Reset** 🔄 | Reset to demo users | ⚠️ Deletes ALL user data |
| **Clear Blacklist** 🗑️ | Restore deleted demo users | ⚠️ Deleted demos reappear |
| **Add User** ➕ | Create new user | ✅ Safe |
| **Edit User** ✏️ | Modify user info | ✅ Safe |
| **Delete User** 🗑️ | Delete user (with blacklist) | ✅ Safe |
| **View User** 👁️ | View all user details | ✅ Safe |

---

## 📋 Best Practices

### **Development:**
1. ✅ Keep `SEED_ENABLED = true` for easy testing
2. ✅ Use demo users for development
3. ✅ Test with factory reset frequently

### **Production:**
1. ⚠️ Set `SEED_ENABLED = false` in `seedData.js`
2. ⚠️ Create admin account manually
3. ⚠️ Remove demo users from production build
4. ✅ Use proper database instead of localStorage

---

## 🔧 Maintenance

### **Restore Demo User (if deleted):**

```javascript
// Option 1: Clear blacklist (all deleted demos restore)
clearDeletedUsers();
window.location.reload();

// Option 2: Factory reset (full reset)
resetToFactoryDefaults();
window.location.reload();
```

### **Add New Demo User:**

Edit `src/data/seedData.js`:

```javascript
export const DEMO_USERS = [
  // ... existing users ...
  {
    id: 4,
    username: 'newdemo',
    password: 'demo123',
    role: 'user',
    name: 'New Demo User',
    email: 'newdemo@example.com',
    isDemo: true
  }
];
```

---

## 🎯 Why This Architecture?

### **Problems Solved:**

❌ **Before:** Demo users in code, delete không persist
❌ **Before:** Confusion khi user1 trong code nhưng không hiện UI
❌ **Before:** Không có cách restore demo users

✅ **After:** Blacklist system - delete persist qua reload
✅ **After:** Clear separation - seed vs user data
✅ **After:** Professional tools - factory reset, clear blacklist
✅ **After:** Documented & maintainable

### **Benefits:**

1. **Separation of Concerns** - Seed data tách riêng khỏi logic
2. **Flexibility** - Có thể enable/disable seed dễ dàng
3. **Maintainability** - Code rõ ràng, dễ đọc, có documentation
4. **Professional** - Giống pattern của Rails, Laravel, Django
5. **Safe** - Blacklist ngăn data bị duplicate
6. **Restorable** - Factory reset và clear blacklist

---

## 📚 Related Files

- `src/data/seedData.js` - Seed configuration & demo users
- `src/data/users.js` - User management & getUsers logic
- `src/utils/seedManager.js` - Seed utilities & reset functions
- `src/pages/admin/UsersManagementPage.jsx` - Admin UI với seed controls

---

## 🚀 Future Improvements

1. [ ] Migrate to IndexedDB for users
2. [ ] Add user import/export (CSV)
3. [ ] Add bulk operations
4. [ ] Add user audit log
5. [ ] Add role-based permissions system
6. [ ] Backend API integration

---

**Last Updated:** 2025-11-18
**Version:** 2.0 - Professional Seed Data Architecture

