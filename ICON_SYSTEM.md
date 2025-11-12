# 🎨 Icon System - Hệ Thống Icon Đồng Nhất

## 📋 Mục Đích

Document này định nghĩa **hệ thống icon chuẩn** cho toàn bộ dự án, đảm bảo **consistency** và **UX tốt** trên cả 3 giao diện (Desktop, Tablet, Mobile).

---

## 🎯 Nguyên Tắc Chọn Icon

### 1. **Consistency (Nhất quán)**
- Mỗi action/module chỉ dùng **1 icon duy nhất**
- Icon phải **giống nhau** ở mọi nơi (sidebar, button, modal, dashboard)

### 2. **Semantic (Ngữ nghĩa rõ ràng)**
- Icon phải **trực quan**, dễ hiểu
- Người dùng nhìn vào icon là biết chức năng

### 3. **Universal (Phổ biến)**
- Ưu tiên icon **phổ biến**, được dùng rộng rãi
- Tránh icon lạ, khó hiểu

---

## 🏗️ Icon Categories

### A. Navigation Icons (Menu Chính)

| Module | Icon | Label | Used In |
|--------|------|-------|---------|
| Dashboard | `📊` | Dashboard | Sidebar, Header |
| Quiz Editor | `✏️` | Quiz Editor | Sidebar, Dashboard |
| User Management | `👥` | Quản lý Users | Sidebar, Dashboard |
| Content Management | `📚` | Quản lý Nội dung | Sidebar, Dashboard |
| Settings | `⚙️` | Cài đặt | Sidebar, Dashboard |
| Home | `🏠` | Trang chủ | Header |
| Level Module | `📖` | Learn Your Approach | Header |
| JLPT Module | `🎓` | JLPT Practice | Header |
| About | `👤` | About Me | Header |

### B. Action Icons (Thao Tác)

| Action | Icon | Label | Context |
|--------|------|-------|---------|
| Add/Create | `➕` | Thêm mới | Buttons, Forms |
| Edit | `✏️` | Sửa | Table actions, Forms |
| Delete | `🗑️` | Xóa | Table actions |
| Save | `💾` | Lưu | Form submit |
| Close/Cancel | `❌` | Hủy / Đóng | Buttons, Modals |
| Success | `✅` | Thành công | Alerts, Status |
| Warning | `⚠️` | Cảnh báo | Alerts, Warnings |
| Info | `💡` | Thông tin | Tooltips, Hints |
| View | `👁️` | Xem | Table actions |
| Download | `⬇️` | Tải xuống | Export, Download |
| Upload | `⬆️` | Tải lên | Import, Upload |
| Search | `🔍` | Tìm kiếm | Search bars |

### C. Status Icons (Trạng Thái)

| Status | Icon | Label | Context |
|--------|------|-------|---------|
| Completed | `✅` | Hoàn thành | Status badges |
| In Progress | `🔄` | Đang làm | Status badges |
| Not Started | `⏸️` | Chưa bắt đầu | Status badges |
| Locked | `🔒` | Khóa | Disabled items |
| Coming Soon | `🚧` | Sắp ra mắt | Placeholder |
| Error | `❌` | Lỗi | Error states |

### D. Content Icons (Nội Dung)

| Content Type | Icon | Label | Context |
|--------------|------|-------|---------|
| Book/Sách | `📚` | Sách | Books, Content |
| Chapter/Chương | `📝` | Chương | Chapters |
| Question/Quiz | `❓` | Câu hỏi | Quizzes |
| Exam/Đề thi | `📋` | Đề thi | Exams |
| Series/Bộ sách | `📦` | Bộ sách | Series |
| Level | `🎚️` | Cấp độ | Levels |

### E. User Icons (Người Dùng)

| Role/Action | Icon | Label | Context |
|-------------|------|-------|---------|
| Admin | `👨‍💼` | Admin | User role |
| Teacher | `👨‍🏫` | Teacher | User role |
| Student | `👨‍🎓` | Student | User role |
| Login | `🔑` | Đăng nhập | Auth |
| Logout | `🚪` | Đăng xuất | Auth |
| Profile | `👤` | Hồ sơ | User menu |

---

## 📝 Icon Mapping (Chi Tiết)

### 1. Admin Sidebar
```jsx
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'quiz-editor', label: 'Quiz Editor', icon: '✏️' },
  { id: 'users', label: 'Quản lý Users', icon: '👥' },
  { id: 'content', label: 'Quản lý Nội dung', icon: '📚' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' }
];
```

### 2. Admin Dashboard - Stats Cards
```jsx
const stats = [
  { title: 'Tổng số Sách', icon: '📚', value: '25' },
  { title: 'Tổng số Đề thi', icon: '📋', value: '75' },
  { title: 'Tổng số Users', icon: '👥', value: '3' },
  { title: 'Quiz đã tạo', icon: '✏️', value: '150+' }
];
```

### 3. Admin Dashboard - Quick Actions
```jsx
const quickActions = [
  { title: 'Tạo Quiz mới', icon: '➕', action: 'quiz-editor' },
  { title: 'Quản lý Users', icon: '👥', action: 'users' },
  { title: 'Quản lý Nội dung', icon: '📚', action: 'content' },
  { title: 'Cài đặt hệ thống', icon: '⚙️', action: 'settings' }
];
```

### 4. Content Management - Tabs
```jsx
const tabs = [
  { id: 'books', label: 'Quản lý Sách', icon: '📚' },
  { id: 'series', label: 'Quản lý Bộ sách', icon: '📦' },
  { id: 'exams', label: 'Đề thi', icon: '📋' }
];
```

### 5. Content Management - Actions
```jsx
// Add buttons
<button>➕ Thêm Sách mới</button>
<button>➕ Thêm Chương mới</button>
<button>➕ Thêm Bộ sách mới</button>

// Table actions
<button>✏️ Sửa</button>
<button>🗑️ Xóa</button>
<button>➕ Thêm Chapter</button>

// Form buttons
<button>💾 Lưu</button>
<button>❌ Hủy</button>
```

### 6. Modals
```jsx
// Modal titles
"✏️ Sửa Sách"
"➕ Thêm Sách mới"
"✏️ Sửa Chương"
"➕ Thêm Chương mới"
"✏️ Sửa Bộ sách"
"➕ Thêm Bộ sách mới"

// Info messages
"⚠️ Lưu ý: ..."
"💡 Bộ sách này sẽ được tạo cho level: ..."
```

### 7. Header (Main Navigation)
```jsx
// Desktop
"🏠 HOME"
"📖 LEVEL"
"🎓 JLPT"
"👤 ABOUT ME"

// Mobile (compact)
"🏠"
"📖"
"🎓"
"👤"

// User menu
"👤 Xin chào, {name}!"
"🔧 Admin Panel" // Only for admin
"🚪 Đăng xuất"
```

### 8. Quiz Editor
```jsx
"✏️ Quiz Editor"
"➕ Thêm câu hỏi"
"🗑️ Xóa câu hỏi"
"📋 Copy câu hỏi"
"💾 Tải xuống JSON"
```

### 9. User Management
```jsx
"👥 Quản lý Users"
"➕ Thêm User mới"
"✏️ Sửa"
"🗑️ Xóa"
"🔑 Đổi mật khẩu"
```

---

## 🎨 Implementation Guidelines

### 1. **Icon Size**
```css
/* Mobile (< 640px) */
font-size: 1.25rem; /* 20px */

/* Tablet (640px - 1024px) */
font-size: 1.5rem; /* 24px */

/* Desktop (>= 1024px) */
font-size: 1.5rem - 2rem; /* 24px - 32px */
```

### 2. **Icon Spacing**
```jsx
// Icon + Text (Horizontal)
<button className="flex items-center gap-2">
  <span>📚</span>
  <span>Quản lý Sách</span>
</button>

// Icon only (Mobile)
<button className="p-2">
  <span className="text-xl">📚</span>
</button>
```

### 3. **Icon Accessibility**
```jsx
// Always provide aria-label for icon-only buttons
<button 
  aria-label="Thêm sách mới"
  title="Thêm sách mới"
>
  ➕
</button>
```

---

## 🔄 Migration Checklist

### Phase 1: Admin Panel ✅
- [x] AdminLayout sidebar icons
- [x] AdminDashboard stats icons
- [x] AdminDashboard quick actions icons
- [ ] ContentManagement tabs icons
- [ ] ContentManagement buttons icons
- [ ] ContentManagement modal titles icons
- [ ] UsersManagement icons
- [ ] QuizEditor icons

### Phase 2: Main App
- [ ] Header navigation icons
- [ ] Level module icons
- [ ] JLPT module icons
- [ ] Home page icons
- [ ] About page icons

### Phase 3: Components
- [ ] Modal default close button icon
- [ ] Alert/notification icons
- [ ] Status badges icons
- [ ] Tooltip icons

---

## 📊 Icon Usage Matrix

| Location | Before | After | Status |
|----------|--------|-------|--------|
| Sidebar - Dashboard | `📊` | `📊` | ✅ OK |
| Sidebar - Quiz Editor | `✏️` | `✏️` | ✅ OK |
| Sidebar - Users | `👥` | `👥` | ✅ OK |
| Sidebar - Content | `📚` | `📚` | ✅ OK |
| Sidebar - Settings | `⚙️` | `⚙️` | ✅ OK |
| Dashboard - Stats Books | Various | `📚` | ⏳ TODO |
| Dashboard - Stats Exams | Various | `📋` | ⏳ TODO |
| Dashboard - Stats Users | Various | `👥` | ⏳ TODO |
| Dashboard - Stats Quiz | Various | `✏️` | ⏳ TODO |
| Content Tabs - Books | Various | `📚` | ⏳ TODO |
| Content Tabs - Series | Various | `📦` | ⏳ TODO |
| Content Tabs - Exams | Various | `📋` | ⏳ TODO |
| Add buttons | Various | `➕` | ⏳ TODO |
| Edit buttons | Various | `✏️` | ⏳ TODO |
| Delete buttons | Various | `🗑️` | ⏳ TODO |
| Save buttons | Various | `💾` | ⏳ TODO |
| Cancel buttons | Various | `❌` | ⏳ TODO |

---

## 🎯 Testing Checklist

### Desktop (>= 1024px)
- [ ] All icons visible and correct size
- [ ] Icon + text layout proper spacing
- [ ] Hover states working
- [ ] Icons consistent across all pages

### Tablet (640px - 1024px)
- [ ] Icons scale properly
- [ ] Compact text (if applicable) displays
- [ ] Touch targets >= 44x44px
- [ ] Icons don't overlap

### Mobile (< 640px)
- [ ] Icon-only buttons work
- [ ] Icons are touch-friendly
- [ ] Tooltips/aria-labels present
- [ ] Icons don't crowd UI

---

## 📚 References

- [Emojipedia](https://emojipedia.org/) - Icon meanings and variations
- [Material Design Icons](https://material.io/resources/icons/) - Alternative icon system
- [Apple HIG - Icons](https://developer.apple.com/design/human-interface-guidelines/icons) - Icon design guidelines
- [WCAG 2.1 - Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - Accessibility

---

**Last Updated**: 2024-11-12  
**Version**: 1.0.0

