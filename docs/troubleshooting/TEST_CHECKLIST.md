# 📋 DANH SÁCH TEST ĐẦY ĐỦ - E-LEARNING PLATFORM

## 🎯 TỔNG QUAN
Danh sách test toàn diện cho hệ thống e-learning học tiếng Nhật, bao gồm test hiển thị (UI) và chức năng (Functionality).

---

## 📱 1. TEST GIAO DIỆN & RESPONSIVE DESIGN

### 1.1. Layout & Navigation
- [ ] **Header Component**
  - [ ] Logo hiển thị đúng và có thể click về trang chủ
  - [ ] Menu desktop hiển thị đầy đủ: HOME, LEVEL, JLPT, ABOUT ME
  - [ ] Menu mobile (hamburger) hoạt động đúng trên màn hình nhỏ
  - [ ] Dropdown LEVEL (N1-N5) hiển thị khi hover/click
  - [ ] Dropdown JLPT (N1-N5) hiển thị khi hover/click
  - [ ] Active state của menu item được highlight đúng
  - [ ] Header sticky khi scroll
  - [ ] Header có glassmorphism effect khi scroll
  - [ ] User icon/button hiển thị đúng trạng thái (đã đăng nhập/chưa đăng nhập)
  - [ ] Admin Panel button chỉ hiển thị cho admin
  - [ ] Logout button hoạt động đúng

- [ ] **Footer Component**
  - [ ] Footer hiển thị ở cuối trang
  - [ ] Nội dung footer đúng format
  - [ ] Footer không che nội dung chính

- [ ] **Sidebar Component**
  - [ ] Sidebar hiển thị đúng trên desktop
  - [ ] Sidebar ẩn/hiện đúng trên mobile
  - [ ] Navigation links trong sidebar hoạt động

- [ ] **Breadcrumbs Component**
  - [ ] Breadcrumbs hiển thị đúng đường dẫn
  - [ ] Click breadcrumb điều hướng đúng
  - [ ] Breadcrumbs responsive trên mobile

### 1.2. Responsive Design
- [ ] **Mobile (< 640px)**
  - [ ] Tất cả trang hiển thị đúng trên mobile
  - [ ] Menu mobile hoạt động mượt
  - [ ] Text không bị tràn
  - [ ] Buttons có kích thước phù hợp để click
  - [ ] Images scale đúng
  - [ ] Forms input dễ sử dụng
  - [ ] Modals hiển thị fullscreen hoặc phù hợp

- [ ] **Tablet (640px - 1024px)**
  - [ ] Layout chuyển đổi mượt từ mobile sang tablet
  - [ ] Grid columns điều chỉnh đúng
  - [ ] Navigation vẫn dễ sử dụng

- [ ] **Desktop (> 1024px)**
  - [ ] Layout tận dụng không gian màn hình lớn
  - [ ] Sidebar và content hiển thị song song
  - [ ] Hover effects hoạt động đúng

### 1.3. Background & Styling
- [ ] Background image hiển thị đúng
- [ ] Background fixed/cover đúng
- [ ] Glassmorphism effects hoạt động
- [ ] Gradient colors hiển thị đúng
- [ ] Animations mượt mà
- [ ] Shadows và borders đúng style

---

## 🏠 2. TEST TRANG CHỦ (HomePage)

### 2.1. Hiển thị
- [ ] Logo hiển thị đúng
- [ ] Title "Learn Your Approach" hiển thị với gradient
- [ ] Subtitle và tagline hiển thị đúng
- [ ] 2 button chính: "Bắt đầu học ngay" và "Luyện đề JLPT"
- [ ] Button "My Story" hiển thị
- [ ] 4 feature cards hiển thị (JLPT Tests, LEVEL System, Tra từ nhanh, 24/7 Access)
- [ ] Japanese quote scroll hiển thị (desktop only)
- [ ] Decorative blobs/animation hiển thị

### 2.2. Chức năng
- [ ] Click "Bắt đầu học ngay" → điều hướng đến `/level`
- [ ] Click "Luyện đề JLPT" → điều hướng đến `/jlpt`
- [ ] Click "My Story" → điều hướng đến `/about`
- [ ] Hover effects trên buttons hoạt động
- [ ] Animations chạy mượt khi load trang

---

## 📚 3. TEST MODULE LEVEL (Học theo sách)

### 3.1. Trang Level Page (`/level`)
- [ ] Hiển thị danh sách 5 levels (N1-N5)
- [ ] Mỗi level có card với màu sắc riêng
- [ ] Click vào level → điều hướng đến `/level/{levelId}`
- [ ] Responsive layout đúng

### 3.2. Trang Level Detail (`/level/:levelId`)
- [ ] Hiển thị danh sách sách cho level đó (ví dụ: N1)
- [ ] Book cards hiển thị với hình ảnh và title
- [ ] Click vào book → điều hướng đến `/level/:levelId/:bookId`
- [ ] Breadcrumbs hiển thị đúng
- [ ] Sidebar hiển thị

### 3.3. Trang Book Detail (`/level/:levelId/:bookId`)
- [ ] Hiển thị thông tin sách
- [ ] Hiển thị danh sách chapters/lessons
- [ ] Chapter cards có pagination nếu nhiều
- [ ] Click vào chapter → điều hướng đến `/level/:levelId/:bookId/lesson/:lessonId`
- [ ] Load chapters từ IndexedDB/localStorage nếu có
- [ ] Fallback về static data nếu không có trong storage

### 3.4. Trang Quiz Page (`/level/:levelId/:bookId/lesson/:lessonId`)
- [ ] Hiển thị câu hỏi quiz
- [ ] Hiển thị đáp án (A, B, C, D)
- [ ] Cho phép chọn đáp án
- [ ] Button "Xem đáp án" hoạt động
- [ ] Hiển thị explanation sau khi chọn đáp án
- [ ] Button "Câu tiếp" hoạt động
- [ ] Progress bar hiển thị tiến độ
- [ ] Score tracking (correct/total)
- [ ] Kết thúc quiz hiển thị kết quả
- [ ] Button "Làm lại" reset quiz
- [ ] Dictionary double-click hoạt động (tra từ)
- [ ] Load quiz từ IndexedDB → JSON → static data (priority order)
- [ ] Loading state hiển thị khi đang load quiz

---

## 📝 4. TEST MODULE JLPT (Luyện thi)

### 4.1. Trang JLPT Page (`/jlpt`)
- [ ] Hiển thị danh sách 5 levels (N1-N5)
- [ ] Mỗi level có card với màu sắc riêng
- [ ] Click vào level → điều hướng đến `/jlpt/:levelId`
- [ ] Responsive layout đúng

### 4.2. Trang JLPT Level (`/jlpt/:levelId`)
- [ ] Hiển thị danh sách đề thi cho level đó
- [ ] Exam cards hiển thị với thông tin (tên đề, mô tả)
- [ ] Click vào exam → điều hướng đến `/jlpt/:levelId/:examId`
- [ ] Breadcrumbs hiển thị đúng

### 4.3. Trang Exam Detail (`/jlpt/:levelId/:examId`)
- [ ] Hiển thị thông tin đề thi
- [ ] Hiển thị 2 phần: "Kiến thức" và "Nghe hiểu"
- [ ] Button "Bắt đầu thi" cho mỗi phần
- [ ] Hiển thị thời gian và số câu hỏi
- [ ] Exam guard warning khi navigate away
- [ ] Click "Bắt đầu thi" → điều hướng đến trang thi tương ứng

### 4.4. Trang Exam Knowledge (`/jlpt/:levelId/:examId/knowledge`)
- [ ] Hiển thị countdown timer
- [ ] Timer đếm ngược đúng
- [ ] Timer cảnh báo khi còn < 5 phút (màu đỏ)
- [ ] Hiển thị câu hỏi hiện tại
- [ ] Hiển thị danh sách câu hỏi (question navigation)
- [ ] Cho phép chọn đáp án
- [ ] Lưu đáp án vào localStorage
- [ ] Load đáp án đã lưu khi quay lại
- [ ] Button "Nộp bài" hoạt động
- [ ] Warning modal nếu có câu chưa trả lời
- [ ] Submit exam → điều hướng đến trang kết quả
- [ ] Body scroll bị lock khi modal mở
- [ ] Exam guard ngăn navigate away

### 4.5. Trang Exam Listening (`/jlpt/:levelId/:examId/listening`)
- [ ] Tương tự Exam Knowledge
- [ ] Audio player hiển thị (nếu có)
- [ ] Audio play/pause hoạt động
- [ ] Timer riêng cho phần nghe

### 4.6. Trang Exam Result (`/jlpt/:levelId/:examId/result`)
- [ ] Hiển thị điểm số tổng
- [ ] Hiển thị điểm từng phần (Kiến thức, Nghe)
- [ ] Hiển thị số câu đúng/sai
- [ ] Hiển thị thời gian làm bài
- [ ] Button "Xem đáp án" → điều hướng đến `/jlpt/:levelId/:examId/answers`
- [ ] Button "Làm lại" → reset và quay về exam detail
- [ ] Meme/images hiển thị dựa trên điểm số

### 4.7. Trang Exam Answers (`/jlpt/:levelId/:examId/answers`)
- [ ] Hiển thị tất cả câu hỏi và đáp án
- [ ] Highlight câu trả lời của user
- [ ] Highlight đáp án đúng
- [ ] Hiển thị explanation cho mỗi câu
- [ ] Navigation giữa các câu hỏi
- [ ] Filter theo phần (Kiến thức/Nghe)

---

## 🔐 5. TEST AUTHENTICATION & AUTHORIZATION

### 5.1. Login
- [ ] Trang Login (`/login`) hiển thị đúng
- [ ] Form login có username và password fields
- [ ] Validation input (không để trống)
- [ ] Login với admin/admin123 → thành công
- [ ] Login với editor/editor123 → thành công
- [ ] Login với user1/user123 → thành công
- [ ] Login với sai thông tin → hiển thị error
- [ ] Sau khi login thành công → redirect đúng
- [ ] User info lưu vào localStorage
- [ ] User info hiển thị trên Header

### 5.2. Logout
- [ ] Button logout hiển thị khi đã login
- [ ] Click logout → clear user info
- [ ] Redirect về trang chủ sau logout
- [ ] localStorage được clear đúng

### 5.3. Protected Routes
- [ ] Truy cập `/admin` khi chưa login → redirect về login
- [ ] Truy cập `/admin` với user thường → không có quyền
- [ ] Truy cập `/admin` với admin → thành công
- [ ] Tất cả admin routes được bảo vệ

### 5.4. Role-based Access
- [ ] Admin có quyền truy cập tất cả admin pages
- [ ] Editor chỉ có quyền quiz editor
- [ ] User thường không có quyền admin
- [ ] UI elements ẩn/hiện đúng theo role

---

## ⚙️ 6. TEST ADMIN PANEL

### 6.1. Admin Layout
- [ ] Sidebar admin hiển thị đúng
- [ ] Navigation links trong sidebar hoạt động
- [ ] Active state của menu item
- [ ] Responsive sidebar trên mobile

### 6.2. Admin Dashboard (`/admin`)
- [ ] Welcome message hiển thị với tên user
- [ ] Stats cards hiển thị (Quiz, Users, Sách, Đề thi)
- [ ] Click stats card → điều hướng đến trang tương ứng
- [ ] Quick actions buttons hoạt động
- [ ] Storage info hiển thị (IndexedDB/localStorage usage)
- [ ] Storage info update real-time

### 6.3. Quiz Editor (`/admin/quiz-editor`)
- [ ] Hiển thị danh sách quiz
- [ ] Form tạo quiz mới
- [ ] Form chỉnh sửa quiz
- [ ] Thêm/xóa câu hỏi
- [ ] Validation form
- [ ] Preview quiz
- [ ] Export quiz ra JSON
- [ ] Import quiz từ JSON
- [ ] Lưu quiz vào IndexedDB/localStorage
- [ ] Delete quiz

### 6.4. Users Management (`/admin/users`)
- [ ] Hiển thị danh sách users
- [ ] Form thêm user mới
- [ ] Form chỉnh sửa user
- [ ] Đổi mật khẩu user
- [ ] Phân quyền (role) cho user
- [ ] Delete user
- [ ] Validation form
- [ ] Password không được hiển thị (masked)

### 6.5. Content Management (`/admin/content`)
- [ ] Hiển thị danh sách books
- [ ] Form thêm book mới
- [ ] Form chỉnh sửa book
- [ ] Quản lý chapters cho book
- [ ] Thêm/xóa chapter
- [ ] Upload images cho book
- [ ] Lưu vào IndexedDB/localStorage
- [ ] Delete book

### 6.6. Exam Management (`/admin/exams`)
- [ ] Hiển thị danh sách đề thi
- [ ] Form tạo đề thi mới
- [ ] Form chỉnh sửa đề thi
- [ ] Cấu hình điểm số (passing score)
- [ ] Cấu hình thời gian (time limit)
- [ ] Quản lý câu hỏi cho đề thi
- [ ] Thêm câu hỏi kiến thức
- [ ] Thêm câu hỏi nghe
- [ ] Import/Export đề thi
- [ ] Lưu vào IndexedDB/localStorage
- [ ] Delete exam

---

## 🔍 7. TEST DICTIONARY FEATURE (Tra từ)

### 7.1. Dictionary Context
- [ ] Dictionary context provider hoạt động
- [ ] Dictionary data load từ JSON file
- [ ] Dictionary data có 8,292 words (kiểm tra console log)

### 7.2. Double-click to Translate
- [ ] Double-click vào từ tiếng Nhật → hiển thị popup
- [ ] Popup hiển thị nghĩa từ (tiếng Việt, tiếng Anh)
- [ ] Popup hiển thị đúng vị trí (gần từ được click)
- [ ] Popup không bị che bởi các elements khác
- [ ] Click outside popup → đóng popup
- [ ] Press Escape → đóng popup
- [ ] Body scroll bị lock khi popup mở

### 7.3. Dictionary Button
- [ ] Dictionary button hiển thị (nếu có)
- [ ] Click button → mở dictionary search
- [ ] Search từ hoạt động
- [ ] Kết quả search hiển thị đúng

### 7.4. Save Word
- [ ] Button "Lưu từ" trong popup hoạt động
- [ ] Từ được lưu vào localStorage
- [ ] Hiển thị trạng thái "Đã lưu"

---

## 🧭 8. TEST NAVIGATION & ROUTING

### 8.1. Route Navigation
- [ ] Tất cả routes định nghĩa trong `main.jsx` hoạt động
- [ ] Navigation giữa các trang mượt mà
- [ ] Browser back/forward buttons hoạt động
- [ ] URL update đúng khi navigate
- [ ] 404 page hiển thị cho route không tồn tại

### 8.2. Exam Guard
- [ ] Exam guard ngăn navigate away khi đang làm bài
- [ ] Warning modal hiển thị khi cố navigate away
- [ ] Modal có options: "Hủy", "Xác nhận"
- [ ] "Hủy" → ở lại trang exam
- [ ] "Xác nhận" → navigate và clear exam data
- [ ] Exam guard chỉ active khi đang làm bài

### 8.3. Protected Links
- [ ] ProtectedLink component hoạt động
- [ ] Click protected link khi chưa login → redirect login
- [ ] Click protected link khi đã login → điều hướng bình thường

---

## 💾 9. TEST DATA STORAGE

### 9.1. IndexedDB

#### 9.1.1. IndexedDB được khởi tạo đúng
**Cách test:**
1. Mở DevTools → Application → Storage → IndexedDB
2. Kiểm tra database `elearning-db` đã được tạo 
  Chưa được tạo
3. Kiểm tra các object stores:
   - `books` (keyPath: ['level', 'id'])
   - `series` (keyPath: ['level', 'id'])
   - `chapters` (keyPath: 'bookId')
   - `quizzes` (keyPath: ['bookId', 'chapterId'])
   - `exams` (keyPath: ['level', 'examId'])
   - `levelConfigs` (keyPath: 'level')
4. Kiểm tra console log: `✅ IndexedDB initialized successfully`

**Kết quả kỳ vọng:**
- ✅ Database `elearning-db` xuất hiện trong IndexedDB
- ✅ Tất cả 6 object stores được tạo đúng
- ✅ Indexes được tạo đúng (level index cho books, series, exams)
- ✅ Console không có lỗi

---

#### 9.1.2. Lưu books vào IndexedDB
**Cách test:**
1. Vào Admin Dashboard → Content Management
2. Thêm/sửa books cho level N1
3. Mở DevTools → Application → IndexedDB → `elearning-db` → `books`
4. Kiểm tra dữ liệu đã được lưu
  Dữ liệu chưa được lưu

**Kết quả kỳ vọng:**
- ✅ Books được lưu với key `[level, id]` (ví dụ: `["n1", "shinkanzen-n1-bunpou"]`)
- ✅ Mỗi book có đầy đủ fields: `id`, `title`, `category`, `imageUrl`, `level`
- ✅ Console log: `✅ Saved X books to IndexedDB (level: n1)`
- ✅ Có thể query theo level index
  Dữ liệu được lưu nhưng logout và login lại là mất


**Code để kiểm tra:**
```javascript
// Trong Console
const db = await indexedDB.open('elearning-db', 1);
const tx = db.transaction('books', 'readonly');
const store = tx.objectStore('books');
const index = store.index('level');
const books = await index.getAll('n1');
console.log('Books in IndexedDB:', books);
```

---

#### 9.1.3. Lưu chapters vào IndexedDB
**Cách test:**
1. Vào Admin Dashboard → Content Management
2. Chọn một book → Thêm chapters
3. Mở DevTools → IndexedDB → `chapters`
4. Kiểm tra dữ liệu đã được lưu

**Kết quả kỳ vọng:**
- ✅ Chapters được lưu với key là `bookId`
- ✅ Value là object: `{ bookId: "...", chapters: [...] }`
- ✅ Console log: `✅ Saved X chapters to IndexedDB (book: ...)`
- ✅ Mỗi chapter có đầy đủ thông tin
  không lưu được
---

#### 9.1.4. Lưu quizzes vào IndexedDB
**Cách test:**
1. Vào Admin Dashboard → Quiz Editor
2. Tạo quiz cho một chapter (50 questions)
3. Mở DevTools → IndexedDB → `quizzes`
4. Kiểm tra dữ liệu đã được lưu

**Kết quả kỳ vọng:**
- ✅ Quiz được lưu với key `[bookId, chapterId]`
- ✅ Quiz data có đầy đủ: `title`, `questions[]`, `bookId`, `chapterId`
- ✅ Console log: `✅ Saved quiz to IndexedDB (bookId/chapterId, 50 questions)`
- ✅ Có thể lưu quiz lớn (>5MB) mà không bị lỗi
  dữ liệu không lưu được dù là không lớn hơn 5mb
**Lưu ý:** IndexedDB cho phép lưu dữ liệu lớn, không giới hạn như localStorage.

---

#### 9.1.5. Lưu exams vào IndexedDB
**Cách test:**
1. Vào Admin Dashboard → Exam Management
2. Tạo/sửa exam cho level N1
3. Mở DevTools → IndexedDB → `exams`
4. Kiểm tra dữ liệu đã được lưu

**Kết quả kỳ vọng:**
- ✅ Exam được lưu với key `[level, examId]`
- ✅ Exam data có: `level`, `examId`, `title`, `date`, `status`, `knowledge`, `listening`
- ✅ Console log: `✅ Saved exam to IndexedDB (level/examId)`
- ✅ Có thể query theo level index
  không lưu được ngay cả chưa load lại trang hoặc chưa thoát khỏi tài khoản
---

#### 9.1.6. Đọc dữ liệu từ IndexedDB
**Cách test:**
1. Đảm bảo đã có dữ liệu trong IndexedDB (từ các test trên)
2. Refresh trang
3. Kiểm tra dữ liệu được load từ IndexedDB

**Kết quả kỳ vọng:**
- ✅ Dữ liệu được load từ IndexedDB (không phải localStorage)
- ✅ Console log: `✅ Loaded X books from storage` hoặc tương tự
- ✅ Dữ liệu hiển thị đúng trên UI
- ✅ Không có lỗi trong console

**Cách kiểm tra:**
```javascript
// Trong Console - Kiểm tra dữ liệu có trong IndexedDB
const db = await indexedDB.open('elearning-db', 1);
const tx = db.transaction('books', 'readonly');
const store = tx.objectStore('books');
const allBooks = await store.getAll();
console.log('All books in IndexedDB:', allBooks);
```

---

#### 9.1.7. Xóa dữ liệu từ IndexedDB
**Cách test:**
1. Vào Admin Dashboard → Content Management
2. Xóa books/chapters/quizzes/exams
3. Mở DevTools → IndexedDB → kiểm tra dữ liệu đã bị xóa

**Kết quả kỳ vọng:**
- ✅ Dữ liệu bị xóa khỏi IndexedDB
- ✅ Console log: `🗑️ Deleted books for level n1` hoặc tương tự
- ✅ UI cập nhật (không còn hiển thị dữ liệu đã xóa)
- ✅ Không có lỗi

---

#### 9.1.8. Error handling khi IndexedDB không available
**Cách test:**
1. Mở DevTools → Application → Storage
2. Xóa database `elearning-db` (Right-click → Delete database)
3. Hoặc disable IndexedDB trong browser settings (nếu có)
4. Refresh trang và thử các thao tác lưu/đọc

**Kết quả kỳ vọng:**
- ✅ Console log: `⚠️ IndexedDB is not supported` hoặc `❌ IndexedDB initialization failed`
- ✅ Hệ thống tự động fallback sang localStorage
- ✅ Console log: `⚠️ IndexedDB not available, using localStorage (5-10 MB limit)`
- ✅ Ứng dụng vẫn hoạt động bình thường (dùng localStorage)
- ✅ Không có crash hoặc lỗi nghiêm trọng

---

### 9.2. localStorage

#### 9.2.1. localStorage được dùng làm fallback
**Cách test:**
1. Xóa IndexedDB (như test 9.1.8)
2. Thực hiện các thao tác lưu dữ liệu
3. Mở DevTools → Application → Local Storage
4. Kiểm tra dữ liệu được lưu vào localStorage

**Kết quả kỳ vọng:**
- ✅ Dữ liệu được lưu vào localStorage với key pattern: `adminBooks_n1`, `adminChapters_...`, etc.
- ✅ Console log: `✅ Saved X books to localStorage (adminBooks_n1)`
- ✅ Dữ liệu có thể đọc lại từ localStorage
- ✅ Ứng dụng hoạt động bình thường

---

#### 9.2.2. Lưu user auth vào localStorage
**Cách test:**
1. Đăng nhập với tài khoản admin/user
2. Mở DevTools → Application → Local Storage
3. Kiểm tra key `authUser`

**Kết quả kỳ vọng:**
- ✅ Key `authUser` được tạo trong localStorage
- ✅ Value là JSON string chứa: `{ username, role, ... }`
- ✅ Refresh trang → User vẫn đăng nhập (không cần login lại)
- ✅ Console log: User được load từ localStorage khi app start

**Code để kiểm tra:**
```javascript
// Trong Console
const authUser = localStorage.getItem('authUser');
console.log('Auth user:', JSON.parse(authUser));
```

---

#### 9.2.3. Lưu exam answers vào localStorage
**Cách test:**
1. Vào một bài thi JLPT (ví dụ: N1 - 2024-12)
2. Làm bài Knowledge → Trả lời một số câu hỏi
3. Mở DevTools → Local Storage
4. Kiểm tra key: `exam-n1-2024-12-knowledge`

**Kết quả kỳ vọng:**
- ✅ Key `exam-{level}-{examId}-knowledge` được tạo
- ✅ Value là JSON object: `{ "1-1": 0, "1-2": 2, ... }` (section-question: answerIndex)
- ✅ Tương tự cho listening: `exam-{level}-{examId}-listening`
- ✅ Refresh trang → Answers vẫn được giữ lại

**Code để kiểm tra:**
```javascript
// Trong Console
const answers = localStorage.getItem('exam-n1-2024-12-knowledge');
console.log('Exam answers:', JSON.parse(answers));
```

---

#### 9.2.4. Lưu exam progress vào localStorage
**Cách test:**
1. Làm bài thi và submit
2. Mở DevTools → Local Storage
3. Kiểm tra các keys:
   - `exam-{level}-{examId}-knowledge-completed`
   - `exam-{level}-{examId}-knowledge-score`
   - `exam-{level}-{examId}-knowledge-breakdown`
   - Tương tự cho listening

**Kết quả kỳ vọng:**
- ✅ `-completed`: `"true"` hoặc không có (nếu chưa hoàn thành)
- ✅ `-score`: Số điểm (0-100)
- ✅ `-breakdown`: JSON object với breakdown theo category
- ✅ Refresh trang → Progress được giữ lại

**Code để kiểm tra:**
```javascript
// Trong Console
const completed = localStorage.getItem('exam-n1-2024-12-knowledge-completed');
const score = localStorage.getItem('exam-n1-2024-12-knowledge-score');
const breakdown = localStorage.getItem('exam-n1-2024-12-knowledge-breakdown');
console.log('Progress:', { completed, score, breakdown: JSON.parse(breakdown) });
```

---

#### 9.2.5. Clear localStorage khi logout
**Cách test:**
1. Đăng nhập
2. Kiểm tra localStorage có `authUser` và `adminUsers`
3. Click Logout
4. Kiểm tra lại localStorage

**Kết quả kỳ vọng:**
- ✅ Key `authUser` bị xóa
- ✅ Key `adminUsers` bị xóa (theo code trong AuthContext)
- ✅ User được redirect về trang chủ hoặc login
- ✅ Console log: `🗑️ Cleared ALL localStorage` (nếu có)

**Lưu ý:** Exam answers và progress KHÔNG bị xóa khi logout (chỉ xóa auth data).

---

#### 9.2.6. Error handling khi localStorage đầy
**Cách test:**
1. Tạo script để fill localStorage đến giới hạn:
```javascript
// Trong Console - Fill localStorage
try {
  let i = 0;
  while (true) {
    localStorage.setItem(`test_${i}`, 'x'.repeat(1024 * 1024)); // 1MB mỗi item
    i++;
  }
} catch (e) {
  console.log('localStorage full at:', i, 'items');
  console.error(e);
}
```
2. Sau đó thử lưu dữ liệu mới (books, quizzes, etc.)

**Kết quả kỳ vọng:**
- ✅ Khi localStorage đầy, catch `QuotaExceededError`
- ✅ Console log: `❌ localStorage quota exceeded!`
- ✅ Alert hiển thị: `⚠️ Dung lượng localStorage đã đầy!`
- ✅ Nếu có IndexedDB → Dữ liệu vẫn được lưu vào IndexedDB
- ✅ Console log: `localStorage full, but data saved to IndexedDB`

**Lưu ý:** Với IndexedDB, không có giới hạn này, có thể lưu hàng trăm MB.

---

### 9.3. Data Priority

#### 9.3.1. Priority: IndexedDB > localStorage > Static data
**Cách test:**
1. Đảm bảo có dữ liệu trong cả 3 nguồn:
   - IndexedDB: Lưu books qua Admin Dashboard
   - localStorage: Lưu books với key `adminBooks_n1`
   - Static data: Dữ liệu mặc định trong code (`n1BooksMetadata`)
2. Refresh trang và kiểm tra dữ liệu được load từ đâu

**Kết quả kỳ vọng:**
- ✅ Dữ liệu được load từ IndexedDB (ưu tiên cao nhất)
- ✅ Console log: `✅ Loaded X books from storage` (từ IndexedDB)
- ✅ UI hiển thị dữ liệu từ IndexedDB
- ✅ localStorage và static data KHÔNG được dùng (nếu IndexedDB có data)

---

#### 9.3.2. Load từ IndexedDB trước
**Cách test:**
1. Lưu books vào IndexedDB (qua Admin Dashboard)
2. Mở DevTools → Console
3. Refresh trang
4. Kiểm tra console logs

**Kết quả kỳ vọng:**
- ✅ Console log: `✅ Using IndexedDB for storage (unlimited capacity)`
- ✅ Console log: `✅ Loaded X books from storage` (không phải từ localStorage)
- ✅ Dữ liệu được load từ IndexedDB
- ✅ Không có log về localStorage hoặc static data

**Code để kiểm tra:**
```javascript
// Trong Console - Kiểm tra storage được dùng
const storageInfo = await storageManager.getStorageInfo();
console.log('Storage type:', storageInfo.storageType);
// Kỳ vọng: "IndexedDB (primary) + localStorage (fallback)"
```

---

#### 9.3.3. Fallback localStorage nếu IndexedDB fail
**Cách test:**
1. Xóa IndexedDB (như test 9.1.8)
2. Đảm bảo có dữ liệu trong localStorage (`adminBooks_n1`)
3. Refresh trang
4. Kiểm tra dữ liệu được load từ đâu

**Kết quả kỳ vọng:**
- ✅ Console log: `⚠️ IndexedDB not available, using localStorage`
- ✅ Console log: `✅ Loaded X books from storage` (từ localStorage)
- ✅ Dữ liệu được load từ localStorage
- ✅ UI hiển thị đúng dữ liệu từ localStorage
- ✅ Dữ liệu được sync lên IndexedDB nếu IndexedDB khả dụng lại

**Code để kiểm tra:**
```javascript
// Trong Console
const books = await storageManager.getBooks('n1');
console.log('Books loaded from:', books ? 'localStorage' : 'static');
```

---

#### 9.3.4. Fallback static data nếu cả 2 fail
**Cách test:**
1. Xóa IndexedDB
2. Xóa localStorage (hoặc clear all)
3. Refresh trang
4. Kiểm tra dữ liệu được load từ đâu

**Kết quả kỳ vọng:**
- ✅ Console log: `📁 Loaded X books from static file` (từ code)
- ✅ Dữ liệu được load từ static data (`n1BooksMetadata`)
- ✅ UI hiển thị dữ liệu mặc định
- ✅ Ứng dụng vẫn hoạt động bình thường (không crash)

**Code để kiểm tra:**
```javascript
// Trong Console
const books = await storageManager.getBooks('n1');
console.log('Books:', books);
// Nếu null → sẽ dùng static data trong component
```

---

### 📝 TÓM TẮT TEST DATA STORAGE

**Checklist nhanh:**
1. ✅ IndexedDB khởi tạo và tạo đúng object stores
2. ✅ Lưu/đọc/xóa dữ liệu từ IndexedDB hoạt động
3. ✅ localStorage được dùng làm fallback
4. ✅ Auth và exam data được lưu vào localStorage
5. ✅ Priority: IndexedDB → localStorage → Static data
6. ✅ Error handling khi storage không available
7. ✅ Error handling khi localStorage đầy

**Công cụ kiểm tra:**
- **DevTools → Application → IndexedDB**: Kiểm tra IndexedDB
- **DevTools → Application → Local Storage**: Kiểm tra localStorage
- **DevTools → Console**: Xem logs và test code
- **Network tab**: Kiểm tra không có request không cần thiết

**Kết quả cuối cùng:**
- ✅ Ứng dụng hoạt động với IndexedDB (unlimited storage)
- ✅ Tự động fallback khi IndexedDB không available
- ✅ Dữ liệu được sync giữa IndexedDB và localStorage
- ✅ Không mất dữ liệu khi refresh hoặc đóng browser

---

## 🎨 10. TEST UI COMPONENTS

### 10.1. Modals
- [ ] Modal hiển thị đúng
- [ ] Modal overlay (backdrop) hoạt động
- [ ] Click outside modal → đóng modal
- [ ] Press Escape → đóng modal
- [ ] Body scroll bị lock khi modal mở
- [ ] Modal responsive trên mobile
- [ ] Modal animations mượt

### 10.2. Forms
- [ ] Input fields hoạt động
- [ ] Validation hiển thị đúng
- [ ] Error messages hiển thị
- [ ] Submit form hoạt động
- [ ] Reset form hoạt động
- [ ] Form responsive

### 10.3. Buttons
- [ ] Buttons có hover effects
- [ ] Buttons có active states
- [ ] Disabled buttons không click được
- [ ] Loading state trên buttons
- [ ] Buttons responsive

### 10.4. Cards
- [ ] Card hover effects
- [ ] Card clickable hoạt động
- [ ] Card images load đúng
- [ ] Card responsive

### 10.5. Loading States
- [ ] Loading spinner hiển thị khi đang load
- [ ] Loading text hiển thị
- [ ] Skeleton screens (nếu có)

---

## 📄 11. TEST CÁC TRANG KHÁC

### 11.1. About Page (`/about`)
- [ ] Trang About hiển thị đúng
- [ ] Nội dung về dự án hiển thị
- [ ] Links hoạt động
- [ ] Responsive

### 11.2. 404 Page
- [ ] 404 page hiển thị cho route không tồn tại
- [ ] Link "Quay về Trang chủ" hoạt động
- [ ] Message rõ ràng

---

## 🔄 12. TEST STATE MANAGEMENT

### 12.1. Auth Context
- [ ] AuthContext provider hoạt động
- [ ] useAuth hook hoạt động
- [ ] User state được share across components
- [ ] Login state persist qua page reload

### 12.2. Dictionary Context
- [ ] DictionaryContext provider hoạt động
- [ ] Dictionary state được share
- [ ] Dictionary data load một lần

---

  ## 🐛 13. TEST ERROR HANDLING

  ### 13.1. Network Errors
  - [ ] Handle lỗi khi load data từ JSON
  - [ ] Handle lỗi khi IndexedDB fail
  - [ ] Handle lỗi khi localStorage đầy
  - [ ] Error messages hiển thị user-friendly

  ### 13.2. Validation Errors
  - [ ] Form validation errors hiển thị
  - [ ] Input validation real-time
  - [ ] Error messages rõ ràng

  ### 13.3. Edge Cases
  - [ ] Handle empty data
  - [ ] Handle null/undefined values
  - [ ] Handle missing images
  - [ ] Handle very long text

  ---

  ## ⚡ 14. TEST PERFORMANCE

  ### 14.1. Loading Performance
  - [ ] Trang load nhanh (< 3s)
  - [ ] Images lazy load
  - [ ] Code splitting hoạt động
  - [ ] Bundle size hợp lý

  ### 14.2. Runtime Performance
  - [ ] Scroll mượt mà
  - [ ] Animations 60fps
  - [ ] No memory leaks
  - [ ] Efficient re-renders

  ---

  ## 📱 15. TEST CROSS-BROWSER

  ### 15.1. Chrome/Edge
  - [ ] Tất cả features hoạt động
  - [ ] UI hiển thị đúng

  ### 15.2. Firefox
  - [ ] Tất cả features hoạt động
  - [ ] UI hiển thị đúng

  ### 15.3. Safari
  - [ ] Tất cả features hoạt động
  - [ ] UI hiển thị đúng
  - [ ] IndexedDB hoạt động

  ### 15.4. Mobile Browsers
  - [ ] Chrome Mobile
  - [ ] Safari Mobile
  - [ ] Touch events hoạt động

  ---

  ## 🔒 16. TEST SECURITY

  ### 16.1. Authentication Security
  - [ ] Password không được lưu plain text
  - [ ] Session timeout (nếu có)
  - [ ] Protected routes không bypass được

  ### 16.2. Data Security
  - [ ] User data không expose
  - [ ] Admin data không accessible bởi user thường
  - [ ] XSS prevention (sanitize input)

  ---

  ## 📊 17. TEST DATA INTEGRITY

  ### 17.1. Data Consistency
  - [ ] Data sync giữa IndexedDB và localStorage
  - [ ] Data không bị duplicate
  - [ ] Data không bị mất khi reload

  ### 17.2. Data Validation
  - [ ] Validate data structure
  - [ ] Validate required fields
  - [ ] Validate data types

  ---

  ## 🎯 18. TEST USER EXPERIENCE

  ### 18.1. Usability
  - [ ] Navigation intuitive
  - [ ] Buttons có labels rõ ràng
  - [ ] Error messages dễ hiểu
  - [ ] Loading states rõ ràng
  - [ ] Success feedback

  ### 18.2. Accessibility
  - [ ] Keyboard navigation hoạt động
  - [ ] Focus states visible
  - [ ] Alt text cho images
  - [ ] ARIA labels (nếu có)

  ---

  ## ✅ 19. TEST REGRESSION

  ### 19.1. Existing Features
  - [ ] Tất cả features cũ vẫn hoạt động sau khi thêm tính năng mới
  - [ ] Không có breaking changes
  - [ ] Backward compatibility

  ---

  ## 📝 20. TEST DOCUMENTATION

  ### 20.1. Code Documentation
  - [ ] Comments trong code đầy đủ
  - [ ] README.md cập nhật
  - [ ] Guide files cập nhật

  ---

  ## 🎬 21. TEST ANIMATIONS & TRANSITIONS

  ### 21.1. Page Transitions
  - [ ] Page transitions mượt
  - [ ] Loading animations
  - [ ] Fade in/out effects

  ### 21.2. Component Animations
  - [ ] Hover animations
  - [ ] Click animations
  - [ ] Scroll animations
  - [ ] Modal animations

  ---

  ## 📈 22. TEST ANALYTICS & TRACKING (Nếu có)

  ### 22.1. User Tracking
  - [ ] Track page views
  - [ ] Track user actions
  - [ ] Track errors

  ---

  ## 🔧 23. TEST CONFIGURATION

  ### 23.1. Environment Variables
  - [ ] Dev environment hoạt động
  - [ ] Production build hoạt động
  - [ ] Config files đúng

  ### 23.2. Dependencies
  - [ ] Tất cả dependencies install được
  - [ ] Không có conflicts
  - [ ] Version compatibility

  ---

  ## 📋 TỔNG KẾT

  ### Test Checklist Summary
  - **Total Test Cases**: ~200+ test cases
  - **Categories**: 23 categories
  - **Priority**: 
    - **Critical**: Authentication, Data Storage, Core Features
    - **High**: UI/UX, Navigation, Admin Panel
    - **Medium**: Animations, Performance, Cross-browser
    - **Low**: Documentation, Analytics

  ### Test Execution Order
  1. **Phase 1**: Core Features (Auth, Navigation, Level, JLPT)   
  2. **Phase 2**: Admin Panel
  3. **Phase 3**: UI/UX & Responsive
  4. **Phase 4**: Edge Cases & Error Handling
  5. **Phase 5**: Performance & Cross-browser

  ### Test Tools Recommended
  - **Manual Testing**: Browser DevTools, Manual checklist
  - **Automated Testing**: Jest, React Testing Library (nếu có)
  - **E2E Testing**: Playwright, Cypress (nếu có)
  - **Performance**: Lighthouse, Chrome DevTools

  ---

  **Lưu ý**: 
  - Đánh dấu ✅ khi test case đã pass
  - Đánh dấu ❌ khi test case fail và ghi chú lỗi
  - Đánh dấu ⚠️ khi test case cần review lại          
  - Ghi chú chi tiết cho mỗi test case fail

  ---

  **Ngày tạo**: $(date)
  **Version**: 1.0
  **Maintainer**: Development Team

