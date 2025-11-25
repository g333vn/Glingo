# 📅 HƯỚNG DẪN BACKUP THEO KHOẢNG THỜI GIAN

## 🎯 TỔNG QUAN

Tính năng **Backup theo Khoảng Thời gian** cho phép bạn backup đồng loạt các dữ liệu đã tạo trong:
- 1 ngày cụ thể
- 1 khoảng thời gian (từ ngày X đến ngày Y)
- Nhiều loại dữ liệu cùng lúc (Books, Series, Exams, Quizzes, etc.)

---

## 🚀 CÁCH SỬ DỤNG

### **Bước 1: Truy cập Backup & Restore**

1. Vào Admin Panel
2. Click **"Backup & Restore"** trong sidebar
3. Click tab **"Backup theo Thời gian"**

---

### **Bước 2: Chọn khoảng thời gian**

**Cách 1: Dùng Quick Options (Nhanh)**

- Click **"Hôm nay"** → Tự động set từ hôm nay đến hôm nay
- Click **"Tuần này"** → Tự động set từ thứ 2 đến chủ nhật
- Click **"Tháng này"** → Tự động set từ ngày 1 đến ngày cuối tháng

**Cách 2: Chọn thủ công**

- **Từ ngày:** Chọn ngày bắt đầu
- **Đến ngày:** Chọn ngày kết thúc

---

### **Bước 3: Chọn loại dữ liệu**

Chọn một hoặc nhiều loại dữ liệu:

- ☑ **Tất cả** - Backup tất cả loại dữ liệu
- ☑ **Books** - Chỉ backup Books
- ☑ **Series** - Chỉ backup Series
- ☑ **Chapters** - Chỉ backup Chapters
- ☑ **Lessons** - Chỉ backup Lessons
- ☑ **Quizzes** - Chỉ backup Quizzes
- ☑ **Exams** - Chỉ backup Exams

**Lưu ý:**
- Nếu chọn "Tất cả", các option khác sẽ bị bỏ chọn
- Nếu chọn các option khác, "Tất cả" sẽ bị bỏ chọn

---

### **Bước 4: Chọn Options (Tùy chọn)**

☑ **Bao gồm dữ liệu liên quan**

- ✅ **Bật:** Khi backup Books → Tự động backup Chapters, Lessons, Quizzes của Books đó
- ❌ **Tắt:** Chỉ backup Books, không backup dữ liệu liên quan

**Ví dụ:**
- Backup Books từ 2025-01-01 đến 2025-01-31
- Bật "Bao gồm dữ liệu liên quan"
- Kết quả: Books + Tất cả Chapters, Lessons, Quizzes của các Books đó

---

### **Bước 5: Preview (Xem trước)**

1. Click nút **"Preview"**
2. Xem tóm tắt:
   - Số lượng Books sẽ export
   - Số lượng Series sẽ export
   - Số lượng Chapters sẽ export
   - Số lượng Lessons sẽ export
   - Số lượng Quizzes sẽ export
   - Số lượng Exams sẽ export

**Lưu ý:** Preview chỉ hiển thị số lượng, không export thực sự.

---

### **Bước 6: Export**

1. Click nút **"Export"**
2. File sẽ download về `Downloads/`
3. Tên file: `elearning-backup-date-range-2025-01-01_to_2025-01-31_10-30-45.json`

---

## 📋 VÍ DỤ SỬ DỤNG

### **Ví dụ 1: Backup hôm nay**

```
1. Click "Hôm nay"
2. Chọn "Tất cả"
3. Click "Preview" → Xem số lượng
4. Click "Export" → Download file
```

---

### **Ví dụ 2: Backup tuần này (chỉ Exams)**

```
1. Click "Tuần này"
2. Chỉ chọn ☑ "Exams"
3. Bỏ chọn "Bao gồm dữ liệu liên quan"
4. Click "Preview" → Xem số lượng Exams
5. Click "Export" → Download file
```

---

### **Ví dụ 3: Backup tháng này (Books + Exams)**

```
1. Click "Tháng này"
2. Chọn ☑ "Books" và ☑ "Exams"
3. Bật ☑ "Bao gồm dữ liệu liên quan"
4. Click "Preview" → Xem số lượng
5. Click "Export" → Download file
```

---

### **Ví dụ 4: Backup khoảng thời gian tùy chỉnh**

```
1. Chọn "Từ ngày": 2025-01-01
2. Chọn "Đến ngày": 2025-01-31
3. Chọn ☑ "Books", ☑ "Series", ☑ "Exams"
4. Click "Preview" → Xem số lượng
5. Click "Export" → Download file
```

---

## ⚙️ CÁCH HOẠT ĐỘNG

### **Metadata Timestamp**

Tất cả dữ liệu từ bây giờ sẽ có metadata:
- `createdAt` - Ngày tạo
- `updatedAt` - Ngày cập nhật

**Ví dụ:**
```json
{
  "id": "book-1",
  "title": "Book Title",
  "level": "n1",
  "createdAt": "2025-01-19T10:30:45.123Z",
  "updatedAt": "2025-01-19T10:30:45.123Z"
}
```

---

### **Filter theo Date Range**

System sẽ filter dữ liệu dựa trên:
- **Books, Series, Chapters, Lessons, Quizzes:** Dùng `createdAt`
- **Exams:** Dùng `date` (nếu có) hoặc `createdAt` (fallback)

**Logic:**
```javascript
// Kiểm tra item có trong date range không
if (item.createdAt >= startDate && item.createdAt <= endDate) {
  // Include in export
}
```

---

### **Bao gồm dữ liệu liên quan**

Khi bật option này:

**Backup Books:**
- ✅ Books trong date range
- ✅ Tất cả Chapters của Books đó (không filter date)
- ✅ Tất cả Lessons của Chapters đó (không filter date)
- ✅ Tất cả Quizzes của Lessons đó (không filter date)

**Lý do:**
- Đảm bảo tính toàn vẹn dữ liệu
- Books không thể thiếu Chapters, Lessons, Quizzes

---

## 📊 CẤU TRÚC FILE EXPORT

```json
{
  "timestamp": "2025-01-19T10:30:45.123Z",
  "version": "2.0.0",
  "type": "date-range",
  "dateRange": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "dataTypes": ["books", "exams"],
  "includeRelated": true,
  "books": {
    "n1": [...],
    "n2": [...]
  },
  "series": {...},
  "chapters": {...},
  "lessons": {...},
  "quizzes": {...},
  "exams": {...},
  "summary": {
    "books": 5,
    "series": 2,
    "chapters": 10,
    "lessons": 25,
    "quizzes": 25,
    "exams": 3
  }
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Dữ liệu cũ không có timestamp:**

- ⚠️ Dữ liệu tạo trước khi có tính năng này **không có** `createdAt`/`updatedAt`
- ✅ Dữ liệu mới từ bây giờ **sẽ có** timestamp
- 💡 **Giải pháp:** Dữ liệu cũ sẽ không được filter, chỉ dữ liệu mới có timestamp mới được backup

---

### **2. Exams dùng field `date`:**

- ✅ Exams có field `date` (ngày của exam)
- ✅ System sẽ dùng `date` để filter exams
- ✅ Fallback về `createdAt` nếu không có `date`

---

### **3. Bao gồm dữ liệu liên quan:**

- ✅ **Bật:** Đảm bảo tính toàn vẹn, nhưng file có thể lớn hơn
- ❌ **Tắt:** Chỉ backup dữ liệu được chọn, file nhỏ hơn

---

## 🎯 BEST PRACTICES

### **1. Backup định kỳ:**

```
Mỗi tuần:
1. Click "Tuần này"
2. Chọn "Tất cả"
3. Bật "Bao gồm dữ liệu liên quan"
4. Export
```

---

### **2. Backup sau khi nhập nhiều:**

```
Sau khi nhập 10 Books mới:
1. Chọn ngày hôm nay
2. Chọn "Books"
3. Bật "Bao gồm dữ liệu liên quan"
4. Export
```

---

### **3. Backup chỉ Exams:**

```
Backup tất cả Exams của tháng:
1. Click "Tháng này"
2. Chỉ chọn "Exams"
3. Export
```

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "Không tìm thấy dữ liệu trong khoảng thời gian này"**

**Nguyên nhân:**
- Không có dữ liệu nào có `createdAt` trong khoảng thời gian này
- Dữ liệu cũ không có timestamp

**Giải pháp:**
1. Kiểm tra dữ liệu có được tạo trong khoảng thời gian không
2. Dữ liệu mới từ bây giờ sẽ có timestamp
3. Dùng "Export All" để backup tất cả (kể cả dữ liệu cũ)

---

### **Lỗi: Preview hiển thị 0 items**

**Nguyên nhân:**
- Không có dữ liệu trong khoảng thời gian
- Dữ liệu cũ không có timestamp

**Giải pháp:**
- Mở rộng khoảng thời gian
- Hoặc dùng "Export All" trong tab "Export/Import Thông thường"

---

## 📝 TÓM TẮT

### **Tính năng:**

1. ✅ Backup theo ngày cụ thể
2. ✅ Backup theo khoảng thời gian
3. ✅ Chọn nhiều loại dữ liệu cùng lúc
4. ✅ Quick Options (Hôm nay, Tuần này, Tháng này)
5. ✅ Preview trước khi export
6. ✅ Option bao gồm dữ liệu liên quan

### **Cách sử dụng:**

1. Vào **Backup & Restore** → Tab **"Backup theo Thời gian"**
2. Chọn khoảng thời gian (Quick Options hoặc thủ công)
3. Chọn loại dữ liệu
4. Chọn options (nếu cần)
5. Click **"Preview"** để xem trước
6. Click **"Export"** để download

---

**Tính năng đã sẵn sàng sử dụng!** 🚀✅

