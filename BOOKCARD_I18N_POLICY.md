# 📚 BookCard - Language Policy

## 🌍 Chính Sách Ngôn Ngữ

### TẤT CẢ content trong BookCard luôn hiển thị bằng TIẾNG ANH

## 📋 Áp Dụng Cho

### 1. Book Title
```jsx
// LUÔN tiếng Anh (hoặc tiếng Nhật nếu là sách Nhật)
<BookCard title="Shinkanzen Master N1 Bunpou" />
<BookCard title="TRY! N1 Grammar" />
<BookCard title="GENKI I" />
```

**Lý do:**
- Tên sách thường là tiếng Anh hoặc tiếng Nhật
- Không nên dịch tên sách (mất ý nghĩa gốc)
- Giữ nguyên như xuất bản

### 2. Coming Soon Badge
```jsx
// LUÔN "Coming Soon" (tiếng Anh)
// KHÔNG dịch sang:
// - "Sắp ra mắt" (tiếng Việt)
// - "近日公開" (tiếng Nhật)
```

**Tiếng Anh:**
```
COMING SOON
```

**Implementation:**
```jsx
<p lang="en" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
  Coming Soon
</p>
```

### 3. Custom Status Badges
```jsx
// LUÔN tiếng Anh
<BookCard status="New Edition" />
<BookCard status="Updated" />
<BookCard status="Revised" />
<BookCard status="Premium" />
```

**KHÔNG dịch:**
- ❌ "Phiên bản mới" (Việt)
- ❌ "新版" (Nhật)
- ✅ "New Edition" (Anh)

### 4. No Cover Image Text
```jsx
// LUÔN "No Cover Image" (tiếng Anh)
// KHÔNG dịch sang:
// - "Không có ảnh bìa" (tiếng Việt)
// - "表紙画像なし" (tiếng Nhật)
```

**Tiếng Anh:**
```
No Cover Image
```

## 🎯 Lý Do Chính Sách

### 1. Consistency với Header & Footer
```
Header:  ALWAYS ENGLISH
Footer:  ALWAYS ENGLISH
BookCard: ALWAYS ENGLISH ← Đồng nhất
```

### 2. International Standard
- Tên sách thường giữ nguyên
- Coming Soon là term phổ biến quốc tế
- Professional appearance

### 3. Avoid Translation Issues
```
❌ "Shinkanzen Master N1 Văn Phạm" (weird mix)
✅ "Shinkanzen Master N1 Grammar" (natural)
```

### 4. Database Simplicity
```javascript
// Không cần store nhiều ngôn ngữ
{
  title: "Shinkanzen Master N1",  // Tiếng Anh
  // NOT:
  // title_vi: "...",
  // title_ja: "...",
}
```

## 🔧 Technical Implementation

### Font Consistency
```jsx
// Prevent font changes on language switch
style={{
  fontFamily: "'Space Grotesk', 'Inter', sans-serif",
  fontFeatureSettings: 'normal',
  fontVariant: 'normal'
}}
```

### Language Attribute
```jsx
// Explicitly set to English
lang="en"
```

### Complete Example
```jsx
<div lang="en">
  <p style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
    Coming Soon
  </p>
</div>
```

## 📊 Comparison Table

| Element | Vietnamese UI | English UI | Japanese UI |
|---------|---------------|------------|-------------|
| Book Title | "Shinkanzen Master N1" | "Shinkanzen Master N1" | "Shinkanzen Master N1" |
| Coming Soon | "Coming Soon" | "Coming Soon" | "Coming Soon" |
| Status Badge | "New Edition" | "New Edition" | "New Edition" |
| No Cover | "No Cover Image" | "No Cover Image" | "No Cover Image" |

**Result:** Tất cả đều GIỐNG NHAU ở mọi ngôn ngữ! ✅

## 🎨 Visual Consistency

### Switching Languages:
```
Vietnamese → English → Japanese
    ↓          ↓          ↓
BookCard looks EXACTLY THE SAME
(No layout shifts, no font changes, no text changes)
```

### Benefits:
- ✅ Stable UI
- ✅ No CLS (Cumulative Layout Shift)
- ✅ Professional appearance
- ✅ Faster rendering (no re-translations)

## 📝 Admin Guidelines

### When Adding Books:

**DO:**
- ✅ Use English or original language for title
- ✅ "Shinkanzen Master N1 Grammar"
- ✅ "TRY! N1 Listening"
- ✅ "GENKI I"

**DON'T:**
- ❌ Translate to Vietnamese: "Thành Thạo N1 Văn Phạm"
- ❌ Mix languages: "Shinkanzen Master N1 Văn Phạm"
- ❌ Use all Japanese: "新完全マスターN1文法" (hard to read)

### Status Badges:

**Recommended English Terms:**
- "New Edition"
- "Updated"
- "Revised"
- "Premium"
- "Coming Soon" (use `isComingSoon` prop instead)
- "Limited"
- "Popular"
- "Recommended"

**Avoid:**
- ❌ "Phiên bản mới"
- ❌ "新版"
- ❌ Mixed languages

## 🚀 Migration Notes

### For Existing Books:

If you have books with Vietnamese/Japanese titles:

**Before:**
```javascript
{
  title: "Thành Thạo N1 Văn Phạm"
}
```

**After:**
```javascript
{
  title: "Shinkanzen Master N1 Grammar"
}
```

**Migration Script (optional):**
```javascript
// Convert all titles to English/Original
books.forEach(book => {
  if (book.title.includes('Thành Thạo')) {
    book.title = book.title.replace('Thành Thạo', 'Shinkanzen Master');
  }
  // ... more conversions
});
```

## ⚠️ Important Notes

### 1. Book Content (Inside) CAN be localized
```
BookCard UI: ENGLISH (fixed)
   ↓
Book Detail Page: CAN be localized
   ↓
Lessons/Chapters: CAN be localized
```

### 2. This Policy Applies ONLY to BookCard
```
✅ BookCard: English only
✅ Header: English only  
✅ Footer: English only
❌ Main Content: Can be localized
❌ Lesson Text: Can be localized
```

### 3. Future Changes
If policy changes in future:
- Search for `lang="en"` in BookCard.jsx
- Remove language forcing
- Add `useLanguage()` hook
- Use `t()` for translations

---

**Policy Version**: 1.0  
**Effective Date**: 2024  
**Status**: Active  
**Review Date**: When requested by stakeholders

