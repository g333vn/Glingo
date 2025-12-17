# 🔧 Fix Supabase Errors - Hướng dẫn sửa lỗi

## Vấn đề

Bạn đang gặp các lỗi sau:
1. **Lỗi 500** - "infinite recursion detected in policy" - RLS policies gọi lại chính nó
2. **Lỗi 403** khi logout - Auth session missing

## Giải pháp

### ⚠️ QUAN TRỌNG: Lỗi Infinite Recursion

Lỗi này xảy ra vì function `is_admin()` query bảng `profiles`, nhưng query này lại trigger RLS policy, tạo vòng lặp vô hạn.

### Bước 1: Sửa RLS Policies (CHỌN 1 TRONG 2 CÁCH)

#### Cách 1: Đơn giản nhất (KHUYẾN NGHỊ) ✅

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Copy toàn bộ nội dung từ file **`fix_profiles_rls_simple.sql`**
3. Paste vào SQL Editor và chạy (Run)

**Cách này:**
- ✅ Chỉ cho phép users access profile của chính họ
- ✅ Không có recursion
- ✅ Admin operations sẽ dùng service role (trong backend code)

#### Cách 2: Với admin policies (phức tạp hơn)

1. Copy toàn bộ nội dung từ file **`fix_profiles_rls_no_recursion.sql`**
2. Paste vào SQL Editor và chạy (Run)

**Cách này:**
- ✅ Có admin policies
- ⚠️ Vẫn có thể gặp vấn đề nếu JWT không có role metadata

File này sẽ:
- ✅ Xóa các policies bị lỗi
- ✅ Tạo lại các policies đúng syntax
- ✅ Thêm policy cho INSERT (cho phép users tạo profile của chính họ)
- ✅ Sửa function `handle_new_user()` để tự động tạo profile khi user đăng ký

### Bước 2: Kiểm tra kết quả

Sau khi chạy SQL, kiểm tra:
1. Vào **Table Editor** → `profiles` table
2. Vào **Authentication** → **Policies** → kiểm tra các policies đã được tạo

### Bước 3: Test lại ứng dụng

1. **Đăng nhập** - Profile sẽ được tạo tự động nếu chưa có
2. **Đăng xuất** - Không còn lỗi 403
3. **Truy vấn profile** - Không còn lỗi 500

## Các thay đổi đã thực hiện trong code

### 1. `authService.js` - Cải thiện error handling

- **`signOut()`**: Xử lý trường hợp session đã hết hạn (không throw error)
- **`getUserProfile()`**: Sử dụng `maybeSingle()` thay vì `single()` để tránh error khi không có data
- **`createUserProfile()`**: Kiểm tra profile đã tồn tại trước khi insert

### 2. File SQL fix

- `fix_profiles_rls.sql`: Sửa tất cả RLS policies và thêm policy cho INSERT

## Lưu ý

- Nếu vẫn còn lỗi sau khi chạy SQL fix, hãy kiểm tra:
  1. Bảng `profiles` đã được tạo chưa (chạy `supabase_setup_safe.sql` nếu chưa)
  2. Function `is_admin()` đã được tạo chưa
  3. Trigger `trigger_handle_new_user` đã được tạo chưa

## Troubleshooting

### Lỗi "relation profiles does not exist"
→ Chạy `supabase_setup_safe.sql` trước, sau đó chạy `fix_profiles_rls.sql`

### Lỗi "permission denied"
→ Kiểm tra RLS policies đã được enable và tạo đúng chưa

### Lỗi "duplicate key"
→ Profile đã tồn tại, code sẽ tự động fetch profile hiện có

