# 📚 BookCard - Hướng Dẫn Sử Dụng Cho Admin

## 🎯 Tổng Quan

Component `BookCard` đã được nâng cấp để hỗ trợ **4 trạng thái khác nhau**:

1. ✅ **Sách có ảnh bìa** (normal)
2. 🔜 **Sách sắp ra mắt** (coming soon)
3. 🆕 **Sách với status đặc biệt** (new edition, updated, etc.)
4. 📄 **Sách không có ảnh bìa** (no cover)

### 🌍 Language Policy

**TẤT CẢ nội dung trong BookCard luôn hiển thị bằng TIẾNG ANH** bất kể ngôn ngữ đang chọn:
- ✅ Title: Luôn tiếng Anh
- ✅ "Coming Soon": Luôn tiếng Anh
- ✅ Status badges: Luôn tiếng Anh
- ✅ "No Cover Image": Luôn tiếng Anh

**Lý do:** Đồng nhất với Header và Footer, tạo consistency trong UI.

---

## 📖 Cách Sử Dụng Trong Admin Panel

### Scenario 1: Thêm sách MỚI có ảnh bìa

**Bước 1:** Admin Panel → Content Management → Add Book

**Bước 2:** Điền thông tin:
```
Title: "Shinkanzen Master N1 Bunpou"
Image URL: "/book_card/n1/shinkanzen/bunpou.jpg"
Category: "新完全マスター"
```

**Kết quả:** Card hiển thị với ảnh bìa đẹp

```jsx
<BookCard
  title="Shinkanzen Master N1 Bunpou"
  imageUrl="/book_card/n1/shinkanzen/bunpou.jpg"
/>
```

---

### Scenario 2: Thêm sách SẮP RA MẮT (chưa có ảnh)

**Bước 1:** Admin Panel → Add Book

**Bước 2:** Điền thông tin:
```
Title: "New JLPT N1 2025 Complete Guide"
Image URL: (để trống)
Is Coming Soon: ✓ (check)
Category: "New Releases"
```

**Kết quả:** Card hiển thị placeholder với badge "COMING SOON"

```jsx
<BookCard
  title="New JLPT N1 2025 Complete Guide"
  isComingSoon={true}
/>
```

**Giao diện:**
- 📚 Icon book lớn
- 🏷️ Badge vàng "COMING SOON"
- 🎨 Background màu vàng nhạt (khác với normal)
- ✨ Rotate animation khi hover

---

### Scenario 3: Thêm sách với STATUS ĐẶC BIỆT

**Bước 1:** Admin Panel → Add Book

**Bước 2:** Điền thông tin:
```
Title: "TRY! N1 Grammar - New Edition"
Image URL: (để trống hoặc có ảnh)
Status: "New Edition"
Category: "TRY!"
```

**Kết quả:** Card hiển thị badge xanh với text "NEW EDITION"

```jsx
<BookCard
  title="TRY! N1 Grammar - New Edition"
  status="New Edition"
/>
```

**Custom Status Options:**
- `"New Edition"` - Phiên bản mới
- `"Updated"` - Đã cập nhật
- `"Revised"` - Đã chỉnh sửa
- `"Premium"` - Cao cấp
- Bất kỳ text nào khác!

---

### Scenario 4: Thêm sách KHÔNG CÓ ẢNH (tạm thời)

**Bước 1:** Admin Panel → Add Book

**Bước 2:** Điền thông tin:
```
Title: "Japanese Kanji Handbook"
Image URL: (để trống)
Category: "Kanji"
```

**Kết quả:** Card hiển thị placeholder đơn giản

```jsx
<BookCard
  title="Japanese Kanji Handbook"
  imageUrl={null}
/>
```

**Giao diện:**
- 📚 Icon book
- 📝 Text "No Cover Image"
- 🎨 Background gradient xám

---

## 🔧 Admin Panel - Form Fields

### Recommended Form Structure:

```jsx
<form>
  {/* Title - Required */}
  <input
    type="text"
    name="title"
    placeholder="Book Title"
    required
  />

  {/* Image URL - Optional */}
  <input
    type="text"
    name="imageUrl"
    placeholder="/book_card/n1/shinkanzen/bunpou.jpg (optional)"
  />

  {/* Coming Soon - Checkbox */}
  <label>
    <input type="checkbox" name="isComingSoon" />
    Coming Soon (sách sắp ra mắt)
  </label>

  {/* Status - Optional */}
  <select name="status">
    <option value="">-- No Status --</option>
    <option value="New Edition">New Edition</option>
    <option value="Updated">Updated</option>
    <option value="Revised">Revised</option>
    <option value="Premium">Premium</option>
  </select>

  {/* Category - Required */}
  <input
    type="text"
    name="category"
    placeholder="Category"
    required
  />
</form>
```

---

## 📊 Data Structure

### Book Object Schema:

```javascript
{
  id: string,              // Required - unique ID
  title: string,           // Required - book title
  imageUrl: string | null, // Optional - cover image URL
  isComingSoon: boolean,   // Optional - default: false
  status: string | null,   // Optional - custom status
  category: string         // Required - for filtering
}
```

### Examples:

```javascript
// Example 1: Normal book
{
  id: 'shinkanzen-n1-bunpou',
  title: 'Shinkanzen Master N1 Bunpou',
  imageUrl: '/book_card/n1/shinkanzen/bunpou.jpg',
  category: '新完全マスター'
}

// Example 2: Coming soon
{
  id: 'new-jlpt-2025',
  title: 'New JLPT N1 2025',
  isComingSoon: true,
  category: 'New Releases'
}

// Example 3: With status
{
  id: 'try-n1-new',
  title: 'TRY! N1 - New Edition',
  status: 'New Edition',
  category: 'TRY!'
}

// Example 4: No cover
{
  id: 'kanji-handbook',
  title: 'Kanji Handbook',
  imageUrl: null,
  category: 'Kanji'
}
```

---

## 🎨 Visual Comparison

### Normal Book (có ảnh):
```
┌─────────────────┐
│                 │
│   [BOOK IMAGE]  │
│                 │
├─────────────────┤
│  BOOK TITLE     │ ← Yellow background
└─────────────────┘
```

### Coming Soon:
```
┌─────────────────┐
│  [Background]   │
│     📚          │ ← Large book icon
│  COMING SOON    │ ← Yellow badge (rotated)
├─────────────────┤
│  BOOK TITLE     │ ← Light yellow background
└─────────────────┘
```

### With Status:
```
┌─────────────────┐
│  [Background]   │
│     📚          │
│  NEW EDITION    │ ← Blue badge
├─────────────────┤
│  BOOK TITLE     │
└─────────────────┘
```

### No Cover:
```
┌─────────────────┐
│  [Background]   │
│     📚          │
│ No Cover Image  │ ← Gray text
├─────────────────┤
│  BOOK TITLE     │
└─────────────────┘
```

---

## ⚠️ Important Notes

### Priority Rules (nếu có nhiều props):

1. **`isComingSoon = true`**
   - → Luôn hiển thị "COMING SOON" badge
   - → Ignore `status` prop
   - → Light yellow background

2. **`status` có value + NO `isComingSoon`**
   - → Hiển thị custom status badge
   - → Normal yellow background

3. **Chỉ có `imageUrl`**
   - → Hiển thị ảnh bình thường

4. **Không có gì**
   - → Hiển thị placeholder với "No Cover Image"

### Image Error Handling:

- Nếu `imageUrl` có value nhưng **load bị lỗi** (404, network error)
- → Tự động fallback to placeholder
- → User không thấy broken image icon

### Loading State:

- Khi image đang load → Hiển thị skeleton (pulse animation)
- Load xong → Fade in smooth

---

## 🚀 Testing Checklist

Admin test các scenario sau:

- [ ] Add sách có ảnh → Card hiển thị ảnh đúng
- [ ] Add sách không có ảnh → Placeholder xuất hiện
- [ ] Add sách coming soon → Badge "COMING SOON" xuất hiện
- [ ] Add sách với status → Badge status xuất hiện
- [ ] Sửa sách từ coming soon → normal → Chuyển đổi smooth
- [ ] Delete ảnh URL → Card tự động chuyển sang placeholder
- [ ] Ảnh URL broken → Fallback to placeholder
- [ ] Hover card → Animations hoạt động
- [ ] Mobile responsive → Card vẫn đẹp

---

## 💡 Tips cho Admin

1. **Coming Soon Books:**
   - Sử dụng khi sách chưa có ảnh bìa
   - Hoặc khi content chưa sẵn sàng
   - Tạo anticipation cho users

2. **Status Badges:**
   - Dùng để highlight sách đặc biệt
   - "New Edition", "Updated", "Premium"
   - Giúp users dễ identify

3. **Image URLs:**
   - Nên có cấu trúc rõ ràng
   - Ví dụ: `/book_card/{level}/{series}/{book_name}.jpg`
   - Test URL trước khi save

4. **Placeholders:**
   - Đẹp và professional
   - Không làm giảm UX
   - Khuyến khích upload ảnh bìa sau

---

**Version**: 2.0  
**Author**: AI Assistant  
**Date**: 2024

