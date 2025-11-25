# 🚀 Phase 3 Roadmap - Student Review Interface

## Kế Hoạch Phase 3 (Starting Now - Nov 20, 2025)

Phase 1 ✅ + Phase 2 ✅ hoàn thành! Giờ đến Phase 3: **Student Review Interface + SRS Algorithm**

---

## 🎯 Phase 3 Goals

### Mục Tiêu Chính

1. **Student Engagement:** Học viên có thể ôn tập flashcard hiệu quả
2. **SRS Algorithm:** Implement SM-2 algorithm (Anki-style)
3. **Progress Tracking:** Theo dõi tiến độ học tập chi tiết
4. **Statistics:** Dashboard thống kê retention rate, mastery level
5. **User Experience:** Smooth, intuitive review interface

### Success Metrics

- ✅ Review session < 1s load time
- ✅ Card flip animation < 300ms
- ✅ Algorithm accuracy > 90%
- ✅ Retention calculation correct
- ✅ Mobile responsive (phone + tablet)
- ✅ Offline capable (IndexedDB sync)

---

## 📦 Feature Breakdown

### Feature 1: SRS Algorithm Engine 🧠

**Priority:** ⭐⭐⭐ HIGH  
**Estimated Time:** 2 hours  
**Dependencies:** None

#### Specs:

**File:** `src/services/srsAlgorithm.js`

**Algorithm:** SuperMemo SM-2 (Modified)

**Features:**
- Calculate next review date based on grade
- Ease factor adjustment (2.5 default)
- Interval calculation (1, 6, then exponential)
- Repetition tracking
- Difficulty adjustment
- Lapse handling (forgot cards)

**Formula (SM-2):**
```javascript
// Grade: 0-5 (0=complete blackout, 5=perfect)
// EF (Ease Factor): 1.3 - 2.5+
// Interval: Days until next review

EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
if (EF' < 1.3) EF' = 1.3

if (grade < 3) {
  // Reset to beginning
  repetition = 0
  interval = 1
} else {
  repetition += 1
  if (repetition === 1) interval = 1
  else if (repetition === 2) interval = 6
  else interval = Math.round(interval * EF')
}
```

**Card States:**
- `new` - Chưa học lần nào
- `learning` - Đang học (< 3 repetitions)
- `review` - Đang ôn tập (>= 3 repetitions)
- `relearning` - Quên, phải học lại
- `graduated` - Mastered (long intervals)

**Data Structure:**
```javascript
{
  cardId: 'card-001',
  deckId: 'deck-lesson-1',
  userId: 'user-123',
  
  // SRS data
  state: 'review', // new | learning | review | relearning
  easeFactor: 2.5,
  interval: 7, // days
  repetitions: 5,
  
  // Schedule
  due: '2025-11-27T10:00:00Z',
  lastReviewed: '2025-11-20T10:00:00Z',
  nextReview: '2025-11-27T10:00:00Z',
  
  // Statistics
  totalReviews: 12,
  correctReviews: 10,
  lapses: 2, // times forgot
  
  // Timestamps
  createdAt: '2025-11-01T...',
  graduatedAt: null // when mastered
}
```

**Acceptance Criteria:**
- [ ] SM-2 algorithm implemented correctly
- [ ] Grade 0-5 adjusts ease factor properly
- [ ] Intervals calculated correctly (1, 6, exponential)
- [ ] Card states transition correctly
- [ ] Lapse handling resets properly
- [ ] Edge cases handled (extreme grades, negative intervals)

---

### Feature 2: Student Review Interface 📱

**Priority:** ⭐⭐⭐ HIGH  
**Estimated Time:** 3 hours  
**Dependencies:** SRS Algorithm

#### Specs:

**Component:** `FlashcardReviewPage.jsx`

**Features:**
- Review session screen
- Card flip animation (front ↔ back)
- Grade buttons (Again, Hard, Good, Easy)
- Progress bar (cards remaining)
- Keyboard shortcuts (Space=flip, 1-4=grade)
- Timer per card
- Session summary at end

**UI Layout:**
```
┌────────────────────────────────────────┐
│  📚 N5 Vocabulary - Food               │
│  Progress: [▓▓▓░░░░░] 12/50 (24%)     │
├────────────────────────────────────────┤
│                                        │
│         ┌──────────────────┐          │
│         │                  │          │
│         │   食べる          │          │
│         │                  │          │
│         │  👆 Click to flip │          │
│         │                  │          │
│         └──────────────────┘          │
│                                        │
│  [1 Again] [2 Hard] [3 Good] [4 Easy] │
│   <1m      <10m      1d       4d      │
│                                        │
│  ⏱️ 3s  |  🔥 5 streak  |  ⭐ 85%     │
└────────────────────────────────────────┘
```

**Flip Animation:**
```jsx
// 3D flip effect
<div className="card-container" onClick={handleFlip}>
  <div className={`card ${isFlipped ? 'flipped' : ''}`}>
    <div className="card-front">
      <p className="text-4xl">食べる</p>
      <p className="text-sm text-gray-500">Click to reveal</p>
    </div>
    <div className="card-back">
      <p className="text-3xl">Ăn (to eat)</p>
      <p className="text-lg text-blue-600">たべる</p>
      <p className="text-sm">りんごを食べます</p>
    </div>
  </div>
</div>
```

**Grade Buttons:**
- **Again (1):** Forgot completely → Reset to 1 day
- **Hard (2):** Difficult → Shorter interval (0.5x)
- **Good (3):** Correct → Normal interval (1x)
- **Easy (4):** Too easy → Longer interval (1.5x)

**Keyboard Shortcuts:**
- `Space` / `Enter`: Flip card
- `1`: Again
- `2`: Hard
- `3`: Good
- `4`: Easy
- `Esc`: Exit session

**Acceptance Criteria:**
- [ ] Review session loads < 1s
- [ ] Card flip animation smooth (< 300ms)
- [ ] Grade buttons work correctly
- [ ] Keyboard shortcuts functional
- [ ] Progress bar updates in real-time
- [ ] Timer tracks time per card
- [ ] Session summary shows stats
- [ ] Mobile responsive

---

### Feature 3: Progress Tracking System 📊

**Priority:** ⭐⭐⭐ HIGH  
**Estimated Time:** 2 hours  
**Dependencies:** SRS Algorithm

#### Specs:

**File:** `src/services/progressTracker.js`

**Features:**
- Track daily reviews
- Calculate retention rate
- Mastery level per deck
- Study streaks
- Review history
- Time spent studying

**Progress Data:**
```javascript
{
  userId: 'user-123',
  deckId: 'deck-lesson-1',
  
  // Daily stats
  today: {
    date: '2025-11-20',
    newCards: 10,
    reviews: 25,
    correctReviews: 20,
    timeSpent: 900, // seconds
    streak: 5 // consecutive days
  },
  
  // Overall stats
  overall: {
    totalCards: 100,
    matureCards: 45, // interval > 21 days
    youngCards: 35, // interval 1-21 days
    newCards: 20, // not studied yet
    
    retention: 0.85, // 85% correct rate
    averageEase: 2.3,
    
    totalReviews: 450,
    totalTimeSpent: 18000, // seconds (5 hours)
    
    studyStreak: 12, // days
    longestStreak: 30
  },
  
  // History
  history: [
    { date: '2025-11-20', reviews: 25, correct: 20, time: 900 },
    { date: '2025-11-19', reviews: 30, correct: 26, time: 1200 },
    // ...last 30 days
  ]
}
```

**Calculations:**
```javascript
// Retention Rate
retention = correctReviews / totalReviews

// Mastery Level
mastery = (matureCards / totalCards) * 100

// Study Streak
// Count consecutive days with reviews > 0

// Average Time per Card
avgTime = totalTimeSpent / totalReviews
```

**Acceptance Criteria:**
- [ ] Daily stats tracked correctly
- [ ] Retention rate calculated accurately
- [ ] Mastery level reflects card maturity
- [ ] Study streak counts consecutive days
- [ ] History saved for 30 days
- [ ] Time tracking accurate (ms precision)

---

### Feature 4: Statistics Dashboard 📈

**Priority:** ⭐⭐ MEDIUM  
**Estimated Time:** 2 hours  
**Dependencies:** Progress Tracking

#### Specs:

**Component:** `StatisticsDashboard.jsx`

**Features:**
- Overview cards (today's stats)
- Charts (reviews over time)
- Heatmap (study calendar)
- Retention graph
- Card distribution (pie chart)
- Forecast (upcoming reviews)

**UI Sections:**

**1. Overview Cards:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ New Cards   │ To Review   │ Retention   │ Streak      │
│    10       │     25      │    85%      │   12 days   │
│  📚 Today   │  🔄 Due     │  ⭐ Rate    │  🔥 Days    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**2. Review Chart:**
```
Reviews (Last 7 Days)
40 ┤        ╭─╮
30 ┤   ╭──╮│ │
20 ┤  ╭╯  ╰╯ │
10 ┤──╯      ╰──
   └────────────
   Mon ... Sun
```

**3. Heatmap:**
```
Study Calendar (Last 30 Days)
Mon ░░▓▓░░▓▓
Tue ▓▓▓▓░░▓▓
Wed ░░▓▓▓▓▓▓
...
```

**4. Card Distribution:**
```
      New (20)
       ╱ ╲
    Young  Mature
    (35)   (45)
```

**Acceptance Criteria:**
- [ ] Overview cards show real-time data
- [ ] Charts render correctly (responsive)
- [ ] Heatmap shows study intensity
- [ ] Retention graph displays trend
- [ ] Pie chart shows card distribution
- [ ] Forecast predicts next 7 days

---

### Feature 5: Review Session Manager 🎯

**Priority:** ⭐⭐ MEDIUM  
**Estimated Time:** 1.5 hours  
**Dependencies:** SRS Algorithm, Review Interface

#### Specs:

**Component:** `ReviewSessionManager.jsx`

**Features:**
- Start review session
- Fetch due cards (sorted by due date)
- Handle card rotation
- Save review results (batch)
- Session pause/resume
- Undo last review (optional)

**Session Flow:**
```
1. Start Session
   ↓
2. Load Due Cards (from IndexedDB)
   ↓
3. Show Card (front)
   ↓
4. User flips card (back)
   ↓
5. User grades (1-4)
   ↓
6. Calculate next review (SRS)
   ↓
7. Save to IndexedDB
   ↓
8. Next card (repeat 3-7)
   ↓
9. Session Complete (summary)
```

**Due Cards Query:**
```javascript
// Get cards where nextReview <= now
const dueCards = await db.srsProgress
  .where('deckId').equals(deckId)
  .and(card => new Date(card.nextReview) <= new Date())
  .sortBy('nextReview');

// Add new cards (up to newCardsPerDay)
const newCards = await db.flashcards
  .where('deckId').equals(deckId)
  .and(card => !srsProgressMap[card.id])
  .limit(settings.newCardsPerDay)
  .toArray();

return [...dueCards, ...newCards];
```

**Batch Save:**
```javascript
// Save all reviews at once (performance)
await db.transaction('rw', db.srsProgress, db.reviews, async () => {
  // Update srsProgress
  await db.srsProgress.bulkPut(updatedProgress);
  
  // Save review history
  await db.reviews.bulkAdd(reviewHistory);
});
```

**Acceptance Criteria:**
- [ ] Session starts with correct cards
- [ ] Cards sorted by due date (oldest first)
- [ ] New cards mixed in (configurable limit)
- [ ] Reviews saved efficiently (batch)
- [ ] Session can pause/resume
- [ ] Undo works for last 3 reviews

---

### Feature 6: Integration with Lesson Pages 🔗

**Priority:** ⭐⭐⭐ HIGH  
**Estimated Time:** 1.5 hours  
**Dependencies:** Review Interface

#### Specs:

**Update:** `LessonDetailPage.jsx`

**Features:**
- "Study Flashcards" button (if SRS enabled)
- Show due cards count (badge)
- Link to review session
- Show progress summary
- Quick stats widget

**UI Addition:**
```jsx
// In LessonDetailPage
{lesson.srs?.enabled && (
  <div className="srs-widget">
    <h3>📚 Flashcards ({lesson.srs.cardCount})</h3>
    
    <div className="stats">
      <span>🔄 {dueCount} due</span>
      <span>⭐ {retention}% mastered</span>
    </div>
    
    <button 
      onClick={startReviewSession}
      disabled={dueCount === 0}
      className="btn-primary"
    >
      {dueCount > 0 ? `Study Now (${dueCount})` : 'All Caught Up! ✅'}
    </button>
    
    <Link to={`/statistics/${deckId}`}>
      📊 View Statistics
    </Link>
  </div>
)}
```

**Routes:**
```javascript
// Add new routes
<Route path="/review/:deckId" element={<FlashcardReviewPage />} />
<Route path="/statistics/:deckId" element={<StatisticsDashboard />} />
```

**Acceptance Criteria:**
- [ ] Button shows only if SRS enabled
- [ ] Due count updates real-time
- [ ] Click starts review session
- [ ] Disabled when no due cards
- [ ] Statistics link works
- [ ] Progress visible on lesson page

---

## 📅 Timeline

### Day 1 (Nov 20, 2025)
- ✅ Feature 1: SRS Algorithm Engine (2 hours)
- ✅ Feature 2: Review Interface (3 hours)
- ✅ Testing & bug fixes (1 hour)

### Day 2 (Nov 21, 2025)
- ✅ Feature 3: Progress Tracking (2 hours)
- ✅ Feature 4: Statistics Dashboard (2 hours)
- ✅ Feature 5: Session Manager (1.5 hours)
- ✅ Testing (1 hour)

### Day 3 (Nov 22, 2025)
- ✅ Feature 6: Integration (1.5 hours)
- ✅ Mobile responsive testing (1 hour)
- ✅ Performance optimization (1 hour)
- ✅ Documentation (2 hours)

**Total Estimated Time:** ~18 hours (3 days)

---

## 🛠️ Tech Stack

### Core
- **React** - UI components
- **IndexedDB (idb)** - Local storage
- **SM-2 Algorithm** - SRS calculation
- **Chart.js** / **Recharts** - Visualization

### State Management
- **React useState/useReducer** - Local state
- **Context API** - Global session state
- **IndexedDB** - Persistence

### Animation
- **CSS Transforms** - 3D flip effect
- **Framer Motion** (optional) - Smooth transitions
- **CSS Transitions** - Grade button feedback

---

## 💰 Cost Estimation

### Phase 3 (Local Only)
- Development Time: ~18 hours (3 days)
- Storage: FREE (browser IndexedDB)
- No backend needed
- **Total Cost: $0** ✅

### Phase 3.5 (Cloud Sync - Optional)
- Backend API: Node.js/Express
- Database: MongoDB/PostgreSQL
- Hosting: $5-10/month
- Sync service: Real-time updates

---

## 📊 Success Criteria

Phase 3 passes if:

✅ **Algorithm:** SM-2 correctly implemented (95%+ accuracy)
✅ **Review UX:** Smooth, intuitive, < 1s response time
✅ **Progress:** Accurate tracking & statistics
✅ **Dashboard:** Visual, informative charts
✅ **Integration:** Seamless with existing pages
✅ **Mobile:** Fully responsive (phone + tablet)
✅ **Performance:** No lag, smooth animations
✅ **Offline:** Works without internet
✅ **Zero Bugs:** Thoroughly tested

---

## 🎯 Next Steps

### To Start Phase 3:

1. ✅ **Plan Phase 3** (this file)
2. ✅ **Start Implementation:**
   - Create `srsAlgorithm.js`
   - Build `FlashcardReviewPage.jsx`
   - Implement progress tracking
3. ✅ **Daily Progress Tracking**
   - Update TODO list
   - Test each feature
   - Document as we go

---

## 📝 Notes

### Phase 3 vs Phase 4

**Phase 3:** Student review (local)  
**Phase 4:** Cloud sync + Collaboration

**Phase 3 Focus:**
- Core review experience
- SRS algorithm
- Local data only
- Single user

**Phase 4 Enhancements:**
- Multi-device sync
- Collaborative decks
- Social features
- Advanced analytics

---

## 🙏 Conclusion

Phase 3 completes the SRS loop:
- Phase 1: Admin creates content ✅
- Phase 2: Admin adds flashcards ✅
- Phase 3: Students review cards ✅ (now!)
- Phase 4: Cloud sync + Advanced features

**Ready to build the best review experience! 🚀**

Let's make learning efficient and fun! 💪

---

**Created:** 20 Nov 2025  
**Version:** 3.0.0 (planning)  
**Status:** Ready to Start  
**Start Date:** Now!

Ganbatte! 🔥

