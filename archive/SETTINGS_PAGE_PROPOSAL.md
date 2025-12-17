# ⚙️ SETTINGS PAGE - ĐỀ XUẤT PHÁT TRIỂN

## 📊 Phân tích hệ thống hiện tại

### **Đặc điểm hệ thống:**
- ✅ E-learning platform (Japanese learning)
- ✅ localStorage-based (no backend)
- ✅ 3 roles: Admin, Editor, User
- ✅ Content: Books, Chapters, Lessons, Quizzes, JLPT Exams
- ✅ Analytics & Tracking system
- ✅ Seed data pattern

### **Settings cần thiết:**

---

## 🎯 SETTINGS PAGE STRUCTURE (Đề xuất)

### **1. 🏢 SYSTEM SETTINGS (Cài đặt Hệ thống)**

#### **General Information**
```
- Platform Name: "Learn Your Approach"
- Platform Tagline: "Japanese Learning Platform"
- Platform Logo: [Upload/URL]
- Platform Description: [Text area]
- Contact Email: admin@example.com
- Support URL: /about-me
```

#### **Regional Settings**
```
- Language: Vietnamese / English / Japanese
- Timezone: Asia/Ho_Chi_Minh
- Date Format: DD/MM/YYYY
- Time Format: 24-hour / 12-hour
```

#### **System Status**
```
- Maintenance Mode: ON/OFF
- Registration Enabled: ON/OFF
- Debug Mode: ON/OFF
- Analytics Tracking: ON/OFF
```

---

### **2. 👥 USER MANAGEMENT SETTINGS**

#### **Registration Settings**
```
- Allow Public Registration: ON/OFF
- Default Role for New Users: User / Editor / Admin
- Email Verification Required: ON/OFF (future)
- Auto-approve Registrations: ON/OFF
```

#### **Password Policy**
```
- Minimum Password Length: 6-20 characters
- Require Uppercase: ON/OFF
- Require Numbers: ON/OFF
- Require Special Characters: ON/OFF
- Password Expiry: Never / 30 / 60 / 90 days
```

#### **Session Management**
```
- Session Timeout: 30min / 1h / 2h / 24h / Never
- Auto-logout Inactive Users: ON/OFF
- Max Sessions per User: 1 / 3 / 5 / Unlimited
```

---

### **3. 📚 CONTENT SETTINGS**

#### **Default Content Settings**
```
- Default Quiz Time Limit: 30 minutes
- Default Passing Score: 60%
- Show Answers After Completion: ON/OFF
- Allow Retry: ON/OFF
- Max Retry Attempts: 3 / 5 / Unlimited
```

#### **JLPT Exam Settings**
```
- Default Exam Duration (N1): 110 minutes
- Default Exam Duration (N2): 105 minutes
- Default Passing Score: 100/180
- Default Section Min Score: 19/60
- Exam Guard Enabled: ON/OFF
- Show Timer: ON/OFF
```

#### **Content Visibility**
```
- Show Draft Content to Users: ON/OFF
- Show Coming Soon Items: ON/OFF
- Auto-publish Content: ON/OFF
```

---

### **4. 💾 STORAGE & BACKUP SETTINGS**

#### **Storage Management**
```
- Storage Type: localStorage / IndexedDB
- Auto-backup Enabled: ON/OFF
- Backup Frequency: Daily / Weekly / Monthly
- Keep Backup Count: 5 / 10 / 30
- Auto-cleanup Old Data: ON/OFF
- Data Retention Period: 90 days / 180 days / 1 year
```

#### **Seed Data Configuration**
```
- Demo Users Enabled: ON/OFF (from seedData.js)
- Auto-seed on Empty: ON/OFF
- Keep Deleted Demos: ON/OFF
```

---

### **5. 🎨 APPEARANCE SETTINGS**

#### **Theme & Branding**
```
- Theme: Neo Brutalism (locked)
- Primary Color: Yellow (#FFB800)
- Accent Color: Orange (#FF5722)
- Logo Position: Left / Center
- Header Style: Fixed / Sticky / Static
```

#### **UI Preferences**
```
- Sidebar Default State: Open / Closed
- Items Per Page (Sidebar): 10 / 12 / 15
- Animation Speed: Fast / Normal / Slow
- Show Tooltips: ON/OFF
```

---

### **6. 📧 NOTIFICATION SETTINGS (Future)**

#### **Email Notifications**
```
- New User Registration: ON/OFF
- Password Changed: ON/OFF
- Content Published: ON/OFF
- System Alerts: ON/OFF
```

#### **In-App Notifications**
```
- Show Welcome Message: ON/OFF
- Show Update Notifications: ON/OFF
- Show Achievement Badges: ON/OFF
```

---

### **7. 📊 ANALYTICS SETTINGS**

#### **Tracking Configuration**
```
- Track User Activities: ON/OFF
- Track Learning Progress: ON/OFF
- Track System Events: ON/OFF
- Auto-cleanup Analytics (90 days): ON/OFF
```

#### **Dashboard Configuration**
```
- Auto-refresh Interval: 30s / 1min / 5min / Manual
- Show KPIs: ON/OFF
- Show User Growth Chart: ON/OFF
- Show Activity Feed: ON/OFF
```

---

### **8. 🔐 SECURITY SETTINGS**

#### **Access Control**
```
- Require Login for Content: ON/OFF
- Admin Panel IP Whitelist: [List of IPs]
- API Rate Limiting: ON/OFF (future)
- CORS Settings: [Domains] (future)
```

#### **Data Protection**
```
- Encrypt Passwords: ON (always)
- Encrypt User Data: ON/OFF
- Session Encryption: ON/OFF
- Clear Data on Logout: ON/OFF
```

---

### **9. 🧪 ADVANCED SETTINGS (Dev Tools)**

#### **Developer Options**
```
- Show Debug Logs: ON/OFF
- Show Performance Metrics: ON/OFF
- Enable Feature Flags: ON/OFF
- API Mock Mode: ON/OFF
```

#### **Maintenance Tools**
```
- Clear All Cache: [Button]
- Rebuild Indexes: [Button]
- Verify Data Integrity: [Button]
- Export System Logs: [Button]
```

---

## 🎨 UI/UX DESIGN PROPOSAL

### **Layout:**

```
┌─────────────────────────────────────────────────┐
│  ⚙️ SETTINGS                                    │
│  Cài đặt hệ thống                               │
│                                                  │
│  ┌──────────────┬────────────────────────────┐ │
│  │ Sidebar      │  Content Area              │ │
│  │              │                            │ │
│  │ 🏢 System    │  [Active tab content]      │ │
│  │ 👥 Users     │                            │ │
│  │ 📚 Content   │  [Form fields]             │ │
│  │ 💾 Storage   │                            │ │
│  │ 🎨 Appearance│  [Toggles, inputs]         │ │
│  │ 📊 Analytics │                            │ │
│  │ 🔐 Security  │  [Save button]             │ │
│  │ 🧪 Advanced  │                            │ │
│  └──────────────┴────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### **Features:**

1. **Tab-based Navigation** (sidebar tabs)
2. **Form with Sections** (collapsible)
3. **Save Button** (sticky bottom)
4. **Reset to Defaults** (per section)
5. **Import/Export Settings** (JSON file)

---

## 💡 RECOMMENDED IMPLEMENTATION

### **Phase 1: Essential Settings (MVP)** ⭐

1. **System Settings**
   - Platform name, logo, description
   - Maintenance mode toggle
   - Registration enabled toggle

2. **User Settings**
   - Default role for new users
   - Password minimum length
   - Session timeout

3. **Content Settings**
   - Default quiz time limit
   - Default passing score
   - Show answers after completion

4. **Seed Data Settings**
   - Demo users enabled/disabled
   - Factory reset button
   - Clear blacklist button

### **Phase 2: Advanced Settings**

5. **Analytics Settings**
6. **Storage Settings**
7. **Security Settings**

### **Phase 3: Future Enhancements**

8. **Notification Settings**
9. **Integration Settings**
10. **Developer Tools**

---

## 🔧 Technical Implementation

### **Data Structure:**

```javascript
// localStorage key: 'systemSettings'
{
  system: {
    platformName: "Learn Your Approach",
    platformTagline: "Japanese Learning Platform",
    maintenanceMode: false,
    registrationEnabled: true,
    debugMode: false,
    analyticsEnabled: true
  },
  users: {
    defaultRole: "user",
    passwordMinLength: 6,
    sessionTimeout: 3600000, // 1 hour in ms
    autoLogoutInactive: true
  },
  content: {
    defaultQuizTimeLimit: 30,
    defaultPassingScore: 60,
    showAnswersAfterCompletion: true,
    allowRetry: true,
    maxRetryAttempts: 3
  },
  seed: {
    demoUsersEnabled: true,
    autoSeed: true,
    keepAfterDelete: false
  },
  analytics: {
    trackActivities: true,
    autoRefreshInterval: 30000, // 30s
    autoCleanup: true,
    retentionDays: 90
  },
  appearance: {
    theme: "neo-brutalism",
    primaryColor: "#FFB800",
    accentColor: "#FF5722",
    sidebarDefaultOpen: true,
    itemsPerPage: 12
  }
}
```

### **Helper Functions:**

```javascript
// src/utils/settingsManager.js

export function getSettings() {
  const defaults = { /* ... */ };
  const saved = localStorage.getItem('systemSettings');
  return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
}

export function saveSettings(settings) {
  localStorage.setItem('systemSettings', JSON.stringify(settings));
  dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
}

export function resetSettings() {
  localStorage.removeItem('systemSettings');
  return getSettings();
}
```

---

## 🎯 Ưu tiên phát triển

### **Must Have (Phase 1):**
✅ System: Platform info, maintenance mode
✅ Users: Default role, password policy
✅ Content: Quiz/exam defaults
✅ Seed: Demo user management

### **Should Have (Phase 2):**
📊 Analytics configuration
💾 Storage & backup automation
🔐 Security policies

### **Nice to Have (Phase 3):**
📧 Notifications
🎨 Theme customization
🧪 Developer tools

---

## 🎨 UI Components Cần Tạo

1. **ToggleSwitch** - ON/OFF switches
2. **SettingsSection** - Collapsible sections
3. **SettingsInput** - Styled inputs cho settings
4. **ColorPicker** - Pick colors (nếu cần)
5. **SettingsTabs** - Tab navigation

---

## 📋 User Stories

**As an Admin:**
- Tôi muốn thay đổi tên platform để branding
- Tôi muốn bật/tắt registration để control user growth
- Tôi muốn đặt maintenance mode khi update hệ thống
- Tôi muốn config default settings cho quiz/exam
- Tôi muốn quản lý seed data dễ dàng
- Tôi muốn export/import settings để backup

**As a Developer:**
- Settings được lưu trong localStorage dễ debug
- Settings có defaults tốt
- Settings có validation
- Settings có documentation

---

## 🚀 Next Steps

1. **Review đề xuất này** với user
2. **Quyết định Phase 1 scope**
3. **Tạo SettingsPage.jsx**
4. **Tạo helper components**
5. **Implement Phase 1 features**
6. **Test thoroughly**
7. **Document usage**

---

**Bạn muốn tôi implement Settings page theo đề xuất này không?**
**Hoặc bạn có ý tưởng khác về các settings cần thiết?**

