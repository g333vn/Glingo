# ⚡ QUICK MIGRATE TO VERCEL - 5 PHÚT

## 🎯 TÌNH HÌNH

Bạn đã hết credit ở Netlify và cần chuyển sang platform khác.  
**Giải pháp:** Vercel - Free tier tốt, setup dễ, tương tự Netlify.

---

## ✅ ĐÃ CHUẨN BỊ SẴN

- ✅ File `vercel.json` đã được tạo (cho SPA routing)
- ✅ Build config đã sẵn sàng (`npm run build` → `dist/`)

---

## 🚀 5 BƯỚC DEPLOY LÊN VERCEL

### **Bước 1: Đăng ký Vercel (1 phút)**

1. Vào https://vercel.com
2. Click **Sign Up**
3. Chọn **Continue with GitHub**
4. Authorize Vercel

### **Bước 2: Import Project (1 phút)**

1. Vào Dashboard → Click **Add New...** → **Project**
2. Chọn repository của bạn (ví dụ: `g333vn/Glingo`)
3. Click **Import**

### **Bước 3: Configure (30 giây)**

Vercel sẽ auto-detect Vite, chỉ cần verify:
- ✅ **Framework Preset:** Vite (tự động)
- ✅ **Build Command:** `npm run build` (tự động)
- ✅ **Output Directory:** `dist` (tự động)

**KHÔNG CẦN THAY ĐỔI GÌ!** Click **Deploy** luôn.

### **Bước 4: Setup Environment Variables (2 phút)**

**Sau khi deploy lần đầu:**

1. Vào project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add variable 1:
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://lewocjuvermgzzdjamad.supabase.co`
   - **Environment:** Chọn cả 3 (Production, Preview, Development)
   - Click **Save**
4. Add variable 2:
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29janV2ZXJtZ3p6ZGphbWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIxMzgsImV4cCI6MjA3OTcyODEzOH0.VHRjR03dKvrpk5FKf4ewtRpGFKzPgpNZ8baI6oGKpWA`
   - **Environment:** Chọn cả 3
   - Click **Save**

### **Bước 5: Redeploy (30 giây)**

1. Vào **Deployments** tab
2. Click **...** (3 chấm) ở deploy mới nhất
3. Click **Redeploy**
4. Đợi 2-3 phút
5. ✅ **XONG!** Site đã live tại: `https://[project-name].vercel.app`

---

## ✅ VERIFY

1. ✅ Mở site URL
2. ✅ Test login/logout
3. ✅ Test các features chính
4. ✅ Check browser console (F12) - không có errors

---

## 🔄 AUTO-DEPLOY

Vercel sẽ **tự động deploy** mỗi khi bạn push code lên GitHub:
- Push to `master` → Deploy production
- Push to branch khác → Deploy preview

**Không cần làm gì thêm!** ✅

---

## 📊 SO SÁNH VỚI NETLIFY

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Free Tier | ⚠️ Hết credit | ✅ 100GB/tháng |
| Auto Deploy | ✅ | ✅ |
| Build Time | ⚠️ Giới hạn | ✅ Unlimited |
| Performance | ✅ Tốt | ✅ Tốt |
| Setup | ✅ Dễ | ✅ Dễ |

**Kết luận:** Vercel tương tự Netlify, nhưng free tier tốt hơn! ✅

---

## 🎯 NEXT STEPS

1. ✅ Test site hoạt động
2. ✅ Update domain (nếu có custom domain)
3. ✅ Update bookmarks/links
4. ✅ Thông báo cho users (nếu cần)

---

## ❓ TROUBLESHOOTING

### **Site load nhưng Supabase errors?**

→ Check environment variables đã set chưa?  
→ Đã redeploy sau khi add env vars chưa?

### **404 errors khi navigate?**

→ File `vercel.json` đã có chưa?  
→ Content: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`

### **Build fails?**

→ Check build logs trong Vercel dashboard  
→ Verify `package.json` có đầy đủ dependencies

---

**🎉 Chúc bạn migrate thành công!**

