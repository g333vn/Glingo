# SQL Scripts Directory

Thư mục này chứa các SQL scripts được tổ chức theo mục đích sử dụng.

## Cấu trúc

```
scripts/sql/
├── checks/          # Verification & check queries
│   ├── check_audio_in_database.sql
│   ├── check_chapter1_data.sql
│   ├── check_passage_image_in_database.sql
│   ├── check_placeholder_version.sql
│   └── quick_check_placeholder_version.sql
│
└── utilities/       # Utility queries for data inspection
    └── exam_database_queries.sql
```

## Phân loại

### `checks/` - Verification Queries
Các query để kiểm tra và xác minh dữ liệu trong database:
- Kiểm tra cấu trúc dữ liệu
- Xác minh tính toàn vẹn dữ liệu
- Tìm các vấn đề hoặc inconsistencies
- **Không thay đổi dữ liệu** - chỉ đọc (SELECT)

### `utilities/` - Utility Queries
Các query tiện ích để tra cứu và phân tích dữ liệu:
- Xem dữ liệu exam, questions, sections
- Thống kê và báo cáo
- **Không thay đổi dữ liệu** - chỉ đọc (SELECT)

## Database Migrations

Các database migrations (ALTER TABLE, CREATE, UPDATE) nằm ở thư mục:
```
migrations/
├── migrate_listening_audio_format.sql
├── add_access_control_to_app_settings.sql
├── add_exam_config_to_app_settings.sql
└── ...
```

## Sử dụng

1. **Check queries**: Chạy trong Supabase SQL Editor để kiểm tra dữ liệu
2. **Utility queries**: Sử dụng để tra cứu và phân tích dữ liệu
3. **Migrations**: Chạy cẩn thận, nên backup trước khi chạy

## Lưu ý

- Tất cả queries trong `checks/` và `utilities/` chỉ đọc dữ liệu (SELECT)
- Migrations có thể thay đổi dữ liệu, nên backup trước khi chạy
- Thay đổi các tham số (level, exam_id, etc.) trong queries theo nhu cầu
