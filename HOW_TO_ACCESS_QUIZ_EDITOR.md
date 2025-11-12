# 🔒 Cách Truy Cập Quiz Editor Tool (Protected)

## ⚠️ Lưu ý quan trọng

**Tool này được bảo vệ bằng password!** Chỉ quản trị viên mới có thể truy cập.

---

## 📍 Cách truy cập

### Bước 1: Truy cập URL

**Development (Local):**
```
http://localhost:5173/admin/quiz-editor
```

**Production:**
```
https://your-domain.com/admin/quiz-editor
```

Hoặc gõ trực tiếp: `/admin/quiz-editor` vào thanh địa chỉ

### Bước 2: Nhập mật khẩu

- Màn hình đăng nhập sẽ hiển thị
- Nhập mật khẩu admin (mặc định: `admin123`)
- Click "Đăng nhập"

### Bước 3: Sử dụng tool

- Sau khi đăng nhập thành công, bạn có thể sử dụng tool
- Session sẽ được lưu trong browser (hết hạn khi đóng browser)
- Có thể đăng xuất bằng nút "Đăng xuất" ở cuối trang

---

## 🔐 Thay đổi mật khẩu

Mật khẩu được lưu trong file `src/pages/QuizEditorPage.jsx`:

```javascript
const ADMIN_PASSWORD = 'admin123'; // Thay đổi password này!
```

**Cách thay đổi:**
1. Mở file `src/pages/QuizEditorPage.jsx`
2. Tìm dòng: `const ADMIN_PASSWORD = 'admin123';`
3. Thay đổi `'admin123'` thành mật khẩu mới
4. Lưu file và rebuild app

---

## 🛡️ Bảo mật

- ✅ Link đã được ẩn khỏi Footer (không công khai)
- ✅ Yêu cầu password để truy cập
- ✅ Session chỉ lưu trong browser (không persistent)
- ✅ Tự động logout khi đóng browser

**⚠️ Lưu ý:** Đây là bảo vệ cơ bản. Để bảo mật cao hơn, nên:
- Sử dụng authentication server-side
- Hoặc environment variables cho password
- Hoặc JWT tokens

---

## 💡 Tips

### Tip 1: Bookmark
- Bookmark URL này để truy cập nhanh sau này
- Hoặc thêm vào bookmark bar của browser

### Tip 2: Shortcut
- Có thể tạo shortcut trên desktop (Windows) hoặc dock (Mac)
- Hoặc thêm vào home screen (mobile)

### Tip 3: Nhớ URL
- URL pattern: `/admin/quiz-editor`
- Dễ nhớ: "admin" + "quiz-editor"

---

## ⚠️ Lưu ý

- Tool này không yêu cầu đăng nhập (hiện tại)
- Có thể truy cập từ bất kỳ đâu trong app
- Link có trong Footer để dễ tìm

---

## 🎯 Quick Access

**Nhấn Ctrl+L (hoặc Cmd+L trên Mac)** và gõ:
```
/admin/quiz-editor
```

Rồi Enter! ✨

