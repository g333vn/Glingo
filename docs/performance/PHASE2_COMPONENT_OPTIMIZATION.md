# ✅ Phase 2: Component Optimization - Implementation Guide

## 📋 Tổng quan

Phase 2 tập trung vào tối ưu hóa React components để giảm unnecessary re-renders và cải thiện performance.

---

## 🎯 Mục tiêu

- **Re-render count:** Giảm 60-70%
- **Frame rate:** 30fps → 60fps
- **UI interactions:** Smoother, more responsive

---

## 🔧 Các kỹ thuật sử dụng

### 1. React.memo()
Ngăn component re-render khi props không thay đổi.

```javascript
// Before
function BookCard({ title, imageUrl }) {
  return <div>...</div>;
}

// After
const BookCard = memo(function BookCard({ title, imageUrl }) {
  return <div>...</div>;
}, (prevProps, nextProps) => {
  return prevProps.title === nextProps.title &&
         prevProps.imageUrl === nextProps.imageUrl;
});
```

### 2. useCallback()
Memoize functions để tránh tạo function mới mỗi lần render.

```javascript
// Before
const handleClick = (id) => {
  navigate(`/level/${id}`);
};

// After
const handleClick = useCallback((id) => {
  navigate(`/level/${id}`);
}, [navigate]);
```

### 3. useMemo()
Memoize computed values để tránh tính toán lại không cần thiết.

```javascript
// Before
const filteredBooks = books.filter(book => book.category === selectedCategory);

// After
const filteredBooks = useMemo(() => {
  return books.filter(book => book.category === selectedCategory);
}, [books, selectedCategory]);
```

---

## 📁 Components đã optimize

### ✅ BookCard
**File:** `src/features/books/components/BookCard.jsx`

**Changes:**
- Wrapped với `React.memo()`
- Custom comparison function
- Only re-renders when props actually change

**Impact:**
- Prevents re-render khi parent re-renders
- Better performance trong lists với nhiều items

---

### ✅ LessonCard
**File:** `src/features/books/components/LessonCard.jsx`

**Changes:**
- Extracted từ inline component trong BookDetailPage
- Wrapped với `React.memo()`
- Deep comparison cho lessons array

**Impact:**
- Reusable component
- Better performance trong chapter/lesson lists

---

### ✅ LevelN1Page (và các Level pages khác)
**File:** `src/features/books/pages/LevelN1Page.jsx`

**Changes:**
- `useCallback` cho event handlers
- `useMemo` cho computed values (filteredBooks, paginationData, gridItems)
- `useMemo` cho breadcrumbPaths

**Impact:**
- Handlers không tạo lại mỗi render
- Computed values chỉ tính lại khi dependencies thay đổi
- Better performance khi filter/pagination

---

## 🎯 Best Practices

### Khi nào dùng React.memo()
✅ **Nên dùng khi:**
- Component render nhiều lần trong lists
- Props ít thay đổi
- Component có rendering logic phức tạp

❌ **Không nên dùng khi:**
- Component nhỏ, đơn giản
- Props thay đổi thường xuyên
- Memoization overhead lớn hơn benefit

### Khi nào dùng useCallback()
✅ **Nên dùng khi:**
- Function được pass như prop
- Function là dependency của useEffect/useMemo
- Function được dùng trong child components

❌ **Không nên dùng khi:**
- Function chỉ dùng trong component hiện tại
- Function đơn giản, không tốn performance

### Khi nào dùng useMemo()
✅ **Nên dùng khi:**
- Computed value tốn performance
- Value được dùng nhiều lần
- Value là dependency của useEffect/useMemo

❌ **Không nên dùng khi:**
- Computation đơn giản
- Value thay đổi mỗi render
- Memoization overhead lớn hơn benefit

---

## 📊 Performance Monitoring

### React DevTools Profiler

1. **Install React DevTools:**
   - Chrome Extension: React Developer Tools

2. **Profile Component:**
   - Open DevTools → Profiler tab
   - Click "Record"
   - Interact with app
   - Click "Stop"
   - Analyze results

3. **Check:**
   - Render count
   - Render time
   - Components that re-render unnecessarily

### Metrics to Track

- **Render Count:** Số lần component render
- **Render Time:** Thời gian render
- **Frame Rate:** FPS (target: 60fps)
- **Memory Usage:** Memory consumption

---

## 🧪 Testing

### Manual Testing
1. Open app với React DevTools Profiler
2. Navigate giữa pages
3. Filter/pagination
4. Check render count và time

### Expected Results
- ✅ Fewer re-renders
- ✅ Faster render times
- ✅ Smoother interactions
- ✅ Better frame rate

---

## 📝 Checklist

### Components to Optimize
- [x] BookCard
- [x] LessonCard
- [x] LevelN1Page (handlers & computed values)
- [ ] LevelN2Page
- [ ] LevelN3Page
- [ ] LevelN4Page
- [ ] LevelN5Page
- [ ] JLPTLevelN1-5Pages
- [ ] ExamCard (if exists)
- [ ] SeriesCard
- [ ] CardItem (FlashcardEditor)

### Optimization Techniques
- [x] React.memo() for list components
- [x] useCallback() for event handlers
- [x] useMemo() for computed values
- [ ] Props optimization (avoid object/array literals)
- [ ] Context optimization (split contexts)

---

## 🚀 Next Steps

1. **Apply to other Level pages:**
   - LevelN2Page, LevelN3Page, LevelN4Page, LevelN5Page
   - Same pattern as LevelN1Page

2. **Apply to JLPT pages:**
   - JLPTLevelN1-5Pages
   - Similar optimization pattern

3. **Optimize other components:**
   - SeriesCard
   - CardItem
   - ExamCard (if exists)

4. **Props optimization:**
   - Avoid object/array literals in JSX
   - Extract to constants or useMemo

5. **Context optimization:**
   - Split large contexts
   - Use multiple small contexts

---

## 📚 References

- [React.memo()](https://react.dev/reference/react/memo)
- [useCallback()](https://react.dev/reference/react/useCallback)
- [useMemo()](https://react.dev/reference/react/useMemo)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Status:** ✅ In Progress  
**Next:** Apply to other Level/JLPT pages
