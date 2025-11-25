# 📚 Placeholder Content - English Update Complete

## ✅ Cập Nhật Hoàn Thành

Tất cả nội dung placeholder/clone đã được chuyển sang **tiếng Anh** để đồng nhất với Header, Footer, và BookCard.

---

## 📋 Files Đã Cập Nhật

### 1. **Book Titles (N1 Level)**
**File**: `src/data/level/n1/books-metadata.js`

**Before:**
```javascript
{ id: 'extra-1', title: "Sách phụ N1-1", category: 'Tài liệu phụ' }
{ id: 'extra-2', title: "Sách phụ N1-2", category: 'Tài liệu phụ' }
// ... 10 items
```

**After:**
```javascript
{ id: 'extra-1', title: "N1 Extra Material 01", isComingSoon: true, category: 'Extra Materials' }
{ id: 'extra-2', title: "N1 Extra Material 02", isComingSoon: true, category: 'Extra Materials' }
// ... 10 items
```

**Changes:**
- ✅ Title: "Sách phụ N1-X" → "N1 Extra Material 0X"
- ✅ Category: "Tài liệu phụ" → "Extra Materials"
- ✅ Added: `isComingSoon: true` (hiển thị badge "COMING SOON")
- ✅ Changed: `imageUrl: "/book_card/placeholder.jpg"` → `imageUrl: null`

---

### 2. **Sidebar Categories**
**File**: `src/components/Sidebar.jsx`

**Before:**
```javascript
{ name: 'Tài liệu phụ 1', id: 'sup1' },
{ name: 'Tài liệu phụ 2', id: 'sup2' },
// ... 15 items
```

**After:**
```javascript
{ name: 'Extra Materials 1', id: 'sup1' },
{ name: 'Extra Materials 2', id: 'sup2' },
// ... 15 items
```

**Changes:**
- ✅ "Tài liệu phụ X" → "Extra Materials X"
- ✅ Comment updated: "Thêm 10 items nữa" → "Extra items"

---

### 3. **Admin Panel - Series Description**
**Files**: 
- `src/pages/admin/ContentManagementPage.jsx`
- `src/pages/admin/QuizEditorPage.jsx`

**Before:**
```javascript
description: `Bộ sách ${cat}`
```

**After:**
```javascript
description: `Series: ${cat}`
```

**Changes:**
- ✅ "Bộ sách" → "Series"

---

## 🎯 Result - UI Display

### Book Cards (N1 Level)

**Vietnamese UI:**
```
┌─────────────────────┐
│   [Wave Pattern]    │
│        📚           │
│    COMING SOON      │ ← English badge
├─────────────────────┤
│ N1 Extra Material   │ ← English title
│        01           │
└─────────────────────┘
```

**English UI:**
```
┌─────────────────────┐
│   [Wave Pattern]    │
│        📚           │
│    COMING SOON      │ ← English badge
├─────────────────────┤
│ N1 Extra Material   │ ← English title
│        01           │
└─────────────────────┘
```

**Japanese UI:**
```
┌─────────────────────┐
│   [Wave Pattern]    │
│        📚           │
│    COMING SOON      │ ← English badge
├─────────────────────┤
│ N1 Extra Material   │ ← English title
│        01           │
└─────────────────────┘
```

**→ GIỐNG NHAU 100% ở mọi ngôn ngữ!** ✅

---

### Sidebar (Category Filter)

**All Languages:**
```
CATEGORIES (10)
┌─────────────────────┐
│ 新完全マスター       │ ← Japanese (original)
│ 日本語総まとめ       │ ← Japanese (original)
│ N1スピードマスター   │ ← Japanese (original)
│ Extra Materials      │ ← English (clone)
│ GENKI               │ ← English (original)
└─────────────────────┘
```

**→ Clone categories giờ là tiếng Anh!** ✅

---

## 📊 Data Structure

### Complete Book Object Example:

```javascript
{
  id: 'extra-1',
  title: 'N1 Extra Material 01',      // English
  imageUrl: null,                      // No image
  isComingSoon: true,                  // Show "COMING SOON" badge
  category: 'Extra Materials'          // English category
}
```

### Props Passed to BookCard:

```jsx
<BookCard
  title="N1 Extra Material 01"
  imageUrl={null}
  isComingSoon={true}
  status={null}
/>
```

### BookCard Display Logic:

```javascript
if (isComingSoon) {
  // Show "COMING SOON" badge (yellow, rotated)
  // Background: light yellow
} else if (!imageUrl) {
  // Show "No Cover Image" text
  // Background: gray gradient
} else {
  // Show real image
}
```

---

## 🌍 Language Consistency Policy

### English Everywhere (Clone/Placeholder Content):

| Element | Vietnamese UI | English UI | Japanese UI |
|---------|---------------|------------|-------------|
| Book Title | "N1 Extra Material 01" | "N1 Extra Material 01" | "N1 Extra Material 01" |
| Coming Soon Badge | "COMING SOON" | "COMING SOON" | "COMING SOON" |
| Category Name | "Extra Materials" | "Extra Materials" | "Extra Materials" |
| Sidebar Item | "Extra Materials 1" | "Extra Materials 1" | "Extra Materials 1" |

**Result:** ✅ Consistent across all languages!

---

## 🔄 Migration Summary

### Changed:
- ✅ 10 book titles (N1 level)
- ✅ 10 book categories (N1 level)
- ✅ 15 sidebar items
- ✅ 2 admin panel descriptions
- ✅ Added `isComingSoon: true` to all clone books

### Not Changed (Intentionally):
- ✅ Real book titles (keep original Japanese/English)
- ✅ Real categories (keep original Japanese)
- ✅ Breadcrumbs (already English)
- ✅ Header (already English)
- ✅ Footer (already English)

---

## 💡 Naming Convention

### Placeholder Books:

**Format:** `{Level} Extra Material {Number}`

**Examples:**
```
N1 Extra Material 01
N1 Extra Material 02
N2 Extra Material 01
N3 Extra Material 01
```

**Consistent numbering:**
- Use `01`, `02` instead of `1`, `2` (padded zeros)
- Professional appearance
- Easy to sort

### Placeholder Categories:

**English only:**
```
Extra Materials
Supplementary Materials
Additional Resources
Practice Materials
```

**NOT:**
```
❌ Tài liệu phụ
❌ 補助資料
❌ Mixed: "Extra Tài liệu"
```

---

## 🎨 Visual Impact

### Before (Mixed Languages):
```
User switches: Vietnamese → Japanese
  ↓
Sidebar: "Tài liệu phụ" → "Tài liệu phụ" (no change, but still Vietnamese)
Cards: "Sách phụ N1-1" → "Sách phụ N1-1" (still Vietnamese)
  ↓
Result: Inconsistent with English Header/Footer
```

### After (English Only):
```
User switches: Vietnamese → Japanese
  ↓
Sidebar: "Extra Materials" → "Extra Materials" (no change)
Cards: "N1 Extra Material 01" → "N1 Extra Material 01" (no change)
  ↓
Result: ✅ Perfect consistency with Header/Footer
```

---

## 🚀 Benefits

1. **UI Stability:**
   - No layout shifts when switching languages
   - No font changes
   - No text length changes

2. **Professional Appearance:**
   - International standard
   - Clean and modern
   - Easy to understand

3. **Consistency:**
   - Matches Header (English)
   - Matches Footer (English)
   - Matches BookCard policy (English)

4. **Future-proof:**
   - Easy to add more languages
   - Clear naming convention
   - Maintainable structure

---

## 📝 Admin Guidelines

### When Adding Clone/Placeholder Books:

**DO:**
- ✅ Use English titles: "N1 Extra Material 01"
- ✅ Use English categories: "Extra Materials"
- ✅ Set `isComingSoon: true`
- ✅ Set `imageUrl: null`

**DON'T:**
- ❌ Use Vietnamese: "Sách phụ N1-1"
- ❌ Use mixed: "Extra Sách phụ"
- ❌ Use placeholder images: "/book_card/placeholder.jpg"
- ❌ Forget `isComingSoon` flag

### Example (Admin Panel):

```javascript
// ✅ CORRECT
{
  title: "N1 Extra Material 01",
  category: "Extra Materials",
  isComingSoon: true,
  imageUrl: null
}

// ❌ WRONG
{
  title: "Sách phụ N1-1",
  category: "Tài liệu phụ",
  imageUrl: "/book_card/placeholder.jpg"
}
```

---

## 🔮 Future Updates

### Other Levels (N2-N5):

**TODO:** Apply same changes to:
- `src/data/level/n2/books-metadata.js`
- `src/data/level/n3/books-metadata.js`
- `src/data/level/n4/books-metadata.js`
- `src/data/level/n5/books-metadata.js`

**Format:**
```javascript
{ id: 'extra-1', title: "N2 Extra Material 01", isComingSoon: true, category: 'Extra Materials' }
{ id: 'extra-1', title: "N3 Extra Material 01", isComingSoon: true, category: 'Extra Materials' }
{ id: 'extra-1', title: "N4 Extra Material 01", isComingSoon: true, category: 'Extra Materials' }
{ id: 'extra-1', title: "N5 Extra Material 01", isComingSoon: true, category: 'Extra Materials' }
```

---

**Status**: ✅ COMPLETE (N1 Level)  
**Next**: Apply to N2-N5 levels  
**Version**: 1.0  
**Date**: 2024

