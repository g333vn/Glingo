# 🚀 DEPLOY TO VERCEL - HƯỚNG DẪN TỪNG BƯỚC CHI TIẾT

## ✅ KIỂM TRA TRƯỚC KHI DEPLOY

### **Files đã sẵn sàng:**
- ✅ `vercel.json` - Config cho SPA routing
- ✅ `package.json` - Build script: `npm run build`
- ✅ `vite.config.js` - Vite config
- ✅ `public/_redirects` - (Netlify, không cần cho Vercel)

### **Environment Variables cần chuẩn bị:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Lấy thông tin từ Supabase Dashboard:**
1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings → API**
4. Copy **Project URL** → `VITE_SUPABASE_URL`
5. Copy **anon public key** → `VITE_SUPABASE_ANON_KEY`

---

## 📋 BƯỚC 1: ĐĂNG KÝ VERCEL (2 phút)

### **1.1. Mở Vercel**
1. Vào trình duyệt
2. Truy cập: **https://vercel.com**
3. Click nút **Sign Up** (góc trên bên phải)

### **1.2. Đăng nhập với GitHub**
1. Chọn **Continue with GitHub**
2. Authorize Vercel (cho phép truy cập GitHub)
3. Chọn repository permissions (hoặc **All repositories**)
4. Click **Authorize Vercel**

### **1.3. Hoàn tất đăng ký**
- ✅ Bạn sẽ được chuyển đến Vercel Dashboard
- ✅ Tài khoản đã được tạo thành công

---

## 📋 BƯỚC 2: IMPORT PROJECT (2 phút)

### **2.1. Tạo Project mới**
1. Trong Vercel Dashboard, click **Add New...** (góc trên bên phải)
2. Chọn **Project**

### **2.2. Chọn Repository**
1. Bạn sẽ thấy danh sách repositories từ GitHub
2. Tìm và chọn repository của bạn (ví dụ: `g333vn/Glingo` hoặc tên repo của bạn)
3. Click **Import**

### **2.3. Configure Project Settings**

Vercel sẽ auto-detect Vite, nhưng hãy verify các settings:

**Framework Preset:**
- ✅ **Vite** (tự động detect)

**Root Directory:**
- ✅ Để mặc định: `./` (hoặc để trống)

**Build and Output Settings:**
- ✅ **Build Command:** `npm run build` (tự động)
- ✅ **Output Directory:** `dist` (tự động)
- ✅ **Install Command:** `npm install` (tự động)

**⚠️ QUAN TRỌNG:** ĐỪNG CLICK DEPLOY NGAY! Cần setup environment variables trước.

---

## 📋 BƯỚC 3: SETUP ENVIRONMENT VARIABLES (3 phút)

### **3.1. Mở Environment Variables**
1. Trong trang Configure Project
2. Scroll xuống phần **Environment Variables**
3. Click **Add** hoặc click vào ô input

### **3.2. Add Variable 1: VITE_SUPABASE_URL**

1. **Key:** `VITE_SUPABASE_URL`
2. **Value:** Lấy từ Supabase Dashboard → Settings → API → Project URL
   - Ví dụ: `https://your-project-id.supabase.co`
3. **Environment:** Chọn cả 3:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **Add** hoặc **Save**

### **3.3. Add Variable 2: VITE_SUPABASE_ANON_KEY**

1. Click **Add** lại để thêm variable thứ 2
2. **Key:** `VITE_SUPABASE_ANON_KEY`
3. **Value:** Lấy từ Supabase Dashboard → Settings → API → anon public key
   - Key bắt đầu bằng `eyJ...`
4. **Environment:** Chọn cả 3:
   - ✅ Production
   - ✅ Preview
   - ✅ Development   
5. Click **Add** hoặc **Save**

### **3.4. Verify Variables**
Bạn sẽ thấy 2 variables trong danh sách:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

---

## 📋 BƯỚC 4: DEPLOY (2-3 phút)

### **4.1. Bắt đầu Deploy**
1. Scroll lên trên
2. Click nút **Deploy** (màu đen, góc dưới bên phải)
3. Đợi build hoàn thành (~2-3 phút)

### **4.2. Theo dõi Build Process**

Bạn sẽ thấy:
1. **Installing dependencies** - `npm install`
2. **Building** - `npm run build`
3. **Deploying** - Upload files lên Vercel
4. ✅ **Ready** - Deploy thành công!

### **4.3. Lấy URL**

Sau khi deploy xong:
- ✅ Bạn sẽ thấy URL: `https://[project-name].vercel.app`
- ✅ Click vào URL để mở site

---

## 📋 BƯỚC 5: VERIFY DEPLOYMENT (2 phút)

### **5.1. Test Site Load**
1. Mở URL site trong trình duyệt
2. ✅ Verify site load được
3. ✅ Check không có lỗi 404

### **5.2. Test Supabase Connection**
1. Mở **Browser Console** (F12)
2. Vào tab **Console**
3. ✅ Verify không có errors về Supabase
4. ✅ Check network tab - Supabase requests thành công

### **5.3. Test Features**
1. ✅ Test login/logout
2. ✅ Test navigation (SPA routing)
3. ✅ Test các features chính

---

## 📋 BƯỚC 6: SETUP AUTO-DEPLOY (Tự động)

### **6.1. Auto-Deploy đã được bật**
- ✅ Mỗi khi bạn push code lên GitHub
- ✅ Vercel sẽ tự động deploy
- ✅ Không cần làm gì thêm!

### **6.2. Preview Deployments**
- ✅ Mỗi PR sẽ có preview URL riêng
- ✅ Production deploy khi merge vào `master`

---

## 🔧 TROUBLESHOOTING

### **❌ Build fails: "Module not found"**

**Solution:**
1. Check `package.json` có đầy đủ dependencies
2. Verify build command: `npm run build`
3. Check build logs trong Vercel dashboard

### **❌ Site loads but Supabase errors**

**Solution:**
1. Verify environment variables đã được set
2. Check values đúng chưa
3. **Redeploy:** Vào Deployments → Click "..." → Redeploy

### **❌ 404 errors khi navigate**

**Solution:**
1. Verify file `vercel.json` có trong repo
2. Content phải là:
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
3. Push lại file nếu cần

### **❌ Environment variables không hoạt động**

**Solution:**
1. Vào Project Settings → Environment Variables
2. Verify variables đã có
3. **Redeploy** sau khi add/update variables

---

## ✅ CHECKLIST HOÀN THÀNH

Sau khi deploy xong, verify:

- [ ] ✅ Vercel account đã tạo
- [ ] ✅ Project đã import từ GitHub
- [ ] ✅ Environment variables đã set (2 variables)
- [ ] ✅ Build thành công
- [ ] ✅ Site load được
- [ ] ✅ Supabase connection hoạt động
- [ ] ✅ Login/logout hoạt động
- [ ] ✅ SPA routing hoạt động (không có 404)
- [ ] ✅ Auto-deploy hoạt động (test bằng cách push code)

---

## 🎯 NEXT STEPS

### **1. Custom Domain (Optional)**
1. Vào Project Settings → Domains
2. Add custom domain
3. Follow instructions để setup DNS

### **2. Monitor Performance**
1. Vào Analytics tab
2. Monitor traffic, performance
3. Check build logs

### **3. Update Documentation**
- Update README với Vercel URL
- Update các links trong docs

---

## 📝 NOTES

- **Build time:** ~2-3 phút mỗi lần deploy
- **Auto-deploy:** Tự động khi push lên GitHub
- **Preview URLs:** Mỗi PR có URL riêng
- **Environment Variables:** Cần redeploy sau khi update

---

**🎉 Chúc bạn deploy thành công!**

