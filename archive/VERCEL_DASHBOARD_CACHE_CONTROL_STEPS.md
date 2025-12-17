# 🚀 Triển Khai Cache-Control Headers - Hướng Dẫn Từng Bước

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn thêm Cache-Control headers qua Vercel Dashboard trong **10 phút**.

---

## ✅ Bước 1: Truy Cập Vercel Dashboard

1. Mở trình duyệt
2. Vào: **https://vercel.com**
3. **Đăng nhập** vào tài khoản
4. Chọn **project** của bạn (ví dụ: `glingo` hoặc tên project của bạn)
5. Vào tab **Settings** (góc trên bên phải, bên cạnh "Deployments")

---

## ✅ Bước 2: Vào Phần Headers

1. Trong **Settings**, scroll xuống
2. Tìm phần **"Headers"** (trong menu bên trái hoặc scroll xuống)
3. Click vào **"Headers"**

---

## ✅ Bước 3: Thêm Header 1 - Static Assets (JS, CSS, Fonts)

**Mục đích:** Cache static assets 1 năm (vì có hash trong filename)

1. Click nút **"Add Header"** hoặc **"Add"** (góc trên bên phải)
2. Điền thông tin:

   **Source Path (Pattern):**
   ```
   /assets/:path*
   ```
   *Lưu ý: Nếu pattern này không hoạt động, thử: `/assets/*`*

   **Header Name:**
   ```
   Cache-Control
   ```

   **Header Value:**
   ```
   public, max-age=31536000, immutable
   ```

3. Click **"Save"** hoặc **"Add Header"**

**Kết quả:** Tất cả files trong `/assets/` sẽ được cache 1 năm.

---

## ✅ Bước 4: Thêm Header 2 - Images

**Mục đích:** Cache images 1 ngày, có thể serve stale trong 1 tuần

1. Click **"Add Header"** (thêm mới, không sửa header cũ)
2. Điền thông tin:

   **Source Path (Pattern):**
   ```
   /*.(jpg|jpeg|png|gif|svg|webp|ico)
   ```
   *Lưu ý: Nếu Vercel không hỗ trợ regex, thử: `/logo/:path*` hoặc `/images/:path*`*

   **Header Name:**
   ```
   Cache-Control
   ```

   **Header Value:**
   ```
   public, max-age=86400, stale-while-revalidate=604800
   ```

3. Click **"Save"**

**Kết quả:** Tất cả images sẽ được cache 1 ngày.

---

## ✅ Bước 5: Verify Header HTML (Đã Có)

Header cho HTML (`/`) đã có sẵn với giá trị:
```
Cache-Control: public, max-age=0, must-revalidate
```

**Không cần thêm lại** nếu đã có.

---

## ✅ Bước 6: Verify Sau Khi Thêm

**Đợi 1-2 phút** sau khi thêm headers để Vercel apply.

### Cách 1: Sử dụng Script

```bash
npm run verify:cache -- https://glingo.vercel.app/
```

### Cách 2: Sử dụng curl

```bash
# Static assets (thay index-abc123.js bằng file thực tế từ site)
curl -I https://glingo.vercel.app/assets/index-abc123.js | grep cache-control

# Images
curl -I https://glingo.vercel.app/logo/main.png | grep cache-control

# HTML (đã có)
curl -I https://glingo.vercel.app/ | grep cache-control
```

**Expected Results:**

- **Static assets:** `Cache-Control: public, max-age=31536000, immutable`
- **Images:** `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
- **HTML:** `Cache-Control: public, max-age=0, must-revalidate`

---

## ⚠️ Troubleshooting

### Vấn đề 1: Pattern Không Hoạt Động

**Triệu chứng:** Headers không được apply cho files

**Giải pháp:**
- Thử pattern đơn giản hơn: `/assets/:path*` thay vì regex
- Hoặc thêm nhiều headers cho từng loại file cụ thể:
  - `/assets/*.js` → `public, max-age=31536000, immutable`
  - `/assets/*.css` → `public, max-age=31536000, immutable`
  - `/assets/*.woff` → `public, max-age=31536000, immutable`

### Vấn đề 2: Headers Không Xuất Hiện

**Triệu chứng:** Verify không thấy headers mới

**Giải pháp:**
1. Đợi 2-3 phút sau khi thêm
2. Clear browser cache
3. Thử incognito mode
4. Verify bằng curl (không bị cache)

### Vấn đề 3: Vercel Dashboard Không Có Option Headers

**Triệu chứng:** Không thấy phần Headers trong Settings

**Giải pháp:**
- Kiểm tra bạn đang ở đúng project
- Kiểm tra plan của bạn (một số tính năng chỉ có ở Pro plan)
- Thử refresh trang

---

## 📊 Checklist Hoàn Thành

- [ ] ✅ Đã truy cập Vercel Dashboard → Settings → Headers
- [ ] ✅ Đã thêm Cache-Control cho static assets (`/assets/:path*`)
- [ ] ✅ Đã thêm Cache-Control cho images (`/*.(jpg|jpeg|png|gif|svg|webp|ico)`)
- [ ] ✅ Đã verify HTML header (đã có sẵn)
- [ ] ✅ Đã đợi 1-2 phút để headers được apply
- [ ] ✅ Đã verify bằng script hoặc curl
- [ ] ✅ Tất cả headers đều đúng giá trị

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành:

- ✅ **Static assets** (JS, CSS, fonts): Cache 1 năm
- ✅ **Images**: Cache 1 ngày với stale-while-revalidate
- ✅ **HTML**: Không cache (luôn fresh)
- ✅ **ZAP scan**: Không còn báo "Re-examine Cache-control Directives"
- ✅ **Performance**: Tốt hơn nhờ cache tối ưu

---

## 📚 Tài Liệu Tham Khảo

- [VERCEL_CACHE_CONTROL_SETUP.md](./VERCEL_CACHE_CONTROL_SETUP.md) - Chi tiết kỹ thuật
- [PRIORITY_HIGH_FIX_GUIDE.md](./PRIORITY_HIGH_FIX_GUIDE.md) - Hướng dẫn tổng hợp
- [Vercel Headers Documentation](https://vercel.com/docs/concepts/projects/project-configuration#headers)

