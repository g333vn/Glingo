# 📚 E-Learning Platform - Hệ Thống Học Tiếng Nhật

## 🎯 Tổng quan

Hệ thống e-learning toàn diện cho việc học và luyện thi tiếng Nhật, bao gồm:

- **Level Module**: Học theo sách (N1-N5)
- **JLPT Module**: Luyện thi JLPT với đề thi thực tế
- **Admin Panel**: Quản lý nội dung, users, và đề thi

## ✨ Tính năng chính

### 📖 Level Module (Learn Your Approach)
- Học theo sách từ N1 đến N5
- Quiz cho từng chapter
- Theo dõi tiến độ học tập

### 🎓 JLPT Module (JLPT Practice)
- Đề thi thực tế theo format JLPT
- 3 phần thi: Kiến thức, Đọc hiểu, Nghe hiểu
- Kết quả chi tiết với giải thích

### 🔐 Admin Panel
- **Dashboard**: Tổng quan hệ thống
- **Quiz Editor**: Tạo và chỉnh sửa quiz
- **Users Management**: Quản lý người dùng
- **Content Management**: Quản lý sách, chapters, series
- **Exam Management**: Quản lý đề thi JLPT

## 🚀 Bắt đầu

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Truy cập
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin (cần đăng nhập)

## 📚 Tài khoản mặc định

⚠️ **Lưu ý bảo mật:** Thông tin đăng nhập mặc định được cấu hình trong file `src/data/users.js`.  
**Vui lòng thay đổi passwords mặc định trước khi deploy lên production!**

Để xem thông tin đăng nhập, vui lòng tham khảo file cấu hình hoặc liên hệ quản trị viên.

## 📖 Hướng dẫn sử dụng

### Cho Admin

1. **[Admin Dashboard Guide](ADMIN_DASHBOARD_GUIDE.md)**
   - Tổng quan hệ thống
   - Stats và quick actions
   - Storage monitoring

2. **[Quiz Editor Guide](QUIZ_EDITOR_GUIDE.md)**
   - Tạo quiz mới
   - Export JSON
   - Preview và validation

3. **[Users Management Guide](USERS_MANAGEMENT_GUIDE.md)**
   - Quản lý users
   - Phân quyền
   - Đổi mật khẩu

4. **[Content Management Guide](CONTENT_MANAGEMENT_GUIDE.md)**
   - Quản lý sách
   - Quản lý chapters
   - Quản lý series

5. **[Exam Management Guide](EXAM_MANAGEMENT_FEATURES.md)**
   - Cấu hình điểm/thời gian
   - Quản lý đề thi
   - Nhập câu hỏi

6. **[Authentication Guide](AUTH_SYSTEM_GUIDE.md)**
   - Đăng nhập/đăng xuất
   - Phân quyền
   - Bảo mật

### Cho User

- **[How to Access Quiz Editor](HOW_TO_ACCESS_QUIZ_EDITOR.md)**
  - Cách truy cập admin panel
  - Đăng nhập
  - Navigation

## 🏗️ Cấu trúc dự án

```
src/
├── components/          # Components tái sử dụng
│   ├── admin/          # Admin components
│   ├── api_translate/  # Dictionary components
│   └── ...
├── contexts/           # React Contexts
│   └── AuthContext.jsx
├── data/               # Static data
│   ├── level/         # Level module data
│   ├── jlpt/          # JLPT module data
│   └── users.js       # User data
├── features/          # Feature modules
│   ├── books/         # Level module
│   └── jlpt/          # JLPT module
├── hooks/             # Custom hooks
├── pages/             # Page components
│   ├── admin/         # Admin pages
│   └── ...
├── services/           # API services
├── styles/            # CSS files
└── utils/              # Utility functions
    ├── indexedDBManager.js
    └── localStorageManager.js
```

## 💾 Lưu trữ dữ liệu

Hệ thống sử dụng **IndexedDB** (primary) và **localStorage** (fallback):

- **IndexedDB**: Không giới hạn dung lượng, phù hợp cho dữ liệu lớn
- **localStorage**: Giới hạn 5-10 MB, dùng làm fallback

### Dữ liệu được lưu:
- Books, Chapters, Series
- Quizzes
- Exams (metadata + full data)
- Level Configs
- Users (metadata only, không lưu password)

## 🔒 Bảo mật

- **Password**: Không được lưu vào localStorage
- **Authentication**: Session-based với localStorage
- **Role-based Access**: Admin/Editor/User
- **Protected Routes**: Bảo vệ admin routes

⚠️ **Lưu ý**: Đây là prototype. Cần backend API cho production.

## 📱 Responsive Design

Hệ thống được tối ưu cho:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🛠️ Công nghệ sử dụng

- **React 18**: UI framework
- **React Router DOM**: Routing
- **Tailwind CSS**: Styling
- **IndexedDB (idb)**: Database
- **Vite**: Build tool

## 📝 License

MIT License

## 👥 Contributors

- Development Team

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra các file hướng dẫn tương ứng
2. Kiểm tra console logs
3. Liên hệ admin

---

**Happy Learning! 🎓**
