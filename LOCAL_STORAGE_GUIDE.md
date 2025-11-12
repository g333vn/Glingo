# 💾 Local Storage Guide - Cơ Chế Lưu Trữ Dữ Liệu

## 🎯 Tóm Tắt

**CÓ** - Dữ liệu được lưu **local** (trên máy tính của bạn):
- ✅ Sách (Books) mới thêm từ Admin Panel
- ✅ Bộ sách (Series) mới thêm từ Admin Panel
- ✅ Thông tin đăng nhập (User authentication)
- ✅ Tiến độ làm bài thi JLPT
- ✅ Kết quả quiz

**KHÔNG** - Dữ liệu **KHÔNG** được lưu local:
- ❌ Chapters (Chương sách)
- ❌ Quiz questions (Câu hỏi)
- ❌ Exam questions (Đề thi)

---

## 📊 Chi Tiết Storage Breakdown

### ✅ 1. Books (Sách) - LOCAL STORAGE

**Storage Key**: `adminBooks_${levelId}`
- `adminBooks_n1` - Sách N1
- `adminBooks_n2` - Sách N2
- `adminBooks_n3` - Sách N3
- `adminBooks_n4` - Sách N4
- `adminBooks_n5` - Sách N5

**Data Structure**:
```json
[
  {
    "id": "skm-n1-bunpou",
    "title": "新完全マスター 文法 N1",
    "imageUrl": "/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg",
    "category": "新完全マスター"
  },
  {
    "id": "test-book-1",
    "title": "My New Book",
    "imageUrl": "/images/test.jpg",
    "category": "Test Series"
  }
]
```

**Operations**:
- ✅ **Add (Thêm)**: Tạo sách mới → Lưu vào localStorage → Hiển thị tại `/level/n1`
- ✅ **Edit (Sửa)**: Cập nhật thông tin sách → Lưu lại localStorage → Update UI
- ✅ **Delete (Xóa)**: Xóa khỏi localStorage → Biến mất khỏi UI

**Persist?**: ✅ YES
- Data tồn tại **vĩnh viễn** trên browser cho đến khi:
  - Bạn clear browser data
  - Bạn xóa localStorage manually
  - Bạn reset về default trong Admin Panel

**Visible Where?**:
- Admin Panel: `/admin/content` (tab "📚 Quản lý Sách")
- User View: `/level/n1`, `/level/n2`, etc.

---

### ✅ 2. Series (Bộ sách) - LOCAL STORAGE

**Storage Key**: `adminSeries_${levelId}`
- `adminSeries_n1` - Bộ sách N1
- `adminSeries_n2` - Bộ sách N2
- etc.

**Data Structure**:
```json
[
  {
    "id": "series-1",
    "name": "新完全マスター",
    "description": "Bộ sách luyện thi JLPT toàn diện"
  },
  {
    "id": "series-2",
    "name": "TRY! 日本語能力試験",
    "description": "Bộ sách thực hành"
  }
]
```

**Operations**:
- ✅ **Add**: Tạo bộ sách mới → Lưu localStorage → Hiển thị trong dropdown khi thêm sách
- ✅ **Edit**: Cập nhật thông tin → Lưu lại → Update UI
- ✅ **Delete**: Xóa khỏi localStorage → Xóa category khỏi các sách liên quan

**Persist?**: ✅ YES (giống Books)

**Visible Where?**:
- Admin Panel: `/admin/content` (tab "📦 Bộ sách")
- Used in: Book form (dropdown "Bộ sách")

---

### ✅ 3. User Authentication - LOCAL STORAGE

**Storage Key**: `authUser`

**Data Structure**:
```json
{
  "username": "admin",
  "name": "Admin",
  "email": "admin@example.com",
  "role": "admin"
}
```

**Note**: ⚠️ **Password KHÔNG được lưu** trong localStorage (security)

**Persist?**: ✅ YES
- User đăng nhập → Session được lưu
- Refresh page → Vẫn đăng nhập
- Đăng xuất → Xóa khỏi localStorage

---

### ✅ 4. JLPT Exam Progress - LOCAL STORAGE

**Storage Keys**:
- `jlpt_n1_2024-12_knowledge` - Progress bài thi kiến thức
- `jlpt_n1_2024-12_listening` - Progress bài thi nghe
- `jlpt_n1_2024-12_result` - Kết quả thi

**Data Structure**:
```json
{
  "answers": {
    "q1": "A",
    "q2": "B",
    "q3": "C"
  },
  "timeSpent": 1800,
  "completed": true,
  "score": 85
}
```

**Persist?**: ✅ YES
- Làm bài → Lưu progress
- Thoát ra → Quay lại vẫn còn progress
- Hoàn thành → Lưu kết quả

---

### ❌ 5. Chapters (Chương sách) - STATIC FILES

**Storage Location**: `src/data/level/n1/[book-id].js`

**Example**: `src/data/level/n1/shinkanzen-n1-bunpou.js`
```javascript
export const bookData = {
  id: 'shinkanzen-n1-bunpou',
  title: '新完全マスター 文法 N1',
  contents: [
    { id: 'bai-1', title: 'Bài 1: Phân biệt cấu trúc A và B' },
    { id: 'bai-2', title: 'Bài 2: Cách dùng N' },
    // ...
  ]
};
```

**Why NOT localStorage?**:
- ❌ Chapter structure phức tạp
- ❌ Liên kết với quiz data
- ❌ Cần maintain consistency với code

**Để thêm Chapter mới**:
1. **Option 1**: Thêm manually vào file `.js`
2. **Option 2**: Dùng Quiz Editor để tạo quiz → Auto generate chapter structure

**Persist?**: ❌ NO (in localStorage)
- ✅ YES (in static files - committed to Git)

---

### ❌ 6. Quiz Questions - STATIC FILES / JSON

**Storage Location**: 
- `src/data/level/n1/[book-id]/quizzes/[lesson-id].json`
- OR `src/data/level/quizData.js`

**Example**: `src/data/level/n1/shinkanzen-n1-bunpou/quizzes/bai-1.json`
```json
{
  "lessonId": "bai-1",
  "title": "Bài 1: Phân biệt cấu trúc A và B",
  "questions": [
    {
      "id": 1,
      "question": "___に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Giải thích..."
    }
  ]
}
```

**Why NOT localStorage?**:
- ❌ Quizzes rất lớn (có thể 100+ câu)
- ❌ localStorage có limit ~5-10MB
- ❌ JSON format tốt hơn cho export/import
- ❌ Có thể lazy load (chỉ load khi cần)

**Để thêm Quiz mới**:
1. **Dùng Quiz Editor**: `/admin/quiz-editor`
   - Tạo quiz → Download JSON
   - Put JSON vào folder `src/data/level/n1/.../quizzes/`
2. **Manual**: Tạo file JSON theo format

**Persist?**: ❌ NO (in localStorage)
- ✅ YES (in JSON files - committed to Git)

---

### ❌ 7. JLPT Exam Questions - STATIC FILES

**Storage Location**: `src/data/jlpt/examQuestionsData.js`

**Example**:
```javascript
export const examQuestionsData = {
  n1: {
    '2024-12': {
      knowledge: {
        sections: [
          {
            id: 'mondai1',
            title: '問題１ ＿＿のところに何を入れますか。',
            questions: [...]
          }
        ]
      },
      listening: {
        sections: [...]
      }
    }
  }
};
```

**Why NOT localStorage?**:
- ❌ Exam data rất lớn (75 exams x 2 sections)
- ❌ Phức tạp: audio files, images, explanations
- ❌ Cần backend để manage

**Persist?**: ❌ NO (in localStorage)
- ✅ YES (in static files)

---

## 📈 Storage Size Comparison

| Data Type | Typical Size | Storage Location | Persist? |
|-----------|--------------|------------------|----------|
| Books metadata | ~5-10 KB | localStorage | ✅ YES |
| Series | ~1-2 KB | localStorage | ✅ YES |
| User auth | ~0.5 KB | localStorage | ✅ YES |
| Exam progress | ~2-5 KB | localStorage | ✅ YES |
| **Chapters** | ~50-100 KB | **Static files** | ❌ NO |
| **Quizzes** | ~500 KB - 2 MB | **Static/JSON** | ❌ NO |
| **JLPT Exams** | ~10-50 MB | **Static files** | ❌ NO |

**localStorage limit**: ~5-10 MB (varies by browser)

---

## 🔄 Data Flow Summary

### Scenario 1: Admin thêm sách mới

```
1. Admin: /admin/content
   ↓
2. Fill form & click "💾 Lưu"
   ↓
3. JavaScript: localStorage.setItem('adminBooks_n1', JSON)
   ✅ Saved to localStorage
   ↓
4. User: Navigate to /level/n1
   ↓
5. JavaScript: localStorage.getItem('adminBooks_n1')
   ✅ Load from localStorage
   ↓
6. UI: Display books (including new one)
   ✅ Visible!
```

### Scenario 2: Admin thêm chapter mới

```
1. Admin: /admin/content → Add Chapter
   ↓
2. Click "💾 Thêm Chương"
   ↓
3. Alert: "⚠️ Để lưu chapter, bạn cần:"
   - Cập nhật file: src/data/level/n1/[book-id].js
   - Thêm chapter vào mảng 'chapters'
   ❌ NOT saved to localStorage
   ↓
4. Manual: Edit file + commit to Git
   ✅ Saved to codebase
   ↓
5. User: Navigate to /level/n1/[book-id]
   ✅ Chapter visible (after code update)
```

---

## 💡 Recommendations

### For Current System (localStorage)

#### ✅ What Works Well:
1. **Books & Series management**
   - Instant updates
   - No backend needed
   - Easy to backup (export JSON)

2. **User authentication**
   - Simple session management
   - Fast login/logout

3. **Exam progress**
   - Auto-save progress
   - Resume anytime

#### ⚠️ Limitations:
1. **Only works on single browser**
   - Data không sync across devices
   - Clear cache → Mất data

2. **No collaboration**
   - Admin 1 thêm sách → Admin 2 không thấy
   - Cần export/import để share

3. **Size limit**
   - Cannot store large content (chapters, quizzes)

---

### For Future (Backend System)

#### If you want to scale:

**Backend Options**:
1. **Firebase** (Google)
   - Realtime database
   - Authentication built-in
   - Free tier: 1GB storage

2. **Supabase** (Open source)
   - PostgreSQL database
   - RESTful API
   - Free tier: 500MB storage

3. **MongoDB Atlas**
   - NoSQL database
   - Good for JSON data
   - Free tier: 512MB storage

**Benefits**:
- ✅ Multi-device sync
- ✅ Multi-user collaboration
- ✅ No size limit
- ✅ Backup & restore
- ✅ Data analytics

**Migration Path**:
```
Current: localStorage
   ↓
Phase 1: Add backend for Books & Series
   ↓
Phase 2: Add backend for Chapters
   ↓
Phase 3: Add backend for Quizzes & Exams
   ↓
Future: Full cloud-based system
```

---

## 🎯 Quick Reference

### To add new content:

| Content Type | Method | Persist? | Visible Immediately? |
|--------------|--------|----------|---------------------|
| **Book** | Admin Panel | ✅ localStorage | ✅ YES |
| **Series** | Admin Panel | ✅ localStorage | ✅ YES |
| **Chapter** | Manual edit file | ✅ Git commit | ❌ NO (need deploy) |
| **Quiz** | Quiz Editor → JSON | ✅ Git commit | ❌ NO (need deploy) |
| **JLPT Exam** | Manual edit file | ✅ Git commit | ❌ NO (need deploy) |

### To backup data:

```javascript
// Export Books
const books = localStorage.getItem('adminBooks_n1');
console.log(books); // Copy & save to file

// Export Series
const series = localStorage.getItem('adminSeries_n1');
console.log(series); // Copy & save to file
```

### To import data:

```javascript
// Import Books
const booksData = `[{"id":"..."}]`; // Your JSON
localStorage.setItem('adminBooks_n1', booksData);
location.reload(); // Refresh to see changes
```

---

## 📝 Summary

**Câu trả lời ngắn gọn cho câu hỏi của bạn:**

> "Vậy thì giờ nếu thêm một tài nguyên nào đó với các tính năng đã tạo trên web thì tài nguyên đó có được thêm vào dữ liệu ở local của tôi không?"

**Trả lời**:
- ✅ **Sách (Books)**: CÓ - Lưu local, hiển thị ngay
- ✅ **Bộ sách (Series)**: CÓ - Lưu local, hiển thị ngay
- ❌ **Chapters**: KHÔNG - Cần edit file thủ công
- ❌ **Quizzes**: KHÔNG - Cần tạo JSON file
- ❌ **JLPT Exams**: KHÔNG - Cần edit file thủ công

**Data chỉ tồn tại trên máy tính/browser của bạn** - không sync với người khác hoặc thiết bị khác.

---

**Last Updated**: 2024-11-12  
**Version**: 1.0.0

