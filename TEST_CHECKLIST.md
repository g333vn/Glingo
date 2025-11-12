# ✅ Checklist Test App Sau Khi Tách File Data

## 🎯 Mục đích
Kiểm tra xem app vẫn hoạt động bình thường sau khi tách file data theo cấu trúc mới.

---

## 📋 Checklist Test

### 1. **Trang LEVEL (Home)**
- [ ] Vào `/level` - Hiển thị 5 level cards (N1-N5)
- [ ] Click vào N1 → Chuyển đến `/level/n1`

### 2. **Trang LevelN1Page**
- [ ] Vào `/level/n1` - Hiển thị danh sách 25 sách N1
- [ ] Kiểm tra pagination (nếu có nhiều hơn 10 sách)
- [ ] Kiểm tra filter theo category (nếu có)
- [ ] Click vào một sách (ví dụ: "新完全マスター 文法 N1") → Chuyển đến `/level/n1/skm-n1-bunpou`

### 3. **Trang BookDetailPage**
- [ ] Vào `/level/n1/skm-n1-bunpou` - Hiển thị danh sách chapters (20 bài)
- [ ] Kiểm tra pagination (nếu có nhiều hơn 15 chapters)
- [ ] Click vào một bài (ví dụ: "Bài 1") → Chuyển đến `/level/n1/skm-n1-bunpou/lesson/bai-1`

### 4. **Trang QuizPage**
- [ ] Vào `/level/n1/skm-n1-bunpou/lesson/bai-1` - Hiển thị quiz với 10 câu hỏi
- [ ] Làm quiz: chọn đáp án, xem giải thích
- [ ] Submit quiz → Hiển thị kết quả
- [ ] Kiểm tra dictionary popup (double-click vào từ)

### 5. **Kiểm tra Console (F12)**
- [ ] Mở DevTools Console (F12)
- [ ] Không có lỗi import/module
- [ ] Không có warning về missing data

### 6. **Kiểm tra Network**
- [ ] Mở DevTools → Network tab
- [ ] Reload trang
- [ ] Không có request failed (404, 500, etc.)

---

## 🐛 Các Lỗi Có Thể Gặp

### Lỗi 1: "Cannot find module"
**Nguyên nhân:** Import path sai
**Cách fix:** Kiểm tra lại đường dẫn import trong các file

### Lỗi 2: "n1BooksMetadata is not defined"
**Nguyên nhân:** Export/import không đúng
**Cách fix:** Kiểm tra `src/data/level/n1/index.js` có export `n1BooksMetadata` không

### Lỗi 3: "bookData[bookId] is undefined"
**Nguyên nhân:** Book ID không khớp giữa metadata và books
**Cách fix:** Kiểm tra ID trong `books-metadata.js` và `books.js` phải giống nhau

### Lỗi 4: "quizData[lessonId] is undefined"
**Nguyên nhân:** Lesson ID không có trong quizData
**Cách fix:** Kiểm tra `quizData.js` có chứa lesson ID tương ứng không

---

## ✅ Kết Quả Mong Đợi

Sau khi test, app phải:
- ✅ Hiển thị đúng danh sách sách N1 (25 sách)
- ✅ Hiển thị đúng danh sách chapters (20 bài cho skm-n1-bunpou)
- ✅ Quiz hoạt động bình thường (10 câu hỏi)
- ✅ Không có lỗi trong console
- ✅ Navigation hoạt động đúng

---

## 📝 Ghi Chú

- Nếu gặp lỗi, hãy ghi lại:
  - Trang nào bị lỗi
  - Thông báo lỗi trong console
  - Screenshot (nếu có)

- Các sách N1 khác (không có data đầy đủ) sẽ hiển thị "Sách không tồn tại" khi vào BookDetailPage - Đây là bình thường, sẽ thêm data sau.

