# 📊 Database Connection & Verification Guide
## JLPT Answers Access & Explanation Feature

---

## 🎯 Tổng Quan

Feature này sử dụng **Supabase** làm database backend để:
- ✅ Lưu trữ kết quả exam (`exam_results`)
- ✅ Lưu trữ đề thi và câu hỏi (`exams`)
- ✅ Quản lý authentication (`auth.users`, `profiles`)
- ✅ Kiểm soát access control

---

## 🔌 Database Connection

### **1. Supabase Client Configuration**

**File:** `src/services/supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
    storageKey: 'sb-glingo-auth-token',
  }
});
```

### **2. Environment Variables**

Cần có file `.env.local` với:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Lưu ý:**
- ✅ Nếu thiếu env vars → App vẫn chạy nhưng không kết nối Supabase
- ✅ Console sẽ warning: `[Supabase] ⚠️ Missing configuration`
- ✅ Các tính năng offline (localStorage) vẫn hoạt động

---

## 📋 Database Tables Liên Quan

### **1. `exams` Table**

**Schema:** `archive/data/supabase_exams_schema.sql`

**Mục đích:** Lưu trữ đề thi JLPT và tất cả câu hỏi (bao gồm explanations)

**Cấu trúc:**
```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY,
  level VARCHAR(2) NOT NULL,           -- n1, n2, n3, n4, n5
  exam_id VARCHAR(100) NOT NULL,      -- '2025/7', '2024/12', etc.
  title VARCHAR(255) NOT NULL,
  
  -- 3 phần chính (JSONB)
  knowledge_sections JSONB,           -- Sections của phần Knowledge
  reading_sections JSONB,             -- Sections của phần Reading
  listening_sections JSONB,           -- Sections của phần Listening
  
  -- Metadata
  config JSONB DEFAULT '{}',
  image_url VARCHAR(500),
  date VARCHAR(50),
  status VARCHAR(50),
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,               -- Soft delete
  
  UNIQUE(level, exam_id)
);
```

**Cấu trúc JSONB (knowledge_sections, reading_sections, listening_sections):**
```json
[
  {
    "id": "section1",
    "title": "文字・語彙",
    "instruction": "問題1...",
    "timeLimit": 0,
    "questions": [
      {
        "id": "1",
        "question": "問題文...",
        "text": "余暇の楽しみ方は色々ある。",
        "options": ["ようか", "よか", "よが", "ようが"],
        "correctAnswer": 1,
        "explanation": "Giải thích chi tiết..."  // ← Đây là field quan trọng!
      }
    ]
  }
]
```

**Row Level Security (RLS):**
- ✅ **SELECT**: Public (ai cũng đọc được)
- ✅ **INSERT/UPDATE**: Chỉ admin/editor
- ✅ **DELETE**: Chỉ admin (soft delete)

---

### **2. `exam_results` Table**

**Mục đích:** Lưu kết quả exam của user (điểm số, đậu/rớt)

**Cấu trúc:**
```sql
CREATE TABLE exam_results (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  level_id VARCHAR(2) NOT NULL,        -- n1, n2, ...
  exam_id VARCHAR(100) NOT NULL,      -- '2025/7', ...
  
  -- Điểm số
  knowledge_score INTEGER,            -- 0-60
  reading_score INTEGER,               -- 0-60
  listening_score INTEGER,             -- 0-60
  total_score INTEGER,                 -- 0-180
  
  -- Chi tiết số câu đúng/tổng
  knowledge_correct INTEGER,
  knowledge_total INTEGER,
  reading_correct INTEGER,
  reading_total INTEGER,
  listening_correct INTEGER,
  listening_total INTEGER,
  
  -- Kết quả
  is_passed BOOLEAN,
  time_spent INTEGER,                  -- seconds
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Service:** `src/services/examResultsService.js`
- `saveExamResult()` - Lưu kết quả
- `getExamResult()` - Lấy kết quả cụ thể
- `getUserExamResults()` - Lấy tất cả kết quả của user

---

### **3. `auth.users` & `profiles` Tables**

**Mục đích:** Authentication và user management

**auth.users** (Supabase built-in):
- `id` (UUID)
- `email`
- `email_confirmed_at`
- `created_at`

**profiles** (Custom table):
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255),
  display_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',    -- 'user', 'editor', 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Service:** `src/services/authService.js`
- `signUp()` - Đăng ký
- `signIn()` - Đăng nhập
- `signOut()` - Đăng xuất
- `getUserProfile()` - Lấy profile

---

## ✅ Cách Kiểm Tra Kết Nối Database

### **1. Kiểm Tra Configuration**

**Trong Browser Console:**
```javascript
// Check Supabase client
import { supabase, isSupabaseConfigured } from './services/supabaseClient.js';

console.log('Supabase configured:', isSupabaseConfigured());
console.log('Supabase URL:', supabase.supabaseUrl);
```

**Expected Output:**
```
Supabase configured: true
Supabase URL: https://your-project.supabase.co
```

---

### **2. Kiểm Tra Authentication**

**Test Login:**
```javascript
import * as authService from './services/authService.js';

// Test sign in
const result = await authService.signIn({
  email: 'test@example.com',
  password: 'password123'
});

console.log('Login result:', result);
```

**Expected Output:**
```javascript
{
  success: true,
  data: { user: {...}, session: {...} }
}
```

---

### **3. Kiểm Tra Exam Data**

**Query trong Supabase SQL Editor:**

```sql
-- Xem tất cả exams
SELECT 
  level,
  exam_id,
  title,
  date,
  created_at
FROM exams
WHERE deleted_at IS NULL
ORDER BY level, exam_id;
```

**Query để kiểm tra explanations:**

```sql
-- Tìm questions có explanation
SELECT 
  level,
  exam_id,
  'knowledge' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  CASE 
    WHEN question->>'explanation' IS NULL OR question->>'explanation' = '' THEN 'NO'
    WHEN LENGTH(TRIM(question->>'explanation')) = 0 THEN 'EMPTY'
    ELSE 'YES'
  END as has_explanation,
  LEFT(question->>'explanation', 50) as explanation_preview
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE level = 'n1'
  AND exam_id = '2025/7'
  AND deleted_at IS NULL
LIMIT 10;
```

---

### **4. Kiểm Tra Exam Results**

**Query trong Supabase SQL Editor:**

```sql
-- Xem exam results của một user
SELECT 
  er.level_id,
  er.exam_id,
  er.total_score,
  er.is_passed,
  er.completed_at,
  e.title as exam_title
FROM exam_results er
LEFT JOIN exams e ON er.level_id = e.level AND er.exam_id = e.exam_id
WHERE er.user_id = 'your-user-id-here'
ORDER BY er.completed_at DESC;
```

**Hoặc dùng Service:**

```javascript
import { getUserExamResults } from './services/examResultsService.js';

const result = await getUserExamResults('user-id-here');
console.log('Exam results:', result);
```

---

### **5. Kiểm Tra Access Control**

**Query để xem user role:**

```sql
-- Xem profile của user
SELECT 
  user_id,
  email,
  display_name,
  role,
  created_at
FROM profiles
WHERE user_id = 'your-user-id-here';
```

**Trong Code:**

```javascript
import { useAuth } from './contexts/AuthContext.jsx';

const { user, profile } = useAuth();
console.log('User:', user);
console.log('Profile:', profile);
console.log('Role:', profile?.role);
```

---

## 🔍 Troubleshooting

### **Vấn đề 1: "Supabase not configured"**

**Nguyên nhân:** Thiếu env variables

**Giải pháp:**
1. Tạo file `.env.local` trong root directory
2. Thêm:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart dev server

---

### **Vấn đề 2: "Failed to fetch" hoặc Network Error**

**Nguyên nhân:** 
- Supabase URL sai
- Network issue
- CORS issue

**Giải pháp:**
1. Kiểm tra Supabase URL trong `.env.local`
2. Kiểm tra Supabase Dashboard → Settings → API
3. Kiểm tra Network tab trong Browser DevTools

---

### **Vấn đề 3: "Row Level Security policy violation"**

**Nguyên nhân:** RLS policy chặn query

**Giải pháp:**
1. Kiểm tra user đã login chưa
2. Kiểm tra role của user (admin/editor/user)
3. Xem RLS policies trong Supabase Dashboard → Authentication → Policies

---

### **Vấn đề 4: Exam data không load được**

**Nguyên nhân:**
- Exam chưa được tạo trong database
- Exam bị soft delete (`deleted_at IS NOT NULL`)
- JSONB structure sai

**Giải pháp:**
1. Chạy query kiểm tra:
   ```sql
   SELECT * FROM exams 
   WHERE level = 'n1' AND exam_id = '2025/7' AND deleted_at IS NULL;
   ```
2. Nếu không có → Tạo exam mới qua Admin Panel
3. Nếu có nhưng không load → Kiểm tra JSONB structure

---

## 📊 Verification Checklist

### **Pre-deployment:**

- [ ] Supabase URL và Anon Key đã set trong `.env.local`
- [ ] `isSupabaseConfigured()` returns `true`
- [ ] Có thể login/register thành công
- [ ] Exam data có trong database
- [ ] Exam results có thể lưu và đọc được
- [ ] RLS policies đã được setup đúng

### **Post-deployment:**

- [ ] Environment variables đã set trong hosting platform (Vercel/Netlify)
- [ ] Supabase URL accessible từ production domain
- [ ] Authentication flow hoạt động
- [ ] Exam data load được
- [ ] Exam results sync được

---

## 🔗 Related Files

- **Supabase Client:** `src/services/supabaseClient.js`
- **Auth Service:** `src/services/authService.js`
- **Exam Results Service:** `src/services/examResultsService.js`
- **Exam Schema:** `archive/data/supabase_exams_schema.sql`
- **Exam Queries:** `exam_database_queries.sql`
- **Feature Doc:** `docs/JLPT_ANSWERS_ACCESS_AND_EXPLANATION.md`

---

## 📝 Notes

1. **Hybrid Storage Strategy:**
   - Exam content: Có thể lưu trong database HOẶC localStorage (fallback)
   - Exam results: Lưu trong database (nếu user đã login)
   - User answers: Lưu trong localStorage (tạm thời)

2. **Explanation Field:**
   - Nằm trong `exams.knowledge_sections[].questions[].explanation`
   - Có thể là `null`, `""`, hoặc HTML string
   - Code sẽ check và hiển thị message nếu rỗng

3. **Access Control:**
   - Không login: Chỉ xem tổng quan + tóm tắt
   - Đã login: Xem đầy đủ chi tiết từng câu
   - Logic nằm trong `ExamAnswersPage.jsx` (check `user` từ `AuthContext`)

---

**Last Updated:** 2025-01-XX
**Author:** Development Team

