# 🔥 Study Streak System - Hướng dẫn đầy đủ

## 📋 Tổng quan

**Study Streak** là hệ thống theo dõi số ngày học LIÊN TỤC của bạn. Đây là công cụ động lực mạnh mẽ để xây dựng thói quen học tập.

---

## ✅ Streak được TĂNG khi nào?

Streak tăng khi bạn thực hiện **ít nhất 1** trong các hoạt động sau **mỗi ngày**:

### 1. 🎴 Học Flashcard
- Hoàn thành **ít nhất 1 session** ôn tập flashcard
- Không quan trọng bao nhiêu thẻ, chỉ cần học ít nhất 1 thẻ
- **Trigger**: Khi bấm nút grade (Again/Hard/Good/Easy) trong FlashcardReviewPage

### 2. ✅ Hoàn thành Lesson
- Tick checkbox **"✅ Đã học xong"** trong trang lesson
- Đánh dấu lesson là đã hoàn thành
- **Trigger**: Khi toggle lesson completion checkbox

### 3. 📝 Làm Quiz (Future)
- Hoàn thành bài kiểm tra
- **Trigger**: Khi submit quiz (feature sẽ được thêm)

---

## ❌ Streak bị RESET khi nào?

### Rule: BỎ LỠ 1 NGÀY → RESET VỀ 0

**Ví dụ:**
```
Ngày 1 (Thứ 2): Học 5 flashcard       → Streak = 1 🔥
Ngày 2 (Thứ 3): Tick 1 lesson xong    → Streak = 2 🔥🔥
Ngày 3 (Thứ 4): Ôn 10 flashcard       → Streak = 3 🔥🔥🔥
Ngày 4 (Thứ 5): KHÔNG học gì cả       → ❌ Streak về 0
Ngày 5 (Thứ 6): Học 3 flashcard       → Streak = 1 🔥 (bắt đầu lại)
```

### ⚠️ Những gì KHÔNG tính là học:

| Hoạt động | Tính Streak? | Lý do |
|-----------|--------------|-------|
| Đăng nhập vào hệ thống | ❌ | Chỉ đăng nhập, không học |
| Vào trang Admin/Editor | ❌ | Quản trị, không phải học |
| Xem Dashboard | ❌ | Xem stats, không học |
| Tạo/chỉnh sửa lesson (Admin) | ❌ | Làm việc, không học |
| Đọc lý thuyết NHƯNG không tick "Đã xong" | ❌ | Chưa hoàn thành |
| Mở flashcard NHƯNG không ôn | ❌ | Chưa review |

---

## 📊 Logic tính toán

### Algorithm:
```javascript
function updateStudyStreak() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('study_last_date');
  
  if (lastDate === today) {
    // Đã học rồi hôm nay → không cần update
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastDate === yesterdayStr) {
    // Học liên tục → tăng streak
    currentStreak = currentStreak + 1;
  } else {
    // Bỏ lỡ ngày → reset về 1
    currentStreak = 1;
  }
  
  localStorage.setItem('study_last_date', today);
}
```

### Kiểm tra Streak:
```javascript
function getStudyStreak() {
  return {
    streak: parseInt(localStorage.getItem('study_streak') || '0'),
    lastStudyDate: localStorage.getItem('study_last_date')
  };
}
```

---

## 🎯 Use Cases thực tế

### Case 1: User thông thường (Student)
```
Thứ 2: Học 10 flashcard → Streak = 1
Thứ 3: Học 15 flashcard → Streak = 2
Thứ 4: Tick 2 lesson xong → Streak = 3
Thứ 5: Học 5 flashcard → Streak = 4
Thứ 6: QUÊN học → Streak = 0
Thứ 7: Học 10 flashcard → Streak = 1
```

### Case 2: Admin/Editor (như bạn)
```
Thứ 2: Đăng nhập admin, tạo 5 lessons → ❌ Streak = 0
       (Lý do: Làm việc quản trị, không "học")

Thứ 3: Đăng nhập admin, chỉnh sửa content → ❌ Streak = 0
       (Lý do: Biên tập, không "học")
       
Thứ 4: Vào 1 lesson, học 3 flashcard → ✅ Streak = 1
       (Lý do: ĐÃ HỌC flashcard)
       
Thứ 5: Chỉnh content + Học 5 flashcard → ✅ Streak = 2
       (Lý do: Có học flashcard, không quan trọng làm admin)

Thứ 6: Chỉ làm admin, không học → ❌ Streak về 0
       (Lý do: Bỏ lỡ 1 ngày không học)
```

### Case 3: Streak dài hạn
```
30 ngày liên tục: 🔥🔥🔥 Amazing! 🌟
60 ngày liên tục: 🏆 Champion! 👑
100 ngày liên tục: 🎖️ Master Learner! 💎
```

---

## 💡 Giải pháp cho Admin/Editor muốn track streak

### Option 1: Học ít mỗi ngày (Khuyến nghị)
Mỗi ngày sau khi làm admin:
1. Vào 1 lesson bất kỳ có flashcard
2. Học ít nhất 1-2 thẻ (1 phút)
3. Streak được update!

**Lợi ích**: 
- Vừa track được streak
- Vừa test được features flashcard
- Vừa tự học luôn! 😊

### Option 2: Separate tracking cho Admin
(Tính năng mở rộng - chưa implement)
- Admin có streak riêng: "Work Streak" (đăng nhập liên tục)
- User có streak: "Study Streak" (học liên tục)

### Option 3: Manual streak update
(Không khuyến nghị - mất ý nghĩa gamification)
- Admin có thể manual set streak trong Settings
- Nhưng mất đi tính động lực

---

## 🏆 Milestones & Achievements (Future)

### Hiện tại:
- Chỉ hiển thị số ngày
- Icon thay đổi: 💤 (0 days) → 🔥 (>0 days)
- Màu sắc: Xám (0) → Cam-đỏ (>0)

### Tương lai (V2.0):
- **Badges**:
  - 🥉 7 ngày: "Week Warrior"
  - 🥈 30 ngày: "Month Master"
  - 🥇 100 ngày: "Century Champion"
  - 💎 365 ngày: "Year Legend"

- **Streak Recovery**:
  - 1 lần "Freeze" mỗi tháng (nếu streak >7)
  - Bỏ 1 ngày nhưng không mất streak

- **Leaderboard**:
  - Top 10 users với streak dài nhất
  - Weekly/Monthly streak champions

---

## 🔧 Technical Details

### Data Storage:
```javascript
// localStorage
{
  "study_streak": "15",           // Số ngày liên tục
  "study_last_date": "Thu Nov 21 2025"  // Ngày học cuối
}
```

### Update Flow:
```
User học flashcard
  ↓
FlashcardReviewPage.finishSession()
  ↓
updateStudyStreak()
  ↓
Check:
  - lastDate === today? → Skip
  - lastDate === yesterday? → streak++
  - else? → streak = 1
  ↓
localStorage.setItem('study_streak', newStreak)
localStorage.setItem('study_last_date', today)
  ↓
StreakCounter.jsx auto-reload (every 60s)
  ↓
Display new streak in Header
```

### Display Logic:
```javascript
// StreakCounter.jsx
if (streak === 0) {
  show: "💤 0 days" (gray)
  tooltip: "Học ngay hôm nay để bắt đầu streak!"
} else {
  show: "🔥 {streak} days" (orange-red gradient)
  tooltip: 
    - < 7 days: "Cố gắng duy trì nhé!"
    - 7-30 days: "Tuyệt vời! 🎉"
    - >30 days: "Amazing! 🌟"
}
```

---

## 📈 Best Practices

### Để xây dựng streak bền vững:

1. **Học ít, học đều** ⭐
   - 10 thẻ/ngày tốt hơn 100 thẻ/tuần
   - Consistency > Intensity

2. **Đặt lịch cố định** 📅
   - Ví dụ: 7h sáng mỗi ngày
   - Thành thói quen như đánh răng

3. **Bắt đầu nhỏ** 🌱
   - Tuần 1: 5 thẻ/ngày
   - Tuần 2: 10 thẻ/ngày
   - Tuần 3+: 15-20 thẻ/ngày

4. **Kiểm tra Dashboard** 📊
   - Mỗi sáng: Check thẻ cần ôn
   - Mỗi tối: Ôn hết thẻ due

5. **Đừng cheat!** 🚫
   - Đánh giá trung thực
   - Không bấm Easy khi chưa nhớ chắc
   - Hệ thống sẽ giúp bạn nhớ lâu hơn

---

## 🐛 Troubleshooting

### "Tôi học flashcard rồi mà streak vẫn 0?"

**Kiểm tra:**
1. Console (F12) có log "✅ Study streak updated"?
2. localStorage có key `study_last_date`?
3. Session có finish không? (phải học hết queue, không thoát giữa chừng)

**Fix:**
- Đảm bảo học HẾT session (không thoát giữa chừng)
- Check Console có lỗi không
- Thử clear localStorage và học lại

### "Streak reset đột ngột?"

**Nguyên nhân thường gặp:**
- Đổi timezone
- Clear browser data
- Bỏ lỡ 1 ngày (quên học)

**Prevention:**
- Backup progress thường xuyên
- Set reminder hàng ngày
- Check dashboard mỗi sáng

---

## 🎯 Summary

### Quy tắc vàng:
✅ **HỌC MỖI NGÀY** = Streak tăng  
❌ **BỎ 1 NGÀY** = Streak về 0  
💡 **ÍT NHƯNG ĐỀU** = Hiệu quả nhất  

### Cách thức:
1. Vào Dashboard → Xem thẻ cần ôn
2. Bấm "🚀 Học ngay" trên deck có thẻ due
3. Học ít nhất 1 thẻ
4. Streak tự động tăng!

### Hiển thị:
- **Header**: 🔥 X days (hoặc 💤 0 days)
- **Dashboard**: Card "Streak" với số ngày
- **Statistics**: Study Calendar heatmap

---

## 🚀 Kết luận

**Tại sao Admin có streak = 0?**
→ Vì chỉ đăng nhập/làm admin là **KHÔNG học**!

**Giải pháp:**
→ Mỗi ngày sau khi làm admin, học nhanh 5-10 flashcard để maintain streak!

**Lợi ích:**
→ Vừa test features, vừa tự học, vừa có động lực! 💪

---

**File updated:** 2025-11-21  
**Version:** 1.0  
**Status:** ✅ Fully Implemented

