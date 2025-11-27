# ✅ DEPLOYMENT CHECKLIST - VERCEL

## 📋 PRE-DEPLOYMENT CHECKLIST

### **Files & Config**
- [x] ✅ `vercel.json` đã có
- [x] ✅ `package.json` có build script
- [x] ✅ `vite.config.js` OK
- [x] ✅ Code đã push lên GitHub

### **Environment Variables (Chuẩn bị sẵn)**
- [ ] Copy `VITE_SUPABASE_URL`
- [ ] Copy `VITE_SUPABASE_ANON_KEY`

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Vercel Account**
- [ ] Đăng ký tại https://vercel.com
- [ ] Login với GitHub
- [ ] Authorize Vercel

### **Step 2: Import Project**
- [ ] Click "Add New..." → "Project"
- [ ] Chọn repository
- [ ] Click "Import"

### **Step 3: Configure**
- [ ] Verify Framework: Vite
- [ ] Verify Build Command: `npm run build`
- [ ] Verify Output Directory: `dist`

### **Step 4: Environment Variables**
- [ ] Add `VITE_SUPABASE_URL`
  - Value: `https://lewocjuvermgzzdjamad.supabase.co`
  - Environment: Production, Preview, Development
- [ ] Add `VITE_SUPABASE_ANON_KEY`
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Environment: Production, Preview, Development

### **Step 5: Deploy**
- [ ] Click "Deploy"
- [ ] Đợi build hoàn thành (~2-3 phút)
- [ ] Lấy URL: `https://[project-name].vercel.app`

---

## ✅ POST-DEPLOYMENT VERIFICATION

### **Basic Checks**
- [ ] Site load được
- [ ] Không có 404 errors
- [ ] Console không có errors

### **Supabase Connection**
- [ ] Open browser console (F12)
- [ ] Check không có Supabase errors
- [ ] Test login/logout

### **SPA Routing**
- [ ] Navigate giữa các pages
- [ ] Không có 404 khi refresh
- [ ] URLs hoạt động đúng

### **Features**
- [ ] Login hoạt động
- [ ] Logout hoạt động
- [ ] Navigation hoạt động
- [ ] Các features chính hoạt động

---

## 🔄 AUTO-DEPLOY TEST

- [ ] Push code mới lên GitHub
- [ ] Verify Vercel tự động deploy
- [ ] Check preview URL (nếu là PR)

---

## 📝 FINAL NOTES

- **URL:** `https://[project-name].vercel.app`
- **Build Time:** ~2-3 phút
- **Auto-Deploy:** ✅ Enabled
- **Environment Variables:** ✅ Set

---

**✅ Deployment hoàn tất khi tất cả items được check!**

