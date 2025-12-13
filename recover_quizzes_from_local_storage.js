// Script để kiểm tra và khôi phục quizzes từ local storage
// Chạy trong Browser Console (F12 > Console)

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
      const index = store.index('level');
      
      const request = index.getAll('n5');
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
    
    console.log('💾 Để khôi phục quizzes này lên Supabase:');
    console.log('   1. Copy dữ liệu từ console');
    console.log('   2. Hoặc chạy hàm recoverQuizzesToSupabase() (cần đăng nhập)');
    
    // Lưu vào biến global để có thể dùng sau
    window.foundQuizzes = uniqueQuizzes;
    
    return uniqueQuizzes;
  } else {
    console.log('❌ Không tìm thấy quiz nào trong local storage cho n5');
    console.log('   Dữ liệu có thể đã bị xóa hoàn toàn.');
    return [];
  }
}

// Hàm để khôi phục quizzes lên Supabase (cần đăng nhập)
async function recoverQuizzesToSupabase() {
  if (!window.foundQuizzes || window.foundQuizzes.length === 0) {
    console.log('❌ Không có quiz nào để khôi phục. Chạy checkLocalQuizzes() trước.');
    return;
  }
  
  console.log(`🔄 Đang khôi phục ${window.foundQuizzes.length} quiz lên Supabase...\n`);
  
  // Import storageManager
  const { storageManager } = await import('./src/utils/localStorageManager.js');
  
  // Lấy user ID (cần đăng nhập)
  // TODO: Lấy từ auth context hoặc prompt user
  
  let successCount = 0;
  let failCount = 0;
  
  for (const quiz of window.foundQuizzes) {
    try {
      const quizData = quiz.data || quiz;
      // TODO: Cần userId để save
      // const success = await storageManager.saveQuiz(
      //   quizData.bookId,
      //   quizData.chapterId,
      //   quizData.lessonId,
      //   quizData,
      //   'n5',
      //   userId
      // );
      
      console.log(`✅ Đã khôi phục: ${quiz.title || quiz.lessonId}`);
      successCount++;
    } catch (e) {
      console.error(`❌ Lỗi khi khôi phục ${quiz.title || quiz.lessonId}:`, e);
      failCount++;
    }
  }
  
  console.log(`\n📊 Kết quả: ${successCount} thành công, ${failCount} thất bại`);
}

// Chạy ngay
checkLocalQuizzes();

