# 🗑️ Hướng dẫn xóa book "BOOK MINNA-NO-NIHONGO-1"

## 🔍 Vấn đề

Book "BOOK MINNA-NO-NIHONGO-1" tự xuất hiện trong UI nhưng:
- ❌ Không có trong Supabase database
- ✅ Có trong local storage (IndexedDB/localStorage)

**Nguyên nhân:**
- Book có thể được tạo tự động khi save quiz (logic auto-create trong `contentService.js`)
- Book được cache vào local storage nhưng không được sync lên Supabase
- Hoặc book đã bị xóa khỏi Supabase nhưng vẫn còn trong cache

## ✅ Giải pháp đã áp dụng

### 1. **Cải thiện logic `getBooks()`**
- ✅ Tự động phát hiện ghost books (có trong local cache nhưng không có trong Supabase)
- ✅ Tự động xóa ghost books khỏi cache khi load từ Supabase
- ✅ Đảm bảo UI chỉ hiển thị books thực sự có trong Supabase

### 2. **Script xóa thủ công**

Nếu vẫn thấy ghost book sau khi refresh, chạy script thủ công:

## 📋 Cách xóa

### Bước 1: Xóa khỏi local storage (Browser Console)

1. Mở Browser DevTools (F12)
2. Vào tab **Console**
3. Copy và paste nội dung file `delete_ghost_book.js`
4. Nhấn Enter để chạy

Script sẽ:
- ✅ Tìm và xóa ghost book khỏi localStorage
- ✅ Tìm và xóa ghost book khỏi IndexedDB
- ✅ Hiển thị kết quả chi tiết

### Bước 2: Xóa khỏi Supabase (nếu có)

1. Mở Supabase SQL Editor
2. Chạy file `delete_ghost_book_from_supabase.sql`
3. Query 1-2: Kiểm tra book có tồn tại không
4. Query 3: Xóa book (chỉ chạy sau khi xác nhận đúng ID)

**⚠️ CẢNH BÁO:** Xóa book sẽ xóa tất cả chapters, lessons, quizzes liên quan!

### Bước 3: Refresh trang

Sau khi xóa:
1. Refresh trang (Ctrl+F5 để clear cache)
2. Kiểm tra xem book còn hiển thị không
3. Nếu vẫn còn, kiểm tra Console để xem log

## 🔍 Cách kiểm tra

### Kiểm tra trong Supabase:

```sql
SELECT id, level, title 
FROM books 
WHERE level = 'n5'
ORDER BY created_at DESC;
```

### Kiểm tra trong Browser Console:

```javascript
// Kiểm tra localStorage
const books = JSON.parse(localStorage.getItem('adminBooks_n5') || '[]');
console.log('Books in localStorage:', books.map(b => ({ id: b.id, title: b.title })));

// Kiểm tra IndexedDB (cần mở DevTools > Application > IndexedDB)
```

## 🛡️ Phòng ngừa

### Đã sửa:
1. ✅ Logic `getBooks()` tự động xóa ghost books
2. ✅ Logic ưu tiên Supabase trước local cache
3. ✅ Tự động sync cache với Supabase

### Kết quả:
- ✅ Ghost books sẽ tự động bị xóa khi load từ Supabase
- ✅ UI chỉ hiển thị books thực sự có trong Supabase
- ✅ Không còn book "clone" tự xuất hiện

## 📞 Nếu vẫn gặp vấn đề

1. **Clear cache thủ công:**
   ```javascript
   // Chạy trong Console
   localStorage.clear();
   indexedDB.deleteDatabase('elearning-db');
   location.reload();
   ```

2. **Kiểm tra static metadata:**
   - File `src/data/level/n5/books-metadata.js` đã được clean (empty array)
   - Không có book nào trong static file

3. **Kiểm tra logic auto-create:**
   - Logic auto-create book khi save quiz chỉ tạo nếu book chưa có
   - Book sẽ được tạo với title `Book ${bookId}`
   - Nếu bookId = "minna-no-nihongo-1" → title = "Book minna-no-nihongo-1"

