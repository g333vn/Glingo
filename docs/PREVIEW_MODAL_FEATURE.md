# Preview Modal với Copy, Print, Filter/Sort và Keyboard Navigation

## Tổng quan

Tính năng Preview Modal cho phép người dùng xem trước tất cả câu hỏi trong một section/quiz dưới dạng modal overlay, với các tính năng nâng cao như copy to clipboard, in preview, lọc/sắp xếp câu hỏi, highlight câu hỏi chưa hoàn chỉnh, và điều hướng bằng bàn phím. Tính năng này được triển khai trong **Quiz Editor** và **Exam Management** để cải thiện trải nghiệm người dùng khi xem và quản lý câu hỏi.

## Vấn đề ban đầu

Trước đây, preview được hiển thị inline trong thanh actions sidebar, gây ra các vấn đề:
- Thanh actions quá chật, preview hiển thị ở dưới không rõ ràng
- Nếu preview nổi lên trên sẽ che khuất cột actions
- Khó xem và quản lý nhiều câu hỏi cùng lúc

## Giải pháp

Chuyển preview sang modal overlay với:
- **Modal overlay** hiển thị toàn màn hình, không che khuất sidebar
- **Responsive positioning** tự động điều chỉnh theo kích thước container
- **Dynamic resizing** theo dõi thay đổi kích thước container real-time
- **Z-index management** đảm bảo modal luôn hiển thị trên cùng

## Các thành phần chính

### 1. Preview Modal Component
**Files:** 
- `src/pages/admin/QuizEditorPage.jsx`
- `src/pages/admin/ExamManagementPage.jsx`

#### Tính năng chính:

##### 1.1. Modal Display
- Modal overlay với backdrop mờ
- Hiển thị tất cả câu hỏi trong section/quiz
- Responsive và tự động điều chỉnh theo container
- Đóng bằng nút "Đóng" hoặc phím ESC

##### 1.2. Copy to Clipboard
- **Copy từng câu hỏi**: Nút "📋 Copy" trên mỗi câu hỏi
- **Copy tất cả**: Nút "📋 Copy All" ở header
- Format text dễ đọc khi paste
- Fallback cho trình duyệt cũ (sử dụng `document.execCommand`)

##### 1.3. Print Preview
- Nút "🖨️ Print" ở header
- Mở cửa sổ in với format đẹp
- Hiển thị đầy đủ thông tin: câu hỏi, đáp án, đáp án đúng, giải thích
- Highlight câu hỏi chưa hoàn chỉnh trong bản in
- Tự động đóng sau khi in

##### 1.4. Filter & Sort
- **Filter options**:
  - Tất cả
  - Hoàn chỉnh (có đủ question, options, correct answer)
  - Chưa hoàn chỉnh
- **Sort options**:
  - Theo ID (tăng dần)
  - Theo trạng thái (chưa hoàn chỉnh trước)
- Hiển thị số lượng câu hỏi sau filter

##### 1.5. Highlight Incomplete Questions
- Nền vàng cho câu hỏi chưa hoàn chỉnh
- Badge "⚠️ Chưa hoàn chỉnh" ở header câu hỏi
- Cảnh báo đỏ nếu chưa chọn đáp án đúng
- Hiển thị số lượng câu hỏi chưa hoàn chỉnh

##### 1.6. Keyboard Navigation
- **↑/↓ Arrow keys**: Scroll 100px lên/xuống
- **Page Up/Down**: Scroll 500px lên/xuống
- **Home**: Scroll lên đầu
- **End**: Scroll xuống cuối
- **ESC**: Đóng modal

## Cấu trúc Code

### State Variables

```javascript
// Modal state
const [showPreview, setShowPreview] = useState(false);

// Filter & Sort state
const [previewFilter, setPreviewFilter] = useState('all'); // 'all', 'complete', 'incomplete'
const [previewSortBy, setPreviewSortBy] = useState('id'); // 'id', 'status'

// Ref for keyboard navigation
const previewContentRef = useRef(null);

// Container bounds for responsive positioning
const [containerBounds, setContainerBounds] = useState(null);
```

### Helper Functions

#### 1. Check Question Completeness

```javascript
const isQuestionComplete = (q) => {
  const hasQuestion = q.question && q.question.trim();
  const options = Array.isArray(q.options) 
    ? q.options 
    : (q.options && typeof q.options === 'object' 
        ? Object.values(q.options) 
        : []);
  const allOptionsValid = options.length >= 4 && options.every(opt => {
    const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || '');
    return optText && optText.trim();
  });
  const hasCorrect = q.correctAnswer !== null && q.correctAnswer !== undefined;
  return hasQuestion && allOptionsValid && hasCorrect;
};
```

#### 2. Get Filtered and Sorted Questions

```javascript
const getFilteredAndSortedQuestions = () => {
  if (!selectedSection || !selectedSection.questions) return [];
  
  let filtered = [...selectedSection.questions];

  // Apply filter
  if (previewFilter === 'complete') {
    filtered = filtered.filter(q => isQuestionComplete(q));
  } else if (previewFilter === 'incomplete') {
    filtered = filtered.filter(q => !isQuestionComplete(q));
  }

  // Apply sort
  if (previewSortBy === 'id') {
    filtered.sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
      return idA - idB;
    });
  } else if (previewSortBy === 'status') {
    filtered.sort((a, b) => {
      const aComplete = isQuestionComplete(a);
      const bComplete = isQuestionComplete(b);
      if (aComplete === bComplete) {
        const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
        const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
        return idA - idB;
      }
      return aComplete ? 1 : -1; // Incomplete first
    });
  }

  return filtered;
};
```

#### 3. Copy Question to Clipboard

```javascript
const handleCopyQuestionPreview = async (question) => {
  const options = Array.isArray(question.options) 
    ? question.options 
    : (question.options && typeof question.options === 'object' 
        ? Object.values(question.options) 
        : []);
  
  const correctAnswer = typeof question.correctAnswer === 'number' 
    ? String.fromCharCode(65 + question.correctAnswer)
    : (question.correctAnswer || 'N/A');

  const questionText = `
Câu hỏi ${question.id || question.number || 'N/A'}:
${question.question || '(Chưa nhập)'}

Đáp án:
${options.map((opt, idx) => {
  const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || '');
  return `${String.fromCharCode(65 + idx)}. ${optText || '(Chưa nhập)'}`;
}).join('\n')}

Đáp án đúng: ${correctAnswer}
${question.explanation ? `\nGiải thích:\n${question.explanation}` : ''}
  `.trim();

  try {
    await navigator.clipboard.writeText(questionText);
    alert(`✅ Đã copy câu hỏi ${question.id || question.number || 'N/A'} vào clipboard!`);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = questionText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert(`✅ Đã copy câu hỏi ${question.id || question.number || 'N/A'} vào clipboard!`);
  }
};
```

#### 4. Copy All Questions

```javascript
const handleCopyAllQuestions = async () => {
  if (!selectedSection || !selectedSection.questions || selectedSection.questions.length === 0) {
    alert('⚠️ Không có câu hỏi nào để copy!');
    return;
  }

  const allQuestionsText = selectedSection.questions.map(q => {
    // Format each question...
  }).join('\n\n');

  try {
    await navigator.clipboard.writeText(allQuestionsText);
    alert(`✅ Đã copy tất cả ${selectedSection.questions.length} câu hỏi vào clipboard!`);
  } catch (err) {
    // Fallback implementation...
  }
};
```

#### 5. Print Preview

```javascript
const handlePrintPreview = () => {
  if (!selectedSection || !selectedSection.questions || selectedSection.questions.length === 0) {
    alert('⚠️ Không có câu hỏi nào để in!');
    return;
  }

  const printWindow = window.open('', '_blank');
  const questions = getFilteredAndSortedQuestions();
  
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Preview Quiz - ${selectedSection.title || selectedSection.id || 'Section'}</title>
        <style>
          /* Print styles... */
        </style>
      </head>
      <body>
        <!-- Print content with questions... -->
      </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
```

### Dynamic Container Resizing

Modal tự động điều chỉnh theo kích thước container cha sử dụng:

1. **ResizeObserver**: Theo dõi thay đổi kích thước container
2. **MutationObserver**: Theo dõi thay đổi DOM
3. **setInterval**: Fallback để kiểm tra định kỳ
4. **getBoundingClientRect()**: Lấy vị trí và kích thước chính xác

```javascript
useEffect(() => {
  if (!showPreview) return;

  const updateContainerBounds = () => {
    const container = document.querySelector('.main-content-container'); // Adjust selector
    if (container) {
      const rect = container.getBoundingClientRect();
      setContainerBounds({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  // Initial update
  updateContainerBounds();

  // ResizeObserver
  const resizeObserver = new ResizeObserver(updateContainerBounds);
  const container = document.querySelector('.main-content-container');
  if (container) {
    resizeObserver.observe(container);
  }

  // MutationObserver
  const mutationObserver = new MutationObserver(updateContainerBounds);
  if (container) {
    mutationObserver.observe(container, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    });
  }

  // Fallback interval
  const interval = setInterval(updateContainerBounds, 100);

  return () => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    clearInterval(interval);
  };
}, [showPreview]);
```

### Keyboard Navigation

```javascript
useEffect(() => {
  if (!showPreview) return;

  const handleKeyDown = (e) => {
    if (!previewContentRef.current) return;

    // Arrow keys for scrolling
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      previewContentRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      previewContentRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      previewContentRef.current.scrollBy({ top: 500, behavior: 'smooth' });
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      previewContentRef.current.scrollBy({ top: -500, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      previewContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      previewContentRef.current.scrollTo({ top: previewContentRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [showPreview]);
```

### ESC Key to Close

```javascript
useEffect(() => {
  if (!showPreview) return;

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      setShowPreview(false);
    }
  };

  document.addEventListener('keydown', handleEsc);
  return () => document.removeEventListener('keydown', handleEsc);
}, [showPreview]);
```

## UI Structure

### Modal Header
```jsx
<div className="flex justify-between items-center p-4 bg-blue-600 text-white border-b-[3px] border-black">
  <h2 className="text-lg sm:text-xl font-black">
    👁️ Preview: {selectedSection?.title || selectedSection?.id || 'Section'}
  </h2>
  <div className="flex items-center gap-2">
    <button onClick={handleCopyAllQuestions}>📋 Copy All</button>
    <button onClick={handlePrintPreview}>🖨️ Print</button>
    <button onClick={() => setShowPreview(false)}>✕ Đóng</button>
  </div>
</div>
```

### Filter & Sort Controls
```jsx
<div className="p-4 bg-gray-100 border-b-[2px] border-gray-300 flex flex-wrap items-center gap-3">
  <select value={previewFilter} onChange={(e) => setPreviewFilter(e.target.value)}>
    <option value="all">Tất cả</option>
    <option value="complete">Hoàn chỉnh</option>
    <option value="incomplete">Chưa hoàn chỉnh</option>
  </select>
  
  <select value={previewSortBy} onChange={(e) => setPreviewSortBy(e.target.value)}>
    <option value="id">Theo ID</option>
    <option value="status">Theo trạng thái</option>
  </select>
  
  <span className="text-sm text-gray-600">
    Hiển thị: {getFilteredAndSortedQuestions().length} / {selectedSection?.questions?.length || 0} câu hỏi
  </span>
</div>
```

### Question Card
```jsx
<div className={`p-4 border-2 rounded-lg mb-4 ${
  !isQuestionComplete(q) ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-300'
}`}>
  <div className="flex justify-between items-start mb-2">
    <h3 className="font-bold text-lg">
      Câu hỏi {q.id || q.number || idx + 1}
      {!isQuestionComplete(q) && (
        <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs">
          ⚠️ Chưa hoàn chỉnh
        </span>
      )}
    </h3>
    <button onClick={() => handleCopyQuestionPreview(q)}>📋 Copy</button>
  </div>
  
  {/* Question text, options, correct answer, explanation */}
</div>
```

### Modal Footer
```jsx
<div className="p-3 bg-gray-100 border-t-[2px] border-gray-300 text-xs text-gray-600 text-center">
  💡 Sử dụng phím ↑↓ để scroll, Page Up/Down để scroll nhanh, Home/End để lên đầu/xuống cuối, ESC để đóng
</div>
```

## Responsive Positioning

Modal được định vị và kích thước dựa trên container bounds:

```jsx
<div
  style={{
    position: 'fixed',
    top: containerBounds ? `${containerBounds.top + 20}px` : '50%',
    left: containerBounds ? `${containerBounds.left + 20}px` : '50%',
    width: containerBounds ? `${containerBounds.width - 40}px` : '90vw',
    maxWidth: containerBounds ? `${Math.min(containerBounds.width - 40, 900)}px` : '900px',
    maxHeight: containerBounds ? `${containerBounds.height - 40}px` : '85vh',
    transform: containerBounds ? 'none' : 'translate(-50%, -50%)',
    margin: containerBounds ? '0' : '0 auto',
    zIndex: 100000
  }}
>
  {/* Modal content */}
</div>
```

## Styling

### Modal Backdrop
- `z-index: 99999`
- `background-color: rgba(0, 0, 0, 0.5)`
- `backdrop-filter: blur(2px)`

### Modal Content
- `z-index: 100000`
- `border-[3px] border-black`
- `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- `rounded-lg`
- `bg-white`

### Incomplete Question Highlight
- `bg-yellow-100`
- `border-yellow-400`
- Badge: `bg-yellow-400 text-yellow-900`

### Correct Answer Indicator
- Nếu chưa chọn: `bg-red-100 border-red-400`
- Nếu đã chọn: `bg-green-100 border-green-400`

## Usage

### Mở Preview
```jsx
<button onClick={() => setShowPreview(true)}>
  👁️ View Preview
</button>
```

### Đóng Preview
- Click nút "✕ Đóng"
- Nhấn phím ESC
- Click vào backdrop (optional)

### Copy Câu Hỏi
1. Click nút "📋 Copy" trên câu hỏi cần copy
2. Hoặc click "📋 Copy All" để copy tất cả
3. Paste vào nơi cần sử dụng

### In Preview
1. Click nút "🖨️ Print"
2. Cửa sổ in sẽ mở với format đẹp
3. Chọn máy in và in

### Filter & Sort
1. Chọn filter từ dropdown (Tất cả/Hoàn chỉnh/Chưa hoàn chỉnh)
2. Chọn sort từ dropdown (Theo ID/Theo trạng thái)
3. Preview sẽ tự động cập nhật

### Keyboard Navigation
- **↑**: Scroll lên 100px
- **↓**: Scroll xuống 100px
- **Page Up**: Scroll lên 500px
- **Page Down**: Scroll xuống 500px
- **Home**: Lên đầu danh sách
- **End**: Xuống cuối danh sách
- **ESC**: Đóng modal

## Browser Compatibility

- **Modern browsers**: Sử dụng `navigator.clipboard.writeText()`
- **Older browsers**: Fallback sử dụng `document.execCommand('copy')`
- **ResizeObserver**: Cần polyfill cho IE11 (nếu cần hỗ trợ)

## Performance Considerations

1. **Lazy rendering**: Chỉ render modal khi `showPreview === true`
2. **Memoization**: Có thể sử dụng `useMemo` cho `getFilteredAndSortedQuestions()` nếu cần
3. **Event cleanup**: Luôn cleanup event listeners trong `useEffect` return
4. **Observer cleanup**: Disconnect observers khi component unmount

## Future Enhancements

1. **Export to PDF**: Thêm tính năng export preview sang PDF
2. **Search**: Thêm search box để tìm câu hỏi theo keyword
3. **Bulk actions**: Chọn nhiều câu hỏi và thực hiện actions hàng loạt
4. **Custom print styles**: Cho phép user tùy chỉnh style khi in
5. **Dark mode**: Hỗ trợ dark mode cho modal
6. **Accessibility**: Cải thiện accessibility với ARIA labels và keyboard navigation tốt hơn

## Troubleshooting

### Modal không hiển thị đúng vị trí
- Kiểm tra selector của container trong `updateContainerBounds()`
- Đảm bảo container có `position: relative` hoặc `position: absolute`
- Kiểm tra z-index của modal và backdrop

### Copy không hoạt động
- Kiểm tra browser có hỗ trợ Clipboard API không
- Fallback sẽ tự động sử dụng `document.execCommand` nếu cần
- Đảm bảo user đã cho phép clipboard access

### Keyboard navigation không hoạt động
- Kiểm tra `previewContentRef` đã được gán đúng chưa
- Đảm bảo modal content có `overflow-y: auto` hoặc `scroll`
- Kiểm tra event listener đã được add đúng chưa

### Filter/Sort không cập nhật
- Kiểm tra `getFilteredAndSortedQuestions()` có được gọi lại khi state thay đổi
- Đảm bảo `previewFilter` và `previewSortBy` state được update đúng

## Related Files

- `src/pages/admin/QuizEditorPage.jsx` - Quiz Editor với preview modal
- `src/pages/admin/ExamManagementPage.jsx` - Exam Management với preview modal

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Modal overlay thay thế inline preview
- ✅ Copy to clipboard (từng câu và tất cả)
- ✅ Print preview
- ✅ Filter & Sort
- ✅ Highlight incomplete questions
- ✅ Keyboard navigation
- ✅ Responsive positioning và dynamic resizing
- ✅ ESC key to close

