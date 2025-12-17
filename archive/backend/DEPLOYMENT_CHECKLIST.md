# ✅ DEPLOYMENT CHECKLIST

## 📋 TRƯỚC KHI TRIỂN KHAI

- [ ] ✅ Code đã được commit và push lên GitHub
- [ ] ✅ Environment variables đã được setup trong Netlify/Vercel
- [ ] ✅ Supabase project đã được tạo
- [ ] ✅ Supabase URL và Anon Key đã có

---

## 🔧 SETUP SUPABASE

### **Step 1: Apply Content Schema**

- [ ] ✅ Mở Supabase Dashboard → SQL Editor
- [ ] ✅ Copy toàn bộ `docs/backend/COMPLETE_SETUP_SCRIPT.sql`
- [ ] ✅ Paste vào SQL Editor
- [ ] ✅ Click **Run**
- [ ] ✅ Verify không có lỗi (có thể có warnings về policies đã tồn tại - OK)

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('books', 'chapters', 'lessons', 'quizzes', 'series');
```
**Expected:** 5 rows

---

### **Step 2: Create Storage Buckets**

- [ ] ✅ Vào **Storage** → **Buckets**
- [ ] ✅ Tạo bucket `book-images` (Public: ON)
- [ ] ✅ Tạo bucket `audio-files` (Public: ON)
- [ ] ✅ Tạo bucket `pdf-files` (Public: ON)

**Verify:** 3 buckets hiển thị trong Storage → Buckets

---

### **Step 3: Verify Storage Policies**

Storage policies đã được apply trong `COMPLETE_SETUP_SCRIPT.sql` (Part 2).

Nếu buckets chưa tạo khi chạy script, policies sẽ fail. Sau khi tạo buckets, verify:

```sql
SELECT policyname, bucket_id
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';
```

**Expected:** 12 policies (4 policies × 3 buckets)

---

### **Step 4: Run Verification Script**

- [ ] ✅ Copy `docs/backend/VERIFICATION_SCRIPT.sql`
- [ ] ✅ Paste vào SQL Editor
- [ ] ✅ Click **Run**
- [ ] ✅ Verify tất cả checks đều PASS

---

## 🧪 TEST TRONG APP

### **Test 1: Admin Upload Image**

- [ ] ✅ Login với admin account (Supabase)
- [ ] ✅ Vào Content Management
- [ ] ✅ Tạo Book mới
- [ ] ✅ Upload image
- [ ] ✅ Verify image upload thành công
- [ ] ✅ Verify image URL là Supabase Storage URL

**Expected:** Image URL format: `https://[project].supabase.co/storage/v1/object/public/book-images/...`

---

### **Test 2: Admin Save Content**

- [ ] ✅ Tạo Book → Save
- [ ] ✅ Tạo Chapter → Save
- [ ] ✅ Tạo Lesson → Save
- [ ] ✅ Tạo Quiz → Save
- [ ] ✅ Verify không có lỗi

**Verify trong Supabase:**
```sql
SELECT * FROM books LIMIT 1;
SELECT * FROM chapters LIMIT 1;
SELECT * FROM lessons LIMIT 1;
SELECT * FROM quizzes LIMIT 1;
```

---

### **Test 3: User Load Content**

- [ ] ✅ Logout admin
- [ ] ✅ Login với user khác (hoặc guest)
- [ ] ✅ Vào Books page
- [ ] ✅ Verify books load từ Supabase
- [ ] ✅ Verify images hiển thị đúng

**Expected:** Content load từ Supabase, không phải từ IndexedDB/localStorage

---

### **Test 4: Multi-device Sync**

- [ ] ✅ Login trên Device 1
- [ ] ✅ Tạo content trên Device 1
- [ ] ✅ Login trên Device 2
- [ ] ✅ Verify content hiển thị trên Device 2

**Expected:** Content sync tự động giữa các devices

---

## 📊 VERIFICATION QUERIES

### **Check Content Tables:**

```sql
-- Count records
SELECT 
  'books' as table_name, COUNT(*) as count FROM books
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'series', COUNT(*) FROM series;
```

### **Check Storage Files:**

```sql
-- Count files in buckets
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_size_bytes
FROM storage.objects
WHERE bucket_id IN ('book-images', 'audio-files', 'pdf-files')
GROUP BY bucket_id;
```

---

## ⚠️ TROUBLESHOOTING

### **Issue: Upload fails với "Permission denied"**

**Solution:**
1. Check user có role = 'admin' trong profiles table:
```sql
SELECT * FROM profiles WHERE user_id = auth.uid();
```
2. Nếu không có → Insert:
```sql
INSERT INTO profiles (user_id, role, display_name)
VALUES (auth.uid(), 'admin', 'Admin User')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

---

### **Issue: Content không load từ Supabase**

**Solution:**
1. Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'books';
```
2. Verify policies có `USING (true)` cho SELECT
3. Check browser console for errors

---

### **Issue: Storage upload fails**

**Solution:**
1. Verify buckets đã được tạo và PUBLIC
2. Check storage policies:
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```
3. Verify user có role = 'admin'

---

## ✅ FINAL CHECKLIST

- [ ] ✅ Content schema applied
- [ ] ✅ Storage buckets created
- [ ] ✅ Storage policies applied
- [ ] ✅ Verification script passed
- [ ] ✅ Admin can upload images
- [ ] ✅ Admin can save content
- [ ] ✅ User can load content
- [ ] ✅ Multi-device sync works
- [ ] ✅ No errors in console
- [ ] ✅ Production ready!

---

## 🎉 DEPLOYMENT COMPLETE!

Sau khi hoàn thành tất cả checklist items, hệ thống đã sẵn sàng production!

**Next Steps:**
1. Monitor Supabase usage
2. Check storage quotas
3. Monitor error logs
4. Collect user feedback

---

**Good luck! 🚀**

