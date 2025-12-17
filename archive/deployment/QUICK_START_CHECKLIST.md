# ✅ CHECKLIST NHANH - ĐƯA WEB APP LÊN INTERNET

## 🎯 MỤC TIÊU

Checklist đơn giản để đưa web app lên internet **HOÀN TOÀN MIỄN PHÍ** trong **2-3 giờ**.

---

## 📋 CHECKLIST

### **BƯỚC 1: TẠO TÀI KHOẢN (30 phút)**

- [ ] **GitHub** - https://github.com/signup
  - Username: `_________________`
  - Email: `_________________`
  - ✅ Đã verify email

- [ ] **Vercel** - https://vercel.com/signup
  - Login bằng GitHub
  - ✅ Đã connect GitHub

- [ ] **Supabase** - https://supabase.com
  - Login bằng GitHub
  - ✅ Đã tạo account

- [ ] **Cloudflare** - https://dash.cloudflare.com/sign-up
  - Email: `_________________`
  - ✅ Đã verify email

**Thời gian: ~30 phút**

---

### **BƯỚC 2: UPLOAD CODE LÊN GITHUB (15 phút)**

- [ ] Tạo repository mới trên GitHub
  - Tên: `elearning-platform`
  - ✅ Đã tạo

- [ ] Upload code lên GitHub
  - Cách 1: Dùng GitHub Desktop (dễ nhất)
  - Cách 2: Dùng Git command line
  - ✅ Code đã lên GitHub

**Thời gian: ~15 phút**

---

### **BƯỚC 3: SETUP SUPABASE (30 phút)**

- [ ] Tạo project mới
  - Tên: `elearning-platform`
  - Password: `_________________` (LƯU LẠI!)
  - ✅ Đã tạo project

- [ ] Copy API Keys
  - Project URL: `_________________`
  - Anon Key: `_________________`
  - ✅ Đã copy

- [ ] Tạo database tables
  - Vào SQL Editor
  - Copy SQL từ hướng dẫn
  - ✅ Đã chạy SQL

**Thời gian: ~30 phút**

---

### **BƯỚC 4: SETUP CLOUDFLARE R2 (20 phút)**

- [ ] Tạo R2 bucket
  - Tên: `elearning-audio`
  - ✅ Đã tạo

- [ ] Setup CORS
  - Copy CORS config từ hướng dẫn
  - ✅ Đã setup

- [ ] Copy R2 credentials
  - Access Key ID: `_________________`
  - Secret Access Key: `_________________`
  - ✅ Đã copy

**Thời gian: ~20 phút**

---

### **BƯỚC 5: DEPLOY LÊN VERCEL (20 phút)**

- [ ] Connect GitHub với Vercel
  - Chọn repository `elearning-platform`
  - ✅ Đã connect

- [ ] Setup environment variables
  - `VITE_SUPABASE_URL`: `_________________`
  - `VITE_SUPABASE_ANON_KEY`: `_________________`
  - `VITE_CLOUDFLARE_R2_BUCKET`: `elearning-audio`
  - ✅ Đã setup

- [ ] Deploy
  - Click "Deploy"
  - ✅ Đã deploy thành công

- [ ] Test website
  - URL: `https://_________________.vercel.app`
  - ✅ Website đã hoạt động

**Thời gian: ~20 phút**

---

### **BƯỚC 6: UPDATE CODE (1-2 giờ)**

- [ ] Install Supabase client
  ```bash
  npm install @supabase/supabase-js
  ```
  - ✅ Đã install

- [ ] Tạo Supabase client
  - File: `src/utils/supabaseClient.js`
  - ✅ Đã tạo

- [ ] Update localStorageManager
  - Thay thế code để dùng Supabase
  - ✅ Đã update

- [ ] Test
  - Test tạo quiz mới
  - Test load quiz
  - ✅ Đã test thành công

**Thời gian: ~1-2 giờ**

---

### **BƯỚC 7: UPLOAD AUDIO FILES (Tùy số lượng)**

- [ ] Compress audio files (Tùy chọn)
  - Dùng ffmpeg
  - ✅ Đã compress

- [ ] Upload lên Cloudflare R2
  - Vào Cloudflare Dashboard
  - Upload files
  - ✅ Đã upload

- [ ] Update URLs trong database
  - Update exam audio URLs
  - ✅ Đã update

**Thời gian: Tùy số lượng file**

---

### **BƯỚC 8: OPTIONAL - DOMAIN RIÊNG**

- [ ] Mua domain (Nếu muốn)
  - Website: Namecheap/Google Domains
  - Domain: `_________________`
  - ✅ Đã mua

- [ ] Connect domain với Vercel
  - Vào Vercel Settings → Domains
  - Add domain
  - ✅ Đã connect

**Thời gian: ~30 phút + 24-48h chờ DNS**

---

## 📊 TỔNG KẾT

### **Thời gian ước tính:**
- **Bước 1-5**: ~2 giờ (setup cơ bản)
- **Bước 6**: ~1-2 giờ (update code)
- **Bước 7**: Tùy số lượng file
- **Bước 8**: ~30 phút (optional)

**Tổng: ~3-4 giờ** (không tính upload files)

### **Chi phí:**
- **Hoàn toàn miễn phí**: $0/tháng
- **Có domain riêng**: $12/năm (~$1/tháng)

### **Kết quả:**
✅ Website live tại: `https://yourproject.vercel.app`  
✅ Database: Supabase (500 MB miễn phí)  
✅ Storage: Cloudflare R2 (10 GB miễn phí)  
✅ CDN: Cloudflare (miễn phí)  
✅ SSL: Tự động (miễn phí)

---

## 🆘 CẦN GIÚP ĐỠ?

Nếu gặp vấn đề, xem:
- **Hướng dẫn chi tiết**: `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: Phần cuối của hướng dẫn
- **Tài liệu chính thức**: Links trong hướng dẫn

---

**Checklist này giúp bạn theo dõi tiến độ khi đưa web app lên internet!**

