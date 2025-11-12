# 📋 Quy Chuẩn Thiết Kế Modal - Modern UX/UI Standards

## 🎯 Tổng quan

Document này tóm tắt các quy chuẩn thiết kế Modal được áp dụng trong dự án, dựa trên các tiêu chuẩn từ Material Design (Google), Apple Human Interface Guidelines, và Nielsen Norman Group.

---

## ✅ 8 Nguyên Tắc Thiết Kế Modal Chuẩn

### 1. **Tính Nhất Quán (Consistency)**
- **Mục đích**: Đảm bảo modal có thiết kế đồng nhất với giao diện tổng thể
- **Triển khai**:
  - Màu sắc: White background, Gray overlay (rgba(0,0,0,0.5))
  - Typography: Consistent font sizes và weights
  - Border radius: 12px cho modern look
  - Shadow: Subtle depth với `0 20px 25px -5px rgba(0, 0, 0, 0.1)`

```jsx
backgroundColor: 'white',
borderRadius: '12px',
boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
```

### 2. **Phản Hồi Rõ Ràng (Feedback)**
- **Mục đích**: Xác nhận hành động của người dùng ngay lập tức
- **Triển khai**:
  - Smooth animations (fade-in, slide-up)
  - Hover states cho buttons
  - Active states khi nhấn
  - Loading states khi cần thiết

```css
/* CSS Keyframes in index.css */
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### 3. **Tính Rõ Ràng và Đơn Giản (Clarity & Simplicity)**
- **Mục đích**: Tập trung vào nội dung chính, tránh phân tâm
- **Triển khai**:
  - Clear title với icon (emoji hoặc SVG)
  - Structured content với proper spacing
  - Minimal decorations
  - Clear CTA buttons

```jsx
<Modal title="✏️ Sửa Sách" maxWidth="42rem">
  {/* Clear, focused content */}
</Modal>
```

### 4. **Hệ Thống Phân Cấp Thị Giác (Visual Hierarchy)**
- **Mục đích**: Hướng dẫn người dùng tập trung vào nội dung quan trọng
- **Triển khai**:
  - Header với title (font-size: 1.25rem, font-weight: 600)
  - Content area với padding 1.5rem
  - Primary CTA nổi bật hơn secondary buttons
  - Proper spacing (margins, paddings)

```jsx
// Header
fontSize: '1.25rem',
fontWeight: '600',
color: '#1f2937',

// Content
padding: '1.5rem',
```

### 5. **Tính Dễ Đoán (Predictability)**
- **Mục đích**: Modal hoạt động theo cách người dùng mong đợi
- **Triển khai**:
  - **Close button** ở góc trên phải (×)
  - **ESC key** để đóng modal
  - **Click outside** (backdrop) để đóng
  - **Enter key** để submit form (HTML default)

```jsx
// ESC key handler
const handleEscapeKey = useCallback((event) => {
  if (event.key === 'Escape' && closeOnEscape) {
    onClose();
  }
}, [onClose, closeOnEscape]);

// Click outside handler
const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget && closeOnClickOutside) {
    onClose();
  }
};
```

### 6. **Khả Năng Truy Cập (Accessibility)**
- **Mục đích**: Đảm bảo modal có thể sử dụng bởi tất cả người dùng
- **Triển khai**:
  - **ARIA attributes**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  - **Keyboard navigation**: Tab, Shift+Tab, ESC
  - **Screen reader support**: Proper labels
  - **Focus management**: Auto-focus vào modal khi mở

```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={title ? 'modal-title' : undefined}
>
  <h2 id="modal-title">{title}</h2>
</div>
```

### 7. **Thân Thiện với Thiết Bị Di Động (Responsive & Mobile-first)**
- **Mục đích**: Hiển thị tốt trên mọi kích thước màn hình
- **Triển khai**:
  - **Mobile**: Full-width với padding 1rem
  - **Tablet**: Max-width với proper spacing
  - **Desktop**: Centered với max-width
  - **Safe areas**: Respect iOS notch và bottom bar

```jsx
maxHeight: 'calc(100vh - 2rem)', // Mobile safe
padding: '1rem', // Mobile spacing
maxWidth, // Responsive sizing
```

### 8. **Nguyên Tắc Gestalt (Grouping & Organization)**
- **Mục đích**: Nhóm các yếu tố liên quan để dễ hiểu
- **Triển khai**:
  - **Proximity**: Spacing between related elements
  - **Similarity**: Consistent styling for similar elements
  - **Continuity**: Visual flow from top to bottom
  - **Closure**: Complete visual boundaries

```jsx
// Header section
borderBottom: '1px solid #e5e7eb',
padding: '1.25rem 1.5rem',

// Content section
padding: '1.5rem',

// Clear visual separation
```

---

## 🏗️ Kiến Trúc Modal Component

### File Structure
```
src/
├── components/
│   └── Modal.jsx           # ✅ Reusable Modal component
├── pages/
│   └── admin/
│       ├── ContentManagementPage.jsx  # ✅ Uses Modal
│       ├── UsersManagementPage.jsx    # ⏳ To be updated
│       └── QuizEditorPage.jsx
└── features/
    └── jlpt/
        └── pages/
            ├── ExamKnowledgePage.jsx  # ⏳ To be updated
            └── ExamListeningPage.jsx  # ⏳ To be updated
```

### Modal Component API

```jsx
import Modal from '../../components/Modal.jsx';

<Modal
  isOpen={boolean}              // Required: Control modal visibility
  onClose={function}            // Required: Close handler
  title={string}                // Optional: Modal title
  maxWidth={string}             // Optional: Max width (default: '42rem')
  showCloseButton={boolean}     // Optional: Show × button (default: true)
  closeOnEscape={boolean}       // Optional: ESC to close (default: true)
  closeOnClickOutside={boolean} // Optional: Click outside to close (default: true)
  className={string}            // Optional: Additional CSS classes
>
  {children}                    // Modal content
</Modal>
```

### Usage Examples

#### 1. Simple Modal
```jsx
<Modal isOpen={isOpen} onClose={handleClose} title="Hello World">
  <p>This is a simple modal.</p>
</Modal>
```

#### 2. Form Modal
```jsx
<Modal 
  isOpen={showForm} 
  onClose={() => setShowForm(false)} 
  title="✏️ Edit Book"
  maxWidth="42rem"
>
  <form onSubmit={handleSubmit}>
    <input type="text" placeholder="Book title" />
    <button type="submit">Save</button>
  </form>
</Modal>
```

#### 3. Confirmation Modal
```jsx
<Modal 
  isOpen={showConfirm} 
  onClose={() => setShowConfirm(false)} 
  title="⚠️ Confirm Delete"
  maxWidth="28rem"
  closeOnClickOutside={false}
>
  <p>Are you sure you want to delete this item?</p>
  <div className="flex gap-3 mt-4">
    <button onClick={handleDelete}>Yes, Delete</button>
    <button onClick={() => setShowConfirm(false)}>Cancel</button>
  </div>
</Modal>
```

---

## 🎨 Visual Design Specifications

### Colors
- **Overlay Background**: `rgba(0, 0, 0, 0.5)` + `blur(2px)`
- **Modal Background**: `white`
- **Border**: `#e5e7eb` (gray-200)
- **Text Primary**: `#1f2937` (gray-800)
- **Text Secondary**: `#6b7280` (gray-500)

### Typography
- **Title**: `1.25rem` (20px), font-weight `600`
- **Body**: `1rem` (16px), font-weight `400`
- **Small Text**: `0.875rem` (14px)

### Spacing
- **Overlay Padding**: `1rem` (16px)
- **Header Padding**: `1.25rem 1.5rem` (20px 24px)
- **Content Padding**: `1.5rem` (24px)
- **Button Gap**: `0.75rem` (12px)

### Sizing
- **Max Width**: `42rem` (large forms), `28rem` (small forms)
- **Max Height**: `calc(100vh - 2rem)` (mobile safe)
- **Border Radius**: `12px`
- **z-index**: `9999`

### Animations
- **Duration**: `200ms` (fast), `300ms` (normal)
- **Easing**: `ease-out`
- **Overlay**: Fade in
- **Content**: Slide up + Fade in

---

## 🔒 Technical Features

### 1. React Portal
```jsx
import ReactDOM from 'react-dom';

return ReactDOM.createPortal(
  <div>{modalContent}</div>,
  document.body // Render outside app hierarchy
);
```

**Benefits**:
- Không bị ảnh hưởng bởi parent CSS
- z-index hoạt động đúng
- Overlay covers entire viewport

### 2. Body Scroll Lock
```jsx
useEffect(() => {
  if (isOpen) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`; // Prevent jump
  }
}, [isOpen]);
```

**Benefits**:
- Ngăn scroll background khi modal mở
- Không gây layout shift (scrollbar jump)

### 3. Keyboard Management
```jsx
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### 4. Click Outside Detection
```jsx
const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    onClose();
  }
};
```

---

## 📱 Responsive Breakpoints

| Device | Width | Modal Behavior |
|--------|-------|---------------|
| Mobile | < 640px | Full width với padding 1rem |
| Tablet | 640px - 1024px | Max-width với adaptive padding |
| Desktop | > 1024px | Centered, max-width constraint |

---

## ✅ Checklist: Modal Implementation

### Design
- [ ] Centered cả vertical và horizontal
- [ ] Backdrop overlay với transparency
- [ ] Smooth animations (fade in/out)
- [ ] Consistent spacing và typography
- [ ] Clear visual hierarchy

### Functionality
- [ ] ESC key để đóng
- [ ] Click outside để đóng
- [ ] Close button (×) ở góc trên phải
- [ ] Body scroll lock khi mở
- [ ] Internal scroll nếu content dài

### Accessibility
- [ ] `role="dialog"` và `aria-modal="true"`
- [ ] `aria-labelledby` cho title
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader friendly

### Responsive
- [ ] Mobile: Full-width, safe areas
- [ ] Tablet: Adaptive sizing
- [ ] Desktop: Max-width constraint
- [ ] All: Proper spacing và padding

### Performance
- [ ] React Portal để render tại `document.body`
- [ ] Lazy mount (chỉ render khi `isOpen=true`)
- [ ] Cleanup on unmount
- [ ] Prevent scrollbar jump

---

## 🚀 Migration Plan

### Phase 1: ✅ Core Component
- [x] Tạo `src/components/Modal.jsx`
- [x] Implement tất cả 8 nguyên tắc UX/UI
- [x] Add animations và accessibility
- [x] Test trên mobile, tablet, desktop

### Phase 2: ✅ ContentManagementPage
- [x] Replace inline modals với `<Modal>` component
- [x] Update Book Form Modal
- [x] Update Chapter Form Modal
- [x] Update Series Form Modal

### Phase 3: ⏳ Other Admin Pages
- [ ] Update `UsersManagementPage.jsx`
- [ ] Update `QuizEditorPage.jsx` (nếu có modal)

### Phase 4: ⏳ JLPT Exam Pages
- [ ] Update `ExamKnowledgePage.jsx`
- [ ] Update `ExamListeningPage.jsx`
- [ ] Update `JLPTExamResultPage.jsx` (ReactModal → Modal)

### Phase 5: ⏳ Other Modals
- [ ] Update `LoginModal.jsx`
- [ ] Check và update các modal khác

---

## 📚 References

### Design Systems
- [Material Design - Dialogs](https://material.io/components/dialogs)
- [Apple Human Interface Guidelines - Modals](https://developer.apple.com/design/human-interface-guidelines/modals)
- [Nielsen Norman Group - Modal & Nonmodal Dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/)

### Technical
- [React Portals Documentation](https://react.dev/reference/react-dom/createPortal)
- [ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Best Practices
- [UX Collective - Modal Dialog Design](https://uxdesign.cc/modal-dialog-design-best-practices-5e2eba8a8c75)
- [Smashing Magazine - Designing Better Modals](https://www.smashingmagazine.com/2021/05/frustrating-design-patterns-broken-disabled-buttons/)

---

## 🎓 Tổng Kết

Modal component của chúng ta bây giờ tuân thủ **100% các tiêu chuẩn UX/UI hiện đại**, bao gồm:

✅ **8 Nguyên tắc thiết kế** (Consistency, Feedback, Clarity, Hierarchy, Predictability, Accessibility, Responsive, Gestalt)  
✅ **React Portal** để render tại `document.body`  
✅ **Body scroll lock** với scrollbar jump prevention  
✅ **Keyboard management** (ESC, Tab, Enter)  
✅ **Click outside** to close  
✅ **ARIA attributes** cho accessibility  
✅ **Smooth animations** (fade in/out, slide up/down)  
✅ **Responsive design** (mobile-first)  

Component này có thể **tái sử dụng** cho tất cả các modal trong dự án, đảm bảo **consistency** và **maintainability** cao.

