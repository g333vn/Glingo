# 📊 Hướng Dẫn Sử Dụng Admin Dashboard

## 🎯 Tổng quan

Admin Dashboard là trang chính của hệ thống quản trị, cung cấp cái nhìn tổng quan về hệ thống và truy cập nhanh đến các module quản lý.

## 🚀 Cách truy cập

1. **Đăng nhập** với tài khoản Admin:
   - Username: `admin`
   - Password: `admin123`

2. **Truy cập Dashboard:**
   - Click nút **"Admin Panel"** ở Header (góc phải)
   - Hoặc truy cập trực tiếp: `/admin`

## 📋 Các thành phần chính

### 1. Header
- **Chào mừng**: Hiển thị tên người dùng đang đăng nhập
- **Mô tả**: Hướng dẫn sử dụng Dashboard

### 2. Stats Cards (Thẻ thống kê)

Hiển thị số liệu tổng quan về hệ thống:

| Thẻ | Mô tả | Đường dẫn |
|-----|-------|----------|
| 📊 **Tổng số Quiz** | Số lượng quiz đã tạo | `/admin/quiz-editor` |
| 👥 **Tổng số Users** | Số lượng người dùng | `/admin/users` |
| 📚 **Tổng số Sách** | Số lượng sách trong hệ thống | `/admin/content` |
| 📋 **Tổng số Đề thi** | Số lượng đề thi JLPT | `/admin/exams` |

**Lưu ý:** Click vào thẻ để truy cập nhanh đến module tương ứng.

### 3. Quick Actions (Thao tác nhanh)

Các nút thao tác nhanh để tạo mới hoặc quản lý:

- **➕ Tạo Quiz mới**: Mở Quiz Editor để tạo quiz mới
- **👥 Quản lý Users**: Mở trang quản lý người dùng
- **📚 Quản lý Nội dung**: Mở trang quản lý sách và chapters

### 4. Storage Monitoring (Giám sát lưu trữ)

Hiển thị thông tin về dung lượng lưu trữ:

- **Storage Type**: Loại storage đang sử dụng (IndexedDB hoặc localStorage)
- **Total Size**: Tổng dung lượng đã sử dụng
- **Item Count**: Số lượng items đã lưu
- **Percent Used**: Phần trăm dung lượng đã sử dụng

**Lưu ý:**
- IndexedDB: Không giới hạn dung lượng (khuyến nghị)
- localStorage: Giới hạn 5-10 MB (fallback)

### 5. Sidebar Navigation

Menu điều hướng bên trái với các module:

- **📊 Dashboard**: Trang chủ admin (trang hiện tại)
- **✏️ Quiz Editor**: Tạo và chỉnh sửa quiz
- **👥 Quản lý Users**: Quản lý người dùng
- **📚 Quản lý Nội dung**: Quản lý sách, chapters, series
- **📋 Quản lý Đề thi**: Quản lý đề thi JLPT
- **⚙️ Cài đặt**: Cài đặt hệ thống (Coming Soon)

## 📱 Responsive Design

Dashboard được tối ưu cho mọi thiết bị:

- **Mobile**: Sidebar overlay, stats cards xếp dọc
- **Tablet**: Sidebar overlay, stats cards 2 cột
- **Desktop**: Sidebar sticky, stats cards 4 cột

## 🔄 Workflow đề xuất

1. **Kiểm tra Dashboard** → Xem tổng quan hệ thống
2. **Chọn module** → Click vào stats card hoặc sidebar
3. **Thực hiện thao tác** → Tạo mới, chỉnh sửa, xóa
4. **Quay lại Dashboard** → Xem cập nhật số liệu

## 💡 Tips

- **Click vào stats cards** để truy cập nhanh module tương ứng
- **Sử dụng Quick Actions** để tạo mới nhanh chóng
- **Kiểm tra Storage Monitoring** để theo dõi dung lượng lưu trữ
- **Sidebar có thể collapse** trên desktop để tiết kiệm không gian

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
- Đã đăng nhập với tài khoản Admin chưa?
- Có quyền truy cập module không?
- Storage có đủ dung lượng không?

