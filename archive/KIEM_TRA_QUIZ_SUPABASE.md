# Kiểm Tra: Quiz Lưu và Load Từ Supabase

## Mục tiêu
Kiểm tra xem:
1. ✅ Admin khi thêm quiz trong QuizEditorPage → Quiz được lưu lên Supabase
2. ✅ Người dùng khi truy cập hệ thống → Quiz được load từ Supabase

## Flow Hoạt Động

### 1. Admin Save Quiz (QuizEditorPage → Supabase)

```
QuizEditorPage.handleSaveOnly()
  ↓
storageManager.saveQuiz(bookId, chapterId, lessonId, quizData, level, userId)
  ↓
contentService.saveQuiz(quiz, userId)
  ↓
Supabase.quizzes.upsert()
```

**Điều kiện cần:**
- ✅ `selectedLevel` phải có giá trị (n1, n2, n3, n4, n5)
- ✅ `userId` phải có giá trị (user đã đăng nhập)
- ✅ User phải có `role = 'admin'` trong bảng `profiles`
- ✅ RLS policy "Admins can manage quizzes" phải tồn tại

### 2. User Load Quiz (QuizPage → Supabase)

```
QuizPage (useEffect)
  ↓
storageManager.getQuiz(bookId, chapterId, lessonId, level)
  ↓
contentService.getQuiz(bookId, chapterId, lessonId, level)
  ↓
Supabase.quizzes.select() WHERE book_id, chapter_id, lesson_id, level
```

**Điều kiện cần:**
- ✅ `level` phải có giá trị
- ✅ RLS policy "Anyone can read quizzes" phải tồn tại (cho phép anonymous users)

## Checklist Kiểm Tra

### Bước 1: Kiểm Tra Console Log Khi Admin Save Quiz

1. Mở **Developer Tools** (F12) → **Console**
2. Đăng nhập với tài khoản admin
3. Vào **QuizEditorPage** và tạo/save quiz mới
4. Tìm các log sau:

#### ✅ Log 1: QuizEditor Validation
```
[QuizEditor] 📋 Save validation: {
  selectedLevel: "n5",  // ✅ Phải có giá trị
  userId: "abc12345...",  // ✅ Phải có giá trị (không phải NULL)
  selectedBook: "...",
  selectedChapter: "...",
  finalLessonId: "..."
}
```

**Nếu `selectedLevel` là NULL hoặc empty:**
- ❌ Vấn đề: Level không được chọn trong UI
- 🔧 Giải pháp: Kiểm tra dropdown level trong QuizEditorPage

**Nếu `userId` là NULL:**
- ❌ Vấn đề: User chưa đăng nhập hoặc session không có
- 🔧 Giải pháp: Đăng nhập lại và kiểm tra AuthContext

#### ✅ Log 2: StorageManager Save
```
[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...
[StorageManager.saveQuiz]   - level: n5  // ✅ Phải có giá trị
[StorageManager.saveQuiz]   - userId: abc12345...  // ✅ Phải có giá trị
```

**Nếu không thấy log này:**
- ❌ Vấn đề: `level` hoặc `userId` là null/undefined
- 🔧 Giải pháp: Kiểm tra lại Bước 1

#### ✅ Log 3: ContentService Save
```
[ContentService.saveQuiz] 🔍 Attempting to save quiz: {
  level: "n5",  // ✅ Phải có giá trị
  userId: "abc12345..."  // ✅ Phải có giá trị
}
[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase
```

**Nếu có error:**
```
[ContentService.saveQuiz] ❌ Error saving quiz: {...}
[ContentService.saveQuiz] ❌ Error code: 42501  // RLS policy error
```

**Các error code thường gặp:**
- `42501`: RLS policy chặn insert (user không phải admin)
- `23505`: Unique constraint violation (quiz đã tồn tại)
- `23503`: Foreign key violation (book/chapter/lesson không tồn tại)

### Bước 2: Kiểm Tra Quiz Trong Supabase

1. Mở **Supabase Dashboard** → **Table Editor** → **quizzes**
2. Hoặc chạy SQL query:

```sql
-- Kiểm tra quiz mới nhất
SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title,
  jsonb_array_length(questions) as questions_count,
  created_at,
  updated_at,
  created_by
FROM public.quizzes
ORDER BY updated_at DESC
LIMIT 10;
```

**Nếu không thấy quiz:**
- ❌ Vấn đề: Quiz không được lưu vào Supabase
- 🔧 Giải pháp: Kiểm tra error logs trong Console (Bước 1)

### Bước 3: Kiểm Tra RLS Policies

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy query:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'quizzes'
ORDER BY policyname;
```

**Phải có 2 policies:**

1. **"Anyone can read quizzes"** (SELECT)
   - Cho phép tất cả users (kể cả anonymous) đọc quizzes
   - `cmd` = 'SELECT'
   - `qual` = 'true' hoặc tương tự

2. **"Admins can manage quizzes"** (ALL)
   - Chỉ admin mới có thể INSERT/UPDATE/DELETE
   - `cmd` = 'ALL'
   - `qual` và `with_check` phải check `profiles.role = 'admin'`

**Nếu thiếu policies:**
- 🔧 Giải pháp: Chạy script `fix_quizzes_rls_for_anonymous.sql`

### Bước 4: Kiểm Tra User Role

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy query (thay `YOUR_USER_ID` bằng user ID của bạn):

```sql
SELECT 
  user_id,
  role,
  email,
  created_at
FROM profiles
WHERE user_id = 'YOUR_USER_ID_HERE';
```

**Phải có:**
- ✅ `role` = 'admin'
- ✅ `user_id` khớp với userId trong Console log

**Nếu role không phải 'admin':**
- 🔧 Giải pháp: Chạy script `update_user_role_to_admin.sql`

### Bước 5: Kiểm Tra User Load Quiz

1. Mở **Developer Tools** (F12) → **Console**
2. Truy cập QuizPage (có thể dùng incognito mode để test anonymous user)
3. Tìm các log sau:

#### ✅ Log 1: StorageManager Load
```
[StorageManager.getQuiz] 🔍 Loading quiz for: {
  bookId: "...",
  chapterId: "...",
  lessonId: "...",
  level: "n5"  // ✅ Phải có giá trị
}
```

**Nếu `level` là NULL:**
- ❌ Vấn đề: Level không được truyền từ QuizPage
- 🔧 Giải pháp: Kiểm tra QuizPage có truyền `levelId` vào `getQuiz()` không

#### ✅ Log 2: ContentService Load
```
[ContentService.getQuiz] 🔍 Loading quiz from Supabase...
[StorageManager.getQuiz] ✅ Loaded quiz from Supabase: {
  id: "...",
  title: "...",
  questionsCount: 5
}
```

**Nếu có error:**
```
[ContentService] RLS/permission error (may be anonymous user): ...
```

**Nếu không thấy quiz:**
```
[StorageManager.getQuiz] ℹ️ Quiz not found in Supabase, will try local caches
```

**Các trường hợp:**
- ✅ Quiz có trong Supabase → Load từ Supabase
- ❌ Quiz không có trong Supabase → Fallback về IndexedDB/localStorage
- ❌ RLS error → Fallback về IndexedDB/localStorage

## Test Case

### Test 1: Admin Save Quiz → Supabase

1. ✅ Đăng nhập với tài khoản admin
2. ✅ Vào QuizEditorPage
3. ✅ Chọn Level: n5
4. ✅ Chọn Book, Chapter, Lesson
5. ✅ Tạo quiz với ít nhất 1 câu hỏi
6. ✅ Click "Save"
7. ✅ Kiểm tra Console log:
   - `selectedLevel` = "n5" ✅
   - `userId` có giá trị ✅
   - `[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...` ✅
   - `[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase` ✅
8. ✅ Kiểm tra Supabase:
   - Quiz có trong bảng `quizzes` ✅
   - `level` = 'n5' ✅
   - `created_by` = userId của admin ✅

### Test 2: User Load Quiz Từ Supabase

1. ✅ Mở trình duyệt mới (hoặc incognito mode)
2. ✅ Truy cập QuizPage với cùng bookId, chapterId, lessonId, level
3. ✅ Kiểm tra Console log:
   - `[StorageManager.getQuiz] 🔍 Loading quiz for: { level: "n5" }` ✅
   - `[ContentService.getQuiz] 🔍 Loading quiz from Supabase...` ✅
   - `[StorageManager.getQuiz] ✅ Loaded quiz from Supabase` ✅
4. ✅ Kiểm tra UI:
   - Quiz hiển thị đúng title ✅
   - Questions hiển thị đúng ✅

### Test 3: Anonymous User Load Quiz

1. ✅ Mở incognito mode (không đăng nhập)
2. ✅ Truy cập QuizPage
3. ✅ Kiểm tra Console log:
   - Không có RLS error ✅
   - Quiz được load từ Supabase ✅
   - Quiz hiển thị trong UI ✅

## Vấn Đề Thường Gặp

### Vấn đề 1: Quiz không được lưu vào Supabase

**Triệu chứng:**
- Console log: `[StorageManager.saveQuiz] ⚠️ No level provided` hoặc `⚠️ No userId provided`
- Quiz chỉ có trong IndexedDB/localStorage

**Nguyên nhân:**
- `selectedLevel` không được chọn trong UI
- User chưa đăng nhập hoặc `userId` là NULL

**Giải pháp:**
1. Kiểm tra dropdown level trong QuizEditorPage
2. Đăng nhập lại và kiểm tra `user.id` trong AuthContext
3. Kiểm tra Console log để xem `userId` có giá trị không

### Vấn đề 2: RLS Policy Error (42501)

**Triệu chứng:**
- Console log: `[ContentService.saveQuiz] ❌ Error code: 42501`
- Error message: "permission denied" hoặc "row-level security"

**Nguyên nhân:**
- User không có role = 'admin' trong bảng `profiles`
- RLS policy "Admins can manage quizzes" không tồn tại hoặc sai

**Giải pháp:**
1. Kiểm tra user role: `SELECT role FROM profiles WHERE user_id = '...'`
2. Cập nhật role: Chạy `update_user_role_to_admin.sql`
3. Kiểm tra RLS policies: Chạy query trong Bước 3
4. Sửa RLS policies: Chạy `fix_quizzes_rls_for_anonymous.sql`

### Vấn đề 3: Quiz không được load từ Supabase

**Triệu chứng:**
- Console log: `[StorageManager.getQuiz] ℹ️ Quiz not found in Supabase`
- Quiz chỉ load từ IndexedDB/localStorage

**Nguyên nhân:**
- Quiz không có trong Supabase (chưa được lưu)
- `level` không được truyền vào `getQuiz()`
- RLS policy không cho phép anonymous users đọc

**Giải pháp:**
1. Kiểm tra quiz có trong Supabase không (Bước 2)
2. Kiểm tra `level` có được truyền vào `getQuiz()` không
3. Kiểm tra RLS policy "Anyone can read quizzes" (Bước 3)

### Vấn đề 4: Format Data Không Khớp

**Triệu chứng:**
- Quiz được load nhưng questions không hiển thị đúng
- Console log: `🔄 Transformed quiz format from QuizEditor to QuizPage`

**Nguyên nhân:**
- Format khi save khác với format khi load
- QuizEditorPage save: `{ question, correctAnswer }`
- QuizPage expect: `{ text, correct }`

**Giải pháp:**
- Code đã có transform logic trong QuizPage (dòng 128-156)
- Kiểm tra xem transform có hoạt động đúng không

## Script SQL Kiểm Tra

### 1. Kiểm Tra Quiz Trong Supabase
```sql
-- Xem tất cả quizzes
SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title,
  jsonb_array_length(questions) as questions_count,
  created_at,
  updated_at
FROM public.quizzes
ORDER BY updated_at DESC;
```

### 2. Kiểm Tra Quiz Cụ Thể
```sql
-- Thay các giá trị này
SELECT * FROM public.quizzes
WHERE level = 'n5'
  AND book_id = 'mina-1'
  AND chapter_id = 'chapter-1'
  AND lesson_id = 'chapter-1';
```

### 3. Kiểm Tra RLS Policies
```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'quizzes';
```

### 4. Kiểm Tra User Role
```sql
-- Thay YOUR_USER_ID
SELECT user_id, role, email
FROM profiles
WHERE user_id = 'YOUR_USER_ID';
```

## Kết Luận

Sau khi thực hiện các bước kiểm tra trên, bạn sẽ biết được:

1. ✅ Quiz có được lưu vào Supabase không?
2. ✅ Quiz có được load từ Supabase không?
3. ✅ RLS policies có đúng không?
4. ✅ User role có đúng không?
5. ✅ Format data có khớp không?

Nếu vẫn gặp vấn đề, vui lòng cung cấp:
- Console logs khi save quiz
- Console logs khi load quiz
- Kết quả SQL queries kiểm tra
- Screenshot của Supabase dashboard

