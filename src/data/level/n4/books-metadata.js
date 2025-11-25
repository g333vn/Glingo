// src/data/level/n4/books-metadata.js
// Danh sách metadata của tất cả sách N4

export const n4BooksMetadata = [
  { id: 'minna-1', title: "Minna no Nihongo I", imageUrl: "/book_card/n4/minna/minna_1.jpg", category: 'Minna no Nihongo' },
  { id: 'minna-2', title: "Minna no Nihongo II", imageUrl: "/book_card/n4/minna/minna_2.jpg", category: 'Minna no Nihongo' },
  { id: 'try-n4', title: "TRY! 日本語能力試験 N4", imageUrl: "/book_card/n4/try/try_n4.jpg", category: 'TRY!' },
  { id: 'sou-n4-kanji', title: "日本語総まとめ N4 漢字", imageUrl: "/book_card/n4/sou/sou_kanji.jpg", category: '日本語総まとめ' },
  { id: 'sou-n4-bunpou', title: "日本語総まとめ N4 文法", imageUrl: "/book_card/n4/sou/sou_bunpou.jpg", category: '日本語総まとめ' },

  // Cloned Data for Pagination Testing
  ...Array.from({ length: 55 }, (_, i) => ({
    id: `n4-extra-${i + 1}`,
    title: `N4 Extra Material ${i + 1}`,
    imageUrl: null,
    isComingSoon: true,
    category: 'Extra Materials'
  }))
];

export default n4BooksMetadata;
