# 📋 Exam Management Module - Tính năng và Cấu trúc

## ✅ Đã hoàn thành (Phase 1)

### 1. Cấu hình Điểm và Thời gian
- ✅ **Điểm chuẩn và điểm max theo level**: Cấu hình điểm đậu và điểm tối đa cho toàn bộ kỳ thi
- ✅ **Điểm chết và điểm max từng bài thi**:
  - Kiến thức (言語知識・読解): Điểm chết, điểm max, thời gian
  - Đọc hiểu (読解): Điểm chết, điểm max (không có thời gian riêng)
  - Nghe hiểu (聴解): Điểm chết, điểm max, thời gian
- ✅ **Lưu cấu hình**: Tự động lưu vào IndexedDB/localStorage

### 2. Quản lý Đề thi (CRUD)
- ✅ **Thêm đề thi**: ID, tiêu đề, ngày thi, trạng thái, ảnh
- ✅ **Sửa đề thi**: Cập nhật thông tin đề thi
- ✅ **Xóa đề thi**: Xóa đề thi và tất cả câu hỏi liên quan
- ✅ **Danh sách đề thi**: Hiển thị tất cả đề thi theo level, sắp xếp theo ngày

---

## 🚧 Đang phát triển (Phase 2)

### 3. Nhập Câu hỏi

#### 3.1. Cấu trúc Câu hỏi
Mỗi đề thi có 3 loại bài thi:
- **Kiến thức (知識)**: Bao gồm nhiều sections (問題1, 問題2, ...)
- **Đọc hiểu (読解)**: Nhiều sections với đoạn văn dài
- **Nghe hiểu (聴解)**: Nhiều sections với file audio

#### 3.2. Form Nhập Câu hỏi
- **Section Form**:
  - ID section (ví dụ: section1, section2)
  - Tiêu đề (ví dụ: 問題1, 問題2)
  - Hướng dẫn (instruction)
  - Thời gian (tùy chọn, cho knowledge và listening)
  
- **Question Form**:
  - ID câu hỏi
  - Category (knowledge/reading/listening)
  - Câu hỏi (text)
  - 4 lựa chọn (A, B, C, D)
  - Đáp án đúng (0-3 hoặc A-D)
  - Giải thích (explanation)
  - File audio URL (cho listening)

#### 3.3. Quản lý Sections và Questions
- Thêm/sửa/xóa sections
- Thêm/sửa/xóa questions trong section
- Sắp xếp questions theo thứ tự
- Preview câu hỏi trước khi lưu

---

## 💡 Tính năng Bổ sung Đề xuất

### 4. Upload và Quản lý File Audio
- ✅ Upload file audio cho listening questions
- ✅ Preview audio trước khi lưu
- ✅ Quản lý danh sách file audio
- ✅ Tự động tạo URL cho file audio

### 5. Validation và Preview
- ✅ Kiểm tra số câu hỏi tối thiểu/tối đa
- ✅ Kiểm tra thời gian tổng hợp lý
- ✅ Preview đề thi trước khi publish
- ✅ Thống kê: Tổng số câu hỏi, thời gian, điểm tối đa

### 6. Import/Export
- ✅ Export đề thi ra JSON
- ✅ Import đề thi từ JSON
- ✅ Template đề thi mẫu
- ✅ Backup/Restore

### 7. Duplicate và Template
- ✅ Duplicate đề thi (sao chép đề thi cũ)
- ✅ Template đề thi (tạo đề thi từ template)
- ✅ Quick add từ đề thi khác

### 8. Statistics và Analytics
- ✅ Thống kê số câu hỏi theo section
- ✅ Thống kê thời gian tổng
- ✅ Thống kê điểm tối đa
- ✅ Preview cấu trúc đề thi

### 9. Advanced Features
- ✅ Bulk import questions (import nhiều câu hỏi cùng lúc)
- ✅ Search và filter questions
- ✅ Drag & drop để sắp xếp questions
- ✅ Auto-numbering questions
- ✅ Rich text editor cho câu hỏi và giải thích

---

## 📊 Cấu trúc Dữ liệu

### Level Config
```javascript
{
  passingScore: 100,      // Điểm chuẩn
  maxScore: 180,          // Điểm tối đa
  knowledge: {
    minScore: 19,         // Điểm chết
    maxScore: 60,        // Điểm tối đa
    timeLimit: 110        // Thời gian (phút)
  },
  reading: {
    minScore: 19,
    maxScore: 60,
    timeLimit: null      // Nằm trong knowledge
  },
  listening: {
    minScore: 19,
    maxScore: 60,
    timeLimit: 60
  }
}
```

### Exam Data
```javascript
{
  level: 'n1',
  examId: '2024-12',
  title: 'JLPT 2024/12',
  date: '2024/12',
  status: 'Có sẵn',
  imageUrl: '/jlpt/n1/2024-12.jpg',
  knowledge: {
    sections: [
      {
        id: 'section1',
        title: '問題1',
        instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。',
        timeLimit: 30,
        questions: [
          {
            id: 1,
            category: 'knowledge',
            question: '彼の説明は（　　）で、誰にでも理解できる。',
            options: ['簡潔', '簡略', '簡易', '簡素'],
            correctAnswer: 0,
            explanation: '「簡潔」は「短くてわかりやすい」という意味で...'
          }
        ]
      }
    ]
  },
  reading: {
    sections: [ /* ... */ ]
  },
  listening: {
    sections: [
      {
        id: 'section1',
        title: '問題1',
        instruction: '...',
        questions: [
          {
            id: 1,
            category: 'listening',
            question: '...',
            options: ['...', '...', '...', '...'],
            correctAnswer: 0,
            explanation: '...',
            audioUrl: '/audio/n1/2024-12/listening-1.mp3'
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 Next Steps

1. **Hoàn thiện phần nhập câu hỏi** (Phase 2)
   - Form nhập section
   - Form nhập question
   - Quản lý sections và questions
   - Preview và validation

2. **Upload file audio** (Phase 3)
   - Tích hợp file upload
   - Quản lý audio files
   - Preview audio

3. **Import/Export** (Phase 4)
   - Export JSON
   - Import JSON
   - Template system

4. **Advanced Features** (Phase 5)
   - Bulk operations
   - Search/filter
   - Drag & drop
   - Rich text editor

