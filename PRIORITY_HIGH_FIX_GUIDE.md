# 🔒 Giải Quyết Ưu Tiên Cao - Hướng Dẫn Tổng Hợp

## 📋 Tổng Quan

Hướng dẫn này giải quyết 2 vấn đề ưu tiên cao từ ZAP scan:

1. **Strict-Transport-Security Header Not Set (10 instances)**
2. **Re-examine Cache-control Directives (9 instances)**

---

## ✅ Vấn Đề 1: Strict-Transport-Security Header Not Set

### Bước 1: Verify Header Hiện Tại

**Kiểm tra xem header đã có chưa:**

```bash
curl -I https://your-domain.vercel.app | grep -i "strict-transport"
```

**Kết quả:**
- ✅ **Có header:** `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - → Header đã được apply, có thể ZAP scan cache
  - → **Giải pháp:** Chạy lại ZAP scan sau vài phút

- ❌ **Không có header:**
  - → Header chưa được apply
  - → Tiếp tục Bước 2

### Bước 2: Kiểm Tra vercel.json

**Đảm bảo `vercel.json` có HSTS header:**

File `vercel.json` đã có header này (dòng 13-15):
```json
{
  "key": "Strict-Transport-Security",
  "value": "max-age=31536000; includeSubDomains; preload"
}
```

✅ **Nếu đã có:** Tiếp tục Bước 3

❌ **Nếu chưa có:** Thêm vào và commit

### Bước 3: Deploy và Verify

**3.1. Commit và Push (nếu chưa):**
```bash
git add vercel.json
git commit -m "🔒 Add HSTS header"
git push
```

**3.2. Kiểm Tra Vercel Deploy:**
1. Vào Vercel Dashboard → Deployments
2. Đảm bảo deployment mới nhất đã hoàn thành
3. Kiểm tra Build Logs không có lỗi

**3.3. Verify Sau Khi Deploy:**
```bash
# Đợi 1-2 phút sau khi deploy xong
curl -I https://your-domain.vercel.app | grep -i "strict-transport"
```

**Expected:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Bước 4: Giải Pháp Thay Thế (Nếu vercel.json Không Hoạt Động)

**Thêm qua Vercel Dashboard:**

1. Vào https://vercel.com → Project → **Settings** → **Headers**
2. Click **"Add Header"**
3. Điền:
   - **Source Path:** `/(.*)`
   - **Header Name:** `Strict-Transport-Security`
   - **Header Value:** `max-age=31536000; includeSubDomains; preload`
4. Click **Save**
5. Đợi 1-2 phút và verify lại

---

## ✅ Vấn Đề 2: Re-examine Cache-control Directives

### Bước 1: Truy Cập Vercel Dashboard

1. Vào https://vercel.com
2. Đăng nhập
3. Chọn **project** của bạn
4. Vào **Settings** → **Headers**

### Bước 2: Thêm Cache-Control cho Static Assets (JS, CSS, Fonts)

**Mục đích:** Cache 1 năm (vì có hash trong filename)

1. Click **"Add Header"**
2. Điền:
   - **Source Path:** `/assets/:path*`
     - Hoặc thử: `/*.(js|css|woff|woff2|ttf|eot)` (nếu Vercel hỗ trợ regex)
   - **Header Name:** `Cache-Control`
   - **Header Value:** `public, max-age=31536000, immutable`
3. Click **Save**

**Lưu ý:** Nếu pattern không hoạt động, thử pattern đơn giản hơn:
- `/assets/:path*` (không dùng regex)

### Bước 3: Thêm Cache-Control cho Images

**Mục đích:** Cache 1 ngày, có thể serve stale trong 1 tuần

1. Click **"Add Header"** (thêm mới)
2. Điền:
   - **Source Path:** `/*.(jpg|jpeg|png|gif|svg|webp|ico)`
     - Hoặc: `/images/:path*` (nếu images ở folder riêng)
   - **Header Name:** `Cache-Control`
   - **Header Value:** `public, max-age=86400, stale-while-revalidate=604800`
3. Click **Save**

### Bước 4: Thêm Cache-Control cho HTML

**Mục đích:** Không cache HTML để luôn có version mới nhất

1. Click **"Add Header"** (thêm mới)
2. Điền:
   - **Source Path:** `/`
     - Hoặc: `/*.html`
   - **Header Name:** `Cache-Control`
   - **Header Value:** `public, max-age=0, must-revalidate`
3. Click **Save**

### Bước 5: Verify Cache-Control Headers

**Sau khi thêm, kiểm tra:**

```bash
# Static assets
curl -I https://your-domain.vercel.app/assets/index-abc123.js
# Expected: Cache-Control: public, max-age=31536000, immutable

# Images
curl -I https://your-domain.vercel.app/logo/main.png
# Expected: Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# HTML
curl -I https://your-domain.vercel.app/
# Expected: Cache-Control: public, max-age=0, must-revalidate
```

**Hoặc dùng Browser DevTools:**
1. F12 → Network tab
2. Reload trang
3. Chọn từng loại file và xem Response Headers

---

## 📊 Checklist Hoàn Thành

### Vấn Đề 1: HSTS Header

- [ ] Đã verify header hiện tại bằng curl
- [ ] Đã kiểm tra `vercel.json` có HSTS header
- [ ] Đã commit và push code (nếu cần)
- [ ] Đã verify Vercel deployment thành công
- [ ] Đã verify header xuất hiện sau khi deploy
- [ ] Đã thêm qua Dashboard (nếu vercel.json không hoạt động)
- [ ] Đã re-run ZAP scan và verify không còn báo lỗi

### Vấn Đề 2: Cache-Control Headers

- [ ] Đã truy cập Vercel Dashboard → Settings → Headers
- [ ] Đã thêm Cache-Control cho static assets (`/assets/:path*`)
- [ ] Đã thêm Cache-Control cho images (`/*.(jpg|jpeg|png|gif|svg|webp|ico)`)
- [ ] Đã thêm Cache-Control cho HTML (`/`)
- [ ] Đã verify tất cả headers bằng curl hoặc DevTools
- [ ] Đã re-run ZAP scan và verify không còn báo lỗi

---

## 🧪 Test Sau Khi Fix

### Test 1: Verify Headers

```bash
# HSTS
curl -I https://your-domain.vercel.app | grep -i "strict-transport"

# Cache-Control - Static assets
curl -I https://your-domain.vercel.app/assets/index-abc123.js | grep -i "cache-control"

# Cache-Control - Images
curl -I https://your-domain.vercel.app/logo/main.png | grep -i "cache-control"

# Cache-Control - HTML
curl -I https://your-domain.vercel.app/ | grep -i "cache-control"
```

### Test 2: Online Tools

- [SecurityHeaders.com](https://securityheaders.com) - Kiểm tra HSTS
- [Mozilla Observatory](https://observatory.mozilla.org) - Scan tổng thể

### Test 3: Re-run ZAP Scan

Sau khi fix, chạy lại ZAP scan:
- ✅ **Strict-Transport-Security Header Not Set** → Should be **0 instances**
- ✅ **Re-examine Cache-control Directives** → Should be **0 instances**

---

## ⚠️ Troubleshooting

### Vấn Đề: Headers Không Xuất Hiện Sau Khi Thêm

**Nguyên nhân:**
- Vercel cache
- Pattern không match
- Headers bị override

**Giải pháp:**
1. Đợi 2-3 phút sau khi thêm headers
2. Thử pattern đơn giản hơn (không dùng regex)
3. Kiểm tra không có conflict với headers khác
4. Clear browser cache và test lại

### Vấn Đề: Pattern Không Hoạt Động

**Vercel có thể không hỗ trợ regex trong pattern.**

**Giải pháp:**
- Dùng pattern đơn giản: `/assets/:path*` thay vì `/*.(js|css)`
- Hoặc thêm nhiều headers cho từng loại file cụ thể

### Vấn Đề: ZAP Vẫn Báo Sau Khi Fix

**Nguyên nhân:**
- ZAP scan cache
- Scan chưa chạy lại sau khi deploy

**Giải pháp:**
- Đợi vài phút sau khi deploy/thêm headers
- Clear ZAP cache và scan lại
- Verify bằng curl trước khi scan

---

## 📚 Tài Liệu Tham Khảo

- [FIX_HSTS_HEADER.md](./FIX_HSTS_HEADER.md) - Chi tiết về HSTS
- [VERCEL_CACHE_CONTROL_SETUP.md](./VERCEL_CACHE_CONTROL_SETUP.md) - Chi tiết về Cache-Control
- [Vercel Headers Documentation](https://vercel.com/docs/concepts/projects/project-configuration#headers)
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [MDN HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành:

- ✅ **HSTS header** xuất hiện trong tất cả responses
- ✅ **Cache-Control headers** được apply đúng cho từng loại file
- ✅ **ZAP scan** không còn báo 2 vấn đề này
- ✅ **Security score** tăng đáng kể
- ✅ **Performance** tốt hơn nhờ cache tối ưu

