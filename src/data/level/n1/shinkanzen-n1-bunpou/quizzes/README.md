# 📚 Quiz Data cho Shinkanzen N1 Bunpou

## 📁 Cấu trúc

Mỗi bài học có một file JSON riêng:
- `bai-1.json` - Bài 1: Phân biệt cấu trúc A và B
- `bai-2.json` - Bài 2: Sử dụng trong ngữ cảnh trang trọng
- `bai-3.json` - Bài 3: Ôn tập phần 1
- ... (tối đa 20 bài)

## 📝 Format JSON

Mỗi file JSON có cấu trúc như sau:

```json
{
  "title": "Tên bài học",
  "questions": [
    {
      "id": 1,
      "text": "Câu hỏi tiếng Nhật",
      "options": [
        { "label": "A", "text": "Đáp án A" },
        { "label": "B", "text": "Đáp án B" },
        { "label": "C", "text": "Đáp án C" },
        { "label": "D", "text": "Đáp án D" }
      ],
      "correct": "A",
      "explanation": "Giải thích tại sao đáp án đúng"
    }
    // ... thêm 9 câu hỏi nữa (tổng 10 câu)
  ]
}
```

## ➕ Cách thêm quiz mới

1. **Tạo file JSON mới:**
   - Tên file: `bai-[số].json` (ví dụ: `bai-4.json`)
   - Copy format từ `bai-1.json` hoặc `bai-2.json`
   - Điền đầy đủ 10 câu hỏi

2. **Kiểm tra:**
   - File JSON phải hợp lệ (có thể dùng JSON validator online)
   - `id` của câu hỏi phải là số (1, 2, 3, ...)
   - `correct` phải là một trong: "A", "B", "C", "D"
   - Mỗi câu hỏi phải có đủ 4 options

3. **Test:**
   - Vào `/level/n1/skm-n1-bunpou/lesson/bai-[số]`
   - Kiểm tra xem quiz có load được không

## 🔧 Lazy Loading

Quiz data được lazy load tự động bằng `quiz-loader.js`:
- Chỉ load khi user vào trang quiz
- Không load tất cả quiz cùng lúc
- Tự động fallback về `quizData.js` cũ nếu không tìm thấy JSON

## 📋 Checklist khi thêm quiz mới

- [ ] Tạo file JSON với tên đúng format (`bai-X.json`)
- [ ] File JSON hợp lệ (validate bằng JSON validator)
- [ ] Có đủ 10 câu hỏi
- [ ] Mỗi câu hỏi có đủ 4 options (A, B, C, D)
- [ ] Mỗi câu hỏi có `correct` và `explanation`
- [ ] Test trên browser xem có load được không
- [ ] Không có lỗi trong console

## 💡 Tips

- Có thể copy từ file JSON có sẵn và chỉnh sửa
- Sử dụng text editor có JSON syntax highlighting (VS Code, etc.)
- Test từng quiz một để đảm bảo không có lỗi

