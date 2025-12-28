# Rich Text Editor với Auto-Format từ Word/Google Docs

## Tổng quan

Hệ thống hỗ trợ rich text editing với khả năng tự động format khi paste từ Word/Google Docs, giữ nguyên line breaks và formatting. Chức năng này được sử dụng trong các box nhập liệu "Câu hỏi" và "Giải thích" trong Quiz Editor và Exam Management.

## Các thành phần chính

### 1. ContentEditable Component
**File:** `src/components/ContentEditable.jsx`

Component thay thế textarea cho explanation field, cho phép hiển thị format HTML trực tiếp.

#### Tính năng:
- Hiển thị format HTML trực tiếp (không thấy raw HTML tags)
- Hỗ trợ paste từ Word/Google Docs với auto-format
- Hỗ trợ paste ảnh (Ctrl+V) với auto-upload
- Xử lý IME input (Japanese/Chinese)
- Auto-resize theo nội dung

#### Props:
```javascript
{
  value: string,              // HTML content
  onChange: Function,         // Callback khi content thay đổi
  onPaste: Function,         // Custom paste handler (optional)
  placeholder: string,       // Placeholder text
  className: string,         // CSS classes
  style: Object,             // Inline styles
  minHeight: number,         // Minimum height (default: 100)
  field: string             // Field name (default: 'explanation')
}
```

#### Usage:
```jsx
<ContentEditable
  value={explanation}
  onChange={(newValue) => setExplanation(newValue)}
  onPaste={async (e, file, html, plainText) => {
    // Custom paste handling
    return processedHTML;
  }}
  placeholder="Nhập giải thích..."
  className="w-full px-4 py-2 border-2 rounded-lg"
/>
```

### 2. Rich Text Editor Utils
**File:** `src/utils/richTextEditorUtils.js`

Các utility functions để xử lý HTML từ clipboard.

#### Functions:

##### `processPastedHTML(html, plainText)`
Xử lý HTML từ clipboard, clean up và convert formatting.

**Xử lý:**
- Convert `<b>` → `<strong>`
- Convert `<i>` → `<em>`
- Convert `<p>` → content + `<br/>` (preserve line breaks)
- Convert `<div>` → content + `<br/>` (nếu là line break)
- Xóa inline styles không cần thiết
- Xử lý các tag đặc biệt của Microsoft Office
- Normalize whitespace (xử lý `&nbsp;`)
- Detect và convert furigana: `渋谷(しぶや)` → `<ruby>渋谷<rt>しぶや</rt></ruby>`

**Parameters:**
- `html` (string): HTML từ clipboard
- `plainText` (string, optional): Plain text từ clipboard (fallback)

**Returns:**
- `string`: Cleaned HTML với format đúng

##### `processPlainTextWithNewlines(text)`
Convert plain text với newlines thành HTML với `<br/>` tags.

**Parameters:**
- `text` (string): Plain text với newlines

**Returns:**
- `string`: HTML với `<br/>` tags

## Cách hoạt động

### Flow xử lý paste:

```
User paste (Ctrl+V)
    ↓
ContentEditable.handlePaste()
    ↓
Check clipboard items:
    ├─ Image? → Upload và insert <img> tag
    └─ HTML/Text? → Process và insert
        ↓
    onPaste handler (nếu có)
        ↓
    processPastedHTML()
        ├─ Parse HTML
        ├─ Convert formatting
        ├─ Preserve line breaks
        └─ Return processed HTML
        ↓
    Insert vào ContentEditable tại cursor position
        ↓
    Trigger onChange → Update state
```

### Xử lý line breaks:

1. **Từ Word/Google Docs:**
   - Word/Google Docs tạo HTML với `<p>` tags cho mỗi paragraph
   - `processPastedHTML()` convert `<p>` thành content + `<br/>`
   - Mỗi paragraph được preserve với line break

2. **Từ Plain Text:**
   - Plain text có newlines (`\n`, `\r\n`)
   - `processPlainTextWithNewlines()` convert thành `<br/>` tags

3. **Hiển thị:**
   - CSS `white-space: pre-wrap` preserve line breaks
   - `<br/>` tags được render đúng cách

## CSS Styling

### Global CSS (`src/styles/index.css`)

```css
/* Ensure <br/> tags are always visible in preview panels */
.prose br {
  display: block !important;
  content: "" !important;
  margin-bottom: 0.5em !important;
  line-height: 1.75 !important;
}

/* Override prose white-space to preserve line breaks */
.prose[style*="white-space: pre-wrap"],
.prose.preserve-line-breaks {
  white-space: pre-wrap !important;
}
```

### Inline Styles

Tất cả các component hiển thị HTML cần có:
```javascript
style={{
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',  // Preserve line breaks
  lineHeight: '1.75'
}}
```

## Các component sử dụng

### Admin Components

1. **QuizEditorPage** (`src/pages/admin/QuizEditorPage.jsx`)
   - Explanation field: ContentEditable
   - Question field: Textarea với paste handler
   - Preview panels: Cả hai fields

2. **ExamManagementPage** (`src/pages/admin/ExamManagementPage.jsx`)
   - Explanation field: ContentEditable
   - Question field: Textarea với paste handler
   - Preview panels: Cả hai fields

### User View Components

1. **QuizPage** (`src/features/books/pages/QuizPage.jsx`)
   - Hiển thị question text và explanation

2. **ExamAnswersPage** (`src/features/jlpt/pages/ExamAnswersPage.jsx`)
   - Hiển thị question, passage, text, và explanation

3. **ExamKnowledgePage** (`src/features/jlpt/pages/ExamKnowledgePage.jsx`)
   - Hiển thị question, passage, và text

## Tính năng chi tiết

### 1. Auto-Format từ Word/Google Docs

**Input từ Word/Google Docs:**
```html
<p>Paragraph 1</p>
<p>Paragraph 2</p>
<p><b>Bold text</b></p>
```

**Output sau xử lý:**
```html
Paragraph 1<br/>
Paragraph 2<br/>
<strong>Bold text</strong>
```

### 2. Paste ảnh tự động

- User paste ảnh (Ctrl+V) vào ContentEditable
- Ảnh tự động upload lên Supabase
- Insert `<img>` tag vào vị trí cursor
- Hiển thị loading state trong quá trình upload

### 3. Furigana Support

Tự động detect và convert furigana pattern:
- Input: `渋谷(しぶや)`
- Output: `<ruby>渋谷<rt>しぶや</rt></ruby>`

### 4. Preview Panels

- Preview real-time khi nhập liệu
- Format hiển thị giống như sẽ hiển thị cho user
- Toggle preview bằng button 👁

## Best Practices

### 1. Khi sử dụng ContentEditable

```jsx
// ✅ Đúng: Có onPaste handler để xử lý custom
<ContentEditable
  value={value}
  onChange={setValue}
  onPaste={async (e, file, html, plainText) => {
    if (file) {
      // Handle image upload
      return imgTag;
    }
    if (html) {
      // Process HTML
      return processPastedHTML(html, plainText);
    }
    return null;
  }}
/>

// ❌ Sai: Không có onPaste handler
<ContentEditable
  value={value}
  onChange={setValue}
/>
```

### 2. Khi hiển thị HTML cho user

```jsx
// ✅ Đúng: Có whiteSpace: 'pre-wrap'
<div
  className="prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ __html: content }}
  style={{
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap'  // Preserve line breaks
  }}
/>

// ❌ Sai: Thiếu whiteSpace
<div
  className="prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ __html: content }}
/>
```

### 3. Xử lý paste trong textarea

```jsx
// ✅ Đúng: Có paste handler
<textarea
  onPaste={(e) => handlePaste(e, questionIndex, 'text')}
/>

// ❌ Sai: Không có paste handler
<textarea />
```

## Troubleshooting

### Vấn đề: Line breaks không hiển thị

**Nguyên nhân:**
- CSS của prose class đang override `white-space`
- Thiếu `whiteSpace: 'pre-wrap'` trong inline style

**Giải pháp:**
1. Thêm `whiteSpace: 'pre-wrap'` vào inline style
2. Đảm bảo CSS global đã được load
3. Hard refresh browser (Ctrl+Shift+R)

### Vấn đề: Format bị mất khi paste

**Nguyên nhân:**
- HTML từ clipboard không có format
- `processPastedHTML()` không xử lý đúng format

**Giải pháp:**
1. Kiểm tra HTML từ clipboard (console.log trong handlePaste)
2. Cải thiện logic trong `processPastedHTML()`
3. Fallback về plain text nếu HTML không có format

### Vấn đề: Ảnh không upload được

**Nguyên nhân:**
- File quá lớn (>5MB)
- Lỗi kết nối với Supabase
- Path generation lỗi

**Giải pháp:**
1. Kiểm tra file size trước khi upload
2. Kiểm tra error trong console
3. Kiểm tra Supabase configuration

## Testing

### Test Cases

1. **Paste từ Word:**
   - Paste text có format (bold, italic)
   - Paste text có line breaks
   - Paste text có furigana
   - Verify format được preserve

2. **Paste từ Google Docs:**
   - Paste text có format
   - Paste text có line breaks
   - Verify format được preserve

3. **Paste ảnh:**
   - Paste ảnh từ clipboard (Ctrl+V)
   - Verify ảnh được upload
   - Verify `<img>` tag được insert

4. **Paste plain text:**
   - Paste text có newlines
   - Verify newlines được convert thành `<br/>`

5. **Preview:**
   - Toggle preview trong editor
   - Verify format hiển thị đúng
   - Verify line breaks được preserve

6. **User view:**
   - Xem question/explanation trong user view
   - Verify format hiển thị đúng
   - Verify line breaks được preserve

## Future Improvements

1. **Rich Text Toolbar:**
   - Thêm các format options (underline, strikethrough, color)
   - Thêm list support (ul, ol)
   - Thêm table support

2. **Better Word/Google Docs Support:**
   - Xử lý tables từ Word
   - Xử lý lists tốt hơn
   - Xử lý nested formatting

3. **Image Handling:**
   - Drag & drop images
   - Image resizing trong editor
   - Image alignment options

4. **Performance:**
   - Lazy load ContentEditable
   - Debounce onChange handler
   - Optimize HTML processing

## Changelog

### Version 1.0 (Current)
- ✅ ContentEditable component cho explanation field
- ✅ Auto-format từ Word/Google Docs
- ✅ Auto-upload ảnh khi paste
- ✅ Preserve line breaks trong preview và user view
- ✅ Furigana support
- ✅ CSS global để ensure `<br/>` tags visible

## References

- ContentEditable API: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- Tailwind Typography (prose): https://tailwindcss.com/docs/typography-plugin

