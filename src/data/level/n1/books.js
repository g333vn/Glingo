// src/data/level/n1/books.js
// Danh sách tất cả sách N1 (dùng cho BookDetailPage - có contents/chapters)

import { bookData as shinkanzen } from './shinkanzen-n1-bunpou.js';
import { bookData as tryBook } from './try-n1-1.js';

// Export danh sách sách N1 với đầy đủ data (contents/chapters)
// Hiện tại chỉ có 2 sách có data đầy đủ, các sách khác sẽ thêm sau
export const n1Books = {
  'skm-n1-bunpou': shinkanzen,
  'try-n1-1': tryBook,
  // TODO: Thêm các sách khác ở đây khi có data đầy đủ
  // 'skm-n1-dokkai': { ... },
  // 'skm-n1-choukai': { ... },
  // ...
};

