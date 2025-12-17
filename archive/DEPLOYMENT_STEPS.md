# 🚀 Triển Khai Security Headers - Các Bước Thực Hiện

## ⚡ Quick Start (5 phút)

### Bước 1: Deploy vercel.json

```bash
# Kiểm tra code đã commit chưa
git status

# Nếu chưa commit
git add vercel.json
git commit -m "🔒 Add security headers"
git push
```

**Vercel sẽ tự động deploy** (nếu đã connect GitHub)

---

### Bước 2: Verify Headers (Sau 2-3 phút)

```bash
# Sử dụng npm script
npm run verify:headers -- https://your-domain.vercel.app

# Hoặc trực tiếp
node scripts/verify-headers.js https://your-domain.vercel.app
```

**Expected:** Tất cả headers đều có ✅

---

### Bước 3: Thêm Cache-Control Headers (Qua Dashboard)

**Không thể thêm vào vercel.json** (sẽ gây lỗi deploy)

**Thêm qua Vercel Dashboard:**

1. Vào https://vercel.com → Project → **Settings** → **Headers**
2. Thêm 3 headers (xem chi tiết trong `VERCEL_CACHE_CONTROL_SETUP.md`)

---

### Bước 4: Verify Cache-Control

```bash
npm run verify:cache -- https://your-domain.vercel.app
```

---

## 📋 Checklist Đầy Đủ

- [ ] ✅ Code đã commit và push
- [ ] ✅ Vercel deployment hoàn thành
- [ ] ✅ Verify headers bằng script
- [ ] ✅ Thêm Cache-Control qua Dashboard
- [ ] ✅ Verify Cache-Control
- [ ] ✅ Re-run ZAP scan

---

## 🎯 Kết Quả

Sau khi hoàn thành:
- ✅ HSTS header: **0 instances** (từ 10)
- ✅ Cache-Control: **0 instances** (từ 9)

