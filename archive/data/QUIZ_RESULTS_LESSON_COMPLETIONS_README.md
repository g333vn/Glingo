# 📊 Quiz Results & Lesson Completions - Hướng dẫn triển khai

## 🎯 Mục đích

2 bảng mới này được tạo để **bổ sung** cho `learning_progress`, không thay thế:
- **`quiz_results`**: Lưu chi tiết từng lần làm quiz (để review, phân tích)
- **`lesson_completions`**: Lưu chi tiết quá trình học lesson (để resume, thống kê)

## ⚠️ Lưu ý quan trọng

- ✅ **Code hiện tại KHÔNG BỊ ẢNH HƯỞNG** - vẫn dùng `learning_progress` như cũ
- ✅ **Backward compatible** - không có breaking changes
- ✅ **Tính năng mới chưa được triển khai** - chỉ tạo bảng và service files cơ bản
- ✅ **Sẽ phát triển sau** - khi có đủ user và lượng user ổn định

## 📋 Các file đã tạo

### 1. SQL Migration Script
- **File**: `archive/data/supabase_quiz_results_lesson_completions_schema.sql`
- **Mục đích**: Tạo 2 bảng mới trong Supabase
- **Cách chạy**: Copy toàn bộ script và paste vào Supabase SQL Editor

### 2. Service Files
- **File**: `src/services/quizResultsService.js`
- **File**: `src/services/lessonCompletionsService.js`
- **Mục đích**: Service functions để tương tác với 2 bảng mới
- **Trạng thái**: Đã tạo sẵn nhưng **CHƯA ĐƯỢC SỬ DỤNG** trong code

## 🚀 Cách triển khai

### Bước 1: Chạy SQL Migration

1. Mở Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung file `supabase_quiz_results_lesson_completions_schema.sql`
3. Paste vào SQL Editor
4. Click "Run" để chạy script
5. Kiểm tra kết quả:
   - ✅ 2 bảng mới được tạo: `quiz_results`, `lesson_completions`
   - ✅ Indexes được tạo
   - ✅ RLS policies được thiết lập
   - ✅ Triggers được tạo

### Bước 2: Kiểm tra bảng đã tạo

Trong Supabase Dashboard → Table Editor, bạn sẽ thấy:
- ✅ `quiz_results` - Bảng lưu chi tiết quiz results
- ✅ `lesson_completions` - Bảng lưu chi tiết lesson completions

### Bước 3: (Tùy chọn) Test service functions

Có thể test các service functions trong browser console:

```javascript
// Test quizResultsService
import { saveQuizResult, getUserQuizResults } from './services/quizResultsService.js';

// Test lessonCompletionsService
import { saveLessonCompletion, getLessonCompletion } from './services/lessonCompletionsService.js';
```

## 📊 Cấu trúc bảng

### `quiz_results`

Lưu chi tiết từng lần làm quiz:

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- book_id, chapter_id, lesson_id, quiz_id, level
- score, total, percentage, time_spent
- answers (JSONB) - Chi tiết từng câu hỏi
- started_at, completed_at
- attempt_number - Lần thứ mấy (1, 2, 3...)
- created_at, updated_at
```

**Format `answers` (JSONB):**
```json
[
  {
    "questionId": "q1",
    "selectedAnswer": 0,
    "correctAnswer": 0,
    "isCorrect": true,
    "timeSpent": 30
  },
  {
    "questionId": "q2",
    "selectedAnswer": 1,
    "correctAnswer": 2,
    "isCorrect": false,
    "timeSpent": 45
  }
]
```

### `lesson_completions`

Lưu chi tiết quá trình học lesson:

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- book_id, chapter_id, lesson_id, level
- status ('not_started', 'theory_viewed', 'quiz_completed', 'fully_completed')
- theory_started_at, theory_completed_at, theory_time_spent
- quiz_started_at, quiz_completed_at, quiz_time_spent
- theory_view_count, quiz_attempt_count
- theory_progress (JSONB) - Chi tiết progress của theory
- quiz_scores (JSONB) - Danh sách điểm quiz
- first_viewed_at, last_viewed_at, completed_at
- created_at, updated_at
```

**Format `theory_progress` (JSONB):**
```json
{
  "sections": [
    {
      "sectionId": "section1",
      "viewed": true,
      "timeSpent": 120,
      "lastViewedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "lastPosition": "section2",
  "scrollPosition": 500
}
```

**Format `quiz_scores` (JSONB):**
```json
[
  {
    "attemptNumber": 1,
    "score": 6,
    "total": 10,
    "percentage": 60,
    "completedAt": "2024-01-01T00:00:00Z"
  },
  {
    "attemptNumber": 2,
    "score": 8,
    "total": 10,
    "percentage": 80,
    "completedAt": "2024-01-01T01:00:00Z"
  }
]
```

## 🔒 Row Level Security (RLS)

Cả 2 bảng đều có RLS enabled:
- ✅ **Users**: Chỉ có thể xem/sửa dữ liệu của chính mình
- ✅ **Admins**: Có thể xem/sửa tất cả dữ liệu

## 📝 Service Functions

### `quizResultsService.js`

- `saveQuizResult(quizResult)` - Lưu kết quả quiz chi tiết
- `getUserQuizResults(userId, filters)` - Lấy tất cả quiz results của user
- `getLessonQuizResults(userId, bookId, chapterId, lessonId, level)` - Lấy quiz results của 1 lesson
- `getQuizResult(resultId)` - Lấy quiz result theo ID
- `getQuizAttemptCount(userId, bookId, chapterId, lessonId, level)` - Đếm số lần làm quiz

### `lessonCompletionsService.js`

- `saveLessonCompletion(completion)` - Lưu/update lesson completion
- `getUserLessonCompletions(userId, filters)` - Lấy tất cả lesson completions của user
- `getLessonCompletion(userId, bookId, chapterId, lessonId, level)` - Lấy lesson completion của 1 lesson
- `updateTheoryProgress(...)` - Cập nhật theory progress
- `updateQuizProgress(...)` - Cập nhật quiz progress

## 🎯 Kế hoạch phát triển sau

Khi có đủ user và lượng user ổn định, sẽ phát triển:

1. **Review Quiz Feature**
   - Xem lại quiz đã làm
   - Xem chi tiết từng câu hỏi
   - So sánh các lần làm

2. **Resume Lesson Feature**
   - Resume từ vị trí đã dừng
   - Lưu scroll position
   - Track thời gian học

3. **Analytics & Statistics**
   - Phân tích câu hỏi khó nhất
   - Thống kê thời gian học
   - Gợi ý ôn tập thông minh

4. **Dual-Write Pattern** ✅ **ĐÃ TRIỂN KHAI**
   - ✅ Tự động viết vào cả `learning_progress` (summary) và bảng mới (chi tiết)
   - ✅ Đảm bảo data consistency
   - ✅ Nếu update `learning_progress` fail, vẫn trả về success (non-critical)

## ✅ Checklist triển khai

- [x] Tạo SQL migration script
- [x] Tạo service files cơ bản
- [x] Đảm bảo backward compatible
- [x] **Triển khai Dual-Write Pattern** ✅
- [x] **Thêm Validation** ✅ (required fields, data types, ranges)
- [x] **Auto-calculate attempt_number** ✅ (tự động tính nếu không có)
- [x] **Auto-calculate percentage** ✅ (tự động tính nếu không có)
- [x] **Fallback quiz_id** ✅ (quizId = lessonId nếu không có)
- [x] **Unique constraint** ✅ (tránh duplicate attempts)
- [ ] Chạy SQL migration trong Supabase
- [ ] Kiểm tra bảng đã tạo thành công
- [ ] (Tùy chọn) Test service functions
- [ ] (Sau này) Phát triển tính năng mới

## 🔗 Liên quan

- `learning_progress` - Bảng tổng hợp hiện tại (vẫn hoạt động bình thường)
- `quizResultsService.js` - Service cho quiz results
- `lessonCompletionsService.js` - Service cho lesson completions

---

**Lưu ý**: 2 bảng này được tạo sẵn để chuẩn bị cho tương lai. Code hiện tại không cần thay đổi gì cả! 🎉

