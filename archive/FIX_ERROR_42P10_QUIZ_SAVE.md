# Fix: Lỗi 42P10 Khi Save Quiz Lên Supabase

## Lỗi
```
Error code: 42P10
Error message: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
```

## Nguyên Nhân

Bảng `quizzes` có **composite primary key**: `(id, book_id, chapter_id, lesson_id, level)`

Nhưng code đang dùng:
```javascript
.upsert(upsertData, {
  onConflict: 'id'  // ❌ Lỗi: 'id' không phải unique constraint đơn lẻ
})
```

PostgreSQL/Supabase không thể dùng `ON CONFLICT` với một cột nếu cột đó không phải là unique constraint đơn lẻ.

## Giải Pháp

### ✅ Đã Sửa Code

**File:** `src/services/contentService.js`

**Thay đổi:**
```javascript
// ❌ Trước (Lỗi)
const { data, error } = await supabase
  .from('quizzes')
  .upsert(upsertData, {
    onConflict: 'id'  // Lỗi 42P10
  })
  .select()
  .single();

// ✅ Sau (Đã sửa)
const { data, error } = await supabase
  .from('quizzes')
  .upsert(upsertData)  // Supabase sẽ tự detect composite primary key
  .select()
  .single();
```

**Lý do:**
- Supabase sẽ tự động detect composite primary key
- Không cần chỉ định `onConflict` khi có composite primary key
- Supabase sẽ handle conflict dựa trên tất cả các cột của primary key

## Kiểm Tra

### Bước 1: Kiểm Tra Schema

Chạy SQL trong Supabase Dashboard:

```sql
-- Kiểm tra primary key
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'quizzes' 
  AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.ordinal_position;
```

**Kết quả mong đợi:**
- Primary key gồm: `id, book_id, chapter_id, lesson_id, level`

### Bước 2: Test Save Quiz

1. Mở **Developer Tools** (F12) → **Console**
2. Tạo/save quiz mới
3. Kiểm tra logs:

**✅ Nếu thành công:**
```
[ContentService.saveQuiz] ✅ Successfully saved quiz to Supabase
```

**❌ Nếu vẫn lỗi:**
- Kiểm tra lại schema của bảng `quizzes`
- Xem có unique constraint nào trên cột `id` không
- Chạy script: `fix_quizzes_onconflict_error.sql`

## Alternative Solutions

### Option 1: Tạo Unique Constraint Trên 'id'

**Chỉ làm nếu `id` thực sự unique trong toàn bộ bảng:**

```sql
-- Kiểm tra duplicate id trước
SELECT id, COUNT(*) as count
FROM quizzes
GROUP BY id
HAVING COUNT(*) > 1;

-- Nếu không có duplicate, tạo unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_quizzes_id_unique ON quizzes(id);
```

**Lưu ý:** Nếu có duplicate `id`, sẽ bị lỗi khi tạo unique constraint.

### Option 2: Dùng Composite Key Trong onConflict

**Nếu Supabase hỗ trợ (cần kiểm tra):**

```javascript
.upsert(upsertData, {
  onConflict: 'id,book_id,chapter_id,lesson_id,level'
})
```

**Lưu ý:** Cần kiểm tra xem Supabase có hỗ trợ cách này không.

## Kết Luận

✅ **Code đã được sửa** - Bỏ `onConflict: 'id'` và để Supabase tự detect composite primary key.

✅ **Không cần thay đổi database schema** - Giữ nguyên composite primary key.

✅ **Test lại** - Tạo quiz mới và kiểm tra xem có lỗi không.

## Files Đã Sửa

1. ✅ `src/services/contentService.js` - Bỏ `onConflict: 'id'`
2. ✅ `fix_quizzes_onconflict_error.sql` - Script kiểm tra và fix schema (nếu cần)
3. ✅ `FIX_ERROR_42P10_QUIZ_SAVE.md` - Tài liệu này

## Next Steps

1. ✅ Code đã được sửa
2. ⏳ Test lại bằng cách tạo quiz mới
3. ⏳ Kiểm tra Console logs
4. ⏳ Kiểm tra Supabase xem quiz có được lưu không

Nếu vẫn gặp lỗi, vui lòng:
- Cung cấp Console logs khi save quiz
- Chạy script `fix_quizzes_onconflict_error.sql` và cung cấp kết quả
- Kiểm tra schema của bảng `quizzes` trong Supabase Dashboard

