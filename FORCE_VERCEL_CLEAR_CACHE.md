# Force Vercel Clear Cache - Hướng dẫn chi tiết

## ⚠️ VẤN ĐỀ NGHIÊM TRỌNG

File hash vẫn là **CŨ** (`vendor-Cq1Fhkgr.js`) mặc dù đã có nhiều deployment mới. Điều này cho thấy **Vercel CDN vẫn đang serve file cũ**.

## 🔧 GIẢI PHÁP: Force Clear Cache trên Vercel

### Cách 1: Redeploy với Cache Disabled (KHUYẾN NGHỊ)

1. **Vào Vercel Dashboard**
   - Truy cập: https://vercel.com/dashboard
   - Chọn project của bạn

2. **Vào Deployments**
   - Click vào tab "Deployments" ở trên cùng
   - Tìm deployment mới nhất (status = "Ready")

3. **Redeploy với Cache Disabled**
   - Click vào deployment mới nhất
   - Click vào menu "..." (3 chấm) ở góc phải trên
   - Chọn "Redeploy"
   - **QUAN TRỌNG**: Bỏ chọn checkbox "Use existing Build Cache"
   - Click "Redeploy"

4. **Đợi deployment hoàn thành**
   - Status sẽ chuyển từ "Building" → "Ready"
   - Thường mất 2-3 phút

5. **Kiểm tra file hash mới**
   - Mở Incognito mới
   - Vào site → F12 → Network tab
   - Tìm file `vendor-*.js`
   - File hash mới sẽ KHÁC `Cq1Fhkgr`

### Cách 2: Force Redeploy bằng Empty Commit

Nếu cách 1 không hoạt động, thử cách này:

```bash
# Tạo empty commit để force redeploy
git commit --allow-empty -m "force redeploy to clear cache"

# Push lên GitHub
git push
```

Sau đó:
- Đợi Vercel tự động deploy (1-2 phút)
- Kiểm tra file hash mới

### Cách 3: Xóa và Rebuild Project (CUỐI CÙNG)

Nếu cả 2 cách trên không hoạt động:

1. **Vào Vercel Dashboard → Project → Settings**
2. **Scroll xuống phần "Danger Zone"**
3. **Click "Delete Project"** (hoặc "Remove Project")
4. **Tạo lại project mới** từ cùng GitHub repo
5. **Deploy lại**

⚠️ **LƯU Ý**: Cách này sẽ xóa tất cả deployment history và settings.

## ✅ KIỂM TRA SAU KHI REDEPLOY

1. **Đợi 2-3 phút** để Vercel deploy xong
2. **Mở Incognito mới** (Ctrl+Shift+N)
3. **Vào site** → F12 → **Network tab**
4. **Reload trang** (Ctrl+R)
5. **Tìm file `vendor-*.js`** trong Network tab
6. **Kiểm tra file hash**:
   - ✅ **ĐÚNG**: File hash mới (ví dụ: `vendor-DY83amXg.js`)
   - ❌ **SAI**: File hash cũ (`vendor-Cq1Fhkgr.js`)

## 🕐 NẾU VẪN THẤY FILE CŨ

1. **Đợi thêm 5-10 phút** (CDN cache có thể mất thời gian)
2. **Thử hard refresh**: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
3. **Thử URL khác**: Thêm `?v=5` vào URL
4. **Kiểm tra Vercel Dashboard** → Xem deployment mới nhất có status "Ready" không

## 📝 LƯU Ý

- **File hash cũ** (`vendor-Cq1Fhkgr.js`) có nghĩa là code cũ vẫn đang được serve
- **Tất cả fixes** đã được apply trong code mới, nhưng không được serve vì cache
- **Cần force clear cache** để file mới được serve

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

Liên hệ Vercel Support:
- Email: support@vercel.com
- Hoặc qua Vercel Dashboard → Help → Contact Support

Mô tả vấn đề:
- "CDN cache is serving old file hash despite new deployments"
- "File hash `vendor-Cq1Fhkgr.js` persists even after multiple redeployments"
- "Need to force clear CDN cache"

