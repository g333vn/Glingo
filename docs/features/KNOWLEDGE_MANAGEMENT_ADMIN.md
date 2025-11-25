# 📄 Knowledge/Theory Management - Admin Guide

## ✅ Tính Năng Mới

Admin giờ có thể **thêm nội dung Lý thuyết** cho mỗi bài học trực tiếp từ Admin Panel!

---

## 🎯 Cách Sử Dụng

### Bước 1: Vào Content Management

```
Admin Panel → Content Management
```

### Bước 2: Navigate đến Lesson

```
1. Chọn Level (N1, N2, N3, N4, N5)
2. Chọn Series/Book
3. Chọn Chapter
4. Click "➕ Add Lesson" hoặc "✏️ Edit" lesson có sẵn
```

### Bước 3: Điền Thông Tin Lesson

**Required Fields:**
- ✅ **ID Bài học**: `lesson-1`, `lesson-2`, etc. (auto-generated)
- ✅ **Tên Bài học**: "Bài 1.1 - Ngữ pháp cơ bản"

**Optional Fields:**
- 📝 **Mô tả ngắn**: "Học cách sử dụng trợ từ は và が"

### Bước 4: Thêm Nội Dung Lý Thuyết

**Option 1: PDF (Khuyến nghị)** 📎

```
1. Upload PDF vào: public/pdfs/n1/shinkanzen/
   Ví dụ: lesson1-grammar.pdf

2. Nhập URL vào field "URL PDF Lý thuyết":
   /pdfs/n1/shinkanzen/lesson1-grammar.pdf

3. Click "🔗 Xem trước PDF" để verify
```

**Option 2: HTML Content** 📝

```html
<div>
  <h2>Ngữ pháp: Trợ từ は</h2>
  
  <p>Trợ từ は được dùng để chỉ chủ đề của câu.</p>
  
  <h3>Ví dụ:</h3>
  <ul>
    <li><strong>私は学生です</strong> - Tôi là sinh viên</li>
    <li><strong>今日はいい天気です</strong> - Hôm nay thời tiết tốt</li>
  </ul>
  
  <h3>Lưu ý:</h3>
  <p>Không nhầm lẫn は với わ trong từ こんにちは!</p>
</div>
```

### Bước 5: Save

```
Click "💾 Thêm Bài học" hoặc "💾 Lưu thay đổi"
```

---

## 📖 Display Logic

### Priority Order:

1. **Có PDF URL** → Hiển thị PDF Viewer
2. **Không có PDF, có HTML Content** → Hiển thị HTML Content Viewer
3. **Không có gì** → Hiển thị "Chưa có tài liệu lý thuyết"

### User View:

**Tab "📄 Lý thuyết":**

#### Khi có PDF:
```
┌──────────────────────────────┐
│                              │
│      [PDF Document]          │
│                              │
├──────────────────────────────┤
│ 🔍- [100%] 🔍+   📥 Download │
└──────────────────────────────┘
```

#### Khi có HTML Content:
```
┌──────────────────────────────┐
│  Ngữ pháp: Trợ từ は         │
│                              │
│  Trợ từ は được dùng để...   │
│                              │
│  Ví dụ:                      │
│  • 私は学生です              │
│  • 今日はいい天気です        │
├──────────────────────────────┤
│ 🔍- [100%] 🔍+   📝 HTML     │
└──────────────────────────────┘
```

#### Khi không có nội dung:
```
┌──────────────────────────────┐
│                              │
│  📄 Chưa có tài liệu          │
│     lý thuyết cho bài học này │
│                              │
│  Vui lòng liên hệ admin       │
│  để cập nhật                  │
│                              │
└──────────────────────────────┘
```

---

## 🎨 Form UI (Admin Panel)

### Lesson Form Structure:

```
┌─────────────────────────────────────┐
│ ➕ Thêm Bài học mới - Chapter X     │
├─────────────────────────────────────┤
│                                     │
│ ID Bài học * [lesson-1           ] │
│ Tên Bài học * [Bài 1.1 - Ngữ pháp] │
│ Mô tả ngắn   [Học trợ từ は và が  ] │
│                                     │
│ ─────────────────────────────────  │
│                                     │
│ 📄 Nội dung Lý thuyết               │
│                                     │
│ 📎 URL PDF Lý thuyết (khuyến nghị)  │
│ [/pdfs/n1/shinkanzen/lesson1.pdf ] │
│ 🔗 Xem trước PDF                    │
│                                     │
│ 📝 Nội dung HTML (nếu không dùng PDF)│
│ ┌─────────────────────────────┐   │
│ │ <div>                        │   │
│ │   <h2>Ngữ pháp...</h2>       │   │
│ │   <p>Nội dung...</p>         │   │
│ │ </div>                       │   │
│ └─────────────────────────────┘   │
│                                     │
│ 💡 Lưu ý:                           │
│ • Ưu tiên dùng PDF cho nội dung dài │
│ • Dùng HTML cho nội dung ngắn       │
│ • Nếu có cả 2: PDF ưu tiên hiển thị │
│                                     │
│ ─────────────────────────────────  │
│                                     │
│ 📋 Bài học hiện có của chương       │
│ lesson-1 - Bài 1.1                  │
│ lesson-2 - Bài 1.2                  │
│                                     │
├─────────────────────────────────────┤
│ [💾 Thêm Bài học]  [Hủy]           │
└─────────────────────────────────────┘
```

---

## 📊 Data Structure

### Lesson Object (Complete):

```javascript
{
  id: 'lesson-1',
  title: 'Bài 1.1 - Ngữ pháp cơ bản',
  description: 'Học cách sử dụng trợ từ は và が',
  
  // ✅ NEW: Knowledge/Theory content
  pdfUrl: '/pdfs/n1/shinkanzen/lesson1-grammar.pdf',
  content: '<div><h2>Ngữ pháp...</h2></div>',
  
  // Quiz added separately via Quiz Form
}
```

### Storage:

**IndexedDB:**
```javascript
store: 'lessons'
key: `${bookId}_${chapterId}`
value: [
  { id: 'lesson-1', title: '...', pdfUrl: '...', content: '...' },
  { id: 'lesson-2', title: '...', pdfUrl: '...', content: '...' }
]
```

---

## 🔧 HTML Content Guidelines

### Supported Tags:

**Headings:**
```html
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection</h3>
```

**Text:**
```html
<p>Paragraph text</p>
<strong>Bold text</strong>
<em>Italic text</em>
<code>Code snippet</code>
```

**Lists:**
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<ol>
  <li>First</li>
  <li>Second</li>
</ol>
```

**Links:**
```html
<a href="https://example.com">Link text</a>
```

**Images:**
```html
<img src="/images/example.jpg" alt="Description" />
```

**Tables:**
```html
<table>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
  </tr>
  <tr>
    <td>Data 1</td>
    <td>Data 2</td>
  </tr>
</table>
```

### Styling:

**Automatic styling via Tailwind `prose`:**
- Headings: Auto-sized, bold
- Paragraphs: Proper spacing
- Lists: Bullets/numbers styled
- Code: Monospace font, gray background
- Links: Blue, underlined
- Tables: Bordered

### Example HTML:

```html
<div>
  <h2>Bài 1: Trợ từ は (wa)</h2>
  
  <p>Trợ từ は là một trong những trợ từ quan trọng nhất trong tiếng Nhật.</p>
  
  <h3>Cách sử dụng:</h3>
  <ol>
    <li><strong>Chỉ chủ đề:</strong> 私は学生です (Tôi là sinh viên)</li>
    <li><strong>Đối chiếu:</strong> りんごは好きです (Về táo thì tôi thích)</li>
  </ol>
  
  <h3>Lưu ý:</h3>
  <p>Phát âm là <strong>"wa"</strong> nhưng viết là <strong>"は"</strong> (hiragana ha).</p>
  
  <h3>Bài tập:</h3>
  <p>Điền trợ từ は vào chỗ trống:</p>
  <ul>
    <li>私（　）日本人です → 私<em>は</em>日本人です</li>
    <li>これ（　）本です → これ<em>は</em>本です</li>
  </ul>
</div>
```

---

## 📂 PDF Upload Guide

### Step 1: Chuẩn bị PDF

**File naming:**
```
✅ Good:
  - lesson1-grammar.pdf
  - lesson2-vocabulary.pdf
  - chapter1-introduction.pdf

❌ Avoid:
  - bài 1.pdf (có khoảng trắng)
  - lession1.pdf (typo)
  - 课程1.pdf (ký tự đặc biệt)
```

### Step 2: Upload to Public Folder

**Folder structure:**
```
public/
  pdfs/
    n1/
      shinkanzen/
        bunpou/
          lesson1-grammar.pdf
          lesson2-particles.pdf
        goi/
          lesson1-vocabulary.pdf
      try/
        lesson1-reading.pdf
    n2/
      ...
```

### Step 3: Get URL Path

**Format:**
```
/pdfs/{level}/{series}/{subject}/{filename}.pdf
```

**Examples:**
```
/pdfs/n1/shinkanzen/bunpou/lesson1-grammar.pdf
/pdfs/n1/try/reading/lesson1-comprehension.pdf
/pdfs/n2/sou/goi/lesson1-vocabulary.pdf
```

### Step 4: Paste into Form

```
Admin Panel → Lesson Form
  → 📎 URL PDF Lý thuyết
  → Paste: /pdfs/n1/shinkanzen/bunpou/lesson1-grammar.pdf
  → Click "🔗 Xem trước PDF" để verify
  → Save
```

---

## 🎯 Use Cases

### Use Case 1: Lesson với PDF

**Admin:**
```
1. Add Lesson
2. Title: "Bài 1: Ngữ pháp cơ bản"
3. PDF URL: "/pdfs/n1/shinkanzen/lesson1.pdf"
4. Save
```

**User:**
```
1. Mở lesson
2. Tab "Lý thuyết" hiển thị PDF
3. Zoom, download, đọc
4. Double-click tra từ
5. Check "✅ Đã học xong"
6. Chuyển sang tab "Quiz"
```

### Use Case 2: Lesson với HTML

**Admin:**
```
1. Add Lesson
2. Title: "Bài 2: Trợ từ は"
3. HTML Content:
   <div>
     <h2>Trợ từ は</h2>
     <p>Nội dung...</p>
   </div>
4. Save
```

**User:**
```
1. Mở lesson
2. Tab "Lý thuyết" hiển thị HTML
3. Zoom in/out text
4. Đọc nội dung
5. Double-click tra từ
6. Check "✅ Đã học xong"
```

### Use Case 3: Lesson chỉ có Quiz

**Admin:**
```
1. Add Lesson
2. Title: "Bài 3: Practice Test"
3. Không điền PDF và HTML (để trống)
4. Save
5. Add Quiz cho lesson này
```

**User:**
```
1. Mở lesson
2. Tab "Lý thuyết" hiển thị empty state
3. Có thể bỏ qua, chuyển thẳng tab "Quiz"
```

---

## 💡 Best Practices

### 1. PDF vs HTML

**Dùng PDF khi:**
- ✅ Nội dung dài (> 5 trang)
- ✅ Có nhiều hình ảnh/bảng biểu
- ✅ Cần in ấn
- ✅ Đã có sẵn PDF từ sách

**Dùng HTML khi:**
- ✅ Nội dung ngắn (< 2 trang)
- ✅ Cần tương tác (links, buttons)
- ✅ Cần format tùy chỉnh
- ✅ Dễ edit/cập nhật

### 2. Naming Convention

**PDF Files:**
```
✅ lesson{number}-{topic}.pdf
   lesson1-grammar.pdf
   lesson2-vocabulary.pdf

✅ chapter{number}-{topic}.pdf
   chapter1-introduction.pdf
```

**Lesson Titles:**
```
✅ Bài {chapter}.{lesson} - {Topic}
   Bài 1.1 - Ngữ pháp cơ bản
   Bài 1.2 - Từ vựng N1

✅ Lesson {number}: {Topic}
   Lesson 1: Basic Grammar
```

### 3. Content Organization

**Recommended structure:**
```
Chapter 1: Chào hỏi
  └── Lesson 1.1: Lý thuyết
      - PDF: Grammar rules
      - Quiz: 10 questions
  └── Lesson 1.2: Thực hành
      - PDF: Practice exercises
      - Quiz: 15 questions
  └── Lesson 1.3: Từ vựng
      - HTML: Vocabulary list
      - Quiz: 20 questions
```

### 4. Content Quality

**PDF:**
- ✅ Clear, readable (min 12pt font)
- ✅ High quality (300 DPI)
- ✅ Optimized size (< 5 MB)
- ✅ Searchable text (not scanned image)

**HTML:**
- ✅ Well-formatted
- ✅ Proper headings hierarchy
- ✅ Clear examples
- ✅ Vietnamese + Japanese mixed OK

---

## 🔄 Edit/Update Workflow

### Update PDF:

```
1. Upload new PDF to public/pdfs/
2. Edit lesson in Admin Panel
3. Update PDF URL
4. Save
5. Users see new PDF immediately
```

### Update HTML:

```
1. Edit lesson in Admin Panel
2. Modify HTML Content textarea
3. Save
4. Users see new content immediately
```

### Add Knowledge to Existing Lesson:

```
1. Lesson đã có (có quiz)
2. Edit lesson
3. Thêm PDF URL hoặc HTML Content
4. Save
5. Tab "Lý thuyết" giờ có nội dung!
```

---

## 📊 Features

### PDF Viewer:
- ✅ Zoom: 50% - 150%
- ✅ Download button
- ✅ Full-screen capable
- ✅ Mobile responsive
- ✅ Dictionary integration (double-click)

### HTML Viewer:
- ✅ Rich text formatting (Tailwind prose)
- ✅ Zoom: 50% - 150% (font-size scaling)
- ✅ Line height: 1.8 (easy reading)
- ✅ Dictionary integration (double-click)
- ✅ Mobile responsive

### Common Features:
- ✅ "✅ Đã học xong" checkbox
- ✅ "Làm quiz →" button (if quiz exists)
- ✅ "Bài tiếp →" button
- ✅ Progress tracking
- ✅ Streak update

---

## 🎯 Example Scenarios

### Scenario 1: Shinkanzen Master N1 Grammar

**Admin adds:**
```javascript
{
  id: 'lesson-1',
  title: 'Bài 1: Các loại từ - Danh từ',
  description: 'Phân loại và cách sử dụng danh từ trong tiếng Nhật',
  pdfUrl: '/pdfs/n1/shinkanzen/bunpou/lesson1-meishi.pdf'
}
```

**User sees:**
- PDF hiển thị với đầy đủ nội dung
- Có thể zoom, download
- Double-click tra từ "名詞"
- Tab "Quiz" để làm bài tập

### Scenario 2: Quick Grammar Note

**Admin adds:**
```javascript
{
  id: 'lesson-2',
  title: 'Bài 2: Trợ từ は vs が',
  content: `
    <div>
      <h2>Phân biệt は và が</h2>
      <table>
        <tr><th>は</th><th>が</th></tr>
        <tr><td>Chủ đề</td><td>Chủ ngữ</td></tr>
        <tr><td>私は学生です</td><td>誰が学生ですか</td></tr>
      </table>
    </div>
  `
}
```

**User sees:**
- HTML table hiển thị
- Clear comparison
- Easy to understand

---

## ⚠️ Troubleshooting

### PDF không hiển thị:

**Check:**
1. ✅ URL path đúng chưa? (có `/` đầu tiên)
2. ✅ File có tồn tại trong `public/pdfs/` không?
3. ✅ File name match chưa? (case-sensitive)
4. ✅ PDF có corrupted không?

**Solution:**
```
1. Mở tab "🔗 Xem trước PDF"
2. Nếu 404: Check path
3. Nếu không mở: Check file
4. Re-upload PDF nếu cần
```

### HTML không hiển thị đúng:

**Check:**
1. ✅ HTML syntax đúng chưa?
2. ✅ Có closing tags chưa?
3. ✅ Không dùng `<script>` (bị filter)

**Solution:**
```
1. Validate HTML online
2. Fix syntax errors
3. Use simple tags
4. Test in preview
```

---

## 🚀 Quick Start

### Add First Lesson with PDF:

```
1. Admin Panel → Content Management
2. Level: N1
3. Book: Shinkanzen Master N1 Bunpou
4. Chapter: Chapter 1
5. Click "➕ Add Lesson"
6. Fill:
   - ID: lesson-1
   - Title: Bài 1: Danh từ
   - PDF URL: /pdfs/n1/shinkanzen/bunpou/lesson1.pdf
7. Save
8. Done! User can now see PDF in Lesson Page
```

### Add Lesson with HTML:

```
1. Same steps 1-5
6. Fill:
   - ID: lesson-2
   - Title: Bài 2: Trợ từ
   - HTML Content:
     <div>
       <h2>Trợ từ cơ bản</h2>
       <p>Danh sách trợ từ...</p>
     </div>
7. Save
8. Done! User can now see HTML content
```

---

## 📈 Workflow

### Complete Workflow:

```
Admin:
1. Create Series
2. Create Book
3. Create Chapter
4. Create Lesson (with PDF/HTML) ← NEW!
5. Add Quiz to Lesson
6. Publish

User:
1. Select Level
2. Select Book
3. Select Chapter
4. Open Lesson
5. Read Theory (PDF/HTML) ← NEW!
6. Do Quiz
7. Complete lesson
```

---

**Status**: ✅ COMPLETE  
**Version**: 2.0  
**Impact**: Admin can now add theory content easily  
**User Experience**: Rich learning materials available

