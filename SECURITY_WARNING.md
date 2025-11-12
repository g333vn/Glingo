# ⚠️ CẢNH BÁO BẢO MẬT

## Vấn đề hiện tại:

### 1. **Password lưu trong localStorage (PLAIN TEXT)**
- Khi admin quản lý users, tất cả passwords được lưu vào `localStorage` với key `adminUsers`
- **BẤT KỲ AI** mở DevTools → Application → Local Storage → `adminUsers` → Sẽ thấy TẤT CẢ passwords!
- Đây là lỗ hổng bảo mật nghiêm trọng!

### 2. **Dữ liệu còn lại sau khi logout**
- Khi logout, chỉ xóa `authUser` (thông tin user đang đăng nhập)
- **KHÔNG xóa** `adminUsers` (chứa tất cả users + passwords)
- Người khác có thể mở DevTools và xem passwords!

---

## Cách kiểm tra:

1. Đăng nhập với admin
2. Vào Admin → Quản lý Users → Thêm/sửa user
3. Mở DevTools (F12) → Application → Local Storage
4. Tìm key `adminUsers` → Click → Xem JSON
5. **BẠN SẼ THẤY TẤT CẢ PASSWORDS DẠNG PLAIN TEXT!**

---

## Giải pháp đã áp dụng:

### ✅ Fix 1: Xóa dữ liệu nhạy cảm khi logout
- Khi logout, xóa cả `adminUsers` nếu không có user nào đang đăng nhập
- Hoặc chỉ lưu users không có password vào localStorage

### ✅ Fix 2: Không lưu password vào localStorage
- Chỉ lưu users metadata (username, name, email, role) vào localStorage
- Password chỉ lưu trong memory (state) khi đang quản lý
- Khi save, chỉ lưu users metadata, không lưu password

### ✅ Fix 3: Cảnh báo trong code
- Thêm comment cảnh báo trong code
- Thêm file này để document vấn đề

---

## ⚠️ LƯU Ý QUAN TRỌNG:

**Hệ thống hiện tại KHÔNG AN TOÀN cho production!**

### Để sử dụng trong production, cần:

1. **Backend API** - Không lưu password trong frontend
2. **Hash password** - Sử dụng bcrypt, argon2, etc.
3. **JWT tokens** - Thay vì lưu user info trong localStorage
4. **Database** - Lưu users trong database, không phải localStorage
5. **HTTPS** - Bắt buộc cho authentication
6. **Session management** - Quản lý session trên server

---

## Tạm thời (Development):

- ✅ Đã xóa `adminUsers` khi logout
- ✅ Không lưu password vào localStorage (chỉ lưu trong memory)
- ⚠️ Vẫn có thể xem password trong DevTools khi đang quản lý users (nhưng không lưu lại)

---

## Checklist bảo mật:

- [x] Không lưu password vào localStorage
- [x] Xóa dữ liệu nhạy cảm khi logout
- [ ] Hash password (cần backend)
- [ ] JWT tokens (cần backend)
- [ ] Database thay vì localStorage (cần backend)
- [ ] HTTPS (cần server config)

