# 📍 VỊ TRÍ LƯU TRỮ DỮ LIỆU

## 🎯 TÓM TẮT

Dữ liệu bạn tạo (Series, Books, Chapters, Lessons, Quizzes) được lưu trữ **LOCAL** trên trình duyệt của bạn, không phải trên server.

---

## 💾 NƠI LƯU TRỮ

### **1. IndexedDB (Primary - Ưu tiên)**

**Database Name:** `elearning-db`  
**Version:** 2

**Vị trí trên máy tính:**

#### **Windows:**
```
Chrome/Edge:
C:\Users\[TênUser]\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\


Firefox:
C:\Users\[TênUser]\AppData\Roaming\Mozilla\Firefox\Profiles\[Profile]\storage\default\https+++192.168.1.233\idb\
```

#### **Mac:**
```
Chrome/Edge:
~/Library/Application Support/Google/Chrome/Default/IndexedDB/https_192.168.1.233_0.indexeddb.leveldb/

Firefox:
~/Library/Application Support/Firefox/Profiles/[Profile]/storage/default/https+++192.168.1.233/idb/
```

#### **Linux:**
```
Chrome/Edge:
~/.config/google-chrome/Default/IndexedDB/https_192.168.1.233_0.indexeddb.leveldb/

Firefox:
~/.mozilla/firefox/[Profile]/storage/default/https+++192.168.1.233/idb/
```

### **2. localStorage (Fallback - Nếu IndexedDB không khả dụng)**

**Vị trí:** Cùng thư mục với IndexedDB, nhưng trong file `localStorage`

**Key pattern:**
- `elearning_books_n1` - Books của level N1
- `elearning_series_n1` - Series của level N1
- `elearning_chapters_[bookId]` - Chapters của book
- `elearning_lessons_[bookId]_[chapterId]` - Lessons
- `elearning_quiz_[bookId]_[chapterId]_[lessonId]` - Quiz

---

## 📊 CẤU TRÚC DATABASE

### **IndexedDB Object Stores:**

```
elearning-db (Version 2)
├── books
│   └── Key: [level, id]
│   └── Index: level
│
├── series
│   └── Key: [level, id]
│   └── Index: level
│
├── chapters
│   └── Key: bookId
│   └── Value: Array of chapters
│
├── lessons
│   └── Key: [bookId, chapterId]
│   └── Value: Array of lessons
│   └── Indexes: bookId, chapterId
│
└── quizzes
    └── Key: [bookId, chapterId, lessonId]
    └── Value: Quiz object with questions
    └── Indexes: bookId, chapterId, lessonId
```

---

## 🔍 CÁCH XEM DỮ LIỆU

### **Option 1: Browser DevTools (Dễ nhất)**

1. Mở trang web
2. Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Vào tab **Application** (Chrome/Edge) hoặc **Storage** (Firefox)
4. Mở rộng **IndexedDB** → `elearning-db`
5. Click vào các Object Stores để xem dữ liệu:
   - `books` - Xem tất cả books
   - `series` - Xem tất cả series
   - `chapters` - Xem chapters theo bookId
   - `lessons` - Xem lessons theo bookId + chapterId
   - `quizzes` - Xem quizzes theo bookId + chapterId + lessonId

### **Option 2: Console Commands**

Mở Console (F12) và chạy:

```javascript
// Xem tất cả books của N1
const books = await storageManager.getBooks('n1');
console.log('Books:', books);

// Xem tất cả series của N1
const series = await storageManager.getSeries('n1');
console.log('Series:', series);

// Xem chapters của một book
const chapters = await storageManager.getChapters('testBook');
console.log('Chapters:', chapters);

// Xem lessons của một chapter
const lessons = await storageManager.getLessons('testBook', 'chapter-1');
console.log('Lessons:', lessons);

// Xem quiz của một lesson
const quiz = await storageManager.getQuiz('testBook', 'chapter-1', 'lesson-1');
console.log('Quiz:', quiz);
```

### **Option 3: Export to JSON**

Trong Admin Panel, có thể export dữ liệu (nếu đã implement):

```javascript
// Export tất cả dữ liệu
const allData = await storageManager.exportAll();
console.log(JSON.stringify(allData, null, 2));
```

---

## 📁 VÍ DỤ DỮ LIỆU

### **Series Data:**
```json
{
  "level": "n1",
  "id": "series-1",
  "name": "testList",
  "description": "Bộ sách test",
  "createdAt": "2025-11-16T10:30:00.000Z",
  "updatedAt": "2025-11-16T10:30:00.000Z",
  "createdBy": "admin@example.com",
  "status": "draft",
  "studentsCount": 0,
  "rating": 0
}
```

### **Book Data:**
```json
{
  "level": "n1",
  "id": "book-1",
  "title": "testBook",
  "category": "testList",
  "imageUrl": ""
}
```

### **Chapter Data:**
```json
{
  "bookId": "book-1",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chương 1"
    }
  ]
}
```

### **Lesson Data:**
```json
{
  "bookId": "book-1",
  "chapterId": "chapter-1",
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Bài 1"
    }
  ]
}
```

### **Quiz Data:**
```json
{
  "bookId": "book-1",
  "chapterId": "chapter-1",
  "lessonId": "lesson-1",
  "title": "Quiz Bài 1",
  "questions": [
    {
      "id": 1,
      "text": "Câu hỏi 1?",
      "options": [
        { "label": "A", "text": "Đáp án A" },
        { "label": "B", "text": "Đáp án B" },
        { "label": "C", "text": "Đáp án C" },
        { "label": "D", "text": "Đáp án D" }
      ],
      "correct": "A",
      "explanation": "Giải thích..."
    }
  ]
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Dữ liệu chỉ lưu trên trình duyệt hiện tại**

- ✅ PC Chrome → Dữ liệu chỉ có trên PC Chrome
- ✅ Điện thoại Chrome → Dữ liệu chỉ có trên Điện thoại
- ❌ **KHÔNG tự động sync** giữa các thiết bị

### **2. Xóa browser data sẽ mất dữ liệu**

Nếu bạn:
- Clear browser data
- Xóa cookies và site data
- Uninstall browser
- Format máy tính

→ **Dữ liệu sẽ bị mất!**

### **3. Mỗi trình duyệt có database riêng**

- Chrome → Database riêng
- Firefox → Database riêng
- Edge → Database riêng

→ Dữ liệu **KHÔNG chia sẻ** giữa các trình duyệt

---

## 💡 CÁCH BACKUP DỮ LIỆU

### **Option 1: Export từ DevTools**

1. Mở DevTools → Application → IndexedDB → `elearning-db`
2. Click vào từng Object Store
3. Copy dữ liệu JSON
4. Lưu vào file `.json`

### **Option 2: Export từ Code (Nếu có feature)**

```javascript
// Trong Admin Panel, thêm nút Export
const exportData = async () => {
  const allData = await storageManager.exportAll();
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elearning-backup-${new Date().toISOString()}.json`;
  a.click();
};
```

### **Option 3: Copy thư mục IndexedDB**

1. Tìm thư mục IndexedDB (theo đường dẫn ở trên)
2. Copy toàn bộ thư mục `https_192.168.1.233_0.indexeddb.leveldb`
3. Lưu vào nơi an toàn
4. Restore: Copy lại vào vị trí tương ứng

---

## 🔄 MIGRATE SANG SERVER (Tương lai)

Khi deploy production, cần migrate sang **Supabase** để:
- ✅ Đồng bộ đa thiết bị
- ✅ Backup tự động
- ✅ Nhiều admin cùng làm việc

Xem: [OPTIMAL_ARCHITECTURE_DESIGN.md](./OPTIMAL_ARCHITECTURE_DESIGN.md)

---

## 📋 TÓM TẮT

| Câu hỏi | Trả lời |
|---------|---------|
| **Dữ liệu lưu ở đâu?** | IndexedDB/localStorage trên trình duyệt |
| **Database name?** | `elearning-db` |
| **Có sync đa thiết bị không?** | ❌ KHÔNG (chỉ local) |
| **Có backup tự động không?** | ❌ KHÔNG (cần export thủ công) |
| **Xóa browser data có mất không?** | ✅ CÓ |
| **Cách xem dữ liệu?** | DevTools → Application → IndexedDB |
| **Cách backup?** | Export JSON hoặc copy thư mục IndexedDB |

---

**Lưu ý:** Hiện tại đang ở giai đoạn **testing/demo**, dữ liệu lưu local là đủ. Khi deploy production, cần migrate sang Supabase để có đồng bộ đa thiết bị.

