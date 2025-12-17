# 🔧 Sửa Lỗi SQL: "column email does not exist"

## ❌ Lỗi Gặp Phải

```
Error: Failed to run sql query: ERROR: 42703: column "email" does not exist
```

## 🔍 Nguyên Nhân

Lỗi này xảy ra khi:
1. Bảng `profiles` đã tồn tại từ trước
2. Bảng cũ không có cột `email`
3. Script cố tạo index hoặc function tham chiếu đến cột `email` trước khi cột được tạo

## ✅ Giải Pháp

### Cách 1: Sử Dụng Script An Toàn (Khuyến Nghị)

Tôi đã tạo file `supabase_setup_safe.sql` - script này sẽ:
- ✅ Kiểm tra và thêm các cột thiếu
- ✅ Không xóa dữ liệu hiện có
- ✅ Xử lý an toàn với bảng đã tồn tại

**Các bước:**

1. Vào Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ nội dung từ file `supabase_setup_safe.sql`
4. Paste vào SQL Editor
5. Click **Run**

### Cách 2: Xóa Bảng Cũ (Nếu Không Cần Dữ Liệu)

⚠️ **CẢNH BÁO:** Cách này sẽ xóa tất cả dữ liệu trong bảng `profiles`!

Nếu bạn không cần dữ liệu cũ, có thể xóa bảng và chạy lại script:

```sql
-- Xóa bảng cũ (CẨN THẬN: Sẽ xóa dữ liệu!)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Sau đó chạy lại script supabase_setup.sql
```

### Cách 3: Thêm Cột Thủ Công

Nếu muốn giữ nguyên bảng và chỉ thêm cột thiếu:

```sql
-- Thêm cột email nếu chưa có
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Thêm các cột khác nếu thiếu
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Thêm constraint cho role
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'editor', 'user'));

-- Sau đó chạy phần còn lại của script (indexes, policies, functions)
```

## 📋 Checklist Sau Khi Sửa

Sau khi chạy script thành công, kiểm tra:

- [ ] Bảng `profiles` có cột `email`
- [ ] Bảng `profiles` có tất cả các cột cần thiết
- [ ] Bảng `activity_logs` được tạo
- [ ] Indexes được tạo
- [ ] RLS policies được tạo
- [ ] Functions được tạo
- [ ] Triggers được tạo

## 🔍 Kiểm Tra Cấu Trúc Bảng

Để kiểm tra cấu trúc bảng hiện tại:

```sql
-- Xem tất cả cột trong bảng profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
```

## 💡 Mẹo

1. **Luôn backup trước:** Nếu có dữ liệu quan trọng, export trước khi chạy script
2. **Test trên project test:** Nếu có thể, test script trên project test trước
3. **Chạy từng phần:** Nếu gặp lỗi, có thể chạy script từng phần để tìm lỗi cụ thể

## 🚀 Sau Khi Sửa Xong

1. Kiểm tra console log trong browser
2. Test đăng ký user mới
3. Kiểm tra user xuất hiện trong bảng `profiles` với đầy đủ thông tin

---

**Sử dụng `supabase_setup_safe.sql` để tránh lỗi này!** ✅

