# 📝 Hướng Dẫn Sử Dụng Quiz Editor Tool

## 🎯 Mục đích

Tool nhập liệu quiz giúp bạn tạo quiz mới một cách dễ dàng, không cần phải viết JSON thủ công.

## 🚀 Cách truy cập

1. Mở browser và vào: `http://localhost:5173/admin/quiz-editor`
2. Hoặc trong production: `https://your-domain.com/admin/quiz-editor`

## 📋 Các bước sử dụng

### Bước 1: Điền thông tin quiz

1. **Tên Quiz (Title):**
   - Điền tên bài học, ví dụ: "Bài 1: Phân biệt cấu trúc A và B"
   - Tên này sẽ hiển thị ở đầu trang quiz

### Bước 2: Thêm và điền câu hỏi

**Lưu ý:** Tool hỗ trợ **số câu hỏi linh hoạt** - không giới hạn! Bạn có thể có 10, 20, 30, 100... câu hỏi tùy ý.

1. **Thêm câu hỏi:**
   - Click nút **"➕ Thêm câu hỏi mới"** ở cuối form
   - Có thể thêm bao nhiêu câu hỏi tùy ý
   - Mỗi câu hỏi sẽ tự động được đánh số (1, 2, 3, ...)

2. **Với mỗi câu hỏi, bạn cần điền:**

1. **Câu hỏi (Question Text):**
   - Nhập câu hỏi tiếng Nhật hoặc tiếng Việt
   - Ví dụ: "次の文の空欄に適切な語句を入れなさい。 彼は(　　)ために、毎日勉強している。"

2. **4 Đáp án (Options A, B, C, D):**
   - Điền đầy đủ 4 đáp án
   - Đáp án đúng sẽ được highlight màu xanh

3. **Chọn đáp án đúng:**
   - Chọn dropdown "Đáp án đúng" (A, B, C, hoặc D)
   - Đáp án được chọn sẽ có border màu xanh

4. **Giải thích (Explanation):**
   - Giải thích tại sao đáp án đó đúng
   - Có thể viết bằng tiếng Nhật hoặc tiếng Việt

5. **Quản lý câu hỏi:**
   - **Xóa câu hỏi:** Click nút "🗑️ Xóa" (phải có ít nhất 1 câu hỏi)
   - **Copy câu hỏi:** Click nút "📋 Copy" để duplicate câu hỏi (tiện khi có câu hỏi tương tự)
   - Khi xóa, các câu hỏi sẽ tự động được đánh số lại

### Bước 3: Preview (Tùy chọn)

- Click nút **"👁️ Xem Preview"** để xem trước quiz
- Preview sẽ hiển thị tất cả câu hỏi và đáp án
- Đáp án đúng sẽ được highlight màu xanh

### Bước 4: Export JSON

1. **Kiểm tra form:**
   - Đảm bảo tất cả thông tin đã được điền đầy đủ
   - Status sẽ hiển thị "✅ Form hợp lệ" nếu đúng

2. **Export:**
   - Click nút **"📤 Export JSON"**
   - JSON sẽ hiển thị ở sidebar bên phải

3. **Copy hoặc Download:**
   - **Copy JSON:** Click "📋 Copy JSON" để copy vào clipboard
   - **Download File:** Click "💾 Download File" để tải file JSON về máy

### Bước 5: Thêm vào project

1. **Đặt tên file:**
   - File JSON nên có tên: `bai-X.json` (X là số bài)
   - Ví dụ: `bai-4.json`, `bai-5.json`, ...

2. **Copy file vào project:**
   - Copy file JSON vào thư mục:
     ```
     src/data/level/n1/shinkanzen-n1-bunpou/quizzes/
     ```

3. **Test:**
   - Vào browser: `/level/n1/skm-n1-bunpou/lesson/bai-X`
   - Kiểm tra xem quiz có load được không

## 💡 Tips

### Tip 1: Sử dụng Preview
- Luôn preview trước khi export để kiểm tra lỗi
- Đảm bảo đáp án đúng được chọn đúng

### Tip 2: Copy từ file có sẵn
- Nếu có file JSON cũ, có thể mở và copy nội dung vào form
- Hoặc dùng form để chỉnh sửa quiz cũ

### Tip 3: Validation
- Form sẽ tự động kiểm tra xem đã điền đủ chưa
- Nếu thiếu thông tin, nút Export sẽ bị disable

### Tip 4: Format JSON
- JSON được format đẹp, dễ đọc
- Có thể chỉnh sửa trực tiếp trong file JSON nếu cần

## ⚠️ Lưu ý

1. **Tên file:**
   - Phải đúng format: `bai-X.json`
   - X phải là số (1, 2, 3, ...)

2. **Số câu hỏi:**
   - **Không giới hạn số lượng** - có thể có 1, 10, 20, 30, 100... câu hỏi
   - Phải có ít nhất 1 câu hỏi
   - Không được để trống câu hỏi nào (phải điền đầy đủ thông tin)

3. **Đáp án:**
   - Mỗi câu hỏi phải có đủ 4 đáp án (A, B, C, D)
   - Phải chọn đáp án đúng cho mỗi câu

4. **Giải thích:**
   - Nên điền giải thích để người học hiểu rõ hơn
   - Có thể để trống nhưng không khuyến khích

## 🐛 Troubleshooting

### Lỗi: "Form không hợp lệ"
- **Nguyên nhân:** Thiếu thông tin (title, câu hỏi, đáp án, hoặc giải thích)
- **Cách fix:** Điền đầy đủ tất cả các trường

### Lỗi: "Quiz không load được"
- **Nguyên nhân:** Tên file không đúng hoặc JSON không hợp lệ
- **Cách fix:** 
  - Kiểm tra tên file: `bai-X.json`
  - Validate JSON bằng JSON validator online
  - Kiểm tra console trong browser để xem lỗi

### Lỗi: "Copy không hoạt động"
- **Nguyên nhân:** Browser không hỗ trợ clipboard API
- **Cách fix:** 
  - Dùng nút "Download File" thay vì Copy
  - Hoặc copy thủ công từ textarea JSON

## 📚 Ví dụ

### Ví dụ 1: Quiz đơn giản

**Title:** "Bài 1: Phân biệt cấu trúc A và B"

**Câu hỏi 1:**
- Text: "次の文の空欄に適切な語句を入れなさい。 彼は(　　)ために、毎日勉強している。"
- Option A: "試験に合格する"
- Option B: "試験に合格して"
- Option C: "試験に合格し"
- Option D: "試験に合格した"
- Correct: A
- Explanation: "「～するために」は目的を表す構造で、「する」が適切です。"

### Ví dụ 2: Quiz với giải thích tiếng Việt

**Title:** "Bài 2: Sử dụng trong ngữ cảnh trang trọng"

**Câu hỏi 1:**
- Text: "次の文の意味に最も近いものを選びなさい。 それは彼の考えとは正反対だ。"
- Option A: "It is the opposite of his idea."
- Option B: "It is the same as his idea."
- Option C: "It is better than his idea."
- Option D: "It is similar to his idea."
- Correct: A
- Explanation: "'正反対' nghĩa là 'opposite', vậy A là đúng."

## ✅ Checklist

Trước khi export, đảm bảo:

- [ ] Đã điền tên quiz
- [ ] Đã thêm và điền đủ số câu hỏi cần thiết (10, 20, 30... tùy ý)
- [ ] Mỗi câu hỏi có đủ 4 đáp án
- [ ] Đã chọn đáp án đúng cho mỗi câu
- [ ] Đã điền giải thích (khuyến khích)
- [ ] Đã preview và kiểm tra
- [ ] Form hiển thị "✅ Form hợp lệ"

Sau khi export:

- [ ] Đã copy hoặc download file JSON
- [ ] Đã đặt tên file đúng format (`bai-X.json`)
- [ ] Đã copy file vào đúng thư mục
- [ ] Đã test trên browser
- [ ] Quiz load được và hiển thị đúng

---

**Chúc bạn tạo quiz thành công! 🎉**

