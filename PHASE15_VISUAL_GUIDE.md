# 🎨 Phase 1.5 Visual Guide

## Hướng Dẫn Sử Dụng Bằng Hình Ảnh

**Designed for:** Non-technical admins  
**Goal:** Hiểu và sử dụng trong 5 phút

---

## 📖 Table of Contents

1. [Mở Modal](#1-mở-modal)
2. [Chọn Loại Nội Dung](#2-chọn-loại-nội-dung)
3. [Chọn Chế Độ Nhập Liệu](#3-chọn-chế-độ-nhập-liệu)
4. [Upload File](#4-upload-file-từ-máy)
5. [Soạn HTML](#5-soạn-html-trực-tiếp)
6. [Sắp Xếp Thứ Tự](#6-sắp-xếp-thứ-tự-hiển-thị)
7. [Save & Preview](#7-save--preview)

---

## 1. Mở Modal

### Bước 1: Navigate

```
Admin Panel → Quản lý Bài học → [Chọn Book] → [Chọn Chapter]
```

### Bước 2: Click Add

```
┌────────────────────────────┐
│  📚 Demo Book              │
│  └─ 📖 Chapter 1           │
│      └─ [➕ Add Lesson] ←Click!
└────────────────────────────┘
```

### Bước 3: Modal Opens!

```
┌──────────────────────────────────────┐
│  ➕ Thêm Bài học mới         [X]   │← Modal!
│     Chương: Bài 1                   │
├──────────────────────────────────────┤
│  📋 Loại Nội Dung *                 │
│  [📖 Ngữ pháp ▼]                   │
│  ...                                │
└──────────────────────────────────────┘
```

**✅ Modal mở thành công!**

---

## 2. Chọn Loại Nội Dung

### Click Dropdown

```
┌──────────────────────────────────┐
│ 📋 Loại Nội Dung *              │
│ [📚 Từ vựng (Vocabulary) ▼] ←Click!
└──────────────────────────────────┘
   ↓ Opens dropdown
┌──────────────────────────────────┐
│ 📖 Ngữ pháp (Grammar)           │
│ 📚 Từ vựng (Vocabulary)    ←Select!
│ 🈯 Kanji                         │
│ 🎯 Hỗn hợp (Mixed)              │
│ 📄 Đọc hiểu (Reading)           │
│ 🎧 Nghe (Listening)             │
└──────────────────────────────────┘
```

### See Features

```
┌──────────────────────────────────┐
│ 📚 Từ vựng (Vocabulary)         │← Selected
│ Lý thuyết + Flashcard SRS + Quiz│
│                                  │
│ [📖 LÝ THUYẾT] [🎴 FLASHCARD]   │← Badges show
│ [📊 QUIZ]                        │   what's enabled
└──────────────────────────────────┘
```

**✅ Content type selected!**

---

## 3. Chọn Chế Độ Nhập Liệu

### 3 Buttons to Choose From

```
┌──────────────────────────────────────┐
│ [🔗 Nhập URL]  [📤 Upload]  [✍️ Editor]│
│      ↑              ↑            ↑     │
│   Có sẵn URL   Upload file  Soạn web  │
└──────────────────────────────────────┘
```

**Pick one:**

- **🔗 Nhập URL:** Nếu file đã có trên server
- **📤 Upload File:** Nếu file ở máy tính
- **✍️ Soạn Trực Tiếp:** Nếu muốn tạo content ngay

---

## 4. Upload File Từ Máy

### Click "📤 Upload File"

```
Active button turns purple:
[🔗 Nhập URL]  [📤 Upload File]  [✍️ Editor]
               └─ Purple + shadow! ✨
```

### Drag & Drop Zone Appears

```
┌──────────────────────────────────────┐
│           📁                         │← Big file icon
│   📤 Drag & Drop hoặc Click         │
│      để chọn file                    │
│                                      │
│  Hỗ trợ: PDF, DOCX, Images, Audio..│
│         (max 50MB)                   │
│                                      │
│  [📄 PDF] [🖼️ IMG] [🎧 MP3]         │← Format badges
│  [🎬 VIDEO] [📝 TEXT] [📦 50MB]     │
└──────────────────────────────────────┘
```

### Option A: Drag File

```
Desktop                    Browser
┌─────┐                   ┌──────────┐
│📄PDF│ ─────drag─────→  │   📁     │
└─────┘                   │ 📥 Thả!  │← Zone highlights!
                          └──────────┘
                          Border: Purple
                          Background: Purple-50
```

### Option B: Click to Browse

```
Click zone → File dialog opens:
┌────────────────────────────┐
│ Open File                  │
│ ┌────────────────────────┐ │
│ │ 📁 Documents           │ │
│ │   📄 lesson1.pdf       │←Select!
│ │   📄 vocab.pdf         │ │
│ └────────────────────────┘ │
│ [Open] [Cancel]            │
└────────────────────────────┘
```

### Upload Progress

```
┌──────────────────────────────────────┐
│          ⏳ (bounce animation)       │
│       Đang upload...                 │
│                                      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  75%          │← Animated!
│   75% - Đang xử lý file...          │
└──────────────────────────────────────┘
```

### Success!

```
Alert popup:
┌────────────────────────────┐
│ ✅ Upload thành công!      │
│                            │
│ File: food-vocab.pdf       │
│ Kích thước: 2.5MB         │
│ Đường dẫn:                 │
│ /pdfs/uploaded/1732...pdf  │
│                            │
│ 💡 File đã được lưu!       │
│ [OK]                       │
└────────────────────────────┘
```

**✅ File uploaded! URL auto-filled!**

---

## 5. Soạn HTML Trực Tiếp

### Click "✍️ Soạn Trực Tiếp"

```
Active button turns green:
[🔗 URL]  [📤 Upload]  [✍️ Soạn Trực Tiếp]
                       └─ Green + shadow! ✨
```

### HTML Editor Appears

```
┌──────────────────────────────────────┐
│ Toolbar:                             │
│ [📝H2] [📄P] [📋UL] [B] [</>]       │← Quick buttons
├──────────────────────────────────────┤
│ Editor (type here):                  │
│ <h2>Ngữ pháp: は</h2>               │
│ <p>Trợ từ は được dùng để...</p>    │
│                                      │
├──────────────────────────────────────┤
│ 👁️ Live Preview:        [🗑️ Xóa]  │
│ ┌────────────────────────────────┐  │
│ │ Ngữ pháp: は                   │  │← Auto-render!
│ │ Trợ từ は được dùng để...      │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Using Toolbar

**Click "📝 H2" button:**
```
Before cursor: <h2>|</h2>
After typing: <h2>Tiêu đề|</h2>
Preview shows: 
  ┌───────────┐
  │ Tiêu đề   │ ← Formatted!
  └───────────┘
```

**Click "📋 UL" button:**
```
Inserts:
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

Preview shows:
  • Item 1
  • Item 2
```

**Select text + Click "B":**
```
Selected: "quan trọng"
Click [B]
Result: <strong>quan trọng</strong>
Preview: **quan trọng** (bold!)
```

**✅ HTML content created!**

---

## 6. Sắp Xếp Thứ Tự Hiển Thị

### Display Order Section

```
┌──────────────────────────────────────┐
│ ⚡ Thứ Tự Hiển Thị    [🔄 Reset]    │
├──────────────────────────────────────┤
│ Kéo thả để sắp xếp...                │
│                                      │
│ [1] 🎬 Video    [⋮][↑][↓] ✅       │← Draggable!
│ [2] 📄 PDF      [⋮][↑][↓] ✅       │
│ [3] 📝 HTML     [⋮][↑][↓] ⚠️       │
│ [4] 🎧 Audio    [⋮][↑][↓] ✅       │
└──────────────────────────────────────┘
```

### Drag to Reorder

**Step 1: Grab PDF (position 2)**
```
Cursor: grab (hand icon)
[2] 📄 PDF ← Click & hold
Opacity: 50% (being dragged)
```

**Step 2: Drag to position 1**
```
Hover over Video:
[1] 🎬 Video ← Highlighted (ring yellow)
Scale: 102% (slightly larger)
```

**Step 3: Drop**
```
Release mouse:
New order:
[1] 📄 PDF      ← Moved up!
[2] 🎬 Video    ← Moved down
[3] 📝 HTML
[4] 🎧 Audio
```

### Or Use Arrow Buttons

```
PDF at position 2:
Click [↑] → Move to position 1
Click [↓] → Move to position 3
```

### Preview Shows Result

```
┌────────────────────────────┐
│ 👁️ Học viên sẽ thấy:       │
│ 1. 📄 PDF                  │← New order!
│ 2. 🎬 Video                │
│ 3. 📝 HTML (chưa có - skip)│
│ 4. 🎧 Audio                │
└────────────────────────────┘
```

**✅ Custom order configured!**

---

## 7. Save & Preview

### Fill All Fields

```
✅ Content Type: Vocabulary
✅ ID: lesson-1
✅ Title: Food Vocabulary
✅ Theory:
   - PDF: uploaded ✓
   - Audio: uploaded ✓
   - HTML: created ✓
   - Display order: PDF → Audio → HTML ✓
✅ Flashcard: SRS enabled ✓
```

### Click Save

```
[💾 Tạo Bài học] ← Click!
     ↓
Loading... (0.5s)
     ↓
┌────────────────────────────┐
│ ✅ ĐÃ LƯU THÀNH CÔNG!     │
│                            │
│ 📚 Đã thêm lesson:        │
│    - ID: lesson-1          │
│    - Tên: Food Vocabulary  │
│    - Loại: vocabulary      │
│    - SRS: BẬT ✅          │
│                            │
│ [OK]                       │
└────────────────────────────┘
```

### Verify in HierarchyView

```
Demo Book
└─ Chapter 1
   └─ 📘 Food Vocabulary ← New lesson!
      └─ [✏️ Edit] [🗑️ Delete]
```

**✅ Lesson created successfully!**

---

## 🎓 Complete Example: Vocabulary Lesson

### What You Want to Create

```
Lesson: "N5 Food Vocabulary"
Content:
- PDF: Word list with images
- Audio: Pronunciation guide
- HTML: Study tips
- SRS: 50 flashcards

Display order: PDF → Audio → HTML
```

### Step-by-Step (5 minutes)

**Minute 1: Basic Info**
```
1. Content Type: 📚 Vocabulary
2. ID: lesson-food-1
3. Title: N5 Food Vocabulary
```

**Minute 2: Upload PDF**
```
1. Theory Tab → [📤 Upload File]
2. Drag "food-vocab.pdf" → Drop
3. Wait: [▓▓▓▓▓▓▓▓▓▓] 100% (2s)
4. ✅ Upload success!
```

**Minute 3: Upload Audio**
```
1. Switch mode: [🔗 Nhập URL]
2. Audio URL: /audio/food-pronunciation.mp3
3. Or upload another file!
```

**Minute 4: Add HTML Tips**
```
1. Switch mode: [✍️ Soạn Trực Tiếp]
2. Click [📝 H2] → Type "💡 Tips"
3. Click [📋 UL] → Add 3 tips
4. Preview shows formatted text ✓
```

**Minute 5: Configure & Save**
```
1. Display Order:
   - Drag PDF to #1
   - Drag Audio to #2
   - HTML stays at #3
2. Flashcard Tab → Enable SRS
3. Click [💾 Tạo Bài học]
4. ✅ Done!
```

**Total: 5 minutes!** (Before: 20 minutes)  
**Time saved: 75%!** 🚀

---

## 🎯 Common Scenarios

### Scenario 1: Grammar Lesson (PDF + HTML)

```
1. Upload PDF (grammar rules)
2. Create HTML (examples + tips)
3. Set order: HTML first (for quick read)
4. Save ✓
```

### Scenario 2: Vocabulary (PDF + Audio + SRS)

```
1. Upload PDF (word list)
2. Upload Audio (pronunciation)
3. Enable SRS (flashcards)
4. Set order: PDF → Audio
5. Save ✓
```

### Scenario 3: Listening (Video + Audio + PDF)

```
1. Upload Video (listening exercise)
2. Upload Audio (audio-only version)
3. Upload PDF (transcript)
4. Set order: Audio → Video → PDF
5. Save ✓
```

---

## 🐛 Troubleshooting

### Problem: Upload không work

**Check:**
```
1. File size < 50MB? ✓
2. Format supported? (PDF, JPG, MP3...) ✓
3. Browser cho phép? (check permissions) ✓
```

**Solution:** Try smaller file or different format

---

### Problem: Drag & drop không work

**Check:**
```
1. Cursor có icon "grab"? ✓
2. Ô highlight khi drag over? ✓
```

**Solution:** Try arrow buttons ↑↓ instead

---

### Problem: Preview không hiện

**Check:**
```
1. HTML content có valid? ✓
2. Scroll xuống? (preview ở dưới) ✓
```

**Solution:** Check HTML syntax, remove errors

---

## ✅ Quick Reference Card

### Modal Sections (Top → Bottom)

```
1. 📋 Content Type Selector
   → Choose lesson type

2. 🆔 Basic Info
   → ID, Title, Description

3. ╔══ TABS ══╗
   ║ Theory  ║ Flashcard  ║ Quiz
   ╚═════════╝

4. [🔗 URL] [📤 Upload] [✍️ Editor]
   → Choose input mode

5. ⚡ Display Order
   → Drag to reorder

6. [💾 Save] [❌ Cancel]
```

### Keyboard Shortcuts

```
- Ctrl+K: Search (global)
- Esc: Close modal
- Tab: Next field
- Enter: Submit form
```

---

## 🎉 Success Checklist

Before clicking Save, verify:

- [ ] Content type selected
- [ ] ID filled (unique)
- [ ] Title filled
- [ ] At least 1 content (PDF/HTML/Audio/Video)
- [ ] Display order configured (if multiple content)
- [ ] Download permission set
- [ ] SRS enabled (if vocabulary/kanji)
- [ ] Preview looks good

**All checked?** → Click 💾 Save! ✅

---

## 📊 Tips for Efficiency

### Create Faster

1. **Template lessons** - Duplicate existing lesson, edit content
2. **Bulk upload** - Upload all PDFs first, then assign to lessons
3. **Reuse HTML** - Copy HTML from previous lessons
4. **Default order** - Use default if content is standard

### Organize Better

1. **Naming:** `lesson-[chapter]-[topic]-[number]`
2. **Folders:** `/pdfs/n1/shinkanzen/chapter1/`
3. **Consistency:** Same order for same lesson type
4. **Tags:** Add metadata for search (future)

---

## 🎉 You're Ready!

**Congratulations!** Bạn đã biết cách:

- ✅ Upload file từ máy
- ✅ Soạn HTML trực tiếp
- ✅ Sắp xếp thứ tự hiển thị
- ✅ Save lesson hoàn chỉnh

**Start creating amazing lessons!** 🚀

---

**Visual Guide Complete!**  
**Estimated Reading Time:** 5 minutes  
**Difficulty:** Easy 👍  
**Status:** Ready to Use!

Ganbatte! 💪

