# 🔍 Global Search - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

**Global Search** là tính năng tìm kiếm toàn cục cho phép bạn tìm kiếm nhanh chóng các bài học, chapters, và sách trong toàn bộ hệ thống học tiếng Nhật.

## 🎯 Vị Trí

- **Nút Floating**: Góc dưới bên phải màn hình (mọi trang)
- **Icon**: 🔍 (Kính lúp màu xanh)
- **Text**: "Search (Ctrl+K)" (hiển thị trên desktop)

## ⌨️ Cách Sử Dụng

### 1. Mở Global Search

**Cách 1: Click nút**
- Click vào nút floating màu xanh ở góc dưới bên phải

**Cách 2: Phím tắt**
- **Windows/Linux**: `Ctrl + K`
- **Mac**: `Cmd + K`

### 2. Nhập từ khóa

- Nhập ít nhất **2 ký tự** để bắt đầu tìm kiếm
- Tìm kiếm tự động sau 300ms (debounce)
- Hiển thị spinner khi đang tìm kiếm

### 3. Xem kết quả

Kết quả được chia thành 3 nhóm:

#### 📚 SÁCH (Books)
- Tìm theo: `title`, `id`
- Hiển thị: Tên sách + Level (N1-N5)
- Giới hạn: 5 kết quả

#### 📂 CHAPTERS
- Tìm theo: `title`, `id`
- Hiển thị: Tên chapter + Tên sách + Level
- Giới hạn: 5 kết quả

#### 📝 BÀI HỌC (Lessons)
- Tìm theo: `title`, `id`, `description`
- Hiển thị: Tên bài học + Sách → Chapter + Level
- Giới hạn: 10 kết quả

### 4. Điều Hướng Kết Quả

**Bằng chuột:**
- Click vào bất kỳ kết quả nào để mở

**Bằng bàn phím:**
- `↑` / `↓`: Di chuyển lên/xuống giữa các kết quả
- `Enter`: Mở kết quả đang được chọn
- `Esc`: Đóng search modal

### 5. Đóng Search

- Click vào backdrop (vùng tối phía sau)
- Nhấn phím `Esc`
- Click vào kết quả (tự động đóng sau khi điều hướng)

## 🔍 Phạm Vi Tìm Kiếm

Global Search tìm kiếm trong **TẤT CẢ** các levels:
- ✅ N1 (Cao cấp)
- ✅ N2 (Trung cao cấp)
- ✅ N3 (Trung cấp)
- ✅ N4 (Sơ cấp)
- ✅ N5 (Cơ bản)

## 💡 Ví Dụ Sử Dụng

### Ví dụ 1: Tìm sách
```
Nhập: "minna"
Kết quả: 
  📚 SÁCH (1)
    - Minna no Nihongo I (N5)
```

### Ví dụ 2: Tìm bài học
```
Nhập: "hiragana"
Kết quả:
  📝 BÀI HỌC (3)
    - Học bảng chữ cái Hiragana
      Minna no Nihongo I → Chapter 1 • N5
    - Luyện tập Hiragana
      Minna no Nihongo I → Chapter 1 • N5
```

### Ví dụ 3: Tìm chapter
```
Nhập: "greeting"
Kết quả:
  📂 CHAPTERS (2)
    - Greetings and Introductions
      Minna no Nihongo I • N5
```

## 🎨 Giao Diện

### Nút Floating (Khi đóng)
- **Màu**: Xanh dương (`bg-blue-500`)
- **Vị trí**: `fixed bottom-6 right-6`
- **Style**: Neo-brutalism (border đen, shadow)
- **Hover**: Scale up, shadow lớn hơn

### Modal Search (Khi mở)
- **Backdrop**: Đen mờ 50% (`bg-black/50`)
- **Modal**: Trắng, border đen 4px, shadow lớn
- **Input**: Font lớn, bold, không border
- **Results**: Scrollable, max-height 60vh
- **Highlight**: Kết quả được chọn có background xanh nhạt

## 🔧 Technical Details

### Component Location
```
src/components/GlobalSearch.jsx
```

### Dependencies
- `react-router-dom`: Điều hướng
- `localStorageManager`: Truy cập dữ liệu books/chapters/lessons

### Search Algorithm
1. **Debounce**: 300ms delay để tránh search quá nhiều
2. **Case-insensitive**: Tìm kiếm không phân biệt hoa thường
3. **Partial match**: Tìm kiếm theo substring (includes)
4. **Multi-level**: Tìm trong books → chapters → lessons

### Performance
- **Lazy loading**: Chỉ search khi có ít nhất 2 ký tự
- **Limit results**: Giới hạn số lượng kết quả để tối ưu
- **Async search**: Không block UI khi đang tìm kiếm

## 🚀 Tính Năng Nâng Cao (Có thể phát triển)

### Đề xuất cải tiến:
1. **Search history**: Lưu lịch sử tìm kiếm
2. **Recent searches**: Hiển thị tìm kiếm gần đây
3. **Search filters**: Lọc theo level, type
4. **Highlight matches**: Highlight từ khóa trong kết quả
5. **Fuzzy search**: Tìm kiếm gần đúng (typo tolerance)
6. **Search suggestions**: Gợi ý khi gõ
7. **Keyboard shortcuts**: Thêm nhiều phím tắt hơn
8. **i18n support**: Dịch placeholder và messages

## 📝 Notes

- Global Search hoạt động trên **TẤT CẢ** các trang
- Kết quả được load từ `localStorage` (offline-first)
- Không cần đăng nhập để sử dụng
- Tìm kiếm real-time, không cần submit

---

**Tác giả**: Auto (AI Assistant)  
**Ngày tạo**: 2024  
**Version**: 1.0

