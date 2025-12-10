# Fix: Quiz Logic Bắt Chước Books/Chapters/Lessons

## Vấn đề
Quiz không hiển thị trong trình duyệt ẩn danh, trong khi books/chapters/lessons thì hiển thị được.

## Nguyên nhân
Logic load/save quiz không giống hệt như books/chapters/lessons:
- `getQuiz` và `getAllQuizzes` có logic phức tạp hơn, không nhất quán
- RLS policies có thể chưa được setup đúng

## Giải pháp

### 1. Cập nhật Logic Load Quiz (`src/utils/localStorageManager.js`)

#### `getQuiz()` - Giống hệt `getBooks()`:
```javascript
// ✅ Luôn load từ Supabase trước nếu có level (không cần authentication)
if (level) {
  const { success, data } = await contentService.getQuiz(...);
  if (success && data) {
    // Cache và return
    return data;
  }
  // Nếu Supabase trả về empty → không fallback về cache cũ
}
// Fallback về IndexedDB → localStorage
```

#### `getAllQuizzes()` - Giống hệt `getBooks()`:
```javascript
// ✅ Luôn load từ Supabase trước nếu có level
if (level) {
  const { success, data } = await contentService.getAllQuizzesByLevel(level);
  if (success && data.length > 0) {
    // Cache và return
    return data;
  }
  // Nếu Supabase trả về empty → clear cache local và return []
}
// Fallback về IndexedDB → localStorage
```

### 2. Cập nhật RLS Policies (`fix_quizzes_rls_for_anonymous.sql`)

#### Policy giống hệt như books/chapters/lessons:
```sql
-- Cho phép ANYONE (kể cả anonymous) đọc quizzes
CREATE POLICY "Anyone can read quizzes"
  ON public.quizzes FOR SELECT
  USING (true);

-- Chỉ admin mới có thể write (INSERT/UPDATE/DELETE)
CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## So sánh Logic

| Feature | Books/Chapters/Lessons | Quiz (Trước) | Quiz (Sau) |
|---------|------------------------|--------------|------------|
| Load từ Supabase | ✅ Luôn load trước | ⚠️ Có điều kiện | ✅ Luôn load trước |
| Anonymous read | ✅ `USING (true)` | ❓ Không rõ | ✅ `USING (true)` |
| Fallback logic | ✅ IndexedDB → localStorage | ⚠️ Phức tạp | ✅ IndexedDB → localStorage |
| Cache khi Supabase empty | ✅ Clear cache local | ⚠️ Giữ cache cũ | ✅ Clear cache local |

## Các thay đổi chi tiết

### File: `src/utils/localStorageManager.js`

1. **`getQuiz()`**:
   - ✅ Đơn giản hóa logic, giống `getBooks()`
   - ✅ Luôn load từ Supabase trước nếu có level
   - ✅ Không cần authentication để đọc
   - ✅ Fallback về IndexedDB → localStorage

2. **`getAllQuizzes()`**:
   - ✅ Đơn giản hóa logic, giống `getBooks()`
   - ✅ Luôn load từ Supabase trước nếu có level
   - ✅ Clear cache local nếu Supabase trả về empty
   - ✅ Fallback về IndexedDB → localStorage

### File: `fix_quizzes_rls_for_anonymous.sql`

1. **RLS Policies**:
   - ✅ Policy "Anyone can read quizzes" giống hệt books/chapters/lessons
   - ✅ Policy "Admins can manage quizzes" giống hệt books/chapters/lessons
   - ✅ Drop tất cả policies cũ để tránh conflict

## Cách áp dụng

### Bước 1: Chạy SQL Script
```sql
-- Chạy trong Supabase SQL Editor
-- File: fix_quizzes_rls_for_anonymous.sql
```

### Bước 2: Test
1. Tạo quiz trên thiết bị A (đã đăng nhập admin)
2. Mở trình duyệt ẩn danh trên thiết bị B
3. Truy cập trang bài học có quiz
4. Quiz phải hiển thị

### Bước 3: Kiểm tra Console Log
Trong trình duyệt ẩn danh, mở Console và tìm:
```
[StorageManager.getQuiz] ✅ Loaded quiz from Supabase
```
hoặc
```
[StorageManager.getAllQuizzes] ✅ Loaded X quizzes from Supabase
```

## Kết quả mong đợi

✅ Quiz hiển thị trong trình duyệt ẩn danh (giống như books/chapters/lessons)
✅ Quiz được load từ Supabase trước (không cần authentication)
✅ Quiz được cache vào IndexedDB/localStorage sau khi load
✅ Logic nhất quán với các content types khác

## Lưu ý

- **Quan trọng**: Phải chạy SQL script `fix_quizzes_rls_for_anonymous.sql` trong Supabase SQL Editor để update RLS policies
- Nếu vẫn không hiển thị, kiểm tra:
  1. Quiz có được lưu lên Supabase không (dùng `verify_quiz_in_supabase.sql`)
  2. RLS policies đã được update chưa (check trong Supabase Dashboard)
  3. Console log có error gì không

