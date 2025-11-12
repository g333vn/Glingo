// src/data/level/bookData.js
// ✅ UPDATED: Import từ các file đã tách theo level
// Giữ nguyên export để tương thích với code cũ

import { n1Books } from './n1/books.js';

// Export tất cả books (hiện tại chỉ có N1, sẽ thêm N2-N5 sau)
export const bookData = {
  ...n1Books,
  // Thêm các level khác sau:
  // ...n2Books,
  // ...n3Books,
  // ...
  
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