# 🗑️ HƯỚNG DẪN XÓA FILE BACKUP

## 🎯 Mục Đích

Hướng dẫn xóa file backup cụ thể hoặc tất cả file ở cả 3 layer.

---

## 📋 CÁC CÁCH XÓA

### **1. Xóa file cụ thể (Khuyến nghị)**

Xóa một file backup cụ thể ở cả 3 layer.

---

### **2. Xóa tất cả file (Nguy hiểm!)**

Xóa tất cả file backup ở cả 3 layer. **CẨN THẬN!**

---

## 🚀 CÁCH SỬ DỤNG

### **Xóa file cụ thể**

#### **Bước 1: Xem trước (dry run)**

```powershell
# Xem file nào sẽ bị xóa (không xóa thực sự)
npm run backup:delete:dry elearning-backup-all-2025-01-19_10-30-45.json

# Hoặc
node scripts/backup-delete.cjs elearning-backup-all-2025-01-19_10-30-45.json --dry-run
```

**Kết quả:**
```
🗑️  Deleting file: elearning-backup-all-2025-01-19_10-30-45.json
   Mode: DRY RUN (preview only)

📁 Layer 1: E:\Projects\elearning - cur\data\backups
   [DRY RUN] Would delete: data/backups/2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json

📁 Layer 2: E:\Projects\windows_elearning_data
   [DRY RUN] Would delete: E:\Projects\windows_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json

📁 Layer 3: G:\Drive của tôi\drive_elearning_data
   [DRY RUN] Would delete: G:\Drive của tôi\drive_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json

📊 Summary
   Files found: 3
   Files would be deleted: 3
```

---

#### **Bước 2: Xóa thực sự**

```powershell
# Xóa file cụ thể
npm run backup:delete elearning-backup-all-2025-01-19_10-30-45.json

# Hoặc
node scripts/backup-delete.cjs elearning-backup-all-2025-01-19_10-30-45.json
```

**Kết quả:**
```
🗑️  Deleting file: elearning-backup-all-2025-01-19_10-30-45.json
   Mode: DELETE

📁 Layer 1: E:\Projects\elearning - cur\data\backups
   ✓ Deleted: data/backups/2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json

📁 Layer 2: E:\Projects\windows_elearning_data
   ✓ Deleted: E:\Projects\windows_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json

📁 Layer 3: G:\Drive của tôi\drive_elearning_data
   ✓ Deleted: G:\Drive của tôi\drive_elearning_data\2025-01/2025-01-19/all/elearning-backup-all-2025-01-19_10-30-45.json

📊 Summary
   Files found: 3
   Files deleted: 3

✅ Delete operation completed!
```

---

### **Xóa tất cả file (Nguy hiểm!)**

#### **Bước 1: Xem trước (dry run)**

```powershell
# Xem tất cả file nào sẽ bị xóa (không xóa thực sự)
node scripts/backup-delete.cjs --all --dry-run
```

**Kết quả:**
```
🗑️  WARNING: This will delete ALL backup files!
   Mode: DRY RUN (preview only)

📁 Layer 1: E:\Projects\elearning - cur\data\backups
   Found: 15 files
   [DRY RUN] Would delete: ...

📁 Layer 2: E:\Projects\windows_elearning_data
   Found: 12 files
   [DRY RUN] Would delete: ...

📁 Layer 3: G:\Drive của tôi\drive_elearning_data
   Found: 10 files
   [DRY RUN] Would delete: ...

📊 Summary
   Total files found: 37
   Total files would be deleted: 37
   Total size: 125.50 MB

💡 Run without --dry-run to actually delete files
```

---

#### **Bước 2: Xóa thực sự (CẨN THẬN!)**

```powershell
# Xóa tất cả file backup
node scripts/backup-delete.cjs --all
```

**Cảnh báo:**
- Script sẽ đợi 5 giây trước khi xóa
- Nhấn `Ctrl+C` để hủy nếu không muốn xóa
- **Hành động này không thể hoàn tác!**

**Kết quả:**
```
🗑️  WARNING: This will delete ALL backup files!
   Mode: DELETE ALL

⚠️  Are you sure you want to delete ALL backup files?
   This action cannot be undone!
   Press Ctrl+C to cancel, or wait 5 seconds...

📁 Layer 1: E:\Projects\elearning - cur\data\backups
   Found: 15 files
   ✓ Deleted: ...

📁 Layer 2: E:\Projects\windows_elearning_data
   Found: 12 files
   ✓ Deleted: ...

📁 Layer 3: G:\Drive của tôi\drive_elearning_data
   Found: 10 files
   ✓ Deleted: ...

📊 Summary
   Total files found: 37
   Total files deleted: 37
   Total size: 125.50 MB

⚠️  All backup files have been deleted!

✅ Delete operation completed!
```

---

## 📋 VÍ DỤ SỬ DỤNG

### **Ví dụ 1: Xóa file cụ thể**

```powershell
# 1. Xem trước
npm run backup:delete:dry elearning-backup-all-2025-01-19_10-30-45.json

# 2. Nếu OK, xóa thực sự
npm run backup:delete elearning-backup-all-2025-01-19_10-30-45.json
```

---

### **Ví dụ 2: Xóa file với tên một phần**

```powershell
# Xóa tất cả file có chứa "2025-01-19" trong tên
node scripts/backup-delete.cjs 2025-01-19 --dry-run
```

**Lưu ý:** Script sẽ tìm tất cả file có chứa chuỗi này trong tên.

---

### **Ví dụ 3: Xóa tất cả file (dry run)**

```powershell
# Xem trước tất cả file sẽ bị xóa
node scripts/backup-delete.cjs --all --dry-run
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Luôn dùng --dry-run trước:**

```powershell
# ✅ Đúng: Xem trước trước
npm run backup:delete:dry filename.json

# ❌ Sai: Xóa ngay không kiểm tra
npm run backup:delete filename.json
```

---

### **2. Xóa tất cả rất nguy hiểm:**

- ⚠️ **Không thể hoàn tác**
- ⚠️ **Xóa ở cả 3 layer**
- ⚠️ **Xóa cả file trên cloud** (Layer 3 sync)

**Khuyến nghị:**
- ✅ Dùng `backup:cleanup` thay vì `--all`
- ✅ `backup:cleanup` chỉ xóa file cũ, giữ lại file mới

---

### **3. Xóa file trên Drive (Layer 3):**

- File xóa trên Drive sẽ tự động sync lên cloud
- File trên cloud cũng sẽ bị xóa
- **Không thể khôi phục từ cloud** (trừ khi có version history)

---

## 🔄 SO SÁNH VỚI CLEANUP

| Tính năng | `backup:delete` | `backup:cleanup` |
|-----------|-----------------|------------------|
| **Xóa file cụ thể** | ✅ Có | ❌ Không |
| **Xóa tất cả** | ✅ Có (nguy hiểm) | ❌ Không |
| **Xóa file cũ** | ❌ Không | ✅ Có |
| **Giữ file mới** | ❌ Không | ✅ Có |
| **An toàn** | ⚠️ Cần cẩn thận | ✅ An toàn hơn |

**Khuyến nghị:**
- ✅ Dùng `backup:cleanup` cho dọn dẹp định kỳ
- ✅ Dùng `backup:delete` cho xóa file cụ thể

---

## 📋 CHECKLIST

### **Trước khi xóa:**

- [ ] ✅ Đã xem trước với `--dry-run`
- [ ] ✅ Đã kiểm tra file cần xóa
- [ ] ✅ Đã backup file quan trọng (nếu cần)
- [ ] ✅ Đã hiểu hậu quả

### **Khi xóa:**

- [ ] ✅ Đang ở đúng thư mục project
- [ ] ✅ Đã chạy `--dry-run` trước
- [ ] ✅ Đã xác nhận file cần xóa

### **Sau khi xóa:**

- [ ] ✅ Đã kiểm tra file đã bị xóa
- [ ] ✅ Đã kiểm tra cả 3 layer
- [ ] ✅ Đã kiểm tra cloud (nếu xóa Layer 3)

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "No files found"**

**Nguyên nhân:** File không tồn tại hoặc tên không đúng

**Giải pháp:**
1. Kiểm tra tên file có đúng không
2. Kiểm tra file có trong thư mục backup không
3. Dùng `--dry-run` để xem file nào được tìm thấy

---

### **Lỗi: "Permission denied"**

**Nguyên nhân:** Không có quyền xóa file

**Giải pháp:**
1. Chạy với quyền admin (nếu cần)
2. Kiểm tra quyền thư mục
3. Kiểm tra file có đang được mở không

---

### **Lỗi: "File is in use"**

**Nguyên nhân:** File đang được sử dụng bởi process khác

**Giải pháp:**
1. Đóng tất cả ứng dụng đang mở file
2. Đợi vài giây rồi thử lại
3. Khởi động lại máy (nếu cần)

---

## 📝 TÓM TẮT

### **Xóa file cụ thể:**

```powershell
# 1. Xem trước
npm run backup:delete:dry filename.json

# 2. Xóa thực sự
npm run backup:delete filename.json
```

### **Xóa tất cả (Nguy hiểm!):**

```powershell
# 1. Xem trước
node scripts/backup-delete.cjs --all --dry-run

# 2. Xóa thực sự (CẨN THẬN!)
node scripts/backup-delete.cjs --all
```

### **Khuyến nghị:**

- ✅ **Luôn dùng `--dry-run` trước**
- ✅ **Dùng `backup:cleanup` cho dọn dẹp định kỳ**
- ✅ **Chỉ dùng `backup:delete` cho file cụ thể**

---

**Luôn cẩn thận khi xóa file backup!** ⚠️✅

