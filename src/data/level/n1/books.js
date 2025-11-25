// src/data/level/n1/books.js
// Danh sách tất cả sách N1 (dùng cho BookDetailPage - có contents/chapters)

import { bookData as shinkanzen } from './shinkanzen-n1-bunpou.js';
import { bookData as tryBook } from './try-n1-1.js';
import { demoChapters } from './demo-book/chapters.js';
import { demoLessons } from './demo-book/lessons.js';

// ============================================
// DEMO Complete Book
// ============================================
const demoCompleteBook = {
  title: 'DEMO: Complete Sample Book',
  imageUrl: null,
  description: 'A complete sample book with all features demonstrated',
  contents: demoChapters.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    icon: chapter.icon,
    lessons: demoLessons[`demo-complete-001_${chapter.id}`] || []
  }))
};

// Export danh sách sách N1 với đầy đủ data (contents/chapters)
export const n1Books = {
  'skm-n1-bunpou': shinkanzen,
  'try-n1-1': tryBook,
  'demo-complete-001': demoCompleteBook, // ✅ DEMO Book
  // TODO: Thêm các sách khác ở đây khi có data đầy đủ
  // 'skm-n1-dokkai': { ... },
  // 'skm-n1-choukai': { ... },
  // ...
};

