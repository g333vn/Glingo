# 📖 GLINGO CODEBASE GUIDE

> Tài liệu hướng dẫn đọc hiểu toàn bộ codebase của dự án Glingo - Japanese Learning Platform

---

## 📋 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Tech Stack](#2-tech-stack)
3. [Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
4. [Kiến Trúc Hệ Thống](#4-kiến-trúc-hệ-thống)
5. [Luồng Khởi Động Ứng Dụng](#5-luồng-khởi-động-ứng-dụng)
6. [Luồng Dữ Liệu (Data Flow)](#6-luồng-dữ-liệu-data-flow)
7. [Cách Đọc Hiểu Từng Layer](#7-cách-đọc-hiểu-từng-layer)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Access Control](#9-access-control)
10. [Database Schema](#10-database-schema)
11. [Route Structure](#11-route-structure)
12. [Thứ Tự Đọc Code Đề Xuất](#12-thứ-tự-đọc-code-đề-xuất)

---

## 📖 HƯỚNG DẪN ĐỌC CODE

### Cách Sử Dụng Tài Liệu Này

Khi đọc tài liệu, bạn sẽ thấy các **file references** như sau:

```
📍 Xem code tại: src/main.jsx (dòng 1-50)
```

**Cách làm:**
1. Mở file được chỉ định trong IDE
2. Navigate đến dòng số được đề cập
3. Đọc code song song với giải thích trong tài liệu
4. Hiểu logic và flow

### File References Format

Trong tài liệu, bạn sẽ thấy:

- **📍 Xem code tại:** `filepath` (dòng X-Y) - Xem code cụ thể
- **📁 File liên quan:** `filepath` - File liên quan cần đọc
- **🔗 Xem thêm:** `filepath` - File để hiểu sâu hơn

### Bảng Tra Cứu Nhanh Các File Quan Trọng

| File | Vị trí | Mục đích | Dòng quan trọng |
|------|--------|----------|-----------------|
| **Entry Point** |
| `src/main.jsx` | Root | Entry point, routes, providers | 1-427 (toàn bộ) |
| `index.html` | Root | HTML entry | - |
| **Core Components** |
| `src/App.jsx` | Root | Root layout, initialization | 1-323 (toàn bộ) |
| `src/components/Header.jsx` | components | Navigation bar | - |
| `src/components/Footer.jsx` | components | Footer | - |
| **Contexts** |
| `src/contexts/AuthContext.jsx` | contexts | Authentication state | 1-496 (toàn bộ) |
| `src/contexts/LanguageContext.jsx` | contexts | i18n translations | 1-140 (toàn bộ) |
| **Services** |
| `src/services/supabaseClient.js` | services | Supabase config | 1-133 (toàn bộ) |
| `src/services/authService.js` | services | Auth operations | - |
| `src/services/contentService.js` | services | Content CRUD | 1-890 (toàn bộ) |
| `src/services/examService.js` | services | Exam operations | - |
| `src/services/accessControlService.js` | services | Access control | - |
| **Route Guards** |
| `src/components/ProtectedRoute.jsx` | components | Auth guard | 1-70 (toàn bộ) |
| `src/components/AccessGuard.jsx` | components | Access control guard | - |
| **Pages** |
| `src/pages/HomePage.jsx` | pages | Home page | - |
| `src/features/books/pages/LevelN5Page.jsx` | features/books/pages | Level N5 page | 1-305 (toàn bộ) |
| `src/features/jlpt/pages/JLPTPage.jsx` | features/jlpt/pages | JLPT selection | - |
| **Utils** |
| `src/utils/localStorageManager.js` | utils | Storage interface | - |
| `src/utils/settingsManager.js` | utils | Settings management | - |

### Thứ Tự Đọc Code Khuyến Nghị

**Nếu bạn mới bắt đầu:**
1. Đọc tài liệu từ đầu đến cuối
2. Mở file được reference khi đọc đến phần đó
3. Đọc code song song với giải thích
4. Thử navigate trong code để hiểu flow

**Nếu bạn muốn hiểu một feature cụ thể:**
1. Tìm feature đó trong mục lục
2. Đọc phần giải thích
3. Mở các file được reference
4. Trace code từ entry point đến implementation

---

## 1. TỔNG QUAN DỰ ÁN

**Glingo** là một nền tảng học tiếng Nhật toàn diện với các tính năng chính:

| Tính năng | Mô tả |
|-----------|-------|
| **Level System (N1-N5)** | Học theo cấp độ JLPT với cấu trúc Books → Chapters → Lessons → Quizzes |
| **JLPT Exam Practice** | Luyện thi JLPT với đề thi mô phỏng (Knowledge + Listening) |
| **SRS System** | Hệ thống Spaced Repetition để ghi nhớ từ vựng hiệu quả |
| **JLPT Dictionary** | Từ điển tích hợp với 8,292+ từ vựng |
| **Dashboard** | Theo dõi tiến độ học tập cá nhân |
| **Admin Panel** | Quản lý content, users, exams, settings |

---

## 2. TECH STACK

| Phần | Công nghệ |
|------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, Ant Design 5 |
| **Backend** | Supabase (Auth, PostgreSQL, RLS, Real-time, Storage) |
| **Routing** | React Router v7 |
| **State Management** | React Context API |
| **Storage** | IndexedDB (primary), localStorage (fallback), Supabase (cloud) |
| **Icons** | Lucide React, React Icons |
| **PWA** | vite-plugin-pwa |
| **Deployment** | Vercel (Analytics, Speed Insights) |

### Dependencies chính (`package.json`)

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.4",
    "@supabase/supabase-js": "^2.85.0",
    "antd": "^5.28.0",
    "lucide-react": "^0.553.0",
    "idb": "^8.0.3"
  }
}
```

#### Giải thích chi tiết từng Dependency

**Vị trí trong tài liệu:** Phần này nằm trong mục **"2. Tech Stack"**, sau bảng tổng quan công nghệ, nhằm liệt kê các thư viện JavaScript/React chính được sử dụng.

**Ý nghĩa của từng dependency:**

| Dependency | Phiên bản | Vai trò trong dự án |
|------------|----------|---------------------|
| **`react`** | ^19.1.1 | React core library - Framework chính để xây dựng UI |
| **`react-dom`** | ^19.1.1 | React DOM renderer - Render React components vào browser DOM |
| **`react-router-dom`** | ^7.9.4 | Routing library - Điều hướng giữa các trang (SPA routing) |
| **`@supabase/supabase-js`** | ^2.85.0 | Supabase client SDK - Giao tiếp với backend (auth, database, storage, real-time) |
| **`antd`** | ^5.28.0 | Ant Design UI library - Component library cho admin panel và forms |
| **`lucide-react`** | ^0.553.0 | Icon library - Cung cấp icon components cho UI |
| **`idb`** | ^8.0.3 | IndexedDB wrapper - Quản lý IndexedDB để cache dữ liệu offline (dung lượng lớn hơn localStorage) |

**Thông tin quan trọng:**

1. **React 19**: Dự án sử dụng React 19 (phiên bản mới nhất), cần `@ant-design/v5-patch-for-react-19` để tương thích với Ant Design
2. **React Router v7**: Routing hiện đại, hỗ trợ code splitting và lazy loading
3. **Supabase**: Backend-as-a-Service, cung cấp authentication, PostgreSQL database, storage, và real-time subscriptions
4. **Ant Design 5**: UI component library chuyên nghiệp, được dùng chủ yếu trong admin panel
5. **IndexedDB (`idb`)**: Wrapper library để làm việc với IndexedDB dễ dàng hơn, dùng để cache dữ liệu lớn cho hỗ trợ offline

**Mối quan hệ giữa các dependencies:**

```
React 19 + React Router v7
    ↓
Tạo Single Page Application (SPA)
    ↓
Ant Design 5 → UI Components (Admin Panel, Forms)
Lucide React → Icons
    ↓
@supabase/supabase-js → Backend Services
    ↓
idb → Offline Caching (IndexedDB)
```

**Tại sao phần này quan trọng?**

1. **Hiểu công nghệ nền tảng**: Biết dự án dùng những thư viện nào
2. **Cài đặt dự án**: Khi chạy `npm install`, các packages này sẽ được cài đặt
3. **Version compatibility**: Biết version để đảm bảo tương thích khi nâng cấp
4. **Debugging**: Khi gặp lỗi, biết dependency nào có thể liên quan

**Lưu ý:**
- Ký hiệu `^` nghĩa là cho phép cập nhật minor/patch version (ví dụ: `^19.1.1` có thể cài `19.2.0` nhưng không cài `20.0.0`)
- Đây chỉ là **dependencies chính**, còn nhiều **devDependencies** khác (Vite, ESLint, Tailwind, ...) được dùng trong quá trình development

---

## 3. CẤU TRÚC THƯ MỤC

```
src/
├── App.jsx                 # Root component, layout chính
├── main.jsx                # Entry point, định nghĩa routes
│
├── components/             # UI Components tái sử dụng
│   ├── admin/              # Admin panel components (24 files)
│   │   ├── AdminLayout.jsx
│   │   ├── content/        # Content management components
│   │   └── lessons/        # Lesson editor components
│   ├── api_translate/      # Dictionary & Google Translate
│   │   ├── DictionaryButton.jsx
│   │   ├── DictionaryContext.jsx
│   │   ├── DictionaryPopup.jsx
│   │   └── SavedWordsDrawer.jsx
│   ├── analytics/          # Charts, insights
│   ├── dashboard/          # KPI Cards, Activity Feed
│   ├── skeletons/          # Loading skeletons
│   ├── Header.jsx          # Navigation header
│   ├── Footer.jsx          # Footer
│   ├── Sidebar.jsx         # Sidebar navigation
│   ├── ProtectedRoute.jsx  # Route guard (auth required)
│   ├── AccessGuard.jsx     # Level/module access control
│   ├── GlobalSearch.jsx    # Ctrl+K search
│   ├── ToastNotification.jsx
│   └── ...
│
├── contexts/               # React Context Providers
│   ├── AuthContext.jsx     # Authentication state
│   └── LanguageContext.jsx # i18n translations
│
├── features/               # Feature modules
│   ├── books/              # Level System (N1-N5)
│   │   ├── components/
│   │   │   └── BookCard.jsx
│   │   └── pages/
│   │       ├── LevelPage.jsx
│   │       ├── LevelN1Page.jsx ~ LevelN5Page.jsx
│   │       ├── BookDetailPage.jsx
│   │       ├── LessonPage.jsx
│   │       └── QuizPage.jsx
│   └── jlpt/               # JLPT Exam Practice
│       └── pages/
│           ├── JLPTPage.jsx
│           ├── JLPTLevelN1Page.jsx ~ JLPTLevelN5Page.jsx
│           ├── JLPTExamDetailPage.jsx
│           ├── ExamKnowledgePage.jsx
│           ├── ExamListeningPage.jsx
│           ├── JLPTExamResultPage.jsx
│           └── ExamAnswersPage.jsx
│
├── pages/                  # Route-level pages
│   ├── admin/              # Admin panel pages
│   │   ├── AdminDashboardPage.jsx
│   │   ├── ContentManagementPage.jsx
│   │   ├── ExamManagementPage.jsx
│   │   ├── UsersManagementPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── ...
│   ├── editor/             # Editor panel pages
│   ├── HomePage.jsx
│   ├── UserDashboard.jsx
│   ├── ProfilePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── MaintenancePage.jsx
│
├── services/               # Logic nghiệp vụ & gọi API
│   ├── supabaseClient.js   # Supabase client config
│   ├── authService.js      # Authentication operations
│   ├── contentService.js   # CRUD books, chapters, lessons, quizzes
│   ├── examService.js      # JLPT exam operations
│   ├── accessControlService.js  # Access control management
│   ├── srsAlgorithm.js     # Spaced repetition logic
│   ├── appSettingsService.js
│   ├── userManagementService.js
│   └── api_translate/
│       └── dictionaryService.js
│
├── hooks/                  # Custom React hooks
│   ├── useAccessControl.jsx
│   ├── useAuthActions.jsx
│   └── useExamGuard.jsx
│
├── utils/                  # Utility functions (26 files)
│   ├── localStorageManager.js  # Unified storage interface
│   ├── settingsManager.js
│   ├── safeSaveHelper.js
│   ├── secureUserStorage.js
│   └── debugLogger.js
│
├── translations/           # i18n files
│   ├── vi.js               # Vietnamese
│   ├── en.js               # English
│   ├── ja.js               # Japanese
│   └── index.js
│
├── data/                   # Static data
│   ├── level/              # N1-N5 metadata
│   ├── jlpt/               # JLPT data
│   └── jlptDictionary.js
│
└── styles/                 # CSS files
    ├── App.css
    └── index.css
```

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │  Contexts   │  │      Components         │  │
│  │   Router    │  │  (Auth,     │  │  (Pages, Features,      │  │
│  │   v7        │  │  Language)  │  │   Admin, JLPT)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                         SERVICES LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth      │  │   Content   │  │      Exam               │  │
│  │   Service   │  │   Service   │  │      Service            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                         STORAGE LAYER                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  LocalStorageManager (Unified Interface)                    ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐   ││
│  │  │ Supabase  │  │ IndexedDB │  │    localStorage       │   ││
│  │  │ (Cloud)   │  │ (Cache)   │  │    (Fallback)         │   ││
│  │  │ Primary   │  │ >100MB    │  │    5-10MB limit       │   ││
│  │  └───────────┘  └───────────┘  └───────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth      │  │  PostgreSQL │  │      Storage            │  │
│  │   (Users)   │  │  (RLS)      │  │      (Files)            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Real-time Subscriptions                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Context Providers Hierarchy

```jsx
<ErrorBoundary>
  <AuthProvider>           // User authentication state
    <LanguageProvider>     // i18n translations
      <ToastProvider>      // Toast notifications
        <DictionaryProvider>  // JLPT dictionary
          <RouterProvider router={router} />
        </DictionaryProvider>
      </ToastProvider>
    </LanguageProvider>
  </AuthProvider>
</ErrorBoundary>
```

---

## 5. LUỒNG KHỞI ĐỘNG ỨNG DỤNG

### Step 1: Entry Point (`main.jsx`)

📍 **Xem code tại:** `src/main.jsx` (toàn bộ file, 427 dòng)

```
index.html → main.jsx → App.jsx → Các Pages
```

**`main.jsx` là file entry point của ứng dụng**, đây là nơi khởi tạo toàn bộ ứng dụng React.

#### Cấu trúc `main.jsx`:

📍 **Xem code tại:** `src/main.jsx` (dòng 1-16) - Import statements

**1. Import Dependencies & Providers**

```javascript
// React core
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

// Ant Design patch cho React 19 compatibility
import '@ant-design/v5-patch-for-react-19';

// React Router
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';

// ✅ CRITICAL: Import all providers to wrap RouterProvider
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ToastProvider } from './components/ToastNotification.jsx';
import { DictionaryProvider } from './components/api_translate/index.js';

// Core components
import App from './App.jsx';
import './styles/index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
```

**2. Code Splitting với Lazy Loading**

📍 **Xem code tại:** `src/main.jsx` (dòng 17-75) - Lazy load declarations

Dự án sử dụng **lazy loading** để tối ưu performance:

```javascript
// Critical pages (load immediately) - Các trang quan trọng load ngay
import HomePage from './pages/HomePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AccessGuard from './components/AccessGuard.jsx';

// Lazy load non-critical pages - Các trang khác load khi cần
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));

// Lazy load Level pages (N1-N5)
const LevelN1Page = lazy(() => import('./features/books/pages/LevelN1Page.jsx'));
const LevelN2Page = lazy(() => import('./features/books/pages/LevelN2Page.jsx'));
// ... tương tự cho N3, N4, N5

// Lazy load JLPT pages
const JLPTPage = lazy(() => import('./features/jlpt/pages/JLPTPage.jsx'));
const JLPTLevelN1Page = lazy(() => import('./features/jlpt/pages/JLPTLevelN1Page.jsx'));
// ... tương tự

// Lazy load Admin pages (heavy) - Admin panel rất nặng nên lazy load
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
// ... các admin pages khác
```

**Lợi ích của Lazy Loading:**
- Giảm bundle size ban đầu
- Tăng tốc độ load trang đầu tiên
- Chỉ load code khi user thực sự cần

**3. Loading Spinner Component**

📍 **Xem code tại:** `src/main.jsx` (dòng 77-85) - PageLoader component

```javascript
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Đang tải...</p>
    </div>
  </div>
);
```

**4. LazyPage Wrapper với Suspense**

📍 **Xem code tại:** `src/main.jsx` (dòng 87-92) - LazyPage wrapper

```javascript
const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);
```

**Suspense** hiển thị `<PageLoader />` trong khi component đang được load.

**5. Mobile Viewport Fix**

📍 **Xem code tại:** `src/main.jsx` (dòng 94-101) - Viewport fix function

```javascript
// Set --app-vh to fix 100vh issues on mobile browsers
function setAppVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}
setAppVh();
window.addEventListener('resize', setAppVh);
window.addEventListener('orientationchange', setAppVh);
```

#### Vấn đề 100vh trên Mobile Browsers

**Vấn đề:**
- Trên mobile browsers (Chrome, Safari iOS), `100vh` không tính đúng chiều cao viewport
- Khi address bar ẩn/hiện, viewport height thay đổi nhưng `100vh` không cập nhật
- Dẫn đến content bị cắt hoặc có khoảng trống không mong muốn

**Ví dụ vấn đề:**
```
┌─────────────────────┐
│  Address Bar (hiện) │ ← 100vh = chiều cao này
├─────────────────────┤
│                     │
│   Content Area      │ ← Nhưng content bị cắt
│                     │
└─────────────────────┘

Khi scroll, address bar ẩn:
┌─────────────────────┐
│                     │
│   Content Area      │ ← 100vh vẫn giữ giá trị cũ
│                     │ ← Không cập nhật!
│                     │
└─────────────────────┘
```

#### Cách Fix Hoạt Động

**1. Tính toán viewport height động:**

```javascript
function setAppVh() {
  // window.innerHeight = chiều cao thực tế của viewport (tính cả address bar)
  // Ví dụ: iPhone 12 = 844px (khi address bar hiện) hoặc 896px (khi ẩn)
  
  const vh = window.innerHeight * 0.01;
  // vh = 844 * 0.01 = 8.44px (1% của viewport height)
  
  // Set CSS custom property (CSS variable)
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
  // --app-vh = 8.44px
}
```

**2. Sử dụng trong CSS:**

```css
/* Thay vì dùng 100vh (cố định) */
.container {
  height: 100vh; /* ❌ Không hoạt động tốt trên mobile */
}

/* Dùng CSS variable (động) */
.container {
  height: calc(var(--app-vh) * 100); /* ✅ Luôn đúng */
  /* = 8.44px * 100 = 844px (cập nhật theo viewport thực tế) */
}
```

**3. Cập nhật khi viewport thay đổi:**

```javascript
// Gọi ngay khi app load
setAppVh(); // Set giá trị ban đầu

// Cập nhật khi window resize (user thay đổi kích thước)
window.addEventListener('resize', setAppVh);

// Cập nhật khi xoay màn hình (portrait ↔ landscape)
window.addEventListener('orientationchange', setAppVh);
```

#### Ví dụ Cụ Thể

**Scenario 1: User scroll trên mobile**

```
Bước 1: Page load, address bar hiện
  window.innerHeight = 844px
  --app-vh = 8.44px
  height = calc(8.44px * 100) = 844px ✅

Bước 2: User scroll, address bar ẩn
  window.innerHeight = 896px (tăng lên)
  resize event trigger → setAppVh() chạy
  --app-vh = 8.96px (cập nhật)
  height = calc(8.96px * 100) = 896px ✅
```

**Scenario 2: User xoay màn hình**

```
Portrait mode:
  window.innerHeight = 844px
  --app-vh = 8.44px

User xoay sang Landscape:
  orientationchange event trigger → setAppVh() chạy
  window.innerHeight = 390px (thay đổi)
  --app-vh = 3.9px (cập nhật)
  height = calc(3.9px * 100) = 390px ✅
```

#### Lợi Ích

1. **Responsive chính xác**: Viewport height luôn đúng trên mọi thiết bị
2. **Không bị cắt content**: Content không bị ẩn phía dưới
3. **Smooth experience**: Không có khoảng trống thừa
4. **Cross-browser**: Hoạt động trên Chrome, Safari iOS, Firefox mobile

#### Cách Sử Dụng trong Dự Án

Trong CSS files, thay vì:
```css
.min-h-screen {
  min-height: 100vh; /* ❌ */
}
```

Dùng:
```css
.min-h-screen {
  min-height: calc(var(--app-vh) * 100); /* ✅ */
}
```

Hoặc trong Tailwind config (nếu có):
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      height: {
        'screen': 'calc(var(--app-vh) * 100)',
      }
    }
  }
}
```

#### Tóm Tắt

- **Vấn đề**: `100vh` không cập nhật khi address bar ẩn/hiện trên mobile
- **Giải pháp**: Dùng `window.innerHeight` để tính CSS variable `--app-vh` động
- **Cập nhật**: Listen `resize` và `orientationchange` events
- **Kết quả**: Viewport height luôn chính xác, content không bị cắt

**6. Dynamic Route Components**

📍 **Xem code tại:** `src/main.jsx` (dòng 123-175) - Dynamic route components

Dự án sử dụng **Dynamic Route Components** để xử lý các routes có tham số động (như `/level/:levelId`). Thay vì định nghĩa 5 routes riêng biệt cho N1-N5, chỉ cần 1 route động với wrapper component.

#### 6.1 DynamicLevelPage Component

📍 **Xem code tại:** `src/main.jsx` (dòng 123-148)

```javascript
// Wrapper component cho route động LEVEL
function DynamicLevelPage() {
  // 1. Lấy levelId từ URL params
  const { levelId } = useParams();
  
  // 2. Validate: Nếu không có levelId → 404
  if (!levelId) {
    return <NotFoundPage />;
  }
  
  // 3. Normalize: Chuyển về lowercase để xử lý case-insensitive
  // Ví dụ: "N1", "n1", "N1" đều thành "n1"
  const normalizedLevelId = levelId.toLowerCase();
  
  // 4. Chọn component tương ứng dựa trên levelId
  let PageComponent;
  switch (normalizedLevelId) {
    case 'n1': PageComponent = LevelN1Page; break;
    case 'n2': PageComponent = LevelN2Page; break;
    case 'n3': PageComponent = LevelN3Page; break;
    case 'n4': PageComponent = LevelN4Page; break;
    case 'n5': PageComponent = LevelN5Page; break;
    default: 
      // Nếu levelId không hợp lệ (ví dụ: "n6", "abc")
      return <LevelPlaceholder levelId={levelId} type="LEVEL" />;
  }
  
  // 5. Render với AccessGuard và LazyPage
  return (
    <AccessGuard module="level" levelId={normalizedLevelId}>
      <LazyPage>
        <PageComponent />
      </LazyPage>
    </AccessGuard>
  );
}
```

#### 6.2 DynamicJLPTLevelPage Component

Tương tự cho JLPT routes:

```javascript
// Wrapper component cho route động JLPT
function DynamicJLPTLevelPage() {
  const { levelId } = useParams();
  if (!levelId) {
    return <NotFoundPage />;
  }
  const normalizedLevelId = levelId.toLowerCase();
  
  let PageComponent;
  switch (normalizedLevelId) {
    case 'n1': PageComponent = JLPTLevelN1Page; break;
    case 'n2': PageComponent = JLPTLevelN2Page; break;
    case 'n3': PageComponent = JLPTLevelN3Page; break;
    case 'n4': PageComponent = JLPTLevelN4Page; break;
    case 'n5': PageComponent = JLPTLevelN5Page; break;
    default: return <LevelPlaceholder levelId={levelId} type="JLPT" />;
  }
  
  return (
    <AccessGuard module="jlpt" levelId={normalizedLevelId}>
      <LazyPage>
        <PageComponent />
      </LazyPage>
    </AccessGuard>
  );
}
```

#### 6.3 Luồng Hoạt Động Chi Tiết

**Ví dụ: User truy cập `/level/n5`**

```
Step 1: React Router match route
  URL: /level/n5
  Route pattern: /level/:levelId
  Match! → levelId = "n5"
  ↓
Step 2: Render DynamicLevelPage
  useParams() → { levelId: "n5" }
  ↓
Step 3: Normalize levelId
  "n5" → "n5" (đã là lowercase)
  ↓
Step 4: Switch statement
  case 'n5': PageComponent = LevelN5Page
  ↓
Step 5: AccessGuard kiểm tra quyền
  module="level", levelId="n5"
  - Kiểm tra localStorage: levelAccessControl['n5']
  - Kiểm tra: public? requireLogin? userHasAccess?
  - Nếu không có quyền → Redirect hoặc show locked message
  - Nếu có quyền → Continue
  ↓
Step 6: LazyPage wrapper
  <Suspense fallback={<PageLoader />}>
    <LevelN5Page />
  </Suspense>
  ↓
Step 7: Load LevelN5Page component
  - Nếu chưa load → Hiển thị PageLoader
  - Nếu đã load → Render LevelN5Page
  ↓
Step 8: LevelN5Page render UI
  - Load books từ storage/service
  - Render BookCard components
```

#### 6.4 Tại Sao Cần Dynamic Components?

**❌ Cách không dùng Dynamic Component (không tối ưu):**

```javascript
// Phải định nghĩa 5 routes riêng biệt
const router = createBrowserRouter([
  { path: 'level/n1', element: <LevelN1Page /> },
  { path: 'level/n2', element: <LevelN2Page /> },
  { path: 'level/n3', element: <LevelN3Page /> },
  { path: 'level/n4', element: <LevelN4Page /> },
  { path: 'level/n5', element: <LevelN5Page /> },
]);
```

**Vấn đề:**
- Code lặp lại (duplicate code)
- Khó maintain (phải sửa 5 chỗ khi thay đổi logic)
- Không có validation tập trung
- Không có access control tập trung

**✅ Cách dùng Dynamic Component (tối ưu):**

```javascript
// Chỉ cần 1 route động
const router = createBrowserRouter([
  { path: 'level/:levelId', element: <DynamicLevelPage /> },
]);
```

**Lợi ích:**
- **DRY (Don't Repeat Yourself)**: Logic tập trung ở 1 nơi
- **Dễ maintain**: Sửa 1 chỗ, áp dụng cho tất cả levels
- **Validation tập trung**: Kiểm tra levelId hợp lệ ở 1 nơi
- **Access control tập trung**: AccessGuard áp dụng cho tất cả
- **Extensible**: Dễ thêm level mới (chỉ cần thêm case trong switch)

#### 6.5 Các Trường Hợp Xử Lý

**1. LevelId hợp lệ (n1-n5):**
```javascript
URL: /level/n5
→ normalizedLevelId = "n5"
→ PageComponent = LevelN5Page
→ Render LevelN5Page
```

**2. LevelId không hợp lệ:**
```javascript
URL: /level/n6
→ normalizedLevelId = "n6"
→ Không match case nào
→ return <LevelPlaceholder levelId="n6" type="LEVEL" />
→ Hiển thị: "LEVEL N6 - Sắp ra mắt"
```

**3. LevelId case khác nhau:**
```javascript
URL: /level/N5 (uppercase)
→ normalizedLevelId = "n5" (chuyển về lowercase)
→ PageComponent = LevelN5Page
→ Vẫn hoạt động đúng ✅
```

**4. LevelId missing:**
```javascript
URL: /level/ (thiếu levelId)
→ levelId = undefined
→ if (!levelId) return <NotFoundPage />
→ Hiển thị 404
```

#### 6.6 AccessGuard Integration

```javascript
<AccessGuard module="level" levelId={normalizedLevelId}>
  <LazyPage>
    <PageComponent />
  </LazyPage>
</AccessGuard>
```

**AccessGuard làm gì:**
1. Đọc access control config từ localStorage
2. Kiểm tra level có public không
3. Kiểm tra có cần login không
4. Kiểm tra user có quyền truy cập không
5. Nếu không có quyền → Redirect hoặc show locked message
6. Nếu có quyền → Render children (PageComponent)

**Ví dụ Access Control:**
```javascript
// localStorage['levelAccessControl']
{
  "n5": { public: true, requireLogin: false },   // Ai cũng vào được
  "n4": { public: false, requireLogin: true },   // Cần login
  "n3": { public: false, requireLogin: true, premium: true } // Cần premium
}
```

#### 6.7 LazyPage Integration

```javascript
<LazyPage>
  <PageComponent />
</LazyPage>
```

**LazyPage làm gì:**
1. Wrap component trong `<Suspense>`
2. Nếu component chưa load → Hiển thị `<PageLoader />`
3. Nếu component đã load → Render component

**Lợi ích:**
- User thấy loading state thay vì màn hình trắng
- Better UX với smooth transition

#### 6.8 Tóm Tắt

| Khía cạnh | Mô tả |
|-----------|-------|
| **Mục đích** | Xử lý routes động với tham số `:levelId` |
| **Input** | URL params (`levelId` từ `useParams()`) |
| **Xử lý** | Normalize → Switch case → Chọn component |
| **Validation** | Kiểm tra levelId hợp lệ (n1-n5) |
| **Access Control** | AccessGuard kiểm tra quyền truy cập |
| **Lazy Loading** | LazyPage wrapper cho code splitting |
| **Error Handling** | NotFoundPage cho invalid levelId, LevelPlaceholder cho level chưa có |
| **Lợi ích** | DRY, maintainable, extensible, centralized logic |

**7. Router Configuration**

📍 **Xem code tại:** `src/main.jsx` (dòng 177-408) - Router config

Router configuration là nơi định nghĩa tất cả routes của ứng dụng. Dự án sử dụng **React Router v7** với `createBrowserRouter` API.

#### 7.1 Cấu Trúc Router Cơ Bản

```javascript
const router = createBrowserRouter([
  {
    path: '/',                    // Root path
    element: <App />,             // Root layout component
    errorElement: <NotFoundPage />, // Global error handler (404)
    children: [                    // Nested routes
      // Tất cả routes con ở đây
    ]
  }
]);
```

**Giải thích:**
- **`path: '/'`**: Root path, match với domain root
- **`element: <App />`**: Component được render cho root path (layout chính)
- **`errorElement`**: Component render khi có lỗi (404, error boundary)
- **`children`**: Các routes con, render trong `<Outlet />` của App component

#### 7.2 Index Route (Home Page)

```javascript
{
  index: true,
  element: <HomePage />
}
```

**Đặc điểm:**
- `index: true` = route mặc định khi path là `/`
- **Không lazy load** vì là trang đầu tiên user thấy (cần load nhanh)
- URL: `/`

#### 7.3 LEVEL ROUTES (Hệ Thống Học Theo Cấp Độ)

```javascript
// ========== LEVEL ROUTES ==========

// 1. Level selection page
{
  path: 'level',
  element: <LazyPage><LevelPage /></LazyPage>
}
// URL: /level
// Hiển thị: Chọn N1, N2, N3, N4, hoặc N5

// 2. Dynamic level page (N1-N5)
{
  path: 'level/:levelId',
  element: <DynamicLevelPage />
}
// URL: /level/n5
// Hiển thị: Danh sách books của level N5

// 3. Book detail page
{
  path: 'level/:levelId/:bookId',
  element: <LazyPage><BookDetailPage /></LazyPage>
}
// URL: /level/n5/minna-no-nihongo-1
// Hiển thị: Chi tiết book, danh sách chapters

// 4. Chapter page (backward compatibility)
{
  path: 'level/:levelId/:bookId/chapter/:chapterId',
  element: <LazyPage><BookDetailPage /></LazyPage>
}
// URL: /level/n5/minna-no-nihongo-1/chapter/1
// Hiển thị: Book detail với chapter được highlight

// 5. Lesson page
{
  path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId',
  element: <LazyPage><LessonPage /></LazyPage>
}
// URL: /level/n5/minna-no-nihongo-1/chapter/1/lesson/1
// Hiển thị: Nội dung lesson (theory, flashcards, etc.)

// 6. Quiz page (standalone)
{
  path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId/quiz',
  element: <LazyPage><QuizPage /></LazyPage>
}
// URL: /level/n5/minna-no-nihongo-1/chapter/1/lesson/1/quiz
// Hiển thị: Quiz của lesson

// 7. Backward compatibility: Old route without chapterId
{
  path: 'level/:levelId/:bookId/lesson/:lessonId',
  element: <LazyPage><LessonPage /></LazyPage>
}
// URL: /level/n5/minna-no-nihongo-1/lesson/1
// Mục đích: Hỗ trợ URLs cũ (trước khi có chapterId)

// 8. Backward compatibility: Old quiz route
{
  path: 'level/:levelId/:bookId/lesson/:lessonId/quiz',
  element: <LazyPage><QuizPage /></LazyPage>
}
// URL: /level/n5/minna-no-nihongo-1/lesson/1/quiz
// Mục đích: Hỗ trợ URLs cũ
```

**Route Hierarchy:**
```
/level
  └── /level/:levelId (N1-N5)
      └── /level/:levelId/:bookId
          └── /level/:levelId/:bookId/chapter/:chapterId
              └── /level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId
                  └── /level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId/quiz
```

**Dynamic Params:**
- `:levelId` - Level (n1, n2, n3, n4, n5)
- `:bookId` - Book ID (ví dụ: "minna-no-nihongo-1")
- `:chapterId` - Chapter ID (ví dụ: "1", "2")
- `:lessonId` - Lesson ID (ví dụ: "1", "2")

#### 7.4 JLPT ROUTES (Luyện Thi JLPT)

```javascript
// ========== JLPT ROUTES ==========

// ✅ QUAN TRỌNG: Route cụ thể hơn phải được đặt TRƯỚC route tổng quát hơn
// React Router match routes theo thứ tự từ trên xuống

// 1. JLPT selection page
{
  path: 'jlpt',
  element: <LazyPage><JLPTPage /></LazyPage>
}
// URL: /jlpt
// Hiển thị: Chọn N1, N2, N3, N4, hoặc N5

// 2. Knowledge section (cụ thể nhất - phải đặt đầu tiên)
{
  path: 'jlpt/:levelId/:examId/knowledge',
  element: <LazyPage><ExamKnowledgePage /></LazyPage>
}
// URL: /jlpt/n5/2023-07/knowledge
// Hiển thị: Phần thi kiến thức (vocabulary, grammar, reading)

// 3. Listening section (cụ thể nhất)
{
  path: 'jlpt/:levelId/:examId/listening',
  element: <LazyPage><ExamListeningPage /></LazyPage>
}
// URL: /jlpt/n5/2023-07/listening
// Hiển thị: Phần thi nghe

// 4. Result page (cụ thể nhất)
{
  path: 'jlpt/:levelId/:examId/result',
  element: <LazyPage><JLPTExamResultPage /></LazyPage>
}
// URL: /jlpt/n5/2023-07/result
// Hiển thị: Kết quả bài thi

// 5. Answers page (cụ thể nhất)
{
  path: 'jlpt/:levelId/:examId/answers',
  element: <LazyPage><ExamAnswersPage /></LazyPage>
}
// URL: /jlpt/n5/2023-07/answers
// Hiển thị: Đáp án và giải thích

// 6. Exam detail page (cụ thể hơn levelId)
{
  path: 'jlpt/:levelId/:examId',
  element: <LazyPage><JLPTExamDetailPage /></LazyPage>
}
// URL: /jlpt/n5/2023-07
// Hiển thị: Chi tiết exam, nút bắt đầu thi

// 7. Dynamic JLPT level page (tổng quát nhất - đặt cuối)
{
  path: 'jlpt/:levelId',
  element: <DynamicJLPTLevelPage />
}
// URL: /jlpt/n5
// Hiển thị: Danh sách exams của level N5
```

**Tại sao thứ tự quan trọng?**

Nếu đặt route tổng quát trước:
```javascript
// ❌ SAI - Route tổng quát đặt trước
{ path: 'jlpt/:levelId', element: <DynamicJLPTLevelPage /> },
{ path: 'jlpt/:levelId/:examId/knowledge', element: <ExamKnowledgePage /> },
```

Khi user truy cập `/jlpt/n5/2023-07/knowledge`:
- Router match route đầu tiên: `jlpt/:levelId`
- `levelId = "n5"` → Render `DynamicJLPTLevelPage` ❌ (SAI!)
- Route `knowledge` không bao giờ được match

**✅ ĐÚNG - Route cụ thể đặt trước:**
```javascript
{ path: 'jlpt/:levelId/:examId/knowledge', element: <ExamKnowledgePage /> }, // ✅ Match trước
{ path: 'jlpt/:levelId', element: <DynamicJLPTLevelPage /> }, // Match sau
```

**Route Hierarchy:**
```
/jlpt
  └── /jlpt/:levelId (N1-N5)
      └── /jlpt/:levelId/:examId
          ├── /jlpt/:levelId/:examId/knowledge
          ├── /jlpt/:levelId/:examId/listening
          ├── /jlpt/:levelId/:examId/result
          └── /jlpt/:levelId/:examId/answers
```

#### 7.5 DASHBOARD ROUTES (SRS & Statistics)

```javascript
// ========== PHASE 3: SRS ROUTES ==========

// 1. User Dashboard (Protected)
{
  path: 'dashboard',
  element: (
    <LazyPage>
      <DashboardAccessGuard>
        <UserDashboard />
      </DashboardAccessGuard>
    </LazyPage>
  )
}
// URL: /dashboard
// Hiển thị: Dashboard cá nhân (progress, SRS cards, statistics)
// Protected: DashboardAccessGuard kiểm tra user đã login

// 2. Flashcard Review
{
  path: 'review/:deckId',
  element: <LazyPage><FlashcardReviewPage /></LazyPage>
}
// URL: /review/vocabulary-n5
// Hiển thị: Review flashcards theo SRS algorithm

// 3. Statistics Dashboard
{
  path: 'statistics/:deckId',
  element: <LazyPage><StatisticsDashboard /></LazyPage>
}
// URL: /statistics/vocabulary-n5
// Hiển thị: Thống kê học tập (charts, insights)
```

**Route Guards:**
- `DashboardAccessGuard`: Kiểm tra user đã login, nếu chưa → redirect to login

#### 7.6 ADMIN ROUTES (Nested Routes)

```javascript
// ✅ NEW: Admin Routes (Protected - Admin only)
{
  path: 'admin',
  element: (
    <ProtectedRoute adminOnly={true}>
      <LazyPage><AdminLayout /></LazyPage>
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <LazyPage><AdminDashboardPage /></LazyPage>
    },
    {
      path: 'quiz-editor',
      element: <LazyPage><QuizEditorPage /></LazyPage>
    },
    {
      path: 'users',
      element: <LazyPage><UsersManagementPage /></LazyPage>
    },
    {
      path: 'content',
      element: <LazyPage><ContentManagementPage /></LazyPage>
    },
    {
      path: 'exams',
      element: <LazyPage><ExamManagementPage /></LazyPage>
    },
    {
      path: 'export-import',
      element: <LazyPage><ExportImportPage /></LazyPage>
    },
    {
      path: 'settings',
      element: <LazyPage><SettingsPage /></LazyPage>
    },
    {
      path: 'new-control',
      element: <LazyPage><NewControlPage /></LazyPage>
    },
    {
      path: 'notifications',
      element: <LazyPage><NotificationManagementPage /></LazyPage>
    }
  ]
}
```

**Nested Routes Pattern:**
- **Parent route**: `/admin` → Render `AdminLayout`
- **Children routes**: Render trong `<Outlet />` của `AdminLayout`
- **URL structure**: `/admin`, `/admin/users`, `/admin/content`, etc.

**Route Guards:**
- `ProtectedRoute adminOnly={true}`: Chỉ admin mới vào được
- Nếu không phải admin → Redirect to home

**Admin Routes:**
| Route | URL | Component | Mô tả |
|-------|-----|-----------|-------|
| Index | `/admin` | `AdminDashboardPage` | Dashboard tổng quan |
| Quiz Editor | `/admin/quiz-editor` | `QuizEditorPage` | Tạo/sửa quiz |
| Users | `/admin/users` | `UsersManagementPage` | Quản lý users |
| Content | `/admin/content` | `ContentManagementPage` | Quản lý books, lessons |
| Exams | `/admin/exams` | `ExamManagementPage` | Quản lý JLPT exams |
| Export/Import | `/admin/export-import` | `ExportImportPage` | Export/Import data |
| Settings | `/admin/settings` | `SettingsPage` | Cài đặt hệ thống |
| Access Control | `/admin/new-control` | `NewControlPage` | Quản lý quyền truy cập |
| Notifications | `/admin/notifications` | `NotificationManagementPage` | Quản lý thông báo |

#### 7.7 EDITOR ROUTES (Nested Routes)

```javascript
// ✅ NEW: Editor Routes (Protected - Editor only)
{
  path: 'editor',
  element: (
    <ProtectedRoute editorOnly={true}>
      <LazyPage><EditorLayout /></LazyPage>
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <LazyPage><EditorDashboardPage /></LazyPage>
    },
    {
      path: 'quiz-editor',
      element: <LazyPage><QuizEditorPage /></LazyPage>
    },
    {
      path: 'exams',
      element: <LazyPage><ExamManagementPage /></LazyPage>
    }
  ]
}
```

**Khác biệt với Admin:**
- Editor chỉ có quyền edit content, không có quyền quản lý users/settings
- `ProtectedRoute editorOnly={true}`: Chỉ editor và admin vào được

#### 7.8 OTHER ROUTES

```javascript
// ========== OTHER ROUTES ==========

{ path: 'about', element: <LazyPage><AboutPage /></LazyPage> },
{ path: 'terms', element: <LazyPage><TermsPage /></LazyPage> },
{ path: 'privacy', element: <LazyPage><PrivacyPage /></LazyPage> },
{ path: 'login', element: <LazyPage><LoginPage /></LazyPage> },
{ path: 'register', element: <LazyPage><RegisterPage /></LazyPage> },

// Profile Page (Protected - Requires login)
{
  path: 'profile',
  element: (
    <ProtectedRoute>
      <LazyPage><ProfilePage /></LazyPage>
    </ProtectedRoute>
  )
}
```

**Route Guards:**
- `ProtectedRoute` (không có prop): Chỉ cần login, không cần role cụ thể

#### 7.9 DEV/EXAMPLE ROUTES (Development Only)

```javascript
// ========== DEV/EXAMPLE ROUTES ==========
...(import.meta.env.DEV
  ? [
      {
        path: 'examples/translation',
        element: <LazyPage>{React.createElement(lazy(() => import('./components/examples/TranslationExample.jsx')))}</LazyPage>
      },
      {
        path: 'test-i18n',
        element: <LazyPage>{React.createElement(lazy(() => import('./components/examples/LanguageTestComponent.jsx')))}</LazyPage>
      },
      // ...
    ]
  : []),
```

**Đặc điểm:**
- Chỉ xuất hiện khi `import.meta.env.DEV === true` (development mode)
- Không có trong production build
- Dùng để test/debug các tính năng

#### 7.10 404 Catch-All Route

```javascript
// ========== 404 ==========
{
  path: '*',
  element: <NotFoundPage />
}
```

**Đặc điểm:**
- `path: '*'` match mọi URL không match routes trên
- Phải đặt **cuối cùng** trong children array
- Render `NotFoundPage` component

#### 7.11 Route Matching Priority

React Router match routes theo thứ tự từ trên xuống:

```
1. Exact match (không có params)
   /level → Match đầu tiên

2. Dynamic routes (có params)
   /level/:levelId → Match nếu không có route cụ thể hơn

3. Nested routes
   /admin → Match parent
   /admin/users → Match child

4. Catch-all (*)
   * → Match mọi thứ còn lại
```

**Ví dụ:**
```
URL: /level/n5/minna-no-nihongo-1

Routes được check:
1. /level ✅ (không match)
2. /level/:levelId ✅ (match! levelId = "n5") → STOP
   Nhưng URL còn "/minna-no-nihongo-1" → Không match
3. /level/:levelId/:bookId ✅ (match! levelId = "n5", bookId = "minna-no-nihongo-1") → ✅ CORRECT
```

#### 7.12 Tóm Tắt Đặc Điểm Router

| Đặc điểm | Mô tả | Ví dụ |
|----------|-------|-------|
| **Nested Routes** | Routes có children, render trong parent layout | `/admin` → `/admin/users` |
| **Route Guards** | `ProtectedRoute`, `AccessGuard`, `DashboardAccessGuard` | Kiểm tra auth/role trước khi render |
| **Lazy Loading** | Tất cả routes (trừ HomePage) đều lazy load | Giảm bundle size ban đầu |
| **Dynamic Routes** | Routes với params `:levelId`, `:bookId`, `:examId` | `/level/n5`, `/jlpt/n5/2023-07` |
| **Index Routes** | Route mặc định của parent | `/admin` → `AdminDashboardPage` |
| **Error Handling** | `errorElement` cho global errors, `NotFoundPage` cho 404 | |
| **Backward Compatibility** | Routes cũ vẫn hoạt động | `/level/n5/book/lesson/1` |
| **Dev Routes** | Routes chỉ có trong development | `/test-i18n` |
| **Route Priority** | Routes cụ thể phải đặt trước routes tổng quát | `/jlpt/n5/2023-07/knowledge` trước `/jlpt/n5` |

**8. Provider Hierarchy & Render**

📍 **Xem code tại:** `src/main.jsx` (dòng 410-426) - Render với Providers

Đây là phần **cuối cùng và quan trọng nhất** của `main.jsx` - nơi render toàn bộ ứng dụng vào DOM.

```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <DictionaryProvider>
              <RouterProvider router={router} />
            </DictionaryProvider>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
```

#### 8.1 Tại Sao Code Này Ở Cuối File?

**Lý do:**
1. **Tất cả dependencies đã được import** ở đầu file
2. **Router đã được định nghĩa** ở trên
3. **Tất cả components đã được khai báo** (lazy hoặc direct import)
4. **Đây là điểm khởi đầu** của ứng dụng - render vào DOM

**Luồng thực thi:**
```
1. Browser load index.html
   ↓
2. index.html load main.jsx
   ↓
3. main.jsx execute từ trên xuống:
   - Import statements
   - Define components
   - Define router
   ↓
4. Đến dòng cuối: ReactDOM.createRoot().render()
   ↓
5. React bắt đầu render component tree
   ↓
6. App hiển thị trên màn hình
```

#### 8.2 React Context API & Provider Pattern

**Provider là gì?**
- Provider là component đặc biệt trong React Context API
- Cung cấp **global state** cho tất cả components con
- Components con có thể dùng `useContext()` hoặc custom hooks để access state

**Ví dụ đơn giản:**
```javascript
// Tạo Context
const AuthContext = createContext();

// Provider component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}  {/* Tất cả children có thể dùng useAuth() */}
    </AuthContext.Provider>
  );
}

// Sử dụng trong component con
function SomeComponent() {
  const { user } = useAuth(); // ✅ Access được user từ AuthProvider
  return <div>{user?.email}</div>;
}
```

#### 8.3 Giải Thích Từng Layer

**1. React.StrictMode (Ngoài cùng nhất)**

```javascript
<React.StrictMode>
  {/* ... */}
</React.StrictMode>
```

**Mục đích:**
- Development tool của React
- Phát hiện potential problems (deprecated APIs, unsafe lifecycles)
- Chạy effects 2 lần để phát hiện side effects
- **Chỉ hoạt động trong development**, không ảnh hưởng production

**Ví dụ:**
```javascript
// StrictMode sẽ cảnh báo nếu dùng deprecated API
componentWillMount() { // ⚠️ Warning trong console
  // ...
}
```

**2. ErrorBoundary**

```javascript
<ErrorBoundary>
  {/* ... */}
</ErrorBoundary>
```

**Mục đích:**
- Bắt lỗi JavaScript trong component tree
- Hiển thị fallback UI thay vì crash toàn bộ app
- **Phải ở ngoài cùng** để bắt mọi lỗi

**Ví dụ khi có lỗi:**
```javascript
// Component throw error
function BuggyComponent() {
  throw new Error('Something went wrong!');
}

// ErrorBoundary bắt lỗi và hiển thị:
<div>
  <h1>Đã xảy ra lỗi!</h1>
  <p>Vui lòng refresh trang hoặc liên hệ support.</p>
</div>
```

**3. AuthProvider**

```javascript
<AuthProvider>
  {/* ... */}
</AuthProvider>
```

**Mục đích:**
- Quản lý authentication state (user, profile, login, logout)
- Cung cấp `useAuth()` hook cho tất cả components
- **Phải ở ngoài** để các providers khác có thể dùng `useAuth()`

**State cung cấp:**
```javascript
const { 
  user,           // { id, email, emailConfirmed }
  profile,        // { display_name, role, avatar_url }
  isLoading,      // Boolean
  login,          // Function
  logout,         // Function
  isAdmin,        // Function
} = useAuth();
```

**4. LanguageProvider**

```javascript
<LanguageProvider>
  {/* ... */}
</LanguageProvider>
```

**Mục đích:**
- Quản lý i18n (internationalization)
- Cung cấp `useLanguage()` hook
- Có thể dùng `useAuth()` để lấy user language preference

**State cung cấp:**
```javascript
const { 
  t,              // Translation function: t('home.title')
  currentLanguage, // 'vi' | 'en' | 'ja'
  setLanguage,    // Function to change language
} = useLanguage();
```

**5. ToastProvider**

```javascript
<ToastProvider>
  {/* ... */}
</ToastProvider>
```

**Mục đích:**
- Quản lý toast notifications (success, error, warning, info)
- Cung cấp `useToast()` hook
- Có thể dùng `useLanguage()` để translate messages

**API cung cấp:**
```javascript
const { success, error, warning, info } = useToast();

// Sử dụng
success('Đăng nhập thành công!');
error('Mật khẩu không đúng');
```

**6. DictionaryProvider**

```javascript
<DictionaryProvider>
  {/* ... */}
</DictionaryProvider>
```

**Mục đích:**
- Quản lý JLPT Dictionary (8,292+ words)
- Cung cấp dictionary lookup functionality
- Có thể dùng `useLanguage()` để translate dictionary entries

**7. RouterProvider (Trong cùng)**

```javascript
<RouterProvider router={router} />
```

**Mục đích:**
- Quản lý routing (điều hướng giữa các trang)
- **Phải ở trong cùng** vì:
  - Router cần access tất cả contexts (auth, language, toast, dictionary)
  - Routes có thể dùng `useAuth()`, `useLanguage()`, `useToast()`, etc.

**Ví dụ trong route component:**
```javascript
function ProfilePage() {
  const { user, profile } = useAuth();        // ✅ Access được
  const { t } = useLanguage();                // ✅ Access được
  const { success } = useToast();             // ✅ Access được
  // ...
}
```

#### 8.4 Tại Sao Thứ Tự Quan Trọng?

**❌ SAI - RouterProvider ở ngoài:**

```javascript
<RouterProvider router={router}>
  <AuthProvider>
    {/* ... */}
  </AuthProvider>
</RouterProvider>
```

**Vấn đề:**
- RouterProvider không có access vào AuthContext
- Routes không thể dùng `useAuth()`
- ProtectedRoute không thể check authentication

**✅ ĐÚNG - RouterProvider ở trong:**

```javascript
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
```

**Lợi ích:**
- RouterProvider có access vào AuthContext
- Routes có thể dùng `useAuth()`
- ProtectedRoute hoạt động đúng

**Ví dụ thực tế:**

```javascript
// ProtectedRoute.jsx
function ProtectedRoute({ children, adminOnly }) {
  const { user, profile, isLoading } = useAuth(); // ✅ Có thể dùng vì AuthProvider ở ngoài
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}
```

#### 8.5 Luồng Hoạt Động Khi Render

```
Step 1: ReactDOM.createRoot() tạo root
  ↓
Step 2: Render React.StrictMode
  ↓
Step 3: Render ErrorBoundary
  - Khởi tạo error state
  ↓
Step 4: Render AuthProvider
  - Khởi tạo auth state (user = null, isLoading = true)
  - useEffect: Check session từ Supabase
  - Load user profile
  ↓
Step 5: Render LanguageProvider
  - Khởi tạo language state (currentLanguage = 'vi')
  - Load language từ localStorage
  ↓
Step 6: Render ToastProvider
  - Khởi tạo toast state (notifications = [])
  ↓
Step 7: Render DictionaryProvider
  - Khởi tạo dictionary state
  - Load JLPT dictionary (8,292 words)
  ↓
Step 8: Render RouterProvider
  - Router match URL hiện tại
  - Render App component (root layout)
  ↓
Step 9: App component render
  - Render Header, Footer
  - Render <Outlet /> (matched route)
  ↓
Step 10: Route component render
  - Ví dụ: HomePage
  - Có thể dùng useAuth(), useLanguage(), useToast()
  ↓
Step 11: UI hiển thị trên màn hình
```

#### 8.6 Context Access Rules

**Quy tắc:**
- Component chỉ có thể access contexts của **các Providers bọc ngoài nó**
- Component **không thể** access contexts của Providers bên trong nó

**Ví dụ:**

```javascript
<AuthProvider>              {/* Layer 1 */}
  <LanguageProvider>        {/* Layer 2 */}
    <ToastProvider>         {/* Layer 3 */}
      <SomeComponent />     {/* Layer 4 */}
    </ToastProvider>
  </LanguageProvider>
</AuthProvider>
```

**SomeComponent có thể:**
- ✅ `useAuth()` - AuthProvider ở ngoài
- ✅ `useLanguage()` - LanguageProvider ở ngoài
- ✅ `useToast()` - ToastProvider ở ngoài

**SomeComponent không thể:**
- ❌ Access context của component con (nếu có)

#### 8.7 Tại Sao Cần Nhiều Providers?

**Tại sao không gộp tất cả vào 1 Provider?**

**❌ Cách không tốt:**
```javascript
<AllInOneProvider>
  {/* Tất cả state trong 1 Provider */}
</AllInOneProvider>
```

**Vấn đề:**
- Re-render toàn bộ app khi bất kỳ state nào thay đổi
- Khó maintain
- Khó test

**✅ Cách tốt (hiện tại):**
```javascript
<AuthProvider>        {/* Chỉ re-render khi auth state thay đổi */}
  <LanguageProvider>  {/* Chỉ re-render khi language thay đổi */}
    <ToastProvider>   {/* Chỉ re-render khi toast state thay đổi */}
      {/* ... */}
    </ToastProvider>
  </LanguageProvider>
</AuthProvider>
```

**Lợi ích:**
- **Performance**: Chỉ re-render components cần thiết
- **Separation of concerns**: Mỗi Provider quản lý 1 concern
- **Maintainability**: Dễ maintain và test từng Provider riêng

#### 8.8 Ví Dụ Thực Tế: Component Sử Dụng Multiple Contexts

```javascript
function UserDashboard() {
  // ✅ Access AuthContext (AuthProvider ở ngoài)
  const { user, profile } = useAuth();
  
  // ✅ Access LanguageContext (LanguageProvider ở ngoài)
  const { t, currentLanguage } = useLanguage();
  
  // ✅ Access ToastContext (ToastProvider ở ngoài)
  const { success, error } = useToast();
  
  // ✅ Access DictionaryContext (DictionaryProvider ở ngoài)
  const { lookupWord } = useDictionary();
  
  const handleSave = async () => {
    try {
      await saveData();
      success(t('dashboard.saveSuccess')); // ✅ Dùng cả toast và language
    } catch (err) {
      error(t('dashboard.saveError'));
    }
  };
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{user?.email}</p>
      {/* ... */}
    </div>
  );
}
```

#### 8.9 Tóm Tắt

| Layer | Component | Mục đích | Vị trí | Lý do |
|-------|-----------|----------|--------|-------|
| 1 | `React.StrictMode` | Development warnings | Ngoài cùng | Development tool |
| 2 | `ErrorBoundary` | Bắt lỗi | Ngoài cùng | Bắt mọi lỗi |
| 3 | `AuthProvider` | Authentication | Ngoài | Các providers khác cần auth |
| 4 | `LanguageProvider` | i18n | Giữa | Có thể dùng auth |
| 5 | `ToastProvider` | Notifications | Giữa | Có thể dùng language |
| 6 | `DictionaryProvider` | Dictionary | Giữa | Có thể dùng language |
| 7 | `RouterProvider` | Routing | Trong cùng | Cần access tất cả contexts |

**Nguyên tắc chung:**
- **Providers cung cấp data** → Đặt ngoài
- **Providers sử dụng data** → Đặt trong
- **ErrorBoundary** → Luôn ngoài cùng để bắt mọi lỗi
- **RouterProvider** → Luôn trong cùng để access tất cả contexts

**9. Dev Routes (Chỉ trong Development)**

```javascript
// ========== DEV/EXAMPLE ROUTES ==========
...(import.meta.env.DEV
  ? [
      { path: 'examples/translation', element: <LazyPage>...</LazyPage> },
      { path: 'test-i18n', element: <LazyPage>...</LazyPage> },
      // ...
    ]
  : []),
```

Routes này chỉ xuất hiện khi `import.meta.env.DEV === true` (development mode).

#### Tóm tắt luồng hoạt động:

```
1. Browser load index.html
   ↓
2. index.html load main.jsx
   ↓
3. main.jsx:
   - Import providers
   - Định nghĩa routes với lazy loading
   - Tạo router config
   ↓
4. Render Providers hierarchy
   ↓
5. RouterProvider match URL → Render App component
   ↓
6. App.jsx render layout (Header, Footer, Outlet)
   ↓
7. Outlet render matched route component
   ↓
8. Component lazy load nếu cần → Hiển thị PageLoader
   ↓
9. Component loaded → Render UI
```

### Step 2: App Component (`App.jsx`)

📍 **Xem code tại:** `src/App.jsx` (toàn bộ file, 323 dòng)

`App.jsx` là **root layout component** của ứng dụng. Khi RouterProvider render route `/`, nó sẽ render `<App />` component.

#### 2.1 Cấu Trúc Component

📍 **Xem code tại:** `src/App.jsx` (dòng 39-48) - AppContent component structure

```javascript
// Wrapper component - Không dùng hooks
function App() {
  return <AppContent />;
}

// Inner component - Có thể dùng hooks
function AppContent() {
  const { user, profile } = useAuth();  // ✅ Có thể dùng vì AuthProvider ở ngoài
  const location = useLocation();      // ✅ React Router hook
  // ... logic và state
}
```

**Tại sao tách thành 2 components?**
- `App` wrapper không dùng hooks → Có thể test dễ hơn
- `AppContent` dùng hooks → Cần được wrap trong Providers

#### 2.2 State Management

📍 **Xem code tại:** `src/App.jsx` (dòng 40-67) - State declarations

```javascript
function AppContent() {
  // Auth state (từ AuthContext)
  const { user, profile } = useAuth();
  
  // Router state
  const location = useLocation();
  
  // Local state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [globalMaintenance, setGlobalMaintenance] = useState(null);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);
  const [accessControlLoaded, setAccessControlLoaded] = useState(false);
  
  // Computed values
  const userRole = profile?.role || user?.role;
  const isAdmin = userRole === 'admin';
  const localMaintenance = settings?.system?.maintenanceMode;
  const effectiveMaintenance = globalMaintenance !== null ? globalMaintenance : localMaintenance;
  const isLoginRoute = location.pathname.startsWith('/login');
  const showMaintenanceForUser = effectiveMaintenance && !isAdmin && !isLoginRoute;
}
```

**Giải thích state:**
- `showLoginModal`: Control hiển thị login modal
- `backgroundLoaded`: Track background image đã load chưa
- `settings`: App settings từ localStorage
- `globalMaintenance`: Maintenance mode từ Supabase (nguồn dữ liệu chính)
- `maintenanceChecked`: Track đã check maintenance chưa (tránh flash)
- `accessControlLoaded`: Track đã load access control chưa

#### 2.3 useEffect #1: Initialization & Settings Listener

📍 **Xem code tại:** `src/App.jsx` (dòng 87-103) - Initialization useEffect

```javascript
useEffect(() => {
// 1. Khởi tạo debug console filter
initDebugConsoleFilter();
  // Mục đích: Filter console logs trong production

  // 2. 🔒 SECURITY: Khởi tạo secure storage
initSecureStorage();
  // Mục đích: Migrate passwords từ localStorage sang secure storage
  
  // 3. Listen for settings changes (từ Settings page)
  const handler = (event) => {
    if (event?.detail) {
      setSettings(event.detail);
    } else {
      setSettings(getSettings());
    }
  };
  window.addEventListener('settingsUpdated', handler);
  
  // Cleanup: Remove listener khi unmount
  return () => window.removeEventListener('settingsUpdated', handler);
}, []); // Empty deps = chỉ chạy 1 lần khi mount
```

**Luồng hoạt động:**
1. Khởi tạo debug filter (production: ẩn logs, dev: hiển thị)
2. Khởi tạo secure storage (migrate sensitive data)
3. Subscribe `settingsUpdated` event (khi admin thay đổi settings)

**Custom Event Pattern:**
```javascript
// Trong Settings page
window.dispatchEvent(new CustomEvent('settingsUpdated', { 
  detail: newSettings 
}));

// Trong App.jsx (listener)
window.addEventListener('settingsUpdated', handler);
```

#### 2.4 useEffect #2: Preload Background Image

📍 **Xem code tại:** `src/App.jsx` (dòng 105-117) - Background preload

```javascript
useEffect(() => {
const img = new Image();
  img.src = backgroundImageUrl; // '/background/main.webp'
  
  img.onload = () => {
    setBackgroundLoaded(true);
    console.log('✅ Background image loaded');
  };
  
  img.onerror = () => {
    setBackgroundLoaded(true); // Vẫn set true để app không bị stuck
    console.warn('⚠️ Background image failed to load');
  };
}, []); // Chạy 1 lần khi mount
```

**Mục đích:**
- Preload background image để tránh flash khi render
- Set `backgroundLoaded = true` để hiển thị background với transition smooth

**Tối ưu performance:**
- Image preload không block render
- App vẫn hiển thị ngay, background fade in sau

#### 2.5 useEffect #3: Load JLPT Dictionary

📍 **Xem code tại:** `src/App.jsx` (dòng 119-130) - Dictionary loading

```javascript
useEffect(() => {
  console.log('🚀 [App] Loading JLPT Dictionary...');
  
  initJLPTDictionary()
    .then(() => {
      console.log('✅ [App] JLPT Dictionary loaded successfully - 8,292 words!');
    })
    .catch((error) => {
      console.error('❌ [App] Failed to load JLPT Dictionary:', error);
    });
}, []); // Chạy 1 lần khi mount
```

**Mục đích:**
- Load JLPT Dictionary (8,292 words) vào memory
- Dictionary được cache trong DictionaryProvider
- User có thể tra từ ngay lập tức (không cần load lại)

**Lợi ích:**
- Fast dictionary lookup (không cần fetch mỗi lần)
- Offline support (đã cache)

#### 2.6 useEffect #4: Maintenance Mode Check

📍 **Xem code tại:** `src/App.jsx` (dòng 132-153) - Maintenance check với polling

```javascript
useEffect(() => {
  async function fetchMaintenance() {
    const { success, maintenance } = await getGlobalMaintenanceMode();
    if (success) {
      setGlobalMaintenance(maintenance);
      setMaintenanceChecked(true);
      console.log('[App][Maintenance] Global maintenance_mode =', maintenance);
    } else {
      // Fallback: Dùng local maintenance nếu fetch fail
      setMaintenanceChecked(true);
      console.warn('[App][Maintenance] Failed to fetch, using local:', localMaintenance);
    }
  }
  
  // Fetch ngay khi mount
  fetchMaintenance();
  
  // Poll lại mỗi 30s để bắt trạng thái mới
  const interval = setInterval(fetchMaintenance, 30000);
  
  // Cleanup: Clear interval khi unmount
  return () => clearInterval(interval);
}, []); // Chạy 1 lần khi mount
```

**Mục đích:**
- Kiểm tra maintenance mode từ Supabase (nguồn dữ liệu chính)
- Poll mỗi 30s để cập nhật real-time
- Fallback về local maintenance nếu fetch fail

**Maintenance Mode Logic:**
```javascript
// Priority: globalMaintenance > localMaintenance
const effectiveMaintenance = 
  globalMaintenance !== null ? globalMaintenance : localMaintenance;

// Show maintenance page nếu:
// 1. Maintenance enabled
// 2. User không phải admin
// 3. Không phải login route
const showMaintenanceForUser = 
  effectiveMaintenance && !isAdmin && !isLoginRoute;
```

**Tại sao poll mỗi 30s?**
- Admin có thể bật/tắt maintenance mode
- User không cần refresh page
- Real-time update

#### 2.7 useEffect #5: Load & Sync Access Control

📍 **Xem code tại:** `src/App.jsx` (dòng 155-236) - Access control load & real-time sync

```javascript
useEffect(() => {
  async function loadAccessControl() {
    try {
      console.log('[App] 🔄 Loading access control from Supabase...');
      const { success, data } = await getAccessControlFromSupabase();
      
      if (success && data) {
        // ✅ CRITICAL: Sync to localStorage FIRST
        if (data.levelConfigs) {
localStorage.setItem('levelAccessControl', JSON.stringify(data.levelConfigs));
        }
        if (data.jlptConfigs) {
          localStorage.setItem('jlptConfigs', JSON.stringify(data.jlptConfigs));
        }
        if (data.levelModuleConfig) {
          localStorage.setItem('levelModuleAccessControl', JSON.stringify(data.levelModuleConfig));
        }
        if (data.jlptModuleConfig) {
          localStorage.setItem('jlptModuleAccessControl', JSON.stringify(data.jlptModuleConfig));
        }
        
        // Mark as loaded AFTER syncing
        setAccessControlLoaded(true);
        
        // Dispatch event để notify components
        window.dispatchEvent(new CustomEvent('accessControlUpdated', { 
          detail: data 
        }));
      } else {
        console.warn('[App] ⚠️ Failed to load, using localStorage');
        setAccessControlLoaded(true); // Vẫn cho app tiếp tục
      }
    } catch (error) {
      console.error('[App] ❌ Error loading access control:', error);
      setAccessControlLoaded(true); // Vẫn cho app tiếp tục
    }
  }
  
  // Load ngay khi mount
  loadAccessControl();
  
  // ✅ Subscribe to real-time changes
  const unsubscribe = subscribeToAccessControl((updatedData) => {
    console.log('[App] 🔄 Access control updated via real-time');
    
    // Sync to localStorage
    if (updatedData.levelConfigs) {
      localStorage.setItem('levelAccessControl', JSON.stringify(updatedData.levelConfigs));
    }
    // ... sync các configs khác
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('accessControlUpdated', { 
      detail: updatedData 
    }));
  });
  
  // Cleanup: Unsubscribe khi unmount
  return () => {
    unsubscribe();
  };
}, []); // Chạy 1 lần khi mount
```

**Mục đích:**
- Load access control config từ Supabase
- Sync vào localStorage (để AccessGuard đọc nhanh)
- Subscribe real-time changes (khi admin thay đổi config)

**Access Control Config Structure:**
```javascript
{
  levelConfigs: {
    n5: { public: true, requireLogin: false },
    n4: { public: false, requireLogin: true },
    // ...
  },
  jlptConfigs: {
    n5: { public: true, requireLogin: false },
    // ...
  },
  levelModuleConfig: { enabled: true, maintenanceMode: false },
  jlptModuleConfig: { enabled: true, maintenanceMode: false }
}
```

**Tại sao sync vào localStorage?**
- AccessGuard đọc từ localStorage (nhanh, không cần fetch)
- Supabase là nguồn dữ liệu chính, localStorage là cache
- Real-time subscription cập nhật localStorage khi có thay đổi

#### 2.8 useEffect #6: Re-check Maintenance on Route Change

📍 **Xem code tại:** `src/App.jsx` (dòng 238-250) - Re-check maintenance on route change

```javascript
useEffect(() => {
  if (maintenanceChecked) {
    async function recheckMaintenance() {
      const { success, maintenance } = await getGlobalMaintenanceMode();
      if (success) {
        setGlobalMaintenance(maintenance);
        console.log('[App][Maintenance] Re-checked on route change');
      }
    }
    recheckMaintenance();
  }
}, [location.pathname, maintenanceChecked]);
```

**Mục đích:**
- Re-check maintenance khi user navigate (route change)
- Đảm bảo maintenance mode luôn được cập nhật

**Tại sao cần?**
- User có thể navigate trong khi admin bật maintenance
- Cần check lại để hiển thị maintenance page ngay

#### 2.9 Render Logic

```jsx
return (
  <div className="flex flex-col min-h-screen relative overflow-x-hidden">
    {/* Background Image */}
    <div
      className={`absolute inset-0 bg-scroll -z-10 transition-opacity duration-500 ${
        backgroundLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundImage: backgroundLoaded ? `url(${backgroundImageUrl})` : 'none',
        backgroundColor: '#f5f5dc', // Fallback color
        backgroundSize: 'cover',
        backgroundPosition: 'center 25%',
        // ... performance optimizations
      }}
    />
    
    {/* Overlay for readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 -z-10" />
    
    {/* Header */}
    <Header 
      onUserIconClick={handleOpenLoginModal} 
      isMaintenanceLock={showMaintenanceForUser} 
    />
    
    {/* Main Content */}
    <main className="flex-1 relative pt-20 md:pt-24 pb-12">
      {!maintenanceChecked && !isLoginRoute ? (
        // Loading state
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p>Đang kiểm tra hệ thống...</p>
        </div>
      ) : showMaintenanceForUser ? (
        // Maintenance page
      <MaintenancePage />
    ) : (
        // Normal content
        <div className="relative z-0 flex justify-center items-start px-3 sm:px-4">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet /> {/* React Router render routes ở đây */}
          </div>
        </div>
    )}
  </main>
    
    {/* Footer */}
  <Footer />
    
    {/* Conditional Components */}
    {showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
    <GlobalSearch /> {/* Ctrl+K search */}
    <SpeedInsights /> {/* Vercel analytics */}
    <Analytics /> {/* Vercel analytics */}
  </div>
);
```

**Render Flow:**
1. **Loading State**: Nếu chưa check maintenance → Hiển thị spinner
2. **Maintenance Page**: Nếu maintenance enabled và user không phải admin → Hiển thị maintenance
3. **Normal Content**: Render `<Outlet />` (React Router render matched route)

**Layout Structure:**
```
<div> (Root container)
  ├── Background Image (absolute, z-index: -10)
  ├── Overlay (absolute, z-index: -10)
  ├── Header (fixed top)
  ├── Main (flex-1, padding top for header)
  │   └── Outlet (React Router routes render here)
  ├── Footer
  └── Conditional Components
      ├── LoginModal (if showLoginModal)
      ├── GlobalSearch (always)
      ├── SpeedInsights (always)
      └── Analytics (always)
```

#### 2.10 Tóm Tắt Luồng Hoạt Động

```
App.jsx mount
  ↓
useEffect #1: initDebugConsoleFilter() + initSecureStorage() + settings listener
  ↓
useEffect #2: Preload background image
  ↓
useEffect #3: Load JLPT Dictionary (async)
  ↓
useEffect #4: Check maintenance mode (async) + Poll every 30s
  ↓
useEffect #5: Load access control (async) + Subscribe real-time
  ↓
Render:
  - If !maintenanceChecked → Show loading
  - Else if showMaintenanceForUser → Show MaintenancePage
  - Else → Show <Outlet /> (routes)
  ↓
useEffect #6: Re-check maintenance on route change
```

#### 2.11 Key Features

| Feature | Mục đích | Implementation |
|---------|----------|----------------|
| **Maintenance Mode** | Bảo trì hệ thống | Poll Supabase every 30s, show MaintenancePage |
| **Access Control Sync** | Quản lý quyền truy cập | Load từ Supabase → localStorage → Real-time sync |
| **Background Preload** | Performance | Preload image, fade in khi ready |
| **Settings Listener** | Real-time settings | Custom event listener |
| **Dictionary Load** | Fast lookup | Load 8,292 words vào memory |
| **Secure Storage** | Security | Migrate sensitive data |
| **Route-based Maintenance** | UX | Re-check maintenance khi navigate |

#### 2.12 Giải Thích Chi Tiết Từng Phần Code

##### 2.12.1 Imports Section (Dòng 1-37)

```javascript
// React core
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
```

**Giải thích:**
- `useState`: Quản lý local state trong component
- `useEffect`: Các tác dụng phụ (gọi API, subscriptions, v.v.)
- `Outlet`: React Router component - render child routes
- `useLocation`: React Router hook - lấy current location/URL

```javascript
// Layout components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import LoginModal from './components/LoginModal.jsx';
```

**Giải thích:**
- `Header`: Navigation bar (top của page)
- `Footer`: Footer (bottom của page)
- `LoginModal`: Modal đăng nhập (conditional render)

```javascript
// Context hooks
import { useAuth } from './contexts/AuthContext.jsx';
```

**Giải thích:**
- `useAuth`: Custom hook để access AuthContext
- Có thể dùng vì `AuthProvider` wrap `App` trong `main.jsx`

```javascript
// Services
import { initJLPTDictionary } from './services/api_translate/dictionaryService.js';
import { getGlobalMaintenanceMode } from './services/appSettingsService.js';
import { getAccessControlFromSupabase, subscribeToAccessControl } from './services/accessControlService.js';
```

**Giải thích:**
- `initJLPTDictionary`: Load dictionary vào memory
- `getGlobalMaintenanceMode`: Lấy maintenance mode từ Supabase
- `getAccessControlFromSupabase`: Lấy access control config
- `subscribeToAccessControl`: Subscribe real-time changes

```javascript
// Utils
import { getSettings } from './utils/settingsManager.js';
import { initDebugConsoleFilter } from './utils/debugLogger.js';
import { initSecureStorage } from './utils/secureUserStorage.js';
```

**Giải thích:**
- `getSettings`: Đọc settings từ localStorage
- `initDebugConsoleFilter`: Filter console logs (production)
- `initSecureStorage`: Migrate sensitive data sang secure storage

```javascript
// Components
import GlobalSearch from './components/GlobalSearch.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
```

**Giải thích:**
- `GlobalSearch`: Ctrl+K search component
- `MaintenancePage`: Page hiển thị khi maintenance mode

```javascript
// Vercel Analytics
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
```

**Giải thích:**
- `SpeedInsights`: Performance monitoring
- `Analytics`: Visitor tracking

```javascript
// Constants
const backgroundImageUrl = '/background/main.webp';
```

**Giải thích:**
- Path đến background image (trong `public/` folder)

##### 2.12.2 AppContent Component - State Declarations (Dòng 40-67)

```javascript
function AppContent() {
  // Context hooks
  const { user, profile } = useAuth();
  const location = useLocation();
```

**Giải thích:**
- `user`: User object từ Supabase Auth `{ id, email, emailConfirmed }`
- `profile`: Profile từ database `{ display_name, role, avatar_url, ... }`
- `location`: Current route info `{ pathname, search, hash, ... }`

```javascript
  // Local state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [globalMaintenance, setGlobalMaintenance] = useState(null);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);
  const [accessControlLoaded, setAccessControlLoaded] = useState(false);
```

**Giải thích từng state:**
- `showLoginModal`: Boolean - Control hiển thị login modal
- `backgroundLoaded`: Boolean - Track background image đã load
- `settings`: Object - App settings từ localStorage
- `globalMaintenance`: Boolean | null - Maintenance từ Supabase (null = đang load)
- `maintenanceChecked`: Boolean - Đã check maintenance chưa (tránh flash)
- `accessControlLoaded`: Boolean - Đã load access control chưa

```javascript
  // Computed values
  const userRole = profile?.role || user?.role;
  const isAdmin = userRole === 'admin';
  const localMaintenance = settings?.system?.maintenanceMode;
```

**Giải thích:**
- `userRole`: Role từ profile (fallback về user.role)
- `isAdmin`: Check nếu user là admin
- `localMaintenance`: Maintenance mode từ localStorage (fallback)

```javascript
  // Priority: globalMaintenance > localMaintenance
  const effectiveMaintenance =
    globalMaintenance !== null ? globalMaintenance : localMaintenance;
```

**Giải thích:**
- Nếu `globalMaintenance !== null` → Dùng global (đã load từ Supabase)
- Nếu `globalMaintenance === null` → Dùng local (fallback, đang load)

```javascript
  const isLoginRoute = location.pathname.startsWith('/login');
  const showMaintenanceForUser = effectiveMaintenance && !isAdmin && !isLoginRoute;
```

**Giải thích:**
- `isLoginRoute`: Check nếu đang ở login page
- `showMaintenanceForUser`: Show maintenance nếu:
  - Maintenance enabled
  - User không phải admin
  - Không phải login route (để user có thể login)

##### 2.12.3 Debug useEffect (Dòng 69-81)

```javascript
useEffect(() => {
  console.log('[App][Maintenance] State:', {
    globalMaintenance,
    localMaintenance,
    effectiveMaintenance,
    isAdmin,
    userRole,
    isLoginRoute,
    showMaintenanceForUser,
    maintenanceChecked
  });
}, [globalMaintenance, localMaintenance, effectiveMaintenance, isAdmin, userRole, isLoginRoute, showMaintenanceForUser, maintenanceChecked]);
```

**Giải thích:**
- Debug log để track maintenance state
- Chạy lại mỗi khi dependencies thay đổi
- Hữu ích khi debug maintenance mode issues

##### 2.12.4 Event Handlers (Dòng 83-84)

```javascript
const handleOpenLoginModal = () => { setShowLoginModal(true); };
const handleCloseLoginModal = () => { setShowLoginModal(false); };
```

**Giải thích:**
- Simple handlers để control login modal
- Pass vào `Header` component

##### 2.12.5 Background Image Styling (Dòng 257-271)

```javascript
<div
  className={`absolute inset-0 w-full h-full bg-scroll -z-10 transition-opacity duration-500 ${
    backgroundLoaded ? 'opacity-100' : 'opacity-0'
  }`}
  style={{
    backgroundImage: backgroundLoaded ? `url(${backgroundImageUrl})` : 'none',
    backgroundColor: '#f5f5dc', // Fallback color (beige)
    backgroundSize: 'cover', // Cover entire screen
    backgroundPosition: 'center 25%', // Show wave part
    backgroundRepeat: 'no-repeat',
    willChange: 'auto', // Prevent GPU layer on scroll
    backgroundAttachment: 'scroll', // Explicit scroll for mobile
    transform: 'translateZ(0)', // Force GPU acceleration
    backfaceVisibility: 'hidden' // Reduce flickering
  }}
/>
```

**Giải thích từng style:**
- `absolute inset-0`: Cover toàn bộ screen
- `-z-10`: Behind content
- `transition-opacity duration-500`: Fade in smooth
- `backgroundSize: 'cover'`: Cover toàn bộ area
- `backgroundPosition: 'center 25%'`: Show phần wave (quan trọng)
- `willChange: 'auto'`: Không force GPU layer (performance)
- `backgroundAttachment: 'scroll'`: Scroll với content (mobile)
- `transform: 'translateZ(0)'`: Force GPU acceleration
- `backfaceVisibility: 'hidden'`: Giảm flickering

##### 2.12.6 Overlay (Dòng 273-277)

```javascript
<div
  className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/5 -z-10 pointer-events-none"
  style={{ mixBlendMode: 'normal' }}
/>
```

**Giải thích:**
- Gradient overlay để tăng readability
- `from-transparent via-transparent to-black/5`: Darker ở bottom
- `pointer-events-none`: Không block clicks
- `mixBlendMode: 'normal'`: Normal blending

##### 2.12.7 Main Content Render Logic (Dòng 281-298)

```javascript
<main className="flex-1 relative pt-20 md:pt-24 pb-12 overflow-x-hidden">
  {!maintenanceChecked && !isLoginRoute ? (
    // Loading state
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang kiểm tra hệ thống...</p>
      </div>
    </div>
  ) : showMaintenanceForUser ? (
    // Maintenance page
    <MaintenancePage />
  ) : (
    // Normal content
    <div className="relative z-0 flex justify-center items-start px-3 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  )}
</main>
```

**Giải thích logic:**
1. **Condition 1**: `!maintenanceChecked && !isLoginRoute`
   - Chưa check maintenance VÀ không phải login route
   - → Show loading spinner

2. **Condition 2**: `showMaintenanceForUser`
   - Maintenance enabled, không phải admin, không phải login route
   - → Show MaintenancePage

3. **Else**: Normal content
   - → Show `<Outlet />` (React Router render routes)

**Layout classes:**
- `flex-1`: Take remaining space
- `pt-20 md:pt-24`: Padding top cho header (fixed)
- `max-w-7xl`: Max width container
- `mx-auto`: Center container

##### 2.12.8 Conditional Components (Dòng 303-312)

```javascript
{showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
<GlobalSearch />
<SpeedInsights />
  <Analytics />
```

**Giải thích:**
- `LoginModal`: Conditional render (chỉ khi `showLoginModal === true`)
- `GlobalSearch`: Always render (Ctrl+K search)
- `SpeedInsights`: Always render (Vercel performance)
- `Analytics`: Always render (Vercel analytics)

##### 2.12.9 App Wrapper Component (Dòng 319-321)

```javascript
function App() {
  return <AppContent />;
}

export default App;
```

**Giải thích:**
- Wrapper component không dùng hooks
- Export default để React Router import
- `AppContent` dùng hooks → Cần wrap trong Providers (đã làm trong `main.jsx`)

#### 2.13 Performance Optimizations

**1. Background Image Preload:**
- Preload không block render
- Fade in smooth với transition
- Fallback color nếu load fail

**2. Conditional Rendering:**
- Chỉ render components khi cần
- LoginModal chỉ render khi `showLoginModal === true`

**3. Lazy Loading:**
- Routes được lazy load (trong `main.jsx`)
- Dictionary load async, không block UI

**4. Real-time Subscriptions:**
- Access control sync real-time
- Maintenance mode poll every 30s
- Không cần refresh page

**5. CSS Optimizations:**
- `willChange: 'auto'`: Không force GPU layer
- `backfaceVisibility: 'hidden'`: Giảm flickering
- `backgroundAttachment: 'scroll'`: Mobile-friendly

#### 2.14 Error Handling

**1. Maintenance Check:**
```javascript
if (success) {
  setGlobalMaintenance(maintenance);
} else {
  // Fallback to local maintenance
  setMaintenanceChecked(true);
}
```

**2. Access Control Load:**
```javascript
try {
  const { success, data } = await getAccessControlFromSupabase();
  // ...
} catch (error) {
  console.error('[App] ❌ Error:', error);
  setAccessControlLoaded(true); // Vẫn cho app tiếp tục
}
```

**3. Background Image:**
```javascript
img.onerror = () => {
  setBackgroundLoaded(true); // Vẫn show app
  console.warn('⚠️ Background image failed to load');
};
```

**Nguyên tắc:**
- Luôn có fallback
- Không block app nếu non-critical features fail
- Log errors để debug

#### 2.15 Tóm Tắt File App.jsx

**Chức năng chính:**
1. **Layout**: Root layout với Header, Footer, Background
2. **Initialization**: Load dictionary, check maintenance, sync access control
3. **State Management**: Quản lý maintenance, settings, login modal
4. **Real-time Sync**: Subscribe changes từ Supabase
5. **Conditional Rendering**: Show loading/maintenance/content dựa trên state
6. **Performance**: Preload images, optimize CSS, lazy load

**Dependencies:**
- React Router (Outlet, useLocation)
- AuthContext (useAuth)
- Services (dictionary, maintenance, access control)
- Utils (settings, debug, secure storage)

**Output:**
- Render layout với conditional content
- Handle maintenance mode
- Sync access control
- Provide global features (search, analytics)

### Step 3: Render Layout

📍 **Xem code tại:** `src/App.jsx` (dòng 254-313) - Phần return statement

Sau khi tất cả initialization hoàn tất, `App.jsx` render layout structure. Đây là **root layout** của toàn bộ ứng dụng.

#### 3.1 Root Container Structure

```jsx
<div className="flex flex-col min-h-screen relative overflow-x-hidden">
  {/* Layout components */}
</div>
```

**CSS Classes giải thích:**
- `flex flex-col`: Flexbox column layout (vertical stack)
- `min-h-screen`: Minimum height = 100vh (full screen)
- `relative`: Position relative (cho absolute children)
- `overflow-x-hidden`: Ẩn horizontal scrollbar

**Layout Flow:**
```
Root Container (flex column)
  ├── Background Layer (absolute, z-index: -10)
  ├── Overlay Layer (absolute, z-index: -10)
  ├── Header (fixed top)
  ├── Main Content (flex-1, grows to fill space)
  ├── Footer (bottom)
  └── Global Components (overlay)
      ├── LoginModal (conditional)
      ├── GlobalSearch
      ├── SpeedInsights
      └── Analytics
```

#### 3.2 Background Layer (Dòng 257-271)

```jsx
<div
  className={`absolute inset-0 w-full h-full bg-scroll -z-10 transition-opacity duration-500 ${
    backgroundLoaded ? 'opacity-100' : 'opacity-0'
  }`}
  style={{
    backgroundImage: backgroundLoaded ? `url(${backgroundImageUrl})` : 'none',
    backgroundColor: '#f5f5dc', // Fallback color (beige)
    backgroundSize: 'cover',
    backgroundPosition: 'center 25%',
    backgroundRepeat: 'no-repeat',
    willChange: 'auto',
    backgroundAttachment: 'scroll',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden'
  }}
/>
```

**Mục đích:**
- Background image cho toàn bộ app
- Fade in smooth khi image load xong
- Performance optimized

**Giải thích:**
- `absolute inset-0`: Cover toàn bộ screen
- `-z-10`: Behind tất cả content
- `transition-opacity duration-500`: Fade in 500ms
- `opacity-0` → `opacity-100`: Từ ẩn → hiện khi load xong
- `backgroundPosition: 'center 25%'`: Show phần wave (quan trọng của design)

#### 3.3 Overlay Layer (Dòng 273-277)

```jsx
<div
  className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/5 -z-10 pointer-events-none"
  style={{ mixBlendMode: 'normal' }}
/>
```

**Mục đích:**
- Gradient overlay để tăng readability của text
- Darker ở bottom để text dễ đọc hơn

**Giải thích:**
- `bg-gradient-to-b`: Gradient từ top → bottom
- `from-transparent via-transparent to-black/5`: Transparent → 5% black
- `pointer-events-none`: Không block mouse events
- `mixBlendMode: 'normal'`: Normal blending mode

#### 3.4 Header Component (Dòng 279)

```jsx
<Header 
  onUserIconClick={handleOpenLoginModal} 
  isMaintenanceLock={showMaintenanceForUser} 
/>
```

**Props:**
- `onUserIconClick`: Handler khi click user icon → Mở login modal
- `isMaintenanceLock`: Boolean - Nếu true, header hiển thị maintenance lock icon

**Chức năng Header:**
- Navigation bar (top của page)
- Logo, menu items, user icon
- Language switcher
- Search button (Ctrl+K)
- Fixed position (sticky top)

**Vị trí trong layout:**
- Fixed top (không scroll với content)
- Z-index cao (trên content)

#### 3.5 Main Content Area (Dòng 281-298)

```jsx
<main className="flex-1 relative pt-20 md:pt-24 pb-12 overflow-x-hidden">
  {/* Conditional rendering */}
</main>
```

**CSS Classes:**
- `flex-1`: Grow để fill remaining space
- `relative`: Position relative
- `pt-20 md:pt-24`: Padding top cho header (fixed)
  - Mobile: 20 (5rem)
  - Desktop: 24 (6rem)
- `pb-12`: Padding bottom
- `overflow-x-hidden`: Ẩn horizontal scroll

**Conditional Rendering Logic:**

**1. Loading State:**
```jsx
{!maintenanceChecked && !isLoginRoute ? (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Đang kiểm tra hệ thống...</p>
    </div>
  </div>
) : ...}
```

**Khi nào hiển thị:**
- `!maintenanceChecked`: Chưa check maintenance mode
- `!isLoginRoute`: Không phải login route

**Mục đích:**
- Tránh flash content khi đang check maintenance
- Better UX với loading indicator

**2. Maintenance Page:**
```jsx
showMaintenanceForUser ? (
  <MaintenancePage />
) : ...}
```

**Khi nào hiển thị:**
- `showMaintenanceForUser === true`:
  - Maintenance enabled
  - User không phải admin
  - Không phải login route

**Mục đích:**
- Hiển thị maintenance message
- Block user access (trừ admin)

**3. Normal Content (Outlet):**
```jsx
<div className="relative z-0 flex justify-center items-start px-3 sm:px-4">
  <div className="w-full max-w-7xl mx-auto">
    <Outlet />
  </div>
</div>
```

**Layout Structure:**
- Outer div: Center container, responsive padding
- Inner div: Max width 7xl (1280px), centered
- `<Outlet />`: React Router render matched route component

**Giải thích:**
- `max-w-7xl`: Max width = 1280px (Tailwind)
- `mx-auto`: Center horizontally
- `px-3 sm:px-4`: Responsive padding
  - Mobile: 12px (3 * 4px)
  - Desktop: 16px (4 * 4px)

**Outlet Component:**
- React Router component
- Render child route component dựa trên current URL
- Ví dụ:
  - `/` → `<HomePage />`
  - `/level/n5` → `<LevelN5Page />`
  - `/jlpt/n5/2023-07` → `<JLPTExamDetailPage />`

#### 3.6 Footer Component (Dòng 301)

```jsx
<Footer />
```

**Chức năng:**
- Footer của page
- Links (About, Terms, Privacy)
- Copyright info
- Social media links (nếu có)

**Vị trí:**
- Bottom của page
- Scroll với content (không fixed)

#### 3.7 Conditional Components

**3.7.1 LoginModal (Dòng 303)**

```jsx
{showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
```

**Conditional Rendering:**
- Chỉ render khi `showLoginModal === true`
- Performance: Không render khi không cần

**Props:**
- `onClose`: Handler để đóng modal

**Chức năng:**
- Modal đăng nhập/đăng ký
- Overlay toàn màn hình
- Z-index cao (trên tất cả content)

**3.7.2 GlobalSearch (Dòng 306)**

```jsx
<GlobalSearch />
```

**Chức năng:**
- Global search component (Ctrl+K)
- Search across books, lessons, exams, dictionary
- Keyboard shortcut: `Ctrl/Cmd + K`

**Vị trí:**
- Always render (không conditional)
- Overlay khi active
- Z-index cao

**3.7.3 SpeedInsights & Analytics (Dòng 309-312)**

```jsx
<SpeedInsights />
<Analytics />
```

**Chức năng:**
- **SpeedInsights**: Performance monitoring (Vercel)
  - Track page load time
  - Track Core Web Vitals
  - Track slow components
- **Analytics**: Visitor tracking (Vercel)
  - Track page views
  - Track user behavior
  - Track conversions

**Vị trí:**
- Always render (không visible)
- Invisible components (chỉ track data)

#### 3.8 Z-Index Layering

```
Layer Structure (từ dưới lên):
-10: Background Image
-10: Overlay
  0: Main Content (Outlet)
  0: Footer
 10: Header (fixed)
 50: LoginModal (khi active)
 50: GlobalSearch (khi active)
  ?: SpeedInsights (invisible)
  ?: Analytics (invisible)
```

**Giải thích:**
- Background và Overlay: `-z-10` (behind everything)
- Content: `z-0` (default)
- Header: Fixed với z-index cao (trên content)
- Modals: Z-index cao (trên tất cả)

#### 3.9 Responsive Design

**Breakpoints:**
- Mobile: `< 640px` (sm)
- Tablet: `640px - 1024px` (md)
- Desktop: `> 1024px` (lg, xl)

**Responsive Classes:**
- `pt-20 md:pt-24`: Padding top responsive
- `px-3 sm:px-4`: Padding horizontal responsive
- `max-w-7xl`: Max width (responsive)

#### 3.10 Luồng Render Chi Tiết

```
1. App.jsx render
   ↓
2. Render root container
   ↓
3. Render background layer (opacity-0)
   ↓
4. Render overlay layer
   ↓
5. Render Header (fixed top)
   ↓
6. Render Main:
   - Check maintenanceChecked
   - If !maintenanceChecked → Show loading
   - Else if showMaintenanceForUser → Show MaintenancePage
   - Else → Show <Outlet />
   ↓
7. <Outlet /> render matched route:
   - React Router match URL
   - Render route component (HomePage, LevelN5Page, etc.)
   ↓
8. Render Footer
   ↓
9. Conditional render LoginModal (if showLoginModal)
   ↓
10. Render GlobalSearch (always)
   ↓
11. Render SpeedInsights (invisible)
   ↓
12. Render Analytics (invisible)
   ↓
13. Background image load xong → Fade in (opacity-100)
```

#### 3.11 Tóm Tắt Layout Structure

| Component | Vị trí | Z-index | Conditional | Mục đích |
|-----------|--------|---------|-------------|----------|
| **Background** | Absolute, full screen | -10 | No | Background image |
| **Overlay** | Absolute, full screen | -10 | No | Readability gradient |
| **Header** | Fixed top | High | No | Navigation bar |
| **Main** | Flex-1, grows | 0 | No | Content area |
| **Loading** | Inside Main | 0 | Yes | Loading state |
| **MaintenancePage** | Inside Main | 0 | Yes | Maintenance mode |
| **Outlet** | Inside Main | 0 | Yes | Route content |
| **Footer** | Bottom | 0 | No | Footer links |
| **LoginModal** | Overlay | 50 | Yes | Login/Register |
| **GlobalSearch** | Overlay | 50 | No | Search (Ctrl+K) |
| **SpeedInsights** | Invisible | ? | No | Performance tracking |
| **Analytics** | Invisible | ? | No | Visitor tracking |

### Step 4: Route Matching & Component Rendering

📍 **Xem code tại:** 
- `src/main.jsx` (dòng 177-408) - Router configuration
- `src/App.jsx` (dòng 295) - `<Outlet />` component
- `src/components/ProtectedRoute.jsx` - Route guard
- `src/components/AccessGuard.jsx` - Access control guard

Sau khi layout được render, React Router sẽ **match URL hiện tại** với routes đã định nghĩa và render component tương ứng trong `<Outlet />`.

#### 4.1 React Router Route Matching

**Khi user truy cập URL:**
```
User navigate to: /level/n5
  ↓
React Router check routes từ trên xuống:
  1. / → Match! (root route)
     └── Render <App />
        └── <Outlet /> → Check children routes
  2. /level → Match? No (URL là /level/n5)
  3. /level/:levelId → Match! (levelId = "n5")
     └── Render <DynamicLevelPage />
        └── <AccessGuard module="level" levelId="n5">
            └── <LazyPage>
                └── <LevelN5Page />
```

**Route Matching Process:**
1. Router lấy current URL từ browser
2. So sánh với routes trong router config (từ trên xuống)
3. Match route đầu tiên phù hợp
4. Extract route params (nếu có)
5. Render component tương ứng

#### 4.2 Outlet Component

📍 **Xem code tại:** `src/App.jsx` (dòng 295) - `<Outlet />` trong main content area

```jsx
<Outlet />
```

**Outlet là gì?**

`<Outlet />` là một **special component của React Router** dùng để render **child route component** trong nested routes structure.

**Tại sao cần Outlet?**

Trong React Router, khi bạn có **nested routes** (routes có children), bạn cần một cách để render child route component bên trong parent route component. `<Outlet />` chính là "placeholder" đó.

**Ví dụ đơn giản:**

```javascript
// Route config
{
  path: '/',
  element: <App />,  // Parent route
  children: [
    { path: '/', element: <HomePage /> },      // Child route
    { path: '/about', element: <AboutPage /> } // Child route
  ]
}
```

**Trong App.jsx:**
```jsx
function App() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />  {/* ← Child route render ở đây */}
      </main>
      <Footer />
    </div>
  );
}
```

**Cách hoạt động:**

1. User truy cập URL: `/`
2. React Router match route `/` → Render `<App />`
3. `<App />` render → Render Header, Footer
4. Đến `<Outlet />` → Router check: "Có child route nào match không?"
5. Tìm thấy `{ path: '/', element: <HomePage /> }` → Render `<HomePage />` trong `<Outlet />`
6. Kết quả: Header + HomePage + Footer

**Ví dụ cụ thể với dự án:**

**Scenario 1: URL = `/`**

```javascript
// Route config (main.jsx)
{
  path: '/',
  element: <App />,
  children: [
    { index: true, element: <HomePage /> }  // index route
  ]
}
```

**Luồng render:**
```
1. Router match '/' → Render <App />
   ↓
2. App.jsx render:
   <div>
     <Header />
     <main>
       <Outlet />  ← Router check: "Có child route match '/' không?"
     </main>
     <Footer />
   </div>
   ↓
3. Router tìm thấy: { index: true, element: <HomePage /> }
   ↓
4. <Outlet /> render <HomePage />
   ↓
5. Kết quả trên màn hình:
   ┌─────────────────┐
   │     Header      │
   ├─────────────────┤
   │   <HomePage />  │ ← Render trong <Outlet />
   ├─────────────────┤
   │     Footer      │
   └─────────────────┘
```

**Scenario 2: URL = `/level/n5`**

```javascript
// Route config
{
  path: '/',
  element: <App />,
  children: [
    { path: 'level/:levelId', element: <DynamicLevelPage /> }
  ]
}
```

**Luồng render:**
```
1. Router match '/level/n5' → Render <App />
   ↓
2. App.jsx render:
   <div>
     <Header />
     <main>
       <Outlet />  ← Router check: "Có child route match '/level/n5' không?"
     </main>
     <Footer />
   </div>
   ↓
3. Router tìm thấy: { path: 'level/:levelId', element: <DynamicLevelPage /> }
   ↓
4. <Outlet /> render <DynamicLevelPage />
   ↓
5. DynamicLevelPage render <LevelN5Page />
   ↓
6. Kết quả:
   ┌─────────────────┐
   │     Header      │
   ├─────────────────┤
   │ <LevelN5Page /> │ ← Render trong <Outlet />
   ├─────────────────┤
   │     Footer      │
   └─────────────────┘
```

**Scenario 3: URL = `/admin/users` (Nested Routes)**

```javascript
// Route config
{
  path: '/',
  element: <App />,
  children: [
    {
      path: 'admin',
      element: <AdminLayout />,  // Parent route
      children: [
        { path: 'users', element: <UsersManagementPage /> }  // Child route
      ]
    }
  ]
}
```

**Luồng render:**
```
1. Router match '/admin/users' → Render <App />
   ↓
2. App.jsx render:
   <div>
     <Header />
     <main>
       <Outlet />  ← Router check: "Có child route match '/admin/users' không?"
     </main>
     <Footer />
   </div>
   ↓
3. Router tìm thấy: { path: 'admin', element: <AdminLayout /> }
   ↓
4. <Outlet /> (trong App) render <AdminLayout />
   ↓
5. AdminLayout render:
   <div>
     <Sidebar />
     <main>
       <Outlet />  ← Router check: "Có child route match 'users' không?"
     </main>
   </div>
   ↓
6. Router tìm thấy: { path: 'users', element: <UsersManagementPage /> }
   ↓
7. <Outlet /> (trong AdminLayout) render <UsersManagementPage />
   ↓
8. Kết quả:
   ┌─────────────────────────┐
   │        Header            │
   ├─────────────────────────┤
   │ Sidebar │ <UsersPage /> │ ← Nested <Outlet />
   │         │                │
   ├─────────────────────────┤
   │        Footer            │
   └─────────────────────────┘
```

**So sánh: Có Outlet vs Không có Outlet**

**❌ Không dùng Outlet (không hoạt động):**

```jsx
// App.jsx
function App() {
  return (
    <div>
      <Header />
      <main>
        {/* Không có Outlet - Child routes không render được! */}
      </main>
      <Footer />
    </div>
  );
}
```

**Vấn đề:**
- Child routes không render được
- Chỉ thấy Header và Footer, không có content

**✅ Dùng Outlet (đúng cách):**

```jsx
// App.jsx
function App() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />  {/* ← Child routes render ở đây */}
      </main>
      <Footer />
    </div>
  );
}
```

**Kết quả:**
- Child routes render đúng trong `<Outlet />`
- Layout (Header, Footer) luôn hiển thị
- Content thay đổi theo route

**Outlet trong code thực tế:**

📍 **Xem code tại:** `src/App.jsx` (dòng 293-297)

```jsx
<div className="relative z-0 flex justify-center items-start px-3 sm:px-4">
  <div className="w-full max-w-7xl mx-auto">
    <Outlet />  {/* ← Child routes render ở đây */}
  </div>
</div>
```

**Giải thích:**
- Container div: Center content, responsive padding
- Max width container: Giới hạn width content
- `<Outlet />`: Render matched child route component

**Khi user navigate:**

```
User click link → URL thay đổi
  ↓
React Router match new URL
  ↓
<Outlet /> re-render với component mới
  ↓
UI update (Header, Footer giữ nguyên, chỉ content thay đổi)
```

**Ví dụ cụ thể:**

```
User đang ở: /level/n5
  → <Outlet /> render <LevelN5Page />

User click "N4" → Navigate to /level/n4
  → <Outlet /> re-render <LevelN4Page />
  → Header, Footer không thay đổi
  → Chỉ content area thay đổi
```

**Tóm tắt:**

| Khái niệm | Giải thích |
|-----------|------------|
| **Outlet là gì?** | Component của React Router để render child routes |
| **Tại sao cần?** | Để render child route component trong parent layout |
| **Cách hoạt động?** | Router match child route → Render component trong `<Outlet />` |
| **Vị trí trong code?** | Trong parent route component (App.jsx, AdminLayout.jsx) |
| **Khi nào re-render?** | Khi URL thay đổi và match child route khác |
| **Lợi ích?** | Layout (Header, Footer) không cần re-render, chỉ content thay đổi |

#### 4.3 Lazy Loading Process

**Khi route component được lazy load:**

```javascript
// main.jsx
const LevelN5Page = lazy(() => import('./features/books/pages/LevelN5Page.jsx'));

// Route config
{
  path: 'level/:levelId',
  element: (
    <LazyPage>
      <LevelN5Page />
    </LazyPage>
  )
}
```

**Luồng hoạt động:**

```
1. User navigate to /level/n5
   ↓
2. Router match route → Tìm thấy LevelN5Page
   ↓
3. LevelN5Page chưa được load (lazy)
   ↓
4. LazyPage wrapper:
   - <Suspense fallback={<PageLoader />}>
   - Hiển thị PageLoader (spinner)
   ↓
5. React lazy() load component:
   - Fetch JavaScript bundle từ server
   - Parse và execute code
   ↓
6. Component loaded → Render LevelN5Page
   ↓
7. PageLoader ẩn đi
```

**LazyPage Wrapper:**
```jsx
const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);
```

**PageLoader Component:**
```jsx
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Đang tải...</p>
    </div>
  </div>
);
```

#### 4.4 AccessGuard Check

**Trước khi render route component:**

```jsx
<AccessGuard module="level" levelId="n5">
  <LazyPage>
    <LevelN5Page />
  </LazyPage>
</AccessGuard>
```

**AccessGuard làm gì:**

```
1. Read access control từ localStorage:
   - levelAccessControl['n5']
   - levelModuleAccessControl
   ↓
2. Check access rules:
   - Is public? → Allow
   - Require login? → Check user logged in
   - Premium required? → Check user has premium
   ↓
3. Decision:
   - If allowed → Render children (LevelN5Page)
   - If denied → Redirect or show locked message
```

**Ví dụ Access Control Check:**

```javascript
// localStorage['levelAccessControl']
{
  "n5": { public: true, requireLogin: false },   // ✅ Allow
  "n4": { public: false, requireLogin: true },   // Check login
  "n3": { public: false, requireLogin: true, premium: true } // Check premium
}

// User truy cập /level/n5
// AccessGuard check: n5.public === true → ✅ Allow → Render LevelN5Page

// User truy cập /level/n4 (chưa login)
// AccessGuard check: n4.requireLogin === true, user === null → ❌ Deny → Redirect to /login
```

#### 4.5 Component Lifecycle

**Khi route component mount:**

```
1. Component mount
   ↓
2. useEffect hooks chạy (theo thứ tự)
   ↓
3. Tải dữ liệu (gọi API)
   ↓
4. State updates
   ↓
5. Re-render với data
   ↓
6. UI hiển thị
```

**Ví dụ: LevelN5Page mount**

```javascript
function LevelN5Page() {
  // 1. Hooks
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // 2. State
  const [n5Books, setN5Books] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 3. Tải dữ liệu (useEffect)
  useEffect(() => {
    const loadBooks = async () => {
      const books = await storageManager.getBooks('n5');
      setN5Books(books);
    };
    loadBooks();
  }, []);
  
  // 4. Render
  return (
    <div>
      {n5Books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

**Luồng:**
1. Component mount → `useState` initialize
2. `useEffect` chạy → Load books từ storage/service
3. `setN5Books(books)` → State update
4. Component re-render với books data
5. UI hiển thị BookCard components

#### 4.6 Nested Routes Rendering

**Ví dụ: Admin routes**

```javascript
// Route config
{
  path: 'admin',
  element: <AdminLayout />,
  children: [
    { index: true, element: <AdminDashboardPage /> },
    { path: 'users', element: <UsersManagementPage /> }
  ]
}
```

**URL: `/admin`**
```jsx
<App>
  <Outlet /> → Render <AdminLayout />
    <Outlet /> (trong AdminLayout) → Render <AdminDashboardPage />
</App>
```

**URL: `/admin/users`**
```jsx
<App>
  <Outlet /> → Render <AdminLayout />
    <Outlet /> (trong AdminLayout) → Render <UsersManagementPage />
</App>
```

**Nested Outlet:**
- Parent route render layout
- Child route render trong `<Outlet />` của parent

#### 4.7 Route Parameters

**Dynamic routes với params:**

```javascript
// Route: /level/:levelId/:bookId
// URL: /level/n5/minna-no-nihongo-1

function BookDetailPage() {
  const { levelId, bookId } = useParams();
  // levelId = "n5"
  // bookId = "minna-no-nihongo-1"
  
  // Load book data
  useEffect(() => {
    loadBook(levelId, bookId);
  }, [levelId, bookId]);
}
```

**useParams Hook:**
- Lấy route params từ URL
- Re-render khi params thay đổi
- Dùng để load data tương ứng

#### 4.8 Route Guards Execution

**Thứ tự execution:**

```
1. ProtectedRoute (nếu có)
   - Check user logged in
   - Check role (admin/editor)
   ↓
2. AccessGuard (nếu có)
   - Check level/module access
   ↓
3. Component render
   - Load data
   - Render UI
```

**Ví dụ: Admin route**

```jsx
<ProtectedRoute adminOnly={true}>
  <AdminLayout />
</ProtectedRoute>
```

**Luồng:**
1. `ProtectedRoute` check: `user?.role === 'admin'`
2. Nếu không phải admin → Redirect to `/`
3. Nếu là admin → Render `AdminLayout`

#### 4.9 Tóm Tắt Step 4

**Luồng hoạt động:**

```
Step 3: Layout rendered
  ↓
Step 4: Route Matching & Component Rendering
  ├── 4.1: React Router match URL với routes
  ├── 4.2: <Outlet /> render matched route
  ├── 4.3: Lazy load component (nếu cần)
  ├── 4.4: AccessGuard check permissions
  ├── 4.5: Component mount & lifecycle
  ├── 4.6: Nested routes render (nếu có)
  ├── 4.7: Extract route params
  └── 4.8: Route guards execution
  ↓
Component rendered → UI hiển thị
```

**Key Points:**
- React Router match routes từ trên xuống
- `<Outlet />` render matched child route
- Lazy loading với Suspense + PageLoader
- AccessGuard check permissions trước khi render
- Component lifecycle: mount → useEffect → data load → render
- Nested routes render trong parent's `<Outlet />`
- Route params available via `useParams()`

### Step 5: Component Lifecycle & Data Loading

📍 **Xem code tại:**
- `src/features/books/pages/LevelN5Page.jsx` (dòng 12-85) - Component lifecycle example
- `src/utils/localStorageManager.js` - Storage operations
- `src/services/contentService.js` - API calls

Sau khi component được render trong `<Outlet />`, nó sẽ **mount** và bắt đầu **lifecycle** của React component. Đây là lúc component load data và render UI.

#### 5.1 Component Mount Process

**Khi component mount:**

```
1. Component được render trong <Outlet />
   ↓
2. React component mount
   - Initialize state với useState()
   - Run useEffect hooks
   ↓
3. Tải dữ liệu (bất đồng bộ)
   - API calls
   - Storage operations
   ↓
4. State updates
   - setState() với data mới
   ↓
5. Component re-render
   - Render UI với data
   ↓
6. User thấy content
```

#### 5.2 Ví Dụ Cụ Thể: LevelN5Page

📍 **Xem code tại:** `src/features/books/pages/LevelN5Page.jsx` (dòng 12-85)

**Bước 1: Component Mount**

```javascript
function LevelN5Page() {
  // 1. Initialize hooks
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
  // 2. Initialize state
  const [n5Books, setN5Books] = useState([]);  // ← Empty array ban đầu
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Component render lần đầu với empty state
  // → UI hiển thị: Loading hoặc empty state
}
```

**Bước 2: useEffect Chạy - Load Data**

```javascript
useEffect(() => {
  const loadBooks = async () => {
    // 1. Load từ storage (IndexedDB/localStorage)
    const savedBooksRaw = await storageManager.getBooks('n5');
    
    // 2. Filter và clean data
    const cleanedSaved = filterDemoAndExtraBooks(savedBooksRaw);
    
    // 3. Load series để map categories
    const seriesList = await storageManager.getSeries('n5');
    
    // 4. Map categories cho books
    let booksWithCategory = cleanedSaved.map(book => {
      // ... map logic
    });
    
    // 5. Update state
    setN5Books(booksWithCategory);  // ← Trigger re-render
    
    // 6. Save lại để sync
    await storageManager.saveBooks('n5', booksWithCategory);
  };
  
  loadBooks();  // ← Chạy ngay khi component mount
}, []); // Empty deps = chỉ chạy 1 lần khi mount
```

**Luồng hoạt động:**

```
LevelN5Page mount
  ↓
useState initialize:
  - n5Books = [] (empty)
  - currentPage = 1
  ↓
First render:
  - Render với n5Books = [] (empty)
  - UI: Loading hoặc empty state
  ↓
useEffect chạy (async):
  - storageManager.getBooks('n5')
  - Filter và process data
  - setN5Books(books) ← State update
  ↓
Component re-render:
  - n5Books = [book1, book2, ...] (có data)
  - Render BookCard components
  ↓
UI hiển thị books
```

#### 5.3 Data Loading Flow

**Luồng load data từ storage:**

```
Component (LevelN5Page)
  ↓
useEffect gọi: storageManager.getBooks('n5')
  ↓
localStorageManager.getBooks()
  ├── Check IndexedDB cache
  │   └── Nếu có → Return cached data
  ├── Nếu không có → Gọi contentService.getBooks('n5')
  │   └── contentService gọi Supabase API
  │       └── Chuyển đổi dữ liệu (snake_case → camelCase)
  │       └── Cache vào IndexedDB
  │       └── Return data
  └── Return data cho component
  ↓
Component setState với data
  ↓
Component re-render với data
```

**Ví dụ code:**

📍 **Xem code tại:** `src/features/books/pages/LevelN5Page.jsx` (dòng 34)

```javascript
// Component gọi
const savedBooksRaw = await storageManager.getBooks('n5');

// storageManager.getBooks() làm gì:
// 1. Check IndexedDB
// 2. Nếu không có → Gọi contentService.getBooks('n5')
// 3. contentService.getBooks() gọi Supabase
// 4. Cache vào IndexedDB
// 5. Return data
```

#### 5.4 Multiple useEffect Hooks

**Component có thể có nhiều useEffect:**

📍 **Xem code tại:** `src/features/books/pages/LevelN5Page.jsx` (dòng 22-94)

```javascript
// useEffect #1: Load books (chạy 1 lần khi mount)
useEffect(() => {
  loadBooks();
}, []); // Empty deps

// useEffect #2: Read category from URL (chạy khi URL thay đổi)
useEffect(() => {
  const categoryFromUrl = searchParams.get('category');
  if (categoryFromUrl) {
    setSelectedCategory(decodeURIComponent(categoryFromUrl));
    setCurrentPage(1);
  }
}, [searchParams]); // Chạy khi searchParams thay đổi
```

**Thứ tự execution:**
1. Component mount
2. Tất cả useState initialize
3. First render (với initial state)
4. useEffect hooks chạy (theo thứ tự)
5. State updates từ useEffect
6. Re-render với updated state

#### 5.5 Loading States

**Component thường có loading state:**

```javascript
function LevelN5Page() {
  const [n5Books, setN5Books] = useState([]);
  const [isLoading, setIsLoading] = useState(true);  // ← Loading state
  
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);  // ← Bắt đầu loading
      
      const books = await storageManager.getBooks('n5');
      
      setN5Books(books);
      setIsLoading(false);  // ← Kết thúc loading
    };
    
    loadBooks();
  }, []);
  
  // Render
  if (isLoading) {
    return <LoadingSpinner />;  // ← Hiển thị loading
  }
  
  return (
    <div>
      {n5Books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
```

**Luồng với loading state:**

```
Mount → isLoading = true
  ↓
First render → <LoadingSpinner />
  ↓
useEffect chạy → Load data
  ↓
Data loaded → setN5Books(books) + setIsLoading(false)
  ↓
Re-render → Render BookCard components
```

#### 5.6 Error Handling

**Component cần handle errors:**

```javascript
useEffect(() => {
  const loadBooks = async () => {
    try {
      const books = await storageManager.getBooks('n5');
      setN5Books(books);
    } catch (error) {
      console.error('Failed to load books:', error);
      // Fallback: Dùng default data
      setN5Books(n5BooksMetadata);
    }
  };
  
  loadBooks();
}, []);
```

**Error handling pattern:**
- Try-catch trong async functions
- Fallback data nếu load fail
- Show error message cho user (nếu cần)

#### 5.7 Computed Values (useMemo)

**Component có thể có computed values:**

📍 **Xem code tại:** `src/features/books/pages/LevelN5Page.jsx` (dòng 96-118)

```javascript
const categories = React.useMemo(() => {
  // Đếm số lượng books trong mỗi category
  const categoryCounts = {};
  n5Books.forEach(book => {
    if (book.category) {
      categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
    }
  });
  
  // Tạo array categories với số lượng
  return Object.keys(categoryCounts).map(cat => ({
    name: cat,
    id: cat,
    count: categoryCounts[cat]
  })).sort((a, b) => b.count - a.count);
}, [n5Books]); // Re-compute khi n5Books thay đổi
```

**useMemo mục đích:**
- Tính toán giá trị từ state
- Chỉ re-compute khi dependencies thay đổi
- Performance optimization

#### 5.8 Event Handlers

**Component có event handlers:**

📍 **Xem code tại:** `src/features/books/pages/LevelN5Page.jsx` (dòng 130-153)

```javascript
// Handler cho click book
const handleBookClick = (bookId) => {
  navigate(`/level/n5/${bookId}`);  // ← Navigate to book detail
};

// Handler cho click category
const handleCategoryClick = (category) => {
  setSelectedCategory(category === selectedCategory ? null : category);
  setCurrentPage(1);
  // Smooth transition
  setIsTransitioning(true);
  setTimeout(() => setIsTransitioning(false), 150);
};

// Handler cho pagination
const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
  setIsTransitioning(true);
  setTimeout(() => setIsTransitioning(false), 150);
};
```

**Event handlers làm gì:**
- Update state (filter, pagination)
- Navigate to other routes
- Kích hoạt các tác dụng phụ (transitions, animations)

#### 5.9 Tóm Tắt Step 5

**Luồng hoạt động:**

```
Step 4: Component rendered trong <Outlet />
  ↓
Step 5: Component Lifecycle & Data Loading
  ├── 5.1: Component mount
  ├── 5.2: useState initialize
  ├── 5.3: First render (với initial state)
  ├── 5.4: useEffect hooks chạy
  ├── 5.5: Tải dữ liệu (bất đồng bộ)
  │   ├── Storage operations
  │   ├── API calls (nếu cần)
  │   └── Data processing
  ├── 5.6: State updates (setState)
  ├── 5.7: Component re-render với data
  ├── 5.8: Computed values (useMemo)
  └── 5.9: Event handlers ready
  ↓
UI hiển thị với data → User tương tác
```

**Key Points:**
- Component mount khi render trong `<Outlet />`
- useState initialize state ban đầu
- useEffect chạy sau first render
- Tải dữ liệu thường bất đồng bộ (API, storage)
- State updates trigger re-render
- useMemo optimize computed values
- Event handlers handle user interactions

---

## 6. LUỒNG DỮ LIỆU (DATA FLOW)

### 6.1 Luồng Đọc Dữ Liệu (Read Flow)

📍 **Xem code tại:**
- `src/utils/localStorageManager.js` (dòng 155-280) - Storage manager với 3-tier strategy
- `src/services/contentService.js` (dòng 56-89) - Gọi API và chuyển đổi dữ liệu
- `src/features/books/pages/LevelN5Page.jsx` (dòng 22-85) - Component sử dụng storageManager

**Tổng quan:**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Component │────▶│   Service    │────▶│    Supabase     │
│  (Page/UI)  │     │ (Business)   │     │  (PostgreSQL)   │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                   │                      │
       │                   │     ┌────────────────┘
       │                   ▼     ▼
       │            ┌─────────────────┐
       │            │  Transform Data │  ← snake_case → camelCase
       │            └─────────────────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────────┐
│   IndexedDB / localStorage (Cache) │
└─────────────────────────────────────┘
```

#### 6.1.1 Storage Strategy (3-Tier Fallback)

📍 **Xem code tại:** `src/utils/localStorageManager.js` (dòng 11-16, 155-280)

**Chiến lược (Strategy):**
```
1. Thử Supabase trước (cloud, nguồn dữ liệu chính)
   ↓ (nếu thất bại hoặc không có data)
2. Thử IndexedDB (cache local, dung lượng không giới hạn)
   ↓ (nếu thất bại hoặc không có data)
3. Fallback về localStorage (giới hạn 5-10 MB)
```

**Tại sao dùng 3-tier (3 tầng)?**
- **Supabase**: Nguồn dữ liệu chính (source of truth), đồng bộ đa thiết bị (multi-device sync)
- **IndexedDB**: Dung lượng không giới hạn, hỗ trợ offline
- **localStorage**: Dự phòng (fallback) khi IndexedDB không khả dụng

#### 6.1.2 Luồng Đọc Chi Tiết: Load Books

📍 **Xem code tại:** 
- `src/features/books/pages/LevelN5Page.jsx` (dòng 34) - Component gọi
- `src/utils/localStorageManager.js` (dòng 155-280) - Storage manager logic
- `src/services/contentService.js` (dòng 56-89) - Supabase API call

**Bước 1: Component gọi storageManager**

```javascript
// LevelN5Page.jsx (dòng 34)
const savedBooksRaw = await storageManager.getBooks('n5');
```

**Component chỉ cần gọi 1 function** - không cần biết dữ liệu đến từ đâu (Supabase, IndexedDB, hay localStorage).

**Bước 2: storageManager.getBooks() - 3-Tier Strategy**

📍 **Xem code tại:** `src/utils/localStorageManager.js` (dòng 155-280)

```javascript
async getBooks(level) {
  // ✅ Đảm bảo IndexedDB đã init
  await this.ensureInitialized();
  
  // ========== TIER 1: Try Supabase first ==========
  try {
    const { success, data } = await contentService.getBooks(level);
    
    if (success && data && data.length > 0) {
      // ✅ Có data từ Supabase
      console.log('✅ Loaded', data.length, 'books from Supabase');
      
      // Cache vào IndexedDB (nếu available)
      if (this.useIndexedDB) {
        await indexedDBManager.saveBooks(level, data);
      }
      
      // Cache vào localStorage (fallback)
      if (this.storageAvailable) {
        localStorage.setItem(`adminBooks_${level}`, JSON.stringify(data));
      }
      
      return data; // ← Return Supabase data
    }
    
    // Supabase trả về rỗng → Clear local cache
    if (this.useIndexedDB) {
      await indexedDBManager.saveBooks(level, []);
    }
    localStorage.removeItem(`adminBooks_${level}`);
    return []; // ← Return empty array
  } catch (err) {
    console.warn('❌ Supabase failed, trying local cache:', err);
  }
  
  // ========== TIER 2: Try IndexedDB ==========
  if (this.useIndexedDB) {
    const result = await indexedDBManager.getBooks(level);
    if (result && result.length > 0) {
      console.log('✅ Loaded', result.length, 'books from IndexedDB');
      return result; // ← Return cached data
    }
  }
  
  // ========== TIER 3: Fallback to localStorage ==========
  if (this.storageAvailable) {
    const key = `adminBooks_${level}`;
    const data = localStorage.getItem(key);
    if (data) {
      const books = JSON.parse(data);
      console.log('✅ Loaded', books.length, 'books from localStorage');
      return books; // ← Return localStorage data
    }
  }
  
  // ========== No data found ==========
  return []; // ← Return empty array
}
```

**Luồng hoạt động:**

```
Component gọi: storageManager.getBooks('n5')
  ↓
Tier 1: Try Supabase
  ├── contentService.getBooks('n5')
  │   └── Supabase API call
  │       └── Transform: snake_case → camelCase
  ├── Nếu có data:
  │   ├── Cache vào IndexedDB
  │   ├── Cache vào localStorage
  │   └── Return data
  └── Nếu không có data:
      ├── Clear local cache
      └── Return []
  ↓ (nếu Supabase fail)
Tier 2: Try IndexedDB
  ├── indexedDBManager.getBooks('n5')
  ├── Nếu có data → Return
  └── Nếu không có → Continue
  ↓ (nếu IndexedDB không có)
Tier 3: Try localStorage
  ├── localStorage.getItem('adminBooks_n5')
  ├── Nếu có data → Return
  └── Nếu không có → Return []
```

**Bước 3: contentService.getBooks() - Supabase API Call**

📍 **Xem code tại:** `src/services/contentService.js` (dòng 56-89)

```javascript
export async function getBooks(level) {
  try {
    // 1. Gọi Supabase API
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('level', level)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching books:', error);
      return { success: false, error };
    }
    
    // 2. Chuyển đổi dữ liệu: snake_case → camelCase
    const books = (data || []).map(book => ({
      id: book.id,
      level: book.level,
      title: book.title,
      description: book.description,
      imageUrl: book.image_url,        // ← snake_case → camelCase
      seriesId: book.series_id,       // ← snake_case → camelCase
      category: book.category || null,
      placeholderVersion: book.placeholder_version,  // ← snake_case → camelCase
      orderIndex: book.order_index     // ← snake_case → camelCase
    }));
    
    return { success: true, data: books };
  } catch (err) {
    return { success: false, error: err };
  }
}
```

**Data Transformation:**

**Supabase (snake_case):**
```javascript
{
  id: "book-1",
  level: "n5",
  title: "Minna no Nihongo 1",
  image_url: "https://...",      // ← snake_case
  series_id: "minna-series",     // ← snake_case
  placeholder_version: 1,        // ← snake_case
  order_index: 0                 // ← snake_case
}
```

**App (camelCase):**
```javascript
{
  id: "book-1",
  level: "n5",
  title: "Minna no Nihongo 1",
  imageUrl: "https://...",       // ← camelCase
  seriesId: "minna-series",      // ← camelCase
  placeholderVersion: 1,        // ← camelCase
  orderIndex: 0                 // ← camelCase
}
```

**Bước 4: Component nhận data và update state**

📍 **Xem code tại:** `src/features/books/pages/LevelN5Page.jsx` (dòng 34-72)

```javascript
useEffect(() => {
const loadBooks = async () => {
  // 1. Gọi storageManager (unified interface)
  const savedBooksRaw = await storageManager.getBooks('n5');
  
    // 2. Filter và process data
    const cleanedSaved = filterDemoAndExtraBooks(savedBooksRaw);
    
    // 3. Load series để map categories
    const seriesList = await storageManager.getSeries('n5');
    
    // 4. Map categories cho books
    let booksWithCategory = cleanedSaved.map(book => {
      // ... map logic
      return {
        ...book,
        category: seriesName || book.category || null
      };
    });
    
    // 5. Update state → Trigger re-render
  setN5Books(booksWithCategory);
    
    // 6. Save lại để sync
    await storageManager.saveBooks('n5', booksWithCategory);
  };
  
  loadBooks();
}, []);
```

**Luồng hoàn chỉnh:**

```
LevelN5Page mount
  ↓
useEffect chạy
  ↓
storageManager.getBooks('n5')
  ├── Tier 1: Try Supabase
  │   ├── contentService.getBooks('n5')
  │   │   ├── Supabase API: SELECT * FROM books WHERE level = 'n5'
  │   │   ├── Transform: snake_case → camelCase
  │   │   └── Return: { success: true, data: [...] }
  │   ├── Cache vào IndexedDB
  │   ├── Cache vào localStorage
  │   └── Return: books array
  │
  ├── (Nếu Supabase fail) Tier 2: Try IndexedDB
  │   └── Return: cached books
  │
  └── (Nếu IndexedDB không có) Tier 3: Try localStorage
      └── Return: cached books
  ↓
Component nhận data
  ↓
Filter và process data
  ↓
setN5Books(booksWithCategory) ← State update
  ↓
Component re-render với data
  ↓
UI hiển thị BookCard components
```

#### 6.1.3 Caching Strategy

**Khi nào cache được update?**

1. **Khi load từ Supabase thành công:**
   - Cache vào IndexedDB (nếu available)
   - Cache vào localStorage (fallback)

2. **Khi Supabase trả về rỗng:**
   - Clear IndexedDB cache
   - Clear localStorage cache
   - Return empty array

3. **Khi có "ghost books" (books trong cache nhưng không có trong Supabase):**
   - Filter out ghost books
   - Update cache với Supabase data only

**Ví dụ ghost books:**

```
Local cache có: [book1, book2, book3]
Supabase có: [book1, book2]
  ↓
Ghost book: book3 (có trong local nhưng không có trong Supabase)
  ↓
Action: Filter out book3, cache chỉ [book1, book2]
```

### 6.2 Luồng Ghi Dữ Liệu (Write Flow)

📍 **Xem code tại:**
- `src/services/contentService.js` (dòng 13-49) - Save book to Supabase
- `src/utils/localStorageManager.js` (dòng 280-350) - Save books to cache

**Tổng quan:**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Admin     │────▶│   Service    │────▶│    Supabase     │
│   Action    │     │  (Save/CRUD) │     │  (Source of     │
└─────────────┘     └──────────────┘     │   Truth)        │
                           │             └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │  Local Cache    │ ← Sync sau khi save thành công
                    │  IndexedDB +    │
                    │  localStorage   │
                    └─────────────────┘
```

#### 6.2.1 Luồng Ghi Chi Tiết: Save Book

**Bước 1: Admin action (ví dụ: Save book)**

```javascript
// AdminPage.jsx
const handleSaveBook = async (book) => {
  // 1. Lưu vào Supabase (nguồn dữ liệu chính)
  const result = await contentService.saveBook(book, userId);
  
  if (result.success) {
    // 2. Update local cache
    await storageManager.saveBooks(book.level, [book]);
    
    // 3. Show success message
    toast.success('Book saved successfully!');
  }
};
```

**Bước 2: contentService.saveBook() - Save to Supabase**

📍 **Xem code tại:** `src/services/contentService.js` (dòng 13-49)

```javascript
export async function saveBook(book, userId) {
  try {
    // 1. Transform data: camelCase → snake_case
    const supabaseData = {
      id: book.id,
      level: book.level,
      title: book.title,
      description: book.description || null,
      image_url: book.imageUrl || null,        // ← camelCase → snake_case
      series_id: book.seriesId || null,        // ← camelCase → snake_case
      placeholder_version: book.placeholderVersion || 1,  // ← camelCase → snake_case
      order_index: book.orderIndex || 0,        // ← camelCase → snake_case
      created_by: userId,
      updated_at: new Date().toISOString()
    };
    
    // 2. Upsert to Supabase (insert or update)
    const { data, error } = await supabase
      .from('books')
      .upsert(supabaseData, {
        onConflict: 'id,level'  // ← Update nếu đã tồn tại
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error };
    }
    
    // 3. Transform response: snake_case → camelCase
    const savedBook = {
      id: data.id,
      level: data.level,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,        // ← snake_case → camelCase
      seriesId: data.series_id,        // ← snake_case → camelCase
      placeholderVersion: data.placeholder_version,
      orderIndex: data.order_index
    };
    
    return { success: true, data: savedBook };
  } catch (err) {
    return { success: false, error: err };
  }
}
```

**Data Transformation (Write):**

**App (camelCase):**
```javascript
{
  id: "book-1",
  level: "n5",
  title: "Minna no Nihongo 1",
  imageUrl: "https://...",       // ← camelCase
  seriesId: "minna-series",      // ← camelCase
  placeholderVersion: 1,         // ← camelCase
  orderIndex: 0                  // ← camelCase
}
```

**Supabase (snake_case):**
```javascript
{
  id: "book-1",
  level: "n5",
  title: "Minna no Nihongo 1",
  image_url: "https://...",      // ← snake_case
  series_id: "minna-series",     // ← snake_case
  placeholder_version: 1,        // ← snake_case
  order_index: 0                 // ← snake_case
}
```

**Bước 3: storageManager.saveBooks() - Update Local Cache**

📍 **Xem code tại:** `src/utils/localStorageManager.js` (dòng 280-350)

```javascript
async saveBooks(level, books) {
  await this.ensureInitialized();
  
  // 1. Save to IndexedDB (nếu available)
  if (this.useIndexedDB) {
    await indexedDBManager.saveBooks(level, books);
  }
  
  // 2. Save to localStorage (fallback)
  if (this.storageAvailable) {
    try {
      const key = `adminBooks_${level}`;
      localStorage.setItem(key, JSON.stringify(books));
    } catch (e) {
      console.warn('⚠️ localStorage full, but books cached to IndexedDB');
    }
  }
}
```

**Luồng hoàn chỉnh (Write):**

```
Admin action: Save book
  ↓
contentService.saveBook(book, userId)
  ├── Transform: camelCase → snake_case
  ├── Supabase API: UPSERT INTO books ...
  ├── Transform response: snake_case → camelCase
  └── Return: { success: true, data: savedBook }
  ↓
storageManager.saveBooks(level, books)
  ├── Save to IndexedDB (nếu available)
  └── Save to localStorage (fallback)
  ↓
Cache updated → Next read sẽ lấy data mới
```

#### 6.2.2 Safe Save Pattern

📍 **Xem code tại:** `src/utils/safeSaveHelper.js`

**Vấn đề:** Khi save một collection (ví dụ: books), có thể mất data nếu:
- User đang edit book A
- Admin save book B
- User save book A → Overwrite book B

**Giải pháp: Safe Save (Merge Strategy):**

```javascript
// safeSaveHelper.js
export function safeSaveCollection(existingItems, newItems) {
  // 1. Tạo map của existing items
  const existingMap = new Map(existingItems.map(item => [item.id, item]));
  
  // 2. Merge với new items
  newItems.forEach(newItem => {
    const existing = existingMap.get(newItem.id);
    if (existing) {
      // Merge: Giữ data cũ, update với data mới
      existingMap.set(newItem.id, { ...existing, ...newItem });
    } else {
      // Add new item
      existingMap.set(newItem.id, newItem);
    }
  });
  
  // 3. Return merged collection
  return Array.from(existingMap.values());
}
```

**Ví dụ:**

```
Existing: [book1, book2, book3]
New: [book2_updated, book4]
  ↓
Result: [book1, book2_updated, book3, book4]
  ↑
  book2 được update, book4 được add, book1 và book3 giữ nguyên
```

### 6.3 Tóm Tắt Luồng Dữ Liệu

**Read Flow:**
```
Component → storageManager → contentService → Supabase
                                    ↓
                            Transform data
                                    ↓
                            Cache (IndexedDB/localStorage)
                                    ↓
                            Return to component
```

**Write Flow:**
```
Admin action → contentService → Supabase
                    ↓
            Transform data
                    ↓
            Save to Supabase
                    ↓
            Update local cache
```

**Key Points:**
- **3-Tier Strategy**: Supabase → IndexedDB → localStorage
- **Data Transformation**: snake_case ↔ camelCase
- **Caching**: Auto-cache sau khi load từ Supabase
- **Safe Save**: Merge strategy để tránh mất data
- **Hỗ trợ Offline**: IndexedDB cho truy cập offline

---

## 7. CÁCH ĐỌC HIỂU TỪNG LAYER

### Layer 1: Services (`src/services/`)

📍 **Xem code tại:** 
- `src/services/supabaseClient.js` (133 dòng) - Supabase client config
- `src/services/contentService.js` (890 dòng) - CRUD books, chapters, lessons, quizzes
- `src/services/authService.js` (950 dòng) - Authentication operations
- `src/services/examService.js` - JLPT exam operations
- `src/services/accessControlService.js` - Access control management

**Vai trò:** Logic nghiệp vụ (business logic), giao tiếp với Supabase

**Services là gì?**

Services là các module JavaScript chứa **logic nghiệp vụ** và **giao tiếp với backend** (Supabase). Mỗi service tập trung vào một domain cụ thể (auth, content, exam, v.v.).

**Tại sao cần Services?**

1. **Tách biệt concerns**: Logic nghiệp vụ tách khỏi UI components
2. **Tái sử dụng**: Có thể dùng lại từ nhiều components
3. **Dễ test**: Test logic nghiệp vụ độc lập với UI
4. **Dễ maintain**: Thay đổi API không ảnh hưởng đến components

#### 1.1 Supabase Client (`supabaseClient.js`)

📍 **Xem code tại:** `src/services/supabaseClient.js` (toàn bộ file, 133 dòng)

**Mục đích:** Khởi tạo và cấu hình Supabase client - đây là **single point of entry** cho tất cả giao tiếp với Supabase.

**Cấu trúc:**

```javascript
// 1. Lấy environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase configuration');
}

// 3. Tạo client với config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // Tự động lưu session
    autoRefreshToken: true,      // Tự động refresh token
    storage: window.localStorage, // Lưu session vào localStorage
    storageKey: 'sb-glingo-auth-token',
    detectSessionInUrl: true,    // Detect OAuth redirects
    flowType: 'pkce',           // PKCE flow (bảo mật hơn)
  },
  db: {
    schema: 'public',            // Database schema
  },
  realtime: {
    params: {
      eventsPerSecond: 10,      // Giới hạn real-time events
    },
  },
});
```

**Giải thích cấu hình:**

| Cấu hình | Giải thích |
|----------|------------|
| **persistSession: true** | Tự động lưu session vào localStorage, user không cần login lại khi refresh page |
| **autoRefreshToken: true** | Tự động refresh access token trước khi hết hạn |
| **storage: localStorage** | Lưu session vào localStorage (có thể đổi sang sessionStorage) |
| **storageKey** | Key để lưu session trong localStorage |
| **detectSessionInUrl: true** | Tự động detect OAuth redirects (Google, Facebook login) |
| **flowType: 'pkce'** | PKCE flow - bảo mật hơn cho web apps |
| **eventsPerSecond: 10** | Giới hạn real-time events để tránh spam |

**Utility Functions:**

```javascript
// Kiểm tra Supabase đã được config chưa
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Lấy Supabase URL
export function getSupabaseUrl() {
  return supabaseUrl || null;
}

// Lấy project name từ URL
export function getSupabaseProjectName() {
  // Extract từ: https://project-name.supabase.co
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}
```

**Cách sử dụng:**

```javascript
// Trong các services khác
import { supabase } from './supabaseClient.js';

// Sử dụng supabase client
const { data, error } = await supabase
  .from('books')
  .select('*');
```

#### 1.2 Pattern Chung Của Một Service

📍 **Xem code tại:** `src/services/contentService.js` (dòng 56-89) - Ví dụ `getBooks()`

**Pattern chuẩn:**

```javascript
// 1. Import supabase client
import { supabase } from './supabaseClient.js';

// 2. Export các functions theo pattern
export async function getBooks(level) {
  try {
    // 3. Gọi Supabase API
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('level', level)
      .order('order_index', { ascending: true });

    // 4. Handle error
    if (error) {
      console.error('[ContentService] ❌ Error:', error);
      return { success: false, error };
    }

    // 5. Transform data từ snake_case → camelCase
    const books = (data || []).map(book => ({
      id: book.id,
      level: book.level,
      title: book.title,
      imageUrl: book.image_url,        // ← snake_case → camelCase
      seriesId: book.series_id,       // ← snake_case → camelCase
      placeholderVersion: book.placeholder_version,
      orderIndex: book.order_index
    }));

    // 6. Return success với data
    return { success: true, data: books };
  } catch (err) {
    // 7. Handle unexpected errors
    console.error('[ContentService] ❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}
```

**Giải thích từng bước:**

1. **Import supabase client**: Tất cả services đều import từ `supabaseClient.js`
2. **Export function**: Export async function với tên mô tả rõ ràng
3. **Gọi Supabase API**: Sử dụng Supabase query builder
4. **Handle error**: Kiểm tra `error` và return `{ success: false, error }`
5. **Transform data**: Chuyển đổi từ snake_case (Supabase) sang camelCase (App)
6. **Return success**: Return `{ success: true, data: transformed }`
7. **Try-catch**: Bắt unexpected errors

**Return Pattern:**

Tất cả service functions đều return cùng format:

```javascript
// Success
{ success: true, data: [...] }

// Error
{ success: false, error: {...} }
```

**Lợi ích:**
- Consistent API: Tất cả services có cùng return format
- Dễ handle: Components chỉ cần check `success`
- Error handling: Luôn có error object khi fail

#### 1.3 Ví Dụ Cụ Thể: contentService.getBooks()

📍 **Xem code tại:** `src/services/contentService.js` (dòng 56-89)

**Code đầy đủ:**

```javascript
export async function getBooks(level) {
  try {
    console.log('[ContentService.getBooks] 🔍 Loading books for level:', level);
    
    // 1. Gọi Supabase API
    const { data, error } = await supabase
      .from('books')                    // ← Table name
      .select('*')                      // ← Select all columns
      .eq('level', level)                // ← WHERE level = level
      .order('order_index', { ascending: true }); // ← ORDER BY order_index ASC

    // 2. Handle error
    if (error) {
      console.error('[ContentService] ❌ Error fetching books:', error);
      return { success: false, error };
    }

    // 3. Transform data: snake_case → camelCase
    const books = (data || []).map(book => ({
      id: book.id,
      level: book.level,
      title: book.title,
      description: book.description,
      imageUrl: book.image_url,              // ← snake_case → camelCase
      seriesId: book.series_id,              // ← snake_case → camelCase
      category: book.category || null,
      placeholderVersion: book.placeholder_version || 1,  // ← snake_case → camelCase
      orderIndex: book.order_index           // ← snake_case → camelCase
    }));

    console.log('[ContentService.getBooks] ✅ Loaded', books.length, 'books');
    return { success: true, data: books };
  } catch (err) {
    console.error('[ContentService] ❌ Unexpected error in getBooks:', err);
    return { success: false, error: err };
  }
}
```

**Giải thích:**

1. **Supabase Query Builder:**
   ```javascript
   supabase
     .from('books')           // Table name
     .select('*')             // Select all columns
     .eq('level', level)      // WHERE level = level
     .order('order_index')    // ORDER BY order_index
   ```
   - Tương đương SQL: `SELECT * FROM books WHERE level = 'n5' ORDER BY order_index ASC`

2. **Data Transformation:**
   - Supabase trả về: `{ image_url, series_id, order_index }` (snake_case)
   - App cần: `{ imageUrl, seriesId, orderIndex }` (camelCase)
   - Transform để consistent với JavaScript naming convention

3. **Error Handling:**
   - Check `error` từ Supabase response
   - Log error để debug
   - Return `{ success: false, error }`

#### 1.4 Ví Dụ Cụ Thể: contentService.saveBook()

📍 **Xem code tại:** `src/services/contentService.js` (dòng 13-49)

**Code đầy đủ:**

```javascript
export async function saveBook(book, userId) {
  try {
    console.log('[ContentService.saveBook] 💾 Saving book:', book.id);

    // 1. Transform data: camelCase → snake_case
    const supabaseData = {
      id: book.id,
      level: book.level,
      title: book.title,
      description: book.description || null,
      image_url: book.imageUrl || null,              // ← camelCase → snake_case
      series_id: book.seriesId || null,              // ← camelCase → snake_case
      placeholder_version: book.placeholderVersion || 1,  // ← camelCase → snake_case
      order_index: book.orderIndex || 0,             // ← camelCase → snake_case
      created_by: userId,
      updated_at: new Date().toISOString()
    };

    // 2. Upsert (insert or update)
    const { data, error } = await supabase
      .from('books')
      .upsert(supabaseData, {
        onConflict: 'id,level'  // ← Update nếu đã tồn tại
      })
      .select()
      .single();

    if (error) {
      console.error('[ContentService] ❌ Error saving book:', error);
      return { success: false, error };
    }

    console.log('[ContentService] ✅ Saved book to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[ContentService] ❌ Unexpected error in saveBook:', err);
    return { success: false, error: err };
  }
}
```

**Giải thích:**

1. **Transform Data (Write):**
   - App gửi: `{ imageUrl, seriesId, orderIndex }` (camelCase)
   - Supabase cần: `{ image_url, series_id, order_index }` (snake_case)

2. **Upsert:**
   - `upsert()` = INSERT hoặc UPDATE
   - `onConflict: 'id,level'` = Nếu đã tồn tại record với cùng `id` và `level` → UPDATE
   - Nếu chưa tồn tại → INSERT

3. **Return:**
   - `.select()` = Return data sau khi save
   - `.single()` = Return single object (không phải array)

#### 1.5 Các Services Chính

**1.5.1 supabaseClient.js**

📍 **Xem code tại:** `src/services/supabaseClient.js` (133 dòng)

| Chức năng | Mô tả |
|-----------|-------|
| **Khởi tạo client** | Tạo Supabase client với config |
| **Auth config** | Cấu hình authentication (session, token, OAuth) |
| **Realtime config** | Cấu hình real-time subscriptions |
| **Utility functions** | `isSupabaseConfigured()`, `getSupabaseUrl()`, etc. |

**1.5.2 authService.js**

📍 **Xem code tại:** `src/services/authService.js` (950 dòng)

| Function | Chức năng |
|----------|-----------|
| `signUp()` | Đăng ký user mới |
| `signIn()` | Đăng nhập |
| `signOut()` | Đăng xuất |
| `getUserProfile()` | Lấy profile của user |
| `updateUserProfile()` | Cập nhật profile |
| `resetPassword()` | Reset password |

**Pattern:**

```javascript
export async function signIn({ email, password }) {
  try {
    // Validate
    if (!email || !password) {
      return { success: false, error: 'Email và password là bắt buộc' };
    }

    // Call Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

**1.5.3 contentService.js**

📍 **Xem code tại:** `src/services/contentService.js` (890 dòng)

| Function | Chức năng |
|----------|-----------|
| `getBooks()` | Lấy danh sách books theo level |
| `saveBook()` | Lưu/update book |
| `deleteBookCascade()` | Xóa book và tất cả content liên quan |
| `getChapters()` | Lấy chapters của một book |
| `saveChapter()` | Lưu/update chapter |
| `getLessons()` | Lấy lessons của một chapter |
| `saveLesson()` | Lưu/update lesson |
| `getQuizzes()` | Lấy quizzes của một lesson |
| `saveQuiz()` | Lưu/update quiz |

**Đặc biệt: deleteBookCascade()**

📍 **Xem code tại:** `src/services/contentService.js` (dòng 97-148)

```javascript
export async function deleteBookCascade(bookId, level) {
  // 1. Xóa quizzes
  await supabase.from('quizzes').delete().eq('book_id', bookId);
  
  // 2. Xóa lessons
  await supabase.from('lessons').delete().eq('book_id', bookId);
  
  // 3. Xóa chapters
  await supabase.from('chapters').delete().eq('book_id', bookId);
  
  // 4. Xóa book
  await supabase.from('books').delete().eq('id', bookId);
}
```

**Cascade deletion:** Xóa book → Xóa tất cả content liên quan (chapters, lessons, quizzes)

**1.5.4 examService.js**

| Function | Chức năng |
|----------|-----------|
| `getExams()` | Lấy danh sách exams |
| `getExamDetail()` | Lấy chi tiết exam |
| `saveExam()` | Lưu/update exam |
| `getExamQuestions()` | Lấy questions của exam |

**1.5.5 accessControlService.js**

| Function | Chức năng |
|----------|-----------|
| `getAccessControl()` | Lấy access control từ Supabase |
| `subscribeAccessControl()` | Subscribe real-time updates |

**1.5.6 srsAlgorithm.js**

📍 **Xem code tại:** `src/services/srsAlgorithm.js` (470 dòng)

| Function | Chức năng |
|----------|-----------|
| `calculateNextReview()` | Tính toán lần review tiếp theo |
| `updateCard()` | Update card với SRS algorithm |
| `getDueCards()` | Lấy cards cần review |

**1.5.7 appSettingsService.js**

| Function | Chức năng |
|----------|-----------|
| `getSettings()` | Lấy app settings |
| `getMaintenanceMode()` | Lấy maintenance mode status |

**1.5.8 userManagementService.js**

| Function | Chức năng |
|----------|-----------|
| `getUsers()` | Lấy danh sách users |
| `updateUserRole()` | Cập nhật role của user |
| `banUser()` | Ban user |
| `unbanUser()` | Unban user |

#### 1.6 Error Handling Pattern

**Tất cả services đều follow pattern:**

```javascript
export async function someFunction(params) {
  try {
    // 1. Validate inputs
    if (!params) {
      return { success: false, error: 'Params required' };
    }

    // 2. Call Supabase
    const { data, error } = await supabase.from('table').select('*');

    // 3. Handle Supabase error
    if (error) {
      console.error('[Service] Error:', error);
      return { success: false, error };
    }

    // 4. Transform data
    const transformed = data.map(item => ({ ... }));

    // 5. Return success
    return { success: true, data: transformed };
  } catch (err) {
    // 6. Handle unexpected errors
    console.error('[Service] Unexpected error:', err);
    return { success: false, error: err };
  }
}
```

**Lợi ích:**
- Consistent error handling
- Dễ debug với console.error
- Components luôn nhận được `{ success, data/error }`

#### 1.7 Tóm Tắt

**Services Pattern:**

1. **Import supabase client** từ `supabaseClient.js`
2. **Export async functions** với tên mô tả rõ ràng
3. **Validate inputs** trước khi gọi API
4. **Call Supabase API** với query builder
5. **Handle errors** từ Supabase response
6. **Transform data** từ snake_case → camelCase
7. **Return consistent format**: `{ success: true/false, data/error }`

**Key Points:**
- Services là single source of truth cho business logic
- Tất cả giao tiếp với Supabase đều qua services
- Consistent return format: `{ success, data/error }`
- Data transformation: snake_case ↔ camelCase
- Error handling: Try-catch + Supabase error check

---

### Layer 2: Contexts (`src/contexts/`)

📍 **Xem code tại:**
- `src/contexts/AuthContext.jsx` (496 dòng) - Authentication state management
- `src/contexts/LanguageContext.jsx` (140 dòng) - i18n translations

**Vai trò:** Global state management với React Context

**Pattern của một Context:**

```javascript
// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Provider Component
export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effects - Khởi tạo khi mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Load session từ Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
      setIsLoading(false);
    };
    initializeAuth();

    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(callback);
    return () => data.subscription.unsubscribe();
  }, []);

  // Actions
  const login = useCallback(async (email, password) => {
    const result = await authService.signIn({ email, password });
    return result;
  }, []);

  // Provide value
  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom Hook để sử dụng
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Các Contexts chính:**

| File | Cung cấp gì |
|------|-------------|
| `AuthContext.jsx` | `user`, `profile`, `login`, `logout`, `isAdmin()`, `isEditor()` |
| `LanguageContext.jsx` | `t()` function, `currentLanguage`, `setLanguage()` |

---

### Layer 3: Components (`src/components/`)

📍 **Xem code tại:**
- `src/components/Header.jsx` - Navigation bar
- `src/components/Footer.jsx` - Footer
- `src/components/ProtectedRoute.jsx` - Route guard (auth required)
- `src/components/AccessGuard.jsx` - Level/module access control
- `src/components/GlobalSearch.jsx` - Ctrl+K search
- `src/components/ToastNotification.jsx` - Toast notifications

**Vai trò:** Reusable UI components

**Phân loại Components:**

```
components/
├── Layout Components
│   ├── Header.jsx        # Navigation bar
│   ├── Footer.jsx        # Footer
│   └── Sidebar.jsx       # Sidebar navigation
│
├── Guard Components (Bảo vệ routes)
│   ├── ProtectedRoute.jsx    # Yêu cầu login
│   ├── AccessGuard.jsx       # Kiểm tra quyền level/module
│   └── ModuleAccessGuard.jsx # Kiểm tra quyền module
│
├── UI Components
│   ├── Modal.jsx
│   ├── LoadingSpinner.jsx
│   ├── ToastNotification.jsx
│   └── Breadcrumbs.jsx
│
├── Feature Components
│   ├── admin/           # Admin panel components
│   ├── api_translate/   # Dictionary popup
│   └── dashboard/       # Dashboard widgets
```

**Pattern của Guard Component:**

```javascript
function ProtectedRoute({ children, adminOnly }) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading state
  if (isLoading) return <LoadingSpinner />;

  // 2. Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check role
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4. Allowed → render children
  return children;
}
```

---

### Layer 4: Pages (`src/pages/`)

📍 **Xem code tại:**
- `src/pages/HomePage.jsx` - Home page
- `src/pages/UserDashboard.jsx` - User dashboard
- `src/pages/ProfilePage.jsx` - User profile
- `src/features/books/pages/LevelN5Page.jsx` - Level N5 page (ví dụ)
- `src/features/jlpt/pages/JLPTPage.jsx` - JLPT selection page

**Vai trò:** Components cấp route, logic nghiệp vụ của từng trang

**Pattern của một Page:**

```javascript
function LevelN5Page() {
  // 1. Hooks
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // 2. Local State
  const [n5Books, setN5Books] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 3. Data Loading Effect
  useEffect(() => {
    const loadBooks = async () => {
      // Gọi storage manager / service
      const savedBooksRaw = await storageManager.getBooks('n5');
      setN5Books(savedBooksRaw);
    };
    loadBooks();
  }, []);

  // 4. Computed Values (useMemo)
  const filteredBooks = selectedCategory
    ? n5Books.filter(book => book.category === selectedCategory)
    : n5Books;

  // 5. Event Handlers
  const handleBookClick = (bookId) => {
    navigate(`/level/n5/${bookId}`);
  };

  // 6. Render
  return (
    <div>
      <Sidebar 
        categories={categories} 
        onCategoryClick={handleCategoryClick} 
      />
      <div className="grid">
        {currentBooks.map(book => (
          <BookCard 
            key={book.id}
            title={book.title}
            onClick={() => handleBookClick(book.id)}
          />
        ))}
      </div>
      <Pagination 
        total={totalPages} 
        current={currentPage} 
        onChange={handlePageChange} 
      />
    </div>
  );
}
```

---

### Layer 5: Features (`src/features/`)

**Vai trò:** Feature modules (domain-specific)

```
features/
├── books/                  # Level System
│   ├── components/
│   │   └── BookCard.jsx    # Book card UI
│   └── pages/
│       ├── LevelPage.jsx       # /level - Chọn N1-N5
│       ├── LevelN1Page.jsx     # /level/n1 - Danh sách books
│       ├── BookDetailPage.jsx  # /level/n1/:bookId - Chi tiết book
│       ├── LessonPage.jsx      # Nội dung lesson
│       └── QuizPage.jsx        # Làm quiz
│
└── jlpt/                   # JLPT Exam Practice
    └── pages/
        ├── JLPTPage.jsx            # /jlpt - Chọn N1-N5
        ├── JLPTExamDetailPage.jsx  # /jlpt/n1/:examId
        ├── ExamKnowledgePage.jsx   # Phần kiến thức
        ├── ExamListeningPage.jsx   # Phần nghe
        └── JLPTExamResultPage.jsx  # Kết quả
```

---

## 8. AUTHENTICATION & AUTHORIZATION

📍 **Xem code tại:**
- `src/contexts/AuthContext.jsx` (496 dòng) - Authentication state management
- `src/services/authService.js` - Authentication API calls
- `src/components/ProtectedRoute.jsx` - Route guard
- `src/components/LoginModal.jsx` - Login modal UI
- `src/pages/LoginPage.jsx` - Login page
- `src/pages/RegisterPage.jsx` - Register page

### 8.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                              │
├─────────────────────────────────────────────────────────────┤
│  Login Form → authService.signIn() → Supabase Auth          │
│       │                                    │                 │
│       │    ┌───────────────────────────────┘                 │
│       ▼    ▼                                                 │
│  supabase.auth.onAuthStateChange() triggers                 │
│       │                                                      │
│       ▼                                                      │
│  AuthContext.loadUserProfile()                              │
│       │                                                      │
│       ├── authService.getUserProfile() → profiles table     │
│       │                                                      │
│       ▼                                                      │
│  setUser() + setProfile() → Components re-render            │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Session Persistence

```javascript
// supabaseClient.js
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,           // Tự động lưu session
    storage: window.localStorage,   // Lưu vào localStorage
    storageKey: 'sb-glingo-auth-token',
    autoRefreshToken: true,         // Tự động refresh token
    flowType: 'pkce',               // Secure OAuth flow
  }
});
```

### 8.3 Roles & Permissions

| Role | Quyền hạn |
|------|-----------|
| **admin** | Full access: content, users, settings, exams |
| **editor** | Content editing, exam management |
| **user** | Learning content, personal dashboard |

### 8.4 AuthContext API

```javascript
const { 
  // State
  user,           // User object { id, email, emailConfirmed }
  profile,        // Profile { display_name, role, avatar_url, ... }
  isLoading,      // Boolean
  isAuthenticated,// Boolean
  error,          // Error message
  
  // Actions
  login,          // (email, password) => Promise
  register,       // (email, password, displayName) => Promise
  logout,         // () => Promise
  updateProfile,  // (updates) => Promise
  updatePassword, // (newPassword) => Promise
  
  // Helpers
  isAdmin,        // () => Boolean
  isEditor,       // () => Boolean
  hasPermission,  // (permission) => Boolean
} = useAuth();
```

---

## 9. ACCESS CONTROL

📍 **Xem code tại:**
- `src/services/accessControlService.js` - Access control API & real-time sync
- `src/components/AccessGuard.jsx` - Level/module access guard
- `src/components/ModuleAccessGuard.jsx` - Module access guard
- `src/hooks/useAccessControl.jsx` - Access control hook
- `src/App.jsx` (dòng 155-236) - Load & sync access control

### 9.1 Access Control Flow

```
┌──────────────────────────────────────────────────────────────┐
│  App.jsx (on mount)                                          │
│    │                                                         │
│    ├── getAccessControlFromSupabase()                        │
│    │     │                                                   │
│    │     ▼                                                   │
│    │   Supabase app_settings table                          │
│    │     │                                                   │
│    │     ▼                                                   │
│    │   Sync to localStorage:                                 │
│    │     - levelAccessControl                                │
│    │     - jlptAccessControl                                 │
│    │     - levelModuleAccessControl                          │
│    │     - jlptModuleAccessControl                           │
│    │                                                         │
│    └── subscribeToAccessControl() ← Real-time updates       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  AccessGuard.jsx (on route)                                  │
│    │                                                         │
│    ├── Read from localStorage                                │
│    │                                                         │
│    ├── Check: isLevelPublic? requireLogin? userHasAccess?   │
│    │                                                         │
│    └── Render children OR redirect/show locked message      │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Access Control Configuration

```javascript
// Level access configuration
{
  n5: { public: true, requireLogin: false },
  n4: { public: false, requireLogin: true },
  n3: { public: false, requireLogin: true, premium: true }
}

// Module access configuration
{
  level: { enabled: true, maintenanceMode: false },
  jlpt: { enabled: true, maintenanceMode: false }
}
```

---

## 10. DATABASE SCHEMA

### 10.1 Core Tables

```sql
-- User profiles
profiles (
  user_id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role TEXT,  -- 'admin' | 'editor' | 'user'
  avatar_url TEXT,
  is_banned BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Learning content
books (
  id TEXT,
  level TEXT,  -- 'n1' | 'n2' | 'n3' | 'n4' | 'n5'
  title TEXT,
  description TEXT,
  image_url TEXT,
  series_id TEXT,
  placeholder_version INT,
  order_index INT,
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id, level)
)

chapters (
  id TEXT,
  book_id TEXT,
  level TEXT,
  title TEXT,
  description TEXT,
  order_index INT,
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id, book_id, level)
)

lessons (
  id TEXT,
  book_id TEXT,
  chapter_id TEXT,
  level TEXT,
  title TEXT,
  description TEXT,
  content_type TEXT,  -- 'pdf' | 'html' | 'theory'
  pdf_url TEXT,
  html_content TEXT,
  theory JSONB,
  srs JSONB,
  order_index INT,
  created_by UUID,
  PRIMARY KEY (id, book_id, chapter_id, level)
)

quizzes (
  id TEXT,
  book_id TEXT,
  chapter_id TEXT,
  lesson_id TEXT,
  level TEXT,
  title TEXT,
  description TEXT,
  questions JSONB,
  time_limit INT,
  passing_score INT,
  created_by UUID,
  PRIMARY KEY (id, book_id, chapter_id, lesson_id, level)
)

-- JLPT exams
jlpt_exams (
  id TEXT PRIMARY KEY,
  level TEXT,
  year INT,
  month INT,
  title TEXT,
  description TEXT,
  created_by UUID
)

jlpt_questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES jlpt_exams(id),
  section_type TEXT,  -- 'knowledge' | 'listening'
  questions JSONB
)

-- App settings
app_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  value JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Series (book collections)
series (
  id TEXT,
  level TEXT,
  name TEXT,
  description TEXT,
  image_url TEXT,
  order_index INT,
  PRIMARY KEY (id, level)
)
```

---

## 11. ROUTE STRUCTURE

```
/                          # Home page
├── /level                 # Level selection (N1-N5)
│   ├── /level/:levelId              # Books list
│   ├── /level/:levelId/:bookId      # Book detail
│   ├── /level/:levelId/:bookId/chapter/:chapterId
│   └── /level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId
│       └── /lesson/:lessonId/quiz   # Quiz page
│
├── /jlpt                  # JLPT exam selection
│   ├── /jlpt/:levelId               # Level exams
│   ├── /jlpt/:levelId/:examId       # Exam detail
│   ├── /jlpt/:levelId/:examId/knowledge    # Knowledge section
│   ├── /jlpt/:levelId/:examId/listening    # Listening section
│   ├── /jlpt/:levelId/:examId/result       # Results
│   └── /jlpt/:levelId/:examId/answers      # Answer explanations
│
├── /dashboard             # User dashboard (protected)
├── /review/:deckId        # SRS flashcard review
├── /statistics/:deckId    # Learning statistics
│
├── /profile               # User profile (protected)
├── /login                 # Login page
├── /register              # Register page
│
├── /admin                 # Admin panel (admin only)
│   ├── /admin/content     # Content management
│   ├── /admin/exams       # Exam management
│   ├── /admin/users       # User management
│   ├── /admin/settings    # Settings
│   ├── /admin/new-control # Access control
│   ├── /admin/notifications # Notification management
│   ├── /admin/quiz-editor # Quiz editor
│   └── /admin/export-import # Export/Import
│
├── /editor                # Editor panel (editor only)
│   ├── /editor/quiz-editor
│   └── /editor/exams
│
├── /about                 # About page
├── /terms                 # Terms of service
├── /privacy               # Privacy policy
│
└── /*                     # 404 Not Found
```

---

## 12. THỨ TỰ ĐỌC CODE ĐỀ XUẤT

### 12.1 Nếu muốn hiểu tổng quan:

**Thứ tự đọc:**

1. **📍 `src/main.jsx`** (toàn bộ file, 427 dòng)
   - Hiểu route structure và providers
   - Xem cách lazy loading hoạt động
   - Xem router configuration

2. **📍 `src/App.jsx`** (toàn bộ file, 323 dòng)
   - Hiểu layout và initialization
   - Xem các useEffect hooks
   - Xem maintenance mode logic

3. **📍 `src/contexts/AuthContext.jsx`** (496 dòng)
   - Hiểu auth flow
   - Xem cách quản lý authentication state
   - Xem login/logout logic

4. **📍 `src/services/supabaseClient.js`** (133 dòng)
   - Hiểu Supabase config
   - Xem cách khởi tạo Supabase client

**Cách đọc:**
- Mở từng file theo thứ tự
- Đọc song song với giải thích trong tài liệu
- Trace flow từ entry point đến auth

### 12.2 Nếu muốn hiểu Level System:

**Thứ tự đọc:**

1. **📍 `src/main.jsx`** (dòng 192-222)
   - Tìm route `/level/:levelId`
   - Xem `DynamicLevelPage` component
   - Xem route config cho level system

2. **📍 `src/features/books/pages/LevelN5Page.jsx`** (305 dòng)
   - Xem page component structure
   - Xem cách load books từ storage
   - Xem pagination và filtering logic

3. **📍 `src/features/books/components/BookCard.jsx`**
   - Xem UI component
   - Xem cách render book card

4. **📍 `src/services/contentService.js`** (890 dòng)
   - Xem API calls: `getBooks()`, `getChapters()`, `getLessons()`
   - Xem cách transform data
   - Xem error handling

5. **📍 `src/utils/localStorageManager.js`**
   - Xem caching logic
   - Xem cách sync với Supabase
   - Xem IndexedDB operations

**Cách đọc:**
- Bắt đầu từ route → Page component → Service → Utils
- Trace data flow từ UI đến database

### 12.3 Nếu muốn hiểu JLPT Exam:

**Thứ tự đọc:**

1. **📍 `src/main.jsx`** (dòng 242-277)
   - Tìm route `/jlpt/:levelId/:examId/*`
   - Xem route priority (cụ thể trước, tổng quát sau)
   - Xem `DynamicJLPTLevelPage` component

2. **📍 `src/features/jlpt/pages/JLPTExamDetailPage.jsx`**
   - Xem exam detail page
   - Xem cách hiển thị exam info
   - Xem navigation đến knowledge/listening sections

3. **📍 `src/features/jlpt/pages/ExamKnowledgePage.jsx`**
   - Xem knowledge section (vocabulary, grammar, reading)
   - Xem cách render questions
   - Xem timer và auto-save logic

4. **📍 `src/features/jlpt/pages/ExamListeningPage.jsx`**
   - Xem listening section
   - Xem audio playback
   - Xem audio-based questions

5. **📍 `src/services/examService.js`**
   - Xem exam API calls
   - Xem cách load exam data
   - Xem scoring logic

**Cách đọc:**
- Bắt đầu từ exam selection → Exam detail → Sections → Results
- Trace flow của một exam session

### 12.4 Nếu muốn hiểu Admin panel:

**Thứ tự đọc:**

1. **📍 `src/main.jsx`** (dòng 310-356)
   - Tìm route `/admin/*`
   - Xem nested routes structure
   - Xem `ProtectedRoute adminOnly={true}`

2. **📍 `src/components/admin/AdminLayout.jsx`**
   - Xem layout admin
   - Xem sidebar navigation
   - Xem nested `<Outlet />` trong admin

3. **📍 `src/pages/admin/ContentManagementPage.jsx`**
   - Xem trang quản lý content
   - Xem CRUD operations UI
   - Xem cách edit books, chapters, lessons

4. **📍 `src/services/contentService.js`** (890 dòng)
   - Xem CRUD operations: `saveBook()`, `deleteBookCascade()`, etc.
   - Xem safe save logic với merge
   - Xem error handling

5. **📍 `src/services/userManagementService.js`**
   - Xem user management operations
   - Xem role management
   - Xem ban/unban users

**Cách đọc:**
- Bắt đầu từ route → Layout → Page → Service
- Trace một CRUD operation từ UI đến database

### 12.5 Nếu muốn hiểu SRS Algorithm:

**Thứ tự đọc:**

1. **📍 `src/services/srsAlgorithm.js`**
   - Xem SM-2 algorithm implementation
   - Xem cách tính ease factor
   - Xem cách tính interval
   - Xem card states (new, learning, review, graduated)

2. **📍 `src/pages/FlashcardReviewPage.jsx`**
   - Xem review UI
   - Xem cách hiển thị flashcards
   - Xem cách user grade cards (Again, Hard, Good, Easy)
   - Xem cách update card với SRS algorithm

3. **📍 `src/components/SRSWidget.jsx`**
   - Xem dashboard widget
   - Xem cách hiển thị due cards
   - Xem statistics

**Cách đọc:**
- Bắt đầu từ algorithm → Review UI → Dashboard widget
- Trace một review session từ start đến finish

### 12.6 Nếu muốn hiểu Authentication:

**Thứ tự đọc:**

1. **📍 `src/contexts/AuthContext.jsx`** (496 dòng)
   - Xem AuthProvider component
   - Xem cách initialize auth state
   - Xem login/logout/register functions
   - Xem profile loading logic

2. **📍 `src/services/authService.js`**
   - Xem API calls: `signIn()`, `signUp()`, `signOut()`
   - Xem cách gọi Supabase Auth
   - Xem profile CRUD operations

3. **📍 `src/components/ProtectedRoute.jsx`** (70 dòng)
   - Xem route guard logic
   - Xem cách check authentication
   - Xem cách check roles

4. **📍 `src/pages/LoginPage.jsx`**
   - Xem login UI
   - Xem form handling
   - Xem error handling

**Cách đọc:**
- Bắt đầu từ Context → Service → Guard → UI
- Trace một login flow từ form đến session

### 12.7 Nếu muốn hiểu Access Control:

**Thứ tự đọc:**

1. **📍 `src/services/accessControlService.js`**
   - Xem cách load access control từ Supabase
   - Xem real-time subscription
   - Xem cách sync vào localStorage

2. **📍 `src/App.jsx`** (dòng 155-236)
   - Xem cách load access control on mount
   - Xem real-time sync logic
   - Xem event dispatching

3. **📍 `src/components/AccessGuard.jsx`**
   - Xem access guard logic
   - Xem cách check level/module access
   - Xem cách redirect hoặc show locked message

4. **📍 `src/hooks/useAccessControl.jsx`**
   - Xem custom hook
   - Xem cách components sử dụng access control

**Cách đọc:**
- Bắt đầu từ Service → App sync → Guard → Hook
- Trace một access check từ URL đến decision

### 12.8 Cách Đọc Code Hiệu Quả

**Tips:**

1. **Mở nhiều files cùng lúc:**
   - IDE: Split view (2-3 files)
   - Đọc service và component song song

2. **Sử dụng IDE features:**
   - "Go to Definition" (F12)
   - "Find References" (Shift+F12)
   - "Go to Symbol" (Ctrl+Shift+O)

3. **Trace flow:**
   - Bắt đầu từ entry point
   - Follow function calls
   - Check imports để hiểu dependencies

4. **Đọc comments:**
   - Code có nhiều comments giải thích
   - Đọc comments trước khi đọc code

5. **Debug:**
   - Đặt breakpoints
   - Console.log để trace flow
   - React DevTools để xem component tree

---

## 📚 TÀI LIỆU LIÊN QUAN

- [Architecture Overview](./ARCHITECTURE.md) - Kiến trúc hệ thống
- [Features Guide](./FEATURES.md) - Hướng dẫn các tính năng
- [API & Services](./API_SERVICES.md) - Reference API
- [Database Documentation](./DATABASE.md) - Schema và migrations
- [Setup Guide](./SETUP.md) - Hướng dẫn cài đặt
- [Development Guide](./DEVELOPMENT.md) - Quy trình phát triển
- [Security Guide](./SECURITY.md) - Bảo mật
- [Troubleshooting](./TROUBLESHOOTING.md) - Xử lý lỗi

---

## 🎯 TÓM TẮT LUỒNG CHÍNH

```
1. Browser load → main.jsx (Step 1: Entry Point)
   - Import providers, define routes
   - Create router config
   │
   ▼
2. Render Providers → App.jsx (Step 2: App Component)
   - Initialize: Dictionary, Maintenance, Access Control
   - Setup real-time subscriptions
   │
   ▼
3. App.jsx render Layout (Step 3: Render Layout)
   - Header, Footer, Background
   - <Outlet /> (box để chứa content)
   │
   ▼
4. React Router match URL (Step 4: Route Matching)
   - Match route với URL
   - Render component vào <Outlet />
   - Lazy load nếu cần
   - Check access control
   │
   ▼
5. Component mount & load data (Step 5: Component Lifecycle)
   - Component mount trong <Outlet />
   - useEffect hooks chạy
   - Load data từ storage/API
   - setState() → Re-render với data
   │
   ▼
6. UI hiển thị → User tương tác
   - Click, navigate, filter, etc.
   - Event handlers → Update state/Navigate
```

---

*Tài liệu được tạo tự động từ phân tích codebase*
*Cập nhật lần cuối: January 2026*
