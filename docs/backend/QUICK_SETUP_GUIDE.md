# 🚀 QUICK SETUP GUIDE - Apply Schema & Storage

## 📋 TỔNG QUAN

Hướng dẫn nhanh để apply Supabase schema và setup storage buckets.

**Thời gian:** ~10-15 phút

---

## ✅ BƯỚC 1: APPLY CONTENT SCHEMA

### **1.1. Mở Supabase Dashboard**

1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Click **SQL Editor** (sidebar bên trái)

### **1.2. Copy SQL Script**

1. Mở file `docs/data/supabase_content_schema.sql`
2. Copy **TOÀN BỘ** nội dung (Ctrl+A, Ctrl+C)

### **1.3. Run Script**

1. Paste vào SQL Editor
2. Click **Run** (hoặc Ctrl+Enter)
3. Đợi script chạy xong (có thể mất 10-30 giây)

### **1.4. Verify Tables**

Chạy query này để verify:

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

## ✅ BƯỚC 2: SETUP STORAGE BUCKETS

### **2.1. Vào Storage**

1. Trong Supabase Dashboard
2. Click **Storage** (sidebar bên trái)

### **2.2. Tạo Bucket 1: `book-images`**

1. Click **New bucket**
2. **Name:** `book-images`
3. **Public bucket:** ✅ **BẬT** (toggle ON)
4. Click **Create bucket**
5. ✅ Verify bucket đã được tạo

### **2.3. Tạo Bucket 2: `audio-files`**

1. Click **New bucket**
2. **Name:** `audio-files`
3. **Public bucket:** ✅ **BẬT** (toggle ON)
4. Click **Create bucket**
5. ✅ Verify bucket đã được tạo

### **2.4. Tạo Bucket 3: `pdf-files`**

1. Click **New bucket**
2. **Name:** `pdf-files`
3. **Public bucket:** ✅ **BẬT** (toggle ON)
4. Click **Create bucket**
5. ✅ Verify bucket đã được tạo

---

## ✅ BƯỚC 3: SETUP RLS POLICIES (Storage)

### **3.1. Vào SQL Editor**

1. Click **SQL Editor** (sidebar)
2. Tạo query mới

### **3.2. Copy & Run RLS Policies Script**

Copy và run script sau:

```sql
-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Book Images: Public read, Admin write
CREATE POLICY "Public can read book images"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-images');

CREATE POLICY "Admins can upload book images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'book-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update book images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'book-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete book images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'book-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Audio Files: Public read, Admin write
CREATE POLICY "Public can read audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');

CREATE POLICY "Admins can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- PDF Files: Public read, Admin write
CREATE POLICY "Public can read PDF files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-files');

CREATE POLICY "Admins can upload PDF files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdf-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update PDF files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pdf-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete PDF files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdf-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### **3.3. Verify Policies**

Chạy query này để verify:

```sql
SELECT policyname, bucket_id
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY bucket_id, policyname;
```

**Kết quả mong đợi:** 12 policies (4 policies × 3 buckets)

✅ Nếu thấy 12 policies → **SUCCESS!**

---

## ✅ BƯỚC 4: VERIFY COMPLETE SETUP

### **4.1. Verify Tables**

```sql
-- Check tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
ORDER BY table_name;
```

### **4.2. Verify Buckets**

1. Vào **Storage** → **Buckets**
2. Verify có 3 buckets:
   - ✅ `book-images` (Public: Yes)
   - ✅ `audio-files` (Public: Yes)
   - ✅ `pdf-files` (Public: Yes)

### **4.3. Verify RLS**

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series');
```

**Kết quả:** Tất cả `rowsecurity = true`

---

## 🎯 CHECKLIST

- [ ] ✅ Applied content schema (5 tables created)
- [ ] ✅ Created `book-images` bucket (public)
- [ ] ✅ Created `audio-files` bucket (public)
- [ ] ✅ Created `pdf-files` bucket (public)
- [ ] ✅ Applied storage RLS policies (12 policies)
- [ ] ✅ Verified tables exist
- [ ] ✅ Verified buckets exist
- [ ] ✅ Verified RLS enabled

---

## 🚀 SAU KHI SETUP XONG

### **Test Upload:**

1. Vào app → Admin Panel → Content Management
2. Tạo Book mới
3. Upload image → Should upload to Supabase Storage
4. Save → Should save to Supabase

### **Test Load:**

1. Logout admin
2. Login với user khác (hoặc guest)
3. Vào Books page → Should load từ Supabase
4. Verify images hiển thị đúng

---

## ⚠️ TROUBLESHOOTING

### **Error: "relation already exists"**
- ✅ OK - Table đã tồn tại, script sẽ skip
- Có thể ignore warning này

### **Error: "policy already exists"**
- ✅ OK - Policy đã tồn tại
- Có thể drop và tạo lại nếu cần

### **Error: "bucket already exists"**
- ✅ OK - Bucket đã tồn tại
- Verify bucket settings (public: ON)

### **Upload fails: "Permission denied"**
- ⚠️ Check RLS policies đã được apply
- ⚠️ Check user có role = 'admin' trong profiles table

---

## 📞 SUPPORT

Nếu gặp lỗi:
1. Copy error message
2. Check Supabase logs
3. Verify user có role = 'admin'

---

**🎉 Sau khi setup xong, hệ thống đã sẵn sàng hoạt động trên internet!**

