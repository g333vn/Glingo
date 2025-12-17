# 🚀 DEPLOY TO NETLIFY - QUICK GUIDE

## ✅ CODE ĐÃ ĐƯỢC PUSH

**Status:** ✅ Code đã được push lên GitHub  
**Repository:** `g333vn/Glingo`  
**Commit:** `575218b`

---

## 📋 DEPLOY LÊN NETLIFY

### **Bước 1: Vào Netlify Dashboard**

1. Mở https://app.netlify.com
2. Login với tài khoản Netlify của bạn

### **Bước 2: Import Project**

#### **Nếu chưa có site:**

1. Click **Add new site** → **Import an existing project**
2. Chọn **GitHub**
3. Authorize Netlify (nếu cần)
4. Chọn repository: `g333vn/Glingo`
5. Click **Connect**

#### **Nếu đã có site:**

1. Vào site hiện tại
2. Vào **Site settings** → **Build & deploy**
3. Click **Link to a different branch** (nếu cần)
4. Netlify sẽ tự động deploy khi có push mới

### **Bước 3: Configure Build Settings**

Netlify sẽ auto-detect, nhưng verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (để trống)

Click **Deploy site**

### **Bước 4: Setup Environment Variables** ⚠️ QUAN TRỌNG

Sau khi deploy, vào **Site settings** → **Environment variables**

**Add các variables:**

1. Click **Add variable**
2. **Key:** `VITE_SUPABASE_URL`
3. **Value:** `https://lewocjuvermgzzdjamad.supabase.co`
4. Click **Add variable**

5. Click **Add variable** lần nữa
6. **Key:** `VITE_SUPABASE_ANON_KEY`
7. **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29janV2ZXJtZ3p6ZGphbWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIxMzgsImV4cCI6MjA3OTcyODEzOH0.VHRjR03dKvrpk5FKf4ewtRpGFKzPgpNZ8baI6oGKpWA`
8. Click **Add variable**

**⚠️ CRITICAL:** Sau khi add environment variables, cần **trigger redeploy**:

1. Vào **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Đợi deploy hoàn thành (~2-3 phút)

---

## ✅ VERIFY DEPLOYMENT

### **1. Check Build Status**

1. Vào **Deploys** tab
2. Click vào deploy mới nhất
3. Xem **Build log**
4. ✅ Verify: "Build succeeded"

### **2. Test Site**

1. Click **Open production deploy** (hoặc site URL)
2. ✅ Verify site load được
3. ✅ Open browser console (F12)
4. ✅ Verify không có errors về Supabase

### **3. Test Features**

1. ✅ Test login với Supabase account
2. ✅ Test load content (nếu đã apply schema)
3. ✅ Test file upload (nếu đã setup storage)

---

## 🔧 TROUBLESHOOTING

### **Build fails**

**Check:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18.x hoặc 20.x

**Solution:**
- Vào **Site settings** → **Build & deploy** → **Environment**
- Set **Node version:** `18` hoặc `20`

### **Site loads but Supabase errors**

**Check:**
- Environment variables đã được set chưa?
- Values đúng chưa?
- Đã trigger redeploy sau khi add env vars chưa?

**Solution:**
1. Verify env vars trong **Site settings** → **Environment variables**
2. Trigger redeploy: **Deploys** → **Trigger deploy**

### **404 errors on routes**

**Check:**
- File `public/_redirects` có chưa?
- Content: `/* /index.html 200`

**Solution:**
- File đã có sẵn trong repo, verify nó được deploy

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Site imported/connected to GitHub
- [ ] ✅ Build settings configured
- [ ] ✅ Environment variables added
- [ ] ✅ Redeploy triggered
- [ ] ✅ Build succeeded
- [ ] ✅ Site loads correctly
- [ ] ✅ Supabase connection works
- [ ] ✅ Login works
- [ ] ✅ No console errors

---

## 🎯 SAU KHI DEPLOY XONG

1. ✅ **Apply Supabase Schema** - Run `docs/backend/COMPLETE_SETUP_SCRIPT.sql`
2. ✅ **Create Storage Buckets** - Tạo 3 buckets trong Supabase
3. ✅ **Test Upload** - Test upload images/audio
4. ✅ **Test Content** - Test tạo/save content

---

## 📝 NOTES

- **Auto-deploy:** Netlify sẽ tự động deploy khi có push mới lên GitHub
- **Environment variables:** Cần set cho mỗi site mới
- **Redeploy:** Cần trigger redeploy sau khi update env vars
- **Build time:** ~2-3 phút
- **Deploy URL:** `https://[site-name].netlify.app`

---

**🎉 Chúc bạn deploy thành công!**

