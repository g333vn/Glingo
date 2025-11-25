# 📦 Data Management

Thư mục này chứa các file quản lý dữ liệu của project.

## 📁 Cấu trúc:

- **`backups/`** - Export/Import backup files
  - Tổ chức theo ngày: `YYYY-MM/YYYY-MM-DD/`
  - Chứa các file JSON export từ Admin Panel
  
- **`exports/`** - Temporary export files
  - File export tạm thời trước khi di chuyển vào backups/
  
- **`imports/`** - Files ready to import
  - File JSON sẵn sàng để import vào Admin Panel

## 📚 Tài liệu:

Xem thêm:
- `docs/data/EXPORT_FILE_LOCATION_GUIDE.md` - Hướng dẫn vị trí lưu file export
- `docs/data/DATA_EXPORT_COMPATIBILITY.md` - Tương thích với Server/SQL
- `docs/data/DATA_STORAGE_AND_PERSISTENCE.md` - Vị trí lưu trữ và tính chất dữ liệu

## ⚠️ Lưu ý:

- File backup có thể lớn (vài MB đến vài chục MB)
- Nên thêm vào `.gitignore` nếu không muốn commit lên Git
- Export định kỳ để có backup an toàn

