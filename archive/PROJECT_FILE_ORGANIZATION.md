# 📁 THIẾT KẾ TỔ CHỨC FILE PROJECT

## 🎯 MỤC TIÊU

Thiết kế cấu trúc file hợp lý, dễ quản lý, dễ tìm kiếm và mở rộng cho project eLearning.

---

## 📊 CẤU TRÚC TỔNG THỂ ĐỀ XUẤT

```
elearning-project/
│
├── 📁 src/                          # Source code chính
│   ├── 📁 components/               # React components
│   ├── 📁 pages/                    # Page components
│   ├── 📁 features/                 # Feature modules
│   ├── 📁 data/                     # Static data (fallback)
│   ├── 📁 utils/                    # Utilities
│   ├── 📁 services/                 # API services
│   ├── 📁 contexts/                 # React contexts
│   ├── 📁 hooks/                    # Custom hooks
│   ├── 📁 styles/                   # CSS files
│   └── 📁 assets/                   # Images, fonts, etc.
│
├── 📁 public/                       # Static assets (served as-is)
│   ├── 📁 background/
│   ├── 📁 book_card/
│   ├── 📁 logo/
│   ├── 📁 quote/
│   └── 📁 data/
│
├── 📁 docs/                         # Tài liệu
│   ├── 📁 deployment/               # Deployment guides
│   ├── 📁 guides/                  # User guides
│   └── 📁 api/                      # API documentation
│
├── 📁 data/                         # Data management (MỚI)
│   ├── 📁 backups/                  # Export/Import backups
│   ├── 📁 exports/                  # Exported data files
│   └── 📁 imports/                   # Imported data files
│
├── 📁 scripts/                      # Utility scripts (MỚI)
│   ├── backup.js                    # Auto backup script
│   └── migrate.js                   # Migration script
│
├── 📁 config/                       # Configuration files (MỚI)
│   ├── .env.example
│   └── vite.config.js (move here?)
│
├── 📁 tests/                        # Test files (MỚI)
│   ├── unit/
│   └── integration/
│
├── 📄 README.md                     # Project overview
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 tailwind.config.js
├── 📄 .gitignore
└── 📄 .env.local                     # Local environment (gitignored)
```

---

## 📂 CHI TIẾT TỪNG THƯ MỤC

### **1. src/ - Source Code**

```
src/
├── 📁 components/                    # Reusable components
│   ├── 📁 admin/                   # Admin-specific components
│   │   ├── AdminLayout.jsx
│   │   └── 📁 content/             # Content management components
│   │       ├── AllLevelsOverview.jsx
│   │       ├── HierarchyView.jsx
│   │       ├── SeriesCard.jsx
│   │       ├── SeriesListView.jsx
│   │       ├── SeriesTableView.jsx
│   │       └── SeriesTreeView.jsx
│   ├── 📁 api_translate/           # Dictionary/Translation components
│   ├── 📁 editor/                  # Editor components
│   ├── Breadcrumbs.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── LoginModal.jsx
│   ├── Modal.jsx
│   ├── ProtectedLink.jsx
│   ├── ProtectedRoute.jsx
│   └── Sidebar.jsx
│
├── 📁 pages/                        # Page components
│   ├── 📁 admin/                   # Admin pages
│   │   ├── AdminDashboardPage.jsx
│   │   ├── ContentManagementPage.jsx
│   │   ├── ExamManagementPage.jsx
│   │   ├── ExportImportPage.jsx
│   │   ├── QuizEditorPage.jsx
│   │   └── UsersManagementPage.jsx
│   ├── 📁 editor/                   # Editor pages
│   ├── AboutPage.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   └── ProfilePage.jsx
│
├── 📁 features/                     # Feature modules
│   ├── 📁 books/                   # Book feature
│   │   ├── 📁 components/
│   │   └── 📁 pages/
│   └── 📁 jlpt/                    # JLPT exam feature
│       ├── 📁 components/
│       └── 📁 pages/
│
├── 📁 data/                         # Static data (fallback)
│   ├── 📁 jlpt/                    # JLPT exam data
│   │   ├── examQuestionsData.js
│   │   ├── jlptData.js
│   │   └── listeningQuestionsData.js
│   ├── 📁 level/                   # Level-based data
│   │   ├── bookData.js
│   │   ├── quizData.js
│   │   ├── 📁 n1/
│   │   ├── 📁 n2/
│   │   ├── 📁 n3/
│   │   ├── 📁 n4/
│   │   └── 📁 n5/
│   ├── jlptDictionary.js
│   └── users.js
│
├── 📁 utils/                        # Utility functions
│   ├── indexedDBManager.js         # IndexedDB operations
│   ├── indexedDBHelpers.js         # IndexedDB helpers
│   ├── localStorageManager.js      # Storage manager
│   ├── activityLogger.js
│   └── emailValidator.js
│
├── 📁 services/                     # API services
│   └── 📁 api_translate/
│       └── dictionaryService.js
│
├── 📁 contexts/                     # React contexts
│   └── AuthContext.jsx
│
├── 📁 hooks/                        # Custom hooks
│   └── useExamGuard.jsx
│
├── 📁 styles/                       # CSS files
│   ├── App.css
│   └── index.css
│
├── 📁 assets/                       # Static assets (images, fonts)
│
├── App.jsx                          # Main app component
└── main.jsx                         # Entry point
```

---

### **2. public/ - Static Assets**

```
public/
├── 📁 background/
│   └── main.jpg
├── 📁 book_card/                    # Book cover images
│   └── 📁 n1/
│       ├── 📁 shinkanzen/
│       ├── 📁 sou/
│       ├── 📁 speed_master/
│       ├── 📁 training/
│       └── 📁 try/
├── 📁 logo/
│   └── main.png
├── 📁 quote/
│   ├── quote_01.jpg
│   └── quote_02.jpg
├── 📁 data/
│   └── jlpt_dictionary.json
├── react.svg
└── vite.svg
```

---

### **3. docs/ - Documentation**

```
docs/
├── 📁 deployment/                   # Deployment guides
│   ├── COMPLETE_DEPLOYMENT_GUIDE.md
│   ├── MIGRATION_ROADMAP.md
│   ├── OPTIMAL_ARCHITECTURE_DESIGN.md
│   ├── QUICK_START_GUIDE.md
│   └── ...
│
├── 📁 guides/                      # User/Developer guides (MỚI - TỔ CHỨC LẠI)
│   ├── ADMIN_DASHBOARD_GUIDE.md
│   ├── AUTH_SYSTEM_GUIDE.md
│   ├── CONTENT_MANAGEMENT_GUIDE.md
│   ├── EXPORT_IMPORT_GUIDE.md
│   ├── QUIZ_EDITOR_GUIDE.md
│   └── USERS_MANAGEMENT_GUIDE.md
│
├── 📁 api/                         # API documentation (MỚI)
│   ├── INDEXEDDB_GUIDE.md
│   ├── INDEXEDDB_IMPROVEMENTS.md
│   └── INDEXEDDB_SUMMARY.md
│
├── 📁 data/                        # Data management docs (MỚI)
│   ├── CONTENT_STRUCTURE.md
│   ├── DATA_EXPORT_COMPATIBILITY.md
│   ├── DATA_STORAGE_AND_PERSISTENCE.md
│   ├── DATA_STORAGE_LOCATION.md
│   ├── EXPORT_FILE_LOCATION_GUIDE.md
│   └── INDEXEDDB_SYNC_EXPLANATION.md
│
├── 📁 troubleshooting/             # Troubleshooting (MỚI)
│   ├── TROUBLESHOOTING.md
│   └── QUICK_FIX.md
│
├── ADMIN_SIDEBAR_ORGANIZATION.md
├── CONTENT_STRUCTURE_UPDATE.md
├── QUIZ_EDITOR_EVALUATION.md
└── PROJECT_FILE_ORGANIZATION.md    # File này
```

---

### **4. data/ - Data Management (MỚI)**

```
data/
├── 📁 backups/                     # Export/Import backups
│   ├── 📁 2025-01/
│   │   ├── 📁 2025-01-16/
│   │   │   ├── all/
│   │   │   │   └── elearning-backup-all-2025-01-16.json
│   │   │   ├── n1/
│   │   │   │   └── elearning-backup-N1-2025-01-16.json
│   │   │   ├── series/
│   │   │   │   └── elearning-export-series-xxx-2025-01-16.json
│   │   │   └── books/
│   │   │       └── elearning-export-book-xxx-2025-01-16.json
│   │   ├── 📁 2025-01-09/
│   │   └── 📁 2025-01-02/
│   └── README.md                   # Backup instructions
│
├── 📁 exports/                     # Temporary export files
│   └── .gitkeep
│
├── 📁 imports/                     # Files ready to import
│   └── .gitkeep
│
└── README.md                       # Data management guide
```

---

### **5. scripts/ - Utility Scripts (MỚI)**

```
scripts/
├── backup.js                       # Auto organize backup files
├── migrate.js                      # Migration scripts
├── validate-data.js                # Validate JSON data
└── README.md                       # Scripts documentation
```

---

### **6. config/ - Configuration (MỚI)**

```
config/
├── .env.example                    # Environment variables template
├── vite.config.js                  # Vite config (move from root?)
└── tailwind.config.js              # Tailwind config (move from root?)
```

---

## 🔄 TỔ CHỨC LẠI FILE HIỆN TẠI

### **Các file .md ở root cần di chuyển:**

```
Root → docs/guides/
├── ADMIN_DASHBOARD_GUIDE.md
├── AUTH_SYSTEM_GUIDE.md
├── CONTENT_MANAGEMENT_GUIDE.md
├── EXAM_MANAGEMENT_FEATURES.md
├── GIT_BASICS_GUIDE.md
├── HOW_TO_ACCESS_QUIZ_EDITOR.md
├── QUIZ_EDITOR_GUIDE.md
└── USERS_MANAGEMENT_GUIDE.md

Root → docs/troubleshooting/
├── QUICK_FIX.md
└── TROUBLESHOOTING.md (đã có trong docs/)

Root → docs/data/
├── DATA_FLOW_DOCUMENTATION.md
└── STORAGE_FIX_SUMMARY.md

Root → docs/ (giữ lại)
├── EXAM_GUARD_LOGIC_CHECK.md
├── SESSION_SUMMARY.md
└── TEST_CHECKLIST.md
```

---

## 📋 QUY TẮC ĐẶT TÊN FILE

### **Components:**
```
PascalCase.jsx
- AdminLayout.jsx
- SeriesCard.jsx
- HierarchyView.jsx
```

### **Pages:**
```
PascalCase + Page.jsx
- AdminDashboardPage.jsx
- ContentManagementPage.jsx
- ExportImportPage.jsx
```

### **Utilities:**
```
camelCase.js
- indexedDBManager.js
- localStorageManager.js
- emailValidator.js
```

### **Data files:**
```
kebab-case.json hoặc camelCase.js
- jlpt_dictionary.json
- examQuestionsData.js
- bookData.js
```

### **Backup files:**
```
elearning-[type]-[name]-[date].json
- elearning-backup-all-2025-01-16.json
- elearning-export-series-shinkanzen-2025-01-16.json
- elearning-export-book-xxx-2025-01-16.json
```

### **Documentation:**
```
UPPERCASE_WITH_UNDERSCORES.md
- DATA_STORAGE_LOCATION.md
- EXPORT_IMPORT_GUIDE.md
- PROJECT_FILE_ORGANIZATION.md
```

---

## 🗂️ CẤU TRÚC THƯ MỤC BACKUP

### **Theo ngày (Khuyến nghị):**

```
data/backups/
├── 📁 2025-01/
│   ├── 📁 2025-01-16/
│   │   ├── all/
│   │   │   └── elearning-backup-all-2025-01-16.json
│   │   ├── n1/
│   │   │   └── elearning-backup-N1-2025-01-16.json
│   │   ├── series/
│   │   │   └── elearning-export-series-xxx-2025-01-16.json
│   │   └── books/
│   │       └── elearning-export-book-xxx-2025-01-16.json
│   └── 📁 2025-01-09/
│
└── 📁 2024-12/
    └── ...
```

### **Theo loại (Alternative):**

```
data/backups/
├── 📁 all/
│   ├── elearning-backup-all-2025-01-16.json
│   ├── elearning-backup-all-2025-01-09.json
│   └── elearning-backup-all-2025-01-02.json
│
├── 📁 by-level/
│   ├── 📁 n1/
│   ├── 📁 n2/
│   └── ...
│
├── 📁 by-series/
│   └── ...
│
└── 📁 by-book/
    └── ...
```

---

## 📝 .gitignore ĐỀ XUẤT

```gitignore
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
dist-ssr/
*.local

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
error.log

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store

# Backup files (optional - có thể commit hoặc không)
data/backups/
data/exports/
data/imports/

# Test coverage
coverage/

# Temporary files
*.tmp
*.temp
```

---

## 🎯 CHECKLIST TỔ CHỨC LẠI

### **Bước 1: Tạo thư mục mới**

```bash
# Tạo thư mục data/
mkdir -p data/backups
mkdir -p data/exports
mkdir -p data/imports

# Tạo thư mục scripts/
mkdir -p scripts

# Tạo thư mục docs/guides/
mkdir -p docs/guides
mkdir -p docs/api
mkdir -p docs/data
mkdir -p docs/troubleshooting
```

### **Bước 2: Di chuyển file .md**

```bash
# Di chuyển guides
mv ADMIN_DASHBOARD_GUIDE.md docs/guides/
mv AUTH_SYSTEM_GUIDE.md docs/guides/
mv CONTENT_MANAGEMENT_GUIDE.md docs/guides/
mv EXAM_MANAGEMENT_FEATURES.md docs/guides/
mv GIT_BASICS_GUIDE.md docs/guides/
mv HOW_TO_ACCESS_QUIZ_EDITOR.md docs/guides/
mv QUIZ_EDITOR_GUIDE.md docs/guides/
mv USERS_MANAGEMENT_GUIDE.md docs/guides/

# Di chuyển troubleshooting
mv QUICK_FIX.md docs/troubleshooting/

# Di chuyển data docs
mv DATA_FLOW_DOCUMENTATION.md docs/data/
mv STORAGE_FIX_SUMMARY.md docs/data/
```

### **Bước 3: Tổ chức lại docs/**

```bash
# Di chuyển IndexedDB docs vào api/
mv docs/INDEXEDDB_GUIDE.md docs/api/
mv docs/INDEXEDDB_IMPROVEMENTS.md docs/api/
mv docs/INDEXEDDB_SUMMARY.md docs/api/

# Di chuyển data docs vào data/
mv docs/CONTENT_STRUCTURE.md docs/data/
mv docs/DATA_EXPORT_COMPATIBILITY.md docs/data/
mv docs/DATA_STORAGE_AND_PERSISTENCE.md docs/data/
mv docs/DATA_STORAGE_LOCATION.md docs/data/
mv docs/EXPORT_FILE_LOCATION_GUIDE.md docs/data/
mv docs/INDEXEDDB_SYNC_EXPLANATION.md docs/data/
```

### **Bước 4: Tạo README.md cho từng thư mục**

Tạo file `data/README.md`:
```markdown
# 📦 Data Management

Thư mục này chứa:
- `backups/` - Export/Import backup files
- `exports/` - Temporary export files
- `imports/` - Files ready to import

Xem thêm: `docs/data/EXPORT_FILE_LOCATION_GUIDE.md`
```

---

## 🎨 SƠ ĐỒ TỔ CHỨC

```
elearning-project/
│
├── 📁 src/                    # Source code
│   ├── components/            # UI components
│   ├── pages/                # Page components
│   ├── features/             # Feature modules
│   ├── data/                 # Static data (fallback)
│   ├── utils/                # Utilities
│   └── ...
│
├── 📁 public/                # Static assets
│   ├── background/
│   ├── book_card/
│   └── ...
│
├── 📁 docs/                  # Documentation
│   ├── deployment/           # Deployment
│   ├── guides/               # User guides
│   ├── api/                 # API docs
│   ├── data/                # Data management
│   └── troubleshooting/     # Troubleshooting
│
├── 📁 data/                  # Data management (MỚI)
│   ├── backups/             # Backup files
│   ├── exports/             # Export files
│   └── imports/            # Import files
│
├── 📁 scripts/              # Utility scripts (MỚI)
│   └── backup.js
│
├── 📄 README.md             # Project overview
├── 📄 package.json
└── 📄 .gitignore
```

---

## ✅ LỢI ÍCH CỦA CẤU TRÚC NÀY

### **1. Dễ tìm kiếm:**
- ✅ File được tổ chức theo chức năng
- ✅ Tên file rõ ràng, nhất quán
- ✅ Thư mục có mục đích rõ ràng

### **2. Dễ quản lý:**
- ✅ Backup files có vị trí riêng
- ✅ Documentation được phân loại
- ✅ Scripts tách biệt

### **3. Dễ mở rộng:**
- ✅ Có thể thêm feature mới dễ dàng
- ✅ Có thể thêm script mới
- ✅ Có thể thêm docs mới

### **4. Professional:**
- ✅ Cấu trúc chuẩn React project
- ✅ Tuân thủ best practices
- ✅ Dễ maintain

---

## 🚀 BƯỚC TIẾP THEO

1. **Tạo thư mục mới:**
   ```bash
   mkdir -p data/backups data/exports data/imports
   mkdir -p scripts
   mkdir -p docs/guides docs/api docs/data docs/troubleshooting
   ```

2. **Di chuyển file:**
   - Di chuyển các file .md từ root vào docs/guides/
   - Tổ chức lại docs/ theo cấu trúc mới

3. **Tạo README.md:**
   - Tạo README.md cho mỗi thư mục chính
   - Giải thích mục đích của từng thư mục

4. **Update .gitignore:**
   - Thêm data/backups/ vào .gitignore (nếu không muốn commit)

5. **Test:**
   - Đảm bảo mọi thứ vẫn hoạt động sau khi di chuyển
   - Update import paths nếu cần

---

## 📚 TÓM TẮT

### **Cấu trúc đề xuất:**

1. ✅ **src/** - Source code (giữ nguyên)
2. ✅ **public/** - Static assets (giữ nguyên)
3. ✅ **docs/** - Tổ chức lại theo categories
4. ✅ **data/** - MỚI: Backup và data management
5. ✅ **scripts/** - MỚI: Utility scripts

### **Quy tắc:**

- ✅ Components: PascalCase.jsx
- ✅ Pages: PascalCase + Page.jsx
- ✅ Utils: camelCase.js
- ✅ Data: kebab-case.json
- ✅ Docs: UPPERCASE_WITH_UNDERSCORES.md

### **Backup files:**

- ✅ Lưu trong `data/backups/[ngày]/`
- ✅ Tổ chức theo ngày/tháng
- ✅ Có thể commit hoặc gitignore

---

**Cấu trúc này sẽ giúp project của bạn dễ quản lý, dễ mở rộng và professional hơn!** ✅

