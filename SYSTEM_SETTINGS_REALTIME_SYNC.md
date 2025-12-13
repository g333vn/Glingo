# 🔄 System Settings Real-time Sync với Supabase

## 📋 Tổng quan

Đã cập nhật hệ thống để lưu các System Settings (Platform Name, Tagline, Description, Contact Email) vào Supabase database và đồng bộ real-time toàn hệ thống.

## ✅ Những gì đã được thực hiện

### 1. **Database Migration**
- ✅ Tạo migration file: `migrations/add_system_settings_to_app_settings.sql`
- ✅ Thêm column `system_settings` (JSONB) vào bảng `app_settings`
- ✅ Lưu trữ: `platformName`, `platformTagline`, `platformDescription`, `contactEmail`

### 2. **Service Layer**
- ✅ Cập nhật `src/services/appSettingsService.js`:
  - `getSystemSettingsFromSupabase()` - Load settings từ Supabase
  - `saveSystemSettingsToSupabase()` - Lưu settings vào Supabase
  - `subscribeToAppSettings()` - Real-time subscription cho changes

### 3. **Settings Manager**
- ✅ Cập nhật `src/utils/settingsManager.js`:
  - Load từ Supabase trước (async, non-blocking)
  - Fallback về localStorage nếu Supabase fail
  - Auto-sync từ Supabase trong background

### 4. **Settings Page**
- ✅ Cập nhật `src/pages/admin/SettingsPage.jsx`:
  - Tự động lưu vào Supabase khi save settings
  - Lưu vào localStorage làm cache
  - Hiển thị success/error messages

### 5. **Real-time Updates**
- ✅ Cập nhật các components để subscribe real-time:
  - `src/components/Header.jsx`
  - `src/components/Footer.jsx`
  - `src/pages/HomePage.jsx`
- ✅ Tự động cập nhật UI khi settings thay đổi trong Supabase

## 🚀 Cách sử dụng

### Bước 1: Chạy Migration SQL

1. Mở Supabase Dashboard → SQL Editor
2. Chạy file: `migrations/add_system_settings_to_app_settings.sql`
3. Verify column đã được tạo:
```sql
SELECT system_settings FROM app_settings WHERE id = 1;
```

### Bước 2: Test Real-time Sync

1. **Mở 2 browser windows/tabs:**
   - Window 1: Admin Settings Page (`/admin/settings`)
   - Window 2: Home Page hoặc bất kỳ page nào

2. **Trong Window 1 (Admin):**
   - Thay đổi Platform Name, Tagline, Description, hoặc Contact Email
   - Click "Save" button

3. **Trong Window 2:**
   - Settings sẽ tự động cập nhật real-time (không cần refresh)
   - Header, Footer, HomePage sẽ hiển thị giá trị mới ngay lập tức

## 📊 Data Flow

```
Admin thay đổi Settings
    ↓
SettingsPage.jsx → saveSystemSettingsToSupabase()
    ↓
Supabase Database (app_settings.system_settings)
    ↓
Real-time Subscription (subscribeToAppSettings)
    ↓
Header.jsx, Footer.jsx, HomePage.jsx
    ↓
UI tự động cập nhật
```

## 🔧 Cấu trúc Database

### Table: `app_settings`

```sql
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT false,
  access_control JSONB DEFAULT '{}',
  system_settings JSONB DEFAULT '{}',  -- ✅ NEW
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### System Settings Structure:

```json
{
  "platformName": "Learn Your Approach",
  "platformTagline": "Japanese Learning Platform",
  "platformDescription": {
    "vi": "Nền tảng học tiếng Nhật chuyên nghiệp...",
    "en": "Professional Japanese learning platform...",
    "ja": "JLPT模擬試験と多様な学習資料..."
  },
  "contactEmail": "admin@example.com"
}
```

## 🔄 Sync Strategy

### Priority Order:
1. **Supabase** (Cloud - Source of Truth) ✅
2. **localStorage** (Local Cache - Offline Access) ✅

### Save Flow:
```
Admin changes → Save to Supabase → Save to localStorage (cache)
```

### Load Flow:
```
Load from localStorage (fast) → Sync from Supabase (background) → Update if newer
```

### Real-time Updates:
- Supabase real-time subscription → Auto-update all components
- localStorage events → Fallback for local changes

## 🎯 Components được cập nhật

| Component | Chức năng |
|-----------|-----------|
| `Header.jsx` | Hiển thị Platform Name, Tagline → Real-time update |
| `Footer.jsx` | Hiển thị Platform Name, Description, Contact Email → Real-time update |
| `HomePage.jsx` | Hiển thị Platform Description → Real-time update |
| `SettingsPage.jsx` | Form để edit settings → Save to Supabase |

## ⚠️ Lưu ý

1. **Supabase Real-time phải được enable:**
   - Mặc định đã enable cho tất cả tables
   - Nếu không hoạt động, check Supabase Dashboard → Database → Replication

2. **Fallback Strategy:**
   - Nếu Supabase fail → Sử dụng localStorage
   - Nếu localStorage fail → Sử dụng default values

3. **Performance:**
   - Load từ localStorage trước (synchronous, fast)
   - Sync từ Supabase trong background (async, non-blocking)
   - Real-time updates chỉ trigger khi có thay đổi

## 🐛 Troubleshooting

### Settings không cập nhật real-time?

1. Check Supabase Replication:
   ```sql
   -- Verify real-time is enabled
   SELECT * FROM pg_publication_tables WHERE tablename = 'app_settings';
   ```

2. Check browser console:
   - Look for `[AppSettings] 🔄 Real-time update received`
   - Check for any errors

3. Verify subscription:
   - Open browser DevTools → Network tab
   - Look for WebSocket connections to Supabase

### Settings không lưu vào Supabase?

1. Check Supabase RLS policies:
   - Admin user phải có quyền UPDATE trên `app_settings`
   
2. Check browser console:
   - Look for `[AppSettings] ✅ Successfully saved system settings`
   - Check for any error messages

3. Verify database:
   ```sql
   SELECT system_settings FROM app_settings WHERE id = 1;
   ```

## 📝 Next Steps

- [ ] Test với nhiều users cùng lúc
- [ ] Add loading states khi sync từ Supabase
- [ ] Add error handling UI khi Supabase fail
- [ ] Consider adding settings history/audit log

---

**Created:** $(date)
**Status:** ✅ Complete - Ready for testing

