# ✅ Quick Fix Checklist - Ưu Tiên Cao

## 🎯 Mục Tiêu

Fix 2 vấn đề ưu tiên cao từ ZAP scan trong 15-20 phút.

---

## ⚡ Quick Steps

### 1️⃣ Fix HSTS Header (5 phút)

```bash
# Step 1: Verify header hiện tại
curl -I https://your-domain.vercel.app | grep -i "strict-transport"

# Nếu KHÔNG có header:
# → Kiểm tra vercel.json đã có header chưa
# → Nếu có: commit và push
# → Nếu không: thêm qua Vercel Dashboard
```

**Vercel Dashboard (nếu cần):**
1. Vercel.com → Project → Settings → Headers
2. Add Header:
   - Path: `/(.*)`
   - Name: `Strict-Transport-Security`
   - Value: `max-age=31536000; includeSubDomains; preload`
3. Save

**Verify:**
```bash
curl -I https://your-domain.vercel.app | grep -i "strict-transport"
# Expected: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

### 2️⃣ Fix Cache-Control Headers (10 phút)

**Vercel Dashboard:**
1. Vercel.com → Project → Settings → Headers

**Header 1: Static Assets**
- Path: `/assets/:path*`
- Name: `Cache-Control`
- Value: `public, max-age=31536000, immutable`

**Header 2: Images**
- Path: `/*.(jpg|jpeg|png|gif|svg|webp|ico)`
- Name: `Cache-Control`
- Value: `public, max-age=86400, stale-while-revalidate=604800`

**Header 3: HTML**
- Path: `/`
- Name: `Cache-Control`
- Value: `public, max-age=0, must-revalidate`

**Verify:**
```bash
# Static assets
curl -I https://your-domain.vercel.app/assets/index-abc123.js | grep cache-control

# Images
curl -I https://your-domain.vercel.app/logo/main.png | grep cache-control

# HTML
curl -I https://your-domain.vercel.app/ | grep cache-control
```

---

## ✅ Final Verification

```bash
# Test tất cả headers
curl -I https://your-domain.vercel.app | grep -E "(strict-transport|cache-control)"
```

**Expected:**
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✅ `Cache-Control: public, max-age=0, must-revalidate` (cho HTML)

---

## 🎯 Done!

Sau khi hoàn thành:
- ✅ Re-run ZAP scan
- ✅ Verify không còn 2 vấn đề này
- ✅ Check SecurityHeaders.com score

