// src/utils/safeSaveHelper.js
// Helper function để safe save collections với merge thông minh
// Đảm bảo không mất dữ liệu khi save

import { supabase } from '../services/supabaseClient.js';

// Note: hasChanges function removed - logic moved inline for better control

/**
 * Safe save collection với merge thông minh
 * Đảm bảo không mất dữ liệu khi save bằng cách:
 * 1. Load từ Supabase (source of truth) trước
 * 2. So sánh danh sách cũ/mới
 * 3. Chỉ insert/update/delete những gì cần thiết
 * 
 * @param {Object} options
 * @param {string} options.tableName - Tên bảng ('chapters', 'lessons', 'series')
 * @param {Function} options.getExistingFn - Function để load danh sách hiện có từ Supabase
 * @param {Array} options.newItems - Danh sách mới cần save
 * @param {string} options.compareKey - Key để so sánh (ví dụ: 'id')
 * @param {Function} options.transformFn - Transform item sang format DB
 * @param {string} options.userId - User ID
 * @param {Object} options.context - Context (bookId, chapterId, level, etc.)
 * @param {Array} options.onConflict - Conflict resolution keys (ví dụ: ['id', 'book_id', 'level'])
 * @param {Array} options.deleteWhere - Điều kiện để delete (ví dụ: { book_id: bookId, level: level })
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function safeSaveCollection({
  tableName,
  getExistingFn,
  newItems,
  compareKey,
  transformFn,
  userId,
  context = {},
  onConflict = null,
  deleteWhere = null
}) {
  try {
    console.log(`[SafeSave] 🔍 Starting safe save for ${tableName}:`, {
      newItemsCount: newItems?.length || 0,
      context
    });

    // 1. Load từ Supabase (source of truth) - KHÔNG phải cache
    const { success, data: existingItems } = await getExistingFn();
    
    if (!success) {
      console.error(`[SafeSave] ❌ Failed to load existing ${tableName} from Supabase`);
      return { success: false, error: 'Failed to load existing data from Supabase' };
    }

    const existingItemsList = existingItems || [];
    console.log(`[SafeSave] 📊 Loaded ${existingItemsList.length} existing ${tableName} from Supabase`);
    
    // DEBUG: Log để kiểm tra format
    if (existingItemsList.length > 0) {
      console.log(`[SafeSave] 🔍 Sample existing item:`, JSON.stringify(existingItemsList[0], null, 2));
    }
    if (newItems.length > 0) {
      console.log(`[SafeSave] 🔍 Sample new item:`, JSON.stringify(newItems[0], null, 2));
    }

    // 2. Tạo maps để so sánh nhanh
    const existingMap = new Map(
      existingItemsList.map(item => [item[compareKey], item])
    );
    const newMap = new Map(
      newItems.map(item => [item[compareKey], item])
    );
    
    console.log(`[SafeSave] 🔍 Maps created:`, {
      existingKeys: Array.from(existingMap.keys()),
      newKeys: Array.from(newMap.keys())
    });

    // 3. Phân loại: insert, update, delete
    const toInsert = [];
    const toUpdate = [];
    const toDelete = [];

    // Items mới (chưa có trong DB) hoặc cần update
    for (const newItem of newItems) {
      const key = newItem[compareKey];
      const existing = existingMap.get(key);
      
      if (!existing) {
        // Chưa có trong DB → Insert
        toInsert.push(transformFn(newItem, context));
      } else {
        // Đã có trong DB → Kiểm tra có thay đổi không
        // So sánh ở app format (cả existing và newItem đều là app format)
        // So sánh các field quan trọng
        let hasChanged = false;
        
        // Fields cơ bản (cho chapters, series)
        const basicFields = ['title', 'description', 'orderIndex', 'order', 'name'];
        // Fields cho lessons
        const lessonFields = ['contentType', 'pdfUrl', 'htmlContent', 'theory', 'srs'];
        // Fields cho series
        const seriesFields = ['imageUrl'];
        
        // Kiểm tra tất cả fields có thể có
        const allFields = [...basicFields, ...lessonFields, ...seriesFields];
        
        for (const field of allFields) {
          // Chỉ so sánh nếu field tồn tại trong cả 2 objects
          if (!(field in existing) && !(field in newItem)) continue;
          
          const existingValue = existing[field];
          const newValue = newItem[field];
          
          // So sánh objects/arrays (cho theory, srs, etc.)
          if (typeof existingValue === 'object' && typeof newValue === 'object' && existingValue !== null && newValue !== null) {
            if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
              hasChanged = true;
              break;
            }
          } else if (existingValue !== newValue) {
            hasChanged = true;
            break;
          }
        }
        
        if (hasChanged) {
          toUpdate.push(transformFn(newItem, context));
        }
        // Nếu không thay đổi, bỏ qua (không cần update)
      }
    }

    // Items cũ (không còn trong danh sách mới) → Delete
    for (const [key, existing] of existingMap) {
      if (!newMap.has(key)) {
        toDelete.push(existing);
      }
    }

    console.log(`[SafeSave] 📋 Analysis for ${tableName}:`, {
      toInsert: toInsert.length,
      toUpdate: toUpdate.length,
      toDelete: toDelete.length,
      unchanged: existingItemsList.length - toUpdate.length - toDelete.length
    });

    // 4. Validation: Cảnh báo nếu xóa quá nhiều
    if (toDelete.length > 0) {
      const deleteRatio = existingItemsList.length > 0 
        ? toDelete.length / existingItemsList.length 
        : 0;
      
      if (deleteRatio > 0.3) {
        console.warn(`[SafeSave] ⚠️ WARNING: About to delete ${toDelete.length} ${tableName} (${(deleteRatio * 100).toFixed(1)}% of existing)`);
        console.warn(`[SafeSave] ⚠️ This might indicate data loss. Please verify.`);
      }
    }

    // 5. Thực hiện: Upsert + Delete có chọn lọc
    const results = {
      inserted: 0,
      updated: 0,
      deleted: 0,
      unchanged: 0,
      errors: []
    };

    // Upsert (insert + update) - batch operation
    const toUpsert = [...toInsert, ...toUpdate];
    if (toUpsert.length > 0) {
      // FIXED: Supabase tự động detect composite primary key
      // Không cần onConflict cho composite keys - Supabase sẽ tự handle
      // Chỉ dùng onConflict nếu có unique constraint đơn lẻ
      let upsertQuery = supabase
        .from(tableName)
        .upsert(toUpsert);
      
      // FIXED: Chỉ dùng onConflict nếu có và là single column
      // Với composite primary key, Supabase tự detect nên không cần onConflict
      if (onConflict && onConflict.length === 1) {
        // Chỉ dùng cho single column unique constraint
        upsertQuery = upsertQuery.onConflict(onConflict[0]);
      }
      // Nếu onConflict có nhiều columns (composite key), bỏ qua - Supabase tự detect
      
      const { data, error } = await upsertQuery.select();
      
      if (error) {
        console.error(`[SafeSave] ❌ Error upserting ${tableName}:`, error);
        console.error(`[SafeSave] ❌ Error details:`, JSON.stringify(error, null, 2));
        results.errors.push({ type: 'upsert', error, count: toUpsert.length });
      } else {
        // FIXED: Đếm chính xác inserted vs updated dựa trên data trả về
        // Nếu data.length > 0 nghĩa là có records được upsert thành công
        const actualUpserted = data?.length || 0;
        results.inserted = toInsert.length;
        results.updated = toUpdate.length;
        console.log(`[SafeSave] ✅ Upserted ${actualUpserted} ${tableName} (${toInsert.length} inserted, ${toUpdate.length} updated)`);
        
        // DEBUG: Log chi tiết để kiểm tra
        if (actualUpserted !== toUpsert.length) {
          console.warn(`[SafeSave] ⚠️ Warning: Expected to upsert ${toUpsert.length} but got ${actualUpserted} records`);
        }
      }
    }

    // Delete có chọn lọc - chỉ những items không còn trong danh sách mới
    if (toDelete.length > 0) {
      const deleteKeys = toDelete.map(item => item[compareKey]);
      
      let deleteQuery = supabase
        .from(tableName)
        .delete();
      
      // Thêm điều kiện delete
      if (deleteWhere) {
        for (const [key, value] of Object.entries(deleteWhere)) {
          deleteQuery = deleteQuery.eq(key, value);
        }
      }
      
      // Thêm điều kiện in() để chỉ xóa những items cần xóa
      deleteQuery = deleteQuery.in(compareKey, deleteKeys);
      
      const { error } = await deleteQuery;
      
      if (error) {
        console.error(`[SafeSave] ❌ Error deleting ${tableName}:`, error);
        results.errors.push({ type: 'delete', error, count: toDelete.length });
      } else {
        results.deleted = toDelete.length;
        console.log(`[SafeSave] ✅ Deleted ${toDelete.length} ${tableName}`);
      }
    }

    results.unchanged = existingItemsList.length - toUpdate.length - toDelete.length;

    // 6. Tổng kết
    const hasErrors = results.errors.length > 0;
    if (hasErrors) {
      console.error(`[SafeSave] ❌ Completed with errors:`, results.errors);
    } else {
      console.log(`[SafeSave] ✅ Successfully saved ${tableName}:`, {
        inserted: results.inserted,
        updated: results.updated,
        deleted: results.deleted,
        unchanged: results.unchanged,
        total: newItems.length
      });
    }

    return {
      success: !hasErrors,
      data: results,
      error: hasErrors ? results.errors : null
    };
  } catch (err) {
    console.error(`[SafeSave] ❌ Unexpected error saving ${tableName}:`, err);
    return {
      success: false,
      error: err,
      data: null
    };
  }
}

