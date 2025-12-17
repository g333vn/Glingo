# 🔧 i18n Troubleshooting Guide

Hướng dẫn fix các issues thường gặp với i18n system.

---

## 🐛 Common Issues

### Issue 1: Translations Not Changing When Switching Language

**Symptoms:**
- Click language switcher
- Language flag changes
- But text remains in old language

**Causes & Solutions:**

#### A. Component Not Using `t()` Function
```jsx
// ❌ Wrong - Hardcoded text
<button>Đăng nhập</button>

// ✅ Correct - Using translation
const { t } = useLanguage();
<button>{t('common.login')}</button>
```

#### B. Missing LanguageProvider Wrapper
```jsx
// ❌ Wrong - No provider
<App />

// ✅ Correct - Wrapped with provider
<LanguageProvider>
  <App />
</LanguageProvider>
```

#### C. Stale Closure Issue
```jsx
// ❌ Wrong - t() not in dependency array
useEffect(() => {
  console.log(t('common.home'));
}, []); // Missing 't'

// ✅ Correct
useEffect(() => {
  console.log(t('common.home'));
}, [t]); // Added 't'
```

---

### Issue 2: Showing Translation Key Instead of Text

**Symptoms:**
- Display: `"common.login"` instead of `"Đăng nhập"`

**Causes & Solutions:**

#### A. Key Doesn't Exist in Translation File
```javascript
// ❌ Wrong - Key not defined
// src/translations/vi.js
const vi = {
  common: {
    home: 'Trang chủ'
    // Missing 'login' key!
  }
};

// ✅ Correct - Key defined
const vi = {
  common: {
    home: 'Trang chủ',
    login: 'Đăng nhập'  // Added
  }
};
```

#### B. Typo in Translation Key
```jsx
// ❌ Wrong - Typo
{t('common.logim')}  // 'logim' instead of 'login'

// ✅ Correct
{t('common.login')}
```

#### C. Check Console for Warnings
Open DevTools Console, you should see:
```
⚠️ Translation missing for key: common.logim in language: vi
```

---

### Issue 3: Parameters Not Replacing

**Symptoms:**
- Display: `"Học {count} ngày"` instead of `"Học 7 ngày"`

**Causes & Solutions:**

#### A. Not Passing Parameters
```jsx
// ❌ Wrong - No params
{t('header.streakDays')}  // Shows: "{count} ngày liên tiếp"

// ✅ Correct - With params
{t('header.streakDays', { count: 7 })}  // Shows: "7 ngày liên tiếp"
```

#### B. Wrong Parameter Name
```jsx
// Translation file has {count}
streakDays: '{count} ngày liên tiếp'

// ❌ Wrong - Using 'days' instead of 'count'
{t('header.streakDays', { days: 7 })}

// ✅ Correct - Using 'count'
{t('header.streakDays', { count: 7 })}
```

#### C. Parameter is Undefined
```jsx
// ❌ Wrong - Variable is undefined
const count = undefined;
{t('header.streakDays', { count })}  // Shows: "undefined ngày"

// ✅ Correct - Check variable first
const count = streakCount || 0;
{t('header.streakDays', { count })}  // Shows: "0 ngày"
```

---

### Issue 4: Language Not Persisting After Refresh

**Symptoms:**
- Switch to English
- Refresh page
- Back to Vietnamese

**Causes & Solutions:**

#### A. LocalStorage Not Saving
```javascript
// Check in Console
localStorage.getItem('app_language');
// Should return: 'en' (or current language)

// If null, check LanguageContext.jsx:
useEffect(() => {
  localStorage.setItem('app_language', currentLanguage);
}, [currentLanguage]);
```

#### B. Browser Blocking LocalStorage
- Private/Incognito mode blocks localStorage
- Try in normal browser window

#### C. Manual Fix
```javascript
// In Console
localStorage.setItem('app_language', 'en');
location.reload();
```

---

### Issue 5: All Text Shows in Vietnamese Even After Switching

**Symptoms:**
- Switch to English/Japanese
- Some text changes, but most stays Vietnamese

**Causes & Solutions:**

#### A. Components Not Migrated Yet
```jsx
// These components still have hardcoded text
// Check: Header.jsx, Footer.jsx, Sidebar.jsx, etc.

// Use migration tool:
npm run i18n:scan
// Check which files need migration
```

#### B. Translation File Incomplete
```javascript
// English file missing keys
// src/translations/en.js
const en = {
  common: {
    home: 'Home'
    // Missing other keys!
  }
};

// Compare with vi.js to ensure all keys exist
```

---

### Issue 6: Console Showing Many Warnings

**Symptoms:**
```
⚠️ Translation missing for key: common.xxx
⚠️ Translation missing for key: lesson.yyy
```

**Solutions:**

#### A. Add Missing Keys
1. Check warning messages
2. Open corresponding translation file
3. Add the missing keys

```javascript
// If warning says: "Translation missing for key: common.profile"
// Add to all translation files:

// vi.js
common: {
  profile: 'Hồ sơ'
}

// en.js
common: {
  profile: 'Profile'
}

// ja.js
common: {
  profile: 'プロフィール'
}
```

---

### Issue 7: Japanese Characters Not Displaying

**Symptoms:**
- Switch to Japanese
- See boxes or ???

**Solutions:**

#### A. Missing Font Support
```css
/* Add to index.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');

body {
  font-family: 'Inter', 'Noto Sans JP', sans-serif;
}
```

#### B. Wrong Character Encoding
```html
<!-- Ensure in index.html -->
<meta charset="UTF-8">
```

---

### Issue 8: Language Switcher Not Appearing

**Symptoms:**
- Don't see language switcher in header

**Solutions:**

#### A. Check Header.jsx
```jsx
import LanguageSwitcher from './LanguageSwitcher.jsx';

// Desktop
<div className="hidden md:flex items-center gap-4">
  <LanguageSwitcher />  {/* Should be here */}
</div>

// Mobile
<div className="md:hidden flex items-center gap-2">
  <LanguageSwitcher isMobile={true} />  {/* Should be here */}
</div>
```

#### B. Check Import Path
```jsx
// Make sure path is correct
import LanguageSwitcher from './LanguageSwitcher.jsx';
// Not: '../LanguageSwitcher.jsx' or './components/LanguageSwitcher.jsx'
```

---

## 🧪 Testing Checklist

Use this checklist to test i18n system:

```markdown
### Basic Functionality
- [ ] Can switch to Vietnamese
- [ ] Can switch to English
- [ ] Can switch to Japanese
- [ ] Language persists after refresh
- [ ] Flag changes when switching
- [ ] No console errors

### Translation Tests
- [ ] Header menu items translate
- [ ] Button labels translate
- [ ] Form placeholders translate
- [ ] Error messages translate
- [ ] Success notifications translate

### Parameter Tests
- [ ] Streak counter shows correct number
- [ ] Search results count correct
- [ ] Badge descriptions with counts work

### Edge Cases
- [ ] Missing key shows key itself
- [ ] Console warning for missing key
- [ ] Fallback to Vietnamese works
- [ ] No errors with undefined params

### UI Tests
- [ ] No text overflow in any language
- [ ] Japanese characters display correctly
- [ ] Layout doesn't break
- [ ] Mobile responsive in all languages
```

---

## 🔍 Debugging Tools

### 1. Use Test Component
```jsx
import LanguageTestComponent from './components/examples/LanguageTestComponent.jsx';

// Add route in main.jsx
{
  path: '/test-i18n',
  element: <LanguageTestComponent />
}

// Navigate to: http://localhost:5173/test-i18n
```

### 2. Console Debugging
```javascript
// Check current language
const { currentLanguage, t } = useLanguage();
console.log('Current:', currentLanguage);

// Test translation
console.log('Translation:', t('common.home'));

// Check all translations
import translations from './translations/index.js';
console.log('All translations:', translations);
```

### 3. React DevTools
- Install React DevTools
- Find component using translations
- Check props and state
- Verify `useLanguage()` hook values

---

## 📋 Quick Fixes

### Fix 1: Reset Language to Default
```javascript
// In browser console
localStorage.removeItem('app_language');
location.reload();
```

### Fix 2: Force Language Switch
```javascript
// In browser console
localStorage.setItem('app_language', 'en');
location.reload();
```

### Fix 3: Clear All i18n Data
```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.includes('language'))
  .forEach(key => localStorage.removeItem(key));
location.reload();
```

---

## 🆘 Still Having Issues?

### Step-by-Step Debugging

1. **Open DevTools Console**
   - Press F12
   - Go to Console tab
   - Check for errors and warnings

2. **Navigate to Test Page**
   - Go to `/test-i18n` route
   - Test all language switches
   - Check parameter substitution

3. **Verify Translation Files**
   ```bash
   # Check files exist
   ls src/translations/
   # Should show: vi.js, en.js, ja.js, index.js
   ```

4. **Check Import Path**
   ```javascript
   // In component file
   import { useLanguage } from '../contexts/LanguageContext.jsx';
   // Adjust '../' based on your file location
   ```

5. **Verify Provider Wrapper**
   ```jsx
   // In App.jsx
   <LanguageProvider>
     <YourApp />
   </LanguageProvider>
   ```

6. **Run Migration Scan**
   ```bash
   npm run i18n:scan
   # Check if files need migration
   ```

---

## 💡 Best Practices to Avoid Issues

1. **Always Use t() Function**
   - Never hardcode user-facing text
   - Always wrap in `{t('key')}`

2. **Add Keys to All Languages**
   - When adding new key, add to vi.js, en.js, ja.js
   - Use same structure in all files

3. **Test After Changes**
   - Switch languages after adding translations
   - Check all affected pages
   - Verify parameters work

4. **Use Console Warnings**
   - Keep DevTools open during development
   - Check console for missing keys
   - Fix warnings immediately

5. **Run Migration Tool**
   - Before big features, run `npm run i18n:scan`
   - Migrate files one by one
   - Test after each migration

---

**Made with ❤️ for smooth i18n experience** 🌐

