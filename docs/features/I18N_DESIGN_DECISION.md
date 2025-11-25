# 🎨 i18n Design Decision

## Quyết Định Thiết Kế Đa Ngôn Ngữ

### 🎯 Philosophy

**"Header/Footer luôn là tiếng Anh để đồng nhất - Content thay đổi theo ngôn ngữ"**

---

## 📐 Design Rules

### **Vietnamese (🇻🇳)**
```
Header:   HOME | LEVEL | JLPT | ABOUT ME | Login | Register
Content:  Học tiếng Nhật mọi lúc mọi nơi
          100% miễn phí
          Bắt đầu học ngay
Footer:   Quick Links | Contact | Scroll to Top
```

### **English (🇬🇧)**
```
Header:   HOME | LEVEL | JLPT | ABOUT ME | Login | Register
Content:  Learn Japanese Anytime, Anywhere
          100% Free
          Start Learning
Footer:   Quick Links | Contact | Scroll to Top
```

### **Japanese (🇯🇵)**
```
Header:   ホーム | レベル | JLPT | 紹介 | ログイン | 登録
Content:  いつでもどこでも日本語学習
          100%無料
          学習を始める
Footer:   クイックリンク | 連絡先 | トップへ戻る
```

---

## 🎨 Visual Consistency

### Why Keep Header/Footer in English?

1. **International Brand** ✅
   - "Learn Your Approach" là brand name
   - English creates professional look
   - Familiar to global users

2. **Navigation Consistency** ✅
   - HOME, LEVEL, JLPT dễ nhận ra
   - Không bị confuse khi đổi ngôn ngữ
   - Button positions không đổi

3. **UX Best Practice** ✅
   - Navigation should be predictable
   - Quick Links dễ scan
   - English là ngôn ngữ "neutral" trong tech

4. **Content Flexibility** ✅
   - Content (home page) thay đổi theo user preference
   - Lesson/Quiz content tiếng Việt (main audience)
   - Japanese for Japanese learners

---

## 📊 Language Distribution

### Vietnamese Users (Main Audience)
```
✓ Header/Footer: English (professional)
✓ Home content: Vietnamese (familiar)
✓ Lessons: Vietnamese (learning material)
✓ Quiz: Vietnamese (comprehension)
```

### English Users (Secondary)
```
✓ Header/Footer: English (native)
✓ Home content: English (native)
✓ Lessons: English translations
✓ Quiz: English translations
```

### Japanese Users (Advanced Learners)
```
✓ Header/Footer: Japanese (native comfort)
✓ Home content: Japanese (full immersion)
✓ Lessons: Japanese (advanced practice)
✓ Quiz: Japanese (test readiness)
```

---

## 🔧 Implementation

### Translation Keys Strategy

#### **Always English (vi.js = en.js)**

```javascript
// vi.js
common: {
  home: 'Home',
  login: 'Login',
  logout: 'Logout'
}

footer: {
  quickLinks: 'Quick Links',
  contact: 'Contact'
}
```

#### **Vietnamese Content (vi.js ≠ en.js)**

```javascript
// vi.js
home: {
  tagline: 'Học tiếng Nhật mọi lúc mọi nơi',
  startLearning: 'Bắt đầu học ngay'
}

lesson: {
  title: 'Bài học',
  theory: 'Lý thuyết'
}
```

#### **Japanese Full Translation (ja.js)**

```javascript
// ja.js - Everything in Japanese
common: {
  home: 'ホーム',
  login: 'ログイン'
}

home: {
  tagline: 'いつでもどこでも日本語学習',
  startLearning: '学習を始める'
}
```

---

## 🎯 Content Categories

### Category 1: **Always English** (Header/Footer)
```javascript
common.*      // Navigation, buttons
header.*      // Header-specific
footer.*      // Footer-specific
```

**Languages affected:** Vietnamese = English (same text)

### Category 2: **Localized Content** (Main content)
```javascript
home.*        // Home page content
lesson.*      // Lesson pages
quiz.*        // Quiz pages
progress.*    // Progress tracking
analytics.*   // Analytics
admin.*       // Admin panel
```

**Languages affected:** Vietnamese ≠ English ≠ Japanese (different text)

---

## 🎨 Visual Examples

### Home Page in Vietnamese
```
┌────────────────────────────────────────┐
│ Header: HOME | LEVEL | JLPT | Login   │ ← English
├────────────────────────────────────────┤
│                                        │
│  Học tiếng Nhật mọi lúc mọi nơi       │ ← Vietnamese
│  💚 100% miễn phí 💚                   │ ← Vietnamese
│                                        │
│  [Bắt đầu học ngay]                    │ ← Vietnamese
│  [Luyện đề JLPT]                       │ ← Vietnamese
│                                        │
├────────────────────────────────────────┤
│ Footer: Quick Links | Contact          │ ← English
└────────────────────────────────────────┘
```

### Home Page in English
```
┌────────────────────────────────────────┐
│ Header: HOME | LEVEL | JLPT | Login   │ ← English
├────────────────────────────────────────┤
│                                        │
│  Learn Japanese Anytime, Anywhere     │ ← English
│  💚 100% Free 💚                       │ ← English
│                                        │
│  [Start Learning]                      │ ← English
│  [Practice JLPT]                       │ ← English
│                                        │
├────────────────────────────────────────┤
│ Footer: Quick Links | Contact          │ ← English
└────────────────────────────────────────┘
```

### Home Page in Japanese
```
┌────────────────────────────────────────┐
│ Header: ホーム | レベル | JLPT | ログイン│ ← Japanese
├────────────────────────────────────────┤
│                                        │
│  いつでもどこでも日本語学習             │ ← Japanese
│  💚 100%無料 💚                        │ ← Japanese
│                                        │
│  [学習を始める]                         │ ← Japanese
│  [JLPT練習]                            │ ← Japanese
│                                        │
├────────────────────────────────────────┤
│ Footer: クイックリンク | 連絡先          │ ← Japanese
└────────────────────────────────────────┘
```

---

## ✅ Benefits of This Approach

### 1. **Professional Brand Image**
- English navigation = International standard
- Consistent across Vietnamese & English users
- Brand recognition

### 2. **Better UX**
- Users don't get confused when switching
- Navigation always in same place, same text
- Predictable interface

### 3. **Easier Maintenance**
- Less translations needed for vi.js
- Header/Footer keys reusable
- Focus on content translations

### 4. **Cultural Appropriateness**
- Vietnamese users comfortable with English UI
- Tech-savvy audience expects English navigation
- Japanese users get full localization (they need it most)

---

## 📝 Translation File Structure

### vi.js (Vietnamese)
```javascript
{
  // English for consistency
  common: { home: 'Home', login: 'Login' },
  header: { adminPanel: 'Admin Panel' },
  footer: { quickLinks: 'Quick Links' },
  
  // Vietnamese for content
  home: { 
    tagline: 'Học tiếng Nhật mọi lúc mọi nơi',
    startLearning: 'Bắt đầu học ngay'
  },
  lesson: {
    title: 'Bài học',
    theory: 'Lý thuyết'
  }
}
```

### en.js (English)
```javascript
{
  // Same as vi.js for header/footer
  common: { home: 'Home', login: 'Login' },
  header: { adminPanel: 'Admin Panel' },
  footer: { quickLinks: 'Quick Links' },
  
  // English for content
  home: { 
    tagline: 'Learn Japanese Anytime, Anywhere',
    startLearning: 'Start Learning'
  },
  lesson: {
    title: 'Lesson',
    theory: 'Theory'
  }
}
```

### ja.js (Japanese)
```javascript
{
  // Full Japanese translation
  common: { home: 'ホーム', login: 'ログイン' },
  header: { adminPanel: '管理パネル' },
  footer: { quickLinks: 'クイックリンク' },
  
  // Japanese for content
  home: { 
    tagline: 'いつでもどこでも日本語学習',
    startLearning: '学習を始める'
  },
  lesson: {
    title: 'レッスン',
    theory: '理論'
  }
}
```

---

## 🎯 Summary

### Design Decision

**Header/Footer = English (vi, en)**  
**Content = Localized (vi ≠ en ≠ ja)**  
**Japanese = Full Translation (all Japanese)**

### Result

- ✅ Consistent navigation
- ✅ Professional appearance
- ✅ Flexible content
- ✅ Better UX

---

**Made with ❤️ for smart i18n design** 🌐

