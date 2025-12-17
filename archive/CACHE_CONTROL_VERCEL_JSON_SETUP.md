# 🚀 Cache-Control Headers trong vercel.json

## ✅ Đã Thêm Cache-Control Headers

Cache-Control headers đã được thêm trực tiếp vào `vercel.json` vì Vercel Dashboard không còn mục Headers.

---

## 📋 Cấu Hình Hiện Tại

### 1. HTML Files (`/(.*)`)
```json
"Cache-Control": "public, max-age=0, must-revalidate"
```
- **Mục đích:** Không cache HTML để luôn có version mới nhất
- **Áp dụng:** Tất cả routes (sẽ bị override bởi rules cụ thể hơn)

### 2. Static Assets (`/assets/:path*`)
```json
"Cache-Control": "public, max-age=31536000, immutable"
```
- **Mục đích:** Cache JS, CSS, fonts 1 năm (vì có hash trong filename)
- **Áp dụng:** Tất cả files trong `/assets/` folder

### 3. Images (Nhiều patterns)
```json
"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
```
- **Mục đích:** Cache images 1 ngày, có thể serve stale trong 1 tuần
- **Áp dụng:**
  - `/logo/:path*` - Logo images
  - `/flags/:path*` - Flag images
  - `/background/:path*` - Background images
  - `/quote/:path*` - Quote images
  - `/*.jpg`, `/*.jpeg`, `/*.png`, `/*.gif`, `/*.svg`, `/*.webp`, `/*.ico` - Tất cả images

---

## 🔄 Thứ Tự Áp Dụng

Vercel sẽ match headers theo thứ tự từ trên xuống. Rule cụ thể hơn sẽ override rule chung:

1. **Rule chung** (`/(.*)`) - Áp dụng cho tất cả, bao gồm HTML
2. **Rule cụ thể** (`/assets/:path*`) - Override cho static assets
3. **Rule cụ thể** (images) - Override cho images

---

## 🚀 Triển Khai

### Bước 1: Commit và Push
```bash
git add vercel.json
git commit -m "Add Cache-Control headers for static assets and images"
git push
```

### Bước 2: Vercel Tự Động Deploy
- Vercel sẽ tự động detect thay đổi trong `vercel.json`
- Deploy sẽ chạy tự động
- Đợi deploy hoàn thành (1-2 phút)

### Bước 3: Verify
Sau khi deploy xong, chạy:
```bash
npm run verify:cache -- https://glingo.vercel.app/
```

**Expected Results:**
- ✅ HTML (`/`): `Cache-Control: public, max-age=0, must-revalidate`
- ✅ Static assets (`/assets/*.js`): `Cache-Control: public, max-age=31536000, immutable`
- ✅ Images (`/logo/main.png`): `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

---

## ⚠️ Lưu Ý

### 1. Pattern Matching
- Vercel **không hỗ trợ regex** trong source pattern
- Phải dùng pattern đơn giản: `/:path*`, `/*.jpg`, etc.
- Nếu cần match nhiều extensions, phải thêm từng rule riêng

### 2. Thứ Tự Quan Trọng
- Rules cụ thể hơn phải đặt **sau** rules chung
- Rule `/(.*)` nên đặt đầu tiên (cho HTML và default)

### 3. Deploy
- Sau khi thay đổi `vercel.json`, cần **deploy lại** để áp dụng
- Headers sẽ được apply ở Edge Network level

---

## 🧪 Kiểm Tra Sau Deploy

### Cách 1: Dùng Script
```bash
npm run verify:cache -- https://glingo.vercel.app/
```

### Cách 2: Dùng curl
```bash
# HTML
curl -I https://glingo.vercel.app/ | grep -i cache-control

# Static asset
curl -I https://glingo.vercel.app/assets/index-*.js | grep -i cache-control

# Image
curl -I https://glingo.vercel.app/logo/main.png | grep -i cache-control
```

### Cách 3: Browser DevTools
1. Mở https://glingo.vercel.app/
2. F12 → Network tab
3. Reload page
4. Kiểm tra headers của từng file:
   - HTML → `Cache-Control: public, max-age=0, must-revalidate`
   - JS/CSS → `Cache-Control: public, max-age=31536000, immutable`
   - Images → `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

---

## 📊 Kết Quả Mong Đợi

Sau khi deploy:

| File Type | Cache-Control | Status |
|-----------|---------------|--------|
| HTML | `public, max-age=0, must-revalidate` | ✅ |
| JS/CSS | `public, max-age=31536000, immutable` | ✅ |
| Images | `public, max-age=86400, stale-while-revalidate=604800` | ✅ |

**ZAP Scan:**
- ✅ "Re-examine Cache-control Directives" → Fixed
- ✅ Performance tốt hơn nhờ cache tối ưu

---

## 🔧 Troubleshooting

### Vấn đề 1: Headers Không Được Apply

**Triệu chứng:** Verify script vẫn thấy Cache-Control cũ

**Giải pháp:**
1. Kiểm tra deploy đã hoàn thành chưa
2. Đợi 1-2 phút sau khi deploy
3. Clear browser cache hoặc dùng incognito mode
4. Verify bằng curl (không bị cache)

### Vấn đề 2: Pattern Không Match

**Triệu chứng:** Một số files không có Cache-Control đúng

**Giải pháp:**
1. Kiểm tra pattern trong `vercel.json` có đúng không
2. Thêm pattern cụ thể hơn cho folder/file đó
3. Verify lại sau khi deploy

### Vấn đề 3: Deploy Lỗi

**Triệu chứng:** Deploy fail với lỗi về `vercel.json`

**Giải pháp:**
1. Kiểm tra JSON syntax có đúng không
2. Kiểm tra pattern có hợp lệ không
3. Xem logs trong Vercel Dashboard

---

## 📚 Tài Liệu Tham Khảo

- [Vercel Headers Documentation](https://vercel.com/docs/projects/project-configuration/headers)
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [DEPLOY_SECURITY_FIXES.md](./DEPLOY_SECURITY_FIXES.md) - Hướng dẫn tổng hợp

