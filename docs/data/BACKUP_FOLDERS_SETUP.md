# 📁 CẤU HÌNH FOLDER BACKUP

## ✅ ĐÃ SETUP

Bạn đã setup 3 lớp backup như sau:

### **Layer 1: Trong project (Local)**
```
E:\Projects\elearning - cur\data\backups\
```
- ✅ Đã có sẵn trong project
- ✅ Quick access
- ✅ Giữ 3-5 bản gần nhất

---

### **Layer 2: Windows Local**
```
E:\Projects\windows_elearning_data\
```
- ✅ Đã setup
- ✅ Local backup trên Windows
- ✅ Giữ 3 tháng gần nhất

---

### **Layer 3: Drive (Tự động sync)**
```
G:\Drive của tôi\drive_elearning_data\
```
- ✅ Đã setup
- ✅ Tự động sync lên cloud
- ✅ Giữ lâu dài

---

## 🔧 CẤU HÌNH SCRIPTS

Các script đã được cấu hình để sử dụng các folder trên:

### **backup-organizer.cjs:**
```javascript
Layer 1: data/backups/ (trong project)
Layer 2: E:\Projects\windows_elearning_data
Layer 3: G:\Drive của tôi\drive_elearning_data
```

### **backup-cleanup.cjs:**
```javascript
Layer 1: data/backups/
Layer 2: E:\Projects\windows_elearning_data
Layer 3: G:\Drive của tôi\drive_elearning_data
```

---

## 🚀 SỬ DỤNG

### **Bước 1: Export từ Admin Panel**
1. Vào Admin Panel → Export/Import
2. Chọn export type (All, Level, Series, etc.)
3. Click "Export"
4. File download về `Downloads/`

### **Bước 2: Chạy script tự động**
```bash
npm run backup:organize
```

**Kết quả:**
- ✅ File được copy vào `data/backups/` (Layer 1)
- ✅ File được copy vào `E:\Projects\windows_elearning_data\` (Layer 2)
- ✅ File được copy vào `G:\Drive của tôi\drive_elearning_data\` (Layer 3)
- ✅ File tự động sync lên cloud (Layer 3)

---

## 📊 CẤU TRÚC THƯ MỤC

Tất cả 3 layer đều có cấu trúc giống nhau:

```
[Layer Folder]/
├── 2025-01/
│   ├── 2025-01-19/
│   │   ├── all/
│   │   │   └── elearning-backup-all-2025-01-19_10-30-45.json
│   │   ├── n1/
│   │   │   └── elearning-backup-N1-2025-01-19_10-30-45.json
│   │   ├── series/
│   │   │   └── elearning-export-series-xxx-2025-01-19_10-30-45.json
│   │   └── exam/
│   │       └── elearning-export-exam-xxx-2025-01-19_10-30-45.json
│   └── 2025-01-18/
└── 2024-12/
```

---

## ⚙️ THAY ĐỔI CẤU HÌNH (Nếu cần)

Nếu muốn thay đổi đường dẫn folder, có 2 cách:

### **Cách 1: Environment Variables**

**Windows PowerShell:**
```powershell
$env:BACKUP_DIR="D:\MyBackups\Elearning"
$env:CLOUD_DIR="F:\MyDrive\Backups"
npm run backup:organize
```

**Windows CMD:**
```cmd
set BACKUP_DIR=D:\MyBackups\Elearning
set CLOUD_DIR=F:\MyDrive\Backups
npm run backup:organize
```

### **Cách 2: Sửa trực tiếp trong script**

Sửa file `scripts/backup-organizer.cjs`:
```javascript
externalBackupDir: process.env.BACKUP_DIR || 'E:\\Projects\\windows_elearning_data',
cloudBackupDir: process.env.CLOUD_DIR || 'G:\\Drive của tôi\\drive_elearning_data',
```

---

## 🧹 DỌN DẸP

### **Dọn dẹp file cũ:**
```bash
# Xem trước (dry run)
npm run backup:cleanup:dry

# Dọn dẹp thực sự
npm run backup:cleanup
```

**Kết quả:**
- ✅ Xóa file cũ hơn 30 ngày
- ✅ Giữ lại 5 bản gần nhất
- ✅ Dọn dẹp cả 3 layer

---

## ✅ CHECKLIST

- [x] ✅ Layer 1: `data/backups/` - Đã có sẵn
- [x] ✅ Layer 2: `E:\Projects\windows_elearning_data\` - Đã setup
- [x] ✅ Layer 3: `G:\Drive của tôi\drive_elearning_data\` - Đã setup
- [x] ✅ Scripts đã được cấu hình
- [ ] ⬜ Test export và chạy script
- [ ] ⬜ Kiểm tra file có sync lên cloud

---

## 📝 TÓM TẮT

### **3 Layer Backup:**

1. **Layer 1:** `data/backups/` - Trong project, quick access
2. **Layer 2:** `E:\Projects\windows_elearning_data\` - Windows local
3. **Layer 3:** `G:\Drive của tôi\drive_elearning_data\` - Drive, tự động sync

### **Workflow:**

```
Export từ Admin Panel
  ↓
File download về Downloads/
  ↓
npm run backup:organize
  ↓
Tự động copy vào cả 3 layer
  ↓
Layer 3 tự động sync lên cloud
```

---

**Setup hoàn tất! Bạn có thể bắt đầu backup ngay!** 🚀✅

