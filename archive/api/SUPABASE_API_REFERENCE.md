# 📚 SUPABASE API REFERENCE

## 📋 Tổng quan

Tài liệu này mô tả tất cả các API endpoints được sử dụng trong ứng dụng eLearning, được build trên Supabase (PostgreSQL + REST API).

**Base URL:** `https://[your-project].supabase.co/rest/v1`

**Authentication:** Bearer token (Supabase JWT)

---

## 🔐 AUTHENTICATION ENDPOINTS

### **1. Sign Up (Đăng ký)**

**Endpoint:** `POST /auth/v1/signup`

**Description:** Đăng ký user mới với email và password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "data": {
    "display_name": "User Name"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "User already registered"
  }
}
```

**Usage:**
```javascript
import { signUp } from '../services/authService.js';

const result = await signUp({
  email: 'user@example.com',
  password: 'password123',
  displayName: 'User Name'
});
```

---

### **2. Sign In (Đăng nhập)**

**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Description:** Đăng nhập với email và password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

**Usage:**
```javascript
import { signIn } from '../services/authService.js';

const result = await signIn({
  email: 'user@example.com',
  password: 'password123'
});
```

---

### **3. Sign Out (Đăng xuất)**

**Endpoint:** `POST /auth/v1/logout`

**Description:** Đăng xuất user hiện tại

**Response:**
```json
{
  "success": true
}
```

**Usage:**
```javascript
import { signOut } from '../services/authService.js';

const result = await signOut();
```

---

### **4. Get Current User**

**Endpoint:** `GET /auth/v1/user`

**Description:** Lấy thông tin user hiện tại từ session

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Usage:**
```javascript
import { getCurrentUser } from '../services/authService.js';

const { success, user } = await getCurrentUser();
```

---

### **5. Get User Profile**

**Endpoint:** `GET /rest/v1/profiles?user_id=eq.{userId}`

**Description:** Lấy profile (role, display_name) của user

**Response:**
```json
{
  "success": true,
  "profile": {
    "user_id": "uuid",
    "role": "user",
    "display_name": "User Name",
    "timezone": "Asia/Ho_Chi_Minh",
    "language": "vi",
    "preferences": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Usage:**
```javascript
import { getUserProfile } from '../services/authService.js';

const { success, profile } = await getUserProfile(userId);
```

---

## 📝 EXAM RESULTS ENDPOINTS

### **1. Save Exam Result**

**Endpoint:** `POST /rest/v1/exam_results`

**Description:** Lưu kết quả JLPT exam vào database

**Request Body:**
```json
{
  "user_id": "uuid",
  "level_id": "n1",
  "exam_id": "2024-12",
  "knowledge_score": 20,
  "reading_score": 20,
  "listening_score": 20,
  "total_score": 60,
  "knowledge_correct": 10,
  "knowledge_total": 20,
  "reading_correct": 10,
  "reading_total": 20,
  "listening_correct": 10,
  "listening_total": 20,
  "is_passed": false,
  "time_spent": 3600,
  "completed_at": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "level_id": "n1",
    "exam_id": "2024-12",
    "knowledge_score": 20,
    "reading_score": 20,
    "listening_score": 20,
    "total_score": 60,
    "knowledge_correct": 10,
    "knowledge_total": 20,
    "reading_correct": 10,
    "reading_total": 20,
    "listening_correct": 10,
    "listening_total": 20,
    "is_passed": false,
    "time_spent": 3600,
    "completed_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Constraints:**
- `knowledge_score`: 0-60
- `reading_score`: 0-60
- `listening_score`: 0-60
- `total_score`: 0-180
- `knowledge_correct` <= `knowledge_total`
- `reading_correct` <= `reading_total`
- `listening_correct` <= `listening_total`

**Usage:**
```javascript
import { saveExamResult } from '../services/examResultsService.js';

const result = await saveExamResult({
  userId: 'uuid',
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

### **2. Get User Exam Results**

**Endpoint:** `GET /rest/v1/exam_results?user_id=eq.{userId}&order=completed_at.desc`

**Description:** Lấy tất cả kết quả exam của một user

**Query Parameters:**
- `user_id` (required): UUID của user
- `order` (optional): Sort order (default: `completed_at.desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "level_id": "n1",
      "exam_id": "2024-12",
      "total_score": 120,
      "is_passed": true,
      "completed_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Usage:**
```javascript
import { getUserExamResults } from '../services/examResultsService.js';

const { success, data } = await getUserExamResults(userId);
```

---

### **3. Get Specific Exam Result**

**Endpoint:** `GET /rest/v1/exam_results?user_id=eq.{userId}&level_id=eq.{levelId}&exam_id=eq.{examId}&order=completed_at.desc&limit=1`

**Description:** Lấy kết quả exam cụ thể của một user

**Query Parameters:**
- `user_id` (required): UUID của user
- `level_id` (required): Level (n1, n2, ...)
- `exam_id` (required): ID của exam

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "level_id": "n1",
    "exam_id": "2024-12",
    "total_score": 120,
    "is_passed": true,
    "completed_at": "2024-01-01T00:00:00Z"
  }
}
```

**Usage:**
```javascript
import { getExamResult } from '../services/examResultsService.js';

const { success, data } = await getExamResult(userId, 'n1', '2024-12');
```

---

## 📚 LEARNING PROGRESS ENDPOINTS

### **1. Save Learning Progress**

**Endpoint:** `POST /rest/v1/learning_progress` hoặc `PATCH /rest/v1/learning_progress?id=eq.{id}`

**Description:** Lưu hoặc cập nhật learning progress (tự động upsert)

**Request Body:**
```json
{
  "user_id": "uuid",
  "type": "quiz_attempt",
  "book_id": "shinkanzen-n1-bunpou",
  "chapter_id": "bai-1",
  "lesson_id": "lesson-1",
  "status": "completed",
  "score": 8,
  "total": 10,
  "attempts": 1,
  "time_spent": 300,
  "metadata": {
    "percentage": 80,
    "levelId": "n1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "quiz_attempt",
    "book_id": "shinkanzen-n1-bunpou",
    "chapter_id": "bai-1",
    "lesson_id": "lesson-1",
    "status": "completed",
    "score": 8,
    "total": 10,
    "attempts": 1,
    "time_spent": 300,
    "completed_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Type Values:**
- `lesson_complete`: Lesson đã hoàn thành
- `quiz_attempt`: Quiz attempt
- `exam_attempt`: Exam attempt
- `flashcard_review`: Flashcard review

**Status Values:**
- `not_started`: Chưa bắt đầu
- `in_progress`: Đang làm
- `completed`: Đã hoàn thành
- `abandoned`: Đã bỏ dở

**Constraints:**
- `type` = `lesson_complete` → Requires: `book_id`, `chapter_id`, `lesson_id`
- `type` = `exam_attempt` → Requires: `level_id`, `exam_id`
- `score` <= `total` (if both not null)
- `attempts` >= 1

**Usage:**
```javascript
import { saveLearningProgress } from '../services/learningProgressService.js';

const result = await saveLearningProgress({
  userId: 'uuid',
  type: 'quiz_attempt',
  bookId: 'shinkanzen-n1-bunpou',
  chapterId: 'bai-1',
  lessonId: 'lesson-1',
  status: 'completed',
  score: 8,
  total: 10,
  attempts: 1,
  timeSpent: 300,
  metadata: { percentage: 80 }
});
```

---

### **2. Get User Progress**

**Endpoint:** `GET /rest/v1/learning_progress?user_id=eq.{userId}&order=created_at.desc`

**Description:** Lấy tất cả progress của một user

**Query Parameters:**
- `user_id` (required): UUID của user
- `type` (optional): Filter by type (`lesson_complete`, `quiz_attempt`, `exam_attempt`)
- `order` (optional): Sort order (default: `created_at.desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "quiz_attempt",
      "book_id": "shinkanzen-n1-bunpou",
      "chapter_id": "bai-1",
      "lesson_id": "lesson-1",
      "status": "completed",
      "score": 8,
      "total": 10,
      "attempts": 1,
      "completed_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Usage:**
```javascript
import { getUserProgress } from '../services/learningProgressService.js';

// Get all progress
const { success, data } = await getUserProgress(userId);

// Get only quiz attempts
const { success, data } = await getUserProgress(userId, 'quiz_attempt');
```

---

### **3. Get Lesson Progress**

**Endpoint:** `GET /rest/v1/learning_progress?user_id=eq.{userId}&book_id=eq.{bookId}&chapter_id=eq.{chapterId}&lesson_id=eq.{lessonId}&order=created_at.desc&limit=1`

**Description:** Lấy progress của một lesson cụ thể

**Query Parameters:**
- `user_id` (required): UUID của user
- `book_id` (required): ID của sách
- `chapter_id` (required): ID của chapter
- `lesson_id` (required): ID của lesson

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "lesson_complete",
    "book_id": "shinkanzen-n1-bunpou",
    "chapter_id": "bai-1",
    "lesson_id": "lesson-1",
    "status": "completed",
    "completed_at": "2024-01-01T00:00:00Z"
  }
}
```

**Usage:**
```javascript
import { getLessonProgress } from '../services/learningProgressService.js';

const { success, data } = await getLessonProgress(
  userId,
  'shinkanzen-n1-bunpou',
  'bai-1',
  'lesson-1'
);
```

---

## ⚙️ APP SETTINGS ENDPOINTS

### **1. Get Maintenance Mode**

**Endpoint:** `GET /rest/v1/app_settings?id=eq.1&select=maintenance_mode`

**Description:** Lấy trạng thái maintenance mode

**Response:**
```json
{
  "success": true,
  "maintenance": true
}
```

**Usage:**
```javascript
import { getGlobalMaintenanceMode } from '../services/appSettingsService.js';

const { success, maintenance } = await getGlobalMaintenanceMode();
```

---

### **2. Set Maintenance Mode**

**Endpoint:** `PATCH /rest/v1/app_settings?id=eq.1`

**Description:** Bật/tắt maintenance mode (Admin only)

**Request Body:**
```json
{
  "maintenance_mode": true,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true
}
```

**Usage:**
```javascript
import { setGlobalMaintenanceMode } from '../services/appSettingsService.js';

const result = await setGlobalMaintenanceMode(true);
```

---

## 🔄 DATA SYNC ENDPOINTS

### **1. Full Sync**

**Description:** Backup localStorage lên Supabase và restore từ Supabase về localStorage

**Usage:**
```javascript
import { fullSync } from '../services/dataSyncService.js';

const result = await fullSync(userId);
// result = {
//   success: boolean,
//   backup: { examResults: number, progress: number },
//   restore: { examResults: number, progress: number },
//   errors: Array<string>
// }
```

---

### **2. Backup (localStorage → Supabase)**

**Description:** Backup dữ liệu từ localStorage lên Supabase

**Usage:**
```javascript
import { syncLocalStorageToSupabase } from '../services/dataSyncService.js';

const result = await syncLocalStorageToSupabase(userId);
```

---

### **3. Restore (Supabase → localStorage)**

**Description:** Restore dữ liệu từ Supabase về localStorage

**Usage:**
```javascript
import { syncSupabaseToLocalStorage } from '../services/dataSyncService.js';

const result = await syncSupabaseToLocalStorage(userId);
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

Tất cả endpoints đều được bảo vệ bởi RLS policies:

### **Exam Results Policies:**
- Users chỉ có thể SELECT/INSERT/UPDATE exam results của chính mình
- `auth.uid() = user_id`

### **Learning Progress Policies:**
- Users chỉ có thể SELECT/INSERT/UPDATE progress của chính mình
- `auth.uid() = user_id`

### **App Settings Policies:**
- Public read (mọi người có thể đọc)
- Admin only write (chỉ admin có thể update)

---

## 📊 RESPONSE FORMATS

### **Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": "..."
  }
}
```

---

## 🚨 ERROR CODES

| Code | Description |
|------|-------------|
| `PGRST116` | No rows returned (not found) |
| `23505` | Unique constraint violation |
| `23503` | Foreign key violation |
| `23514` | Check constraint violation |
| `42501` | Insufficient privilege (RLS) |
| `42P01` | Table does not exist |

---

## 📝 EXAMPLES

### **Complete Flow: User làm exam**

```javascript
// 1. User đăng nhập
const { success, data } = await signIn({
  email: 'user@example.com',
  password: 'password123'
});

// 2. User làm exam và submit
const examResult = await saveExamResult({
  userId: data.user.id,
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

// 3. Lưu progress
await saveLearningProgress({
  userId: data.user.id,
  type: 'exam_attempt',
  levelId: 'n1',
  examId: '2024-12',
  status: 'completed',
  score: 60,
  total: 180,
  attempts: 1
});

// 4. Xem tất cả kết quả
const { data: allResults } = await getUserExamResults(data.user.id);
```

---

## 🔍 QUERY EXAMPLES

### **Get exam results by level:**
```javascript
const { data } = await supabase
  .from('exam_results')
  .select('*')
  .eq('user_id', userId)
  .eq('level_id', 'n1')
  .order('completed_at', { ascending: false });
```

### **Get completed quizzes:**
```javascript
const { data } = await supabase
  .from('learning_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'quiz_attempt')
  .eq('status', 'completed')
  .order('completed_at', { ascending: false });
```

### **Get progress by date range:**
```javascript
const { data } = await supabase
  .from('learning_progress')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', '2024-01-01')
  .lte('created_at', '2024-12-31');
```

---

## 📈 PERFORMANCE TIPS

1. **Use indexes**: Queries với `user_id`, `level_id`, `type` sẽ nhanh nhờ indexes
2. **Limit results**: Luôn dùng `limit()` khi không cần tất cả records
3. **Select specific columns**: Dùng `select('id, name')` thay vì `select('*')`
4. **Batch operations**: Group multiple inserts/updates khi có thể

---

## 🔐 SECURITY NOTES

1. **RLS is enabled**: Tất cả tables đều có RLS policies
2. **JWT tokens**: Supabase tự động validate JWT tokens
3. **User isolation**: Users chỉ thấy/chỉnh sửa data của mình
4. **Admin access**: Admin có thể access tất cả data (nếu cần)

---

## 📞 SUPPORT

Nếu gặp vấn đề với API:
1. Kiểm tra error message và code
2. Verify RLS policies
3. Check Supabase logs
4. Contact team lead

---

**Last Updated**: [Date]
**Version**: 1.0

