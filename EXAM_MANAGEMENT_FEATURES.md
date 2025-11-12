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

## ✅ Đã hoàn thành (Phase 2)

### 3. Nhập Câu hỏi

#### 3.1. Cấu trúc Câu hỏi
Mỗi đề thi có 3 loại bài thi:
- **Kiến thức (知識)**: Bao gồm nhiều sections (問題1, 問題2, ...)
- **Đọc hiểu (読解)**: Nhiều sections với đoạn văn dài
- **Nghe hiểu (聴解)**: Nhiều sections với file audio

#### 3.2. Form Nhập Câu hỏi (Quiz Editor Style)
- **Section Form**:
  - ID section (ví dụ: section1, section2)
  - Tiêu đề (ví dụ: 問題1, 問題2)
  - Hướng dẫn (instruction)
  - Thời gian (tùy chọn, cho knowledge và listening)
  
- **Question Form** (Full Page Layout):
  - ID câu hỏi
  - Category (knowledge/reading/listening)
  - Câu hỏi (text)
  - 4 lựa chọn (A, B, C, D) - Grid layout 2 cột
  - Đáp án đúng (0-3) - Dropdown với preview
  - Giải thích (explanation)
  - **File audio URL** (cho listening) - Upload file hoặc nhập URL
  - **Preview**: Xem trước câu hỏi
  - **Export JSON**: Xuất JSON câu hỏi
  - **Copy JSON**: Sao chép JSON vào clipboard
  - **Download File**: Tải file JSON

#### 3.3. Quản lý Sections và Questions
- ✅ Thêm/sửa/xóa sections
- ✅ Thêm/sửa/xóa questions trong section
- ✅ Sắp xếp questions theo thứ tự
- ✅ Preview câu hỏi trước khi lưu
- ✅ Validation form đầy đủ

---

## 💡 Tính năng Bổ sung Đề xuất

### 4. Upload và Quản lý File Audio
- ✅ Upload file audio cho listening questions
- ✅ Preview audio trước khi lưu
- ✅ Nhập URL audio (nếu đã upload sẵn)
- ✅ Test audio URL
- ✅ File size validation (tối đa 10MB)
- ✅ File type validation (audio/*)

### 5. Validation và Preview
- ✅ Kiểm tra form đầy đủ thông tin
- ✅ Validation cho listening (bắt buộc audio)
- ✅ Preview câu hỏi real-time
- ✅ Hiển thị validation status

### 6. Export/Import JSON
- ✅ Export câu hỏi ra JSON
- ✅ Copy JSON vào clipboard
- ✅ Download JSON file
- ✅ Generate JSON tự động từ form

### 7. Trạng thái Đề thi
- ✅ Thay đổi trạng thái đề thi (Có sẵn / Đang thi / Đã kết thúc)
- ✅ Dropdown trực tiếp trong danh sách đề thi
- ✅ Lưu trạng thái tự động

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

## 💾 Lưu trữ dữ liệu

Tất cả dữ liệu được lưu tự động vào database:

- **Level Config**: IndexedDB (`levelConfigs` store) + localStorage (fallback)
- **Exam Metadata**: IndexedDB (`exams` store) + localStorage (fallback)
- **Exam Full Data**: IndexedDB (`exams` store) - Bao gồm questions, sections, audioUrl
- **Export/Import**: Hỗ trợ export/import tất cả dữ liệu

## 🎯 Tính năng đã hoàn thành

✅ **Phase 1**: Cấu hình điểm/thời gian, Quản lý đề thi (CRUD)
✅ **Phase 2**: Nhập câu hỏi (Section & Question forms), Upload audio, Preview, Export JSON
✅ **Phase 3**: Trạng thái đề thi, Validation đầy đủ

## 🚀 Cách sử dụng

Xem hướng dẫn chi tiết tại: `EXAM_MANAGEMENT_GUIDE.md` (sẽ được tạo)

