# 🔄 GIẢI PHÁP THAY THẾ NETLIFY - KHI HẾT CREDIT

## 📋 TÌNH HÌNH HIỆN TẠI

**Vấn đề:** Đã hết credit ở Netlify, không thể tiếp tục build  
**Dự án:** React + Vite + Supabase  
**Build command:** `npm run build`  
**Output directory:** `dist`  

---

## 🎯 CÁC GIẢI PHÁP THAY THẾ (THEO THỨ TỰ KHUYẾN NGHỊ)

### **1. VERCEL** ⭐⭐⭐⭐⭐ (KHUYẾN NGHỊ NHẤT)

#### **Ưu điểm:**
- ✅ **Free tier rất hào phóng:** 100GB bandwidth/tháng, unlimited builds
- ✅ **Tự động deploy** từ GitHub
- ✅ **Performance tốt** với Edge Network
- ✅ **Dễ setup**, tương tự Netlify
- ✅ **Hỗ trợ Vite** tốt
- ✅ **Environment variables** dễ quản lý
- ✅ **Preview deployments** cho mỗi PR

#### **Giới hạn Free Tier:**
- 100GB bandwidth/tháng
- Unlimited builds
- 100GB storage
- Unlimited sites

#### **Cách deploy:**

**Bước 1: Đăng ký Vercel**
1. Vào https://vercel.com
2. Click **Sign Up** → Chọn **Continue with GitHub**
3. Authorize Vercel

**Bước 2: Import Project**
1. Vào Dashboard → Click **Add New...** → **Project**
2. Chọn repository `g333vn/Glingo` (hoặc repo của bạn)
3. Click **Import**

**Bước 3: Configure Build Settings**
Vercel sẽ auto-detect, nhưng verify:
- **Framework Preset:** Vite (tự động)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install` (tự động)

**Bước 4: Setup Environment Variables**
1. Trong project settings, vào **Environment Variables**
2. Add:
   ```
   VITE_SUPABASE_URL=https://lewocjuvermgzzdjamad.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29janV2ZXJtZ3p6ZGphbWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIxMzgsImV4cCI6MjA3OTcyODEzOH0.VHRjR03dKvrpk5FKf4ewtRpGFKzPgpNZ8baI6oGKpWA
   ```
3. Chọn **Production, Preview, Development** cho cả 2 variables
4. Click **Save**

**Bước 5: Deploy**
1. Click **Deploy**
2. Đợi 2-3 phút
3. ✅ Xong! Site sẽ có URL: `https://[project-name].vercel.app`

**Bước 6: Setup SPA Routing (Quan trọng!)**
Tạo file `vercel.json` ở root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Lưu ý:** File `public/_redirects` của Netlify không hoạt động trên Vercel, cần dùng `vercel.json` như trên.

---

### **2. CLOUDFLARE PAGES** ⭐⭐⭐⭐

#### **Ưu điểm:**
- ✅ **Free tier không giới hạn** bandwidth
- ✅ **Build time không giới hạn**
- ✅ **Performance cực tốt** với Cloudflare CDN
- ✅ **Tích hợp tốt** với Cloudflare services
- ✅ **Dễ setup**

#### **Giới hạn Free Tier:**
- Unlimited bandwidth
- 500 builds/tháng
- Unlimited sites

#### **Cách deploy:**

**Bước 1: Đăng ký Cloudflare**
1. Vào https://dash.cloudflare.com
2. Sign up (miễn phí)

**Bước 2: Connect GitHub**
1. Vào **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Chọn **GitHub** → Authorize
3. Chọn repository `g333vn/Glingo`

**Bước 3: Configure Build Settings**
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (để trống)

**Bước 4: Setup Environment Variables**
1. Vào **Settings** → **Environment variables**
2. Add:
   ```
   VITE_SUPABASE_URL=https://lewocjuvermgzzdjamad.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29janV2ZXJtZ3p6ZGphbWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIxMzgsImV4cCI6MjA3OTcyODEzOH0.VHRjR03dKvrpk5FKf4ewtRpGFKzPgpNZ8baI6oGKpWA
   ```
3. Click **Save**

**Bước 5: Setup SPA Routing**
Tạo file `functions/_middleware.js` ở root:

```javascript
export function onRequest(context) {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
```

Hoặc đơn giản hơn, tạo file `_redirects` trong `public/` (giống Netlify):
```
/*    /index.html   200
```

**Bước 6: Deploy**
1. Click **Save and Deploy**
2. Đợi build xong
3. ✅ Site sẽ có URL: `https://[project-name].pages.dev`

---

### **3. GITHUB PAGES** ⭐⭐⭐

#### **Ưu điểm:**
- ✅ **Hoàn toàn miễn phí**
- ✅ **Tích hợp sẵn** với GitHub
- ✅ **Không giới hạn** bandwidth
- ✅ **SSL tự động**

#### **Nhược điểm:**
- ⚠️ **Không hỗ trợ environment variables** (cần build trước khi push)
- ⚠️ **Không có server-side features**
- ⚠️ **Cần GitHub Actions** để auto-deploy

#### **Cách deploy:**

**Bước 1: Setup GitHub Actions**
Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Bước 2: Setup Secrets**
1. Vào repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://lewocjuvermgzzdjamad.supabase.co`
4. Add tiếp:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Bước 3: Enable GitHub Pages**
1. Vào repository → **Settings** → **Pages**
2. **Source:** Deploy from a branch → Chọn `gh-pages` (hoặc **GitHub Actions**)
3. Click **Save**

**Bước 4: Push code**
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment"
git push
```

**Bước 5: Setup Base Path (Nếu cần)**
Nếu repo không phải là `username.github.io`, cần set base path trong `vite.config.js`:

```javascript
export default defineConfig({
  base: '/Glingo/', // Tên repo của bạn
  // ... rest of config
})
```

**Lưu ý:** GitHub Pages sẽ có URL: `https://[username].github.io/[repo-name]`

---

### **4. RENDER** ⭐⭐⭐

#### **Ưu điểm:**
- ✅ **Free tier** cho static sites
- ✅ **Auto-deploy** từ GitHub
- ✅ **SSL tự động**

#### **Nhược điểm:**
- ⚠️ **Free tier có giới hạn** (sites có thể sleep sau 15 phút không dùng)
- ⚠️ **Build time giới hạn**

#### **Cách deploy:**

**Bước 1: Đăng ký Render**
1. Vào https://render.com
2. Sign up với GitHub

**Bước 2: Create Static Site**
1. Click **New +** → **Static Site**
2. Connect GitHub repository
3. Configure:
   - **Name:** `elearning-platform`
   - **Branch:** `master`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

**Bước 3: Setup Environment Variables**
1. Trong site settings → **Environment**
2. Add:
   ```
   VITE_SUPABASE_URL=https://lewocjuvermgzzdjamad.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Bước 4: Deploy**
1. Click **Create Static Site**
2. Đợi build xong
3. ✅ Site sẽ có URL: `https://[name].onrender.com`

---

### **5. NETLIFY DROP (Manual Upload)** ⭐⭐

#### **Ưu điểm:**
- ✅ **Không cần build** trên Netlify (build local)
- ✅ **Không tốn credit** cho build
- ✅ **Vẫn dùng được Netlify CDN**

#### **Nhược điểm:**
- ⚠️ **Không auto-deploy** (phải upload thủ công)
- ⚠️ **Mất thời gian** mỗi lần update

#### **Cách deploy:**

**Bước 1: Build local**
```bash
npm run build
```

**Bước 2: Upload lên Netlify Drop**
1. Vào https://app.netlify.com/drop
2. Kéo thả folder `dist` vào
3. ✅ Xong! Site sẽ có URL ngẫu nhiên

**Lưu ý:** Mỗi lần update, phải build lại và upload lại.

---

## 📊 SO SÁNH CÁC GIẢI PHÁP

| Platform | Free Tier | Auto Deploy | Build Time | Bandwidth | Khuyến nghị |
|----------|-----------|-------------|------------|------------|-------------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ✅ | Unlimited | 100GB/tháng | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | ⭐⭐⭐⭐⭐ | ✅ | 500 builds/tháng | Unlimited | ⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐⭐⭐⭐⭐ | ✅ (với Actions) | Unlimited | Unlimited | ⭐⭐⭐ |
| **Render** | ⭐⭐⭐ | ✅ | Limited | Limited | ⭐⭐⭐ |
| **Netlify Drop** | ⭐⭐ | ❌ | N/A | Limited | ⭐⭐ |

---

## 🎯 KHUYẾN NGHỊ

### **Nếu muốn giống Netlify nhất:**
→ **Chọn VERCEL** ⭐⭐⭐⭐⭐
- Setup tương tự Netlify
- Free tier tốt
- Performance tốt

### **Nếu muốn không giới hạn bandwidth:**
→ **Chọn CLOUDFLARE PAGES** ⭐⭐⭐⭐
- Unlimited bandwidth
- CDN tốt nhất

### **Nếu muốn hoàn toàn miễn phí và đơn giản:**
→ **Chọn GITHUB PAGES** ⭐⭐⭐
- Hoàn toàn miễn phí
- Tích hợp với GitHub

---

## 🔧 MIGRATION CHECKLIST

### **Trước khi chuyển:**
- [ ] Backup environment variables hiện tại
- [ ] Backup build settings
- [ ] Test build local: `npm run build`
- [ ] Verify `dist/` folder có đầy đủ files

### **Sau khi chuyển:**
- [ ] Setup environment variables
- [ ] Setup SPA routing (nếu cần)
- [ ] Test deploy
- [ ] Verify site hoạt động
- [ ] Test Supabase connection
- [ ] Test login/logout
- [ ] Update domain (nếu có)

---

## 🚀 QUICK START - VERCEL (KHUYẾN NGHỊ)

### **1. Tạo file `vercel.json`** (nếu chưa có)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **2. Push lên GitHub**
```bash
git add vercel.json
git commit -m "Add Vercel config for SPA routing"
git push
```

### **3. Deploy trên Vercel**
1. Vào https://vercel.com
2. Import project từ GitHub
3. Add environment variables
4. Deploy!

### **4. Xong!** ✅

---

## 📝 NOTES

- **Environment Variables:** Tất cả platforms đều hỗ trợ, chỉ cần copy từ Netlify
- **SPA Routing:** Mỗi platform có cách setup khác nhau (xem hướng dẫn trên)
- **Build Settings:** Hầu hết đều auto-detect Vite, chỉ cần verify
- **Domain:** Có thể connect custom domain cho tất cả platforms (miễn phí)

---

## ❓ FAQ

**Q: Có cần thay đổi code không?**  
A: Không! Chỉ cần thêm config file (như `vercel.json`) nếu cần.

**Q: Environment variables có giữ nguyên không?**  
A: Có, chỉ cần copy sang platform mới.

**Q: Domain có chuyển được không?**  
A: Có, tất cả platforms đều hỗ trợ custom domain (miễn phí).

**Q: Build time có bị giới hạn không?**  
A: Vercel và GitHub Pages không giới hạn. Cloudflare Pages: 500 builds/tháng.

**Q: Bandwidth có giới hạn không?**  
A: Vercel: 100GB/tháng. Cloudflare Pages và GitHub Pages: Unlimited.

---

**🎉 Chúc bạn migrate thành công!**

