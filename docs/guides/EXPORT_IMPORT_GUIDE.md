# 📥📤 HƯỚNG DẪN EXPORT/IMPORT DỮ LIỆU

## 📍 VỊ TRÍ TÍNH NĂNG

### 1. **Export/Import theo Level (Tất cả dữ liệu)**
- **Vị trí**: Header của trang "Quản lý Bài học"
- **Nút**: 
  - 📥 **Export** (màu xanh lá) - Góc phải trên cùng
  - 📤 **Import** (màu xanh dương) - Bên cạnh nút Export

### 2. **Export/Import từng phần tử cụ thể**
- **Series**: Nút 📥 trên Series card
- **Book**: 
  - Nút 📥 trên Book trong Series card (khi expand)
  - Nút "📥 Export Book" khi xem danh sách Chapters
- **Chapter**: 
  - Nút 📥 trên từng Chapter card
  - Nút "📥 Export Chapter" khi xem danh sách Lessons
- **Lesson**: Nút 📥 trên từng Lesson card
- **Quiz**: 
  - Nút "📥 Export Quiz" khi xem Quiz
  - Nút "📤 Import Quiz" khi xem Quiz

---

## 🔄 CÁCH HOẠT ĐỘNG

### **EXPORT (Xuất dữ liệu)**

#### **1. Export theo Level (Tất cả hoặc một Level)**

**Bước 1**: Click nút **📥 Export** ở header

**Bước 2**: Modal hiện ra với dropdown chọn:
- **Tất cả Levels (N1-N5)** - Export toàn bộ hệ thống
- **N1, N2, N3, N4, N5** - Export từng level cụ thể

**Bước 3**: Click **Export**

**Kết quả**: 
- File JSON được tự động download
- Tên file: 
  - `elearning-backup-all-YYYY-MM-DD.json` (nếu chọn "Tất cả")
  - `elearning-backup-N1-YYYY-MM-DD.json` (nếu chọn N1)

**Dữ liệu trong file**:
```json
{
  "timestamp": "2025-01-16T...",
  "version": "2.0.0",
  "level": "n1",  // hoặc null nếu export all
  "books": [...],      // Tất cả books
  "series": [...],     // Tất cả series
  "chapters": {...},   // Tất cả chapters
  "lessons": {...},    // Tất cả lessons
  "quizzes": {...},    // Tất cả quizzes
  "exams": {...},
  "levelConfigs": {...}
}
```

#### **2. Export từng phần tử cụ thể**

**Export Series**:
- Click nút 📥 trên Series card
- File: `elearning-export-series-{tên-series}-YYYY-MM-DD.json`
- Chứa: Series + tất cả Books + Chapters + Lessons + Quizzes trong Series đó

**Export Book**:
- Click nút 📥 trên Book (trong Series card hoặc khi xem Chapters)
- File: `elearning-export-book-{tên-book}-YYYY-MM-DD.json`
- Chứa: Book + tất cả Chapters + Lessons + Quizzes của Book đó

**Export Chapter**:
- Click nút 📥 trên Chapter card hoặc nút "📥 Export Chapter" trong header
- File: `elearning-export-chapter-{tên-chapter}-YYYY-MM-DD.json`
- Chứa: Chapter + tất cả Lessons + Quizzes trong Chapter đó

**Export Lesson**:
- Click nút 📥 trên Lesson card
- File: `elearning-export-lesson-{tên-lesson}-YYYY-MM-DD.json`
- Chứa: Lesson + Quiz (nếu có)

**Export Quiz**:
- Click nút "📥 Export Quiz" khi xem Quiz
- File: `elearning-export-quiz-YYYY-MM-DD.json`
- Chứa: Chỉ Quiz đó

**Cấu trúc file export từng phần tử**:
```json
{
  "timestamp": "2025-01-16T...",
  "version": "2.0.0",
  "type": "quiz",  // "series" | "book" | "chapter" | "lesson" | "quiz"
  "level": "n1",
  "book": {...},      // Thông tin book
  "chapter": {...},   // Thông tin chapter
  "lesson": {...},    // Thông tin lesson
  "quiz": {...}       // Dữ liệu quiz
}
```

---

### **IMPORT (Nạp dữ liệu)**

#### **1. Import theo Level**

**Bước 1**: Click nút **📤 Import** ở header

**Bước 2**: Modal hiện ra với:
- Dropdown chọn level để import:
  - **Tất cả Levels** - Import toàn bộ từ file
  - **N1, N2, N3, N4, N5** - Import vào level cụ thể
- File picker để chọn file JSON

**Bước 3**: Chọn file JSON đã export trước đó

**Bước 4**: Click **Import**

**Bước 5**: Xác nhận (có cảnh báo ghi đè dữ liệu)

**Kết quả**: 
- Dữ liệu được import vào IndexedDB/localStorage
- Page tự động reload để hiển thị dữ liệu mới

**Lưu ý**:
- Nếu file chứa level khác với level đã chọn, hệ thống sẽ hỏi xác nhận
- Import sẽ **ghi đè** dữ liệu hiện tại của level đó

#### **2. Import từng phần tử cụ thể**

**Import Quiz**:
- Click nút "📤 Import Quiz" khi xem Quiz
- Chọn file JSON đã export Quiz trước đó
- Hệ thống tự động detect type từ file (`type: "quiz"`)
- Import Quiz vào đúng vị trí (Book → Chapter → Lesson)

**Import các phần tử khác**:
- Hiện tại chỉ có Import Quiz trực tiếp
- Để import Series/Book/Chapter/Lesson, dùng Import Modal ở header
- Hệ thống sẽ tự động detect type từ file và import đúng vị trí

---

## 🔧 CƠ CHẾ HOẠT ĐỘNG KỸ THUẬT

### **Export Process**

1. **Lấy dữ liệu từ IndexedDB/localStorage**
   - Gọi `storageManager.exportAll()` hoặc `exportLevel(level)`
   - Hoặc `exportSeries()`, `exportBook()`, `exportChapter()`, `exportLesson()`, `exportQuiz()`

2. **Chuyển đổi sang JSON**
   - Dùng `JSON.stringify(data, null, 2)` để format đẹp

3. **Tạo Blob và Download**
   ```javascript
   const blob = new Blob([jsonString], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = filename;
   a.click();
   ```

### **Import Process**

1. **Đọc file JSON**
   - Dùng `FileReader` API để đọc file
   - Parse JSON: `JSON.parse(fileContent)`

2. **Validate dữ liệu**
   - Kiểm tra có field `type` (cho item export)
   - Kiểm tra có field `level` (cho level export)
   - Kiểm tra cấu trúc dữ liệu hợp lệ

3. **Xác nhận người dùng**
   - Hiển thị cảnh báo ghi đè dữ liệu
   - Yêu cầu xác nhận

4. **Import vào Storage**
   - Gọi `storageManager.importAll()` hoặc `importLevel(level, data)`
   - Hoặc `importItem(data)` cho từng phần tử
   - Dữ liệu được lưu vào IndexedDB (ưu tiên) hoặc localStorage

5. **Refresh UI**
   - Reload data từ storage
   - Trigger refresh AllLevelsOverview
   - Reload page để hiển thị thay đổi

---

## 📋 CÁC TRƯỜNG HỢP SỬ DỤNG

### **1. Backup dữ liệu**
- Export tất cả levels → Lưu file backup
- Định kỳ export để có backup

### **2. Chuyển dữ liệu giữa các thiết bị**
- Export trên PC → Copy file sang điện thoại → Import trên điện thoại
- **Lưu ý**: IndexedDB không tự động sync, cần export/import thủ công

### **3. Chia sẻ nội dung**
- Export một Quiz cụ thể → Gửi cho người khác → Họ import vào hệ thống của họ
- Export một Series → Chia sẻ bộ sách hoàn chỉnh

### **4. Di chuyển nội dung giữa các levels**
- Export Book từ N1 → Import vào N2
- Export Chapter từ Book này → Import vào Book khác

### **5. Khôi phục dữ liệu**
- Nếu xóa nhầm → Import lại từ file backup
- Nếu dữ liệu bị lỗi → Import từ file backup gần nhất

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Ghi đè dữ liệu**
- Import sẽ **ghi đè** dữ liệu hiện tại
- Luôn export trước khi import để có backup

### **2. Định dạng file**
- File phải là JSON hợp lệ
- File phải có field `type` (cho item export) hoặc `level` (cho level export)

### **3. Tương thích**
- Export từ version mới có thể không tương thích với version cũ
- File export có field `version` để tracking

### **4. Dung lượng**
- Export tất cả levels có thể tạo file lớn (vài MB)
- Export từng phần tử tạo file nhỏ hơn (vài KB)

### **5. IndexedDB Required**
- Export/Import từng phần tử yêu cầu IndexedDB
- Nếu chỉ có localStorage, chỉ có thể export/import theo level

---

## 🎯 VÍ DỤ SỬ DỤNG

### **Ví dụ 1: Export một Quiz để chia sẻ**

1. Vào Content Management → Chọn Level → Series → Book → Chapter → Lesson
2. Click "📥 Export Quiz"
3. File `elearning-export-quiz-2025-01-16.json` được download
4. Gửi file cho người khác
5. Họ import file đó vào hệ thống của họ

### **Ví dụ 2: Backup toàn bộ dữ liệu**

1. Vào Content Management
2. Click "📥 Export" ở header
3. Chọn "Tất cả Levels"
4. Click "Export"
5. File `elearning-backup-all-2025-01-16.json` được download
6. Lưu file này ở nơi an toàn

### **Ví dụ 3: Import dữ liệu từ backup**

1. Vào Content Management
2. Click "📤 Import" ở header
3. Chọn level (hoặc "Tất cả Levels")
4. Chọn file backup JSON
5. Click "Import"
6. Xác nhận import
7. Dữ liệu được khôi phục

---

## 🔍 KIỂM TRA FILE EXPORT

Bạn có thể mở file JSON bằng text editor để xem cấu trúc:

```json
{
  "timestamp": "2025-01-16T10:30:00.000Z",
  "version": "2.0.0",
  "type": "quiz",
  "level": "n1",
  "book": {
    "id": "book-1",
    "title": "新完全マスター N1 文法",
    "level": "n1",
    "category": "新完全マスター"
  },
  "chapter": {
    "id": "chapter-1",
    "title": "Chapter 1: 基本文法"
  },
  "lesson": {
    "id": "lesson-1",
    "title": "Bài 1: 助詞"
  },
  "quiz": {
    "bookId": "book-1",
    "chapterId": "chapter-1",
    "lessonId": "lesson-1",
    "title": "Quiz Bài 1",
    "questions": [
      {
        "id": 1,
        "text": "Câu hỏi 1?",
        "options": [
          { "label": "A", "text": "Đáp án A" },
          { "label": "B", "text": "Đáp án B" }
        ],
        "correct": "A",
        "explanation": "Giải thích..."
      }
    ]
  }
}
```

---

## 📝 TÓM TẮT

### **Export**
- ✅ Export theo Level (tất cả hoặc từng level)
- ✅ Export từng phần tử (Series, Book, Chapter, Lesson, Quiz)
- ✅ File JSON tự động download
- ✅ Tên file có ngày tháng để dễ quản lý

### **Import**
- ✅ Import theo Level (tất cả hoặc từng level)
- ✅ Import từng phần tử (tự động detect type)
- ✅ Cảnh báo ghi đè dữ liệu
- ✅ Tự động refresh UI sau khi import

### **Vị trí**
- 📍 Header: Export/Import theo Level
- 📍 Series Card: Export Series, Export Book
- 📍 Hierarchy View: Export Book, Chapter, Lesson, Quiz
- 📍 Quiz View: Export/Import Quiz

---

## 🚀 TÍNH NĂNG NÂNG CAO (Tương lai)

- [ ] Export với password protection
- [ ] Export với compression (zip)
- [ ] Import với merge (không ghi đè)
- [ ] Export/Import với validation schema
- [ ] Export/Import với progress bar cho file lớn
- [ ] Export/Import với batch operations

