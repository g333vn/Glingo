# 🧪 HƯỚNG DẪN TEST BACKUP

## 🎯 Mục Đích

Hướng dẫn test toàn bộ quy trình backup để đảm bảo mọi thứ hoạt động đúng.

---

## ✅ CHECKLIST TRƯỚC KHI TEST

- [ ] ✅ Đã cài đặt Node.js và npm
- [ ] ✅ Đã có dữ liệu trong IndexedDB (ít nhất 1 exam hoặc 1 series)
- [ ] ✅ Đã setup 3 folder backup:
  - Layer 1: `data/backups/` (trong project)
  - Layer 2: `E:\Projects\windows_elearning_data\`
  - Layer 3: `G:\Drive của tôi\drive_elearning_data\`
- [ ] ✅ Đã mở terminal trong thư mục project

---

## 📋 TEST 1: EXPORT TỪ ADMIN PANEL

### **Bước 1: Mở Admin Panel**

1. Chạy dev server:
   ```bash
   npm run dev
   ```

2. Mở browser: `http://localhost:5173` (hoặc port khác)

3. Đăng nhập Admin Panel

4. Vào: **Export/Import** (hoặc **Admin → Export/Import**)

---

### **Bước 2: Export dữ liệu**

1. Click nút **"Export"**

2. Chọn export type:
   - **"All Data"** (khuyến nghị cho test đầu tiên)
   - Hoặc **"Level"** → Chọn một level (N1, N2, etc.)
   - Hoặc **"Exam"** → Chọn một exam cụ thể

3. Click **"Export"** trong modal

4. File sẽ download về `Downloads/`

5. Kiểm tra file:
   - Tên file: `elearning-backup-all-2025-01-19_10-30-45.json` (có timestamp)
   - Kích thước: > 0 KB
   - Format: JSON

---

### **Bước 3: Kiểm tra file download**

**Windows:**
```
1. Mở File Explorer
2. Điều hướng đến: C:\Users\YourName\Downloads\
3. Tìm file: elearning-backup-all-*.json
4. Kiểm tra:
   - File có tồn tại không?
   - Kích thước > 0 KB?
   - Có thể mở bằng Notepad/VS Code?
```

**Mở file để kiểm tra:**
```json
{
  "timestamp": "2025-01-19T10:30:45.123Z",
  "version": "2.0.0",
  "books": {...},
  "series": {...},
  "exams": {...}
}
```

---

## 📋 TEST 2: CHẠY BACKUP ORGANIZER

### **Bước 1: Mở terminal trong thư mục project**

**VS Code:**
```
1. Mở VS Code
2. File → Open Folder → "E:\Projects\elearning - cur"
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

# Kết quả phải là:
# E:\Projects\elearning - cur

# Kiểm tra có file package.json không
ls package.json
# Hoặc
dir package.json
```

---

### **Bước 3: Chạy backup organizer**

```powershell
npm run backup:organize
```

**Kết quả mong đợi:**
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

### **Bước 4: Kiểm tra kết quả**

**Kiểm tra Layer 1 (trong project):**
```powershell
# Xem file trong data/backups/
ls data/backups/2025-01/2025-01-19/all/

# Hoặc mở File Explorer:
# E:\Projects\elearning - cur\data\backups\2025-01\2025-01-19\all\
```

**Kiểm tra Layer 2 (Windows local):**
```powershell
# Xem file trong Windows backup folder
ls "E:\Projects\windows_elearning_data\2025-01\2025-01-19\all\"

# Hoặc mở File Explorer:
# E:\Projects\windows_elearning_data\2025-01\2025-01-19\all\
```

**Kiểm tra Layer 3 (Drive):**
```powershell
# Xem file trong Drive folder
ls "G:\Drive của tôi\drive_elearning_data\2025-01\2025-01-19\all\"

# Hoặc mở File Explorer:
# G:\Drive của tôi\drive_elearning_data\2025-01\2025-01-19\all\
```

**Kiểm tra file có sync lên cloud:**
```
1. Mở Google Drive web: https://drive.google.com
2. Tìm folder: drive_elearning_data
3. Kiểm tra file có trong đó không
4. File sẽ tự động sync (có thể mất vài phút)
```

---

## 📋 TEST 3: TEST TRÙNG FILE

### **Mục đích:** Kiểm tra xử lý file trùng

### **Bước 1: Export lại cùng một dữ liệu**

1. Export lại từ Admin Panel (cùng export type)
2. File download về Downloads/ với tên khác (có timestamp khác)

### **Bước 2: Chạy backup organizer lại**

```powershell
npm run backup:organize
```

**Kết quả mong đợi:**
- File mới được copy vào cả 3 layer
- Không bị ghi đè file cũ
- Cả 2 file đều tồn tại

**Kiểm tra:**
```powershell
# Xem có 2 file không
ls data/backups/2025-01/2025-01-19/all/

# Kết quả:
# elearning-backup-all-2025-01-19_10-30-45.json
# elearning-backup-all-2025-01-19_14-20-10.json
```

---

## 📋 TEST 4: TEST IMPORT

### **Mục đích:** Kiểm tra có thể import lại dữ liệu không

### **Bước 1: Xóa dữ liệu test (tùy chọn)**

**Lưu ý:** Chỉ xóa nếu bạn muốn test import hoàn toàn. Nếu không, có thể skip bước này.

1. Vào Admin Panel → Export/Import
2. (Tùy chọn) Xóa một vài dữ liệu để test import

---

### **Bước 2: Import file backup**

1. Vào Admin Panel → Export/Import

2. Click nút **"Import"**

3. Click **"Choose File"** hoặc **"Browse"**

4. Chọn file backup:
   - Điều hướng đến: `data/backups/2025-01/2025-01-19/all/`
   - Chọn file: `elearning-backup-all-2025-01-19_10-30-45.json`

5. Click **"Import"** trong modal

6. Xác nhận import (nếu có dialog)

---

### **Bước 3: Kiểm tra kết quả**

1. Kiểm tra dữ liệu đã được import:
   - Vào Admin Panel → Content Management
   - Kiểm tra Series, Books, Chapters có dữ liệu không
   - Vào Admin Panel → Exam Management
   - Kiểm tra Exams có dữ liệu không

2. Kiểm tra console (F12):
   - Không có lỗi
   - Có log thành công

---

## 📋 TEST 5: TEST BACKUP WATCHER

### **Mục đích:** Kiểm tra tự động theo dõi và tổ chức

### **Bước 1: Chạy watcher**

```powershell
npm run backup:watch
```

**Kết quả:**
```
👀 Backup Watcher Started

📁 Watching: C:\Users\YourName\Downloads
🔄 Watch mode: ON (Press Ctrl+C to stop)
```

---

### **Bước 2: Export từ Admin Panel**

1. Vào Admin Panel → Export/Import
2. Export một dữ liệu mới
3. File download về Downloads/

---

### **Bước 3: Kiểm tra watcher tự động phát hiện**

**Kết quả mong đợi trong terminal:**
```
🆕 New backup file detected: elearning-backup-all-2025-01-19_15-30-45.json

📦 Processing: elearning-backup-all-2025-01-19_15-30-45.json (2.5 MB)
   Type: all
   ✓ Layer 1: data/backups/2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_15-30-45.json
   ✓ Layer 2: E:\Projects\windows_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_15-30-45.json
   ✓ Layer 3: G:\Drive của tôi\drive_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_15-30-45.json
```

---

### **Bước 4: Dừng watcher**

Nhấn `Ctrl + C` để dừng watcher

---

## 📋 TEST 6: TEST CLEANUP

### **Mục đích:** Kiểm tra dọn dẹp file cũ

### **Bước 1: Xem trước (dry run)**

```powershell
npm run backup:cleanup:dry
```

**Kết quả:**
```
🧹 Backup Cleanup Script

⚠️  DRY RUN MODE - No files will be deleted

📋 Configuration:
   Keep days: 30
   Keep count: 5

🧹 Cleaning up: data/backups
   Total files: 10
   Keeping: 5 (newest)
   To delete: 5
   [DRY RUN] Delete: elearning-backup-all-2024-12-01.json (45 days old, 2.3 MB)
   ...
   Would free: 12.5 MB
```

---

### **Bước 2: Chạy cleanup thực sự (nếu OK)**

```powershell
npm run backup:cleanup
```

**Lưu ý:** Chỉ chạy nếu bạn chắc chắn muốn xóa file cũ!

---

## 📋 TEST 7: TEST TỔNG HỢP

### **Mục đích:** Test toàn bộ workflow

### **Workflow hoàn chỉnh:**

```
1. Export từ Admin Panel
   ↓
2. File download về Downloads/
   ↓
3. Chạy: npm run backup:organize
   ↓
4. File được copy vào cả 3 layer
   ↓
5. File tự động sync lên cloud (Layer 3)
   ↓
6. Test import lại
   ↓
7. Test cleanup (dry run)
```

---

## ✅ CHECKLIST TEST

### **Test Export:**
- [ ] ✅ Export thành công từ Admin Panel
- [ ] ✅ File download về Downloads/
- [ ] ✅ File có timestamp chi tiết
- [ ] ✅ File có thể mở và đọc được

### **Test Backup Organizer:**
- [ ] ✅ Script chạy không lỗi
- [ ] ✅ File được copy vào Layer 1 (`data/backups/`)
- [ ] ✅ File được copy vào Layer 2 (`E:\Projects\windows_elearning_data\`)
- [ ] ✅ File được copy vào Layer 3 (`G:\Drive của tôi\drive_elearning_data\`)
- [ ] ✅ File tự động sync lên cloud

### **Test Trùng File:**
- [ ] ✅ Export nhiều lần không bị ghi đè
- [ ] ✅ Mỗi file có timestamp riêng
- [ ] ✅ Tất cả file đều tồn tại

### **Test Import:**
- [ ] ✅ Import thành công
- [ ] ✅ Dữ liệu được khôi phục đúng
- [ ] ✅ Không có lỗi trong console

### **Test Watcher:**
- [ ] ✅ Watcher tự động phát hiện file mới
- [ ] ✅ Tự động tổ chức file
- [ ] ✅ Có thể dừng bằng Ctrl+C

### **Test Cleanup:**
- [ ] ✅ Dry run hiển thị đúng file sẽ xóa
- [ ] ✅ Cleanup xóa file cũ đúng
- [ ] ✅ Giữ lại file mới nhất

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "No backup files found in Downloads"**

**Nguyên nhân:** File không có pattern đúng hoặc không trong Downloads

**Giải pháp:**
1. Kiểm tra file có pattern: `elearning-*.json`
2. Kiểm tra file có trong Downloads không
3. Hoặc chỉ định file cụ thể:
   ```powershell
   node scripts/backup-organizer.cjs "C:\Users\YourName\Downloads\elearning-backup-all.json"
   ```

---

### **Lỗi: "Layer 2 failed" hoặc "Layer 3 failed"**

**Nguyên nhân:** Folder không tồn tại hoặc không có quyền

**Giải pháp:**
1. Tạo folder thủ công:
   ```powershell
   mkdir "E:\Projects\windows_elearning_data"
   mkdir "G:\Drive của tôi\drive_elearning_data"
   ```
2. Kiểm tra quyền ghi vào folder
3. Chạy với quyền admin (nếu cần)

---

### **Lỗi: "File not found" khi import**

**Nguyên nhân:** File không đúng format hoặc bị hỏng

**Giải pháp:**
1. Kiểm tra file có thể mở bằng text editor không
2. Kiểm tra file có đúng format JSON không
3. Kiểm tra file có field `version`, `timestamp` không

---

### **File không sync lên cloud**

**Nguyên nhân:** Google Drive chưa sync hoặc folder chưa được mount

**Giải pháp:**
1. Kiểm tra Google Drive Desktop App đã cài chưa
2. Kiểm tra folder `G:\Drive của tôi\drive_elearning_data\` có trong Google Drive không
3. Đợi vài phút để sync (có thể mất thời gian)
4. Kiểm tra Google Drive web: https://drive.google.com

---

## 📝 TÓM TẮT

### **Các bước test chính:**

1. ✅ **Test Export** - Export từ Admin Panel
2. ✅ **Test Backup Organizer** - Chạy script và kiểm tra 3 layer
3. ✅ **Test Trùng File** - Export nhiều lần
4. ✅ **Test Import** - Import lại dữ liệu
5. ✅ **Test Watcher** - Tự động theo dõi
6. ✅ **Test Cleanup** - Dọn dẹp file cũ

### **Kết quả mong đợi:**

- ✅ Export thành công
- ✅ File được copy vào cả 3 layer
- ✅ File tự động sync lên cloud
- ✅ Import thành công
- ✅ Không có lỗi

---

**Chúc bạn test thành công!** 🚀✅

