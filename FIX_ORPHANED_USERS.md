# 🔧 Hướng Dẫn Xóa Orphaned Users (Users Còn Trong auth.users Nhưng Đã Xóa Trong profiles)

## 🎯 Vấn Đề

Khi xóa user trong Supabase:
- User có thể bị xóa trong `profiles` table
- Nhưng vẫn còn trong `auth.users` table (orphaned user)
- Khi tạo user mới với email đã dùng, Supabase sẽ báo lỗi "Email already registered"

## 🔍 Cách Kiểm Tra

### **Cách 1: Qua Supabase Dashboard**

1. Mở **Supabase Dashboard** → **Authentication** → **Users**
2. Tìm user theo email
3. Nếu thấy user nhưng không có trong **Table Editor** → **profiles** → Đây là orphaned user

### **Cách 2: Qua SQL Editor**

```sql
-- Tìm orphaned users (có trong auth.users nhưng không có trong profiles)
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Orphaned (no profile)'
    ELSE '✅ Has profile'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;
```

## 🛠️ Cách Xóa Orphaned Users

### **Cách 1: Qua Supabase Dashboard (Dễ nhất)**

1. Mở **Supabase Dashboard** → **Authentication** → **Users**
2. Tìm user cần xóa
3. Click vào user → Click nút **"Delete user"** hoặc **"..."** → **Delete**
4. Xác nhận xóa
5. ✅ User sẽ bị xóa hoàn toàn khỏi `auth.users`

### **Cách 2: Qua SQL Editor (Nhanh cho nhiều users)**

⚠️ **LƯU Ý**: Không thể xóa trực tiếp từ `auth.users` bằng SQL thông thường vì đây là bảng system.

**Cách an toàn:**
1. Sử dụng Supabase Admin API (cần service role key)
2. Hoặc xóa qua Dashboard

### **Cách 3: Xóa Tất Cả Orphaned Users (SQL - Cần Service Role)**

```sql
-- ⚠️ CHỈ CHẠY NẾU BẠN CHẮC CHẮN MUỐN XÓA TẤT CẢ ORPHANED USERS
-- Cần service role key để chạy

-- Bước 1: Xem danh sách orphaned users trước
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Bước 2: Xóa từng user (thay USER_ID)
-- DELETE FROM auth.users WHERE id = 'USER_ID';
```

## 🔄 Tự Động Xử Lý Trong Code

Code đã được cập nhật để:
1. ✅ Kiểm tra email trong `profiles` trước khi tạo user
2. ✅ Xử lý lỗi "Email already registered" từ Supabase
3. ✅ Hiển thị thông báo rõ ràng nếu email đã tồn tại trong `auth.users`

## 📋 Checklist Khi Gặp Lỗi "Email Already Used"

1. ✅ Kiểm tra email có trong `profiles` table không?
   - Nếu có → User đang tồn tại, không thể tạo lại
   - Nếu không → Tiếp tục bước 2

2. ✅ Kiểm tra email có trong `auth.users` không?
   - Mở Supabase Dashboard → Authentication → Users
   - Tìm email
   - Nếu có → Đây là orphaned user

3. ✅ Xóa orphaned user:
   - Vào Authentication → Users
   - Tìm và xóa user
   - Hoặc dùng SQL (cần service role)

4. ✅ Thử tạo user lại

## 🎯 Best Practices

1. **Khi xóa user trong admin panel:**
   - Nên xóa cả trong `profiles` VÀ `auth.users`
   - Hiện tại code chỉ xóa trong `profiles`
   - Cần xóa thủ công trong Dashboard nếu muốn xóa hoàn toàn

2. **Khi tạo user mới:**
   - Code sẽ tự động báo lỗi nếu email đã tồn tại
   - Kiểm tra cả `profiles` và `auth.users`

3. **Định kỳ cleanup:**
   - Chạy query SQL để tìm orphaned users
   - Xóa các orphaned users không cần thiết

---

**Lưu ý**: Xóa user trong `auth.users` sẽ xóa hoàn toàn user khỏi hệ thống. Đảm bảo bạn muốn xóa vĩnh viễn trước khi thực hiện.

