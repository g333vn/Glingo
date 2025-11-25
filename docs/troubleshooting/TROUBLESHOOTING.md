# 🔧 TROUBLESHOOTING - KHẮC PHỤC SỰ CỐ

## ❌ LỖI THƯỜNG GẶP

### **1. Lỗi Syntax: "Unexpected reserved word" trong IndexedDB**

**Lỗi:**
```
indexedDBManager.js:62 Uncaught SyntaxError: Unexpected reserved word
```

**Nguyên nhân:**
- Sử dụng `await` trong IndexedDB upgrade callback (không phải async function)

**Giải pháp:**
- ✅ Đã sửa: Bỏ `await` trong upgrade callback
- Upgrade callback chỉ tạo/xóa stores, không migrate data
- Data migration sẽ được thực hiện sau khi upgrade xong

**Nếu vẫn gặp lỗi:**
1. Xóa IndexedDB cũ trong DevTools:
   - Chrome: F12 → Application → IndexedDB → Delete database
   - Firefox: F12 → Storage → IndexedDB → Delete database
2. Refresh trang
3. Database sẽ được tạo lại với schema mới

---

### **2. Web không chạy khi bật server**

**Triệu chứng:**
- Chạy `npm run dev` nhưng web không load
- Lỗi trong terminal
- Port đã được sử dụng

**Giải pháp:**

#### **Bước 1: Kiểm tra port**

```bash
# Kiểm tra port 5173 có đang được dùng không
netstat -ano | findstr :5173
```

Nếu có process đang dùng port:
```bash
# Tìm process ID (PID) từ kết quả trên
# Sau đó kill process:
taskkill /PID <PID> /F
```

#### **Bước 2: Chạy lại server**

```bash
# Đảm bảo đang ở thư mục project
cd "E:\Projects\elearning - cur"

# Cài đặt dependencies (nếu chưa)
npm install

# Chạy dev server
npm run dev
```

#### **Bước 3: Kiểm tra output**

Server sẽ hiển thị:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Nếu vẫn không chạy:**

1. **Kiểm tra Node.js version:**
   ```bash
   node --version
   ```
   Cần Node.js 18+ (khuyến nghị: 18.x hoặc 20.x)

2. **Xóa node_modules và cài lại:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

3. **Kiểm tra lỗi trong terminal:**
   - Xem có lỗi gì trong output không
   - Copy lỗi và tìm kiếm trên Google

---

### **3. IndexedDB không khởi tạo**

**Triệu chứng:**
- Console log: "IndexedDB not available"
- Data không được lưu

**Giải pháp:**

1. **Kiểm tra browser support:**
   ```javascript
   if (!('indexedDB' in window)) {
     console.error('IndexedDB không được hỗ trợ');
   }
   ```

2. **Xóa database cũ và tạo lại:**
   - DevTools → Application → IndexedDB
   - Xóa database `elearning-db`
   - Refresh trang

3. **Kiểm tra quota:**
   - DevTools → Application → Storage
   - Xem có bị quota exceeded không

---

### **4. Lỗi "Module not found"**

**Triệu chứng:**
```
Error: Cannot find module 'xxx'
```

**Giải pháp:**

```bash
# Cài đặt lại dependencies
npm install

# Nếu vẫn lỗi, xóa cache
rm -rf node_modules
rm package-lock.json
npm install
```

---

### **5. Lỗi CORS**

**Triệu chứng:**
```
Access to fetch at 'xxx' from origin 'xxx' has been blocked by CORS policy
```

**Giải pháp:**

- Đây là lỗi khi gọi API từ domain khác
- Nếu đang dùng Supabase/Cloudflare R2, cần setup CORS đúng
- Xem hướng dẫn trong [MIGRATION_ROADMAP.md](./deployment/MIGRATION_ROADMAP.md)

---

### **6. Lỗi "QuotaExceededError"**

**Triệu chứng:**
- localStorage đầy
- Không thể lưu data

**Giải pháp:**

1. **Xóa data cũ:**
   ```javascript
   // Trong console
   localStorage.clear();
   ```

2. **Export data trước khi xóa:**
   ```javascript
   // Export tất cả data
   const data = await storageManager.exportAll();
   // Download JSON
   ```

3. **Dùng IndexedDB thay vì localStorage:**
   - IndexedDB có dung lượng lớn hơn nhiều
   - Tự động được dùng nếu available

---

## 🚀 CHẠY SERVER

### **Development Server:**

```bash
# Chạy dev server
npm run dev

# Server sẽ chạy tại:
# http://localhost:5173
```

### **Build Production:**

```bash
# Build production
npm run build

# Preview production build
npm run preview
```

### **Lỗi thường gặp khi chạy server:**

1. **Port đã được sử dụng:**
   ```bash
   # Dùng port khác
   npm run dev -- --port 3000
   ```

2. **Node modules chưa cài:**
   ```bash
   npm install
   ```

3. **Lỗi syntax trong code:**
   - Kiểm tra console trong terminal
   - Sửa lỗi syntax
   - Refresh browser

---

## 🔍 DEBUG

### **1. Console Logging**

Mở DevTools (F12) và xem console:
- ✅ Logs bắt đầu với `✅` = Success
- ⚠️ Logs bắt đầu với `⚠️` = Warning
- ❌ Logs bắt đầu với `❌` = Error

### **2. IndexedDB Inspection**

**Chrome:**
1. F12 → Application tab
2. IndexedDB → `elearning-db`
3. Xem các stores và data

**Firefox:**
1. F12 → Storage tab
2. IndexedDB → `elearning-db`
3. Xem các stores và data

### **3. Network Tab**

F12 → Network tab:
- Xem các requests
- Kiểm tra có request nào fail không
- Xem response data

---

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề:

1. **Kiểm tra console errors:**
   - Mở DevTools (F12)
   - Xem tab Console
   - Copy lỗi và tìm kiếm

2. **Kiểm tra terminal:**
   - Xem output khi chạy `npm run dev`
   - Copy lỗi và tìm kiếm

3. **Kiểm tra tài liệu:**
   - [INDEXEDDB_GUIDE.md](./INDEXEDDB_GUIDE.md)
   - [CONTENT_STRUCTURE.md](./CONTENT_STRUCTURE.md)
   - [MIGRATION_ROADMAP.md](./deployment/MIGRATION_ROADMAP.md)

---

**Tài liệu này giúp khắc phục các lỗi thường gặp.**

