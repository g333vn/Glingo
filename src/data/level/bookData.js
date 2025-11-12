// src/data/level/bookData.js
// ✅ UPDATED: Import từ các file đã tách theo level
// Giữ nguyên export để tương thích với code cũ

import { n1Books } from './n1/books.js';
import { n2Books } from './n2/books.js';
import { n3Books } from './n3/books.js';
import { n4Books } from './n4/books.js';
import { n5Books } from './n5/books.js';

// Export tất cả books từ tất cả levels
export const bookData = {
  ...n1Books,
  ...n2Books,
  ...n3Books,
  ...n4Books,
  ...n5Books,
  
  // Default fallback
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