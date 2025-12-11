/**
 * Script Clear Cache Chapters Cũ
 * 
 * Chạy script này trong Console (F12) để xóa cache chapters cũ trong IndexedDB/localStorage
 * 
 * Cách sử dụng:
 * 1. Mở Developer Tools (F12) → Console
 * 2. Copy toàn bộ script này và paste vào Console
 * 3. Nhấn Enter để chạy
 * 4. Script sẽ xóa tất cả chapters cache cũ
 */

(async function clearOldChaptersCache() {
  console.log('🧹 Bắt đầu xóa cache chapters cũ...\n');
  
  try {
    // 1. Clear localStorage
    console.log('1️⃣ Xóa chapters từ localStorage...');
    let clearedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('adminChapters_')) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log(`   ✅ Đã xóa: ${key}`);
      }
    }
    console.log(`   ✅ Đã xóa ${clearedCount} chapters từ localStorage\n`);
    
    // 2. Clear IndexedDB
    console.log('2️⃣ Xóa chapters từ IndexedDB...');
    const { openDB } = await import('idb');
    const db = await openDB('elearning-db', 1);
    
    if (db.objectStoreNames.contains('chapters')) {
      const tx = db.transaction('chapters', 'readwrite');
      const store = tx.objectStore('chapters');
      
      const allKeys = await store.getAllKeys();
      let deletedCount = 0;
      
      for (const key of allKeys) {
        await store.delete(key);
        deletedCount++;
        console.log(`   ✅ Đã xóa: ${key}`);
      }
      
      await tx.done;
      console.log(`   ✅ Đã xóa ${deletedCount} chapters từ IndexedDB\n`);
    } else {
      console.log('   ℹ️ Không tìm thấy chapters store trong IndexedDB\n');
    }
    
    // 3. Kết quả
    console.log('✅ Hoàn thành! Đã xóa tất cả cache chapters cũ.');
    console.log('   Bây giờ hãy refresh trang để load lại từ Supabase.');
    
    alert(
      '✅ Đã xóa cache chapters cũ!\n\n' +
      `- localStorage: ${clearedCount} items\n` +
      `- IndexedDB: ${deletedCount || 0} items\n\n` +
      'Vui lòng refresh trang để load lại từ Supabase.'
    );
    
  } catch (err) {
    console.error('❌ Lỗi khi xóa cache:', err);
    alert('❌ Lỗi khi xóa cache:\n' + err.message);
  }
})();

