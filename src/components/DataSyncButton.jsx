// src/components/DataSyncButton.jsx
// Button để manual sync data giữa localStorage và Supabase

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fullSync, syncLocalStorageToSupabase, syncSupabaseToLocalStorage } from '../services/dataSyncService.js';
import { useToast } from '../components/ToastNotification.jsx';

function DataSyncButton({ variant = 'full' }) {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async (syncType) => {
    if (!user || typeof user.id !== 'string' || user.id.length < 20) {
      warning('Vui lòng đăng nhập với Supabase account để sync');
      return;
    }

    setIsSyncing(true);
    try {
      let result;
      let message;

      if (syncType === 'full') {
        result = await fullSync(user.id);
        message = result.success
          ? `✅ Đã sync ${result.backup.examResults} exam results và ${result.backup.progress} progress`
          : `⚠️ Sync hoàn thành với ${result.errors.length} lỗi`;
      } else if (syncType === 'backup') {
        result = await syncLocalStorageToSupabase(user.id);
        message = result.success
          ? `✅ Đã backup ${result.synced.examResults} exam results và ${result.synced.progress} progress lên Supabase`
          : `⚠️ Backup hoàn thành với ${result.errors.length} lỗi`;
      } else if (syncType === 'restore') {
        result = await syncSupabaseToLocalStorage(user.id);
        message = result.success
          ? `✅ Đã restore ${result.restored.examResults} exam results và ${result.restored.progress} progress từ Supabase`
          : `⚠️ Restore hoàn thành với ${result.errors.length} lỗi`;
      }

      if (result.success) {
        success(message);
      } else {
        warning(message);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.warn('[DataSync] Errors:', result.errors);
      }
    } catch (err) {
      console.error('[DataSync] Error:', err);
      error('Lỗi khi sync dữ liệu: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user || typeof user.id !== 'string' || user.id.length < 20) {
    return null; // Chỉ hiển thị cho Supabase users
  }

  return (
    <div className="flex flex-col gap-2">
      {variant === 'full' && (
        <button
          onClick={() => handleSync('full')}
          disabled={isSyncing}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? '🔄 Đang sync...' : '🔄 Sync dữ liệu'}
        </button>
      )}
      
      {variant === 'backup' && (
        <button
          onClick={() => handleSync('backup')}
          disabled={isSyncing}
          className="px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? '💾 Đang backup...' : '💾 Backup lên Supabase'}
        </button>
      )}
      
      {variant === 'restore' && (
        <button
          onClick={() => handleSync('restore')}
          disabled={isSyncing}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? '📥 Đang restore...' : '📥 Restore từ Supabase'}
        </button>
      )}
    </div>
  );
}

export default DataSyncButton;

