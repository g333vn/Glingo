# Hướng Dẫn: Chuyển Timezone Sang Tokyo

## Tình Trạng Hiện Tại

- Database đang dùng timezone **Asia/Ho_Chi_Minh** (Việt Nam)
- Code JavaScript dùng `new Date().toISOString()` → **UTC** (không phụ thuộc timezone)
- Database dùng `NOW()` → Dùng timezone của database server

## Giải Pháp

### ✅ Option 1: Set Timezone Cho Session (Khuyến Khích - An Toàn Nhất)

**Chỉ ảnh hưởng session hiện tại, không ảnh hưởng dữ liệu cũ**

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy:
```sql
SET timezone = 'Asia/Tokyo';
```

**Ưu điểm:**
- ✅ An toàn, không ảnh hưởng dữ liệu cũ
- ✅ Dễ revert (chỉ cần reconnect)
- ✅ Không ảnh hưởng các connections khác

**Nhược điểm:**
- ⚠️ Phải chạy lại mỗi lần mở SQL Editor
- ⚠️ Không tự động áp dụng cho tất cả queries

### ✅ Option 2: Set Timezone Cho Role (Vĩnh Viễn - Khuyến Khích)

**Áp dụng cho tất cả sessions của user hiện tại**

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy:
```sql
ALTER ROLE CURRENT_USER SET timezone = 'Asia/Tokyo';
```

3. **Reconnect database** để áp dụng

**Ưu điểm:**
- ✅ Áp dụng vĩnh viễn cho user
- ✅ Không ảnh hưởng dữ liệu cũ
- ✅ An toàn hơn database level

**Nhược điểm:**
- ⚠️ Cần reconnect để áp dụng

### ⚠️ Option 3: Set Timezone Cho Database (Không Khuyến Khích)

**Áp dụng cho toàn bộ database**

```sql
ALTER DATABASE postgres SET timezone = 'Asia/Tokyo';
```

**⚠️ CẨN THẬN:**
- Ảnh hưởng đến tất cả connections
- Có thể ảnh hưởng đến các ứng dụng khác dùng cùng database
- Khó revert

## Kiểm Tra Timezone

### 1. Kiểm Tra Timezone Hiện Tại

```sql
-- Xem timezone của session
SHOW timezone;

-- Xem timezone của database
SELECT current_setting('timezone') as current_timezone;
```

### 2. Test Timezone

```sql
-- So sánh các timezone
SELECT 
  NOW() as current_time,
  NOW() AT TIME ZONE 'Asia/Tokyo' as tokyo_time,
  NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' as vietnam_time,
  NOW() AT TIME ZONE 'UTC' as utc_time;
```

## Ảnh Hưởng

### ✅ Không Ảnh Hưởng

1. **Code JavaScript:**
   - `new Date().toISOString()` luôn trả về UTC
   - Không phụ thuộc timezone của database

2. **Dữ liệu đã lưu:**
   - Nếu dùng `TIMESTAMP WITH TIME ZONE`: Giữ nguyên, chỉ hiển thị khác
   - Timestamps đã lưu không bị thay đổi

3. **Cấu trúc database:**
   - Không thay đổi schema
   - Không thay đổi constraints
   - Không thay đổi indexes

### ⚠️ Có Thể Ảnh Hưởng

1. **Các giá trị mới:**
   - `NOW()` trong DEFAULT sẽ dùng timezone mới
   - Triggers dùng `NOW()` sẽ dùng timezone mới

2. **Hiển thị timestamps:**
   - Timestamps hiển thị trong Supabase Dashboard sẽ khác
   - Queries trả về timestamps sẽ khác

## Khuyến Nghị

### ✅ Nên Làm

1. **Dùng Option 1 hoặc Option 2** (session/role level)
2. **Test trước** với Option 1
3. **Kiểm tra** xem timestamps có hiển thị đúng không
4. **Nếu OK**, áp dụng Option 2 cho vĩnh viễn

### ❌ Không Nên

1. **Không dùng Option 3** (database level) trừ khi chắc chắn
2. **Không thay đổi** dữ liệu đã lưu
3. **Không thay đổi** code JavaScript (đã dùng UTC)

## Revert (Quay Lại)

Nếu muốn quay lại timezone Việt Nam:

```sql
-- Session level
SET timezone = 'Asia/Ho_Chi_Minh';

-- Role level
ALTER ROLE CURRENT_USER SET timezone = 'Asia/Ho_Chi_Minh';

-- Database level (nếu đã dùng)
ALTER DATABASE postgres SET timezone = 'Asia/Ho_Chi_Minh';
```

Sau đó **reconnect** database.

## Kết Luận

✅ **Có thể chuyển timezone** mà không ảnh hưởng cấu trúc hệ thống

✅ **Khuyến nghị:** Dùng **Option 2** (role level) - an toàn và vĩnh viễn

✅ **Code JavaScript không cần thay đổi** - đã dùng UTC

⚠️ **Chỉ ảnh hưởng:** Các giá trị mới được tạo bằng `NOW()` trong database

## Files

1. ✅ `change_timezone_to_tokyo.sql` - Script SQL để chuyển timezone
2. ✅ `TIMEZONE_SETUP_GUIDE.md` - Tài liệu này

