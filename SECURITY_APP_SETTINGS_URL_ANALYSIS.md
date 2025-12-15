# 🔒 Phân Tích Bảo Mật: URL app_settings Bị Lộ

## 📋 URL Đang Bị Lộ

```
https://lewocjuvermgzzdjamad.supabase.co/rest/v1/app_settings?select=system_settings&id=eq.1
```

---

## ⚠️ Phân Tích Vấn Đề

### 1. **Thông Tin Bị Lộ Trong URL**

#### ✅ **AN TOÀN (Không có vấn đề):**
- **Project ID**: `lewocjuvermgzzdjamad`
  - ✅ Đã có trong `VITE_SUPABASE_URL` (public)
  - ✅ Supabase project ID là public, không phải secret
  - ✅ Cần có để kết nối với Supabase

- **Table name**: `app_settings`
  - ⚠️ Lộ cấu trúc database (table name)
  - ⚠️ Attacker biết được bạn có table này
  - ✅ Nhưng không thể truy cập nếu có RLS đúng

- **Column name**: `system_settings`
  - ⚠️ Lộ schema (column names)
  - ⚠️ Attacker biết được cấu trúc data
  - ✅ Nhưng không thể đọc nếu có RLS đúng

- **Query**: `id=eq.1`
  - ⚠️ Lộ logic query (PostgREST syntax)
  - ⚠️ Attacker biết được cách query data
  - ✅ Nhưng không thể query nếu có RLS đúng

---

### 2. **Dữ Liệu Trong `app_settings` Table**

#### 📊 Cấu Trúc Table:

```sql
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT false,        -- ⚠️ NHẠY CẢM
  access_control JSONB DEFAULT '{}',             -- 🔴 RẤT NHẠY CẢM
  system_settings JSONB DEFAULT '{}',            -- ✅ PHẦN LỚN PUBLIC
  user_settings JSONB DEFAULT '{}',              -- ⚠️ NHẠY CẢM
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 🔍 Phân Tích Từng Column:

**a) `system_settings` (Column đang được query):**
```json
{
  "platformName": "Learn Your Approach",         // ✅ Public info
  "platformTagline": "Japanese Learning Platform", // ✅ Public info
  "platformDescription": {                       // ✅ Public info
    "vi": "...",
    "en": "...",
    "ja": "..."
  },
  "contactEmail": "admin@example.com"            // ⚠️ Có thể nhạy cảm
}
```
- ✅ **Đánh giá**: Phần lớn là thông tin public
- ⚠️ **Lưu ý**: `contactEmail` có thể bị spam nếu lộ

**b) `access_control` (KHÔNG được query, nhưng có trong table):**
```json
{
  "level": {
    "n1": { "accessType": "none", "allowedRoles": [], "allowedUsers": [] },
    "n2": { "accessType": "all", "allowedRoles": [], "allowedUsers": [] }
  },
  "jlpt": {
    "n1": { "accessType": "role", "allowedRoles": ["user"], "allowedUsers": [] }
  }
}
```
- 🔴 **RẤT NHẠY CẢM**: Lộ cấu trúc bảo mật của hệ thống
- 🔴 **Nguy hiểm**: Attacker biết được:
  - Các level nào bị khóa
  - Các role nào có quyền truy cập
  - Cấu trúc access control

**c) `maintenance_mode`:**
- ⚠️ **Nhạy cảm**: Cho biết khi nào site đang maintenance
- ⚠️ **Nguy hiểm**: Attacker có thể biết được thời điểm tốt để tấn công

**d) `user_settings`:**
```json
{
  "defaultRole": "user",
  "passwordMinLength": 6,
  "passwordMaxLength": 50
}
```
- ⚠️ **Nhạy cảm**: Lộ cấu hình user management
- ⚠️ **Nguy hiểm**: Attacker biết được password requirements

---

### 3. **Vấn Đề Bảo Mật Chính**

#### 🔴 **Vấn Đề 1: Không Có RLS (Row Level Security)**

**Tình trạng hiện tại:**
- ❌ Table `app_settings` **KHÔNG có RLS policies** (theo các file migration)
- ❌ Bất kỳ ai có `anon key` đều có thể đọc được data
- ❌ Attacker có thể query trực tiếp qua Supabase REST API

**Kiểm tra:**
```sql
-- Chạy trong Supabase SQL Editor để kiểm tra
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'app_settings';

-- Nếu rowsecurity = false → KHÔNG có RLS (NGUY HIỂM)
```

#### 🔴 **Vấn Đề 2: Có Thể Query Các Column Khác**

Attacker có thể thử:
```http
# Query access_control (NHẠY CẢM)
GET /rest/v1/app_settings?select=access_control&id=eq.1

# Query maintenance_mode
GET /rest/v1/app_settings?select=maintenance_mode&id=eq.1

# Query user_settings
GET /rest/v1/app_settings?select=user_settings&id=eq.1

# Query tất cả
GET /rest/v1/app_settings?select=*&id=eq.1
```

#### 🔴 **Vấn Đề 3: Có Thể Update Data (Nếu Không Có RLS)**

Attacker có thể thử:
```http
# Update maintenance_mode
PATCH /rest/v1/app_settings?id=eq.1
Content-Type: application/json
{
  "maintenance_mode": true
}

# Update access_control (CỰC KỲ NGUY HIỂM)
PATCH /rest/v1/app_settings?id=eq.1
Content-Type: application/json
{
  "access_control": {
    "level": {
      "n1": { "accessType": "all" }  // Mở khóa tất cả
    }
  }
}
```

---

## ✅ Giải Pháp

### **Giải Pháp 1: Enable RLS và Tạo Policies (KHUYẾN NGHỊ)**

Tạo file migration mới:

```sql
-- migrations/enable_rls_for_app_settings.sql

-- Enable RLS on app_settings table
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read system_settings only (for public info)
CREATE POLICY "Public can read system_settings"
  ON app_settings
  FOR SELECT
  USING (true);  -- Allow public read for system_settings

-- Policy: Only authenticated admins can read all columns
CREATE POLICY "Admins can read all app_settings"
  ON app_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only authenticated admins can update
CREATE POLICY "Admins can update app_settings"
  ON app_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only authenticated admins can insert
CREATE POLICY "Admins can insert app_settings"
  ON app_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**⚠️ Vấn đề với policy trên:**
- Policy "Public can read system_settings" cho phép public đọc, nhưng Supabase RLS không thể giới hạn columns trong SELECT
- Cần sử dụng **PostgreSQL Views** hoặc **Functions** để giới hạn columns

### **Giải Pháp 2: Sử Dụng PostgreSQL View (TỐT HƠN)**

```sql
-- Create view for public system_settings
CREATE OR REPLACE VIEW public_app_settings AS
SELECT 
  id,
  system_settings,
  updated_at
FROM app_settings
WHERE id = 1;

-- Enable RLS on view (if needed)
-- Note: Views inherit RLS from underlying table

-- Grant access to anon role
GRANT SELECT ON public_app_settings TO anon;
GRANT SELECT ON public_app_settings TO authenticated;

-- Revoke direct access to app_settings table
REVOKE ALL ON app_settings FROM anon;
REVOKE ALL ON app_settings FROM authenticated;

-- Only service_role can access app_settings directly
GRANT ALL ON app_settings TO service_role;
```

**Sau đó update code:**
```javascript
// Thay vì:
.from('app_settings')

// Dùng:
.from('public_app_settings')  // Cho public access
// hoặc
.from('app_settings')  // Cho admin access (với RLS)
```

### **Giải Pháp 3: Sử Dụng PostgreSQL Function (TỐT NHẤT)**

```sql
-- Function để lấy system_settings (public)
CREATE OR REPLACE FUNCTION get_public_system_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT system_settings 
    FROM app_settings 
    WHERE id = 1
  );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_public_system_settings() TO anon;
GRANT EXECUTE ON FUNCTION get_public_system_settings() TO authenticated;

-- Function để lấy tất cả settings (admin only)
CREATE OR REPLACE FUNCTION get_all_app_settings()
RETURNS TABLE (
  id INTEGER,
  maintenance_mode BOOLEAN,
  access_control JSONB,
  system_settings JSONB,
  user_settings JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;

  RETURN QUERY
  SELECT 
    app_settings.id,
    app_settings.maintenance_mode,
    app_settings.access_control,
    app_settings.system_settings,
    app_settings.user_settings,
    app_settings.updated_at
  FROM app_settings
  WHERE app_settings.id = 1;
END;
$$;

-- Grant execute to authenticated only
GRANT EXECUTE ON FUNCTION get_all_app_settings() TO authenticated;
```

**Sau đó update code:**
```javascript
// Cho public access
const { data, error } = await supabase.rpc('get_public_system_settings');

// Cho admin access
const { data, error } = await supabase.rpc('get_all_app_settings');
```

---

## 🔍 Cách Kiểm Tra Hiện Tại

### **Bước 1: Kiểm Tra RLS**

Chạy trong Supabase SQL Editor:
```sql
-- Kiểm tra RLS có enable không
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled (NGUY HIỂM)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'app_settings';

-- Kiểm tra policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'app_settings';
```

### **Bước 2: Test Public Access**

Mở browser console (F12) và chạy:
```javascript
// Test 1: Query system_settings (đang dùng)
fetch('https://lewocjuvermgzzdjamad.supabase.co/rest/v1/app_settings?select=system_settings&id=eq.1', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(r => r.json())
.then(console.log);

// Test 2: Query access_control (NGUY HIỂM nếu thành công)
fetch('https://lewocjuvermgzzdjamad.supabase.co/rest/v1/app_settings?select=access_control&id=eq.1', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(r => r.json())
.then(console.log);

// Test 3: Query tất cả (NGUY HIỂM nếu thành công)
fetch('https://lewocjuvermgzzdjamad.supabase.co/rest/v1/app_settings?select=*&id=eq.1', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(r => r.json())
.then(console.log);
```

**Nếu các test 2 và 3 thành công → CÓ VẤN ĐỀ BẢO MẬT NGHIÊM TRỌNG**

---

## 📊 Đánh Giá Mức Độ Nguy Hiểm

### **Mức 1: Chỉ Lộ URL (Hiện Tại)**
- ⚠️ **Mức độ**: TRUNG BÌNH
- ⚠️ **Nguy hiểm**: Lộ cấu trúc database, nhưng chưa lộ data
- ✅ **Có thể chấp nhận**: Nếu có RLS đúng

### **Mức 2: Có Thể Đọc system_settings**
- ⚠️ **Mức độ**: THẤP
- ⚠️ **Nguy hiểm**: Lộ thông tin public (platform name, tagline)
- ✅ **Có thể chấp nhận**: Nếu chỉ lộ system_settings

### **Mức 3: Có Thể Đọc access_control**
- 🔴 **Mức độ**: CAO
- 🔴 **Nguy hiểm**: Lộ cấu trúc bảo mật, attacker biết được cách bypass
- ❌ **KHÔNG thể chấp nhận**: Cần fix ngay

### **Mức 4: Có Thể Update Data**
- 🔴 **Mức độ**: RẤT CAO
- 🔴 **Nguy hiểm**: Attacker có thể thay đổi cấu hình, mở khóa các level
- ❌ **KHÔNG thể chấp nhận**: Cần fix ngay lập tức

---

## ✅ Checklist Hành Động

- [ ] **Kiểm tra RLS**: Chạy SQL để kiểm tra RLS có enable không
- [ ] **Test public access**: Test xem có thể query access_control không
- [ ] **Enable RLS**: Nếu chưa có, enable RLS ngay
- [ ] **Tạo policies**: Tạo policies để giới hạn access
- [ ] **Sử dụng View/Function**: Tạo view hoặc function để giới hạn columns
- [ ] **Test lại**: Test lại sau khi fix để đảm bảo an toàn

---

## 📚 Tài Liệu Tham Khảo

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Views](https://www.postgresql.org/docs/current/sql-createview.html)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

## 🎯 Kết Luận

**URL bị lộ có vấn đề không?**

### **Câu trả lời:**
- ⚠️ **Có vấn đề**, nhưng mức độ phụ thuộc vào:
  1. RLS có được enable không?
  2. Có thể query các column nhạy cảm không?
  3. Có thể update data không?

### **Hành động ngay:**
1. ✅ **Kiểm tra RLS** - Chạy SQL để kiểm tra
2. ✅ **Test public access** - Test xem có thể query access_control không
3. ✅ **Fix nếu cần** - Enable RLS và tạo policies

### **Nếu chỉ lộ system_settings:**
- ✅ **Có thể chấp nhận** - Vì đây là thông tin public
- ⚠️ **Nhưng vẫn nên** - Enable RLS để bảo vệ các column khác

### **Nếu lộ access_control hoặc có thể update:**
- 🔴 **NGUY HIỂM** - Cần fix ngay lập tức
- 🔴 **Không thể chấp nhận** - Đây là lỗ hổng bảo mật nghiêm trọng

