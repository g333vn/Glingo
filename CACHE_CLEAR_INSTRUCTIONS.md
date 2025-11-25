# 🔄 Cache Clear Instructions - Fix "SÁCH PHỤ" Issue

## ❗ Vấn Đề

Sau khi update data từ "Sách phụ N1-X" → "N1 Extra Material 0X", browser vẫn hiển thị data cũ do:
1. **Browser Cache** (static files)
2. **IndexedDB** (stored books data)
3. **localStorage** (cached data)

## ✅ Giải Pháp

### Option 1: Hard Refresh (Khuyến nghị) ⭐

**Chrome/Edge/Brave:**
```
1. Mở page Level N1
2. Nhấn: Ctrl + Shift + R (Windows)
   hoặc:  Cmd + Shift + R (Mac)
```

**Firefox:**
```
1. Mở page Level N1
2. Nhấn: Ctrl + F5 (Windows)
   hoặc:  Cmd + Shift + R (Mac)
```

### Option 2: Clear Storage (Triệt để)

**Step 1: Mở DevTools**
```
F12 hoặc Right-click → Inspect
```

**Step 2: Application Tab**
```
1. Click tab "Application" (hoặc "Storage" ở Firefox)
2. Expand "Storage" section
```

**Step 3: Clear All**
```
✅ Clear IndexedDB:
   - Expand "IndexedDB"
   - Right-click "jlpt_ebook_db"
   - Delete database

✅ Clear localStorage:
   - Click "Local Storage"
   - Click "http://localhost:5173"
   - Right-click → Clear

✅ Clear Cache:
   - Click "Cache Storage"
   - Right-click → Delete all
```

**Step 4: Reload**
```
Ctrl + Shift + R (hard refresh)
```

### Option 3: Incognito Mode (Test nhanh)

```
1. Ctrl + Shift + N (Chrome) hoặc Ctrl + Shift + P (Firefox)
2. Mở: http://localhost:5173/level/n1
3. Check xem data đã đúng chưa
```

## 🔧 Dev Server Restart

**Terminal:**
```bash
# Stop server
Ctrl + C

# Clear node cache (optional)
rm -rf node_modules/.vite

# Restart
npm run dev
```

## 📊 Verify Changes

### Cách Check:

**1. Open DevTools Console**
```javascript
// Check IndexedDB
const request = indexedDB.open('jlpt_ebook_db', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['books'], 'readonly');
  const store = tx.objectStore('books');
  const getRequest = store.get('n1');
  getRequest.onsuccess = () => {
    console.log('Books:', getRequest.result);
  };
};
```

**2. Expected Output:**
```javascript
[
  { id: 'extra-1', title: 'N1 Extra Material 01', isComingSoon: true },
  { id: 'extra-2', title: 'N1 Extra Material 02', isComingSoon: true },
  // ... NOT "Sách phụ N1-X"
]
```

**3. Visual Check:**

Should see:
```
┌──────────────────────┐
│       📚             │
│   COMING SOON        │
├──────────────────────┤
│ N1 Extra Material 01 │
└──────────────────────┘
```

Should NOT see:
```
❌ SÁCH PHỤ N1-1
❌ Tài liệu phụ
❌ /book_card/placeholder.jpg
```

## 🎯 Quick Fix (One Command)

**In Browser Console:**
```javascript
// Clear all app data
indexedDB.deleteDatabase('jlpt_ebook_db');
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

## ⚠️ Why This Happens

### IndexedDB Persistence:
```
App loads → Check IndexedDB first → Found old data → Use it
   ↓
Never fetches new data from updated source file
```

### Solution Flow:
```
Clear IndexedDB → App loads → No data found → Fetch from source
   ↓
Load fresh data from books-metadata.js → Store in IndexedDB
   ↓
Display new "N1 Extra Material 0X" correctly
```

## 📝 Admin Panel - Force Refresh

If you have admin access:

**1. Go to Admin Panel**
```
http://localhost:5173/admin
```

**2. Content Management**
```
Select Level: N1
Click "Reload from Source"
```

**3. Verify**
```
Check that books show:
- "N1 Extra Material 01-10"
- Category: "Extra Materials"
- isComingSoon: true
```

## 🔍 Debug Steps

### If still showing old data:

**1. Check Source File:**
```bash
cat src/data/level/n1/books-metadata.js | grep "extra-1"
```

**Expected:**
```javascript
{ id: 'extra-1', title: "N1 Extra Material 01", ... }
```

**2. Check Build Output:**
```bash
# Check if Vite is serving old files
ls -la node_modules/.vite/deps/
```

**3. Force Clean Build:**
```bash
rm -rf dist node_modules/.vite
npm run dev
```

## ✅ Success Indicators

After clearing cache, you should see:

### Cards:
- ✅ Title: "N1 Extra Material 01-10" (tiếng Anh)
- ✅ Badge: "COMING SOON" (yellow, rotating)
- ✅ Background: Light yellow (different from normal cards)
- ✅ Icon: 📚 (large book icon)
- ✅ Text: "No Cover Image" is GONE (replaced by Coming Soon badge)

### Sidebar:
- ✅ Category: "Extra Materials" (tiếng Anh)
- ✅ NOT: "Tài liệu phụ" (tiếng Việt)

### All Languages:
- ✅ Vietnamese UI: Shows English titles
- ✅ English UI: Shows English titles
- ✅ Japanese UI: Shows English titles

## 🚀 Prevention (Future)

### For Developers:

**1. Version Data:**
```javascript
export const n1BooksMetadata = {
  version: '2.0', // Increment on major changes
  data: [ ... ]
};
```

**2. Check Version on Load:**
```javascript
const storedVersion = localStorage.getItem('books_version');
if (storedVersion !== CURRENT_VERSION) {
  // Force refresh from source
  await loadFromSource();
  localStorage.setItem('books_version', CURRENT_VERSION);
}
```

**3. Add "Refresh Data" Button:**
```jsx
<button onClick={async () => {
  await indexedDB.deleteDatabase('jlpt_ebook_db');
  location.reload();
}}>
  🔄 Refresh Data
</button>
```

---

**Quick Command (Copy-Paste):**
```javascript
indexedDB.deleteDatabase('jlpt_ebook_db');localStorage.clear();location.reload(true);
```

**Status**: ✅ Data is correct in source files  
**Issue**: Browser cache/storage  
**Solution**: Clear cache + hard refresh  
**Time**: < 30 seconds

