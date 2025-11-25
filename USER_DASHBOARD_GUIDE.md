# 📊 User Dashboard & Statistics - Hướng dẫn sử dụng

## 🎯 Tổng quan

Hệ thống giờ có **2 trang riêng biệt** để theo dõi tiến độ học tập:

### 1️⃣ User Dashboard - `/dashboard`
**Mục đích**: Xem tổng quan TẤT CẢ decks và tiến độ học tập tổng thể

### 2️⃣ Statistics (Per-deck) - `/statistics/:deckId`
**Mục đích**: Xem chi tiết thống kê của 1 deck cụ thể

---

## 📱 User Dashboard (`/dashboard`)

### Cách truy cập:
1. **Desktop**: Bấm nút "📊 Dashboard" trên Header (giữa Home và Level)
2. **Mobile**: Mở menu ☰ → Bấm "📊 Dashboard"
3. **Direct**: Vào URL `/dashboard`

### Nội dung hiển thị:

#### 🔢 4 Stat Cards (Top)
- **🎴 Tổng số Deck**: Số lượng deck có flashcard
- **🔥 Cần ôn ngay**: Tổng số thẻ đến lịch từ TẤT CẢ decks
- **⭐ Đã thành thạo**: Số thẻ đã nhớ chắc
- **📈 Streak**: Số ngày học liên tiếp

#### 🎓 Tiến độ tổng thể
- Progress bar gradient theo mức độ
- Labels: Mới bắt đầu 🌱 → Bậc thầy 👑
- 3 stats: Tổng thẻ / Đã thành thạo / Chưa thạo

#### ⏰ Action Banner (nếu có thẻ due)
- Hiển thị tổng số thẻ cần ôn
- Từ bao nhiêu deck
- Animation pulse

#### 📚 Danh sách Deck
Mỗi deck hiển thị:
- **Tên deck** + số thẻ due (badge cam)
- **Vị trí**: bookId → chapterId
- **3 stats nhỏ**: Tổng thẻ / Thành thạo / Cần ôn
- **Progress bar** độ thành thạo (màu sắc theo level)
- **2 nút**:
  - `🚀 Học ngay (X)` - Nếu có thẻ due → Vào trang review
  - `✅ Hoàn thành` - Nếu không có thẻ due (disabled)
  - `📊 Chi tiết` - Vào trang Statistics của deck đó

#### 📝 Hoạt động gần đây
- 5-10 review gần nhất
- Timestamp
- Grade emoji (❌😅✅🌟)

---

## 📈 Statistics Dashboard (`/statistics/:deckId`)

### Cách truy cập:
1. Từ **User Dashboard** → Bấm "📊 Chi tiết" trên deck card
2. Từ **Lesson Page** (SRS Widget) → Bấm "📊 Xem Thống Kê Chi Tiết"
3. Từ **Review Session** (sau khi học xong) → Bấm "📊 View Stats"

### Nội dung hiển thị:

#### 📊 4 Overview Cards
- Thẻ mới (Today)
- Cần ôn tập (Due now)
- Tỷ lệ đúng (Accuracy)
- Streak (Days)

#### 📈 Charts (Grid 2x2)

**Chart 1: Lượt ôn (7 ngày qua)**
- Horizontal bar chart
- Số lượt ôn mỗi ngày
- Animation smooth

**Chart 2: Phân loại thẻ**
- 4 categories:
  - ✨ Mới (chưa học lần nào)
  - 📖 Đang học (đã học chưa thạo)
  - 🌟 Quen thuộc (interval < 21 ngày)
  - ⭐ Thành thạo (interval > 21 ngày)
- Progress bars với %
- Tổng cộng ở dưới

**Chart 3: Lịch ôn tập sắp tới**
- Forecast 7 ngày tiếp
- Số thẻ cần ôn mỗi ngày
- Highlight hôm nay (màu tím)

**Chart 4: Lịch sử học tập**
- Heatmap 4 tuần (28 ngày)
- Màu sắc theo cường độ học
- Tooltip hover: ngày + số lượt ôn

#### 📊 Thống kê tổng quan (Table 8 rows)
- Tổng số thẻ
- Tổng lượt ôn
- Ôn đúng
- Tỷ lệ nhớ
- Độ dễ TB
- Thời gian học
- Streak hiện tại
- Streak dài nhất

#### 🎓 Mức độ thành thạo
- Progress bar lớn với gradient
- Label động: Mới bắt đầu → Bậc thầy
- Số thẻ mature

#### 🚀 Action Button (Bottom)

**Nếu có thẻ due:**
```
┌────────────────────────────┐
│   🚀  BẮT ĐẦU ÔN TẬP      │
│      X thẻ đang chờ        │
└────────────────────────────┘
```
→ Vào FlashcardReviewPage

**Nếu không có thẻ:**
```
┌────────────────────────────┐
│          🎉                │
│   Hoàn thành xuất sắc!     │
│   Đã học hết tất cả thẻ    │
│                            │
│   [← Quay về bài học]      │
└────────────────────────────┘
```

---

## 🔄 Navigation Flow

### Flow 1: Học flashcard từ Lesson
```
Lesson Page
  ↓ (Widget: "🚀 HỌC THẺ MỚI")
FlashcardReviewPage
  ↓ (Học xong → Session Summary)
  ├─ "🔄 Review Again" → FlashcardReviewPage
  ├─ "📊 View Stats" → StatisticsDashboard/:deckId
  └─ "← Back" → Lesson Page
```

### Flow 2: Xem thống kê từ Lesson
```
Lesson Page
  ↓ (Widget: "📊 Xem Thống Kê Chi Tiết")
StatisticsDashboard/:deckId
  ├─ "🚀 BẮT ĐẦU ÔN TẬP" → FlashcardReviewPage
  └─ "← Back" → Lesson Page
```

### Flow 3: Xem tổng quan tất cả decks
```
Anywhere
  ↓ (Header: "📊 Dashboard")
UserDashboard
  ↓ (Deck card: "🚀 Học ngay")
FlashcardReviewPage
  ↓ (Deck card: "📊 Chi tiết")
StatisticsDashboard/:deckId
```

### Flow 4: Không có thẻ due
```
StatisticsDashboard/:deckId
  (dueCount = 0)
  ↓
Hiển thị: "🎉 Hoàn thành xuất sắc!"
  [← Quay về bài học] → Lesson Page
```

---

## 🎨 Design Highlights

### Color Scheme theo Mastery Level:
- **0-25%**: 🔴 Đỏ (Mới bắt đầu 🌱)
- **25-50%**: 🟠 Cam (Đang học 📚)
- **50-75%**: 🟡 Vàng (Trung cấp 💪)
- **75-90%**: 🟢 Xanh lá (Nâng cao 🎓)
- **90-100%**: 💚 Xanh đậm (Bậc thầy 👑)

### Card States (4 loại):
- **New (Xanh dương)**: Chưa học lần nào
- **Learning (Vàng)**: Mới học, chưa thạo
- **Young (Cam)**: Interval < 21 ngày
- **Mature (Xanh lá)**: Interval > 21 ngày

### Responsive:
- **Desktop**: Grid 4 columns, full features
- **Mobile**: Grid 2 columns, stacked layout
- **Touch targets**: Min 48px height

---

## 🔧 Technical Details

### IndexedDB Structure:
```javascript
// Lessons store
{
  bookId: "book-001",
  chapterId: "chapter-1",
  lessons: [
    {
      id: "lesson-1-2",
      title: "no2 tu vung",
      srs: {
        enabled: true,
        cardCount: 4,
        cards: [...]
      }
    }
  ]
}

// SRS Progress store (indexed by deckId)
{
  userId: "user-001",
  deckId: "lesson-1-2",
  cardId: "card-123",
  state: "learning", // new | learning | mastered
  interval: 3, // days
  easeFactor: 2.5,
  nextReview: "2025-11-23T10:00:00Z"
}
```

### Load Strategy:
1. **Scan all lesson groups** in IndexedDB
2. **Filter lessons** with `srs.enabled === true`
3. **Calculate stats** for each deck
4. **Sort by** most cards due
5. **Display** with real-time data

---

## ✅ Checklist để Dashboard hoạt động:

### Yêu cầu:
- [x] Lesson đã được lưu vào IndexedDB
- [x] Lesson có `srs.enabled = true`
- [x] Lesson có `srs.cards` (array of flashcards)
- [x] User đã đăng nhập (có userId)

### Features hoạt động:
- [x] Load tất cả decks
- [x] Tính stats real-time
- [x] Navigation giữa các trang
- [x] Progress tracking
- [x] Review scheduling
- [x] Mastery calculation
- [x] Streak tracking
- [x] Heatmap calendar
- [x] Forecast reviews
- [x] Responsive mobile

---

## 🚀 Cách test:

### Test 1: Tạo deck mới
1. Vào Admin → Quản lý Bài học
2. Tạo bài lesson với Flashcard
3. Bật SRS, thêm 3-5 thẻ
4. Lưu lesson

### Test 2: Xem Dashboard
1. Vào `/dashboard`
2. Kiểm tra:
   - Deck hiển thị trong list?
   - Stats đúng?
   - Nút "Học ngay" active?

### Test 3: Học flashcard
1. Từ Dashboard → Bấm "🚀 Học ngay"
2. Học 2-3 thẻ
3. Check Session Summary
4. Vào Statistics → Xem data update

### Test 4: Navigation loop
```
Dashboard
→ Deck card: "Học ngay"
→ FlashcardReview
→ Session Summary: "View Stats"
→ StatisticsDashboard
→ "Bắt đầu ôn tập"
→ FlashcardReview
→ "Back"
→ Lesson Page
→ Widget: "Xem Thống Kê"
→ StatisticsDashboard
```

---

## 🎯 User Benefits

### Trước (chỉ có StatisticsDashboard per-deck):
- ❌ Không biết tổng quan tất cả decks
- ❌ Phải vào từng lesson để xem stats
- ❌ Không thấy decks nào cần ôn
- ❌ Thiếu động lực (không thấy progress tổng)

### Sau (có cả UserDashboard):
- ✅ Nhìn 1 chỗ thấy hết (dashboard)
- ✅ Biết ngay deck nào cần ôn
- ✅ Thấy tiến độ tổng thể → động lực
- ✅ Quick access tất cả decks
- ✅ Streak tracker → gamification
- ✅ Recent activity → engagement

---

## 📋 So sánh với competitors

### Anki:
✅ Có trang tổng quan tất cả decks  
✅ Stats per-deck riêng  
✅ Heatmap calendar  
→ **Chúng ta cũng có đầy đủ!**

### Quizlet:
✅ Dashboard với all sets  
✅ Progress tracking  
✅ Study reminders  
→ **Chúng ta có + SRS algorithm tốt hơn!**

### Duolingo:
✅ Daily goals & streaks  
✅ Overall progress  
✅ Gamification  
→ **Chúng ta có streak, thiếu achievements (có thể thêm sau)**

---

## 🔮 Future Enhancements (Optional)

### V2.0 - Achievements & Gamification:
- 🏅 Badges (First 100 cards, 30-day streak, etc.)
- 🎖️ Levels (Bronze → Silver → Gold → Platinum)
- 🏆 Leaderboard (nếu có nhiều users)
- 🎁 Rewards system

### V2.1 - Advanced Analytics:
- 📊 Learning curve graphs
- 🧠 Difficult cards tracker
- ⏰ Best study time analyzer
- 📈 Progress predictions

### V2.2 - Social Features:
- 👥 Study groups
- 📤 Share decks
- 💬 Deck comments/ratings
- 🤝 Collaborative learning

---

## 🎉 Status: HOÀN THÀNH 100%

✅ UserDashboard created  
✅ StatisticsDashboard improved  
✅ Routes configured  
✅ Header links added  
✅ Navigation flow完善  
✅ Error handling robust  
✅ Responsive mobile  
✅ Vietnamese localized  
✅ No linter errors  

**Sẵn sàng sử dụng!** 🚀

