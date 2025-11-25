# 🌐 i18n Migration Guide

Hướng dẫn chi tiết để migrate hardcoded text sang translation keys sử dụng automated tool.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Supported Languages](#supported-languages)
5. [Migration Tool](#migration-tool)
6. [Manual Migration](#manual-migration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is i18n?

**i18n** (internationalization) là process của việc design application để có thể dễ dàng adapt sang nhiều languages mà không cần thay đổi code.

### Why migrate?

- ✅ **Multi-language support**: Dễ dàng support Vietnamese, English, Japanese, Korean, Chinese
- ✅ **Centralized translations**: Tất cả text ở 1 nơi, dễ maintain
- ✅ **Consistency**: Đảm bảo terminology consistent across app
- ✅ **Scalability**: Dễ dàng add ngôn ngữ mới

### Current System

Our app uses **Context-based i18n**:
- `LanguageContext`: Manages current language
- Translation files: `src/translations/*.js`
- `useLanguage()` hook: Access translations in components

---

## Quick Start

### 1. Scan for hardcoded text

```bash
npm run i18n:scan
```

This will:
- Scan all files in `src/`
- Find hardcoded Vietnamese/English text
- Generate a detailed report
- Save report to `i18n-migration-report.txt`

### 2. Migrate a file (dry run)

```bash
npm run i18n:migrate src/pages/HomePage.jsx
```

Preview what changes would be made without modifying the file.

### 3. Apply the migration

```bash
npm run i18n:migrate src/pages/HomePage.jsx --apply
```

Actually modify the file with the changes.

---

## Step-by-Step Guide

### Step 1: Initial Scan

```bash
npm run i18n:scan
```

**Output Example:**
```
📊 STATISTICS:
   Files scanned: 45
   Files with matches: 12
   Total matches found: 87

📝 FINDINGS BY FILE:

📄 src/pages/HomePage.jsx (8 matches):
  1. Line 25:
     Found: 'Trang chủ'
     Replace with: {t('common.home')}
     Key: common.home

  2. Line 42:
     Found: 'Đăng nhập'
     Replace with: {t('common.login')}
     Key: common.login
```

### Step 2: Review the Report

Open `i18n-migration-report.txt` and review all findings.

**Create a checklist:**
```
Files to migrate:
[ ] src/pages/HomePage.jsx (8 matches)
[ ] src/components/Header.jsx (15 matches)
[ ] src/pages/LevelPage.jsx (12 matches)
...
```

### Step 3: Migrate Files One by One

For each file:

#### A. Dry Run (Preview)
```bash
npm run i18n:migrate src/pages/HomePage.jsx
```

**Review the output:**
```
🔄 DRY RUN: src/pages/HomePage.jsx
  ✓ Added useLanguage import
  ✓ Added t() hook
  ✓ Replaced 8 text strings
  ℹ️  Dry run - no changes written

💡 Tip: Add --apply flag to actually modify the file
```

#### B. Apply Changes
If everything looks good:
```bash
npm run i18n:migrate src/pages/HomePage.jsx --apply
```

#### C. Test the File
```bash
npm run dev
```

- Navigate to the page
- Switch languages using the language switcher
- Verify all text displays correctly
- Check for any broken layouts

#### D. Mark as Complete
Update your checklist:
```
[✓] src/pages/HomePage.jsx (8 matches) - Tested ✅
[ ] src/components/Header.jsx (15 matches)
...
```

### Step 4: Handle Edge Cases

Some text requires **manual migration**:

#### Template Strings with Variables
```jsx
// ❌ Won't be auto-migrated
`Bạn đã học ${count} bài`

// ✅ Manual migration needed
{t('lesson.studiedCount', { count })}
```

Then add to translation file:
```javascript
// src/translations/vi.js
studiedCount: 'Bạn đã học {count} bài',

// src/translations/en.js
studiedCount: 'You have studied {count} lessons',
```

#### Complex JSX
```jsx
// ❌ Tool might not handle this
<div>
  Đã hoàn thành <strong>{percent}%</strong>
</div>

// ✅ Manual migration
<div>
  {t('progress.completed')} <strong>{percent}%</strong>
</div>
```

### Step 5: Add Missing Translation Keys

If tool finds text without a matching key, add it manually:

1. **Identify the category:**
   - `common.*` - Common UI text
   - `lesson.*` - Lesson-related
   - `quiz.*` - Quiz-related
   - `admin.*` - Admin panel
   - `notification.*` - Toast messages

2. **Add to ALL language files:**

```javascript
// src/translations/vi.js
export default {
  lesson: {
    // ... existing keys
    newKey: 'Text tiếng Việt'
  }
}

// src/translations/en.js
export default {
  lesson: {
    // ... existing keys
    newKey: 'English text'
  }
}

// Do the same for ja.js, ko.js, zh.js
```

---

## Supported Languages

Currently supported:

| Language | Code | Flag | Native Name |
|----------|------|------|-------------|
| Vietnamese | `vi` | 🇻🇳 | Tiếng Việt |
| English | `en` | 🇬🇧 | English |
| Japanese | `ja` | 🇯🇵 | 日本語 |
| Korean | `ko` | 🇰🇷 | 한국어 |
| Chinese | `zh` | 🇨🇳 | 简体中文 |

### Adding a New Language

1. **Create translation file:**
```javascript
// src/translations/fr.js
const fr = {
  common: {
    home: 'Accueil',
    login: 'Connexion',
    // ... all other keys
  }
};
export default fr;
```

2. **Register in index:**
```javascript
// src/translations/index.js
import fr from './fr.js';

const translations = {
  vi, en, ja, ko, zh,
  fr  // Add new language
};
```

3. **Add to LANGUAGES constant:**
```javascript
// src/contexts/LanguageContext.jsx
export const LANGUAGES = {
  // ... existing languages
  fr: {
    code: 'fr',
    name: 'French',
    shortName: 'FR',
    flag: '🇫🇷',
    nativeName: 'Français'
  }
};
```

---

## Migration Tool

### Commands

#### `npm run i18n:scan`
Scan entire codebase for hardcoded text.

**Options:** None

**Output:**
- Console report with statistics
- `i18n-migration-report.txt` with details

#### `npm run i18n:migrate <file>`
Dry run migration for a specific file.

**Example:**
```bash
npm run i18n:migrate src/pages/HomePage.jsx
```

#### `npm run i18n:migrate <file> --apply`
Actually migrate the file.

**Example:**
```bash
npm run i18n:migrate src/pages/HomePage.jsx --apply
```

### What the Tool Does

1. **Adds import:**
```javascript
import { useLanguage } from '../contexts/LanguageContext.jsx';
```

2. **Adds hook:**
```javascript
const { t } = useLanguage();
```

3. **Replaces text:**
```javascript
// Before
<button>Đăng nhập</button>

// After
<button>{t('common.login')}</button>
```

### Detected Patterns

The tool detects 50+ common patterns:

**Common:**
- `'Trang chủ'` → `common.home`
- `'Đăng nhập'` → `common.login`
- `'Lưu'` → `common.save`

**Lesson:**
- `'Bài học'` → `lesson.title`
- `'Lý thuyết'` → `lesson.theory`
- `'Quiz'` → `lesson.quiz`

**Quiz:**
- `'Câu hỏi'` → `quiz.question`
- `'Đúng'` → `quiz.correct`
- `'Nộp bài'` → `quiz.submit`

[See full list in `scripts/i18n-migration.js`]

---

## Manual Migration

For files not covered by the tool, migrate manually:

### Before Migration
```jsx
function HomePage() {
  return (
    <div>
      <h1>Trang chủ</h1>
      <p>Chào mừng đến với E-Learning</p>
      <button>Bắt đầu học</button>
    </div>
  );
}
```

### After Migration
```jsx
import { useLanguage } from '../contexts/LanguageContext.jsx';

function HomePage() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>{t('home.welcome')}</p>
      <button>{t('home.startLearning')}</button>
    </div>
  );
}
```

### Add Translation Keys
```javascript
// src/translations/vi.js
home: {
  welcome: 'Chào mừng đến với E-Learning',
  startLearning: 'Bắt đầu học'
}

// src/translations/en.js
home: {
  welcome: 'Welcome to E-Learning',
  startLearning: 'Start Learning'
}
```

---

## Best Practices

### 1. Naming Conventions

Use descriptive, hierarchical keys:

```javascript
// ✅ Good
common.login
lesson.startQuiz
quiz.correctAnswer
admin.contentManagement

// ❌ Bad
login
start
correct
content
```

### 2. Organize by Feature

Group related keys together:

```javascript
{
  lesson: {
    title: '...',
    theory: '...',
    quiz: '...',
    completed: '...'
  },
  quiz: {
    question: '...',
    submit: '...',
    next: '...'
  }
}
```

### 3. Consistent Terminology

Use the same term consistently:

```javascript
// ✅ Good - consistent
common.delete
admin.deleteLesson
quiz.deleteQuestion

// ❌ Bad - inconsistent
common.delete
admin.removeLesson
quiz.eraseQuestion
```

### 4. Handle Plurals

For dynamic counts:

```javascript
// Translation file
studiedLessons: 'Đã học {count} bài',

// Component
{t('lesson.studiedLessons', { count: lessonCount })}
```

### 5. Context-Aware Translations

Some words have different meanings:

```javascript
// Different contexts
quiz.close: 'Đóng' (close button)
quiz.completed: 'Hoàn thành' (completed status)
common.finish: 'Kết thúc' (finish action)
```

### 6. Test All Languages

After migration:
- Switch to each language
- Navigate through all pages
- Check for:
  - Missing translations (shows key instead)
  - Layout breaks (text too long/short)
  - Proper formatting

---

## Troubleshooting

### Issue 1: Missing Translation Key

**Symptom:**
```
Display: "common.login" instead of "Đăng nhập"
```

**Cause:** Key doesn't exist in translation file

**Fix:**
1. Open `src/translations/vi.js` (and other languages)
2. Add the missing key:
```javascript
common: {
  login: 'Đăng nhập'
}
```

### Issue 2: Import Error

**Symptom:**
```
Error: useLanguage is not a function
```

**Cause:** Missing import or wrong path

**Fix:**
```javascript
// Check import path
import { useLanguage } from '../contexts/LanguageContext.jsx';
// Adjust ../ based on your file location
```

### Issue 3: Hook Not Called

**Symptom:**
```
Error: t is not defined
```

**Cause:** Forgot to call `useLanguage()`

**Fix:**
```javascript
const { t } = useLanguage();
```

### Issue 4: Text Not Updating

**Symptom:** Language switch doesn't update text

**Cause:** Not using `t()` function

**Fix:**
```jsx
// ❌ Wrong
<div>Trang chủ</div>

// ✅ Correct
<div>{t('common.home')}</div>
```

### Issue 5: Template Strings

**Symptom:** Tool doesn't migrate template strings

**Fix:** Migrate manually
```javascript
// Before
`Bạn đã học ${count} bài`

// After
{t('lesson.studiedCount', { count })}

// Add to translation:
studiedCount: 'Bạn đã học {count} bài'
```

### Issue 6: Layout Breaks

**Symptom:** Text too long in some languages

**Fix:**
- Use `truncate` classes
- Add responsive breakpoints
- Test with longest language (often German)

```jsx
<span className="truncate max-w-[200px]">
  {t('lesson.veryLongTitle')}
</span>
```

---

## Progress Tracking

### Create a Migration Checklist

```markdown
## Core Pages
- [✓] HomePage.jsx (8 matches) ✅
- [✓] LevelPage.jsx (12 matches) ✅
- [ ] AboutPage.jsx (5 matches)

## Features
- [✓] LessonPage.jsx (20 matches) ✅
- [ ] QuizPage.jsx (35 matches)
- [ ] BookDetailPage.jsx (15 matches)

## Components
- [✓] Header.jsx (15 matches) ✅
- [ ] Footer.jsx (8 matches)
- [ ] Sidebar.jsx (10 matches)

## Admin
- [ ] AdminDashboard.jsx (25 matches)
- [ ] ContentManagement.jsx (30 matches)

## Stats
Total files: 20
Completed: 4 (20%)
In progress: 0
Remaining: 16
```

---

## Summary

### Migration Workflow

1. **Scan** → `npm run i18n:scan`
2. **Review** report → `i18n-migration-report.txt`
3. **Dry run** → `npm run i18n:migrate <file>`
4. **Apply** → `npm run i18n:migrate <file> --apply`
5. **Test** → Switch languages and verify
6. **Repeat** for all files

### After Migration

- ✅ All text is translatable
- ✅ Easy to add new languages
- ✅ Centralized text management
- ✅ Better maintainability

---

**Happy migrating! 🌐🚀**

