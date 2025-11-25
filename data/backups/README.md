# 💾 Backup Files - Layer 1

Thư mục này chứa các file backup dữ liệu từ Admin Panel (Layer 1 - Trong project).

## 📁 Cấu trúc 3 lớp backup:

```
Layer 1: data/backups/ (Trong project) ← BẠN ĐANG Ở ĐÂY
├── 2025-01/
│   ├── 2025-01-19/
│   │   ├── all/
│   │   │   └── elearning-backup-all-2025-01-19_10-30-45.json
│   │   ├── n1/
│   │   └── series/
│   └── 2025-01-18/
└── 2024-12/

Layer 2: E:\Projects\windows_elearning_data (Windows local)
└── (Cấu trúc tương tự)

Layer 3: G:\Drive của tôi\drive_elearning_data (Drive - tự động sync)
└── (Cấu trúc tương tự)
```

## 📋 Quy tắc:

1. **Export định kỳ** (mỗi tuần/tháng)
2. **Giữ ít nhất 3-5 bản backup** gần nhất
3. **Tự động tổ chức** bằng script: `npm run backup:organize`
4. **Tổ chức theo ngày** để dễ tìm

## 🔄 Quy trình tự động:

1. Export từ Admin Panel → File download về `Downloads/`
2. Chạy script: `npm run backup:organize`
3. Script tự động copy vào cả 3 nơi:
   - ✅ `data/backups/` (Layer 1 - Bạn đang ở đây)
   - ✅ `E:\Projects\windows_elearning_data` (Layer 2)
   - ✅ `G:\Drive của tôi\drive_elearning_data` (Layer 3 - Tự động sync)
4. File tự động sync lên cloud (Layer 3)

## 🚀 Sử dụng:

```bash
# Tự động tổ chức file backup
npm run backup:organize

# Tự động theo dõi và tổ chức
npm run backup:watch

# Dọn dẹp file cũ
npm run backup:cleanup
```

## 📚 Xem thêm:

- `docs/data/BACKUP_STRATEGY_AND_AUTOMATION.md` - Chiến lược backup
- `docs/data/DRIVE_DOWNLOAD_AND_DUPLICATE_HANDLING.md` - Download vào Drive
- `docs/guides/BACKUP_SCRIPTS_GUIDE.md` - Hướng dẫn scripts

