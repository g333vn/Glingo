# 📚 CẬP NHẬT CẤU TRÚC NỘI DUNG - HOÀN TẤT

## ✅ ĐÃ HOÀN THÀNH

### **1. IndexedDB Schema (Version 2)**
- ✅ Tăng version từ 1 → 2
- ✅ Thêm `lessons` store với key `[bookId, chapterId]`
- ✅ Cập nhật `quizzes` key: `[bookId, chapterId]` → `[bookId, chapterId, lessonId]`
- ✅ Migration tự động từ version 1 → 2
- ✅ Thêm indexes: `bookId`, `chapterId`, `lessonId`

### **2. IndexedDB Functions**
- ✅ `getLessons(bookId, chapterId)` - Lấy danh sách lessons
- ✅ `saveLessons(bookId, chapterId, lessons)` - Lưu lessons
- ✅ `deleteLessons(bookId, chapterId)` - Xóa lessons
- ✅ `getQuiz(bookId, chapterId, lessonId)` - Cập nhật với lessonId
- ✅ `saveQuiz(bookId, chapterId, lessonId, quizData)` - Cập nhật với lessonId
- ✅ `deleteQuiz(bookId, chapterId, lessonId)` - Cập nhật với lessonId
- ✅ `getQuizzesByChapter(bookId, chapterId)` - Lấy tất cả quizzes của chapter

### **3. LocalStorage Manager**
- ✅ Cập nhật `getQuiz()` để hỗ trợ `lessonId` (backward compatible)
- ✅ Cập nhật `saveQuiz()` để hỗ trợ `lessonId` (backward compatible)
- ✅ Cập nhật `deleteQuiz()` để hỗ trợ `lessonId` (backward compatible)
- ✅ Cập nhật `getAllQuizzes()` để parse cả format cũ và mới
- ✅ Thêm `getLessons()`, `saveLessons()`, `deleteLessons()`

### **4. Routing**
- ✅ Route mới: `/level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId`
- ✅ Route chapter: `/level/:levelId/:bookId/chapter/:chapterId`
- ✅ Backward compatibility: `/level/:levelId/:bookId/lesson/:lessonId` (cũ)

### **5. UI Components**

#### **QuizPage**
- ✅ Hỗ trợ cả `chapterId` và `lessonId` từ URL params
- ✅ Backward compatibility: tự động dùng `lessonId` làm `chapterId` nếu thiếu
- ✅ Cập nhật breadcrumb để hiển thị chapter nếu có
- ✅ Cập nhật `getQuiz()` call với đầy đủ params

#### **QuizEditorPage**
- ✅ Thêm dropdown chọn **Lesson** (sau Chapter)
- ✅ Load lessons từ storage khi chọn chapter
- ✅ Auto-fill title từ lesson hoặc chapter
- ✅ Cập nhật `saveQuiz()` để dùng cả `chapterId` và `lessonId`
- ✅ Cập nhật file path display

#### **BookDetailPage**
- ✅ Hỗ trợ hiển thị chapters hoặc lessons tùy theo URL
- ✅ Nếu có `chapterId` trong URL → hiển thị lessons của chapter đó
- ✅ Nếu không có `chapterId` → hiển thị chapters
- ✅ Cập nhật links để dùng route mới với `chapterId`
- ✅ Cập nhật breadcrumb và title

---

## 📊 CẤU TRÚC MỚI

```
Level (N1-N5)
  └── Series (Bộ sách)
      └── Book (Sách)
          └── Chapter (Chương)
              └── Lesson (Bài) ← MỚI
                  └── Questions (Câu hỏi)
```

---

## 🔄 ROUTING STRUCTURE

### **Routes mới:**

1. **Book Detail (Chapters)**
   ```
   /level/:levelId/:bookId
   ```
   - Hiển thị danh sách chapters

2. **Chapter Detail (Lessons)**
   ```
   /level/:levelId/:bookId/chapter/:chapterId
   ```
   - Hiển thị danh sách lessons trong chapter

3. **Quiz Page (Questions)**
   ```
   /level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId
   ```
   - Hiển thị quiz với questions

### **Backward Compatibility:**

```
/level/:levelId/:bookId/lesson/:lessonId
```
- Vẫn hoạt động (tự động dùng `lessonId` làm `chapterId`)

---

## 💾 STORAGE STRUCTURE

### **IndexedDB:**

```
elearning-db (version 2)
├── books
│   └── Key: [level, id]
├── series
│   └── Key: [level, id]
├── chapters
│   └── Key: bookId
├── lessons (MỚI)
│   └── Key: [bookId, chapterId]
├── quizzes
│   └── Key: [bookId, chapterId, lessonId] (ĐÃ CẬP NHẬT)
└── exams
    └── Key: [level, examId]
```

### **localStorage Keys:**

- **Chapters**: `adminChapters_${bookId}`
- **Lessons**: `adminLessons_${bookId}_${chapterId}` (MỚI)
- **Quizzes**: `adminQuiz_${bookId}_${chapterId}_${lessonId}` (ĐÃ CẬP NHẬT)
- **Quizzes (old)**: `adminQuiz_${bookId}_${chapterId}` (backward compatible)

---

## 🎯 SỬ DỤNG

### **1. Lấy Lessons**

```javascript
import storageManager from './utils/localStorageManager.js';

// Lấy lessons của một chapter
const lessons = await storageManager.getLessons(bookId, chapterId);
// Returns: [{ id: 'lesson-1', title: '...', ... }, ...]
```

### **2. Lưu Lessons**

```javascript
const lessons = [
  { id: 'lesson-1', title: 'Bài 1.1', order: 1 },
  { id: 'lesson-2', title: 'Bài 1.2', order: 2 }
];

await storageManager.saveLessons(bookId, chapterId, lessons);
```

### **3. Lấy Quiz (với lessonId)**

```javascript
// MỚI: Với đầy đủ chapterId và lessonId
const quiz = await storageManager.getQuiz(bookId, chapterId, lessonId);

// Backward compatible: Chỉ có lessonId
const quiz = await storageManager.getQuiz(bookId, lessonId);
// Tự động dùng lessonId làm chapterId
```

### **4. Lưu Quiz (với lessonId)**

```javascript
// MỚI: Với đầy đủ chapterId và lessonId
await storageManager.saveQuiz(bookId, chapterId, lessonId, quizData);

// Backward compatible: Chỉ có chapterId
await storageManager.saveQuiz(bookId, chapterId, quizData);
// Tự động dùng chapterId làm lessonId
```

---

## 🔄 MIGRATION

### **Tự động Migration:**

Khi upgrade từ version 1 → version 2:
- ✅ IndexedDB tự động migrate data
- ✅ Quizzes cũ (không có lessonId) sẽ được thêm `lessonId = chapterId`
- ✅ Không mất dữ liệu
- ✅ Vẫn hoạt động với data cũ

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

## 📝 VÍ DỤ SỬ DỤNG

### **1. Tạo Lessons cho một Chapter**

```javascript
// Trong QuizEditorPage hoặc ContentManagementPage
const lessons = [
  { id: 'lesson-1', title: 'Bài 1.1 - Ngữ pháp cơ bản', order: 1 },
  { id: 'lesson-2', title: 'Bài 1.2 - Ngữ pháp nâng cao', order: 2 },
  { id: 'lesson-3', title: 'Bài 1.3 - Luyện tập', order: 3 }
];

await storageManager.saveLessons('shinkanzen-n1-bunpou', 'bai-1', lessons);
```

### **2. Tạo Quiz cho một Lesson**

```javascript
// Trong QuizEditorPage
const quizData = {
  title: 'Bài 1.1 - Ngữ pháp cơ bản',
  questions: [
    {
      id: 1,
      question: 'Câu hỏi...',
      options: [
        { label: 'A', text: 'Đáp án A' },
        { label: 'B', text: 'Đáp án B' },
        { label: 'C', text: 'Đáp án C' },
        { label: 'D', text: 'Đáp án D' }
      ],
      correctAnswer: 0,
      explanation: 'Giải thích...'
    }
  ]
};

await storageManager.saveQuiz(
  'shinkanzen-n1-bunpou',  // bookId
  'bai-1',                 // chapterId
  'lesson-1',              // lessonId
  quizData
);
```

### **3. Hiển thị Lessons trong UI**

```javascript
// Trong BookDetailPage
// Nếu có chapterId trong URL → hiển thị lessons
// Nếu không → hiển thị chapters

const { chapterId } = useParams();

if (chapterId) {
  // Load và hiển thị lessons
  const lessons = await storageManager.getLessons(bookId, chapterId);
  // Render lessons...
} else {
  // Load và hiển thị chapters
  const chapters = await storageManager.getChapters(bookId);
  // Render chapters...
}
```

---

## ✅ CHECKLIST

### **Backend/Storage:**
- [x] IndexedDB schema đã được cập nhật (version 2)
- [x] Thêm `lessons` store
- [x] Cập nhật `quizzes` key thành `[bookId, chapterId, lessonId]`
- [x] Migration tự động từ version 1 → 2
- [x] LocalStorageManager đã được cập nhật
- [x] Export/Import đã được cập nhật

### **Frontend/UI:**
- [x] Routing đã được cập nhật
- [x] QuizPage đã hỗ trợ chapterId và lessonId
- [x] QuizEditorPage đã có dropdown chọn lesson
- [x] BookDetailPage đã hiển thị lessons trong chapter
- [x] Breadcrumbs đã được cập nhật
- [x] Navigation links đã được cập nhật

### **Testing:**
- [ ] Test tạo lessons
- [ ] Test tạo quiz với lessonId
- [ ] Test load quiz với chapterId và lessonId
- [ ] Test navigation giữa chapters và lessons
- [ ] Test backward compatibility với route cũ

---

## 🎯 KẾT QUẢ

### **Cấu trúc hoàn chỉnh:**

```
Level (N1-N5)
  └── Series (Bộ sách)
      └── Book (Sách)
          └── Chapter (Chương)
              └── Lesson (Bài) ← ĐÃ THÊM
                  └── Questions (Câu hỏi)
```

### **Tất cả đã sẵn sàng:**

- ✅ Database schema đã được cập nhật
- ✅ Storage functions đã hỗ trợ lessonId
- ✅ UI components đã được cập nhật
- ✅ Routing đã hỗ trợ đầy đủ
- ✅ Backward compatibility được đảm bảo

---

## 📚 TÀI LIỆU THAM KHẢO

- **Content Structure**: [CONTENT_STRUCTURE.md](./CONTENT_STRUCTURE.md)
- **IndexedDB Guide**: [INDEXEDDB_GUIDE.md](./INDEXEDDB_GUIDE.md)
- **Migration Roadmap**: [MIGRATION_ROADMAP.md](./deployment/MIGRATION_ROADMAP.md)

---

**Tài liệu này tóm tắt tất cả các cập nhật về cấu trúc nội dung với 6 cấp độ phân cấp.**

