# 📦 Hướng Dẫn Sử Dụng Backup Scripts

## 🎯 Tổng Quan

Đã tạo **3 scripts tự động** để quản lý backup vào cả 3 nơi:

1. **backup-organizer.cjs** - Tổ chức file backup
2. **backup-watcher.cjs** - Theo dõi tự động
3. **backup-cleanup.cjs** - Dọn dẹp file cũ

---

## 🚀 Quick Start

### **Bước 1: Export từ Admin Panel**

1. Vào Admin Panel → Export/Import
2. Chọn export type (All, Level, Series, etc.)
3. Click "Export"
4. File download về `Downloads/`

### **Bước 2: Chạy Backup Organizer**

```bash
npm run backup:organize
```

**Kết quả:**
- ✅ File được copy vào `data/backups/` (Layer 1)
- ✅ File được copy vào `D:\Backups\Elearning\` (Layer 2)
- ✅ Hiển thị hướng dẫn upload lên Cloud (Layer 3)

### **Bước 3: Upload lên Cloud Storage**

1. Mở `Google Drive/Elearning Backups/`
2. Copy file từ `D:\Backups\Elearning\`
3. File tự động sync lên cloud

---

## 📋 Chi Tiết Từng Script

### **1. backup-organizer.js**

**Chức năng:**
- Tự động tìm file backup trong Downloads
- Tổ chức theo ngày: `YYYY-MM/YYYY-MM-DD/`
- Phân loại theo type: all, n1-n5, series, book, etc.
- Copy vào cả 2 nơi local

**Usage:**
```bash
# Tự động tìm trong Downloads
npm run backup:organize

# Hoặc chỉ định file cụ thể
node scripts/backup-organizer.cjs "C:\Users\YourName\Downloads\elearning-backup-all.json"
```

**Output:**
```
📦 Processing: elearning-backup-all-2025-01-16.json (2.5 MB)
   Type: all
   ✓ Layer 1: data/backups/2025-01/2025-01-16/all/elearning-backup-all-2025-01-16.json
   ✓ Layer 2: D:\Backups\Elearning\2025-01/2025-01-16/all/elearning-backup-all-2025-01-16.json
   ℹ Layer 3: Upload to Cloud Storage manually
      → Copy to: C:\Users\YourName\Google Drive\Elearning Backups
```

---

### **2. backup-watcher.js**

**Chức năng:**
- Tự động theo dõi thư mục Downloads
- Phát hiện file backup mới
- Tự động tổ chức khi file download xong

**Usage:**
```bash
# Chạy liên tục (watch mode)
npm run backup:watch

# Hoặc chạy 1 lần
node scripts/backup-watcher.cjs --once
```

**Khi nào dùng:**
- ✅ Khi bạn export nhiều file liên tục
- ✅ Muốn tự động hóa hoàn toàn
- ✅ Không muốn nhớ chạy script mỗi lần

**Lưu ý:**
- Script chạy liên tục, nhấn `Ctrl+C` để dừng
- Kiểm tra file mỗi 5 giây

---

### **3. backup-cleanup.js**

**Chức năng:**
- Xóa file backup cũ
- Giữ lại 5 bản gần nhất
- Xóa file cũ hơn 30 ngày (mặc định)

**Usage:**
```bash
# Dọn dẹp (thực sự xóa)
npm run backup:cleanup

# Dry run (chỉ xem, không xóa)
npm run backup:cleanup:dry

# Giữ lại 60 ngày
node scripts/backup-cleanup.cjs --keep-days=60
```

**Output:**
```
🧹 Cleaning up: data/backups
   Total files: 15
   Keeping: 5 (newest)
   To delete: 10
   Delete: elearning-backup-all-2024-12-01.json (45 days old, 2.3 MB)
   ...
   Freed: 23.5 MB
```

---

## ⚙️ Configuration

### **Thay đổi folder backup riêng:**

**Windows (PowerShell):**
```powershell
$env:BACKUP_DIR="E:\MyBackups\Elearning"
npm run backup:organize
```

**Windows (CMD):**
```cmd
set BACKUP_DIR=E:\MyBackups\Elearning
npm run backup:organize
```

**Linux/Mac:**
```bash
export BACKUP_DIR="/home/user/backups/elearning"
npm run backup:organize
```

### **Thay đổi Cloud folder:**

**Windows:**
```powershell
$env:CLOUD_DIR="C:\Users\YourName\Dropbox\Elearning Backups"
```

---

## 📊 Workflow Hoàn Chỉnh

### **Hàng ngày:**

```
1. Export từ Admin Panel
   ↓
2. File download về Downloads/
   ↓
3. Chạy: npm run backup:organize
   ↓
4. File được copy vào:
   - data/backups/ (Layer 1)
   - D:\Backups\Elearning\ (Layer 2)
   ↓
5. Upload lên Cloud Storage (Layer 3)
```

### **Tự động hóa:**

```
1. Chạy: npm run backup:watch
   ↓
2. Script tự động theo dõi Downloads
   ↓
3. Khi có file mới → Tự động tổ chức
   ↓
4. Bạn chỉ cần upload lên cloud
```

### **Dọn dẹp định kỳ:**

```
Mỗi tháng chạy:
npm run backup:cleanup

→ Xóa file cũ, giải phóng dung lượng
```

---

## 🎯 Best Practices

### **1. Backup thường xuyên:**
- ✅ Sau mỗi lần nhập dữ liệu quan trọng
- ✅ Mỗi tuần backup toàn bộ
- ✅ Mỗi tháng upload lên cloud

### **2. Tổ chức file:**
- ✅ Luôn chạy `backup:organize` sau khi export
- ✅ Giữ file trong `data/backups/` để quick access
- ✅ Copy vào folder riêng để an toàn

### **3. Cloud Storage:**
- ✅ Upload ngay sau khi backup quan trọng
- ✅ Giữ nhiều bản trên cloud (không xóa)
- ✅ Kiểm tra sync định kỳ

### **4. Dọn dẹp:**
- ✅ Chạy `backup:cleanup` mỗi tháng
- ✅ Dùng `--dry-run` để xem trước
- ✅ Giữ ít nhất 3 bản gần nhất

---

## 🐛 Troubleshooting

### **Script không tìm thấy file:**

**Vấn đề:** File không có pattern đúng

**Giải pháp:**
- File phải có tên: `elearning-*.json`
- Ví dụ: `elearning-backup-all-2025-01-16.json`

### **Lỗi permission:**

**Vấn đề:** Không có quyền ghi vào thư mục

**Giải pháp:**
- Chạy với quyền admin (nếu cần)
- Kiểm tra quyền thư mục backup
- Tạo thư mục thủ công nếu cần

### **Cloud folder không tồn tại:**

**Vấn đề:** Script không tìm thấy cloud folder

**Giải pháp:**
- Tạo folder thủ công: `Google Drive/Elearning Backups/`
- Hoặc thay đổi `CLOUD_DIR` environment variable

---

## 📝 Examples

### **Example 1: Backup hàng ngày**

```bash
# 1. Export từ Admin Panel
# 2. File download về Downloads/

# 3. Chạy organizer
npm run backup:organize

# 4. Upload lên cloud (thủ công)
# Copy từ D:\Backups\Elearning\ → Google Drive
```

### **Example 2: Tự động hóa**

```bash
# 1. Chạy watcher
npm run backup:watch

# 2. Export từ Admin Panel
# 3. Script tự động phát hiện và tổ chức

# 4. Upload lên cloud (thủ công)
```

### **Example 3: Dọn dẹp**

```bash
# 1. Xem trước (dry run)
npm run backup:cleanup:dry

# 2. Nếu OK, chạy thật
npm run backup:cleanup

# 3. Hoặc giữ lại 60 ngày
node scripts/backup-cleanup.js --keep-days=60
```

---

## ✅ Checklist

- [ ] Đã tạo folder: `D:\Backups\Elearning\`
- [ ] Đã setup Cloud Storage folder
- [ ] Đã test script: `npm run backup:organize`
- [ ] Đã hiểu workflow backup
- [ ] Đã setup dọn dẹp định kỳ

---

**Happy backing up!** 💾✅

