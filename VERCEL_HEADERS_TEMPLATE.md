# 📋 Vercel Headers Template - Copy & Paste

## 🎯 Sử Dụng

Copy các giá trị dưới đây và paste vào Vercel Dashboard → Settings → Headers

---

## Header 1: Static Assets (JS, CSS, Fonts)

**Source Path:**
```
/assets/:path*
```

**Header Name:**
```
Cache-Control
```

**Header Value:**
```
public, max-age=31536000, immutable
```

---

## Header 2: Images

**Source Path:**
```
/*.(jpg|jpeg|png|gif|svg|webp|ico)
```

**Header Name:**
```
Cache-Control
```

**Header Value:**
```
public, max-age=86400, stale-while-revalidate=604800
```

---

## Header 3: HTML (Nếu Chưa Có)

**Source Path:**
```
/
```

**Header Name:**
```
Cache-Control
```

**Header Value:**
```
public, max-age=0, must-revalidate
```

---

## ⚠️ Lưu Ý

1. **Thứ tự:** Thêm headers theo thứ tự trên (static assets trước, images sau)
2. **Pattern:** Nếu regex không hoạt động, thử pattern đơn giản:
   - `/assets/:path*` thay vì `/assets/*`
   - `/logo/:path*` cho images
3. **Verify:** Sau khi thêm, đợi 1-2 phút rồi verify bằng:
   ```bash
   npm run verify:cache -- https://glingo.vercel.app/
   ```

---

## 🔄 Alternative Patterns (Nếu Pattern Chính Không Hoạt Động)

### Static Assets - Alternative 1:
```
/assets/*.js
/assets/*.css
/assets/*.woff
/assets/*.woff2
```
*(Thêm từng loại file riêng)*

### Images - Alternative 1:
```
/logo/:path*
/images/:path*
```

### Images - Alternative 2:
```
/*.jpg
/*.jpeg
/*.png
/*.gif
/*.svg
/*.webp
/*.ico
```
*(Thêm từng extension riêng)*

