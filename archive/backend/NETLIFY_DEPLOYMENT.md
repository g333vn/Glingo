# 🚀 NETLIFY DEPLOYMENT GUIDE

## ✅ CODE ĐÃ ĐƯỢC PUSH LÊN GITHUB

Code đã được push thành công lên GitHub repository.

**Commit:** `575218b` - "feat: Implement Supabase content storage and file upload"

---

## 📋 DEPLOY LÊN NETLIFY

### **Option 1: Auto-Deploy (Nếu đã setup)**

Nếu bạn đã connect GitHub với Netlify trước đó:

1. ✅ Code đã được push → Netlify sẽ tự động deploy
2. Vào Netlify Dashboard → **Deploys**
3. Đợi deploy hoàn thành (~2-3 phút)
4. ✅ Verify site đã update

---

### **Option 2: Manual Deploy (Nếu chưa setup)**

#### **Bước 1: Connect GitHub với Netlify**

1. Vào https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Chọn **GitHub**
4. Authorize Netlify (nếu cần)
5. Chọn repository: `g333vn/Glingo`
6. Click **Connect**

#### **Bước 2: Configure Build Settings**

Netlify sẽ auto-detect settings, nhưng verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (để trống)

Click **Deploy site**

#### **Bước 3: Setup Environment Variables**

Sau khi deploy, vào **Site settings** → **Environment variables**

Add các variables:

```
VITE_SUPABASE_URL=https://lewocjuvermgzzdjamad.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29janV2ZXJtZ3p6ZGphbWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIxMzgsImV4cCI6MjA3OTcyODEzOH0.VHRjR03dKvrpk5FKf4ewtRpGFKzPgpNZ8baI6oGKpWA
```

**⚠️ Lưu ý:** Sau khi add environment variables, cần **trigger redeploy**:
- Vào **Deploys** → **Trigger deploy** → **Deploy site**

---

## ✅ VERIFY DEPLOYMENT

### **1. Check Build Logs**

1. Vào Netlify Dashboard → **Deploys**
2. Click vào deploy mới nhất
3. Xem **Build log**
4. ✅ Verify build thành công (không có errors)

### **2. Test Site**

1. Click vào site URL (hoặc **Open production deploy**)
2. ✅ Verify site load được
3. ✅ Test login với Supabase account
4. ✅ Test load content từ Supabase

### **3. Check Environment Variables**

1. Vào **Site settings** → **Environment variables**
2. ✅ Verify `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` đã có
3. ✅ Verify values đúng

---

## 🔧 TROUBLESHOOTING

### **Build fails: "Module not found"**

**Solution:**
- Check `package.json` có đầy đủ dependencies
- Run `npm install` locally để verify

### **Build succeeds but site shows errors**

**Solution:**
1. Check browser console for errors
2. Verify environment variables đã được set
3. Check Netlify function logs (nếu có)

### **Supabase connection fails**

**Solution:**
1. Verify environment variables trong Netlify
2. Check Supabase URL và Anon Key đúng
3. Trigger redeploy sau khi update env vars

---

## 📊 DEPLOYMENT STATUS

Sau khi deploy xong, check:

- [ ] ✅ Build thành công
- [ ] ✅ Environment variables đã set
- [ ] ✅ Site load được
- [ ] ✅ Login hoạt động
- [ ] ✅ Content load từ Supabase
- [ ] ✅ File upload hoạt động

---

## 🎯 NEXT STEPS

Sau khi deploy xong:

1. ✅ **Apply Supabase Schema** - Run `COMPLETE_SETUP_SCRIPT.sql`
2. ✅ **Create Storage Buckets** - Tạo 3 buckets trong Supabase
3. ✅ **Test Upload** - Test upload images/audio trong app
4. ✅ **Test Content Save** - Test tạo book/lesson/quiz
5. ✅ **Monitor** - Check Netlify logs và Supabase logs

---

**🎉 Chúc bạn deploy thành công!**

