# 🔧 Hướng Dẫn Thêm Cache-Control Headers Qua Vercel Dashboard

## ⚠️ Vấn Đề

Thêm Cache-Control headers vào `vercel.json` gây lỗi deploy trên Vercel.

**Giải pháp:** Sử dụng **Vercel Dashboard** thay vì `vercel.json`.

---

## 📋 Hướng Dẫn Chi Tiết

### Bước 1: Truy Cập Vercel Dashboard

1. Vào https://vercel.com
2. Đăng nhập vào tài khoản
3. Chọn **project** của bạn
4. Vào tab **Settings** (góc trên bên phải)
5. Scroll xuống phần **Headers**

---

### Bước 2: Thêm Cache-Control cho Static Assets (JS, CSS, Fonts)

**Mục đích:** Cache JS, CSS, fonts trong 1 năm (vì có hash trong filename)

1. Click nút **"Add Header"** hoặc **"Add"**
2. Điền thông tin:
   - **Source Path (Pattern):** 
     ```
     /assets/:path*
     ```
     Hoặc thử:
     ```
     /*.(js|css|woff|woff2|ttf|eot)
     ```
   - **Header Name:** 
     ```
     Cache-Control
     ```
   - **Header Value:** 
     ```
     public, max-age=31536000, immutable
     ```
3. Click **Save** hoặc **Add Header**

**Giải thích:**
- `public`: Cho phép cache bởi CDN và browser
- `max-age=31536000`: Cache 1 năm (31536000 giây)
- `immutable`: File không thay đổi (vì có hash trong filename)

---

### Bước 3: Thêm Cache-Control cho Images

**Mục đích:** Cache images trong 1 ngày, có thể serve stale trong 1 tuần

1. Click **"Add Header"** (thêm mới, không sửa header cũ)
2. Điền thông tin:
   - **Source Path (Pattern):** 
     ```
     /*.(jpg|jpeg|png|gif|svg|webp|ico)
     ```
     Hoặc thử:
     ```
     /images/:path*
     ```
   - **Header Name:** 
     ```
     Cache-Control
     ```
   - **Header Value:** 
     ```
     public, max-age=86400, stale-while-revalidate=604800
     ```
3. Click **Save**

**Giải thích:**
- `max-age=86400`: Cache 1 ngày (86400 giây)
- `stale-while-revalidate=604800`: Có thể serve cached version trong khi revalidate (7 ngày)

---

### Bước 4: Thêm Cache-Control cho HTML

**Mục đích:** Không cache HTML để luôn có version mới nhất

1. Click **"Add Header"** (thêm mới)
2. Điền thông tin:
   - **Source Path (Pattern):** 
     ```
     /
     ```
     Hoặc:
     ```
     /*.html
     ```
   - **Header Name:** 
     ```
     Cache-Control
     ```
   - **Header Value:** 
     ```
     public, max-age=0, must-revalidate
     ```
3. Click **Save**

**Giải thích:**
- `max-age=0`: Không cache
- `must-revalidate`: Luôn kiểm tra lại với server

---

## 🔍 Kiểm Tra Sau Khi Thêm

### Cách 1: Browser DevTools

1. Mở site trên Vercel
2. Nhấn **F12** → Tab **Network**
3. Reload trang (F5)
4. Chọn một file:
   - **JS/CSS file** → Xem Response Headers → `Cache-Control: public, max-age=31536000, immutable`
   - **Image** → Xem Response Headers → `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
   - **HTML** → Xem Response Headers → `Cache-Control: public, max-age=0, must-revalidate`

### Cách 2: Command Line

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

---

## ⚠️ Troubleshooting

### Vấn đề 1: Pattern không hoạt động

**Triệu chứng:** Headers không được apply

**Giải pháp:**
- Thử pattern đơn giản hơn: `/assets/:path*` thay vì regex
- Kiểm tra Vercel documentation về pattern syntax
- Thử từng pattern một, không thêm tất cả cùng lúc

### Vấn đề 2: Headers bị override

**Triệu chứng:** Headers không hiển thị đúng

**Giải pháp:**
- Kiểm tra thứ tự headers trong Dashboard (headers sau có thể override headers trước)
- Đảm bảo không có conflict với headers từ `vercel.json`

### Vấn đề 3: Vercel Dashboard không có option Headers

**Triệu chép:** Không thấy phần Headers trong Settings

**Giải pháp:**
- Kiểm tra bạn đang ở đúng project
- Kiểm tra plan của bạn (một số tính năng chỉ có ở Pro plan)
- Thử dùng Edge Middleware (xem cách 2 ở file SECURITY_PRIORITY_3_GUIDE.md)

---

## 📊 Tổng Kết

### Headers Cần Thêm:

| Loại File | Pattern | Header Value |
|-----------|---------|--------------|
| Static Assets | `/assets/:path*` | `public, max-age=31536000, immutable` |
| Images | `/*.(jpg|jpeg|png|gif|svg|webp|ico)` | `public, max-age=86400, stale-while-revalidate=604800` |
| HTML | `/` | `public, max-age=0, must-revalidate` |

### Lưu Ý:

- ✅ Thêm headers qua Dashboard **KHÔNG ảnh hưởng** đến `vercel.json`
- ✅ Có thể thêm/xóa/sửa headers bất cứ lúc nào
- ✅ Không cần redeploy sau khi thêm headers
- ⚠️ Headers sẽ apply cho **tất cả deployments** (production + preview)

---

## 🎯 Kết Quả Mong Đợi

Sau khi thêm Cache-Control headers qua Dashboard:

- ✅ ZAP scan sẽ không còn báo: **Re-examine Cache-control Directives (9 instances)**
- ✅ Performance tốt hơn (browser cache hiệu quả hơn)
- ✅ Giảm bandwidth (ít requests đến server)

---

## 📚 Tài Liệu Tham Khảo

- [Vercel Headers Documentation](https://vercel.com/docs/concepts/projects/project-configuration#headers)
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Web.dev Caching Best Practices](https://web.dev/http-cache/)

