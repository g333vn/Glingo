# Debug: Quiz Không Được Lưu Lên Supabase

## Vấn đề
Tạo quiz ở cấp n5 nhưng khi kiểm tra trong Supabase thì chưa có dữ liệu.

## Các bước debug

### Bước 1: Kiểm tra Console Log khi Save Quiz

1. Mở **Developer Tools** (F12) → **Console**
2. Tạo/save quiz mới ở level n5
3. Tìm các log sau:

#### Log 1: Kiểm tra selectedLevel và userId
```
[QuizEditor] 📋 Save validation: {
  selectedLevel: "n5",  // ✅ Phải là "n5"
  userId: "abc12345...",  // ✅ Phải có giá trị
  selectedBook: "...",
  selectedChapter: "...",
  finalLessonId: "..."
}
```

**Nếu `selectedLevel` không phải "n5":**
- Kiểm tra dropdown level trong UI có được chọn đúng không
- Kiểm tra xem có code nào reset `selectedLevel` về 'n1' không

**Nếu `userId` là NULL:**
- User chưa đăng nhập
- Hoặc `user` object không có `id` property
- Xem Bước 2

#### Log 2: Kiểm tra Supabase Save
```
[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...
[StorageManager.saveQuiz]   - level: n5  // ✅ Phải là "n5"
[StorageManager.saveQuiz]   - userId: abc12345...  // ✅ Phải có giá trị
```

**Nếu không thấy log này:**
- `level` hoặc `userId` là null/undefined
- Quiz chỉ được lưu vào local storage

#### Log 3: Kiểm tra ContentService Save
```
[ContentService.saveQuiz] 🔍 Attempting to save quiz: {
  level: "n5",  // ✅ Phải là "n5"
  userId: "abc12345..."  // ✅ Phải có giá trị
}
```

**Nếu có error:**
```
[ContentService.saveQuiz] ❌ Error saving quiz: {...}
[ContentService.saveQuiz] ❌ Error code: 42501  // RLS policy error
[ContentService.saveQuiz] ❌ Error message: "..."
```

**Các error code thường gặp:**
- `42501`: RLS policy chặn insert (user không phải admin)
- `23505`: Unique constraint violation (quiz đã tồn tại)
- `23503`: Foreign key violation (book/chapter/lesson không tồn tại)

### Bước 2: Kiểm tra User Authentication

1. Mở Console và chạy:
```javascript
// Kiểm tra user object
console.log('User:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.findFiberByHostInstance?.(document.body)?.memoizedState?.user);
```

2. Hoặc kiểm tra trong React DevTools:
   - Mở React DevTools
   - Tìm component `AuthProvider`
   - Kiểm tra `user` state có `id` không

3. Kiểm tra Supabase Session:
```javascript
// Trong Console
const { supabase } = await import('./src/services/supabaseClient.js');
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

**Nếu không có session:**
- User chưa đăng nhập
- Đăng nhập lại và thử save quiz

### Bước 3: Kiểm tra RLS Policies

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

3. Kiểm tra:
   - Có policy "Admins can manage quizzes" không?
   - Policy có check `profiles.role = 'admin'` không?

4. Kiểm tra user có phải admin không:
```sql
SELECT user_id, role, email
FROM profiles
WHERE user_id = 'YOUR_USER_ID_HERE';  -- Thay bằng user ID của bạn
```

**Nếu role không phải 'admin':**
- Cập nhật role thành 'admin' trong Supabase
- Hoặc chạy script `update_user_role_to_admin.sql`

### Bước 4: Kiểm tra Quiz Data

1. Kiểm tra xem quiz có được lưu vào local storage không:
```javascript
// Trong Console
const level = 'n5';
const bookId = 'YOUR_BOOK_ID';
const chapterId = 'YOUR_CHAPTER_ID';
const lessonId = 'YOUR_LESSON_ID';
const key = `adminQuiz_${level}_${bookId}_${chapterId}_${lessonId}`;
const quiz = localStorage.getItem(key);
console.log('Quiz in localStorage:', quiz ? JSON.parse(quiz) : 'NOT FOUND');
```

2. Kiểm tra IndexedDB:
   - Mở **Application** tab → **IndexedDB**
   - Tìm database `elearning-db`
   - Kiểm tra store `quizzes`
   - Tìm quiz với level = 'n5'

**Nếu quiz có trong local storage nhưng không có trong Supabase:**
- Vấn đề là với việc save lên Supabase
- Kiểm tra error logs trong Console
- Kiểm tra RLS policies

### Bước 5: Test Save Trực Tiếp

1. Mở Console và chạy:
```javascript
const { supabase } = await import('./src/services/supabaseClient.js');
const { data: { session } } = await supabase.auth.getSession();
const userId = session?.user?.id;

if (!userId) {
  console.error('❌ No user ID - please login first');
} else {
  console.log('✅ User ID:', userId);
  
  // Test save quiz
  const testQuiz = {
    id: 'test-quiz-n5',
    book_id: 'test-book',
    chapter_id: 'test-chapter',
    lesson_id: 'test-lesson',
    level: 'n5',
    title: 'Test Quiz N5',
    description: null,
    questions: [],
    time_limit: null,
    passing_score: 60,
    created_by: userId,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('quizzes')
    .upsert(testQuiz)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success:', data);
  }
}
```

**Nếu test save thành công:**
- Vấn đề là với code save quiz trong app
- Kiểm tra lại logic trong `QuizEditorPage` và `contentService.saveQuiz`

**Nếu test save fail:**
- Vấn đề là với RLS policies hoặc database schema
- Kiểm tra RLS policies
- Kiểm tra database schema có đúng không

## Checklist

- [ ] `selectedLevel` = "n5" khi save
- [ ] `userId` có giá trị (không phải NULL)
- [ ] User đã đăng nhập (có session)
- [ ] User có role = 'admin' trong profiles table
- [ ] RLS policy "Admins can manage quizzes" tồn tại và đúng
- [ ] Console không có error khi save
- [ ] Quiz được lưu vào local storage (IndexedDB/localStorage)
- [ ] Test save trực tiếp thành công

## Giải pháp nhanh

### Nếu userId là NULL:
1. Đăng nhập lại
2. Kiểm tra `user` object có `id` không
3. Nếu không có, kiểm tra AuthContext

### Nếu RLS policy error:
1. Chạy script `fix_quizzes_rls_for_anonymous.sql`
2. Kiểm tra user có role = 'admin' không
3. Cập nhật role nếu cần

### Nếu quiz chỉ lưu local:
1. Kiểm tra Console log để xem có error gì
2. Kiểm tra `level` và `userId` có được truyền đúng không
3. Thử save lại với logging đầy đủ

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi thực hiện các bước trên, vui lòng cung cấp:
1. Console log khi save quiz (copy toàn bộ)
2. Kết quả của test save trực tiếp
3. Kết quả của SQL query kiểm tra RLS policies
4. Kết quả của SQL query kiểm tra user role

