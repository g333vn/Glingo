// src/data/level/n3/books-metadata.js
// Danh sách metadata của tất cả sách N3

export const n3BooksMetadata = [
  { id: 'skm-n3-bunpou', title: "新完全マスター 文法 N3", imageUrl: "/book_card/n3/shinkanzen/shinkanzen_n3_bunbo.jpg", category: '新完全マスター' },
  { id: 'skm-n3-dokkai', title: "新完全マスター 読解 N3", imageUrl: "/book_card/n3/shinkanzen/shinkanzen_n3_dokkai.jpg", category: '新完全マスター' },
  { id: 'skm-n3-choukai', title: "新完全マスター 聴解 N3", imageUrl: "/book_card/n3/shinkanzen/shinkanzen_n3_chokai.jpg", category: '新完全マスター' },
  { id: 'skm-n3-goi', title: "新完全マスター 語彙 N3", imageUrl: "/book_card/n3/shinkanzen/shinkanzen_n3_goii.jpg", category: '新完全マスター' },
  { id: 'skm-n3-kanji', title: "新完全マスター 漢字 N3", imageUrl: "/book_card/n3/shinkanzen/shinkanzen_n3_kanji.jpg", category: '新完全マスター' },
  { id: 'try-n3', title: "TRY! 日本語能力試験 N3", imageUrl: "/book_card/n3/try/try_n3.jpg", category: 'TRY!' },
  { id: 'sou-n3-goi', title: "日本語総まとめ N3 語彙", imageUrl: "/book_card/n3/sou/sou_goi.jpg", category: '日本語総まとめ' },
  { id: 'sou-n3-dokkai', title: "日本語総まとめ N3 読解", imageUrl: "/book_card/n3/sou/sou_dokkai.jpg", category: '日本語総まとめ' },
  { id: 'sou-n3-kanji', title: "日本語総まとめ N3 漢字", imageUrl: "/book_card/n3/sou/sou_kanji.jpg", category: '日本語総まとめ' },
  { id: 'sou-n3-choukai', title: "日本語総まとめ N3 聴解", imageUrl: "/book_card/n3/sou/sou_choukai.jpg", category: '日本語総まとめ' },
  { id: 'sou-n3-bunpou', title: "日本語総まとめ N3 文法", imageUrl: "/book_card/n3/sou/sou_bunpou.jpg", category: '日本語総まとめ' },

  // Cloned Data for Pagination Testing
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `n3-extra-${i + 1}`,
    title: `N3 Extra Material ${i + 1}`,
    imageUrl: null,
    isComingSoon: true,
    category: 'Extra Materials'
  }))
];

export default n3BooksMetadata;
