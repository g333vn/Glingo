# 🏗️ THIẾT KẾ KIẾN TRÚC TỐI ƯU CHO DỰ ÁN ELEARNING

## 🎯 MỤC TIÊU

Thiết kế kiến trúc tối ưu cho dự án eLearning với:
- **Quy mô lớn**: 5M câu hỏi, 30 đề thi, 600-900 file audio
- **Chi phí thấp**: Miễn phí hoặc rẻ nhất có thể
- **Scalable**: Có thể mở rộng khi phát triển
- **Reliable**: Ổn định, không mất dữ liệu
- **Performance**: Tải nhanh, trải nghiệm tốt

---

## 🏛️ KIẾN TRÚC TỔNG THỂ

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React App (Vercel/Netlify - Miễn phí)          │   │
│  │  - Static hosting                                │   │
│  │  - CDN tự động                                   │   │
│  │  - SSL tự động                                   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Client Cache (IndexedDB)                        │   │
│  │  - Cache 50-100 MB (10-20 bài gần đây)          │   │
│  │  - Offline mode (giới hạn)                       │   │
│  │  - User progress                                 │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS/REST API
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  API LAYER                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Supabase API (Auto-generated)                  │   │
│  │  - REST API tự động                              │   │
│  │  - GraphQL (tùy chọn)                           │   │
│  │  - Real-time subscriptions                       │   │
│  │  - Authentication                                │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  DATABASE    │ │   STORAGE    │ │     CDN      │
│  (Supabase)  │ │ (Cloudflare) │ │ (Cloudflare) │
│              │ │              │ │              │
│  PostgreSQL  │ │  R2 Storage  │ │  CDN Cache   │
│  500 MB free │ │  10 GB free  │ │  Free tier   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📊 CHI TIẾT TỪNG LAYER

### 1. **CLIENT LAYER** (Frontend)

#### **Hosting: Vercel hoặc Netlify**

**Vercel (Khuyến nghị):**
- ✅ **Miễn phí** cho dự án cá nhân
- ✅ **CDN tự động** (toàn cầu)
- ✅ **SSL tự động**
- ✅ **Deploy tự động** từ GitHub
- ✅ **Preview deployments**
- ✅ **Analytics** (miễn phí tier)

**Netlify:**
- ✅ **Miễn phí** (100 GB bandwidth/tháng)
- ✅ **CDN tự động**
- ✅ **SSL tự động**
- ✅ **Forms** (100 submissions/tháng)

**Lựa chọn**: **Vercel** (tốt hơn cho React)

#### **Client Cache Strategy**

```javascript
// IndexedDB Cache Strategy
const CACHE_STRATEGY = {
  // Cache bài đã xem (10-20 bài gần đây)
  recentQuizzes: {
    maxItems: 20,
    maxSize: 50, // MB
    ttl: 7 * 24 * 60 * 60 * 1000 // 7 ngày
  },
  
  // Cache user progress
  userProgress: {
    maxSize: 10, // MB
    persistent: true
  },
  
  // Cache metadata (books, chapters)
  metadata: {
    maxSize: 5, // MB
    ttl: 24 * 60 * 60 * 1000 // 1 ngày
  }
};
```

**Ưu điểm:**
- Tải nhanh cho bài đã xem
- Offline mode (giới hạn)
- Giảm API calls

---

### 2. **API LAYER** (Backend)

#### **Supabase (Khuyến nghị)**

**Tại sao Supabase?**
- ✅ **Hoàn toàn miễn phí** (500 MB database, 1 GB storage)
- ✅ **REST API tự động** (không cần viết backend code)
- ✅ **Real-time** (tự động sync)
- ✅ **Authentication** tích hợp
- ✅ **Row Level Security** (bảo mật)
- ✅ **Dễ setup** (5 phút)

**Database Schema:**

```sql
-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(2) NOT NULL, -- n1, n2, n3, n4, n5
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
  book_id UUID REFERENCES books(id),
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
  book_id UUID REFERENCES books(id),
  chapter_id UUID REFERENCES chapters(id),
  lesson_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL, -- Array of questions
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
  config JSONB, -- Time, points, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(level, exam_id)
);

-- User Progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  quiz_id UUID REFERENCES quizzes(id),
  exam_id UUID REFERENCES exams(id),
  score INTEGER,
  answers JSONB,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quiz_id, exam_id)
);

-- Indexes for performance
CREATE INDEX idx_books_level ON books(level);
CREATE INDEX idx_chapters_book ON chapters(book_id);
CREATE INDEX idx_quizzes_book_chapter ON quizzes(book_id, chapter_id);
CREATE INDEX idx_exams_level ON exams(level);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
```

**API Endpoints (Tự động):**
```
GET    /rest/v1/books?level=eq.n1
GET    /rest/v1/chapters?book_id=eq.{book_id}
GET    /rest/v1/quizzes?book_id=eq.{book_id}&chapter_id=eq.{chapter_id}
GET    /rest/v1/exams?level=eq.n1
POST   /rest/v1/quizzes
PUT    /rest/v1/quizzes?id=eq.{id}
DELETE /rest/v1/quizzes?id=eq.{id}
```

---

### 3. **STORAGE LAYER** (File Audio)

#### **Cloudflare R2 (Khuyến nghị)**

**Tại sao Cloudflare R2?**
- ✅ **10 GB miễn phí/tháng**
- ✅ **Không tính phí bandwidth** (khác với S3)
- ✅ **CDN tích hợp** (Cloudflare CDN)
- ✅ **S3-compatible API** (dễ migrate)
- ✅ **Rẻ hơn S3** (nếu vượt quá free tier)

**Cấu trúc thư mục:**
```
r2://elearning-audio/
  ├── exams/
  │   ├── n1/
  │   │   ├── exam-2024-12/
  │   │   │   ├── listening/
  │   │   │   │   ├── part1/
  │   │   │   │   │   ├── 01.mp3
  │   │   │   │   │   ├── 02.mp3
  │   │   │   │   │   └── ...
  │   │   │   │   └── part2/
  │   │   │   │       └── ...
  │   │   │   └── ...
  │   │   └── ...
  │   └── ...
  └── ...
```

**URL Pattern:**
```
https://cdn.yourdomain.com/exams/n1/exam-2024-12/listening/part1/01.mp3
```

**CORS Configuration:**
```json
{
  "allowedOrigins": ["https://yourdomain.com"],
  "allowedMethods": ["GET"],
  "allowedHeaders": ["*"],
  "maxAge": 3600
}
```

---

### 4. **CDN LAYER** (Content Delivery)

#### **Cloudflare CDN (Tự động với R2)**

**Ưu điểm:**
- ✅ **Miễn phí** (với R2)
- ✅ **Toàn cầu** (200+ locations)
- ✅ **Cache tự động**
- ✅ **DDoS protection**
- ✅ **SSL tự động**

**Cache Strategy:**
```
Audio files: Cache 30 ngày (immutable)
Images: Cache 7 ngày
API responses: Cache 1 phút (nếu có thể)
```

---

## 🔄 DATA FLOW

### **Load Quiz Flow:**

```
1. User vào trang quiz
   ↓
2. Check IndexedDB cache
   ├─ Found → Load từ cache ✅
   └─ Not found → Continue
   ↓
3. Call Supabase API
   GET /rest/v1/quizzes?book_id=eq.X&chapter_id=eq.Y&lesson_id=eq.Z
   ↓
4. Supabase query database
   ↓
5. Return JSON data
   ↓
6. Save to IndexedDB cache
   ↓
7. Display quiz
```

### **Save Quiz Flow (Admin):**

```
1. Admin tạo quiz trong Quiz Editor
   ↓
2. Validate data
   ↓
3. Call Supabase API
   POST /rest/v1/quizzes
   ↓
4. Supabase save to database
   ↓
5. Return success
   ↓
6. Auto-export JSON to project code (optional)
   ↓
7. Show success message
```

### **Load Audio Flow:**

```
1. User vào trang listening exam
   ↓
2. Get audio URL from exam data
   ↓
3. Request audio from Cloudflare R2 CDN
   ↓
4. CDN check cache
   ├─ Cached → Return from cache ✅
   └─ Not cached → Fetch from R2 → Cache → Return
   ↓
5. Play audio
```

---

## 💾 STORAGE OPTIMIZATION

### **1. Database Optimization**

**Partitioning (Khi lớn):**
```sql
-- Partition quizzes by level
CREATE TABLE quizzes_n1 PARTITION OF quizzes
  FOR VALUES IN ('n1');

CREATE TABLE quizzes_n2 PARTITION OF quizzes
  FOR VALUES IN ('n2');
-- ...
```

**Compression:**
- Sử dụng `JSONB` (PostgreSQL tự động compress)
- Giảm ~30-50% dung lượng

**Indexing:**
- Index các cột thường query
- Giảm query time từ seconds → milliseconds

### **2. Audio Optimization**

**Format:**
- **MP3**: 128 kbps (đủ chất lượng, nhỏ file)
- **Opus**: 64 kbps (nhỏ hơn, chất lượng tốt)
- **Average size**: ~1-2 MB/file (thay vì 3-5 MB)

**Compression:**
```bash
# Convert to optimized MP3
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3

# Or Opus (smaller)
ffmpeg -i input.wav -codec:a libopus -b:a 64k output.opus
```

**Lazy Loading:**
- Chỉ load audio khi user click play
- Preload chỉ cho phần đang làm

### **3. Caching Strategy**

**Client-side (IndexedDB):**
- Cache 10-20 bài gần đây
- Cache user progress
- TTL: 7 ngày

**CDN (Cloudflare):**
- Cache audio files: 30 ngày
- Cache images: 7 ngày
- Cache API: 1 phút (nếu có thể)

---

## 🚀 DEPLOYMENT STRATEGY

### **Phase 1: Setup (Tuần 1)**

1. **Tạo Supabase project**
   - Sign up tại supabase.com
   - Tạo project mới
   - Copy API keys

2. **Setup Cloudflare R2**
   - Tạo R2 bucket
   - Setup CORS
   - Upload test file

3. **Deploy Frontend**
   - Connect GitHub với Vercel
   - Setup environment variables
   - Deploy

4. **Migrate Data**
   - Export từ IndexedDB/localStorage
   - Import vào Supabase
   - Verify data

### **Phase 2: Migration (Tuần 2-3)**

1. **Update Code**
   - Replace `localStorageManager` với Supabase client
   - Update API calls
   - Test thoroughly

2. **Upload Audio Files**
   - Compress audio files
   - Upload to R2
   - Update URLs in database

3. **Performance Testing**
   - Load testing
   - Optimize queries
   - Fine-tune caching

### **Phase 3: Production (Tuần 4)**

1. **Go Live**
   - Switch to production
   - Monitor performance
   - Collect feedback

2. **Optimization**
   - Analyze usage
   - Optimize hot paths
   - Scale if needed

---

## 📈 SCALING STRATEGY

### **Khi vượt quá Free Tier:**

#### **Option 1: Upgrade Supabase**
- **$25/tháng**: 8 GB database + 100 GB storage
- **Vẫn rẻ** cho dự án phi lợi nhuận

#### **Option 2: Hybrid Approach**
- **Supabase**: Database (500 MB free)
- **Cloudflare R2**: Storage (10 GB free)
- **Self-hosted PostgreSQL**: Khi cần nhiều hơn

#### **Option 3: Self-hosted VPS**
- **€4-5/tháng**: Full control
- **PostgreSQL**: Self-hosted
- **Cloudflare R2**: Audio files (10 GB free)

---

## 🔒 SECURITY

### **1. Authentication**
- Supabase Auth (tích hợp sẵn)
- JWT tokens
- Row Level Security (RLS)

### **2. API Security**
```sql
-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read
CREATE POLICY "Public read access"
  ON quizzes FOR SELECT
  USING (true);

-- Policy: Only admins can write
CREATE POLICY "Admin write access"
  ON quizzes FOR INSERT
  USING (auth.jwt() ->> 'role' = 'admin');
```

### **3. CORS**
- Chỉ allow domain của bạn
- Block unauthorized requests

---

## 📊 MONITORING & ANALYTICS

### **1. Supabase Dashboard**
- Database usage
- API requests
- Storage usage

### **2. Vercel Analytics**
- Page views
- Performance metrics
- User behavior

### **3. Custom Analytics**
- User progress tracking
- Quiz completion rates
- Popular content

---

## 💰 COST BREAKDOWN

### **Free Tier (Bắt đầu):**
- **Vercel**: $0 (unlimited)
- **Supabase**: $0 (500 MB DB, 1 GB storage)
- **Cloudflare R2**: $0 (10 GB storage)
- **Cloudflare CDN**: $0 (unlimited bandwidth)
- **Tổng**: **$0/tháng**

### **Paid Tier (Khi phát triển):**
- **Vercel**: $0 (vẫn free)
- **Supabase**: $25/tháng (8 GB DB, 100 GB storage)
- **Cloudflare R2**: $0 (vẫn free 10 GB)
- **Cloudflare CDN**: $0 (vẫn free)
- **Tổng**: **$25/tháng**

### **Self-hosted (Khi lớn mạnh):**
- **VPS**: €5/tháng (~$5)
- **Cloudflare R2**: $0 (10 GB free)
- **Tổng**: **$5/tháng**

---

## ✅ CHECKLIST TRIỂN KHAI

### **Setup:**
- [ ] Tạo Supabase project
- [ ] Setup database schema
- [ ] Tạo Cloudflare R2 bucket
- [ ] Setup CORS cho R2
- [ ] Deploy frontend lên Vercel
- [ ] Setup environment variables

### **Migration:**
- [ ] Export data từ IndexedDB
- [ ] Import vào Supabase
- [ ] Upload audio files lên R2
- [ ] Update code để dùng Supabase
- [ ] Test thoroughly

### **Optimization:**
- [ ] Compress audio files
- [ ] Setup caching strategy
- [ ] Optimize database queries
- [ ] Setup monitoring

### **Production:**
- [ ] Switch to production
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Iterate and improve

---

## 🎯 KẾT LUẬN

### **Kiến trúc tối ưu:**
1. **Frontend**: Vercel (miễn phí)
2. **Database**: Supabase (miễn phí: 500 MB)
3. **Storage**: Cloudflare R2 (miễn phí: 10 GB)
4. **CDN**: Cloudflare (miễn phí)
5. **Client Cache**: IndexedDB (miễn phí)

### **Chi phí:**
- **Bắt đầu**: **$0/tháng**
- **Khi phát triển**: **$25/tháng**
- **Khi lớn mạnh**: **$5/tháng** (self-hosted)

### **Ưu điểm:**
- ✅ Hoàn toàn miễn phí để bắt đầu
- ✅ Scalable (có thể mở rộng)
- ✅ Reliable (99.9% uptime)
- ✅ Performance (CDN toàn cầu)
- ✅ Dễ setup và maintain

---

**Tài liệu này mô tả kiến trúc tối ưu cho dự án eLearning của bạn.**

