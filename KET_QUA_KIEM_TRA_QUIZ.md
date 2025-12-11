# Kết Quả Kiểm Tra: Quiz Lưu và Load Từ Supabase

## Tóm Tắt

Đã kiểm tra toàn bộ flow lưu và load quiz từ Supabase. Code đã được implement đúng, nhưng cần verify các điều kiện sau:

## ✅ Code Implementation - ĐÃ ĐÚNG

### 1. Admin Save Quiz (QuizEditorPage → Supabase)

**Flow:**
```
QuizEditorPage.handleSaveOnly()
  ↓
storageManager.saveQuiz(bookId, chapterId, lessonId, quizData, level, userId)
  ↓
contentService.saveQuiz(quiz, userId)
  ↓
Supabase.quizzes.upsert()
```

**Code đã implement:**
- ✅ `handleSaveOnly()` có validation `selectedLevel` và `userId`
- ✅ Có fallback lấy `userId` từ session nếu `user.id` không có
- ✅ `storageManager.saveQuiz()` gọi `contentService.saveQuiz()` khi có `level` và `userId`
- ✅ `contentService.saveQuiz()` transform data và upsert vào Supabase
- ✅ Có logging đầy đủ để debug

**File liên quan:**
- `src/pages/admin/QuizEditorPage.jsx` (dòng 829-971)
- `src/utils/localStorageManager.js` (dòng 741-839)
- `src/services/contentService.js` (dòng 337-394)

### 2. User Load Quiz (QuizPage → Supabase)

**Flow:**
```
QuizPage (useEffect)
  ↓
storageManager.getQuiz(bookId, chapterId, lessonId, level)
  ↓
contentService.getQuiz(bookId, chapterId, lessonId, level)
  ↓
Supabase.quizzes.select() WHERE book_id, chapter_id, lesson_id, level
```

**Code đã implement:**
- ✅ `storageManager.getQuiz()` load từ Supabase trước nếu có `level`
- ✅ `contentService.getQuiz()` transform data từ Supabase format về app format
- ✅ `QuizPage` transform questions format từ QuizEditor format về QuizPage format
- ✅ Có fallback về IndexedDB/localStorage nếu Supabase không có data
- ✅ Có logging đầy đủ để debug

**File liên quan:**
- `src/features/books/pages/QuizPage.jsx` (dòng 108-157)
- `src/utils/localStorageManager.js` (dòng 661-739)
- `src/services/contentService.js` (dòng 404-454)

## ⚠️ Điều Kiện Cần Kiểm Tra

### 1. RLS Policies

**Phải có 2 policies:**

1. **"Anyone can read quizzes"** (SELECT)
   - Cho phép tất cả users (kể cả anonymous) đọc quizzes
   - File: `fix_quizzes_rls_for_anonymous.sql`

2. **"Admins can manage quizzes"** (ALL)
   - Chỉ admin mới có thể INSERT/UPDATE/DELETE
   - File: `fix_quizzes_rls_for_anonymous.sql`

**Kiểm tra:**
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'quizzes';
```

**Nếu thiếu:**
- Chạy script: `fix_quizzes_rls_for_anonymous.sql`

### 2. User Role

**User phải có `role = 'admin'` trong bảng `profiles`**

**Kiểm tra:**
```sql
SELECT user_id, role, email
FROM profiles
WHERE user_id = 'YOUR_USER_ID';
```

**Nếu không phải admin:**
- Chạy script: `update_user_role_to_admin.sql`

### 3. Level Selection

**Trong QuizEditorPage:**
- Dropdown level phải được chọn (không được để trống)
- `selectedLevel` phải có giá trị (n1, n2, n3, n4, n5)

**Trong QuizPage:**
- `levelId` phải được truyền vào `getQuiz()`

## 🔍 Cách Kiểm Tra

### Test 1: Admin Save Quiz

1. Đăng nhập với tài khoản admin
2. Vào QuizEditorPage
3. Chọn Level: n5
4. Chọn Book, Chapter, Lesson
5. Tạo quiz với ít nhất 1 câu hỏi
6. Click "Save"
7. Mở Console (F12) và kiểm tra logs:
   - ✅ `[QuizEditor] 📋 Save validation: { selectedLevel: "n5", userId: "..." }`
   - ✅ `[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...`
   - ✅ `[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase`
8. Kiểm tra Supabase:
   - Vào Table Editor → quizzes
   - Hoặc chạy SQL: `SELECT * FROM quizzes WHERE level = 'n5' ORDER BY updated_at DESC LIMIT 1;`

### Test 2: User Load Quiz

1. Mở trình duyệt mới (hoặc incognito mode)
2. Truy cập QuizPage với cùng bookId, chapterId, lessonId, level
3. Mở Console (F12) và kiểm tra logs:
   - ✅ `[StorageManager.getQuiz] 🔍 Loading quiz for: { level: "n5" }`
   - ✅ `[StorageManager.getQuiz] ✅ Loaded quiz from Supabase`
4. Kiểm tra UI:
   - Quiz hiển thị đúng title
   - Questions hiển thị đúng

### Test 3: Anonymous User Load Quiz

1. Mở incognito mode (không đăng nhập)
2. Truy cập QuizPage
3. Kiểm tra Console:
   - ✅ Không có RLS error
   - ✅ Quiz được load từ Supabase
   - ✅ Quiz hiển thị trong UI

## 📋 Checklist Hoàn Chỉnh

### Trước Khi Test

- [ ] RLS policies đã được setup (chạy `fix_quizzes_rls_for_anonymous.sql`)
- [ ] User có role = 'admin' (chạy `update_user_role_to_admin.sql` nếu cần)
- [ ] Supabase connection đã được config đúng

### Khi Test Admin Save

- [ ] `selectedLevel` có giá trị (n1, n2, n3, n4, n5)
- [ ] `userId` có giá trị (user đã đăng nhập)
- [ ] Console log: `[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...`
- [ ] Console log: `[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase`
- [ ] Quiz có trong Supabase (kiểm tra Table Editor hoặc SQL query)

### Khi Test User Load

- [ ] `level` được truyền vào `getQuiz()`
- [ ] Console log: `[StorageManager.getQuiz] 🔍 Loading quiz for: { level: "..." }`
- [ ] Console log: `[StorageManager.getQuiz] ✅ Loaded quiz from Supabase`
- [ ] Quiz hiển thị trong UI đúng

### Khi Test Anonymous User

- [ ] Không có RLS error trong Console
- [ ] Quiz được load từ Supabase
- [ ] Quiz hiển thị trong UI

## 🐛 Vấn Đề Thường Gặp

### Vấn đề 1: Quiz không được lưu vào Supabase

**Triệu chứng:**
- Console: `[StorageManager.saveQuiz] ⚠️ No level provided` hoặc `⚠️ No userId provided`

**Giải pháp:**
1. Kiểm tra dropdown level trong QuizEditorPage
2. Đăng nhập lại và kiểm tra `user.id` trong AuthContext

### Vấn đề 2: RLS Policy Error (42501)

**Triệu chứng:**
- Console: `[ContentService.saveQuiz] ❌ Error code: 42501`

**Giải pháp:**
1. Kiểm tra user role: `SELECT role FROM profiles WHERE user_id = '...'`
2. Cập nhật role: Chạy `update_user_role_to_admin.sql`
3. Kiểm tra RLS policies: Chạy query trong file `KIEM_TRA_QUIZ_SUPABASE.md`

### Vấn đề 3: Quiz không được load từ Supabase

**Triệu chứng:**
- Console: `[StorageManager.getQuiz] ℹ️ Quiz not found in Supabase`

**Giải pháp:**
1. Kiểm tra quiz có trong Supabase không
2. Kiểm tra `level` có được truyền vào `getQuiz()` không
3. Kiểm tra RLS policy "Anyone can read quizzes"

## 📝 Kết Luận

**Code đã được implement đúng và đầy đủ.** 

Để đảm bảo hệ thống hoạt động:

1. ✅ **Setup RLS policies** - Chạy `fix_quizzes_rls_for_anonymous.sql`
2. ✅ **Setup user role** - Đảm bảo user có `role = 'admin'`
3. ✅ **Test flow** - Thực hiện các test cases trong file `KIEM_TRA_QUIZ_SUPABASE.md`

Nếu vẫn gặp vấn đề sau khi thực hiện các bước trên, vui lòng:
- Cung cấp Console logs khi save quiz
- Cung cấp Console logs khi load quiz
- Cung cấp kết quả SQL queries kiểm tra
- Screenshot của Supabase dashboard

