# 🔧 HƯỚNG DẪN TÍCH HỢP EXAM SERVICE VÀO EXAM MANAGEMENT PAGE

## 🎯 MỤC TIÊU

Tích hợp `examService.js` vào `ExamManagementPage.jsx` để lưu/xóa exam từ client lên Supabase, song song với localStorage/IndexedDB hiện tại.

---

## 📋 CẤU TRÚC HIỆN TẠI

### **Hiện tại:**
```
ExamManagementPage
  └── storageManager (localStorage/IndexedDB)
      └── saveExam() / deleteExam()
```

### **Sau khi tích hợp:**
```
ExamManagementPage
  ├── storageManager (localStorage/IndexedDB) - Cache local
  └── examService (Supabase) - Source of truth
      └── saveExam() / deleteExam()
```

---

## 🔄 QUY TRÌNH LƯU/XÓA

### **1. Lưu Exam (Save)**

**Flow:**
```
User nhập/sửa exam
  ↓
Save to localStorage/IndexedDB (immediate, cache)
  ↓
Save to Supabase (async, source of truth)
  ↓
Show success notification
```

**Implementation:**

```javascript
// src/pages/admin/ExamManagementPage.jsx

import { saveExam as saveExamToSupabase, deleteExam as deleteExamFromSupabase } from '../../services/examService.js';

// ... existing code ...

const handleSaveExam = async (e) => {
  e.preventDefault();
  
  // ... existing validation ...

  // 1. Save to localStorage/IndexedDB (existing code)
  const sortedExams = sortExamsByYear(updatedExams);
  const localSuccess = await storageManager.saveExams(selectedLevel, sortedExams);
  
  if (!localSuccess) {
    alert(`❌ ${t('examManagement.examForm.saveError')}`);
    return;
  }

  // 2. Save to Supabase (NEW)
  if (user && (isAdmin || isEditor)) {
    try {
      // Get full exam data if editing
      let fullExamData = null;
      if (editingExam) {
        fullExamData = await storageManager.getExam(selectedLevel, examForm.id);
      }

      // Prepare exam data for Supabase
      const examDataForSupabase = {
        level: selectedLevel,
        examId: examForm.id,
        title: examForm.title,
        date: examForm.date,
        status: examForm.status,
        imageUrl: examForm.imageUrl,
        // Include full exam data if available
        knowledge: fullExamData?.knowledge || { sections: [] },
        reading: fullExamData?.reading || { sections: [] },
        listening: fullExamData?.listening || { sections: [] },
        config: {}
      };

      const supabaseResult = await saveExamToSupabase(examDataForSupabase, user.id);
      
      if (supabaseResult.success) {
        console.log('✅ Exam saved to Supabase');
      } else {
        console.warn('⚠️ Failed to save exam to Supabase:', supabaseResult.error);
        // Continue anyway - local save succeeded
      }
    } catch (err) {
      console.error('❌ Error saving exam to Supabase:', err);
      // Continue anyway - local save succeeded
    }
  }

  // 3. Update UI
  setExams(sortedExams);
  setShowExamForm(false);
  alert(`✅ ${t('examManagement.examForm.saveSuccess')}\n\n` +
        `📝 ${editingExam ? t('examManagement.examForm.updated') : t('examManagement.examForm.added')} ${t('examManagement.examForm.savedExam')}:\n` +
        `   - ID: ${examForm.id}\n` +
        `   - ${t('examManagement.exams.table.title')}: ${examForm.title}\n` +
        `   - ${t('examManagement.exams.table.date')}: ${examForm.date}\n` +
        `   - ${t('examManagement.selectLevel')}: ${selectedLevel.toUpperCase()}\n\n` +
        `💾 ${t('examManagement.examForm.savedToSystem')}`);
};
```

---

### **2. Lưu Exam Data (Questions/Sections)**

**Flow:**
```
User thêm/sửa questions/sections
  ↓
Save to localStorage/IndexedDB (immediate)
  ↓
Save to Supabase (async)
  ↓
Show success notification
```

**Implementation:**

```javascript
// In handleSaveQuestion or handleSaveSection

const handleSaveQuestion = async () => {
  // ... existing code to save to localStorage/IndexedDB ...

  // After local save succeeds:
  if (user && (isAdmin || isEditor) && selectedExam) {
    try {
      // Get full exam data
      const fullExamData = await storageManager.getExam(selectedLevel, selectedExam.id);
      
      if (fullExamData) {
        const examDataForSupabase = {
          level: selectedLevel,
          examId: selectedExam.id,
          title: selectedExam.title,
          date: selectedExam.date,
          status: selectedExam.status,
          imageUrl: selectedExam.imageUrl,
          knowledge: fullExamData.knowledge || { sections: [] },
          reading: fullExamData.reading || { sections: [] },
          listening: fullExamData.listening || { sections: [] },
          config: {}
        };

        const supabaseResult = await saveExamToSupabase(examDataForSupabase, user.id);
        
        if (supabaseResult.success) {
          console.log('✅ Exam data saved to Supabase');
        } else {
          console.warn('⚠️ Failed to save exam data to Supabase:', supabaseResult.error);
        }
      }
    } catch (err) {
      console.error('❌ Error saving exam data to Supabase:', err);
    }
  }
};
```

---

### **3. Xóa Exam (Delete)**

**Flow:**
```
User xóa exam
  ↓
Delete from localStorage/IndexedDB (immediate)
  ↓
Delete from Supabase (async, soft delete)
  ↓
Show success notification
```

**Implementation:**

```javascript
const handleDeleteExam = async (examId) => {
  if (confirm(`⚠️ ${t('examManagement.delete.examConfirm')}`)) {
    // 1. Delete from localStorage/IndexedDB (existing code)
    const updatedExams = exams.filter(e => e.id !== examId);
    const sortedExams = sortExamsByYear(updatedExams);
    await storageManager.saveExams(selectedLevel, sortedExams);
    await storageManager.deleteExam(selectedLevel, examId);

    // 2. Delete from Supabase (NEW)
    if (user && isAdmin) {
      try {
        const supabaseResult = await deleteExamFromSupabase(selectedLevel, examId, user.id);
        
        if (supabaseResult.success) {
          console.log('✅ Exam deleted from Supabase');
        } else {
          console.warn('⚠️ Failed to delete exam from Supabase:', supabaseResult.error);
          // Continue anyway - local delete succeeded
        }
      } catch (err) {
        console.error('❌ Error deleting exam from Supabase:', err);
        // Continue anyway - local delete succeeded
      }
    }

    // 3. Update UI
    setExams(sortedExams);
    alert(`✅ ${t('examManagement.delete.examSuccess')}`);
  }
};
```

---

## 📝 CODE CHANGES SUMMARY

### **1. Import examService**

```javascript
// Add to imports at top of file
import { 
  saveExam as saveExamToSupabase, 
  deleteExam as deleteExamFromSupabase 
} from '../../services/examService.js';
```

### **2. Update handleSaveExam**

- Thêm logic lưu lên Supabase sau khi lưu local thành công
- Lấy full exam data nếu đang edit
- Xử lý lỗi gracefully (không block UI nếu Supabase fail)

### **3. Update handleSaveQuestion/handleSaveSection**

- Thêm logic lưu lên Supabase sau khi lưu local thành công
- Lấy full exam data từ localStorage/IndexedDB
- Gửi toàn bộ exam data lên Supabase

### **4. Update handleDeleteExam**

- Thêm logic xóa từ Supabase sau khi xóa local thành công
- Chỉ admin mới có quyền xóa từ Supabase
- Xử lý lỗi gracefully

---

## ✅ VALIDATION & ERROR HANDLING

### **1. User Authentication**

```javascript
// Check user is logged in and has permission
if (!user) {
  console.warn('⚠️ User not logged in, skipping Supabase save');
  return; // Only save to local
}

if (!isAdmin && !isEditor) {
  console.warn('⚠️ User not authorized, skipping Supabase save');
  return; // Only save to local
}
```

### **2. Error Handling**

```javascript
try {
  const result = await saveExamToSupabase(examData, user.id);
  if (!result.success) {
    console.warn('⚠️ Supabase save failed:', result.error);
    // Continue - local save succeeded
  }
} catch (err) {
  console.error('❌ Unexpected error:', err);
  // Continue - local save succeeded
}
```

### **3. Retry Logic (Optional)**

```javascript
// Retry up to 3 times
let retries = 3;
while (retries > 0) {
  const result = await saveExamToSupabase(examData, user.id);
  if (result.success) break;
  retries--;
  if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000));
}
```

---

## 🔄 SYNC STRATEGY

### **Priority:**
1. **LocalStorage/IndexedDB**: Immediate save (cache)
2. **Supabase**: Async save (source of truth)

### **Conflict Resolution:**
- **On Load**: Prefer Supabase if available, fallback to local
- **On Save**: Save to both, Supabase is source of truth
- **On Delete**: Delete from both

### **Sync Flow:**

```
App Start
  ↓
Load from Supabase (if user logged in)
  ↓
Merge with local cache
  ↓
Use merged data
```

---

## 📊 TESTING CHECKLIST

### **1. Save Exam**
- [ ] Save exam metadata to Supabase
- [ ] Save exam with full data (knowledge/reading/listening)
- [ ] Handle errors gracefully
- [ ] Show success notification

### **2. Save Questions/Sections**
- [ ] Save questions to Supabase
- [ ] Save sections to Supabase
- [ ] Preserve all 3 parts (knowledge/reading/listening)
- [ ] Handle errors gracefully

### **3. Delete Exam**
- [ ] Soft delete from Supabase
- [ ] Only admin can delete
- [ ] Handle errors gracefully

### **4. Load Exam**
- [ ] Load from Supabase if available
- [ ] Fallback to local if Supabase unavailable
- [ ] Merge data correctly

---

## 🚀 DEPLOYMENT NOTES

### **1. Database Migration**
- Run `docs/data/update_exams_add_reading_sections.sql` to add `reading_sections` column
- Or run `docs/data/supabase_exams_schema.sql` to create full schema

### **2. RLS Policies**
- Ensure RLS policies are set correctly
- Admins and editors can write
- Everyone can read (non-deleted exams)

### **3. Environment Variables**
- Ensure Supabase URL and anon key are configured
- Test connection before deploying

---

## 📝 TÓM TẮT

### **Changes:**
1. ✅ Import `examService.js`
2. ✅ Update `handleSaveExam` to save to Supabase
3. ✅ Update `handleSaveQuestion/handleSaveSection` to save to Supabase
4. ✅ Update `handleDeleteExam` to delete from Supabase
5. ✅ Add error handling and validation

### **Benefits:**
- ✅ Data synced across devices
- ✅ Backup in cloud
- ✅ Multi-user support
- ✅ Source of truth in Supabase

---

**Tác giả:** System Design  
**Ngày tạo:** 2024  
**Phiên bản:** 1.0

