# 📅 ĐỀ XUẤT: BACKUP THEO NGÀY/KHOẢNG THỜI GIAN

## 🎯 MỤC ĐÍCH

Cho phép backup đồng loạt các dữ liệu đã tạo trong:
- 1 ngày cụ thể
- 1 khoảng thời gian cụ thể (từ ngày X đến ngày Y)
- Nhiều loại dữ liệu cùng lúc (Books, Series, Exams, Quizzes, etc.)

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### **Dữ liệu hiện có:**

1. **Exams:**
   - ✅ Có field `date` (ngày của exam)
   - ❌ Không có `createdAt` (ngày tạo)
   - ❌ Không có `updatedAt` (ngày cập nhật)

2. **Books, Series, Chapters, Lessons, Quizzes:**
   - ❌ Không có field `date`
   - ❌ Không có `createdAt`
   - ❌ Không có `updatedAt`

3. **Export hiện tại:**
   - ✅ Có `timestamp` (thời điểm export)
   - ❌ Không có metadata về thời gian tạo/cập nhật dữ liệu

---

## 🎨 THIẾT KẾ UI/UX

### **Option 1: Tab mới "Backup theo thời gian"**

```
Export/Import Page
├── Tab 1: Export thông thường (hiện tại)
└── Tab 2: Backup theo thời gian (mới)
    ├── Chọn loại backup:
    │   ├── ☑ Backup theo ngày
    │   ├── ☑ Backup theo khoảng thời gian
    │   └── ☑ Backup tất cả dữ liệu mới
    │
    ├── Chọn khoảng thời gian:
    │   ├── Từ ngày: [Date Picker]
    │   └── Đến ngày: [Date Picker]
    │
    ├── Chọn loại dữ liệu (multi-select):
    │   ├── ☑ Books
    │   ├── ☑ Series
    │   ├── ☑ Chapters
    │   ├── ☑ Lessons
    │   ├── ☑ Quizzes
    │   └── ☑ Exams
    │
    └── [Button: Backup]
```

---

### **Option 2: Thêm vào modal Export hiện tại**

```
Export Modal (hiện tại)
├── Export Type:
│   ├── Level
│   ├── Series
│   ├── Book
│   ├── Chapter
│   ├── Lesson
│   ├── Quiz
│   ├── Exam
│   └── ✨ NEW: By Date Range
│
└── Khi chọn "By Date Range":
    ├── Date Range:
    │   ├── From: [Date Picker]
    │   └── To: [Date Picker]
    │
    ├── Data Types (multi-select):
    │   ├── ☑ Books
    │   ├── ☑ Series
    │   ├── ☑ Chapters
    │   ├── ☑ Lessons
    │   ├── ☑ Quizzes
    │   └── ☑ Exams
    │
    └── [Button: Export]
```

---

### **Option 3: Section riêng "Bulk Backup"**

```
Export/Import Page
├── Section 1: Export thông thường (hiện tại)
│
└── Section 2: Bulk Backup (mới)
    ├── Quick Options:
    │   ├── [Button] Backup hôm nay
    │   ├── [Button] Backup tuần này
    │   ├── [Button] Backup tháng này
    │   └── [Button] Backup tùy chỉnh
    │
    └── Custom Backup:
        ├── Date Range: [From] - [To]
        ├── Data Types: [Multi-select]
        └── [Button: Backup]
```

---

## 🔧 THIẾT KẾ KỸ THUẬT

### **Bước 1: Thêm metadata timestamp**

**Cần thêm vào IndexedDB schema:**

```javascript
// Khi save dữ liệu, thêm metadata
{
  // Dữ liệu hiện tại
  id: 'book-1',
  title: 'Book Title',
  level: 'n1',
  
  // Metadata mới
  createdAt: '2025-01-19T10:30:45.123Z',
  updatedAt: '2025-01-19T10:30:45.123Z',
  createdBy: 'admin', // Optional
}
```

**Migration:**
- Thêm field `createdAt` và `updatedAt` cho tất cả dữ liệu
- Nếu không có, dùng `timestamp` của export gần nhất
- Hoặc dùng ngày hiện tại làm mặc định

---

### **Bước 2: Tạo function filter theo date range**

**Trong `indexedDBManager.js`:**

```javascript
/**
 * Export dữ liệu theo khoảng thời gian
 */
async exportByDateRange(startDate, endDate, dataTypes = ['all']) {
  const data = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    type: 'date-range',
    dateRange: {
      from: startDate,
      to: endDate
    },
    dataTypes: dataTypes,
    books: {},
    series: {},
    chapters: {},
    lessons: {},
    quizzes: {},
    exams: {}
  };

  // Helper function để check date range
  const isInRange = (itemDate) => {
    if (!itemDate) return false;
    const date = new Date(itemDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  };

  // Export Books
  if (dataTypes.includes('all') || dataTypes.includes('books')) {
    const allBooks = await this.getAllBooks();
    for (const book of allBooks) {
      if (isInRange(book.createdAt)) {
        const level = book.level;
        if (!data.books[level]) data.books[level] = [];
        data.books[level].push(book);
      }
    }
  }

  // Export Series
  if (dataTypes.includes('all') || dataTypes.includes('series')) {
    const allSeries = await this.getAllSeries();
    for (const s of allSeries) {
      if (isInRange(s.createdAt)) {
        const level = s.level;
        if (!data.series[level]) data.series[level] = [];
        data.series[level].push(s);
      }
    }
  }

  // Export Exams (dùng field date)
  if (dataTypes.includes('all') || dataTypes.includes('exams')) {
    const allExams = await this.getAllExams();
    for (const exam of allExams) {
      // Exams có field date, có thể dùng để filter
      if (isInRange(exam.date || exam.createdAt)) {
        const key = `${exam.level}_${exam.examId}`;
        data.exams[key] = exam;
      }
    }
  }

  // Tương tự cho Chapters, Lessons, Quizzes...

  return data;
}
```

---

### **Bước 3: UI Component**

**Tạo component mới: `DateRangeBackup.jsx`:**

```jsx
function DateRangeBackup() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['all']);
  const [isExporting, setIsExporting] = useState(false);

  const dataTypes = [
    { id: 'all', label: 'Tất cả' },
    { id: 'books', label: 'Books' },
    { id: 'series', label: 'Series' },
    { id: 'chapters', label: 'Chapters' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'exams', label: 'Exams' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await storageManager.exportByDateRange(
        startDate,
        endDate,
        selectedTypes
      );
      
      // Download file
      const filename = `elearning-backup-${startDate}_to_${endDate}-${new Date().toISOString().split('T')[0]}.json`;
      // ... download logic
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Date Range Picker */}
      <div>
        <label>Từ ngày:</label>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label>Đến ngày:</label>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Data Types Multi-select */}
      <div>
        <label>Chọn loại dữ liệu:</label>
        {dataTypes.map(type => (
          <label key={type.id}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type.id)}
              onChange={(e) => {
                if (type.id === 'all') {
                  setSelectedTypes(e.target.checked ? ['all'] : []);
                } else {
                  setSelectedTypes(prev => {
                    const filtered = prev.filter(t => t !== 'all');
                    return e.target.checked
                      ? [...filtered, type.id]
                      : filtered.filter(t => t !== type.id);
                  });
                }
              }}
            />
            {type.label}
          </label>
        ))}
      </div>

      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Đang export...' : 'Export'}
      </button>
    </div>
  );
}
```

---

## 📋 CÁC TÍNH NĂNG ĐỀ XUẤT

### **1. Quick Options (Nút nhanh)**

```
[Button] Backup hôm nay
  → Tự động set: From = Today, To = Today
  → Data Types: All

[Button] Backup tuần này
  → Tự động set: From = Monday, To = Sunday
  → Data Types: All

[Button] Backup tháng này
  → Tự động set: From = 1st, To = Last day
  → Data Types: All
```

---

### **2. Preview trước khi export**

```
[Button] Preview
  → Hiển thị:
     - Số lượng Books sẽ export: 5
     - Số lượng Series sẽ export: 2
     - Số lượng Exams sẽ export: 3
     - Tổng dung lượng ước tính: ~2.5 MB
```

---

### **3. Export nhiều file riêng biệt**

```
Option: ☑ Export riêng từng loại
  → Tạo nhiều file:
     - elearning-backup-books-2025-01-19.json
     - elearning-backup-series-2025-01-19.json
     - elearning-backup-exams-2025-01-19.json
```

---

### **4. Filter nâng cao**

```
Advanced Filters:
  ├── ☑ Chỉ dữ liệu mới tạo (createdAt)
  ├── ☑ Chỉ dữ liệu đã cập nhật (updatedAt)
  ├── ☑ Bao gồm cả dữ liệu liên quan (chapters của books, etc.)
  └── Level filter: [All] [N1] [N2] [N3] [N4] [N5]
```

---

## 🎯 WORKFLOW ĐỀ XUẤT

### **Workflow 1: Backup hôm nay**

```
1. Click "Backup hôm nay"
2. System tự động:
   - Set date range: Today - Today
   - Query tất cả dữ liệu có createdAt = Today
   - Export tất cả loại dữ liệu
3. Download file: elearning-backup-today-2025-01-19.json
```

---

### **Workflow 2: Backup khoảng thời gian**

```
1. Chọn "Backup theo khoảng thời gian"
2. Chọn From: 2025-01-01
3. Chọn To: 2025-01-31
4. Chọn Data Types: ☑ Books, ☑ Exams
5. Click "Preview" → Xem số lượng
6. Click "Export"
7. Download file: elearning-backup-2025-01-01_to_2025-01-31.json
```

---

### **Workflow 3: Backup nhiều file**

```
1. Chọn date range
2. Chọn Data Types: ☑ Books, ☑ Series, ☑ Exams
3. Chọn option: ☑ Export riêng từng loại
4. Click "Export"
5. Download 3 files:
   - elearning-backup-books-2025-01-19.json
   - elearning-backup-series-2025-01-19.json
   - elearning-backup-exams-2025-01-19.json
```

---

## ⚠️ VẤN ĐỀ VÀ GIẢI PHÁP

### **Vấn đề 1: Dữ liệu cũ không có timestamp**

**Giải pháp:**
- Migration: Thêm `createdAt` = `updatedAt` = ngày hiện tại cho dữ liệu cũ
- Hoặc: Dùng field `date` của exam (nếu có)
- Hoặc: Không filter dữ liệu cũ, chỉ filter dữ liệu mới

---

### **Vấn đề 2: Performance khi query nhiều dữ liệu**

**Giải pháp:**
- Index `createdAt` và `updatedAt` trong IndexedDB
- Pagination khi query
- Progress bar khi export

---

### **Vấn đề 3: Dữ liệu liên quan (chapters của books)**

**Giải pháp:**
- Option: "Bao gồm dữ liệu liên quan"
- Tự động export chapters của books được chọn
- Tự động export lessons của chapters được chọn

---

## 📊 PRIORITY

### **Phase 1: Cơ bản (MVP)**
1. ✅ Thêm metadata `createdAt`, `updatedAt`
2. ✅ Function `exportByDateRange`
3. ✅ UI Date Range Picker
4. ✅ Multi-select Data Types
5. ✅ Export 1 file tổng hợp

### **Phase 2: Nâng cao**
1. ⬜ Quick Options (Hôm nay, Tuần này, Tháng này)
2. ⬜ Preview trước khi export
3. ⬜ Export nhiều file riêng biệt
4. ⬜ Filter nâng cao

### **Phase 3: Tối ưu**
1. ⬜ Index timestamp trong IndexedDB
2. ⬜ Progress bar
3. ⬜ Export background (không block UI)
4. ⬜ Export schedule (tự động backup định kỳ)

---

## 🎨 MOCKUP UI

### **Layout đề xuất:**

```
┌─────────────────────────────────────────┐
│  Backup theo thời gian                  │
├─────────────────────────────────────────┤
│                                         │
│  Quick Options:                         │
│  [Hôm nay] [Tuần này] [Tháng này]      │
│                                         │
│  ────────────────────────────────────    │
│                                         │
│  Khoảng thời gian:                      │
│  Từ ngày: [2025-01-01] 📅              │
│  Đến ngày: [2025-01-31] 📅             │
│                                         │
│  Loại dữ liệu:                          │
│  ☑ Tất cả                               │
│  ☐ Books                                │
│  ☐ Series                               │
│  ☐ Chapters                             │
│  ☐ Lessons                              │
│  ☐ Quizzes                              │
│  ☐ Exams                                │
│                                         │
│  Options:                               │
│  ☑ Bao gồm dữ liệu liên quan            │
│  ☐ Export riêng từng loại               │
│                                         │
│  [Preview] [Export]                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 TÓM TẮT

### **Tính năng chính:**
1. ✅ Backup theo ngày cụ thể
2. ✅ Backup theo khoảng thời gian
3. ✅ Chọn nhiều loại dữ liệu cùng lúc
4. ✅ Quick options (Hôm nay, Tuần này, Tháng này)

### **Cần làm:**
1. ⬜ Thêm metadata `createdAt`, `updatedAt` vào dữ liệu
2. ⬜ Tạo function `exportByDateRange`
3. ⬜ Tạo UI component
4. ⬜ Tích hợp vào ExportImportPage

---

**Bạn muốn bắt đầu implement từ phần nào?** 🚀

