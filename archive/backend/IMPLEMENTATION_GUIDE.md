# 🚀 IMPLEMENTATION GUIDE - Content Storage & File Upload

## ✅ PHASE 1: CONTENT STORAGE - HOÀN THÀNH

### **Đã tạo:**

1. ✅ **Supabase Schema** (`docs/data/supabase_content_schema.sql`)
   - Tables: `books`, `chapters`, `lessons`, `quizzes`, `series`
   - RLS policies: Public read, Admin write
   - Indexes và triggers

2. ✅ **Content Service** (`src/services/contentService.js`)
   - `saveBook()`, `getBooks()`
   - `saveChapters()`, `getChapters()`
   - `saveLessons()`, `getLessons()`
   - `saveQuiz()`, `getQuiz()`
   - `saveSeries()`, `getSeries()`

3. ✅ **Updated Storage Manager** (`src/utils/localStorageManager.js`)
   - Load từ Supabase trước
   - Fallback to IndexedDB → localStorage
   - Save lên Supabase nếu có userId và level

### **Cách sử dụng:**

**Load content:**
```javascript
// Tự động load từ Supabase nếu có level
const books = await storageManager.getBooks('n1');
const chapters = await storageManager.getChapters(bookId, 'n1');
const lessons = await storageManager.getLessons(bookId, chapterId, 'n1');
const quiz = await storageManager.getQuiz(bookId, chapterId, lessonId, 'n1');
```

**Save content (Admin):**
```javascript
// Cần userId (admin) và level
await storageManager.saveBooks('n1', books, userId);
await storageManager.saveChapters(bookId, chapters, 'n1', userId);
await storageManager.saveLessons(bookId, chapterId, lessons, 'n1', userId);
await storageManager.saveQuiz(bookId, chapterId, lessonId, quiz, 'n1', userId);
```

---

## ⏳ PHASE 2: FILE UPLOAD - CẦN HOÀN THÀNH

### **Cần làm:**

1. ⏳ **Setup Supabase Storage**
   - Tạo buckets: `book-images`, `audio-files`, `pdf-files`
   - Setup RLS policies

2. ⏳ **Create File Upload Service** (`src/services/fileUploadService.js`)
   - `uploadImage()`, `uploadAudio()`, `uploadPDF()`
   - Return CDN URLs

3. ⏳ **Update Admin Upload Handlers**
   - Update `ContentManagementPage.jsx` upload handlers
   - Upload to Supabase Storage thay vì localStorage

---

## 📋 NEXT STEPS

### **Step 1: Apply Supabase Schema**

1. Vào Supabase Dashboard → SQL Editor
2. Copy nội dung từ `docs/data/supabase_content_schema.sql`
3. Run script
4. Verify tables đã được tạo

### **Step 2: Update ContentManagementPage**

Cần update các save handlers để:
- Lấy `userId` từ `useAuth()`
- Lấy `level` từ selected level
- Pass `userId` và `level` vào save methods

### **Step 3: Setup Supabase Storage**

1. Vào Supabase Dashboard → Storage
2. Tạo buckets:
   - `book-images` (public)
   - `audio-files` (public)
   - `pdf-files` (public)
3. Setup RLS policies (public read)

### **Step 4: Create File Upload Service**

Tạo `src/services/fileUploadService.js` với:
- Upload functions
- Return public URLs

### **Step 5: Update Upload Handlers**

Update `ContentManagementPage.jsx`:
- Replace localStorage upload với Supabase Storage upload
- Update image/audio URLs

---

## 🎯 WORKFLOW SAU KHI HOÀN THÀNH

```
1. ADMIN NHẬP DỮ LIỆU
   ContentManagementPage
       ↓
   Tạo Book/Lesson/Quiz
       ↓
   Upload Images/Audio
       ↓
   LƯU LÊN SUPABASE
   (Content + Files)
       ↓

2. USER HỌC TỪ INTERNET
   User mở app
       ↓
   AUTO LOAD từ Supabase
   (Books, Lessons, Quizzes)
       ↓
   Cache vào IndexedDB
   (Offline support)
       ↓
   User học bài
       ↓
   Progress lưu vào Supabase
   (Multi-device sync)
```

---

**Status:** Phase 1 ✅ Complete | Phase 2 ⏳ Pending

