# 📝 STEP-BY-STEP SETUP GUIDE

## 🎯 MỤC TIÊU

Setup Supabase để hệ thống có thể hoạt động trên internet.

**Thời gian:** ~15 phút

---

## ✅ BƯỚC 1: MỞ SUPABASE DASHBOARD

1. Vào https://supabase.com/dashboard
2. Login với tài khoản Supabase của bạn
3. Chọn project của bạn (hoặc tạo project mới nếu chưa có)

**✅ Checkpoint:** Bạn đã vào được Supabase Dashboard

---

## ✅ BƯỚC 2: APPLY CONTENT SCHEMA

### **2.1. Mở SQL Editor**

1. Trong Supabase Dashboard
2. Click **SQL Editor** (sidebar bên trái, icon giống terminal)
3. Click **New query** (nếu có)

### **2.2. Copy SQL Script**

1. Mở file `docs/backend/COMPLETE_SETUP_SCRIPT.sql` trong VS Code
2. Select tất cả (Ctrl+A)
3. Copy (Ctrl+C)

### **2.3. Paste và Run**

1. Paste vào SQL Editor (Ctrl+V)
2. Click nút **Run** (hoặc nhấn Ctrl+Enter)
3. Đợi script chạy xong (~10-30 giây)

**⚠️ Lưu ý:**
- Có thể có warnings về "policy already exists" → **OK, ignore**
- Có thể có warnings về "bucket does not exist" → **OK, sẽ tạo sau**

### **2.4. Verify Tables**

Trong SQL Editor, chạy query này:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
ORDER BY table_name;
```

**Kết quả mong đợi:**
```
books
chapters
lessons
quizzes
series
```

✅ Nếu thấy 5 tables → **SUCCESS!**

---

## ✅ BƯỚC 3: TẠO STORAGE BUCKETS

### **3.1. Vào Storage**

1. Trong Supabase Dashboard
2. Click **Storage** (sidebar bên trái, icon giống folder)

### **3.2. Tạo Bucket 1: `book-images`**

1. Click nút **New bucket** (góc trên bên phải)
2. **Name:** Nhập `book-images` (chính xác, không có khoảng trắng)
3. **Public bucket:** ✅ **BẬT** (toggle switch sang ON - màu xanh)
4. Click **Create bucket**
5. ✅ Verify bucket hiển thị trong danh sách

### **3.3. Tạo Bucket 2: `audio-files`**

1. Click **New bucket** lần nữa
2. **Name:** `audio-files`
3. **Public bucket:** ✅ **BẬT**
4. Click **Create bucket**
5. ✅ Verify bucket hiển thị

### **3.4. Tạo Bucket 3: `pdf-files`**

1. Click **New bucket** lần nữa
2. **Name:** `pdf-files`
3. **Public bucket:** ✅ **BẬT**
4. Click **Create bucket**
5. ✅ Verify bucket hiển thị

**✅ Checkpoint:** Bạn đã có 3 buckets trong Storage

---

## ✅ BƯỚC 4: VERIFY STORAGE POLICIES

Storage policies đã được apply trong `COMPLETE_SETUP_SCRIPT.sql` (Part 2).

Nếu khi chạy script buckets chưa tồn tại, policies có thể fail. Sau khi tạo buckets, verify:

### **4.1. Verify Policies**

Trong SQL Editor, chạy:

```sql
SELECT policyname, bucket_id
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY bucket_id, policyname;
```

**Kết quả mong đợi:** 12 policies (4 policies × 3 buckets)

Nếu không thấy đủ 12 policies, chạy lại **Part 2** của `COMPLETE_SETUP_SCRIPT.sql`:

1. Copy từ dòng `-- PART 2: STORAGE RLS POLICIES` đến cuối file
2. Paste vào SQL Editor
3. Run

---

## ✅ BƯỚC 5: RUN VERIFICATION SCRIPT

### **5.1. Copy Verification Script**

1. Mở file `docs/backend/VERIFICATION_SCRIPT.sql`
2. Copy toàn bộ nội dung

### **5.2. Run và Check Results**

1. Paste vào SQL Editor
2. Click **Run**
3. Xem kết quả trong **Messages** tab

**Kết quả mong đợi:**
- ✅ Tables: 5/5
- ✅ RLS Enabled: 5/5
- ✅ Triggers: 5/5
- ✅ Storage Policies: 12+

---

## ✅ BƯỚC 6: SETUP ADMIN USER

### **6.1. Check User Role**

Nếu bạn chưa có role = 'admin' trong profiles table:

1. Vào **Authentication** → **Users**
2. Copy **User ID** (UUID) của bạn
3. Vào SQL Editor, chạy:

```sql
-- Replace YOUR_USER_ID với UUID của bạn
INSERT INTO profiles (user_id, role, display_name)
VALUES ('YOUR_USER_ID', 'admin', 'Admin User')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### **6.2. Verify**

```sql
SELECT user_id, role, display_name 
FROM profiles 
WHERE role = 'admin';
```

✅ Nếu thấy user của bạn → **SUCCESS!**

---

## ✅ BƯỚC 7: TEST TRONG APP

### **7.1. Test Upload Image**

1. Mở app (local hoặc production)
2. Login với admin account (Supabase)
3. Vào **Admin Panel** → **Content Management**
4. Tạo Book mới
5. Click **Upload Image**
6. Chọn file image
7. ✅ Verify upload thành công
8. ✅ Verify image URL là Supabase Storage URL (format: `https://[project].supabase.co/storage/v1/object/public/book-images/...`)

### **7.2. Test Save Content**

1. Tạo Book → Click **Save**
2. Tạo Chapter → Click **Save**
3. Tạo Lesson → Click **Save**
4. Tạo Quiz → Click **Save**
5. ✅ Verify không có lỗi

**Verify trong Supabase:**
```sql
SELECT * FROM books LIMIT 1;
SELECT * FROM chapters LIMIT 1;
SELECT * FROM lessons LIMIT 1;
SELECT * FROM quizzes LIMIT 1;
```

✅ Nếu thấy data → **SUCCESS!**

### **7.3. Test User Load**

1. Logout admin
2. Login với user khác (hoặc guest)
3. Vào **Books** page
4. ✅ Verify books load từ Supabase
5. ✅ Verify images hiển thị đúng

---

## 🎉 HOÀN THÀNH!

Nếu tất cả tests đều pass → **Hệ thống đã sẵn sàng production!**

---

## ⚠️ TROUBLESHOOTING

### **Error: "relation does not exist"**
- ⚠️ Schema chưa được apply
- ✅ Solution: Chạy lại `COMPLETE_SETUP_SCRIPT.sql`

### **Error: "permission denied"**
- ⚠️ User chưa có role = 'admin'
- ✅ Solution: Setup admin user (Bước 6)

### **Error: "bucket does not exist"**
- ⚠️ Buckets chưa được tạo
- ✅ Solution: Tạo buckets (Bước 3)

### **Upload fails: "403 Forbidden"**
- ⚠️ Storage policies chưa được apply
- ✅ Solution: Chạy lại Part 2 của `COMPLETE_SETUP_SCRIPT.sql`

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check Supabase logs
2. Check browser console
3. Verify user có role = 'admin'
4. Verify buckets đã PUBLIC

---

**Good luck! 🚀**

