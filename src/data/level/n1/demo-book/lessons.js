// src/data/level/n1/demo-book/lessons.js
// 📝 DEMO Lessons - 9 lessons with all types (PDF, HTML, Mixed, Quiz-only)

export const demoLessons = {
  // ============================================
  // CHAPTER 1: Grammar Lessons (3 lessons)
  // ============================================
  'demo-complete-001_demo-chapter-1': [
    // Lesson 1.1: PDF only + Quiz
    {
      id: 'demo-lesson-1-1',
      title: 'Lesson 1.1: Particle は (wa)',
      description: 'Learn how to use the topic particle は',
      order: 1,
      pdfUrl: '/pdfs/demo/lesson1-1-particle-wa.pdf',
      content: null,
      published: true,
      estimatedTime: '45 minutes',
      difficulty: 'beginner',
      keywords: ['は', 'particle', 'topic marker', 'grammar']
    },
    
    // Lesson 1.2: HTML only + Quiz
    {
      id: 'demo-lesson-1-2',
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
  
  <h3>3. Động từ/Tính từ đặc biệt với が:</h3>
  <ul>
    <li>好き (thích): 私はコーヒー<strong>が</strong>好きです</li>
    <li>上手 (giỏi): 田中さんは英語<strong>が</strong>上手です</li>
    <li>分かる (hiểu): 日本語<strong>が</strong>分かります</li>
    <li>できる (có thể): 泳ぐこと<strong>が</strong>できます</li>
  </ul>
  
  <h3>4. Bài tập:</h3>
  <p>Chọn は hoặc が cho đúng:</p>
  <ol>
    <li>誰（　）来ましたか → <em>が</em></li>
    <li>私（　）日本人です → <em>は</em></li>
    <li>私（　）日本語（　）分かります → <em>は</em>、<em>が</em></li>
  </ol>
</div>
      `,
      published: true,
      estimatedTime: '50 minutes',
      difficulty: 'beginner',
      keywords: ['が', 'particle', 'subject marker']
    },
    
    // Lesson 1.3: Both PDF and HTML + Quiz
    {
      id: 'demo-lesson-1-3',
      title: 'Lesson 1.3: は vs が Comparison',
      description: 'Deep dive into the difference between は and が',
      order: 3,
      pdfUrl: '/pdfs/demo/lesson1-3-wa-vs-ga.pdf',
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
        <td><strong>Example</strong></td>
        <td>私は学生です</td>
        <td>誰が学生ですか</td>
      </tr>
      <tr>
        <td><strong>Emphasis</strong></td>
        <td>Old information</td>
        <td>New information</td>
      </tr>
    </tbody>
  </table>
  
  <p><em>💡 Note: PDF has full detailed explanation with more examples!</em></p>
</div>
      `,
      published: true,
      estimatedTime: '60 minutes',
      difficulty: 'intermediate',
      keywords: ['は', 'が', 'comparison', 'particle']
    }
  ],
  
  // ============================================
  // CHAPTER 2: Vocabulary Lessons (3 lessons)
  // ============================================
  'demo-complete-001_demo-chapter-2': [
    // Lesson 2.1: HTML with vocabulary table
    {
      id: 'demo-lesson-2-1',
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
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>父</td>
        <td>ちち</td>
        <td>chichi</td>
        <td>Bố (của mình)</td>
      </tr>
      <tr>
        <td>お父さん</td>
        <td>おとうさん</td>
        <td>otousan</td>
        <td>Bố (người khác)</td>
      </tr>
      <tr>
        <td>母</td>
        <td>はは</td>
        <td>haha</td>
        <td>Mẹ (của mình)</td>
      </tr>
      <tr>
        <td>お母さん</td>
        <td>おかあさん</td>
        <td>okaasan</td>
        <td>Mẹ (người khác)</td>
      </tr>
      <tr>
        <td>兄</td>
        <td>あに</td>
        <td>ani</td>
        <td>Anh trai (mình)</td>
      </tr>
      <tr>
        <td>お兄さん</td>
        <td>おにいさん</td>
        <td>oniisan</td>
        <td>Anh (người khác)</td>
      </tr>
      <tr>
        <td>姉</td>
        <td>あね</td>
        <td>ane</td>
        <td>Chị gái (mình)</td>
      </tr>
      <tr>
        <td>お姉さん</td>
        <td>おねえさん</td>
        <td>oneesan</td>
        <td>Chị (người khác)</td>
      </tr>
    </tbody>
  </table>
  
  <h3>💡 Lưu ý quan trọng:</h3>
  <ul>
    <li><strong>Khiêm nhường:</strong> Về gia đình mình dùng từ đơn (父, 母, 兄, 姉)</li>
    <li><strong>Tôn trọng:</strong> Về gia đình người khác dùng kính ngữ (お父さん, お母さん)</li>
    <li><strong>Ngoại lệ:</strong> Nói với người trong gia đình dùng từ kính ngữ</li>
  </ul>
  
  <h3>Ví dụ câu:</h3>
  <ol>
    <li>私の<strong>父</strong>は会社員です - Bố tôi là nhân viên công ty</li>
    <li>田中さんの<strong>お父さん</strong>は医者です - Bố anh Tanaka là bác sĩ</li>
    <li><strong>兄</strong>は東京に住んでいます - Anh trai tôi sống ở Tokyo</li>
  </ol>
</div>
      `,
      published: true,
      estimatedTime: '40 minutes',
      difficulty: 'beginner',
      keywords: ['vocabulary', 'family', '家族']
    },
    
    // Lesson 2.2: PDF (business vocab)
    {
      id: 'demo-lesson-2-2',
      title: 'Lesson 2.2: Business Vocabulary',
      description: 'Essential business Japanese vocabulary',
      order: 2,
      pdfUrl: '/pdfs/demo/lesson2-2-business.pdf',
      content: null,
      published: true,
      estimatedTime: '50 minutes',
      difficulty: 'intermediate',
      keywords: ['vocabulary', 'business', 'work']
    },
    
    // Lesson 2.3: Quiz only (no knowledge)
    {
      id: 'demo-lesson-2-3',
      title: 'Lesson 2.3: Vocabulary Practice Test',
      description: 'Test your vocabulary knowledge',
      order: 3,
      pdfUrl: null,
      content: null,
      published: true,
      estimatedTime: '30 minutes',
      difficulty: 'intermediate',
      keywords: ['practice', 'test', 'vocabulary']
    }
  ],
  
  // ============================================
  // CHAPTER 3: Reading Lessons (3 lessons)
  // ============================================
  'demo-complete-001_demo-chapter-3': [
    // Lesson 3.1: PDF + HTML (strategies)
    {
      id: 'demo-lesson-3-1',
      title: 'Lesson 3.1: Reading Strategies',
      description: 'Learn effective reading techniques for JLPT',
      order: 1,
      pdfUrl: '/pdfs/demo/lesson3-1-strategies.pdf',
      content: `
<div>
  <h2>📖 5 Bước Đọc Hiểu Hiệu Quả</h2>
  
  <ol>
    <li><strong>Skimming (30s)</strong> - Đọc lướt nắm ý chính</li>
    <li><strong>Key Words</strong> - Tìm từ khóa trong câu hỏi</li>
    <li><strong>Detail Reading</strong> - Đọc kỹ phần liên quan</li>
    <li><strong>Infer Meaning</strong> - Suy luận từ context</li>
    <li><strong>Verify</strong> - Kiểm tra lại đáp án</li>
  </ol>
  
  <h3>💡 Tips JLPT Reading:</h3>
  <ul>
    <li>Đọc câu hỏi TRƯỚC văn bản</li>
    <li>Highlight từ khóa</li>
    <li>Loại trừ đáp án sai</li>
    <li>Quản lý thời gian: 5-7 phút/văn bản</li>
  </ul>
  
  <p><em>See PDF for detailed examples!</em></p>
</div>
      `,
      published: true,
      estimatedTime: '55 minutes',
      difficulty: 'advanced',
      keywords: ['reading', 'strategies', 'dokkai']
    },
    
    // Lesson 3.2: PDF only
    {
      id: 'demo-lesson-3-2',
      title: 'Lesson 3.2: Short Passages',
      description: 'Practice with short reading passages',
      order: 2,
      pdfUrl: '/pdfs/demo/lesson3-2-short-passages.pdf',
      content: null,
      published: true,
      estimatedTime: '45 minutes',
      difficulty: 'intermediate',
      keywords: ['reading', 'passages', 'practice']
    },
    
    // Lesson 3.3: PDF only (advanced)
    {
      id: 'demo-lesson-3-3',
      title: 'Lesson 3.3: Long Passages',
      description: 'Advanced reading with long complex texts',
      order: 3,
      pdfUrl: '/pdfs/demo/lesson3-3-long-passages.pdf',
      content: null,
      published: true,
      estimatedTime: '60 minutes',
      difficulty: 'advanced',
      keywords: ['reading', 'long passages', 'advanced']
    }
  ]
};

