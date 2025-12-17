# 📚 CẤU TRÚC BÀI THI JLPT - TỪ CLIENT LÊN SUPABASE

## 🎯 TỔNG QUAN

Hệ thống bài thi JLPT được tổ chức theo cấu trúc phân cấp 4 tầng:

```
Level (Cấp độ: N1, N2, N3, N4, N5)
  └── Exam (Bài thi: 2024-12, 2024-07, ...)
      └── Test Type (3 phần: Knowledge, Reading, Listening)
          └── Section (Các section trong mỗi phần)
              └── Questions (Các câu hỏi trong mỗi section)
```

---

## 📊 CHI TIẾT CẤU TRÚC

### **1. Level (Cấp độ)**

- **Mục đích**: Phân loại theo trình độ JLPT
- **Giá trị**: `n1`, `n2`, `n3`, `n4`, `n5`
- **Ví dụ**: `n1` (N1 - Trình độ cao nhất)

**Lưu trữ:**
- Supabase: Không có bảng riêng, được lưu trong bảng `exams` (cột `level`)
- IndexedDB: `levelConfigs` store (cấu hình điểm, thời gian)

---

### **2. Exam (Bài thi)**

- **Mục đích**: Một đề thi cụ thể trong một kỳ thi
- **Ví dụ**: `2024-12`, `2024-07`, `2023-12`
- **Thuộc về**: Level

**Cấu trúc dữ liệu:**
```javascript
{
  id: '2024-12',              // Exam ID
  level: 'n1',                // Level (n1, n2, ...)
  title: 'JLPT N1 2024/12',   // Tiêu đề
  date: '2024/12',            // Ngày thi
  status: 'Có sẵn',           // Trạng thái
  imageUrl: '/jlpt/n1/2024-12.jpg',  // Ảnh đề thi
  
  // 3 phần chính
  knowledge: { sections: [...] },    // Kiến thức (言語知識)
  reading: { sections: [...] },      // Đọc hiểu (読解)
  listening: { sections: [...] }      // Nghe hiểu (聴解)
}
```

**Lưu trữ:**
- Supabase: Bảng `exams`
  - `level`: VARCHAR(2)
  - `exam_id`: VARCHAR(100)
  - `title`: VARCHAR(255)
  - `knowledge_sections`: JSONB
  - `reading_sections`: JSONB
  - `listening_sections`: JSONB
  - `config`: JSONB (metadata, cấu hình)
- IndexedDB: `exams` store (cache local)

---

### **3. Test Type (3 phần chính)**

Mỗi bài thi có **3 phần** bắt buộc:

#### **A. Knowledge (Kiến thức - 言語知識・読解)**

- **Mục đích**: Phần kiến thức ngôn ngữ (từ vựng, ngữ pháp, đọc hiểu)
- **Cấu trúc**: Nhiều sections (問題1, 問題2, ...)
- **Thời gian**: Có timeLimit riêng (ví dụ: 110 phút cho N1)

```javascript
knowledge: {
  sections: [
    {
      id: 'section1',
      title: '問題1',  // 文字・語彙
      instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。',
      timeLimit: 30,  // Phút (tùy chọn)
      questions: [
        {
          id: '1',
          category: 'knowledge',
          question: '彼の説明は（　　）で、誰にでも理解できる。',
          options: ['簡潔', '簡略', '簡易', '簡素'],
          correctAnswer: 0,
          explanation: '「簡潔」は「短くてわかりやすい」という意味で...'
        }
        // ... more questions
      ]
    },
    {
      id: 'section2',
      title: '問題2',  // 文法
      instruction: '次の言葉の使い方として最もよいものを...',
      timeLimit: 25,
      questions: [...]
    }
    // ... more sections
  ]
}
```

#### **B. Reading (Đọc hiểu - 読解)**

- **Mục đích**: Phần đọc hiểu (thường nằm trong phần Knowledge nhưng tách riêng để quản lý)
- **Cấu trúc**: Nhiều sections với đoạn văn dài
- **Thời gian**: Không có timeLimit riêng (nằm trong Knowledge)

```javascript
reading: {
  sections: [
    {
      id: 'section1',
      title: '問題1',
      instruction: '次の文章を読んで、後の問いに答えなさい。',
      timeLimit: null,  // Không có thời gian riêng
      questions: [
        {
          id: '11',
          category: 'reading',
          question: '本文の内容と合っているものはどれか。',
          passage: '長い文章の内容...',  // Đoạn văn dài
          options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
          correctAnswer: 1,
          explanation: '本文の第2段落に...'
        }
        // ... more questions
      ]
    }
    // ... more sections
  ]
}
```

#### **C. Listening (Nghe hiểu - 聴解)**

- **Mục đích**: Phần nghe hiểu
- **Cấu trúc**: Nhiều sections với file audio
- **Thời gian**: Có timeLimit bắt buộc (ví dụ: 60 phút cho N1)

```javascript
listening: {
  sections: [
    {
      id: 'section1',
      title: '問題1',
      instruction: '音声を聞いて、最も正しい答えを選びなさい。',
      timeLimit: 60,  // Phút (bắt buộc)
      questions: [
        {
          id: '30',
          category: 'listening',
          question: '音声を聞いて、最も正しい答えを選びなさい。',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 2,
          explanation: '音声中のキーフレーズ...',
          audioUrl: '/audio/n1/2024-12/listening-30.mp3',  // URL audio
          audioData: 'data:audio/mpeg;base64,...'  // Base64 (nếu lưu trực tiếp)
        }
        // ... more questions
      ]
    }
    // ... more sections
  ]
}
```

---

### **4. Section (Section trong mỗi phần)**

- **Mục đích**: Nhóm các câu hỏi cùng loại
- **Ví dụ**: `section1`, `section2`, `section3`
- **Thuộc về**: Test Type (knowledge/reading/listening)

**Cấu trúc:**
```javascript
{
  id: 'section1',              // Section ID
  title: '問題1',              // Tiêu đề section
  instruction: '...',          // Hướng dẫn làm bài
  timeLimit: 30,               // Thời gian (phút, tùy chọn)
  questions: [...]             // Mảng câu hỏi
}
```

**Lưu trữ:**
- Supabase: Lưu trong JSONB (`knowledge_sections`, `reading_sections`, `listening_sections`)
- IndexedDB: Lưu trong exam data

---

### **5. Questions (Câu hỏi)**

- **Mục đích**: Câu hỏi cụ thể trong mỗi section
- **Ví dụ**: `1`, `2`, `3`, ...
- **Thuộc về**: Section

**Cấu trúc:**
```javascript
{
  id: '1',                     // Question ID
  category: 'knowledge',       // Loại: knowledge/reading/listening
  question: '...',             // Nội dung câu hỏi
  options: ['A', 'B', 'C', 'D'],  // Các lựa chọn
  correctAnswer: 0,           // Index của đáp án đúng (0-3)
  explanation: '...',          // Giải thích
  // Cho listening:
  audioUrl: '...',             // URL audio
  audioData: '...'             // Base64 audio (nếu có)
}
```

**Lưu trữ:**
- Supabase: Lưu trong JSONB của section
- IndexedDB: Lưu trong exam data

---

## 💾 CẤU TRÚC DATABASE SUPABASE

### **Bảng `exams`**

```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(2) NOT NULL CHECK (level IN ('n1', 'n2', 'n3', 'n4', 'n5')),
  exam_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  
  -- 3 phần chính (JSONB)
  knowledge_sections JSONB,      -- Sections của phần Knowledge
  reading_sections JSONB,        -- Sections của phần Reading
  listening_sections JSONB,      -- Sections của phần Listening
  
  -- Metadata
  config JSONB DEFAULT '{}',     -- Cấu hình, metadata
  image_url VARCHAR(500),        -- URL ảnh đề thi
  date VARCHAR(50),              -- Ngày thi (ví dụ: '2024/12')
  status VARCHAR(50),            -- Trạng thái (ví dụ: 'Có sẵn')
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,         -- Soft delete
  
  UNIQUE(level, exam_id)
);

-- Indexes
CREATE INDEX idx_exams_level ON exams(level) WHERE deleted_at IS NULL;
CREATE INDEX idx_exams_exam_id ON exams(exam_id) WHERE deleted_at IS NULL;
```

---

## 🔄 QUY TRÌNH NHẬP/LƯU/XÓA TỪ CLIENT LÊN SUPABASE

### **1. Nhập dữ liệu (Input)**

**Bước 1: Tạo Exam (Bài thi)**
```javascript
// Admin tạo exam mới
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
// Tạo section cho Knowledge
const knowledgeSection = {
  id: 'section1',
  title: '問題1',
  instruction: '（　　）に入れるのに最もよいものを...',
  timeLimit: 30,
  questions: []
};

// Tạo section cho Reading
const readingSection = {
  id: 'section1',
  title: '問題1',
  instruction: '次の文章を読んで...',
  timeLimit: null,
  questions: []
};

// Tạo section cho Listening
const listeningSection = {
  id: 'section1',
  title: '問題1',
  instruction: '音声を聞いて...',
  timeLimit: 60,
  questions: []
};
```

**Bước 3: Thêm Questions vào Sections**
```javascript
// Thêm câu hỏi vào section
const question = {
  id: '1',
  category: 'knowledge',
  question: '彼の説明は（　　）で、誰にでも理解できる。',
  options: ['簡潔', '簡略', '簡易', '簡素'],
  correctAnswer: 0,
  explanation: '「簡潔」は「短くてわかりやすい」という意味で...'
};

section.questions.push(question);
```

---

### **2. Lưu dữ liệu (Save)**

**Từ Client → Supabase:**

```javascript
// Sử dụng examService
import { saveExam, getExam, deleteExam } from '../services/examService.js';

// Lưu exam lên Supabase
const result = await saveExam({
  level: 'n1',
  examId: '2024-12',
  title: 'JLPT N1 2024/12',
  date: '2024/12',
  status: 'Có sẵn',
  imageUrl: '/jlpt/n1/2024-12.jpg',
  knowledge: {
    sections: [
      {
        id: 'section1',
        title: '問題1',
        instruction: '...',
        timeLimit: 30,
        questions: [...]
      }
    ]
  },
  reading: {
    sections: [
      {
        id: 'section1',
        title: '問題1',
        instruction: '...',
        timeLimit: null,
        questions: [...]
      }
    ]
  },
  listening: {
    sections: [
      {
        id: 'section1',
        title: '問題1',
        instruction: '...',
        timeLimit: 60,
        questions: [...]
      }
    ]
  }
}, userId);

if (result.success) {
  console.log('✅ Exam saved to Supabase');
} else {
  console.error('❌ Error:', result.error);
}
```

**Cấu trúc lưu trong Supabase:**
```javascript
{
  level: 'n1',
  exam_id: '2024-12',
  title: 'JLPT N1 2024/12',
  date: '2024/12',
  status: 'Có sẵn',
  image_url: '/jlpt/n1/2024-12.jpg',
  knowledge_sections: [
    {
      id: 'section1',
      title: '問題1',
      instruction: '...',
      timeLimit: 30,
      questions: [...]
    }
  ],
  reading_sections: [
    {
      id: 'section1',
      title: '問題1',
      instruction: '...',
      timeLimit: null,
      questions: [...]
    }
  ],
  listening_sections: [
    {
      id: 'section1',
      title: '問題1',
      instruction: '...',
      timeLimit: 60,
      questions: [...]
    }
  ],
  config: {},
  created_by: 'user-uuid',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}
```

---

### **3. Xóa dữ liệu (Delete)**

**Từ Client → Supabase:**

```javascript
// Xóa exam (soft delete)
const result = await deleteExam('n1', '2024-12', userId);

if (result.success) {
  console.log('✅ Exam deleted from Supabase');
} else {
  console.error('❌ Error:', result.error);
}
```

**Cấu trúc xóa:**
- **Soft delete**: Set `deleted_at = NOW()`
- **Hard delete**: Xóa hoàn toàn (chỉ admin)

---

## 📋 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Admin Page)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Tạo Exam (id, title, date, status, imageUrl)     │   │
│  │  2. Tạo Sections cho Knowledge/Reading/Listening    │   │
│  │  3. Thêm Questions vào Sections                     │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ saveExam()
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    examService.js                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Validate data structure                           │   │
│  │  - Transform: knowledge/reading/listening           │   │
│  │    → knowledge_sections/reading_sections/           │   │
│  │      listening_sections                              │   │
│  │  - Upsert to Supabase                                │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ Supabase Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Table: exams                                        │   │
│  │  - level: VARCHAR(2)                                │   │
│  │  - exam_id: VARCHAR(100)                           │   │
│  │  - title: VARCHAR(255)                              │   │
│  │  - knowledge_sections: JSONB                        │   │
│  │  - reading_sections: JSONB                          │   │
│  │  - listening_sections: JSONB                        │   │
│  │  - config: JSONB                                    │   │
│  │  - created_by: UUID                                 │   │
│  │  - created_at: TIMESTAMP                            │   │
│  │  - updated_at: TIMESTAMP                            │   │
│  │  - deleted_at: TIMESTAMP                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ VALIDATION RULES

### **1. Level**
- ✅ Phải là một trong: `n1`, `n2`, `n3`, `n4`, `n5`
- ✅ Không được để trống

### **2. Exam ID**
- ✅ Phải là string, không được để trống
- ✅ Format: `YYYY-MM` hoặc `YYYY-MM-DD` (ví dụ: `2024-12`)
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

## 🔧 IMPLEMENTATION

### **Service: `examService.js`**

```javascript
// src/services/examService.js

import { supabase } from './supabaseClient.js';

/**
 * Save exam to Supabase
 * @param {Object} exam - Exam data
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function saveExam(exam, userId) {
  try {
    const { data, error } = await supabase
      .from('exams')
      .upsert({
        level: exam.level,
        exam_id: exam.examId || exam.id,
        title: exam.title,
        date: exam.date || null,
        status: exam.status || null,
        image_url: exam.imageUrl || null,
        knowledge_sections: exam.knowledge?.sections || [],
        reading_sections: exam.reading?.sections || [],
        listening_sections: exam.listening?.sections || [],
        config: exam.config || {},
        created_by: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'level,exam_id'
      })
      .select()
      .single();

    if (error) {
      console.error('[ExamService] Error saving exam:', error);
      return { success: false, error };
    }

    console.log('[ExamService] ✅ Saved exam to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ExamService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get exam from Supabase
 * @param {string} level - Level (n1, n2, ...)
 * @param {string} examId - Exam ID
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function getExam(level, examId) {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('level', level)
      .eq('exam_id', examId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('[ExamService] Error fetching exam:', error);
      return { success: false, error };
    }

    if (!data) {
      return { success: true, data: null };
    }

    // Transform to app format
    const exam = {
      id: data.exam_id,
      level: data.level,
      title: data.title,
      date: data.date,
      status: data.status,
      imageUrl: data.image_url,
      knowledge: {
        sections: data.knowledge_sections || []
      },
      reading: {
        sections: data.reading_sections || []
      },
      listening: {
        sections: data.listening_sections || []
      },
      config: data.config || {}
    };

    return { success: true, data: exam };
  } catch (err) {
    console.error('[ExamService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get all exams by level
 * @param {string} level - Level (n1, n2, ...)
 * @returns {Promise<{success: boolean, data?: Array, error?: Object}>}
 */
export async function getExamsByLevel(level) {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('level', level)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) {
      console.error('[ExamService] Error fetching exams:', error);
      return { success: false, error };
    }

    // Transform to app format
    const exams = (data || []).map(exam => ({
      id: exam.exam_id,
      level: exam.level,
      title: exam.title,
      date: exam.date,
      status: exam.status,
      imageUrl: exam.image_url
    }));

    return { success: true, data: exams };
  } catch (err) {
    console.error('[ExamService] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete exam (soft delete)
 * @param {string} level - Level (n1, n2, ...)
 * @param {string} examId - Exam ID
 * @param {string} userId - UUID of admin user
 * @returns {Promise<{success: boolean, error?: Object}>}
 */
export async function deleteExam(level, examId, userId) {
  try {
    const { error } = await supabase
      .from('exams')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('level', level)
      .eq('exam_id', examId);

    if (error) {
      console.error('[ExamService] Error deleting exam:', error);
      return { success: false, error };
    }

    console.log('[ExamService] ✅ Deleted exam from Supabase');
    return { success: true };
  } catch (err) {
    console.error('[ExamService] Unexpected error:', err);
    return { success: false, error: err };
  }
}
```

---

## 📝 TÓM TẮT

### **Cấu trúc phân cấp:**
1. **Level** (n1, n2, n3, n4, n5)
2. **Exam** (2024-12, 2024-07, ...)
3. **Test Type** (Knowledge, Reading, Listening)
4. **Section** (section1, section2, ...)
5. **Questions** (1, 2, 3, ...)

### **Lưu trữ:**
- **Supabase**: Bảng `exams` với 3 cột JSONB (`knowledge_sections`, `reading_sections`, `listening_sections`)
- **IndexedDB**: Cache local cho performance

### **Quy trình:**
1. **Nhập**: Admin tạo exam → sections → questions
2. **Lưu**: Client → examService → Supabase
3. **Xóa**: Client → examService → Supabase (soft delete)

---

**Tác giả:** System Design  
**Ngày tạo:** 2024  
**Phiên bản:** 1.0

