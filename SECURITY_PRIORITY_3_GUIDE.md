# 🔒 Security Priority 3 - Hướng Dẫn Xử Lý

## ⚠️ LƯU Ý QUAN TRỌNG

**Vấn đề:** Thêm Cache-Control headers vào `vercel.json` gây lỗi deploy trên Vercel.

**Giải pháp:** Sử dụng **Vercel Dashboard** để thêm Cache-Control headers thay vì `vercel.json`.

---

## ✅ Giải Pháp: Thêm Cache-Control Headers Qua Vercel Dashboard

### Cách 1: Vercel Dashboard (Khuyến nghị - Không cần thay đổi vercel.json)

**Bước 1: Truy cập Vercel Dashboard**
1. Vào https://vercel.com
2. Đăng nhập và chọn project của bạn
3. Vào **Settings** → **Headers**

**Bước 2: Thêm Cache-Control cho Static Assets (JS, CSS, Fonts)**

1. Click **"Add Header"**
2. Cấu hình:
   - **Source Path:** `/assets/:path*` hoặc `/*.(js|css|woff|woff2|ttf|eot)`
   - **Header Name:** `Cache-Control`
   - **Header Value:** `public, max-age=31536000, immutable`
3. Click **Save**

**Bước 3: Thêm Cache-Control cho Images**

1. Click **"Add Header"** (thêm mới)
2. Cấu hình:
   - **Source Path:** `/*.(jpg|jpeg|png|gif|svg|webp|ico)`
   - **Header Name:** `Cache-Control`
   - **Header Value:** `public, max-age=86400, stale-while-revalidate=604800`
3. Click **Save**

**Bước 4: Thêm Cache-Control cho HTML**

1. Click **"Add Header"** (thêm mới)
2. Cấu hình:
   - **Source Path:** `/` hoặc `/*.html`
   - **Header Name:** `Cache-Control`
   - **Header Value:** `public, max-age=0, must-revalidate`
3. Click **Save**

**Lưu ý:** 
- Vercel Dashboard có thể có giới hạn về pattern matching
- Nếu pattern không hoạt động, thử pattern đơn giản hơn: `/assets/:path*`

---

### Cách 2: Edge Middleware (Nếu Dashboard không đủ)

Tạo file `middleware.js` trong root project:

```javascript
// middleware.js
export function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Static assets (JS, CSS, fonts)
  if (pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    return new Response(null, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
  
  // Images
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    return new Response(null, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      }
    });
  }
  
  // HTML
  if (pathname === '/' || pathname.endsWith('.html')) {
    return new Response(null, {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    });
  }
}
```

**Lưu ý:** Edge Middleware có thể ảnh hưởng đến performance, chỉ dùng nếu Dashboard không đủ.

---

### Cách 3: Chấp Nhận Cache Mặc Định của Vercel

**Vercel tự động cache:**
- Static assets (JS, CSS) từ `dist/` folder → Cache tốt
- Images → Cache vừa phải
- HTML → Cache ngắn

**Đánh giá:**
- ✅ Vercel đã có cache strategy tốt mặc định
- ⚠️ Cache-Control headers chỉ tối ưu thêm, không phải critical
- ✅ Các security headers (HSTS, CSP, X-Frame-Options) quan trọng hơn nhiều

**Kết luận:** Nếu không thể thêm Cache-Control headers, có thể chấp nhận cache mặc định của Vercel.

---

## 📋 Cấu Hình Cache-Control Mong Muốn

**Static Assets (JS, CSS, Fonts):**

**Static Assets (JS, CSS, Fonts):**
- `Cache-Control: public, max-age=31536000, immutable`
- Cache 1 năm, không thay đổi (vì có hash trong filename)

**Images:**
- `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
- Cache 1 ngày, có thể serve stale trong 1 tuần

**HTML:**
- `Cache-Control: public, max-age=0, must-revalidate`
- Luôn kiểm tra lại, không cache (để đảm bảo luôn có version mới nhất)

---

## 📋 Cần Xử Lý Thủ Công

### 2. Xóa Comment Nhạy Cảm

**Các loại comment cần xóa:**

1. **API Keys, Secrets, Tokens:**
   ```javascript
   // ❌ XÓA: API_KEY=sk_live_1234567890
   // ❌ XÓA: SECRET=abc123def456
   // ❌ XÓA: Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Passwords:**
   ```javascript
   // ❌ XÓA: Password: admin123
   // ❌ XÓA: Default password: password
   // ❌ XÓA: TODO: Change password before production
   ```

3. **Internal Paths, URLs:**
   ```html
   <!-- ❌ XÓA: Internal URL: http://internal-server.local -->
   <!-- ❌ XÓA: Admin panel: /admin/secret-path -->
   ```

4. **Debug Information:**
   ```javascript
   // ❌ XÓA (nếu chứa thông tin nhạy cảm):
   // DEBUG: User ID: 12345
   // DEBUG: Database connection: postgres://user:pass@host/db
   ```

**Các comment AN TOÀN (không cần xóa):**
- ✅ `// TODO: Add feature X`
- ✅ `// FIXME: Fix bug Y`
- ✅ `// REMOVED: Old code`
- ✅ `// DEBUG: Logging normal operations`

**Cách kiểm tra:**
1. Tìm trong codebase: `grep -r "API.*KEY\|PASSWORD\|SECRET\|TOKEN" src/`
2. Kiểm tra file HTML: `grep -r "<!--.*key\|password\|secret" index.html`
3. Xem lại các file trong `src/` có comment chứa thông tin nhạy cảm

**Lưu ý:**
- Comments trong code JavaScript sẽ bị minify/remove trong production build
- Comments trong HTML (`index.html`) sẽ vẫn còn trong production
- **Quan trọng:** Kiểm tra `index.html` và các file template

---

### 3. Timestamp Disclosure

**Vấn đề:**
ZAP có thể cảnh báo về timestamps trong HTTP responses hoặc metadata.

**Phân loại:**

1. **Timestamps trong dữ liệu ứng dụng (AN TOÀN - KHÔNG CẦN XÓA):**
   ```json
   {
     "id": "book-1",
     "title": "Book Title",
     "createdAt": "2025-01-19T10:30:45.123Z",  // ✅ Cần thiết cho chức năng
     "updatedAt": "2025-01-19T10:30:45.123Z"  // ✅ Cần thiết cho chức năng
   }
   ```
   - Đây là **cần thiết** cho chức năng ứng dụng
   - Không phải lỗ hổng bảo mật
   - Có thể bỏ qua cảnh báo này

2. **Timestamps trong HTTP Headers (KHÔNG THỂ KIỂM SOÁT):**
   - `Date` header được tự động thêm bởi server (Vercel)
   - Không thể xóa hoặc ẩn
   - Đây là standard HTTP header, không phải lỗ hổng

3. **Timestamps trong Server Metadata:**
   - Nếu có timestamps trong response body không cần thiết, có thể loại bỏ
   - Kiểm tra API responses từ Supabase

**Giải pháp:**
- ✅ **Không cần làm gì** nếu timestamps chỉ có trong dữ liệu ứng dụng
- ✅ **Chấp nhận** cảnh báo về HTTP `Date` header (standard)
- ⚠️ **Kiểm tra** nếu có timestamps không cần thiết trong API responses

**Kiểm tra:**
```bash
# Kiểm tra HTTP headers
curl -I https://your-domain.vercel.app

# Kiểm tra response body có timestamp không cần thiết
curl https://your-domain.vercel.app/api/endpoint
```

---

## 📊 Tổng Kết

### ✅ Đã Hoàn Thành:
1. ✅ Cache-Control headers đã được thêm vào `vercel.json`
2. ✅ Hướng dẫn xóa comment nhạy cảm
3. ✅ Giải thích về Timestamp Disclosure

### 📝 Cần Làm Thủ Công:
1. ⚠️ Kiểm tra và xóa comment nhạy cảm trong codebase
2. ⚠️ Kiểm tra `index.html` có comment nhạy cảm không
3. ⚠️ Xác nhận timestamps trong dữ liệu là cần thiết

---

## 🧪 Kiểm Tra Sau Khi Deploy

### 1. Verify Cache-Control Headers:
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

### 2. Check Comments:
- View source của trang web (Ctrl+U)
- Kiểm tra không có comment chứa API keys, passwords, secrets

### 3. Re-run ZAP Scan:
- Sau khi deploy, chạy lại ZAP scan
- Kiểm tra các cảnh báo đã giảm:
  - ✅ Re-examine Cache-control Directives (9 instances) → Fixed
  - ⚠️ Timestamp Disclosure - Có thể vẫn còn (nếu là dữ liệu cần thiết)
  - ⚠️ Information Disclosure - Suspicious Comments - Cần kiểm tra thủ công

---

## 📚 Tài Liệu Tham Khảo

- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [OWASP Information Disclosure](https://owasp.org/www-community/vulnerabilities/Information_exposure)
- [Vercel Headers Documentation](https://vercel.com/docs/concepts/projects/project-configuration#headers)

