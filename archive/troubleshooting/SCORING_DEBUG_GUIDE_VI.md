# 🐛 HƯỚNG DẪN DEBUG LOGIC TÍNH ĐIỂM

## 📋 VẤN ĐỀ

Sau khi làm lại bài thi, kết quả vẫn hiển thị 0 điểm cho tất cả các phần.

## 🔍 CÁCH DEBUG

### **Bước 1: Mở Console (F12)**

1. Mở trình duyệt
2. Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Chọn tab **Console**

### **Bước 2: Làm lại bài thi**

1. Làm bài thi Knowledge/Reading
2. Submit bài thi
3. Kiểm tra console logs:

```
[ExamKnowledge] Breakdown calculated: {
  knowledgeCorrect: X,
  knowledgeTotal: Y,
  readingCorrect: Z,
  readingTotal: W,
  ...
}
[ExamKnowledge] Saving breakdown to localStorage: {...}
```

4. Làm bài thi Listening
5. Submit bài thi
6. Kiểm tra console logs:

```
[ExamListening] Breakdown calculated: {
  listeningCorrect: X,
  listeningTotal: Y,
  ...
}
[ExamListening] Saving breakdown to localStorage: {...}
```

### **Bước 3: Kiểm tra Result Page**

1. Vào trang kết quả
2. Kiểm tra console logs:

```
[ExamResult] Reading from localStorage: {...}
[ExamResult] Breakdown loaded: {...}
[ExamResult] Calculated score: X/Y = Z × 60 = W
```

## 🔧 CÁC VẤN ĐỀ THƯỜNG GẶP

### **Vấn đề 1: Breakdown = 0**

**Nguyên nhân:**
- Category detection không đúng
- Answers không được lưu đúng
- So sánh type không khớp (string vs number)

**Giải pháp:**
- Kiểm tra console log `[ExamKnowledge] Breakdown calculated`
- Nếu `knowledgeTotal = 0` hoặc `readingTotal = 0`: Category detection có vấn đề
- Nếu `knowledgeCorrect = 0` nhưng `knowledgeTotal > 0`: So sánh answers có vấn đề

### **Vấn đề 2: Breakdown không được lưu**

**Nguyên nhân:**
- localStorage bị clear
- Key không đúng format

**Giải pháp:**
- Kiểm tra console log `[ExamKnowledge] Saving breakdown to localStorage`
- Kiểm tra localStorage trong Application tab (F12):
  - Key: `exam-{levelId}-{examId}-knowledge-breakdown`
  - Key: `exam-{levelId}-{examId}-listening-breakdown`

### **Vấn đề 3: Breakdown được lưu nhưng không đọc được**

**Nguyên nhân:**
- Dữ liệu cũ trong localStorage
- Format JSON không đúng

**Giải pháp:**
1. Clear localStorage cũ:
   ```javascript
   // Chạy trong Console
   Object.keys(localStorage).forEach(key => {
     if (key.startsWith('exam-n1-2025-7')) {
       console.log('Removing:', key);
       localStorage.removeItem(key);
     }
   });
   ```
2. Làm lại bài thi từ đầu

### **Vấn đề 4: Type mismatch (string vs number)**

**Nguyên nhân:**
- `answers[questionKey]` là string nhưng `q.correctAnswer` là number (hoặc ngược lại)
- So sánh `===` không khớp

**Giải pháp:**
- Code đã được sửa để normalize về Number trước khi so sánh
- Nếu vẫn có vấn đề, kiểm tra console log để xem giá trị thực tế

## 📊 KIỂM TRA DỮ LIỆU

### **Kiểm tra localStorage:**

```javascript
// Chạy trong Console
const levelId = 'n1';
const examId = '2025-7';

// Kiểm tra knowledge breakdown
const knowledgeBreakdown = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-breakdown`);
console.log('Knowledge breakdown:', JSON.parse(knowledgeBreakdown));

// Kiểm tra listening breakdown
const listeningBreakdown = localStorage.getItem(`exam-${levelId}-${examId}-listening-breakdown`);
console.log('Listening breakdown:', JSON.parse(listeningBreakdown));

// Kiểm tra answers
const knowledgeAnswers = localStorage.getItem(`exam-${levelId}-${examId}-knowledge`);
console.log('Knowledge answers:', JSON.parse(knowledgeAnswers));

const listeningAnswers = localStorage.getItem(`exam-${levelId}-${examId}-listening`);
console.log('Listening answers:', JSON.parse(listeningAnswers));
```

## ✅ CHECKLIST DEBUG

- [ ] Console logs hiển thị breakdown được tính đúng
- [ ] Breakdown được lưu vào localStorage
- [ ] Breakdown được đọc từ localStorage đúng
- [ ] Tính điểm từ breakdown đúng
- [ ] Không có lỗi JavaScript trong console
- [ ] localStorage không bị clear bất ngờ

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

1. **Clear toàn bộ localStorage:**
   ```javascript
   // Chạy trong Console
   localStorage.clear();
   ```

2. **Làm lại bài thi từ đầu**

3. **Kiểm tra lại console logs** theo các bước trên

4. **Gửi console logs** cho developer để debug tiếp

---

**Lưu ý:** Sau khi sửa code, cần:
1. Hard refresh trang (Ctrl+Shift+R hoặc Cmd+Shift+R)
2. Clear cache nếu cần
3. Làm lại bài thi từ đầu

