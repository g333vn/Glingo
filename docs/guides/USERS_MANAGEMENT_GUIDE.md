# 👥 Hướng Dẫn Quản Lý Người Dùng

## 🎯 Tổng quan

Module Quản lý Người dùng cho phép Admin quản lý tất cả tài khoản trong hệ thống, bao gồm thêm, sửa, xóa users và thay đổi mật khẩu.

## 🚀 Cách truy cập

1. **Đăng nhập** với tài khoản Admin (thông tin đăng nhập được cấu hình trong `src/data/users.js`)
   
   ⚠️ **Lưu ý:** Vui lòng thay đổi passwords mặc định trước khi deploy lên production!

2. **Truy cập Users Management:**
   - Từ Admin Dashboard: Click vào thẻ **"Tổng số Users"** hoặc **"Quản lý Users"**
   - Từ Sidebar: Click **"👥 Quản lý Users"**
   - Hoặc truy cập trực tiếp: `/admin/users`

## 📋 Các tính năng

### 1. Xem danh sách Users

Bảng hiển thị tất cả users với thông tin:
- **ID**: Mã định danh user
- **Username**: Tên đăng nhập
- **Name**: Tên hiển thị
- **Email**: Địa chỉ email
- **Role**: Vai trò (admin, editor, user)
- **Actions**: Các thao tác (Sửa, Xóa, Đổi mật khẩu)

### 2. Thêm User mới

**Các bước:**

1. Click nút **"➕ Thêm User mới"** (góc trên bên phải)
2. Điền form:
   - **Username** * (bắt buộc): Tên đăng nhập (duy nhất)
   - **Password** * (bắt buộc): Mật khẩu
   - **Name** * (bắt buộc): Tên hiển thị
   - **Email**: Địa chỉ email (tùy chọn)
   - **Role** * (bắt buộc): Chọn vai trò
     - `admin`: Toàn quyền
     - `editor`: Chỉnh sửa quiz
     - `user`: Chỉ xem
3. Click **"💾 Lưu"**
4. User mới sẽ xuất hiện trong danh sách

**Lưu ý:**
- Username phải duy nhất (không trùng với user khác)
- Password sẽ được mã hóa và lưu an toàn
- Không thể xóa chính mình (current user)

### 3. Sửa thông tin User

**Các bước:**

1. Click nút **"✏️ Sửa"** ở dòng user cần sửa
2. Form sẽ hiển thị với thông tin hiện tại
3. Chỉnh sửa các trường cần thiết:
   - Username (không thể thay đổi)
   - Name
   - Email
   - Role
4. Click **"💾 Lưu"**
5. Thông tin sẽ được cập nhật

**Lưu ý:**
- Username không thể thay đổi (để tránh xung đột)
- Có thể thay đổi role (ví dụ: nâng user lên editor)

### 4. Xóa User

**Các bước:**

1. Click nút **"🗑️ Xóa"** ở dòng user cần xóa
2. Xác nhận xóa trong hộp thoại
3. User sẽ bị xóa khỏi hệ thống

**Lưu ý:**
- ⚠️ **Không thể xóa chính mình** (current user)
- ⚠️ **Không thể xóa user cuối cùng** (phải có ít nhất 1 admin)
- Xóa user sẽ xóa tất cả dữ liệu liên quan

### 5. Đổi mật khẩu

**Các bước:**

1. Click nút **"🔑 Đổi mật khẩu"** ở dòng user cần đổi
2. Điền form:
   - **Mật khẩu hiện tại** * (bắt buộc): Mật khẩu cũ
   - **Mật khẩu mới** * (bắt buộc): Mật khẩu mới
   - **Xác nhận mật khẩu** * (bắt buộc): Nhập lại mật khẩu mới
3. Click **"💾 Lưu"**
4. Mật khẩu sẽ được cập nhật

**Lưu ý:**
- Admin có thể đổi mật khẩu cho bất kỳ user nào
- User có thể đổi mật khẩu của chính mình (từ profile)
- Mật khẩu mới phải khớp với xác nhận

## 🔐 Phân quyền (Roles)

### Admin
- ✅ Toàn quyền truy cập
- ✅ Quản lý users
- ✅ Tạo/sửa/xóa quiz
- ✅ Quản lý nội dung
- ✅ Quản lý đề thi

### Editor
- ✅ Tạo/sửa quiz
- ✅ Xem nội dung
- ❌ Quản lý users
- ❌ Quản lý đề thi

### User
- ✅ Xem quiz
- ✅ Làm bài thi
- ❌ Tạo/sửa quiz
- ❌ Quản lý users

## 💾 Lưu trữ dữ liệu

- **Users metadata** được lưu vào `localStorage` (key: `adminUsers`)
- **Password** KHÔNG được lưu vào localStorage (bảo mật)
- Dữ liệu được đồng bộ tự động khi thay đổi

## 📱 Responsive Design

Module được tối ưu cho mọi thiết bị:

- **Mobile**: Bảng cuộn ngang, form full-width
- **Tablet**: Bảng responsive, form 2 cột
- **Desktop**: Bảng đầy đủ, form 3 cột

## ⚠️ Lưu ý bảo mật

1. **Password không được lưu vào localStorage**
   - Chỉ lưu metadata (username, name, email, role)
   - Password chỉ tồn tại trong memory khi đăng nhập

2. **Không thể xóa chính mình**
   - Bảo vệ admin khỏi vô tình khóa tài khoản

3. **Phải có ít nhất 1 admin**
   - Không thể xóa user cuối cùng có role admin

4. **Username phải duy nhất**
   - Hệ thống sẽ kiểm tra trước khi lưu

## 🔄 Workflow đề xuất

1. **Xem danh sách** → Kiểm tra tất cả users
2. **Thêm user mới** → Tạo tài khoản cho người dùng mới
3. **Phân quyền** → Gán role phù hợp (admin/editor/user)
4. **Quản lý** → Sửa thông tin, đổi mật khẩu khi cần
5. **Dọn dẹp** → Xóa users không còn sử dụng

## 💡 Tips

- **Sử dụng role phù hợp**: Chỉ gán admin cho người thực sự cần
- **Đổi mật khẩu định kỳ**: Đảm bảo bảo mật tài khoản
- **Kiểm tra email**: Điền email để có thể liên hệ khi cần
- **Backup users**: Export danh sách users định kỳ

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
- Kiểm tra đã đăng nhập với tài khoản Admin chưa?
- Username có trùng với user khác không?
- Mật khẩu mới có khớp với xác nhận không?

