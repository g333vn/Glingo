// src/assets/data/bookData.js
// Shared book data for all pages

export const bookData = {
  'skm-n1-bunpou': {
    title: "新完全マスター 文法 N1",
    imageUrl: "/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg",
    contents: [
      { id: 'bai-1', title: 'Bài 1: Phân biệt cấu trúc A và B' },
      { id: 'bai-2', title: 'Bài 2: Sử dụng trong ngữ cảnh trang trọng' },
      { id: 'bai-3', title: 'Bài 3: Ôn tập phần 1' },
      { id: 'bai-4', title: 'Bài 4: Cấu trúc phức hợp với trợ từ' },
      { id: 'bai-5', title: 'Bài 5: Ngữ pháp so sánh nâng cao' },
      { id: 'bai-6', title: 'Bài 6: Biểu đạt nguyên nhân - kết quả' },
      { id: 'bai-7', title: 'Bài 7: Ôn tập phần 2' },
      { id: 'bai-8', title: 'Bài 8: Cấu trúc giả định và điều kiện' },
      { id: 'bai-9', title: 'Bài 9: Ngữ pháp lịch sự và kính ngữ' },
      { id: 'bai-10', title: 'Bài 10: Ôn tập phần 3' },
      { id: 'bai-11', title: 'Bài 11: Biểu đạt ý kiến và lý do' },
      { id: 'bai-12', title: 'Bài 12: Cấu trúc thụ động và sai khiến' },
      { id: 'bai-13', title: 'Bài 13: Ôn tập phần 4' },
      { id: 'bai-14', title: 'Bài 14: Ngữ pháp trừu tượng và khái niệm' },
      { id: 'bai-15', title: 'Bài 15: Biểu đạt tương phản và nhượng bộ' },
      { id: 'bai-16', title: 'Bài 16: Ôn tập phần 5' },
      { id: 'bai-17', title: 'Bài 17: Cấu trúc ước lệ và giả định' },
      { id: 'bai-18', title: 'Bài 18: Ngữ pháp lịch sử và văn học' },
      { id: 'bai-19', title: 'Bài 19: Ôn tập phần 6' },
      { id: 'bai-20', title: 'Bài 20: Tổng ôn toàn bộ N1' },
    ]
  },
  'try-n1-1': {
    title: "TRY! N1 Ngữ pháp (Tiếng Việt)",
    imageUrl: "/book_card/n1/try/try_bunpou.jpg",
    contents: [
      { id: 'unit-1', title: 'Unit 1: Cấu trúc cơ bản' },
      { id: 'unit-2', title: 'Unit 2: Ngữ pháp nâng cao' },
      // Add more units as needed
    ]
  },
  // Add other books here
  'default': {
    title: 'Sách không tồn tại',
    imageUrl: 'https://placehold.co/300x400/E2E8F0/A0AEC0?text=Book+Not+Found',
    contents: []
  }
};

// 🎯 Kết quả:
// ✅ Single source of truth - 1 file data duy nhất
// ✅ Dễ maintain - thêm/sửa sách chỉ cần sửa 1 chỗ
// ✅ Code sạch hơn, không duplicate
// ✅ Breadcrumb hiển thị đúng tên sách