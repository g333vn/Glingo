# 📖 Hướng dẫn chạy script khôi phục quizzes

## ⚠️ LƯU Ý QUAN TRỌNG

File `recover_quizzes_from_local_storage.js` là **JavaScript**, KHÔNG phải SQL!
- ❌ **KHÔNG** chạy trong Supabase SQL Editor
- ✅ **CHẠY** trong Browser Console (F12)

## Cách chạy script

### Bước 1: Mở Browser Console
1. Mở ứng dụng elearning trong browser
2. Nhấn **F12** (hoặc chuột phải > Inspect)
3. Vào tab **Console**

### Bước 2: Copy và chạy script

**Cách 1: Copy toàn bộ file**
1. Mở file `recover_quizzes_from_local_storage.js` trong editor
2. Copy toàn bộ nội dung (Ctrl+A, Ctrl+C)
3. Paste vào Browser Console
4. Nhấn Enter

**Cách 2: Copy từng phần (nếu file quá dài)**

Copy phần này trước (hàm chính):

```javascript
async function checkLocalQuizzes() {
  console.log('🔍 Đang kiểm tra quizzes trong local storage...\n');
  
  const results = {
    localStorage: [],
    indexedDB: [],
    total: 0
  };
  
  // 1. Kiểm tra localStorage
  console.log('📦 Kiểm tra localStorage...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('adminQuiz_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.level === 'n5') {
          results.localStorage.push({
            key,
            bookId: data.bookId,
            chapterId: data.chapterId,
            lessonId: data.lessonId,
            title: data.title,
            questionsCount: data.questions?.length || 0,
            data: data
          });
          results.total++;
        }
      } catch (e) {
        console.warn(`⚠️ Không parse được key: ${key}`, e);
      }
    }
  }
  
  console.log(`✅ Tìm thấy ${results.localStorage.length} quiz trong localStorage cho n5`);
  
  // 2. Kiểm tra IndexedDB
  console.log('\n📦 Kiểm tra IndexedDB...');
  try {
    const dbName = 'elearning-db';
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (db.objectStoreNames.contains('quizzes')) {
      const tx = db.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      
      // Lấy tất cả quizzes
      const request = store.getAll();
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const quizzes = request.result || [];
          quizzes.forEach(quiz => {
            if (quiz.level === 'n5') {
              results.indexedDB.push({
                bookId: quiz.bookId,
                chapterId: quiz.chapterId,
                lessonId: quiz.lessonId,
                title: quiz.title,
                questionsCount: quiz.questions?.length || 0,
                data: quiz
              });
              results.total++;
            }
          });
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
      
      console.log(`✅ Tìm thấy ${results.indexedDB.length} quiz trong IndexedDB cho n5`);
    }
    
    db.close();
  } catch (e) {
    console.warn('⚠️ Không thể truy cập IndexedDB:', e);
  }
  
  // 3. Hiển thị kết quả
  console.log('\n📊 TỔNG KẾT:');
  console.log(`   - localStorage: ${results.localStorage.length} quiz`);
  console.log(`   - IndexedDB: ${results.indexedDB.length} quiz`);
  console.log(`   - Tổng cộng: ${results.total} quiz\n`);
  
  if (results.total > 0) {
    console.log('📋 DANH SÁCH QUIZZES TÌM THẤY:\n');
    
    // Gộp và loại bỏ duplicate
    const allQuizzes = [...results.localStorage, ...results.indexedDB];
    const uniqueQuizzes = [];
    const seen = new Set();
    
    allQuizzes.forEach(quiz => {
      const key = `${quiz.bookId}_${quiz.chapterId}_${quiz.lessonId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueQuizzes.push(quiz);
      }
    });
    
    uniqueQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title || quiz.lessonId}`);
      console.log(`   - Book: ${quiz.bookId}`);
      console.log(`   - Chapter: ${quiz.chapterId}`);
      console.log(`   - Lesson: ${quiz.lessonId}`);
      console.log(`   - Questions: ${quiz.questionsCount}`);
      console.log('');
    });
    
    console.log('💾 Dữ liệu đã được lưu vào window.foundQuizzes');
    console.log('   Để xem: console.log(window.foundQuizzes)');
    
    // Lưu vào biến global để có thể dùng sau
    window.foundQuizzes = uniqueQuizzes;
    
    return uniqueQuizzes;
  } else {
    console.log('❌ Không tìm thấy quiz nào trong local storage cho n5');
    console.log('   Dữ liệu có thể đã bị xóa hoàn toàn.');
    return [];
  }
}

// Chạy ngay
checkLocalQuizzes();
```

### Bước 3: Xem kết quả

Sau khi chạy, console sẽ hiển thị:
- Số lượng quizzes tìm thấy
- Danh sách chi tiết từng quiz
- Dữ liệu được lưu vào `window.foundQuizzes`

### Bước 4: Xem dữ liệu chi tiết

Nếu tìm thấy quizzes, chạy lệnh này để xem chi tiết:

```javascript
// Xem danh sách
console.log(window.foundQuizzes);

// Xem quiz đầu tiên
console.log(window.foundQuizzes[0]);

// Xem câu hỏi của quiz đầu tiên
console.log(window.foundQuizzes[0].data.questions);
```

## Nếu không tìm thấy gì

Nếu script báo "Không tìm thấy quiz nào", có nghĩa là:
- Dữ liệu đã bị xóa hoàn toàn khỏi local storage
- Cần tạo lại quizzes từ đầu trong admin panel

## Sau khi tìm thấy quizzes

Nếu tìm thấy quizzes, bạn có thể:
1. Copy dữ liệu từ console
2. Tạo lại quizzes trong admin panel với dữ liệu đó
3. Hoặc liên hệ để tôi tạo script tự động upload lên Supabase

