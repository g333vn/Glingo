# 💾 DỮ LIỆU NẠP VÀO - LƯU Ở ĐÂU VÀ TÍNH CHẤT

## ❓ CÂU HỎI

1. **Dữ liệu nạp vào sẽ được lưu ở đâu?**
2. **Nó có phải là dữ liệu cố định không?**

---

## 📍 VỊ TRÍ LƯU TRỮ

### **1. IndexedDB (Primary - Ưu tiên)**

**Database Name:** `elearning-db`  
**Version:** 2

#### **Vị trí trên máy tính:**

**Windows:**
```
Chrome/Edge:
C:\Users\[TênUser]\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\https_192.168.1.233_0.indexeddb.leveldb\

Firefox:
C:\Users\[TênUser]\AppData\Roaming\Mozilla\Firefox\Profiles\[Profile]\storage\default\https+++192.168.1.233\idb\
```

**Mac:**
```
Chrome/Edge:
~/Library/Application Support/Google/Chrome/Default/IndexedDB/https_192.168.1.233_0.indexeddb.leveldb/

Firefox:
~/Library/Application Support/Firefox/Profiles/[Profile]/storage/default/https+++192.168.1.233/idb/
```

**Linux:**
```
Chrome/Edge:
~/.config/google-chrome/Default/IndexedDB/https_192.168.1.233_0.indexeddb.leveldb/

Firefox:
~/.mozilla/firefox/[Profile]/storage/default/https+++192.168.1.233/idb/
```

### **2. localStorage (Fallback - Nếu IndexedDB không khả dụng)**

**Vị trí:** Cùng thư mục với IndexedDB, nhưng trong file `localStorage`

**Key pattern:**
- `elearning_books_n1` - Books của level N1
- `elearning_series_n1` - Series của level N1
- `elearning_chapters_[bookId]` - Chapters của book
- `elearning_lessons_[bookId]_[chapterId]` - Lessons
- `elearning_quiz_[bookId]_[chapterId]_[lessonId]` - Quiz

---

## 🔄 TÍNH CHẤT CỦA DỮ LIỆU

### **❌ KHÔNG PHẢI DỮ LIỆU CỐ ĐỊNH**

Dữ liệu bạn nạp vào **KHÔNG CỐ ĐỊNH** - có thể:

1. ✅ **Thay đổi (Edit)**
   - Sửa tên Series, Book, Chapter, Lesson
   - Sửa nội dung Quiz, câu hỏi
   - Cập nhật metadata

2. ✅ **Xóa (Delete)**
   - Xóa Series, Book, Chapter, Lesson
   - Xóa Quiz, câu hỏi
   - Xóa Exam

3. ✅ **Thêm mới (Add)**
   - Thêm Series, Book mới
   - Thêm Chapter, Lesson mới
   - Thêm Quiz, câu hỏi mới

4. ⚠️ **Bị mất nếu:**
   - Xóa browser data (Clear browsing data)
   - Xóa cache của trình duyệt
   - Uninstall trình duyệt
   - Format máy tính
   - Chuyển sang thiết bị khác (KHÔNG tự động sync)

---

## 🔍 CHI TIẾT VỀ LƯU TRỮ

### **Khi bạn Import dữ liệu:**

```javascript
// 1. Bạn chọn file JSON trong Admin Panel
// 2. Click "Import"
// 3. Dữ liệu được lưu vào:

if (IndexedDB available) {
  // ✅ Lưu vào IndexedDB (unlimited storage)
  await indexedDBManager.importAll(data);
  // → Lưu vào: C:\Users\...\Chrome\User Data\...\IndexedDB\elearning-db
} else {
  // ⚠️ Fallback: Lưu vào localStorage (5-10 MB limit)
  await localStorageManager.importAll(data);
  // → Lưu vào: Cùng thư mục, file localStorage
}
```

### **Cấu trúc lưu trữ trong IndexedDB:**

```
elearning-db (Version 2)
│
├── books
│   └── Key: [level, id]
│   └── Data: { level: 'n1', id: 'book-1', title: '...', ... }
│
├── series
│   └── Key: [level, id]
│   └── Data: { level: 'n1', id: 'series-1', name: '...', ... }
│
├── chapters
│   └── Key: bookId
│   └── Data: { bookId: 'book-1', chapters: [...] }
│
├── lessons
│   └── Key: [bookId, chapterId]
│   └── Data: { bookId: 'book-1', chapterId: 'chapter-1', lessons: [...] }
│
├── quizzes
│   └── Key: [bookId, chapterId, lessonId]
│   └── Data: { bookId: '...', chapterId: '...', lessonId: '...', questions: [...] }
│
└── exams
    └── Key: [level, examId]
    └── Data: { level: 'n1', examId: '2024-12', ... }
```

---

## ⚠️ NHỮNG ĐIỀU CẦN LƯU Ý

### **1. Dữ liệu chỉ lưu trên trình duyệt hiện tại**

```
PC Chrome:     IndexedDB → Chỉ có trên PC này
PC Firefox:    IndexedDB → Chỉ có trên PC này (riêng biệt với Chrome)
Điện thoại:   IndexedDB → Chỉ có trên điện thoại này

→ Mỗi thiết bị/trình duyệt có database RIÊNG BIỆT
→ KHÔNG tự động sync giữa các thiết bị
```

### **2. Dữ liệu có thể bị mất**

**Các trường hợp mất dữ liệu:**

- ❌ **Xóa browser data:**
  ```
  Chrome: Settings → Privacy → Clear browsing data
  → Chọn "Cached images and files" + "Cookies and other site data"
  → Dữ liệu IndexedDB sẽ bị xóa
  ```

- ❌ **Xóa cache:**
  ```
  Chrome: Settings → Privacy → Clear browsing data
  → Chọn "Cached images and files"
  → Có thể ảnh hưởng đến IndexedDB
  ```

- ❌ **Uninstall trình duyệt:**
  ```
  Gỡ cài đặt Chrome/Firefox
  → Tất cả dữ liệu IndexedDB bị xóa
  ```

- ❌ **Format máy tính:**
  ```
  Format ổ cứng
  → Tất cả dữ liệu bị mất
  ```

- ❌ **Chuyển sang thiết bị khác:**
  ```
  PC → Laptop
  → Dữ liệu KHÔNG tự động chuyển
  → Cần Export/Import thủ công
  ```

### **3. Dữ liệu KHÔNG tự động backup**

- ❌ Không có backup tự động
- ❌ Không có version control
- ❌ Không có cloud sync

---

## ✅ GIẢI PHÁP: BACKUP DỮ LIỆU

### **1. Export định kỳ (Khuyến nghị)**

**Tần suất:**
- Sau mỗi lần nhập dữ liệu quan trọng
- Mỗi tuần (nếu nhập thường xuyên)
- Mỗi tháng (nếu nhập ít)

**Cách làm:**
1. Vào **Admin Panel** → **Export/Import**
2. Click **Export** → Chọn **"Theo Level (Tất cả hoặc từng level)"**
3. Chọn **"Tất cả Levels (N1-N5)"** hoặc từng level
4. Download file JSON
5. Lưu file ở nhiều nơi:
   - ✅ Local máy tính
   - ✅ USB drive
   - ✅ Cloud storage (Google Drive, Dropbox, OneDrive)
   - ✅ Email (gửi cho chính mình)

### **2. Export trước khi thay đổi lớn**

Trước khi:
- Xóa nhiều dữ liệu
- Import dữ liệu mới (có thể ghi đè)
- Thử nghiệm tính năng mới

→ **Export trước** để có backup!

### **3. Lưu nhiều bản backup**

```
Backup Strategy:
├── backup-2025-01-16.json (Hôm nay)
├── backup-2025-01-09.json (Tuần trước)
├── backup-2025-01-02.json (2 tuần trước)
└── backup-2024-12-26.json (Tháng trước)

→ Nếu bản mới nhất bị lỗi, có thể dùng bản cũ
```

---

## 🔄 QUY TRÌNH LÀM VIỆC AN TOÀN

### **Workflow khuyến nghị:**

```
1. Nhập dữ liệu mới
   ↓
2. Export ngay sau khi nhập xong
   ↓
3. Lưu file backup ở nhiều nơi
   ↓
4. Tiếp tục làm việc
   ↓
5. Export định kỳ (mỗi tuần/tháng)
```

### **Trước khi Import:**

```
1. Export dữ liệu hiện tại (backup)
   ↓
2. Lưu file backup
   ↓
3. Import dữ liệu mới
   ↓
4. Kiểm tra dữ liệu đã import đúng chưa
   ↓
5. Nếu có lỗi → Import lại từ backup
```

---

## 📊 SO SÁNH: LOCAL STORAGE vs SERVER STORAGE

| Tính chất | IndexedDB (Hiện tại) | Server Database (Tương lai) |
|-----------|---------------------|----------------------------|
| **Vị trí** | Trình duyệt local | Server trên cloud |
| **Cố định?** | ❌ KHÔNG - Có thể thay đổi/xóa | ✅ Có thể set readonly |
| **Backup** | ❌ Thủ công (Export) | ✅ Tự động (Server backup) |
| **Sync đa thiết bị** | ❌ KHÔNG | ✅ CÓ |
| **Mất dữ liệu** | ⚠️ Dễ mất (xóa browser data) | ✅ An toàn hơn |
| **Offline** | ✅ Hoạt động offline | ⚠️ Cần internet |
| **Chi phí** | ✅ MIỄN PHÍ | 💰 Có free tier |

---

## 🎯 KẾT LUẬN

### **Trả lời câu hỏi:**

1. **"Dữ liệu nạp vào sẽ được lưu ở đâu?"**
   - ✅ **IndexedDB** (primary) - Trong thư mục trình duyệt
   - ✅ **localStorage** (fallback) - Nếu IndexedDB không khả dụng
   - 📍 Vị trí cụ thể: `C:\Users\[User]\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\...`

2. **"Nó có phải là dữ liệu cố định không?"**
   - ❌ **KHÔNG** - Dữ liệu KHÔNG cố định
   - ✅ Có thể **thay đổi, xóa, sửa** bất cứ lúc nào
   - ⚠️ Có thể **bị mất** nếu xóa browser data
   - ⚠️ **KHÔNG tự động sync** giữa các thiết bị

### **Khuyến nghị:**

1. ✅ **Export định kỳ** để backup
2. ✅ **Lưu file backup** ở nhiều nơi
3. ✅ **Export trước khi Import** (để có backup)
4. ✅ **Kiểm tra dữ liệu** sau khi Import
5. 🔄 **Kế hoạch:** Migrate lên Server Database (Supabase) để có sync đa thiết bị và backup tự động

---

## 📚 TÀI LIỆU THAM KHẢO

- `docs/DATA_STORAGE_LOCATION.md` - Vị trí lưu trữ chi tiết
- `docs/INDEXEDDB_SYNC_EXPLANATION.md` - Giải thích về sync đa thiết bị
- `docs/DATA_EXPORT_COMPATIBILITY.md` - Tương thích với Server/SQL
- `docs/deployment/MIGRATION_ROADMAP.md` - Kế hoạch migrate lên server

---

**Tóm lại: Dữ liệu được lưu trong IndexedDB trên trình duyệt của bạn, KHÔNG cố định, có thể thay đổi/xóa bất cứ lúc nào. Cần Export định kỳ để backup!** ⚠️

