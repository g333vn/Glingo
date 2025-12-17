# 📖 Cách đọc JSON Access Control trong Supabase

## 🎯 Khi bạn thấy JSON như `}, "level": {`

Bạn đang xem cột `access_control_full` với JSON đầy đủ. Đây là cách đọc:

## 📋 Cấu trúc JSON

JSON có cấu trúc như sau:

```json
{
  "level": {
    "n1": {
      "accessType": "none",
      "allowedRoles": [],
      "allowedUsers": []
    },
    "n2": {
      "accessType": "all",
      "allowedRoles": [],
      "allowedUsers": []
    }
  },
  "jlpt": {
    "n1": {
      "accessType": "all",
      "allowedRoles": [],
      "allowedUsers": []
    }
  },
  "levelModule": { ... },
  "jlptModule": { ... }
}
```

## 🔍 Cách đọc trong Supabase SQL Editor

### Bước 1: Click vào ô JSON

Trong Supabase SQL Editor, khi bạn thấy JSON, hãy:
1. **Click vào ô chứa JSON** (cột `access_control_full`)
2. JSON sẽ mở rộng và hiển thị đầy đủ
3. Hoặc **double-click** để xem trong popup

### Bước 2: Tìm key `"level"`

Trong JSON, tìm:
```json
"level": {
  ...
}
```

### Bước 3: Tìm level cụ thể (ví dụ: N1)

Bên trong `"level"`, tìm:
```json
"n1": {
  "accessType": "none",    ← Đây là dấu hiệu!
  ...
}
```

## 🔑 Giải thích `accessType`

| Giá trị | Ý nghĩa | Hiển thị trong giao diện |
|---------|---------|--------------------------|
| `"none"` | 🔒 **KHÓA HOÀN TOÀN** | Icon khóa, text màu xám |
| `"all"` | ✅ **MỞ** | Text màu đen, không có icon khóa |
| `"role"` | ⚠️ Khóa theo role | Tùy thuộc vào role |
| `"user"` | ⚠️ Khóa theo user | Tùy thuộc vào user |

## 💡 Cách dễ nhất: Dùng query đơn giản

Thay vì đọc JSON thủ công, hãy chạy query này:

```sql
SELECT 
  'LEVEL Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ'
    ELSE '⚠️ KHÓA MỘT PHẦN'
  END AS trang_thai
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL
ORDER BY level;
```

**Kết quả sẽ hiển thị rõ ràng:**
```
module        | level | trang_thai
--------------|-------|------------
LEVEL Module  | N1    | 🔒 KHÓA
LEVEL Module  | N2    | 🔒 KHÓA
LEVEL Module  | N3    | ✅ MỞ
```

## 📝 Ví dụ thực tế

### Nếu bạn thấy trong JSON:
```json
{
  "level": {
    "n1": {
      "accessType": "none",    ← N1 đang bị khóa
      ...
    },
    "n2": {
      "accessType": "none",    ← N2 đang bị khóa
      ...
    },
    "n3": {
      "accessType": "all",     ← N3 đang mở
      ...
    }
  }
}
```

**Kết luận:**
- ✅ N1: 🔒 ĐANG KHÓA
- ✅ N2: 🔒 ĐANG KHÓA
- ✅ N3: ✅ ĐANG MỞ

## 🚀 Khuyến nghị

**Đừng đọc JSON thủ công!** Hãy dùng file `xem_trang_thai_khoa_don_gian_nhat.sql` để xem kết quả rõ ràng hơn.

## 📁 Files có sẵn

1. **`xem_trang_thai_khoa_don_gian_nhat.sql`** - Query đơn giản nhất
2. **`check_both_modules_and_sync.sql`** - Query đầy đủ cả 2 module
3. **`kiem_tra_trang_thai_khoa_don_gian.sql`** - Query chi tiết

