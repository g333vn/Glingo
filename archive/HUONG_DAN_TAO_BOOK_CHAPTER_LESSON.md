# Hướng Dẫn: Tạo Book/Chapter/Lesson Cho Quiz

## Vấn Đề

Khi save quiz, gặp lỗi:
```
Error code: 23503
insert or update on table "lessons" violates foreign key constraint
Key (book_id, level)=(mina-1, n5) is not present in table "books"
```

**Nguyên nhân:** Book/chapter/lesson chưa tồn tại trong database, nhưng quiz đang cố reference đến chúng.

## Giải Pháp

### Cách 1: Dùng Script SQL (Khuyến Khích)

1. **Xem Console log khi save quiz:**
   ```
   [ContentService.saveQuiz] 📤 Upsert data: {
     "book_id": "mina-1",
     "chapter_id": "chapter-1",
     "lesson_id": "chapter-1",
     "level": "n5",
     ...
   }
   ```

2. **Mở Supabase Dashboard → SQL Editor**

3. **Chạy script:** `create_book_chapter_lesson_simple.sql`

4. **Thay các giá trị trong script:**
   - `'mina-1'` → book_id từ Console log
   - `'chapter-1'` → chapter_id từ Console log
   - `'chapter-1'` → lesson_id từ Console log
   - `'n5'` → level từ Console log

5. **Chạy từng bước một:**
   - Bước 2: Tạo book
   - Bước 3: Tạo chapter
   - Bước 4: Tạo lesson
   - Bước 5: Kiểm tra kết quả

6. **Test lại:** Tạo quiz mới trong app

### Cách 2: Tạo Thủ Công Trong Supabase Dashboard

1. **Tạo Book:**
   - Vào **Table Editor** → **books**
   - Click **Insert row**
   - Điền:
     - `id`: book_id từ Console log (ví dụ: `mina-1`)
     - `level`: level từ Console log (ví dụ: `n5`)
     - `title`: Tên book (ví dụ: `Book mina-1`)
   - Click **Save**

2. **Tạo Chapter:**
   - Vào **Table Editor** → **chapters**
   - Click **Insert row**
   - Điền:
     - `id`: chapter_id từ Console log (ví dụ: `chapter-1`)
     - `book_id`: book_id từ Console log (ví dụ: `mina-1`)
     - `level`: level từ Console log (ví dụ: `n5`)
     - `title`: Tên chapter (ví dụ: `Chapter chapter-1`)
   - Click **Save**

3. **Tạo Lesson:**
   - Vào **Table Editor** → **lessons**
   - Click **Insert row**
   - Điền:
     - `id`: lesson_id từ Console log (ví dụ: `chapter-1`)
     - `book_id`: book_id từ Console log (ví dụ: `mina-1`)
     - `chapter_id`: chapter_id từ Console log (ví dụ: `chapter-1`)
     - `level`: level từ Console log (ví dụ: `n5`)
     - `title`: Tên lesson (ví dụ: `Lesson chapter-1`)
   - Click **Save**

4. **Test lại:** Tạo quiz mới trong app

## Lưu Ý Quan Trọng

### 1. Thứ Tự Tạo

**Phải tạo theo thứ tự:**
1. **Book** trước
2. **Chapter** sau (vì cần book_id)
3. **Lesson** cuối (vì cần book_id và chapter_id)

**Lý do:** Foreign key constraints yêu cầu parent records tồn tại trước.

### 2. Giá Trị Cần Thay

Khi chạy script SQL, thay các giá trị sau bằng giá trị từ Console log:

- `'mina-1'` → book_id từ Console log
- `'chapter-1'` → chapter_id từ Console log  
- `'chapter-1'` → lesson_id từ Console log
- `'n5'` → level từ Console log (n1, n2, n3, n4, n5)

### 3. ON CONFLICT DO NOTHING

Script sử dụng `ON CONFLICT DO NOTHING` để:
- Không bị lỗi nếu book/chapter/lesson đã tồn tại
- Có thể chạy lại script nhiều lần mà không bị lỗi

## Kiểm Tra Sau Khi Tạo

Chạy query này để kiểm tra:

```sql
-- Kiểm tra book
SELECT id, level, title FROM books WHERE id = 'mina-1' AND level = 'n5';

-- Kiểm tra chapter
SELECT id, book_id, level, title 
FROM chapters 
WHERE id = 'chapter-1' AND book_id = 'mina-1' AND level = 'n5';

-- Kiểm tra lesson
SELECT id, book_id, chapter_id, level, title 
FROM lessons 
WHERE id = 'chapter-1' 
  AND book_id = 'mina-1' 
  AND chapter_id = 'chapter-1' 
  AND level = 'n5';
```

**Kết quả mong đợi:** Mỗi query trả về 1 row.

## Test Lại

Sau khi tạo book/chapter/lesson:

1. Vào **QuizEditorPage** trong app
2. Tạo quiz mới với cùng book_id, chapter_id, lesson_id, level
3. Click **Save**
4. Kiểm tra Console:
   - ✅ `[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase`
5. Kiểm tra Supabase:
   - Vào **Table Editor** → **quizzes**
   - Quiz đã được lưu

## Files

1. ✅ `create_book_chapter_lesson_simple.sql` - Script đơn giản (khuyến khích)
2. ✅ `create_book_chapter_lesson.sql` - Script với PostgreSQL variables
3. ✅ `HUONG_DAN_TAO_BOOK_CHAPTER_LESSON.md` - Tài liệu này

## Troubleshooting

### Lỗi: "Key (book_id, level) is not present in table books"

**Nguyên nhân:** Book chưa được tạo.

**Giải pháp:** Chạy Bước 2 trong script (tạo book) trước.

### Lỗi: "Key (chapter_id, book_id, level) is not present in table chapters"

**Nguyên nhân:** Chapter chưa được tạo.

**Giải pháp:** Chạy Bước 3 trong script (tạo chapter) sau khi đã tạo book.

### Lỗi: "Key (lesson_id, book_id, chapter_id, level) is not present in table lessons"

**Nguyên nhân:** Lesson chưa được tạo.

**Giải pháp:** Chạy Bước 4 trong script (tạo lesson) sau khi đã tạo book và chapter.

