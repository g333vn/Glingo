# 📖 Hướng dẫn kiểm tra trạng thái khóa trong Database

## 🎯 Mục đích

Sau khi thay đổi ở Admin Control Page, bạn muốn kiểm tra trong database xem:
- Level nào đang bị khóa?
- Level nào đang mở?
- Trạng thái có đúng với giao diện không?

## 🚀 Cách kiểm tra nhanh nhất

### Bước 1: Mở Supabase SQL Editor

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** → **New Query**

### Bước 2: Copy và chạy query này

```sql
-- Chỉ hiển thị các level ĐANG BỊ KHÓA
SELECT 
  module,
  UPPER(level_id) AS level_bi_khoa,
  '🔒 ĐANG KHÓA' AS trang_thai
FROM (
  SELECT 
    'LEVEL Module' AS module,
    level_id,
    config->>'accessType' AS access_type
  FROM app_settings,
  LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'level' IS NOT NULL
    AND config->>'accessType' = 'none'
  
  UNION ALL
  
  SELECT 
    'JLPT Module' AS module,
    level_id,
    config->>'accessType' AS access_type
  FROM app_settings,
  LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'jlpt' IS NOT NULL
    AND config->>'accessType' = 'none'
) AS locked_levels
ORDER BY module, level_id;
```

**Kết quả mong đợi** (nếu bạn đã khóa N1 và N2):
```
module        | level_bi_khoa | trang_thai
--------------|---------------|------------
LEVEL Module  | N1            | 🔒 ĐANG KHÓA
LEVEL Module  | N2            | 🔒 ĐANG KHÓA
```

## 📊 Xem tất cả trạng thái (Mở và Khóa)

Chạy query này để xem tất cả:

```sql
-- Module "level" (Dropdown LEVEL)
SELECT 
  'LEVEL Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '⚠️ KHÓA MỘT PHẦN'
  END AS trang_thai
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL
ORDER BY level_id;
```

**Kết quả ví dụ**:
```
module        | level | trang_thai
--------------|-------|------------
LEVEL Module  | N1    | 🔒 ĐANG KHÓA
LEVEL Module  | N2    | 🔒 ĐANG KHÓA
LEVEL Module  | N3    | ✅ ĐANG MỞ
LEVEL Module  | N4    | ✅ ĐANG MỞ
LEVEL Module  | N5    | ✅ ĐANG MỞ
```

## 🔍 Kiểm tra cụ thể một level

### Kiểm tra N1:

```sql
SELECT 
  'LEVEL Module - N1' AS thong_tin,
  CASE 
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '⚠️ KHÓA MỘT PHẦN'
  END AS trang_thai,
  access_control->'level'->'n1'->>'accessType' AS access_type
FROM app_settings
WHERE id = 1;
```

### Kiểm tra N2:

```sql
SELECT 
  'LEVEL Module - N2' AS thong_tin,
  CASE 
    WHEN access_control->'level'->'n2'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN access_control->'level'->'n2'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '⚠️ KHÓA MỘT PHẦN'
  END AS trang_thai,
  access_control->'level'->'n2'->>'accessType' AS access_type
FROM app_settings
WHERE id = 1;
```

## 📋 Giải thích các giá trị

### `accessType` trong database:

| Giá trị | Ý nghĩa | Hiển thị trong giao diện |
|---------|---------|--------------------------|
| `"none"` | 🔒 Khóa hoàn toàn | Icon khóa, text màu xám |
| `"all"` | ✅ Mở cho tất cả | Text màu đen, không có icon khóa |
| `"role"` | ⚠️ Khóa theo role | Tùy thuộc vào role |
| `"user"` | ⚠️ Khóa theo user | Tùy thuộc vào user |

## 🎯 So sánh với giao diện

Sau khi chạy query, so sánh với giao diện:

### Trong giao diện (Dropdown LEVEL):
- N1: 🔒 Icon khóa + text màu xám → Database phải là `"none"`
- N2: 🔒 Icon khóa + text màu xám → Database phải là `"none"`
- N3: Text màu đen → Database phải là `"all"`
- N4: Text màu đen → Database phải là `"all"`
- N5: Text màu đen → Database phải là `"all"`

### Trong Database:
- N1: `accessType = "none"` → ✅ Khớp với giao diện
- N2: `accessType = "none"` → ✅ Khớp với giao diện
- N3: `accessType = "all"` → ✅ Khớp với giao diện

## 🚨 Nếu không khớp

### Trường hợp 1: Giao diện khóa nhưng Database mở

**Nguyên nhân**: localStorage chưa sync với Supabase

**Giải pháp**:
1. Clear cache trong Browser Console:
```javascript
localStorage.removeItem('levelAccessControl');
localStorage.removeItem('jlptAccessControl');
location.reload();
```

2. Hoặc lưu lại từ Admin Control Page

### Trường hợp 2: Database khóa nhưng Giao diện mở

**Nguyên nhân**: Ứng dụng đang đọc từ localStorage cũ

**Giải pháp**: Reload trang (Ctrl+Shift+R)

## 📁 File SQL đã tạo

File `kiem_tra_trang_thai_khoa_don_gian.sql` chứa tất cả các query trên, bạn có thể:
1. Copy toàn bộ file vào SQL Editor
2. Hoặc copy từng query riêng lẻ

## 💡 Mẹo

1. **Query nhanh nhất**: Dùng query "Chỉ hiển thị các level ĐANG BỊ KHÓA" (query thứ 3)
2. **Query đầy đủ**: Dùng query "Xem tất cả trạng thái" (query đầu tiên)
3. **Query chi tiết**: Dùng query "Kiểm tra cụ thể N1 và N2" (query thứ 4)

## ✅ Checklist

Sau khi thay đổi ở Admin:
- [ ] Chạy query kiểm tra trong Supabase
- [ ] Xác nhận các level bị khóa có `accessType = "none"`
- [ ] Xác nhận các level mở có `accessType = "all"`
- [ ] So sánh với giao diện để đảm bảo khớp
- [ ] Nếu không khớp → Clear cache và reload

