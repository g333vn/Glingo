# 📋 CONSOLE LOGS ĐƯỢC THÊM ĐỂ DEBUG

## 📍 Vị trí: ExamKnowledgePage.jsx - handleSubmit()

### Log 1: Exam data structure
```javascript
[ExamKnowledge] Exam data structure: {
  knowledgeSectionsCount: X,        // Số sections của Knowledge
  readingSectionsCount: Y,          // Số sections của Reading
  knowledgeQuestionsCount: Z,       // Tổng câu hỏi Knowledge
  readingQuestionsCount: W,         // Tổng câu hỏi Reading
  allQuestionsCount: Z+W,           // Tổng tất cả câu hỏi
  answersCount: A                   // Số câu hỏi đã trả lời
}
```

**Giải thích:**
- Nếu `knowledgeSectionsCount = 0` hoặc `readingSectionsCount = 0`: Có vấn đề load dữ liệu
- Nếu `answersCount = 0`: Không có câu hỏi nào được trả lời
- Nếu `answersCount < allQuestionsCount`: Có câu hỏi chưa được trả lời

### Log 2: Question category map size
```javascript
[ExamKnowledge] Question category map size: 66
```

**Giải thích:**
- Giá trị này phải = `knowledgeQuestionsCount + readingQuestionsCount`
- Nếu = 0: Có vấn đề trong quá trình mapping questions

### Log 3 (nếu có lỗi): Questions mapping error
```javascript
[ExamKnowledge] ❌ ERROR: No questions mapped! knowledgeSections or readingSections might be empty
knowledgeSections: [...]  // Xem dữ liệu chi tiết
readingSections: [...]    // Xem dữ liệu chi tiết
```

### Log 4: Chi tiết từng câu hỏi (5 câu đầu)
```javascript
[ExamKnowledge] Question 0: ID=1, category=knowledge, userAnswer=0, correct=0, isCorrect=true
[ExamKnowledge] Question 1: ID=2, category=knowledge, userAnswer=undefined, correct=1, isCorrect=false
[ExamKnowledge] Question 2: ID=3, category=reading, userAnswer=1, correct=2, isCorrect=false
...
```

**Giải thích:**
- `ID`: ID của câu hỏi
- `category`: Phân loại (knowledge/reading)
- `userAnswer`: Câu trả lời của user (undefined = chưa trả lời)
- `correct`: Đáp án đúng
- `isCorrect`: Có trả lời đúng không

### Log 5: Breakdown calculated
```javascript
[ExamKnowledge] Breakdown calculated: {
  knowledgeCorrect: 10,
  knowledgeTotal: 44,
  readingCorrect: 2,
  readingTotal: 22,
  totalQuestions: 96,
  answersCount: 9,
  questionCategoryMapSize: 66
}
```

**Giải thích:**
- `knowledgeCorrect`: Số câu Knowledge đúng
- `knowledgeTotal`: Tổng câu Knowledge
- `readingCorrect`: Số câu Reading đúng
- `readingTotal`: Tổng câu Reading
- Nếu `knowledgeTotal = 0` hoặc `readingTotal = 0`: Có vấn đề trong logic category

### Log 6: Lưu breakdown
```javascript
[ExamKnowledge] Saving breakdown to localStorage: {
  knowledge: 10,
  reading: 2,
  totals: { knowledge: 44, reading: 22 }
}
```

---

## 📍 Vị trí: JLPTExamResultPage.jsx - loadExamResults()

### Log 7: Reading từ localStorage
```javascript
[ExamResult] Reading from localStorage: {
  knowledgeBreakdownStr: '{"knowledge":10,"reading":2,"totals":{"knowledge":44,"reading":22}}',
  listeningBreakdownStr: '{"listening":5,"total":30}'
}
```

### Log 8: Breakdown loaded
```javascript
[ExamResult] Breakdown loaded: {
  knowledgeBreakdown: { knowledge: 10, reading: 2, totals: { knowledge: 44, reading: 22 } },
  listeningBreakdown: { listening: 5, total: 30 }
}
```

### Log 9: Tính điểm
```javascript
[ExamResult] Calculated score: 10/44 = 0.23 × 60 = 14
[ExamResult] Calculated score: 2/22 = 0.09 × 60 = 5
[ExamResult] Calculated score: 5/30 = 0.17 × 60 = 10
```

**Giải thích:**
- Nếu không thấy log này: có vấn đề trong quá trình tính điểm
- Nếu `× 60` không hiển thị: maxScore có vấn đề

---

## 🔍 CÁCH ĐỌC LOGS

### **Bước 1: Mở Console (F12)**

### **Bước 2: Làm lại bài thi và submit**

### **Bước 3: Tìm các log theo thứ tự:**
1. `[ExamKnowledge] Exam data structure:` - Xem cấu trúc dữ liệu
2. `[ExamKnowledge] Question category map size:` - Xem có bao nhiêu câu được map
3. `[ExamKnowledge] Question 0: ...` - Xem chi tiết từng câu
4. `[ExamKnowledge] Breakdown calculated:` - Xem breakdown kết quả
5. `[ExamKnowledge] Saving breakdown to localStorage:` - Xem dữ liệu lưu vào localStorage

### **Bước 4: Vào trang Result**

1. Tìm các log:
   - `[ExamResult] Reading from localStorage:`
   - `[ExamResult] Breakdown loaded:`
   - `[ExamResult] Calculated score:`

---

## ⚠️ NHỮNG LỖI THƯỜNG GẶP

### **Lỗi 1: knowledgeSectionsCount = 0**
- Exam data không load đúng từ static file hoặc Supabase
- Kiểm tra: `knowledgeData.knowledge?.sections` có tồn tại không

### **Lỗi 2: answersCount = 0**
- Không có câu hỏi nào được trả lời
- Kiểm tra: localStorage key `exam-{levelId}-{examId}-knowledge` có tồn tại không

### **Lỗi 3: questionCategoryMapSize = 0**
- knowledgeSections hoặc readingSections rỗng
- Kiểm tra: examData.knowledge và examData.reading có dữ liệu không

### **Lỗi 4: userAnswer = undefined**
- Câu hỏi không được trả lời
- Bình thường nếu user không làm hết bài

### **Lỗi 5: isCorrect = false nhưng userAnswer = correct**
- Type mismatch (string vs number)
- Phải convert về cùng type

---

## 📊 CHECKLIST KIỂM TRA

### **Khi submit Knowledge page:**
- [ ] `Exam data structure` log có các giá trị > 0
- [ ] `Question category map size` = tổng câu hỏi
- [ ] `Question 0: ...` log hiển thị đúng category
- [ ] `Breakdown calculated` có knowledgeTotal > 0 và readingTotal > 0
- [ ] `Saving breakdown to localStorage` log hiển thị breakdown đúng

### **Khi vào Result page:**
- [ ] `Reading from localStorage` log hiển thị breakdown từ localStorage
- [ ] `Breakdown loaded` log hiển thị dữ liệu đúng
- [ ] `Calculated score` log hiển thị điểm cho mỗi phần

---

## 🆘 GỬI LOGS CHO DEVELOPER

Nếu vấn đề vẫn không giải quyết được, copy toàn bộ console logs và gửi cho developer:

```
[Ghi lại từ đây]
[ExamKnowledge] Exam data structure: {...}
[ExamKnowledge] Question category map size: X
[ExamKnowledge] Question 0: ...
[ExamKnowledge] Breakdown calculated: {...}
[ExamKnowledge] Saving breakdown to localStorage: {...}
[ExamResult] Reading from localStorage: {...}
[ExamResult] Breakdown loaded: {...}
[ExamResult] Calculated score: ...
[Ghi lại đến đây]
```

---

**Lưu ý:** Các logs này sẽ giúp developer nhanh chóng xác định vấn đề trong quá trình tính điểm.

