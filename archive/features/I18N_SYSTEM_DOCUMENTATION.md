# 🌐 i18n System Documentation

Complete documentation for the internationalization (i18n) system.

---

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Translation Files](#translation-files)
3. [Usage Guide](#usage-guide)
4. [Language Switcher](#language-switcher)
5. [Adding New Languages](#adding-new-languages)
6. [Migration Tools](#migration-tools)
7. [Best Practices](#best-practices)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    App Component                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │          LanguageProvider (Context)             │   │
│  │  - Current language state                       │   │
│  │  - setLanguage() function                       │   │
│  │  - t() translation function                     │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│        ┌────────────────┼────────────────┐             │
│        ▼                ▼                ▼             │
│   Components      Components       Components          │
│   use t()         use t()          use t()            │
└─────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. LanguageContext
`src/contexts/LanguageContext.jsx`

**Purpose:** Manages global language state

**Exports:**
- `LanguageProvider` - Wrapper component
- `useLanguage()` - Hook to access context
- `LANGUAGES` - Available languages configuration

**State:**
- `currentLanguage` - Current selected language code
- Persisted in `localStorage` as `app_language`

#### 2. Translation Files
`src/translations/*.js`

**Structure:**
```javascript
const vi = {
  common: { /* common UI elements */ },
  lesson: { /* lesson-related text */ },
  quiz: { /* quiz-related text */ },
  // ... more categories
};
export default vi;
```

**Languages:**
- `vi.js` - Vietnamese (🇻🇳)
- `en.js` - English (🇬🇧)
- `ja.js` - Japanese (🇯🇵)
- `ko.js` - Korean (🇰🇷)
- `zh.js` - Chinese (🇨🇳)

#### 3. Language Switcher
`src/components/LanguageSwitcher.jsx`

**Purpose:** UI component for switching languages

**Variants:**
- **Desktop:** Full text + dropdown
- **Mobile:** Icon only + modal

---

## Translation Files

### File Structure

```javascript
// src/translations/vi.js
const vi = {
  // Category 1: Common UI elements
  common: {
    home: 'Trang chủ',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    save: 'Lưu',
    cancel: 'Hủy'
  },
  
  // Category 2: Lesson-related
  lesson: {
    title: 'Bài học',
    theory: 'Lý thuyết',
    quiz: 'Quiz',
    completed: 'Đã hoàn thành'
  },
  
  // Category 3: Quiz-related
  quiz: {
    question: 'Câu hỏi',
    submit: 'Nộp bài',
    correct: 'Đúng',
    incorrect: 'Sai'
  },
  
  // More categories...
};

export default vi;
```

### Translation Categories

#### 1. `common` - Common UI Elements
```javascript
common: {
  home: 'Home page link',
  level: 'Level menu',
  jlpt: 'JLPT menu',
  about: 'About menu',
  login: 'Login button',
  register: 'Register button',
  logout: 'Logout button',
  save: 'Save button',
  cancel: 'Cancel button',
  edit: 'Edit button',
  delete: 'Delete button',
  close: 'Close button',
  search: 'Search button',
  loading: 'Loading state',
  error: 'Error message',
  success: 'Success message'
}
```

#### 2. `header` - Header Component
```javascript
header: {
  searchPlaceholder: 'Search input placeholder',
  streakDays: 'Streak counter text',
  adminPanel: 'Admin panel link',
  editorPanel: 'Editor panel link'
}
```

#### 3. `lesson` - Lesson Pages
```javascript
lesson: {
  title: 'Lesson title',
  theory: 'Theory tab',
  quiz: 'Quiz tab',
  completed: 'Completion status',
  startQuiz: 'Start quiz button',
  nextLesson: 'Next lesson button',
  previousLesson: 'Previous lesson button',
  download: 'Download button',
  noTheory: 'No theory available message',
  noQuiz: 'No quiz available message',
  contactAdmin: 'Contact admin message'
}
```

#### 4. `quiz` - Quiz System
```javascript
quiz: {
  question: 'Question label',
  of: 'Question separator (1 of 10)',
  submit: 'Submit button',
  next: 'Next button',
  previous: 'Previous button',
  correct: 'Correct answer',
  incorrect: 'Wrong answer',
  correctAnswer: 'Correct answer label',
  explanation: 'Explanation label',
  yourScore: 'Score label',
  tryAgain: 'Retry button',
  perfectScore: 'Perfect score message',
  excellent: 'Excellent message',
  good: 'Good message',
  needPractice: 'Need practice message'
}
```

#### 5. `progress` - Progress Tracking
```javascript
progress: {
  completed: 'Completed status',
  inProgress: 'In progress status',
  notStarted: 'Not started status',
  chapters: 'Chapters label',
  lessons: 'Lessons label',
  weakLessons: 'Weak lessons label',
  studyStreak: 'Study streak label',
  averageScore: 'Average score label',
  bestScore: 'Best score label'
}
```

#### 6. `analytics` - Analytics Dashboard
```javascript
analytics: {
  studyActivity: 'Study activity title',
  last7Days: 'Last 7 days filter',
  scoreHistory: 'Score history title',
  trend: 'Trend label',
  average: 'Average label',
  highest: 'Highest label',
  attempts: 'Attempts count',
  weakLessonsTitle: 'Weak lessons section',
  weakLessonsDesc: 'Weak lessons description',
  recommendations: 'Recommendations title',
  continueStudy: 'Continue studying suggestion',
  reviewWeakLessons: 'Review weak lessons suggestion',
  takeChallenge: 'Take challenge suggestion'
}
```

#### 7. `admin` - Admin Panel
```javascript
admin: {
  dashboard: 'Dashboard menu',
  contentManagement: 'Content management',
  userManagement: 'User management',
  examManagement: 'Exam management',
  exportImport: 'Export/Import',
  settings: 'Settings',
  lessonsManagement: 'Lessons management',
  addLesson: 'Add lesson button',
  editLesson: 'Edit lesson button',
  deleteLesson: 'Delete lesson button',
  analytics: 'Analytics toggle',
  exportCSV: 'Export CSV button',
  filter: 'Filter button',
  sort: 'Sort button',
  all: 'All filter',
  published: 'Published filter',
  draft: 'Draft filter',
  versionHistory: 'Version history',
  restore: 'Restore button'
}
```

#### 8. `badge` - Badge System
```javascript
badge: {
  streakMaster: 'Streak master badge name',
  streakMasterDesc: 'Streak master description',
  perfectScore: 'Perfect score badge name',
  perfectScoreDesc: 'Perfect score description',
  chapterMaster: 'Chapter master badge name',
  chapterMasterDesc: 'Chapter master description',
  earned: 'Earned status',
  inProgress: 'In progress status',
  locked: 'Locked status'
}
```

#### 9. `notification` - Toast Notifications
```javascript
notification: {
  lessonCompleted: 'Lesson completed toast',
  quizCompleted: 'Quiz completed toast',
  streakUpdated: 'Streak updated toast',
  badgeEarned: 'Badge earned toast',
  saved: 'Saved notification',
  deleted: 'Deleted notification',
  published: 'Published notification',
  unpublished: 'Unpublished notification',
  restored: 'Restored notification',
  error: 'Error notification',
  copied: 'Copied notification'
}
```

#### 10. `search` - Global Search
```javascript
search: {
  placeholder: 'Search input placeholder',
  noResults: 'No results message',
  books: 'Books category',
  chapters: 'Chapters category',
  lessons: 'Lessons category',
  resultsFound: 'Results count',
  shortcuts: 'Shortcuts label',
  pressCtrlK: 'Ctrl+K shortcut hint'
}
```

### Variable Substitution

For dynamic values, use `{variableName}`:

```javascript
// Translation file
notification: {
  streakUpdated: 'Study streak: {count} days!',
  badgeEarned: 'Badge earned: {badge}!'
}

// Component usage
{t('notification.streakUpdated', { count: 7 })}
{t('notification.badgeEarned', { badge: 'Streak Master' })}
```

---

## Usage Guide

### Basic Usage

#### 1. Import the Hook
```javascript
import { useLanguage } from '../contexts/LanguageContext.jsx';
```

#### 2. Use in Component
```javascript
function MyComponent() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>Current: {currentLanguage}</p>
    </div>
  );
}
```

### With Variables

```javascript
// Translation file
studiedLessons: 'You have studied {count} lessons'

// Component
const lessonCount = 5;
<p>{t('lesson.studiedLessons', { count: lessonCount })}</p>
```

### Conditional Rendering

```javascript
const status = isComplete ? t('progress.completed') : t('progress.inProgress');

return <span className="status">{status}</span>;
```

### In Attributes

```javascript
<button
  aria-label={t('common.close')}
  title={t('common.close')}
>
  ✕
</button>
```

### Array Mapping

```javascript
const menuItems = [
  { id: 1, label: t('common.home'), path: '/' },
  { id: 2, label: t('common.level'), path: '/level' },
  { id: 3, label: t('common.jlpt'), path: '/jlpt' }
];

return (
  <nav>
    {menuItems.map(item => (
      <Link key={item.id} to={item.path}>
        {item.label}
      </Link>
    ))}
  </nav>
);
```

---

## Language Switcher

### Desktop Version

**Location:** Top-right in Header (before user buttons)

**Design:**
```
┌──────────────────┐
│ 🌐 Tiếng Việt ▼ │
└──────────────────┘
```

**Behavior:**
- Shows current language with flag
- Dropdown opens on click
- Shows all available languages
- Highlights current selection

### Mobile Version

**Location:** Top-right in Header (before burger menu)

**Design:**
```
┌────┐
│ 🌐 │
└────┘
```

**Behavior:**
- Icon only (globe icon)
- Opens full-screen modal on click
- Large buttons for touch
- Closes after selection

### Implementation

```jsx
// Desktop
<LanguageSwitcher />

// Mobile
<LanguageSwitcher isMobile={true} />
```

---

## Adding New Languages

### Step 1: Create Translation File

Create `src/translations/[code].js`:

```javascript
// src/translations/fr.js
const fr = {
  common: {
    home: 'Accueil',
    login: 'Connexion',
    // ... all other keys
  },
  // ... all other categories
};

export default fr;
```

### Step 2: Register Translation

```javascript
// src/translations/index.js
import fr from './fr.js';

const translations = {
  vi, en, ja, ko, zh,
  fr  // Add here
};

export default translations;
```

### Step 3: Add to LANGUAGES Config

```javascript
// src/contexts/LanguageContext.jsx
export const LANGUAGES = {
  // ... existing
  fr: {
    code: 'fr',
    name: 'French',
    shortName: 'FR',
    flag: '🇫🇷',
    nativeName: 'Français'
  }
};
```

### Step 4: Test

1. Switch to new language
2. Navigate through all pages
3. Check for missing translations
4. Verify layout doesn't break

---

## Migration Tools

### Automated Migration Script

**Purpose:** Convert hardcoded text to translation keys

**Location:** `scripts/i18n-migration.js`

### Commands

#### 1. Scan for Hardcoded Text
```bash
npm run i18n:scan
```

**Output:**
- Console report
- `i18n-migration-report.txt`

#### 2. Migrate a File (Dry Run)
```bash
npm run i18n:migrate src/pages/HomePage.jsx
```

#### 3. Apply Migration
```bash
npm run i18n:migrate src/pages/HomePage.jsx --apply
```

### What It Does

1. **Detects 50+ patterns** of hardcoded text
2. **Adds imports** automatically
3. **Adds useLanguage hook** automatically
4. **Replaces text** with `{t('key')}`

### Detected Patterns

- Vietnamese: Trang chủ, Đăng nhập, Bài học, etc.
- English: Home, Login, Lesson, etc.

[See full list in migration guide]

---

## Best Practices

### 1. Key Naming

✅ **Good:**
```javascript
common.home
lesson.startQuiz
quiz.correctAnswer
admin.contentManagement
```

❌ **Bad:**
```javascript
home
start
correct
content
```

### 2. Consistency

Use the same term across the app:

```javascript
// ✅ Consistent
common.delete
admin.deleteLesson
quiz.deleteQuestion

// ❌ Inconsistent
common.delete
admin.removeLesson
quiz.eraseQuestion
```

### 3. Organization

Group related keys:

```javascript
{
  lesson: {
    title: '...',
    theory: '...',
    quiz: '...'
  }
}
```

### 4. Fallback

Always provide Vietnamese (default) translations:

```javascript
// If key missing, shows the key: 'common.unknownKey'
// So make sure all keys exist in vi.js
```

### 5. Testing

After adding translations:
- ✅ Test in all languages
- ✅ Check for layout breaks
- ✅ Verify variables work
- ✅ Test on mobile and desktop

---

## Complete Example

### Before (Hardcoded)

```jsx
function LessonCard({ title, isComplete }) {
  return (
    <div className="lesson-card">
      <h3>{title}</h3>
      <div className="status">
        {isComplete ? 'Đã hoàn thành' : 'Đang học'}
      </div>
      <button>Bắt đầu học</button>
    </div>
  );
}
```

### After (i18n)

```jsx
import { useLanguage } from '../contexts/LanguageContext.jsx';

function LessonCard({ title, isComplete }) {
  const { t } = useLanguage();
  
  return (
    <div className="lesson-card">
      <h3>{title}</h3>
      <div className="status">
        {isComplete 
          ? t('progress.completed') 
          : t('progress.inProgress')
        }
      </div>
      <button>{t('lesson.startQuiz')}</button>
    </div>
  );
}
```

### Translation Files

```javascript
// src/translations/vi.js
{
  progress: {
    completed: 'Đã hoàn thành',
    inProgress: 'Đang học'
  },
  lesson: {
    startQuiz: 'Bắt đầu học'
  }
}

// src/translations/en.js
{
  progress: {
    completed: 'Completed',
    inProgress: 'In Progress'
  },
  lesson: {
    startQuiz: 'Start Learning'
  }
}
```

---

## Summary

### Architecture
- ✅ Context-based system
- ✅ Centralized translations
- ✅ Easy to use hook
- ✅ Persistent language selection

### Features
- ✅ 5 languages supported
- ✅ Visual language switcher
- ✅ Variable substitution
- ✅ Automated migration tool

### Developer Experience
- ✅ Simple API: `t('key')`
- ✅ Auto-migration script
- ✅ Comprehensive documentation
- ✅ Best practices guide

---

**Made with ❤️ for multi-language support** 🌐

