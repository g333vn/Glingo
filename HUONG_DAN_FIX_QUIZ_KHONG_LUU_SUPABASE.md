# Hướng Dẫn Fix: Quiz Không Được Lưu Lên Supabase

## Vấn Đề
- Quiz được tạo và lưu thành công (có thể thấy trong local storage)
- Nhưng không có trong Supabase
- Truy cập từ thiết bị khác không thấy quiz

## Giải Pháp Nhanh

### Bước 1: Kiểm Tra Console Log

1. Mở **Developer Tools** (F12) → **Console**
2. Tạo/save quiz mới
3. Tìm các log sau:

#### ❌ Nếu thấy log này → `level` hoặc `userId` là NULL:
```
[StorageManager.saveQuiz] ⚠️ No level provided - quiz will NOT be saved to Supabase
[StorageManager.saveQuiz] ⚠️ No userId provided - quiz will NOT be saved to Supabase
```

**Giải pháp:**
- Kiểm tra dropdown **Level** có được chọn không (phải chọn n1, n2, n3, n4, hoặc n5)
- Kiểm tra user có đăng nhập không
- Đăng nhập lại nếu cần

#### ❌ Nếu thấy log này → RLS Policy Error:
```
[ContentService.saveQuiz] ❌ Error code: 42501
```

**Giải pháp:**
- Xem Bước 2 và Bước 3

### Bước 2: Kiểm Tra User Role

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy query (thay `YOUR_USER_ID` bằng user ID của bạn - lấy từ Console log):

```sql
SELECT user_id, role, email
FROM profiles
WHERE user_id = 'YOUR_USER_ID_HERE';
```

**Nếu `role` không phải `'admin'`:**
- Chạy script: `update_user_role_to_admin.sql`
- Hoặc chạy query:

```sql
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Bước 3: Kiểm Tra RLS Policies

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy query:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'quizzes'
ORDER BY policyname;
```

**Phải có 2 policies:**

1. **"Anyone can read quizzes"** (SELECT)
2. **"Admins can manage quizzes"** (ALL)

**Nếu thiếu:**
- Chạy script: `fix_quizzes_rls_for_anonymous.sql`

### Bước 4: Test Save Trực Tiếp

1. Mở **Developer Tools** (F12) → **Console**
2. Copy và paste script từ file `test_quiz_save_to_supabase.js`
3. Nhấn Enter để chạy
4. Script sẽ:
   - Kiểm tra user đã đăng nhập chưa
   - Kiểm tra user có role = 'admin' không
   - Test save quiz trực tiếp lên Supabase
   - Hiển thị kết quả chi tiết

**Nếu test thành công:**
- Vấn đề là với code save quiz trong app
- Kiểm tra lại Console logs khi save quiz trong app
- Đảm bảo `selectedLevel` và `userId` được truyền đúng

**Nếu test fail:**
- Vấn đề là với RLS policies hoặc user role
- Làm theo Bước 2 và Bước 3

## Checklist

Sau khi thực hiện các bước trên, kiểm tra:

- [ ] Console log: `[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...`
- [ ] Console log: `[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase`
- [ ] `selectedLevel` có giá trị (n1, n2, n3, n4, n5) - **QUAN TRỌNG!**
- [ ] `userId` có giá trị (không phải NULL) - **QUAN TRỌNG!**
- [ ] User có role = 'admin' trong profiles table
- [ ] RLS policy "Admins can manage quizzes" tồn tại
- [ ] Quiz có trong Supabase (kiểm tra Table Editor hoặc SQL query)
- [ ] Test save trực tiếp thành công

## Lưu Ý Quan Trọng

### 1. Level Phải Được Chọn

**Trong QuizEditorPage:**
- Dropdown **Level** phải được chọn (không được để trống)
- Phải chọn một trong: n1, n2, n3, n4, n5

**Nếu không chọn Level:**
- Quiz sẽ chỉ lưu vào local storage
- Không được lưu lên Supabase
- Không hiển thị trên thiết bị khác

### 2. User Phải Đăng Nhập

**User phải đăng nhập với tài khoản có role = 'admin':**
- Nếu không đăng nhập → `userId` = NULL → Quiz không lưu lên Supabase
- Nếu không phải admin → RLS policy error → Quiz không lưu lên Supabase

### 3. RLS Policies Phải Được Setup

**Phải có 2 policies:**
1. "Anyone can read quizzes" - Cho phép tất cả users đọc
2. "Admins can manage quizzes" - Chỉ admin mới có thể write

**Nếu thiếu:**
- Chạy script: `fix_quizzes_rls_for_anonymous.sql`

## Kết Luận

Sau khi thực hiện các bước trên:

1. ✅ Nếu thấy log `[StorageManager.saveQuiz] ⚠️ No level provided` → **Chọn Level trong dropdown**
2. ✅ Nếu thấy log `[StorageManager.saveQuiz] ⚠️ No userId provided` → **Đăng nhập lại**
3. ✅ Nếu thấy error code `42501` → **Kiểm tra user role và RLS policies**
4. ✅ Nếu test save trực tiếp thành công → **Vấn đề là với code save quiz trong app**

## Liên Hệ Hỗ Trợ

Nếu vẫn gặp vấn đề sau khi thực hiện các bước trên, vui lòng cung cấp:

1. Console logs khi save quiz (copy toàn bộ)
2. Kết quả của test save trực tiếp (từ script `test_quiz_save_to_supabase.js`)
3. Kết quả của SQL query kiểm tra RLS policies
4. Kết quả của SQL query kiểm tra user role
5. Screenshot của Supabase dashboard (Table Editor → quizzes)

