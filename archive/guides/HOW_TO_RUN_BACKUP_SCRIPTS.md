# 🚀 CÁCH CHẠY BACKUP SCRIPTS

## ❓ CÂU HỎI

**"npm run backup:organize sẽ chạy ở terminal trong thư mục này hay là chạy ở terminal ở Windows?"**

---

## ✅ TRẢ LỜI

**Chạy ở terminal trong thư mục project** (thư mục có file `package.json`)

---

## 📍 VỊ TRÍ CHẠY

### **Đúng: Terminal trong thư mục project**

```
E:\Projects\elearning - cur\
├── package.json          ← File này chứa scripts
├── scripts/
│   └── backup-organizer.cjs
└── data/
    └── backups/
```

**Bạn cần:**
1. Mở terminal (PowerShell, CMD, hoặc VS Code Terminal)
2. `cd` vào thư mục project: `E:\Projects\elearning - cur`
3. Chạy: `npm run backup:organize`

---

## 🖥️ CÁC CÁCH MỞ TERMINAL

### **Cách 1: VS Code Terminal (Khuyến nghị)**

1. Mở VS Code
2. Mở project: `E:\Projects\elearning - cur`
3. Mở Terminal: `Ctrl + `` (backtick) hoặc `Terminal → New Terminal`
4. Terminal tự động ở đúng thư mục project
5. Chạy: `npm run backup:organize`

---

### **Cách 2: PowerShell/CMD trong thư mục project**

1. Mở File Explorer
2. Điều hướng đến: `E:\Projects\elearning - cur`
3. Click vào thanh địa chỉ, gõ: `powershell` hoặc `cmd`
4. Nhấn Enter
5. Terminal mở ở đúng thư mục
6. Chạy: `npm run backup:organize`

---

### **Cách 3: PowerShell/CMD thủ công**

1. Mở PowerShell hoặc CMD
2. Chạy lệnh:
   ```powershell
   cd "E:\Projects\elearning - cur"
   npm run backup:organize
   ```

---

## ✅ KIỂM TRA ĐÚNG THƯ MỤC

Trước khi chạy, kiểm tra bạn đang ở đúng thư mục:

```powershell
# Xem thư mục hiện tại
pwd
# Hoặc
cd

# Kết quả phải là:
# E:\Projects\elearning - cur

# Kiểm tra có file package.json không
ls package.json
# Hoặc
dir package.json
```

---

## 🚀 VÍ DỤ ĐẦY ĐỦ

### **Bước 1: Mở terminal**

**VS Code:**
```
1. Mở VS Code
2. File → Open Folder → Chọn "E:\Projects\elearning - cur"
3. Terminal → New Terminal (Ctrl + `)
```

**PowerShell:**
```
1. Mở File Explorer
2. Điều hướng đến "E:\Projects\elearning - cur"
3. Click vào thanh địa chỉ
4. Gõ: powershell
5. Nhấn Enter
```

---

### **Bước 2: Kiểm tra thư mục**

```powershell
# Xem thư mục hiện tại
pwd

# Kết quả mong đợi:
# E:\Projects\elearning - cur
```

---

### **Bước 3: Chạy script**

```powershell
npm run backup:organize
```

**Kết quả:**
```
📦 Backup Organizer - 3 Layer Backup System

🔍 Searching for backup files in Downloads...
✓ Found 1 backup file(s)

📦 Processing: elearning-backup-all-2025-01-19_10-30-45.json (2.5 MB)
   Type: all
   ✓ Layer 1: data/backups/2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json
   ✓ Layer 2: E:\Projects\windows_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json
   ✓ Layer 3: G:\Drive của tôi\drive_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json
      → File sẽ tự động sync lên cloud

✅ Backup organization completed!
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Phải ở đúng thư mục project:**

```
✅ Đúng: E:\Projects\elearning - cur\
❌ Sai: E:\Projects\
❌ Sai: C:\Users\YourName\
```

### **2. Cần có Node.js:**

```powershell
# Kiểm tra Node.js đã cài chưa
node --version
npm --version

# Nếu chưa có, cài đặt từ: https://nodejs.org/
```

### **3. Cần có file package.json:**

```powershell
# Kiểm tra file có tồn tại không
ls package.json
# Hoặc
dir package.json
```

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "npm: command not found"**

**Vấn đề:** Node.js/npm chưa cài đặt hoặc chưa có trong PATH

**Giải pháp:**
1. Cài đặt Node.js từ: https://nodejs.org/
2. Khởi động lại terminal
3. Kiểm tra: `npm --version`

---

### **Lỗi: "Cannot find module"**

**Vấn đề:** Không ở đúng thư mục project

**Giải pháp:**
```powershell
# Di chuyển đến đúng thư mục
cd "E:\Projects\elearning - cur"

# Kiểm tra lại
pwd
ls package.json
```

---

### **Lỗi: "File not found"**

**Vấn đề:** Script không tìm thấy file backup trong Downloads

**Giải pháp:**
1. Kiểm tra file có trong Downloads không
2. File phải có pattern: `elearning-*.json`
3. Hoặc chỉ định file cụ thể:
   ```powershell
   node scripts/backup-organizer.cjs "C:\Users\YourName\Downloads\elearning-backup-all.json"
   ```

---

## 📋 TÓM TẮT

### **Câu trả lời:**

**"npm run backup:organize sẽ chạy ở terminal trong thư mục này hay là chạy ở terminal ở Windows?"**

**Trả lời:**
- ✅ **Chạy ở terminal trong thư mục project** (`E:\Projects\elearning - cur`)
- ❌ **KHÔNG chạy ở terminal Windows** (như Command Prompt mở từ Start Menu)

### **Các bước:**

1. ✅ Mở terminal trong thư mục project
2. ✅ Kiểm tra đúng thư mục: `pwd`
3. ✅ Chạy: `npm run backup:organize`

### **Cách mở terminal:**

1. ✅ **VS Code Terminal** (Khuyến nghị) - Tự động ở đúng thư mục
2. ✅ **PowerShell từ File Explorer** - Click vào thanh địa chỉ, gõ `powershell`
3. ✅ **CMD thủ công** - `cd "E:\Projects\elearning - cur"`

---

**Luôn chạy trong thư mục project để đảm bảo script hoạt động đúng!** 🚀✅

