# 📚 Hướng Dẫn Quản Lý Nội Dung

## 🎯 Tổng quan

Module Quản lý Nội dung cho phép Admin quản lý sách, chapters, và series trong hệ thống. Đây là nền tảng cho module Level (Learn Your Approach).

## 🚀 Cách truy cập

1. **Đăng nhập** với tài khoản Admin (thông tin đăng nhập được cấu hình trong `src/data/users.js`)
   
   ⚠️ **Lưu ý:** Vui lòng thay đổi passwords mặc định trước khi deploy lên production!

2. **Truy cập Content Management:**
   - Từ Admin Dashboard: Click vào thẻ **"Tổng số Sách"** hoặc **"Quản lý Nội dung"**
   - Từ Sidebar: Click **"📚 Quản lý Nội dung"**
   - Hoặc truy cập trực tiếp: `/admin/content`

## 📋 Các tính năng

### 1. Quản lý Level

Chọn level cần quản lý:
- **N1**: Trình độ cao nhất
- **N2**: Trình độ cao
- **N3**: Trình độ trung cấp
- **N4**: Trình độ sơ cấp
- **N5**: Trình độ sơ cấp cơ bản

### 2. Quản lý Sách (Books)

#### 2.1. Xem danh sách Sách

Bảng/card hiển thị tất cả sách với:
- **ID**: Mã định danh sách
- **Title**: Tên sách
- **Image**: Ảnh bìa (hoặc placeholder)
- **Category**: Danh mục (series)
- **Chapters**: Số lượng chapters
- **Actions**: Các thao tác (Sửa, Xóa, Quản lý Chapters)

#### 2.2. Thêm Sách mới

**Các bước:**

1. Chọn **Level** (ví dụ: N1)
2. Click nút **"➕ Thêm Sách mới"**
3. Điền form:
   - **ID** * (bắt buộc): Mã định danh (ví dụ: `shinkanzen-n1-bunpou`)
   - **Title** * (bắt buộc): Tên sách (ví dụ: `新完全マスター N1 文法`)
   - **Image URL**: Đường dẫn ảnh bìa (tùy chọn)
     - Ví dụ: `/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg`
   - **Category** * (bắt buộc): Chọn series/category
4. Click **"💾 Lưu"**
5. Sách mới sẽ xuất hiện trong danh sách

**Lưu ý:**
- ID phải duy nhất trong cùng level
- Image URL là tùy chọn (sẽ hiển thị placeholder nếu không có)
- Category phải thuộc một series đã tồn tại

#### 2.3. Sửa thông tin Sách

1. Click nút **"✏️ Sửa"** ở dòng sách cần sửa
2. Form sẽ hiển thị với thông tin hiện tại
3. Chỉnh sửa các trường cần thiết
4. Click **"💾 Lưu"**

#### 2.4. Xóa Sách

1. Click nút **"🗑️ Xóa"** ở dòng sách cần xóa
2. Xác nhận xóa
3. ⚠️ **Cảnh báo**: Xóa sách sẽ xóa tất cả chapters và quizzes liên quan

#### 2.5. Quản lý Chapters

1. Click nút **"📑 Quản lý Chapters"** ở dòng sách
2. Modal hiển thị danh sách chapters
3. Có thể thêm/sửa/xóa chapters từ đây

### 3. Quản lý Chapters

#### 3.1. Thêm Chapter mới

**Các bước:**

1. Chọn sách cần thêm chapter
2. Click **"📑 Quản lý Chapters"** → **"➕ Thêm Chapter mới"**
3. Điền form:
   - **ID** * (bắt buộc): Mã định danh (ví dụ: `bai-1`)
   - **Title** * (bắt buộc): Tên chapter (ví dụ: `Bài 1: Phân biệt cấu trúc`)
4. Click **"💾 Lưu"**

**Lưu ý:**
- ID phải duy nhất trong cùng sách
- Sau khi tạo chapter, có thể tạo quiz cho chapter đó từ Quiz Editor

#### 3.2. Sửa/Xóa Chapter

- **Sửa**: Click **"✏️ Sửa"** → Chỉnh sửa → **"💾 Lưu"**
- **Xóa**: Click **"🗑️ Xóa"** → Xác nhận
  - ⚠️ Xóa chapter sẽ xóa quiz liên quan

### 4. Quản lý Series (Danh mục)

#### 4.1. Xem danh sách Series

Bảng/card hiển thị tất cả series với:
- **ID**: Mã định danh
- **Name**: Tên series (ví dụ: `Shinkanzen`, `Try`, `Speed Master`)
- **Description**: Mô tả
- **Books Count**: Số lượng sách trong series
- **Actions**: Các thao tác (Sửa, Xóa)

#### 4.2. Thêm Series mới

**Các bước:**

1. Chuyển sang tab **"Series"**
2. Click **"➕ Thêm Series mới"**
3. Điền form:
   - **ID** * (bắt buộc): Mã định danh (ví dụ: `shinkanzen`)
   - **Name** * (bắt buộc): Tên series (ví dụ: `新完全マスター`)
   - **Description**: Mô tả (tùy chọn)
4. Click **"💾 Lưu"**

**Lưu ý:**
- ID phải duy nhất trong cùng level
- Series được sắp xếp theo tên tự động

#### 4.3. Sửa/Xóa Series

- **Sửa**: Click **"✏️ Sửa"** → Chỉnh sửa → **"💾 Lưu"**
- **Xóa**: Click **"🗑️ Xóa"** → Xác nhận
  - ⚠️ Xóa series sẽ không xóa sách, chỉ xóa category

## 📊 Pagination (Phân trang)

- Mỗi trang hiển thị **10 items**
- Sử dụng nút **"← Trước"** và **"Sau →"** để điều hướng
- Hiển thị số trang hiện tại và tổng số trang

## 🔍 Preview Data

- Click **"👁️ Xem"** để xem chi tiết sách/chapter/series
- Modal hiển thị đầy đủ thông tin và cấu trúc dữ liệu JSON

## 💾 Lưu trữ dữ liệu

- **Books**: Lưu vào IndexedDB/localStorage (key: `adminBooks_{level}`)
- **Chapters**: Lưu vào IndexedDB/localStorage (key: `adminChapters_{bookId}`)
- **Series**: Lưu vào IndexedDB/localStorage (key: `adminSeries_{level}`)
- Dữ liệu được đồng bộ tự động khi thay đổi

## 📱 Responsive Design

Module được tối ưu cho mọi thiết bị:

- **Mobile**: Card view, form full-width
- **Tablet**: Card view, form 2 cột
- **Desktop**: Table view, form 3 cột

## 🔄 Workflow đề xuất

1. **Tạo Series** → Tạo danh mục sách (ví dụ: Shinkanzen, Try)
2. **Tạo Sách** → Thêm sách vào series
3. **Tạo Chapters** → Thêm chapters cho sách
4. **Tạo Quiz** → Sử dụng Quiz Editor để tạo quiz cho chapters
5. **Quản lý** → Sửa/xóa khi cần thiết

## 💡 Tips

- **Tổ chức theo Series**: Nhóm sách theo series để dễ quản lý
- **Đặt ID rõ ràng**: Sử dụng ID mô tả (ví dụ: `shinkanzen-n1-bunpou`)
- **Upload ảnh bìa**: Thêm ảnh bìa để giao diện đẹp hơn
- **Kiểm tra trước khi xóa**: Xóa sách/chapter sẽ xóa dữ liệu liên quan

## 📝 Ví dụ cấu trúc

```
Level: N1
├── Series: Shinkanzen
│   ├── Book: 新完全マスター N1 文法
│   │   ├── Chapter: Bài 1
│   │   ├── Chapter: Bài 2
│   │   └── ...
│   ├── Book: 新完全マスター N1 読解
│   └── ...
├── Series: Try
│   └── ...
└── ...
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
- Kiểm tra ID có trùng với item khác không?
- Đã chọn level đúng chưa?
- Series đã tồn tại chưa (khi tạo sách)?

