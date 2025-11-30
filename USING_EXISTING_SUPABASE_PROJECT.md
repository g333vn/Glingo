# 🔄 Sử Dụng Project Supabase Hiện Có

## ✅ Bạn KHÔNG Cần Tạo Project Mới!

Bạn có thể sử dụng **project Supabase hiện có** của mình. Không cần xóa hay tạo mới.

---

## 📋 Các Bước Sử Dụng Project Hiện Có

### 1️⃣ Kiểm Tra Project Hiện Có

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project hiện có của bạn
3. Vào **Settings → API**
4. Copy các thông tin sau:
   - **Project URL** (ví dụ: `https://xxxxx.supabase.co`)
   - **anon public key** (key bắt đầu bằng `eyJ...`)

### 2️⃣ Cập Nhật File `.env.local`

Tạo hoặc cập nhật file `.env.local` ở root project:

```env
VITE_SUPABASE_URL=https://your-existing-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-existing-anon-key
```

**Lưu ý:** Thay `your-existing-project` và `your-existing-anon-key` bằng giá trị thực từ project của bạn.

### 3️⃣ Kiểm Tra Database Hiện Có

Trước khi chạy SQL script, kiểm tra xem project đã có bảng `profiles` chưa:

1. Vào Supabase Dashboard → **Table Editor**
2. Xem danh sách bảng hiện có
3. Nếu **chưa có** bảng `profiles` → Tiếp tục bước 4
4. Nếu **đã có** bảng `profiles` → Xem phần "Xử Lý Khi Đã Có Bảng"

### 4️⃣ Chạy SQL Setup Script

1. Vào Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ nội dung từ file `supabase_setup.sql`
4. Paste vào SQL Editor
5. Click **Run** hoặc nhấn `Ctrl+Enter`

**Script an toàn vì:**
- Sử dụng `CREATE TABLE IF NOT EXISTS` - không ghi đè bảng đã có
- Sử dụng `CREATE OR REPLACE FUNCTION` - cập nhật function nếu đã có
- Không xóa dữ liệu hiện có

### 5️⃣ Xác Minh Setup

Sau khi chạy script, kiểm tra:

1. Vào **Table Editor**
2. Bạn sẽ thấy các bảng mới:
   - ✅ `profiles`
   - ✅ `user_activity_logs`
3. Vào **Authentication → Policies** để xem RLS policies đã được tạo

---

## ⚠️ Xử Lý Khi Đã Có Bảng `profiles`

Nếu project của bạn **đã có** bảng `profiles` với cấu trúc khác:

### Tùy Chọn 1: Sử Dụng Bảng Hiện Có (Khuyến Nghị)

1. Kiểm tra cấu trúc bảng hiện có
2. So sánh với cấu trúc trong `supabase_setup.sql`
3. Thêm các cột còn thiếu bằng `ALTER TABLE`:

```sql
-- Ví dụ: Thêm cột nếu thiếu
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
```

### Tùy Chọn 2: Tạo Bảng Mới (Nếu Cần)

Nếu muốn tách biệt hoàn toàn, có thể tạo bảng mới với tên khác:

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Copy cấu trúc từ supabase_setup.sql
  -- Đổi tên bảng thành user_profiles
);
```

Sau đó cập nhật code để sử dụng bảng mới.

---

## 🔍 Kiểm Tra Cấu Hình

### Test Kết Nối

1. Khởi động dev server:
```bash
npm run dev
```

2. Mở browser console (F12)
3. Tìm log: `[supabaseClient] Connection OK`
4. Nếu thấy log này → Kết nối thành công! ✅

### Test Authentication

1. Thử đăng ký user mới
2. Kiểm tra Supabase Dashboard → **Table Editor → profiles**
3. User mới sẽ xuất hiện trong bảng `profiles`

---

## 🛡️ Bảo Mật Dữ Liệu Hiện Có

**Script SQL an toàn vì:**

1. ✅ **Không xóa dữ liệu:** Chỉ tạo bảng mới, không xóa bảng cũ
2. ✅ **Không ghi đè:** Sử dụng `IF NOT EXISTS`
3. ✅ **Không thay đổi:** Không modify bảng hiện có
4. ✅ **Chỉ thêm:** Thêm bảng và policies mới

**Nếu lo lắng, bạn có thể:**

1. Tạo **backup** trước khi chạy script:
   - Vào Supabase Dashboard → **Settings → Database**
   - Click **Backup** (nếu có)
   - Hoặc export dữ liệu quan trọng

2. Test trên **project test** trước:
   - Tạo project test mới
   - Chạy script trên project test
   - Xác nhận mọi thứ hoạt động
   - Sau đó chạy trên project chính

---

## 📝 Checklist Sử Dụng Project Hiện Có

- [ ] Đã copy Project URL từ Supabase Dashboard
- [ ] Đã copy anon key từ Supabase Dashboard
- [ ] Đã tạo/cập nhật file `.env.local`
- [ ] Đã kiểm tra bảng `profiles` có tồn tại chưa
- [ ] Đã chạy SQL script trong SQL Editor
- [ ] Đã xác minh bảng `profiles` được tạo
- [ ] Đã xác minh bảng `user_activity_logs` được tạo
- [ ] Đã test kết nối (xem console log)
- [ ] Đã test đăng ký user mới
- [ ] Đã kiểm tra user xuất hiện trong bảng `profiles`

---

## ❓ Câu Hỏi Thường Gặp

### Q: Tôi có thể dùng project Supabase đang dùng cho app khác không?

**A:** Có! Bạn có thể dùng cùng một project Supabase cho nhiều app. Chỉ cần:
- Tạo bảng riêng cho mỗi app (ví dụ: `app1_profiles`, `app2_profiles`)
- Hoặc dùng cùng bảng `profiles` nếu cấu trúc tương thích

### Q: Script SQL có xóa dữ liệu hiện có không?

**A:** Không! Script chỉ:
- Tạo bảng mới (nếu chưa có)
- Tạo policies mới
- Tạo functions mới
- **KHÔNG xóa** dữ liệu hiện có

### Q: Tôi đã có bảng `profiles` với cấu trúc khác, phải làm sao?

**A:** Có 2 cách:
1. **Thêm cột thiếu:** Dùng `ALTER TABLE` để thêm các cột cần thiết
2. **Tạo bảng mới:** Tạo bảng với tên khác (ví dụ: `user_profiles`)

### Q: Tôi có thể rollback nếu có vấn đề không?

**A:** Có! Bạn có thể:
1. Xóa các bảng mới tạo (nếu cần)
2. Xóa policies mới tạo
3. Restore từ backup (nếu đã backup trước)

---

## 🎯 Tóm Tắt

✅ **KHÔNG cần tạo project mới**
✅ **KHÔNG cần xóa project hiện có**
✅ **Chỉ cần:**
   - Copy URL & Key từ project hiện có
   - Cập nhật `.env.local`
   - Chạy SQL script (an toàn, không xóa dữ liệu)
   - Test kết nối

**Bạn có thể yên tâm sử dụng project Supabase hiện có!** 🚀

---

*Nếu có bất kỳ vấn đề nào, hãy kiểm tra console logs hoặc tham khảo `AUTH_SYSTEM_SETUP_VI.md`*

