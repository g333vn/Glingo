# 🔍 Hướng dẫn kiểm tra lệnh khóa cấp truy cập trong Database

## 📋 Tổng quan

File này hướng dẫn cách kiểm tra xem các lệnh khóa cấp truy cập (Access Control) đã được lưu vào Supabase database chưa.

## 🗂️ Các file SQL có sẵn trong dự án

### 1. **Migration Files** (Tạo cấu trúc database)

#### `migrations/add_access_control_to_app_settings.sql`
- **Mục đích**: Tạo cột `access_control` trong bảng `app_settings`
- **Khi nào dùng**: Lần đầu setup hoặc khi cột chưa tồn tại
- **Cách chạy**: Copy vào Supabase SQL Editor và chạy

```sql
-- Kiểm tra và tạo cột access_control nếu chưa có
ALTER TABLE app_settings
ADD COLUMN access_control JSONB DEFAULT '{}'::jsonb;
```

### 2. **Kiểm tra Files** (Verify dữ liệu)

#### `check_access_control_in_database.sql` ⭐ **FILE MỚI**
- **Mục đích**: Kiểm tra toàn diện xem access control đã được lưu chưa
- **Bao gồm**:
  - ✅ Kiểm tra bảng `app_settings` có tồn tại
  - ✅ Kiểm tra cột `access_control` có tồn tại
  - ✅ Kiểm tra dữ liệu đã được lưu chưa
  - ✅ Xem chi tiết cấu hình từng level
  - ✅ Đếm số level bị khóa
  - ✅ Xem cấu hình module-level
  - ✅ Xem toàn bộ JSON (để debug)

### 3. **Setup Files** (Thiết lập ban đầu)

#### `supabase_setup.sql`
- **Mục đích**: Setup toàn bộ database (profiles, activity_logs, RLS policies)
- **Lưu ý**: Không có `app_settings` table trong file này

#### `supabase_setup_safe.sql`
- **Mục đích**: Setup database an toàn (không ghi đè dữ liệu cũ)
- **Lưu ý**: Cũng không có `app_settings` table

## 🔧 Cách kiểm tra Access Control trong Database

### Bước 1: Mở Supabase SQL Editor

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Click **New Query**

### Bước 2: Chạy script kiểm tra

Copy toàn bộ nội dung file `check_access_control_in_database.sql` và paste vào SQL Editor, sau đó click **Run**.

### Bước 3: Xem kết quả

Script sẽ hiển thị 8 phần kết quả:

#### **Phần 1: Kiểm tra bảng**
```
✅ Bảng app_settings đã tồn tại
```
hoặc
```
❌ Bảng app_settings CHƯA tồn tại - Cần tạo bảng trước!
```

#### **Phần 2: Kiểm tra cột**
```
column_name      | data_type | column_default | column_status
-----------------|-----------|----------------|------------------
access_control   | jsonb     | '{}'::jsonb    | ✅ Cột access_control đã tồn tại
```

#### **Phần 3: Kiểm tra dữ liệu**
```
id | data_status                                    | last_updated
---|------------------------------------------------|------------------
1  | ✅ access_control đã có dữ liệu              | 2024-01-15 10:30:00
```

#### **Phần 4: Chi tiết cấu hình**
Hiển thị các module (level, jlpt) và trạng thái của chúng.

#### **Phần 5: Danh sách level bị khóa**
```
module_type | level_id | access_type | status                              | blocked_roles | blocked_users
-------------|----------|-------------|-------------------------------------|---------------|---------------
LEVEL Module | n1       | none        | 🔒 BỊ KHÓA (Không ai truy cập được) | []            | []
LEVEL Module | n2       | all         | ✅ MỞ (Tất cả đều truy cập được)    | []            | []
```

#### **Phần 6: Tổng kết**
```
module_type | so_level_bi_khoa | so_level_mo | so_level_han_che_role | tong_so_level
-------------|------------------|-------------|----------------------|---------------
LEVEL Module | 2                | 3           | 0                    | 5
JLPT Module  | 1                | 4           | 0                    | 5
```

#### **Phần 7: Cấu hình module-level**
```
module_config_name | access_type | status | blocked_roles | blocked_users
-------------------|-------------|--------|---------------|---------------
levelModule        | all         | ✅ MỞ | []            | []
jlptModule         | all         | ✅ MỞ | []            | []
```

#### **Phần 8: Toàn bộ JSON** (để debug)
Hiển thị toàn bộ JSON `access_control` với format đẹp.

## 🚨 Xử lý các trường hợp lỗi

### Trường hợp 1: Bảng `app_settings` chưa tồn tại

**Giải pháp**: Tạo bảng `app_settings` trước:

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT false,
  access_control JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo row mặc định
INSERT INTO app_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;
```

### Trường hợp 2: Cột `access_control` chưa tồn tại

**Giải pháp**: Chạy migration:

```sql
-- Chạy file: migrations/add_access_control_to_app_settings.sql
ALTER TABLE app_settings
ADD COLUMN access_control JSONB DEFAULT '{}'::jsonb;
```

### Trường hợp 3: Dữ liệu `access_control` là rỗng `{}`

**Nguyên nhân có thể**:
- Chưa lưu cấu hình từ Admin Control Page
- Lỗi khi lưu vào Supabase
- Chưa đồng bộ từ localStorage lên Supabase

**Giải pháp**:
1. Mở Admin Control Page trong ứng dụng
2. Kiểm tra cấu hình trong localStorage (dùng `check_access_config.js`)
3. Lưu lại cấu hình từ Admin Control Page
4. Kiểm tra console trong browser xem có lỗi không

### Trường hợp 4: Có dữ liệu nhưng không đúng format

**Kiểm tra format đúng**:

```json
{
  "level": {
    "n1": { "accessType": "none", "allowedRoles": [], "allowedUsers": [] },
    "n2": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] }
  },
  "jlpt": {
    "n1": { "accessType": "role", "allowedRoles": ["user"], "allowedUsers": [] }
  },
  "levelModule": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] },
  "jlptModule": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] }
}
```

## 📝 Các lệnh SQL hữu ích khác

### Xem nhanh access_control

```sql
SELECT 
  id,
  access_control,
  updated_at
FROM app_settings
WHERE id = 1;
```

### Xem chỉ các level bị khóa

```sql
SELECT 
  'LEVEL' AS module,
  level_id,
  config->>'accessType' AS access_type
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND config->>'accessType' = 'none';
```

### Xem cấu hình của một level cụ thể

```sql
SELECT 
  access_control->'level'->'n1' AS n1_level_config,
  access_control->'jlpt'->'n1' AS n1_jlpt_config
FROM app_settings
WHERE id = 1;
```

### Reset access_control về mặc định (rỗng)

```sql
UPDATE app_settings
SET 
  access_control = '{}'::jsonb,
  updated_at = NOW()
WHERE id = 1;
```

### Xóa cấu hình của một level cụ thể

```sql
UPDATE app_settings
SET 
  access_control = jsonb_set(
    access_control,
    '{level,n1}',
    NULL::jsonb,
    true
  ),
  updated_at = NOW()
WHERE id = 1;
```

## 🔗 Liên kết các file liên quan

- **Service**: `src/services/accessControlService.js` - Xử lý lưu/load từ Supabase
- **Manager**: `src/utils/accessControlManager.js` - Logic kiểm tra quyền truy cập
- **Admin Page**: `src/pages/admin/NewControlPage.jsx` - Giao diện quản lý
- **Check Script**: `check_access_config.js` - Kiểm tra trong localStorage (browser console)

## ✅ Checklist kiểm tra

- [ ] Bảng `app_settings` đã tồn tại
- [ ] Cột `access_control` đã tồn tại
- [ ] Dữ liệu `access_control` không phải NULL hoặc rỗng `{}`
- [ ] Có cấu hình cho module `level` hoặc `jlpt`
- [ ] Có cấu hình cho `levelModule` và `jlptModule`
- [ ] Các level bị khóa hiển thị đúng trong kết quả
- [ ] `updated_at` gần đây (chứng tỏ đã được cập nhật)

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console trong browser (F12) xem có lỗi khi lưu không
2. Network tab xem request đến Supabase có thành công không
3. Supabase Dashboard > Logs xem có lỗi từ phía server không

