# 🔴 VERCEL ĐANG DÙNG CACHE CŨ

## ❌ Vấn Đề Xác Định

Từ screenshot:
- **File:** `vendor-Cq1fhkgr.js` (BẢN CŨ)
- **Server:** Vercel
- **X-Vercel-Cache:** HIT ← Đang dùng cache!

→ **Vercel chưa deploy bản mới hoặc CDN cache chưa update**

---

## ✅ FIX NGAY - 3 CÁCH

### CÁCH 1: Bypass Vercel Cache (Nhanh nhất)

Thêm `?v=` vào URL:

```
https://glingo.vercel.app/?v=2
```

Reload và check console.

---

### CÁCH 2: Trigger Redeploy Trên Vercel

1. Vào: https://vercel.com/dashboard
2. Click vào project **"Glingo"**
3. Tab **"Deployments"**
4. Check deployment gần nhất:
   - Có commit: `"fix: Bundle React into entry chunk"`?
   - Status: **"Ready"** hay **"Building"**?

**Nếu status = "Ready":**
- Click **"⋮"** (3 dots) → **"Redeploy"**
- Chọn **"Use existing Build Cache"** = OFF
- Click **"Redeploy"**

**Nếu không thấy commit mới:**
- Git push lại:
  ```bash
  git commit --allow-empty -m "trigger redeploy"
  git push
  ```

---

### CÁCH 3: Clear Vercel Edge Cache (Chắc chắn nhất)

**Trong Vercel Dashboard:**

1. Project Settings
2. Tab **"Functions"** hoặc **"Edge Network"**
3. Tìm **"Purge Cache"** hoặc **"Clear Cache"**
4. Click để clear

**HOẶC sử dụng API:**

```bash
# Lấy từ Vercel Dashboard → Settings → Tokens
# Tạo token mới nếu chưa có
curl -X DELETE "https://api.vercel.com/v1/deployments/YOUR_DEPLOYMENT_ID/cache" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Verify

Sau khi làm 1 trong 3 cách trên:

1. Đợi **30-60 giây**
2. Mở **Incognito MỚI** (đóng cửa sổ cũ)
3. Vào site
4. **F12** → **Network**
5. Check file `vendor-*.js`:
   - ✅ Hash phải là: `DY83amXg` (MỚI)
   - ✅ X-Vercel-Cache: MISS (không dùng cache)

---

## ⚡ Nếu Cần Nhanh

**Dùng direct deployment URL thay vì domain:**

1. Vercel Dashboard → Deployments
2. Copy **Deployment URL** của deployment mới nhất
3. Mở URL đó thay vì `glingo.vercel.app`

Direct URL không có cache!

---

## 🎯 Expected Result

- ✅ File: `vendor-DY83amXg.js` (mới)
- ✅ X-Vercel-Cache: MISS
- ✅ App hiển thị bình thường

