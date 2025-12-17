# 🔄 Hướng Dẫn Đổi Role Cho User Trong Supabase

## 🎯 Có 3 Cách Đổi Role

### **Cách 1: Qua Admin Panel (Dễ nhất - Khuyến nghị)**

1. **Vào Admin Panel** → **Quản lý Users**
2. **Tìm user** cần đổi role
3. **Click nút "Xem" hoặc "Sửa"** (biểu tượng bút chì)
4. **Chọn role mới** trong dropdown "Role"
5. **Click "Lưu thay đổi"**
6. ✅ Role sẽ được cập nhật trong Supabase database

---

### **Cách 2: Qua Supabase Table Editor (Trực tiếp)**

1. **Mở Supabase Dashboard** → https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Table Editor** → **profiles**
4. **Tìm user** cần đổi role (theo email hoặc user_id)
5. **Click vào row** của user đó
6. **Sửa cột `role`**:
   - `admin` - Quản trị viên
   - `editor` - Biên tập viên
   - `user` - Người dùng thường
7. **Click "Save"** hoặc nhấn Enter
8. ✅ Role đã được cập nhật

---

### **Cách 3: Qua SQL Editor (Nhanh cho nhiều users)**

1. **Mở Supabase Dashboard** → **SQL Editor**
2. **Copy và chạy query sau:**

#### **Đổi role cho 1 user cụ thể:**
```sql
-- Đổi role user theo email
UPDATE public.profiles
SET 
  role = 'admin',  -- Thay 'admin' bằng 'editor' hoặc 'user'
  updated_at = NOW()
WHERE email = 'user@example.com';  -- Thay email của user
```

#### **Đổi role cho 1 user theo user_id:**
```sql
-- Đổi role user theo user_id (UUID)
UPDATE public.profiles
SET 
  role = 'editor',  -- Thay 'editor' bằng 'admin' hoặc 'user'
  updated_at = NOW()
WHERE user_id = '2dfd587c-83f2-4509-b643-57d47060223d';  -- Thay UUID của user
```

#### **Đổi role cho nhiều users cùng lúc:**
```sql
-- Đổi role cho nhiều users theo email
UPDATE public.profiles
SET 
  role = 'editor',
  updated_at = NOW()
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
);
```

#### **Xem danh sách users và role hiện tại:**
```sql
-- Xem tất cả users và role
SELECT 
  user_id,
  email,
  display_name,
  role,
  created_at,
  updated_at
FROM public.profiles
ORDER BY role, email;
```

#### **Đếm số users theo role:**
```sql
-- Thống kê users theo role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY count DESC;
```

---

## ⚠️ Lưu Ý Quan Trọng

### **1. Role Hợp Lệ:**
- ✅ `admin` - Quản trị viên (toàn quyền)
- ✅ `editor` - Biên tập viên (tạo/sửa nội dung)
- ✅ `user` - Người dùng thường (chỉ xem)

### **2. RLS Policies:**
- Đảm bảo bạn có quyền admin để update role
- Nếu không có quyền, cần chạy file `fix_profiles_rls_with_admin_insert.sql`

### **3. Sau Khi Đổi Role:**
- User cần **đăng xuất và đăng nhập lại** để role mới có hiệu lực
- Hoặc **refresh trang** (F5) để cập nhật role trong session

### **4. Demo Users:**
- Demo users (admin, user1, editor) chỉ có trong localStorage
- Để đổi role demo users, dùng Admin Panel (không cần Supabase)

---

## 🔍 Kiểm Tra Role Đã Đổi

### **Query kiểm tra:**
```sql
-- Kiểm tra role của user cụ thể
SELECT 
  email,
  display_name,
  role,
  updated_at
FROM public.profiles
WHERE email = 'user@example.com';
```

### **Trong Admin Panel:**
1. Click **"Sync từ Supabase"** để đồng bộ
2. Kiểm tra role trong danh sách users
3. Role mới sẽ hiển thị trong cột "ROLE"

---

## 🛠️ Troubleshooting

### **Lỗi: "new row violates row-level security policy"**
- **Nguyên nhân**: RLS policies không cho phép update
- **Giải pháp**: Chạy file `fix_profiles_rls_with_admin_insert.sql`

### **Role không thay đổi sau khi update**
- **Nguyên nhân**: User chưa đăng xuất/đăng nhập lại
- **Giải pháp**: User cần refresh trang hoặc đăng nhập lại

### **Không thấy user trong Supabase**
- **Nguyên nhân**: User là demo user (chỉ có trong localStorage)
- **Giải pháp**: Dùng Admin Panel để đổi role cho demo users

---

## 📋 Quick Reference

| Cách | Ưu điểm | Nhược điểm |
|------|---------|------------|
| **Admin Panel** | Dễ dùng, có UI | Cần đăng nhập admin |
| **Table Editor** | Trực quan, nhanh | Cần vào Supabase Dashboard |
| **SQL Editor** | Nhanh cho nhiều users | Cần biết SQL |

---

**Chúc bạn đổi role thành công! 🎉**

