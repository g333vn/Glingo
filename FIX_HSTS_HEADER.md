# 🔒 Fix Strict-Transport-Security Header Not Set

## ⚠️ Vấn Đề

ZAP scan báo: **Strict-Transport-Security Header Not Set (10 instances)**

Mặc dù đã thêm vào `vercel.json`, header vẫn chưa được apply.

---

## 🔍 Bước 1: Verify Header Hiện Tại

### Cách 1: Command Line

```bash
curl -I https://your-domain.vercel.app
```

**Kết quả mong đợi:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Nếu không có header:**
- Headers chưa được deploy
- Hoặc có vấn đề với cấu hình

### Cách 2: Browser DevTools

1. Mở site trên Vercel
2. Nhấn **F12** → Tab **Network**
3. Reload trang (F5)
4. Chọn request đầu tiên (HTML)
5. Xem **Response Headers**
6. Tìm `Strict-Transport-Security`

### Cách 3: Online Tools

- [SecurityHeaders.com](https://securityheaders.com) - Nhập URL của bạn
- [Mozilla Observatory](https://observatory.mozilla.org) - Scan bảo mật

---

## ✅ Bước 2: Kiểm Tra vercel.json

Đảm bảo file `vercel.json` có HSTS header:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## 🔧 Bước 3: Giải Pháp

### Giải Pháp 1: Redeploy (Nếu Header Chưa Có)

1. **Kiểm tra code đã commit:**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Commit và push (nếu chưa):**
   ```bash
   git add vercel.json
   git commit -m "🔒 Add HSTS header"
   git push
   ```

3. **Kiểm tra Vercel Deploy:**
   - Vào Vercel Dashboard
   - Xem Deployments
   - Đảm bảo deployment mới nhất đã hoàn thành
   - Kiểm tra Build Logs không có lỗi

4. **Verify lại sau khi deploy:**
   ```bash
   curl -I https://your-domain.vercel.app | grep -i "strict-transport"
   ```

### Giải Pháp 2: Thêm Qua Vercel Dashboard (Nếu vercel.json Không Hoạt Động)

1. **Vào Vercel Dashboard:**
   - Truy cập https://vercel.com
   - Chọn project của bạn
   - Vào **Settings** → **Headers**

2. **Thêm HSTS Header:**
   - Click **"Add Header"**
   - **Source Path:** `/(.*)`
   - **Header Name:** `Strict-Transport-Security`
   - **Header Value:** `max-age=31536000; includeSubDomains; preload`
   - Click **Save**

3. **Verify:**
   - Đợi 1-2 phút để headers được apply
   - Kiểm tra lại bằng curl hoặc DevTools

### Giải Pháp 3: Kiểm Tra Routes Cụ Thể

Nếu một số routes không có header, có thể cần thêm cho từng route:

```json
{
  "headers": [
    {
      "source": "/",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## 🧪 Bước 4: Test Sau Khi Fix

### Test 1: Verify Header

```bash
curl -I https://your-domain.vercel.app
```

**Expected output:**
```
HTTP/2 200
...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
...
```

### Test 2: Test Tất Cả Routes

Kiểm tra các routes quan trọng:

```bash
# Homepage
curl -I https://your-domain.vercel.app/

# Admin page
curl -I https://your-domain.vercel.app/admin

# API routes (nếu có)
curl -I https://your-domain.vercel.app/api/health
```

### Test 3: Re-run ZAP Scan

Sau khi fix, chạy lại ZAP scan để verify:
- **Strict-Transport-Security Header Not Set** → Should be **0 instances**

---

## ⚠️ Troubleshooting

### Vấn đề 1: Header Vẫn Không Có Sau Khi Deploy

**Nguyên nhân có thể:**
- Vercel cache headers cũ
- Headers bị override bởi cấu hình khác
- Pattern matching không đúng

**Giải pháp:**
1. Clear Vercel cache (nếu có option)
2. Thử thêm qua Vercel Dashboard
3. Kiểm tra không có conflict với headers khác

### Vấn đề 2: Header Chỉ Có Ở Một Số Routes

**Nguyên nhân:**
- Pattern `/(.*)` có thể không match tất cả routes
- Static assets có thể cần header riêng

**Giải pháp:**
- Thêm header cho từng loại route cụ thể
- Hoặc dùng multiple patterns

### Vấn đề 3: ZAP Vẫn Báo Sau Khi Fix

**Nguyên nhân:**
- ZAP scan cache
- Scan chưa chạy lại sau khi deploy

**Giải pháp:**
- Đợi vài phút sau khi deploy
- Clear ZAP cache và scan lại
- Verify bằng curl trước khi scan

---

## 📊 Kết Quả Mong Đợi

Sau khi fix thành công:

- ✅ **Strict-Transport-Security header** xuất hiện trong tất cả responses
- ✅ **ZAP scan** không còn báo: "Strict-Transport-Security Header Not Set"
- ✅ **SecurityHeaders.com** score tăng
- ✅ **Browser** tự động redirect HTTP → HTTPS

---

## 📚 Tài Liệu Tham Khảo

- [MDN Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [Vercel Headers Documentation](https://vercel.com/docs/concepts/projects/project-configuration#headers)
- [OWASP HSTS](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)

