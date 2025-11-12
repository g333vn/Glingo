# 📊 Đề Xuất Cấu Trúc Dữ Liệu Cho Dự Án E-Learning

## 🔍 Đánh Giá Cấu Trúc Hiện Tại

### ✅ Điểm Mạnh
- Dữ liệu được tách riêng khỏi component logic
- Có helper functions để truy xuất dữ liệu
- Cấu trúc rõ ràng: `level/` và `jlpt/` tách biệt

### ⚠️ Vấn Đề Khi Scale Lên
- **File quá lớn**: Với 10,000 câu hỏi (5 levels × 10 books × 20 chapters × 10 questions), file JS sẽ rất nặng
- **Load toàn bộ**: Hiện tại import toàn bộ data vào memory, không cần thiết
- **Khó maintain**: Tất cả data trong 1-2 file, khó quản lý khi có nhiều người edit
- **Performance**: Bundle size lớn, ảnh hưởng đến thời gian load trang

---

## 🎯 Yêu Cầu Dữ Liệu

### Module LEVEL
```
5 cấp độ (N1-N5)
├── Mỗi cấp độ: ~10 cuốn sách
│   ├── Mỗi cuốn: 20 chương
│   │   └── Mỗi chương: ~10 câu hỏi
│   └── Tổng: ~2,000 câu hỏi/cấp độ
└── Tổng: ~10,000 câu hỏi
```

### Module JLPT
```
~15 đề thi (mỗi level)
├── Mỗi đề thi: 2 bài thi
│   ├── Knowledge (言語知識・読解)
│   └── Listening (聴解)
└── Mỗi bài thi: Nhiều câu hỏi (tùy level)
```

---

## 💡 Đề Xuất Cấu Trúc Mới

### Option 1: Phân Cấp Theo Thư Mục (Recommended)

```
src/data/
├── level/
│   ├── index.js                    # Export tất cả, lazy load
│   ├── n1/
│   │   ├── books.json              # Danh sách sách N1
│   │   ├── shinkanzen-n1-bunpou/
│   │   │   ├── metadata.json       # Thông tin sách
│   │   │   └── chapters/
│   │   │       ├── bai-1.json     # 10 câu hỏi
│   │   │       ├── bai-2.json
│   │   │       └── ...
│   │   ├── try-n1-1/
│   │   │   └── ...
│   │   └── ...
│   ├── n2/
│   │   └── ...
│   └── ...
│
└── jlpt/
    ├── index.js
    ├── n1/
    │   ├── exams.json              # Danh sách đề thi
    │   ├── 2024-12/
    │   │   ├── metadata.json       # Thông tin đề thi
    │   │   ├── knowledge.json      # Bài thi Knowledge
    │   │   └── listening.json      # Bài thi Listening
    │   └── ...
    └── ...
```

### Option 2: Lazy Load với Dynamic Import

```javascript
// src/data/level/index.js
export async function getBookData(levelId, bookId) {
  const module = await import(`./${levelId}/${bookId}/metadata.json`);
  return module.default;
}

export async function getChapterData(levelId, bookId, chapterId) {
  const module = await import(`./${levelId}/${bookId}/chapters/${chapterId}.json`);
  return module.default;
}
```

---

## 📝 Cấu Trúc File JSON Mẫu

### 1. `level/n1/books.json`
```json
{
  "books": [
    {
      "id": "shinkanzen-n1-bunpou",
      "title": "新完全マスター 文法 N1",
      "imageUrl": "/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg",
      "totalChapters": 20,
      "chapters": [
        { "id": "bai-1", "title": "Bài 1: Phân biệt cấu trúc A và B" },
        { "id": "bai-2", "title": "Bài 2: Sử dụng trong ngữ cảnh trang trọng" }
      ]
    }
  ]
}
```

### 2. `level/n1/shinkanzen-n1-bunpou/chapters/bai-1.json`
```json
{
  "id": "bai-1",
  "title": "Bài 1: Phân biệt cấu trúc A và B",
  "questions": [
    {
      "id": 1,
      "text": "次の文の空欄に適切な語句を入れなさい。彼は(　　)ために、毎日勉強している。",
      "options": [
        { "label": "A", "text": "試験に合格する" },
        { "label": "B", "text": "試験に合格して" },
        { "label": "C", "text": "試験に合格し" },
        { "label": "D", "text": "試験に合格した" }
      ],
      "correct": "A",
      "explanation": "「～するために」は目的を表す構造で、「する」が適切です。"
    }
  ]
}
```

### 3. `jlpt/n1/exams.json`
```json
{
  "exams": [
    {
      "id": "2024-12",
      "title": "JLPT 2024/12",
      "date": "2024/12",
      "status": "Có sẵn",
      "imageUrl": "/jlpt/n1/2024-12.jpg"
    }
  ]
}
```

### 4. `jlpt/n1/2024-12/knowledge.json`
```json
{
  "sections": [
    {
      "id": "section1",
      "title": "問題1",
      "instruction": "（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
      "timeLimit": 30,
      "questions": [
        {
          "id": 1,
          "category": "knowledge",
          "question": "彼の説明は（　　）で、誰にでも理解できる。",
          "options": ["簡潔", "簡略", "簡易", "簡素"],
          "correctAnswer": 0,
          "explanation": "「簡潔」は「短くてわかりやすい」という意味で..."
        }
      ]
    }
  ]
}
```

---

## 🚀 Implementation Plan

### Phase 1: Tạo Cấu Trúc Thư Mục
1. Tạo thư mục theo cấu trúc đề xuất
2. Di chuyển dữ liệu hiện có sang JSON
3. Tạo helper functions để load data

### Phase 2: Lazy Loading
1. Implement dynamic import cho chapters/questions
2. Chỉ load data khi user cần (khi vào trang quiz)
3. Cache data đã load để tránh load lại

### Phase 3: Data Migration Script
1. Script để convert từ format hiện tại sang JSON
2. Validation script để kiểm tra data integrity
3. Batch import từ Excel/CSV nếu có

---

## 🔧 Helper Functions Mới

```javascript
// src/data/level/index.js
export async function getBooksByLevel(levelId) {
  const { books } = await import(`./${levelId}/books.json`);
  return books;
}

export async function getBookMetadata(levelId, bookId) {
  const metadata = await import(`./${levelId}/${bookId}/metadata.json`);
  return metadata.default;
}

export async function getChapterQuestions(levelId, bookId, chapterId) {
  const chapter = await import(`./${levelId}/${bookId}/chapters/${chapterId}.json`);
  return chapter.default;
}

// src/data/jlpt/index.js
export async function getExamsByLevel(levelId) {
  const { exams } = await import(`./${levelId}/exams.json`);
  return exams;
}

export async function getExamKnowledge(levelId, examId) {
  const knowledge = await import(`./${levelId}/${examId}/knowledge.json`);
  return knowledge.default;
}

export async function getExamListening(levelId, examId) {
  const listening = await import(`./${levelId}/${examId}/listening.json`);
  return listening.default;
}
```

---

## ✅ Lợi Ích

1. **Performance**: Chỉ load data cần thiết, giảm bundle size
2. **Maintainability**: Dễ quản lý, mỗi file nhỏ, dễ edit
3. **Scalability**: Dễ thêm mới sách/chương/câu hỏi
4. **Collaboration**: Nhiều người có thể edit song song
5. **Import từ External**: Dễ import từ Excel/CSV/API

---

## 📋 Next Steps

1. ✅ Review và approve cấu trúc này
2. 🔄 Tạo migration script để convert data hiện tại
3. 🔄 Update components để dùng lazy loading
4. 🔄 Test performance với data lớn
5. 🔄 Setup CI/CD để validate JSON structure

