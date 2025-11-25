# 💾 HƯỚNG DẪN INDEXEDDB - STORAGE SYSTEM

## 🎯 TỔNG QUAN

IndexedDB là hệ thống lưu trữ chính của ứng dụng eLearning, cho phép lưu trữ dữ liệu lớn (hàng GB) ngay trên trình duyệt của user.

---

## 🏗️ KIẾN TRÚC INDEXEDDB

### **Database Structure:**

```
elearning-db (version 1)
├── books
│   ├── Key: [level, id]
│   ├── Index: level
│   └── Data: { level, id, title, description, ... }
│
├── series
│   ├── Key: [level, id]
│   ├── Index: level
│   └── Data: { level, id, title, ... }
│
├── chapters
│   ├── Key: bookId
│   └── Data: { bookId, chapters: [...] }
│
├── quizzes
│   ├── Key: [bookId, chapterId]
│   ├── Index: bookId
│   └── Data: { bookId, chapterId, title, questions: [...] }
│
├── exams
│   ├── Key: [level, examId]
│   ├── Index: level
│   └── Data: { level, examId, title, knowledge_sections, listening_sections, ... }
│
└── levelConfigs
    ├── Key: level
    └── Data: { level, config: {...} }
```

---

## 📊 DỮ LIỆU ĐƯỢC LƯU TRỮ

### **1. Books (Sách)**
- **Mục đích**: Lưu danh sách sách theo level (N1-N5)
- **Key**: `[level, id]` - Composite key
- **Ví dụ**: `['n1', 'shinkanzen-n1-bunpou']`
- **Dung lượng**: ~2 KB/sách × 100 sách = ~200 KB

### **2. Series (Bộ sách)**
- **Mục đích**: Lưu thông tin bộ sách
- **Key**: `[level, id]`
- **Ví dụ**: `['n1', 'shinkanzen']`
- **Dung lượng**: ~1 KB/series × 20 series = ~20 KB

### **3. Chapters (Chương)**
- **Mục đích**: Lưu danh sách chương của mỗi sách
- **Key**: `bookId`
- **Ví dụ**: `'shinkanzen-n1-bunpou'`
- **Data**: `{ bookId: '...', chapters: [{ id: 'bai-1', title: '...' }, ...] }`
- **Dung lượng**: ~5 KB/sách × 100 sách = ~500 KB

### **4. Quizzes (Câu hỏi)**
- **Mục đích**: Lưu câu hỏi quiz cho mỗi bài
- **Key**: `[bookId, chapterId]`
- **Ví dụ**: `['shinkanzen-n1-bunpou', 'bai-1']`
- **Data**: `{ bookId, chapterId, title, questions: [...] }`
- **Dung lượng**: ~50 KB/quiz × 10,000 quiz = ~500 MB

### **5. Exams (Đề thi)**
- **Mục đích**: Lưu đề thi JLPT
- **Key**: `[level, examId]`
- **Ví dụ**: `['n1', 'exam-2024-12']`
- **Data**: `{ level, examId, title, knowledge_sections, listening_sections, ... }`
- **Dung lượng**: ~200 KB/đề × 30 đề = ~6 MB

### **6. Level Configs (Cấu hình)**
- **Mục đích**: Lưu cấu hình cho mỗi level
- **Key**: `level`
- **Ví dụ**: `'n1'`
- **Dung lượng**: ~1 KB/level × 5 levels = ~5 KB

---

## 🔧 SỬ DỤNG INDEXEDDB

### **1. Khởi tạo**

```javascript
import indexedDBManager from './utils/indexedDBManager.js';

// IndexedDB tự động khởi tạo khi import
// Không cần gọi init() thủ công
```

### **2. Lưu dữ liệu**

```javascript
// Lưu books
await indexedDBManager.saveBooks('n1', [
  { id: 'shinkanzen-n1-bunpou', title: 'Shinkanzen N1 Bunpou', ... }
]);

// Lưu quiz
await indexedDBManager.saveQuiz(
  'shinkanzen-n1-bunpou',
  'bai-1',
  {
    title: 'Bài 1',
    questions: [...]
  }
);
```

### **3. Đọc dữ liệu**

```javascript
// Đọc books
const books = await indexedDBManager.getBooks('n1');

// Đọc quiz
const quiz = await indexedDBManager.getQuiz(
  'shinkanzen-n1-bunpou',
  'bai-1'
);
```

### **4. Xóa dữ liệu**

```javascript
// Xóa quiz
await indexedDBManager.deleteQuiz('shinkanzen-n1-bunpou', 'bai-1');

// Xóa tất cả books của level
await indexedDBManager.deleteBooks('n1');
```

---

## 📈 PERFORMANCE OPTIMIZATION

### **1. Batch Operations**

**Vấn đề**: Lưu từng item một sẽ chậm

```javascript
// ❌ Chậm
for (const quiz of quizzes) {
  await indexedDBManager.saveQuiz(quiz.bookId, quiz.chapterId, quiz);
}
```

**Giải pháp**: Dùng transaction batch

```javascript
// ✅ Nhanh hơn
async function saveQuizzesBatch(quizzes) {
  if (!(await indexedDBManager.isAvailable())) return false;
  
  const db = indexedDBManager.db;
  const tx = db.transaction('quizzes', 'readwrite');
  const store = tx.objectStore('quizzes');
  
  for (const quiz of quizzes) {
    await store.put({
      bookId: quiz.bookId,
      chapterId: quiz.chapterId,
      ...quiz
    });
  }
  
  await tx.done;
  return true;
}
```

### **2. Indexing**

**Indexes đã được tạo:**
- `books.level` - Tìm books theo level
- `series.level` - Tìm series theo level
- `quizzes.bookId` - Tìm quizzes theo book
- `exams.level` - Tìm exams theo level

**Sử dụng index:**

```javascript
// ✅ Sử dụng index (nhanh)
const tx = db.transaction('books', 'readonly');
const store = tx.objectStore('books');
const index = store.index('level');
const books = await index.getAll('n1'); // Nhanh!

// ❌ Không dùng index (chậm)
const allBooks = await store.getAll();
const n1Books = allBooks.filter(b => b.level === 'n1'); // Chậm!
```

### **3. Caching Strategy**

**Cache trong memory:**

```javascript
class QuizCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Cache 50 quiz gần đây
  }
  
  async get(bookId, chapterId) {
    const key = `${bookId}_${chapterId}`;
    
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // Load from IndexedDB
    const quiz = await indexedDBManager.getQuiz(bookId, chapterId);
    if (quiz) {
      // Add to cache
      if (this.cache.size >= this.maxSize) {
        // Remove oldest (FIFO)
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, quiz);
    }
    
    return quiz;
  }
}
```

---

## 🔍 DEBUGGING INDEXEDDB

### **1. Xem dữ liệu trong DevTools**

**Chrome DevTools:**
1. Mở DevTools (F12)
2. Tab "Application"
3. Bên trái: "IndexedDB" → `elearning-db`
4. Xem các stores và data

**Firefox DevTools:**
1. Mở DevTools (F12)
2. Tab "Storage"
3. "IndexedDB" → `elearning-db`
4. Xem các stores và data

### **2. Console Logging**

```javascript
// Enable debug logging
indexedDBManager.debug = true;

// Xem tất cả quizzes
const allQuizzes = await indexedDBManager.getAllQuizzes();
console.log('All quizzes:', allQuizzes);
```

### **3. Storage Info**

```javascript
// Xem thông tin storage
const info = await indexedDBManager.getStorageInfo();
console.log('Storage info:', info);
// {
//   totalSize: '500 MB',
//   totalSizeBytes: 524288000,
//   itemCount: 10000,
//   items: [
//     { store: 'quizzes', count: 5000, size: '250 MB' },
//     ...
//   ]
// }
```

---

## 🚨 XỬ LÝ LỖI

### **1. IndexedDB không available**

```javascript
if (!('indexedDB' in window)) {
  console.warn('IndexedDB không được hỗ trợ');
  // Fallback to localStorage
}
```

### **2. Quota Exceeded**

```javascript
try {
  await indexedDBManager.saveQuiz(bookId, chapterId, quiz);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.error('Hết dung lượng IndexedDB!');
    // Clear old data hoặc thông báo user
  }
}
```

### **3. Version Conflict**

```javascript
// Nếu có version conflict, xóa database cũ
await indexedDBManager.deleteDatabase();
await indexedDBManager.init();
```

---

## 📤 EXPORT & IMPORT DATA

### **1. Export tất cả data**

```javascript
// Export to JSON
const data = await indexedDBManager.exportAll();

// Download as file
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `elearning-backup-${Date.now()}.json`;
a.click();
```

### **2. Import data**

```javascript
// Read file
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Import
  const result = await indexedDBManager.importAll(data);
  if (result.success) {
    console.log('✅ Import thành công!');
  }
};
fileInput.click();
```

---

## 🔄 MIGRATION TO SERVER

### **Khi nào cần migration?**

- ✅ Khi muốn chia sẻ data giữa users
- ✅ Khi muốn backup tập trung
- ✅ Khi muốn quản lý data từ server

### **Migration Strategy:**

```javascript
// 1. Export từ IndexedDB
const data = await indexedDBManager.exportAll();

// 2. Transform data format (nếu cần)
const transformedData = transformToSupabaseFormat(data);

// 3. Upload to Supabase
for (const quiz of transformedData.quizzes) {
  await supabase.from('quizzes').upsert(quiz);
}
```

**Xem chi tiết:** [MIGRATION_ROADMAP.md](./deployment/MIGRATION_ROADMAP.md)

---

## 📊 GIỚI HẠN & BEST PRACTICES

### **Giới hạn:**

| Browser | Giới hạn |
|---------|----------|
| Chrome | ~60% dung lượng ổ cứng còn trống (thường 10-50 GB) |
| Firefox | ~50% dung lượng ổ cứng còn trống |
| Safari | ~1 GB (giới hạn nghiêm ngặt) |
| Edge | Tương tự Chrome |

### **Best Practices:**

1. ✅ **Dùng IndexedDB cho data lớn** (>1 MB)
2. ✅ **Dùng localStorage cho data nhỏ** (<1 MB)
3. ✅ **Cache data trong memory** cho data thường dùng
4. ✅ **Batch operations** khi có nhiều data
5. ✅ **Cleanup old data** định kỳ
6. ✅ **Export backup** thường xuyên
7. ✅ **Handle errors** gracefully

### **Không nên:**

1. ❌ **Lưu file audio lớn** trong IndexedDB (dùng CDN)
2. ❌ **Lưu quá nhiều data không cần thiết**
3. ❌ **Không handle errors**
4. ❌ **Không cleanup old data**

---

## 🛠️ TOOLS & UTILITIES

### **1. Storage Monitor**

Tạo component để monitor storage:

```javascript
// components/StorageMonitor.jsx
import { useState, useEffect } from 'react';
import indexedDBManager from '../utils/indexedDBManager.js';

export default function StorageMonitor() {
  const [info, setInfo] = useState(null);
  
  useEffect(() => {
    async function loadInfo() {
      const storageInfo = await indexedDBManager.getStorageInfo();
      setInfo(storageInfo);
    }
    loadInfo();
  }, []);
  
  if (!info) return <div>Loading...</div>;
  
  return (
    <div>
      <h3>Storage Info</h3>
      <p>Total: {info.totalSize}</p>
      <p>Items: {info.itemCount}</p>
      <ul>
        {info.items.map(item => (
          <li key={item.store}>
            {item.store}: {item.count} items ({item.size})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### **2. Data Cleanup Tool**

```javascript
// Cleanup old quizzes (older than 30 days)
async function cleanupOldQuizzes() {
  const allQuizzes = await indexedDBManager.getAllQuizzes();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (const quiz of allQuizzes) {
    if (quiz.lastAccessed && quiz.lastAccessed < thirtyDaysAgo) {
      await indexedDBManager.deleteQuiz(quiz.bookId, quiz.chapterId);
    }
  }
}
```

---

## ✅ CHECKLIST

### **Setup:**
- [x] IndexedDB đã được khởi tạo
- [x] Tất cả stores đã được tạo
- [x] Indexes đã được setup
- [x] Error handling đã được implement

### **Usage:**
- [x] Save/Get operations hoạt động
- [x] Batch operations được optimize
- [x] Caching strategy được implement
- [x] Export/Import hoạt động

### **Monitoring:**
- [x] Storage info có thể xem được
- [x] Debug logging hoạt động
- [x] DevTools có thể inspect

---

## 📚 TÀI LIỆU THAM KHẢO

- **MDN IndexedDB Guide**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **idb Library**: https://github.com/jakearchibald/idb
- **Storage Capacity Analysis**: [STORAGE_CAPACITY_ANALYSIS.md](./deployment/STORAGE_CAPACITY_ANALYSIS.md)
- **Migration Roadmap**: [MIGRATION_ROADMAP.md](./deployment/MIGRATION_ROADMAP.md)

---

**Tài liệu này mô tả cách sử dụng IndexedDB trong dự án eLearning.**

