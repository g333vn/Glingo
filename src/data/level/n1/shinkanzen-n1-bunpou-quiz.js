// src/data/level/n1/shinkanzen-n1-bunpou-quiz.js
// Quiz data cho cuốn sách: 新完全マスター 文法 N1

export const quizData = {
  'bai-1': {
    title: "Bài 1: Phân biệt cấu trúc A và B",
    questions: [
      {
        id: 1,
        text: "次の文の空欄に適切な語句を入れなさい。 彼は(　　)ために、毎日勉強している。",
        options: [
          { label: 'A', text: '試験に合格する' },
          { label: 'B', text: '試験に合格して' },
          { label: 'C', text: '試験に合格し' },
          { label: 'D', text: '試験に合格した' }
        ],
        correct: 'A',
        explanation: "「～するために」は目的を表す構造で、「する」が適切です。Bは接続詞、Cは連用形、Dは過去形です。"
      },
      {
        id: 2,
        text: "次の文の意味に最も近いものを選びなさい。 それは彼の考えとは正反対だ。",
        options: [
          { label: 'A', text: 'It is the opposite of his idea.' },
          { label: 'B', text: 'It is the same as his idea.' },
          { label: 'C', text: 'It is better than his idea.' },
          { label: 'D', text: 'It is similar to his idea.' }
        ],
        correct: 'A',
        explanation: "'正反対' nghĩa là 'opposite', vậy A là đúng. Các lựa chọn khác không phù hợp."
      },
      {
        id: 3,
        text: "次の文の空欄に適切な語句を入れなさい。 彼女は(　　)美しい。",
        options: [
          { label: 'A', text: '非常に' },
          { label: 'B', text: '非常にして' },
          { label: 'C', text: '非常にし' },
          { label: 'D', text: '非常にした' }
        ],
        correct: 'A',
        explanation: "「非常に」は副詞, trực tiếp bổ nghĩa cho tính từ '美しい'. Các lựa chọn khác không đúng ngữ pháp."
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        id: i + 4,
        text: `Câu hỏi ${i + 4}: Demo câu hỏi tiếng Nhật với khoảng trống (空欄に適切な語句を入れなさい)。`,
        options: [
          { label: 'A', text: 'Đáp án đúng' },
          { label: 'B', text: 'Đáp án sai 1' },
          { label: 'C', text: 'Đáp án sai 2' },
          { label: 'D', text: 'Đáp án sai 3' }
        ],
        correct: 'A',
        explanation: `Giải thích demo cho câu hỏi ${i + 4}: Đáp án A là đúng vì [lý do ngắn gọn].`
      }))
    ]
  },
  // Các bài khác sẽ thêm sau
  'default': {
    title: "Bài không tồn tại",
    questions: []
  }
};

