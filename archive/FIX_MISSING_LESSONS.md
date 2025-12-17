# 🔧 Hướng dẫn kiểm tra và khôi phục lessons bị mất

## Vấn đề
Bạn đã tạo 25 bài từ vựng nhưng sau một số fix bug thì chỉ còn 5 bài.

## Nguyên nhân có thể

1. **Logic saveLessons xóa tất cả lessons cũ trước khi lưu mới**
   - File: `src/services/contentService.js` line 242-248
   - Nếu khi lưu chỉ có 5 lessons trong state (do bug load), nó sẽ xóa 25 lessons cũ và chỉ lưu 5 lessons mới

2. **Bug trong logic load lessons**
   - Có thể chỉ load được 5 lessons thay vì 25 từ IndexedDB/localStorage/Supabase

3. **Migration hoặc cleanup script**
   - Có thể có script nào đó đã xóa dữ liệu

## Cách kiểm tra

### Bước 1: Kiểm tra trong Supabase

1. Mở Supabase Dashboard
2. Vào SQL Editor
3. Chạy file `check_lessons_in_supabase.sql` để xem:
   - Tổng số lessons
   - Số lessons theo level/book/chapter
   - Các chapter có ít lessons (có thể bị mất dữ liệu)

### Bước 2: Kiểm tra trong Browser

1. Mở DevTools (F12)
2. Vào tab **Application** > **IndexedDB**
3. Tìm database `elearning-db` > `lessons` store
4. Kiểm tra xem có bao nhiêu lessons cho chapter đó

### Bước 3: Kiểm tra localStorage

1. Trong DevTools, vào tab **Application** > **Local Storage**
2. Tìm key có format: `adminLessons_{level}_{bookId}_{chapterId}`
3. Xem giá trị có bao nhiêu lessons

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
   - Lessons sẽ được load từ Supabase và cache lại

## Cách khôi phục (nếu dữ liệu đã bị xóa)

Nếu dữ liệu đã bị xóa khỏi Supabase:

1. **Kiểm tra backup:**
   - Xem có backup nào trong `scripts/backup/` không
   - Restore từ backup nếu có

2. **Tạo lại lessons:**
   - Vào admin panel
   - Tạo lại các lessons còn thiếu

## Phòng ngừa

1. **Thêm logging:**
   - Log số lượng lessons trước và sau khi save
   - Log số lượng lessons khi load

2. **Thêm validation:**
   - Kiểm tra số lượng lessons trước khi save
   - Cảnh báo nếu số lượng giảm đáng kể

3. **Backup tự động:**
   - Đảm bảo backup script chạy định kỳ
   - Backup trước khi save lessons

