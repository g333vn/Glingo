# 🔧 Fix Admin Access - Hướng dẫn sửa quyền admin

## Vấn đề

Bạn đang có quyền admin trong database (`role = 'admin'`) nhưng không thể vào bảng admin vì:
1. **Profile không được load** - Do lỗi RLS infinite recursion
2. **Code check role từ profile** - Nhưng profile là `null` nên không nhận diện được admin

## Giải pháp

### Bước 1: Sửa RLS Policies (QUAN TRỌNG NHẤT) ⚠️

**Bạn PHẢI chạy SQL fix trước để profile có thể được load:**

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Copy toàn bộ nội dung từ file **`fix_profiles_rls_simple.sql`**
3. Paste và chạy (Run)

File này sẽ:
- ✅ Xóa các policies gây infinite recursion
- ✅ Tạo lại policies đơn giản, không recursion
- ✅ Cho phép users access profile của chính họ

### Bước 2: Refresh ứng dụng

Sau khi chạy SQL:
1. **Refresh trang** (F5) hoặc **đăng xuất và đăng nhập lại**
2. Profile sẽ được load thành công
3. Code sẽ nhận diện được `profile.role === 'admin'`
4. Bạn sẽ có quyền truy cập admin dashboard

### Bước 3: Kiểm tra

1. Mở **Console** (F12) → kiểm tra không còn lỗi "infinite recursion"
2. Kiểm tra `profile` đã được load:
   ```javascript
   // Trong Console
   // Profile object sẽ có role: 'admin'
   ```
3. Thử truy cập **Admin Panel** → sẽ hoạt động bình thường

## Các thay đổi đã thực hiện trong code

### 1. `dashboardAccessManager.js`
- ✅ Sửa `hasDashboardAccess()` để nhận cả `profile` parameter
- ✅ Check role từ `profile?.role` thay vì chỉ `user?.role`

### 2. `DashboardAccessGuard.jsx`
- ✅ Truyền `profile` vào `hasDashboardAccess(user, profile)`

### 3. `Header.jsx`
- ✅ Thêm `profile` vào destructure từ `useAuth()`
- ✅ Truyền `profile` vào tất cả các chỗ gọi `hasDashboardAccess()`

## Lưu ý

- **Nếu vẫn không được**: Kiểm tra xem profile có được load không
  - Mở Console → xem có lỗi "infinite recursion" không
  - Nếu còn lỗi → chạy lại SQL fix
- **Nếu profile vẫn null**: Có thể do RLS policies chưa được sửa đúng
  - Kiểm tra trong Supabase Dashboard → Table Editor → `profiles` table
  - Kiểm tra Policies → phải có 3 policies: SELECT, UPDATE, INSERT

## Troubleshooting

### Profile vẫn null sau khi chạy SQL
→ Kiểm tra:
1. RLS policies đã được tạo đúng chưa
2. Function `handle_new_user()` đã được tạo chưa
3. Thử tạo profile thủ công trong Supabase Dashboard

### Vẫn không vào được admin dashboard
→ Kiểm tra:
1. `profile.role` có đúng là `'admin'` không
2. Console có lỗi gì không
3. Thử đăng xuất và đăng nhập lại

