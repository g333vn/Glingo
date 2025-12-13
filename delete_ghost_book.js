// Script để xóa book "BOOK MINNA-NO-NIHONGO-1" khỏi local storage
// Chạy trong Browser Console (F12 > Console)

async function deleteGhostBook() {
  console.log('🔍 Đang tìm và xóa book "BOOK MINNA-NO-NIHONGO-1"...\n');
  
  const bookIdToDelete = 'minna-no-nihongo-1'; // Có thể thay đổi nếu book ID khác
  const level = 'n5';
  
  // 1. Kiểm tra và xóa từ localStorage
  console.log('📦 Kiểm tra localStorage...');
  let foundInLocalStorage = false;
  
  try {
    const booksKey = `adminBooks_${level}`;
    const booksData = localStorage.getItem(booksKey);
    
    if (booksData) {
      const books = JSON.parse(booksData);
      const filteredBooks = books.filter(book => {
        const id = String(book?.id || '').toLowerCase();
        const title = String(book?.title || '').toLowerCase();
        
        // Tìm book có ID hoặc title chứa "minna-no-nihongo"
        const isGhost = id.includes('minna-no-nihongo') || 
                       title.includes('minna-no-nihongo') ||
                       title.includes('book minna-no-nihongo');
        
        if (isGhost) {
          console.log(`🗑️ Tìm thấy ghost book trong localStorage:`, {
            id: book.id,
            title: book.title
          });
          foundInLocalStorage = true;
          return false; // Xóa khỏi array
        }
        return true; // Giữ lại
      });
      
      if (foundInLocalStorage) {
        localStorage.setItem(booksKey, JSON.stringify(filteredBooks));
        console.log(`✅ Đã xóa ghost book khỏi localStorage`);
        console.log(`   - Trước: ${books.length} books`);
        console.log(`   - Sau: ${filteredBooks.length} books`);
      } else {
        console.log(`ℹ️ Không tìm thấy ghost book trong localStorage`);
      }
    }
  } catch (e) {
    console.warn('⚠️ Lỗi khi xử lý localStorage:', e);
  }
  
  // 2. Kiểm tra và xóa từ IndexedDB
  console.log('\n📦 Kiểm tra IndexedDB...');
  let foundInIndexedDB = false;
  
  try {
    const dbName = 'elearning-db';
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (db.objectStoreNames.contains('books')) {
      const tx = db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      const index = store.index('level');
      
      const request = index.getAll(level);
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const books = request.result || [];
          let deletedCount = 0;
          
          books.forEach(book => {
            const id = String(book?.id || '').toLowerCase();
            const title = String(book?.title || '').toLowerCase();
            
            const isGhost = id.includes('minna-no-nihongo') || 
                           title.includes('minna-no-nihongo') ||
                           title.includes('book minna-no-nihongo');
            
            if (isGhost) {
              console.log(`🗑️ Tìm thấy ghost book trong IndexedDB:`, {
                id: book.id,
                title: book.title
              });
              store.delete([level, book.id]);
              deletedCount++;
              foundInIndexedDB = true;
            }
          });
          
          if (deletedCount > 0) {
            console.log(`✅ Đã xóa ${deletedCount} ghost book(s) khỏi IndexedDB`);
          } else {
            console.log(`ℹ️ Không tìm thấy ghost book trong IndexedDB`);
          }
          
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
      
      await tx.done;
      db.close();
    }
  } catch (e) {
    console.warn('⚠️ Lỗi khi xử lý IndexedDB:', e);
  }
  
  // 3. Tổng kết
  console.log('\n📊 TỔNG KẾT:');
  if (foundInLocalStorage || foundInIndexedDB) {
    console.log('✅ Đã xóa ghost book khỏi local storage!');
    console.log('   - localStorage:', foundInLocalStorage ? '✅ Đã xóa' : '❌ Không tìm thấy');
    console.log('   - IndexedDB:', foundInIndexedDB ? '✅ Đã xóa' : '❌ Không tìm thấy');
    console.log('\n💡 Bước tiếp theo:');
    console.log('   1. Refresh trang (Ctrl+F5)');
    console.log('   2. Kiểm tra xem book còn hiển thị không');
    console.log('   3. Nếu vẫn còn, kiểm tra Supabase database');
  } else {
    console.log('ℹ️ Không tìm thấy ghost book trong local storage');
    console.log('   Book có thể đến từ:');
    console.log('   - Supabase database (cần xóa bằng SQL)');
    console.log('   - Static metadata file (cần sửa code)');
  }
  
  return {
    foundInLocalStorage,
    foundInIndexedDB
  };
}

// Chạy ngay
deleteGhostBook();

