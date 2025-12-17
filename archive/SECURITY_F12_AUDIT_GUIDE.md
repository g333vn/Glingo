# 🔒 Hướng Dẫn Kiểm Tra Bảo Mật Khi Mở F12 (DevTools)

## ⚠️ Mục Đích

Khi người dùng nhấn **F12** (mở Browser DevTools), họ có thể xem được nhiều thông tin về website của bạn. Hướng dẫn này giúp bạn kiểm tra và đảm bảo không có thông tin nhạy cảm nào bị lộ.

---

## 📋 Checklist Kiểm Tra

### 1. 🔍 Tab **Console** (Quan Trọng Nhất)

#### ✅ Kiểm Tra:

**1.1. Environment Variables (Biến Môi Trường)**
```javascript
// ❌ NGUY HIỂM: Nếu thấy trong console
console.log(import.meta.env.VITE_SUPABASE_URL)  // URL có thể OK
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)  // Anon key OK (public)
console.log(import.meta.env.VITE_SUPABASE_SERVICE_KEY)  // ❌ SERVICE KEY - CỰC KỲ NGUY HIỂM!
console.log(process.env.API_SECRET)  // ❌ SECRET - NGUY HIỂM!
```

**⚠️ Lưu ý:**
- `VITE_SUPABASE_ANON_KEY` là **public key**, OK để expose
- `VITE_SUPABASE_SERVICE_KEY` là **private key**, **KHÔNG BAO GIỜ** expose
- Bất kỳ biến nào có `SECRET`, `PRIVATE`, `PASSWORD` đều nguy hiểm

**1.2. Debug Logs Chứa Thông Tin Nhạy Cảm**
```javascript
// ❌ NGUY HIỂM: Log password, token, user data
console.log('Password:', password)  // ❌
console.log('User token:', token)  // ❌
console.log('API Key:', apiKey)  // ❌
console.log('User data:', { id: 1, password: '123' })  // ❌

// ✅ AN TOÀN: Log không chứa thông tin nhạy cảm
console.log('User logged in:', username)  // ✅
console.log('[GETUSERS] Loaded users count:', count)  // ✅
```

**1.3. Error Messages Chứa Thông Tin Nhạy Cảm**
```javascript
// ❌ NGUY HIỂM: Error message lộ thông tin
console.error('Database connection failed:', 'postgres://user:pass@host/db')  // ❌
console.error('API call failed:', { url: 'https://api.com', key: 'secret123' })  // ❌

// ✅ AN TOÀN: Error message generic
console.error('Database connection failed')  // ✅
console.error('API call failed: 401 Unauthorized')  // ✅
```

**1.4. Comments Trong Code**
- Mở **View Source** (Ctrl+U) hoặc **Sources** tab
- Tìm các comment HTML: `<!-- ... -->`
- Tìm các comment JavaScript: `// ...` hoặc `/* ... */`

```html
<!-- ❌ NGUY HIỂM: Comment chứa thông tin nhạy cảm -->
<!-- API_KEY=sk_live_1234567890 -->
<!-- Admin panel: /admin/secret-path -->
<!-- Database: postgres://user:pass@host/db -->
```

---

### 2. 🌐 Tab **Network** (Kiểm Tra Request/Response)

#### ✅ Kiểm Tra:

**2.1. Request Headers**
- Mở một request bất kỳ → Tab **Headers**
- Kiểm tra **Request Headers**:

```http
❌ NGUY HIỂM:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // JWT token
X-API-Key: sk_live_1234567890  // API key
Cookie: session=secret_token_here  // Session token
```

**⚠️ Lưu ý:**
- JWT tokens trong headers là **bình thường** (cần cho authentication)
- Nhưng đảm bảo token có **expiry time** hợp lý
- Không hardcode tokens trong code

**2.2. Response Headers**
- Kiểm tra **Response Headers**:

```http
❌ NGUY HIỂM:
X-Server-Version: 1.2.3  // Lộ version có thể giúp attacker
X-Powered-By: Express/4.18.1  // Lộ framework version
Server: nginx/1.20.1  // Lộ server version
```

**✅ Tốt:**
- Bạn đã có security headers trong `vercel.json`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security`
  - `Content-Security-Policy`

**2.3. Request/Response Body**
- Mở một request → Tab **Payload** hoặc **Response**
- Kiểm tra có thông tin nhạy cảm không:

```json
❌ NGUY HIỂM:
{
  "user": {
    "id": 1,
    "password": "plaintext_password",  // ❌ Password plaintext
    "email": "user@example.com",
    "creditCard": "1234-5678-9012-3456"  // ❌ Credit card
  }
}

✅ AN TOÀN:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
    // Không có password, credit card, etc.
  }
}
```

**2.4. API Endpoints Lộ Thông Tin**
```http
❌ NGUY HIỂM: Endpoint lộ thông tin về cấu trúc
GET /api/admin/users/delete-all  // Lộ admin endpoint
GET /api/internal/config  // Lộ internal endpoint
GET /api/backup/download  // Lộ backup endpoint

✅ AN TOÀN: Endpoint generic
GET /api/users
POST /api/auth/login
```

---

### 3. 💾 Tab **Application** / **Storage**

#### ✅ Kiểm Tra:

**3.1. localStorage**
- Vào **Application** → **Local Storage** → Chọn domain của bạn
- Kiểm tra các key:

```javascript
❌ NGUY HIỂM:
localStorage.getItem('password')  // ❌ Password plaintext
localStorage.getItem('apiKey')  // ❌ API key
localStorage.getItem('creditCard')  // ❌ Credit card
localStorage.getItem('supabase.service_key')  // ❌ Service key

✅ AN TOÀN (trong project của bạn):
localStorage.getItem('sb-glingo-auth-token')  // ✅ JWT token (OK)
localStorage.getItem('adminUsers')  // ✅ User metadata (OK, không có password)
localStorage.getItem('userPasswords')  // ⚠️ Cần kiểm tra - có password không?
```

**⚠️ Lưu ý cho project của bạn:**
- `sb-glingo-auth-token`: JWT token từ Supabase - **OK** (có expiry)
- `adminUsers`: User metadata - **OK** (không có password)
- `userPasswords`: **⚠️ CẢNH BÁO BẢO MẬT** - Passwords được lưu **PLAINTEXT** trong localStorage

**🔴 Vấn đề với userPasswords:**
```javascript
// Trong console, chạy:
JSON.parse(localStorage.getItem('userPasswords'))
// Kết quả có thể là:
{
  "1": "password123",        // ❌ Password plaintext
  "admin": "admin123",       // ❌ Password plaintext
  "user1": "demo123"         // ❌ Password plaintext
}
```

**⚠️ Tại sao đây là vấn đề:**
- Bất kỳ ai mở F12 đều có thể xem passwords của tất cả users
- Nếu ai đó có quyền truy cập máy tính/browser, họ có thể đọc được passwords
- Passwords không được hash hoặc encrypt

**✅ Giải pháp (nếu cần):**
- Với local-only users: Đây là hạn chế của hệ thống local authentication
- Nếu cần bảo mật cao hơn: Nên migrate users sang Supabase Auth (passwords được hash tự động)
- Tạm thời: Đảm bảo chỉ admin mới có quyền truy cập trang quản lý users

**3.2. sessionStorage**
- Tương tự localStorage, kiểm tra có thông tin nhạy cảm không

**3.3. Cookies**
- Vào **Application** → **Cookies**
- Kiểm tra:

```javascript
❌ NGUY HIỂM:
Cookie: session=plaintext_token  // ❌ Không có HttpOnly flag
Cookie: password=admin123  // ❌ Password trong cookie

✅ AN TOÀN:
Cookie: session=encrypted_token; HttpOnly; Secure; SameSite=Strict  // ✅
```

---

### 4. 📁 Tab **Sources**

#### ✅ Kiểm Tra:

**4.1. Source Maps**
- Nếu có file `.map` trong **Sources**:
  - Source maps có thể expose **toàn bộ source code**
  - **Không nên** deploy source maps lên production

**4.2. Environment Variables Trong Code**
- Tìm trong code đã build:

```javascript
// ❌ NGUY HIỂM: Hardcoded values
const apiKey = 'sk_live_1234567890';  // ❌
const dbUrl = 'postgres://user:pass@host/db';  // ❌

// ✅ AN TOÀN: Environment variables
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;  // ✅
```

**4.3. Comments Trong Build Files**
- Kiểm tra file JavaScript đã build có comment nhạy cảm không
- Comments trong production build thường bị minify/remove, nhưng cần kiểm tra

---

### 5. 🏗️ Tab **Elements**

#### ✅ Kiểm Tra:

**5.1. HTML Comments**
- Right-click → **Inspect Element**
- Tìm các comment HTML:

```html
<!-- ❌ NGUY HIỂM -->
<!-- API_KEY=sk_live_1234567890 -->
<!-- TODO: Change password before production -->
<!-- Admin: /admin/secret-path -->
```

**5.2. Data Attributes Chứa Thông Tin Nhạy Cảm**
```html
❌ NGUY HIỂM:
<div data-api-key="sk_live_1234567890"></div>
<div data-password="admin123"></div>
<div data-user-id="1" data-user-role="admin"></div>  // ⚠️ Có thể OK nếu cần cho UI

✅ AN TOÀN:
<div data-user-id="1"></div>  // ✅ OK nếu chỉ là ID
<div data-role="user"></div>  // ✅ OK nếu chỉ là role public
```

**5.3. Inline Scripts**
```html
❌ NGUY HIỂM:
<script>
  const API_KEY = 'sk_live_1234567890';  // ❌
  const SECRET = 'abc123';  // ❌
</script>
```

---

## 🔍 Cách Kiểm Tra Cụ Thể Cho Project Của Bạn

### Bước 1: Mở DevTools (F12)

### Bước 2: Kiểm Tra Console

1. **Tìm các log chứa thông tin nhạy cảm:**
   ```javascript
   // Trong console, tìm:
   - Password
   - Secret
   - API_KEY (ngoài VITE_SUPABASE_ANON_KEY)
   - Token (ngoài JWT auth token)
   - Database connection strings
   ```

2. **Kiểm tra environment variables:**
   ```javascript
   // Trong console, chạy:
   console.log(import.meta.env)
   // Chỉ nên thấy:
   // - VITE_SUPABASE_URL ✅
   // - VITE_SUPABASE_ANON_KEY ✅
   // KHÔNG nên thấy SERVICE_KEY, SECRET, PASSWORD ❌
   ```

### Bước 3: Kiểm Tra Network

1. **Reload trang (F5)**
2. **Mở tab Network**
3. **Kiểm tra từng request:**
   - Click vào request → Tab **Headers**
   - Kiểm tra **Request Headers** có API key hardcoded không
   - Kiểm tra **Response** có password, secret không

### Bước 4: Kiểm Tra Application/Storage

1. **Vào tab Application**
2. **Kiểm tra Local Storage:**
   ```javascript
   // Trong console, chạy:
   Object.keys(localStorage).forEach(key => {
     console.log(key, localStorage.getItem(key))
   })
   ```
3. **Kiểm tra:**
   - `userPasswords`: Đảm bảo passwords được hash, không phải plaintext
   - `adminUsers`: Đảm bảo không có password field
   - `sb-glingo-auth-token`: JWT token - OK (có expiry)

### Bước 5: Kiểm Tra View Source

1. **Right-click trang → View Page Source** (Ctrl+U)
2. **Tìm các comment HTML:**
   ```html
   <!-- Tìm các comment chứa: -->
   - API_KEY
   - PASSWORD
   - SECRET
   - TOKEN
   - Database
   - Admin path
   ```

---

## ✅ Checklist Tổng Hợp

### Console Tab
- [ ] Không có log password, secret, API key (ngoài anon key)
- [ ] Không có error message lộ thông tin nhạy cảm
- [ ] Environment variables chỉ có public keys (VITE_SUPABASE_ANON_KEY OK)

### Network Tab
- [ ] Request headers không có hardcoded API keys
- [ ] Response không có password, credit card, sensitive data
- [ ] Response headers không lộ server version, framework version

### Application/Storage Tab
- [ ] localStorage không có password plaintext
- [ ] localStorage không có API keys (ngoài anon key)
- [ ] Cookies có HttpOnly, Secure flags (nếu có)

### Sources Tab
- [ ] Không có source maps trong production
- [ ] Code không có hardcoded secrets
- [ ] Comments không chứa thông tin nhạy cảm

### Elements Tab
- [ ] HTML comments không chứa thông tin nhạy cảm
- [ ] Data attributes không chứa passwords, secrets
- [ ] Inline scripts không có hardcoded secrets

---

## 🛡️ Các Biện Pháp Bảo Vệ Đã Có

### ✅ Security Headers (trong `vercel.json`)
- `Strict-Transport-Security`: Bảo vệ HTTPS
- `X-Frame-Options: DENY`: Chống clickjacking
- `X-Content-Type-Options: nosniff`: Chống MIME sniffing
- `Content-Security-Policy`: Giới hạn resources được load
- `Referrer-Policy`: Kiểm soát referrer information

### ✅ Environment Variables
- Chỉ expose `VITE_SUPABASE_ANON_KEY` (public key)
- `VITE_SUPABASE_SERVICE_KEY` không được expose (nếu có)

### ✅ Debug Logs
- Có `debugLogger.js` để filter debug logs trong production
- Debug logs chỉ hiển thị khi có flag `debugEnabled`

---

## ⚠️ Các Vấn Đề Cần Kiểm Tra Thêm

### 1. 🔴 userPasswords trong localStorage (VẤN ĐỀ BẢO MẬT)
- **Tình trạng hiện tại:** Passwords được lưu **PLAINTEXT** trong localStorage
- **Mức độ nguy hiểm:** ⚠️ **CAO** - Bất kỳ ai mở F12 đều có thể xem passwords
- **Cách kiểm tra:**
  ```javascript
  // Trong console (F12):
  const passwords = JSON.parse(localStorage.getItem('userPasswords'));
  console.log(passwords);
  // Nếu thấy passwords plaintext → Vấn đề bảo mật
  ```
- **Giải pháp:**
  - **Ngắn hạn:** Chấp nhận rủi ro (vì đây là local-only authentication)
  - **Dài hạn:** Migrate users sang Supabase Auth (passwords tự động được hash)
  - **Tạm thời:** Đảm bảo chỉ admin mới có quyền truy cập trang quản lý users

### 2. Console Logs trong Production
- **Kiểm tra:** Có quá nhiều debug logs không?
- **Giải pháp:** Đảm bảo `debugLogger.js` hoạt động đúng

### 3. Source Maps
- **Kiểm tra:** Có file `.map` trong production build không?
- **Giải pháp:** Không deploy source maps lên production

---

## 📚 Tài Liệu Tham Khảo

- [OWASP Information Disclosure](https://owasp.org/www-community/vulnerabilities/Information_exposure)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

---

## 🔄 Quy Trình Kiểm Tra Định Kỳ

1. **Sau mỗi lần deploy:** Chạy checklist này
2. **Trước khi release:** Kiểm tra kỹ tất cả các tab
3. **Khi thêm feature mới:** Đảm bảo không expose thông tin nhạy cảm

---

**Lưu ý:** Hướng dẫn này giúp bạn tự audit website. Để kiểm tra chuyên sâu, nên sử dụng các công cụ như:
- OWASP ZAP (đã có trong project)
- Burp Suite
- Security headers checker

