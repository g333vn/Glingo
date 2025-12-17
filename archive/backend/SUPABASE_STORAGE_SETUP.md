# 📦 SUPABASE STORAGE SETUP GUIDE

## 🎯 Mục đích

Setup Supabase Storage để lưu trữ files (images, audio, PDFs) cho hệ thống eLearning.

---

## 📋 BƯỚC 1: TẠO STORAGE BUCKETS

### **1.1. Vào Supabase Dashboard**

1. Mở https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Storage** (sidebar bên trái)

### **1.2. Tạo Buckets**

Tạo 3 buckets sau:

#### **Bucket 1: `book-images`**
- **Name:** `book-images`
- **Public:** ✅ **YES** (để user có thể xem images)
- **File size limit:** 5 MB (hoặc lớn hơn nếu cần)
- **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif`

#### **Bucket 2: `audio-files`**
- **Name:** `audio-files`
- **Public:** ✅ **YES**
- **File size limit:** 10 MB (hoặc lớn hơn)
- **Allowed MIME types:** `audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/mp4`

#### **Bucket 3: `pdf-files`**
- **Name:** `pdf-files`
- **Public:** ✅ **YES**
- **File size limit:** 20 MB (hoặc lớn hơn)
- **Allowed MIME types:** `application/pdf`

---

## 🔒 BƯỚC 2: SETUP RLS POLICIES

### **2.1. Public Read Policy (cho tất cả buckets)**

Vào **Storage** → **Policies** → Chọn bucket → **New Policy**

**Policy cho `book-images`:**
```sql
-- Allow public read
CREATE POLICY "Public can read book images"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-images');
```

**Policy cho `audio-files`:**
```sql
-- Allow public read
CREATE POLICY "Public can read audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');
```

**Policy cho `pdf-files`:**
```sql
-- Allow public read
CREATE POLICY "Public can read PDF files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-files');
```

### **2.2. Admin Write Policy (cho tất cả buckets)**

**Policy cho `book-images`:**
```sql
-- Allow admins to upload
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

-- Allow admins to update
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

-- Allow admins to delete
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
```

**Lặp lại cho `audio-files` và `pdf-files`** (thay `book-images` bằng tên bucket tương ứng)

---

## ✅ VERIFICATION

Sau khi setup xong, verify:

1. ✅ Buckets đã được tạo
2. ✅ RLS policies đã được apply
3. ✅ Public read hoạt động
4. ✅ Admin write hoạt động

---

## 📝 NOTES

- **Public buckets:** User không cần đăng nhập để xem files
- **Admin only write:** Chỉ admin mới có thể upload/update/delete
- **File size limits:** Có thể điều chỉnh theo nhu cầu
- **CDN URLs:** Supabase tự động cung cấp CDN URLs cho public files

---

**Sau khi setup xong, tiếp tục với `fileUploadService.js` implementation!**

