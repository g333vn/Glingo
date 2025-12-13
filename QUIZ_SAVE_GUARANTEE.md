# ✅ Đảm bảo Quiz được lưu vào Supabase và không bị mất

## 🎯 Mục tiêu
Đảm bảo rằng khi bạn tạo quiz mới, dữ liệu sẽ:
1. ✅ Được lưu vào Supabase (cloud database)
2. ✅ Được lưu vào local storage (backup)
3. ✅ Không bị mất nếu bạn không chủ động xóa
4. ✅ Hiển thị trên tất cả thiết bị

## 🔧 Các cải tiến đã thực hiện

### 1. **Validation trước khi lưu**
- ✅ Kiểm tra `selectedLevel` có được chọn không
- ✅ Kiểm tra `userId` có tồn tại không (đăng nhập)
- ✅ Hiển thị cảnh báo rõ ràng nếu thiếu thông tin

### 2. **Auto-create Book/Chapter/Lesson**
- ✅ Tự động tạo book nếu chưa có
- ✅ Tự động tạo chapter nếu chưa có
- ✅ Tự động tạo lesson nếu chưa có
- ✅ Tránh lỗi Foreign Key Constraint

### 3. **Verification sau khi lưu**
- ✅ Tự động kiểm tra quiz đã được lưu vào Supabase chưa
- ✅ Hiển thị thông báo rõ ràng về trạng thái lưu
- ✅ Logging chi tiết để debug

### 4. **Thông báo rõ ràng**
- ✅ Thông báo khi lưu thành công vào Supabase
- ✅ Cảnh báo nếu chỉ lưu vào local storage
- ✅ Hướng dẫn nếu cần đăng nhập

### 5. **Bảo vệ khỏi mất dữ liệu**
- ✅ Đã sửa bug `deleteQuiz` - không còn xóa nhầm quizzes
- ✅ Đã cải thiện logic auto-cleanup - không xóa quiz hợp lệ
- ✅ Quiz chỉ bị xóa khi bạn chủ động xóa

## 📋 Checklist khi tạo quiz

### Trước khi lưu:
- [ ] Đã chọn **Level** (n5, n4, n3, n2, n1)
- [ ] Đã chọn **Book**
- [ ] Đã chọn **Chapter**
- [ ] Đã chọn **Lesson**
- [ ] Đã nhập **Title** cho quiz
- [ ] Đã thêm ít nhất 1 câu hỏi
- [ ] Đã **đăng nhập** (để lưu vào Supabase)

### Sau khi lưu:
- [ ] Kiểm tra thông báo xác nhận
- [ ] Nếu thấy "✅ Quiz đã được lưu thành công!" → Quiz đã vào Supabase
- [ ] Nếu thấy "⚠️ Quiz đã được lưu vào local storage!" → Chỉ lưu local, cần đăng nhập
- [ ] Kiểm tra Console (F12) để xem log chi tiết

## 🔍 Cách kiểm tra quiz đã lưu vào Supabase

### Cách 1: Kiểm tra trong app
1. Tạo quiz mới
2. Xem thông báo sau khi lưu
3. Nếu thấy "✅ Quiz đã được lưu thành công!" → Đã lưu vào Supabase

### Cách 2: Kiểm tra bằng SQL
Chạy query trong Supabase SQL Editor:

```sql
SELECT 
  level,
  book_id,
  chapter_id,
  lesson_id,
  title,
  jsonb_array_length(questions) as questions_count,
  created_at
FROM quizzes
WHERE level = 'n5'  -- Thay đổi level nếu cần
ORDER BY created_at DESC
LIMIT 10;
```

### Cách 3: Kiểm tra Console
1. Mở DevTools (F12)
2. Vào tab Console
3. Tìm log: `✅ VERIFIED: Quiz is now in Supabase!`

## ⚠️ Lưu ý quan trọng

### 1. **Phải đăng nhập**
- Quiz chỉ được lưu vào Supabase nếu bạn đã đăng nhập
- Nếu không đăng nhập, quiz chỉ lưu vào local storage (thiết bị này)
- Quiz trong local storage sẽ không hiển thị trên thiết bị khác

### 2. **Phải chọn Level**
- Level là bắt buộc để lưu vào Supabase
- Nếu không chọn level, quiz chỉ lưu vào local storage

### 3. **Kiểm tra thông báo**
- Luôn đọc thông báo sau khi lưu
- Nếu thấy cảnh báo, làm theo hướng dẫn

## 🛡️ Bảo vệ dữ liệu

### Đã sửa các bug:
1. ✅ Bug `deleteQuiz` - không còn xóa nhầm quizzes của lessons khác
2. ✅ Logic auto-cleanup - không xóa quiz hợp lệ
3. ✅ Logic load quiz - ưu tiên Supabase trước local cache

### Quiz sẽ KHÔNG bị mất nếu:
- ✅ Bạn không chủ động xóa
- ✅ Bạn không chạy cleanup script
- ✅ Bạn không xóa database

### Quiz CÓ THỂ bị mất nếu:
- ❌ Bạn xóa quiz trong admin panel
- ❌ Bạn xóa chapter/lesson chứa quiz
- ❌ Bạn xóa database Supabase

## 📞 Nếu gặp vấn đề

1. **Quiz không lưu vào Supabase:**
   - Kiểm tra đã đăng nhập chưa
   - Kiểm tra đã chọn Level chưa
   - Xem Console để tìm lỗi cụ thể

2. **Quiz bị mất:**
   - Kiểm tra Supabase bằng SQL query
   - Kiểm tra local storage trong DevTools
   - Xem log trong Console

3. **Quiz không hiển thị:**
   - Clear cache và reload
   - Kiểm tra quiz có trong Supabase không
   - Kiểm tra level/book/chapter/lesson có đúng không

