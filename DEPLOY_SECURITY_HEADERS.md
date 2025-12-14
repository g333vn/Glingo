# 🚀 Deploy Security Headers - Hướng Dẫn Triển Khai

## 📋 Tổng Quan

Hướng dẫn này giúp bạn triển khai và verify các security headers đã được cấu hình.

---

## ✅ Bước 1: Verify Cấu Hình Hiện Tại

### 1.1. Kiểm Tra vercel.json

File `vercel.json` đã có các headers sau:
- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Content-Security-Policy
- ✅ Referrer-Policy

**Verify:**
```bash
cat vercel.json | grep -A 5 "headers"
```

### 1.2. Commit và Push (Nếu Chưa)

```bash
# Kiểm tra status
git status

# Nếu có thay đổi chưa commit
git add vercel.json
git commit -m "🔒 Add security headers: HSTS, CSP, X-Frame-Options, etc."
git push
```

---

## ✅ Bước 2: Deploy Lên Vercel

### 2.1. Auto Deploy (Tự Động)

Nếu đã connect GitHub với Vercel:
- ✅ Vercel sẽ tự động deploy khi bạn push code
- ✅ Kiểm tra Vercel Dashboard → Deployments
- ✅ Đợi deployment hoàn thành (2-3 phút)

### 2.2. Manual Deploy (Nếu Cần)

```bash
# Install Vercel CLI (nếu chưa có)
npm i -g vercel

# Deploy
vercel --prod
```

---

## ✅ Bước 3: Verify Headers Sau Khi Deploy

### 3.1. Sử Dụng Script (Khuyến Nghị)

```bash
# Verify tất cả security headers
node scripts/verify-headers.js https://your-domain.vercel.app

# Verify Cache-Control headers
node scripts/verify-cache-control.js https://your-domain.vercel.app
```

### 3.2. Sử Dụng curl

```bash
# Verify HSTS
curl -I https://your-domain.vercel.app | grep -i "strict-transport"

# Verify tất cả headers
curl -I https://your-domain.vercel.app
```

**Expected Output:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

### 3.3. Sử Dụng Browser DevTools

1. Mở site: `https://your-domain.vercel.app`
2. Nhấn **F12** → Tab **Network**
3. Reload trang (F5)
4. Chọn request đầu tiên (HTML)
5. Xem **Response Headers**

---

## ✅ Bước 4: Thêm Cache-Control Headers (Qua Vercel Dashboard)

**Lưu ý:** Cache-Control headers không thể thêm vào `vercel.json` (gây lỗi deploy).

### 4.1. Truy Cập Vercel Dashboard

1. Vào https://vercel.com
2. Đăng nhập
3. Chọn **project** của bạn
4. Vào **Settings** → **Headers**

### 4.2. Thêm 3 Headers

**Header 1: Static Assets**
- **Source Path:** `/assets/:path*`
- **Header Name:** `Cache-Control`
- **Header Value:** `public, max-age=31536000, immutable`

**Header 2: Images**
- **Source Path:** `/*.(jpg|jpeg|png|gif|svg|webp|ico)`
- **Header Name:** `Cache-Control`
- **Header Value:** `public, max-age=86400, stale-while-revalidate=604800`

**Header 3: HTML**
- **Source Path:** `/`
- **Header Name:** `Cache-Control`
- **Header Value:** `public, max-age=0, must-revalidate`

### 4.3. Verify Cache-Control

```bash
# HTML
curl -I https://your-domain.vercel.app/ | grep cache-control

# Static assets (thay bằng file thực tế)
curl -I https://your-domain.vercel.app/assets/index-abc123.js | grep cache-control

# Images (thay bằng file thực tế)
curl -I https://your-domain.vercel.app/logo/main.png | grep cache-control
```

---

## ✅ Bước 5: Fix HSTS Nếu Chưa Có

### 5.1. Kiểm Tra

```bash
curl -I https://your-domain.vercel.app | grep -i "strict-transport"
```

### 5.2. Nếu Không Có Header

**Option A: Thêm Qua Vercel Dashboard**
1. Vercel Dashboard → Settings → Headers
2. Add Header:
   - **Source Path:** `/(.*)`
   - **Header Name:** `Strict-Transport-Security`
   - **Header Value:** `max-age=31536000; includeSubDomains; preload`
3. Save

**Option B: Redeploy**
- Đảm bảo `vercel.json` có HSTS header
- Commit và push lại
- Đợi deployment hoàn thành

---

## 🧪 Bước 6: Final Verification

### 6.1. Chạy Scripts

```bash
# Verify tất cả headers
node scripts/verify-headers.js https://your-domain.vercel.app

# Verify Cache-Control
node scripts/verify-cache-control.js https://your-domain.vercel.app
```

### 6.2. Online Tools

- [SecurityHeaders.com](https://securityheaders.com)
  - Nhập URL của bạn
  - Kiểm tra score và headers

- [Mozilla Observatory](https://observatory.mozilla.org)
  - Scan tổng thể bảo mật
  - Xem chi tiết từng header

### 6.3. Re-run ZAP Scan

Sau khi deploy và verify:
1. Chạy lại ZAP scan
2. Kiểm tra kết quả:
   - ✅ Strict-Transport-Security Header Not Set: **0 instances**
   - ✅ Re-examine Cache-control Directives: **0 instances**

---

## 📊 Checklist Hoàn Thành

- [ ] ✅ `vercel.json` đã có tất cả security headers
- [ ] ✅ Code đã được commit và push
- [ ] ✅ Vercel deployment đã hoàn thành
- [ ] ✅ HSTS header đã xuất hiện (verify bằng curl)
- [ ] ✅ Tất cả security headers đã xuất hiện
- [ ] ✅ Cache-Control headers đã thêm qua Dashboard
- [ ] ✅ Cache-Control headers đã verify
- [ ] ✅ SecurityHeaders.com score đã tăng
- [ ] ✅ ZAP scan không còn báo 2 vấn đề ưu tiên cao

---

## ⚠️ Troubleshooting

### Headers Không Xuất Hiện

**Nguyên nhân:**
- Deployment chưa hoàn thành
- Vercel cache
- Headers chưa được apply

**Giải pháp:**
1. Đợi 2-3 phút sau khi deploy
2. Clear browser cache
3. Thử incognito mode
4. Verify bằng curl (không bị cache)

### Scripts Không Chạy

**Nguyên nhân:**
- Node.js chưa cài
- Scripts chưa có quyền execute

**Giải pháp:**
```bash
# Cài Node.js (nếu chưa có)
# Windows: Download từ nodejs.org
# Mac: brew install node
# Linux: sudo apt install nodejs

# Chạy script
node scripts/verify-headers.js https://your-domain.vercel.app
```

---

## 📚 Tài Liệu Tham Khảo

- [PRIORITY_HIGH_FIX_GUIDE.md](./PRIORITY_HIGH_FIX_GUIDE.md) - Hướng dẫn chi tiết
- [QUICK_FIX_CHECKLIST.md](./QUICK_FIX_CHECKLIST.md) - Checklist nhanh
- [VERCEL_CACHE_CONTROL_SETUP.md](./VERCEL_CACHE_CONTROL_SETUP.md) - Cache-Control setup
- [FIX_HSTS_HEADER.md](./FIX_HSTS_HEADER.md) - HSTS fix guide

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành:

- ✅ **Tất cả security headers** đã được deploy và verify
- ✅ **HSTS header** xuất hiện trong mọi response
- ✅ **Cache-Control headers** được apply đúng cho từng loại file
- ✅ **ZAP scan** không còn báo 2 vấn đề ưu tiên cao
- ✅ **Security score** tăng đáng kể
- ✅ **Performance** tốt hơn nhờ cache tối ưu

