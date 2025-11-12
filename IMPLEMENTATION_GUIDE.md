# 🎯 Hướng Dẫn Triển Khai Cho Người Mới

## 💡 Nguyên Tắc: Làm Từng Bước, Đơn Giản Trước

Vì đây là dự án đầu tay, chúng ta sẽ **KHÔNG** làm quá phức tạp ngay. Thay vào đó, làm từng bước nhỏ, test kỹ, rồi mới bước tiếp.

---

## 📋 Kế Hoạch 3 Bước

### ✅ BƯỚC 1: Chuẩn Bị Cấu Trúc Đơn Giản (1-2 ngày)
**Mục tiêu**: Tách file hiện tại thành nhiều file nhỏ hơn, dễ quản lý

**Làm gì:**
1. Giữ nguyên cách import hiện tại (không cần lazy load ngay)
2. Chia file lớn thành file nhỏ theo level
3. Tạo helper functions đơn giản

**Kết quả**: Code dễ đọc hơn, dễ thêm data mới

---

### ✅ BƯỚC 2: Tạo Tool Nhập Liệu (2-3 ngày)
**Mục tiêu**: Có cách nhập liệu nhanh, không phải code thủ công

**Làm gì:**
1. Tạo form web đơn giản để nhập câu hỏi
2. Hoặc tạo script để convert từ Excel/Google Sheets
3. Export ra file JSON/JS tự động

**Kết quả**: Nhập 100 câu hỏi trong 10 phút thay vì 2 giờ

---

### ✅ BƯỚC 3: Tối Ưu Performance (Sau khi có data)
**Mục tiêu**: Khi có nhiều data, mới cần lazy loading

**Làm gì:**
1. Chuyển sang lazy load khi bundle > 1MB
2. Cache data đã load
3. Code splitting

**Kết quả**: Trang load nhanh dù có 10,000 câu hỏi

---

## 🚀 BƯỚC 1: Tách File Đơn Giản (Bắt Đầu Từ ĐÂY)

### Cấu Trúc Mới (Đơn Giản)

```
src/data/
├── level/
│   ├── index.js              # Export tất cả
│   ├── n1/
│   │   ├── books.js         # Danh sách sách N1
│   │   ├── shinkanzen-n1-bunpou.js    # Data 1 cuốn sách
│   │   ├── try-n1-1.js
│   │   └── ...
│   ├── n2/
│   │   └── ...
│   └── ...
│
└── jlpt/
    ├── index.js
    ├── n1/
    │   ├── exams.js         # Danh sách đề thi
    │   ├── 2024-12-knowledge.js
    │   ├── 2024-12-listening.js
    │   └── ...
    └── ...
```

### Ví Dụ File Mới

**`src/data/level/n1/shinkanzen-n1-bunpou.js`**
```javascript
// Data cho 1 cuốn sách - Dễ quản lý!
export const bookMetadata = {
  id: 'shinkanzen-n1-bunpou',
  title: "新完全マスター 文法 N1",
  imageUrl: "/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg",
  totalChapters: 20
};

export const chapters = [
  { id: 'bai-1', title: 'Bài 1: Phân biệt cấu trúc A và B' },
  { id: 'bai-2', title: 'Bài 2: Sử dụng trong ngữ cảnh trang trọng' },
  // ... 18 chapters nữa
];

export const quizData = {
  'bai-1': {
    title: "Bài 1: Phân biệt cấu trúc A và B",
    questions: [
      {
        id: 1,
        text: "次の文の空欄に適切な語句を入れなさい。彼は(　　)ために、毎日勉強している。",
        options: [
          { label: 'A', text: '試験に合格する' },
          { label: 'B', text: '試験に合格して' },
          { label: 'C', text: '試験に合格し' },
          { label: 'D', text: '試験に合格した' }
        ],
        correct: 'A',
        explanation: "「～するために」は目的を表す構造で、「する」が適切です。"
      },
      // ... 9 câu hỏi nữa
    ]
  },
  'bai-2': { /* ... */ },
  // ... 18 chapters nữa
};
```

**`src/data/level/n1/books.js`**
```javascript
// Danh sách tất cả sách N1
import { bookMetadata as shinkanzen } from './shinkanzen-n1-bunpou.js';
import { bookMetadata as tryBook } from './try-n1-1.js';
// ... import các sách khác

export const n1Books = {
  'shinkanzen-n1-bunpou': shinkanzen,
  'try-n1-1': tryBook,
  // ... các sách khác
};
```

**`src/data/level/index.js`**
```javascript
// Export tất cả - Giữ nguyên cách dùng cũ
import { n1Books } from './n1/books.js';
import { n2Books } from './n2/books.js';
// ...

export const bookData = {
  ...n1Books,
  ...n2Books,
  // ...
};

// Helper function
export function getBookData(bookId) {
  return bookData[bookId] || bookData.default;
}
```

---

## 🛠️ BƯỚC 2: Tool Nhập Liệu (Quan Trọng!)

### Option A: Form Web Đơn Giản (Khuyên Dùng)

Tạo trang admin đơn giản:
- Form nhập câu hỏi
- Preview ngay
- Export ra file JS/JSON
- Copy-paste vào project

### Option B: Google Sheets → JSON

1. Tạo Google Sheet với format:
   ```
   Chapter ID | Question | Option A | Option B | Option C | Option D | Correct | Explanation
   ```
2. Dùng Google Apps Script export ra JSON
3. Copy vào project

### Option C: Excel → JSON Script

Tạo script Node.js đơn giản:
```javascript
// scripts/excel-to-json.js
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('questions.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet);

// Convert và export
fs.writeFileSync('output.js', `export const questions = ${JSON.stringify(data, null, 2)};`);
```

---

## 📝 Checklist Thực Hiện

### Tuần 1: Setup Cấu Trúc
- [ ] Tạo thư mục `src/data/level/n1/`, `n2/`, ...
- [ ] Di chuyển data hiện có vào file mới
- [ ] Update import trong components
- [ ] Test xem có lỗi không

### Tuần 2: Tool Nhập Liệu
- [ ] Chọn phương pháp nhập liệu (Form/Sheets/Excel)
- [ ] Tạo tool nhập liệu
- [ ] Test nhập 10-20 câu hỏi
- [ ] Export và import vào project

### Tuần 3: Nhập Liệu Thực Tế
- [ ] Nhập data cho 1 cuốn sách đầy đủ (20 chapters)
- [ ] Test trên app
- [ ] Fix bugs nếu có
- [ ] Lặp lại cho các sách khác

---

## ⚠️ Lưu Ý Quan Trọng

1. **Đừng làm quá nhiều cùng lúc**: Làm từng bước, test kỹ
2. **Backup code**: Commit git thường xuyên
3. **Test sau mỗi thay đổi**: Đảm bảo app vẫn chạy
4. **Bắt đầu nhỏ**: Nhập 1-2 chapters trước, test OK rồi mới nhập tiếp

---

## 🎯 Bắt Đầu Ngay: Làm Gì Bây Giờ?

### Hôm Nay (30 phút):
1. Tạo thư mục `src/data/level/n1/`
2. Copy file `bookData.js` hiện tại, tách thành:
   - `n1/books.js` (chỉ metadata)
   - `n1/shinkanzen-n1-bunpou.js` (full data 1 cuốn)
3. Update import trong `QuizPage.jsx`
4. Test xem có chạy không

### Ngày Mai (1-2 giờ):
1. Tạo tool nhập liệu đơn giản (form web hoặc script)
2. Nhập thử 5-10 câu hỏi
3. Export và test

### Tuần Sau:
1. Nhập data thực tế cho 1 cuốn sách
2. Test toàn bộ flow
3. Lặp lại cho các sách khác

---

## 💬 Cần Giúp?

Nếu gặp vấn đề:
1. Check console errors
2. Test từng phần nhỏ
3. Commit code trước khi thay đổi lớn
4. Hỏi khi cần!

**Bắt đầu từ BƯỚC 1 - Tách file đơn giản. Đây là bước an toàn nhất!** 🚀

