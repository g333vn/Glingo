# Fix: Quiz Không Được Lưu Lên Supabase

## Vấn Đề
- Quiz được tạo và lưu thành công (có thể thấy trong local storage)
- Nhưng không có trong Supabase
- Truy cập từ thiết bị khác không thấy quiz

## Nguyên Nhân Có Thể

### 1. `level` hoặc `userId` là NULL
Code chỉ lưu lên Supabase khi CẢ HAI đều có giá trị:
```javascript
if (level && userId) {
  // Save to Supabase
}
```

### 2. RLS Policy Error
User không có quyền INSERT vào bảng `quizzes` (không phải admin hoặc policy chưa setup)

### 3. Error trong `contentService.saveQuiz()` nhưng không được xử lý đúng

## Giải Pháp

### Bước 1: Kiểm Tra Console Log

1. Mở **Developer Tools** (F12) → **Console**
2. Tạo/save quiz mới
3. Tìm các log sau:

#### ✅ Nếu thấy log này → Quiz ĐANG được lưu lên Supabase:
```
[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...
[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase
```

#### ❌ Nếu thấy log này → `level` hoặc `userId` là NULL:
```
[StorageManager.saveQuiz] ⚠️ No level provided - quiz will NOT be saved to Supabase
[StorageManager.saveQuiz] ⚠️ No userId provided - quiz will NOT be saved to Supabase
```

**Giải pháp:**
- Kiểm tra dropdown level có được chọn không
- Kiểm tra user có đăng nhập không
- Xem log: `[QuizEditor] 📋 Save validation: { selectedLevel: "...", userId: "..." }`

#### ❌ Nếu thấy log này → RLS Policy Error:
```
[ContentService.saveQuiz] ❌ Error saving quiz: {...}
[ContentService.saveQuiz] ❌ Error code: 42501
```

**Giải pháp:**
- Kiểm tra user role: `SELECT role FROM profiles WHERE user_id = '...'`
- Phải là `role = 'admin'`
- Chạy script: `update_user_role_to_admin.sql`
- Chạy script: `fix_quizzes_rls_for_anonymous.sql`

### Bước 2: Kiểm Tra User Role

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

**Nếu không phải admin:**
- Chạy script: `update_user_role_to_admin.sql`

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

2. **"Admins can manage quizzes"** (ALL)
   - Chỉ admin mới có thể INSERT/UPDATE/DELETE

**Nếu thiếu:**
- Chạy script: `fix_quizzes_rls_for_anonymous.sql`

### Bước 4: Test Save Trực Tiếp

1. Mở **Developer Tools** (F12) → **Console**
2. Chạy script sau (thay các giá trị):

```javascript
// Test save quiz trực tiếp
const { supabase } = await import('./src/services/supabaseClient.js');
const { data: { session } } = await supabase.auth.getSession();
const userId = session?.user?.id;

if (!userId) {
  console.error('❌ No user ID - please login first');
} else {
  console.log('✅ User ID:', userId);
  
  // Test save quiz
  const testQuiz = {
    id: 'test-quiz-n5-' + Date.now(),
    book_id: 'mina-1',  // Thay bằng book ID của bạn
    chapter_id: 'chapter-1',  // Thay bằng chapter ID của bạn
    lesson_id: 'chapter-1',  // Thay bằng lesson ID của bạn
    level: 'n5',  // Thay bằng level của bạn
    title: 'Test Quiz N5',
    description: null,
    questions: [{ id: 1, question: 'Test?', options: [], correctAnswer: 'A' }],
    time_limit: null,
    passing_score: 60,
    created_by: userId,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('quizzes')
    .upsert(testQuiz, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
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

## Fix Code (Nếu Cần)

### Fix 1: Đảm Bảo Error Được Log Rõ Ràng

File: `src/utils/localStorageManager.js`

Đảm bảo error từ `contentService.saveQuiz()` được log và xử lý đúng:

```javascript
const result = await contentService.saveQuiz({...}, userId);

if (!result.success) {
  console.error('[StorageManager.saveQuiz] ❌ Failed to save quiz to Supabase:', result.error);
  console.error('[StorageManager.saveQuiz] ❌ Error code:', result.error?.code);
  console.error('[StorageManager.saveQuiz] ❌ Error message:', result.error?.message);
  
  // ✅ NEW: Hiển thị alert cho user biết
  if (result.error?.code === '42501') {
    alert('⚠️ Lỗi: Bạn không có quyền lưu quiz lên Supabase.\n\nVui lòng kiểm tra:\n1. User có role = "admin" không?\n2. RLS policies đã được setup chưa?');
  } else {
    alert('⚠️ Lỗi khi lưu quiz lên Supabase:\n' + (result.error?.message || 'Unknown error'));
  }
} else {
  console.log(`[StorageManager.saveQuiz] ✅ Successfully saved quiz to Supabase`);
}
```

### Fix 2: Đảm Bảo `selectedLevel` Không Bị Reset

File: `src/pages/admin/QuizEditorPage.jsx`

Đảm bảo `selectedLevel` không bị reset về empty:

```javascript
// ✅ VALIDATION: Kiểm tra selectedLevel và userId trước khi save
if (!selectedLevel || selectedLevel.trim() === '') {
  alert('⚠️ Vui lòng chọn Level trước khi lưu quiz!');
  console.error('[QuizEditor] ❌ selectedLevel is empty!');
  return;
}
```

### Fix 3: Đảm Bảo `userId` Được Lấy Đúng

File: `src/pages/admin/QuizEditorPage.jsx`

Đảm bảo `userId` được lấy từ user object hoặc session:

```javascript
let userId = null;
if (user && typeof user.id === 'string' && user.id.length > 20) {
  userId = user.id;
  console.log(`[QuizEditor] ✅ Got userId from user object: ${userId}`);
} else {
  // Try to get userId from Supabase session
  try {
    const { supabase } = await import('../../services/supabaseClient.js');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      userId = session.user.id;
      console.log(`[QuizEditor] ✅ Got userId from session: ${userId}`);
    } else {
      console.warn('[QuizEditor] ⚠️ No session found');
    }
  } catch (err) {
    console.error('[QuizEditor] ❌ Error getting userId from session:', err);
  }
}
```

## Checklist

- [ ] Console log: `[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...`
- [ ] Console log: `[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase`
- [ ] `selectedLevel` có giá trị (n1, n2, n3, n4, n5)
- [ ] `userId` có giá trị (không phải NULL)
- [ ] User có role = 'admin' trong profiles table
- [ ] RLS policy "Admins can manage quizzes" tồn tại và đúng
- [ ] Console không có error khi save
- [ ] Quiz có trong Supabase (kiểm tra Table Editor hoặc SQL query)
- [ ] Test save trực tiếp thành công

## Kết Luận

Sau khi thực hiện các bước trên:

1. ✅ Nếu thấy log `[StorageManager.saveQuiz] ⚠️ No level provided` → Kiểm tra dropdown level
2. ✅ Nếu thấy log `[StorageManager.saveQuiz] ⚠️ No userId provided` → Đăng nhập lại
3. ✅ Nếu thấy error code `42501` → Kiểm tra user role và RLS policies
4. ✅ Nếu test save trực tiếp thành công → Vấn đề là với code save quiz trong app

Nếu vẫn gặp vấn đề, vui lòng cung cấp:
- Console logs khi save quiz (copy toàn bộ)
- Kết quả của test save trực tiếp
- Kết quả của SQL query kiểm tra RLS policies
- Kết quả của SQL query kiểm tra user role

