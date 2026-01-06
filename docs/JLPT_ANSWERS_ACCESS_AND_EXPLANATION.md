## Tóm tắt bài toán

- **Bối cảnh**: Trang `Đáp án & Giải thích` của JLPT hiển thị:
  - Kết quả tổng quan (điểm, số câu đúng, tỉ lệ chính xác).
  - Đáp án tóm tắt (bảng 1–96, đúng/sai).
  - Chi tiết từng câu (câu hỏi, lựa chọn của user, đáp án đúng, giải thích).
- **Vấn đề**:
  - Dự án cá nhân, số lượng câu rất lớn (khoảng 2000+ câu), không thể viết giải thích chi tiết cho tất cả câu trong ngắn hạn.
  - Không muốn bỏ phí UI chi tiết từng câu, nhưng cũng không thể cam kết “100% câu có giải thích” ngay từ đầu.
  - Cần cơ chế **khóa một phần** để:
    - Khuyến khích user đăng nhập.
    - Cho phép bổ sung giải thích dần dần, không phá UX hiện tại.

Kết luận: Chọn chiến lược **“progressive enhancement”** – giữ trải nghiệm tối thiểu hữu ích cho tất cả user, và mở rộng “chi tiết” cho user đã đăng nhập, với thông điệp trung thực về trạng thái cập nhật.

---

## Quyết định UX / Sản phẩm

### 1. Phân chia 2 tầng thông tin

1. **Ai cũng xem được (không cần login)**:
   - `ScoreSummary`: Tổng quan kết quả (tổng số câu đúng, tỉ lệ %, điểm từng phần).
   - `QuickAnswerKey`: Đáp án tóm tắt cho toàn bộ đề (các ô 1-A, 2-B (A), 3-- ...).

2. **Chỉ xem khi đã đăng nhập**:
   - Toàn bộ phần **chi tiết từng câu** (`AnswerCard`):
     - Câu hỏi, ngữ cảnh/đoạn văn.
     - Lựa chọn của user, đáp án đúng, highlight màu.
     - Box giải thích (nếu đã có dữ liệu `explanation`).

Lý do:
- User mới vẫn có trải nghiệm “thi thử + biết điểm + biết đáp án” mà không bị chặn ngay.
- User nghiêm túc (muốn soi từng câu) có động lực đăng nhập → tăng retention và khả năng sync dữ liệu về sau.

### 2. Login wall mềm cho phần chi tiết

Trên trang `ExamAnswersPage`:

- Sau `ScoreSummary` và `QuickAnswerKey`, nếu **`!user` (chưa đăng nhập)**:
  - Hiển thị component `LoginPrompt` (block gradient xanh):
    - Tiêu đề: “🔒 Đăng nhập để xem chi tiết bài làm”.
    - Nội dung lợi ích (tên key trong i18n `answersPage.loginPrompt`):
      - `benefit1`: Đáp án chi tiết cho từng câu bạn đã làm.
      - `benefit2`: Giải thích đúng/sai (đang được bổ sung dần…).
      - `benefit3`: Lưu lịch sử bài thi và tiến bộ của bạn.
    - Hai nút:
      - “Đăng nhập” → Mở `LoginModal` ở mode login.
      - “Tạo tài khoản miễn phí” → Mở `LoginModal` ở mode register.
  - **Không render `AnswerCard`** (không hiển thị chi tiết từng câu).

- Nếu **`user` tồn tại (đã đăng nhập)**:
  - Ẩn hẳn `LoginPrompt`.
  - Render toàn bộ danh sách câu hỏi chi tiết (`AnswerCard`) như thiết kế gốc.

### 3. Hành vi khi chưa có giải thích chi tiết

Yêu cầu:
- Nếu `explanation` của câu đang trống (hoặc chỉ chứa HTML trống), box giải thích vẫn hiển thị một **message rõ ràng**, không để khoảng trống gây hiểu lầm.

Thông điệp i18n (`vi.js` – `jlpt.answersPage.explanationMissing`):

> “Giải thích chi tiết cho câu này đang được cập nhật. Bạn có thể xem đáp án đúng ở phần trên.”

Logic:
- Với mỗi `AnswerCard`, nếu **không có explanation thực sự**, không render HTML rỗng mà hiển thị message trên trong box giải thích.

---

## Chi tiết kỹ thuật đã triển khai

### 1. Khóa phần chi tiết bằng `user` từ `AuthContext`

File: `src/features/jlpt/pages/ExamAnswersPage.jsx`

- Import thêm:
  - `useAuth` từ `AuthContext`.
  - `LoginModal`.
  - `LoginPrompt` là component mới.
- Trong `ExamAnswersPage`:
  - Lấy `user` từ `useAuth()`.
  - Thêm state:
    - `showLoginModal` – bật/tắt modal.
    - `loginModalMode` – `'login'` hoặc `'register'` (trạng thái ban đầu của modal).

**Logic render (giản lược):**

- Sau `QuickAnswerKey`:
  - Nếu `!user` → render `LoginPrompt`:
    - `onLoginClick`:
      - `setLoginModalMode('login')`
      - `setShowLoginModal(true)`
    - `onRegisterClick`:
      - `setLoginModalMode('register')`
      - `setShowLoginModal(true)`
  - Nếu `user` → render:
    - Block “Phần 1 – Ngôn ngữ & Đọc hiểu” với tất cả `AnswerCard` của phần kiến thức/đọc hiểu.
    - Block “Phần 2 – Nghe hiểu” với các `AnswerCard` phần nghe.

- Cuối component:
  - Nếu `showLoginModal` → render `LoginModal` qua portal:
    - `initialView={loginModalMode}`.
    - `onClose` sẽ:
      - `setShowLoginModal(false)`.
      - Reset `loginModalMode` về `'login'` cho lần mở sau.

### 2. `LoginPrompt` – block kêu gọi đăng nhập

File: `ExamAnswersPage.jsx`

`LoginPrompt` là một component nhỏ, dùng `useLanguage()` để lấy text từ i18n:
- Hiển thị gradient background, tiêu đề, danh sách 3 lợi ích.
- Hai nút `type="button"` với `preventDefault` + `stopPropagation` để tránh submit form ngoài ý muốn.
- Callback `onLoginClick` / `onRegisterClick` được truyền từ `ExamAnswersPage`.

### 3. Kết nối `LoginModal` với `authService`

File: `src/components/LoginModal.jsx`

- Trước đây `LoginModal` chỉ có UI (form, social buttons) nhưng **không gắn logic auth**, và còn dùng `alert("coming soon")`.
- Đã được cập nhật để dùng **authService Supabase** thực tế:
  - Import: `import * as authService from '../services/authService.js';`
  - State mới:
    - `isRegisterView` – toggle giữa Register / Login (theo `initialView`).
    - `isLoading`, `error` – hiển thị trạng thái và lỗi.
    - `formData` – `{ fullName, email, password }`.
  - `handleInputChange` – cập nhật `formData` theo `name` của input.
  - `handleSubmit`:
    - `preventDefault`.
    - Nếu `isRegisterView`:
      - Validate: đủ fullName, email, password.
      - Gọi `authService.signUp({ email, password, displayName: fullName })`.
      - Nếu thành công → alert nhỏ + `onClose()`.
      - Nếu lỗi → hiển thị `error` từ service.
    - Nếu đang ở Login:
      - Validate: email, password.
      - Gọi `authService.signIn({ email, password })`.
      - Thành công → alert nhỏ + `onClose()` (AuthContext sẽ tự sync session).
      - Thất bại → hiển thị error.
    - `finally` → `setIsLoading(false)`.
  - Inputs Register/Login đều gắn:
    - `name`, `value={formData.xxx}`, `onChange={handleInputChange}`.
  - Buttons Login / Create Account:
    - `type="submit"`.
    - `disabled={isLoading}` + text thay đổi (“Đang đăng nhập...”, “Đang tạo tài khoản...”).
  - Social buttons (Facebook / Google / LINE / Apple):
    - Có `onClick={() => handleSocialLogin('Provider')}` – tạm thời là placeholders (`alert` + `console.log`), sau này có thể gắn OAuth thật.
  - Portal:
    - `ReactDOM.createPortal(..., document.body)` – đảm bảo modal luôn render đúng chỗ, không bị 404/redirect bất thường.

### 4. Phát hiện “giải thích rỗng” chính xác hơn

Vấn đề:
- Nhiều câu có `question.explanation` là chuỗi chứa HTML rỗng (ví dụ `'<p><br></p>'`), `.trim()` vẫn không phải là chuỗi rỗng.
- Kết quả: `hasExplanation` = `true`, branch render explanation được chọn, nhưng box thực tế trống → user không thấy message “đang cập nhật”.

Giải pháp:
- Trong `AnswerCard`:
  - Tạo `rawExplanation = question.explanation || ''`.
  - Làm sạch:
    - Xóa toàn bộ thẻ HTML: `.replace(/<[^>]*>/g, '')`.
    - Xóa `&nbsp;`: `.replace(/&nbsp;/gi, '')`.
    - Xóa mọi khoảng trắng: `.replace(/\s+/g, '')`.
  - `cleanedExplanation = ... .trim()`.
  - `hasExplanation = cleanedExplanation.length > 0`.

Branch hiển thị:
- Nếu `hasExplanation`:
  - Render explanation thật bằng `dangerouslySetInnerHTML={{ __html: question.explanation }}` trong box.
- Nếu không:
  - Render box đơn giản với text từ `t('jlpt.answersPage.explanationMissing')`.

Nhờ đó, mọi câu **chưa có giải thích thực sự** đều hiển thị message chuẩn:

> “Giải thích chi tiết cho câu này đang được cập nhật. Bạn có thể xem đáp án đúng ở phần trên.”

---

## Checklist hành vi mong đợi

1. **User chưa đăng nhập**:
   - Sau khi nộp bài và vào trang `Đáp án & Giải thích`:
     - Thấy tổng quan kết quả + đáp án tóm tắt.
     - Thấy block gradient kêu gọi “Đăng nhập để xem chi tiết bài làm”.
     - Không thấy list chi tiết từng câu.
     - Click “Đăng nhập” / “Tạo tài khoản miễn phí” → mở `LoginModal` tương ứng.

2. **User đăng nhập thành công**:
   - Reload hoặc quay lại trang `Đáp án & Giải thích`:
     - Không còn block kêu gọi login.
     - Thấy list đầy đủ các `AnswerCard`.
     - Mỗi câu thể hiện đúng:
       - Chọn của user, đáp án đúng, highlight màu.
       - Box giải thích:
         - Có nội dung nếu `explanation` đã được nhập.
         - Hoặc message “đang được cập nhật...” nếu chưa có.

3. **Câu không có giải thích (explanation rỗng / chỉ HTML trống)**:
   - Box “Giải thích” luôn hiện text:
     - “Giải thích chi tiết cho câu này đang được cập nhật. Bạn có thể xem đáp án đúng ở phần trên.”

---

## Hướng phát triển tiếp theo (gợi ý)

- Thay dần các lời gọi `alert(...)` trong `LoginModal` bằng toast system thống nhất (ví dụ `ToastNotification`).
- Triển khai social login thật (Supabase OAuth) trong `authService` và gắn vào `handleSocialLogin`.
- Thêm tracking “câu nào có giải thích / chưa có” để ưu tiên biên soạn (ví dụ log vào admin dashboard).
- Khi lượng giải thích đủ lớn, có thể:
  - Cho phép user chưa login xem **một số câu có giải thích** (teaser), còn lại yêu cầu login.
  - Hoặc phân tách “Free vs Premium” nếu sau này có gói trả phí.

Tài liệu này giúp nhớ lại **tại sao** phần chi tiết JLPT được khóa sau login, cách kết nối với hệ thống đăng nhập hiện có, và cách xử lý trường hợp chưa có giải thích chi tiết cho từng câu hỏi.

---

## 📚 Related Documentation

- **[Database Connection & Verification Guide](./JLPT_ANSWERS_DATABASE_CONNECTION.md)** - Chi tiết về cách kết nối và kiểm tra database
- **[JLPT Scoring Logic](../../archive/data/JLPT_SCORING_LOGIC_VI.md)** - Logic tính điểm JLPT


