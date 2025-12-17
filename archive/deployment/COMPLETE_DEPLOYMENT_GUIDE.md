# 🚀 HƯỚNG DẪN TRIỂN KHAI WEB APP LÊN INTERNET - CHO NGƯỜI MỚI

## 📋 TỔNG QUAN

Hướng dẫn này sẽ giúp bạn đưa web app eLearning lên internet **HOÀN TOÀN MIỄN PHÍ** hoặc với **CHI PHÍ TỐI THIỂU**, phù hợp cho dự án phi lợi nhuận.

---

## 💰 TẤT CẢ CÁC CHI PHÍ CÓ THỂ CÓ

### ✅ **MIỄN PHÍ HOÀN TOÀN:**

1. **Domain Name** - Miễn phí (dùng subdomain)
2. **Frontend Hosting** - Miễn phí (Vercel/Netlify)
3. **Database** - Miễn phí (Supabase: 500 MB)
4. **File Storage** - Miễn phí (Cloudflare R2: 10 GB)
5. **CDN** - Miễn phí (Cloudflare)
6. **SSL Certificate** - Miễn phí (tự động)
7. **Email Service** - Miễn phí (nếu cần)
8. **Monitoring** - Miễn phí (Vercel Analytics)
9. **Backup** - Miễn phí (Supabase tự động)
10. **Development Tools** - Miễn phí (GitHub, VS Code)

### 💵 **CHI PHÍ TỐI THIỂU (Nếu muốn domain riêng):**

1. **Domain Name** - $10-15/năm (~$1/tháng)
2. **Email** - Miễn phí (Gmail/Outlook) hoặc $5/tháng (nếu cần email @yourdomain.com)

### 📊 **TỔNG KẾT CHI PHÍ:**

| Option | Chi phí/tháng | Chi phí/năm |
|--------|---------------|-------------|
| **Hoàn toàn miễn phí** | **$0** | **$0** |
| **Có domain riêng** | **$1** | **$12** |
| **Có email @domain** | **$6** | **$72** |

---

## 🎯 GIẢI PHÁP TỐI ƯU: HOÀN TOÀN MIỄN PHÍ

### **Kiến trúc miễn phí:**

```
Domain: yourproject.vercel.app (MIỄN PHÍ)
  ↓
Frontend: Vercel (MIỄN PHÍ)
  ↓
Database: Supabase (MIỄN PHÍ: 500 MB)
  ↓
Storage: Cloudflare R2 (MIỄN PHÍ: 10 GB)
  ↓
CDN: Cloudflare (MIỄN PHÍ)
```

**Chi phí: $0/tháng**

---

## 📝 HƯỚNG DẪN TỪNG BƯỚC CHI TIẾT

### **BƯỚC 1: CHUẨN BỊ TÀI KHOẢN (30 phút)**

#### **1.1. Tạo tài khoản GitHub (Miễn phí)**

**Tại sao cần GitHub?**
- Lưu trữ code
- Deploy tự động
- Version control

**Cách làm:**
1. Vào https://github.com
2. Click "Sign up"
3. Điền thông tin:
   - Username: `your-username`
   - Email: email của bạn
   - Password: mật khẩu mạnh
4. Verify email
5. Xong! ✅

**Chi phí: $0**

---

#### **1.2. Tạo tài khoản Vercel (Miễn phí)**

**Tại sao cần Vercel?**
- Host frontend (React app)
- CDN tự động
- SSL tự động
- Deploy tự động từ GitHub

**Cách làm:**
1. Vào https://vercel.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub"
4. Authorize Vercel
5. Xong! ✅

**Chi phí: $0**

---

#### **1.3. Tạo tài khoản Supabase (Miễn phí)**

**Tại sao cần Supabase?**
- Database (PostgreSQL)
- REST API tự động
- Authentication
- Storage (1 GB miễn phí)

**Cách làm:**
1. Vào https://supabase.com
2. Click "Start your project"
3. Chọn "Continue with GitHub"
4. Authorize Supabase
5. Xong! ✅

**Chi phí: $0**

---

#### **1.4. Tạo tài khoản Cloudflare (Miễn phí)**

**Tại sao cần Cloudflare?**
- CDN (tải nhanh toàn cầu)
- R2 Storage (10 GB miễn phí)
- DDoS protection
- SSL tự động

**Cách làm:**
1. Vào https://dash.cloudflare.com/sign-up
2. Điền email và password
3. Verify email
4. Xong! ✅

**Chi phí: $0**

---

### **BƯỚC 2: SETUP GITHUB REPOSITORY (15 phút)**

#### **2.1. Tạo Repository mới**

1. Đăng nhập GitHub
2. Click nút "+" (góc phải trên) → "New repository"
3. Điền thông tin:
   - Repository name: `elearning-platform`
   - Description: "E-Learning Platform for Japanese Language"
   - Public hoặc Private (tùy bạn)
   - **KHÔNG** check "Initialize with README" (vì bạn đã có code)
4. Click "Create repository"

#### **2.2. Upload code lên GitHub**

**Cách 1: Dùng GitHub Desktop (Dễ nhất cho người mới)**

1. Download GitHub Desktop: https://desktop.github.com
2. Install và mở GitHub Desktop
3. Click "File" → "Clone repository"
4. Chọn repository vừa tạo
5. Chọn thư mục local (thư mục project của bạn)
6. Click "Clone"
7. Copy tất cả file project vào thư mục đó
8. Trong GitHub Desktop:
   - Summary: "Initial commit"
   - Click "Commit to main"
   - Click "Push origin"
9. Xong! ✅ Code đã lên GitHub

**Cách 2: Dùng Git Command Line**

```bash
# Mở Terminal/Command Prompt trong thư mục project
cd "E:\Projects\elearning - cur"

# Initialize git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/your-username/elearning-platform.git

# Push lên GitHub
git push -u origin main
```

---

### **BƯỚC 3: SETUP SUPABASE DATABASE (30 phút)**

#### **3.1. Tạo Project mới**

1. Đăng nhập Supabase
2. Click "New Project"
3. Điền thông tin:
   - Name: `elearning-platform`
   - Database Password: Tạo password mạnh (lưu lại!)
   - Region: Chọn gần bạn nhất (ví dụ: Southeast Asia)
   - Pricing Plan: Free
4. Click "Create new project"
5. Đợi 2-3 phút để setup xong

#### **3.2. Lấy API Keys**

1. Vào project vừa tạo
2. Click "Settings" (icon bánh răng) → "API"
3. Copy các keys sau (sẽ dùng sau):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (giữ bí mật!)

#### **3.3. Tạo Database Tables**

1. Vào "SQL Editor" (menu bên trái)
2. Click "New query"
3. Copy và paste SQL sau:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(2) NOT NULL,
  book_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(level, book_id)
);

-- Chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(book_id, chapter_id)
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  lesson_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(book_id, chapter_id, lesson_id)
);

-- Exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(2) NOT NULL,
  exam_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  knowledge_sections JSONB,
  listening_sections JSONB,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(level, exam_id)
);

-- User Progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  score INTEGER,
  answers JSONB,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quiz_id, exam_id)
);

-- Create indexes for performance
CREATE INDEX idx_books_level ON books(level);
CREATE INDEX idx_chapters_book ON chapters(book_id);
CREATE INDEX idx_quizzes_book_chapter ON quizzes(book_id, chapter_id);
CREATE INDEX idx_exams_level ON exams(level);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read books, chapters, quizzes, exams
CREATE POLICY "Public read access on books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Public read access on chapters"
  ON chapters FOR SELECT
  USING (true);

CREATE POLICY "Public read access on quizzes"
  ON quizzes FOR SELECT
  USING (true);

CREATE POLICY "Public read access on exams"
  ON exams FOR SELECT
  USING (true);

-- Policy: Only authenticated users can write (sẽ setup sau)
CREATE POLICY "Authenticated users can insert quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quizzes"
  ON quizzes FOR UPDATE
  USING (auth.role() = 'authenticated');
```

4. Click "Run" (hoặc Ctrl+Enter)
5. Xong! ✅ Database đã được tạo

---

### **BƯỚC 4: SETUP CLOUDFLARE R2 (20 phút)**

#### **4.1. Tạo R2 Bucket**

1. Đăng nhập Cloudflare
2. Chọn account của bạn
3. Vào "R2" (menu bên trái)
4. Click "Create bucket"
5. Điền thông tin:
   - Bucket name: `elearning-audio`
   - Location: Chọn gần bạn nhất
6. Click "Create bucket"

#### **4.2. Setup CORS (Cho phép frontend truy cập)**

1. Click vào bucket vừa tạo
2. Vào tab "Settings"
3. Scroll xuống "CORS Policy"
4. Click "Edit CORS Policy"
5. Paste config sau:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Click "Save"
7. Xong! ✅

#### **4.3. Lấy R2 Credentials**

1. Vào "Manage R2 API Tokens"
2. Click "Create API token"
3. Điền thông tin:
   - Token name: `elearning-platform`
   - Permissions: "Object Read & Write"
   - TTL: "No expiration" (hoặc set ngày hết hạn)
4. Click "Create API Token"
5. **LƯU LẠI** các thông tin:
   - Access Key ID
   - Secret Access Key
   - (Chỉ hiện 1 lần!)

---

### **BƯỚC 5: SETUP VERCEL DEPLOYMENT (20 phút)**

#### **5.1. Connect GitHub với Vercel**

1. Đăng nhập Vercel
2. Click "Add New..." → "Project"
3. Chọn "Import Git Repository"
4. Chọn repository `elearning-platform`
5. Click "Import"

#### **5.2. Configure Project**

1. **Project Name**: `elearning-platform` (hoặc tên bạn muốn)
2. **Framework Preset**: Vite (tự động detect)
3. **Root Directory**: `./` (mặc định)
4. **Build Command**: `npm run build` (tự động)
5. **Output Directory**: `dist` (tự động)

#### **5.3. Setup Environment Variables**

Click "Environment Variables" và thêm:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_CLOUDFLARE_R2_BUCKET=elearning-audio
VITE_CLOUDFLARE_R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
```

(Lấy từ Supabase và Cloudflare ở bước trước)

#### **5.4. Deploy**

1. Click "Deploy"
2. Đợi 2-3 phút
3. Xong! ✅ Website đã live tại: `https://elearning-platform.vercel.app`

---

### **BƯỚC 6: UPDATE CODE ĐỂ DÙNG SUPABASE (1-2 giờ)**

#### **6.1. Install Supabase Client**

```bash
# Trong thư mục project
npm install @supabase/supabase-js
```

#### **6.2. Tạo Supabase Client**

Tạo file `src/utils/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### **6.3. Update localStorageManager.js**

Thay thế các hàm `getQuiz`, `saveQuiz` để dùng Supabase:

```javascript
import { supabase } from './supabaseClient.js';

async getQuiz(bookId, chapterId, lessonId) {
  try {
    // 1. Try Supabase first
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .single();
    
    if (data) {
      return data;
    }
    
    // 2. Fallback to IndexedDB/localStorage
    // ... (giữ code cũ)
  } catch (error) {
    console.error('Error getting quiz:', error);
    // Fallback
  }
}

async saveQuiz(bookId, chapterId, lessonId, quizData) {
  try {
    // 1. Save to Supabase
    const { data, error } = await supabase
      .from('quizzes')
      .upsert({
        book_id: bookId,
        chapter_id: chapterId,
        lesson_id: lessonId,
        title: quizData.title,
        questions: quizData.questions
      });
    
    if (error) throw error;
    
    // 2. Also save to IndexedDB for cache
    // ... (giữ code cũ)
    
    return true;
  } catch (error) {
    console.error('Error saving quiz:', error);
    return false;
  }
}
```

#### **6.4. Test**

1. Chạy `npm run dev`
2. Test tạo quiz mới
3. Kiểm tra trong Supabase Dashboard xem data đã lưu chưa
4. Xong! ✅

---

### **BƯỚC 7: UPLOAD AUDIO FILES (Tùy số lượng file)**

#### **7.1. Compress Audio Files (Tùy chọn)**

Để tiết kiệm dung lượng:

```bash
# Install ffmpeg (nếu chưa có)
# Windows: Download từ https://ffmpeg.org/download.html

# Compress MP3
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3
```

#### **7.2. Upload lên Cloudflare R2**

**Cách 1: Dùng Cloudflare Dashboard**

1. Vào Cloudflare Dashboard
2. Vào R2 → Bucket `elearning-audio`
3. Click "Upload"
4. Chọn files và upload
5. Xong! ✅

**Cách 2: Dùng R2 API (Nếu có nhiều files)**

Tạo script `upload-audio.js`:

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Upload file
async function uploadFile(filePath, key) {
  const fileContent = await fs.readFile(filePath);
  
  const command = new PutObjectCommand({
    Bucket: 'elearning-audio',
    Key: key,
    Body: fileContent,
    ContentType: 'audio/mpeg',
  });
  
  await client.send(command);
  console.log(`Uploaded: ${key}`);
}
```

#### **7.3. Update URLs trong Database**

Sau khi upload, update URLs trong Supabase:

```sql
-- Update exam audio URLs
UPDATE exams
SET listening_sections = jsonb_set(
  listening_sections,
  '{audio_url}',
  '"https://your-r2-domain.com/exams/n1/exam-2024-12/listening/part1/01.mp3"'
)
WHERE exam_id = 'exam-2024-12';
```

---

### **BƯỚC 8: SETUP DOMAIN (Tùy chọn - Nếu muốn domain riêng)**

#### **8.1. Mua Domain (Nếu muốn)**

**Nơi mua domain rẻ:**
- Namecheap: $10-15/năm
- Google Domains: $12/năm
- Cloudflare Registrar: $8-10/năm (rẻ nhất)

**Cách mua:**
1. Vào website (ví dụ: namecheap.com)
2. Search domain (ví dụ: `japanese-learning.com`)
3. Chọn domain và checkout
4. Thanh toán
5. Xong! ✅

#### **8.2. Connect Domain với Vercel**

1. Vào Vercel Dashboard
2. Vào project → "Settings" → "Domains"
3. Add domain: `japanese-learning.com`
4. Follow instructions để setup DNS
5. Đợi 24-48 giờ để DNS propagate
6. Xong! ✅ Website live tại domain riêng

---

## 📊 CHECKLIST HOÀN CHỈNH

### **Setup Accounts:**
- [ ] GitHub account
- [ ] Vercel account
- [ ] Supabase account
- [ ] Cloudflare account

### **Setup Repository:**
- [ ] Create GitHub repository
- [ ] Upload code lên GitHub

### **Setup Database:**
- [ ] Create Supabase project
- [ ] Create database tables
- [ ] Setup RLS policies
- [ ] Copy API keys

### **Setup Storage:**
- [ ] Create Cloudflare R2 bucket
- [ ] Setup CORS
- [ ] Copy R2 credentials

### **Setup Deployment:**
- [ ] Connect GitHub với Vercel
- [ ] Setup environment variables
- [ ] Deploy project
- [ ] Test website

### **Update Code:**
- [ ] Install Supabase client
- [ ] Update localStorageManager
- [ ] Test save/load data
- [ ] Upload audio files

### **Optional:**
- [ ] Buy domain
- [ ] Connect domain với Vercel
- [ ] Setup custom email

---

## 🎯 KẾT QUẢ CUỐI CÙNG

Sau khi hoàn thành tất cả các bước:

✅ **Website live tại**: `https://elearning-platform.vercel.app`  
✅ **Database**: Supabase (500 MB miễn phí)  
✅ **Storage**: Cloudflare R2 (10 GB miễn phí)  
✅ **CDN**: Cloudflare (miễn phí)  
✅ **SSL**: Tự động (miễn phí)  
✅ **Chi phí**: **$0/tháng**

---

## 🆘 TROUBLESHOOTING

### **Lỗi thường gặp:**

1. **"Module not found"**
   - Chạy `npm install` lại

2. **"Environment variable not found"**
   - Kiểm tra `.env` file
   - Kiểm tra Vercel environment variables

3. **"CORS error"**
   - Kiểm tra CORS config trong Cloudflare R2
   - Kiểm tra RLS policies trong Supabase

4. **"Database connection failed"**
   - Kiểm tra Supabase URL và keys
   - Kiểm tra network connection

---

## 📚 TÀI LIỆU THAM KHẢO

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **GitHub Docs**: https://docs.github.com

---

**Hướng dẫn này sẽ giúp bạn đưa web app lên internet hoàn toàn miễn phí!**

