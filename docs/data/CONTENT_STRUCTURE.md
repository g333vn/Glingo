# 📚 CẤU TRÚC NỘI DUNG SÁCH - HIỆU CHỈNH

## 🎯 TỔNG QUAN

Cấu trúc nội dung sách được tổ chức theo 6 cấp độ phân cấp:

```
Level (Cấp độ)
  └── Series (Bộ sách)
      └── Book (Sách)
          └── Chapter (Chương)
              └── Lesson (Bài)
                  └── Questions (Câu hỏi)
```

---

## 📊 CHI TIẾT TỪNG CẤP ĐỘ

### **1. Level (Cấp độ)**
- **Mục đích**: Phân loại theo trình độ JLPT
- **Giá trị**: `n1`, `n2`, `n3`, `n4`, `n5`
- **Ví dụ**: `n1` (N1 - Trình độ cao nhất)

**Lưu trữ:**
- IndexedDB: `levelConfigs` store
- Key: `level` (ví dụ: `'n1'`)

---

### **2. Series (Bộ sách)**
- **Mục đích**: Nhóm các sách cùng series
- **Ví dụ**: `'shinkanzen'`, `'try'`, `'sou'`
- **Thuộc về**: Level

**Lưu trữ:**
- IndexedDB: `series` store
- Key: `[level, id]` (ví dụ: `['n1', 'shinkanzen']`)
- Data: `{ level, id, title, description, ... }`

**Ví dụ:**
```javascript
{
  level: 'n1',
  id: 'shinkanzen',
  title: '新完全マスター',
  description: 'Bộ sách Shinkanzen Master'
}
```

---

### **3. Book (Sách)**
- **Mục đích**: Một cuốn sách cụ thể
- **Ví dụ**: `'shinkanzen-n1-bunpou'`, `'shinkanzen-n1-dokkai'`
- **Thuộc về**: Series (thông qua level)

**Lưu trữ:**
- IndexedDB: `books` store
- Key: `[level, id]` (ví dụ: `['n1', 'shinkanzen-n1-bunpou']`)
- Data: `{ level, id, title, description, seriesId, ... }`

**Ví dụ:**
```javascript
{
  level: 'n1',
  id: 'shinkanzen-n1-bunpou',
  title: '新完全マスター N1 文法',
  description: 'Ngữ pháp N1',
  seriesId: 'shinkanzen'
}
```

---

### **4. Chapter (Chương)**
- **Mục đích**: Chia sách thành các chương
- **Ví dụ**: `'bai-1'`, `'bai-2'`, `'unit-1'`
- **Thuộc về**: Book

**Lưu trữ:**
- IndexedDB: `chapters` store
- Key: `bookId` (ví dụ: `'shinkanzen-n1-bunpou'`)
- Data: `{ bookId, chapters: [{ id, title, order, ... }, ...] }`

**Ví dụ:**
```javascript
{
  bookId: 'shinkanzen-n1-bunpou',
  chapters: [
    { id: 'bai-1', title: 'Bài 1', order: 1 },
    { id: 'bai-2', title: 'Bài 2', order: 2 },
    ...
  ]
}
```

---

### **5. Lesson (Bài) - MỚI**
- **Mục đích**: Chia chương thành các bài học cụ thể
- **Ví dụ**: `'lesson-1'`, `'lesson-2'`, `'bai-1-1'`
- **Thuộc về**: Chapter

**Lưu trữ:**
- IndexedDB: `lessons` store
- Key: `[bookId, chapterId]` (ví dụ: `['shinkanzen-n1-bunpou', 'bai-1']`)
- Data: `{ bookId, chapterId, lessons: [{ id, title, order, ... }, ...] }`

**Ví dụ:**
```javascript
{
  bookId: 'shinkanzen-n1-bunpou',
  chapterId: 'bai-1',
  lessons: [
    { id: 'lesson-1', title: 'Bài 1.1', order: 1 },
    { id: 'lesson-2', title: 'Bài 1.2', order: 2 },
    ...
  ]
}
```

---

### **6. Questions (Câu hỏi)**
- **Mục đích**: Câu hỏi quiz cho mỗi bài
- **Thuộc về**: Lesson

**Lưu trữ:**
- IndexedDB: `quizzes` store
- Key: `[bookId, chapterId, lessonId]` (ví dụ: `['shinkanzen-n1-bunpou', 'bai-1', 'lesson-1']`)
- Data: `{ bookId, chapterId, lessonId, title, questions: [...], ... }`

**Ví dụ:**
```javascript
{
  bookId: 'shinkanzen-n1-bunpou',
  chapterId: 'bai-1',
  lessonId: 'lesson-1',
  title: 'Bài 1.1 - Ngữ pháp cơ bản',
  questions: [
    {
      id: 1,
      question: 'Câu hỏi...',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: 'Giải thích...'
    },
    ...
  ]
}
```

---

## 🔄 THAY ĐỔI TỪ CẤU TRÚC CŨ

### **Cấu trúc cũ:**
```
Level → Series → Book → Chapter → Questions
```

### **Cấu trúc mới:**
```
Level → Series → Book → Chapter → Lesson → Questions
```

### **Thay đổi chính:**

1. ✅ **Thêm cấp độ Lesson** giữa Chapter và Questions
2. ✅ **Quizzes key thay đổi**: Từ `[bookId, chapterId]` → `[bookId, chapterId, lessonId]`
3. ✅ **Thêm `lessons` store** trong IndexedDB
4. ✅ **Migration tự động**: Data cũ sẽ được migrate (lessonId = chapterId)

---

## 📝 VÍ DỤ ĐẦY ĐỦ

```
Level: N1
│
├── Series: Shinkanzen (新完全マスター)
│   │
│   ├── Book: Shinkanzen N1 Bunpou (文法)
│   │   │
│   │   ├── Chapter: Bài 1
│   │   │   │
│   │   │   ├── Lesson: Bài 1.1
│   │   │   │   └── Questions: [10 câu hỏi]
│   │   │   │
│   │   │   ├── Lesson: Bài 1.2
│   │   │   │   └── Questions: [10 câu hỏi]
│   │   │   │
│   │   │   └── Lesson: Bài 1.3
│   │   │       └── Questions: [10 câu hỏi]
│   │   │
│   │   ├── Chapter: Bài 2
│   │   │   └── ...
│   │   │
│   │   └── Chapter: Bài 3
│   │       └── ...
│   │
│   ├── Book: Shinkanzen N1 Dokkai (読解)
│   │   └── ...
│   │
│   └── Book: Shinkanzen N1 Goi (語彙)
│       └── ...
│
└── Series: Try
    └── ...
```

---

## 💾 LƯU TRỮ TRONG INDEXEDDB

### **Database Schema:**

```
elearning-db (version 2)
│
├── levelConfigs
│   ├── Key: level
│   └── Data: { level, config: {...} }
│
├── series
│   ├── Key: [level, id]
│   ├── Index: level
│   └── Data: { level, id, title, ... }
│
├── books
│   ├── Key: [level, id]
│   ├── Index: level
│   └── Data: { level, id, title, seriesId, ... }
│
├── chapters
│   ├── Key: bookId
│   └── Data: { bookId, chapters: [...] }
│
├── lessons (MỚI)
│   ├── Key: [bookId, chapterId]
│   ├── Index: bookId, chapterId
│   └── Data: { bookId, chapterId, lessons: [...] }
│
├── quizzes
│   ├── Key: [bookId, chapterId, lessonId] (ĐÃ CẬP NHẬT)
│   ├── Index: bookId, chapterId, lessonId
│   └── Data: { bookId, chapterId, lessonId, title, questions: [...] }
│
└── exams
    ├── Key: [level, examId]
    └── Data: { level, examId, ... }
```

---

## 🔧 SỬ DỤNG API

### **1. Lấy Lessons**

```javascript
import indexedDBManager from './utils/indexedDBManager.js';

// Lấy tất cả lessons của một chapter
const lessons = await indexedDBManager.getLessons(bookId, chapterId);
// Returns: [{ id: 'lesson-1', title: '...', ... }, ...]
```

### **2. Lưu Lessons**

```javascript
const lessons = [
  { id: 'lesson-1', title: 'Bài 1.1', order: 1 },
  { id: 'lesson-2', title: 'Bài 1.2', order: 2 }
];

await indexedDBManager.saveLessons(bookId, chapterId, lessons);
```

### **3. Lấy Quiz (với lessonId)**

```javascript
// CŨ (không còn hoạt động):
// const quiz = await indexedDBManager.getQuiz(bookId, chapterId);

// MỚI:
const quiz = await indexedDBManager.getQuiz(bookId, chapterId, lessonId);
```

### **4. Lưu Quiz (với lessonId)**

```javascript
// CŨ (không còn hoạt động):
// await indexedDBManager.saveQuiz(bookId, chapterId, quizData);

// MỚI:
await indexedDBManager.saveQuiz(bookId, chapterId, lessonId, quizData);
```

### **5. Lấy tất cả quizzes của một chapter**

```javascript
// Lấy tất cả quizzes của một chapter (backward compatibility)
const quizzes = await indexedDBManager.getQuizzesByChapter(bookId, chapterId);
// Returns: [{ bookId, chapterId, lessonId, ... }, ...]
```

---

## 🔄 MIGRATION

### **Tự động Migration:**

Khi upgrade từ version 1 → version 2:
- ✅ IndexedDB tự động migrate data
- ✅ Quizzes cũ (không có lessonId) sẽ được thêm `lessonId = chapterId`
- ✅ Không mất dữ liệu

### **Manual Migration (nếu cần):**

```javascript
// Export data cũ
const oldData = await indexedDBManager.exportAll();

// Transform data
for (const key in oldData.quizzes) {
  const quiz = oldData.quizzes[key];
  if (!quiz.lessonId) {
    quiz.lessonId = quiz.chapterId; // Set lessonId = chapterId
  }
}

// Import lại
await indexedDBManager.importAll(oldData);
```

---

## 📊 DUNG LƯỢNG ƯỚC TÍNH

| Cấp độ | Số lượng | Dung lượng |
|--------|----------|------------|
| Levels | 5 | ~5 KB |
| Series | ~20 | ~20 KB |
| Books | ~100 | ~200 KB |
| Chapters | ~100 | ~500 KB |
| **Lessons** | **~1,000** | **~500 KB** |
| Quizzes | ~10,000 | ~500 MB |
| **TỔNG** | **~11,225** | **~500 MB** |

---

## ✅ CHECKLIST

### **Cập nhật Code:**
- [x] IndexedDB schema đã được cập nhật (version 2)
- [x] Thêm `lessons` store
- [x] Cập nhật `quizzes` key thành `[bookId, chapterId, lessonId]`
- [x] Thêm functions: `getLessons`, `saveLessons`, `deleteLessons`
- [x] Cập nhật `getQuiz`, `saveQuiz`, `deleteQuiz` để hỗ trợ `lessonId`
- [x] Migration tự động từ version 1 → 2
- [x] Export/Import đã được cập nhật

### **Cần cập nhật:**
- [ ] localStorageManager để hỗ trợ lessonId
- [ ] UI components để hiển thị lessons
- [ ] Quiz Editor để tạo/sửa quiz với lessonId
- [ ] Routing để hỗ trợ lessonId trong URL

---

## 📚 TÀI LIỆU THAM KHẢO

- **IndexedDB Guide**: [INDEXEDDB_GUIDE.md](./INDEXEDDB_GUIDE.md)
- **Content Management**: [CONTENT_MANAGEMENT_GUIDE.md](../CONTENT_MANAGEMENT_GUIDE.md)
- **Migration Roadmap**: [MIGRATION_ROADMAP.md](./deployment/MIGRATION_ROADMAP.md)

---

**Tài liệu này mô tả cấu trúc nội dung sách mới với 6 cấp độ phân cấp.**

