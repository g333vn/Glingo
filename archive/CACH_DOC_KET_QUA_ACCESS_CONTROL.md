# 📖 Cách đọc kết quả Access Control - Biết đang mở hay khóa

## 🎯 Mục đích

File này giải thích cách đọc kết quả từ script SQL để biết:
- ✅ **Đang mở** hay 🔒 **đang khóa**
- 🔒 **Khóa cái gì** (level nào, module nào)

## 📊 Cách đọc từ JSON (Phần 8 trong script)

Khi bạn chạy script và xem phần 8 (JSON pretty), bạn sẽ thấy cấu trúc như sau:

```json
{
  "level": {
    "n1": { "accessType": "none", "allowedRoles": [], "allowedUsers": [] },
    "n2": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] },
    "n3": { "accessType": "role", "allowedRoles": ["user"], "allowedUsers": [] }
  },
  "jlpt": {
    "n1": { "accessType": "none", "allowedRoles": [], "allowedUsers": [] }
  },
  "levelModule": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] },
  "jlptModule": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] }
}
```

## 🔑 Giải thích các giá trị `accessType`

### 1. `"accessType": "none"` = 🔒 **KHÓA HOÀN TOÀN**
- **Ý nghĩa**: Level này bị khóa, **KHÔNG AI** có thể truy cập
- **Ví dụ**: `"n1": { "accessType": "none" }` → Level N1 bị khóa hoàn toàn

### 2. `"accessType": "all"` = ✅ **MỞ (Tất cả truy cập được)**
- **Ý nghĩa**: Level này **MỞ**, tất cả người dùng đều truy cập được
- **Ví dụ**: `"n2": { "accessType": "all" }` → Level N2 mở cho tất cả

### 3. `"accessType": "role"` = ⚠️ **KHÓA THEO ROLE**
- **Ý nghĩa**: Chặn các **role** cụ thể (user, admin, editor)
- **Cách hoạt động**: Các role trong `allowedRoles` sẽ **BỊ CHẶN**, các role khác được truy cập
- **Ví dụ**: 
  ```json
  "n3": { 
    "accessType": "role", 
    "allowedRoles": ["user", "guest"] 
  }
  ```
  → Level N3: Chặn role "user" và "guest", các role khác (admin, editor) được truy cập

### 4. `"accessType": "user"` = ⚠️ **KHÓA THEO USER**
- **Ý nghĩa**: Chặn các **user ID** cụ thể
- **Cách hoạt động**: Các user ID trong `allowedUsers` sẽ **BỊ CHẶN**, các user khác được truy cập
- **Ví dụ**: 
  ```json
  "n4": { 
    "accessType": "user", 
    "allowedUsers": ["123", "456"] 
  }
  ```
  → Level N4: Chặn user ID "123" và "456", các user khác được truy cập

## 📋 Cấu trúc JSON

### Module `level` và `jlpt`
- Chứa cấu hình cho từng level: `n1`, `n2`, `n3`, `n4`, `n5`
- Mỗi level có thể có cấu hình riêng

### Module `levelModule` và `jlptModule`
- Cấu hình chung cho toàn bộ module
- Áp dụng cho tất cả các level nếu level đó không có cấu hình riêng

## 🎯 Cách đọc nhanh (Phần 0 trong script mới)

Script đã được cập nhật với **Phần 0** hiển thị rõ ràng nhất:

```
module      | level | trang_thai                    | mo_ta
------------|-------|------------------------------|----------------------------------
LEVEL Module | N1    | 🔒 KHÓA HOÀN TOÀN            | Không ai có thể truy cập level này
LEVEL Module | N2    | ✅ MỞ (Tất cả truy cập được) | Tất cả người dùng đều truy cập được
LEVEL Module | N3    | ⚠️ KHÓA THEO ROLE: ["user"] | Chặn các role: ["user"]
```

## 📝 Ví dụ thực tế

### Ví dụ 1: Khóa N1 và N2, mở N3, N4, N5

```json
{
  "level": {
    "n1": { "accessType": "none", "allowedRoles": [], "allowedUsers": [] },
    "n2": { "accessType": "none", "allowedRoles": [], "allowedUsers": [] },
    "n3": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] },
    "n4": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] },
    "n5": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] }
  }
}
```

**Kết quả**: 
- 🔒 N1 và N2: Bị khóa hoàn toàn
- ✅ N3, N4, N5: Mở cho tất cả

### Ví dụ 2: Chặn role "user" khỏi N3

```json
{
  "level": {
    "n3": { 
      "accessType": "role", 
      "allowedRoles": ["user"], 
      "allowedUsers": [] 
    }
  }
}
```

**Kết quả**: 
- ⚠️ N3: Role "user" bị chặn, nhưng "admin" và "editor" vẫn truy cập được

### Ví dụ 3: Chặn user cụ thể khỏi N4

```json
{
  "level": {
    "n4": { 
      "accessType": "user", 
      "allowedRoles": [], 
      "allowedUsers": ["abc-123", "def-456"] 
    }
  }
}
```

**Kết quả**: 
- ⚠️ N4: User ID "abc-123" và "def-456" bị chặn, các user khác truy cập được

## 🔍 Checklist kiểm tra nhanh

Khi xem JSON, hãy kiểm tra:

- [ ] **Có key `level` không?** → Có cấu hình cho LEVEL module
- [ ] **Có key `jlpt` không?** → Có cấu hình cho JLPT module
- [ ] **Level nào có `"accessType": "none"`?** → Level đó bị khóa hoàn toàn
- [ ] **Level nào có `"accessType": "all"`?** → Level đó mở cho tất cả
- [ ] **Level nào có `"accessType": "role"`?** → Level đó khóa theo role
- [ ] **Level nào có `"accessType": "user"`?** → Level đó khóa theo user
- [ ] **`allowedRoles` có giá trị gì?** → Các role bị chặn
- [ ] **`allowedUsers` có giá trị gì?** → Các user ID bị chặn

## 💡 Mẹo

1. **Chạy Phần 0 trước** - Hiển thị rõ ràng nhất, dễ đọc nhất
2. **Chạy Phần 5** - Xem danh sách các level bị khóa
3. **Chạy Phần 8** - Xem toàn bộ JSON để debug chi tiết

## 🚨 Lưu ý quan trọng

- `allowedRoles` và `allowedUsers` trong cấu hình **KHÔNG PHẢI** là danh sách được phép, mà là danh sách **BỊ CHẶN**
- Nếu `accessType = "all"` → `allowedRoles` và `allowedUsers` thường là mảng rỗng `[]`
- Nếu `accessType = "none"` → `allowedRoles` và `allowedUsers` thường là mảng rỗng `[]` (vì khóa tất cả rồi)

