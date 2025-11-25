# 📚 Lesson Knowledge & Quiz System - Hướng Dẫn Chi Tiết

## 📋 Tổng Quan

**LessonPage** có hệ thống 2 tabs để tách biệt **Lý thuyết** và **Quiz**:

```
┌─────────────────────────────────┐
│  📄 Lý thuyết  │  ❓ Quiz      │ ← Tabs
├─────────────────────────────────┤
│                                 │
│  [Content hiển thị theo tab]    │
│                                 │
└─────────────────────────────────┘
```

---

## 🎯 Cấu Trúc

### Tab 1: 📄 Lý Thuyết (Theory/Knowledge)

**Mục đích:** Hiển thị tài liệu học tập (PDF, text, images)

**Content types:**
1. **PDF Document** (khuyến nghị)
2. **HTML Content** 
3. **Markdown**
4. **Plain text**

**Features:**
- ✅ PDF Viewer (iframe)
- ✅ Zoom controls (50% - 150%)
- ✅ Download button
- ✅ Dictionary integration (double-click để tra từ)
- ✅ Mobile responsive
- ✅ Touch-friendly controls

### Tab 2: ❓ Quiz

**Mục đích:** Làm bài tập trắc nghiệm

**Features:**
- ✅ Multiple choice questions
- ✅ Instant feedback
- ✅ Explanations
- ✅ Score tracking
- ✅ Progress saving
- ✅ Dictionary integration

---

## 📖 Flow Học Tập

### User Journey:

```
1. User chọn Lesson
   ↓
2. Mặc định hiển thị "Lý thuyết" tab
   ↓
3. User đọc tài liệu (PDF/text)
   ↓
4. User có thể:
   - Zoom in/out
   - Download PDF
   - Double-click tra từ
   - Check "✅ Đã học xong"
   ↓
5. User chuyển sang "Quiz" tab
   ↓
6. Làm bài quiz để củng cố kiến thức
   ↓
7. Xem điểm + giải thích
   ↓
8. Click "Bài tiếp →"
```

---

## 🔧 Technical Details

### File Location:
```
src/features/books/pages/LessonPage.jsx
```

### Tab System:

```javascript
const TABS = {
  THEORY: 'theory',
  QUIZ: 'quiz'
};

const [activeTab, setActiveTab] = useState(TABS.THEORY);
```

**Default:** Luôn mở tab "Lý thuyết" trước

### Data Structure:

#### Lesson Object:
```javascript
{
  id: 'lesson-1',
  title: 'Bài 1: Chào hỏi',
  description: 'Học cách chào hỏi bằng tiếng Nhật',
  pdfUrl: '/pdfs/lesson1-greeting.pdf',  // Optional
  content: '<div>HTML content...</div>',  // Optional
  hasQuiz: true                           // If quiz exists
}
```

#### Quiz Object:
```javascript
{
  title: 'Quiz: Chào hỏi',
  questions: [
    {
      id: 1,
      text: 'Câu hỏi 1...',
      options: [
        { label: 'A', text: 'Đáp án A' },
        { label: 'B', text: 'Đáp án B' },
        { label: 'C', text: 'Đáp án C' },
        { label: 'D', text: 'Đáp án D' }
      ],
      correct: 'A',
      explanation: 'Giải thích...'
    }
  ]
}
```

---

## 📄 Tab "Lý Thuyết"

### Hiển thị khi có PDF:

```jsx
<div>
  {/* PDF Viewer */}
  <iframe src={pdfUrl} className="w-full h-[60vh]" />
  
  {/* Controls */}
  <div className="controls">
    <button>🔍-</button>  // Zoom out
    <span>100%</span>     // Current zoom
    <button>🔍+</button>  // Zoom in
    <button>📥 Download</button>
  </div>
  
  {/* Actions */}
  <label>
    <input type="checkbox" />
    ✅ Đã học xong
  </label>
  
  {currentQuiz && (
    <button>Làm quiz →</button>
  )}
  
  <button>Bài tiếp →</button>
</div>
```

### Hiển thị khi KHÔNG có PDF:

```jsx
<div className="empty-state">
  <p>📄 Chưa có tài liệu lý thuyết cho bài học này</p>
  <p>Vui lòng liên hệ admin để cập nhật</p>
</div>
```

### PDF Controls:

**Zoom:**
- Min: 50%
- Max: 150%
- Step: 10%
- Controls: `🔍-` và `🔍+`

**Download:**
```javascript
const handleDownloadPDF = () => {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `${currentLesson.title}.pdf`;
  link.click();
};
```

**Completion Tracking:**
```javascript
const handleToggleCompletion = (e) => {
  const completed = e.target.checked;
  setLessonCompletion(bookId, chapterId, lessonId, completed);
  setIsLessonCompleted(completed);
  
  if (completed) {
    updateStudyStreak(); // Update streak counter
  }
};
```

---

## ❓ Tab "Quiz"

### Hiển thị khi có Quiz:

```jsx
<div>
  <h3>{currentQuiz.title}</h3>
  <p>Số câu hỏi: {currentQuiz.questions.length}</p>
  
  <Link to={`...quiz`}>
    Bắt đầu làm quiz
  </Link>
</div>
```

### Hiển thị khi KHÔNG có Quiz:

```jsx
<div className="empty-state">
  <p>❓ Chưa có quiz cho bài học này</p>
  <p>Vui lòng liên hệ admin để cập nhật</p>
</div>
```

### Quiz Tab ẨN khi:
```javascript
{currentQuiz && (
  <button>❓ Quiz</button>
)}
```

**Logic:** Nếu lesson không có quiz → Tab "Quiz" không hiển thị

---

## 🎨 UI/UX Design

### Tabs Design (Neo-Brutalism):

**Active Tab:**
```css
bg-yellow-400
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
border-[3px] border-black
font-black
```

**Inactive Tab:**
```css
bg-white
shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
border-[3px] border-black
hover:bg-yellow-100
```

### Mobile Responsive:

**Tabs:**
- Horizontal scroll nếu không fit
- Touch-friendly (min-height: 48px)
- Whitespace-nowrap

**PDF Controls:**
- Larger buttons (min 48x48px)
- Flex-wrap for small screens
- Clear labels

---

## 💾 Data Loading

### Load Sequence:

```javascript
useEffect(() => {
  // 1. Load lesson data
  const lesson = await storageManager.getLessons(bookId, chapterId);
  setCurrentLesson(lesson);
  
  // 2. Check for PDF
  if (lesson.pdfUrl) {
    setPdfUrl(lesson.pdfUrl);
  }
  
  // 3. Load quiz
  const quiz = await storageManager.getQuiz(bookId, chapterId, lessonId);
  setCurrentQuiz(quiz);
  
  // 4. Load completion status
  const completed = getLessonCompletion(bookId, chapterId, lessonId);
  setIsLessonCompleted(completed);
}, [bookId, chapterId, lessonId]);
```

---

## 🔍 Dictionary Integration

### Double-Click to Translate:

```javascript
// ✅ Ref cho toàn bộ content
const contentRef = useRef(null);
useDictionaryDoubleClick(contentRef);
```

**Features:**
- Double-click bất kỳ từ nào trong PDF/content
- Popup hiển thị nghĩa (JP-VI-EN)
- Support JLPT 8,292 từ
- Works in both Theory and Quiz tabs

---

## 📊 Progress Tracking

### Lesson Completion:

**Storage:**
```javascript
localStorage.setItem(
  `lesson_${bookId}_${chapterId}_${lessonId}_completed`,
  'true'
);
```

**Benefits:**
- ✅ Track learning progress
- ✅ Show completion badges
- ✅ Calculate chapter progress
- ✅ Update study streak

### Study Streak:

```javascript
if (lessonCompleted) {
  updateStudyStreak(); // +1 day if new day
}
```

---

## 🎯 Admin - Cách Thêm Lý Thuyết

### Option 1: Upload PDF (Khuyến nghị)

**Step 1:** Chuẩn bị file PDF
```
lesson1-greeting.pdf
lesson2-grammar.pdf
```

**Step 2:** Upload to public folder
```
public/
  pdfs/
    n1/
      shinkanzen/
        lesson1-greeting.pdf
```

**Step 3:** Add to lesson data
```javascript
{
  id: 'lesson-1',
  title: 'Bài 1: Chào hỏi',
  pdfUrl: '/pdfs/n1/shinkanzen/lesson1-greeting.pdf'
}
```

### Option 2: HTML Content

```javascript
{
  id: 'lesson-2',
  title: 'Bài 2: Văn phạm',
  content: `
    <div>
      <h2>Văn phạm cơ bản</h2>
      <p>Nội dung lý thuyết...</p>
    </div>
  `
}
```

### Option 3: External Link

```javascript
{
  id: 'lesson-3',
  title: 'Bài 3: Từ vựng',
  externalUrl: 'https://example.com/lesson3'
}
```

---

## ❓ Admin - Cách Thêm Quiz

### Via Admin Panel:

**Step 1:** Content Management
```
1. Chọn Level (N1)
2. Chọn Book
3. Chọn Chapter
4. Chọn Lesson
5. Click "Add Quiz"
```

**Step 2:** Fill Quiz Data
```
Title: "Quiz: Chào hỏi"
Questions:
  - Question 1 text
  - 4 options (A, B, C, D)
  - Correct answer
  - Explanation
```

**Step 3:** Save
```
Quiz được lưu vào:
- IndexedDB: quizzes
- Key: `${bookId}_${chapterId}_${lessonId}`
```

### Via Quiz Editor:

**Alternative:**
```
Admin Panel → Quiz Editor
1. Select Level
2. Select Book
3. Select Chapter  
4. Select Lesson
5. Create quiz with visual editor
6. Export JSON
7. Import to lesson
```

---

## 🎨 UX Best Practices

### 1. Always Show Theory First
```javascript
const [activeTab, setActiveTab] = useState(TABS.THEORY);
```

**Lý do:** User nên đọc lý thuyết trước khi làm quiz

### 2. Hide Quiz Tab if No Quiz
```javascript
{currentQuiz && (
  <button>❓ Quiz</button>
)}
```

**Lý do:** Không hiển thị tab trống, tránh confusion

### 3. Encourage Completion
```javascript
<label>
  <input type="checkbox" />
  ✅ Đã học xong
</label>
```

**Lý do:** Gamification, track progress

### 4. Quick Navigation
```javascript
<button>Làm quiz →</button>
<button>Bài tiếp →</button>
```

**Lý do:** Easy flow, không cần back button

---

## 🔄 State Management

### States:

```javascript
// Tab state
const [activeTab, setActiveTab] = useState(TABS.THEORY);

// Content states
const [currentLesson, setCurrentLesson] = useState(null);
const [currentQuiz, setCurrentQuiz] = useState(null);
const [pdfUrl, setPdfUrl] = useState(null);

// PDF viewer states
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [zoomLevel, setZoomLevel] = useState(100);

// Progress states
const [isLessonCompleted, setIsLessonCompleted] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

### Loading Strategy:

```javascript
useEffect(() => {
  loadLesson();    // Load from IndexedDB/localStorage
  loadQuiz();      // Load quiz if exists
  loadProgress();  // Load completion status
}, [bookId, chapterId, lessonId]);
```

---

## 📱 Mobile Responsive

### Tab Bar:
```css
overflow-x-auto      /* Scroll nếu quá nhiều tabs */
whitespace-nowrap    /* Không wrap */
gap-2                /* Space giữa tabs */
```

### Controls:
```css
min-h-[48px]         /* Touch target size */
flex-wrap            /* Wrap on small screens */
gap-2                /* Consistent spacing */
```

### PDF Viewer:
```css
height: 60vh         /* Responsive height */
transform: scale()   /* Zoom với transform */
```

---

## 🎯 Use Cases

### Use Case 1: Lesson có cả PDF và Quiz

**Flow:**
```
1. User mở lesson
2. Tab "Lý thuyết" active (default)
3. PDF hiển thị
4. User đọc, zoom, download
5. Check "✅ Đã học xong"
6. Click "Làm quiz →" hoặc tab "Quiz"
7. Làm quiz
8. Xem kết quả
9. Click "Bài tiếp →"
```

### Use Case 2: Lesson chỉ có PDF (không có Quiz)

**Flow:**
```
1. User mở lesson
2. Chỉ có tab "Lý thuyết"
3. Tab "Quiz" bị ẩn
4. User đọc PDF
5. Check "✅ Đã học xong"
6. Click "Bài tiếp →"
```

### Use Case 3: Lesson chưa có nội dung

**Flow:**
```
1. User mở lesson
2. Tab "Lý thuyết" hiển thị empty state:
   "📄 Chưa có tài liệu lý thuyết cho bài học này"
3. User liên hệ admin để cập nhật
```

---

## 💡 Best Practices

### 1. PDF > HTML Content
```
✅ Prefer: PDF files (better formatting, print-friendly)
⚠️ Alternative: HTML (for interactive content)
```

### 2. Quiz Optional
```
✅ OK: Lesson có lý thuyết, không có quiz
❌ Avoid: Lesson có quiz, không có lý thuyết
```

**Lý do:** User cần lý thuyết trước khi làm quiz

### 3. Short Lessons
```
✅ Good: 5-10 pages PDF
⚠️ OK: 10-20 pages
❌ Avoid: 50+ pages (split into multiple lessons)
```

### 4. Clear Titles
```
✅ Good: "Bài 1: Chào hỏi - Cơ bản"
⚠️ OK: "Lesson 1"
❌ Avoid: "Untitled" hoặc "New Lesson"
```

---

## 🚀 Features to Add (Future)

### Potential Enhancements:

1. **PDF Navigation:**
   - [ ] Page number input
   - [ ] Jump to page
   - [ ] Bookmarks
   - [ ] Table of contents

2. **Notes System:**
   - [ ] User can add notes
   - [ ] Highlight text
   - [ ] Save annotations

3. **Audio Support:**
   - [ ] Play audio lessons
   - [ ] Speed control
   - [ ] Transcript

4. **Video Support:**
   - [ ] Embed YouTube
   - [ ] Video player controls
   - [ ] Subtitles

5. **Progress Details:**
   - [ ] Time spent on lesson
   - [ ] Pages read
   - [ ] Quiz attempts
   - [ ] Average score

6. **Smart Suggestions:**
   - [ ] "Recommended next lesson"
   - [ ] "Similar lessons"
   - [ ] "Review this lesson"

---

## 📊 Current Implementation

### Pros:
- ✅ Clean separation (Theory vs Quiz)
- ✅ Mobile responsive
- ✅ Dictionary integrated
- ✅ Progress tracking
- ✅ Neo-brutalism design
- ✅ Touch-friendly

### Cons (Future improvements):
- ⚠️ PDF viewer basic (no page nav)
- ⚠️ No notes/annotations
- ⚠️ No audio/video support
- ⚠️ No time tracking
- ⚠️ No smart suggestions

---

## 📝 Example Lesson Data

### Complete Lesson with PDF and Quiz:

```javascript
// In: src/data/level/n1/shinkanzen/lessons.js

export const lesson1 = {
  id: 'lesson-1',
  title: 'Bài 1: Chào hỏi cơ bản',
  description: 'Học cách chào hỏi trong giao tiếp hàng ngày',
  pdfUrl: '/pdfs/n1/shinkanzen/bunpou/lesson1.pdf',
  order: 1,
  estimatedTime: '30 phút',
  difficulty: 'beginner'
};

// Quiz stored separately
// In IndexedDB: quizzes/shinkanzen-n1-bunpou_chapter1_lesson-1
{
  title: 'Quiz: Chào hỏi cơ bản',
  questions: [...]
}
```

---

## 🎯 Tóm Tắt

### Tính Năng Chính:

1. **2 Tabs:**
   - 📄 Lý thuyết (Theory) - Mặc định
   - ❓ Quiz (nếu có)

2. **Theory Tab:**
   - PDF Viewer
   - Zoom controls
   - Download button
   - Completion checkbox
   - Dictionary (double-click)

3. **Quiz Tab:**
   - Link to quiz page
   - Question count
   - "Bắt đầu làm quiz" button

4. **Navigation:**
   - "Làm quiz →" (theory → quiz)
   - "Bài tiếp →" (next lesson)

5. **Progress:**
   - Completion tracking
   - Streak update
   - Chapter progress

**Bạn muốn cải thiện tính năng nào trong hệ thống này?** 🚀

- [ ] Cải thiện PDF viewer?
- [ ] Thêm notes/annotations?
- [ ] Thêm audio/video support?
- [ ] Thêm progress analytics?
- [ ] Khác?

