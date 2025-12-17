# Tự Động Tạo Book/Chapter/Lesson Khi Save Quiz

## Vấn Đề

Khi save quiz, gặp lỗi foreign key constraint vì book/chapter/lesson chưa tồn tại trong database.

## Giải Pháp

✅ **Code đã được cải thiện** để tự động tạo book/chapter/lesson nếu chưa có khi save quiz.

## Thay Đổi

**File:** `src/services/contentService.js` - Function `saveQuiz()`

### Trước Khi Sửa

- Code chỉ cố gắng save quiz
- Nếu book/chapter/lesson chưa tồn tại → Lỗi foreign key constraint (23503)

### Sau Khi Sửa

- Code tự động kiểm tra và tạo book/chapter/lesson nếu chưa có
- Thứ tự tạo: **Book → Chapter → Lesson** (vì foreign key constraints)
- Sau đó mới save quiz

## Logic Tự Động

### 1. Kiểm Tra và Tạo Book

```javascript
// Kiểm tra book có tồn tại không
const { data: existingBook } = await supabase
  .from('books')
  .select('id')
  .eq('id', quiz.bookId)
  .eq('level', quiz.level)
  .maybeSingle();

// Nếu chưa có, tạo book mới
if (!existingBook) {
  await supabase.from('books').insert({
    id: quiz.bookId,
    level: quiz.level,
    title: `Book ${quiz.bookId}`,
    created_by: userId,
    updated_at: new Date().toISOString()
  });
}
```

### 2. Kiểm Tra và Tạo Chapter

```javascript
// Kiểm tra chapter có tồn tại không
const { data: existingChapter } = await supabase
  .from('chapters')
  .select('id')
  .eq('id', quiz.chapterId)
  .eq('book_id', quiz.bookId)
  .eq('level', quiz.level)
  .maybeSingle();

// Nếu chưa có, tạo chapter mới
if (!existingChapter) {
  await supabase.from('chapters').insert({
    id: quiz.chapterId,
    book_id: quiz.bookId,
    level: quiz.level,
    title: `Chapter ${quiz.chapterId}`,
    created_by: userId,
    updated_at: new Date().toISOString()
  });
}
```

### 3. Kiểm Tra và Tạo Lesson

```javascript
// Kiểm tra lesson có tồn tại không
const { data: existingLesson } = await supabase
  .from('lessons')
  .select('id')
  .eq('id', quiz.lessonId)
  .eq('book_id', quiz.bookId)
  .eq('chapter_id', quiz.chapterId)
  .eq('level', quiz.level)
  .maybeSingle();

// Nếu chưa có, tạo lesson mới
if (!existingLesson) {
  await supabase.from('lessons').insert({
    id: quiz.lessonId,
    book_id: quiz.bookId,
    chapter_id: quiz.chapterId,
    level: quiz.level,
    title: `Lesson ${quiz.lessonId}`,
    content_type: 'pdf',
    order_index: 0,
    created_by: userId,
    updated_at: new Date().toISOString()
  });
}
```

## Lợi Ích

1. ✅ **Không cần tạo thủ công** - Book/chapter/lesson được tạo tự động
2. ✅ **Tránh lỗi foreign key** - Không còn lỗi 23503
3. ✅ **Tiện lợi hơn** - Admin chỉ cần tạo quiz, không cần lo về parent records
4. ✅ **An toàn** - Sử dụng `maybeSingle()` và kiểm tra trước khi tạo

## Lưu Ý

### 1. Title Mặc Định

- Book: `Book ${bookId}`
- Chapter: `Chapter ${chapterId}`
- Lesson: `Lesson ${lessonId}`

**Có thể cập nhật sau** trong Content Management Page.

### 2. Thứ Tự Tạo

**Phải tạo theo thứ tự:**
1. Book trước
2. Chapter sau (cần book_id)
3. Lesson cuối (cần book_id và chapter_id)

**Code đã đảm bảo thứ tự này.**

### 3. Error Handling

- Nếu tạo book/chapter/lesson fail → Log warning nhưng vẫn tiếp tục
- Có thể book/chapter/lesson đã tồn tại (race condition)
- Nếu save quiz vẫn fail → Hiển thị error như bình thường

## Test

### Trước Khi Sửa

1. Tạo quiz với book/chapter/lesson chưa tồn tại
2. ❌ Lỗi: `Error code: 23503 - Foreign key constraint violation`

### Sau Khi Sửa

1. Tạo quiz với book/chapter/lesson chưa tồn tại
2. ✅ Console log:
   ```
   [ContentService.saveQuiz] ℹ️ Book does not exist, creating it...
   [ContentService.saveQuiz] ✅ Created book: mina-1
   [ContentService.saveQuiz] ℹ️ Chapter does not exist, creating it...
   [ContentService.saveQuiz] ✅ Created chapter: chapter-1
   [ContentService.saveQuiz] ℹ️ Lesson does not exist, creating it...
   [ContentService.saveQuiz] ✅ Created lesson: chapter-1
   [ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase
   ```
3. ✅ Quiz được lưu thành công
4. ✅ Book/chapter/lesson được tạo tự động trong Supabase

## Kết Luận

✅ **Code đã được cải thiện** - Tự động tạo book/chapter/lesson khi save quiz.

✅ **Không cần thay đổi workflow** - Admin vẫn tạo quiz như bình thường.

✅ **Giảm lỗi** - Không còn lỗi foreign key constraint khi save quiz.

## Files Đã Sửa

1. ✅ `src/services/contentService.js` - Function `saveQuiz()`
2. ✅ `AUTO_CREATE_LESSON_FOR_QUIZ.md` - Tài liệu này

