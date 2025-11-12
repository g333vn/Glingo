// src/data/level/n1/shinkanzen-n1-bunpou.js
// Data cho cuốn sách: 新完全マスター 文法 N1

export const bookMetadata = {
  id: 'skm-n1-bunpou',
  title: "新完全マスター 文法 N1",
  imageUrl: "/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg",
  totalChapters: 20
};

export const chapters = [
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
];

// Export dạng format cũ để tương thích
export const bookData = {
  title: bookMetadata.title,
  imageUrl: bookMetadata.imageUrl,
  contents: chapters
};

