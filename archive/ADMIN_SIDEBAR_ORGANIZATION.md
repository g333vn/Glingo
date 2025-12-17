# 📋 TỔ CHỨC SIDEBAR ADMIN - ĐỀ XUẤT

## 🎯 TÌNH HÌNH HIỆN TẠI

### **Sidebar Admin có các mục:**
1. 📊 Dashboard
2. ✏️ **Quiz Editor** - Tool tạo quiz nhanh, có export JSON
3. 👥 Quản lý Users
4. 📚 **Quản lý Bài học** - Quản lý toàn bộ hierarchy
5. 📋 Quản lý Đề thi
6. ⚙️ Cài đặt

### **Vấn đề:**
- **Quiz Editor** và **Quản lý Bài học** có chức năng trùng lặp (đều tạo/sửa quiz)
- Người dùng có thể bối rối: "Dùng tool nào?"
- Quiz Editor thiếu context rõ ràng về hierarchy

---

## 💡 ĐỀ XUẤT: TÁCH RIÊNG VÀ CẢI THIỆN

### **✅ NÊN TÁCH RIÊNG - Lý do:**

#### **1. Mục đích khác nhau:**

| Tool | Mục đích | Use Case |
|------|----------|----------|
| **Quiz Editor** | Tạo/sửa quiz nhanh | - Tạo quiz mới nhanh<br>- Export/Import JSON<br>- Quick edit |
| **Quản lý Bài học** | Quản lý toàn bộ hierarchy | - Xem tổng quan cấu trúc<br>- Quản lý Level/Series/Book/Chapter/Lesson<br>- Quản lý quiz trong context |

#### **2. Workflow khác nhau:**

**Quiz Editor:**
```
Chọn Level → Chọn Bộ sách → Chọn Book → Chọn Chapter → Chọn Lesson → Tạo/Sửa Quiz
```
- **Quick mode**: Tập trung vào quiz, không cần xem toàn bộ hierarchy
- **Export/Import**: Hữu ích cho backup, migration

**Quản lý Bài học:**
```
Xem toàn bộ hierarchy → Expand để xem chi tiết → Quản lý từng level
```
- **Full mode**: Xem và quản lý toàn bộ cấu trúc
- **Context aware**: Luôn biết quiz thuộc lesson/chapter/book nào

---

## 🎨 CẢI THIỆN ĐỀ XUẤT

### **1. Quiz Editor - Cải thiện cấu trúc:**

#### **Hiện tại:**
```
Level → Book → Chapter → Lesson → Quiz
```

#### **Đề xuất (theo yêu cầu):**
```
Level (N1-N5)
  └── Bộ sách (Series)
      └── Book (Sách)
          └── Chapter (Chương)
              └── Lesson (Bài)
                  └── Quiz
```

**Cải thiện:**
- ✅ Thêm dropdown **Bộ sách (Series)** sau Level
- ✅ Hiển thị rõ ràng hierarchy path: `Level > Series > Book > Chapter > Lesson`
- ✅ Auto-fill quiz title từ lesson title
- ✅ Thêm breadcrumb navigation
- ✅ Thêm link "Quản lý trong Content Management" → Chuyển sang ContentManagementPage với context đã chọn

### **2. Quản lý Bài học - Thêm link:**

- ✅ Thêm button "Mở Quiz Editor" trong quiz form
- ✅ Pass context (level, series, book, chapter, lesson) sang Quiz Editor
- ✅ Thêm export JSON feature (từ ContentManagementPage)

---

## 📐 CẤU TRÚC CHỈNH SỬA MỚI

### **Quiz Editor - Flow mới:**

```
┌─────────────────────────────────────────┐
│  Level: [N1 ▼]                          │
│  Bộ sách: [新完全マスター ▼]            │
│  Book: [文法 N1 ▼]                      │
│  Chapter: [第1章 ▼]                     │
│  Lesson: [Bài 1 ▼]                      │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Quiz Title: [Auto-fill từ Lesson]     │
│                                         │
│  Questions:                             │
│  [1] Câu hỏi 1...                       │
│  [2] Câu hỏi 2...                       │
│  ...                                    │
│                                         │
│  [➕ Thêm câu hỏi]                     │
│  [💾 Lưu Quiz] [📤 Export JSON]        │
│  [🔗 Quản lý trong Content Management] │
└─────────────────────────────────────────┘
```

### **Quản lý Bài học - Flow hiện tại (giữ nguyên):**

```
Level (N1-N5)
  └── Series (Bộ sách)
      └── Book (Sách)
          └── Chapter (Chương)
              └── Lesson (Bài)
                  └── Quiz (Câu hỏi)
```

**Thêm:**
- Button "Mở Quiz Editor" trong quiz form
- Export JSON feature

---

## ✅ KẾT LUẬN

### **Khuyến nghị: TÁCH RIÊNG và CẢI THIỆN**

1. ✅ **Giữ cả 2 tools** - Mỗi tool phục vụ mục đích khác nhau
2. ✅ **Cải thiện Quiz Editor** - Thêm Series level, cải thiện hierarchy
3. ✅ **Cải thiện ContentManagementPage** - Thêm link đến Quiz Editor, thêm export JSON
4. ✅ **Tạo integration** - Link giữa 2 tools để chuyển context

### **Lợi ích:**
- ✅ **Flexibility**: User chọn tool phù hợp với workflow
- ✅ **Quick Access**: Quiz Editor cho power users
- ✅ **Full Management**: ContentManagementPage cho quản lý toàn diện
- ✅ **Context Aware**: Cả 2 tools đều hiểu rõ hierarchy

---

## 📝 NEXT STEPS

1. ⏳ **Cải thiện Quiz Editor:**
   - Thêm dropdown Series (Bộ sách)
   - Cải thiện hierarchy display
   - Thêm breadcrumb
   - Thêm link đến ContentManagementPage

2. ⏳ **Cải thiện ContentManagementPage:**
   - Thêm button "Mở Quiz Editor" trong quiz form
   - Thêm export JSON feature
   - Pass context khi chuyển sang Quiz Editor

3. ⏳ **Tạo integration:**
   - URL params để pass context: `/admin/quiz-editor?level=n1&series=shinkanzen&book=grammar-n1&chapter=ch1&lesson=lesson1`
   - Auto-fill form khi có context

---

**Tài liệu này đề xuất cách tổ chức sidebar admin và cải thiện 2 tools.**

