# Architecture Overview

## System Architecture

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

## Application Layers

### 1. Presentation Layer

React components organized by feature:

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level pages
└── features/       # Feature modules
    ├── books/      # Level system (N1-N5)
    └── jlpt/       # JLPT exam practice
```

### 2. Application Layer

Services and business logic:

```
src/services/
├── authService.js           # Authentication operations
├── contentService.js        # Content CRUD (books, lessons)
├── examService.js           # JLPT exam operations
├── accessControlService.js  # Access control management
├── srsAlgorithm.js          # Spaced repetition logic
└── supabaseClient.js        # Supabase client config
```

### 3. Data Layer

Multi-tier storage strategy:

```
Storage Priority:
1. Supabase (cloud) - Source of truth
2. IndexedDB (cache) - >100MB capacity, offline support
3. localStorage (fallback) - 5-10MB limit
```

## Data Flow

### Read Operations

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│ Request │────▶│  Supabase   │────▶│  Return  │
└─────────┘     │  (Cloud)    │     │   Data   │
                └──────┬──────┘     └──────────┘
                       │ Cache
                       ▼
                ┌─────────────┐
                │  IndexedDB  │
                │ + localStorage
                └─────────────┘
```

### Write Operations

```
┌─────────┐     ┌─────────────┐
│  Save   │────▶│  Supabase   │──── Cloud (if userId)
└─────────┘     │  (Primary)  │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │  IndexedDB  │──── Local cache
                │ + localStorage
                └─────────────┘
```

## Key Components

### Context Providers

```jsx
<AuthProvider>        // User authentication state
  <LanguageProvider>  // i18n translations
    <ToastProvider>   // Toast notifications
      <DictionaryProvider>  // JLPT dictionary
        <RouterProvider />
      </DictionaryProvider>
    </ToastProvider>
  </LanguageProvider>
</AuthProvider>
```

### Route Structure

```
/                     # Home page
├── /level            # Level selection
│   ├── /level/:levelId           # N1-N5 books
│   ├── /level/:levelId/:bookId   # Book detail
│   └── /level/.../lesson/:lessonId  # Lesson view
├── /jlpt             # JLPT exam selection
│   ├── /jlpt/:levelId            # Level exams
│   ├── /jlpt/:levelId/:examId    # Exam detail
│   ├── /jlpt/.../knowledge       # Knowledge section
│   ├── /jlpt/.../listening       # Listening section
│   └── /jlpt/.../result          # Results page
├── /dashboard        # User dashboard
├── /review/:deckId   # SRS flashcard review
├── /admin            # Admin panel (protected)
└── /editor           # Editor panel (protected)
```

## Security Architecture

### Authentication Flow

```
1. User signs up/in via Supabase Auth
2. Session stored in localStorage (PKCE flow)
3. Profile loaded from 'profiles' table
4. Role determines access (admin/editor/user)
```

### Authorization Layers

```
┌─────────────────────────────────────────────┐
│              Frontend Guards                 │
│  ProtectedRoute, AccessGuard, AdminLayout   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Supabase RLS Policies             │
│    Row-level security on all tables         │
└─────────────────────────────────────────────┘
```

### Role Permissions

| Role | Capabilities |
|------|--------------|
| **admin** | Full access: content, users, settings, exams |
| **editor** | Content editing, exam management |
| **user** | Learning content, personal dashboard |

## Database Schema

### Core Tables

```sql
-- User profiles
profiles (
  user_id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role TEXT,  -- 'admin' | 'editor' | 'user'
  avatar_url TEXT,
  is_banned BOOLEAN
)

-- Learning content
books (id, level, title, description, series_id, ...)
chapters (id, book_id, level, title, order_index, ...)
lessons (id, chapter_id, book_id, level, title, type, ...)
quizzes (id, lesson_id, chapter_id, book_id, level, questions JSONB)

-- JLPT exams
jlpt_exams (id, level, year, month, title, ...)
jlpt_questions (id, exam_id, section_type, questions JSONB)

-- App settings
app_settings (id, key, value JSONB, ...)
```

## Real-time Features

### Access Control Sync

```javascript
// Subscribe to access control changes
subscribeToAccessControl((data) => {
  // Update localStorage immediately
  localStorage.setItem('levelAccessControl', JSON.stringify(data));
  // Notify components
  window.dispatchEvent(new CustomEvent('accessControlUpdated'));
});
```

### Maintenance Mode

```javascript
// Poll maintenance status every 30 seconds
setInterval(async () => {
  const { maintenance } = await getGlobalMaintenanceMode();
  setMaintenanceMode(maintenance);
}, 30000);
```

## Performance Optimizations

### Code Splitting

```javascript
// Lazy load non-critical pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardPage'));
const JLPTPage = lazy(() => import('./features/jlpt/pages/JLPTPage'));
```

### Caching Strategy

```
1. Supabase data cached to IndexedDB
2. Background image preloaded
3. JLPT Dictionary loaded on app start
4. Service worker for PWA caching
```

### IndexedDB Schema

```javascript
// Stores in IndexedDB
- books (level, data[])
- chapters (bookId, level, data[])
- lessons (bookId, chapterId, level, data[])
- quizzes (bookId, chapterId, lessonId, level, data)
- exams (level, examId, data)
```

## Error Handling

### Error Boundary

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Service Error Pattern

```javascript
// Consistent error response format
return { 
  success: false, 
  error: 'Error message',
  data: null 
};
```

## Deployment

### Vercel Configuration

- Auto-deploy on push to main
- Environment variables for Supabase credentials
- Analytics and Speed Insights enabled

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```
