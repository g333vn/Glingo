# 📊 LOGIC TÍNH ĐIỂM JLPT - PHƯƠNG ÁN 3 (HYBRID)

## 🎯 TỔNG QUAN

Tài liệu này mô tả chi tiết logic tính điểm cho bài thi JLPT sử dụng **Phương án 3 (Hybrid)** - một phương pháp đơn giản, linh hoạt và chính xác.

---

## 📐 CÔNG THỨC TÍNH ĐIỂM

### **Công thức cơ bản:**

```
Điểm phần = (Số câu đúng / Tổng số câu) × Điểm tối đa phần đó
```

### **Chi tiết từng bước:**

1. **Tính tỷ lệ đúng:**
   ```
   accuracy = correct / total
   ```

2. **Chuyển đổi sang điểm:**
   ```
   score = accuracy × maxScore
   ```

3. **Làm tròn:**
   ```
   finalScore = Math.round(score)
   ```

---

## ⚙️ CẤU HÌNH ĐIỂM SỐ

```javascript
const SCORING_CONFIG = {
  knowledge: { 
    max: 60,        // Điểm tối đa phần Knowledge
    minPass: 19     // Điểm tối thiểu để đậu
  },
  reading: { 
    max: 60,         // Điểm tối đa phần Reading
    minPass: 19      // Điểm tối thiểu để đậu
  },
  listening: { 
    max: 60,         // Điểm tối đa phần Listening
    minPass: 19      // Điểm tối thiểu để đậu
  },
  total: { 
    max: 180,        // Tổng điểm tối đa
    minPass: 100     // Tổng điểm tối thiểu để đậu
  }
};
```

---

## 📋 CẤU TRÚC ĐỀ THI

### **Đề thi mẫu: 96 câu hỏi**

```
Tổng: 96 câu hỏi
├── Phần 1: Ngôn ngữ & Đọc hiểu (66 câu)
│   ├── 語彙・知識 (Vocabulary/Knowledge): 44 câu
│   └── 読解 (Reading Comprehension): 22 câu
└── Phần 2: Nghe hiểu (聴解): 30 câu
```

**Lưu ý:** Số câu hỏi có thể thay đổi tùy theo đề thi các năm, nhưng công thức tính điểm vẫn giữ nguyên.

---

## 💡 VÍ DỤ TÍNH ĐIỂM

### **Ví dụ 1: Làm đúng 100% (96/96 câu)**

**Kết quả:**
- Knowledge: 44/44 câu đúng
- Reading: 22/22 câu đúng
- Listening: 30/30 câu đúng

**Tính điểm:**

| Phần | Câu đúng | Tổng câu | Tỷ lệ | Công thức | Điểm |
|------|----------|----------|-------|-----------|------|
| Knowledge | 44 | 44 | 100% | (44/44) × 60 = 60.00 | **60** |
| Reading | 22 | 22 | 100% | (22/22) × 60 = 60.00 | **60** |
| Listening | 30 | 30 | 100% | (30/30) × 60 = 60.00 | **60** |
| **Tổng** | **96** | **96** | **100%** | - | **180** |

**Kết luận:** ✅ **ĐẬU** (180 ≥ 100, mỗi phần ≥ 19)

---

### **Ví dụ 2: Làm đúng 80/96 câu (83.33%)**

**Kết quả:**
- Knowledge: 36/44 câu đúng
- Reading: 18/22 câu đúng
- Listening: 26/30 câu đúng

**Tính điểm:**

| Phần | Câu đúng | Tổng câu | Tỷ lệ | Công thức | Điểm |
|------|----------|----------|-------|-----------|------|
| Knowledge | 36 | 44 | 81.82% | (36/44) × 60 = 49.09 | **49** |
| Reading | 18 | 22 | 81.82% | (18/22) × 60 = 49.09 | **49** |
| Listening | 26 | 30 | 86.67% | (26/30) × 60 = 52.00 | **52** |
| **Tổng** | **80** | **96** | **83.33%** | - | **150** |

**Kết luận:** ✅ **ĐẬU** (150 ≥ 100, mỗi phần ≥ 19)

---

### **Ví dụ 3: Làm đúng 60/96 câu (62.50%)**

**Kết quả:**
- Knowledge: 24/44 câu đúng
- Reading: 12/22 câu đúng
- Listening: 24/30 câu đúng

**Tính điểm:**

| Phần | Câu đúng | Tổng câu | Tỷ lệ | Công thức | Điểm |
|------|----------|----------|-------|-----------|------|
| Knowledge | 24 | 44 | 54.55% | (24/44) × 60 = 32.73 | **33** |
| Reading | 12 | 22 | 54.55% | (12/22) × 60 = 32.73 | **33** |
| Listening | 24 | 30 | 80.00% | (24/30) × 60 = 48.00 | **48** |
| **Tổng** | **60** | **96** | **62.50%** | - | **114** |

**Kết luận:** ✅ **ĐẬU** (114 ≥ 100, mỗi phần ≥ 19)

---

### **Ví dụ 4: Rớt do tổng điểm thấp**

**Kết quả:**
- Knowledge: 20/44 câu đúng
- Reading: 10/22 câu đúng
- Listening: 20/30 câu đúng

**Tính điểm:**

| Phần | Câu đúng | Tổng câu | Tỷ lệ | Công thức | Điểm |
|------|----------|----------|-------|-----------|------|
| Knowledge | 20 | 44 | 45.45% | (20/44) × 60 = 27.27 | **27** |
| Reading | 10 | 22 | 45.45% | (10/22) × 60 = 27.27 | **27** |
| Listening | 20 | 30 | 66.67% | (20/30) × 60 = 40.00 | **40** |
| **Tổng** | **50** | **96** | **52.08%** | - | **94** |

**Kết luận:** ❌ **RỚT** (94 < 100, dù mỗi phần ≥ 19)

---

### **Ví dụ 5: Rớt do một phần dưới 19 điểm**

**Kết quả:**
- Knowledge: 10/44 câu đúng
- Reading: 18/22 câu đúng
- Listening: 28/30 câu đúng

**Tính điểm:**

| Phần | Câu đúng | Tổng câu | Tỷ lệ | Công thức | Điểm |
|------|----------|----------|-------|-----------|------|
| Knowledge | 10 | 44 | 22.73% | (10/44) × 60 = 13.64 | **14** |
| Reading | 18 | 22 | 81.82% | (18/22) × 60 = 49.09 | **49** |
| Listening | 28 | 30 | 93.33% | (28/30) × 60 = 56.00 | **56** |
| **Tổng** | **56** | **96** | **58.33%** | - | **119** |

**Kết luận:** ❌ **RỚT** (119 ≥ 100 nhưng Knowledge = 14 < 19)

---

## ✅ ĐIỀU KIỆN ĐẬU/RỚT

### **Điều kiện đậu:**

1. **Tổng điểm ≥ 100 điểm**
2. **Knowledge ≥ 19 điểm**
3. **Reading ≥ 19 điểm**
4. **Listening ≥ 19 điểm**

**Tất cả 4 điều kiện phải thỏa mãn đồng thời.**

### **Công thức kiểm tra:**

```javascript
const isPassed = 
  totalScore >= SCORING_CONFIG.total.minPass &&      // ≥ 100
  knowledgePoints >= SCORING_CONFIG.knowledge.minPass &&  // ≥ 19
  readingPoints >= SCORING_CONFIG.reading.minPass &&      // ≥ 19
  listeningPoints >= SCORING_CONFIG.listening.minPass;    // ≥ 19
```

---

## 🔧 IMPLEMENTATION

### **Hàm tính điểm cho một phần:**

```javascript
/**
 * Tính điểm cho một phần thi
 * @param {number} correct - Số câu đúng
 * @param {number} total - Tổng số câu
 * @param {number} maxScore - Điểm tối đa (60)
 * @returns {number} Điểm số (0-60)
 */
function calculateSectionScore(correct, total, maxScore) {
  if (total === 0) return 0;
  
  // Tính tỷ lệ đúng
  const accuracy = correct / total;
  
  // Chuyển đổi sang điểm (0-60)
  const rawScore = accuracy * maxScore;
  
  // Làm tròn
  return Math.round(rawScore);
}
```

### **Sử dụng trong code:**

```javascript
const knowledgePoints = calculateSectionScore(
  knowledgeBreakdown.knowledge,
  knowledgeBreakdown.totals.knowledge,
  SCORING_CONFIG.knowledge.max
);

const readingPoints = calculateSectionScore(
  knowledgeBreakdown.reading,
  knowledgeBreakdown.totals.reading,
  SCORING_CONFIG.reading.max
);

const listeningPoints = calculateSectionScore(
  listeningBreakdown.listening,
  listeningBreakdown.total,
  SCORING_CONFIG.listening.max
);

const totalScore = knowledgePoints + readingPoints + listeningPoints;
```

---

## 🎯 ƯU ĐIỂM CỦA PHƯƠNG ÁN

1. ✅ **Đơn giản, dễ hiểu:** Công thức rõ ràng, dễ triển khai
2. ✅ **Linh hoạt:** Áp dụng được với bất kỳ số câu hỏi nào
3. ✅ **Nhất quán:** Cùng một công thức cho tất cả các phần
4. ✅ **Dễ bảo trì:** Code ngắn gọn, dễ debug
5. ✅ **Chính xác:** Phản ánh đúng tỷ lệ làm bài của thí sinh

---

## 📊 BẢNG TỔNG HỢP CÁC TÌNH HUỐNG

| Ví dụ | Knowledge | Reading | Listening | Tổng | Kết quả |
|-------|-----------|---------|-----------|------|---------|
| 1 | 44/44 (60) | 22/22 (60) | 30/30 (60) | 180 | ✅ Đậu |
| 2 | 36/44 (49) | 18/22 (49) | 26/30 (52) | 150 | ✅ Đậu |
| 3 | 24/44 (33) | 12/22 (33) | 24/30 (48) | 114 | ✅ Đậu |
| 4 | 20/44 (27) | 10/22 (27) | 20/30 (40) | 94 | ❌ Rớt (tổng < 100) |
| 5 | 10/44 (14) | 18/22 (49) | 28/30 (56) | 119 | ❌ Rớt (Knowledge < 19) |

---

## 🔍 LƯU Ý QUAN TRỌNG

### **1. Làm tròn số:**

- Sử dụng `Math.round()` để làm tròn đến số nguyên gần nhất
- Ví dụ: 49.09 → 49, 49.50 → 50, 32.73 → 33

### **2. Xử lý edge cases:**

- Nếu `total === 0`: Trả về 0 điểm
- Nếu `correct > total`: Không hợp lệ (cần validation)

### **3. Phân loại câu hỏi:**

- **Knowledge:** Câu hỏi thuộc `knowledgeSections`
- **Reading:** Câu hỏi thuộc `readingSections`
- **Listening:** Câu hỏi thuộc `listeningSections`

**Lưu ý:** Không dựa vào field `category` trên từng câu hỏi, mà dựa vào section chứa câu hỏi đó.

---

## 📝 LỊCH SỬ THAY ĐỔI

- **2025-01-XX:** Tạo document cho Phương án 3 (Hybrid)
- **2025-01-XX:** Sửa lỗi category detection trong ExamKnowledgePage.jsx
- **2025-01-XX:** Triển khai logic tính điểm mới

---

## 🔗 TÀI LIỆU LIÊN QUAN

- `archive/data/DATA_VALIDATION_RULES.md` - Validation rules cho exam results
- `src/features/jlpt/pages/JLPTExamResultPage.jsx` - Trang hiển thị kết quả
- `src/features/jlpt/pages/ExamKnowledgePage.jsx` - Trang làm bài Knowledge/Reading
- `src/features/jlpt/pages/ExamListeningPage.jsx` - Trang làm bài Listening

---

**Tác giả:** AI Assistant  
**Ngày tạo:** 2025-01-XX  
**Phiên bản:** 1.0

