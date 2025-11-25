// src/data/level/n1/demo-book/quizzes.js
// ❓ DEMO Quizzes - Complete quizzes for all lessons

export const demoQuizzes = {
  // ============================================
  // QUIZ FOR LESSON 1.1 (Particle は)
  // ============================================
  'demo-complete-001_demo-chapter-1_demo-lesson-1-1': {
    title: 'Quiz: Particle は (wa)',
    questions: [
      {
        id: 1,
        text: '私（　）学生です。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'に' }
        ],
        correct: 'A',
        explanation: 'は được dùng để chỉ chủ đề của câu. "私は" = về phía tôi thì...'
      },
      {
        id: 2,
        text: '今日（　）いい天気です。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'で' }
        ],
        correct: 'A',
        explanation: 'は chỉ chủ đề "今日" (hôm nay). Nói về hôm nay thì thời tiết đẹp.'
      },
      {
        id: 3,
        text: 'りんご（　）好きです。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'に' }
        ],
        correct: 'B',
        explanation: '好き (thích) luôn đi với が. Đây là ngoại lệ đặc biệt cần nhớ.'
      },
      {
        id: 4,
        text: '誰（　）来ましたか。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'に' }
        ],
        correct: 'B',
        explanation: 'Câu hỏi về chủ ngữ (誰 = ai) dùng が.'
      },
      {
        id: 5,
        text: '部屋に机（　）あります。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'の' }
        ],
        correct: 'B',
        explanation: 'Câu tồn tại (あります) dùng が để chỉ cái gì tồn tại.'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 1.2 (Particle が)
  // ============================================
  'demo-complete-001_demo-chapter-1_demo-lesson-1-2': {
    title: 'Quiz: Particle が (ga)',
    questions: [
      {
        id: 1,
        text: '誰（　）先生ですか。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'に' }
        ],
        correct: 'B',
        explanation: 'Câu hỏi WH (誰 = ai) về chủ ngữ dùng が, không dùng は.'
      },
      {
        id: 2,
        text: '日本語（　）分かりますか。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'に' }
        ],
        correct: 'B',
        explanation: '分かる (hiểu) luôn đi với が. Pattern: Xが分かる (hiểu X).'
      },
      {
        id: 3,
        text: 'ピアノ（　）弾けます。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'で' }
        ],
        correct: 'B',
        explanation: '弾ける (có thể chơi) đi với が. Pattern: Xが弾ける (có thể chơi X).'
      },
      {
        id: 4,
        text: '猫（　）好きです。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'の' }
        ],
        correct: 'B',
        explanation: '好き (thích) luôn đi với が. Đây là quy tắc cố định: AはBが好きです.'
      },
      {
        id: 5,
        text: '部屋に机（　）あります。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'で' }
        ],
        correct: 'B',
        explanation: 'Câu tồn tại (あります/います) dùng が để chỉ người/vật tồn tại.'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 1.3 (は vs が)
  // ============================================
  'demo-complete-001_demo-chapter-1_demo-lesson-1-3': {
    title: 'Quiz: は vs が - Advanced',
    questions: [
      {
        id: 1,
        text: 'A: 誰が来ましたか。\nB: 田中さん（　）来ました。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'に' }
        ],
        correct: 'B',
        explanation: 'Trả lời câu hỏi về chủ ngữ (誰が = ai) phải dùng が để chỉ người đó.'
      },
      {
        id: 2,
        text: '象（　）鼻（　）長いです。',
        options: [
          { label: 'A', text: 'は / が' },
          { label: 'B', text: 'が / は' },
          { label: 'C', text: 'は / は' },
          { label: 'D', text: 'が / が' }
        ],
        correct: 'A',
        explanation: '象は (voi - chủ đề), 鼻が (mũi - chủ ngữ của tính từ). Pattern: AのBはCがD.'
      },
      {
        id: 3,
        text: '私（　）コーヒー（　）好きです。',
        options: [
          { label: 'A', text: 'は / が' },
          { label: 'B', text: 'が / は' },
          { label: 'C', text: 'は / を' },
          { label: 'D', text: 'を / が' }
        ],
        correct: 'A',
        explanation: 'Pattern: 私はXが好きです. は chỉ người thích, が chỉ cái được thích.'
      },
      {
        id: 4,
        text: '田中さん（　）英語（　）上手です。',
        options: [
          { label: 'A', text: 'は / が' },
          { label: 'B', text: 'が / は' },
          { label: 'C', text: 'は / を' },
          { label: 'D', text: 'が / を' }
        ],
        correct: 'A',
        explanation: '田中さんは (chủ đề), 英語が (が đi với 上手). Pattern cố định: AはBが上手です.'
      },
      {
        id: 5,
        text: '雨（　）降っています。',
        options: [
          { label: 'A', text: 'は' },
          { label: 'B', text: 'が' },
          { label: 'C', text: 'を' },
          { label: 'D', text: 'で' }
        ],
        correct: 'B',
        explanation: 'Hiện tượng tự nhiên (mưa, tuyết, gió...) làm chủ ngữ dùng が.'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 2.1 (Family Vocab)
  // ============================================
  'demo-complete-001_demo-chapter-2_demo-lesson-2-1': {
    title: 'Quiz: Family Vocabulary',
    questions: [
      {
        id: 1,
        text: 'Từ nào dùng khi nói về BỐ của MÌNH?',
        options: [
          { label: 'A', text: '父 (chichi)' },
          { label: 'B', text: 'お父さん (otousan)' },
          { label: 'C', text: 'パパ (papa)' },
          { label: 'D', text: '親父 (oyaji)' }
        ],
        correct: 'A',
        explanation: '父 (chichi) dùng cho bố của mình khi nói với người ngoài (khiêm nhường).'
      },
      {
        id: 2,
        text: 'Từ nào dùng khi nói về BỐ của NGƯỜI KHÁC?',
        options: [
          { label: 'A', text: '父 (chichi)' },
          { label: 'B', text: 'お父さん (otousan)' },
          { label: 'C', text: '親 (oya)' },
          { label: 'D', text: 'ちち (chichi)' }
        ],
        correct: 'B',
        explanation: 'お父さん (otousan) dùng cho bố người khác để tỏ sự tôn trọng (kính ngữ).'
      },
      {
        id: 3,
        text: '私の＿＿は会社員です。',
        options: [
          { label: 'A', text: '父' },
          { label: 'B', text: 'お父さん' },
          { label: 'C', text: 'A hoặc B đều đúng' },
          { label: 'D', text: 'パパ' }
        ],
        correct: 'A',
        explanation: 'Nói về gia đình mình với người ngoài phải dùng 父 (khiêm nhường), không dùng お父さん.'
      },
      {
        id: 4,
        text: 'Từ nào là "Anh trai của người khác"?',
        options: [
          { label: 'A', text: '兄 (ani)' },
          { label: 'B', text: 'お兄さん (oniisan)' },
          { label: 'C', text: '弟 (otouto)' },
          { label: 'D', text: 'あに (ani)' }
        ],
        correct: 'B',
        explanation: 'お兄さん (oniisan) = anh trai của người khác (kính ngữ).'
      },
      {
        id: 5,
        text: '田中さんの＿＿は大学生です。',
        options: [
          { label: 'A', text: '姉' },
          { label: 'B', text: 'お姉さん' },
          { label: 'C', text: 'あね' },
          { label: 'D', text: 'ねえさん' }
        ],
        correct: 'B',
        explanation: 'Nói về chị gái của người khác dùng お姉さん (oneesan - kính ngữ).'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 2.2 (Business Vocab)
  // ============================================
  'demo-complete-001_demo-chapter-2_demo-lesson-2-2': {
    title: 'Quiz: Business Vocabulary',
    questions: [
      {
        id: 1,
        text: '会社 (かいしゃ) nghĩa là gì?',
        options: [
          { label: 'A', text: 'Công ty' },
          { label: 'B', text: 'Nhà máy' },
          { label: 'C', text: 'Văn phòng' },
          { label: 'D', text: 'Cửa hàng' }
        ],
        correct: 'A',
        explanation: '会社 (かいしゃ) = công ty, doanh nghiệp (company).'
      },
      {
        id: 2,
        text: '社長 (しゃちょう) nghĩa là gì?',
        options: [
          { label: 'A', text: 'Giám đốc' },
          { label: 'B', text: 'Trưởng phòng' },
          { label: 'C', text: 'Nhân viên' },
          { label: 'D', text: 'Thư ký' }
        ],
        correct: 'A',
        explanation: '社長 (しゃちょう) = giám đốc, tổng giám đốc, chủ tịch (company president, CEO).'
      },
      {
        id: 3,
        text: '部長 (ぶちょう) là chức vụ gì?',
        options: [
          { label: 'A', text: 'Trưởng phòng' },
          { label: 'B', text: 'Giám đốc' },
          { label: 'C', text: 'Phó giám đốc' },
          { label: 'D', text: 'Nhân viên' }
        ],
        correct: 'A',
        explanation: '部長 (ぶちょう) = trưởng phòng, trưởng bộ phận (department manager).'
      },
      {
        id: 4,
        text: '会議 (かいぎ) nghĩa là gì?',
        options: [
          { label: 'A', text: 'Cuộc họp' },
          { label: 'B', text: 'Hội nghị' },
          { label: 'C', text: 'Cả A và B' },
          { label: 'D', text: 'Hợp đồng' }
        ],
        correct: 'C',
        explanation: '会議 (かいぎ) = cuộc họp, hội nghị (meeting, conference).'
      },
      {
        id: 5,
        text: '営業 (えいぎょう) nghĩa là gì?',
        options: [
          { label: 'A', text: 'Kinh doanh' },
          { label: 'B', text: 'Bán hàng' },
          { label: 'C', text: 'Hoạt động kinh doanh' },
          { label: 'D', text: 'Tất cả các đáp án trên' }
        ],
        correct: 'D',
        explanation: '営業 (えいぎょう) = kinh doanh, bán hàng, hoạt động kinh doanh (sales, business operations).'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 2.3 (Practice Test)
  // ============================================
  'demo-complete-001_demo-chapter-2_demo-lesson-2-3': {
    title: 'Quiz: Chapter 2 Practice Test',
    questions: [
      {
        id: 1,
        text: '私の＿＿は医者です。',
        options: [
          { label: 'A', text: '父' },
          { label: 'B', text: 'お父さん' },
          { label: 'C', text: '兄' },
          { label: 'D', text: 'お兄さん' }
        ],
        correct: 'A',
        explanation: 'Nói về gia đình mình với người ngoài dùng từ khiêm nhường: 父, 母, 兄, 姉.'
      },
      {
        id: 2,
        text: '田中さんの＿＿は先生です。',
        options: [
          { label: 'A', text: '母' },
          { label: 'B', text: 'お母さん' },
          { label: 'C', text: 'はは' },
          { label: 'D', text: 'かあさん' }
        ],
        correct: 'B',
        explanation: 'Nói về gia đình người khác dùng kính ngữ: お父さん, お母さん, お兄さん, お姉さん.'
      },
      {
        id: 3,
        text: '＿＿は東京に住んでいます。(Anh trai của tôi)',
        options: [
          { label: 'A', text: '兄' },
          { label: 'B', text: 'お兄さん' },
          { label: 'C', text: '弟' },
          { label: 'D', text: 'にいさん' }
        ],
        correct: 'A',
        explanation: 'Anh trai của mình = 兄 (ani). Dùng từ khiêm nhường khi nói với người ngoài.'
      },
      {
        id: 4,
        text: '＿＿は会社で働いています。(Mẹ của bạn - hỏi bạn bè)',
        options: [
          { label: 'A', text: '母' },
          { label: 'B', text: 'お母さん' },
          { label: 'C', text: 'はは' },
          { label: 'D', text: 'ママ' }
        ],
        correct: 'B',
        explanation: 'Hỏi về mẹ của bạn bè dùng お母さん (okaasan - kính ngữ).'
      },
      {
        id: 5,
        text: '私には＿＿が二人います。(Chị em gái)',
        options: [
          { label: 'A', text: '姉' },
          { label: 'B', text: '妹' },
          { label: 'C', text: '姉妹' },
          { label: 'D', text: 'お姉さん' }
        ],
        correct: 'C',
        explanation: '姉妹 (しまい/きょうだい) = chị em gái. 姉 = chị, 妹 = em gái.'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 3.1 (Reading Strategies)
  // ============================================
  'demo-complete-001_demo-chapter-3_demo-lesson-3-1': {
    title: 'Quiz: Reading Strategies',
    questions: [
      {
        id: 1,
        text: 'Bước đầu tiên khi đọc văn bản JLPT là gì?',
        options: [
          { label: 'A', text: 'Đọc kỹ từng câu từ đầu' },
          { label: 'B', text: 'Skimming (đọc lướt toàn bộ)' },
          { label: 'C', text: 'Tra từ điển tất cả từ khó' },
          { label: 'D', text: 'Đọc câu hỏi trước' }
        ],
        correct: 'D',
        explanation: 'Đọc câu hỏi TRƯỚC để biết cần tìm thông tin gì, tránh đọc lãng phí thời gian.'
      },
      {
        id: 2,
        text: 'Khi gặp từ không biết trong JLPT Reading, nên làm gì?',
        options: [
          { label: 'A', text: 'Bỏ qua ngay' },
          { label: 'B', text: 'Tra từ điển' },
          { label: 'C', text: 'Suy luận từ context' },
          { label: 'D', text: 'Chọn đáp án bất kỳ' }
        ],
        correct: 'C',
        explanation: 'JLPT không cho tra từ điển. Nên suy luận nghĩa từ context (văn cảnh) xung quanh.'
      },
      {
        id: 3,
        text: 'Thời gian nên dành cho 1 văn bản ngắn (200-300 chữ) là?',
        options: [
          { label: 'A', text: '2-3 phút' },
          { label: 'B', text: '5-7 phút' },
          { label: 'C', text: '10-12 phút' },
          { label: 'D', text: 'Không giới hạn' }
        ],
        correct: 'B',
        explanation: 'Văn bản ngắn nên mất 5-7 phút để đọc hiểu và trả lời. Quản lý thời gian rất quan trọng!'
      },
      {
        id: 4,
        text: 'Kỹ thuật "Skimming" là gì?',
        options: [
          { label: 'A', text: 'Đọc từng từ một' },
          { label: 'B', text: 'Đọc lướt nhanh để nắm ý chính' },
          { label: 'C', text: 'Đọc chậm và kỹ' },
          { label: 'D', text: 'Đọc ngược từ cuối lên' }
        ],
        correct: 'B',
        explanation: 'Skimming = đọc lướt nhanh (30 giây) để nắm ý chính, xác định cấu trúc văn bản.'
      },
      {
        id: 5,
        text: 'Khi không chắc đáp án, nên làm gì?',
        options: [
          { label: 'A', text: 'Bỏ trống câu hỏi' },
          { label: 'B', text: 'Loại trừ đáp án sai rồi đoán' },
          { label: 'C', text: 'Chọn đáp án A' },
          { label: 'D', text: 'Bỏ qua và làm câu khác' }
        ],
        correct: 'B',
        explanation: 'Loại trừ đáp án SAI trước, rồi đoán trong số còn lại. JLPT không trừ điểm nên không nên bỏ trống.'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 3.2 (Short Passages)
  // ============================================
  'demo-complete-001_demo-chapter-3_demo-lesson-3-2': {
    title: 'Quiz: Short Passages',
    questions: [
      {
        id: 1,
        text: '次の文章を読んで、質問に答えなさい。\n\n日本では、毎年3月になると、桜の花が咲きます。多くの人が公園に集まって、花見をします。花見は日本の伝統的な文化の一つです。\n\n質問：この文章の主題は何ですか。',
        options: [
          { label: 'A', text: '日本の公園' },
          { label: 'B', text: '花見の文化' },
          { label: 'C', text: '桜の種類' },
          { label: 'D', text: '3月の天気' }
        ],
        correct: 'B',
        explanation: 'Main idea của văn bản là văn hóa ngắm hoa anh đào (花見). Câu cuối nhấn mạnh điều này.'
      },
      {
        id: 2,
        text: '上の文章によると、花見はいつ行われますか。',
        options: [
          { label: 'A', text: '1月' },
          { label: 'B', text: '2月' },
          { label: 'C', text: '3月' },
          { label: 'D', text: '4月' }
        ],
        correct: 'C',
        explanation: 'Văn bản nói "毎年3月になると" = mỗi năm đến tháng 3.'
      },
      {
        id: 3,
        text: '花見について、正しいものはどれですか。',
        options: [
          { label: 'A', text: '新しい文化だ' },
          { label: 'B', text: '伝統的な文化だ' },
          { label: 'C', text: '外国の文化だ' },
          { label: 'D', text: '若者の文化だ' }
        ],
        correct: 'B',
        explanation: 'Văn bản nói rõ "花見は日本の伝統的な文化の一つです" = là văn hóa truyền thống.'
      },
      {
        id: 4,
        text: '桜の花が咲くのはいつですか。',
        options: [
          { label: 'A', text: '春' },
          { label: 'B', text: '夏' },
          { label: 'C', text: '秋' },
          { label: 'D', text: '冬' }
        ],
        correct: 'A',
        explanation: '3月 = tháng 3 = mùa xuân (春). Hoa anh đào nở vào mùa xuân.'
      },
      {
        id: 5,
        text: '多くの人はどこに集まりますか。',
        options: [
          { label: 'A', text: '駅' },
          { label: 'B', text: '公園' },
          { label: 'C', text: '学校' },
          { label: 'D', text: '会社' }
        ],
        correct: 'B',
        explanation: 'Văn bản nói "多くの人が公園に集まって" = nhiều người tụ tập ở công viên.'
      }
    ]
  },
  
  // ============================================
  // QUIZ FOR LESSON 3.3 (Long Passages)
  // ============================================
  'demo-complete-001_demo-chapter-3_demo-lesson-3-3': {
    title: 'Quiz: Long Passages',
    questions: [
      {
        id: 1,
        text: '次の長文を読んで、質問に答えなさい。\n\n日本の教育システムは世界的に高く評価されています。しかし、近年、いくつかの問題も指摘されています。一つは、詰め込み教育による学生のストレスです。もう一つは、創造性を育てる教育が不足していることです。\n\n質問：この文章によると、日本の教育の問題は何ですか。',
        options: [
          { label: 'A', text: '評価が低いこと' },
          { label: 'B', text: 'ストレスと創造性不足' },
          { label: 'C', text: '先生が足りないこと' },
          { label: 'D', text: '設備が古いこと' }
        ],
        correct: 'B',
        explanation: 'Văn bản chỉ ra 2 vấn đề: stress từ giáo dục nhồi nhét (詰め込み教育) và thiếu giáo dục sáng tạo (創造性).'
      },
      {
        id: 2,
        text: '詰め込み教育とは何ですか。',
        options: [
          { label: 'A', text: 'Giáo dục sáng tạo' },
          { label: 'B', text: 'Giáo dục tự do' },
          { label: 'C', text: 'Giáo dục nhồi nhét' },
          { label: 'D', text: 'Giáo dục vui chơi' }
        ],
        correct: 'C',
        explanation: '詰め込み (つめこみ) = nhồi nhét, nhồi sọ. 詰め込み教育 = giáo dục nhồi nhét kiến thức.'
      },
      {
        id: 3,
        text: '文章によると、日本の教育は＿＿。',
        options: [
          { label: 'A', text: '世界的に評価されていない' },
          { label: 'B', text: '世界的に高く評価されている' },
          { label: 'C', text: '問題が全くない' },
          { label: 'D', text: '最近始まった' }
        ],
        correct: 'B',
        explanation: 'Câu đầu nói rõ "世界的に高く評価されています" = được đánh giá cao trên thế giới.'
      },
      {
        id: 4,
        text: '創造性を育てる教育が不足しているとは、どういう意味ですか。',
        options: [
          { label: 'A', text: 'Thiếu giáo dục phát triển sáng tạo' },
          { label: 'B', text: 'Thiếu giáo viên' },
          { label: 'C', text: 'Thiếu sách giáo khoa' },
          { label: 'D', text: 'Thiếu thời gian học' }
        ],
        correct: 'A',
        explanation: '創造性 (そうぞうせい) = sáng tạo, óc sáng tạo. Thiếu giáo dục phát triển tính sáng tạo.'
      },
      {
        id: 5,
        text: 'Thái độ của tác giả về giáo dục Nhật Bản là gì?',
        options: [
          { label: 'A', text: 'Hoàn toàn tích cực' },
          { label: 'B', text: 'Hoàn toàn tiêu cực' },
          { label: 'C', text: 'Vừa công nhận ưu điểm vừa chỉ ra vấn đề' },
          { label: 'D', text: 'Không có ý kiến' }
        ],
        correct: 'C',
        explanation: 'Tác giả vừa công nhận (高く評価) vừa chỉ ra vấn đề (問題も指摘). Quan điểm cân bằng.'
      }
    ]
  }
};

