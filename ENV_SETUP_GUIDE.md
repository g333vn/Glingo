# 🔐 HƯỚNG DẪN SETUP ENVIRONMENT VARIABLES

## 📋 TẠO FILE `.env.local`

Tạo file `.env.local` ở root của project (cùng cấp với `package.json`):

```env
# ========================================
# SUPABASE CONFIGURATION
# ========================================
# Lấy thông tin từ Supabase Dashboard:
# 1. Vào https://app.supabase.com
# 2. Chọn project của bạn
# 3. Vào Settings → API
# 4. Copy Project URL → VITE_SUPABASE_URL
# 5. Copy anon public key → VITE_SUPABASE_ANON_KEY

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🔑 CÁCH LẤY THÔNG TIN TỪ SUPABASE

### Bước 1: Mở Supabase Dashboard
1. Vào [https://app.supabase.com](https://app.supabase.com)
2. Đăng nhập vào tài khoản của bạn
3. Chọn project của bạn

### Bước 2: Lấy Project URL
1. Vào **Settings** (biểu tượng bánh răng)
2. Chọn **API** trong menu bên trái
3. Tìm **Project URL** (ví dụ: `https://xxxxx.supabase.co`)
4. Copy và paste vào `.env.local` → `VITE_SUPABASE_URL`

### Bước 3: Lấy Anon Key
1. Vẫn trong trang **Settings → API**
2. Tìm **anon public key** (key bắt đầu bằng `eyJ...`)
3. Copy và paste vào `.env.local` → `VITE_SUPABASE_ANON_KEY`

---

## ⚠️ LƯU Ý BẢO MẬT QUAN TRỌNG

### ✅ AN TOÀN:
- `VITE_SUPABASE_URL` - Public URL, OK để expose
- `VITE_SUPABASE_ANON_KEY` - Public key, được thiết kế để expose (nhưng vẫn cần RLS)

### ❌ KHÔNG BAO GIỜ:
- **KHÔNG** commit file `.env.local` vào git
- **KHÔNG** sử dụng Service Role Key trong client-side code
- **KHÔNG** đặt prefix `VITE_` cho service role key
- **KHÔNG** hardcode keys trong code hoặc documentation

### 🔒 Service Role Key:
- Chỉ sử dụng trong:
  - Supabase Edge Functions
  - Backend API (server-side only)
  - Supabase Database Functions
- **KHÔNG BAO GIỜ** sử dụng trong client-side code
- Nếu cần, tạo biến riêng **KHÔNG có prefix VITE_**

---

## 📝 VÍ DỤ FILE `.env.local` HOÀN CHỈNH

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTUzNjAwMDB9.example-signature
```

---

## ✅ KIỂM TRA SAU KHI SETUP

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Kiểm tra console:**
   - Mở browser console (F12)
   - Không nên thấy warning về missing configuration

3. **Test kết nối:**
   - Thử đăng nhập/đăng ký
   - Kiểm tra có lỗi về Supabase không

---

## 🔄 SAU KHI THAY ĐỔI `.env.local`

**QUAN TRỌNG:** Sau khi thay đổi `.env.local`, bạn **PHẢI restart dev server**:

1. Dừng dev server (Ctrl+C)
2. Chạy lại: `npm run dev`

---

## 📚 TÀI LIỆU THAM KHẢO

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

---

**Lưu ý:** File `.env.local` đã được thêm vào `.gitignore`, nên sẽ không bị commit vào git. Đảm bảo mỗi developer tạo file `.env.local` riêng của mình.

