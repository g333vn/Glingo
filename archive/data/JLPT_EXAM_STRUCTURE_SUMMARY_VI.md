# 📚 TÓM TẮT CẤU TRÚC BÀI THI JLPT - CLIENT → SUPABASE

## 🎯 TỔNG QUAN

Đã hoàn thành việc thiết kế và triển khai cấu trúc bài thi JLPT với đầy đủ 3 phần (Knowledge, Reading, Listening) và tích hợp lưu/xóa từ client lên Supabase.

---

## 📊 CẤU TRÚC PHÂN CẤP

```
Level (Cấp độ: N1, N2, N3, N4, N5)
  └── Exam (Bài thi: 2024-12, 2024-07, ...)
      ├── Knowledge (Kiến thức - 言語知識)
      │   └── Sections → Questions
      ├── Reading (Đọc hiểu - 読解)
      │   └── Sections → Questions
      └── Listening (Nghe hiểu - 聴解)
          └── Sections → Questions
```

---

## 📁 FILES ĐÃ TẠO/CẬP NHẬT

### **1. Tài liệu**

- ✅ `docs/data/JLPT_EXAM_STRUCTURE_VI.md` - Tài liệu chi tiết về cấu trúc
- ✅ `docs/data/INTEGRATE_EXAM_SERVICE_VI.md` - Hướng dẫn tích hợp
- ✅ `docs/data/JLPT_EXAM_STRUCTURE_SUMMARY_VI.md` - Tài liệu này

### **2. Service**

- ✅ `src/services/examService.js` - Service để lưu/xóa exam từ client lên Supabase

**Functions:**
- `saveExam(exam, userId)` - Lưu exam lên Supabase
- `getExam(level, examId)` - Lấy exam từ Supabase
- `getExamsByLevel(level)` - Lấy tất cả exams theo level
- `deleteExam(level, examId, userId)` - Xóa exam (soft delete)
- `hardDeleteExam(level, examId)` - Xóa vĩnh viễn (admin only)

### **3. Database Schema**

- ✅ `docs/data/update_exams_add_reading_sections.sql` - Script cập nhật schema (thêm `reading_sections`)
- ✅ `docs/data/supabase_exams_schema.sql` - Schema đầy đủ cho bảng `exams`

**Cấu trúc bảng `exams`:**
```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY,
  level VARCHAR(2),              -- n1, n2, n3, n4, n5
  exam_id VARCHAR(100),          -- 2024-12, 2024-07, ...
  title VARCHAR(255),
  knowledge_sections JSONB,      -- Sections của phần Knowledge
  reading_sections JSONB,        -- Sections của phần Reading (NEW)
  listening_sections JSONB,      -- Sections của phần Listening
  config JSONB,
  date VARCHAR(50),
  status VARCHAR(50),
  image_url VARCHAR(500),
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,          -- Soft delete
  UNIQUE(level, exam_id)
);
```

---

## 🔄 QUY TRÌNH NHẬP/LƯU/XÓA

### **1. Nhập dữ liệu (Input)**

**Bước 1: Tạo Exam**
```javascript
const exam = {
  id: '2024-12',
  level: 'n1',
  title: 'JLPT N1 2024/12',
  date: '2024/12',
  status: 'Có sẵn',
  imageUrl: '/jlpt/n1/2024-12.jpg'
};
```

**Bước 2: Tạo Sections cho từng phần**
```javascript
// Knowledge
const knowledgeSection = {
  id: 'section1',
  title: '問題1',
  instruction: '...',
  timeLimit: 30,
  questions: []
};

// Reading
const readingSection = {
  id: 'section1',
  title: '問題1',
  instruction: '...',
  timeLimit: null,
  questions: []
};

// Listening
const listeningSection = {
  id: 'section1',
  title: '問題1',
  instruction: '...',
  timeLimit: 60,
  questions: []
};
```

**Bước 3: Thêm Questions**
```javascript
const question = {
  id: '1',
  category: 'knowledge',
  question: '...',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 0,
  explanation: '...'
};
```

---

### **2. Lưu dữ liệu (Save)**

**Từ Client → Supabase:**

```javascript
import { saveExam } from '../services/examService.js';

const result = await saveExam({
  level: 'n1',
  examId: '2024-12',
  title: 'JLPT N1 2024/12',
  date: '2024/12',
  status: 'Có sẵn',
  imageUrl: '/jlpt/n1/2024-12.jpg',
  knowledge: {
    sections: [...]
  },
  reading: {
    sections: [...]
  },
  listening: {
    sections: [...]
  }
}, userId);

if (result.success) {
  console.log('✅ Exam saved to Supabase');
}
```

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

---

### **3. Xóa dữ liệu (Delete)**

**Từ Client → Supabase:**

```javascript
import { deleteExam } from '../services/examService.js';

const result = await deleteExam('n1', '2024-12', userId);

if (result.success) {
  console.log('✅ Exam deleted from Supabase');
}
```

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

---

## 💾 CẤU TRÚC DỮ LIỆU

### **Exam Data Structure:**

```javascript
{
  id: '2024-12',
  level: 'n1',
  title: 'JLPT N1 2024/12',
  date: '2024/12',
  status: 'Có sẵn',
  imageUrl: '/jlpt/n1/2024-12.jpg',
  
  // 3 phần chính
  knowledge: {
    sections: [
      {
        id: 'section1',
        title: '問題1',
        instruction: '...',
        timeLimit: 30,
        questions: [
          {
            id: '1',
            category: 'knowledge',
            question: '...',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: '...'
          }
        ]
      }
    ]
  },
  reading: {
    sections: [...]
  },
  listening: {
    sections: [...]
  }
}
```

---

## 🔧 TÍCH HỢP VÀO EXAM MANAGEMENT PAGE

### **Các bước:**

1. **Import examService:**
```javascript
import { 
  saveExam as saveExamToSupabase, 
  deleteExam as deleteExamFromSupabase 
} from '../../services/examService.js';
```

2. **Update handleSaveExam:**
- Lưu vào localStorage/IndexedDB (existing)
- Lưu vào Supabase (new)

3. **Update handleSaveQuestion/handleSaveSection:**
- Lưu vào localStorage/IndexedDB (existing)
- Lưu vào Supabase (new)

4. **Update handleDeleteExam:**
- Xóa từ localStorage/IndexedDB (existing)
- Xóa từ Supabase (new)

**Chi tiết:** Xem `docs/data/INTEGRATE_EXAM_SERVICE_VI.md`

---

## 🗄️ DATABASE SETUP

### **1. Cập nhật Schema (Nếu đã có bảng exams):**

Chạy script:
```sql
-- docs/data/update_exams_add_reading_sections.sql
```

Script này sẽ:
- Thêm cột `reading_sections` nếu chưa có
- Thêm các cột `date`, `status`, `image_url` nếu chưa có

### **2. Tạo Schema mới (Nếu chưa có bảng exams):**

Chạy script:
```sql
-- docs/data/supabase_exams_schema.sql
```

Script này sẽ:
- Tạo bảng `exams` với đầy đủ cột
- Tạo indexes
- Tạo triggers
- Thiết lập RLS policies

---

## ✅ VALIDATION RULES

### **1. Level**
- ✅ Phải là: `n1`, `n2`, `n3`, `n4`, `n5`
- ✅ Không được để trống

### **2. Exam ID**
- ✅ Phải là string, không được để trống
- ✅ Format: `YYYY-MM` hoặc `YYYY-MM-DD`
- ✅ Unique trong cùng level

### **3. Test Type (Knowledge/Reading/Listening)**
- ✅ Mỗi exam phải có đủ 3 phần
- ✅ Mỗi phần phải có ít nhất 1 section
- ✅ Mỗi section phải có ít nhất 1 question

### **4. Section**
- ✅ Phải có `id`, `title`, `instruction`
- ✅ `timeLimit` là số hoặc `null` (cho Reading)
- ✅ `questions` là array

### **5. Question**
- ✅ Phải có `id`, `category`, `question`, `options`, `correctAnswer`
- ✅ `options` phải có ít nhất 2 phần tử
- ✅ `correctAnswer` phải là index hợp lệ (0-3)
- ✅ Listening questions phải có `audioUrl` hoặc `audioData`

---

## 🚀 NEXT STEPS

### **1. Database Migration**
- [ ] Chạy `update_exams_add_reading_sections.sql` hoặc `supabase_exams_schema.sql`
- [ ] Verify schema trong Supabase dashboard

### **2. Tích hợp vào ExamManagementPage**
- [ ] Import `examService.js`
- [ ] Update `handleSaveExam`
- [ ] Update `handleSaveQuestion/handleSaveSection`
- [ ] Update `handleDeleteExam`
- [ ] Test các chức năng

### **3. Testing**
- [ ] Test lưu exam metadata
- [ ] Test lưu exam với full data (3 phần)
- [ ] Test xóa exam
- [ ] Test load exam từ Supabase
- [ ] Test error handling

### **4. Documentation**
- [ ] Update README với cấu trúc mới
- [ ] Tạo user guide cho admin
- [ ] Document API endpoints (nếu có)

---

## 📝 TÓM TẮT

### **Đã hoàn thành:**
1. ✅ Tài liệu chi tiết về cấu trúc JLPT exam
2. ✅ Service `examService.js` để lưu/xóa từ client lên Supabase
3. ✅ Database schema với đầy đủ 3 phần (Knowledge, Reading, Listening)
4. ✅ Hướng dẫn tích hợp vào ExamManagementPage

### **Cấu trúc:**
- **Level** → **Exam** → **3 Parts** (Knowledge, Reading, Listening) → **Sections** → **Questions**

### **Lưu trữ:**
- **Supabase**: Source of truth (bảng `exams` với 3 cột JSONB)
- **IndexedDB/localStorage**: Cache local cho performance

### **Quy trình:**
- **Nhập**: Admin tạo exam → sections → questions
- **Lưu**: Client → localStorage/IndexedDB (immediate) → Supabase (async)
- **Xóa**: Client → localStorage/IndexedDB (immediate) → Supabase (async, soft delete)

---

**Tác giả:** System Design  
**Ngày tạo:** 2024  
**Phiên bản:** 1.0

