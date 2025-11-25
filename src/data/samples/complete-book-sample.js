// src/data/samples/complete-book-sample.js
// 📚 Complete Book Sample - Full hierarchy with all data levels

/**
 * COMPLETE BOOK STRUCTURE:
 * 
 * Series (Bộ sách)
 *   └── Book (Sách)
 *       └── Chapter (Chương)
 *           └── Lesson (Bài học)
 *               ├── Knowledge (Lý thuyết: PDF/HTML)
 *               └── Quiz (Bài tập: Questions)
 */

// ============================================
// LEVEL 1: SERIES (Bộ sách)
// ============================================

export const sampleSeries = {
  id: 'sample-series-001',
  name: 'Sample JLPT Series',
  description: 'Complete sample series for demonstration',
  level: 'n1',
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// ============================================
// LEVEL 2: BOOK (Sách)
// ============================================

export const sampleBook = {
  id: 'sample-book-001',
  title: 'Complete Sample Textbook N1',
  imageUrl: null, // Will use placeholder with "Coming Soon"
  isComingSoon: true,
  category: 'Sample JLPT Series',
  level: 'n1',
  description: 'A complete sample book demonstrating all features',
  author: 'Admin Team',
  publisher: 'Learn Your Approach',
  year: 2024,
  isbn: 'SAMPLE-001-N1',
  totalChapters: 3,
  totalLessons: 9,
  estimatedHours: 30,
  difficulty: 'intermediate',
  status: 'active',
  published: true,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// ============================================
// LEVEL 3: CHAPTERS (Chương)
// ============================================

export const sampleChapters = [
  // ──────────────────────────────────────
  // CHAPTER 1: Grammar
  // ──────────────────────────────────────
  {
    id: 'chapter-1',
    title: 'Chapter 1: Basic Grammar',
    description: 'Learn fundamental Japanese grammar structures',
    order: 1,
    icon: '📖',
    estimatedTime: '10 hours',
    difficulty: 'beginner',
    objectives: [
      'Understand particle は and が',
      'Master basic sentence structure',
      'Learn verb conjugation basics'
    ],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // ──────────────────────────────────────
  // CHAPTER 2: Vocabulary
  // ──────────────────────────────────────
  {
    id: 'chapter-2',
    title: 'Chapter 2: Essential Vocabulary',
    description: 'Build your N1 vocabulary foundation',
    order: 2,
    icon: '📚',
    estimatedTime: '12 hours',
    difficulty: 'intermediate',
    objectives: [
      'Learn 500+ N1 essential words',
      'Master kanji readings',
      'Understand word usage in context'
    ],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // ──────────────────────────────────────
  // CHAPTER 3: Reading Comprehension
  // ──────────────────────────────────────
  {
    id: 'chapter-3',
    title: 'Chapter 3: Reading Practice',
    description: 'Improve reading comprehension skills',
    order: 3,
    icon: '📰',
    estimatedTime: '8 hours',
    difficulty: 'advanced',
    objectives: [
      'Read long passages quickly',
      'Understand main ideas',
      'Infer meaning from context'
    ],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// ============================================
// LEVEL 4: LESSONS (Bài học) - All types
// ============================================

// ──────────────────────────────────────
// CHAPTER 1 LESSONS
// ──────────────────────────────────────

export const chapter1Lessons = [
  // Lesson 1.1: PDF only
  {
    id: 'lesson-1-1',
    title: 'Lesson 1.1: Particle は (wa)',
    description: 'Learn how to use the topic particle は',
    order: 1,
    pdfUrl: '/pdfs/samples/lesson1-1-particle-wa.pdf',
    content: null,
    hasQuiz: true,
    published: true,
    estimatedTime: '45 minutes',
    difficulty: 'beginner',
    keywords: ['は', 'particle', 'topic marker', 'grammar'],
    learningOutcomes: [
      'Understand は usage',
      'Differentiate は from が',
      'Use は in sentences correctly'
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // Lesson 1.2: HTML only
  {
    id: 'lesson-1-2',
    title: 'Lesson 1.2: Particle が (ga)',
    description: 'Learn how to use the subject particle が',
    order: 2,
    pdfUrl: null,
    content: `
<div>
  <h2>📚 Ngữ pháp: Trợ từ が (ga)</h2>
  
  <p>Trợ từ <strong>が</strong> được dùng để chỉ <em>chủ ngữ</em> của câu, khác với <strong>は</strong> chỉ chủ đề.</p>
  
  <h3>1. Cách sử dụng chính:</h3>
  
  <h4>1.1. Chỉ chủ ngữ của câu</h4>
  <p>Ví dụ:</p>
  <ul>
    <li><strong>私が学生です</strong> - <em>Tôi</em> là sinh viên (nhấn mạnh "tôi")</li>
    <li><strong>誰が来ましたか</strong> - <em>Ai</em> đã đến? (hỏi chủ ngữ)</li>
  </ul>
  
  <h4>1.2. Chỉ sự tồn tại</h4>
  <p>Ví dụ:</p>
  <ul>
    <li><strong>部屋に机があります</strong> - Trong phòng có bàn</li>
    <li><strong>庭に花が咲いています</strong> - Trong vườn có hoa nở</li>
  </ul>
  
  <h3>2. So sánh は vs が:</h3>
  <table>
    <thead>
      <tr>
        <th>は (wa)</th>
        <th>が (ga)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Chủ đề</td>
        <td>Chủ ngữ</td>
      </tr>
      <tr>
        <td>私は学生です</td>
        <td>誰が学生ですか</td>
      </tr>
      <tr>
        <td>Thông tin cũ</td>
        <td>Thông tin mới</td>
      </tr>
    </tbody>
  </table>
  
  <h3>3. Quy tắc đặc biệt:</h3>
  <p>Một số động từ/tính từ LUÔN đi với が:</p>
  <ul>
    <li>好き (suki) - thích: <strong>私はコーヒーが好きです</strong></li>
    <li>上手 (jouzu) - giỏi: <strong>田中さんは英語が上手です</strong></li>
    <li>分かる (wakaru) - hiểu: <strong>日本語が分かります</strong></li>
    <li>できる (dekiru) - có thể: <strong>泳ぐことができます</strong></li>
  </ul>
  
  <h3>4. Bài tập:</h3>
  <p>Chọn は hoặc が cho đúng:</p>
  <ol>
    <li>誰（　）来ましたか → 誰<em>が</em>来ましたか</li>
    <li>私（　）日本人です → 私<em>は</em>日本人です</li>
    <li>私（　）日本語（　）分かります → 私<em>は</em>日本語<em>が</em>分かります</li>
    <li>部屋に机（　）あります → 部屋に机<em>が</em>あります</li>
  </ol>
</div>
    `,
    hasQuiz: true,
    published: true,
    estimatedTime: '50 minutes',
    difficulty: 'beginner',
    keywords: ['が', 'particle', 'subject marker', 'grammar'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // Lesson 1.3: Both PDF and HTML
  {
    id: 'lesson-1-3',
    title: 'Lesson 1.3: は vs が Comparison',
    description: 'Deep dive into the difference between は and が',
    order: 3,
    pdfUrl: '/pdfs/samples/lesson1-3-wa-vs-ga.pdf',
    content: `
<div>
  <h2>📝 Quick Reference: は vs が</h2>
  
  <table>
    <thead>
      <tr>
        <th>Aspect</th>
        <th>は (wa)</th>
        <th>が (ga)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Function</strong></td>
        <td>Topic marker</td>
        <td>Subject marker</td>
      </tr>
      <tr>
        <td><strong>Focus</strong></td>
        <td>What comes after</td>
        <td>What comes before</td>
      </tr>
      <tr>
        <td><strong>Question</strong></td>
        <td>AはBですか</td>
        <td>何がAですか</td>
      </tr>
      <tr>
        <td><strong>Emphasis</strong></td>
        <td>Old information</td>
        <td>New information</td>
      </tr>
    </tbody>
  </table>
  
  <p><em>Note: PDF has full explanation with more examples!</em></p>
</div>
    `,
    hasQuiz: true,
    published: true,
    estimatedTime: '60 minutes',
    difficulty: 'intermediate',
    keywords: ['は', 'が', 'comparison', 'particle', 'grammar'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// ──────────────────────────────────────
// CHAPTER 2 LESSONS
// ──────────────────────────────────────

export const chapter2Lessons = [
  // Lesson 2.1: Vocabulary with HTML
  {
    id: 'lesson-2-1',
    title: 'Lesson 2.1: Family Vocabulary',
    description: 'Essential family-related vocabulary',
    order: 1,
    pdfUrl: null,
    content: `
<div>
  <h2>👨‍👩‍👧‍👦 Từ vựng: Gia đình (家族 - かぞく)</h2>
  
  <h3>Thành viên gia đình:</h3>
  <table>
    <thead>
      <tr>
        <th>Kanji</th>
        <th>Hiragana</th>
        <th>Romaji</th>
        <th>Tiếng Việt</th>
        <th>JLPT</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>父</td>
        <td>ちち</td>
        <td>chichi</td>
        <td>Bố (của mình)</td>
        <td>N5</td>
      </tr>
      <tr>
        <td>お父さん</td>
        <td>おとうさん</td>
        <td>otousan</td>
        <td>Bố (của người khác)</td>
        <td>N5</td>
      </tr>
      <tr>
        <td>母</td>
        <td>はは</td>
        <td>haha</td>
        <td>Mẹ (của mình)</td>
        <td>N5</td>
      </tr>
      <tr>
        <td>お母さん</td>
        <td>おかあさん</td>
        <td>okaasan</td>
        <td>Mẹ (của người khác)</td>
        <td>N5</td>
      </tr>
      <tr>
        <td>兄</td>
        <td>あに</td>
        <td>ani</td>
        <td>Anh trai (của mình)</td>
        <td>N5</td>
      </tr>
      <tr>
        <td>お兄さん</td>
        <td>おにいさん</td>
        <td>oniisan</td>
        <td>Anh trai (của người khác)</td>
        <td>N5</td>
      </tr>
    </tbody>
  </table>
  
  <h3>💡 Lưu ý quan trọng:</h3>
  <ul>
    <li><strong>Khiêm nhường:</strong> Nói về gia đình mình dùng từ đơn giản (父, 母)</li>
    <li><strong>Tôn trọng:</strong> Nói về gia đình người khác dùng kính ngữ (お父さん, お母さん)</li>
    <li><strong>Ngoại lệ:</strong> Khi nói với người trong gia đình, dùng từ kính ngữ</li>
  </ul>
  
  <h3>Ví dụ câu:</h3>
  <ol>
    <li>私の<strong>父</strong>は会社員です - Bố tôi là nhân viên công ty</li>
    <li>田中さんの<strong>お父さん</strong>は医者です - Bố anh Tanaka là bác sĩ</li>
    <li><strong>兄</strong>は東京に住んでいます - Anh trai tôi sống ở Tokyo</li>
  </ol>
</div>
    `,
    hasQuiz: true,
    published: true,
    estimatedTime: '40 minutes',
    difficulty: 'beginner',
    keywords: ['vocabulary', 'family', 'kazoku', '家族'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // Lesson 2.2: Work vocabulary with PDF
  {
    id: 'lesson-2-2',
    title: 'Lesson 2.2: Work & Business Vocabulary',
    description: 'Essential business Japanese vocabulary',
    order: 2,
    pdfUrl: '/pdfs/samples/lesson2-2-business-vocab.pdf',
    content: null,
    hasQuiz: true,
    published: true,
    estimatedTime: '50 minutes',
    difficulty: 'intermediate',
    keywords: ['vocabulary', 'business', 'work', 'keigo'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // Lesson 2.3: Practice (Quiz only - no knowledge)
  {
    id: 'lesson-2-3',
    title: 'Lesson 2.3: Vocabulary Practice Test',
    description: 'Test your vocabulary knowledge',
    order: 3,
    pdfUrl: null,
    content: null,
    hasQuiz: true,
    published: true,
    estimatedTime: '30 minutes',
    difficulty: 'intermediate',
    keywords: ['practice', 'test', 'vocabulary'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// ──────────────────────────────────────
// CHAPTER 3 LESSONS
// ──────────────────────────────────────

export const chapter3Lessons = [
  // Lesson 3.1: Reading strategies
  {
    id: 'lesson-3-1',
    title: 'Lesson 3.1: Reading Strategies',
    description: 'Learn effective reading techniques',
    order: 1,
    pdfUrl: '/pdfs/samples/lesson3-1-reading-strategies.pdf',
    content: `
<div>
  <h2>📖 Chiến lược Đọc Hiểu</h2>
  
  <h3>5 Bước Đọc Hiểu Hiệu Quả:</h3>
  <ol>
    <li><strong>Skimming</strong> - Đọc lướt để nắm ý chính (30 giây)</li>
    <li><strong>Identify Key Words</strong> - Tìm từ khóa quan trọng</li>
    <li><strong>Read for Detail</strong> - Đọc kỹ để hiểu chi tiết</li>
    <li><strong>Infer Meaning</strong> - Suy luận nghĩa từ context</li>
    <li><strong>Verify Answer</strong> - Kiểm tra lại đáp án</li>
  </ol>
  
  <h3>💡 Tips cho JLPT Reading:</h3>
  <ul>
    <li>Đọc câu hỏi TRƯỚC khi đọc văn bản</li>
    <li>Highlight từ khóa trong câu hỏi</li>
    <li>Tìm từ khóa tương tự trong văn bản</li>
    <li>Loại trừ đáp án sai trước</li>
    <li>Quản lý thời gian: 1 văn bản = 5-7 phút</li>
  </ul>
  
  <p><em>See PDF for detailed examples and practice passages!</em></p>
</div>
    `,
    hasQuiz: true,
    published: true,
    estimatedTime: '55 minutes',
    difficulty: 'advanced',
    keywords: ['reading', 'comprehension', 'strategies', 'dokkai'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // Lesson 3.2: Short passages
  {
    id: 'lesson-3-2',
    title: 'Lesson 3.2: Short Passages Practice',
    description: 'Practice with short reading passages',
    order: 2,
    pdfUrl: '/pdfs/samples/lesson3-2-short-passages.pdf',
    content: null,
    hasQuiz: true,
    published: true,
    estimatedTime: '45 minutes',
    difficulty: 'intermediate',
    keywords: ['reading', 'passages', 'practice'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  
  // Lesson 3.3: Long passages
  {
    id: 'lesson-3-3',
    title: 'Lesson 3.3: Long Passages Practice',
    description: 'Advanced reading with long texts',
    order: 3,
    pdfUrl: '/pdfs/samples/lesson3-3-long-passages.pdf',
    content: null,
    hasQuiz: true,
    published: true,
    estimatedTime: '60 minutes',
    difficulty: 'advanced',
    keywords: ['reading', 'long passages', 'advanced'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// ============================================
// LEVEL 5: QUIZZES (Bài tập)
// ============================================

// ──────────────────────────────────────
// QUIZ FOR LESSON 1.1
// ──────────────────────────────────────

export const quiz_1_1 = {
  title: 'Quiz: Particle は (wa)',
  lessonId: 'lesson-1-1',
  totalQuestions: 10,
  passingScore: 70,
  timeLimit: 15, // minutes
  questions: [
    {
      id: 1,
      text: '私（　）学生です。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'A',
      explanation: 'は được dùng để chỉ chủ đề của câu. "Tôi" là chủ đề, sau đó nói "là sinh viên".',
      points: 1,
      difficulty: 'easy'
    },
    {
      id: 2,
      text: '今日（　）いい天気です。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'で' }
      ],
      correct: 'A',
      explanation: 'は chỉ chủ đề "今日" (hôm nay). Câu nói về hôm nay thì thời tiết đẹp.',
      points: 1,
      difficulty: 'easy'
    },
    {
      id: 3,
      text: 'りんご（　）好きです。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'B',
      explanation: '好き (thích) luôn đi với が, không dùng は. Đây là ngoại lệ cần nhớ.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 4,
      text: '誰（　）来ましたか。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'B',
      explanation: 'Câu hỏi về chủ ngữ (ai) dùng が, không dùng は.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 5,
      text: '私（　）田中さん（　）が来ました。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は / が' },
        { label: 'B', text: 'が / は' },
        { label: 'C', text: 'は / は' },
        { label: 'D', text: 'が / が' }
      ],
      correct: 'A',
      explanation: '私は (chủ đề: tôi), 田中さんが (chủ ngữ: anh Tanaka) đến. Đối chiếu 2 người.',
      points: 2,
      difficulty: 'hard'
    },
    {
      id: 6,
      text: '部屋に机（　）あります。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'の' }
      ],
      correct: 'B',
      explanation: 'Câu tồn tại (あります) dùng が để chỉ cái gì tồn tại.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 7,
      text: 'これ（　）私の本です。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'A',
      explanation: 'これは chỉ chủ đề "cái này", sau đó nói đây là sách của tôi.',
      points: 1,
      difficulty: 'easy'
    },
    {
      id: 8,
      text: '田中さん（　）英語（　）上手です。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は / が' },
        { label: 'B', text: 'が / は' },
        { label: 'C', text: 'は / を' },
        { label: 'D', text: 'が / を' }
      ],
      correct: 'A',
      explanation: '田中さんは (chủ đề), 英語が (が đi với 上手). Pattern: AはBが上手です.',
      points: 2,
      difficulty: 'hard'
    },
    {
      id: 9,
      text: '雨（　）降っています。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'で' }
      ],
      correct: 'B',
      explanation: 'Hiện tượng tự nhiên (mưa đang rơi) dùng が làm chủ ngữ.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 10,
      text: '私（　）コーヒー（　）好きです。',
      type: 'multiple-choice',
      options: [
        { label: 'A', text: 'は / が' },
        { label: 'B', text: 'が / は' },
        { label: 'C', text: 'は / を' },
        { label: 'D', text: 'を / が' }
      ],
      correct: 'A',
      explanation: 'Pattern: 私はXが好きです. は chỉ người thích, が chỉ cái được thích.',
      points: 2,
      difficulty: 'hard'
    }
  ]
};

// ──────────────────────────────────────
// QUIZ FOR LESSON 1.2
// ──────────────────────────────────────

export const quiz_1_2 = {
  title: 'Quiz: Particle が (ga)',
  lessonId: 'lesson-1-2',
  totalQuestions: 8,
  passingScore: 70,
  timeLimit: 12,
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
      explanation: 'Câu hỏi WH (誰 = ai) về chủ ngữ dùng が.',
      points: 1,
      difficulty: 'easy'
    },
    {
      id: 2,
      text: '猫（　）好きです。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'の' }
      ],
      correct: 'B',
      explanation: '好き luôn đi với が.',
      points: 1,
      difficulty: 'easy'
    },
    {
      id: 3,
      text: '公園に子供（　）います。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'で' }
      ],
      correct: 'B',
      explanation: 'Câu tồn tại (います) dùng が chỉ người/vật tồn tại.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 4,
      text: '日本語（　）分かりますか。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'B',
      explanation: '分かる (hiểu) đi với が. Pattern: Xが分かる.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 5,
      text: '何（　）欲しいですか。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'B',
      explanation: 'Câu hỏi WH về đối tượng mong muốn dùng が. 欲しい đi với が.',
      points: 2,
      difficulty: 'medium'
    },
    {
      id: 6,
      text: 'ピアノ（　）弾けます。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'で' }
      ],
      correct: 'B',
      explanation: '弾ける (có thể chơi) đi với が. Pattern: Xが弾ける.',
      points: 1,
      difficulty: 'medium'
    },
    {
      id: 7,
      text: '私は田中さん（　）好きです。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'B',
      explanation: 'は chỉ người thích (私は), が chỉ người được thích (田中さんが).',
      points: 2,
      difficulty: 'hard'
    },
    {
      id: 8,
      text: '映画（　）見たいです。',
      options: [
        { label: 'A', text: 'は' },
        { label: 'B', text: 'が' },
        { label: 'C', text: 'を' },
        { label: 'D', text: 'に' }
      ],
      correct: 'B',
      explanation: '見たい (muốn xem) đi với が. Pattern: Xが見たい.',
      points: 2,
      difficulty: 'hard'
    }
  ]
};

// ──────────────────────────────────────
// QUIZ FOR LESSON 1.3 (は vs が)
// ──────────────────────────────────────

export const quiz_1_3 = {
  title: 'Quiz: は vs が - Advanced',
  lessonId: 'lesson-1-3',
  totalQuestions: 5,
  passingScore: 80,
  timeLimit: 10,
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
      explanation: 'Trả lời câu hỏi về chủ ngữ (誰が) phải dùng が.',
      points: 2,
      difficulty: 'hard'
    },
    {
      id: 2,
      text: 'A: 田中さんは何が好きですか。\nB: 私（　）音楽（　）好きです。',
      options: [
        { label: 'A', text: 'は / が' },
        { label: 'B', text: 'が / は' },
        { label: 'C', text: 'は / を' },
        { label: 'D', text: 'を / が' }
      ],
      correct: 'A',
      explanation: 'Pattern: AはBが好き. は chỉ người, が chỉ đối tượng thích.',
      points: 2,
      difficulty: 'hard'
    },
    {
      id: 3,
      text: '象（　）鼻（　）長いです。',
      options: [
        { label: 'A', text: 'は / が' },
        { label: 'B', text: 'が / は' },
        { label: 'C', text: 'は / は' },
        { label: 'D', text: 'が / が' }
      ],
      correct: 'A',
      explanation: '象は (voi - chủ đề), 鼻が (mũi - chủ ngữ của tính từ). Pattern: AのBはCがD.',
      points: 3,
      difficulty: 'hard'
    },
    {
      id: 4,
      text: 'A: コーヒーと紅茶とどちらが好きですか。\nB: 私（　）コーヒー（　）好きです。',
      options: [
        { label: 'A', text: 'は / が' },
        { label: 'B', text: 'が / は' },
        { label: 'C', text: 'は / を' },
        { label: 'D', text: 'は / は' }
      ],
      correct: 'A',
      explanation: 'は để đối chiếu (tôi thì), が đi với 好き.',
      points: 2,
      difficulty: 'hard'
    },
    {
      id: 5,
      text: '私の父（　）会社員です（　）、母（　）医者です。',
      options: [
        { label: 'A', text: 'は / が / は' },
        { label: 'B', text: 'が / が / が' },
        { label: 'C', text: 'は / 、 / は' },
        { label: 'D', text: 'が / 、 / が' }
      ],
      correct: 'C',
      explanation: 'Đối chiếu 2 người: 父は...、母は... Dùng は để chỉ contrast.',
      points: 3,
      difficulty: 'hard'
    }
  ]
};

// ──────────────────────────────────────
// OTHER QUIZZES (abbreviated for brevity)
// ──────────────────────────────────────

export const quiz_2_1 = {
  title: 'Quiz: Family Vocabulary',
  lessonId: 'lesson-2-1',
  totalQuestions: 15,
  questions: [
    // ... 15 vocabulary questions
  ]
};

export const quiz_2_2 = {
  title: 'Quiz: Business Vocabulary',
  lessonId: 'lesson-2-2',
  totalQuestions: 20,
  questions: [
    // ... 20 vocabulary questions
  ]
};

export const quiz_2_3 = {
  title: 'Quiz: Chapter 2 Practice Test',
  lessonId: 'lesson-2-3',
  totalQuestions: 30,
  questions: [
    // ... 30 mixed questions
  ]
};

export const quiz_3_1 = {
  title: 'Quiz: Reading Strategies',
  lessonId: 'lesson-3-1',
  totalQuestions: 5,
  questions: [
    // ... 5 reading comprehension questions
  ]
};

export const quiz_3_2 = {
  title: 'Quiz: Short Passages',
  lessonId: 'lesson-3-2',
  totalQuestions: 10,
  questions: [
    // ... 10 reading questions with short passages
  ]
};

export const quiz_3_3 = {
  title: 'Quiz: Long Passages',
  lessonId: 'lesson-3-3',
  totalQuestions: 8,
  questions: [
    // ... 8 reading questions with long passages
  ]
};

// ============================================
// EXPORT COMPLETE BOOK
// ============================================

export const completeBookSample = {
  // Level 1: Series
  series: sampleSeries,
  
  // Level 2: Book
  book: sampleBook,
  
  // Level 3: Chapters (3 chapters)
  chapters: sampleChapters,
  
  // Level 4: Lessons (9 lessons total)
  lessons: {
    'sample-book-001_chapter-1': chapter1Lessons, // 3 lessons
    'sample-book-001_chapter-2': chapter2Lessons, // 3 lessons
    'sample-book-001_chapter-3': chapter3Lessons  // 3 lessons
  },
  
  // Level 5: Quizzes (9 quizzes total)
  quizzes: {
    'sample-book-001_chapter-1_lesson-1-1': quiz_1_1,
    'sample-book-001_chapter-1_lesson-1-2': quiz_1_2,
    'sample-book-001_chapter-1_lesson-1-3': quiz_1_3,
    'sample-book-001_chapter-2_lesson-2-1': quiz_2_1,
    'sample-book-001_chapter-2_lesson-2-2': quiz_2_2,
    'sample-book-001_chapter-2_lesson-2-3': quiz_2_3,
    'sample-book-001_chapter-3_lesson-3-1': quiz_3_1,
    'sample-book-001_chapter-3_lesson-3-2': quiz_3_2,
    'sample-book-001_chapter-3_lesson-3-3': quiz_3_3
  }
};

// ============================================
// IMPORT SCRIPT - Use this to import sample
// ============================================

export async function importSampleBook() {
  const { series, book, chapters, lessons, quizzes } = completeBookSample;
  
  try {
    // Import Series
    console.log('1/5 Importing Series...');
    const existingSeries = await storageManager.getSeries('n1') || [];
    if (!existingSeries.find(s => s.id === series.id)) {
      await storageManager.saveSeries('n1', [...existingSeries, series]);
    }
    
    // Import Book
    console.log('2/5 Importing Book...');
    const existingBooks = await storageManager.getBooks('n1') || [];
    if (!existingBooks.find(b => b.id === book.id)) {
      await storageManager.saveBooks('n1', [...existingBooks, book]);
    }
    
    // Import Chapters
    console.log('3/5 Importing Chapters...');
    await storageManager.saveChapters(book.id, chapters);
    
    // Import Lessons
    console.log('4/5 Importing Lessons...');
    for (const [key, lessonList] of Object.entries(lessons)) {
      const [bookId, chapterId] = key.split('_');
      await storageManager.saveLessons(bookId, chapterId, lessonList);
    }
    
    // Import Quizzes
    console.log('5/5 Importing Quizzes...');
    for (const [key, quiz] of Object.entries(quizzes)) {
      const [bookId, chapterId, lessonId] = key.split('_');
      await storageManager.saveQuiz(bookId, chapterId, lessonId, quiz);
    }
    
    console.log('✅ Import complete!');
    return true;
  } catch (error) {
    console.error('❌ Import failed:', error);
    return false;
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example 1: Import complete sample book
 * 
 * ```javascript
 * import { importSampleBook } from './data/samples/complete-book-sample.js';
 * 
 * // In admin panel or console:
 * await importSampleBook();
 * ```
 */

/**
 * Example 2: Use individual components
 * 
 * ```javascript
 * import { sampleBook, sampleChapters, chapter1Lessons } from './complete-book-sample.js';
 * 
 * // Use as template
 * const myBook = { ...sampleBook, id: 'my-book-001', title: 'My Book' };
 * ```
 */

/**
 * Example 3: Console import
 * 
 * Open browser console and run:
 * ```javascript
 * const script = document.createElement('script');
 * script.type = 'module';
 * script.textContent = `
 *   import { importSampleBook } from '/src/data/samples/complete-book-sample.js';
 *   importSampleBook().then(() => alert('Sample imported!'));
 * `;
 * document.head.appendChild(script);
 * ```
 */

export default completeBookSample;

