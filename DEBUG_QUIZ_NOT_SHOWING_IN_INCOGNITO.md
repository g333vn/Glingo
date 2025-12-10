# Debug: Quiz không hiển thị trong trình duyệt ẩn danh

## Vấn đề
Sau khi tạo quiz trên thiết bị A, quiz không hiển thị khi truy cập bằng trình duyệt ẩn danh trên thiết bị B.

## Các bước debug

### Bước 1: Kiểm tra quiz có được lưu lên Supabase không

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy script `verify_quiz_in_supabase.sql` để kiểm tra:
   ```sql
   SELECT id, book_id, chapter_id, lesson_id, level, title, 
          array_length(questions, 1) as questions_count,
          created_at, updated_at
   FROM public.quizzes
   WHERE level = 'n5'  -- Thay đổi level của bạn
   ORDER BY updated_at DESC;
   ```

3. **Nếu không có quiz nào:**
   - Quiz chưa được lưu lên Supabase
   - Kiểm tra console log khi save quiz để xem có lỗi gì không
   - Đảm bảo user đã đăng nhập khi save quiz

4. **Nếu có quiz:**
   - Tiếp tục Bước 2

### Bước 2: Kiểm tra RLS Policies

1. Chạy script sau trong Supabase SQL Editor:
   ```sql
   SELECT policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'quizzes';
   ```

2. **Kiểm tra xem có policy cho phép anonymous users đọc không:**
   - Phải có policy với `cmd = 'SELECT'` và `qual = 'true'` hoặc tương tự
   - Nếu không có, chạy script `fix_quizzes_rls_for_anonymous.sql`

### Bước 3: Kiểm tra Console Log trong trình duyệt ẩn danh

1. Mở trình duyệt ẩn danh
2. Mở **Developer Tools** (F12) → **Console**
3. Truy cập trang bài học có quiz
4. Tìm các log sau:
   - `[StorageManager] 🔍 Attempting to load quiz from Supabase...`
   - `[StorageManager] Supabase response:`
   - `[StorageManager.getAllQuizzes] 🔍 Attempting to load quizzes from Supabase...`

5. **Kiểm tra các trường hợp:**

   **Trường hợp 1: Supabase trả về error**
   ```
   [StorageManager] ⚠️ Supabase getQuiz failed: {code: '42501', message: '...'}
   ```
   → **Giải pháp:** RLS policies chưa được update, chạy `fix_quizzes_rls_for_anonymous.sql`

   **Trường hợp 2: Supabase trả về success nhưng data = null**
   ```
   [StorageManager] Supabase response: {success: true, hasData: false}
   ```
   → **Giải pháp:** Quiz không tồn tại trong Supabase, kiểm tra Bước 1

   **Trường hợp 3: Supabase trả về success và có data**
   ```
   [StorageManager] ✅ Found quiz in Supabase
   ```
   → Quiz đã được load từ Supabase, nhưng có thể có vấn đề với UI rendering

### Bước 4: Kiểm tra Console Log khi Save Quiz

1. Trên thiết bị đã đăng nhập, mở **Developer Tools** (F12) → **Console**
2. Tạo/save quiz mới
3. Tìm các log sau:
   - `[StorageManager.saveQuiz] 🔍 Attempting to save quiz to Supabase...`
   - `[StorageManager.saveQuiz] ✅ Successfully saved quiz to Supabase`
   - Hoặc `[StorageManager.saveQuiz] ❌ Failed to save quiz to Supabase`

4. **Nếu có lỗi khi save:**
   - Kiểm tra xem user có đăng nhập không
   - Kiểm tra xem `userId` có được truyền vào không
   - Kiểm tra error message để biết nguyên nhân

### Bước 5: Kiểm tra Network Requests

1. Mở **Developer Tools** (F12) → **Network**
2. Filter: **Fetch/XHR**
3. Truy cập trang bài học có quiz
4. Tìm request đến Supabase:
   - URL: `https://[project].supabase.co/rest/v1/quizzes`
   - Kiểm tra:
     - **Status Code:** Phải là `200` hoặc `206`
     - **Response:** Phải có data quiz
     - **Request Headers:** Có `apikey` header

5. **Nếu Status Code là 401 hoặc 403:**
   - RLS policies chưa được update
   - Chạy `fix_quizzes_rls_for_anonymous.sql`

## Giải pháp nhanh

### Nếu quiz chưa được lưu lên Supabase:

1. **Đảm bảo user đã đăng nhập** khi save quiz
2. Kiểm tra console log để xem có lỗi gì không
3. Thử save lại quiz

### Nếu quiz đã có trong Supabase nhưng không hiển thị:

1. **Chạy script fix RLS:**
   ```sql
   -- Copy nội dung từ fix_quizzes_rls_for_anonymous.sql
   -- Chạy trong Supabase SQL Editor
   ```

2. **Clear cache và reload:**
   - Trong trình duyệt ẩn danh: Ctrl+Shift+R (hard reload)
   - Hoặc clear localStorage/IndexedDB

3. **Kiểm tra lại console log** để xem quiz có được load không

## Checklist

- [ ] Quiz đã được lưu lên Supabase (kiểm tra bằng SQL)
- [ ] RLS policies cho phép anonymous users đọc quizzes
- [ ] Console log không có lỗi khi load quiz
- [ ] Network request đến Supabase thành công (status 200)
- [ ] Quiz được cache vào IndexedDB/localStorage sau khi load từ Supabase

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi thực hiện các bước trên, vui lòng cung cấp:
1. Console log từ trình duyệt ẩn danh
2. Network request details (nếu có)
3. Kết quả của các SQL queries trên

