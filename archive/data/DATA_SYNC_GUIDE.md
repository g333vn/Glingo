# 🔄 DATA SYNC GUIDE

## 📋 Tổng quan

Guide này giải thích cách sync dữ liệu giữa localStorage và Supabase để hỗ trợ multi-device learning.

---

## 🎯 MỤC ĐÍCH

- **Backup**: Lưu dữ liệu từ localStorage lên Supabase
- **Restore**: Tải dữ liệu từ Supabase về localStorage
- **Multi-device**: Học trên nhiều thiết bị, progress được đồng bộ

---

## 🔄 SYNC FLOW

### **1. Auto Sync (Tự động)**

Sync tự động chạy khi:
- User đăng nhập với Supabase account
- User được restore từ Supabase session

**Flow:**
```
User đăng nhập
    ↓
[AuthContext] Detect Supabase user
    ↓
[dataSyncService] fullSync()
    ↓
Step 1: Backup localStorage → Supabase
    ↓
Step 2: Restore Supabase → localStorage (source of truth)
    ↓
Complete
```

### **2. Manual Sync (Thủ công)**

User có thể manual sync bằng:
- Component `DataSyncButton`
- Hoặc gọi trực tiếp từ console

---

## 📊 DỮ LIỆU ĐƯỢC SYNC

### **Exam Results**

**localStorage → Supabase:**
- Scan keys: `exam-${levelId}-${examId}-knowledge-breakdown`
- Scan keys: `exam-${levelId}-${examId}-listening-breakdown`
- Convert sang format Supabase
- Lưu vào `exam_results` table

**Supabase → localStorage:**
- Load từ `exam_results` table
- Convert về format localStorage
- Lưu breakdown và scores

### **Learning Progress**

**localStorage → Supabase:**
- Lesson completion: `lesson_completed_${bookId}_${chapterId}_${lessonId}`
- Quiz scores: `quiz_scores_${bookId}_${chapterId}_${lessonId}`
- Convert sang format Supabase
- Lưu vào `learning_progress` table

**Supabase → localStorage:**
- Load từ `learning_progress` table
- Restore lesson completion flags
- Restore quiz scores

---

## 🔧 SỬ DỤNG SYNC SERVICE

### **1. Full Sync (Backup + Restore)**

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

### **2. Backup Only (localStorage → Supabase)**

```javascript
import { syncLocalStorageToSupabase } from '../services/dataSyncService.js';

const result = await syncLocalStorageToSupabase(userId);
// result = {
//   success: boolean,
//   synced: { examResults: number, progress: number },
//   errors: Array<string>
// }
```

### **3. Restore Only (Supabase → localStorage)**

```javascript
import { syncSupabaseToLocalStorage } from '../services/dataSyncService.js';

const result = await syncSupabaseToLocalStorage(userId);
// result = {
//   success: boolean,
//   restored: { examResults: number, progress: number },
//   errors: Array<string>
// }
```

---

## 🎨 SỬ DỤNG SYNC BUTTON COMPONENT

### **Trong UserDashboard hoặc Settings Page:**

```jsx
import DataSyncButton from '../components/DataSyncButton.jsx';

// Full sync
<DataSyncButton variant="full" />

// Chỉ backup
<DataSyncButton variant="backup" />

// Chỉ restore
<DataSyncButton variant="restore" />
```

---

## ⚙️ CONFLICT RESOLUTION

### **Strategy: Supabase is Source of Truth**

Khi có conflict:
1. **Supabase data** được ưu tiên
2. **LocalStorage data** được backup lên Supabase (nếu chưa có)
3. **Restore từ Supabase** về localStorage

### **Example:**

```
Device A: User làm exam → Lưu vào localStorage
    ↓
Sync → Supabase (backup)
    ↓
Device B: User đăng nhập
    ↓
Sync → Restore từ Supabase về localStorage
    ↓
Device B có progress từ Device A
```

---

## 🐛 TROUBLESHOOTING

### **Sync không chạy**

**Nguyên nhân:**
- User chưa đăng nhập với Supabase account
- User ID không phải UUID format

**Giải pháp:**
- Đảm bảo đăng nhập với email/password (Supabase)
- Kiểm tra `user.id` là UUID string

### **Sync chậm**

**Nguyên nhân:**
- Quá nhiều dữ liệu cần sync
- Network chậm

**Giải pháp:**
- Sync chạy background, không block UI
- Có thể mất vài giây nếu có nhiều data

### **Mất dữ liệu sau sync**

**Nguyên nhân:**
- Conflict resolution đã overwrite data
- Supabase data cũ hơn localStorage

**Giải pháp:**
- Luôn backup trước khi sync
- Kiểm tra timestamps trong metadata

---

## 📝 BEST PRACTICES

1. **Auto sync**: Để tự động sync khi đăng nhập
2. **Manual sync**: Cung cấp button để user tự sync khi cần
3. **Error handling**: Log errors nhưng không block user
4. **Progress indicator**: Hiển thị loading state khi sync
5. **Toast notifications**: Thông báo kết quả sync cho user

---

## 🔍 DEBUGGING

### **Check sync status:**

```javascript
// Trong Console
import { scanLocalStorageForSync } from './services/dataSyncService.js';

const { examResults, progress } = await scanLocalStorageForSync(userId);
console.log('LocalStorage data:', { examResults, progress });
```

### **Check Supabase data:**

```javascript
import { getUserExamResults, getUserProgress } from './services/examResultsService.js';

const examResults = await getUserExamResults(userId);
const progress = await getUserProgress(userId);
console.log('Supabase data:', { examResults, progress });
```

---

## ✅ CHECKLIST

- [ ] Auto sync hoạt động khi đăng nhập
- [ ] Manual sync button hoạt động
- [ ] Exam results được sync đúng
- [ ] Learning progress được sync đúng
- [ ] Conflict resolution hoạt động đúng
- [ ] Error handling hoạt động tốt
- [ ] Toast notifications hiển thị đúng

---

**Last Updated**: [Date]
**Version**: 1.0

