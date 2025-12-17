# 💰 GIẢI PHÁP MIỄN PHÍ CHO DỰ ÁN PHI LỢI NHUẬN

## 🎯 TỔNG QUAN

Tài liệu này liệt kê các giải pháp **HOÀN TOÀN MIỄN PHÍ** cho dự án eLearning của bạn.

---

## 🏆 GIẢI PHÁP TỐT NHẤT: Supabase (Khuyến nghị)

### ✅ Ưu điểm:
- **Hoàn toàn miễn phí** cho dự án nhỏ
- **Dễ setup** (5 phút)
- **Tự động xử lý**: Database + Storage + CDN + Authentication
- **Không cần backend code** (có thể dùng trực tiếp từ frontend)

### 📊 Giới hạn miễn phí:
- **Database**: 500 MB (đủ cho ~100K câu hỏi)
- **Storage**: 1 GB (đủ cho ~300 file audio)
- **Bandwidth**: 2 GB/tháng
- **API Requests**: 50,000/tháng

### 💡 Nếu vượt quá:
- **Database**: $25/tháng cho 8 GB
- **Storage**: $25/tháng cho 100 GB
- Hoặc dùng kết hợp với giải pháp khác

### 🔗 Link:
- Website: https://supabase.com
- Pricing: https://supabase.com/pricing

---

## 🥈 GIẢI PHÁP 2: Firebase (Google)

### ✅ Ưu điểm:
- **Hoàn toàn miễn phí** (Spark Plan)
- **Rất mạnh mẽ** (Google backend)
- **Tích hợp tốt** với React

### 📊 Giới hạn miễn phí:
- **Firestore Database**: 1 GB storage, 50K reads/20K writes/ngày
- **Storage**: 5 GB (đủ cho ~1,500 file audio)
- **Bandwidth**: 1 GB/ngày
- **Hosting**: 10 GB storage, 360 MB/ngày transfer

### ⚠️ Lưu ý:
- Giới hạn theo ngày (không phải tháng)
- Có thể bị charge nếu vượt quá

### 🔗 Link:
- Website: https://firebase.google.com
- Pricing: https://firebase.google.com/pricing

---

## 🥉 GIẢI PHÁP 3: Cloudflare (CDN + Storage)

### ✅ Ưu điểm:
- **Hoàn toàn miễn phí**
- **CDN siêu nhanh** (toàn cầu)
- **R2 Storage**: Không tính phí bandwidth (chỉ tính storage)

### 📊 Giới hạn miễn phí:
- **CDN**: Không giới hạn bandwidth
- **R2 Storage**: 10 GB miễn phí/tháng
- **Workers**: 100,000 requests/ngày

### 💡 Kết hợp:
- Dùng Cloudflare R2 cho file audio (10 GB miễn phí)
- Dùng Supabase cho database
- = **Hoàn toàn miễn phí!**

### 🔗 Link:
- Website: https://www.cloudflare.com
- R2: https://developers.cloudflare.com/r2/

---

## 🎁 GIẢI PHÁP 4: Railway (Self-hosted)

### ✅ Ưu điểm:
- **$5 credit/tháng** (đủ dùng miễn phí)
- **Tự host PostgreSQL**
- **Full control**

### 📊 Giới hạn:
- **$5 credit/tháng** (tự động reset)
- **PostgreSQL**: ~$5/tháng (dùng hết credit)
- **Storage**: 5 GB

### ⚠️ Lưu ý:
- Cần tự setup và quản lý
- Credit có thể hết nếu traffic cao

### 🔗 Link:
- Website: https://railway.app
- Pricing: https://railway.app/pricing

---

## 🎁 GIẢI PHÁP 5: Render (Self-hosted)

### ✅ Ưu điểm:
- **Tier miễn phí** cho PostgreSQL
- **Dễ setup**

### 📊 Giới hạn miễn phí:
- **PostgreSQL**: 90 ngày trial, sau đó $7/tháng
- **Web Service**: Miễn phí (sleep sau 15 phút không dùng)

### ⚠️ Lưu ý:
- Database chỉ miễn phí 90 ngày
- Web service sleep → chậm khi không dùng

### 🔗 Link:
- Website: https://render.com
- Pricing: https://render.com/pricing

---

## 🎁 GIẢI PHÁP 6: MongoDB Atlas

### ✅ Ưu điểm:
- **Tier miễn phí** (M0)
- **NoSQL database** (linh hoạt)

### 📊 Giới hạn miễn phí:
- **Storage**: 512 MB
- **RAM**: Shared
- **Bandwidth**: Không giới hạn

### ⚠️ Lưu ý:
- Chỉ 512 MB (không đủ cho 5M câu hỏi)
- Cần migrate từ SQL sang NoSQL

### 🔗 Link:
- Website: https://www.mongodb.com/cloud/atlas
- Pricing: https://www.mongodb.com/pricing

---

## 🎯 KHUYẾN NGHỊ CHO DỰ ÁN CỦA BẠN

### **Option 1: Supabase + Cloudflare R2 (Tốt nhất)**

**Kiến trúc:**
```
Frontend (Vercel/Netlify - Miễn phí)
  ↓
Supabase (Database - Miễn phí: 500 MB)
  ↓
Cloudflare R2 (File Audio - Miễn phí: 10 GB)
```

**Chi phí**: **$0/tháng**

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Dễ setup
- ✅ Scalable (có thể upgrade sau)
- ✅ CDN nhanh (Cloudflare)

**Nhược điểm:**
- ⚠️ Database chỉ 500 MB (đủ cho ~100K câu hỏi)
- ⚠️ Storage chỉ 10 GB (đủ cho ~3,000 file audio)

**Phù hợp**: Dự án nhỏ/trung bình

---

### **Option 2: Firebase (Google)**

**Kiến trúc:**
```
Frontend (Firebase Hosting - Miễn phí)
  ↓
Firestore (Database - Miễn phí: 1 GB)
  ↓
Firebase Storage (File Audio - Miễn phí: 5 GB)
```

**Chi phí**: **$0/tháng**

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Rất mạnh mẽ (Google)
- ✅ Tích hợp tốt với React

**Nhược điểm:**
- ⚠️ Giới hạn theo ngày (không phải tháng)
- ⚠️ Có thể bị charge nếu vượt quá

**Phù hợp**: Dự án nhỏ/trung bình

---

### **Option 3: Self-hosted VPS (Rẻ nhất)**

**Kiến trúc:**
```
Frontend (Vercel/Netlify - Miễn phí)
  ↓
VPS (Contabo/Hetzner - €4-5/tháng)
  ↓
PostgreSQL (Self-hosted)
  ↓
Cloudflare R2 (File Audio - Miễn phí: 10 GB)
```

**Chi phí**: **€4-5/tháng** (~$5/tháng)

**Ưu điểm:**
- ✅ Full control
- ✅ Không giới hạn database
- ✅ Rẻ nhất

**Nhược điểm:**
- ⚠️ Cần tự setup và quản lý
- ⚠️ Không hoàn toàn miễn phí

**Phù hợp**: Dự án lớn, có kinh nghiệm

---

## 💡 CHIẾN LƯỢC TỐI ƯU CHO DỰ ÁN PHI LỢI NHUẬN

### **Phase 1: Bắt đầu (Miễn phí hoàn toàn)**

1. **Supabase** cho database (500 MB miễn phí)
2. **Cloudflare R2** cho file audio (10 GB miễn phí)
3. **Vercel/Netlify** cho hosting frontend (miễn phí)

**Chi phí**: **$0/tháng**

### **Phase 2: Khi phát triển**

Nếu vượt quá giới hạn miễn phí:

1. **Xin tài trợ/sponsor** từ:
   - Google Cloud for Nonprofits
   - AWS for Nonprofits
   - Microsoft for Nonprofits
   - GitHub Education (nếu là học sinh/sinh viên)

2. **Hoặc upgrade**:
   - Supabase: $25/tháng (8 GB database + 100 GB storage)
   - Vẫn rất rẻ cho dự án phi lợi nhuận

### **Phase 3: Khi lớn mạnh**

1. **Self-hosted VPS**: €4-5/tháng
2. **Cloudflare R2**: Miễn phí (10 GB)
3. **Tổng**: ~$5/tháng

---

## 🎁 CÁC CHƯƠNG TRÌNH HỖ TRỢ DỰ ÁN PHI LỢI NHUẬN

### 1. **Google Cloud for Nonprofits**
- $3,000 credit/năm
- Link: https://www.google.com/nonprofits/

### 2. **AWS for Nonprofits**
- $2,000 credit/năm
- Link: https://aws.amazon.com/government-education/nonprofits/

### 3. **Microsoft for Nonprofits**
- $3,500 credit/năm
- Link: https://www.microsoft.com/nonprofits

### 4. **GitHub Education**
- GitHub Pro miễn phí
- Link: https://education.github.com/

---

## 📊 SO SÁNH CÁC GIẢI PHÁP

| Giải pháp | Database | Storage | CDN | Chi phí | Dễ setup |
|-----------|----------|---------|-----|---------|----------|
| **Supabase** | 500 MB | 1 GB | ✅ | $0 | ⭐⭐⭐⭐⭐ |
| **Firebase** | 1 GB | 5 GB | ✅ | $0 | ⭐⭐⭐⭐ |
| **Cloudflare R2** | - | 10 GB | ✅ | $0 | ⭐⭐⭐ |
| **Railway** | $5 credit | 5 GB | ❌ | $0* | ⭐⭐⭐ |
| **Render** | 90 ngày | - | ❌ | $0* | ⭐⭐⭐ |
| **VPS** | Unlimited | Unlimited | ❌ | $5/tháng | ⭐⭐ |

*Có giới hạn hoặc trial

---

## 🎯 KẾT LUẬN

### **Cho dự án phi lợi nhuận, khuyến nghị:**

1. **Bắt đầu**: Supabase + Cloudflare R2 = **$0/tháng**
2. **Khi phát triển**: Xin tài trợ từ Google/AWS/Microsoft
3. **Khi lớn mạnh**: Self-hosted VPS = **$5/tháng**

### **Tất cả đều có thể bắt đầu MIỄN PHÍ!**

---

**Tài liệu này liệt kê các giải pháp miễn phí cho dự án phi lợi nhuận của bạn.**

