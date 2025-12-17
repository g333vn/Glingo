# 🌐 Language Switcher - Implementation Guide

## Tổng quan

Tính năng đổi ngôn ngữ hệ thống (i18n - Internationalization) cho phép người dùng chuyển đổi giữa **Tiếng Việt**, **English**, và **日本語 (Japanese)**.

---

## 📂 File Structure

```
src/
├── contexts/
│   └── LanguageContext.jsx          # Language Context & Provider
├── translations/
│   ├── index.js                     # Export all translations
│   ├── vi.js                        # Vietnamese translations
│   ├── en.js                        # English translations
│   └── ja.js                        # Japanese translations
├── components/
│   └── LanguageSwitcher.jsx         # Language Switcher Component
└── App.jsx                          # Wrap with LanguageProvider
```

---

## 🎨 Design

### Desktop View
```
[LOGO] [HOME] [LEVEL] [JLPT] [ABOUT ME] ... [🌐 VN ▼] [🔥 7 days] [👤 User]
```

- **Vị trí**: Bên phải Header, giữa menu và User Icon
- **Style**: Full text + dropdown
- **Hover**: Hiển thị dropdown với 3 ngôn ngữ

### Mobile View
```
[LOGO] ...................... [🌐] [☰]
```

- **Vị trí**: Trước hamburger menu
- **Style**: Icon cờ quốc gia only
- **Click**: Modal dropdown

---

## 🚀 Usage

### 1. Sử dụng trong Component

```jsx
import { useLanguage } from '../contexts/LanguageContext.jsx';

function MyComponent() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>{t('lesson.completed')}</p>
      
      {/* With parameters */}
      <p>{t('header.streakDays', { count: 7 })}</p>
    </div>
  );
}
```

### 2. Available Functions

#### `t(key, params)`
Translate a key to current language
```jsx
t('common.home')                    // → 'Trang chủ' (vi) / 'Home' (en) / 'ホーム' (ja)
t('header.streakDays', { count: 5 }) // → '5 ngày liên tiếp' (vi)
```

#### `currentLanguage`
Get current language code
```jsx
const { currentLanguage } = useLanguage();
console.log(currentLanguage); // 'vi' | 'en' | 'ja'
```

#### `currentLangInfo`
Get current language info
```jsx
const { currentLangInfo } = useLanguage();
console.log(currentLangInfo);
// {
//   code: 'vi',
//   name: 'Tiếng Việt',
//   shortName: 'VN',
//   flag: '🇻🇳',
//   nativeName: 'Tiếng Việt'
// }
```

#### `changeLanguage(langCode)`
Change to another language
```jsx
const { changeLanguage } = useLanguage();
changeLanguage('en'); // Switch to English
```

---

## 📝 Adding New Translations

### 1. Add to translation files

**vi.js**
```javascript
const vi = {
  myFeature: {
    title: 'Tiêu đề',
    description: 'Mô tả tính năng'
  }
};
```

**en.js**
```javascript
const en = {
  myFeature: {
    title: 'Title',
    description: 'Feature description'
  }
};
```

**ja.js**
```javascript
const ja = {
  myFeature: {
    title: 'タイトル',
    description: '機能の説明'
  }
};
```

### 2. Use in Component

```jsx
function MyFeature() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h2>{t('myFeature.title')}</h2>
      <p>{t('myFeature.description')}</p>
    </div>
  );
}
```

---

## 🎯 Translation Structure

Current translation keys organized by category:

### `common.*`
General UI elements
- `home`, `level`, `jlpt`, `about`
- `login`, `register`, `logout`
- `save`, `cancel`, `edit`, `delete`

### `header.*`
Header-specific translations
- `searchPlaceholder`
- `streakDays`
- `adminPanel`, `editorPanel`

### `lesson.*`
Lesson page translations
- `title`, `theory`, `quiz`
- `completed`, `startQuiz`
- `nextLesson`, `previousLesson`

### `quiz.*`
Quiz page translations
- `question`, `submit`, `next`
- `correct`, `incorrect`
- `explanation`, `yourScore`

### `progress.*`
Progress tracking
- `completed`, `inProgress`
- `weakLessons`, `studyStreak`
- `averageScore`, `bestScore`

### `analytics.*`
Analytics & insights
- `studyActivity`, `scoreHistory`
- `trend`, `average`, `highest`
- `recommendations`

### `admin.*`
Admin panel
- `dashboard`, `contentManagement`
- `userManagement`, `examManagement`
- `lessonsManagement`

### `badge.*`
Gamification badges
- `streakMaster`, `perfectScore`
- `chapterMaster`, `quizChampion`
- `earned`, `inProgress`

### `notification.*`
Toast notifications
- `lessonCompleted`, `quizCompleted`
- `saved`, `deleted`, `published`

### `search.*`
Global search
- `placeholder`, `noResults`
- `books`, `chapters`, `lessons`

---

## 🌍 Supported Languages

### 🇻🇳 Tiếng Việt (Vietnamese)
- Code: `vi`
- Default language
- Full translations available

### 🇬🇧 English
- Code: `en`
- Fallback language (if translation missing)
- Full translations available

### 🇯🇵 日本語 (Japanese)
- Code: `ja`
- Full translations available

---

## 💾 Storage

Language preference is saved to `localStorage`:
```javascript
localStorage.getItem('app_language') // 'vi' | 'en' | 'ja'
```

Automatically persists across sessions.

---

## 🎨 Styling

Language Switcher uses **Neo-Brutalism** style consistent with app:
- Bold borders (`border-[3px]`)
- Box shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- Hover effects with translation
- Yellow highlight for active language

---

## 🔧 Customization

### Add a new language

1. Create new translation file: `src/translations/es.js`
```javascript
const es = {
  common: {
    home: 'Inicio',
    // ... other translations
  }
};
export default es;
```

2. Add to `src/translations/index.js`
```javascript
import es from './es.js';

const translations = {
  vi,
  en,
  ja,
  es  // ← Add here
};
```

3. Add to `LanguageContext.jsx`
```javascript
export const LANGUAGES = {
  vi: { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  ja: { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' }  // ← Add here
};
```

---

## 📊 Example Migration

### Before (Hardcoded text)
```jsx
function LessonPage() {
  return (
    <div>
      <h1>Bài học</h1>
      <button>Làm quiz</button>
      <p>Đã hoàn thành</p>
    </div>
  );
}
```

### After (With translations)
```jsx
import { useLanguage } from '../contexts/LanguageContext.jsx';

function LessonPage() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('lesson.title')}</h1>
      <button>{t('lesson.startQuiz')}</button>
      <p>{t('lesson.completed')}</p>
    </div>
  );
}
```

---

## ✅ Best Practices

1. **Always use `t()` for user-facing text**
   ```jsx
   // ❌ Bad
   <button>Đăng nhập</button>
   
   // ✅ Good
   <button>{t('common.login')}</button>
   ```

2. **Use namespaced keys**
   ```jsx
   // ❌ Bad
   t('title')
   
   // ✅ Good
   t('lesson.title')
   ```

3. **Provide fallback for missing translations**
   - System automatically falls back to English
   - If not in English either, returns the key

4. **Use parameters for dynamic content**
   ```jsx
   // ❌ Bad
   `Học ${count} ngày liên tiếp`
   
   // ✅ Good
   t('header.streakDays', { count })
   ```

5. **Keep translations consistent**
   - Use same terminology across all languages
   - Maintain same level of formality

---

## 🐛 Troubleshooting

### Translation not showing
1. Check if key exists in all language files
2. Verify correct key path: `category.subkey`
3. Check console for errors

### Language not persisting
1. Check localStorage in DevTools
2. Verify `app_language` key exists
3. Check browser localStorage permissions

### Dropdown not closing
1. Check if click outside handler is working
2. Verify `dropdownRef` is properly set
3. Check z-index conflicts

---

## 🎯 Todo: Future Improvements

- [ ] Add more languages (Korean, Chinese, etc.)
- [ ] Add RTL support for Arabic/Hebrew
- [ ] Translation management UI for admins
- [ ] Export/import translation files
- [ ] Auto-detect browser language
- [ ] Translation coverage report

---

## 📚 Related Files

- `src/contexts/LanguageContext.jsx` - Core language logic
- `src/components/LanguageSwitcher.jsx` - UI component
- `src/translations/` - All translation files
- `src/App.jsx` - Provider wrapper

---

**Made with ❤️ using Neo-Brutalism Design** 🎨

