# ✅ MODAL TESTING CHECKLIST

**Thời gian test:** ~10-15 phút cho cả 2 modal  
**Chuẩn bị:** Chạy `npm run dev` → Vào `/admin/content`

---

## 📋 MODAL 1: THÊM SÁCH MỚI (5 Tests)

### ✅ Test 1: Auto-ID + Stepper
**Steps:**
1. Click nút "➕ Thêm Sách" trên Series card
2. Chọn Category = "N1スピードマスター"
3. Kiểm tra ID field

**Expected:**
- ✅ ID tự động fill: `book-001-n1スピードマスター` (hoặc số tiếp theo)
- ✅ Field read-only (không gõ được)
- ✅ Có 2 nút +/− bên cạnh
- ✅ Click + → số tăng (e.g., `book-002-...`)
- ✅ Click − → số giảm (nếu > 1)

**Pass/Fail:** ___

---

### ✅ Test 2: Category Trigger + Filter
**Steps:**
1. Ở modal "Thêm Sách", đổi Category từ "N1スピードマスター" sang "N1 Extra Materials"
2. Xem ID field và list sách bên dưới

**Expected:**
- ✅ ID auto-update thành `book-001-n1extramaterials`
- ✅ List "Sách trong Level N1" chỉ hiển thị sách có category "N1 Extra Materials"
- ✅ Số lượng sách update (e.g., "(3 sách)")

**Pass/Fail:** ___

---

### ✅ Test 3: Search + Copy Buttons
**Steps:**
1. Ở list "Sách trong Level N1", gõ "demo" vào search bar
2. Hover mouse lên 1 sách trong list
3. Click nút "📋 ID"

**Expected:**
- ✅ List filter realtime (chỉ hiển thị sách có "demo" trong ID/tên)
- ✅ Hover → 2 nút "📋 ID" và "📋 Tên" hiện ra (opacity 0 → 100)
- ✅ Click "📋 ID" → Alert "✅ Đã copy ID: ..."
- ✅ Paste vào notepad → ID đã được copy

**Pass/Fail:** ___

---

### ✅ Test 4: Realtime Title Validation
**Steps:**
1. Nhập tên sách trùng với sách hiện có (e.g., "DEMO: Complete Sample Book")
2. Xem border của input và message bên dưới
3. Sửa tên thành "DEMO Test v2"

**Expected:**
- ✅ Border chuyển đỏ (border-red-500) khi trùng
- ✅ Hiển thị warning: "⚠️ Tên sách này đã tồn tại! Gợi ý: thêm v2..."
- ✅ Warning có animate-pulse
- ✅ Sửa tên unique → Border xanh + "✅ Tên sách hợp lệ"

**Pass/Fail:** ___

---

### ✅ Test 5: Save Spinner + Toast
**Steps:**
1. Điền form đầy đủ: ID auto, tên unique, category, URL ảnh (optional)
2. Click nút "💾 Thêm Sách"
3. Xem button animation và alert

**Expected:**
- ✅ Button disabled + text đổi thành "⏳ Đang lưu..."
- ✅ Có spinner icon (animate-spin)
- ✅ Modal đóng sau ~0.5s
- ✅ Alert hiển thị: "✅ ĐÃ LƯU THÀNH CÔNG!\n\n📚 Đã thêm sách:\n   - ID: book-XXX\n   - Tên: ...\n   - Series: ..."
- ✅ Sách mới xuất hiện trong list

**Pass/Fail:** ___

---

## 📋 MODAL 2: THÊM BÀI HỌC MỚI (5 Tests)

### ✅ Test 6: Dynamic Tabs
**Steps:**
1. Click nút "➕ Thêm Bài học" ở 1 chapter
2. Chọn Content Type = "📚 Từ vựng (Vocabulary)"
3. Xem tabs phía dưới

**Expected:**
- ✅ Tab "Flashcard" tự động active (màu purple)
- ✅ Tab "Flashcard" có badge số (e.g., "0")
- ✅ Toggle "🎴 Bật Flashcard SRS" đã checked
- ✅ Tab có pulse animation (nếu chưa click vào)

**Pass/Fail:** ___

---

### ✅ Test 7: Theory Upload (Already Built)
**Steps:**
1. Click tab "Lý thuyết"
2. Xem 3 sub-tabs: "🔗 Nhập URL", "📤 Upload File", "✍️ Soạn Trực Tiếp"
3. Click "📤 Upload File" → Drag 1 file PDF vào zone

**Expected:**
- ✅ 3 sub-tabs hiển thị rõ ràng (neo-brutalism buttons)
- ✅ Drag zone có border dashed + bg-gray-50
- ✅ Drag file vào → Border đổi màu purple + scale
- ✅ Progress bar hiển thị 0% → 100%
- ✅ Alert "✅ Upload thành công! File: ... Đường dẫn: /pdfs/uploaded/..."

**Pass/Fail:** ___

---

### ✅ Test 8: Flashcard Preview + Flip
**Steps:**
1. Click tab "Flashcard"
2. Scroll xuống phần "Preview Flashcard"
3. Click vào flip card (màu xanh)
4. Card lật sang back side (màu tím) → Click nút "✅ Good"

**Expected:**
- ✅ Card có hiệu ứng 3D flip (rotateY 0deg → 180deg, smooth 0.5s)
- ✅ Front side: "食べる" + "たべる" (bg-gradient blue)
- ✅ Back side: "Ăn (to eat)" + example (bg-gradient purple)
- ✅ 4 nút test hiện ra: ❌ Again | 😅 Hard | ✅ Good | 😎 Easy
- ✅ Click "Good" → Feedback box: "✅ Sẽ xem lại sau 3 ngày" (animate-bounce)
- ✅ Card tự động flip back sau 1s

**Pass/Fail:** ___

---

### ✅ Test 9: Auto Lesson ID
**Steps:**
1. Mở modal "Thêm Bài học" từ Chapter có ID = "bai-1"
2. Xem field "🆔 ID Bài học"
3. Click nút +/−

**Expected:**
- ✅ ID tự động: `lesson-1-1`
- ✅ Field read-only (bg-blue-50)
- ✅ Có 2 nút +/− stepper
- ✅ Tooltip hiển thị: "✅ ID tự động theo chương (Sách: book-XXX)"
- ✅ Click + → `lesson-1-2`, click − → `lesson-1-1`

**Pass/Fail:** ___

---

### ✅ Test 10: Validation + Save Draft
**Steps:**
1. Mở modal "Thêm Bài học"
2. Bỏ trống tên bài học
3. Xem section Validation và buttons
4. Điền đầy đủ form (ID auto, tên, lý thuyết PDF)
5. Click "💾 Lưu Nháp"
6. Mở lại modal, sửa title, click "❌ Đóng"

**Expected:**
**Step 2-3:**
- ✅ Section "⚠️ Lỗi Validation" hiển thị (bg-red-50, animate-pulse)
- ✅ List errors: "Tên bài học không được trống", "Bài học cần có ít nhất 1 nội dung lý thuyết"
- ✅ Nút "💾 Tạo & Xuất Bản" disabled (opacity-50)

**Step 5:**
- ✅ Nút "💾 Lưu Nháp" (bg-yellow-500) không disabled
- ✅ Click → Alert "✅ Đã lưu nháp! Chưa xuất bản..."
- ✅ Modal đóng

**Step 6:**
- ✅ Sửa title → Button "❌ Đóng" đổi text thành "❌ Hủy (mất thay đổi)"
- ✅ Click "Đóng" → Confirm dialog: "⚠️ BẠN CÓ THAY ĐỔI CHƯA LƯU!"
- ✅ Bấm Cancel → Modal không đóng
- ✅ Bấm OK → Modal đóng (thay đổi bị mất)

**Pass/Fail:** ___

---

## 📊 SUMMARY

| Test | Status | Notes |
|------|--------|-------|
| 1. Auto-ID + Stepper | ⬜ PASS / ⬜ FAIL | |
| 2. Category Trigger | ⬜ PASS / ⬜ FAIL | |
| 3. Search + Copy | ⬜ PASS / ⬜ FAIL | |
| 4. Title Validation | ⬜ PASS / ⬜ FAIL | |
| 5. Save Spinner | ⬜ PASS / ⬜ FAIL | |
| 6. Dynamic Tabs | ⬜ PASS / ⬜ FAIL | |
| 7. Theory Upload | ⬜ PASS / ⬜ FAIL | |
| 8. Flashcard Preview | ⬜ PASS / ⬜ FAIL | |
| 9. Auto Lesson ID | ⬜ PASS / ⬜ FAIL | |
| 10. Validation + Draft | ⬜ PASS / ⬜ FAIL | |

**Total:** ___ / 10 passed

---

## 🐛 BUG REPORT TEMPLATE

Nếu test fail, copy template này:

```
**Test #:** ___
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
- 

**Actual Behavior:**
- 

**Screenshot/Video:**
(attach if possible)

**Console Errors:**
(paste from browser DevTools Console)

**Browser:** Chrome/Firefox/Safari ___
**OS:** Windows/Mac/Linux ___
```

---

**Date Tested:** ___________  
**Tested By:** ___________  
**Result:** ✅ ALL PASS / ⚠️ NEEDS FIX  

---

*Testing Checklist for MODAL_PERFECTION_COMPLETE.md*

