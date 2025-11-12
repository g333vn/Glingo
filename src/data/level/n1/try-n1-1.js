// src/data/level/n1/try-n1-1.js
// Data cho cuốn sách: TRY! N1 Ngữ pháp

export const bookMetadata = {
  id: 'try-n1-1',
  title: "TRY! N1 Ngữ pháp (Tiếng Việt)",
  imageUrl: "/book_card/n1/try/try_bunpou.jpg",
  totalChapters: 2 // Sẽ cập nhật sau
};

export const chapters = [
  { id: 'unit-1', title: 'Unit 1: Cấu trúc cơ bản' },
  { id: 'unit-2', title: 'Unit 2: Ngữ pháp nâng cao' },
  // Thêm các unit khác sau
];

// Export dạng format cũ để tương thích
export const bookData = {
  title: bookMetadata.title,
  imageUrl: bookMetadata.imageUrl,
  contents: chapters
};

