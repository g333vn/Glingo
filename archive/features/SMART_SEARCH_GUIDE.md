# 🔍 Smart Global Search - Hướng Dẫn Nâng Cao

## 📋 Tổng Quan

**Smart Global Search** là hệ thống tìm kiếm thông minh được nâng cấp, cho phép tìm kiếm **MỌI THỨ** trong ứng dụng chỉ với **1 ký tự**.

## 🎯 Điểm Nổi Bật

### ⚡ Instant Search (1 ký tự)
- Tìm kiếm ngay lập tức từ ký tự đầu tiên
- Không cần nhập đầy đủ từ khóa
- Gợi ý thông minh theo context

### 🔐 Role-Based Search
- **Guest**: Chỉ thấy trang public (Home, Level, JLPT, About)
- **User**: Thấy thêm Profile, Streak, Dictionary
- **Editor**: Thấy thêm Editor Dashboard, Edit Content
- **Admin**: Thấy TẤT CẢ (Admin Panel, Settings, Analytics, User Management)

### 🎨 Smart Categories
- **⚡ GỢI Ý NHANH**: Pages, Features, Settings
- **📚 SÁCH**: Books
- **📂 CHAPTERS**: Chapters
- **📝 BÀI HỌC**: Lessons

## 🚀 Cách Sử Dụng

### 1. Mở Search
- **Nút floating**: Click góc dưới phải
- **Phím tắt**: `Ctrl+K` (Windows) / `Cmd+K` (Mac)

### 2. Quick Shortcuts (1 ký tự)

#### Public Shortcuts
- `h` → Home
- `l` → Level Selection
- `j` → JLPT Tests
- `a` → About Me
- `p` → Profile (nếu đã login)
- `d` → Dictionary Feature
- `s` → Search Feature

#### Admin Shortcuts
- `a` → Admin Dashboard
- `c` → Content Management
- `q` → Quiz Editor
- `u` → User Management
- `s` → System Settings
- `e` → Export/Import

#### Editor Shortcuts
- `e` → Editor Dashboard
- `c` → Edit Content

### 3. Tìm Kiếm Thông Minh

#### Tìm theo từ khóa tiếng Việt
```
Gõ: "cai dat" → System Settings
Gõ: "quan tri" → Admin Dashboard
Gõ: "cap do" → Level Selection
Gõ: "thi thu" → JLPT Tests
```

#### Tìm theo từ khóa tiếng Anh
```
Gõ: "admin" → Admin Dashboard
Gõ: "content" → Content Management
Gõ: "profile" → My Profile
Gõ: "test" → JLPT Tests
```

#### Tìm theo viết tắt
```
Gõ: "n5" → N5 Level + N5 Test
Gõ: "n1" → N1 Level + N1 Test
```

## 🎯 Ví Dụ Cụ Thể

### Ví dụ 1: Admin tìm Settings
```
1. Nhấn Ctrl+K
2. Gõ: "s"
3. Kết quả:
   ⚡ GỢI Ý NHANH (3)
   ⚙️ System Settings [QUẢN TRỊ]
      Cài đặt hệ thống
   
   🔍 Global Search [TÍNH NĂNG]
      Tìm kiếm toàn cục (Ctrl+K)
   
   🔥 Learning Streak [TÍNH NĂNG]
      Theo dõi chuỗi ngày học liên tục
```

### Ví dụ 2: User tìm Level N3
```
1. Nhấn Ctrl+K
2. Gõ: "n3"
3. Kết quả:
   ⚡ GỢI Ý NHANH (2)
   🌳 N3 - Intermediate Level [NỘI DUNG]
      Cấp độ trung cấp
   
   📋 JLPT N3 Test [NỘI DUNG]
      Thi thử N3
```

### Ví dụ 3: Guest tìm Home
```
1. Nhấn Ctrl+K
2. Gõ: "h"
3. Kết quả:
   ⚡ GỢI Ý NHANH (1)
   🏠 Home [TRANG]
      Trang chủ
```

### Ví dụ 4: Admin tìm Content
```
1. Nhấn Ctrl+K
2. Gõ: "c"
3. Kết quả:
   ⚡ GỢI Ý NHANH (4)
   📚 Content Management [QUẢN TRỊ]
      Quản lý nội dung (Series, Books, Chapters, Lessons)
   
   ⚙️ System Settings [QUẢN TRỊ]
      Cài đặt hệ thống
   
   (+ các kết quả khác)
```

## 🎨 UI/UX Improvements

### Category Labels
- **TRANG** (Blue): Public pages
- **TÍNH NĂNG** (Green): App features
- **NỘI DUNG** (Purple): Learning content
- **QUẢN TRỊ** (Red): Admin pages
- **BIÊN TẬP** (Orange): Editor pages

### Visual Feedback
- **Selected item**: Background color + scale up
- **Hover**: Shadow + border color change
- **Icon**: Large emoji for quick recognition
- **Badge**: Category label in color

### Keyboard Navigation
- `↑` / `↓`: Navigate results
- `Enter`: Select result
- `Esc`: Close search

## 🔧 Technical Details

### Files Structure
```
src/
├── components/
│   └── GlobalSearch.jsx          # Main search component
└── config/
    └── searchableItems.js         # Search registry
```

### Search Algorithm
1. **Instant items search** (1+ char):
   - Search in `SEARCHABLE_ITEMS` registry
   - Filter by user role
   - Score by relevance (title, keywords, description)
   - Return top 8 results

2. **Content search** (2+ chars):
   - Search books, chapters, lessons
   - Filter by title, id, description
   - Limit results (5 books, 5 chapters, 8 lessons)

### Scoring System
- Title exact match: +1000
- Title starts with: +500
- Exact keyword match: +400
- Keyword contains: +300
- Title contains: +200
- Description contains: +100
- Priority bonus: +priority value

## 📊 Searchable Items Registry

### Current Items (40+)
- **Pages**: Home, Level, JLPT, About, Profile, Login, Register
- **Features**: Dictionary, Streak, Search, Language
- **JLPT Levels**: N1-N5 (Learning)
- **JLPT Tests**: N1-N5 (Testing)
- **Admin**: Dashboard, Content, Quiz, JLPT, Users, Settings, Analytics, Export
- **Editor**: Dashboard, Content

### Adding New Items
Để thêm items mới vào search, edit `src/config/searchableItems.js`:

```javascript
{
  id: 'unique-id',
  title: 'Display Title',
  description: 'Short description',
  keywords: ['keyword1', 'keyword2', 'viet', 'shortcut'],
  category: 'page|feature|content|admin|editor',
  icon: '🎯',
  path: '/path/to/page',
  roles: null, // null = public, ['user', 'admin'] = restricted
  priority: 100 // higher = show first
}
```

## 🚀 Performance

### Optimization
- **Debounce**: 150ms (faster than before)
- **Lazy search**: Content search only if query >= 2 chars
- **Result limits**: Prevent UI overload
- **Role filtering**: Only search accessible items

### Speed
- **1 char**: Instant (< 50ms)
- **2+ chars**: Fast (< 200ms with content)
- **No lag**: Smooth user experience

## 🎯 Use Cases

### Use Case 1: Admin cần nhanh vào Settings
1. Nhấn `Ctrl+K`
2. Gõ `s`
3. Chọn "System Settings"
4. Done! (3 giây)

### Use Case 2: User muốn học N5
1. Nhấn `Ctrl+K`
2. Gõ `n5`
3. Chọn "N5 - Basic Level"
4. Done!

### Use Case 3: Editor cần edit content
1. Nhấn `Ctrl+K`
2. Gõ `e`
3. Chọn "Edit Content"
4. Done!

## 💡 Tips & Tricks

1. **Dùng shortcuts**: 1 ký tự = nhanh nhất
2. **Dùng tiếng Việt**: "cai dat", "quan tri", "cap do"
3. **Dùng viết tắt**: "n1", "n2", "jlpt"
4. **Keyboard only**: Không cần chuột!
5. **Learn patterns**: Admin thường bắt đầu bằng "a", "c", "s"

## 🔮 Future Improvements

- [ ] Search history (lịch sử tìm kiếm)
- [ ] Recent searches (tìm kiếm gần đây)
- [ ] Frecency algorithm (frequency + recency)
- [ ] Fuzzy search (typo tolerance)
- [ ] Search analytics (track popular queries)
- [ ] Custom shortcuts (user-defined)
- [ ] Search filters (by category, level)

---

**Version**: 2.0 (Smart Search)  
**Last Updated**: 2024  
**Author**: AI Assistant

