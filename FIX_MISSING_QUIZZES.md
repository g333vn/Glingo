# 🔧 Hướng dẫn kiểm tra và khôi phục quizzes bị mất

## Vấn đề
Bạn đã setup ít nhất 5 bài quiz nhưng sau khi fix bug thì dữ liệu bị mất.

## Nguyên nhân đã tìm thấy

### 1. **Bug nghiêm trọng trong deleteQuiz** ✅ ĐÃ SỬA
- **File:** `src/utils/localStorageManager.js` line 1140-1148
- **Vấn đề:** Khi xóa 1 quiz, code đang xóa TẤT CẢ quizzes của chapter đó
- **Đã sửa:** Chỉ xóa quiz cụ thể, không xóa quizzes của các lessons khác

### 2. **Logic auto-cleanup ghost quiz** ⚠️ CẦN KIỂM TRA
- **File:** `src/pages/admin/ContentManagementPage.jsx` line 300-321
- **Vấn đề:** Có thể xóa quiz hợp lệ nếu quiz không có trong Supabase (do lỗi network hoặc chưa sync)
- **Giải pháp:** Đã thêm validation để chỉ xóa quiz thực sự không hợp lệ

## Cách kiểm tra

### Bước 1: Kiểm tra trong Supabase

1. Mở Supabase Dashboard
2. Vào SQL Editor
3. Chạy file `check_quizzes_in_supabase.sql` để xem:
   - Tổng số quizzes
   - Số quizzes theo level/book/chapter/lesson
   - Các quizzes có trong database

### Bước 2: Kiểm tra trong Browser

1. Mở DevTools (F12)
2. Vào tab **Application** > **IndexedDB**
3. Tìm database `elearning-db` > `quizzes` store
4. Kiểm tra xem có bao nhiêu quizzes cho chapter đó

### Bước 3: Kiểm tra localStorage

1. Trong DevTools, vào tab **Application** > **Local Storage**
2. Tìm các key có format: `adminQuiz_{level}_{bookId}_{chapterId}_{lessonId}`
3. Xem có bao nhiêu quizzes

## Cách khôi phục (nếu dữ liệu còn trong Supabase)

Nếu dữ liệu vẫn còn trong Supabase nhưng không hiển thị:

1. **Clear cache local:**
   ```javascript
   // Chạy trong Console
   localStorage.clear();
   indexedDB.deleteDatabase('elearning-db');
   location.reload();
   ```

2. **Force reload từ Supabase:**
   - Vào trang admin Content Management
   - Load lại chapter đó
   - Quizzes sẽ được load từ Supabase và cache lại

## Cách khôi phục (nếu dữ liệu đã bị xóa)

Nếu dữ liệu đã bị xóa khỏi Supabase:

1. **Kiểm tra backup:**
   - Xem có backup nào trong `scripts/backup/` không
   - Restore từ backup nếu có

2. **Tạo lại quizzes:**
   - Vào admin panel
   - Tạo lại các quizzes còn thiếu

## Phòng ngừa

1. **Đã sửa bug deleteQuiz:**
   - Chỉ xóa quiz cụ thể, không xóa tất cả quizzes của chapter
   - Thêm logging để debug

2. **Thêm validation:**
   - Kiểm tra quiz có hợp lệ trước khi xóa
   - Không auto-delete quiz nếu có thể do lỗi network

3. **Backup tự động:**
   - Đảm bảo backup script chạy định kỳ
   - Backup trước khi xóa quiz

