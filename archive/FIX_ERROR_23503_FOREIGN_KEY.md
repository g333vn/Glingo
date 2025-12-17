# Fix: Lỗi 23503 - Foreign Key Constraint Violation

## Lỗi
```
Error code: 23503
Error message: "insert or update on table "quizzes" violates foreign key constraint "quizzes_lesson_id_book_id_chapter_id_level_fkey""
```

## Nguyên Nhân

Bảng `quizzes` có **foreign key constraint**:
```sql
FOREIGN KEY (lesson_id, book_id, chapter_id, level) 
REFERENCES lessons(id, book_id, chapter_id, level) ON DELETE CASCADE
```

Điều này có nghĩa là:
- Khi insert quiz, phải đảm bảo `lesson_id`, `book_id`, `chapter_id`, `level` **tồn tại trong bảng `lessons`**
- Tương tự, `lessons` phải reference đến `chapters` tồn tại
- `chapters` phải reference đến `books` tồn tại

**Vấn đề:** Quiz đang cố reference đến book/chapter/lesson **chưa tồn tại** trong database.

## Giải Pháp

### Bước 1: Kiểm Tra Data Có Tồn Tại Không

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy query (thay các giá trị từ Console log):

```sql
-- Lấy giá trị từ Console log: [ContentService.saveQuiz] 📤 Upsert data
-- Ví dụ: book_id = 'mina-1', chapter_id = 'chapter-1', lesson_id = 'chapter-1', level = 'n5'

-- Kiểm tra book
SELECT id, book_id, level, title
FROM books
WHERE id = 'YOUR_BOOK_ID' AND level = 'YOUR_LEVEL';

-- Kiểm tra chapter
SELECT id, book_id, chapter_id, level, title
FROM chapters
WHERE id = 'YOUR_CHAPTER_ID' 
  AND book_id = 'YOUR_BOOK_ID' 
  AND level = 'YOUR_LEVEL';

-- Kiểm tra lesson
SELECT id, book_id, chapter_id, lesson_id, level, title
FROM lessons
WHERE id = 'YOUR_LESSON_ID'
  AND book_id = 'YOUR_BOOK_ID'
  AND chapter_id = 'YOUR_CHAPTER_ID'
  AND level = 'YOUR_LEVEL';
```

**Nếu không có kết quả:** Book/chapter/lesson chưa tồn tại → Xem Bước 2

### Bước 2: Tạo Book/Chapter/Lesson Nếu Chưa Có

**Option 1: Tạo thủ công trong Supabase Dashboard**

1. Vào **Table Editor** → **books**
2. Tạo book mới với `id` và `level` khớp với quiz
3. Tương tự cho **chapters** và **lessons**

**Option 2: Dùng SQL Script**

Chạy script trong file `fix_quizzes_foreign_key_error.sql` (Bước 3)

### Bước 3: Tự Động Tạo Book/Chapter/Lesson (Khuyến Khích)

**File:** `src/services/contentService.js`

Có thể cải thiện code để tự động tạo book/chapter/lesson nếu chưa có:

```javascript
// Trước khi save quiz, đảm bảo book/chapter/lesson tồn tại
async function ensureBookExists(bookId, level) {
  // Check và create nếu chưa có
}

async function ensureChapterExists(chapterId, bookId, level) {
  // Check và create nếu chưa có
}

async function ensureLessonExists(lessonId, bookId, chapterId, level) {
  // Check và create nếu chưa có
}
```

**Lưu ý:** Cần thêm logic này vào `saveQuiz()` function.

### Bước 4: Option - Xóa Foreign Key Constraint (KHÔNG KHUYẾN KHÍCH)

**⚠️ CHỈ LÀM NẾU BẠN CHẮC CHẮN!**

Xóa foreign key constraint sẽ cho phép insert quiz mà không cần book/chapter/lesson tồn tại, nhưng sẽ **mất tính toàn vẹn dữ liệu**.

```sql
ALTER TABLE quizzes
DROP CONSTRAINT IF EXISTS quizzes_lesson_id_book_id_chapter_id_level_fkey;
```

**Không khuyến khích** vì:
- Mất tính toàn vẹn dữ liệu
- Quiz có thể reference đến book/chapter/lesson không tồn tại
- Khó quản lý và debug sau này

## Cách Kiểm Tra Nhanh

### 1. Xem Console Log

Khi save quiz, xem Console log:
```
[ContentService.saveQuiz] 📤 Upsert data: {
  "book_id": "mina-1",
  "chapter_id": "chapter-1",
  "lesson_id": "chapter-1",
  "level": "n5",
  ...
}
```

### 2. Kiểm Tra Trong Supabase

Chạy query với các giá trị từ Console log:

```sql
-- Thay các giá trị này
SELECT 
    'books' as table_name,
    COUNT(*) as exists
FROM books
WHERE id = 'mina-1' AND level = 'n5'
UNION ALL
SELECT 
    'chapters' as table_name,
    COUNT(*) as exists
FROM chapters
WHERE id = 'chapter-1' AND book_id = 'mina-1' AND level = 'n5'
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as exists
FROM lessons
WHERE id = 'chapter-1' 
  AND book_id = 'mina-1' 
  AND chapter_id = 'chapter-1' 
  AND level = 'n5';
```

**Kết quả mong đợi:**
- Tất cả `exists` = 1 (tồn tại)
- Nếu có `exists` = 0 → Cần tạo record đó

## Giải Pháp Tốt Nhất

### 1. Đảm Bảo Data Tồn Tại Trước

**Trong QuizEditorPage:**
- Khi user chọn book/chapter/lesson, đảm bảo chúng đã được tạo trong Supabase
- Hoặc tự động tạo khi user chọn

### 2. Tự Động Tạo Nếu Chưa Có

**Cải thiện `saveQuiz()` function:**
```javascript
export async function saveQuiz(quiz, userId) {
  // 1. Đảm bảo book tồn tại
  await ensureBookExists(quiz.bookId, quiz.level);
  
  // 2. Đảm bảo chapter tồn tại
  await ensureChapterExists(quiz.chapterId, quiz.bookId, quiz.level);
  
  // 3. Đảm bảo lesson tồn tại
  await ensureLessonExists(quiz.lessonId, quiz.bookId, quiz.chapterId, quiz.level);
  
  // 4. Save quiz
  // ...
}
```

## Checklist

- [ ] Kiểm tra book có tồn tại không (SQL query)
- [ ] Kiểm tra chapter có tồn tại không (SQL query)
- [ ] Kiểm tra lesson có tồn tại không (SQL query)
- [ ] Tạo book/chapter/lesson nếu chưa có
- [ ] Test lại save quiz
- [ ] Kiểm tra quiz có trong Supabase không

## Files Đã Tạo

1. ✅ `fix_quizzes_foreign_key_error.sql` - Script SQL để kiểm tra và fix
2. ✅ `FIX_ERROR_23503_FOREIGN_KEY.md` - Tài liệu này
3. ✅ `src/services/contentService.js` - Đã cải thiện error logging

## Next Steps

1. ✅ Xem Console log để lấy giá trị `book_id`, `chapter_id`, `lesson_id`, `level`
2. ⏳ Chạy SQL query để kiểm tra xem chúng có tồn tại không
3. ⏳ Tạo book/chapter/lesson nếu chưa có
4. ⏳ Test lại save quiz

Nếu vẫn gặp vấn đề, vui lòng:
- Cung cấp Console logs khi save quiz
- Cung cấp kết quả SQL queries kiểm tra book/chapter/lesson
- Kiểm tra schema của bảng `quizzes` trong Supabase Dashboard

