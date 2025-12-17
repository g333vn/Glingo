# ⚡ API QUICK REFERENCE

Quick reference guide cho các Supabase API endpoints thường dùng.

---

## 🔐 Authentication

```javascript
import { signUp, signIn, signOut, getCurrentUser, getUserProfile } from '../services/authService.js';

// Đăng ký
await signUp({ email, password, displayName });

// Đăng nhập
await signIn({ email, password });

// Đăng xuất
await signOut();

// Lấy user hiện tại
const { success, user } = await getCurrentUser();

// Lấy profile
const { success, profile } = await getUserProfile(userId);
```

---

## 📝 Exam Results

```javascript
import { saveExamResult, getUserExamResults, getExamResult } from '../services/examResultsService.js';

// Lưu kết quả exam
await saveExamResult({
  userId, levelId, examId,
  knowledgeScore, readingScore, listeningScore, totalScore,
  knowledgeCorrect, knowledgeTotal,
  readingCorrect, readingTotal,
  listeningCorrect, listeningTotal,
  isPassed, timeSpent
});

// Lấy tất cả kết quả
const { success, data } = await getUserExamResults(userId);

// Lấy kết quả cụ thể
const { success, data } = await getExamResult(userId, levelId, examId);
```

---

## 📚 Learning Progress

```javascript
import { saveLearningProgress, getUserProgress, getLessonProgress } from '../services/learningProgressService.js';

// Lưu progress
await saveLearningProgress({
  userId, type, status,
  bookId, chapterId, lessonId,  // For lessons
  levelId, examId,                // For exams
  score, total, attempts, timeSpent, metadata
});

// Lấy tất cả progress
const { success, data } = await getUserProgress(userId, type); // type optional

// Lấy progress của lesson
const { success, data } = await getLessonProgress(userId, bookId, chapterId, lessonId);
```

**Types:**
- `lesson_complete` - Lesson đã hoàn thành
- `quiz_attempt` - Quiz attempt
- `exam_attempt` - Exam attempt
- `flashcard_review` - Flashcard review

**Status:**
- `not_started` - Chưa bắt đầu
- `in_progress` - Đang làm
- `completed` - Đã hoàn thành
- `abandoned` - Đã bỏ dở

---

## ⚙️ App Settings

```javascript
import { getGlobalMaintenanceMode, setGlobalMaintenanceMode } from '../services/appSettingsService.js';

// Lấy maintenance mode
const { success, maintenance } = await getGlobalMaintenanceMode();

// Set maintenance mode (Admin only)
await setGlobalMaintenanceMode(true);
```

---

## 🔄 Data Sync

```javascript
import { fullSync, syncLocalStorageToSupabase, syncSupabaseToLocalStorage } from '../services/dataSyncService.js';

// Full sync (backup + restore)
const result = await fullSync(userId);

// Chỉ backup
const result = await syncLocalStorageToSupabase(userId);

// Chỉ restore
const result = await syncSupabaseToLocalStorage(userId);
```

---

## 📊 Common Patterns

### **Check if user is logged in:**
```javascript
const { success, user } = await getCurrentUser();
if (!success || !user) {
  // Not logged in
}
```

### **Handle errors:**
```javascript
const result = await saveExamResult(data);
if (!result.success) {
  console.error('Error:', result.error);
  // Show error to user
}
```

### **Get user progress summary:**
```javascript
const [examResults, progress] = await Promise.all([
  getUserExamResults(userId),
  getUserProgress(userId)
]);

if (examResults.success && progress.success) {
  const exams = examResults.data || [];
  const allProgress = progress.data || [];
  // Process data...
}
```

---

## 🚨 Common Errors

| Error | Meaning | Solution |
|-------|---------|----------|
| `PGRST116` | Not found | Check if data exists |
| `23505` | Duplicate | Check unique constraints |
| `42501` | Permission denied | Check RLS policies |
| `Auth session missing` | Not logged in | Call `signIn()` first |

---

## 📝 Example: Complete User Flow

```javascript
// 1. Login
const loginResult = await signIn({ email, password });
if (!loginResult.success) {
  return; // Show error
}

const userId = loginResult.data.user.id;

// 2. Sync data
await fullSync(userId);

// 3. Load user data
const [examResults, progress] = await Promise.all([
  getUserExamResults(userId),
  getUserProgress(userId)
]);

// 4. User does quiz
await saveLearningProgress({
  userId,
  type: 'quiz_attempt',
  bookId: 'book-1',
  chapterId: 'chapter-1',
  lessonId: 'lesson-1',
  status: 'completed',
  score: 8,
  total: 10,
  attempts: 1
});

// 5. User does exam
await saveExamResult({
  userId,
  levelId: 'n1',
  examId: '2024-12',
  knowledgeScore: 20,
  readingScore: 20,
  listeningScore: 20,
  totalScore: 60,
  knowledgeCorrect: 10,
  knowledgeTotal: 20,
  readingCorrect: 10,
  readingTotal: 20,
  listeningCorrect: 10,
  listeningTotal: 20,
  isPassed: false,
  timeSpent: 3600
});
```

---

**See full documentation:** `docs/api/SUPABASE_API_REFERENCE.md`

