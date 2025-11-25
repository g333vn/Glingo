// src/data/level/n2/books-metadata.js
// Danh sách metadata của tất cả sách N2

export const n2BooksMetadata = [
  { id: 'skm-n2-bunpou', title: "新完全マスター 文法 N2", imageUrl: "/book_card/n2/shinkanzen/shinkanzen_n2_bunbo.jpg", category: '新完全マスター' },
  { id: 'skm-n2-dokkai', title: "新完全マスター 読解 N2", imageUrl: "/book_card/n2/shinkanzen/shinkanzen_n2_dokkai.jpg", category: '新完全マスター' },
  { id: 'skm-n2-choukai', title: "新完全マスター 聴解 N2", imageUrl: "/book_card/n2/shinkanzen/shinkanzen_n2_chokai.jpg", category: '新完全マスター' },
  { id: 'skm-n2-goi', title: "新完全マスター 語彙 N2", imageUrl: "/book_card/n2/shinkanzen/shinkanzen_n2_goii.jpg", category: '新完全マスター' },
  { id: 'skm-n2-kanji', title: "新完全マスター 漢字 N2", imageUrl: "/book_card/n2/shinkanzen/shinkanzen_n2_kanji.jpg", category: '新完全マスター' },
  { id: 'try-n2', title: "TRY! 日本語能力試験 N2", imageUrl: "/book_card/n2/try/try_n2.jpg", category: 'TRY!' },
  { id: 'sou-n2-goi', title: "日本語総まとめ N2 語彙", imageUrl: "/book_card/n2/sou/sou_goi.jpg", category: '日本語総まとめ' },
  { id: 'sou-n2-dokkai', title: "日本語総まとめ N2 読解", imageUrl: "/book_card/n2/sou/sou_dokkai.jpg", category: '日本語総まとめ' },
  { id: 'sou-n2-kanji', title: "日本語総まとめ N2 漢字", imageUrl: "/book_card/n2/sou/sou_kanji.jpg", category: '日本語総まとめ' },
  { id: 'sou-n2-choukai', title: "日本語総まとめ N2 聴解", imageUrl: "/book_card/n2/sou/sou_choukai.jpg", category: '日本語総まとめ' },
  { id: 'sou-n2-bunpou', title: "日本語総まとめ N2 文法", imageUrl: "/book_card/n2/sou/sou_bunpou.jpg", category: '日本語総まとめ' },

  // Cloned Data for Pagination Testing
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `n2-extra-${i + 1}`,
    title: `N2 Extra Material ${i + 1}`,
    imageUrl: null,
    isComingSoon: true,
    category: 'Extra Materials'
  }))
];

export default n2BooksMetadata;
