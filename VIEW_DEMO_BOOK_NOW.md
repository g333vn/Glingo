# 🚀 XEM DEMO BOOK NGAY - Quick Guide

## ⚡ Cách Nhanh Nhất (30 giây)

### Bước 1: Refresh Trang
```
Nhấn F5 hoặc Ctrl + R
```

### Bước 2: Mở Console (để xem log)
```
Nhấn F12
Tab Console
```

### Bước 3: Xem Messages
```
Bạn sẽ thấy:

🔄 Detected outdated data. Updating to latest version...
   - Missing DEMO book, adding it now
🗑️ Cleared books data for level: n1
✅ Updated to 33 books (includes DEMO book)
```

**Nếu thấy messages này → DEMO book đã được thêm! ✅**

### Bước 4: Tìm DEMO Book

**Option A: Scroll xuống**
```
Scroll đến cuối grid
→ Thấy card "DEMO: COMPLETE SAMPLE BOOK"
```

**Option B: Filter Sidebar**
```
Sidebar → Click "DEMO SAMPLE SERIES"
→ Chỉ hiển thị DEMO book
```

**Option C: Search (Ctrl+K)**
```
Ctrl+K → Gõ "demo" → Click
```

### Bước 5: Click Vào DEMO Book
```
Card có:
  📚 Icon book lớn
  "COMING SOON" badge vàng
  "DEMO: COMPLETE SAMPLE BOOK"
```

### Bước 6: Explore!
```
→ Thấy 3 chapters
→ Click "Mở Chapter"
→ Thấy 3 lessons
→ Click "Học ngay"
→ Xem content!
```

---

## 🎯 Lessons Hoạt Động Ngay (HTML)

### Lesson 1.2: Particle が
```
URL: /level/n1/demo-complete-001/chapter/demo-chapter-1/lesson/demo-lesson-1-2

Content:
✅ HTML table comparing は vs が
✅ Examples với furigana
✅ Exercises
✅ Quiz: 3 câu hỏi
```

### Lesson 2.1: Family Vocabulary
```
URL: /level/n1/demo-complete-001/chapter/demo-chapter-2/lesson/demo-lesson-2-1

Content:
✅ Complete vocabulary table
✅ 父、母、兄、姉...
✅ Notes về khiêm nhường vs kính ngữ
✅ Quiz: 3 câu hỏi
```

### Lesson 3.1: Reading Strategies
```
URL: /level/n1/demo-complete-001/chapter/demo-chapter-3/lesson/demo-lesson-3-1

Content:
✅ 5 bước đọc hiểu
✅ Tips JLPT
✅ Formatted lists
✅ Quiz: 1 câu hỏi
```

---

## ⚠️ Nếu Vẫn Không Thấy

### Solution 1: Hard Refresh
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Solution 2: Clear Cache Manually
```
1. F12 (DevTools)
2. Application tab
3. IndexedDB → jlpt_ebook_db → Delete
4. localStorage → Clear
5. F5 (refresh)
```

### Solution 3: Console Command
```javascript
// Paste in Console:
await storageManager.clearBooks('n1');
location.reload();
```

---

## 📊 Check Console Messages

### Expected Messages:

**First time (after code update):**
```
🔄 Detected outdated data. Updating to latest version...
   - Missing DEMO book, adding it now
🗑️ Cleared books data for level: n1
✅ Updated to 33 books (includes DEMO book)
```

**Second time (after refresh):**
```
✅ Loaded 33 books from storage
```

**If you see "32 books" instead of "33":**
```
→ DEMO book chưa được add
→ Try hard refresh (Ctrl + Shift + R)
→ Or clear cache manually
```

---

## 🔍 Visual Confirmation

### In Level N1 Grid:

**Look for card at the end:**
```
Row 2, Position 5:
┌─────────────────────────┐
│       📚                │
│   COMING SOON           │ ← Yellow badge
├─────────────────────────┤
│ DEMO: COMPLETE          │
│ SAMPLE BOOK             │
└─────────────────────────┘
```

### In Sidebar:

**New category:**
```
CATEGORIES (X)
├── ...
├── Extra Materials (10)
└── DEMO Sample Series (1) ← NEW!
```

---

## 🎯 Direct URL (Bypass Cache)

### If nothing works, use direct URL:

```
Book:
http://localhost:5173/level/n1/demo-complete-001

Chapter 1:
http://localhost:5173/level/n1/demo-complete-001/chapter/demo-chapter-1

Lesson 1.2 (HTML - works 100%):
http://localhost:5173/level/n1/demo-complete-001/chapter/demo-chapter-1/lesson/demo-lesson-1-2
```

**If these URLs show "Book not found" or error:**
→ Cache hasn't updated yet
→ Try Solution 1-3 above

---

## 🔧 Debug Steps

### Step 1: Check Console
```
F12 → Console tab
Look for:
  ✅ "Updated to 33 books" (good)
  ❌ "Loaded 32 books" (old cache)
```

### Step 2: Check n1BooksMetadata
```
Open Console and run:

import { n1BooksMetadata } from './src/data/level/n1/books-metadata.js';
console.log('Total books:', n1BooksMetadata.length);
console.log('Has DEMO:', n1BooksMetadata.some(b => b.id === 'demo-complete-001'));
```

**Expected:**
```
Total books: 33
Has DEMO: true
```

### Step 3: Force Clear
```
// In Console:
indexedDB.deleteDatabase('jlpt_ebook_db');
localStorage.clear();
location.reload(true);
```

---

## ✅ When It Works

### You will see:

**1. Level N1 Page:**
- 33 books total (was 32)
- DEMO book card visible
- Sidebar has "DEMO Sample Series" (1)

**2. DEMO Book Card:**
- Icon 📚
- Badge "COMING SOON"
- Title "DEMO: COMPLETE SAMPLE BOOK"
- Hover effects work

**3. Book Detail Page:**
- 3 chapters listed
- Can click "Mở Chapter"

**4. Chapter Page:**
- 3 lessons listed
- Can click "Học ngay"

**5. Lesson Page (1.2):**
- Tab "Lý thuyết" shows HTML content
- Table formatted beautifully
- Can zoom
- Tab "Quiz" has 3 questions

---

## 📝 Quick Test Script

### Run in Console:

```javascript
// Test if DEMO book exists in source
import('./src/data/level/n1/books-metadata.js').then(module => {
  const demoBook = module.default.find(b => b.id === 'demo-complete-001');
  if (demoBook) {
    console.log('✅ DEMO book exists in source:', demoBook.title);
  } else {
    console.log('❌ DEMO book NOT found in source!');
  }
});

// Test if DEMO book in storage
storageManager.getBooks('n1').then(books => {
  const demoInStorage = books && books.find(b => b.id === 'demo-complete-001');
  if (demoInStorage) {
    console.log('✅ DEMO book in storage:', demoInStorage.title);
  } else {
    console.log('❌ DEMO book NOT in storage yet');
    console.log('→ Refresh page to trigger auto-update');
  }
});
```

---

**Action Required:** 
1. ✅ Refresh page (F5)
2. ✅ Check console for update messages
3. ✅ Look for DEMO book card in grid
4. ✅ If not visible, try hard refresh (Ctrl+Shift+R)

**Expected Result:** DEMO book xuất hiện sau khi refresh! 🎉

