# 🔍 Kế Hoạch Debug và Fix Lỗi `Cannot read properties of undefined (reading 'version')`

## 📋 Vấn Đề

Lỗi: `Uncaught TypeError: Cannot read properties of undefined (reading 'version')` tại `vendor-Dsk7ubuB.js:6:3305`

Code gây lỗi: `var li=Number(p.version.split(".")[0])` 
- `p` là import từ `react-vendor` chunk
- Code này chạy ngay khi module được evaluate, TRƯỚC khi import hoàn thành

## 🎯 Kế Hoạch 3 Bước

### BƯỚC 1: Xác Định Source Code Gốc
**Mục tiêu:** Tìm file node_modules nào chứa code này

**Cách làm:**
1. Tìm trong `node_modules/antd` hoặc `node_modules/rc-*` 
2. Search pattern: `version.split` hoặc `React.version.split`
3. Xác định file và dòng code chính xác

**Kết quả mong đợi:** Biết được file nào trong node_modules đang gây lỗi

---

### BƯỚC 2: Fix Ở Source Code (Không Fix Ở Build Output)
**Mục tiêu:** Sửa code gốc thay vì sửa ở build output

**Các phương án:**

#### Option A: Sử dụng Vite Plugin để Transform Source Code
- Tạo plugin transform code trong `node_modules` trước khi bundle
- Thay thế `p.version.split` thành safe version ngay từ source

#### Option B: Sử dụng Patch Package
- Tạo patch file với `patch-package`
- Patch file trong `node_modules` để fix code

#### Option C: Wrap Code Trong Async Function
- Đảm bảo code chỉ chạy sau khi import hoàn thành
- Sử dụng dynamic import hoặc Promise

---

### BƯỚC 3: Test và Verify
**Mục tiêu:** Đảm bảo fix hoạt động

1. Build lại project
2. Kiểm tra `dist/assets/vendor-*.js` không còn unsafe access
3. Test trên production
4. Verify không còn lỗi trong console

---

## 🔧 Implementation Plan

### Phase 1: Investigation (BƯỚC 1)
- [ ] Search trong node_modules để tìm source code
- [ ] Xác định package và file chính xác
- [ ] Hiểu context của code (tại sao cần React.version)

### Phase 2: Solution (BƯỚC 2)
- [ ] Chọn phương án fix (A, B, hoặc C)
- [ ] Implement fix
- [ ] Test build

### Phase 3: Verification (BƯỚC 3)
- [ ] Build và kiểm tra output
- [ ] Test trên local preview
- [ ] Deploy và test trên production

---

## 💡 Recommended Approach

**Ưu tiên: Option A - Vite Transform Plugin**

Lý do:
- Không cần patch node_modules (dễ mất khi npm install)
- Fix ở build time, không ảnh hưởng source code
- Dễ maintain và update

**Nếu Option A không work: Option B - Patch Package**

Lý do:
- Fix trực tiếp ở source
- Persistent qua npm install
- Cần commit patch file vào git

---

## 🚨 Critical Points

1. **Không fix ở build output** - sẽ bị mất mỗi lần build
2. **Fix ở source hoặc transform** - đảm bảo fix persistent
3. **Test kỹ** - đảm bảo không break functionality

