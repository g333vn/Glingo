// src/data/level/n5/books-metadata.js
// Danh sách metadata của tất cả sách N5

export const n5BooksMetadata = [
  { id: 'minna-1-n5', title: "Minna no Nihongo I (N5)", imageUrl: "/book_card/n5/minna/minna_1.jpg", category: 'Minna no Nihongo' },
  { id: 'try-n5', title: "TRY! 日本語能力試験 N5", imageUrl: "/book_card/n5/try/try_n5.jpg", category: 'TRY!' },
  { id: 'sou-n5-kanji', title: "日本語総まとめ N5 漢字", imageUrl: "/book_card/n5/sou/sou_kanji.jpg", category: '日本語総まとめ' },

  // Cloned Data for Pagination Testing
  ...Array.from({ length: 60 }, (_, i) => ({
    id: `n5-extra-${i + 1}`,
    title: `N5 Extra Material ${i + 1}`,
    imageUrl: null,
    isComingSoon: true,
    category: 'Extra Materials'
  }))
];

export default n5BooksMetadata;
