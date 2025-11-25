# 📊 Phân Tích: Tính Năng Xem Từ Đã Lưu

## 🔍 Hiện Trạng

### ✅ Đã Có
1. **Logic lưu từ:**
   - `saveWord()` trong `dictionaryService.js`
   - Lưu vào `localStorage` với key `dictionary_saved_words`
   - Lưu tối đa 100 từ

2. **Context quản lý:**
   - `savedWords` state trong `DictionaryContext`
   - `getSavedWords()` function
   - `removeSavedWord()` function
   - `isWordSaved()` function

3. **UI lưu từ:**
   - Nút "⭐ Lưu từ" trong `DictionaryPopup`
   - Hiển thị "✓ Đã lưu" khi từ đã được lưu

### ❌ Chưa Có
1. **Component hiển thị danh sách từ đã lưu**
2. **Page/Route để xem từ đã lưu**
3. **UI để quản lý từ đã lưu** (xóa, tìm kiếm, sắp xếp)

## 💡 Đề Xuất Thiết Kế

### Option 1: Popup/Drawer từ nút tra từ (Recommended)

**Vị trí:** Thêm vào `DictionaryButton` hoặc tạo component riêng

**Thiết kế:**
```
┌─────────────────────────────────┐
│  📚 TỪ ĐÃ LƯU (10)      [X]    │
├─────────────────────────────────┤
│  🔍 [Tìm kiếm...]               │
├─────────────────────────────────┤
│  ⭐ 毎日 (まいにち)              │
│     mỗi ngày, hằng ngày          │
│     [🗑️ Xóa] [👁️ Xem]          │
├─────────────────────────────────┤
│  ⭐ 勉強 (べんきょう)            │
│     học, học tập                │
│     [🗑️ Xóa] [👁️ Xem]          │
├─────────────────────────────────┤
│  ...                            │
└─────────────────────────────────┘
```

**Ưu điểm:**
- Dễ truy cập (từ nút tra từ)
- Không cần route mới
- UI gọn, phù hợp với thiết kế hiện tại

### Option 2: Trang riêng (Full-featured)

**Route:** `/dictionary/saved-words`

**Thiết kế:**
- Header với số lượng từ đã lưu
- Search bar
- Filter (theo JLPT level, theo ngày lưu)
- Sort (theo tên, theo ngày lưu)
- Grid/List view
- Pagination

**Ưu điểm:**
- Nhiều tính năng hơn
- Dễ mở rộng sau này
- UX tốt cho nhiều từ

### Option 3: Sidebar/Drawer (Hybrid)

**Vị trí:** Sidebar bên phải hoặc drawer từ nút tra từ

**Thiết kế:**
- Toggle từ `DictionaryButton`
- Slide-in drawer
- Hiển thị danh sách từ đã lưu
- Click vào từ → mở popup tra từ

**Ưu điểm:**
- Không che mất nội dung chính
- Dễ truy cập
- UX tốt

## 🎯 Khuyến Nghị: Option 1 + Option 3 (Hybrid)

**Thiết kế đề xuất:**

1. **Thêm icon vào DictionaryButton:**
   - Badge hiển thị số từ đã lưu
   - Click → mở drawer

2. **Drawer component:**
   - Slide-in từ bên phải
   - Header: "📚 TỪ ĐÃ LƯU (10)"
   - Search bar
   - List từ đã lưu
   - Mỗi item: Từ + Nghĩa + Actions (Xóa, Xem)

3. **Tích hợp với DictionaryPopup:**
   - Click vào từ trong drawer → mở popup tra từ
   - Có thể xóa từ trực tiếp trong drawer

## 📋 Chi Tiết Implementation

### Component Structure
```
DictionaryButton
  └─ SavedWordsDrawer (new)
      ├─ Header (số lượng từ)
      ├─ SearchBar
      ├─ SavedWordList
      │   └─ SavedWordItem (x N)
      │       ├─ Word + Reading
      │       ├─ Meaning (preview)
      │       └─ Actions (Xem, Xóa)
      └─ EmptyState (nếu chưa có từ)
```

### Data Flow
```
localStorage (dictionary_saved_words)
  ↓
DictionaryContext (savedWords state)
  ↓
SavedWordsDrawer (display)
  ↓
SavedWordItem (individual word)
  ↓
DictionaryPopup (when click "Xem")
```

### Features
1. **Hiển thị:**
   - Từ (kanji/hiragana)
   - Reading (nếu có)
   - Nghĩa (preview - 1-2 nghĩa đầu)
   - Ngày lưu (optional)

2. **Actions:**
   - Click từ → Mở popup tra từ
   - Xóa từ
   - Search/Filter

3. **Empty State:**
   - "Chưa có từ nào được lưu"
   - "Bắt đầu lưu từ bằng cách click ⭐ trong popup tra từ"

## 🎨 UI Design (Neo Brutalism)

### Drawer
- Background: White
- Border: 4px black
- Shadow: 6px 6px 0px 0px rgba(0,0,0,1)
- Width: 400px (desktop), 90vw (mobile)

### Header
- Background: Yellow-400
- Text: Black, font-black, uppercase
- Border-bottom: 4px black

### Word Item
- Background: White
- Border: 2px black
- Hover: Shadow effect
- Padding: 12px

### Buttons
- Style: Neo Brutalism (giống DictionaryButton)
- Colors: Yellow-400 (primary), Red-500 (delete)

## 📝 Implementation Plan

### Phase 1: Basic Display
1. ✅ Tạo `SavedWordsDrawer` component
2. ✅ Hiển thị danh sách từ đã lưu
3. ✅ Tích hợp với `DictionaryContext`
4. ✅ Thêm toggle button vào `DictionaryButton`

### Phase 2: Actions
1. ✅ Click từ → Mở popup tra từ
2. ✅ Xóa từ
3. ✅ Update state sau khi xóa

### Phase 3: Enhancements
1. ⏳ Search/Filter
2. ⏳ Sort options
3. ⏳ Pagination (nếu > 20 từ)
4. ⏳ Export/Import

## 🔧 Files Cần Tạo/Chỉnh Sửa

### New Files
- `src/components/api_translate/SavedWordsDrawer.jsx`
- `src/components/api_translate/SavedWordItem.jsx`

### Modified Files
- `src/components/api_translate/DictionaryButton.jsx` (thêm toggle)
- `src/components/api_translate/index.js` (export new components)

## 📊 Kết Luận

**Hiện tại:** Có logic lưu từ nhưng **chưa có UI để xem** từ đã lưu.

**Đề xuất:** Tạo `SavedWordsDrawer` component với:
- Toggle từ `DictionaryButton`
- Hiển thị danh sách từ đã lưu
- Click để xem lại từ
- Xóa từ
- Search (optional)

**Priority:** **Cao** - Tính năng quan trọng để user quản lý từ đã học.

