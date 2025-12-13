# 🔧 Sửa lỗi hiển thị "Ghost Quizzes"

## 🐛 Vấn đề

Bạn thấy hiển thị "3 Quizzes" trong UI, nhưng khi kiểm tra Supabase thì **KHÔNG có quiz nào** cho level n5.

**Nguyên nhân:**
- Quiz đã bị xóa khỏi Supabase (do bug `deleteQuiz` trước đây)
- Nhưng quiz vẫn còn trong **local storage** (IndexedDB/localStorage)
- Logic `getQuiz()` đang fallback về local cache thay vì ưu tiên Supabase
- UI hiển thị quiz từ local cache, tạo ra "ghost quizzes"

## ✅ Giải pháp đã áp dụng

### 1. **Sửa logic `getQuiz()` trong localStorageManager.js**

**Trước:**
- Load từ Supabase trước
- Nếu Supabase không có → fallback về local cache
- → Hiển thị quiz cũ từ local storage

**Sau:**
- Load từ Supabase trước
- Nếu Supabase xác nhận không có quiz (`success=true, data=null`):
  - ✅ **Clear local cache** (IndexedDB + localStorage)
  - ✅ **Return null** - không fallback về cache cũ
- Chỉ fallback về local cache nếu Supabase request **failed** (network error)

### 2. **Logic tương tự như `getLessons()`**

Đã áp dụng cùng logic như `getLessons()`:
- Supabase là nguồn dữ liệu chính
- Local cache chỉ là backup khi Supabase không available
- Nếu Supabase xác nhận không có → clear cache để sync

## 🔍 Cách kiểm tra

### Sau khi sửa:

1. **Refresh trang** (Ctrl+F5 để clear cache)
2. **Kiểm tra Console:**
   - Tìm log: `ℹ️ Supabase has no quiz for n5/... - clearing local caches`
   - Tìm log: `🗑️ Deleted quiz (...) from IndexedDB`
3. **Kiểm tra UI:**
   - Số lượng quiz hiển thị phải khớp với Supabase
   - Nếu Supabase = 0 quiz → UI phải hiển thị 0 quiz

### Nếu vẫn thấy ghost quizzes:

1. **Clear cache thủ công:**
   ```javascript
   // Chạy trong Browser Console
   localStorage.clear();
   indexedDB.deleteDatabase('elearning-db');
   location.reload();
   ```

2. **Kiểm tra lại Supabase:**
   ```sql
   SELECT COUNT(*) FROM quizzes WHERE level = 'n5';
   ```

## 📊 Kết quả mong đợi

- ✅ UI hiển thị số quiz **chính xác** theo Supabase
- ✅ Không còn "ghost quizzes" từ local cache
- ✅ Local cache được sync với Supabase
- ✅ Quiz chỉ hiển thị nếu thực sự có trong Supabase

## ⚠️ Lưu ý

- Nếu bạn có quiz trong local storage nhưng chưa sync lên Supabase:
  - Quiz sẽ bị xóa khỏi local cache
  - Cần tạo lại quiz và lưu vào Supabase
- Nếu mất mạng khi load:
  - Quiz từ local cache vẫn hiển thị (fallback)
  - Nhưng sẽ được verify lại khi có mạng

