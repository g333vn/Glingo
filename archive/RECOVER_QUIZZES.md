# 🔄 Hướng dẫn khôi phục quizzes bị mất

## Tình trạng hiện tại
- ✅ Đã kiểm tra Supabase: **KHÔNG có quiz nào cho level n5**
- ❌ Dữ liệu đã bị mất khỏi Supabase (có thể do bug deleteQuiz đã sửa)

## Cách khôi phục

### Bước 1: Kiểm tra local storage

1. Mở Browser DevTools (F12)
2. Vào tab **Console**
3. Copy và paste script từ file `recover_quizzes_from_local_storage.js`
4. Chạy script để kiểm tra xem có quiz nào còn trong local storage không

Script sẽ:
- Kiểm tra localStorage
- Kiểm tra IndexedDB
- Hiển thị danh sách quizzes tìm thấy
- Lưu vào `window.foundQuizzes` để dùng sau

### Bước 2: Khôi phục lên Supabase

**Nếu tìm thấy quizzes trong local storage:**

1. **Cách 1: Tạo lại thủ công**
   - Vào admin panel
   - Mở từng lesson có quiz
   - Tạo lại quiz với dữ liệu từ console

2. **Cách 2: Script tự động** (cần đăng nhập)
   - Chạy hàm `recoverQuizzesToSupabase()` trong console
   - Script sẽ tự động upload quizzes lên Supabase
   - **Lưu ý:** Cần đăng nhập và có quyền write vào Supabase

### Bước 3: Nếu không tìm thấy trong local storage

Nếu không tìm thấy quiz nào trong local storage, có nghĩa là:
- Dữ liệu đã bị xóa hoàn toàn
- Cần tạo lại quizzes từ đầu

**Cách tạo lại:**
1. Vào admin panel > Content Management
2. Chọn level n5
3. Mở từng lesson cần quiz
4. Click nút "Quiz" để tạo quiz mới
5. Nhập lại câu hỏi và đáp án

## Phòng ngừa trong tương lai

1. ✅ **Đã sửa bug deleteQuiz** - không còn xóa nhầm quizzes
2. ✅ **Đã cải thiện logic auto-cleanup** - không xóa quiz hợp lệ
3. ⚠️ **Nên backup định kỳ:**
   - Export quizzes ra file JSON
   - Hoặc backup database Supabase định kỳ

## Kiểm tra sau khi khôi phục

Sau khi khôi phục, chạy lại query SQL để xác nhận:

```sql
SELECT 
  level,
  COUNT(*) as total_quizzes
FROM quizzes
WHERE level = 'n5'
GROUP BY level;
```

Kết quả mong đợi: `total_quizzes >= 5`

