# 🔒 BÁO CÁO BẢO MẬT - KIỂM TRA F12 (DevTools)

## 📋 TÓM TẮT

Sau khi kiểm tra codebase, tôi đã phát hiện **nhiều vấn đề bảo mật nghiêm trọng** có thể bị lộ khi người dùng mở F12 (Browser DevTools). Báo cáo này liệt kê các vấn đề và đề xuất giải pháp.

---

## 🚨 CÁC VẤN ĐỀ BẢO MẬT NGHIÊM TRỌNG

### 1. 🔴 **HARDCODED SUPABASE KEYS TRONG DOCUMENTATION** (Mức độ: CAO)

**Vấn đề:**
- Supabase URL và Anon Key được hardcode trong **ít nhất 10+ file markdown**
- Các file này có thể được commit lên GitHub và ai cũng có thể xem

**Các file bị ảnh hưởng:**
- `docs/deployment/DEPLOY_TO_VERCEL_STEP_BY_STEP.md`
- `DEPLOY_READY.md`
- `docs/deployment/QUICK_MIGRATE_TO_VERCEL.md`
- `docs/deployment/START_HERE.md`
- `docs/deployment/DEPLOYMENT_CHECKLIST.md`
- `docs/deployment/NETLIFY_ALTERNATIVES.md`
- `docs/backend/NETLIFY_DEPLOYMENT.md`
- `docs/backend/DEPLOY_TO_NETLIFY.md`
- `SECURITY_APP_SETTINGS_URL_ANALYSIS.md`
- Và nhiều file khác...

**Thông tin bị lộ:**
```env
VITE_SUPABASE_URL=https://lewocjuvermgzzdjamad.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29janV2ZXJtZ3p6ZGphbWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIxMzgsImV4cCI6MjA3OTcyODEzOH0.VHRjR03dKvrpk5FKf4ewtRpGFKzPgpNZ8baI6oGKpWA
```

**⚠️ Tác động:**
- Nếu repository là **public**, bất kỳ ai cũng có thể:
  - Xem Supabase project ID
  - Sử dụng anon key để query database (nếu RLS không được cấu hình đúng)
  - Biết được cấu trúc project

**✅ Giải pháp:**
1. **Thay thế tất cả hardcoded keys bằng placeholders:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Tạo file `.env.example`** với placeholders
3. **Thêm vào `.gitignore`** để đảm bảo `.env.local` không bị commit

---

### 2. 🔴 **SERVICE ROLE KEY CÓ THỂ BỊ EXPOSE** (Mức độ: CỰC KỲ CAO)

**Vấn đề:**
- Code sử dụng `VITE_SUPABASE_SERVICE_ROLE_KEY` trong `src/services/authService.js`
- **Vite sẽ bundle TẤT CẢ biến có prefix `VITE_` vào client-side code**
- Nếu biến này được set, nó sẽ bị expose trong bundle và ai cũng có thể xem

**Vị trí trong code:**
```javascript
// src/services/authService.js (dòng 601)
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
```

**⚠️ Tác động:**
- Service Role Key có quyền **bypass Row Level Security (RLS)**
- Attacker có thể:
  - Đọc/ghi bất kỳ dữ liệu nào trong database
  - Xóa users, profiles, và tất cả dữ liệu
  - Thực hiện các thao tác admin không được phép
  - **CỰC KỲ NGUY HIỂM!**

**✅ Giải pháp:**
1. **KHÔNG BAO GIỜ** sử dụng Service Role Key trong client-side code
2. **Xóa hoàn toàn** việc sử dụng `VITE_SUPABASE_SERVICE_ROLE_KEY` trong `authService.js`
3. Nếu cần Service Role Key, chỉ sử dụng trong:
   - **Backend API** (server-side only)
   - **Supabase Edge Functions**
   - **Supabase Database Functions**
4. **Không bao giờ** đặt prefix `VITE_` cho service role key

---

### 3. 🔴 **PASSWORDS LƯU PLAINTEXT TRONG LOCALSTORAGE** (Mức độ: CAO)

**Vấn đề:**
- Passwords được lưu **plaintext** trong `localStorage` với key `userPasswords`
- Bất kỳ ai mở F12 đều có thể xem passwords của tất cả users

**Vị trí trong code:**
```javascript
// src/data/users.js (dòng 512-544)
export function saveUserPassword(userId, username, password) {
  // ...
  passwordsMap[userId] = password;  // ❌ Plaintext!
  localStorage.setItem('userPasswords', JSON.stringify(passwordsMap));
}
```

**Cách kiểm tra:**
```javascript
// Trong browser console (F12):
JSON.parse(localStorage.getItem('userPasswords'))
// Kết quả:
{
  "1": "password123",        // ❌ Plaintext
  "admin": "admin123",       // ❌ Plaintext
  "user1": "demo123"         // ❌ Plaintext
}
```

**⚠️ Tác động:**
- Bất kỳ ai có quyền truy cập browser đều có thể:
  - Xem passwords của tất cả users
  - Đăng nhập với tài khoản của người khác
  - Thực hiện các hành động với quyền của user đó

**✅ Giải pháp:**
1. **Ngắn hạn:** Chấp nhận rủi ro (vì đây là local-only authentication)
2. **Dài hạn:** Migrate users sang Supabase Auth (passwords tự động được hash)
3. **Tạm thời:** 
   - Hash passwords trước khi lưu (sử dụng bcrypt hoặc Web Crypto API)
   - Đảm bảo chỉ admin mới có quyền truy cập trang quản lý users

---

### 4. ⚠️ **ENVIRONMENT VARIABLES BỊ EXPOSE TRONG BUNDLE** (Mức độ: TRUNG BÌNH)

**Vấn đề:**
- Vite sẽ bundle **TẤT CẢ** biến có prefix `VITE_` vào client-side bundle
- Khi build, các biến này sẽ được thay thế bằng giá trị thực
- Người dùng có thể xem trong:
  - **Sources tab** (F12 → Sources)
  - **Network tab** (trong response)
  - **Console** (nếu có log)

**Các biến hiện tại:**
```javascript
VITE_SUPABASE_URL          // ✅ OK (public URL)
VITE_SUPABASE_ANON_KEY      // ✅ OK (public key, được thiết kế để expose)
VITE_SUPABASE_SERVICE_ROLE_KEY  // ❌ CỰC KỲ NGUY HIỂM (nếu có)
```

**⚠️ Lưu ý:**
- `VITE_SUPABASE_ANON_KEY` là **public key**, được thiết kế để expose
- Tuy nhiên, cần đảm bảo **RLS (Row Level Security)** được cấu hình đúng
- **KHÔNG BAO GIỜ** expose Service Role Key

**✅ Giải pháp:**
1. Chỉ sử dụng prefix `VITE_` cho các biến **an toàn để expose**
2. **KHÔNG BAO GIỜ** đặt prefix `VITE_` cho:
   - Service Role Keys
   - API Secrets
   - Database passwords
   - Private keys

---

### 5. ⚠️ **CONSOLE LOGS CÓ THỂ LỘ THÔNG TIN** (Mức độ: TRUNG BÌNH)

**Vấn đề:**
- Code có nhiều `console.log` statements
- Một số logs có thể chứa thông tin nhạy cảm

**Ví dụ:**
```javascript
// src/data/users.js
console.log('[SAVE_PASSWORD] Saving password:', {
  userId,
  username,
  passwordLength: password ? password.length : 0,  // ✅ OK (chỉ length)
  keysSaved: [userId, String(userId), username]
});
```

**⚠️ Tác động:**
- Nếu có log password, token, hoặc secret → Bị lộ ngay lập tức
- Logs có thể giúp attacker hiểu được cấu trúc hệ thống

**✅ Giải pháp:**
1. Đảm bảo không log:
   - Passwords
   - Tokens (ngoài JWT auth token)
   - API keys
   - Secrets
2. Sử dụng `debugLogger.js` để filter logs trong production
3. Xem xét remove console.log trong production build (nhưng hiện tại đang giữ lại để debug)

---

## 📊 TỔNG HỢP MỨC ĐỘ NGUY HIỂM

| Vấn đề | Mức độ | Ưu tiên | Trạng thái |
|--------|--------|---------|------------|
| Hardcoded keys trong docs | 🔴 CAO | 1 | Cần fix ngay |
| Service Role Key có thể expose | 🔴 CỰC KỲ CAO | 1 | Cần fix ngay |
| Passwords plaintext | 🔴 CAO | 2 | Cần fix |
| Env vars trong bundle | ⚠️ TRUNG BÌNH | 3 | Cần kiểm tra |
| Console logs | ⚠️ TRUNG BÌNH | 4 | Cần review |

---

## ✅ CÁC BIỆN PHÁP BẢO VỆ ĐÃ CÓ

### 1. Security Headers (trong `vercel.json`)
- ✅ `Strict-Transport-Security`: Bảo vệ HTTPS
- ✅ `X-Frame-Options: DENY`: Chống clickjacking
- ✅ `X-Content-Type-Options: nosniff`: Chống MIME sniffing
- ✅ `Content-Security-Policy`: Giới hạn resources được load

### 2. Supabase RLS (Row Level Security)
- ✅ Có RLS policies để bảo vệ dữ liệu
- ⚠️ Cần đảm bảo RLS được cấu hình đúng cho tất cả tables

### 3. Anon Key là Public Key
- ✅ `VITE_SUPABASE_ANON_KEY` được thiết kế để expose
- ✅ Anon key chỉ có quyền hạn chế (theo RLS policies)

---

## 🛠️ HÀNH ĐỘNG CẦN THỰC HIỆN

### Ưu tiên 1: Fix ngay lập tức

1. **Xóa Service Role Key khỏi client-side code**
   - File: `src/services/authService.js`
   - Xóa tất cả references đến `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - Nếu cần admin operations, sử dụng Supabase Edge Functions hoặc backend API

2. **Thay thế hardcoded keys trong documentation**
   - Thay tất cả hardcoded keys bằng placeholders
   - Tạo file `.env.example` với placeholders

### Ưu tiên 2: Fix trong thời gian ngắn

3. **Hash passwords trước khi lưu vào localStorage**
   - Sử dụng Web Crypto API hoặc bcrypt
   - File: `src/data/users.js`

4. **Review và clean up console logs**
   - Đảm bảo không log thông tin nhạy cảm
   - Sử dụng `debugLogger.js` để filter logs

### Ưu tiên 3: Cải thiện dài hạn

5. **Migrate users sang Supabase Auth**
   - Passwords sẽ tự động được hash
   - Multi-device support
   - Better security

6. **Thêm security audit vào CI/CD**
   - Kiểm tra không có hardcoded secrets
   - Kiểm tra không có service role key trong code

---

## 📝 CHECKLIST KIỂM TRA

### Trước khi deploy:

- [ ] Không có hardcoded keys trong code
- [ ] Không có Service Role Key trong client-side code
- [ ] Passwords được hash (hoặc chấp nhận rủi ro)
- [ ] Console logs không chứa thông tin nhạy cảm
- [ ] `.env.local` không bị commit vào git
- [ ] `.gitignore` có `.env*` files
- [ ] RLS policies được cấu hình đúng
- [ ] Security headers được set

### Sau khi deploy:

- [ ] Mở F12 và kiểm tra:
  - [ ] Console tab: Không có passwords, secrets
  - [ ] Network tab: Response không có passwords
  - [ ] Application tab: localStorage không có passwords plaintext
  - [ ] Sources tab: Không có hardcoded keys
- [ ] Test với incognito mode
- [ ] Test với user không có quyền admin

---

## 📚 TÀI LIỆU THAM KHẢO

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OWASP Information Disclosure](https://owasp.org/www-community/vulnerabilities/Information_exposure)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)

---

## 🔄 QUY TRÌNH KIỂM TRA ĐỊNH KỲ

1. **Sau mỗi lần deploy:** Chạy checklist này
2. **Trước khi release:** Kiểm tra kỹ tất cả các tab F12
3. **Khi thêm feature mới:** Đảm bảo không expose thông tin nhạy cảm
4. **Định kỳ:** Review code để tìm hardcoded secrets

---

**Lưu ý:** Báo cáo này chỉ liệt kê các vấn đề đã phát hiện. Để kiểm tra chuyên sâu, nên sử dụng các công cụ như:
- OWASP ZAP
- Burp Suite
- Security headers checker
- GitGuardian (để scan secrets trong git)

