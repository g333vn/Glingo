# 🔒 Sửa lỗi Access Control không hoạt động

## 🐛 Vấn đề

Các level bị khóa (set "Chặn tất cả") vẫn hiển thị và có thể truy cập, không hiện icon khóa.

## ✅ Đã sửa

### 1. **Sửa logic lấy role từ profile**
- **Vấn đề**: `hasAccess` check `user?.role`, nhưng role nằm trong `profile`, không phải `user`
- **Đã sửa**: Merge `user` và `profile` để lấy role trước khi gọi `hasAccess`
- **Files**: `AccessGuard.jsx`, `LevelPage.jsx`, `JLPTPage.jsx`

### 2. **Sửa logic `initializeDefaultConfigs`**
- **Vấn đề**: Hàm này ghi đè tất cả config về mặc định (`accessType: 'all'`) mỗi khi load page
- **Đã sửa**: Chỉ set default cho levels chưa có config, không ghi đè config đã lưu
- **File**: `accessControlManager.js`

### 3. **Thêm logging để debug**
- **Đã thêm**: Logging chi tiết trong `hasAccess`, `LevelPage`, `JLPTPage`
- **Mục đích**: Dễ dàng debug và kiểm tra config

## 🔍 Cách kiểm tra

### Bước 1: Kiểm tra config trong localStorage

Chạy script trong Browser Console:

```javascript
// Kiểm tra config
const levelConfigs = JSON.parse(localStorage.getItem('levelAccessControl') || '{}');
const jlptConfigs = JSON.parse(localStorage.getItem('jlptAccessControl') || '{}');

console.log('LEVEL configs:', levelConfigs);
console.log('JLPT configs:', jlptConfigs);

// Kiểm tra từng level
['n1', 'n2', 'n3', 'n4', 'n5'].forEach(level => {
  const config = levelConfigs[level];
  console.log(`${level.toUpperCase()}:`, config?.accessType || 'all (default)');
});
```

### Bước 2: Kiểm tra Console log

1. Mở Browser Console (F12)
2. Refresh trang Level hoặc JLPT
3. Xem log `[ACCESS]` và `[LevelPage]` hoặc `[JLPTPage]`
4. Kiểm tra:
   - Module config có đúng không?
   - Level config có đúng không?
   - User role có được detect đúng không?
   - Access map có đúng không?

### Bước 3: Test với user khác

1. Đăng xuất (guest user)
2. Truy cập level bị khóa
3. Kiểm tra:
   - Icon khóa có hiển thị không?
   - Click vào có bị chặn không?
   - Console log có báo "BLOCKED" không?

## 📊 Kết quả mong đợi

Sau khi sửa:
- ✅ Level bị khóa (accessType: 'none') → hiển thị icon khóa
- ✅ Level bị khóa → không thể click vào
- ✅ Level bị khóa → redirect khi truy cập trực tiếp
- ✅ Config được lưu và không bị ghi đè

## ⚠️ Lưu ý

- Config được lưu trong localStorage
- Nếu clear localStorage, config sẽ mất
- Cần backup config nếu cần

## 🔧 Nếu vẫn không hoạt động

1. **Clear cache và reload:**
   ```javascript
   // Chạy trong Console
   localStorage.clear();
   location.reload();
   ```

2. **Kiểm tra config có được lưu đúng không:**
   ```javascript
   // Chạy trong Console
   const configs = JSON.parse(localStorage.getItem('levelAccessControl') || '{}');
   console.log('Configs:', configs);
   ```

3. **Kiểm tra user role:**
   ```javascript
   // Chạy trong Console (khi đã đăng nhập)
   const { user, profile } = useAuth(); // Cần import từ context
   console.log('User:', user);
   console.log('Profile:', profile);
   console.log('Role:', profile?.role || user?.role);
   ```

