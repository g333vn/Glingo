## 🔐 Hướng Dẫn Ẩn Thông Tin Khi F12 (DevTools) – Bản Production

Tài liệu này giải thích **vì sao khi F12 có thể thấy rất nhiều thông tin**, site chuyên nghiệp trông “trống trơn” hơn, và **bạn cần làm gì khi build production** để giảm tối đa rủi ro lộ thông tin.

---

## 1. Sự Thật Cần Hiểu Rõ

- **Bất kỳ web front‑end nào** cũng phải gửi **HTML/CSS/JS** xuống máy người dùng → tuyệt đối không thể giấu 100%.  
- Mục tiêu **thực tế**:
  - Không để lộ **thông tin nhạy cảm** (mật khẩu, token, secret, data nội bộ).  
  - Giảm tối đa **log debug, error chi tiết, cấu trúc nội bộ** xuất hiện trong F12.  
  - Chỉ giữ lại **những gì UI cần** để hoạt động.

---

## 2. Những Gì F12 Có Thể “Lộ”

### 2.1. Tab Console

- Thường thấy:
  - `console.log` chứa:
    - Toàn bộ object `user`, `profile`, `session`, `response`…  
    - Email, ID, role, lỗi chi tiết.  
  - Lỗi kỹ thuật: stack trace, message SQL/RLS, lỗi Supabase, v.v.

### 2.2. Tab Network

- Thấy toàn bộ:
  - URL endpoint, query params, body gửi đi.  
  - JSON response từ API/Supabase, nhiều field không dùng cho UI.  
  - Message lỗi chi tiết từ server.

### 2.3. Tab Sources

- Xem được:
  - Bundle JS đã build (minify nhưng vẫn đọc được logic).  
  - Nếu bật **source map**, có thể xem gần giống file `.jsx`, `.js` gốc: tên file, tên hàm, comment.

### 2.4. Tab Application (LocalStorage / SessionStorage / Cookies)

- Thường lộ:
  - `localStorage` chứa `authUser` với email, id, role, metadata đầy đủ.  
  - Các config JSON (access control, maintenance mode, v.v.).  
  - Có thể cả token nếu lưu sai chỗ.

### 2.5. DOM / UI

- Text lỗi kỹ thuật, route ẩn, đường link admin, v.v. có thể bị lộ ngay trong HTML.

---

## 3. Mục Tiêu “Chuẩn Site Chuyên Nghiệp”

Không phải F12 hoàn toàn rỗng, mà là:

- **Console**: gần như không có log debug; chỉ có vài lỗi chung chung, không nhạy cảm.  
- **Network**: 
  - API trả về **dữ liệu tối thiểu** đúng những gì UI cần.  
  - Message lỗi user-friendly, không chứa SQL/policy nội bộ.  
- **Storage**:
  - Không có mật khẩu/secret.  
  - Token nếu có thì ở dạng **khó khai thác**, tốt nhất là cookie httpOnly.  
- **Sources**:
  - JS đã minify, không comment, có thể tắt source map cho production.  
- **UI**:
  - Người dùng thấy thông điệp thân thiện, **không thấy** lỗi hệ thống nội bộ.

---

## 4. Checklist Khi Chuẩn Bị Build Production

### 4.1. Console – Dọn Log

- [ ] Xoá hoặc tắt:
  - [ ] `console.log` in ra object `user`, `profile`, `session`, `response`.  
  - [ ] Các log có chứa email, id, token, thông tin nhạy cảm.  
  - [ ] Log flow nội bộ `[AUTH]`, `[AuthContext]`, `[Service]` dùng để debug.  
- [ ] Chỉ giữ:
  - [ ] Một vài log error **rất chung chung** (nếu thực sự cần).  
  - [ ] Hoặc chuyển sang **log về server** (Sentry, LogRocket, …) thay vì in ra console.

### 4.2. Network – Tối Giản Dữ Liệu API

- [ ] Với mỗi API, kiểm tra:
  - [ ] Response chỉ trả về field cần hiển thị (không dùng `SELECT *` bừa bãi).  
  - [ ] Không trả về mật khẩu, token, secret, cấu trúc nội bộ.  
  - [ ] Message lỗi client nhận được **ngắn gọn, user-friendly**.  
  - [ ] Chi tiết lỗi (stack trace, SQL, policy) chỉ log ở backend.  
- [ ] Request:
  - [ ] Không truyền token/secret qua query string (URL).  
  - [ ] Chỉ truyền những gì cần thiết cho operation.

### 4.3. Sources – Minify & Source Map

- [ ] Bật **minify** cho JS/CSS trong build production.  
- [ ] Xoá comment không cần thiết khỏi bundle.  
- [ ] Cân nhắc:
  - [ ] Tắt source map trên production, hoặc  
  - [ ] Chỉ bật tạm thời khi cần debug, sau đó tắt lại.

### 4.4. Storage – LocalStorage / Cookies

- [ ] Không bao giờ:
  - [ ] Lưu mật khẩu.  
  - [ ] Lưu secret, key server, thông tin cấu hình nội bộ.  
- [ ] Hạn chế:
  - [ ] Lưu full profile / access control JSON đầy đủ trong `localStorage`.  
  - [ ] Lưu access token/refresh token ở localStorage (rủi ro XSS).  
- [ ] Nên:
  - [ ] Lưu những gì **thuần UI**: theme, language, vài flag.  
  - [ ] Nếu cần lưu thông tin user: chỉ id + displayName + role (khi thật sự cần).  
  - [ ] Ưu tiên token trong **cookie httpOnly** (JS không đọc được).

#### 📋 Danh sách key localStorage trong dự án này

| Key | Loại | Trạng thái |
|-----|------|------------|
| `theme`, `language`, `locale` | UI | ✅ An toàn |
| `levelAccessControl`, `jlptAccessControl` | Config | ✅ An toàn (public config) |
| `systemSettings` | Config | ✅ An toàn |
| `adminBooks_*` | Cache | ✅ An toàn |
| `sb-*-auth-token` | Auth | ✅ Supabase SDK quản lý (chấp nhận) |
| `adminUsers` | User | ✅ **ĐÃ FIX**: Tự động xoá password khi lưu |
| `userPasswords` | Auth | ✅ **ĐÃ FIX**: Migrate sang hash + obfuscate |
| `authUser` → `_au_` | Auth | ✅ **ĐÃ FIX**: Chỉ lưu id + displayName + role |

#### 🛠️ Đã triển khai

**1. `src/utils/secureStorage.js`** - Whitelist & auto-redact
- Whitelist: Chỉ cho phép lưu các key an toàn.
- Auto-redact: Tự động xoá field nhạy cảm trước khi lưu.
- `secureStorage.audit()`: Kiểm tra localStorage.
- `secureStorage.clearSensitive()`: Xoá data nhạy cảm khi logout.

**2. `src/utils/secureUserStorage.js`** - Quản lý user an toàn
- `savePasswordSecure()`: Hash password (SHA-256) + obfuscate key + value.
- `verifyUserPassword()`: Verify password với hash đã lưu.
- `migratePasswords()`: Tự động migrate passwords cũ sang secure storage.
- `saveAuthUser()` / `getAuthUser()`: Chỉ lưu id + displayName + role.
- `saveAdminUsers()`: Tự động xoá password trước khi lưu.
- `initSecureStorage()`: Chạy khi app khởi động, migrate dữ liệu cũ.

**3. Cập nhật các file sử dụng:**
- `src/App.jsx`: Gọi `initSecureStorage()` khi app khởi động.
- `src/data/users.js`: Dùng `savePasswordSecure()` thay vì plaintext.
- `src/pages/admin/UsersManagementPage.jsx`: Dùng `saveAdminUsers()`.

### 4.5. UI / Thông Báo Lỗi

- [x] Thay thế:
  - [x] Thông báo lỗi kỹ thuật (SQL, RLS, stack trace…) → thông báo chung cho người dùng.  
- [x] Giữ:
  - [x] Log chi tiết ở backend / hệ thống log.  
  - [x] Mã lỗi (error code) để bạn tra trong log nội bộ.

#### 🛠️ Đã triển khai: `src/utils/uiErrorHandler.js`

- `getErrorMessage(error, context)`: Chuyển error kỹ thuật → message user-friendly.
- `showErrorAlert(error, context)`: Hiển thị alert với message sạch.
- `createErrorState(error)`: Tạo object `{ type: 'error', text: ... }` cho state.
- `ERROR_MESSAGES`: Map các loại lỗi phổ biến sang tiếng Việt.

**Đã cập nhật các file:**
- `ContentManagementPage.jsx` - Upload, Save, Delete errors
- `ExportImportPage.jsx` - Export, Import errors
- `SettingsPage.jsx` - Save, Export errors
- `ExamManagementPage.jsx` - Upload errors
- `QuizEditorPage.jsx` - Folder selection errors

### 4.6. Header / Bảo Mật

- [x] Giữ đầy đủ security headers:
  - [x] `Strict-Transport-Security` ✅ `max-age=31536000; includeSubDomains; preload`
  - [x] `Content-Security-Policy` ✅ Full CSP policy
  - [x] `X-Frame-Options` ✅ `DENY`
  - [x] `X-Content-Type-Options` ✅ `nosniff`
  - [x] `Referrer-Policy` ✅ `strict-origin-when-cross-origin`
  - [x] `Cache-Control` ⚠️ Cấu hình qua Vercel Dashboard (xem `VERCEL_DASHBOARD_CACHE_CONTROL_STEPS.md`)
- [x] Hạn chế header tiết lộ version: Vercel tự động ẩn server version.

#### 🛠️ Đã cấu hình: `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Content-Security-Policy", "value": "..." },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### 🔍 Kiểm tra headers

```bash
# Chạy script verify
npm run verify:headers -- https://your-site.vercel.app/

# Hoặc dùng curl
curl -I https://your-site.vercel.app/ | grep -i "strict\|content-security\|x-frame\|x-content\|referrer"
```

#### 🌐 Kiểm tra online

- [securityheaders.com](https://securityheaders.com) → Nhập URL → Scan → Mục tiêu: **A** hoặc **A+**
- [observatory.mozilla.org](https://observatory.mozilla.org) → Scan

---

## 5. Cách Tự Đánh Giá Sau Khi Deploy

Sau khi deploy bản production, hãy:

1. **Mở site production** → F12 → kiểm tra:
   - Tab Console: 
     - [ ] Có còn log debug `[AUTH]`, `[Service]` không?  
     - [ ] Có lộ email, token, object lớn không?  
   - Tab Network:
     - [ ] Response API có trả thừa field không?  
     - [ ] Message lỗi có an toàn chưa?  
   - Tab Application:
     - [ ] localStorage/cookies có chứa dữ liệu nhạy cảm không?  
   - Tab Sources:
     - [ ] JS đã minify, source map có hợp lý không?

2. So sánh với một site chuyên nghiệp mà bạn tham khảo:
   - Nếu F12 của bạn **ít log, ít data dư, không lộ secret** → bạn đang ở mức tốt.  
   - Nếu vẫn thấy nhiều thông tin “nội bộ” → quay lại checklist ở trên và dọn tiếp.

---

## 6. Thông Điệp Cuối

- Không thể biến F12 thành “hộp đen tuyệt đối”, nhưng bạn có thể:
  - **Không lộ bí mật**,  
  - **Không lộ dữ liệu người dùng nhạy cảm**,  
  - **Không lộ logic nội bộ và lỗi kỹ thuật thô**,  
  - Và làm cho site của bạn trông **gọn gàng, chuyên nghiệp** khi người khác mở DevTools.

Chỉ cần bạn kiểm tra lại **theo checklist ở mục 4** trước mỗi lần deploy production, mức độ an toàn và “chuyên nghiệp” của F12 sẽ tăng lên rất nhiều.


