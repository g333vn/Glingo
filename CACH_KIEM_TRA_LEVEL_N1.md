# 🔍 Cách kiểm tra Level N1 của Module "level" có đang bị khóa không

## 🎯 Mục đích

Bạn đã khóa level N1 của module "level" và muốn xác nhận xem nó có đang bị khóa trong database không.

## 📊 Cách 1: Chạy Query Nhanh (Khuyến nghị)

### Bước 1: Mở Supabase SQL Editor
1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** → **New Query**

### Bước 2: Copy và chạy query này

```sql
SELECT 
  'LEVEL Module - N1' AS vi_tri,
  CASE 
    WHEN access_control->'level'->'n1' IS NULL THEN '❌ Chưa có cấu hình'
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA HOÀN TOÀN'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN access_control->'level'->'n1'->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN access_control->'level'->'n1'->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Không xác định'
  END AS ket_qua,
  jsonb_pretty(access_control->'level'->'n1') AS chi_tiet
FROM app_settings
WHERE id = 1;
```

### Bước 3: Xem kết quả

Kết quả sẽ hiển thị:
- **vi_tri**: "LEVEL Module - N1"
- **ket_qua**: 
  - 🔒 ĐANG KHÓA HOÀN TOÀN (nếu bạn đã khóa)
  - ✅ ĐANG MỞ (nếu chưa khóa)
- **chi_tiet**: JSON chi tiết của cấu hình N1

## 📖 Cách 2: Đọc trực tiếp từ JSON

Nếu bạn đang xem cột `access_control_pretty` trong kết quả query, hãy làm theo các bước sau:

### Bước 1: Tìm key `"level"`
Trong JSON, tìm phần:
```json
"level": {
  ...
}
```

### Bước 2: Tìm key `"n1"` bên trong `"level"`
```json
"level": {
  "n1": {
    ...
  }
}
```

### Bước 3: Xem giá trị `"accessType"` bên trong `"n1"`

#### Nếu thấy:
```json
"n1": {
  "accessType": "none",
  "allowedRoles": [],
  "allowedUsers": []
}
```
→ **🔒 ĐANG KHÓA HOÀN TOÀN** ✅

#### Nếu thấy:
```json
"n1": {
  "accessType": "all",
  "allowedRoles": [],
  "allowedUsers": []
}
```
→ **✅ ĐANG MỞ** (chưa khóa)

#### Nếu thấy:
```json
"n1": {
  "accessType": "role",
  "allowedRoles": ["user"],
  "allowedUsers": []
}
```
→ **⚠️ KHÓA THEO ROLE** (chặn role "user")

#### Nếu thấy:
```json
"n1": {
  "accessType": "user",
  "allowedRoles": [],
  "allowedUsers": ["123", "456"]
}
```
→ **⚠️ KHÓA THEO USER** (chặn user ID "123" và "456")

## 🎯 Ví dụ JSON khi N1 bị khóa

Khi bạn đã khóa N1, JSON sẽ trông như thế này:

```json
{
  "level": {
    "n1": {
      "accessType": "none",        ← Đây là dấu hiệu bị khóa!
      "allowedRoles": [],
      "allowedUsers": []
    },
    "n2": {
      "accessType": "all",
      "allowedRoles": [],
      "allowedUsers": []
    }
  }
}
```

**Giải thích**:
- `"accessType": "none"` = 🔒 **KHÓA HOÀN TOÀN**
- Vị trí: `"level"` → `"n1"` → `"accessType"`

## 📝 Checklist

Khi kiểm tra, hãy đảm bảo:

- [ ] Tìm thấy key `"level"` trong JSON
- [ ] Tìm thấy key `"n1"` bên trong `"level"`
- [ ] Giá trị `"accessType"` là `"none"` (nếu đã khóa)
- [ ] Nếu `"accessType"` là `"all"` → Chưa khóa, cần khóa lại

## 🔧 Kiểm tra các level khác

### Kiểm tra N2:
```sql
SELECT access_control->'level'->'n2'->>'accessType' AS n2_status
FROM app_settings WHERE id = 1;
```

### Kiểm tra N3:
```sql
SELECT access_control->'level'->'n3'->>'accessType' AS n3_status
FROM app_settings WHERE id = 1;
```

### Kiểm tra tất cả:
Chạy file `check_access_control_in_database.sql` phần 0 hoặc phần 5.

## 💡 Mẹo

1. **Dùng query nhanh** (Cách 1) - Dễ đọc nhất, không cần đọc JSON
2. **Dùng file `check_specific_level.sql`** - Để kiểm tra nhiều level cùng lúc
3. **Dùng file `check_access_control_in_database.sql`** - Để xem tổng quan tất cả

## 🚨 Lưu ý

- Nếu `access_control->'level'->'n1'` là `NULL` → Chưa có cấu hình cho N1
- Nếu `accessType` là `"all"` → N1 đang mở, chưa bị khóa
- Nếu `accessType` là `"none"` → N1 đang bị khóa hoàn toàn ✅

