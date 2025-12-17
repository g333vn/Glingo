# 📊 PHÂN TÍCH DUNG LƯỢNG LƯU TRỮ

## 📈 QUY MÔ DỮ LIỆU DỰ KIẾN

### Dữ liệu Quiz:
- **5 cấp** (N1-N5)
- **Mỗi cấp**: 20 bộ sách
- **Mỗi bộ**: 5 cuốn
- **Mỗi cuốn**: 20 chương
- **Mỗi chương**: 10 bài
- **Mỗi bài**: 10 câu hỏi

**Tổng số câu hỏi**: 5 × 20 × 5 × 20 × 10 × 10 = **5,000,000 câu hỏi**

### Dữ liệu Đề thi:
- **30 đề thi**
- **Mỗi đề**: 2 phần thi (Knowledge + Listening)
- **Mỗi phần**: ~50 câu hỏi

**Tổng số câu hỏi đề thi**: 30 × 2 × 50 = **3,000 câu hỏi**

### File Audio (Nghe):
- **30 đề thi** × **~20-30 file audio/đề** = **600-900 file audio**
- **Mỗi file**: ~1-3 MB (MP3) = **600 MB - 2.7 GB**

---

## 💾 TÍNH TOÁN DUNG LƯỢNG

### 1. Dữ liệu Quiz (JSON)

**Mỗi câu hỏi** (ước tính):
```json
{
  "id": 1,
  "text": "Câu hỏi dài...",
  "options": ["A", "B", "C", "D"],
  "correct": "A",
  "explanation": "Giải thích dài..."
}
```
- **Kích thước trung bình**: ~500 bytes/câu
- **5,000,000 câu** × 500 bytes = **2.5 GB**

### 2. Dữ liệu Đề thi (JSON)

**Mỗi câu hỏi đề thi** (phức tạp hơn):
- **Kích thước trung bình**: ~800 bytes/câu
- **3,000 câu** × 800 bytes = **2.4 MB**

### 3. Metadata (Books, Chapters, Series)

- **5 cấp** × **20 bộ** × **5 cuốn** × **20 chương** = **10,000 items**
- **Kích thước trung bình**: ~2 KB/item
- **Tổng**: **20 MB**

### 4. File Audio

- **600-900 file** × **1-3 MB** = **600 MB - 2.7 GB**

---

## 📊 TỔNG KẾT DUNG LƯỢNG

| Loại dữ liệu | Dung lượng |
|--------------|------------|
| Quiz (5M câu) | **~2.5 GB** |
| Đề thi (3K câu) | **~2.4 MB** |
| Metadata | **~20 MB** |
| File Audio | **~600 MB - 2.7 GB** |
| **TỔNG CỘNG** | **~3.1 GB - 5.2 GB** |

---

## ⚠️ GIỚI HẠN CỦA CLIENT-SIDE STORAGE

### localStorage
- **Giới hạn**: 5-10 MB
- **Kết luận**: ❌ **KHÔNG ĐỦ** (chỉ đủ cho ~10,000 câu hỏi)

### IndexedDB
- **Giới hạn lý thuyết**: Không giới hạn
- **Giới hạn thực tế**: 
  - Chrome: ~60% dung lượng ổ cứng còn trống (thường 10-50 GB)
  - Firefox: ~50% dung lượng ổ cứng còn trống
  - Safari: ~1 GB (giới hạn nghiêm ngặt)
- **Kết luận**: ⚠️ **CÓ THỂ** nhưng **KHÔNG ĐÁNG TIN CẬY**

### Vấn đề với IndexedDB:
1. **Giới hạn theo trình duyệt**: Mỗi user có giới hạn khác nhau
2. **File Audio**: IndexedDB không phù hợp cho file lớn
3. **Không chia sẻ**: Mỗi user phải tải toàn bộ dữ liệu
4. **Không tối ưu**: Tải 5GB mỗi lần mở app là không thực tế

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### **Kiến trúc Hybrid (Khuyến nghị)**

```
┌─────────────────────────────────────────┐
│         CLIENT (Browser)                │
│  - React App                            │
│  - Cache nhỏ (IndexedDB):               │
│    • User progress                      │
│    • Recent quizzes (10-20 bài)        │
│    • Offline mode (giới hạn)           │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/HTTPS
               │
               ▼
┌─────────────────────────────────────────┐
│         SERVER (Backend)                │
│  - REST API / GraphQL                   │
│  - Database: PostgreSQL/MySQL           │
│  - Lưu trữ:                            │
│    • Tất cả quiz (5M câu)              │
│    • Tất cả đề thi                      │
│    • Metadata                           │
└──────────────┬──────────────────────────┘
               │
               │
               ▼
┌─────────────────────────────────────────┐
│         CDN (Content Delivery)          │
│  - File Audio (600-900 files)           │
│  - Images                                │
│  - Static assets                        │
└─────────────────────────────────────────┘
```

### **Chiến lược lưu trữ:**

#### 1. **Server-Side Database** (Bắt buộc)
- **PostgreSQL/MySQL**: Lưu tất cả quiz, đề thi, metadata
- **Dung lượng**: Không giới hạn (có thể mở rộng)
- **Ưu điểm**: 
  - Chia sẻ dữ liệu giữa users
  - Backup tập trung
  - Quản lý dễ dàng

#### 2. **CDN cho File Audio** (Bắt buộc)
- **AWS S3 / Cloudflare R2 / Google Cloud Storage**
- **Dung lượng**: Không giới hạn
- **Ưu điểm**:
  - Tải nhanh (CDN cache)
  - Không tốn server bandwidth
  - Dễ scale

#### 3. **Client-Side Cache** (Tùy chọn)
- **IndexedDB**: Chỉ cache dữ liệu đã xem
- **Dung lượng**: 50-100 MB (10-20 bài gần đây)
- **Ưu điểm**:
  - Offline mode (giới hạn)
  - Tải nhanh cho bài đã xem

---

## 💰 ƯỚC TÍNH CHI PHÍ

### **Option 1: Self-hosted (Rẻ nhất)**
- **VPS**: $5-10/tháng (2-4 GB RAM, 50 GB storage)
- **Database**: PostgreSQL (miễn phí)
- **CDN**: Cloudflare (miễn phí tier)
- **Tổng**: **~$5-10/tháng**

### **Option 2: Cloud Services**
- **Database**: Supabase (miễn phí tier: 500 MB, $25/tháng: 8 GB)
- **Storage**: Supabase Storage (miễn phí tier: 1 GB, $25/tháng: 100 GB)
- **CDN**: Tích hợp sẵn
- **Tổng**: **Miễn phí** (nếu < 1 GB) hoặc **$25/tháng**

### **Option 3: AWS/Google Cloud**
- **Database**: RDS/Cloud SQL (~$20-50/tháng)
- **Storage**: S3/Cloud Storage (~$5-10/tháng cho 5 GB)
- **CDN**: CloudFront/Cloud CDN (~$5-10/tháng)
- **Tổng**: **~$30-70/tháng**

---

## 🎯 KHUYẾN NGHỊ

### **Cho dự án nhỏ/startup:**
1. **Supabase** (miễn phí tier)
   - Database: 500 MB (đủ cho ~100K câu hỏi)
   - Storage: 1 GB (đủ cho ~300 file audio)
   - CDN tích hợp
   - Dễ setup

### **Cho dự án lớn/production:**
1. **Self-hosted VPS** + **PostgreSQL**
   - Full control
   - Chi phí thấp
   - Cần tự quản lý

2. **AWS/Google Cloud**
   - Scalable
   - Reliable
   - Chi phí cao hơn

---

## 📝 TÓM TẮT

| Giải pháp | Dung lượng | Chi phí | Phù hợp |
|-----------|------------|---------|---------|
| **localStorage** | 5-10 MB | Miễn phí | ❌ Không đủ |
| **IndexedDB** | 10-50 GB | Miễn phí | ⚠️ Không đáng tin cậy |
| **Server DB** | Không giới hạn | $5-70/tháng | ✅ Khuyến nghị |
| **CDN** | Không giới hạn | $0-10/tháng | ✅ Bắt buộc (cho audio) |

### **Kết luận:**
- ❌ **localStorage/IndexedDB KHÔNG ĐỦ** cho quy mô này
- ✅ **BẮT BUỘC** cần Server-side Database
- ✅ **BẮT BUỘC** cần CDN cho file audio
- ✅ **Tùy chọn**: Client-side cache cho offline mode

---

**Tài liệu này phân tích dung lượng lưu trữ và đề xuất giải pháp cho quy mô dữ liệu lớn.**

