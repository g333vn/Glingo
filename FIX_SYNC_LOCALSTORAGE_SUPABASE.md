# 🔧 Sửa lỗi: Giao diện hiển thị khóa nhưng SQL hiển thị mở

## 🎯 Vấn đề

- ✅ **Giao diện**: Hiển thị N1 đang bị khóa (có icon khóa)
- ❌ **SQL Database**: Hiển thị tất cả đang mở (`access_type = "all"`)

## 🔍 Nguyên nhân có thể

### 1. **Kiểm tra sai module**
- Bạn đã khóa N1 của module **"level"**
- Nhưng đang check SQL cho module **"jlpt"**
- → **Giải pháp**: Check cả 2 module

### 2. **localStorage chưa sync với Supabase**
- localStorage có dữ liệu cũ (đã khóa)
- Supabase có dữ liệu mới (đang mở)
- Ứng dụng đang đọc từ localStorage
- → **Giải pháp**: Clear cache và reload

### 3. **Component dùng hàm sync thay vì async**
- `getAccessConfigSync()` chỉ đọc localStorage
- `getAccessConfig()` đọc Supabase trước
- → **Giải pháp**: Đảm bảo dùng hàm async

## 🛠️ Cách sửa

### Bước 1: Kiểm tra cả 2 module trong SQL

Chạy file `check_both_modules_and_sync.sql` trong Supabase SQL Editor:

```sql
-- Kiểm tra module "level" - N1
SELECT 
  'MODULE: level' AS module,
  'N1' AS level,
  CASE 
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '❓ Không xác định'
  END AS trang_thai
FROM app_settings WHERE id = 1;

-- Kiểm tra module "jlpt" - N1
SELECT 
  'MODULE: jlpt' AS module,
  'N1' AS level,
  CASE 
    WHEN access_control->'jlpt'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN access_control->'jlpt'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '❓ Không xác định'
  END AS trang_thai
FROM app_settings WHERE id = 1;
```

**Kết quả mong đợi**:
- Module "level" N1: 🔒 ĐANG KHÓA
- Module "jlpt" N1: ✅ ĐANG MỞ (hoặc ngược lại)

### Bước 2: Kiểm tra localStorage trong Browser

1. Mở Browser Console (F12)
2. Chạy script `check_localStorage_vs_supabase.js` hoặc chạy trực tiếp:

```javascript
// Kiểm tra localStorage
const levelStorage = localStorage.getItem('levelAccessControl');
const levelConfigs = levelStorage ? JSON.parse(levelStorage) : {};
console.log('LEVEL N1 trong localStorage:', levelConfigs.n1);

const jlptStorage = localStorage.getItem('jlptAccessControl');
const jlptConfigs = jlptStorage ? JSON.parse(jlptStorage) : {};
console.log('JLPT N1 trong localStorage:', jlptConfigs.n1);
```

### Bước 3: So sánh và đồng bộ

#### Nếu localStorage khác Supabase:

**Cách 1: Clear cache và reload**
```javascript
// Trong Browser Console
localStorage.removeItem('levelAccessControl');
localStorage.removeItem('jlptAccessControl');
localStorage.removeItem('levelModuleAccessControl');
localStorage.removeItem('jlptModuleAccessControl');
location.reload();
```

**Cách 2: Lưu lại từ Admin Control Page**
1. Mở Admin Control Page
2. Kiểm tra cấu hình N1
3. Click "Save" để đồng bộ lên Supabase
4. Reload trang

**Cách 3: Cập nhật trực tiếp trong Supabase**
Nếu bạn muốn khóa N1 trong Supabase:

```sql
-- Khóa N1 của module "level"
UPDATE app_settings
SET access_control = jsonb_set(
  access_control,
  '{level,n1}',
  '{"accessType": "none", "allowedRoles": [], "allowedUsers": []}'::jsonb,
  true
),
updated_at = NOW()
WHERE id = 1;

-- Kiểm tra lại
SELECT 
  access_control->'level'->'n1'->>'accessType' AS n1_status
FROM app_settings WHERE id = 1;
```

### Bước 4: Reload ứng dụng

Sau khi đồng bộ:
1. **Hard reload**: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
2. Hoặc **Clear cache**: 
   - Chrome: Settings > Privacy > Clear browsing data > Cached images and files
   - Firefox: Settings > Privacy > Clear Data > Cached Web Content

## 📋 Checklist

- [ ] Đã check cả 2 module (level và jlpt) trong SQL
- [ ] Đã check localStorage trong Browser Console
- [ ] Đã so sánh localStorage vs Supabase
- [ ] Đã clear cache nếu cần
- [ ] Đã reload trang
- [ ] Giao diện và SQL đã đồng bộ

## 🔍 Debug thêm

### Xem log trong Browser Console

Khi load trang, tìm các log:
```
[ACCESS] ✅ Loaded level/n1 config from Supabase
[App] ✅ Synced levelConfigs to localStorage
```

Nếu thấy:
```
[ACCESS] ⚠️ Failed to load from Supabase, using localStorage
```
→ Có lỗi kết nối Supabase, đang dùng localStorage cũ

### Kiểm tra Network tab

1. Mở DevTools > Network
2. Reload trang
3. Tìm request đến Supabase (table `app_settings`)
4. Xem response có chứa `access_control` không

## 💡 Lưu ý

1. **Module "level" vs "jlpt"**:
   - "level" = Module LEVEL (trong dropdown "LEVEL")
   - "jlpt" = Module JLPT (trong dropdown "JLPT")
   - Hai module độc lập với nhau

2. **Priority order**:
   - Supabase (cloud) > localStorage (local cache)
   - Nếu Supabase fail → Fallback localStorage

3. **Sync flow**:
   - Admin thay đổi → Lưu vào Supabase → Lưu vào localStorage
   - App load → Đọc từ Supabase → Cache vào localStorage

## 🚨 Nếu vẫn không đồng bộ

1. Kiểm tra xem có lỗi trong Browser Console không
2. Kiểm tra xem có lỗi trong Supabase Logs không
3. Kiểm tra RLS policies trong Supabase có đúng không
4. Thử clear toàn bộ localStorage và reload

