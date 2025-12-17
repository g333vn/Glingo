# 📦 CÁC LOẠI DỮ LIỆU CÓ THỂ BACKUP

## ❓ CÂU HỎI

**"Vậy chúng ta sẽ backup các dữ liệu gì? Dữ liệu của sách và đề thi hay là dữ liệu của tất cả?"**

---

## ✅ TRẢ LỜI: BACKUP TẤT CẢ (KHUYẾN NGHỊ)

**Tóm tắt:**
- ✅ **Backup "All Data"** - Khuyến nghị cho backup định kỳ
- ✅ **Backup từng Level** - Khi chỉ cần một level cụ thể
- ✅ **Backup từng phần** - Khi chỉ cần một phần nhỏ

---

## 📊 DANH SÁCH CÁC LOẠI DỮ LIỆU

### **1. 📚 DỮ LIỆU SÁCH (Content Data)**

#### **1.1. Series (Bộ sách)**
- **Chứa:** Tất cả Series của một Level
- **Kèm theo:** Tất cả Books, Chapters, Lessons, Quizzes trong Series
- **Khi nào dùng:** Backup một bộ sách cụ thể

#### **1.2. Book (Sách)**
- **Chứa:** Một Book cụ thể
- **Kèm theo:** Tất cả Chapters, Lessons, Quizzes trong Book
- **Khi nào dùng:** Backup một cuốn sách cụ thể

#### **1.3. Chapter (Chương)**
- **Chứa:** Một Chapter cụ thể
- **Kèm theo:** Tất cả Lessons, Quizzes trong Chapter
- **Khi nào dùng:** Backup một chương cụ thể

#### **1.4. Lesson (Bài)**
- **Chứa:** Một Lesson cụ thể
- **Kèm theo:** Quiz (nếu có) trong Lesson
- **Khi nào dùng:** Backup một bài cụ thể

#### **1.5. Quiz (Câu hỏi)**
- **Chứa:** Một Quiz cụ thể
- **Kèm theo:** Tất cả Questions trong Quiz
- **Khi nào dùng:** Backup một quiz cụ thể

---

### **2. 📝 DỮ LIỆU ĐỀ THI (Exam Data)**

#### **2.1. Exam (Bài thi)**
- **Chứa:** Một bài thi đầy đủ
- **Kèm theo:** 
  - Knowledge Section (Phần kiến thức)
  - Listening Section (Phần nghe)
  - Tất cả Questions trong cả 2 phần
- **Khi nào dùng:** Backup một bài thi cụ thể

#### **2.2. Exam by Year (Đề thi theo năm)**
- **Chứa:** Tất cả exams của một năm trong một Level
- **Kèm theo:** Tất cả exams với đầy đủ Knowledge + Listening
- **Khi nào dùng:** Backup tất cả đề thi của một năm

#### **2.3. Exam Section (Phần thi)**
- **Chứa:** Chỉ một phần của bài thi
  - Knowledge Section (Phần kiến thức)
  - Listening Section (Phần nghe)
- **Kèm theo:** Tất cả Questions trong phần đó
- **Khi nào dùng:** Backup chỉ một phần của bài thi

---

### **3. 📋 DỮ LIỆU TỔNG HỢP**

#### **3.1. Level (Toàn bộ Level)**
- **Chứa:** TẤT CẢ dữ liệu của một Level
  - Tất cả Series
  - Tất cả Books
  - Tất cả Chapters
  - Tất cả Lessons
  - Tất cả Quizzes
  - Tất cả Exams
- **Khi nào dùng:** Backup toàn bộ một Level (N1, N2, N3, N4, N5)

#### **3.2. All Data (Tất cả dữ liệu)**
- **Chứa:** TẤT CẢ dữ liệu của TẤT CẢ Levels
  - Tất cả 5 Levels (N1-N5)
  - Tất cả Series, Books, Chapters, Lessons, Quizzes
  - Tất cả Exams
- **Khi nào dùng:** 
  - ✅ **Backup định kỳ** (mỗi tuần/tháng)
  - ✅ **Backup trước khi xóa browser data**
  - ✅ **Backup trước khi chuyển máy**

---

## 🎯 KHUYẾN NGHỊ BACKUP

### **Backup Định Kỳ (Mỗi tuần/tháng):**

```
✅ Backup "All Data"
   → Bao gồm TẤT CẢ:
   ├─ Tất cả Series, Books, Chapters, Lessons, Quizzes
   ├─ Tất cả Exams (tất cả levels, tất cả năm)
   └─ Tất cả dữ liệu khác

→ Đảm bảo không mất gì
→ Có thể khôi phục hoàn toàn
```

### **Backup Sau Khi Nhập Quan Trọng:**

```
✅ Backup "All Data" (nếu nhập nhiều)
✅ Hoặc Backup "Level" cụ thể (nếu chỉ nhập 1 level)
```

### **Backup Trước Khi Xóa Browser Data:**

```
✅ Backup "All Data" (BẮT BUỘC)
   → Đảm bảo không mất dữ liệu
```

### **Backup Từng Phần (Khi Cần):**

```
✅ Backup "Series" - Khi chỉ cần một bộ sách
✅ Backup "Book" - Khi chỉ cần một cuốn sách
✅ Backup "Exam" - Khi chỉ cần một bài thi
```

---

## 📋 BẢNG SO SÁNH

| Loại Backup | Chứa gì | Kích thước | Khi nào dùng |
|-------------|---------|------------|--------------|
| **All Data** | Tất cả (5 levels) | Lớn nhất (~10-50 MB) | ✅ Backup định kỳ, trước khi xóa browser |
| **Level** | Tất cả của 1 level | Trung bình (~2-10 MB) | Backup một level cụ thể |
| **Series** | 1 bộ sách + tất cả nội dung | Nhỏ-Trung (~1-5 MB) | Backup một bộ sách |
| **Book** | 1 cuốn sách + tất cả nội dung | Nhỏ (~0.5-2 MB) | Backup một cuốn sách |
| **Chapter** | 1 chương + tất cả nội dung | Rất nhỏ (~0.1-0.5 MB) | Backup một chương |
| **Lesson** | 1 bài + quiz | Rất nhỏ (~0.05-0.2 MB) | Backup một bài |
| **Quiz** | 1 quiz | Rất nhỏ (~0.01-0.1 MB) | Backup một quiz |
| **Exam** | 1 bài thi đầy đủ | Nhỏ-Trung (~0.5-3 MB) | Backup một bài thi |
| **Exam by Year** | Tất cả exams của 1 năm | Trung bình (~2-8 MB) | Backup tất cả đề thi của 1 năm |
| **Exam Section** | 1 phần của bài thi | Rất nhỏ (~0.1-1 MB) | Backup một phần thi |

---

## 🎯 CHIẾN LƯỢC BACKUP KHUYẾN NGHỊ

### **1. Backup Hàng Ngày (Sau khi nhập quan trọng):**

```
✅ Backup "All Data"
   → Đảm bảo không mất dữ liệu mới
   → Lưu vào data/backups/ (Layer 1)
```

### **2. Backup Hàng Tuần:**

```
✅ Backup "All Data"
   → Backup toàn bộ hệ thống
   → Lưu vào:
   ├─ data/backups/ (Layer 1)
   ├─ D:\Backups\Elearning\ (Layer 2)
   └─ Cloud Storage (Layer 3)
```

### **3. Backup Hàng Tháng:**

```
✅ Backup "All Data"
   → Backup lâu dài
   → Lưu vào Cloud Storage (Layer 3)
   → Giữ nhiều bản (không xóa)
```

### **4. Backup Trước Khi:**

```
✅ Backup "All Data" trước khi:
   ├─ Xóa browser data
   ├─ Chuyển sang máy mới
   ├─ Cập nhật trình duyệt
   └─ Thay đổi lớn
```

---

## 📊 VÍ DỤ CỤ THỂ

### **Ví dụ 1: Backup định kỳ**

```
Mỗi Chủ Nhật:
1. Export "All Data"
2. File: elearning-backup-all-2025-01-19.json
3. Copy vào cả 3 nơi:
   ├─ data/backups/2025-01/2025-01-19/all/
   ├─ D:\Backups\Elearning\2025-01/2025-01-19/
   └─ Google Drive/Elearning Backups/2025-01/2025-01-19/
```

### **Ví dụ 2: Backup sau khi nhập dữ liệu**

```
Sau khi nhập 10 Series mới:
1. Export "All Data"
2. File: elearning-backup-all-2025-01-19.json
3. Lưu vào data/backups/ (quick access)
```

### **Ví dụ 3: Backup một phần**

```
Chỉ cần backup Level N1:
1. Export "Level" → Chọn "N1"
2. File: elearning-backup-N1-2025-01-19.json
3. Chỉ chứa dữ liệu N1
```

### **Ví dụ 4: Backup một bài thi**

```
Chỉ cần backup bài thi N1/2024-12:
1. Export "Exam" → Chọn "N1" → Chọn "2024-12"
2. File: elearning-export-exam-n1-2024-12-2025-01-19.json
3. Chỉ chứa bài thi đó
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Backup "All Data" là quan trọng nhất:**

```
✅ Luôn backup "All Data" cho:
   ├─ Backup định kỳ
   ├─ Backup trước khi xóa browser data
   └─ Backup trước khi chuyển máy

❌ Không chỉ backup sách hoặc đề thi riêng
   → Có thể mất dữ liệu khác
```

### **2. Backup từng phần chỉ khi cần:**

```
✅ Backup từng phần khi:
   ├─ Chỉ cần một phần nhỏ
   ├─ Chia sẻ với người khác
   └─ Backup tạm thời

❌ Không dùng cho backup định kỳ
   → Có thể thiếu dữ liệu
```

### **3. Backup phải đầy đủ:**

```
✅ Backup "All Data" = Tất cả
   ├─ Sách (Series, Books, Chapters, Lessons, Quizzes)
   ├─ Đề thi (Exams)
   └─ Tất cả dữ liệu khác

❌ Chỉ backup sách = Thiếu đề thi
❌ Chỉ backup đề thi = Thiếu sách
```

---

## 📋 CHECKLIST BACKUP

### **Backup định kỳ (Mỗi tuần):**

- [ ] ✅ Export "All Data"
- [ ] ✅ Lưu vào `data/backups/`
- [ ] ✅ Copy vào `D:\Backups\Elearning\`
- [ ] ✅ Upload lên Cloud Storage

### **Backup trước khi xóa browser data:**

- [ ] ✅ Export "All Data" (BẮT BUỘC)
- [ ] ✅ Kiểm tra file backup hợp lệ
- [ ] ✅ Lưu vào ít nhất 2 nơi
- [ ] ✅ Upload lên Cloud Storage

### **Backup sau khi nhập quan trọng:**

- [ ] ✅ Export "All Data" hoặc "Level" cụ thể
- [ ] ✅ Lưu vào `data/backups/`

---

## 🎯 TÓM TẮT

### **Câu trả lời:**

**"Vậy chúng ta sẽ backup các dữ liệu gì? Dữ liệu của sách và đề thi hay là dữ liệu của tất cả?"**

**Trả lời:**
- ✅ **Backup "All Data"** - Khuyến nghị cho backup định kỳ
  - Bao gồm: Sách + Đề thi + Tất cả dữ liệu khác
- ✅ **Backup từng phần** - Chỉ khi cần cụ thể
  - Có thể backup riêng sách hoặc đề thi

### **Khuyến nghị:**

```
✅ Backup định kỳ: "All Data"
✅ Backup trước khi xóa browser: "All Data"
✅ Backup sau khi nhập quan trọng: "All Data" hoặc "Level"
✅ Backup từng phần: Chỉ khi cần cụ thể
```

### **Quan trọng:**

- ⚠️ **Luôn backup "All Data"** cho backup định kỳ
- ⚠️ **Không chỉ backup sách hoặc đề thi riêng** - Có thể thiếu dữ liệu
- ⚠️ **Backup phải đầy đủ** - Đảm bảo có thể khôi phục hoàn toàn

---

**Luôn backup "All Data" để đảm bảo an toàn!** 💾✅

