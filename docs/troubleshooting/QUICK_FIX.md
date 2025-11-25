# 🔧 KHẮC PHỤC NHANH

## ❌ LỖI 1: Syntax Error trong IndexedDB

**Lỗi:**
```
indexedDBManager.js:62 Uncaught SyntaxError: Unexpected reserved word
```

**✅ ĐÃ SỬA:**
- Đã bỏ `await` trong upgrade callback
- Upgrade callback giờ chỉ tạo/xóa stores, không migrate data

**Nếu vẫn gặp lỗi:**
1. Xóa IndexedDB cũ trong DevTools:
   - F12 → Application → IndexedDB → `elearning-db` → Delete
2. Refresh trang (F5)
3. Database sẽ được tạo lại

---

## ❌ LỖI 2: Web không chạy

**Cách chạy server:**

```bash
# 1. Đảm bảo đang ở thư mục project
cd "E:\Projects\elearning - cur"

# 2. Cài đặt dependencies (nếu chưa)
npm install

# 3. Chạy dev server
npm run dev
```

**Server sẽ chạy tại:**
```
http://localhost:5173
```

**Nếu port 5173 đã được dùng:**

```bash
# Dùng port khác
npm run dev -- --port 3000
```

**Nếu vẫn không chạy:**

1. **Kiểm tra Node.js:**
   ```bash
   node --version
   ```
   Cần Node.js 18+ (khuyến nghị: 18.x hoặc 20.x)

2. **Xóa và cài lại:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

3. **Kiểm tra lỗi trong terminal:**
   - Xem output khi chạy `npm run dev`
   - Copy lỗi và tìm kiếm

---

## ✅ KIỂM TRA

Sau khi sửa, kiểm tra:

1. **Mở browser:**
   - Vào `http://localhost:5173`
   - Mở DevTools (F12)

2. **Kiểm tra console:**
   - Không có lỗi syntax
   - Có log: `✅ IndexedDB initialized successfully`

3. **Kiểm tra IndexedDB:**
   - DevTools → Application → IndexedDB
   - Có database `elearning-db` version 2
   - Có store `lessons`

---

**Nếu vẫn gặp vấn đề, xem [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)**

