# 📚 BookCard Redesign - Complete Guide

## ✅ Cải Tiến Chính

### 🌍 Language Policy - ALWAYS ENGLISH

**TẤT CẢ text trong BookCard được hardcode tiếng Anh:**
- Title của sách
- "Coming Soon" badge
- Custom status badges
- "No Cover Image" text

**Implementation:**
```jsx
// All text elements have:
lang="en"
style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
```

**Lý do:** 
- Consistency với Header và Footer
- Book titles thường là tiếng Anh/Nhật (không dịch)
- Professional & International standard

### 1. **Placeholder Design - Professional & Beautiful**

#### Khi nào hiển thị placeholder?
- ✅ Sách không có `imageUrl`
- ✅ Hình ảnh load bị lỗi (404, network error)
- ✅ Sách có `isComingSoon = true`

#### Thiết kế Placeholder:

**Background:**
- Gradient: `from-gray-100 via-gray-200 to-gray-300`
- Pattern: Japanese wave SVG (opacity 5%)
- Neo-brutalism style với border và shadow

**Icon Book:**
- Size: `w-20 h-20` (mobile) → `w-24 h-24` (desktop)
- Background: White với border đen
- Shadow: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- Icon: 📚 (large emoji)
- Hover: Scale up animation

**Status Badges:**

1. **Coming Soon Badge:**
```jsx
- Background: bg-yellow-400
- Border: border-[3px] border-black
- Shadow: shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
- Text: "COMING SOON" (uppercase, font-black)
- Animation: rotate -2deg → 0deg on hover
```

2. **Custom Status Badge:**
```jsx
- Background: bg-blue-500
- Border: border-[2px] border-black
- Shadow: shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
- Text: Custom status (uppercase, font-bold)
```

3. **No Image Indicator:**
```jsx
- Text: "No Cover Image"
- Style: text-xs text-gray-500 font-medium
```

### 2. **Image Loading State**

**Loading Skeleton:**
- Gradient: `from-gray-200 via-gray-300 to-gray-200`
- Animation: `animate-pulse`
- Hiển thị khi image đang load

**Image Fade-in:**
- Opacity: 0 → 100
- Duration: 300ms
- Smooth transition

### 3. **Card Size - Đồng Bộ**

**Aspect Ratio:**
```jsx
style={{ aspectRatio: '3/4' }}
```
- Đảm bảo tất cả card có kích thước giống nhau
- Không bị lệch khi có/không có ảnh

**Title Section:**
```jsx
minHeight: '2.5rem'
WebkitLineClamp: 2
```
- Fixed height cho title
- Truncate nếu quá dài (2 dòng)

### 4. **Hover Effects**

**Card:**
- Shadow: `6px → 8px`
- Translate: `translate-x-[-2px] translate-y-[-2px]`

**Book Icon:**
- Scale: `1 → 1.1`

**Coming Soon Badge:**
- Rotate: `-2deg → 0deg`

**Background Color:**
- Normal: `bg-yellow-400`
- Coming Soon: `bg-yellow-300 → bg-yellow-400`
- Hover: `bg-yellow-500`

## 📖 Cách Sử Dụng

### 1. Normal Book (có ảnh):
```jsx
<BookCard
  title="Shinkanzen Master N1 Bunpou"
  imageUrl="/book_card/n1/shinkanzen/bunpou.jpg"
/>
```

### 2. Coming Soon Book:
```jsx
<BookCard
  title="New JLPT N1 Textbook"
  isComingSoon={true}
/>
```

### 3. Book với Custom Status:
```jsx
<BookCard
  title="TRY! N1 Grammar"
  status="New Edition"
/>
```

### 4. Book không có ảnh:
```jsx
<BookCard
  title="Japanese Kanji Book"
  imageUrl={null}
/>
// hoặc
<BookCard
  title="Japanese Kanji Book"
  // không truyền imageUrl
/>
```

### 5. Book với broken image:
```jsx
<BookCard
  title="Some Book"
  imageUrl="/path/to/missing/image.jpg"
/>
// Tự động fallback to placeholder khi image error
```

## 🎨 Props API

```javascript
BookCard({
  imageUrl: string | null,     // URL của ảnh bìa (optional)
  title: string,                // Tên sách (required)
  isComingSoon: boolean,        // Hiển thị "Coming Soon" badge (optional, default: false)
  status: string | null         // Custom status text (optional)
})
```

## 🔥 Technical Details

### State Management:
```javascript
const [imageError, setImageError] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false);
```

### Conditional Logic:
```javascript
const showPlaceholder = !imageUrl || imageError || isComingSoon;
```

### Image Events:
- `onLoad`: Set imageLoaded = true (fade in image)
- `onError`: Set imageError = true (show placeholder)

### Performance:
- `loading="lazy"`: Lazy load images
- Conditional rendering: Only render image OR placeholder
- Smooth transitions: opacity, transform

## 📊 Comparison

### Before (Old):
```
- Chỉ hiển thị ảnh
- Không có fallback khi ảnh lỗi
- Không có loading state
- Không có coming soon support
- Crash nếu imageUrl = null
```

### After (New):
```
✅ Hiển thị placeholder đẹp khi không có ảnh
✅ Graceful fallback khi ảnh lỗi
✅ Loading skeleton khi đang load
✅ Coming Soon badge support
✅ Custom status support
✅ Consistent card size (aspect ratio 3:4)
✅ Smooth animations & transitions
✅ Professional design
```

## 🎯 Use Cases

### 1. Admin thêm sách mới (chưa có ảnh):
```
Admin → Content Management → Add Book
- Title: "New Textbook"
- Image URL: (để trống)
→ Card hiển thị placeholder với "No Cover Image"
```

### 2. Sách sắp ra mắt:
```
Admin → Add Book
- Title: "JLPT N1 2025 Edition"
- isComingSoon: true
→ Card hiển thị placeholder với "COMING SOON" badge
```

### 3. Sách có ảnh nhưng broken link:
```
Book với imageUrl = "/path/to/missing.jpg"
→ Image load error
→ Tự động fallback to placeholder
```

### 4. Network slow:
```
User mở trang Level N1
→ Loading skeleton hiển thị
→ Image load xong
→ Fade in smooth
```

## 🚀 Benefits

1. **Better UX:**
   - No broken images
   - Clear status indication
   - Professional appearance

2. **Future-proof:**
   - Support coming soon books
   - Easy to add new status types
   - Consistent design

3. **Performance:**
   - Lazy loading
   - Optimized rendering
   - Smooth animations

4. **Maintainability:**
   - Clean code
   - Clear props API
   - Easy to extend

---

**Status**: ✅ COMPLETE  
**Version**: 2.0 (Enhanced)  
**Date**: 2024  
**Author**: AI Assistant

